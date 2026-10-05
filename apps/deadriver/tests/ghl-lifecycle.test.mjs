import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeGhlLifecycle, readLifecycleConfig, verifyGhlLifecycle, createGhlLifecycleReader, lifecycleProjection, processGhlLifecycle } from '../api/_lib/ghl-lifecycle.js';
import { createGhlLifecycleWebhookHandler } from '../api/ghl-lifecycle-webhook.js';
import { ACTIVITY_SCHEMA_KEY, activityProperties, deriveActivityMetrics } from '../api/_lib/ghl-activity.js';
import { OUTREACH_CONTACT_FIELDS } from '../api/_lib/outreach-sync.js';
import { REAL_ESTATE_LOCATION, REAL_ESTATE_CALENDAR, REAL_ESTATE_PIPELINE, REAL_ESTATE_WON_STAGE } from '../api/_lib/real-estate-config.js';

const fieldMap = Object.fromEntries(OUTREACH_CONTACT_FIELDS.map((f) => [f.key, `testfield_${f.key}`]));
const payload = (overrides = {}) => ({
  eventId: 'ghl-event-original-1', eventType: 'appointment_confirmed', origin: 'ghl',
  locationId: 'location_1', contactId: 'contact_1', occurredAt: '2026-01-01T12:00:00Z',
  appointmentId: 'appointment_1', calendarId: 'calendar_1', ...overrides,
});
const config = (overrides = {}) => ({
  token: 'test-token', locationId: 'location_1', schemaKey: ACTIVITY_SCHEMA_KEY,
  associationId: 'association_1', fieldMap, calendarIds: ['calendar_1'],
  pipelineStages: { pipeline_1: { qualifiedStageIds: ['stage_qualified'], wonStageIds: ['stage_won'] } },
  instantlyApiKey: 'test-instantly-key', paymentMappingVerified: true, paymentAmountUnit: 'major',
  paymentCurrencyExponents: { USD: 2 }, ...overrides,
});
const env = (overrides = {}) => ({
  VERCEL_ENV: 'production', ENABLE_GHL_LIFECYCLE_SYNC: 'true',
  DRM_GHL_LIFECYCLE_WEBHOOK_SECRET: 'test-lifecycle-secret-only-123456789012345',
  GHL_OUTREACH_PIT: 'test-token', GHL_LOCATION_ID: 'location_1', GHL_ACTIVITY_ASSOCIATION_ID: 'association_1',
  GHL_OUTREACH_FIELD_IDS: JSON.stringify(fieldMap), INSTANTLY_API_KEY: 'test-instantly-key',
  GHL_ACTIVITY_UNIQUE_EVENT_ID_VERIFIED: 'true', GHL_LIFECYCLE_PAYLOAD_MAPPING_VERIFIED: 'true',
  GHL_OUTREACH_AUTOMATIONS_REVIEWED: 'true', GHL_LIFECYCLE_CALENDAR_IDS: '["calendar_1"]',
  GHL_LIFECYCLE_STAGE_MAP: JSON.stringify(config().pipelineStages),
  GHL_PAYMENT_REVENUE_MAPPING_VERIFIED: 'true', GHL_PAYMENT_AMOUNT_UNIT: 'major', ...overrides,
});
test('real estate lifecycle mappings are isolated to the verified account and preserve existing calendars', () => {
  const mapped = readLifecycleConfig(env({ GHL_LOCATION_ID: REAL_ESTATE_LOCATION }));
  assert.deepEqual(mapped.calendarIds, ['calendar_1', REAL_ESTATE_CALENDAR]);
  assert.deepEqual(mapped.pipelineStages[REAL_ESTATE_PIPELINE].wonStageIds, [REAL_ESTATE_WON_STAGE]);
  assert.deepEqual(mapped.pipelineStages.pipeline_1, config().pipelineStages.pipeline_1);
  assert.equal(readLifecycleConfig(env()).calendarIds.includes(REAL_ESTATE_CALENDAR), false);
});

function dependencies({ withInstantly = true } = {}) {
  const contact = { id: 'contact_1', locationId: 'location_1', email: 'drm-test@example.invalid', source: 'Facebook Ads', tags: ['existing-tag'],
    customFields: [{ id: fieldMap.original_source, value: 'Facebook Ads' }],
  };
  const records = withInstantly ? [{ id: 'record_old', properties: activityProperties({
    eventId: 'sent-original', source: 'instantly', workspaceId: 'workspace_1', eventType: 'email_sent',
    contactId: 'contact_1', campaignId: 'campaign_original', campaignName: 'Original Instantly campaign',
    leadEmail: contact.email, occurredAt: '2025-12-01T00:00:00Z', historical: true,
  }) }] : [];
  const calls = []; const receipts = [];
  const state = { contact, records, calls, receipts,
    appointment: { id: 'appointment_1', calendarId: 'calendar_1', contactId: 'contact_1', locationId: 'location_1', appointmentStatus: 'confirmed' },
    opportunity: { id: 'opportunity_1', locationId: 'location_1', contactId: 'contact_1', pipelineId: 'pipeline_1', pipelineStageId: 'stage_qualified', status: 'open', monetaryValue: 99999 },
    transaction: { _id: 'transaction_1', altId: 'location_1', altType: 'location', contactId: 'contact_1', amount: 100.25, currency: 'USD', status: 'succeeded', liveMode: true, markAsTest: false, amountRefunded: 0 },
    stopResult: { sequenceStopVerified: true, suppression: { blocklistId: 'blocklist_1', verified: true }, verification: 'workspace_blocklist_readback' },
  };
  const api = {
    ghl: {
      async getContact(contactId) { calls.push(['getContact', contactId]); return structuredClone(state.contact); },
      async updateProjection(current, projection) {
        calls.push(['updateProjection', current.id, projection]);
        const existing = new Map(state.contact.customFields.map((f) => [f.id, f.value]));
        for (const field of projection.fields) existing.set(field.id, field.fieldValue);
        state.contact.customFields = [...existing].map(([id, value]) => ({ id, value }));
        assert.equal(projection.source, undefined, 'Lifecycle must not overwrite source');
        return structuredClone(state.contact);
      },
      async addTags(contactId, tags) { calls.push(['addTags', contactId, tags]); state.contact.tags = [...new Set([...state.contact.tags, ...tags])]; },
    },
    reader: {
      async getAppointment(value) { calls.push(['getAppointment', value]); return structuredClone(state.appointment); },
      async getOpportunity(value) { calls.push(['getOpportunity', value]); return structuredClone(state.opportunity); },
      async getTransaction(value) { calls.push(['getTransaction', value]); return structuredClone(state.transaction); },
    },
    ledger: {
      async list({ contactId }) { calls.push(['list', contactId]); return records.filter((r) => r.properties.contact_id === contactId); },
      async append(event) {
        calls.push(['append', event]); const p = activityProperties(event);
        const existing = records.find((r) => r.properties.event_id === p.event_id);
        const record = existing || { id: `record_${records.length + 1}`, properties: p };
        if (!existing) records.push(record);
        return { record, created: !existing, historical: record.properties.historical === 1 };
      },
      async recordEffectCompletion(record, effectKey, externalReference) { calls.push(['receipt', record.id, effectKey]); receipts.push({ record, effectKey, externalReference }); },
    },
    async reverseSync(options) { calls.push(['reverseSync', options]); return state.stopResult; },
  };
  return { ...api, state };
}
function resMock() {
  return { statusCode: null, body: null, headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
}
async function invoke({ overrides = {}, body = { schemaVersion: 1, mode: 'live', payload: payload() }, method = 'POST', authorization, deps = dependencies() } = {}) {
  const settings = env(overrides); let factories = 0;
  const handler = createGhlLifecycleWebhookHandler({ env: settings, dependenciesFactory() { factories++; return deps; } });
  const response = resMock();
  await handler({ method, body, headers: { authorization: authorization ?? `Bearer ${settings.DRM_GHL_LIFECYCLE_WEBHOOK_SECRET}` } }, response);
  return { response, factories, deps };
}

test('normalization requires an explicit supported milestone and stable source identity', () => {
  assert.equal(normalizeGhlLifecycle(payload()).occurredAt, '2026-01-01T12:00:00.000Z');
  for (const change of [{ eventType: 'page_view' }, { eventType: 'watch_video' }, { origin: '' }, { eventId: '' }, { appointmentId: '' }, { calendarId: '' }]) {
    assert.throws(() => normalizeGhlLifecycle(payload(change)), TypeError);
  }
  assert.throws(() => normalizeGhlLifecycle(payload({ occurredAt: '2030-01-01T00:00:00Z' }), { now: Date.parse('2026-01-01T00:00:00Z') }), /Future/);
});

test('configuration requires actual mappings, production and reviewed automation gates', () => {
  assert.equal(readLifecycleConfig(env()).locationId, 'location_1');
  for (const change of [{ VERCEL_ENV: 'preview' }, { ENABLE_GHL_LIFECYCLE_SYNC: 'false' }, { GHL_ACTIVITY_UNIQUE_EVENT_ID_VERIFIED: 'false' }, { GHL_LIFECYCLE_PAYLOAD_MAPPING_VERIFIED: 'false' }, { GHL_LIFECYCLE_CALENDAR_IDS: '[]' }, { GHL_LIFECYCLE_STAGE_MAP: '{}' }]) {
    assert.throws(() => readLifecycleConfig(env(change)));
  }
  assert.throws(() => readLifecycleConfig(env(), { historical: true }), { code: 'LIFECYCLE_HISTORY_NOT_ENABLED' });
});

test('paid-ad campaign survives into appointment history without reclassifying contact or inventing campaign ID', async () => {
  const deps = dependencies({ withInstantly: false });
  deps.state.contact.customFields.push({ id: 'first_campaign', value: 'Facebook DemandFlow Original' },
    { id: 'latest_campaign', value: 'Later Campaign' });
  const settings = config({ attributionFieldMap: { first_utm_campaign: 'first_campaign', latest_utm_campaign: 'latest_campaign' } });
  await processGhlLifecycle(normalizeGhlLifecycle(payload()), settings, { ...deps, reverseSync: undefined });
  const saved = deps.state.records.at(-1).properties;
  assert.equal(saved.campaign_name, 'Facebook DemandFlow Original');
  assert.equal(saved.campaign_id, '');
  assert.equal(deps.state.contact.source, 'Facebook Ads');
  deps.state.contact.customFields.find(f => f.id === 'first_campaign').value = 'Changed after original event';
  await processGhlLifecycle(normalizeGhlLifecycle(payload()), settings, { ...deps, reverseSync: undefined });
  assert.equal(deps.state.records.length, 1);
  assert.equal(deps.state.records[0].properties.campaign_name, 'Facebook DemandFlow Original');
});

test('authentication and method errors perform no integration calls', async () => {
  const unauthorized = await invoke({ authorization: 'Bearer wrong-secret' });
  assert.equal(unauthorized.response.statusCode, 401); assert.equal(unauthorized.factories, 0);
  const wrongMethod = await invoke({ method: 'GET' });
  assert.equal(wrongMethod.response.statusCode, 405); assert.equal(wrongMethod.response.headers.Allow, 'POST'); assert.equal(wrongMethod.factories, 0);
  const missing = await invoke({ overrides: { DRM_GHL_LIFECYCLE_WEBHOOK_SECRET: '' } });
  assert.equal(missing.response.statusCode, 503); assert.equal(missing.factories, 0);
});

test('validation-only test records have zero network calls, facts or conversions', async () => {
  const result = await invoke({ body: { schemaVersion: 1, mode: 'validate', test: true, payload: payload() } });
  assert.equal(result.response.statusCode, 200); assert.equal(result.factories, 0);
  assert.deepEqual(result.response.body, { ok: true, test: true, dryRun: true, eventType: 'appointment_confirmed', mutations: 0, conversions: 0 });
  const missingFlag = await invoke({ body: { schemaVersion: 1, mode: 'validate', payload: payload() } });
  assert.equal(missingFlag.response.statusCode, 400);
});

test('raw provider payloads and oversized envelopes are rejected instead of guessed', async () => {
  assert.equal((await invoke({ body: { type: 'AppointmentCreate', contactId: 'contact_1' } })).response.statusCode, 400);
  assert.equal((await invoke({ body: 'x'.repeat(65537) })).response.statusCode, 400);
  assert.equal((await invoke({ body: { schemaVersion: 2, mode: 'live', payload: payload() } })).response.statusCode, 400);
});

test('a confirmed appointment is verified, recorded, synchronized and suppressed without advertising sends', async () => {
  const deps = dependencies(); const result = await processGhlLifecycle(normalizeGhlLifecycle(payload()), config(), deps);
  assert.equal(result.sequenceStopVerified, true); assert.equal(result.conversionSent, false);
  assert.equal(result.advertisingOwner, 'configured_native_ghl_workflows');
  const reverse = deps.state.calls.find(([method]) => method === 'reverseSync')[1];
  assert.deepEqual(reverse, { email: 'drm-test@example.invalid', lifecycle: 'appointment_booked', origin: 'ghl', historical: false });
  const saved = deps.state.records.at(-1).properties;
  assert.equal(saved.campaign_id, 'campaign_original'); assert.equal(saved.campaign_name, 'Original Instantly campaign');
  assert.equal(deps.state.contact.source, 'Facebook Ads');
  assert.ok(deps.state.contact.tags.includes('existing-tag'));
  assert.ok(deps.state.contact.tags.includes('drm-exclude-cold-sms'));
  assert.equal(deps.state.contact.customFields.find((f) => f.id === fieldMap.original_source).value, 'Facebook Ads');
  assert.equal(deps.state.contact.customFields.find((f) => f.id === fieldMap.sync_origin).value, 'ghl');
});

test('booking page intent, pending or cancelled appointments do not record confirmed appointments', async () => {
  for (const status of ['new', 'cancelled', 'invalid', 'noshow']) {
    const deps = dependencies(); deps.state.appointment.appointmentStatus = status;
    await assert.rejects(processGhlLifecycle(normalizeGhlLifecycle(payload()), config(), deps), { code: 'LIFECYCLE_APPOINTMENT_STATUS_UNVERIFIED' });
    assert.equal(deps.state.calls.some(([method]) => ['append', 'reverseSync'].includes(method)), false);
  }
});

test('wrong calendar, contact, location and unmapped stage cannot create milestones', async () => {
  const deps = dependencies();
  await assert.rejects(processGhlLifecycle(normalizeGhlLifecycle(payload({ locationId: 'wrong_location' })), config(), deps), { code: 'LIFECYCLE_WRONG_LOCATION' });
  await assert.rejects(processGhlLifecycle(normalizeGhlLifecycle(payload({ calendarId: 'wrong_calendar' })), config(), deps), { code: 'LIFECYCLE_CALENDAR_NOT_MAPPED' });
  deps.state.appointment.contactId = 'wrong_contact';
  await assert.rejects(processGhlLifecycle(normalizeGhlLifecycle(payload()), config(), deps), { code: 'LIFECYCLE_APPOINTMENT_MISMATCH' });
  const qualified = normalizeGhlLifecycle(payload({ eventType: 'qualified_opportunity', opportunityId: 'opportunity_1', pipelineId: 'pipeline_1', pipelineStageId: 'unmapped_stage' }));
  await assert.rejects(processGhlLifecycle(qualified, config(), deps), { code: 'LIFECYCLE_STAGE_NOT_MAPPED' });
});

test('attended appointments require showed status and use the corresponding Instantly transition', async () => {
  const deps = dependencies(); const event = normalizeGhlLifecycle(payload({ eventType: 'appointment_attended' }));
  await assert.rejects(processGhlLifecycle(event, config(), deps), { code: 'LIFECYCLE_APPOINTMENT_STATUS_UNVERIFIED' });
  deps.state.appointment.appointmentStatus = 'showed';
  await processGhlLifecycle(event, config(), deps);
  assert.equal(deps.state.calls.find(([method]) => method === 'reverseSync')[1].lifecycle, 'appointment_attended');
  assert.equal(deriveActivityMetrics(deps.state.records).appointmentsAttended, 1);
});

test('qualified opportunities are recorded at configured stages without implying a sale or stopping email', async () => {
  const deps = dependencies(); const event = normalizeGhlLifecycle(payload({ eventType: 'qualified_opportunity', opportunityId: 'opportunity_1', pipelineId: 'pipeline_1', pipelineStageId: 'stage_qualified' }));
  const result = await processGhlLifecycle(event, config(), deps);
  assert.equal(result.reverseSyncSkipped, 'milestone_has_no_reverse_status'); assert.equal(result.conversionSent, false);
  assert.equal(deps.state.calls.some(([method]) => method === 'reverseSync'), false);
  assert.deepEqual(deriveActivityMetrics(deps.state.records).revenueByCurrency, {});
});

test('closed customers require won status and do not convert an estimated opportunity value into revenue', async () => {
  const deps = dependencies(); const event = normalizeGhlLifecycle(payload({ eventType: 'customer_closed', opportunityId: 'opportunity_1', pipelineId: 'pipeline_1', pipelineStageId: 'stage_won', amount: 99999 }));
  deps.state.opportunity.pipelineStageId = 'stage_won';
  await assert.rejects(processGhlLifecycle(event, config(), deps), { code: 'LIFECYCLE_OPPORTUNITY_STATUS_UNVERIFIED' });
  deps.state.opportunity.status = 'won';
  await processGhlLifecycle(event, config(), deps);
  assert.equal(deps.state.calls.find(([method]) => method === 'reverseSync')[1].lifecycle, 'customer_won');
  assert.equal(deriveActivityMetrics(deps.state.records).customersWon, 1);
  assert.deepEqual(deriveActivityMetrics(deps.state.records).revenueByCurrency, {});
});

test('verified revenue comes from the real paid transaction response, never inbound amount', async () => {
  const deps = dependencies(); const event = normalizeGhlLifecycle(payload({ eventType: 'revenue_received', transactionId: 'transaction_1', amount: 999999, currency: 'EUR' }));
  await processGhlLifecycle(event, config(), deps);
  assert.deepEqual(deriveActivityMetrics(deps.state.records).revenueByCurrency, { USD: 100.25 });
  assert.equal(deps.state.calls.some(([method]) => method === 'reverseSync'), false);
});

test('test payments, incomplete payments, refunded values and unmatched transactions never produce revenue facts', async () => {
  const event = normalizeGhlLifecycle(payload({ eventType: 'revenue_received', transactionId: 'transaction_1' }));
  for (const changes of [{ liveMode: false }, { markAsTest: true }, { markAsTest: undefined }, { status: 'pending' }, { amountRefunded: 10 }, { contactId: 'another_contact' }, { amount: -1 }, { currency: 'unknown' }]) {
    const deps = dependencies(); Object.assign(deps.state.transaction, changes);
    await assert.rejects(processGhlLifecycle(event, config(), deps));
    assert.equal(deps.state.calls.some(([method]) => method === 'append'), false);
  }
  await assert.rejects(processGhlLifecycle(event, config({ paymentMappingVerified: false }), dependencies()), { code: 'LIFECYCLE_PAYMENT_MAPPING_UNVERIFIED' });
});

test('minor currency units require an explicitly verified exponent mapping', async () => {
  const deps = dependencies(); deps.state.transaction.amount = 10025;
  const event = normalizeGhlLifecycle(payload({ eventType: 'revenue_received', transactionId: 'transaction_1' }));
  const verified = await verifyGhlLifecycle(event, deps.state.contact, config({ paymentAmountUnit: 'minor' }), deps.reader);
  assert.equal(verified.revenueValue, 100.25);
  await assert.rejects(verifyGhlLifecycle(event, deps.state.contact, config({ paymentAmountUnit: 'minor', paymentCurrencyExponents: {} }), deps.reader), { code: 'LIFECYCLE_PAYMENT_UNITS_UNVERIFIED' });
});

test('unsubscribe must be present in GHL email DND before applying Instantly suppression', async () => {
  const deps = dependencies(); const event = normalizeGhlLifecycle(payload({ eventType: 'lead_unsubscribed' }));
  await assert.rejects(processGhlLifecycle(event, config(), deps), { code: 'LIFECYCLE_EMAIL_UNSUBSCRIBE_UNVERIFIED' });
  deps.state.contact.dndSettings = { email: { status: 'active' } };
  await processGhlLifecycle(event, config(), deps);
  assert.equal(deps.state.calls.find(([method]) => method === 'reverseSync')[1].lifecycle, 'unsubscribed');
});

test('duplicate deliveries preserve one event while verifying the actual stopping control again', async () => {
  const deps = dependencies(); const event = normalizeGhlLifecycle(payload());
  await processGhlLifecycle(event, config(), deps);
  const result = await processGhlLifecycle(event, config(), deps);
  assert.equal(result.disposition, 'reconciled');
  assert.equal(deriveActivityMetrics(deps.state.records).appointmentsBooked, 1);
  assert.equal(deps.state.calls.filter(([method]) => method === 'reverseSync').length, 2);
});

test('a partial stop failure returns retry, and the next delivery repairs it without another appointment', async () => {
  const deps = dependencies(); deps.state.stopResult = { sequenceStopVerified: false };
  const failed = await invoke({ deps });
  assert.equal(failed.response.statusCode, 502);
  assert.equal(deriveActivityMetrics(deps.state.records).appointmentsBooked, 1);
  deps.state.stopResult = { sequenceStopVerified: true, suppression: { blocklistId: 'blocklist_1' } };
  const retried = await invoke({ deps });
  assert.equal(retried.response.statusCode, 200); assert.equal(retried.response.body.disposition, 'reconciled');
  assert.equal(deriveActivityMetrics(deps.state.records).appointmentsBooked, 1);
});

test('Instantly origin echoes do not create GHL appointments or write back a status', async () => {
  const deps = dependencies(); const result = await processGhlLifecycle(normalizeGhlLifecycle(payload({ origin: 'instantly' })), config(), deps);
  assert.equal(result.disposition, 'ignored_sync_echo'); assert.equal(deps.state.calls.length, 0);
});

test('historical milestones update archive projections without reverse status, tags or ad conversions', async () => {
  const deps = dependencies(); const event = normalizeGhlLifecycle(payload(), { historical: true });
  const result = await processGhlLifecycle(event, config(), deps);
  assert.equal(result.historical, true); assert.equal(result.reverseSyncSkipped, 'historical'); assert.equal(result.conversionSent, false);
  assert.equal(deps.state.calls.some(([method]) => ['reverseSync', 'addTags'].includes(method)), false);
  const liveRetry = await processGhlLifecycle(normalizeGhlLifecycle(payload()), config(), deps);
  assert.equal(liveRetry.historical, true); assert.equal(liveRetry.reverseSyncSkipped, 'historical');
});

test('a contact without Instantly history retains advertising source and receives only general lifecycle projection fields', async () => {
  const deps = dependencies({ withInstantly: false }); deps.state.stopResult = { skipped: 'no_exact_match', mutated: false };
  const result = await processGhlLifecycle(normalizeGhlLifecycle(payload()), config(), deps);
  assert.equal(result.reverseSyncSkipped, 'no_exact_match'); assert.equal(result.reverseSync, false);
  assert.equal(deps.state.contact.source, 'Facebook Ads');
  assert.equal(deps.state.records[0].properties.campaign_id, '');
  const projection = lifecycleProjection(deps.state.records, deps.state.contact, fieldMap);
  assert.equal(projection.fields.some((f) => [fieldMap.instantly_first_campaign_id, fieldMap.outreach_channel].includes(f.id)), false);
});

test('source read APIs use documented GET paths, scoped transaction queries and no mutations', async () => {
  const calls = [];
  const reader = createGhlLifecycleReader({ token: 'test-token', locationId: 'location_1', fetchImpl: async (url, options) => {
    calls.push({ url, options });
    return new Response(JSON.stringify(url.includes('/appointments/') ? { event: { id: 'appointment_1' } } : url.includes('/opportunities/') ? { opportunity: { id: 'opportunity_1' } } : { _id: 'transaction_1' }), { status: 200 });
  } });
  await reader.getAppointment('appointment_1'); await reader.getOpportunity('opportunity_1'); await reader.getTransaction('transaction_1');
  assert.ok(calls[0].url.endsWith('/calendars/events/appointments/appointment_1'));
  assert.ok(calls[1].url.endsWith('/opportunities/opportunity_1'));
  const transactionUrl = new URL(calls[2].url); assert.equal(transactionUrl.searchParams.get('altId'), 'location_1'); assert.equal(transactionUrl.searchParams.get('altType'), 'location');
  assert.ok(calls.every((c) => c.options.method === 'GET' && !c.options.body && c.options.headers.Version === 'v3'));
});

test('live v3 single-item payment arrays and lowercase currency verify actual revenue', async () => {
  const deps = dependencies();
  const transaction = { ...deps.state.transaction, currency: 'usd' };
  const reader = createGhlLifecycleReader({ token: 'test-token', locationId: 'location_1',
    fetchImpl: async () => new Response(JSON.stringify([transaction]), { status: 200 }) });
  const event = normalizeGhlLifecycle(payload({ eventType: 'revenue_received', transactionId: 'transaction_1' }));
  const verified = await verifyGhlLifecycle(event, deps.state.contact, config(), reader);
  assert.equal(verified.revenueValue, 100.25);
  assert.equal(verified.currency, 'USD');
  for (const response of [[], [transaction, transaction]]) {
    const ambiguousReader = createGhlLifecycleReader({ token: 'test-token', locationId: 'location_1',
      fetchImpl: async () => new Response(JSON.stringify(response), { status: 200 }) });
    await assert.rejects(ambiguousReader.getTransaction('transaction_1'), { code: 'GHL_TRANSACTION_RESULT_AMBIGUOUS' });
  }
  const wrongReader = createGhlLifecycleReader({ token: 'test-token', locationId: 'location_1',
    fetchImpl: async () => new Response(JSON.stringify([{ ...transaction, _id: 'wrong_transaction' }]), { status: 200 }) });
  await assert.rejects(verifyGhlLifecycle(event, deps.state.contact, config(), wrongReader), { code: 'LIFECYCLE_TRANSACTION_MISMATCH' });
});
