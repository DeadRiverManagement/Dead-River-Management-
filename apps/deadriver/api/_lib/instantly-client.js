import { normalizedEmail } from './instantly-events.js';

const API_BASE = 'https://api.instantly.ai/api/v2';
// https://developer.instantly.ai/api-reference/schemas/lead
export const INSTANTLY_INTEREST_STATUS = Object.freeze({
  interested: 1,
  appointment_booked: 2,
  appointment_attended: 3,
  customer_won: 4,
  out_of_office: 0,
  not_interested: -1,
  wrong_person: -2,
  lost: -3,
  no_show: -4,
});

export class InstantlyApiError extends Error {
  constructor(status, retryAfter = null) {
    // Never include response bodies (which can contain lead PII or credentials).
    super(`Instantly API request failed (${status})`);
    this.name = 'InstantlyApiError';
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

function id(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,200}$/.test(value))
    throw new TypeError('Invalid Instantly ID');
  return value;
}

function pick(input, allowed) {
  return Object.fromEntries(
    allowed
      .filter((key) => input[key] !== undefined)
      .map((key) => [key, input[key]]),
  );
}

/** Read endpoints plus the only two permitted mutations: status and suppression. */
export function createInstantlyClient({
  apiKey,
  fetchImpl = fetch,
  timeoutMs = 15000,
} = {}) {
  if (typeof apiKey !== 'string' || !apiKey.trim())
    throw new TypeError('Instantly API key is required');
  async function request(path, { method = 'GET', query, body } = {}) {
    const url = new URL(`${API_BASE}${path}`);
    for (const [key, value] of Object.entries(query || {})) {
      if (value !== undefined && value !== null)
        url.searchParams.set(key, String(value));
    }
    const response = await fetchImpl(url.toString(), {
      method,
      redirect: 'error',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok)
      throw new InstantlyApiError(
        response.status,
        response.headers?.get('retry-after'),
      );
    return response.status === 204 ? null : response.json();
  }
  const paging = ['limit', 'starting_after'];
  return Object.freeze({
    listCampaigns: (options = {}) =>
      request('/campaigns', {
        query: pick(options, [...paging, 'search', 'status']),
      }),
    getCampaign: (campaignId) => request(`/campaigns/${id(campaignId)}`),
    getCampaignAnalytics: (options = {}) =>
      request('/campaigns/analytics', {
        query: pick(options, [
          'id',
          'start_date',
          'end_date',
          'exclude_total_leads_count',
        ]),
      }),
    listLeadLabels: (options = {}) =>
      request('/lead-labels', { query: pick(options, paging) }),
    listLeads: (options = {}) =>
      request('/leads/list', {
        method: 'POST',
        body: pick(options, [
          ...paging,
          'campaign',
          'list_id',
          'contacts',
          'ids',
          'distinct_contacts',
        ]),
      }),
    getLead: (leadId) => request(`/leads/${id(leadId)}`),
    getWebhookEvent: (eventId) => request(`/webhook-events/${id(eventId)}`),
    listWebhookEvents: (options = {}) =>
      request('/webhook-events', {
        query: pick(options, [...paging, 'from', 'to', 'search', 'success']),
      }),
    listEmails: (options = {}) =>
      request('/emails', {
        query: {
          mode: 'emode_all',
          latest_of_thread: false,
          ...pick(options, [
            ...paging,
            'campaign_id',
            'lead',
            'email_type',
            'sort_order',
            'min_timestamp_created',
            'max_timestamp_created',
            'preview_only',
            'latest_of_thread',
          ]),
        },
      }),
    getEmail: (emailId) => request(`/emails/${id(emailId)}`),
    listBlocklist: (options = {}) =>
      request('/block-lists-entries', {
        query: pick(options, [...paging, 'search', 'domains_only']),
      }),
    addBlocklistEmail: (value) => {
      const email = normalizedEmail(value);
      if (!email)
        throw new TypeError(
          'A single email address is required for suppression',
        );
      return request('/block-lists-entries', {
        method: 'POST',
        body: { bl_value: email },
      });
    },
    setLeadInterest: (leadId, value) => {
      if (!Number.isInteger(value) || value < -4)
        throw new TypeError('A non-default interest status is required');
      return request(`/leads/${id(leadId)}`, {
        method: 'PATCH',
        body: { lt_interest_status: value },
      });
    },
  });
}

/** The caller controls pacing; /emails has a documented 20 requests/minute limit. */
export async function* instantlyPages(
  listPage,
  options = {},
  { maxPages = 1000 } = {},
) {
  let cursor = options.starting_after;
  const seen = new Set();
  for (let pageNumber = 0; pageNumber < maxPages; pageNumber += 1) {
    const page = await listPage({
      ...options,
      limit: options.limit || 100,
      ...(cursor ? { starting_after: cursor } : {}),
    });
    if (!Array.isArray(page?.items))
      throw new TypeError('Instantly list response did not include items');
    yield page.items;
    cursor = page.next_starting_after;
    if (!cursor) return;
    if (seen.has(cursor))
      throw new Error('Instantly pagination repeated a cursor');
    seen.add(cursor);
  }
  throw new Error(
    'Instantly pagination limit reached; resume from the last saved cursor',
  );
}

export async function findInstantlyLeadsByEmail(client, value) {
  const email = normalizedEmail(value);
  if (!email) throw new TypeError('Valid contact email is required');
  const matching = new Map();
  for await (const leads of instantlyPages(client.listLeads, {
    contacts: [email],
    distinct_contacts: false,
  })) {
    for (const lead of leads) {
      if (normalizedEmail(lead.email) === email && lead.id)
        matching.set(lead.id, lead);
    }
  }
  return [...matching.values()];
}

export async function findInstantlySuppression(client, value) {
  const email = normalizedEmail(value);
  if (!email) throw new TypeError('Valid contact email is required');
  const domain = email.split('@')[1];
  for (const search of [email, domain]) {
    for await (const entries of instantlyPages(client.listBlocklist, {
      search,
    })) {
      const match = entries.find((entry) => {
        const blocked = String(entry.bl_value || '')
          .trim()
          .toLowerCase();
        return (
          blocked === email || (entry.is_domain === true && blocked === domain)
        );
      });
      if (match) return match;
    }
  }
  return null;
}

/**
 * Enforce the workspace blocklist, which is checked throughout ongoing campaigns:
 * https://help.instantly.ai/en/articles/6192983-global-blocklist
 * Read-back must confirm suppression; a successful label mutation is insufficient.
 * Calls are monotone and retry-safe: this code cannot remove a suppression or reset
 * a lead to the default sending state. A timeout must be retried from the durable job.
 */
export async function ensureInstantlySuppressed(client, email) {
  let entry = await findInstantlySuppression(client, email);
  if (entry) return { verified: true, existing: true, blocklistId: entry.id };
  let mutationError;
  try {
    await client.addBlocklistEmail(email);
  } catch (error) {
    mutationError = error;
  }
  entry = await findInstantlySuppression(client, email);
  if (!entry)
    throw (
      mutationError ||
      new Error('Instantly suppression was not confirmed by read-back')
    );
  return { verified: true, existing: false, blocklistId: entry.id };
}

/**
 * Execute only after the caller has durably reserved the GHL lifecycle event/outbox
 * key. All lead matches are exact email matches, across every campaign. Historical
 * imports never mutate Instantly; status echoes can enforce suppression but cannot
 * write the status back and generate another echo. Caller must record each result.
 * No appointment is inferred from a URL visit, and no customer value is fabricated.
 */
export async function syncInstantlyLifecycle(
  client,
  { email, lifecycle, origin = 'ghl', historical = false } = {},
) {
  if (historical) return { skipped: 'historical', mutated: false };
  if (
    ![
      'appointment_booked',
      'appointment_attended',
      'customer_won',
      'unsubscribed',
    ].includes(lifecycle)
  ) {
    throw new TypeError('Unsupported Instantly lifecycle transition');
  }
  if (!['ghl', 'instantly'].includes(origin))
    throw new TypeError('Unknown synchronization origin');
  const leads = await findInstantlyLeadsByEmail(client, email);
  if (!leads.length) return { skipped: 'no_exact_match', mutated: false };
  const suppression = await ensureInstantlySuppressed(client, email);
  const changes = [];
  const desired = INSTANTLY_INTEREST_STATUS[lifecycle];
  for (const lead of leads) {
    // Sending status -1/-2 is bounce/unsubscribe and must remain protected.
    // An unsubscribe has no writable sending-status API field: suppression is the
    // stop mechanism; do not mislabel it as a lost sale or destroy existing status.
    if (
      origin === 'instantly' ||
      desired === undefined ||
      [-1, -2].includes(lead.status)
    )
      continue;
    // Do not move a won/attended lead backwards on a delayed booking delivery.
    const current = lead.lt_interest_status;
    if (
      current === desired ||
      ([2, 3, 4].includes(current) && current > desired)
    )
      continue;
    await client.setLeadInterest(lead.id, desired);
    const confirmed = await client.getLead(lead.id);
    if (
      normalizedEmail(confirmed?.email) !== normalizedEmail(email) ||
      confirmed?.lt_interest_status !== desired
    ) {
      throw new Error(
        'Instantly lifecycle status was not confirmed by read-back',
      );
    }
    changes.push({
      leadId: lead.id,
      campaignId: lead.campaign || null,
      interestStatus: desired,
    });
  }
  return {
    matchedLeadIds: leads.map((lead) => lead.id),
    suppression,
    changes,
    sequenceStopVerified: suppression.verified,
    // Live acceptance test must additionally inspect the campaign's sending state;
    // this result means the documented stop control was read back successfully.
    verification: 'workspace_blocklist_readback',
    mutated: !suppression.existing || changes.length > 0,
  };
}
