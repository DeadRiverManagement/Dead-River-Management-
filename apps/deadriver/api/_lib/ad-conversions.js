import { createHash } from 'node:crypto';
import attributionFields from '../../src/data/ghl-attribution-fields.json' with { type: 'json' };
import { contactFieldValues, resolveAttributionFieldMap } from '../../src/lib/crm-attribution.js';
import { verifyGhlLifecycle } from './ghl-lifecycle.js';

// Server adapter composed by the authenticated GHL lifecycle route after it
// persists a verified CRM fact. Explicit enablement and mapping gates remain;
// arbitrary incoming JSON is never treated as proof of a milestone.
export const META_PIXEL_ID = '4422109568077296';
export const META_EVENT_NAMES = Object.freeze({
  inquiry_saved: 'Lead',
  appointment_confirmed: 'Schedule',
  qualified_opportunity: 'QualifiedLead',
  customer_closed: 'ConvertedLead',
  revenue_received: 'Purchase',
});
const LOCATION_ID = attributionFields.locationId;
const WEEK_MS = 7 * 86400000;
const id = (value) => typeof value === 'string' && /^[A-Za-z0-9_-]{8,100}$/.test(value);
const hash = (value) => createHash('sha256').update(value).digest('hex');
const skipped = (reason) => ({ disposition: 'skipped', reason, conversionSent: false });

export class MetaConversionError extends Error {
  constructor(code, status = 0) {
    super(code); this.name = 'MetaConversionError'; this.code = code; this.status = status;
  }
}
function jsonConfig(raw, fallback) {
  if (raw == null || raw === '') return fallback;
  try { return JSON.parse(raw); } catch { throw new MetaConversionError('META_CONFIG_INVALID'); }
}

export function readMetaConversionConfig(env, { testOnly = false } = {}) {
  const isolatedTest = testOnly && env.ENABLE_META_CAPI_TEST === 'true';
  if (env.ENABLE_META_CAPI !== 'true' && !isolatedTest) return null;
  if (env.VERCEL_ENV !== 'production') throw new MetaConversionError('META_PRODUCTION_ONLY');
  const fieldMap = resolveAttributionFieldMap({
    locationId: env.GHL_LOCATION_ID, override: env.GHL_ATTRIBUTION_FIELD_IDS, persisted: attributionFields,
  });
  if (env.GHL_LOCATION_ID !== LOCATION_ID || !fieldMap ||
      (env.META_PIXEL_ID && env.META_PIXEL_ID !== META_PIXEL_ID) ||
      typeof env.META_CAPI_ACCESS_TOKEN !== 'string' || !env.META_CAPI_ACCESS_TOKEN.trim() ||
      !/^v\d{2,3}\.0$/.test(env.META_GRAPH_API_VERSION || '')) {
    throw new MetaConversionError('META_CONFIG_INCOMPLETE');
  }
  if ((!isolatedTest && (env.META_CAPI_EVENT_MAPPING_VERIFIED !== 'true' || env.META_CAPI_BROWSER_DEDUP_VERIFIED !== 'true')) ||
      env.GHL_ACTIVITY_UNIQUE_EVENT_ID_VERIFIED !== 'true') {
    throw new MetaConversionError('META_MAPPING_UNVERIFIED');
  }
  if (env.GHL_ANALYTICS_STORAGE_FIELD_ID && !id(env.GHL_ANALYTICS_STORAGE_FIELD_ID)) {
    throw new MetaConversionError('META_ANALYTICS_FIELD_INVALID');
  }
  return {
    pixelId: META_PIXEL_ID, locationId: LOCATION_ID, fieldMap,
    accessToken: env.META_CAPI_ACCESS_TOKEN, apiVersion: env.META_GRAPH_API_VERSION,
    analyticsStorageFieldId: env.GHL_ANALYTICS_STORAGE_FIELD_ID,
    testEventCode: env.META_CAPI_TEST_EVENT_CODE,
    lifecycle: {
      locationId: LOCATION_ID,
      calendarIds: jsonConfig(env.GHL_LIFECYCLE_CALENDAR_IDS, []),
      pipelineStages: jsonConfig(env.GHL_LIFECYCLE_STAGE_MAP, {}),
      paymentMappingVerified: env.GHL_PAYMENT_REVENUE_MAPPING_VERIFIED === 'true',
      paymentAmountUnit: env.GHL_PAYMENT_AMOUNT_UNIT,
      paymentCurrencyExponents: jsonConfig(env.GHL_PAYMENT_CURRENCY_EXPONENTS, {}),
    },
  };
}

function originalTime(value, now) {
  const parsed = typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    ? Date.parse(value) : NaN;
  if (!Number.isFinite(parsed) || parsed > now + 60000) throw new MetaConversionError('META_EVENT_TIME_INVALID');
  return parsed;
}
function metaCookie(value, kind, eventTimeMs) {
  if (typeof value !== 'string' || value.length > 600) return null;
  const match = value.match(kind === 'fbc' ? /^fb\.\d+\.(\d{13})\.([A-Za-z0-9_-]+)$/ : /^fb\.\d+\.(\d{13})\.(\d+)$/);
  if (!match || Number(match[1]) > eventTimeMs + 60000) return null;
  return value; // Real stored value only: never synthesize or hash fbc/fbp here.
}
function isDenied(value) {
  return value === false || (typeof value === 'string' && ['denied', 'false', 'no', '0'].includes(value.trim().toLowerCase()));
}
function isGranted(value) { return typeof value === 'string' && value.trim().toLowerCase() === 'granted'; }
function isSynthetic(contact) {
  return typeof contact.email === 'string' && /@[^@\s]+\.invalid$/i.test(contact.email.trim());
}
function normalizedPhone(value) {
  // A country code must already be explicit. Never guess a country from locale.
  if (typeof value !== 'string' || !/^\+[1-9][\d ().-]{6,30}$/.test(value.trim())) return null;
  const digits = value.replace(/\D/g, '');
  return /^[1-9]\d{6,14}$/.test(digits) ? digits : null;
}
function sourceUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !['www.deadrivermanagement.com', 'deadrivermanagement.com'].includes(url.hostname) ||
        url.username || url.password || url.port) return null;
    return url.origin + url.pathname; // No form answers, query data or fragment.
  } catch { return null; }
}

/**
 * Contact must be read from GHL by the authenticated server caller. For
 * lifecycle events the reader performs authoritative CRM status/payment reads.
 * QualifiedLead and ConvertedLead are intentional custom CRM event names.
 */
export async function prepareMetaConversion({ event, contact, reader, websiteContext, consentContext = {} }, config,
  { now = Date.now(), mode = 'live' } = {}) {
  if (!['live', 'test'].includes(mode)) throw new MetaConversionError('META_MODE_INVALID');
  if (event?.historical) return skipped('historical');
  if (event?.origin !== 'ghl') return skipped('not_a_crm_milestone');
  const eventName = Object.hasOwn(META_EVENT_NAMES, event.eventType) ? META_EVENT_NAMES[event.eventType] : null;
  if (!eventName) return skipped('unmapped_milestone');
  if (!id(event.contactId) || event.locationId !== config.locationId || contact?.id !== event.contactId ||
      contact.locationId !== config.locationId) throw new MetaConversionError('META_CONTACT_MISMATCH');
  if (mode === 'live' && (event.test === true || isSynthetic(contact))) return skipped('test_record');
  if (mode === 'test' && (!isSynthetic(contact) || contact.dnd !== true)) throw new MetaConversionError('META_TEST_CONTACT_REQUIRED');
  const eventTimeMs = originalTime(event.occurredAt, now);
  // Local freshness boundary prevents replaying old CRM history as a new ad event.
  if (eventTimeMs < now - WEEK_MS) return skipped('event_too_old');
  const fields = contactFieldValues(contact), map = config.fieldMap;
  if (isDenied(fields[map.ad_storage]) || isDenied(fields[map.ad_user_data]) ||
      (config.analyticsStorageFieldId && isDenied(fields[config.analyticsStorageFieldId])) ||
      consentContext.analytics_allowed === false || consentContext.globalPrivacyControl === true ||
      ['ad_storage', 'ad_user_data', 'analytics_storage'].some((key) => isDenied(consentContext[key]))) {
    return skipped('consent_denied');
  }
  const userData = {};
  for (const key of ['fbc', 'fbp']) {
    const value = metaCookie(fields[map[key]], key, eventTimeMs);
    if (value) userData[key] = value;
  }
  // The informational cookie notice is not a user-data grant. Unknown/empty
  // consent may use retained cookie identifiers, never hashed contact PII.
  if (isGranted(fields[map.ad_user_data])) {
    const email = typeof contact.email === 'string' ? contact.email.trim().toLowerCase() : '';
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 200) userData.em = [hash(email)];
    const phone = normalizedPhone(contact.phone);
    if (phone) userData.ph = [hash(phone)];
    userData.external_id = [hash(`${config.locationId}:${contact.id}`)];
  }
  if (!Object.keys(userData).length) return skipped('no_consented_matching_identifiers');
  let eventId, verified;
  if (event.eventType === 'inquiry_saved') {
    if (!/^drm_inquiry_[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(event.eventId || '') ||
        fields[map.last_inquiry_event_id] !== event.eventId ||
        originalTime(fields[map.last_inquiry_at], now) !== eventTimeMs ||
        !Array.isArray(contact.tags) || !contact.tags.includes('demandflow-home-services')) {
      throw new MetaConversionError('META_INQUIRY_RECEIPT_UNVERIFIED');
    }
    eventId = event.eventId;
  } else {
    verified = await verifyGhlLifecycle(event, contact, config.lifecycle, reader);
    const identity = event.eventType === 'appointment_confirmed' ? event.appointmentId
      : event.eventType === 'revenue_received' ? event.transactionId : event.opportunityId;
    // Status webhook delivery IDs may differ. One real appointment, opportunity
    // milestone or payment retains one platform ID across every retry.
    eventId = `drm_meta_${hash(JSON.stringify([config.locationId, event.contactId, event.eventType, identity]))}`;
  }
  const payload = { event_name: eventName, event_time: Math.floor(eventTimeMs / 1000),
    event_id: eventId, action_source: 'system_generated', user_data: userData };
  if (websiteContext) {
    // Explicit direct-intake mode only. A workflow's HTTP user-agent is not the
    // visitor's user-agent and must never be substituted for it.
    const url = sourceUrl(websiteContext.eventSourceUrl);
    if (event.eventType !== 'inquiry_saved' || websiteContext.verifiedOriginalRequest !== true || !url ||
        typeof websiteContext.clientUserAgent !== 'string' || !websiteContext.clientUserAgent.trim() ||
        websiteContext.clientUserAgent.length > 1024 || /[\r\n]/.test(websiteContext.clientUserAgent)) {
      throw new MetaConversionError('META_ORIGINAL_WEBSITE_CONTEXT_REQUIRED');
    }
    payload.action_source = 'website'; payload.event_source_url = url;
    payload.user_data.client_user_agent = websiteContext.clientUserAgent;
  }
  if (event.eventType === 'revenue_received') {
    if (!Number.isFinite(verified.revenueValue) || verified.revenueValue <= 0) throw new MetaConversionError('META_POSITIVE_PAID_REVENUE_REQUIRED');
    payload.custom_data = { value: verified.revenueValue, currency: verified.currency, order_id: event.transactionId };
  }
  return { disposition: 'prepared', conversionSent: false, payload };
}

function validateActivityRecord(record, event) {
  const p = record?.properties;
  if (!record?.id || p?.record_kind !== 'activity' || !p.event_id || p.source !== 'ghl' ||
      p.contact_id !== event.contactId || p.workspace_id !== event.locationId ||
      p.event_type !== event.eventType || p.source_event_id !== event.eventId ||
      Date.parse(p.occurred_at) !== Date.parse(event.occurredAt) || p.historical !== 0) {
    throw new MetaConversionError('META_DURABLE_ACTIVITY_REQUIRED');
  }
  for (const [input, stored] of [['appointmentId', 'appointment_id'], ['opportunityId', 'opportunity_id'], ['transactionId', 'transaction_id']]) {
    if (event[input] && p[stored] !== event[input]) throw new MetaConversionError('META_ACTIVITY_IDENTITY_MISMATCH');
  }
}

/** No automatic retries or enabling side effects. Caller retries the same fact. */
export function createMetaConversionDispatcher({ env = process.env, ghl, reader, ledger, fetchImpl = fetch, now = Date.now }) {
  return async function dispatch({ event, activityRecord, mode = 'live', websiteContext, consentContext }) {
    const config = readMetaConversionConfig(env, { testOnly: mode === 'test' });
    if (!config) return skipped('disabled');
    if (event?.historical) return skipped('historical');
    if (event?.origin !== 'ghl') return skipped('not_a_crm_milestone');
    if (!Object.hasOwn(META_EVENT_NAMES, event?.eventType)) return skipped('unmapped_milestone');
    if (!['live', 'test'].includes(mode)) throw new MetaConversionError('META_MODE_INVALID');
    if (mode === 'test' && !/^[A-Za-z0-9_-]{3,100}$/.test(config.testEventCode || '')) throw new MetaConversionError('META_TEST_EVENT_CODE_REQUIRED');
    validateActivityRecord(activityRecord, event);
    if (!ghl?.getContact || !ledger?.get || !ledger?.list || !ledger?.completedEffect || !ledger?.recordEffectCompletion) throw new MetaConversionError('META_DEPENDENCIES_REQUIRED');
    const durable = await ledger.get(activityRecord.id);
    if (durable?.id !== activityRecord.id || durable?.properties?.event_id !== activityRecord.properties.event_id) {
      throw new MetaConversionError('META_DURABLE_ACTIVITY_REQUIRED');
    }
    validateActivityRecord(durable, event);
    const contact = await ghl.getContact(event.contactId);
    const prepared = await prepareMetaConversion({ event, contact, reader, websiteContext, consentContext }, config, { now: now(), mode });
    if (prepared.disposition !== 'prepared') return prepared;
    const payload = prepared.payload;
    if (event.eventType === 'revenue_received' &&
        (durable.properties.revenue_verified !== 1 ||
         durable.properties.revenue_value !== payload.custom_data.value ||
         durable.properties.currency !== payload.custom_data.currency)) {
      // A changed payment must be reconciled with the immutable CRM ledger;
      // never report one amount there and a different amount to advertising.
      throw new MetaConversionError('META_DURABLE_REVENUE_MISMATCH');
    }
    const effectKey = `meta_${mode}_${hash(JSON.stringify([config.pixelId, payload.event_name, payload.event_id, mode === 'test' ? config.testEventCode : '']))}`;
    if (await ledger.completedEffect(durable, effectKey)) return { disposition: 'already_received', conversionSent: false, eventName: payload.event_name };
    // Different GHL delivery IDs can produce separate history rows for the
    // same real milestone. A prior acceptance of this platform event still
    // applies across those rows, even after Meta's deduplication window ends.
    const contactHistory = await ledger.list({ contactId: event.contactId, includeReceipts: true });
    if (!Array.isArray(contactHistory)) throw new MetaConversionError('META_RECEIPT_HISTORY_INVALID');
    if (contactHistory.some((record) => record.properties?.record_kind === 'effect_receipt' &&
        record.properties.contact_id === event.contactId && record.properties.event_type === effectKey)) {
      return { disposition: 'already_received', conversionSent: false, eventName: payload.event_name };
    }
    let response, result;
    try {
      response = await fetchImpl(`https://graph.facebook.com/${config.apiVersion}/${config.pixelId}/events`, {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000),
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ data: [payload], access_token: config.accessToken,
          ...(mode === 'test' ? { test_event_code: config.testEventCode } : {}) }),
      });
    } catch { throw new MetaConversionError('META_DELIVERY_UNCERTAIN'); }
    try { result = await response.json(); } catch { throw new MetaConversionError('META_INVALID_RESPONSE', response.status); }
    if (!response.ok || result?.error) throw new MetaConversionError('META_DELIVERY_REJECTED', response.status);
    if (result.events_received !== 1 || !Array.isArray(result.messages) ||
        typeof result.fbtrace_id !== 'string' || !/^[A-Za-z0-9_-]{1,256}$/.test(result.fbtrace_id)) {
      throw new MetaConversionError('META_RECEIPT_UNVERIFIED', response.status);
    }
    // Do not log/return response messages, contact data, the token or payload.
    // An uncertain receipt write throws; a retry uses the exact same Meta ID.
    await ledger.recordEffectCompletion(durable, effectKey, result.fbtrace_id);
    return { disposition: 'received', conversionSent: true, test: mode === 'test',
      eventName: payload.event_name, eventReference: hash(payload.event_id).slice(0, 16),
      platformTraceId: result.fbtrace_id, warningCount: result.messages.length };
  };
}
