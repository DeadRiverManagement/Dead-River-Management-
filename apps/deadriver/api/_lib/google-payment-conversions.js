import { createHash } from 'node:crypto';
import { getVercelOidcToken } from '@vercel/oidc';
import { ExternalAccountClient } from 'google-auth-library';
import attributionFields from '../../src/data/ghl-attribution-fields.json' with { type: 'json' };
import { contactFieldValues, resolveAttributionFieldMap } from '../../src/lib/crm-attribution.js';
import { verifyGhlLifecycle } from './ghl-lifecycle.js';

// This sender owns actual paid revenue only. Native GHL actions retain ownership
// of the four non-revenue conversions, preventing two uploaders for a milestone.
export const GOOGLE_PAYMENT_DESTINATION = Object.freeze({
  operatingAccount: { accountType: 'GOOGLE_ADS', accountId: '5717836174' },
  loginAccount: { accountType: 'GOOGLE_ADS', accountId: '5717836174' },
  productDestinationId: '7795206688',
});
const SERVICE_ACCOUNT = 'drm-crm-payment-conversions@dead-river-os.iam.gserviceaccount.com';
const PROVIDER = '//iam.googleapis.com/projects/387905439802/locations/global/workloadIdentityPools/drm-vercel-production/providers/drm-vercel';
const hash = value => createHash('sha256').update(value).digest('hex');
const skip = reason => ({ disposition: 'skipped', reason, conversionSent: false });
export class GooglePaymentError extends Error {
  constructor(code) { super(code); this.name = 'GooglePaymentError'; this.code = code; }
}
const denied = value => value === false || ['denied', 'false', 'no', '0'].includes(String(value ?? '').toLowerCase().trim());

export function readGooglePaymentConfig(env) {
  if (env.ENABLE_GOOGLE_PAYMENT_CONVERSIONS !== 'true') return null;
  if (env.VERCEL_ENV !== 'production' || env.GHL_LOCATION_ID !== attributionFields.locationId ||
      env.GOOGLE_PAYMENT_DESTINATION_VERIFIED !== 'true' || env.GHL_ACTIVITY_UNIQUE_EVENT_ID_VERIFIED !== 'true' ||
      env.GHL_PAYMENT_REVENUE_MAPPING_VERIFIED !== 'true') throw new GooglePaymentError('GOOGLE_PAYMENT_NOT_READY');
  const fieldMap = resolveAttributionFieldMap({ locationId: env.GHL_LOCATION_ID,
    override: env.GHL_ATTRIBUTION_FIELD_IDS, persisted: attributionFields });
  if (!fieldMap) throw new GooglePaymentError('GOOGLE_ATTRIBUTION_MAP_REQUIRED');
  let exponents;
  try { exponents = JSON.parse(env.GHL_PAYMENT_CURRENCY_EXPONENTS || '{}'); }
  catch { throw new GooglePaymentError('GOOGLE_PAYMENT_CONFIG_INVALID'); }
  return { locationId: attributionFields.locationId, fieldMap,
    lifecycle: { locationId: attributionFields.locationId, paymentMappingVerified: true,
      paymentAmountUnit: env.GHL_PAYMENT_AMOUNT_UNIT, paymentCurrencyExponents: exponents } };
}

export async function prepareGooglePayment({ event, contact, reader }, config, { now = Date.now() } = {}) {
  if (event?.historical) return skip('historical');
  if (event?.origin !== 'ghl' || event?.eventType !== 'revenue_received') return skip('not_a_payment');
  if (event.test || /@[^@\s]+\.invalid$/i.test(String(contact?.email || ''))) return skip('test_record');
  if (contact?.id !== event.contactId || contact.locationId !== config.locationId || event.locationId !== config.locationId) {
    throw new GooglePaymentError('GOOGLE_CONTACT_MISMATCH');
  }
  const time = Date.parse(event.occurredAt);
  if (!Number.isFinite(time) || time > now + 60000) throw new GooglePaymentError('GOOGLE_PAYMENT_TIME_INVALID');
  if (time < now - 7 * 86400000) return skip('event_too_old');
  const fields = contactFieldValues(contact), map = config.fieldMap;
  if (denied(fields[map.ad_storage]) || denied(fields[map.ad_user_data])) return skip('consent_denied');
  const adIdentifiers = {};
  for (const key of ['gclid', 'gbraid', 'wbraid']) {
    const value = fields[map[key]];
    if (typeof value === 'string' && /^[A-Za-z0-9_.~-]{1,1000}$/.test(value)) adIdentifiers[key] = value;
  }
  if (!Object.keys(adIdentifiers).length) return skip('no_google_click_identifier');
  const verified = await verifyGhlLifecycle(event, contact, config.lifecycle, reader);
  if (!(verified.revenueValue > 0) || !Number.isFinite(verified.revenueValue) ||
      Date.parse(verified.transaction.createdAt) !== time) throw new GooglePaymentError('GOOGLE_PAYMENT_FACT_MISMATCH');
  // No contact PII, invented consent, device data or estimated opportunity value.
  // The CRM transaction is not assumed to originate from a visitor's browser.
  return { disposition: 'prepared', conversionSent: false, payload: {
    destinations: [GOOGLE_PAYMENT_DESTINATION], events: [{
      transactionId: `ghl_${config.locationId}_${event.transactionId}`,
      eventTimestamp: new Date(time).toISOString(), eventSource: 'OTHER', adIdentifiers,
      conversionValue: verified.revenueValue, currency: verified.currency,
    }], validateOnly: false,
  } };
}

export async function getGooglePaymentAccessToken() {
  // Google verifies issuer, audience and exact production subject in the saved
  // workload provider. No long-lived key or caller-supplied credential is used.
  const client = ExternalAccountClient.fromJSON({
    type: 'external_account', audience: PROVIDER,
    subject_token_type: 'urn:ietf:params:oauth:token-type:jwt',
    token_url: 'https://sts.googleapis.com/v1/token',
    service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${SERVICE_ACCOUNT}:generateAccessToken`,
    subject_token_supplier: { getSubjectToken: () => getVercelOidcToken() },
    scopes: ['https://www.googleapis.com/auth/datamanager'],
  });
  if (!client) throw new GooglePaymentError('GOOGLE_AUTH_CONFIG_INVALID');
  try {
    const { token } = await client.getAccessToken();
    if (!token) throw new Error('missing token');
    return token;
  } catch { throw new GooglePaymentError('GOOGLE_AUTH_FAILED'); }
}

function validateRecord(record, event) {
  const p = record?.properties;
  if (!record?.id || p?.record_kind !== 'activity' || p.source !== 'ghl' || p.historical !== 0 ||
      p.workspace_id !== event.locationId || p.contact_id !== event.contactId ||
      p.event_type !== 'revenue_received' || p.source_event_id !== event.eventId ||
      p.transaction_id !== event.transactionId || Date.parse(p.occurred_at) !== Date.parse(event.occurredAt) ||
      p.revenue_verified !== 1) throw new GooglePaymentError('GOOGLE_DURABLE_PAYMENT_REQUIRED');
}

export function createGooglePaymentDispatcher({ env = process.env, ghl, reader, ledger,
  fetchImpl = fetch, getAccessToken = getGooglePaymentAccessToken, now = Date.now }) {
  return async function dispatch({ event, activityRecord }) {
    const config = readGooglePaymentConfig(env);
    if (!config) return skip('disabled');
    if (event?.historical || event?.test) return skip(event.historical ? 'historical' : 'test_record');
    if (event?.origin !== 'ghl' || event?.eventType !== 'revenue_received') return skip('not_a_payment');
    validateRecord(activityRecord, event);
    const durable = await ledger.get(activityRecord.id);
    validateRecord(durable, event);
    if (durable.properties.event_id !== activityRecord.properties.event_id) throw new GooglePaymentError('GOOGLE_DURABLE_PAYMENT_REQUIRED');
    const contact = await ghl.getContact(event.contactId);
    const prepared = await prepareGooglePayment({ event, contact, reader }, config, { now: now() });
    if (prepared.disposition !== 'prepared') return prepared;
    const conversion = prepared.payload.events[0];
    if (durable.properties.revenue_value !== conversion.conversionValue || durable.properties.currency !== conversion.currency) {
      throw new GooglePaymentError('GOOGLE_DURABLE_REVENUE_MISMATCH');
    }
    const effectKey = `google_payment_${hash(JSON.stringify([GOOGLE_PAYMENT_DESTINATION, conversion.transactionId]))}`;
    if (await ledger.completedEffect(durable, effectKey)) return { disposition: 'already_submitted', conversionSent: false };
    const history = await ledger.list({ contactId: event.contactId, includeReceipts: true });
    if (!Array.isArray(history)) throw new GooglePaymentError('GOOGLE_RECEIPT_HISTORY_INVALID');
    if (history.some(r => r.properties?.record_kind === 'effect_receipt' &&
      r.properties.contact_id === event.contactId && r.properties.event_type === effectKey)) {
      return { disposition: 'already_submitted', conversionSent: false };
    }
    const token = await getAccessToken();
    let response, result;
    try {
      response = await fetchImpl('https://datamanager.googleapis.com/v1/events:ingest', {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000),
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json',
          'x-goog-user-project': 'dead-river-os' }, body: JSON.stringify(prepared.payload),
      });
      result = await response.json();
    } catch { throw new GooglePaymentError('GOOGLE_DELIVERY_UNCERTAIN'); }
    if (!response.ok || result?.error) throw new GooglePaymentError('GOOGLE_DELIVERY_REJECTED');
    if (typeof result.requestId !== 'string' || !/^[A-Za-z0-9_.:-]{1,512}$/.test(result.requestId)) {
      throw new GooglePaymentError('GOOGLE_REQUEST_RECEIPT_MISSING');
    }
    // requestId confirms asynchronous ingestion, NOT attribution or successful
    // processing. Keep it for requestStatus diagnostics. Retries keep the same
    // transaction ID even when receipt storage fails after Google's response.
    await ledger.recordEffectCompletion(durable, effectKey, result.requestId);
    return { disposition: 'submitted', conversionSent: true, processingVerified: false,
      requestId: result.requestId, warningCount: Array.isArray(result.fieldWarnings) ? result.fieldWarnings.length : 0 };
  };
}
