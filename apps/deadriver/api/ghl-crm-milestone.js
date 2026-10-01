import { createHash, timingSafeEqual } from 'node:crypto';
import { createGhlLifecycleWebhookHandler } from './ghl-lifecycle-webhook.js';
import { readLifecycleConfig, createLifecycleDependencies, normalizeGhlLifecycle, verifyGhlLifecycle } from './_lib/ghl-lifecycle.js';

const entityFields = Object.freeze({
  appointment_confirmed: 'drm_appointment_id', appointment_attended: 'drm_appointment_id',
  qualified_opportunity: 'drm_opportunity_id', customer_closed: 'drm_opportunity_id',
  revenue_received: 'drm_transaction_id',
});
const validId = value => typeof value === 'string' && /^[A-Za-z0-9_-]{8,100}$/.test(value);

// Native GHL custom values supply object identity; authoritative CRM reads supply
// dates, pipeline/calendar identity and payment amounts. Never parse a localized
// display date or substitute an appointment's future start time for confirmation.
export function parseNativeMilestone(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new TypeError('Invalid body');
  if (body.customData) {
    if (Object.keys(body).some(key => key.startsWith('drm_')) || Object.hasOwn(body, 'custom_data')) throw new TypeError('Ambiguous body');
    body = body.customData;
  }
  const type = body.drm_event_type;
  if (!['2', 2].includes(body.drm_schema_version) || !['live', 'verify'].includes(body.drm_mode) ||
      body.drm_origin !== 'ghl' || !Object.hasOwn(entityFields, type) ||
      ![body.drm_location_id, body.drm_contact_id, body[entityFields[type]]].every(validId)) throw new TypeError('Invalid mapping');
  // Mixing caller-provided event identity/time with CRM-derived identity/time is
  // an error, rather than silently dropping an incorrectly configured field.
  if (Object.hasOwn(body, 'drm_event_id') || Object.hasOwn(body, 'drm_occurred_at')) throw new TypeError('Ambiguous event identity');
  return { mode: body.drm_mode, eventType: type, entityId: body[entityFields[type]],
    locationId: body.drm_location_id, contactId: body.drm_contact_id };
}

export async function resolveNativeMilestone(input, config, dependencies) {
  const { reader, ghl, ledger } = dependencies;
  let record, timestamp, timestampField, additional, cachedReader;
  if (input.eventType.startsWith('appointment_')) {
    record = await reader.getAppointment(input.entityId);
    timestampField = 'dateUpdated'; timestamp = record?.dateUpdated;
    additional = { appointmentId: input.entityId, calendarId: record?.calendarId };
    cachedReader = { ...reader, getAppointment: async () => record };
  } else if (input.eventType === 'revenue_received') {
    record = await reader.getTransaction(input.entityId);
    timestampField = 'createdAt'; timestamp = record?.createdAt;
    additional = { transactionId: input.entityId };
    cachedReader = { ...reader, getTransaction: async () => record };
  } else {
    record = await reader.getOpportunity(input.entityId);
    timestampField = input.eventType === 'customer_closed' ? 'lastStatusChangeAt' : 'lastStageChangeAt';
    timestamp = record?.[timestampField];
    additional = { opportunityId: input.entityId, pipelineId: record?.pipelineId, pipelineStageId: record?.pipelineStageId };
    cachedReader = { ...reader, getOpportunity: async () => record };
  }
  const event = normalizeGhlLifecycle({ eventId: `ghl_${input.eventType}_${input.entityId}`,
    eventType: input.eventType, origin: 'ghl', contactId: input.contactId,
    locationId: input.locationId, occurredAt: timestamp, ...additional });
  const contact = await ghl.getContact(input.contactId);
  const evidence = await verifyGhlLifecycle(event, contact, config, cachedReader);
  const rows = await ledger.list({ contactId: input.contactId });
  const prior = rows.find(row => row.properties?.record_kind === 'activity' && row.properties.source === 'ghl' &&
    row.properties.source_event_id === event.eventId && row.properties.event_type === event.eventType);
  // A later edit cannot rewrite the first recorded milestone's time on retry.
  // Entity identity/status are still verified above against the current CRM.
  if (prior) event.occurredAt = normalizeGhlLifecycle({ ...event, occurredAt: prior.properties.occurred_at }).occurredAt;
  return { event, contact, evidence, timestampField, dependencies: { ...dependencies, reader: cachedReader } };
}

export function createNativeMilestoneHandler({ env = process.env, dependenciesFactory = createLifecycleDependencies,
  lifecycleHandlerFactory = createGhlLifecycleWebhookHandler } = {}) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, error: 'method_not_allowed' }); }
    const secret = env.DRM_GHL_LIFECYCLE_WEBHOOK_SECRET, authorization = req.headers?.authorization;
    if (typeof secret !== 'string' || secret.length < 32) return res.status(503).json({ ok: false, error: 'receiver_not_configured' });
    if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ') || !timingSafeEqual(
      createHash('sha256').update(authorization.slice(7)).digest(), createHash('sha256').update(secret).digest(),
    )) return res.status(401).json({ ok: false, error: 'unauthorized' });
    let input;
    try {
      const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      if (!raw || Buffer.byteLength(raw) > 65536) throw new TypeError('Invalid body');
      input = parseNativeMilestone(JSON.parse(raw));
    } catch { return res.status(400).json({ ok: false, error: 'invalid_native_mapping' }); }
    let config;
    try {
      config = readLifecycleConfig(env);
      if (input.locationId !== config.locationId) return res.status(400).json({ ok: false, error: 'wrong_location' });
    } catch { return res.status(503).json({ ok: false, error: 'lifecycle_not_ready' }); }
    let resolved;
    try { resolved = await resolveNativeMilestone(input, config, dependenciesFactory(config)); }
    catch { return res.status(502).json({ ok: false, error: 'crm_milestone_unverified_retry' }); }
    if (input.mode === 'verify') return res.status(200).json({ ok: true, verified: true,
      eventType: input.eventType, timestampField: resolved.timestampField, mutations: 0, conversions: 0 });
    // Reserved-domain QA records may exercise real triggers, but cannot become
    // production customers/revenue, ad conversions or outreach enrollments.
    if (/@[^@\s]+\.invalid$/i.test(String(resolved.contact.email || '').trim())) {
      return res.status(200).json({ ok: true, excluded: 'reserved_test_contact', mutations: 0, conversions: 0 });
    }
    const handler = lifecycleHandlerFactory({ env, dependenciesFactory: () => resolved.dependencies });
    return handler({ ...req, body: { schemaVersion: 1, mode: 'live', payload: resolved.event } }, res);
  };
}
export default createNativeMilestoneHandler();
