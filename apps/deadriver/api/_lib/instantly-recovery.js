import { normalizeInstantlyEvent } from './instantly-events.js';
import { instantlyPages } from './instantly-client.js';
import { activityEventId } from './ghl-activity.js';
import {
  instantlyLedgerEvent,
  processInstantlyOutreach,
  validateOutreachAccount,
} from './outreach-sync.js';

// GHL's inbound acknowledgement does not prove its later outbound action ran.
// Recover from the provider's original payload, preserving its event time and
// the same immutable activity identity used by the primary GHL path.
export async function recoverInstantlyDeliveries(
  config,
  dependencies,
  {
    activatedAt,
    now = () => Date.now(),
    budgetMs = 220000,
    processEvent = processInstantlyOutreach,
  } = {},
) {
  const activation = Date.parse(activatedAt);
  if (
    !Number.isFinite(activation) ||
    !/T.*(?:Z|[+-]\d\d:\d\d)$/.test(activatedAt || '')
  )
    throw new TypeError('Verified Instantly activation time required');
  const started = now();
  const from = new Date(Math.max(activation, started - 7 * 86400000))
    .toISOString()
    .slice(0, 10);
  const rows = await dependencies.ledger.list({ includeReceipts: true });
  const completed = new Set(
    rows
      .filter((r) =>
        r.properties?.event_type?.startsWith('instantly_delivery_recovered_'),
      )
      .map((r) => r.properties.effect_reference),
  );
  const result = {
    inspected: 0,
    recovered: 0,
    alreadyCompleted: 0,
    skipped: 0,
    failed: 0,
    incomplete: false,
    conversions: 0,
  };
  const deliveries = [];
  for await (const delivery of instantlyPages(
    (options) => dependencies.instantly.listWebhookEvents(options),
    { from, to: new Date(started).toISOString().slice(0, 10), limit: 100 },
  )) {
    if (now() - started > budgetMs) {
      result.incomplete = true;
      return result;
    }
    deliveries.push(...delivery);
  }
  // Oldest first prevents busy campaigns from starving unfinished earlier work.
  deliveries.sort((a, b) =>
    String(a.timestamp_created).localeCompare(String(b.timestamp_created)),
  );
  for (const delivery of deliveries) {
    if (now() - started > budgetMs) {
      result.incomplete = true;
      break;
    }
    result.inspected++;
    if (completed.has(delivery.id)) {
      result.alreadyCompleted++;
      continue;
    }
    const deliveredAt = Date.parse(delivery.timestamp_created);
    if (
      delivery.organization_id !== config.workspaceId ||
      !Number.isFinite(deliveredAt) ||
      deliveredAt < activation ||
      deliveredAt > started - 5 * 60000
    ) {
      result.skipped++;
      continue;
    }
    try {
      const detail = await dependencies.instantly.getWebhookEvent(delivery.id);
      if (
        detail.id !== delivery.id ||
        detail.organization_id !== config.workspaceId ||
        !detail.payload
      )
        throw new Error('Provider delivery identity not verified');
      const event = normalizeInstantlyEvent(detail.payload, {
        customLabels: config.customLabels,
      });
      if (
        Date.parse(event.occurredAt) < activation ||
        (event.campaignId && !config.campaignIds.includes(event.campaignId))
      ) {
        result.skipped++;
        continue;
      }
      validateOutreachAccount(event, config);
      await processEvent(event, config, dependencies);
      const record = await dependencies.ledger.findByEventId(
        activityEventId(instantlyLedgerEvent(event, '')),
      );
      if (!record) throw new Error('Completed activity not visible yet');
      await dependencies.ledger.recordEffectCompletion(
        record,
        `instantly_delivery_recovered_${delivery.id}`,
        delivery.id,
      );
      completed.add(delivery.id);
      result.recovered++;
    } catch {
      // No provider bodies, contact details or reply content in scheduler logs.
      // Leave no completion receipt; the next scheduled run retries this fact.
      result.failed++;
    }
  }
  return result;
}

