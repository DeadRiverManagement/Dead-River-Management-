import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ACTIVITY_SCHEMA_KEY, activityProvisioning, activityEventId, activityProperties,
  createGhlActivityLedger, deriveActivityMetrics,
} from '../api/_lib/ghl-activity.js';

const originalTime = '2026-09-18T09:30:00-06:00';
const event = (overrides = {}) => ({
  eventId: 'provider-event-1', source: 'instantly', workspaceId: 'workspace-1',
  eventType: 'email_sent', contactId: 'contact-1', campaignId: 'campaign-1',
  campaignName: 'DemandFlow Roofing', leadId: 'lead-1', leadEmail: 'TEST@example.invalid',
  senderInbox: 'SENDER@example.invalid', sequenceStep: 1, sequenceVariant: 'A',
  occurredAt: originalTime, historical: false, ...overrides,
});
const response = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });

function fakeGhl() {
  const records = new Map(); const relations = []; const calls = [];
  const state = { records, relations, calls, relationFailures: 0, lostCreateResponse: false, stalledSearch: false, malformedRelations: false };
  const fetchImpl = async (url, options) => {
    const parsed = new URL(url); const body = options.body ? JSON.parse(options.body) : undefined;
    calls.push({ url, method: options.method, headers: options.headers, body });
    if (parsed.pathname.endsWith('/records') && options.method === 'POST') {
      if ([...records.values()].some((r) => r.properties.event_id === body.properties.event_id)) return response({ message: 'Duplicate unique field' }, 422);
      const record = { id: `record-${records.size + 1}`, locationId: body.locationId, objectKey: ACTIVITY_SCHEMA_KEY,
        // Actual GHL read-back omits blank submitted text fields.
        properties: Object.fromEntries(Object.entries(structuredClone(body.properties)).filter(([, value]) => value !== '')) };
      // The fake models a database-enforced unique insert, including concurrent requests.
      records.set(record.id, record);
      if (state.lostCreateResponse) { state.lostCreateResponse = false; throw new TypeError('Connection lost after commit'); }
      return response({ record }, 201);
    }
    if (parsed.pathname.endsWith('/records/search')) {
      // Model the verified API: query is literal text across the three
      // provisioned searchable fields, not a field:value filter language.
      const selected = [...records.values()].filter((r) => !body.query ||
        ['event_id', 'contact_id', 'campaign_id'].some((field) => String(r.properties[field] || '').includes(body.query)));
      let offset = (body.page - 1) * body.pageLimit;
      if (body.searchAfter.length) offset = selected.findIndex((r) => r.id === body.searchAfter.at(-1)) + 1;
      if (state.stalledSearch) offset = 0;
      return response({ total: selected.length, records: selected.slice(offset, offset + body.pageLimit).map((r, i) => ({ ...r, searchAfter: [offset + i, r.id] })) });
    }
    if (/\/records\/record-\d+$/.test(parsed.pathname) && options.method === 'GET') {
      const record = records.get(parsed.pathname.split('/').at(-1));
      return record ? response({ record }) : response({ message: 'Not found' }, 404);
    }
    if (/\/associations\/relations\/record-\d+$/.test(parsed.pathname)) {
      if (state.malformedRelations) return response({ id: 'association-1', firstObjectLabel: 'Activity' });
      const recordId = parsed.pathname.split('/').at(-1);
      const selected = relations.filter((r) => r.firstRecordId === recordId || r.secondRecordId === recordId);
      const skip = Number(parsed.searchParams.get('skip')); const limit = Number(parsed.searchParams.get('limit'));
      return response({ relations: selected.slice(skip, skip + limit) });
    }
    if (parsed.pathname === '/associations/relations' && options.method === 'POST') {
      if (state.relationFailures) { state.relationFailures--; return response({ message: 'Temporary error' }, 503); }
      const existing = relations.find((r) => r.associationId === body.associationId && r.firstRecordId === body.firstRecordId && r.secondRecordId === body.secondRecordId);
      if (existing) return response({ message: 'Already linked' }, 409);
      const relation = { id: `relation-${relations.length + 1}`, ...body }; relations.push(relation);
      return response(relation, 201);
    }
    throw new Error(`Unexpected fake request ${options.method} ${parsed.pathname}`);
  };
  const ledger = (overrides = {}) => createGhlActivityLedger({
    token: 'test-token', locationId: 'location-1', associationId: 'association-1',
    uniqueEventIdVerified: true, fetchImpl, ...overrides,
  });
  return { ...state, state, fetchImpl, ledger };
}

test('provisioning uses documented properties and requires UI uniqueness without inventing an API flag', () => {
  const plan = activityProvisioning({ locationId: 'location-1', folderId: 'real-folder-id' });
  assert.equal(plan.object.key, ACTIVITY_SCHEMA_KEY);
  assert.equal(plan.object.primaryDisplayPropertyDetails.key, `${ACTIVITY_SCHEMA_KEY}.event_id`);
  assert.equal(plan.uniquePrimaryFieldRequired, true);
  assert.equal(JSON.stringify(plan.object).includes('isUnique'), false);
  assert.ok(plan.fields.every((f) => f.parentId === 'real-folder-id' && f.showInForms === false));
  assert.ok(!plan.fields.some((f) => f.fieldKey.endsWith('.event_id')));
  assert.deepEqual(plan.searchable.searchableProperties, ['event_id', 'contact_id', 'campaign_id'].map((key) => `${ACTIVITY_SCHEMA_KEY}.${key}`));
  assert.equal(plan.association.firstObjectKey, ACTIVITY_SCHEMA_KEY);
  assert.equal(plan.association.secondObjectKey, 'contact');
});

test('original timestamp, historical flag and readable reply are retained independently of receipt time', () => {
  const p = activityProperties(event({ historical: true, replyText: 'Hello,\nPlease call next week.', conversationUrl: 'https://app.instantly.ai/app/unibox/abc' }), '2026-09-24T12:00:00Z');
  assert.equal(p.occurred_at, '2026-09-18T15:30:00.000Z');
  assert.equal(p.received_at, '2026-09-24T12:00:00.000Z');
  assert.equal(p.historical, 1);
  assert.equal(p.lead_email, 'test@example.invalid');
  assert.equal(p.sender_inbox, 'sender@example.invalid');
  assert.equal(p.reply_text, 'Hello,\nPlease call next week.');
  assert.equal(p.sequence_step, '1');
});

test('missing historical intent, naive time, oversized reply and unsafe links fail before delivery', () => {
  assert.throws(() => activityProperties(event({ historical: undefined })), /historical/);
  assert.throws(() => activityProperties(event({ occurredAt: '2026-09-24T12:00:00' })), /occurredAt/);
  assert.throws(() => activityProperties(event({ replyText: 'x'.repeat(50001) })), /Reply exceeds/);
  assert.throws(() => activityProperties(event({ conversationUrl: 'javascript:alert(1)' })), /conversationUrl/);
  assert.throws(() => activityProperties(event({ conversationUrl: 'https://user:secret@example.invalid' })), /conversationUrl/);
});

test('stable event identity spans history/webhook delivery and metadata updates, while separating source workspaces and event types', () => {
  assert.equal(activityEventId(event()), activityEventId(event({ historical: true, campaignName: 'Renamed Campaign', receivedAt: '2026-09-25T00:00:00Z' })));
  assert.notEqual(activityEventId(event()), activityEventId(event({ eventType: 'email_opened' })));
  assert.notEqual(activityEventId(event()), activityEventId(event({ workspaceId: 'different-workspace' })));
});

test('ledger writes are blocked until unique primary field enforcement is verified', async () => {
  const fake = fakeGhl();
  await assert.rejects(fake.ledger({ uniqueEventIdVerified: false }).append(event()), { code: 'GHL_ACTIVITY_UNIQUE_FIELD_NOT_VERIFIED' });
  assert.equal(fake.calls.length, 0);
});

test('concurrent duplicate deliveries insert one event and derived totals do not inflate', async () => {
  const fake = fakeGhl(); const ledger = fake.ledger();
  const results = await Promise.all(Array.from({ length: 5 }, () => ledger.append(event())));
  assert.equal(results.filter((r) => r.created).length, 1);
  assert.equal(fake.records.size, 1);
  assert.equal(fake.relations.length, 1);
  const totals = deriveActivityMetrics(results.map((r) => r.record));
  assert.equal(totals.emailsSent, 1); assert.equal(totals.uniqueProspectsContacted, 1);
  assert.equal(fake.calls[0].headers.Version, 'v3');
  assert.equal(fake.calls[0].body.properties.event_id, activityEventId(event()));
});

test('a failed association is repaired on retry without losing or reinserting activity', async () => {
  const fake = fakeGhl(); fake.state.relationFailures = 1; const ledger = fake.ledger();
  await assert.rejects(ledger.append(event()), { status: 503 });
  assert.equal(fake.records.size, 1); assert.equal(fake.relations.length, 0);
  const retried = await ledger.append(event());
  assert.equal(retried.created, false); assert.equal(fake.relations.length, 1);
  assert.equal(fake.records.size, 1);
});

test('an uncertain create response is reconciled against the durable event ID', async () => {
  const fake = fakeGhl(); fake.state.lostCreateResponse = true;
  const result = await fake.ledger().append(event());
  assert.equal(result.created, false); assert.equal(fake.records.size, 1); assert.equal(fake.relations.length, 1);
});

test('a repeated event cannot be reassigned to a different contact or original time', async () => {
  const fake = fakeGhl(); const ledger = fake.ledger();
  await ledger.append(event());
  await assert.rejects(ledger.append(event({ contactId: 'wrong-contact' })), { code: 'GHL_ACTIVITY_IDENTITY_CONFLICT' });
  await assert.rejects(ledger.append(event({ occurredAt: '2026-09-19T15:30:00Z' })), { code: 'GHL_ACTIVITY_IDENTITY_CONFLICT' });
  assert.equal(fake.records.size, 1); assert.equal(fake.relations.length, 1);
});

test('historical activity stays historical when the same event later arrives live', async () => {
  const fake = fakeGhl(); const ledger = fake.ledger();
  await ledger.append(event({ historical: true }));
  const result = await ledger.append(event({ historical: false }));
  assert.equal(result.created, false); assert.equal(result.historical, true);
  assert.equal(deriveActivityMetrics(await ledger.list()).emailsSent, 1);
});

test('a reused event ID cannot silently substitute another CRM entity or paid amount', async () => {
  for (const [eventType, entity, original, other] of [
    ['appointment_confirmed', 'appointmentId', 'appointment-1', 'appointment-2'],
    ['customer_closed', 'opportunityId', 'opportunity-1', 'opportunity-2'],
    ['revenue_received', 'transactionId', 'transaction-1', 'transaction-2'],
  ]) {
    const fake = fakeGhl(); const ledger = fake.ledger();
    const input = event({ source: 'ghl', eventType, [entity]: original,
      ...(eventType === 'revenue_received' ? { revenueValue: 100.25, currency: 'USD', revenueVerified: true } : {}) });
    await ledger.append(input);
    await assert.rejects(ledger.append({ ...input, [entity]: other }), { code: 'GHL_ACTIVITY_IDENTITY_CONFLICT' });
    if (eventType === 'revenue_received') {
      await assert.rejects(ledger.append({ ...input, revenueValue: 500 }), { code: 'GHL_ACTIVITY_IDENTITY_CONFLICT' });
      await assert.rejects(ledger.append({ ...input, currency: 'EUR' }), { code: 'GHL_ACTIVITY_IDENTITY_CONFLICT' });
    }
    assert.equal(fake.records.size, 1);
  }
});

test('two explicit provider message IDs cannot share one immutable event ID even at the same timestamp', async () => {
  const fake = fakeGhl(); const ledger = fake.ledger();
  await ledger.append(event({ messageId: 'message-1' }));
  await assert.rejects(ledger.append(event({ messageId: 'message-2' })), { code: 'GHL_ACTIVITY_IDENTITY_CONFLICT' });
  assert.equal(deriveActivityMetrics([...fake.records.values()]).emailsSent, 1);
});

test('contact association orientation uses the provisioned object order', async () => {
  const fake = fakeGhl(); const result = await fake.ledger({ contactIsFirst: true }).append(event());
  assert.equal(fake.relations[0].firstRecordId, 'contact-1');
  assert.equal(fake.relations[0].secondRecordId, result.record.id);
});

test('malformed live relation response fails closed and keeps durable activity for recovery', async () => {
  const fake = fakeGhl(); fake.state.malformedRelations = true;
  await assert.rejects(fake.ledger().append(event()), { code: 'GHL_ACTIVITY_INVALID_RELATION_RESPONSE' });
  assert.equal(fake.records.size, 1); assert.equal(fake.relations.length, 0);
});

test('GET and paginated search preserve history and exact contact/campaign boundaries', async () => {
  const fake = fakeGhl(); const ledger = fake.ledger({ pageLimit: 2 });
  const first = await ledger.append(event());
  await ledger.append(event({ eventId: 'event-2', campaignId: 'campaign-2' }));
  await ledger.append(event({ eventId: 'event-3', contactId: 'contact-10' }));
  await ledger.append(event({ eventId: 'event-4', contactId: 'contact-1', occurredAt: '2026-09-17T15:30:00Z' }));
  assert.equal((await ledger.get(first.record.id)).properties.contact_id, 'contact-1');
  const list = await ledger.list({ contactId: 'contact-1', campaignId: 'campaign-1' });
  assert.equal(list.length, 2);
  assert.equal(list[0].properties.source_event_id, 'event-4');
  assert.ok(list.every((r) => r.properties.contact_id === 'contact-1' && r.properties.campaign_id === 'campaign-1'));
  assert.ok(fake.calls.some((c) => c.body?.page > 1 && c.body.searchAfter.length));
});

test('search refuses query operators and incomplete pagination instead of reporting partial totals', async () => {
  const fake = fakeGhl(); const ledger = fake.ledger({ pageLimit: 1, maxPages: 2 });
  await ledger.append(event()); await ledger.append(event({ eventId: 'event-2' })); await ledger.append(event({ eventId: 'event-3' }));
  await assert.rejects(ledger.list({ contactId: 'contact-1 OR *' }), /Unsafe search/);
  await assert.rejects(ledger.list(), { code: 'GHL_ACTIVITY_HISTORY_LIMIT' });
  fake.state.stalledSearch = true;
  await assert.rejects(ledger.list(), { code: 'GHL_ACTIVITY_PAGINATION_STALLED' });
});

test('bare contact and campaign search paginates broad matches before exact filtering and excludes receipts by default', async () => {
  const fake = fakeGhl(); const ledger = fake.ledger({ pageLimit: 1 });
  const wanted = await ledger.append(event());
  await ledger.recordEffectCompletion(wanted.record, 'readable-note', 'note-1');
  // Text matches in a different searchable property and ID prefixes are not
  // the requested contact/campaign, even though the provider returns them.
  await ledger.append(event({ eventId: 'other-contact', contactId: 'contact-10', campaignId: 'campaign-10' }));
  await ledger.append(event({ eventId: 'cross-field', contactId: 'unrelated-contact', campaignId: 'contact-1' }));
  await ledger.append(event({ eventId: 'cross-field-campaign', contactId: 'campaign-1', campaignId: 'unrelated-campaign' }));

  const contactHistory = await ledger.list({ contactId: 'contact-1' });
  assert.deepEqual(contactHistory.map(r => r.id), [wanted.record.id]);
  const campaignHistory = await ledger.list({ campaignId: 'campaign-1' });
  assert.deepEqual(campaignHistory.map(r => r.id), [wanted.record.id]);
  const withReceipts = await ledger.list({ contactId: 'contact-1', campaignId: 'campaign-1', includeReceipts: true });
  assert.equal(withReceipts.length, 2);
  assert.ok(withReceipts.every(r => r.properties.contact_id === 'contact-1' && r.properties.campaign_id === 'campaign-1'));
  assert.equal(deriveActivityMetrics(withReceipts).emailsSent, 1);
  const searches = fake.calls.filter(call => call.url.endsWith('/records/search'));
  assert.ok(searches.some(call => call.body.query === 'contact-1' && call.body.page >= 4));
  assert.ok(searches.some(call => call.body.query === 'campaign-1' && call.body.page >= 4));
  assert.ok(searches.every(call => !call.body.query.includes(':')));
});

test('broken primary uniqueness is detected rather than choosing one duplicate arbitrarily', async () => {
  const fake = fakeGhl(); const ledger = fake.ledger(); const saved = await ledger.append(event());
  fake.records.set('record-2', { ...structuredClone(saved.record), id: 'record-2' });
  await assert.rejects(ledger.findByEventId(activityEventId(event())), { code: 'GHL_ACTIVITY_UNIQUENESS_BROKEN' });
});

test('completed-effect receipts are idempotent audit records and excluded from activity totals', async () => {
  const fake = fakeGhl(); const ledger = fake.ledger(); const { record } = await ledger.append(event());
  assert.equal(await ledger.completedEffect(record, 'stop-sequence'), null);
  const receipt = await ledger.recordEffectCompletion(record, 'stop-sequence', 'remote-stop-ref');
  const duplicate = await ledger.recordEffectCompletion(record, 'stop-sequence', 'remote-stop-ref', '2026-09-26T00:00:00Z');
  assert.equal(receipt.created, true); assert.equal(duplicate.created, false);
  assert.equal((await ledger.completedEffect(record, 'stop-sequence')).id, receipt.record.id);
  assert.equal((await ledger.list({ contactId: 'contact-1' })).length, 1);
  assert.equal((await ledger.list({ contactId: 'contact-1', includeReceipts: true })).length, 2);
  assert.equal(deriveActivityMetrics([...fake.records.values()]).activityEvents, 1);
});

test('authentication errors retain failure and do not masquerade as duplicate deliveries', async () => {
  const calls = [];
  const ledger = createGhlActivityLedger({ token: 'secret-test', locationId: 'location-1', associationId: 'association-1', uniqueEventIdVerified: true,
    fetchImpl: async (...args) => { calls.push(args); return response({ token: 'never-print', reply: 'private contents' }, 401); } });
  await assert.rejects(ledger.append(event()), (error) => error.status === 401 && !error.message.includes('private') && !error.message.includes('never-print'));
  assert.equal(calls.length, 1);
});

test('only actual confirmed GHL appointments count and imports never imply advertising conversions', () => {
  const records = [
    event({ eventId: 'sent' }), event({ eventId: 'auto', eventType: 'auto_reply_received' }),
    event({ eventId: 'reply', eventType: 'reply_received', historical: true }),
    event({ eventId: 'interested', eventType: 'lead_interested' }),
    event({ eventId: 'status-only', eventType: 'meeting_booked' }),
    event({ eventId: 'confirmed', source: 'ghl', eventType: 'appointment_confirmed', appointmentId: 'appointment-1' }),
    event({ eventId: 'confirmed-again', source: 'ghl', eventType: 'appointment_confirmed', appointmentId: 'appointment-1' }),
    event({ eventId: 'attended', source: 'ghl', eventType: 'appointment_attended', appointmentId: 'appointment-1' }),
    event({ eventId: 'won', source: 'ghl', eventType: 'customer_closed' }),
  ].map((e) => ({ properties: activityProperties(e) }));
  const metrics = deriveActivityMetrics([...records, records[0]]);
  assert.equal(metrics.uniqueProspectsContacted, 1); assert.equal(metrics.emailsSent, 1);
  assert.equal(metrics.replies, 1); assert.equal(metrics.automaticReplies, 1); assert.equal(metrics.interestedProspects, 1);
  assert.equal(metrics.appointmentsBooked, 1); assert.equal(metrics.appointmentsAttended, 1); assert.equal(metrics.customersWon, 1);
  assert.deepEqual(metrics.revenueByCurrency, {});
  assert.equal('conversions' in metrics, false);
});

test('revenue requires verified transaction identity; multiple status events cannot inflate it', () => {
  const revenue = event({ eventId: 'payment-1', source: 'ghl', eventType: 'revenue_received', transactionId: 'transaction-1', revenueValue: 100.25, currency: 'USD', revenueVerified: true });
  assert.throws(() => activityProperties({ ...revenue, revenueVerified: false }), /verified transaction/);
  assert.throws(() => activityProperties({ ...revenue, eventType: 'customer_closed' }), /verified transaction/);
  assert.throws(() => activityProperties({ ...revenue, revenueValue: -1 }), /verified transaction/);
  assert.throws(() => activityProperties({ ...revenue, transactionId: '' }), /verified transaction/);
  const first = { properties: activityProperties(revenue) };
  const second = { properties: activityProperties({ ...revenue, eventId: 'another-notification' }) };
  assert.deepEqual(deriveActivityMetrics([first, second, first]).revenueByCurrency, { USD: 100.25 });
  const conflict = { properties: activityProperties({ ...revenue, eventId: 'wrong-amount', revenueValue: 500 }) };
  assert.throws(() => deriveActivityMetrics([first, conflict]), { code: 'GHL_ACTIVITY_REVENUE_CONFLICT' });
});

test('account and campaign events retain history without artificial contacts or associations', async () => {
  const fake = fakeGhl(); const ledger = fake.ledger();
  const account = await ledger.append(event({ eventId: 'account-error-1', eventType: 'account_error', eventScope: 'account', contactId: '', campaignId: '' }));
  const campaign = await ledger.append(event({ eventId: 'campaign-completed-1', eventType: 'campaign_completed', eventScope: 'campaign', contactId: '' }));
  assert.equal(account.record.properties.event_scope, 'account');
  assert.equal(campaign.record.properties.event_scope, 'campaign');
  assert.equal(fake.relations.length, 0);
  assert.equal(fake.calls.some((c) => c.url.includes('/associations/')), false);
  assert.equal((await ledger.list({ campaignId: 'campaign-1' })).length, 1);
  assert.equal((await ledger.list({ contactId: 'contact-1' })).length, 0);
  assert.equal(deriveActivityMetrics([...fake.records.values()]).activityEvents, 2);
  const anonymousSent = { properties: activityProperties(event({ eventScope: 'campaign', contactId: '' })) };
  assert.equal(deriveActivityMetrics([anonymousSent]).uniqueProspectsContacted, 0);
});

test('explicit event scopes require their own identity and do not relax ordinary contact validation', () => {
  assert.throws(() => activityProperties(event({ contactId: '' })), /contactId/);
  assert.throws(() => activityProperties(event({ eventScope: 'campaign', contactId: '', campaignId: '' })), /campaignId/);
  assert.throws(() => activityProperties(event({ eventScope: 'account', contactId: '', workspaceId: '', senderInbox: '' })), /Account activity/);
  assert.throws(() => activityProperties(event({ eventScope: 'anything' })), /eventScope/);
});

test('a proven sent message with differing provider timestamps remains one send and exposes the discrepancy', async () => {
  const fake = fakeGhl(); const ledger = fake.ledger();
  const original = await ledger.append(event({ messageId: 'email-message-1' }));
  const duplicate = await ledger.append(event({ messageId: 'email-message-1', occurredAt: '2026-09-18T15:30:05Z', historical: true }));
  assert.equal(duplicate.created, false);
  assert.equal(duplicate.record.properties.occurred_at, original.record.properties.occurred_at);
  assert.deepEqual(duplicate.timestampDiscrepancy, { storedOccurredAt: '2026-09-18T15:30:00.000Z', incomingOccurredAt: '2026-09-18T15:30:05.000Z', messageId: 'email-message-1' });
  assert.equal(deriveActivityMetrics([...fake.records.values()]).emailsSent, 1);
  await assert.rejects(ledger.append(event({ messageId: 'other-message', occurredAt: '2026-09-18T15:30:05Z' })), { code: 'GHL_ACTIVITY_IDENTITY_CONFLICT' });
});
