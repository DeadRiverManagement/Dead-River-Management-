import { createHash } from 'node:crypto';
import { REAL_ESTATE_LOCATION, REAL_ESTATE_CALENDAR, REAL_ESTATE_PIPELINE, REAL_ESTATE_QUALIFIED_STAGE, REAL_ESTATE_WON_STAGE } from './real-estate-config.js';
import { createGhlActivityLedger, deriveActivityMetrics, ACTIVITY_SCHEMA_KEY } from './ghl-activity.js';
import { createGhlOutreachClient, outreachContactProjection, readOutreachFieldMap } from './outreach-sync.js';
import { createInstantlyClient, syncInstantlyLifecycle } from './instantly-client.js';
import { normalizedEmail } from './instantly-events.js';
import attributionFields from '../../src/data/ghl-attribution-fields.json' with { type: 'json' };
import { resolveAttributionFieldMap } from '../../src/lib/crm-attribution.js';

/**
 * Explicit integration contract, NOT an assumed native GHL webhook payload.
 * Configure the actual GHL workflow fields against a captured sample before
 * enabling. Only server-verified milestones are accepted. Advertising delivery
 * is composed by the authenticated route after this module persists the fact.
 * Official GET schemas inspected 2026-09-24:
 * https://marketplace.gohighlevel.com/docs/ghl/calendars/get-appointment/
 * https://marketplace.gohighlevel.com/docs/ghl/opportunities/get-opportunity/
 * https://marketplace.gohighlevel.com/docs/ghl/payments/get-transaction-by-id/
 */
export const GHL_LIFECYCLE_EVENTS = Object.freeze([
  'inquiry_saved', 'appointment_confirmed', 'appointment_attended', 'qualified_opportunity',
  'customer_closed', 'revenue_received', 'lead_unsubscribed',
]);
export class LifecycleError extends Error {
  constructor(code, status = 0) { super(code); this.name = 'LifecycleError'; this.code = code; this.status = status; }
}
const isId = (value) => typeof value === 'string' && /^[A-Za-z0-9_-]{8,100}$/.test(value);
function id(value, name) { if (!isId(value)) throw new TypeError(`Invalid ${name}`); return value; }
function time(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value) || !Number.isFinite(Date.parse(value))) throw new TypeError('Invalid occurredAt');
  return new Date(value).toISOString();
}
function configJson(raw, name) {
  try { return JSON.parse(raw); } catch { throw new LifecycleError(`CONFIG_${name}`); }
}
function validMapObject(value) { return value && typeof value === 'object' && !Array.isArray(value); }

export function normalizeGhlLifecycle(payload, { historical = false, now = Date.now() } = {}) {
  if (!validMapObject(payload) || !GHL_LIFECYCLE_EVENTS.includes(payload.eventType)) throw new TypeError('Unsupported lifecycle event');
  if (!['ghl', 'instantly'].includes(payload.origin)) throw new TypeError('Explicit origin required');
  if (typeof payload.eventId !== 'string' || !/^[A-Za-z0-9_:.-]{8,256}$/.test(payload.eventId)) throw new TypeError('Stable eventId required');
  if (payload.eventType === 'inquiry_saved' && !/^drm_inquiry_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(payload.eventId)) throw new TypeError('Saved inquiry receipt ID required');
  const event = { eventId: payload.eventId, eventType: payload.eventType, origin: payload.origin,
    locationId: id(payload.locationId, 'locationId'), contactId: id(payload.contactId, 'contactId'),
    occurredAt: time(payload.occurredAt), historical,
  };
  if (Date.parse(event.occurredAt) > now + 60000) throw new TypeError('Future lifecycle event');
  if (payload.eventType.startsWith('appointment_')) {
    event.appointmentId = id(payload.appointmentId, 'appointmentId'); event.calendarId = id(payload.calendarId, 'calendarId');
  }
  if (['qualified_opportunity', 'customer_closed'].includes(payload.eventType)) {
    event.opportunityId = id(payload.opportunityId, 'opportunityId');
    event.pipelineId = id(payload.pipelineId, 'pipelineId'); event.pipelineStageId = id(payload.pipelineStageId, 'pipelineStageId');
  }
  if (payload.eventType === 'revenue_received') event.transactionId = id(payload.transactionId, 'transactionId');
  // Amounts, source, tags, email and campaign values from inbound JSON are never
  // trusted or copied: fetch real CRM records and preserve established history.
  return event;
}

export function readLifecycleConfig(env, { historical = false, inquiryOnly = false } = {}) {
  if (env.VERCEL_ENV !== 'production' || env.ENABLE_GHL_LIFECYCLE_SYNC !== 'true') throw new LifecycleError('LIFECYCLE_NOT_ENABLED');
  const token = env.GHL_OUTREACH_PIT || env.GHL_PIT;
  if (inquiryOnly) {
    const attributionFieldMap = resolveAttributionFieldMap({ locationId: env.GHL_LOCATION_ID,
      override: env.GHL_ATTRIBUTION_FIELD_IDS, persisted: attributionFields });
    const schemaKey = env.GHL_ACTIVITY_SCHEMA_KEY || ACTIVITY_SCHEMA_KEY;
    if (!token || !isId(env.GHL_LOCATION_ID) || !isId(env.GHL_ACTIVITY_ASSOCIATION_ID) || !attributionFieldMap ||
        !/^custom_objects\.[a-z][a-z0-9_]*$/.test(schemaKey)) throw new LifecycleError('LIFECYCLE_CONFIG_INCOMPLETE');
    if (env.GHL_ACTIVITY_UNIQUE_EVENT_ID_VERIFIED !== 'true' || env.GHL_LIFECYCLE_PAYLOAD_MAPPING_VERIFIED !== 'true') throw new LifecycleError('LIFECYCLE_LIVE_SAFEGUARDS_UNVERIFIED');
    if (historical && (env.ENABLE_GHL_LIFECYCLE_HISTORY_IMPORT !== 'true' || env.GHL_HISTORICAL_IMPORT_SAFE !== 'true')) throw new LifecycleError('LIFECYCLE_HISTORY_NOT_ENABLED');
    return { token, locationId: env.GHL_LOCATION_ID, associationId: env.GHL_ACTIVITY_ASSOCIATION_ID,
      contactIsFirst: env.GHL_ACTIVITY_CONTACT_IS_FIRST === 'true', schemaKey, attributionFieldMap, inquiryOnly: true };
  }
  const fieldMap = readOutreachFieldMap(env.GHL_OUTREACH_FIELD_IDS);
  const reverseSyncEnabled = env.ENABLE_INSTANTLY_GHL_SYNC === 'true';
  if (!token || !isId(env.GHL_LOCATION_ID) || !isId(env.GHL_ACTIVITY_ASSOCIATION_ID) || !fieldMap || (reverseSyncEnabled && !env.INSTANTLY_API_KEY)) throw new LifecycleError('LIFECYCLE_CONFIG_INCOMPLETE');
  if (env.GHL_ACTIVITY_UNIQUE_EVENT_ID_VERIFIED !== 'true' || env.GHL_LIFECYCLE_PAYLOAD_MAPPING_VERIFIED !== 'true' || env.GHL_OUTREACH_AUTOMATIONS_REVIEWED !== 'true') throw new LifecycleError('LIFECYCLE_LIVE_SAFEGUARDS_UNVERIFIED');
  if (historical && (env.ENABLE_GHL_LIFECYCLE_HISTORY_IMPORT !== 'true' || env.GHL_HISTORICAL_IMPORT_SAFE !== 'true')) throw new LifecycleError('LIFECYCLE_HISTORY_NOT_ENABLED');
  const calendarIds = configJson(env.GHL_LIFECYCLE_CALENDAR_IDS, 'CALENDAR_IDS');
  if (!Array.isArray(calendarIds) || !calendarIds.length || calendarIds.some((value) => !isId(value))) throw new LifecycleError('CONFIG_CALENDAR_IDS');
  const pipelineStages = configJson(env.GHL_LIFECYCLE_STAGE_MAP, 'STAGE_MAP');
  if (!validMapObject(pipelineStages) || !Object.keys(pipelineStages).length) throw new LifecycleError('CONFIG_STAGE_MAP');
  for (const [pipelineId, stages] of Object.entries(pipelineStages)) {
    if (!isId(pipelineId) || !validMapObject(stages) || ['qualifiedStageIds', 'wonStageIds'].some((key) =>
      !Array.isArray(stages[key]) || !stages[key].length || stages[key].some((stageId) => !isId(stageId)))) throw new LifecycleError('CONFIG_STAGE_MAP');
  }
  const schemaKey = env.GHL_ACTIVITY_SCHEMA_KEY || ACTIVITY_SCHEMA_KEY;
  if (!/^custom_objects\.[a-z][a-z0-9_]*$/.test(schemaKey)) throw new LifecycleError('CONFIG_ACTIVITY_SCHEMA_KEY');
  if (env.GHL_LOCATION_ID === REAL_ESTATE_LOCATION) {
    if (!calendarIds.includes(REAL_ESTATE_CALENDAR)) calendarIds.push(REAL_ESTATE_CALENDAR);
    pipelineStages[REAL_ESTATE_PIPELINE] = {
      qualifiedStageIds: [REAL_ESTATE_QUALIFIED_STAGE], wonStageIds: [REAL_ESTATE_WON_STAGE],
    };
  }
  return {
    token, locationId: env.GHL_LOCATION_ID, associationId: env.GHL_ACTIVITY_ASSOCIATION_ID,
    contactIsFirst: env.GHL_ACTIVITY_CONTACT_IS_FIRST === 'true', schemaKey, fieldMap, calendarIds, pipelineStages,
    attributionFieldMap: resolveAttributionFieldMap({ locationId: env.GHL_LOCATION_ID,
      override: env.GHL_ATTRIBUTION_FIELD_IDS, persisted: attributionFields }),
    instantlyApiKey: env.INSTANTLY_API_KEY, reverseSyncEnabled,
    paymentMappingVerified: env.GHL_PAYMENT_REVENUE_MAPPING_VERIFIED === 'true',
    paymentAmountUnit: env.GHL_PAYMENT_AMOUNT_UNIT,
    paymentCurrencyExponents: env.GHL_PAYMENT_CURRENCY_EXPONENTS ? configJson(env.GHL_PAYMENT_CURRENCY_EXPONENTS, 'PAYMENT_CURRENCY_EXPONENTS') : {},
  };
}

export function createGhlLifecycleReader({ token, locationId, fetchImpl = fetch, timeoutMs = 15000 }) {
  async function request(path) {
    const response = await fetchImpl(`https://services.leadconnectorhq.com${path}`, {
      method: 'GET', redirect: 'error',
      headers: { Authorization: `Bearer ${token}`, Version: 'v3', Accept: 'application/json' },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) throw new LifecycleError('GHL_LIFECYCLE_READ_FAILED', response.status);
    try { return await response.json(); } catch { throw new LifecycleError('GHL_LIFECYCLE_INVALID_RESPONSE'); }
  }
  return {
    async getAppointment(appointmentId) {
      const response = await request(`/calendars/events/appointments/${encodeURIComponent(id(appointmentId, 'appointmentId'))}`);
      // Live v3 returns { appointment, traceId }; the reference also documents
      // { event }. Reject competing records instead of silently choosing one.
      if (response?.appointment && response?.event) throw new LifecycleError('GHL_APPOINTMENT_RESULT_AMBIGUOUS');
      return response?.appointment ?? response?.event;
    },
    async getOpportunity(opportunityId) { return (await request(`/opportunities/${encodeURIComponent(id(opportunityId, 'opportunityId'))}`)).opportunity; },
    async getTransaction(transactionId) {
      const query = new URLSearchParams({ altId: locationId, altType: 'location', locationId });
      const response = await request(`/payments/transactions/${encodeURIComponent(id(transactionId, 'transactionId'))}?${query}`);
      // Live v3 returns a single-element array; also accept the documented object.
      // Never choose a record from an ambiguous or empty result.
      if (Array.isArray(response)) {
        if (response.length !== 1) throw new LifecycleError('GHL_TRANSACTION_RESULT_AMBIGUOUS');
        return response[0];
      }
      return response;
    },
  };
}

function decimal(value) {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : null;
  return typeof value === 'string' && /^\d+(?:\.\d{1,8})?$/.test(value) ? Number(value) : null;
}
function isTrue(value) { return value === true || value === 'true'; }
function isFalse(value) { return value === false || value === 'false'; }

export async function verifyGhlLifecycle(event, contact, config, reader) {
  if (event.locationId !== config.locationId || contact?.id !== event.contactId || contact.locationId !== config.locationId) throw new LifecycleError('LIFECYCLE_CONTACT_MISMATCH');
  if (event.eventType === 'inquiry_saved') {
    const map = config.attributionFieldMap; const fields = fieldValues(contact);
    if (!map || fields[map.last_inquiry_event_id] !== event.eventId ||
        Date.parse(fields[map.last_inquiry_at]) !== Date.parse(event.occurredAt) ||
        !Array.isArray(contact.tags) || !contact.tags.includes('demandflow-home-services')) throw new LifecycleError('LIFECYCLE_INQUIRY_RECEIPT_UNVERIFIED');
    return { inquiry: true };
  }
  if (event.eventType.startsWith('appointment_')) {
    if (!config.calendarIds.includes(event.calendarId)) throw new LifecycleError('LIFECYCLE_CALENDAR_NOT_MAPPED');
    const appointment = await reader.getAppointment(event.appointmentId);
    if (!appointment || appointment.id !== event.appointmentId || appointment.contactId !== contact.id || appointment.calendarId !== event.calendarId ||
        (appointment.locationId && appointment.locationId !== config.locationId)) throw new LifecycleError('LIFECYCLE_APPOINTMENT_MISMATCH');
    // Attended implies a real booking. A visit to a booking/watch URL does not.
    const allowed = event.eventType === 'appointment_attended' ? ['showed'] : ['confirmed', 'showed'];
    if (!allowed.includes(appointment.appointmentStatus)) throw new LifecycleError('LIFECYCLE_APPOINTMENT_STATUS_UNVERIFIED');
    return { appointment };
  }
  if (['qualified_opportunity', 'customer_closed'].includes(event.eventType)) {
    const stages = config.pipelineStages[event.pipelineId];
    const allowed = event.eventType === 'customer_closed' ? stages?.wonStageIds : stages?.qualifiedStageIds;
    if (!allowed?.includes(event.pipelineStageId)) throw new LifecycleError('LIFECYCLE_STAGE_NOT_MAPPED');
    const opportunity = await reader.getOpportunity(event.opportunityId);
    if (!opportunity || opportunity.id !== event.opportunityId || (opportunity.contactId || opportunity.contact?.id) !== contact.id ||
        opportunity.pipelineId !== event.pipelineId || (opportunity.locationId && opportunity.locationId !== config.locationId)) throw new LifecycleError('LIFECYCLE_OPPORTUNITY_MISMATCH');
    if (opportunity.pipelineStageId !== event.pipelineStageId ||
        (event.eventType === 'customer_closed' ? opportunity.status !== 'won' : !['open', 'won'].includes(opportunity.status))) throw new LifecycleError('LIFECYCLE_OPPORTUNITY_STATUS_UNVERIFIED');
    // monetaryValue is estimated deal value, not proof of received revenue.
    return { opportunity };
  }
  if (event.eventType === 'revenue_received') {
    if (!config.paymentMappingVerified || !['major', 'minor'].includes(config.paymentAmountUnit)) throw new LifecycleError('LIFECYCLE_PAYMENT_MAPPING_UNVERIFIED');
    const transaction = await reader.getTransaction(event.transactionId);
    if (transaction?._id !== event.transactionId || transaction.altType !== 'location' || transaction.altId !== config.locationId || transaction.contactId !== contact.id) throw new LifecycleError('LIFECYCLE_TRANSACTION_MISMATCH');
    if (transaction.status !== 'succeeded' || !isTrue(transaction.liveMode) || !isFalse(transaction.markAsTest)) throw new LifecycleError('LIFECYCLE_TRANSACTION_NOT_LIVE_PAID');
    const amount = decimal(transaction.amount); const refunded = decimal(transaction.amountRefunded ?? 0);
    const currency = typeof transaction.currency === 'string' ? transaction.currency.toUpperCase() : '';
    // Refunds require their own reconciliation event, never a fabricated new sale.
    if (amount === null || refunded === null || refunded > 0 || !/^[A-Z]{3}$/.test(currency)) throw new LifecycleError('LIFECYCLE_REVENUE_NOT_VERIFIED');
    let revenueValue = amount;
    if (config.paymentAmountUnit === 'minor') {
      const exponent = config.paymentCurrencyExponents?.[currency];
      if (!Number.isInteger(exponent) || exponent < 0 || exponent > 4 || !Number.isInteger(amount)) throw new LifecycleError('LIFECYCLE_PAYMENT_UNITS_UNVERIFIED');
      revenueValue = amount / (10 ** exponent);
    }
    return { transaction, revenueValue, currency };
  }
  if (event.eventType === 'lead_unsubscribed') {
    if (contact.dndSettings?.email?.status !== 'active') throw new LifecycleError('LIFECYCLE_EMAIL_UNSUBSCRIBE_UNVERIFIED');
    return {};
  }
  throw new LifecycleError('LIFECYCLE_UNSUPPORTED');
}

const fieldValues = (contact) => Object.fromEntries((contact.customFields || []).map((field) => [field.id, field.value ?? field.fieldValue]));

/** Retain the original known Instantly campaign; never replace CRM attribution. */
export function lifecycleCampaignContext(records, contact, map, attributionMap) {
  const history = records.filter((r) => r.properties?.record_kind === 'activity' && r.properties.source === 'instantly')
    .map((r) => r.properties).sort((a, b) => a.occurred_at.localeCompare(b.occurred_at));
  const first = history.find((p) => p.campaign_id);
  const fields = fieldValues(contact);
  return { campaignId: fields[map.instantly_first_campaign_id] || first?.campaign_id || '',
    campaignName: fields[map.instantly_first_campaign_name] || first?.campaign_name ||
      (attributionMap ? fields[attributionMap.first_utm_campaign] || fields[attributionMap.latest_utm_campaign] : '') || '',
    hasInstantlyHistory: history.length > 0,
  };
}

export function lifecycleProjection(records, contact, map) {
  const hasInstantly = records.some((r) => r.properties?.source === 'instantly' && r.properties.record_kind === 'activity');
  const metrics = deriveActivityMetrics(records);
  const latest = metrics.latestActivity;
  let fields;
  if (hasInstantly) {
    fields = outreachContactProjection(records, contact, map).fields.filter((f) => f.id !== map.sync_origin);
  } else {
    fields = Object.entries({
      outreach_appointments_booked: metrics.appointmentsBooked, outreach_appointments_attended: metrics.appointmentsAttended,
      outreach_customers_won: metrics.customersWon, outreach_revenue_by_currency: JSON.stringify(metrics.revenueByCurrency),
      outreach_latest_activity: latest?.event_type, outreach_latest_at: latest?.occurred_at,
      last_synced_event_id: latest?.event_id,
    }).filter(([, value]) => value !== undefined).map(([key, value]) => ({ id: map[key], fieldValue: String(value) }));
  }
  fields.push({ id: map.sync_origin, fieldValue: 'ghl' });
  // No contact.source or original/latest advertising fields are changed here.
  return { fields, metrics };
}

export function createLifecycleDependencies(config, { fetchImpl = fetch } = {}) {
  const instantly = !config.inquiryOnly && config.reverseSyncEnabled ? createInstantlyClient({ apiKey: config.instantlyApiKey, fetchImpl }) : null;
  return {
    ghl: createGhlOutreachClient({ ...config, fetchImpl }),
    reader: createGhlLifecycleReader({ ...config, fetchImpl }),
    ledger: createGhlActivityLedger({ ...config, uniqueEventIdVerified: true, fetchImpl }),
    reverseSync: instantly ? (options) => syncInstantlyLifecycle(instantly, options) : undefined,
  };
}

export async function processGhlLifecycle(event, config, { ghl, reader, ledger, reverseSync }, { testOnly = false } = {}) {
  if (event.locationId !== config.locationId) throw new LifecycleError('LIFECYCLE_WRONG_LOCATION');
  // Instantly's mirror already has its own activity row. Do not invent a GHL
  // appointment/customer or bounce a mirrored status back to its sender.
  if (event.origin === 'instantly') return { disposition: 'ignored_sync_echo', conversionSent: false, reverseSync: false };
  const contact = await ghl.getContact(event.contactId);
  if (testOnly && (contact?.dnd !== true || !/@[^@\s]+\.invalid$/i.test(String(contact.email || '').trim()))) throw new LifecycleError('LIFECYCLE_TEST_CONTACT_REQUIRED');
  const verified = await verifyGhlLifecycle(event, contact, config, reader);
  if (event.eventType === 'inquiry_saved') {
    const fields = fieldValues(contact); const map = config.attributionFieldMap;
    const appended = await ledger.append({ source: 'ghl', workspaceId: config.locationId,
      eventId: event.eventId, eventType: event.eventType, contactId: contact.id,
      leadEmail: normalizedEmail(contact.email), occurredAt: event.occurredAt,
      historical: event.historical,
      campaignName: testOnly ? 'DRM INTEGRATION TEST - SAVED INQUIRY' : fields[map.first_utm_campaign] || fields[map.latest_utm_campaign] || '',
    });
    return { disposition: appended.created ? 'recorded' : 'reconciled', historical: event.historical || appended.historical,
      eventReference: createHash('sha256').update(appended.record.properties.event_id).digest('hex').slice(0, 16),
      reverseSync: false, conversionSent: false, activityRecord: appended.record };
  }
  const before = await ledger.list({ contactId: contact.id });
  const priorEvent = before.find((record) => record.properties?.source === 'ghl' &&
    record.properties.source_event_id === event.eventId && record.properties.event_type === event.eventType);
  // A later history import cannot reassign the campaign on an already-saved
  // lifecycle fact during a partial retry. The original record remains immutable.
  const campaign = priorEvent ? { campaignId: priorEvent.properties.campaign_id || '', campaignName: priorEvent.properties.campaign_name || '' }
    : lifecycleCampaignContext(before, contact, config.fieldMap, config.attributionFieldMap);
  const appended = await ledger.append({
    source: 'ghl', workspaceId: config.locationId, eventId: event.eventId, eventType: event.eventType,
    contactId: contact.id, leadEmail: normalizedEmail(contact.email), occurredAt: event.occurredAt,
    historical: event.historical, campaignId: campaign.campaignId, campaignName: campaign.campaignName,
    appointmentId: event.appointmentId, opportunityId: event.opportunityId,
    ...(event.eventType === 'revenue_received' ? {
      transactionId: event.transactionId, revenueValue: verified.revenueValue,
      currency: verified.currency, revenueVerified: true,
    } : {}),
  });
  const historical = event.historical || appended.historical;
  if (testOnly) return { disposition: appended.created ? 'recorded' : 'reconciled', historical,
    reverseSync: false, conversionSent: false, activityRecord: appended.record, test: true };
  const records = await ledger.list({ contactId: contact.id });
  if (!records.some((r) => r.properties?.event_id === appended.record.properties.event_id)) throw new LifecycleError('LIFECYCLE_LEDGER_NOT_VISIBLE');
  const current = await ghl.getContact(contact.id);
  const projection = lifecycleProjection(records, current, config.fieldMap);
  await ghl.updateProjection(current, { fields: projection.fields });

  const reverseLifecycle = {
    appointment_confirmed: 'appointment_booked', appointment_attended: 'appointment_attended',
    customer_closed: 'customer_won', lead_unsubscribed: 'unsubscribed',
  }[event.eventType];
  let result = { skipped: historical ? 'historical' : !reverseLifecycle ? 'milestone_has_no_reverse_status' : !reverseSync ? 'instantly_sync_disabled' : 'no_email' };
  const email = normalizedEmail(current.email);
  if (!historical && reverseLifecycle && email && reverseSync) {
    // The remote read-back is repeated even when a receipt exists, repairing a
    // partial retry and confirming suppression rather than trusting a label.
    result = await reverseSync({ email, lifecycle: reverseLifecycle, origin: 'ghl', historical: false });
    if (result.skipped !== 'no_exact_match' && !result.sequenceStopVerified) throw new LifecycleError('LIFECYCLE_INSTANTLY_STOP_NOT_VERIFIED');
    if (result.sequenceStopVerified) {
      await ledger.recordEffectCompletion(appended.record, 'instantly_lifecycle', result.suppression.blocklistId);
      // Additive tags and SMS exclusion are visibility/control inputs; the
      // reviewed GHL workflow must separately remove active SMS enrollments.
      await ghl.addTags(contact.id, ['drm-stop-cold-prospecting', 'drm-exclude-cold-sms']);
      const refreshed = await ghl.getContact(contact.id);
      await ghl.updateProjection(refreshed, { fields: [{ id: config.fieldMap.exclude_cold_sms, fieldValue: 'yes' }] });
    }
  }
  return {
    disposition: appended.created ? 'recorded' : 'reconciled', historical,
    eventReference: createHash('sha256').update(appended.record.properties.event_id).digest('hex').slice(0, 16),
    reverseSync: result.sequenceStopVerified === true, reverseSyncSkipped: result.skipped || null,
    sequenceStopVerified: result.sequenceStopVerified === true,
    stopVerification: result.verification || null,
    smsStopVerification: 'reviewed_native_ghl_workflow_required',
    conversionSent: false, advertisingOwner: 'configured_native_ghl_workflows',
    activityRecord: appended.record,
  };
}
