import { createHash, timingSafeEqual } from 'node:crypto';

// Reference: https://developer.instantly.ai/guides/webhook-events
// Subscription names can differ from delivered event_type (notably link_clicked).
export const INSTANTLY_EVENT_TYPES = Object.freeze([
  'email_sent',
  'email_opened',
  'link_clicked',
  'reply_received',
  'auto_reply_received',
  'email_bounced',
  'lead_unsubscribed',
  'campaign_completed',
  'campaign_completed_for_lead_without_reply',
  'account_error',
  'lead_neutral',
  'lead_interested',
  'lead_not_interested',
  'lead_meeting_booked',
  'lead_meeting_completed',
  'lead_closed',
  'lead_out_of_office',
  'lead_wrong_person',
]);

const aliases = new Map([['email_link_clicked', 'link_clicked']]);
const known = new Set(INSTANTLY_EVENT_TYPES);
const text = (value, max = 1000) =>
  typeof value === 'string'
    ? value
        .replace(/\u0000/g, '')
        .trim()
        .slice(0, max)
    : '';
const digest = (value) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex');
// GHL's inbound-variable renderer emits the literal string "null" for missing
// optional values. It must not become a message ID or hide a supplied fallback.
const optionalText = (value, max = 1000) =>
  value === 'null' ? '' : text(value, max);

export function normalizedEmail(value) {
  const email = text(value, 320).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : '';
}

function requiredText(value, name, max = 200) {
  if (typeof value !== 'string' || !value.trim() || value.length > max) {
    throw new TypeError(`Instantly event requires valid ${name}`);
  }
  return value.trim();
}

function timestamp(value) {
  if (
    typeof value !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)
  ) {
    throw new TypeError('Instantly event requires an original ISO timestamp');
  }
  const millis = Date.parse(value);
  if (!Number.isFinite(millis))
    throw new TypeError('Invalid Instantly timestamp');
  return new Date(millis).toISOString();
}

function step(value) {
  if (value === 'null') return null;
  if (Number.isSafeInteger(value) && value >= 1) return value;
  // GHL's JSON template forwards scalar values as strings. Canonicalize these
  // before hashing so provider redelivery/history and GHL delivery deduplicate.
  if (typeof value === 'string' && /^[1-9]\d*$/.test(value.trim())) {
    const numeric = Number(value.trim());
    if (Number.isSafeInteger(numeric)) return numeric;
  }
  // Historical Email.step can be a step ID, whereas webhook step is a number.
  return typeof value === 'string' && value.length <= 200
    ? value.trim() || null
    : null;
}

function optionalBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
}

function conversationUrl(value) {
  try {
    const url = new URL(value);
    if (
      url.protocol === 'https:' &&
      url.hostname === 'app.instantly.ai' &&
      !url.username &&
      !url.password &&
      url.href.length <= 2048
    )
      return url.href;
  } catch {
    /* Missing or untrusted URL is not rendered in a CRM note. */
  }
  return '';
}

/**
 * Normalize an actual webhook payload. Pass wrapper.payload for delivery history;
 * wrapper.id identifies a delivery attempt, not a distinct outreach activity.
 * historical is supplied by the trusted importer, never accepted from the payload.
 * Persist eventKey with a UNIQUE constraint before incrementing metrics. This module
 * deliberately has no in-memory dedupe cache and makes no exactly-once storage claim.
 */
export function normalizeInstantlyEvent(
  payload,
  { historical = false, customLabels = [] } = {},
) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new TypeError('Instantly payload must be an object');
  }
  const rawType = requiredText(payload.event_type, 'event_type');
  const type = aliases.get(rawType) || rawType;
  const workspaceId = requiredText(payload.workspace, 'workspace');
  const occurredAt = timestamp(payload.timestamp);
  const campaignId = text(payload.campaign_id, 200);
  const email = normalizedEmail(payload.lead_email);
  const scope =
    type === 'account_error' ? 'account' : email ? 'contact' : 'campaign';
  const category = known.has(type)
    ? 'standard'
    : customLabels.includes(rawType)
      ? 'custom_label'
      : 'unmapped';
  if (!email && !['account_error', 'campaign_completed'].includes(type)) {
    throw new TypeError('Instantly contact event requires a valid lead_email');
  }
  if (scope !== 'account' && !campaignId)
    throw new TypeError('Instantly activity requires a campaign_id');
  const event = {
    version: 1,
    platform: 'instantly',
    type,
    rawType,
    category,
    scope,
    occurredAt,
    workspaceId,
    campaignId,
    campaignName: text(payload.campaign_name, 500),
    email,
    leadId: optionalText(payload.lead_id, 200),
    senderInbox: optionalText(payload.email_account, 320),
    emailId: optionalText(payload.email_id, 200),
    step: step(payload.step),
    variant: step(payload.variant),
    isFirst: optionalBoolean(payload.is_first),
    firstName: optionalText(payload.firstName ?? payload.first_name, 200),
    lastName: optionalText(payload.lastName ?? payload.last_name, 200),
    companyName: optionalText(payload.companyName ?? payload.company_name, 500),
    phone: optionalText(payload.phone, 100),
    subject:
      optionalText(payload.reply_subject, 1000) ||
      optionalText(payload.email_subject, 1000),
    bodyText: text(
      optionalText(payload.reply_text, 50000) ||
        optionalText(payload.reply_text_snippet, 50000) ||
        optionalText(payload.email_text, 50000),
      50000,
    ),
    // Keep HTML as data for archival only. CRM rendering must use bodyText/escaping.
    bodyHtml:
      optionalText(payload.reply_html, 100000) ||
      optionalText(payload.email_html, 100000),
    conversationUrl: conversationUrl(payload.unibox_url),
    historical: Boolean(historical),
    conversionAllowed: false,
    outreachAllowed: false,
    syncOrigin: 'instantly',
  };
  // Exclude arrival time, campaign names, mutable profile data, and delivery IDs.
  // Timestamp is never replaced by "now": separate historical opens remain separate.
  // Identical timestamp/content events without provider IDs are indistinguishable;
  // retain the original source payload in the durable ledger for reconciliation.
  event.eventKey = `instantly:v1:${digest([
    workspaceId,
    campaignId,
    email,
    type,
    occurredAt,
    event.emailId,
    event.senderInbox,
    event.step,
    event.variant,
    // With no message ID, distinct same-timestamp replies can still be separated.
    !event.emailId && ['reply_received', 'auto_reply_received'].includes(type)
      ? digest([event.subject, event.bodyText])
      : '',
  ])}`;
  // The webhook schema guarantees email_id for sent email information only.
  // Do not assume an ID in a reply identifies that reply instead of its parent.
  event.messageKey =
    event.emailId && type === 'email_sent'
      ? `instantly:message:${digest([workspaceId, campaignId, email, type, event.emailId])}`
      : '';
  return event;
}

/** Import an API email only with the direction used in its documented list filter. */
export function normalizeInstantlyHistoricalEmail(
  record,
  { direction, campaignName = '' } = {},
) {
  if (!['sent', 'received'].includes(direction))
    throw new TypeError('Historical email direction is required');
  if (!record?.id || !record?.lead || !record?.timestamp_email) {
    throw new TypeError(
      'Historical email lacks its ID, lead, or original email time',
    );
  }
  const reply = direction === 'received';
  const autoReply = record.is_auto_reply === 1 || record.is_auto_reply === true;
  return normalizeInstantlyEvent(
    {
      timestamp: record.timestamp_email,
      event_type: reply
        ? autoReply
          ? 'auto_reply_received'
          : 'reply_received'
        : 'email_sent',
      workspace: record.organization_id,
      campaign_id: record.campaign_id,
      campaign_name: campaignName,
      lead_email: record.lead,
      lead_id: record.lead_id,
      email_account: record.eaccount,
      email_id: record.id,
      step: record.step,
      variant: record.variant,
      email_subject: record.subject,
      email_text: record.body?.text || record.content_preview,
      email_html: record.body?.html,
      unibox_url: record.unibox_url,
    },
    { historical: true },
  );
}

/** Preserve an API snapshot as a snapshot, never fabricate individual sends/opens. */
export function instantlyLeadSnapshot(lead, { campaignName = '' } = {}) {
  const email = normalizedEmail(lead?.email);
  if (!email || !lead?.id || !lead?.organization)
    throw new TypeError('Invalid Instantly lead snapshot');
  const count = (value) =>
    Number.isSafeInteger(value) && value >= 0 ? value : null;
  return {
    snapshotKey: `instantly:lead:${digest([lead.organization, lead.id])}`,
    workspaceId: lead.organization,
    leadId: lead.id,
    email,
    campaignId: text(lead.campaign, 200),
    campaignName: text(campaignName, 500),
    createdAt: lead.timestamp_created
      ? timestamp(lead.timestamp_created)
      : null,
    updatedAt: lead.timestamp_updated
      ? timestamp(lead.timestamp_updated)
      : null,
    lastContactAt: lead.timestamp_last_contact
      ? timestamp(lead.timestamp_last_contact)
      : null,
    lastReplyAt: lead.timestamp_last_reply
      ? timestamp(lead.timestamp_last_reply)
      : null,
    lastOpenAt: lead.timestamp_last_open
      ? timestamp(lead.timestamp_last_open)
      : null,
    lastClickAt: lead.timestamp_last_click
      ? timestamp(lead.timestamp_last_click)
      : null,
    opens: count(lead.email_open_count),
    replies: count(lead.email_reply_count),
    clicks: count(lead.email_click_count),
    // The API does not expose a per-lead historical total emails sent here.
    emailsSent: null,
    sendingStatus: lead.status ?? null,
    interestStatus: lead.lt_interest_status ?? null,
    historical: true,
    conversionAllowed: false,
    outreachAllowed: false,
  };
}

/** A plan only; caller maps milestones to verified pipeline/stage IDs. */
export function instantlyEventPlan(event) {
  const contactEvent = event.scope === 'contact';
  const milestones = {
    reply_received: 'replied',
    lead_interested: 'interested',
    lead_meeting_booked: 'appointment_booked',
    lead_meeting_completed: 'appointment_attended',
    lead_closed: 'customer_won',
  };
  const metrics = {
    email_sent: 'emails_sent',
    email_opened: 'opens',
    link_clicked: 'clicks',
    reply_received: 'replies',
    auto_reply_received: 'automatic_replies',
    email_bounced: 'bounces',
    lead_unsubscribed: 'unsubscribes',
  };
  const milestone = Object.hasOwn(milestones, event.type)
    ? milestones[event.type]
    : null;
  const metric = Object.hasOwn(metrics, event.type)
    ? metrics[event.type]
    : null;
  return {
    history: true,
    sourceIfEmpty: contactEvent ? 'Instantly / cold email' : null,
    addTags:
      contactEvent && !event.historical
        ? ['drm-channel-cold-email', 'drm-exclude-cold-sms']
        : [],
    excludeColdSms: contactEvent,
    // Status imports are historical evidence. They must not trigger live automation.
    milestone: event.historical ? null : milestone,
    reportedMilestone: milestone,
    metric,
    metricKey: metric ? event.messageKey || event.eventKey : null,
    uniqueProspectKey:
      event.type === 'email_sent'
        ? `instantly:prospect:${digest([event.workspaceId, event.campaignId, event.email])}`
        : null,
    requiresSuppression: [
      'lead_unsubscribed',
      'lead_meeting_booked',
      'lead_meeting_completed',
      'lead_closed',
    ].includes(event.type),
    conversionAllowed: false,
    outreachAllowed: false,
    syncOrigin: 'instantly',
  };
}

export function instantlyActivityText(event) {
  const lines = [
    `Instantly ${event.historical ? 'historical ' : ''}activity: ${event.rawType}`,
    `Original event time: ${event.occurredAt}`,
    event.campaignName && `Campaign: ${event.campaignName}`,
    event.campaignId && `Campaign ID: ${event.campaignId}`,
    event.senderInbox && `Sender inbox: ${event.senderInbox}`,
    event.leadId && `Instantly lead ID: ${event.leadId}`,
    event.step !== null && `Sequence step: ${event.step}`,
    event.variant !== null && `Variant: ${event.variant}`,
    event.subject && `Subject: ${event.subject}`,
    event.bodyText && `Message:\n${event.bodyText}`,
    event.conversationUrl && `Conversation: ${event.conversationUrl}`,
    `Activity key: ${event.eventKey}`,
  ];
  return lines.filter(Boolean).join('\n');
}

/** Instantly supports custom webhook headers, not a documented native HMAC. */
export function verifyInstantlyWebhookSecret(supplied, expected) {
  if (
    typeof supplied !== 'string' ||
    typeof expected !== 'string' ||
    expected.length < 32
  )
    return false;
  const actualBytes = Buffer.from(supplied);
  const expectedBytes = Buffer.from(expected);
  return (
    actualBytes.length === expectedBytes.length &&
    timingSafeEqual(actualBytes, expectedBytes)
  );
}
