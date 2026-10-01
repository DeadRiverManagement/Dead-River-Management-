import test from 'node:test';
import assert from 'node:assert/strict';
import { recoverInstantlyDeliveries } from '../api/_lib/instantly-recovery.js';
import { createInstantlyReconciliationHandler } from '../api/instantly-reconcile.js';

const now = () => Date.parse('2026-09-25T21:00:00Z');
const activatedAt = '2026-09-25T19:00:00Z';
const settings = {
  workspaceId: 'workspace-1',
  campaignIds: ['campaign-1'],
  customLabels: [],
};
const payload = {
  timestamp: '2026-09-25T20:00:00Z',
  workspace: 'workspace-1',
  campaign_id: 'campaign-1',
  event_type: 'reply_received',
  lead_email: 'qa@example.invalid',
  reply_text: 'A "quoted" reply\nNext line',
};
function fixture({
  eventPayload = payload,
  createdAt = payload.timestamp,
} = {}) {
  const receipts = [];
  const calls = [];
  const delivery = {
    id: 'delivery-1',
    organization_id: 'workspace-1',
    timestamp_created: createdAt,
  };
  const deps = {
    instantly: {
      listWebhookEvents: async () => ({ items: [delivery] }),
      getWebhookEvent: async () => ({ ...delivery, payload: eventPayload }),
    },
    ledger: {
      list: async () => receipts,
      findByEventId: async (eventId) => ({
        id: 'record-1',
        properties: { event_id: eventId },
      }),
      recordEffectCompletion: async (record, key, reference) =>
        receipts.push({
          properties: { event_type: key, effect_reference: reference },
        }),
    },
  };
  const processEvent = async (event) => calls.push(event);
  return { deps, receipts, calls, processEvent };
}
test('recovery preserves original event and retries only unfinished deliveries', async () => {
  const f = fixture();
  const first = await recoverInstantlyDeliveries(settings, f.deps, {
    activatedAt,
    now,
    processEvent: f.processEvent,
  });
  assert.equal(first.recovered, 1);
  assert.equal(first.conversions, 0);
  assert.equal(f.calls[0].occurredAt, '2026-09-25T20:00:00.000Z');
  assert.equal(f.calls[0].bodyText, payload.reply_text);
  assert.equal(f.calls[0].conversionAllowed, false);
  const second = await recoverInstantlyDeliveries(settings, f.deps, {
    activatedAt,
    now,
    processEvent: f.processEvent,
  });
  assert.equal(second.alreadyCompleted, 1);
  assert.equal(f.calls.length, 1);
});
test('failed downstream update retains no success receipt and can recover later', async () => {
  const f = fixture();
  const failed = await recoverInstantlyDeliveries(settings, f.deps, {
    activatedAt,
    now,
    processEvent: async () => {
      throw Error('temporary failure');
    },
  });
  assert.equal(failed.failed, 1);
  assert.equal(f.receipts.length, 0);
  assert.equal(
    (
      await recoverInstantlyDeliveries(settings, f.deps, {
        activatedAt,
        now,
        processEvent: f.processEvent,
      })
    ).recovered,
    1,
  );
});
test('recovery leaves five minutes for the primary workflow and never replays old history', async () => {
  for (const createdAt of ['2026-09-25T20:59:00Z', '2026-09-25T18:59:00Z']) {
    const f = fixture({ createdAt });
    const result = await recoverInstantlyDeliveries(settings, f.deps, {
      activatedAt,
      now,
      processEvent: f.processEvent,
    });
    assert.equal(result.skipped, 1);
    assert.equal(f.calls.length, 0);
  }
  const f = fixture({
    eventPayload: { ...payload, timestamp: '2026-09-25T18:59:00Z' },
  });
  await recoverInstantlyDeliveries(settings, f.deps, {
    activatedAt,
    now,
    processEvent: f.processEvent,
  });
  assert.equal(f.calls.length, 0);
});
test('wrong campaigns and workspace payloads cannot mutate contacts', async () => {
  for (const extra of [
    { campaign_id: 'other-campaign' },
    { workspace: 'other-workspace' },
  ]) {
    const f = fixture({ eventPayload: { ...payload, ...extra } });
    await recoverInstantlyDeliveries(settings, f.deps, {
      activatedAt,
      now,
      processEvent: f.processEvent,
    });
    assert.equal(f.calls.length, 0);
    assert.equal(f.receipts.length, 0);
  }
});
test('scheduler requires authentication and explicit activation before reading accounts', async () => {
  let calls = 0;
  const handler = createInstantlyReconciliationHandler({
    env: { CRON_SECRET: 'x'.repeat(40) },
    dependenciesFactory: () => {
      calls++;
    },
  });
  const response = () => ({
    setHeader() {},
    status(n) {
      this.code = n;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  });
  const bad = response();
  await handler({ method: 'GET', headers: {} }, bad);
  assert.equal(bad.code, 401);
  const disabled = response();
  await handler(
    { method: 'GET', headers: { authorization: 'Bearer ' + 'x'.repeat(40) } },
    disabled,
  );
  assert.equal(disabled.code, 503);
  assert.equal(calls, 0);
});
