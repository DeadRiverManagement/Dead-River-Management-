import { timingSafeEqual, createHash } from 'node:crypto';
import { normalizeGhlLifecycle, readLifecycleConfig, createLifecycleDependencies, processGhlLifecycle } from './_lib/ghl-lifecycle.js';
import { META_EVENT_NAMES, readMetaConversionConfig, createMetaConversionDispatcher } from './_lib/ad-conversions.js';
import { readGooglePaymentConfig, createGooglePaymentDispatcher } from './_lib/google-payment-conversions.js';
import { REAL_ESTATE_LOCATION, REAL_ESTATE_CALENDAR, REAL_ESTATE_PIPELINE } from './_lib/real-estate-config.js';

// Authentication is checked before this diagnostic. Report only known schema
// field names/types, never native contact data, identifiers, or their values.
export function lifecycleSchemaDiagnostic(body) {
  const fields = ['drm_schema_version', 'drm_mode', 'drm_test', 'drm_origin', 'drm_event_type',
    'drm_location_id', 'drm_contact_id', 'drm_event_id', 'drm_occurred_at'];
  return Object.fromEntries([['root', body], ['customData', body?.customData], ['custom_data', body?.custom_data]]
    .filter(([, value]) => value && typeof value === 'object' && !Array.isArray(value))
    .map(([name, value]) => [name, Object.fromEntries(fields.filter(key => Object.hasOwn(value, key)).map(key =>
      [key, { type: typeof value[key], empty: value[key] === '', unresolved: typeof value[key] === 'string' && value[key].includes('{{') }]))]));
}

/** Explicit standard Webhook Custom Data fields. Other native contact payload
 * fields are ignored; no provider shape or field-picker merge syntax is guessed. */
export function normalizeGhlWebhookEnvelope(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new TypeError('Invalid envelope');
  // Verified native standard Webhook action (2026-09-25) wraps its configured
  // key/value pairs in customData. Never mix competing root/nested envelopes.
  if (body.customData && typeof body.customData === 'object' && !Array.isArray(body.customData) &&
      Object.hasOwn(body.customData, 'drm_schema_version')) {
    if (Object.hasOwn(body, 'schemaVersion') || Object.keys(body).some(key => key.startsWith('drm_')) ||
        Object.hasOwn(body, 'custom_data')) throw new TypeError('Ambiguous webhook mapping');
    body = body.customData;
  }
  let envelope = body;
  if (Object.hasOwn(body, 'drm_schema_version')) {
    if (Object.hasOwn(body, 'schemaVersion') || ![1, '1'].includes(body.drm_schema_version)) throw new TypeError('Ambiguous or invalid schema');
    const payload = {};
    for (const [key, field] of Object.entries({
      eventId: 'drm_event_id', eventType: 'drm_event_type', origin: 'drm_origin',
      locationId: 'drm_location_id', contactId: 'drm_contact_id', occurredAt: 'drm_occurred_at',
      appointmentId: 'drm_appointment_id', calendarId: 'drm_calendar_id',
      opportunityId: 'drm_opportunity_id', pipelineId: 'drm_pipeline_id',
      pipelineStageId: 'drm_pipeline_stage_id', transactionId: 'drm_transaction_id',
    })) if (Object.hasOwn(body, field)) payload[key] = body[field];
    envelope = { schemaVersion: 1, mode: body.drm_mode, payload, test: body.drm_test === true || body.drm_test === 'true' };
  }
  if (envelope.schemaVersion !== 1 || !['live', 'historical', 'validate', 'test'].includes(envelope.mode)) throw new TypeError('Invalid envelope');
  if (['validate', 'test'].includes(envelope.mode) && envelope.test !== true) throw new TypeError('Test flag required');
  return { mode: envelope.mode, event: normalizeGhlLifecycle(envelope.payload, { historical: envelope.mode === 'historical' }) };
}

/**
 * GHL standard Webhook action with headers/flat drm_* Custom Data, or the
 * normalized envelope below, -> authenticated server receiver.
 * Authorization: Bearer <DRM_GHL_LIFECYCLE_WEBHOOK_SECRET>
 * { schemaVersion:1, mode:"live"|"historical"|"validate"|"test", test?:true,
 *   payload:{eventId,eventType,origin:"ghl"|"instantly",locationId,contactId,
 *            occurredAt,appointmentId?,calendarId?,opportunityId?,pipelineId?,
 *            pipelineStageId?,transactionId?} }
 * eventId must identify the original transition, never a new retry UUID or now.
 * Validate + test:true performs zero network calls and creates zero CRM facts.
 * Test mode requires an authoritative reserved-domain DND contact; it archives
 * verified facts without contact projections or Instantly mutations. Meta is
 * called only after explicit enabled/token/mapping gates pass.
 */
export function createGhlLifecycleWebhookHandler({ env = process.env, dependenciesFactory = createLifecycleDependencies,
  conversionDispatcherFactory = createMetaConversionDispatcher, googleDispatcherFactory = createGooglePaymentDispatcher } = {}) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ ok: false, error: 'method_not_allowed' }); }
    const secret = env.DRM_GHL_LIFECYCLE_WEBHOOK_SECRET;
    if (typeof secret !== 'string' || secret.length < 32) return res.status(503).json({ ok: false, error: 'receiver_not_configured' });
    const provided = req.headers?.authorization;
    if (typeof provided !== 'string' || !provided.startsWith('Bearer ') || !timingSafeEqual(
      createHash('sha256').update(provided.slice(7)).digest(), createHash('sha256').update(secret).digest(),
    )) return res.status(401).json({ ok: false, error: 'unauthorized' });
    let body; let event; let mode;
    try {
      const serialized = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      if (!serialized || Buffer.byteLength(serialized) > 64 * 1024) throw new TypeError('Invalid body size');
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      ({ event, mode } = normalizeGhlWebhookEnvelope(body));
    } catch { return res.status(400).json({ ok: false, error: 'invalid_lifecycle_envelope', schema: lifecycleSchemaDiagnostic(body) }); }
    if (mode === 'validate') return res.status(200).json({ ok: true, test: true, dryRun: true, eventType: event.eventType, mutations: 0, conversions: 0 });
    let config; let metaEnabled = false; let googleEnabled = false;
    try {
      config = readLifecycleConfig(env, { historical: event.historical, inquiryOnly: event.eventType === 'inquiry_saved' });
      if (event.locationId !== config.locationId) return res.status(400).json({ ok: false, error: 'wrong_location' });
      if (mode === 'live' && event.origin === 'ghl' && event.eventType === 'revenue_received') {
        googleEnabled = Boolean(readGooglePaymentConfig(env));
      }
      // The separate real estate sales calendar/pipeline must not feed Demand
      // Flow's paid-ad optimization. Its verified facts and stop sync still run.
      const realEstateSalesEvent = event.locationId === REAL_ESTATE_LOCATION &&
        (event.calendarId === REAL_ESTATE_CALENDAR || event.pipelineId === REAL_ESTATE_PIPELINE);
      if (!realEstateSalesEvent && !event.historical && event.origin === 'ghl' && Object.hasOwn(META_EVENT_NAMES, event.eventType) &&
          (env.ENABLE_META_CAPI === 'true' || (mode === 'test' && env.ENABLE_META_CAPI_TEST === 'true'))) {
        const metaConfig = readMetaConversionConfig(env, { testOnly: mode === 'test' });
        if (mode === 'test' && !/^[A-Za-z0-9_-]{3,100}$/.test(metaConfig.testEventCode || '')) throw new TypeError('Meta test code required');
        metaEnabled = true;
      }
    } catch { return res.status(503).json({ ok: false, error: 'lifecycle_not_ready' }); }
    try {
      const dependencies = dependenciesFactory(config);
      const { activityRecord, ...result } = await processGhlLifecycle(event, config, dependencies, { testOnly: mode === 'test' });
      const google = googleEnabled && !result.historical
        ? await googleDispatcherFactory({ env, ...dependencies })({ event, activityRecord }) : null;
      // The immutable record can carry historical intent from an earlier import
      // even when a later delivery says live. Such a replay must never dispatch.
      if (metaEnabled && !result.historical && event.origin === 'ghl') {
        const dispatch = conversionDispatcherFactory({ env, ...dependencies });
        const meta = await dispatch({ event: { ...event, test: mode === 'test' }, activityRecord, mode: mode === 'test' ? 'test' : 'live' });
        return res.status(200).json({ ok: true, ...result, conversionSent: meta.conversionSent === true || google?.conversionSent === true,
          advertisingOwner: 'configured_server_meta_dispatcher', meta, ...(google ? { google } : {}), ...(mode === 'test' ? { test: true } : {}) });
      }
      return res.status(200).json({ ok: true, ...result, ...(google ? { google, conversionSent: google.conversionSent === true } : {}), ...(mode === 'test' ? { test: true } : {}) });
    } catch {
      // No 2xx acknowledgement until durable history and required stop controls
      // are verified. Do not log upstream bodies or expose contact/revenue data.
      return res.status(502).json({ ok: false, error: 'lifecycle_incomplete_retry' });
    }
  };
}
export default createGhlLifecycleWebhookHandler();
