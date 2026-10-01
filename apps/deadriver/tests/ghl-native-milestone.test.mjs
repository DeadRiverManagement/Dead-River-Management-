import test from 'node:test';
import assert from 'node:assert/strict';
import { parseNativeMilestone, resolveNativeMilestone, createNativeMilestoneHandler } from '../api/ghl-crm-milestone.js';
import { OUTREACH_CONTACT_FIELDS } from '../api/_lib/outreach-sync.js';
import { createGhlLifecycleReader } from '../api/_lib/ghl-lifecycle.js';

const locationId = 'dzfd13SYs0Jg3qbvmugD', contactId = 'contact_001';
const when = '2026-01-02T03:04:05.000Z';
test('appointment reader accepts observed live v3 and documented wrappers without ambiguous fallback', async () => {
  const appointment = { id: 'appointment_001', contactId, calendarId: 'calendar_001', dateUpdated: when };
  for (const payload of [{ appointment, traceId: 'test_trace' }, { event: appointment }]) {
    const reader = createGhlLifecycleReader({ token: 'fake', locationId,
      fetchImpl: async () => ({ ok: true, json: async () => payload }) });
    assert.deepEqual(await reader.getAppointment('appointment_001'), appointment);
  }
  const reader = createGhlLifecycleReader({ token: 'fake', locationId,
    fetchImpl: async () => ({ ok: true, json: async () => ({ appointment, event: { ...appointment, id: 'other_appointment' } }) }) });
  await assert.rejects(reader.getAppointment('appointment_001'), /AMBIGUOUS/);
});
const config = { locationId, calendarIds: ['calendar_001'], pipelineStages: {
  pipeline_001: { qualifiedStageIds: ['stage_qualified'], wonStageIds: ['stage_won'] },
}, paymentMappingVerified: true, paymentAmountUnit: 'major' };
function body(type = 'revenue_received', extra = {}) {
  return { drm_schema_version: '2', drm_mode: 'verify', drm_origin: 'ghl',
    drm_location_id: locationId, drm_contact_id: contactId, drm_event_type: type,
    ...({ revenue_received: { drm_transaction_id: 'transaction_001' },
      appointment_confirmed: { drm_appointment_id: 'appointment_001' },
      appointment_attended: { drm_appointment_id: 'appointment_001' },
      qualified_opportunity: { drm_opportunity_id: 'opportunity_001' },
      customer_closed: { drm_opportunity_id: 'opportunity_001' } }[type]), ...extra };
}
function fixtures() {
  const state = { rows: [], calls: [], contact: { id: contactId, locationId, email: 'owner@example.com' },
    transaction: { _id: 'transaction_001', altType: 'location', altId: locationId, contactId,
      status: 'succeeded', liveMode: true, markAsTest: false, amount: 75, currency: 'usd', createdAt: when },
    opportunity: { id: 'opportunity_001', locationId, contactId, pipelineId: 'pipeline_001',
      pipelineStageId: 'stage_qualified', status: 'open', lastStageChangeAt: when,
      lastStatusChangeAt: '2026-01-02T02:00:00Z', monetaryValue: 999999 },
    appointment: { id: 'appointment_001', locationId, contactId, calendarId: 'calendar_001',
      appointmentStatus: 'confirmed', dateUpdated: when, startTime: '2099-01-01T12:00:00Z' } };
  state.dependencies = {
    ghl: { getContact: async () => { state.calls.push('contact'); return state.contact; } },
    ledger: { list: async () => { state.calls.push('ledger'); return state.rows; } },
    reader: {
      getTransaction: async () => { state.calls.push('transaction'); return state.transaction; },
      getOpportunity: async () => { state.calls.push('opportunity'); return state.opportunity; },
      getAppointment: async () => { state.calls.push('appointment'); return state.appointment; },
    },
  };
  return state;
}
test('native mapping accepts observed customData wrapper and rejects ambiguity and unresolved IDs', () => {
  assert.deepEqual(parseNativeMilestone({ customData: body(), contact_id: 'ignored' }), parseNativeMilestone(body()));
  for (const data of [body('revenue_received', { drm_transaction_id: '{{payment.transaction_id}}' }),
    body('revenue_received', { drm_occurred_at: when }), body('revenue_received', { drm_event_id: 'custom_001' }),
    body('revenue_received', { drm_mode: 'historical' }), body('revenue_received', { drm_origin: 'instantly' }),
    { customData: body(), drm_contact_id: contactId }, null]) assert.throws(() => parseNativeMilestone(data));
});
test('payment time and actual revenue come from verified CRM payment, never native display dates/amounts', async () => {
  const s = fixtures();
  const result = await resolveNativeMilestone(parseNativeMilestone(body('revenue_received', { amount: 123456, created_on: 'yesterday' })), config, s.dependencies);
  assert.equal(result.event.occurredAt, when); assert.equal(result.event.eventId, 'ghl_revenue_received_transaction_001');
  assert.equal(result.evidence.revenueValue, 75); assert.equal(result.evidence.currency, 'USD');
  assert.deepEqual(s.calls, ['transaction', 'contact', 'ledger']);
});
test('qualification and won milestones use corresponding authoritative transition timestamps', async () => {
  const s = fixtures();
  let r = await resolveNativeMilestone(parseNativeMilestone(body('qualified_opportunity')), config, s.dependencies);
  assert.equal(r.event.occurredAt, when); assert.equal(r.timestampField, 'lastStageChangeAt');
  assert.equal(r.evidence.revenueValue, undefined);
  s.opportunity.status = 'won'; s.opportunity.pipelineStageId = 'stage_won';
  r = await resolveNativeMilestone(parseNativeMilestone(body('customer_closed')), config, s.dependencies);
  assert.equal(r.event.occurredAt, '2026-01-02T02:00:00.000Z'); assert.equal(r.timestampField, 'lastStatusChangeAt');
});
test('appointment uses CRM update time and rejects unconfirmed/incorrect-calendar appointments', async () => {
  const s = fixtures(), input = parseNativeMilestone(body('appointment_confirmed'));
  const r = await resolveNativeMilestone(input, config, s.dependencies);
  assert.equal(r.event.occurredAt, when); assert.notEqual(r.event.occurredAt, s.appointment.startTime);
  s.appointment.appointmentStatus = 'new'; await assert.rejects(resolveNativeMilestone(input, config, s.dependencies));
  s.appointment.appointmentStatus = 'confirmed'; s.appointment.calendarId = 'another_calendar';
  await assert.rejects(resolveNativeMilestone(input, config, s.dependencies));
});
test('attendance requires showed; unknown, localized and future record dates are rejected', async () => {
  const s = fixtures(), input = parseNativeMilestone(body('appointment_attended'));
  await assert.rejects(resolveNativeMilestone(input, config, s.dependencies));
  s.appointment.appointmentStatus = 'showed';
  assert.equal((await resolveNativeMilestone(input, config, s.dependencies)).event.occurredAt, when);
  for (const value of [undefined, '09/25/2026', '2099-01-01T00:00:00Z']) {
    s.appointment.dateUpdated = value; await assert.rejects(resolveNativeMilestone(input, config, s.dependencies));
  }
});
test('duplicate milestone retains immutable first timestamp after later CRM edits', async () => {
  const s = fixtures(), input = parseNativeMilestone(body('appointment_confirmed'));
  s.rows.push({ properties: { record_kind: 'activity', source: 'ghl', source_event_id: 'ghl_appointment_confirmed_appointment_001',
    event_type: 'appointment_confirmed', occurred_at: '2026-01-01T12:00:00.000Z' } });
  assert.equal((await resolveNativeMilestone(input, config, s.dependencies)).event.occurredAt, '2026-01-01T12:00:00.000Z');
  s.appointment.contactId = 'other_contact'; await assert.rejects(resolveNativeMilestone(input, config, s.dependencies));
});
test('test, failed, refunded and mismatched payments cannot pass native verification', async () => {
  const input = parseNativeMilestone(body());
  for (const mutation of [{ markAsTest: true }, { liveMode: false }, { status: 'failed' },
    { amountRefunded: 1 }, { contactId: 'other_contact' }, { _id: 'other_payment' }, { createdAt: undefined }]) {
    const s = fixtures(); Object.assign(s.transaction, mutation);
    await assert.rejects(resolveNativeMilestone(input, config, s.dependencies));
  }
});

const env = { VERCEL_ENV: 'production', ENABLE_GHL_LIFECYCLE_SYNC: 'true',
  DRM_GHL_LIFECYCLE_WEBHOOK_SECRET: 'local-test-secret-at-least-32-characters', GHL_OUTREACH_PIT: 'fake', GHL_LOCATION_ID: locationId,
  GHL_ACTIVITY_ASSOCIATION_ID: 'association_001', GHL_ACTIVITY_UNIQUE_EVENT_ID_VERIFIED: 'true',
  GHL_LIFECYCLE_PAYLOAD_MAPPING_VERIFIED: 'true', GHL_OUTREACH_AUTOMATIONS_REVIEWED: 'true',
  GHL_OUTREACH_FIELD_IDS: JSON.stringify(Object.fromEntries(OUTREACH_CONTACT_FIELDS.map(({key}, i) => [key, `outreach_field_${i}`]))),
  GHL_LIFECYCLE_CALENDAR_IDS: JSON.stringify(config.calendarIds), GHL_LIFECYCLE_STAGE_MAP: JSON.stringify(config.pipelineStages),
  GHL_PAYMENT_REVENUE_MAPPING_VERIFIED: 'true', GHL_PAYMENT_AMOUNT_UNIT: 'major' };
async function run(s, data, options = {}) {
  const response = { code: 0, headers: {}, setHeader(k,v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; } };
  const handler = createNativeMilestoneHandler({ env: { ...env, ...options.env }, dependenciesFactory: () => s.dependencies,
    lifecycleHandlerFactory: ({ dependenciesFactory }) => async (req,res) => {
      s.calls.push('lifecycle'); s.forwarded = req.body; s.cached = dependenciesFactory(); return res.status(200).json({ ok: true });
    } });
  await handler({ method: options.method || 'POST', body: data, headers: {
    authorization: options.authorization ?? `Bearer ${env.DRM_GHL_LIFECYCLE_WEBHOOK_SECRET}`,
  } }, response);
  return response;
}
test('authentication, wrong location and missing gates fail before any CRM reads', async () => {
  for (const [options, input, code] of [[{authorization:'Bearer wrong'},body(),401],
    [{method:'GET'},body(),405], [{env:{GHL_OUTREACH_AUTOMATIONS_REVIEWED:'false'}},body(),503],
    [{},body('revenue_received',{drm_location_id:'wrong_location'}),400]]) {
    const s=fixtures(), r=await run(s,input,options); assert.equal(r.code,code); assert.deepEqual(s.calls,[]);
  }
});
test('verify mode reads authoritative facts but never invokes the write/conversion handler', async () => {
  const s=fixtures(), r=await run(s,{customData:body()});
  assert.equal(r.code,200); assert.deepEqual(r.body,{ok:true,verified:true,eventType:'revenue_received',timestampField:'createdAt',mutations:0,conversions:0});
  assert.ok(!s.calls.includes('lifecycle'));
});
test('reserved QA contacts exercise mapping without becoming real revenue or customers', async () => {
  const s=fixtures(); s.contact.email='qa@example.invalid';
  const r=await run(s,body('revenue_received',{drm_mode:'live'}));
  assert.equal(r.code,200); assert.equal(r.body.excluded,'reserved_test_contact'); assert.ok(!s.calls.includes('lifecycle'));
});
test('live verified milestone forwards only canonical CRM facts through existing protected processor', async () => {
  const s=fixtures(), r=await run(s,body('revenue_received',{drm_mode:'live',amount:999999}));
  assert.equal(r.code,200); assert.equal(s.forwarded.payload.occurredAt,when);
  assert.equal(s.forwarded.payload.amount,undefined); assert.equal(s.forwarded.mode,'live');
  assert.deepEqual(await s.cached.reader.getTransaction(),s.transaction);
});
