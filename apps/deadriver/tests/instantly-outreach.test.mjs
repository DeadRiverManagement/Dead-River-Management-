import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OUTREACH_CONTACT_FIELDS,
  readOutreachConfig,
  readOutreachFieldMap,
  instantlyLedgerEvent,
  outreachContactProjection,
  processInstantlyOutreach,
  createGhlOutreachClient,
  readVisibleOutreachHistory,
  outreachEngagementMetrics,
} from '../api/_lib/outreach-sync.js';
import { activityProperties } from '../api/_lib/ghl-activity.js';
import { normalizeInstantlyEvent } from '../api/_lib/instantly-events.js';
import { createInstantlyWebhookHandler } from '../api/instantly-webhook.js';

const email = 'integration.test@example.test';
const fieldMap = Object.fromEntries(
  OUTREACH_CONTACT_FIELDS.map(({ key }, index) => [
    key,
    `fixture-field-${index}`,
  ]),
);
const env = () => ({
  VERCEL_ENV: 'production',
  ENABLE_INSTANTLY_GHL_SYNC: 'true',
  DRM_OUTREACH_WEBHOOK_SECRET:
    'fixture-webhook-secret-with-at-least-32-characters',
  GHL_OUTREACH_PIT: 'fixture-ghl-outreach-token',
  GHL_LOCATION_ID: 'fixture-location',
  INSTANTLY_API_KEY: 'fixture-instantly-api-key',
  INSTANTLY_WORKSPACE_ID: 'fixture-workspace',
  INSTANTLY_CAMPAIGN_IDS: '["fixture-campaign"]',
  GHL_OUTREACH_FIELD_IDS: JSON.stringify(fieldMap),
  GHL_ACTIVITY_ASSOCIATION_ID: 'fixture-association',
  GHL_COLD_EMAIL_PIPELINE_ID: 'fixture-pipeline',
  GHL_COLD_EMAIL_INTERESTED_STAGE_ID: 'fixture-interested',
  GHL_COLD_EMAIL_PRIOR_STAGE_IDS: '["fixture-contacted"]',
  GHL_ACTIVITY_UNIQUE_EVENT_ID_VERIFIED: 'true',
  GHL_CONTACT_DEDUPLICATION_VERIFIED: 'true',
  GHL_OPPORTUNITY_DEDUPLICATION_VERIFIED: 'true',
  GHL_OUTREACH_AUTOMATIONS_REVIEWED: 'true',
  ENABLE_INSTANTLY_HISTORY_IMPORT: 'true',
  GHL_HISTORICAL_IMPORT_SAFE: 'true',
});
const payload = (extra = {}) => ({
  event_type: 'email_sent',
  timestamp: '2026-09-23T10:30:20Z',
  workspace: 'fixture-workspace',
  campaign_id: 'fixture-campaign',
  campaign_name: 'Integration test campaign',
  lead_email: email,
  email_account: 'sender@example.test',
  email_id: 'fixture-email',
  ...extra,
});
const event = (extra = {}, options = {}) =>
  normalizeInstantlyEvent(payload(extra), options);

function fixture() {
  let contact = {
    id: 'fixture-contact',
    locationId: 'fixture-location',
    email,
    source: 'Facebook Ads',
    tags: ['keep-existing'],
    customFields: [{ id: fieldMap.original_source, value: 'Facebook Ads' }],
  };
  const records = new Map();
  const receipts = new Map();
  const calls = [];
  let notes = 0;
  const ghl = {
    async matchOrCreateContact() {
      calls.push('matchContact');
      return contact;
    },
    async getContact() {
      return contact;
    },
    async ensureActivityNote() {
      calls.push('note');
      notes += 1;
      return `fixture-note-${notes}`;
    },
    async addTags(id, tags) {
      calls.push('tags');
      contact.tags = [...new Set([...contact.tags, ...tags])];
    },
    async updateProjection(original, projection) {
      calls.push('projection');
      assert.equal(original.source, 'Facebook Ads');
      const merged = new Map(
        contact.customFields.map((field) => [field.id, field]),
      );
      for (const field of projection.fields)
        merged.set(field.id, { id: field.id, value: field.fieldValue });
      contact = { ...contact, customFields: [...merged.values()] };
      if (projection.unsubscribed)
        contact.dndSettings = { email: { status: 'active' } };
      return contact;
    },
    async moveInterested() {
      calls.push('interested');
      return { id: 'fixture-opportunity' };
    },
  };
  const ledger = {
    async append(input) {
      const properties = activityProperties(input);
      const existing = records.get(properties.event_id);
      if (existing)
        return {
          record: existing,
          created: false,
          historical: existing.properties.historical === 1,
        };
      const record = { id: `fixture-record-${records.size + 1}`, properties };
      records.set(properties.event_id, record);
      return { record, created: true, historical: input.historical };
    },
    async list() {
      return [...records.values()];
    },
    async completedEffect(record, key) {
      return receipts.get(`${record.id}:${key}`);
    },
    async recordEffectCompletion(record, key, reference) {
      receipts.set(`${record.id}:${key}`, { reference });
    },
  };
  const instantly = new Proxy(
    {},
    {
      get() {
        throw new Error('Unexpected Instantly call');
      },
    },
  );
  return {
    ghl,
    ledger,
    instantly,
    calls,
    records,
    receipts,
    contact: () => contact,
    notes: () => notes,
  };
}

test('full live config requires real mappings and explicit verified safeguards', () => {
  const configured = readOutreachConfig(env());
  assert.equal(configured.token, 'fixture-ghl-outreach-token');
  assert.equal(configured.interestedStageId, 'fixture-interested');
  for (const key of [
    'GHL_OUTREACH_FIELD_IDS',
    'GHL_LOCATION_ID',
    'GHL_ACTIVITY_ASSOCIATION_ID',
    'INSTANTLY_API_KEY',
  ]) {
    const settings = env();
    delete settings[key];
    assert.throws(() => readOutreachConfig(settings));
  }
  for (const key of [
    'GHL_ACTIVITY_UNIQUE_EVENT_ID_VERIFIED',
    'GHL_CONTACT_DEDUPLICATION_VERIFIED',
    'GHL_OPPORTUNITY_DEDUPLICATION_VERIFIED',
    'GHL_OUTREACH_AUTOMATIONS_REVIEWED',
  ]) {
    assert.throws(
      () => readOutreachConfig({ ...env(), [key]: 'false' }),
      /UNVERIFIED/,
    );
  }
  assert.throws(
    () => readOutreachConfig({ ...env(), VERCEL_ENV: 'preview' }),
    /NOT_ENABLED/,
  );
  assert.throws(() =>
    readOutreachConfig(
      { ...env(), GHL_HISTORICAL_IMPORT_SAFE: 'false' },
      { historical: true },
    ),
  );
  assert.equal(
    readOutreachFieldMap({
      ...fieldMap,
      instantly_replies: fieldMap.instantly_opens,
    }),
    null,
  );
});

test('ledger mapping uses stable sent message ID, never a history run or delivery ID', () => {
  const live = instantlyLedgerEvent(event(), 'fixture-contact');
  const historical = instantlyLedgerEvent(
    event({ campaign_name: 'Renamed' }, { historical: true }),
    'fixture-contact',
  );
  assert.equal(live.eventId, historical.eventId);
  assert.equal(live.eventType, 'email_sent');
  assert.equal(live.source, 'instantly');
  assert.equal(live.historical, false);
  assert.equal(historical.historical, true);
});

test('duplicate delivery keeps one ledger fact, note, and email count; preserves existing source/tags', async () => {
  const f = fixture();
  const config = readOutreachConfig(env());
  const first = await processInstantlyOutreach(event(), config, f);
  const repeated = await processInstantlyOutreach(event(), config, f);
  assert.equal(first.disposition, 'recorded');
  assert.equal(repeated.disposition, 'reconciled');
  assert.equal(f.records.size, 1);
  assert.equal(f.notes(), 1);
  const fields = Object.fromEntries(
    f.contact().customFields.map((field) => [field.id, field.value]),
  );
  assert.equal(fields[fieldMap.instantly_emails_sent], '1');
  assert.equal(fields[fieldMap.original_source], 'Facebook Ads');
  assert.equal(f.contact().source, 'Facebook Ads');
  assert.ok(f.contact().tags.includes('keep-existing'));
  assert.ok(f.contact().tags.includes('drm-exclude-cold-sms'));
  assert.ok(!f.calls.includes('interested'));
  assert.equal(first.conversionSent, false);
});

test('interested maps once to configured in-conversation milestone, never qualified or won', async () => {
  const f = fixture();
  const config = readOutreachConfig(env());
  const interested = event({ event_type: 'lead_interested' });
  await processInstantlyOutreach(interested, config, f);
  await processInstantlyOutreach(interested, config, f);
  assert.equal(f.calls.filter((name) => name === 'interested').length, 1);
  assert.equal(
    [...f.records.values()][0].properties.event_type,
    'lead_interested',
  );
});

test('historical interested or customer statuses never move stage, stop sequences, or fire conversions', async () => {
  for (const type of ['lead_interested', 'lead_closed', 'lead_unsubscribed']) {
    const f = fixture();
    const config = readOutreachConfig(env(), { historical: true });
    const result = await processInstantlyOutreach(
      event({ event_type: type }, { historical: true }),
      config,
      f,
    );
    assert.equal(result.historical, true);
    assert.equal(result.conversionSent, false);
    assert.ok(!f.calls.includes('interested'));
    assert.deepEqual(f.contact().tags, ['keep-existing']);
    assert.ok(!f.calls.includes('tags'));
    assert.equal(f.contact().dndSettings, undefined);
  }
});

test('a live retry of a historical status cannot turn the imported fact into a live trigger', async () => {
  const f = fixture();
  const config = readOutreachConfig(env());
  await processInstantlyOutreach(
    event({ event_type: 'lead_interested' }, { historical: true }),
    config,
    f,
  );
  const liveRetry = await processInstantlyOutreach(
    event({ event_type: 'lead_interested' }),
    config,
    f,
  );
  assert.equal(liveRetry.historical, true);
  assert.ok(!f.calls.includes('interested'));
});

test('old historical data cannot replace latest campaign/activity in ledger projections', () => {
  const contact = fixture().contact();
  const newer = {
    properties: activityProperties(instantlyLedgerEvent(event(), contact.id)),
  };
  const older = {
    properties: activityProperties(
      instantlyLedgerEvent(
        event(
          {
            email_id: 'old-email',
            timestamp: '2024-01-02T03:04:05Z',
            campaign_id: 'old-campaign',
            campaign_name: 'Original campaign',
          },
          { historical: true },
        ),
        contact.id,
      ),
    ),
  };
  const projection = outreachContactProjection(
    [newer, older],
    contact,
    fieldMap,
  );
  const values = Object.fromEntries(
    projection.fields.map((field) => [field.id, field.fieldValue]),
  );
  assert.equal(values[fieldMap.instantly_first_campaign_id], 'old-campaign');
  assert.equal(
    values[fieldMap.instantly_latest_campaign_id],
    'fixture-campaign',
  );
  assert.equal(values[fieldMap.outreach_latest_at], '2026-09-23T10:30:20.000Z');
  assert.equal(values[fieldMap.instantly_emails_sent], '2');
  assert.equal(values[fieldMap.original_source], undefined);
});

test('campaign completion and account errors never create artificial contact records', async () => {
  for (const input of [
    { event_type: 'campaign_completed', lead_email: undefined },
    { event_type: 'account_error' },
  ]) {
    const f = fixture();
    const result = await processInstantlyOutreach(
      event(input),
      readOutreachConfig(env()),
      f,
    );
    assert.equal(result.contactCreated, false);
    assert.equal(f.calls.length, 0);
    assert.equal(f.records.size, 1);
  }
});

test('live projections retain snapshot campaign membership and existing original campaign without inventing sends', () => {
  const contact = fixture().contact();
  contact.customFields.push(
    { id: fieldMap.instantly_first_campaign_id, value: 'legacy-original' },
    {
      id: fieldMap.instantly_first_campaign_name,
      value: 'Original before available API history',
    },
    { id: fieldMap.instantly_campaign_ids, value: '["legacy-original"]' },
    { id: fieldMap.instantly_lead_ids, value: '["legacy-lead"]' },
  );
  const records = [
    {
      properties: activityProperties(instantlyLedgerEvent(event(), contact.id)),
    },
    {
      properties: activityProperties({
        source: 'instantly_snapshot',
        eventId: 'snapshot-original',
        eventType: 'instantly_lead_snapshot',
        workspaceId: 'fixture-workspace',
        contactId: contact.id,
        occurredAt: '2025-01-02T10:00:00Z',
        historical: true,
        campaignId: 'snapshot-campaign',
        campaignName: 'Snapshot membership',
        leadId: 'snapshot-lead',
      }),
    },
  ];
  const projection = outreachContactProjection(records, contact, fieldMap);
  const fields = Object.fromEntries(
    projection.fields.map((field) => [field.id, field.fieldValue]),
  );
  assert.deepEqual(JSON.parse(fields[fieldMap.instantly_campaign_ids]), [
    'legacy-original',
    'snapshot-campaign',
    'fixture-campaign',
  ]);
  assert.deepEqual(JSON.parse(fields[fieldMap.instantly_lead_ids]), [
    'legacy-lead',
    'snapshot-lead',
  ]);
  assert.equal(fields[fieldMap.instantly_first_campaign_id], 'legacy-original');
  assert.equal(
    fields[fieldMap.instantly_latest_campaign_id],
    'fixture-campaign',
  );
  assert.equal(fields[fieldMap.instantly_emails_sent], '1');
  contact.customFields.find(
    (field) => field.id === fieldMap.instantly_campaign_ids,
  ).value = 'not valid JSON';
  assert.throws(
    () => outreachContactProjection(records, contact, fieldMap),
    /EXISTING_COLLECTION_INVALID/,
  );
});

test('wrong workspace, campaign and ambiguous campaign identity fail before contact writes', async () => {
  for (const change of [
    { workspace: 'other-workspace' },
    { campaign_id: 'other-campaign' },
    { campaign_id: '' },
  ]) {
    const f = fixture();
    await assert.rejects(async () =>
      processInstantlyOutreach(event(change), readOutreachConfig(env()), f),
    );
    assert.equal(f.calls.length, 0);
  }
});

test('interested event cannot advance an unsubscribed contact into a new opportunity', async () => {
  const f = fixture();
  const config = readOutreachConfig(env());
  await processInstantlyOutreach(
    event({ event_type: 'lead_unsubscribed' }, { historical: true }),
    config,
    f,
  );
  await processInstantlyOutreach(
    event({ event_type: 'lead_interested', timestamp: '2026-09-24T10:30:20Z' }),
    config,
    f,
  );
  assert.ok(!f.calls.includes('interested'));
  assert.equal(f.contact().dndSettings.email.status, 'active');
});

test('ledger visibility failure is retryable and cannot write partial count projections', async () => {
  const f = fixture();
  f.ledger.list = async () => [];
  await assert.rejects(
    processInstantlyOutreach(event(), readOutreachConfig(env()), f),
    /NOT_YET_VISIBLE/,
  );
  assert.ok(!f.calls.includes('projection'));
});

test('acknowledged inserts receive bounded visibility retries before projecting contact totals', async () => {
  const record = { properties: { event_id: 'expected-event' } };
  let calls = 0;
  const waits = [];
  const ledger = { list: async () => (++calls < 3 ? [] : [record]) };
  assert.deepEqual(
    await readVisibleOutreachHistory(
      ledger,
      'fixture-contact',
      'expected-event',
      { wait: async (delay) => waits.push(delay) },
    ),
    [record],
  );
  assert.equal(calls, 3);
  assert.deepEqual(waits, [250, 750]);
  let exhaustedCalls = 0;
  await assert.rejects(
    readVisibleOutreachHistory(
      {
        list: async () => {
          exhaustedCalls += 1;
          return [];
        },
      },
      'fixture-contact',
      'missing',
      { wait: async () => {} },
    ),
    /NOT_YET_VISIBLE/,
  );
  assert.equal(exhaustedCalls, 4);
});

test('snapshot engagement baselines overlap safely and only dated later events add to the covered total', () => {
  const contactId = 'fixture-contact';
  const snapshot = (id, count, cutoff, campaignId = 'fixture-campaign') => ({
    properties: activityProperties({
      source: 'instantly_snapshot',
      eventId: id,
      eventType: 'instantly_lead_snapshot',
      historical: true,
      contactId,
      workspaceId: 'fixture-workspace',
      campaignId,
      leadId: 'fixture-lead',
      occurredAt: cutoff || '2025-01-03T10:00:00Z',
      replyText:
        'Historical API state, not a new inquiry or conversion.\n' +
        JSON.stringify({
          workspaceId: 'fixture-workspace',
          campaignId,
          leadId: 'fixture-lead',
          opens: count,
          lastOpenAt: cutoff,
          clicks: 0,
        }),
    }),
  });
  const opened = (id, timestamp) => ({
    properties: activityProperties(
      instantlyLedgerEvent(
        event({ event_type: 'email_opened', email_id: id, timestamp }),
        contactId,
      ),
    ),
  });
  const older = snapshot('snapshot-one', 8, '2025-01-03T10:00:00Z');
  const newer = snapshot('snapshot-two', 10, '2025-01-05T10:00:00Z');
  const events = [
    opened('first-open', '2025-01-02T10:00:00Z'),
    opened('next-open', '2025-01-04T10:00:00Z'),
  ];
  assert.equal(outreachEngagementMetrics([older, ...events]).opens, 9);
  assert.equal(
    outreachEngagementMetrics([older, newer, ...events, newer]).opens,
    10,
  );
  const after = opened('later-open', '2025-01-06T10:00:00Z');
  assert.equal(
    outreachEngagementMetrics([older, newer, ...events, after, after]).opens,
    11,
  );
  assert.equal(
    outreachEngagementMetrics([
      older,
      newer,
      ...events,
      after,
      snapshot('other-campaign', 3, '2025-01-03T10:00:00Z', 'other-campaign'),
    ]).opens,
    14,
  );
  assert.equal(
    outreachEngagementMetrics([snapshot('no-coverage', 500, null), ...events])
      .opens,
    2,
  );
});

function response() {
  return {
    statusCode: 0,
    body: null,
    headers: {},
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}
async function invoke(
  handler,
  body,
  {
    authorization = `Bearer ${env().DRM_OUTREACH_WEBHOOK_SECRET}`,
    method = 'POST',
  } = {},
) {
  const res = response();
  await handler({ method, headers: { authorization }, body }, res);
  return res;
}

test('dry sample validation authenticates and returns no PII or network side effects before live setup', async () => {
  const handler = createInstantlyWebhookHandler({
    env: { DRM_OUTREACH_WEBHOOK_SECRET: env().DRM_OUTREACH_WEBHOOK_SECRET },
    dependenciesFactory() {
      throw new Error('Dry run must not instantiate live clients');
    },
  });
  const result = await invoke(handler, {
    mode: 'validate',
    test: true,
    payload: payload({ reply_text: 'Private reply text' }),
  });
  assert.equal(result.statusCode, 200);
  assert.deepEqual(result.body, {
    ok: true,
    test: true,
    dryRun: true,
    category: 'standard',
    scope: 'contact',
    mutations: 0,
    conversions: 0,
  });
  assert.doesNotMatch(
    JSON.stringify(result.body),
    /example.test|Private|fixture-campaign/,
  );
});

test('endpoint rejects unsupported method, auth, missing mode, malformed timestamp and oversized data', async () => {
  const handler = createInstantlyWebhookHandler({
    env: env(),
    dependenciesFactory() {
      throw new Error('No client expected');
    },
  });
  assert.equal((await invoke(handler, {}, { method: 'GET' })).statusCode, 405);
  assert.equal(
    (await invoke(handler, {}, { authorization: 'Bearer wrong' })).statusCode,
    401,
  );
  assert.equal((await invoke(handler, payload())).statusCode, 400);
  assert.equal(
    (await invoke(handler, { mode: 'validate', payload: payload() }))
      .statusCode,
    400,
  );
  assert.equal(
    (
      await invoke(handler, {
        mode: 'live',
        payload: payload({ timestamp: null }),
      })
    ).statusCode,
    400,
  );
  assert.equal(
    (
      await invoke(handler, {
        mode: 'live',
        payload: payload({ reply_text: 'x'.repeat(200000) }),
      })
    ).statusCode,
    400,
  );
});

test('live receiver remains closed on preview, missing actual field IDs or unsafe historical automation', async () => {
  for (const settings of [
    { ...env(), VERCEL_ENV: 'preview' },
    { ...env(), GHL_OUTREACH_FIELD_IDS: undefined },
    { ...env(), GHL_OUTREACH_AUTOMATIONS_REVIEWED: 'false' },
  ]) {
    const handler = createInstantlyWebhookHandler({
      env: settings,
      dependenciesFactory() {
        throw new Error('No client expected');
      },
    });
    assert.equal(
      (await invoke(handler, { mode: 'live', payload: payload() })).statusCode,
      503,
    );
  }
  const handler = createInstantlyWebhookHandler({
    env: { ...env(), GHL_HISTORICAL_IMPORT_SAFE: 'false' },
  });
  assert.equal(
    (await invoke(handler, { mode: 'historical', payload: payload() }))
      .statusCode,
    503,
  );
});

test('successful webhook returns only a non-PII reference and no conversion claim', async () => {
  const f = fixture();
  const handler = createInstantlyWebhookHandler({
    env: env(),
    dependenciesFactory: () => f,
  });
  const result = await invoke(handler, { mode: 'live', payload: payload() });
  assert.equal(result.statusCode, 200);
  assert.equal(result.body.conversionSent, false);
  assert.match(result.body.eventReference, /^[a-f0-9]{16}$/);
  assert.doesNotMatch(
    JSON.stringify(result.body),
    /example.test|fixture-contact|fixture-campaign/,
  );
});

test('GHL forwarding preserves quoted multiline reply JSON and rejects broken template interpolation', async () => {
  const f = fixture();
  let captured;
  f.ghl.ensureActivityNote = async (id, incoming) => {
    captured = incoming;
    return 'fixture-forwarded-note';
  };
  const handler = createInstantlyWebhookHandler({
    env: env(),
    dependenciesFactory: () => f,
  });
  const reply =
    'Yes, "next Tuesday" works.\nPlease send the details.\nC:\\notes\\next-step';
  const forwarded = JSON.stringify({
    mode: 'live',
    payload: payload({
      event_type: 'reply_received',
      reply_text: reply,
      reply_subject: 'Re: "30 leads"',
    }),
  });
  const result = await invoke(handler, forwarded);
  assert.equal(result.statusCode, 200);
  assert.equal(captured.bodyText, reply);
  assert.doesNotMatch(
    JSON.stringify(result.body),
    /Tuesday|notes|example.test/,
  );
  const invalidTemplate =
    '{"mode":"live","payload":{"reply_text":"Yes, "Tuesday" works.\nThanks"}}';
  const rejected = await invoke(handler, invalidTemplate);
  assert.equal(rejected.statusCode, 400);
  assert.equal(rejected.body.error, 'invalid_envelope');
});

test('upstream failures are not acknowledged as success or exposed with private response data', async () => {
  const f = fixture();
  f.ledger.append = async () => {
    throw new Error(`secret ${email}`);
  };
  const handler = createInstantlyWebhookHandler({
    env: env(),
    dependenciesFactory: () => f,
  });
  const result = await invoke(handler, { mode: 'live', payload: payload() });
  assert.equal(result.statusCode, 502);
  assert.deepEqual(result.body, { ok: false, error: 'sync_incomplete_retry' });
});

test('GHL duplicate lookup must confirm exact email and location before updates or upserts', async () => {
  const calls = [];
  const client = createGhlOutreachClient({
    token: 'test',
    locationId: 'fixture-location',
    fetchImpl: async (url, options) => {
      calls.push({ url, options });
      return {
        ok: true,
        status: 200,
        json: async () =>
          url.includes('search/duplicate')
            ? { contact: { id: 'fixture-contact' } }
            : {
                contact: {
                  id: 'fixture-contact',
                  email: 'other@example.test',
                  locationId: 'fixture-location',
                },
              },
      };
    },
  });
  await assert.rejects(
    client.matchOrCreateContact(event()),
    /IDENTITY_MISMATCH/,
  );
  assert.ok(calls.every(({ options }) => options.method === 'GET'));
  assert.match(calls[0].url, /email=integration.test%40example.test/);
  assert.equal(client.sendMessage, undefined);
  assert.equal(client.enrollWorkflow, undefined);
});

test('GHL readable note reuses original event marker on sequential retry', async () => {
  const requests = [];
  const client = createGhlOutreachClient({
    token: 'test',
    locationId: 'fixture-location',
    fetchImpl: async (url, options) => {
      requests.push(options.method);
      return {
        ok: true,
        status: 200,
        json: async () => ({
          notes: [
            {
              id: 'note-original',
              body: '[DRM activity drm_ev_test] readable original reply',
            },
          ],
        }),
      };
    },
  });
  assert.equal(
    await client.ensureActivityNote('fixture-contact', event(), 'drm_ev_test'),
    'note-original',
  );
  assert.deepEqual(requests, ['GET']);
});

test('message timestamp discrepancies keep one immutable send and an audit receipt', async () => {
  const f = fixture();
  const originalAppend = f.ledger.append;
  f.ledger.append = async (input) => {
    const result = await originalAppend(input);
    if (
      !result.created &&
      result.record.properties.occurred_at !== input.occurredAt
    ) {
      result.timestampDiscrepancy = {
        storedOccurredAt: result.record.properties.occurred_at,
        incomingOccurredAt: input.occurredAt,
        messageId: input.messageId,
      };
    }
    return result;
  };
  const config = readOutreachConfig(env());
  await processInstantlyOutreach(event(), config, f);
  await processInstantlyOutreach(
    event({ timestamp: '2026-09-23T10:30:21Z' }, { historical: true }),
    config,
    f,
  );
  assert.equal(f.records.size, 1);
  assert.ok(
    [...f.receipts.keys()].some((key) =>
      key.endsWith(':source_timestamp_discrepancy'),
    ),
  );
  const count = f
    .contact()
    .customFields.find((field) => field.id === fieldMap.instantly_emails_sent);
  assert.equal(count.value, '1');
});

test('plain reply markup is escaped before creating a rich-text GHL note', async () => {
  let posted;
  const client = createGhlOutreachClient({
    token: 'test',
    locationId: 'fixture-location',
    fetchImpl: async (url, options) => {
      if (options.method === 'POST') posted = JSON.parse(options.body);
      return {
        ok: true,
        status: 200,
        json: async () =>
          options.method === 'GET'
            ? { notes: [] }
            : { note: { id: 'fixture-note' } },
      };
    },
  });
  await client.ensureActivityNote(
    'fixture-contact',
    event({
      event_type: 'reply_received',
      reply_text: '<img src=x onerror="alert(1)">Yes & thanks',
    }),
    'drm_ev_test',
  );
  assert.doesNotMatch(posted.body, /<img/);
  assert.match(posted.body, /&lt;img/);
  assert.match(posted.body, /Yes &amp; thanks/);
});
