import test from 'node:test';
import assert from 'node:assert/strict';
import attributionFields from '../src/data/ghl-attribution-fields.json' with { type: 'json' };
import { createGhlLifecycleWebhookHandler, normalizeGhlWebhookEnvelope, lifecycleSchemaDiagnostic } from '../api/ghl-lifecycle-webhook.js';
import { createMetaConversionDispatcher } from '../api/_lib/ad-conversions.js';
import { activityProperties } from '../api/_lib/ghl-activity.js';
import { OUTREACH_CONTACT_FIELDS } from '../api/_lib/outreach-sync.js';
import { readLifecycleConfig, createLifecycleDependencies } from '../api/_lib/ghl-lifecycle.js';

// All CRM/platform calls are local fakes; no external records or ads are sent.
const map = attributionFields.fields, locationId = attributionFields.locationId;
const inquiryId = 'drm_inquiry_a155a861-101b-49fd-861f-114064aa9e63';
const occurredAt = new Date(Date.now() - 60000).toISOString();
test('authenticated schema diagnostics never disclose contact data or field values', () => {
  const result = lifecycleSchemaDiagnostic({email:'private@example.com', customData:{drm_contact_id:'private-contact-id',drm_occurred_at:'{{unresolved}}',drm_mode:'validate',secret:'private-secret'}});
  assert.deepEqual(result,{root:{},customData:{drm_mode:{type:'string',empty:false,unresolved:false},drm_contact_id:{type:'string',empty:false,unresolved:false},drm_occurred_at:{type:'string',empty:false,unresolved:true}}});
  assert.doesNotMatch(JSON.stringify(result),/private|unresolved\}\}/);
});
const outreachMap = Object.fromEntries(OUTREACH_CONTACT_FIELDS.map(({ key }, index) => [key, `outreach_field_${index}`]));
function flat(overrides = {}) {
  return { drm_schema_version: '1', drm_mode: 'live', drm_origin: 'ghl',
    drm_event_type: 'inquiry_saved', drm_event_id: inquiryId,
    drm_location_id: locationId, drm_contact_id: 'contact_001', drm_occurred_at: occurredAt,
    contact_id: 'ignored_native_contact', email: 'ignored@example.com', monetaryValue: 99999, ...overrides };
}
test('verified native GHL customData wrapper maps identically and rejects conflicting envelopes', () => {
  const mapped = flat({drm_mode:'validate',drm_test:'true'});
  assert.deepEqual(normalizeGhlWebhookEnvelope({contact_id:'ignored',customData:mapped}), normalizeGhlWebhookEnvelope(mapped));
  for (const extra of [{drm_contact_id:'conflict'}, {schemaVersion:1}, {custom_data:mapped}]) {
    assert.throws(() => normalizeGhlWebhookEnvelope({customData:mapped,...extra}), /Ambiguous/);
  }
  assert.throws(() => normalizeGhlWebhookEnvelope({customData:[]}), /Invalid envelope/);
});
function settings(overrides = {}) {
  return { VERCEL_ENV: 'production', ENABLE_GHL_LIFECYCLE_SYNC: 'true',
    DRM_GHL_LIFECYCLE_WEBHOOK_SECRET: 'offline-test-secret-with-at-least-32-characters',
    GHL_OUTREACH_PIT: 'not-a-real-token', GHL_LOCATION_ID: locationId,
    GHL_ACTIVITY_ASSOCIATION_ID: 'association_001', GHL_ACTIVITY_UNIQUE_EVENT_ID_VERIFIED: 'true',
    GHL_LIFECYCLE_PAYLOAD_MAPPING_VERIFIED: 'true', GHL_OUTREACH_AUTOMATIONS_REVIEWED: 'true',
    GHL_OUTREACH_FIELD_IDS: JSON.stringify(outreachMap),
    GHL_LIFECYCLE_CALENDAR_IDS: '["calendar_001"]',
    GHL_LIFECYCLE_STAGE_MAP: '{"pipeline_001":{"qualifiedStageIds":["stage_qualified_001"],"wonStageIds":["stage_won_001"]}}',
    META_CAPI_ACCESS_TOKEN: 'not-a-real-meta-token', META_GRAPH_API_VERSION: 'v25.0',
    META_CAPI_EVENT_MAPPING_VERIFIED: 'true', META_CAPI_BROWSER_DEDUP_VERIFIED: 'true', ...overrides };
}
function harness(overrides = {}) {
  const env = settings(overrides), records = new Map(), receipts = new Map(), calls = [], sent = [];
  const state = { env, records, receipts, calls, sent, factoryCalls: 0,
    contact: { id: 'contact_001', locationId, email: 'owner@example.com', dnd: false,
      tags: ['demandflow-home-services'], source: 'Facebook Ads', customFields: Object.entries({
        last_inquiry_event_id: inquiryId, last_inquiry_at: occurredAt, ad_user_data: 'unknown', ad_storage: 'unknown',
        fbc: `fb.1.${Date.parse(occurredAt) - 60000}.synthetic_click`, first_utm_campaign: 'original-campaign',
      }).map(([key, value]) => ({ id: map[key], value })) },
    appointment: { id: 'appointment_001', contactId: 'contact_001', locationId,
      calendarId: 'calendar_001', appointmentStatus: 'confirmed' },
    metaFails: false,
  };
  const ledger = {
    async append(event) {
      calls.push('append'); const p = activityProperties(event); const prior = records.get(p.event_id);
      const record = prior || { id: `record_${records.size + 1}`, properties: p };
      records.set(p.event_id, record);
      return { record, created: !prior, historical: record.properties.historical === 1 };
    },
    async get(id) { calls.push('getRecord'); return [...records.values()].find(record => record.id === id); },
    async list({ contactId, includeReceipts = false }) {
      calls.push('list'); return [...records.values(), ...(includeReceipts ? [...receipts.values()] : [])]
        .filter(record => record.properties.contact_id === contactId);
    },
    async completedEffect(record, key) { return receipts.get(`${record.id}:${key}`); },
    async recordEffectCompletion(record, key, reference) {
      calls.push('receipt'); receipts.set(`${record.id}:${key}`, { id: `receipt_${receipts.size}`, properties: {
        record_kind: 'effect_receipt', contact_id: record.properties.contact_id, event_type: key, effect_reference: reference,
      } });
    },
  };
  const dependencies = {
    ledger,
    ghl: {
      async getContact() { calls.push('getContact'); return structuredClone(state.contact); },
      async updateProjection(contact, projection) { calls.push('updateProjection'); return contact; },
      async addTags() { calls.push('addTags'); },
    },
    reader: { async getAppointment() { calls.push('getAppointment'); return structuredClone(state.appointment); } },
  };
  const handler = createGhlLifecycleWebhookHandler({ env,
    dependenciesFactory(config) { state.factoryCalls++; return { ...dependencies,
      ...(config.reverseSyncEnabled ? { reverseSync: async () => { calls.push('reverseSync'); throw new Error('Unexpected Instantly call'); } } : {}) }; },
    conversionDispatcherFactory: (options) => createMetaConversionDispatcher({ ...options,
      fetchImpl: async (url, request) => {
        calls.push('metaPost'); sent.push(JSON.parse(request.body));
        return { ok: !state.metaFails, status: state.metaFails ? 503 : 200,
          async json() { return state.metaFails ? { error: { message: 'private upstream data' } } : { events_received: 1, messages: [], fbtrace_id: 'mock_trace_001' }; } };
      } }),
  });
  return { state, async send(body = flat(), headers = {}) {
    const res = { statusCode: 0, body: null, headers: {}, setHeader(key, value) { this.headers[key] = value; },
      status(code) { this.statusCode = code; return this; }, json(value) { this.body = value; return this; } };
    await handler({ method: 'POST', headers: { authorization: `Bearer ${env.DRM_GHL_LIFECYCLE_WEBHOOK_SECRET}`, ...headers }, body }, res);
    return res;
  } };
}

test('standard Webhook uses explicit flat custom data and rejects ambiguous or unresolved mapping', () => {
  const normalized = normalizeGhlWebhookEnvelope(flat());
  assert.equal(normalized.event.contactId, 'contact_001'); assert.equal(normalized.event.eventId, inquiryId);
  assert.equal(normalized.event.email, undefined); assert.equal(normalized.event.monetaryValue, undefined);
  for (const body of [flat({ schemaVersion: 1 }), flat({ drm_schema_version: '2' }), flat({ drm_contact_id: '{{contact.id}}' }),
    flat({ drm_event_id: 'contact-import-is-not-an-inquiry' }), flat({ drm_mode: 'test' }), { contact_id: 'contact_001' }]) {
    assert.throws(() => normalizeGhlWebhookEnvelope(body));
  }
});

test('auth and validation mode perform no CRM or advertising calls', async () => {
  const h = harness({ ENABLE_META_CAPI: 'true' });
  assert.equal((await h.send(flat(), { authorization: 'Bearer wrong' })).statusCode, 401);
  const validated = await h.send(flat({ drm_mode: 'validate', drm_test: 'true' }));
  assert.equal(validated.statusCode, 200); assert.equal(validated.body.mutations, 0);
  assert.equal(h.state.factoryCalls, 0); assert.equal(h.state.calls.length, 0);
});

test('inquiry configuration needs real receipt/ledger mappings but no Instantly key or outreach projection fields', () => {
  const env = settings({ INSTANTLY_API_KEY: '', GHL_OUTREACH_FIELD_IDS: '', GHL_LIFECYCLE_STAGE_MAP: '' });
  const config = readLifecycleConfig(env, { inquiryOnly: true });
  assert.equal(config.inquiryOnly, true); assert.equal(config.attributionFieldMap.last_inquiry_event_id, map.last_inquiry_event_id);
  assert.equal(createLifecycleDependencies(config).reverseSync, undefined);
  assert.throws(() => readLifecycleConfig({ ...env, GHL_ACTIVITY_UNIQUE_EVENT_ID_VERIFIED: 'false' }, { inquiryOnly: true }));
});

test('saved inquiry is archived once without contact mutation or Meta sends when disabled', async () => {
  const h = harness(); const first = await h.send(); const duplicate = await h.send();
  assert.equal(first.statusCode, 200); assert.equal(duplicate.body.disposition, 'reconciled');
  assert.equal(h.state.records.size, 1); assert.equal(h.state.sent.length, 0);
  const record = [...h.state.records.values()][0];
  assert.equal(record.properties.source_event_id, inquiryId); assert.equal(record.properties.occurred_at, occurredAt);
  assert.equal(record.properties.campaign_name, 'original-campaign');
  assert.equal(first.body.activityRecord, undefined); assert.equal(JSON.stringify(first.body).includes('owner@example.com'), false);
  assert.equal(h.state.calls.some(call => ['updateProjection', 'addTags', 'reverseSync'].includes(call)), false);
});

test('a missing/changed inquiry receipt or missing tag cannot persist an inquiry or send Lead', async () => {
  for (const change of ['receipt', 'timestamp', 'tag']) {
    const h = harness({ ENABLE_META_CAPI: 'true' });
    if (change === 'tag') h.state.contact.tags = [];
    else h.state.contact.customFields.find(field => field.id === map[change === 'receipt' ? 'last_inquiry_event_id' : 'last_inquiry_at']).value = 'incorrect';
    assert.equal((await h.send()).statusCode, 502);
    assert.equal(h.state.records.size, 0); assert.equal(h.state.sent.length, 0);
  }
});

test('explicitly enabled standard webhook archives inquiry before Meta Lead and deduplicates retries with the browser ID', async () => {
  const h = harness({ ENABLE_META_CAPI: 'true' });
  const first = await h.send(); const retry = await h.send();
  assert.equal(first.statusCode, 200); assert.equal(first.body.conversionSent, true);
  assert.equal(h.state.sent[0].data[0].event_id, inquiryId); assert.equal(h.state.sent[0].data[0].event_name, 'Lead');
  assert.equal(h.state.sent[0].data[0].action_source, 'system_generated');
  assert.ok(h.state.calls.indexOf('append') < h.state.calls.indexOf('metaPost'));
  assert.equal(h.state.records.size, 1); assert.equal(h.state.sent.length, 1);
  assert.equal(retry.body.meta.disposition, 'already_received');
});

test('enabled but incomplete Meta configuration fails before any CRM mutation', async () => {
  const h = harness({ ENABLE_META_CAPI: 'true', META_CAPI_ACCESS_TOKEN: '' });
  assert.equal((await h.send()).statusCode, 503); assert.equal(h.state.factoryCalls, 0);
});

test('historical inquiry and its later live retry never dispatch an advertising event', async () => {
  const h = harness({ ENABLE_META_CAPI: 'true', ENABLE_GHL_LIFECYCLE_HISTORY_IMPORT: 'true', GHL_HISTORICAL_IMPORT_SAFE: 'true' });
  assert.equal((await h.send(flat({ drm_mode: 'historical' }))).statusCode, 200);
  const retry = await h.send(); assert.equal(retry.statusCode, 200); assert.equal(retry.body.historical, true);
  assert.equal(h.state.records.size, 1); assert.equal(h.state.sent.length, 0);
  const echo = await h.send(flat({ drm_origin: 'instantly' }));
  assert.equal(echo.body.disposition, 'ignored_sync_echo'); assert.equal(h.state.sent.length, 0);
});

test('test mode requires reserved-domain DND contact and passes only explicit Meta test code', async () => {
  const h = harness({ ENABLE_META_CAPI: 'true', META_CAPI_TEST_EVENT_CODE: 'TEST_OFFLINE_001' });
  assert.equal((await h.send(flat({ drm_mode: 'test', drm_test: 'true' }))).statusCode, 502);
  assert.equal(h.state.records.size, 0);
  h.state.contact.email = 'drm-integration-test@example.invalid'; h.state.contact.dnd = true;
  const result = await h.send(flat({ drm_mode: 'test', drm_test: 'true' }));
  assert.equal(result.statusCode, 200); assert.equal(result.body.test, true);
  assert.equal(h.state.sent[0].test_event_code, 'TEST_OFFLINE_001');
  assert.equal(h.state.calls.some(call => ['updateProjection', 'addTags', 'reverseSync'].includes(call)), false);
});

test('isolated Meta test switch cannot enable live conversion delivery or waive contact proof', async () => {
  const h = harness({ ENABLE_META_CAPI_TEST:'true', META_CAPI_TEST_EVENT_CODE:'TEST_ONLY_001',
    META_CAPI_EVENT_MAPPING_VERIFIED:'false', META_CAPI_BROWSER_DEDUP_VERIFIED:'false' });
  assert.equal((await h.send()).statusCode,200);
  assert.equal(h.state.sent.length,0);
  assert.equal((await h.send(flat({drm_mode:'test',drm_test:'true'}))).statusCode,502);
  assert.equal(h.state.sent.length,0);
  h.state.contact.email='drm-test@example.invalid'; h.state.contact.dnd=true;
  const result=await h.send(flat({drm_mode:'test',drm_test:'true'}));
  assert.equal(result.statusCode,200);
  assert.equal(h.state.sent.length,1);
  assert.equal(h.state.sent[0].test_event_code,'TEST_ONLY_001');
  h.state.env.ENABLE_META_CAPI='true';
  assert.equal((await h.send()).statusCode,503,'live still requires verified mapping/dedup gates');
});

test('stored consent denial still archives the fact and skips advertising', async () => {
  const h = harness({ ENABLE_META_CAPI: 'true' });
  h.state.contact.customFields.find(field => field.id === map.ad_user_data).value = 'denied';
  const result = await h.send(); assert.equal(result.statusCode, 200);
  assert.equal(result.body.meta.reason, 'consent_denied'); assert.equal(h.state.records.size, 1); assert.equal(h.state.sent.length, 0);
});

test('confirmed appointment can dispatch Schedule while Instantly activation stays disabled', async () => {
  const h = harness({ ENABLE_META_CAPI: 'true', ENABLE_INSTANTLY_GHL_SYNC: 'false', INSTANTLY_API_KEY: '' });
  const result = await h.send(flat({ drm_event_type: 'appointment_confirmed', drm_event_id: 'appointment_confirmed_001',
    drm_appointment_id: 'appointment_001', drm_calendar_id: 'calendar_001' }));
  assert.equal(result.statusCode, 200); assert.equal(result.body.reverseSyncSkipped, 'instantly_sync_disabled');
  assert.equal(h.state.sent[0].data[0].event_name, 'Schedule'); assert.equal(h.state.calls.includes('reverseSync'), false);
});

test('Meta rejection retains durable inquiry and returns retry without leaking upstream errors', async () => {
  const h = harness({ ENABLE_META_CAPI: 'true' }); h.state.metaFails = true;
  const failed = await h.send(); assert.equal(failed.statusCode, 502); assert.equal(h.state.records.size, 1);
  assert.equal(JSON.stringify(failed.body).includes('private'), false);
  h.state.metaFails = false; const recovered = await h.send();
  assert.equal(recovered.statusCode, 200); assert.equal(h.state.records.size, 1);
  assert.equal(h.state.sent[0].data[0].event_id, h.state.sent[1].data[0].event_id);
});
