import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import attributionFields from '../src/data/ghl-attribution-fields.json' with { type: 'json' };
import { META_PIXEL_ID, readMetaConversionConfig, prepareMetaConversion, createMetaConversionDispatcher } from '../api/_lib/ad-conversions.js';

// All network/CRM dependencies below are in-memory fakes. No platform events,
// contacts, messages, appointments or revenue are created by this test suite.
const locationId = attributionFields.locationId, map = attributionFields.fields;
const occurredAt = '2026-09-25T10:00:00.000Z', now = Date.parse('2026-09-25T10:01:00.000Z');
const inquiryId = 'drm_inquiry_7dd4ed8e-9207-4381-a0de-624a898f7033';
const cookieTime = Date.parse('2026-09-25T09:00:00.000Z');
const fbc = `fb.1.${cookieTime}.synthetic_click`, fbp = `fb.1.${cookieTime}.123456789`;
const sha = (value) => createHash('sha256').update(value).digest('hex');
const eventFor = (eventType = 'inquiry_saved', overrides = {}) => ({
  eventType, eventId: eventType === 'inquiry_saved' ? inquiryId : `original_${eventType}_001`,
  origin: 'ghl', locationId, contactId: 'contact_001', occurredAt, historical: false,
  ...(eventType === 'appointment_confirmed' ? { appointmentId: 'appointment_001', calendarId: 'calendar_001' } : {}),
  ...(['qualified_opportunity', 'customer_closed'].includes(eventType) ? {
    opportunityId: 'opportunity_001', pipelineId: 'pipeline_001', pipelineStageId: eventType === 'customer_closed' ? 'stage_won_001' : 'stage_qualified_001',
  } : {}),
  ...(eventType === 'revenue_received' ? { transactionId: 'transaction_001' } : {}), ...overrides,
});
const envFor = (overrides = {}) => ({
  ENABLE_META_CAPI: 'true', VERCEL_ENV: 'production', GHL_LOCATION_ID: locationId,
  META_CAPI_ACCESS_TOKEN: 'unit-test-token-never-real', META_GRAPH_API_VERSION: 'v25.0',
  META_CAPI_EVENT_MAPPING_VERIFIED: 'true', META_CAPI_BROWSER_DEDUP_VERIFIED: 'true',
  GHL_ACTIVITY_UNIQUE_EVENT_ID_VERIFIED: 'true',
  GHL_LIFECYCLE_CALENDAR_IDS: '["calendar_001"]',
  GHL_LIFECYCLE_STAGE_MAP: '{"pipeline_001":{"qualifiedStageIds":["stage_qualified_001"],"wonStageIds":["stage_won_001"]}}',
  GHL_PAYMENT_REVENUE_MAPPING_VERIFIED: 'true', GHL_PAYMENT_AMOUNT_UNIT: 'major',
  GHL_PAYMENT_CURRENCY_EXPONENTS: '{"USD":2}', ...overrides,
});
const fieldsFor = (values) => Object.entries(values).map(([key, value]) => ({ id: map[key] || key, value }));
const contactFor = (values = {}) => ({
  id: 'contact_001', locationId, source: 'Facebook Ads', email: ' Owner@Example.com ', phone: '+1 (555) 555-0101',
  tags: ['existing-tag', 'demandflow-home-services'], dnd: false,
  customFields: fieldsFor({ fbc, fbp, ad_storage: 'unknown', ad_user_data: 'unknown',
    last_inquiry_event_id: inquiryId, last_inquiry_at: occurredAt, ...values }),
});
const recordFor = (event) => ({ id: `activity_${sha(event.eventId).slice(0, 16)}`, properties: {
  record_kind: 'activity', event_id: `stored_${event.eventId}`, source: event.origin,
  workspace_id: event.locationId, contact_id: event.contactId, event_type: event.eventType,
  source_event_id: event.eventId, occurred_at: event.occurredAt, historical: event.historical ? 1 : 0,
  appointment_id: event.appointmentId, opportunity_id: event.opportunityId, transaction_id: event.transactionId,
  ...(event.eventType === 'revenue_received' ? { revenue_verified: 1, revenue_value: 123.45, currency: 'USD' } : {}),
} });
function harness({ env = envFor(), event = eventFor(), contact = contactFor() } = {}) {
  const calls = [], sent = [], receipts = new Map();
  const state = {
    contact, event, env, calls, sent, receipts,
    appointment: { id: 'appointment_001', contactId: 'contact_001', locationId, calendarId: 'calendar_001', appointmentStatus: 'confirmed' },
    opportunity: { id: 'opportunity_001', contactId: 'contact_001', locationId, pipelineId: 'pipeline_001',
      pipelineStageId: event.pipelineStageId || 'stage_qualified_001', status: event.eventType === 'customer_closed' ? 'won' : 'open', monetaryValue: 999999 },
    transaction: { _id: 'transaction_001', contactId: 'contact_001', altId: locationId, altType: 'location',
      status: 'succeeded', liveMode: true, markAsTest: false, amount: 123.45, amountRefunded: 0, currency: 'USD' },
    response: { events_received: 1, messages: [], fbtrace_id: 'synthetic_trace_001' },
    responseOk: true, responseStatus: 200,
  };
  const reader = {
    async getAppointment() { calls.push('getAppointment'); return structuredClone(state.appointment); },
    async getOpportunity() { calls.push('getOpportunity'); return structuredClone(state.opportunity); },
    async getTransaction() { calls.push('getTransaction'); return structuredClone(state.transaction); },
  };
  const ledger = {
    async get() { calls.push('getActivity'); return state.missingActivity ? null : state.durableRecord || recordFor(state.event); },
    async list({ contactId, includeReceipts }) {
      calls.push('listActivity'); assert.equal(includeReceipts, true);
      return [...receipts.values()].filter(record => record.properties.contact_id === contactId);
    },
    async completedEffect(record, key) { calls.push('completedEffect'); return receipts.get(`${record.id}:${key}`); },
    async recordEffectCompletion(record, key, reference) {
      calls.push('recordEffectCompletion');
      if (state.receiptFails) throw new Error('Mock receipt persistence failure');
      receipts.set(`${record.id}:${key}`, { id: `receipt_${receipts.size + 1}`, properties: {
        record_kind: 'effect_receipt', event_type: key, contact_id: record.properties.contact_id,
        parent_event_id: record.properties.event_id, effect_reference: reference,
      } });
    },
  };
  const dispatch = createMetaConversionDispatcher({ env, reader, ledger, now: () => now,
    ghl: { async getContact() { calls.push('getContact'); return structuredClone(state.contact); } },
    fetchImpl: async (url, options) => {
      calls.push('metaPost'); sent.push({ url, options, body: JSON.parse(options.body) });
      if (state.networkFails) throw new Error('Mock network timeout');
      return { ok: state.responseOk, status: state.responseStatus, async json() {
        if (state.jsonFails) throw new Error('Mock malformed JSON');
        return state.response;
      } };
    },
  });
  return { ...state, state, reader, ledger,
    send: (overrides = {}) => dispatch({ event: state.event, activityRecord: recordFor(state.event), ...overrides }),
    prepare: (overrides = {}, options = {}) => prepareMetaConversion({ event: state.event, contact: state.contact, reader, ...overrides }, readMetaConversionConfig(env), { now, ...options }),
  };
}

test('Meta adapter is disabled by default and never reads CRM or calls the network', async () => {
  assert.equal(readMetaConversionConfig({}), null);
  const h = harness({ env: {} });
  assert.deepEqual(await h.send(), { disposition: 'skipped', reason: 'disabled', conversionSent: false });
  assert.deepEqual(h.calls, []);
});

test('enabled delivery requires the correct location/pixel, version, token and reviewed mappings', () => {
  for (const override of [
    { VERCEL_ENV: 'preview' }, { GHL_LOCATION_ID: 'other_location' }, { META_PIXEL_ID: '123456789' },
    { META_CAPI_ACCESS_TOKEN: '' }, { META_GRAPH_API_VERSION: '' }, { META_GRAPH_API_VERSION: 'v25.0/other' },
    { META_CAPI_EVENT_MAPPING_VERIFIED: 'false' }, { META_CAPI_BROWSER_DEDUP_VERIFIED: 'false' },
    { GHL_ACTIVITY_UNIQUE_EVENT_ID_VERIFIED: 'false' }, { GHL_ANALYTICS_STORAGE_FIELD_ID: 'bad' },
  ]) assert.throws(() => readMetaConversionConfig(envFor(override)), /META_/);
  const config = readMetaConversionConfig(envFor());
  assert.equal(config.pixelId, META_PIXEL_ID);
  assert.equal(config.fieldMap.last_inquiry_event_id, map.last_inquiry_event_id);
});

test('confirmed inquiry uses the CRM receipt ID/time and stored Meta IDs without hashed PII for unknown consent', async () => {
  const h = harness(); const result = await h.send();
  assert.equal(result.conversionSent, true);
  const request = h.sent[0], event = request.body.data[0];
  assert.equal(request.url, `https://graph.facebook.com/v25.0/${META_PIXEL_ID}/events`);
  assert.equal(request.options.method, 'POST'); assert.equal(request.options.redirect, 'error');
  assert.equal(request.url.includes('unit-test-token'), false);
  assert.deepEqual(event, { event_name: 'Lead', event_time: Date.parse(occurredAt) / 1000,
    event_id: inquiryId, action_source: 'system_generated', user_data: { fbc, fbp } });
  assert.equal(request.body.test_event_code, undefined);
  assert.equal(h.receipts.size, 1);
  assert.equal(JSON.stringify(result).includes('Owner'), false);
});

test('missing receipt, wrong inquiry identity or missing campaign tag cannot produce a Lead', async () => {
  for (const contact of [contactFor({ last_inquiry_event_id: '' }), contactFor({ last_inquiry_event_id: `${inquiryId}other` }),
    contactFor({ last_inquiry_at: '2026-09-25T09:59:00Z' }), { ...contactFor(), tags: ['existing-tag'] }]) {
    const h = harness({ contact }); await assert.rejects(h.send(), /META_INQUIRY_RECEIPT_UNVERIFIED/);
    assert.equal(h.sent.length, 0); assert.equal(h.receipts.size, 0);
  }
});

test('historical records, Instantly activities, page views and unmapped stages never become ad conversions', async () => {
  for (const event of [eventFor('inquiry_saved', { historical: true }), eventFor('inquiry_saved', { origin: 'instantly' }),
    eventFor('email_sent'), eventFor('reply_received'), eventFor('lead_interested'), eventFor('booking_page_view'),
    eventFor('watch_page_view'), eventFor('appointment_attended'), eventFor('lead_unsubscribed')]) {
    const h = harness({ event }); assert.equal((await h.send()).conversionSent, false);
    assert.deepEqual(h.calls, []);
  }
});

test('stored denials and explicit analytics/GPC denials suppress all delivery without a new grant overriding them', async () => {
  for (const value of ['denied', ' DENIED ', false, 'false', 'no', '0']) {
    for (const key of ['ad_storage', 'ad_user_data']) {
      const h = harness({ contact: contactFor({ [key]: value }) });
      assert.equal((await h.send({ consentContext: { ad_user_data: 'granted' } })).reason, 'consent_denied');
      assert.equal(h.sent.length, 0);
    }
  }
  for (const consentContext of [{ analytics_allowed: false }, { globalPrivacyControl: true }, { analytics_storage: 'denied' }]) {
    const h = harness(); assert.equal((await h.send({ consentContext })).reason, 'consent_denied');
  }
  const h = harness({ env: envFor({ GHL_ANALYTICS_STORAGE_FIELD_ID: 'analytics_field_001' }),
    contact: contactFor({ analytics_field_001: 'denied' }) });
  assert.equal((await h.send()).reason, 'consent_denied');
});

test('only an explicit stored advertising-user-data grant permits normalized SHA-256 email/phone/external ID', async () => {
  const h = harness({ contact: contactFor({ ad_user_data: 'granted' }) }); await h.send();
  const data = h.sent[0].body.data[0].user_data;
  assert.deepEqual(data.em, [sha('owner@example.com')]); assert.deepEqual(data.ph, [sha('15555550101')]);
  assert.deepEqual(data.external_id, [sha(`${locationId}:contact_001`)]);
  assert.equal(data.fbc, fbc); assert.equal(data.fbp, fbp);
  assert.equal(JSON.stringify(h.sent[0].body).includes('Owner@Example.com'), false);
  const noCountry = harness({ contact: { ...contactFor({ ad_user_data: 'granted' }), phone: '(555) 555-0101' } });
  await noCountry.send(); assert.equal(noCountry.sent[0].body.data[0].user_data.ph, undefined);
  const unknown = harness({ contact: contactFor({ ad_user_data: '', fbc: '', fbp: '' }) });
  assert.equal((await unknown.send()).reason, 'no_consented_matching_identifiers');
  assert.equal(unknown.sent.length, 0);
});

test('malformed/missing cookies are not fabricated from FBCLID or a contact ID', async () => {
  const h = harness({ contact: contactFor({ fbc: 'not-a-cookie', fbp: `fb.1.${now + 600000}.123`, fbclid: 'real-looking-click' }) });
  assert.equal((await h.send()).reason, 'no_consented_matching_identifiers'); assert.equal(h.sent.length, 0);
});

test('direct website mode requires original browser context and strips query values from source URL', async () => {
  const h = harness(); const websiteContext = { verifiedOriginalRequest: true,
    eventSourceUrl: 'https://www.deadrivermanagement.com/demandflow?email=private@example.com#form', clientUserAgent: 'Synthetic browser UA' };
  const result = await h.prepare({ websiteContext });
  assert.equal(result.payload.action_source, 'website');
  assert.equal(result.payload.event_source_url, 'https://www.deadrivermanagement.com/demandflow');
  assert.equal(result.payload.user_data.client_user_agent, 'Synthetic browser UA');
  for (const bad of [{ ...websiteContext, verifiedOriginalRequest: false }, { ...websiteContext, clientUserAgent: '' },
    { ...websiteContext, eventSourceUrl: 'https://malicious.example/' }, { ...websiteContext, clientUserAgent: 'UA\r\nforged' }]) {
    await assert.rejects(h.prepare({ websiteContext: bad }), /META_ORIGINAL_WEBSITE_CONTEXT_REQUIRED/);
  }
});

test('Schedule requires the real mapped confirmed appointment, never a page visit', async () => {
  const h = harness({ event: eventFor('appointment_confirmed') }); await h.send();
  assert.equal(h.sent[0].body.data[0].event_name, 'Schedule'); assert.ok(h.calls.includes('getAppointment'));
  for (const patch of [{ appointmentStatus: 'new' }, { appointmentStatus: 'cancelled' }, { contactId: 'different_contact' }, { calendarId: 'different_calendar' }]) {
    const bad = harness({ event: eventFor('appointment_confirmed') }); Object.assign(bad.state.appointment, patch);
    await assert.rejects(bad.send(), /LIFECYCLE_/); assert.equal(bad.sent.length, 0);
  }
});

test('qualified/customer custom events verify mapped stages and actual won status without estimated revenue', async () => {
  for (const [type, name] of [['qualified_opportunity', 'QualifiedLead'], ['customer_closed', 'ConvertedLead']]) {
    const h = harness({ event: eventFor(type) }); await h.send();
    const sent = h.sent[0].body.data[0]; assert.equal(sent.event_name, name); assert.equal(sent.custom_data, undefined);
    const bad = harness({ event: eventFor(type) }); bad.state.opportunity.pipelineStageId = 'unmapped_stage';
    await assert.rejects(bad.send(), /LIFECYCLE_OPPORTUNITY_STATUS_UNVERIFIED/); assert.equal(bad.sent.length, 0);
  }
  const open = harness({ event: eventFor('customer_closed') }); open.state.opportunity.status = 'open';
  await assert.rejects(open.send(), /LIFECYCLE_OPPORTUNITY_STATUS_UNVERIFIED/);
});

test('Purchase uses verified live payment amount/currency, with explicit minor-unit conversion', async () => {
  const h = harness({ event: eventFor('revenue_received') }); await h.send();
  assert.deepEqual(h.sent[0].body.data[0].custom_data, { value: 123.45, currency: 'USD', order_id: 'transaction_001' });
  const minor = harness({ event: eventFor('revenue_received'), env: envFor({ GHL_PAYMENT_AMOUNT_UNIT: 'minor' }) });
  minor.state.transaction.amount = 12345; await minor.send();
  assert.equal(minor.sent[0].body.data[0].custom_data.value, 123.45);
  for (const patch of [{ status: 'pending' }, { liveMode: false }, { markAsTest: true }, { amountRefunded: 1 },
    { amount: 0 }, { amount: -1 }, { contactId: 'different_contact' }, { currency: '' }]) {
    const bad = harness({ event: eventFor('revenue_received') }); Object.assign(bad.state.transaction, patch);
    await assert.rejects(bad.send(), /LIFECYCLE_|META_POSITIVE/); assert.equal(bad.sent.length, 0);
  }
});

test('Purchase must agree with the authoritative immutable ledger amount and currency', async () => {
  for (const patch of [{ revenue_verified: 0 }, { revenue_value: 999 }, { revenue_value: undefined }, { currency: 'EUR' }]) {
    const h = harness({ event: eventFor('revenue_received') });
    h.state.durableRecord = recordFor(h.state.event);
    Object.assign(h.state.durableRecord.properties, patch);
    await assert.rejects(h.send(), /META_DURABLE_REVENUE_MISMATCH/);
    assert.equal(h.sent.length, 0); assert.equal(h.receipts.size, 0);
  }
});

test('paid conversion identity uses the transaction even if unrelated CRM entity metadata is supplied', async () => {
  const h = harness({ event: eventFor('revenue_received', { appointmentId: 'appointment_001', opportunityId: 'opportunity_001' }) });
  const first = await h.prepare();
  h.state.event.transactionId = 'transaction_002'; h.state.transaction._id = 'transaction_002';
  const second = await h.prepare();
  assert.notEqual(second.payload.event_id, first.payload.event_id);
  assert.equal(second.payload.custom_data.order_id, 'transaction_002');
});

test('past history and future timestamps cannot be refreshed to manufacture a new event', async () => {
  const old = harness({ event: eventFor('appointment_confirmed', { occurredAt: '2026-09-01T00:00:00Z' }) });
  assert.equal((await old.send()).reason, 'event_too_old'); assert.equal(old.sent.length, 0);
  const future = harness({ event: eventFor('appointment_confirmed', { occurredAt: '2026-09-26T00:00:00Z' }) });
  await assert.rejects(future.send(), /META_EVENT_TIME_INVALID/); assert.equal(future.sent.length, 0);
});

test('a durable activity bound to the same contact and fact is required before sending', async () => {
  const h = harness({ event: eventFor('appointment_confirmed') });
  await assert.rejects(h.send({ activityRecord: null }), /META_DURABLE_ACTIVITY_REQUIRED/);
  for (const patch of [{ source: 'instantly' }, { contact_id: 'wrong_contact' }, { source_event_id: 'wrong_event' }, { historical: 1 }]) {
    const activityRecord = recordFor(h.state.event); Object.assign(activityRecord.properties, patch);
    await assert.rejects(h.send({ activityRecord }), /META_DURABLE_ACTIVITY_REQUIRED/);
  }
  const activityRecord = recordFor(h.state.event); activityRecord.properties.appointment_id = 'other_appointment';
  await assert.rejects(h.send({ activityRecord }), /META_ACTIVITY_IDENTITY_MISMATCH/); assert.equal(h.sent.length, 0);
  h.state.missingActivity = true;
  await assert.rejects(h.send(), /META_DURABLE_ACTIVITY_REQUIRED/); assert.equal(h.sent.length, 0);
});

test('repeat delivery is skipped after receipt and repeated milestone IDs stay stable across webhook IDs', async () => {
  const h = harness({ event: eventFor('appointment_confirmed') });
  await h.send(); assert.equal((await h.send()).disposition, 'already_received'); assert.equal(h.sent.length, 1);
  const first = await h.prepare();
  h.state.event.eventId = 'different_webhook_delivery_001';
  assert.equal((await h.prepare()).payload.event_id, first.payload.event_id);
});

test('another durable GHL activity for an already accepted milestone reuses the cross-row acceptance receipt', async () => {
  const h = harness({ event: eventFor('appointment_confirmed') });
  await h.send(); const originalRecordId = recordFor(h.state.event).id;
  h.state.event.eventId = 'different_webhook_delivery_001';
  assert.notEqual(recordFor(h.state.event).id, originalRecordId);
  const result = await h.send();
  assert.equal(result.disposition, 'already_received');
  assert.equal(h.sent.length, 1); assert.equal(h.receipts.size, 1);
});

test('receipt lookup does not suppress another appointment for the same contact', async () => {
  const h = harness({ event: eventFor('appointment_confirmed') });
  await h.send();
  h.state.event = eventFor('appointment_confirmed', { eventId: 'second_appointment_event', appointmentId: 'appointment_002' });
  h.state.appointment.id = 'appointment_002';
  assert.equal((await h.send()).disposition, 'received');
  assert.equal(h.sent.length, 2); assert.equal(h.receipts.size, 2);
  assert.notEqual(h.sent[0].body.data[0].event_id, h.sent[1].body.data[0].event_id);
});

test('test mode needs a test code and labeled reserved-domain DND contact; live never uses test_event_code', async () => {
  const synthetic = { ...contactFor(), email: 'drm-meta-test@example.invalid', dnd: true };
  const h = harness({ contact: synthetic, env: envFor({ META_CAPI_TEST_EVENT_CODE: 'TEST_SYNTHETIC_001' }) });
  assert.equal((await h.send()).reason, 'test_record'); assert.equal(h.sent.length, 0);
  assert.equal((await h.send({ mode: 'test' })).test, true);
  assert.equal(h.sent[0].body.test_event_code, 'TEST_SYNTHETIC_001');
  await assert.rejects(harness({ contact: synthetic }).send({ mode: 'test' }), /META_TEST_EVENT_CODE_REQUIRED/);
  const real = harness({ env: envFor({ META_CAPI_TEST_EVENT_CODE: 'TEST_SYNTHETIC_001' }) });
  await assert.rejects(real.send({ mode: 'test' }), /META_TEST_CONTACT_REQUIRED/);
  await real.send(); assert.equal(real.sent[0].body.test_event_code, undefined);
});

test('HTTP success alone is not acceptance; rejected, malformed and zero-receipt responses do not record success', async () => {
  for (const result of [{ events_received: 0, messages: [], fbtrace_id: 'trace' }, { error: { message: 'private upstream body' } },
    { events_received: 1 }, { events_received: 2, messages: [], fbtrace_id: 'trace' }]) {
    const h = harness(); h.state.response = result;
    await assert.rejects(h.send(), /META_DELIVERY_REJECTED|META_RECEIPT_UNVERIFIED/); assert.equal(h.receipts.size, 0);
  }
  const json = harness(); json.state.jsonFails = true; await assert.rejects(json.send(), /META_INVALID_RESPONSE/);
  const http = harness(); http.state.responseOk = false; http.state.responseStatus = 403;
  await assert.rejects(http.send(), /META_DELIVERY_REJECTED/); assert.equal(http.receipts.size, 0);
});

test('uncertain network or local receipt failures retry the original platform ID without hidden automatic retries', async () => {
  for (const failure of ['networkFails', 'receiptFails']) {
    const h = harness(); h.state[failure] = true;
    await assert.rejects(h.send()); assert.equal(h.sent.length, 1); assert.equal(h.receipts.size, 0);
    const original = h.sent[0].body.data[0]; h.state[failure] = false;
    await h.send(); assert.deepEqual(h.sent[1].body.data[0], original); assert.equal(h.receipts.size, 1);
  }
});
