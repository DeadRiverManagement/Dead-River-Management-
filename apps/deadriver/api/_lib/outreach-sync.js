import { createHash } from 'node:crypto';
import { REQUESTED_VSL_CAMPAIGN } from './requested-vsl-config.js';
import { REAL_ESTATE_LOCATION, REAL_ESTATE_CAMPAIGNS, REAL_ESTATE_PIPELINE, REAL_ESTATE_LEAD_STAGE, REAL_ESTATE_INTERESTED_TAG } from './real-estate-config.js';
import {
  ACTIVITY_SCHEMA_KEY,
  createGhlActivityLedger,
  deriveActivityMetrics,
} from './ghl-activity.js';
import {
  instantlyActivityText,
  instantlyEventPlan,
  normalizedEmail,
} from './instantly-events.js';
import {
  createInstantlyClient,
  syncInstantlyLifecycle,
} from './instantly-client.js';

const numericalFields = new Set([
  'instantly_emails_sent',
  'instantly_opens',
  'instantly_clicks',
  'instantly_replies',
  'instantly_automatic_replies',
  'outreach_appointments_booked',
  'outreach_appointments_attended',
  'outreach_customers_won',
]);
const largeTextFields = new Set([
  'instantly_campaign_ids',
  'instantly_lead_ids',
  'outreach_revenue_by_currency',
]);
export const OUTREACH_CONTACT_FIELDS = [
  ['original_source', 'DRM Original source'],
  ['instantly_first_campaign_id', 'DRM Instantly original campaign ID'],
  ['instantly_first_campaign_name', 'DRM Instantly original campaign name'],
  ['instantly_latest_campaign_id', 'DRM Instantly latest campaign ID'],
  ['instantly_latest_campaign_name', 'DRM Instantly latest campaign name'],
  ['instantly_campaign_ids', 'DRM Instantly campaign IDs'],
  ['instantly_lead_ids', 'DRM Instantly lead IDs'],
  ['instantly_sender_inbox', 'DRM Instantly sender inbox'],
  ['outreach_latest_activity', 'DRM Outreach latest activity'],
  ['outreach_latest_at', 'DRM Outreach latest activity time'],
  ['instantly_latest_status', 'DRM Instantly latest status'],
  ['instantly_emails_sent', 'DRM Instantly emails sent'],
  ['instantly_opens', 'DRM Instantly email opens'],
  ['instantly_clicks', 'DRM Instantly link clicks'],
  ['instantly_replies', 'DRM Instantly replies'],
  ['instantly_automatic_replies', 'DRM Instantly automatic replies'],
  ['instantly_interested', 'DRM Instantly interested'],
  ['instantly_bounced', 'DRM Instantly bounced'],
  ['instantly_unsubscribed', 'DRM Instantly unsubscribed'],
  ['outreach_appointments_booked', 'DRM Outreach appointments booked'],
  ['outreach_appointments_attended', 'DRM Outreach appointments attended'],
  ['outreach_customers_won', 'DRM Outreach customers won'],
  ['outreach_revenue_by_currency', 'DRM Outreach actual revenue by currency'],
  ['outreach_channel', 'DRM Assigned outreach channel'],
  ['exclude_cold_sms', 'DRM Exclude from cold SMS'],
  ['sync_origin', 'DRM Sync origin'],
  ['last_synced_event_id', 'DRM Last synchronized event ID'],
].map(([key, name]) => ({
  key,
  name,
  dataType: numericalFields.has(key)
    ? 'NUMERICAL'
    : largeTextFields.has(key)
      ? 'LARGE_TEXT'
      : 'TEXT',
  model: 'contact',
}));

export class OutreachSyncError extends Error {
  constructor(code, status = 0) {
    super(code);
    this.name = 'OutreachSyncError';
    this.code = code;
    this.status = status;
  }
}

const validId = (id) =>
  typeof id === 'string' && /^[A-Za-z0-9_-]{8,100}$/.test(id);
function arrayConfig(raw, name, { empty = false } = {}) {
  let values;
  try {
    values = JSON.parse(raw);
  } catch {
    throw new OutreachSyncError(`CONFIG_${name}`);
  }
  if (
    !Array.isArray(values) ||
    (!empty && !values.length) ||
    values.some(
      (value) =>
        typeof value !== 'string' || !value.trim() || value.length > 200,
    )
  ) {
    throw new OutreachSyncError(`CONFIG_${name}`);
  }
  return [...new Set(values)];
}

export function readOutreachFieldMap(raw) {
  let map;
  try {
    map = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
  if (!map || typeof map !== 'object' || Array.isArray(map)) return null;
  const ids = OUTREACH_CONTACT_FIELDS.map(({ key }) => map[key]);
  if (ids.some((value) => !validId(value)) || new Set(ids).size !== ids.length)
    return null;
  return Object.fromEntries(
    OUTREACH_CONTACT_FIELDS.map(({ key }) => [key, map[key]]),
  );
}

/** No defaults for live account/stage/field IDs. These gates require live checks. */
export function readOutreachConfig(env, { historical = false } = {}) {
  const token = env.GHL_OUTREACH_PIT || env.GHL_PIT;
  const fieldMap = readOutreachFieldMap(env.GHL_OUTREACH_FIELD_IDS);
  if (
    env.VERCEL_ENV !== 'production' ||
    env.ENABLE_INSTANTLY_GHL_SYNC !== 'true'
  ) {
    throw new OutreachSyncError('OUTREACH_NOT_ENABLED');
  }
  if (
    !token ||
    !validId(env.GHL_LOCATION_ID) ||
    !validId(env.INSTANTLY_WORKSPACE_ID) ||
    !fieldMap ||
    !validId(env.GHL_ACTIVITY_ASSOCIATION_ID) ||
    !validId(env.GHL_COLD_EMAIL_PIPELINE_ID) ||
    !validId(env.GHL_COLD_EMAIL_INTERESTED_STAGE_ID) ||
    !env.INSTANTLY_API_KEY
  )
    throw new OutreachSyncError('OUTREACH_CONFIG_INCOMPLETE');
  if (
    env.GHL_ACTIVITY_UNIQUE_EVENT_ID_VERIFIED !== 'true' ||
    env.GHL_CONTACT_DEDUPLICATION_VERIFIED !== 'true' ||
    env.GHL_OPPORTUNITY_DEDUPLICATION_VERIFIED !== 'true' ||
    env.GHL_OUTREACH_AUTOMATIONS_REVIEWED !== 'true'
  ) {
    throw new OutreachSyncError('OUTREACH_LIVE_SAFEGUARDS_UNVERIFIED');
  }
  if (
    historical &&
    (env.ENABLE_INSTANTLY_HISTORY_IMPORT !== 'true' ||
      env.GHL_HISTORICAL_IMPORT_SAFE !== 'true')
  ) {
    throw new OutreachSyncError('OUTREACH_HISTORY_IMPORT_NOT_ENABLED');
  }
  const priorStageIds = arrayConfig(
    env.GHL_COLD_EMAIL_PRIOR_STAGE_IDS,
    'PRIOR_STAGE_IDS',
    { empty: true },
  );
  if (priorStageIds.some((value) => !validId(value)))
    throw new OutreachSyncError('CONFIG_PRIOR_STAGE_IDS');
  const schemaKey = env.GHL_ACTIVITY_SCHEMA_KEY || ACTIVITY_SCHEMA_KEY;
  if (!/^custom_objects\.[a-z][a-z0-9_]*$/.test(schemaKey))
    throw new OutreachSyncError('CONFIG_ACTIVITY_SCHEMA_KEY');
  return {
    token,
    locationId: env.GHL_LOCATION_ID,
    fieldMap,
    workspaceId: env.INSTANTLY_WORKSPACE_ID,
    campaignIds: [...new Set([...arrayConfig(
      env.INSTANTLY_CAMPAIGN_IDS,
      'INSTANTLY_CAMPAIGN_IDS',
    ), REQUESTED_VSL_CAMPAIGN, ...(env.GHL_LOCATION_ID === REAL_ESTATE_LOCATION ? REAL_ESTATE_CAMPAIGNS : [])])],
    realEstateRoute: env.GHL_LOCATION_ID === REAL_ESTATE_LOCATION ? {
      campaignIds: REAL_ESTATE_CAMPAIGNS, pipelineId: REAL_ESTATE_PIPELINE,
      interestedStageId: REAL_ESTATE_LEAD_STAGE, priorStageIds: [], offerName: 'Real Estate',
    } : null,
    customLabels: arrayConfig(
      env.INSTANTLY_CUSTOM_LABELS || '[]',
      'CUSTOM_LABELS',
      { empty: true },
    ),
    pipelineId: env.GHL_COLD_EMAIL_PIPELINE_ID,
    interestedStageId: env.GHL_COLD_EMAIL_INTERESTED_STAGE_ID,
    priorStageIds,
    schemaKey,
    associationId: env.GHL_ACTIVITY_ASSOCIATION_ID,
    contactIsFirst: env.GHL_ACTIVITY_CONTACT_IS_FIRST === 'true',
    instantlyApiKey: env.INSTANTLY_API_KEY,
  };
}

export function validateOutreachAccount(event, config) {
  if (event.workspaceId !== config.workspaceId)
    throw new OutreachSyncError('WRONG_INSTANTLY_WORKSPACE');
  if (event.scope !== 'account' && !event.campaignId)
    throw new OutreachSyncError('CONTACT_EVENT_MISSING_CAMPAIGN');
  if (event.campaignId && !config.campaignIds.includes(event.campaignId))
    throw new OutreachSyncError('INSTANTLY_CAMPAIGN_NOT_ALLOWED');
}

function contactValues(contact) {
  return Object.fromEntries(
    (contact?.customFields || []).map((field) => [
      field.id,
      field.value ?? field.fieldValue,
    ]),
  );
}

/** Public API operations only. This client has no enrollment or messaging method. */
export function createGhlOutreachClient({
  token,
  locationId,
  fetchImpl = fetch,
  timeoutMs = 15000,
}) {
  async function request(path, method = 'GET', body) {
    const response = await fetchImpl(
      `https://services.leadconnectorhq.com${path}`,
      {
        method,
        redirect: 'error',
        headers: {
          Authorization: `Bearer ${token}`,
          Version: 'v3',
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(timeoutMs),
      },
    );
    if (!response.ok)
      throw new OutreachSyncError(
        'GHL_OUTREACH_REQUEST_FAILED',
        response.status,
      );
    try {
      return await response.json();
    } catch {
      throw new OutreachSyncError('GHL_OUTREACH_INVALID_RESPONSE');
    }
  }
  const contactPath = (id) => {
    if (!validId(id)) throw new OutreachSyncError('GHL_INVALID_CONTACT_ID');
    return `/contacts/${encodeURIComponent(id)}`;
  };
  function verifyContact(contact, email) {
    if (
      !validId(contact?.id) ||
      normalizedEmail(contact.email) !== normalizedEmail(email) ||
      (contact.locationId && contact.locationId !== locationId)
    )
      throw new OutreachSyncError('GHL_CONTACT_IDENTITY_MISMATCH');
    return contact;
  }
  async function getContact(id) {
    return (await request(contactPath(id))).contact;
  }
  return {
    getContact,
    async matchOrCreateContact(event) {
      const query = new URLSearchParams({ locationId, email: event.email });
      const found = await request(`/contacts/search/duplicate?${query}`);
      if (Array.isArray(found.contact) || Array.isArray(found.contacts))
        throw new OutreachSyncError('GHL_AMBIGUOUS_CONTACT');
      let contact = found.contact;
      if (contact?.id)
        return verifyContact(await getContact(contact.id), event.email);
      // Pass email only for matching; a reused/shared phone cannot merge contacts.
      // No source/tags here: a concurrent upsert might resolve an existing record.
      const created = await request('/contacts/upsert', 'POST', {
        locationId,
        email: event.email,
        ...(event.firstName ? { firstName: event.firstName } : {}),
        ...(event.lastName ? { lastName: event.lastName } : {}),
        ...(event.companyName ? { companyName: event.companyName } : {}),
      });
      contact = created.contact;
      if (!contact?.id) throw new OutreachSyncError('GHL_CONTACT_NOT_SAVED');
      return verifyContact(await getContact(contact.id), event.email);
    },
    async updateProjection(contact, { fields, source, unsubscribed = false }) {
      const changes = { customFields: fields };
      if (source && !contact.source) changes.source = source;
      // Preserve other channel settings and previously recorded suppressions.
      if (unsubscribed)
        changes.dndSettings = {
          ...(contact.dndSettings || {}),
          email: {
            ...(contact.dndSettings?.email || {}),
            status: 'active',
            message: 'Unsubscribed from Instantly cold email',
          },
        };
      await request(contactPath(contact.id), 'PUT', changes);
      const verified = verifyContact(
        await getContact(contact.id),
        contact.email,
      );
      const values = contactValues(verified);
      if (
        fields.some(
          ({ id, fieldValue }) =>
            String(values[id] ?? '') !== String(fieldValue),
        ) ||
        (changes.source && verified.source !== changes.source) ||
        (unsubscribed && verified.dndSettings?.email?.status !== 'active')
      ) {
        throw new OutreachSyncError('GHL_OUTREACH_PROJECTION_NOT_VERIFIED');
      }
      return verified;
    },
    async addTags(contactId, tags) {
      const data = await request(`${contactPath(contactId)}/tags`, 'POST', {
        tags: [...new Set(tags)],
      });
      if (
        !Array.isArray(data.tags) ||
        tags.some((tag) => !data.tags.includes(tag))
      )
        throw new OutreachSyncError('GHL_OUTREACH_TAGS_NOT_VERIFIED');
    },
    async ensureActivityNote(contactId, event, ledgerEventId) {
      const path = `${contactPath(contactId)}/notes`;
      const marker = `[DRM activity ${ledgerEventId}]`;
      const notes = (await request(path)).notes;
      if (!Array.isArray(notes))
        throw new OutreachSyncError('GHL_INVALID_NOTES_RESPONSE');
      const existing = notes.find(
        (note) => typeof note.body === 'string' && note.body.includes(marker),
      );
      if (existing?.id) return existing.id;
      // The immutable activity object is authoritative. GHL notes have no unique
      // key/CAS; simultaneous retries may append two readable notes. This check
      // reconciles sequential retries, not a global lock or exactly-once claim.
      // Notes can be rendered as rich text by GHL; plain reply content remains
      // untrusted text even when a prospect types markup into the email body.
      const body = `${marker}\n${instantlyActivityText(event)}`
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;');
      const created = await request(path, 'POST', { body });
      if (!created.note?.id)
        throw new OutreachSyncError('GHL_ACTIVITY_NOTE_NOT_CONFIRMED');
      return created.note.id;
    },
    async moveInterested(contact, config) {
      const query = new URLSearchParams({
        locationId,
        contactId: contact.id,
        pipelineId: config.pipelineId,
        status: 'all',
        limit: '100',
      });
      const data = await request(`/opportunities/search?${query}`);
      if (!Array.isArray(data.opportunities))
        throw new OutreachSyncError('GHL_INVALID_OPPORTUNITIES_RESPONSE');
      if (data.opportunities.length >= 100)
        throw new OutreachSyncError('GHL_OPPORTUNITY_HISTORY_INCOMPLETE');
      const matches = data.opportunities.filter(
        (opportunity) =>
          opportunity.pipelineId === config.pipelineId &&
          (opportunity.contactId || opportunity.contact?.id) === contact.id,
      );
      if (matches.length > 1)
        throw new OutreachSyncError('GHL_AMBIGUOUS_OPPORTUNITY');
      let opportunity = matches[0];
      if (opportunity) {
        if (
          opportunity.status !== 'open' ||
          opportunity.pipelineStageId === config.interestedStageId ||
          !config.priorStageIds.includes(opportunity.pipelineStageId)
        )
          return { id: opportunity.id, changed: false };
        opportunity = (
          await request(
            `/opportunities/${encodeURIComponent(opportunity.id)}`,
            'PUT',
            {
              pipelineStageId: config.interestedStageId,
            },
          )
        ).opportunity;
      } else {
        // Deployment requires GHL duplicate-opportunity protection to be verified.
        // Never send a monetaryValue from an interested/reply status.
        opportunity = (
          await request('/opportunities/', 'POST', {
            locationId,
            contactId: contact.id,
            pipelineId: config.pipelineId,
            pipelineStageId: config.interestedStageId,
            status: 'open',
            name: `${config.offerName || 'DemandFlow'} - ${contact.companyName || contact.name || 'Cold email opportunity'}`.slice(
              0,
              200,
            ),
          })
        ).opportunity;
      }
      if (!opportunity?.id)
        throw new OutreachSyncError('GHL_OPPORTUNITY_NOT_CONFIRMED');
      const verified = (
        await request(`/opportunities/${encodeURIComponent(opportunity.id)}`)
      ).opportunity;
      if (
        verified?.pipelineId !== config.pipelineId ||
        verified?.pipelineStageId !== config.interestedStageId ||
        (verified?.contactId || verified?.contact?.id) !== contact.id
      )
        throw new OutreachSyncError('GHL_OPPORTUNITY_MAPPING_NOT_VERIFIED');
      return { id: verified.id, changed: true };
    },
  };
}

export function instantlyLedgerEvent(event, contactId) {
  return {
    source: 'instantly',
    eventId: event.messageKey || event.eventKey,
    eventType: event.type,
    eventScope: event.scope,
    workspaceId: event.workspaceId,
    contactId,
    campaignId: event.campaignId,
    campaignName: event.campaignName,
    leadId: event.leadId,
    leadEmail: event.email,
    senderInbox: event.senderInbox,
    occurredAt: event.occurredAt,
    historical: event.historical,
    sequenceStep: event.step ?? '',
    sequenceVariant: event.variant ?? '',
    messageId: event.emailId,
    replyText: event.bodyText,
    conversationUrl: event.conversationUrl,
    customLabel: event.category !== 'standard' ? event.rawType : '',
  };
}

/** Combine cumulative historical engagement evidence with individually dated
 * activity. Snapshot baselines overlap each other and are never added together. */
export function outreachEngagementMetrics(records) {
  const facts = [
    ...new Map(
      records
        .filter((record) => record.properties?.record_kind === 'activity')
        .map((record) => [record.properties.event_id, record.properties]),
    ).values(),
  ];
  const key = (fact) => JSON.stringify([fact.contact_id, fact.campaign_id]);
  const groups = new Map();
  for (const fact of facts) {
    if (!fact.contact_id || !fact.campaign_id) continue;
    const group = groups.get(key(fact)) || { events: [], snapshots: [] };
    if (fact.source === 'instantly') group.events.push(fact);
    if (
      fact.source === 'instantly_snapshot' &&
      fact.event_type === 'instantly_lead_snapshot' &&
      fact.historical === 1
    ) {
      const prefix = 'Historical API state, not a new inquiry or conversion.\n';
      if (
        typeof fact.reply_text === 'string' &&
        fact.reply_text.startsWith(prefix)
      ) {
        let snapshot;
        try {
          snapshot = JSON.parse(fact.reply_text.slice(prefix.length));
        } catch {
          throw new OutreachSyncError('HISTORICAL_SNAPSHOT_INVALID');
        }
        if (
          snapshot.workspaceId !== fact.workspace_id ||
          snapshot.campaignId !== fact.campaign_id ||
          snapshot.leadId !== fact.lead_id
        )
          throw new OutreachSyncError('HISTORICAL_SNAPSHOT_IDENTITY_MISMATCH');
        group.snapshots.push(snapshot);
      }
    }
    groups.set(key(fact), group);
  }
  const totals = { opens: 0, linkClicks: 0 };
  for (const group of groups.values()) {
    for (const [target, eventType, countKey, timestampKey] of [
      ['opens', 'email_opened', 'opens', 'lastOpenAt'],
      ['linkClicks', 'link_clicked', 'clicks', 'lastClickAt'],
    ]) {
      const events = group.events.filter(
        (event) => event.event_type === eventType,
      );
      let total = events.length;
      for (const snapshot of group.snapshots) {
        const count = snapshot[countKey];
        const timestamp = snapshot[timestampKey];
        if (
          !Number.isSafeInteger(count) ||
          count < 1 ||
          typeof timestamp !== 'string' ||
          !Number.isFinite(Date.parse(timestamp))
        )
          continue;
        const cutoff = Date.parse(timestamp);
        const through = events.filter(
          (event) => Date.parse(event.occurred_at) <= cutoff,
        ).length;
        const after = events.length - through;
        total = Math.max(total, Math.max(count, through) + after);
      }
      totals[target] += total;
    }
  }
  return totals;
}

/** Recompute full contact totals; never increment a mutable counter on delivery. */
export function outreachContactProjection(records, contact, map) {
  const metrics = {
    ...deriveActivityMetrics(records),
    ...outreachEngagementMetrics(records),
  };
  const existing = contactValues(contact);
  const activity = records
    .filter((record) => record.properties?.record_kind === 'activity')
    .map((record) => record.properties)
    .sort(
      (a, b) =>
        a.occurred_at.localeCompare(b.occurred_at) ||
        a.event_id.localeCompare(b.event_id),
    );
  const emailEvents = activity.filter((event) => event.source === 'instantly');
  if (!emailEvents.length)
    throw new OutreachSyncError('OUTREACH_HISTORY_EMPTY');
  const latest = activity.at(-1);
  // Snapshots establish campaign membership, not individual sends or replies.
  // Keep that membership visible when later live events rebuild the projection.
  const campaignEvidence = activity.filter((event) =>
    ['instantly', 'instantly_snapshot'].includes(event.source),
  );
  const firstCampaign = campaignEvidence.find((event) => event.campaign_id);
  const lastCampaign = campaignEvidence.findLast((event) => event.campaign_id);
  const priorFirstId = existing[map.instantly_first_campaign_id];
  const preserveFirst =
    priorFirstId &&
    !campaignEvidence.some((event) => event.campaign_id === priorFirstId);
  const mergeCollection = (key, collected) => {
    let prior = [];
    try {
      prior = JSON.parse(existing[map[key]] || '[]');
    } catch {
      throw new OutreachSyncError('OUTREACH_EXISTING_COLLECTION_INVALID');
    }
    if (
      !Array.isArray(prior) ||
      prior.some((value) => typeof value !== 'string')
    )
      throw new OutreachSyncError('OUTREACH_EXISTING_COLLECTION_INVALID');
    return JSON.stringify([
      ...new Set([...prior, ...collected].filter(Boolean)),
    ]);
  };
  const lastStatus = emailEvents.findLast(
    (event) =>
      event.custom_label ||
      /^(lead_|reply_received|auto_reply_received|email_bounced|campaign_completed)/.test(
        event.event_type,
      ),
  );
  const values = {
    instantly_first_campaign_id: preserveFirst
      ? priorFirstId
      : firstCampaign?.campaign_id,
    instantly_first_campaign_name: preserveFirst
      ? existing[map.instantly_first_campaign_name]
      : firstCampaign?.campaign_name,
    instantly_latest_campaign_id: lastCampaign?.campaign_id,
    instantly_latest_campaign_name: lastCampaign?.campaign_name,
    instantly_campaign_ids: mergeCollection(
      'instantly_campaign_ids',
      campaignEvidence.map((event) => event.campaign_id),
    ),
    instantly_lead_ids: mergeCollection(
      'instantly_lead_ids',
      campaignEvidence.map((event) => event.lead_id),
    ),
    instantly_sender_inbox: emailEvents.findLast((event) => event.sender_inbox)
      ?.sender_inbox,
    outreach_latest_activity: latest.event_type,
    outreach_latest_at: latest.occurred_at,
    instantly_latest_status: lastStatus?.custom_label || lastStatus?.event_type,
    instantly_emails_sent: metrics.emailsSent,
    instantly_opens: metrics.opens,
    instantly_clicks: metrics.linkClicks,
    instantly_replies: metrics.replies,
    instantly_automatic_replies: metrics.automaticReplies,
    instantly_interested: metrics.interestedProspects > 0 ? 'yes' : 'no',
    instantly_bounced: metrics.bounces > 0 ? 'yes' : 'no',
    instantly_unsubscribed: metrics.unsubscribes > 0 ? 'yes' : 'no',
    outreach_appointments_booked: metrics.appointmentsBooked,
    outreach_appointments_attended: metrics.appointmentsAttended,
    outreach_customers_won: metrics.customersWon,
    outreach_revenue_by_currency: JSON.stringify(metrics.revenueByCurrency),
    outreach_channel: 'cold email',
    exclude_cold_sms: 'yes',
    sync_origin: 'instantly',
    last_synced_event_id: latest.event_id,
  };
  // Original source is never replaced by later cold-email activity.
  if (!existing[map.original_source])
    values.original_source = contact.source || 'Instantly / cold email';
  // Suppression facts are monotone even if older external history is unavailable.
  if (existing[map.instantly_bounced] === 'yes')
    values.instantly_bounced = 'yes';
  if (existing[map.instantly_unsubscribed] === 'yes')
    values.instantly_unsubscribed = 'yes';
  return {
    fields: Object.entries(values)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => ({ id: map[key], fieldValue: String(value) })),
    source: !contact.source
      ? existing[map.original_source] || 'Instantly / cold email'
      : undefined,
    unsubscribed: values.instantly_unsubscribed === 'yes',
    metrics,
  };
}

export function createOutreachDependencies(config, { fetchImpl = fetch } = {}) {
  return {
    ghl: createGhlOutreachClient({ ...config, fetchImpl }),
    ledger: createGhlActivityLedger({
      ...config,
      uniqueEventIdVerified: true,
      fetchImpl,
    }),
    instantly: createInstantlyClient({
      apiKey: config.instantlyApiKey,
      fetchImpl,
    }),
  };
}

/** Search indexes can lag an acknowledged immutable insert; never write totals
 * from a contact history that still omits the event we just saved. */
export async function readVisibleOutreachHistory(
  ledger,
  contactId,
  eventId,
  {
    wait = (milliseconds) =>
      new Promise((resolve) => setTimeout(resolve, milliseconds)),
    delays = [250, 750, 1500],
  } = {},
) {
  for (let attempt = 0; attempt <= delays.length; attempt += 1) {
    if (attempt) await wait(delays[attempt - 1]);
    const records = await ledger.list({ contactId });
    if (records.some((record) => record.properties?.event_id === eventId))
      return records;
  }
  throw new OutreachSyncError('OUTREACH_LEDGER_NOT_YET_VISIBLE');
}

/**
 * Append immutable history, then reconcile additive/read-before-retry effects.
 * Requires a verified unique ledger primary field. There is no cross-resource
 * transaction: serialize contact work in the receiver workflow and periodically
 * reconcile projections. A latest-field display can otherwise temporarily lag
 * concurrent activity, while unique ledger totals remain authoritative.
 */
export async function processInstantlyOutreach(
  event,
  config,
  { ghl, ledger, instantly, ledgerWait },
) {
  validateOutreachAccount(event, config);
  const realEstate = Boolean(config.realEstateRoute?.campaignIds.includes(event.campaignId));
  const opportunityConfig = realEstate ? { ...config, ...config.realEstateRoute } : config;
  if (event.scope !== 'contact') {
    await ledger.append(instantlyLedgerEvent(event, ''));
    return {
      disposition: `${event.scope}_activity`,
      contactCreated: false,
      conversionSent: false,
    };
  }
  const contact = await ghl.matchOrCreateContact(event);
  const appended = await ledger.append(instantlyLedgerEvent(event, contact.id));
  if (appended.timestampDiscrepancy) {
    await ledger.recordEffectCompletion(
      appended.record,
      'source_timestamp_discrepancy',
      JSON.stringify(appended.timestampDiscrepancy),
    );
  }
  // A live retry of an already-imported fact must keep the original import mode.
  const historical = appended.historical || event.historical;
  const stableEvent = { ...event, historical };
  const plan = instantlyEventPlan(stableEvent);
  const noteReceipt = await ledger.completedEffect(
    appended.record,
    'ghl_activity_note',
  );
  if (!noteReceipt) {
    const noteId = await ghl.ensureActivityNote(
      contact.id,
      stableEvent,
      appended.record.properties.event_id,
    );
    await ledger.recordEffectCompletion(
      appended.record,
      'ghl_activity_note',
      noteId,
    );
  }
  const records = await readVisibleOutreachHistory(
    ledger,
    contact.id,
    appended.record.properties.event_id,
    { wait: ledgerWait },
  );
  const freshContact = await ghl.getContact(contact.id);
  const projection = outreachContactProjection(
    records,
    freshContact,
    config.fieldMap,
  );
  // Archival writes must not trigger existing Contact Tag enrollment workflows.
  // Assignment/exclusion stay in mapped fields; pre-existing tags are untouched.
  if (!historical) {
    await ghl.addTags(contact.id, [
      ...plan.addTags,
      ...(projection.unsubscribed ? ['drm-email-unsubscribed'] : []),
    ]);
  }
  const updated = await ghl.updateProjection(freshContact, {
    ...projection,
    // Import suppression facts for visibility, but do not replay live stop actions.
    unsubscribed: !historical && projection.unsubscribed,
  });
  if (
    !historical &&
    plan.milestone === 'interested' &&
    !projection.unsubscribed &&
    !updated.dnd &&
    updated.dndSettings?.email?.status !== 'active'
  ) {
    const receipt = await ledger.completedEffect(
      appended.record,
      'ghl_interested_stage',
    );
    if (!receipt) {
      const opportunity = await ghl.moveInterested(updated, opportunityConfig);
      await ledger.recordEffectCompletion(
        appended.record,
        'ghl_interested_stage',
        opportunity.id,
      );
    }
    // Apply after the opportunity write, avoiding an enrollment/create race.
    // GHL handoff has reentry disabled and preserves an existing opportunity.
    if (realEstate) await ghl.addTags(contact.id, [REAL_ESTATE_INTERESTED_TAG]);
  }
  if (!historical && plan.requiresSuppression) {
    const lifecycle = {
      lead_unsubscribed: 'unsubscribed',
      lead_meeting_booked: 'appointment_booked',
      lead_meeting_completed: 'appointment_attended',
      lead_closed: 'customer_won',
    }[event.type];
    // Read back the stopping control even on a retry; never assume a label stops it.
    const result = await syncInstantlyLifecycle(instantly, {
      email: event.email,
      lifecycle,
      origin: 'instantly',
    });
    if (!result.sequenceStopVerified)
      throw new OutreachSyncError('INSTANTLY_STOP_NOT_VERIFIED');
    await ledger.recordEffectCompletion(
      appended.record,
      'instantly_suppression',
      result.suppression.blocklistId,
    );
  }
  return {
    disposition: appended.created ? 'recorded' : 'reconciled',
    historical,
    eventReference: createHash('sha256')
      .update(appended.record.properties.event_id)
      .digest('hex')
      .slice(0, 16),
    conversionSent: false,
  };
}
