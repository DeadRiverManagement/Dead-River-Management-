import test from 'node:test';
import assert from 'node:assert/strict';
import fields from '../src/data/ghl-attribution-fields.json' with { type: 'json' };
import { readGooglePaymentConfig, prepareGooglePayment, createGooglePaymentDispatcher } from '../api/_lib/google-payment-conversions.js';

// In-memory fixtures only. These never create CRM payments or platform events.
const now = Date.parse('2026-09-25T12:00:00Z'), occurredAt = '2026-09-25T11:59:00.000Z';
const env = { ENABLE_GOOGLE_PAYMENT_CONVERSIONS: 'true', VERCEL_ENV: 'production',
  GHL_LOCATION_ID: fields.locationId, GOOGLE_PAYMENT_DESTINATION_VERIFIED: 'true',
  GHL_ACTIVITY_UNIQUE_EVENT_ID_VERIFIED: 'true', GHL_PAYMENT_REVENUE_MAPPING_VERIFIED: 'true',
  GHL_PAYMENT_AMOUNT_UNIT: 'major', GHL_PAYMENT_CURRENCY_EXPONENTS: '{"USD":2}' };
function harness() {
  const event = { origin: 'ghl', eventType: 'revenue_received', eventId: 'payment_event_001',
    locationId: fields.locationId, contactId: 'contact_001', transactionId: 'transaction_001', occurredAt, historical: false };
  const contact = { id: event.contactId, locationId: event.locationId, email: 'owner@example.com',
    customFields: [{ id: fields.fields.gclid, value: 'mock_click' }] };
  const transaction = { _id: event.transactionId, contactId: contact.id, altId: event.locationId, altType: 'location',
    status: 'succeeded', liveMode: true, markAsTest: false, amount: 125, amountRefunded: 0, currency: 'usd', createdAt: occurredAt };
  const record = { id: 'activity_001', properties: { record_kind: 'activity', event_id: 'stored_payment_001',
    source: 'ghl', historical: 0, workspace_id: event.locationId, contact_id: contact.id,
    event_type: event.eventType, source_event_id: event.eventId, transaction_id: event.transactionId,
    occurred_at: occurredAt, revenue_verified: 1, revenue_value: 125, currency: 'USD' } };
  const state = { posts: [], receipts: [], receiptFails: false, networkFails: false, response: { requestId: 'request_001' } };
  const reader = { getTransaction: async () => transaction };
  const ledger = { get: async () => record, completedEffect: async (_, key) => state.receipts.find(r => r.properties.event_type === key),
    list: async () => state.receipts,
    recordEffectCompletion: async (_, key, reference) => {
      if (state.receiptFails) throw Error('simulated receipt failure');
      state.receipts.push({ properties: { record_kind: 'effect_receipt', contact_id: contact.id, event_type: key, effect_reference: reference } });
    } };
  const dispatch = createGooglePaymentDispatcher({ env, ghl: { getContact: async () => contact }, reader, ledger,
    now: () => now, getAccessToken: async () => 'mock_token', fetchImpl: async (url, options) => {
      state.posts.push({ url, body: JSON.parse(options.body) });
      if (state.networkFails) throw Error('simulated network failure');
      return { ok: true, json: async () => state.response };
    } });
  return { event, contact, transaction, record, state,
    prepare: () => prepareGooglePayment({ event, contact, reader }, readGooglePaymentConfig(env), { now }),
    send: () => dispatch({ event, activityRecord: record }) };
}
test('Google payment sender stays off until production mappings are verified', async () => {
  assert.equal(readGooglePaymentConfig({}), null);
  assert.throws(() => readGooglePaymentConfig({ ...env, VERCEL_ENV: 'preview' }));
  assert.throws(() => readGooglePaymentConfig({ ...env, GOOGLE_PAYMENT_DESTINATION_VERIFIED: 'false' }));
  const send = createGooglePaymentDispatcher({ env: {} });
  assert.equal((await send({})).reason, 'disabled');
});
test('Google payment contains authoritative value/time, stable transaction and click IDs without PII', async () => {
  const h = harness();
  h.contact.customFields.push({ id: fields.fields.wbraid, value: 'mock_braid' });
  const { payload } = await h.prepare();
  assert.equal(payload.destinations[0].productDestinationId, '7795206688');
  assert.deepEqual(payload.events[0], { transactionId: `ghl_${fields.locationId}_transaction_001`,
    eventTimestamp: occurredAt, eventSource: 'OTHER', adIdentifiers: { gclid: 'mock_click', wbraid: 'mock_braid' },
    conversionValue: 125, currency: 'USD' });
  assert.equal(JSON.stringify(payload).includes(h.contact.email), false);
});
test('Historical records, test contacts, consent denial and missing identifiers never upload', async () => {
  for (const change of [h => h.event.historical = true, h => h.event.test = true,
    h => h.contact.email = 'qa@example.invalid', h => h.contact.customFields = [],
    h => h.contact.customFields.push({ id: fields.fields.ad_storage, value: 'denied' })]) {
    const h = harness(); change(h);
    assert.equal((await h.prepare()).disposition, 'skipped');
    if (!h.event.historical && !h.event.test) assert.equal((await h.send()).disposition, 'skipped');
    assert.equal(h.state.posts.length, 0);
  }
});
test('Failed, test, refunded and mismatched payment facts are rejected', async () => {
  for (const change of [h => h.transaction.status = 'failed', h => h.transaction.liveMode = false,
    h => h.transaction.amountRefunded = 1, h => h.transaction.contactId = 'wrong_contact',
    h => h.transaction.createdAt = '2026-09-25T11:58:00Z', h => h.transaction.amount = 0]) {
    const h = harness(); change(h); await assert.rejects(h.prepare); assert.equal(h.state.posts.length, 0);
  }
});
test('Durable payment mismatch prevents upload', async () => {
  const h = harness(); h.record.properties.revenue_value = 999;
  await assert.rejects(h.send, /GOOGLE_DURABLE_REVENUE_MISMATCH/); assert.equal(h.state.posts.length, 0);
});
test('Submission receipt prevents sequential duplicates without claiming attribution', async () => {
  const h = harness(); const result = await h.send();
  assert.equal(result.disposition, 'submitted'); assert.equal(result.processingVerified, false);
  assert.equal((await h.send()).disposition, 'already_submitted'); assert.equal(h.state.posts.length, 1);
});
test('An uncertain receipt retry retains the same Google transaction identity', async () => {
  const h = harness(); h.state.receiptFails = true; await assert.rejects(h.send);
  h.state.receiptFails = false; await h.send();
  assert.deepEqual(h.state.posts[0].body, h.state.posts[1].body);
});
test('Network uncertainty and absent request ID never create a success receipt', async () => {
  for (const kind of ['network', 'response']) {
    const h = harness(); if (kind === 'network') h.state.networkFails = true; else h.state.response = {};
    await assert.rejects(h.send); assert.equal(h.state.receipts.length, 0);
  }
});
