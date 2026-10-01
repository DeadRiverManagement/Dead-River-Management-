import { createHash } from 'node:crypto';

/**
 * Append-only GHL activity ledger. No counters, contact writes, messages or ad
 * conversions are performed here. Required deployment gate: create Event ID as
 * a UNIQUE primary text field in GHL and verify duplicate API inserts fail.
 * GHL documents uniqueness enforcement, but its public create-field schema does
 * not document a uniqueness flag; do not invent one in a provisioning request.
 *
 * A unique insert protects ledger counts, not external side effects. GHL exposes
 * no documented transaction/CAS spanning records, contacts and external APIs.
 * Completion receipts are an audit trail, NOT a lock: a crash between an external
 * action and its receipt requires remote idempotency or read-before-retry
 * reconciliation. Never implement an increment, send, note append or conversion
 * solely on the assumption that a missing receipt grants exclusive ownership.
 * Recompute contact projections from the ledger; concurrent contact projection
 * writes can still be stale and require later reconciliation.
 *
 * Official references, inspected 2026-09-24:
 * https://help.gohighlevel.com/support/solutions/articles/155000006668
 * https://marketplace.gohighlevel.com/docs/ghl/objects/create-object-record/
 * https://marketplace.gohighlevel.com/docs/ghl/objects/search-object-records/
 * https://marketplace.gohighlevel.com/docs/ghl/associations/create-relation/
 * https://marketplace.gohighlevel.com/docs/ghl/custom-fields/create-custom-field/
 */
export const ACTIVITY_SCHEMA_KEY = 'custom_objects.drm_outreach_activity';
export const ACTIVITY_FIELD_DEFINITIONS = [
  ['event_id', 'Event ID', 'TEXT'],
  ['record_kind', 'Record Kind', 'TEXT'],
  ['event_scope', 'Event Scope', 'TEXT'],
  ['source_event_id', 'Source Event ID', 'TEXT'],
  ['source', 'Activity Source', 'TEXT'],
  ['workspace_id', 'Source Workspace ID', 'TEXT'],
  ['contact_id', 'GHL Contact ID', 'TEXT'],
  ['campaign_id', 'Campaign ID', 'TEXT'],
  ['campaign_name', 'Campaign Name', 'TEXT'],
  ['lead_id', 'Source Lead ID', 'TEXT'],
  ['lead_email', 'Lead Email', 'TEXT'],
  ['sender_inbox', 'Sender Inbox', 'TEXT'],
  ['event_type', 'Event Type', 'TEXT'],
  ['occurred_at', 'Original Event Time (UTC)', 'TEXT'],
  ['received_at', 'Imported or Received Time (UTC)', 'TEXT'],
  ['historical', 'Historical Import', 'NUMERICAL'],
  ['sequence_step', 'Sequence Step', 'TEXT'],
  ['sequence_variant', 'Sequence Variant', 'TEXT'],
  ['message_id', 'Source Message ID', 'TEXT'],
  ['reply_text', 'Reply Text', 'LARGE_TEXT'],
  ['conversation_url', 'Conversation URL', 'TEXT'],
  ['custom_label', 'Custom Label', 'TEXT'],
  ['appointment_id', 'GHL Appointment ID', 'TEXT'],
  ['opportunity_id', 'GHL Opportunity ID', 'TEXT'],
  ['transaction_id', 'Revenue Transaction ID', 'TEXT'],
  ['revenue_value', 'Actual Revenue', 'NUMERICAL'],
  ['currency', 'Revenue Currency', 'TEXT'],
  ['revenue_verified', 'Actual Revenue Verified', 'NUMERICAL'],
  ['parent_event_id', 'Parent Event ID', 'TEXT'],
  ['effect_reference', 'Completed Effect Reference', 'TEXT'],
].map(([key, name, dataType]) => Object.freeze({ key, name, dataType }));

const required = (value, name, max = 256) => {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\u0000-\u001f]/.test(value)) {
    throw new TypeError(`Invalid ${name}`);
  }
  return value.trim();
};
const optional = (value, name, max = 256) => value == null || value === '' ? '' : required(String(value), name, max);
const timestamp = (value, name) => {
  const text = required(value, name, 40);
  if (!/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(text) || !Number.isFinite(Date.parse(text))) {
    throw new TypeError(`Invalid ${name}`);
  }
  return new Date(text).toISOString();
};
const hash = (parts) => createHash('sha256').update(JSON.stringify(parts)).digest('hex');
const safeQueryValue = (value) => {
  // Search accepts a bare identifier, never an expression or field prefix.
  if (!/^[A-Za-z0-9_.@-]{1,256}$/.test(value)) throw new TypeError('Unsafe search identifier');
  return value;
};
const properties = (record) => record?.properties || {};

/** Definitions, not live IDs. Use the returned real schema key and folder ID. */
export function activityProvisioning({ locationId, schemaKey = ACTIVITY_SCHEMA_KEY, folderId } = {}) {
  required(locationId, 'locationId');
  if (!/^custom_objects\.[a-z][a-z0-9_]*$/.test(schemaKey)) throw new TypeError('Invalid schemaKey');
  return {
    object: {
      locationId, key: schemaKey,
      labels: { singular: 'Outreach Activity', plural: 'Outreach Activities' },
      description: 'Immutable campaign activity and integration completion receipts.',
      primaryDisplayPropertyDetails: { key: `${schemaKey}.event_id`, name: 'Event ID', dataType: 'TEXT' },
    },
    // Set this in the UI during creation. This metadata is NOT an API property.
    uniquePrimaryFieldRequired: true,
    // Live GHL validation limits this custom object to three searchable fields.
    // Receipts are retrieved by their deterministic event_id, not parent_event_id.
    searchable: { locationId, searchableProperties: ['event_id', 'contact_id', 'campaign_id'].map((key) => `${schemaKey}.${key}`) },
    fields: folderId ? ACTIVITY_FIELD_DEFINITIONS.filter((field) => field.key !== 'event_id').map((field) => ({
      locationId, name: field.name, dataType: field.dataType,
      objectKey: schemaKey, fieldKey: `${schemaKey}.${field.key}`,
      parentId: required(folderId, 'folderId'), showInForms: false,
    })) : [],
    association: {
      locationId, key: 'drm_outreach_activity_contact',
      firstObjectKey: schemaKey, firstObjectLabel: 'Outreach Activities',
      secondObjectKey: 'contact', secondObjectLabel: 'Contact',
    },
  };
}

/**
 * The adapter MUST pass the same logical eventId for webhook and history copies.
 * Do not use arrival time, a fresh UUID or history-import run ID. If the provider
 * supplies no stable event identity, the adapter must document its composite key
 * and resulting inability to distinguish otherwise identical provider events.
 */
export function activityEventId(event) {
  return `drm_ev_${hash([
    required(event.source, 'source'), optional(event.workspaceId, 'workspaceId'),
    required(event.eventType, 'eventType'), required(event.eventId, 'eventId', 1024),
  ])}`;
}

export function activityProperties(event, receivedAt = new Date().toISOString()) {
  if (typeof event.historical !== 'boolean') throw new TypeError('historical must be explicit');
  const eventScope = event.eventScope || 'contact';
  if (!['contact', 'campaign', 'account'].includes(eventScope)) throw new TypeError('Invalid eventScope');
  if (eventScope === 'campaign') required(event.campaignId, 'campaignId');
  if (eventScope === 'account' && !event.senderInbox && !event.workspaceId) throw new TypeError('Account activity needs senderInbox or workspaceId');
  const reply = event.replyText == null ? '' : String(event.replyText).replace(/\u0000/g, '');
  if (reply.length > 50000) throw new TypeError('Reply exceeds supported ledger limit; retain source reference');
  let conversation = optional(event.conversationUrl, 'conversationUrl', 2048);
  if (conversation) {
    const parsed = new URL(conversation);
    if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new TypeError('Invalid conversationUrl');
  }
  const p = {
    event_id: activityEventId(event), record_kind: 'activity', event_scope: eventScope,
    source_event_id: required(event.eventId, 'eventId', 1024), source: required(event.source, 'source'),
    workspace_id: optional(event.workspaceId, 'workspaceId'),
    contact_id: eventScope === 'contact' ? required(event.contactId, 'contactId') : optional(event.contactId, 'contactId'),
    event_type: required(event.eventType, 'eventType'), occurred_at: timestamp(event.occurredAt, 'occurredAt'),
    received_at: timestamp(receivedAt, 'receivedAt'), historical: Number(event.historical),
    reply_text: reply, conversation_url: conversation,
  };
  for (const [input, field] of Object.entries({
    campaignId: 'campaign_id', campaignName: 'campaign_name', leadId: 'lead_id',
    leadEmail: 'lead_email', senderInbox: 'sender_inbox', sequenceStep: 'sequence_step',
    sequenceVariant: 'sequence_variant', messageId: 'message_id', customLabel: 'custom_label',
    appointmentId: 'appointment_id', opportunityId: 'opportunity_id', transactionId: 'transaction_id',
  })) p[field] = optional(event[input], input, 512);
  p.lead_email = p.lead_email.toLowerCase();
  p.sender_inbox = p.sender_inbox.toLowerCase();
  if (event.revenueValue != null) {
    if (event.eventType !== 'revenue_received' || event.revenueVerified !== true || !p.transaction_id ||
        typeof event.revenueValue !== 'number' || !Number.isFinite(event.revenueValue) || event.revenueValue < 0 ||
        !/^[A-Z]{3}$/.test(event.currency || '')) throw new TypeError('Revenue requires a verified transaction and currency');
    p.revenue_value = event.revenueValue; p.currency = event.currency; p.revenue_verified = 1;
  }
  return p;
}

export class GhlActivityError extends Error {
  constructor(code, status = 0, options) {
    super(code, options); this.name = 'GhlActivityError'; this.code = code; this.status = status;
  }
}

export function createGhlActivityLedger({
  token, locationId, schemaKey = ACTIVITY_SCHEMA_KEY, associationId,
  uniqueEventIdVerified = false, contactIsFirst = false, fetchImpl = globalThis.fetch,
  timeoutMs = 15000, pageLimit = 100, maxPages = 100,
} = {}) {
  required(token, 'token', 8192); required(locationId, 'locationId');
  required(associationId, 'associationId');
  if (!/^custom_objects\.[a-z][a-z0-9_]*$/.test(schemaKey)) throw new TypeError('Invalid schemaKey');
  if (!Number.isInteger(pageLimit) || pageLimit < 1 || pageLimit > 100 || !Number.isInteger(maxPages) || maxPages < 1) throw new TypeError('Invalid page limits');
  const base = `https://services.leadconnectorhq.com/objects/${encodeURIComponent(schemaKey)}/records`;
  async function request(url, method = 'GET', body) {
    let response;
    try {
      response = await fetchImpl(url, {
        method, headers: { Authorization: `Bearer ${token}`, Version: 'v3', Accept: 'application/json', 'Content-Type': 'application/json' },
        ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (cause) { throw new GhlActivityError('GHL_ACTIVITY_NETWORK_ERROR', 0, { cause }); }
    let data;
    try { data = await response.json(); } catch { throw new GhlActivityError('GHL_ACTIVITY_INVALID_RESPONSE', response.status); }
    // Never include upstream bodies in errors: replies and tokens must not leak.
    if (!response.ok) throw new GhlActivityError('GHL_ACTIVITY_REQUEST_FAILED', response.status);
    return data;
  }
  function validRecord(record) {
    if (!record?.id || !record.properties?.event_id) throw new GhlActivityError('GHL_ACTIVITY_INVALID_RECORD');
    if (record.locationId && record.locationId !== locationId) throw new GhlActivityError('GHL_ACTIVITY_WRONG_LOCATION');
    if (record.objectKey && record.objectKey !== schemaKey) throw new GhlActivityError('GHL_ACTIVITY_WRONG_OBJECT');
    return record;
  }
  async function get(id) { return validRecord((await request(`${base}/${encodeURIComponent(required(id, 'recordId'))}`)).record); }
  async function search(value) {
    // Live API searches the configured searchable properties as plain text.
    // Verified contact_id:<id> returns zero while the bare contact ID matches.
    // Retrieve every matching page, then exact-filter by property below: other
    // fields or identifier substrings may also match this broad text search.
    const query = value ? safeQueryValue(value) : '';
    if (query.length > 75) throw new TypeError('Search query exceeds GHL limit');
    const collected = new Map(); let searchAfter = [];
    for (let page = 1; page <= maxPages; page++) {
      const data = await request(`${base}/search`, 'POST', { locationId, page, pageLimit, query, searchAfter });
      if (!Array.isArray(data.records) || !Number.isFinite(data.total)) throw new GhlActivityError('GHL_ACTIVITY_INVALID_SEARCH_RESPONSE');
      let added = 0;
      for (const record of data.records) {
        validRecord(record);
        if (!collected.has(record.id)) { collected.set(record.id, record); added++; }
      }
      if (collected.size >= data.total || data.records.length === 0) {
        if (collected.size < data.total) throw new GhlActivityError('GHL_ACTIVITY_INCOMPLETE_HISTORY');
        return [...collected.values()];
      }
      if (!added) throw new GhlActivityError('GHL_ACTIVITY_PAGINATION_STALLED');
      const cursor = data.records.at(-1)?.searchAfter;
      searchAfter = Array.isArray(cursor) ? cursor : [];
    }
    throw new GhlActivityError('GHL_ACTIVITY_HISTORY_LIMIT');
  }
  async function findByEventId(eventId) {
    const matches = (await search(required(eventId, 'eventId'))).filter((r) => properties(r).event_id === eventId);
    if (matches.length > 1) throw new GhlActivityError('GHL_ACTIVITY_UNIQUENESS_BROKEN');
    return matches[0] || null;
  }
  async function list({ contactId, campaignId, includeReceipts = false } = {}) {
    const records = await search(contactId || campaignId || '');
    return records.filter((r) => (!contactId || properties(r).contact_id === contactId) &&
      (!campaignId || properties(r).campaign_id === campaignId) &&
      (includeReceipts || properties(r).record_kind === 'activity'))
      .sort((a, b) => String(properties(a).occurred_at).localeCompare(String(properties(b).occurred_at)) || properties(a).event_id.localeCompare(properties(b).event_id));
  }
  async function insert(p) {
    if (!uniqueEventIdVerified) throw new GhlActivityError('GHL_ACTIVITY_UNIQUE_FIELD_NOT_VERIFIED');
    try {
      const record = validRecord((await request(base, 'POST', { locationId, properties: p })).record);
      if (properties(record).event_id !== p.event_id) throw new GhlActivityError('GHL_ACTIVITY_ID_MISMATCH');
      return { record, created: true };
    } catch (error) {
      // GHL documents a duplicate validation error, not a stable status/code.
      // Recover only by finding the exact immutable ID, including uncertain POSTs.
      if (![0, 400, 409, 422, 500, 502, 503, 504].includes(error.status)) throw error;
      const existing = await findByEventId(p.event_id);
      if (!existing) throw error; // search may lag; retry delivery, never acknowledge missing history
      const existingProperties = properties(existing);
      const provenSentMessage = p.record_kind === 'activity' && p.event_type === 'email_sent' &&
        p.message_id && p.message_id === existingProperties.message_id;
      for (const key of p.record_kind === 'activity'
        ? ['record_kind', 'event_scope', 'source', 'source_event_id', 'workspace_id', 'event_type', 'contact_id', 'campaign_id', 'occurred_at',
          'appointment_id', 'opportunity_id', 'transaction_id', 'revenue_value', 'currency', 'revenue_verified']
        : ['record_kind', 'parent_event_id', 'event_type', 'contact_id']) {
        if (key === 'occurred_at' && provenSentMessage) continue;
        // Confirmed live API omits properties whose submitted value was empty.
        const optionalIdentity = ['workspace_id', 'contact_id', 'campaign_id', 'appointment_id', 'opportunity_id', 'transaction_id', 'currency'].includes(key);
        if ((optionalIdentity ? existingProperties[key] || '' : existingProperties[key]) !==
            (optionalIdentity ? p[key] || '' : p[key])) throw new GhlActivityError('GHL_ACTIVITY_IDENTITY_CONFLICT');
      }
      // Optional provider metadata may arrive later, but two explicit message
      // identities cannot refer to the same immutable activity fact.
      if (p.message_id && existingProperties.message_id && p.message_id !== existingProperties.message_id) {
        throw new GhlActivityError('GHL_ACTIVITY_IDENTITY_CONFLICT');
      }
      return { record: existing, created: false,
        ...(provenSentMessage && p.occurred_at !== existingProperties.occurred_at ? {
          timestampDiscrepancy: { storedOccurredAt: existingProperties.occurred_at, incomingOccurredAt: p.occurred_at, messageId: p.message_id },
        } : {}),
      };
    }
  }
  async function relationExists(recordId, contactId) {
    for (let page = 0; page < maxPages; page++) {
      const query = new URLSearchParams({ locationId, skip: String(page * pageLimit), limit: String(pageLimit) });
      query.append('associationIds', associationId);
      const data = await request(`https://services.leadconnectorhq.com/associations/relations/${encodeURIComponent(recordId)}?${query}`);
      // The reference's response example repeats the association schema. Fail
      // closed until a real relation array is supplied; never infer from labels.
      const rows = Array.isArray(data) ? data : data.relations;
      if (!Array.isArray(rows)) throw new GhlActivityError('GHL_ACTIVITY_INVALID_RELATION_RESPONSE');
      const first = contactIsFirst ? contactId : recordId;
      const second = contactIsFirst ? recordId : contactId;
      if (rows.some((r) => r.associationId === associationId && r.firstRecordId === first && r.secondRecordId === second)) return true;
      if (rows.length < pageLimit) return false;
    }
    throw new GhlActivityError('GHL_ACTIVITY_RELATION_HISTORY_LIMIT');
  }
  async function ensureContactAssociation(record) {
    validRecord(record);
    if (!properties(record).contact_id && ['campaign', 'account'].includes(properties(record).event_scope)) return;
    const contactId = required(properties(record).contact_id, 'contactId');
    if (await relationExists(record.id, contactId)) return;
    try {
      await request('https://services.leadconnectorhq.com/associations/relations', 'POST', {
        locationId, associationId,
        firstRecordId: contactIsFirst ? contactId : record.id,
        secondRecordId: contactIsFirst ? record.id : contactId,
      });
    } catch (error) {
      if (![0, 400, 409, 422, 500, 502, 503, 504].includes(error.status) || !(await relationExists(record.id, contactId))) throw error;
    }
    if (!(await relationExists(record.id, contactId))) throw new GhlActivityError('GHL_ACTIVITY_RELATION_NOT_VERIFIED');
  }
  async function append(event, receivedAt) {
    const result = await insert(activityProperties(event, receivedAt));
    // A failed association throws. On retry, the unique event is recovered and
    // the missing association is repaired; receipt of the event is not lost.
    await ensureContactAssociation(result.record);
    return { ...result, historical: properties(result.record).historical === 1 };
  }
  async function completedEffect(record, effectKey) {
    validRecord(record);
    const id = `drm_fx_${hash([properties(record).event_id, required(effectKey, 'effectKey')])}`;
    return findByEventId(id);
  }
  async function recordEffectCompletion(record, effectKey, externalReference, completedAt = new Date().toISOString()) {
    validRecord(record);
    const original = properties(record);
    const receipt = {
      event_id: `drm_fx_${hash([original.event_id, required(effectKey, 'effectKey')])}`,
      record_kind: 'effect_receipt', parent_event_id: original.event_id,
      event_scope: original.event_scope,
      event_type: effectKey, effect_reference: required(externalReference, 'externalReference', 1024),
      contact_id: original.contact_id || '', campaign_id: original.campaign_id || '',
      occurred_at: timestamp(completedAt, 'completedAt'), received_at: timestamp(completedAt, 'completedAt'),
      historical: original.historical,
    };
    return insert(receipt);
  }
  return { append, get, findByEventId, list, ensureContactAssociation, completedEffect, recordEffectCompletion };
}

/** Deterministic totals, never increments. Historical facts count; receipts do not. */
export function deriveActivityMetrics(records) {
  const byEvent = new Map();
  for (const record of records) {
    const p = properties(record);
    if (p.record_kind !== 'activity' || !p.event_id) continue;
    const prior = byEvent.get(p.event_id);
    if (prior && JSON.stringify(prior) !== JSON.stringify(p)) throw new GhlActivityError('GHL_ACTIVITY_CONFLICTING_DUPLICATE');
    byEvent.set(p.event_id, p);
  }
  const events = [...byEvent.values()].sort((a, b) => a.occurred_at.localeCompare(b.occurred_at) || a.event_id.localeCompare(b.event_id));
  const count = (type) => events.filter((e) => e.event_type === type).length;
  const uniquePeople = (type) => new Set(events.filter((e) => e.event_type === type && e.contact_id).map((e) => e.contact_id)).size;
  const appointments = (type) => new Set(events.filter((e) => e.event_type === type && e.appointment_id).map((e) => e.appointment_id)).size;
  const revenueByCurrency = {}; const transactions = new Map();
  for (const e of events) if (e.event_type === 'revenue_received' && e.revenue_verified === 1 && e.transaction_id) {
    const key = `${e.source}:${e.workspace_id}:${e.transaction_id}`;
    const previous = transactions.get(key);
    if (previous && (previous.currency !== e.currency || previous.revenue_value !== e.revenue_value)) throw new GhlActivityError('GHL_ACTIVITY_REVENUE_CONFLICT');
    if (!previous) {
      if (!/^[A-Z]{3}$/.test(e.currency) || !Number.isFinite(e.revenue_value) || e.revenue_value < 0) throw new GhlActivityError('GHL_ACTIVITY_INVALID_REVENUE');
      transactions.set(key, e);
      revenueByCurrency[e.currency] = (revenueByCurrency[e.currency] || 0) + e.revenue_value;
    }
  }
  return {
    activityEvents: events.length, uniqueProspectsContacted: uniquePeople('email_sent'), emailsSent: count('email_sent'),
    opens: count('email_opened'), linkClicks: count('link_clicked'), replies: count('reply_received'),
    uniqueProspectsReplied: uniquePeople('reply_received'), automaticReplies: count('auto_reply_received'),
    interestedProspects: uniquePeople('lead_interested'), bounces: count('email_bounced'), unsubscribes: count('lead_unsubscribed'),
    appointmentsBooked: appointments('appointment_confirmed'), appointmentsAttended: appointments('appointment_attended'),
    customersWon: uniquePeople('customer_closed'), revenueByCurrency,
    latestActivity: events.at(-1) || null,
  };
}
