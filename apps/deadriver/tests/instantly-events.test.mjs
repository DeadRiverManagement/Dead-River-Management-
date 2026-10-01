import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INSTANTLY_EVENT_TYPES,
  normalizeInstantlyEvent,
  normalizeInstantlyHistoricalEmail,
  instantlyEventPlan,
  instantlyLeadSnapshot,
  instantlyActivityText,
  verifyInstantlyWebhookSecret,
} from '../api/_lib/instantly-events.js';

const payload = (extra = {}) => ({
  timestamp: '2026-09-23T10:30:20.123Z',
  event_type: 'email_sent',
  workspace: 'workspace-1',
  campaign_id: 'campaign-1',
  campaign_name: 'DemandFlow test',
  lead_email: 'INTEGRATION.TEST@example.test',
  email_account: 'sender@example.test',
  step: 1,
  variant: 2,
  email_id: 'email-1',
  ...extra,
});

test('GHL missing-value null strings cannot create another event identity or hide reply content', () => {
  const original = normalizeInstantlyEvent(
    payload({
      event_type: 'reply_received',
      email_id: undefined,
      email_account: undefined,
      step: undefined,
      variant: undefined,
      reply_text_snippet: 'A readable reply',
    }),
  );
  const forwarded = normalizeInstantlyEvent(
    payload({
      event_type: 'reply_received',
      email_id: 'null',
      email_account: 'null',
      step: 'null',
      variant: 'null',
      reply_text: 'null',
      reply_text_snippet: 'A readable reply',
      reply_subject: 'null',
      email_subject: 'null',
      lead_id: 'null',
    }),
  );
  assert.equal(original.eventKey, forwarded.eventKey);
  assert.equal(forwarded.bodyText, 'A readable reply');
  assert.equal(forwarded.leadId, '');
});

test('all documented activity remains CRM activity, never an ad Lead or send instruction', () => {
  for (const type of INSTANTLY_EVENT_TYPES) {
    const event = normalizeInstantlyEvent(payload({ event_type: type }));
    assert.equal(event.category, 'standard');
    assert.equal(event.type, type);
    assert.equal(event.conversionAllowed, false);
    assert.equal(event.outreachAllowed, false);
    assert.equal(instantlyEventPlan(event).conversionAllowed, false);
    assert.equal(instantlyEventPlan(event).outreachAllowed, false);
  }
});

test('retries ignore delivery metadata, arrival time and mutable lead enrichment', () => {
  const first = normalizeInstantlyEvent(payload());
  const retry = normalizeInstantlyEvent(
    payload({
      id: 'retry-2',
      retry_count: 2,
      firstName: 'Test',
      campaign_name: 'Renamed',
    }),
  );
  assert.equal(first.eventKey, retry.eventKey);
  assert.equal(first.messageKey, retry.messageKey);
  assert.equal(first.email, 'integration.test@example.test');
});

test('campaign, workspace, sequence and original time keep distinct events distinct', () => {
  const original = normalizeInstantlyEvent(
    payload({ event_type: 'email_opened' }),
  );
  for (const change of [
    { campaign_id: 'campaign-2' },
    { workspace: 'workspace-2' },
    { step: 2 },
    { variant: 3 },
    { timestamp: '2026-09-23T10:30:20.124Z' },
  ]) {
    const next = normalizeInstantlyEvent(
      payload({ event_type: 'email_opened', ...change }),
    );
    assert.notEqual(original.eventKey, next.eventKey);
    assert.equal(next.messageKey, '');
  }
});

test('GHL string scalars retain provider identity and explicit false values', () => {
  const original = normalizeInstantlyEvent(payload({ is_first: false }));
  const forwarded = normalizeInstantlyEvent(
    payload({ step: '1', variant: '2', is_first: 'false' }),
  );
  assert.equal(forwarded.eventKey, original.eventKey);
  assert.equal(forwarded.isFirst, false);
  assert.equal(
    normalizeInstantlyEvent(payload({ is_first: 'true' })).isFirst,
    true,
  );
  const missing = normalizeInstantlyEvent(
    payload({ step: undefined, variant: undefined }),
  );
  const empty = normalizeInstantlyEvent(
    payload({ step: '', variant: '', is_first: '' }),
  );
  assert.equal(empty.eventKey, missing.eventKey);
  assert.equal(empty.isFirst, null);
});

test('message identity dedupes a sent message across API history with different step representation', () => {
  const live = normalizeInstantlyEvent(payload());
  const imported = normalizeInstantlyHistoricalEmail(
    {
      id: 'email-1',
      lead: 'integration.test@example.test',
      organization_id: 'workspace-1',
      campaign_id: 'campaign-1',
      timestamp_email: payload().timestamp,
      step: 'step-uuid',
      eaccount: 'sender@example.test',
    },
    { direction: 'sent' },
  );
  assert.equal(live.messageKey, imported.messageKey);
  assert.equal(imported.historical, true);
  assert.equal(imported.conversionAllowed, false);
});

test('reply IDs are not assumed to be distinct reply identities', () => {
  const one = normalizeInstantlyEvent(
    payload({ event_type: 'reply_received' }),
  );
  const two = normalizeInstantlyEvent(
    payload({
      event_type: 'reply_received',
      timestamp: '2026-09-23T10:31:20.123Z',
    }),
  );
  assert.equal(one.messageKey, '');
  assert.notEqual(one.eventKey, two.eventKey);
  const absent = {
    event_type: 'reply_received',
    email_id: undefined,
    reply_text: 'Yes please',
  };
  assert.notEqual(
    normalizeInstantlyEvent(payload(absent)).eventKey,
    normalizeInstantlyEvent(
      payload({ ...absent, reply_text: 'One other question' }),
    ).eventKey,
  );
});

test('link subscription aliases converge while arbitrary labels require account inventory', () => {
  const sent = normalizeInstantlyEvent(
    payload({ event_type: 'email_link_clicked' }),
  );
  const delivered = normalizeInstantlyEvent(
    payload({ event_type: 'link_clicked' }),
  );
  assert.equal(sent.eventKey, delivered.eventKey);
  assert.equal(sent.rawType, 'email_link_clicked');
  const custom = payload({ event_type: 'Follow up in October' });
  assert.equal(normalizeInstantlyEvent(custom).category, 'unmapped');
  const configured = normalizeInstantlyEvent(custom, {
    customLabels: ['Follow up in October'],
  });
  assert.equal(configured.category, 'custom_label');
  assert.equal(instantlyEventPlan(configured).milestone, null);
  const oddLabel = normalizeInstantlyEvent(
    payload({ event_type: '__proto__' }),
    { customLabels: ['__proto__'] },
  );
  assert.equal(oddLabel.type, '__proto__');
  assert.equal(instantlyEventPlan(oddLabel).milestone, null);
  assert.equal(instantlyEventPlan(oddLabel).metric, null);
});

test('no invented timestamp or inferred contact for malformed events', () => {
  for (const change of [
    { timestamp: null },
    { timestamp: 'yesterday' },
    { timestamp: '2026-09-23' },
    { lead_email: 'not-an-email' },
    { workspace: '' },
  ]) {
    assert.throws(() => normalizeInstantlyEvent(payload(change)), TypeError);
  }
  const account = normalizeInstantlyEvent(
    payload({ event_type: 'account_error', lead_email: null }),
  );
  assert.equal(account.email, '');
  assert.deepEqual(instantlyEventPlan(account).addTags, []);
});

test('historical imports keep dates, replies and campaigns without triggering live progression', () => {
  const event = normalizeInstantlyHistoricalEmail(
    {
      id: 'reply-9',
      organization_id: 'workspace-1',
      lead: 'integration.test@example.test',
      campaign_id: 'campaign-old',
      timestamp_email: '2025-01-02T12:00:00Z',
      timestamp_created: '2026-09-24T12:00:00Z',
      is_auto_reply: 1,
      body: { text: 'I am out of office.', html: '<p>I am out of office.</p>' },
    },
    { direction: 'received', campaignName: 'Original campaign' },
  );
  assert.equal(event.type, 'auto_reply_received');
  assert.equal(event.occurredAt, '2025-01-02T12:00:00.000Z');
  assert.equal(event.campaignId, 'campaign-old');
  assert.equal(event.bodyText, 'I am out of office.');
  assert.equal(instantlyEventPlan(event).milestone, null);
  assert.throws(() =>
    normalizeInstantlyHistoricalEmail({}, { direction: 'sent' }),
  );
});

test('trusted import mode cannot be supplied or disabled by webhook data', () => {
  const live = normalizeInstantlyEvent(
    payload({ event_type: 'lead_interested', historical: true }),
  );
  assert.equal(live.historical, false);
  assert.equal(instantlyEventPlan(live).milestone, 'interested');
  const imported = normalizeInstantlyEvent(
    payload({ event_type: 'lead_closed', historical: false }),
    { historical: true },
  );
  assert.equal(instantlyEventPlan(imported).milestone, null);
  assert.equal(instantlyEventPlan(imported).reportedMilestone, 'customer_won');
  assert.equal(instantlyEventPlan(imported).conversionAllowed, false);
});

test('snapshot aggregate counts are not fabricated historical events or send totals', () => {
  const snapshot = instantlyLeadSnapshot({
    id: 'lead-1',
    organization: 'workspace-1',
    email: 'integration.test@example.test',
    campaign: 'campaign-old',
    timestamp_created: '2025-01-02T12:00:00Z',
    email_open_count: 9,
    email_reply_count: 2,
    email_click_count: 1,
    status: -2,
  });
  assert.equal(snapshot.opens, 9);
  assert.equal(snapshot.replies, 2);
  assert.equal(snapshot.emailsSent, null);
  assert.equal(snapshot.sendingStatus, -2);
  assert.equal(snapshot.outreachAllowed, false);
  assert.equal(snapshot.conversionAllowed, false);
});

test('readable activity retains original text and supplied safe Instantly conversation URL', () => {
  const event = normalizeInstantlyEvent(
    payload({
      event_type: 'reply_received',
      reply_text: 'Yes, Tuesday works.\nThank you.',
      reply_html: '<img src=x onerror=alert(1)>',
      reply_subject: 'A test reply',
      unibox_url: 'https://app.instantly.ai/app/unibox?thread=reply-9',
    }),
  );
  const note = instantlyActivityText(event);
  assert.match(note, /Yes, Tuesday works\.\nThank you\./);
  assert.match(note, /Original event time: 2026-09-23T10:30:20.123Z/);
  assert.match(note, /Campaign ID: campaign-1/);
  assert.match(note, /https:\/\/app.instantly.ai\/app\/unibox/);
  assert.doesNotMatch(note, /onerror/);
  assert.equal(
    normalizeInstantlyEvent(
      payload({ unibox_url: 'https://app.instantly.ai.evil.test/' }),
    ).conversationUrl,
    '',
  );
});

test('source is assigned only when empty and cold SMS exclusion is additive', () => {
  const plan = instantlyEventPlan(normalizeInstantlyEvent(payload()));
  assert.equal(plan.sourceIfEmpty, 'Instantly / cold email');
  assert.equal(plan.excludeColdSms, true);
  assert.ok(plan.addTags.includes('drm-exclude-cold-sms'));
  assert.equal(plan.milestone, null);
  assert.match(plan.uniqueProspectKey, /^instantly:prospect:/);
});

test('shared webhook header verification rejects missing, weak and incorrect secrets', () => {
  const expected = 'a'.repeat(48);
  assert.equal(verifyInstantlyWebhookSecret(expected, expected), true);
  assert.equal(verifyInstantlyWebhookSecret('b'.repeat(48), expected), false);
  assert.equal(verifyInstantlyWebhookSecret('', expected), false);
  assert.equal(verifyInstantlyWebhookSecret('short', 'short'), false);
  assert.equal(verifyInstantlyWebhookSecret(undefined, expected), false);
});
