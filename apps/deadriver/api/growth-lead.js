import { createHmac, randomUUID } from 'node:crypto';
import { growthSummary } from '../src/lib/growth-tools.js';
import { sanitizeAttribution } from '../src/lib/attribution.js';
import persistedAttributionFields from '../src/data/ghl-attribution-fields.json' with { type: 'json' };
import {
  attributionContactFields,
  contactFieldValues,
  resolveAttributionFieldMap,
  touchSource,
} from '../src/lib/crm-attribution.js';
import {
  qualificationContext,
  qualifyProspect,
  sanitizeSignals,
} from '../src/lib/growth-qualification.js';
const industries = new Set([
  'home-services',
  'med-spas',
  'dental',
  'real-estate',
  'ecommerce',
  'other',
]);
export function validateLead(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    throw new Error('A valid request is required.');
  if (!['strategy', 'demo', 'growth-plan', 'demandflow'].includes(body.kind))
    throw new Error('Choose a valid request type.');
  for (const key of ['name', 'email'])
    if (
      typeof body[key] !== 'string' ||
      !body[key].trim() ||
      body[key].length > (key === 'email' ? 200 : 120)
    )
      throw new Error('Enter a valid ' + key + '.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))
    throw new Error('Enter a valid email address.');
  if (body.consent !== true)
    throw new Error('Please confirm consent to a response.');
  if (!industries.has(body.industry))
    throw new Error('Choose a valid industry.');
  const isDemandFlow =
    body.kind === 'demandflow' &&
    ['/demandflow', '/book'].includes(body.source) &&
    body.industry === 'home-services';
  if (
    body.phone != null &&
    (typeof body.phone !== 'string' ||
      body.phone.length > 40 ||
      (body.phone.trim() &&
        (!/^[+()\d\s.\-]{7,40}$/.test(body.phone) ||
          body.phone.replace(/\D/g, '').length < 7 ||
          body.phone.replace(/\D/g, '').length > 15)))
  )
    throw new Error('Enter a valid callback number.');
  // The Demand Intelligence hero form asks only for name, phone and email.
  const isDiQuick =
    body.kind === 'demo' &&
    body.source === '/demand-intelligence' &&
    body.form === 'di-hero';
  if (((isDemandFlow && body.source === '/demandflow') || isDiQuick) && !body.phone?.trim())
    throw new Error('Enter a valid callback number.');
  if (body.fax) return { spam: true };
  if (body.website) {
    let u;
    try {
      u = new URL(body.website);
    } catch {
      throw new Error('Enter a valid website URL.');
    }
    if (!['http:', 'https:'].includes(u.protocol) || u.username || u.password)
      throw new Error('Use an http or https website URL without credentials.');
  }
  for (const key of ['company', 'message', 'website'])
    if (
      body[key] != null &&
      (typeof body[key] !== 'string' ||
        body[key].length > (key === 'message' ? 2000 : 500))
    )
      throw new Error('Check the ' + key + ' field.');
  if (
    (!isDiQuick &&
      (!body.company?.trim() ||
        (body.kind !== 'growth-plan' &&
          !isDemandFlow &&
          !body.message?.trim())))
  )
    throw new Error('Company and goals are required.');
  const summary =
    body.kind === 'growth-plan' ? growthSummary(body.answers || {}) : null;
  let context = null;
  if (summary) {
    const a = body.answers;
    if (
      !['early', 'established', 'expanding'].includes(a.stage) ||
      !['0', '1', '2'].includes(a.channels)
    )
      throw new Error('Complete business stage and channel scope.');
    context = {
      ...qualificationContext(a),
      stage: a.stage,
      channels: Number(a.channels),
      revenue: null,
      budget: null,
    };
    for (const key of ['revenue', 'budget'])
      if (a[key] !== '' && a[key] != null) {
        const n = Number(a[key]);
        if (!Number.isFinite(n) || n < 0 || n > 1000000000)
          throw new Error('Enter a valid ' + key + '.');
        context[key] = n;
      }
  }
  // Campaign identity is allowlisted here; public input cannot choose CRM tags.
  const campaign =
    body.source === '/el-paso-roofers' &&
    body.kind === 'strategy' &&
    body.industry === 'home-services'
      ? 'elpaso-roofer'
      : isDemandFlow
        ? 'demandflow-home-services'
        : null;
  const attribution =
    sanitizeAttribution(body.attribution) ||
    (campaign
      ? Object.fromEntries(
          [
            'utm_source',
            'utm_medium',
            'utm_campaign',
            'utm_content',
            'utm_term',
          ]
            .filter((key) => typeof body.attribution?.[key] === 'string')
            .map((key) => [
              key,
              body.attribution[key].replace(/[\r\n\t]/g, ' ').slice(0, 160),
            ]),
        )
      : null);
  if (
    body.inquiryId != null &&
    (typeof body.inquiryId !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        body.inquiryId,
      ))
  ) {
    throw new Error(
      'The inquiry identifier is invalid. Please reload the form.',
    );
  }
  const route = campaign
    ? campaign
    : body.kind === 'demo'
      ? 'demand-intelligence-demo'
      : summary && !summary.reviewReady
        ? 'growth-readiness-review'
        : body.industry + '-growth-strategist';
  const qualification = summary
    ? qualifyProspect(summary, body.answers, body.industry, body.signals)
    : null;
  return {
    kind: body.kind,
    campaign,
    attribution,
    eventId: `drm_inquiry_${body.inquiryId || randomUUID()}`,
    name: body.name.trim(),
    email: body.email.trim().toLowerCase(),
    phone: body.phone?.trim() || '',
    company: body.company || '',
    website: body.website || '',
    message: body.message || '',
    industry: body.industry,
    interest: String(body.interest || summary?.recommended || '').slice(0, 80),
    consent: { response: true, smsMarketing: false },
    context,
    qualification,
    signals: sanitizeSignals(body.signals),
    requestedAppointment:
      body.source === '/book' ||
      isDiQuick ||
      campaign === 'elpaso-roofer' ||
      campaign === 'demandflow-home-services',
    preferredTime: ['morning', 'afternoon', 'flexible'].includes(
      body.preferredTime,
    )
      ? body.preferredTime
      : null,
    summary: summary
      ? {
          score: summary.total,
          recommended: summary.recommended,
          reviewReady: summary.reviewReady,
          priorities: summary.priorities.map((d) => d.key),
        }
      : null,
    route,
    source: [
      '/demo',
      '/growth-plan',
      '/book',
      '/el-paso-roofers',
      '/demandflow',
      '/demand-intelligence',
    ].includes(body.source)
      ? body.source
      : 'website',
    submittedAt: new Date().toISOString(),
  };
}
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Use POST.' });
  }
  if (
    !String(req.headers?.['content-type'] || '').startsWith('application/json')
  )
    return res.status(415).json({ error: 'Use application/json.' });
  if (req.headers?.origin) {
    try {
      if (new URL(req.headers.origin).host !== req.headers.host)
        return res.status(403).json({ error: 'Origin not allowed.' });
    } catch {
      return res.status(403).json({ error: 'Origin not allowed.' });
    }
  }
  let body;
  try {
    if (typeof req.body === 'string' && Buffer.byteLength(req.body) > 16000)
      return res.status(413).json({ error: 'Request too large.' });
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (Buffer.byteLength(JSON.stringify(body || {})) > 16000)
      return res.status(413).json({ error: 'Request too large.' });
  } catch {
    return res.status(400).json({ error: 'Invalid request.' });
  }
  let lead;
  try {
    lead = validateLead(body);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  if (lead.spam)
    return res
      .status(200)
      .json({ ok: true, preview: true, route: 'validation-only' });
  // Preview deployments never deliver, even if production secrets are
  // inherited: nothing is stored and nobody is alerted while a draft of the
  // site is being reviewed.
  if (process.env.VERCEL_ENV !== 'production')
    return res.status(200).json({
      ok: true,
      preview: true,
      route: lead.route,
      priority: lead.qualification?.priority || 'standard-review',
      closerAlertPlanned: lead.qualification?.notifyCloser || false,
      message: RECEIVED_MESSAGE,
    });
  const ghl = ghlConfig();
  const webhook = webhookConfig();
  if ((!ghl && !webhook) || (lead.campaign && !ghl))
    return res.status(503).json({
      error:
        'This form is not connected yet. Please email brandon@deadrivermanagement.com or call (915) 228-3054.',
    });
  if (lead.attribution?.version === 1 && !ghl?.fieldMap) {
    return res.status(503).json({
      error:
        'Attribution is not connected yet. Please email brandon@deadrivermanagement.com or call (915) 228-3054.',
    });
  }
  // Downstream conversion consumers must never see an inquiry before CRM
  // contact, structured attribution and required tags are confirmed saved.
  const saved = ghl ? await deliverToGhl(ghl, lead) : null;
  const forwarded =
    webhook && (!ghl || saved) ? await deliverToWebhook(webhook, lead) : null;
  // Roofing inquiries are successful only after GHL confirms the campaign tag.
  // An optional webhook alone cannot fulfil that requirement.
  if (lead.campaign ? !saved : !saved && !forwarded)
    return res.status(502).json({
      error:
        'We could not confirm your request was delivered. Please try again, or email brandon@deadrivermanagement.com.',
    });
  return res.status(200).json({
    ok: true,
    preview: false,
    event_id: lead.eventId,
    analytics_allowed:
      lead.attribution?.consent?.storage !== false &&
      lead.attribution?.consent?.ad_user_data !== 'denied',
    route: lead.route,
    message: RECEIVED_MESSAGE,
  });
}

const RECEIVED_MESSAGE =
  'Thanks, we have your request. Brandon or a strategist will reply by email within one business day.';

// The same GoHighLevel Contacts API that /api/lead.js uses for the older
// forms, so the new forms land in the same CRM with the same secrets.
const GHL_API_VERSION = '2021-07-28';

function ghlConfig() {
  const token = process.env.GHL_PIT,
    locationId = process.env.GHL_LOCATION_ID;
  return token && locationId
    ? {
        token,
        locationId,
        fieldMap: resolveAttributionFieldMap({
          locationId,
          override: process.env.GHL_ATTRIBUTION_FIELD_IDS,
          persisted: persistedAttributionFields,
        }),
      }
    : null;
}

// Optional extra delivery to a signed HTTPS webhook (for a report generator
// or a separate alerting service). Only used when all three are configured.
function webhookConfig() {
  if (
    process.env.ENABLE_GROWTH_INTAKE !== 'true' ||
    !process.env.GROWTH_LEAD_WEBHOOK ||
    !process.env.GROWTH_WEBHOOK_SECRET
  )
    return null;
  try {
    const url = new URL(process.env.GROWTH_LEAD_WEBHOOK);
    if (url.protocol !== 'https:') return null;
    return { url, secret: process.env.GROWTH_WEBHOOK_SECRET };
  } catch {
    return null;
  }
}

const KIND_LABEL = {
  strategy: 'Strategy call request',
  demo: 'Demand Intelligence demo request',
  'growth-plan': 'Growth Plan report request',
  demandflow: 'DemandFlow qualification request',
};

function splitName(full) {
  const parts = full.split(/\s+/).filter(Boolean);
  return { firstName: parts.shift() || '', lastName: parts.join(' ') };
}

// A readable note for whoever picks the lead up in the CRM.
export function leadNote(lead) {
  const lines = [
    `${KIND_LABEL[lead.kind] || 'Website request'} from ${lead.source}`,
    `Industry: ${lead.industry}`,
    lead.interest ? `Interested in: ${lead.interest}` : '',
    lead.campaign ? `Campaign tag: ${lead.campaign}` : '',
    ...Object.entries(
      lead.attribution?.version === 1
        ? lead.attribution.latest || {}
        : lead.attribution || {},
    ).map(([key, value]) => `${key}: ${value}`),
    lead.website ? `Website: ${lead.website}` : '',
    lead.requestedAppointment
      ? `Asked for a call (${lead.preferredTime || 'flexible'} preferred)`
      : '',
    lead.message ? `\nGoals:\n${lead.message}` : '',
  ];
  if (lead.context) {
    const c = lead.context;
    lines.push(
      '',
      `Stage: ${c.stage} · Team: ${c.teamSize} · Revenue: ${c.revenueRange} · Budget: ${c.budgetRange}`,
      `Brings in customers today via: ${c.currentAcquisition} · Systems: ${c.currentSystems}`,
      `Biggest challenge: ${c.challenge} · Start: ${c.timeline}`,
      `Wants to run ads on ${c.channels} platform(s)`,
      c.businessGoal ? `Main goal: ${c.businessGoal}` : '',
    );
  }
  if (lead.summary)
    lines.push(
      '',
      `Growth Plan score ${lead.summary.score}/100 · suggested plan: ${lead.summary.recommended}`,
      `Top priorities: ${lead.summary.priorities.join(', ')}`,
      `Ready for a fit review: ${lead.summary.reviewReady ? 'yes' : 'not yet'}`,
    );
  if (lead.qualification)
    lines.push(
      `Sales priority: ${lead.qualification.priority} (${lead.qualification.score})`,
    );
  lines.push(
    '',
    `Route: ${lead.route}`,
    `Inquiry event: ${lead.eventId}`,
    `Submitted: ${lead.submittedAt}`,
  );
  return (
    lines
      .filter((line) => line !== '' || true)
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
      // GHL notes may be rendered as rich text. Form and campaign values stay
      // readable text, never executable HTML supplied by a public visitor.
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
  );
}

async function deliverToGhl({ token, locationId, fieldMap }, lead) {
  const headers = {
    Authorization: `Bearer ${token}`,
    Version: GHL_API_VERSION,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  const { firstName, lastName } = splitName(lead.name);
  const payload = {
    locationId,
    firstName: firstName || lead.name,
    email: lead.email,
  };
  if (lastName) payload.lastName = lastName;
  if (lead.phone) payload.phone = lead.phone;
  if (lead.company) payload.companyName = lead.company;
  const tags = lead.campaign
    ? [lead.campaign]
    : [
        process.env.GHL_LEAD_TAG || 'website-lead',
        `growth-${lead.kind}`,
        ...(lead.source === '/book' && ['dental', 'real-estate', 'ecommerce', 'med-spas'].includes(lead.industry)
          ? [`industry-${lead.industry}`, lead.route] : []),
        ...(lead.qualification?.priority === 'priority-review'
          ? ['priority-review']
          : []),
      ];
  const request = async (path, method = 'GET', body) => {
    const response = await fetch(
      `https://services.leadconnectorhq.com${path}`,
      {
        method,
        headers,
        ...(body ? { body: JSON.stringify(body) } : {}),
        signal: AbortSignal.timeout(8000),
      },
    );
    if (!response.ok)
      throw new Error(`GHL ${method} failed (${response.status})`);
    return response.json();
  };
  const matchingEmail = (contact) =>
    typeof contact.email === 'string' &&
    contact.email.trim().toLowerCase() === lead.email;
  try {
    const query = new URLSearchParams({ locationId, email: lead.email });
    const duplicate = await request(`/contacts/search/duplicate?${query}`);
    let contact = duplicate.contact;
    if (contact?.id && !matchingEmail(contact)) {
      throw new Error('Contact email match could not be confirmed');
    }
    if (!contact?.id && lead.phone) {
      const phoneQuery = new URLSearchParams({
        locationId,
        number: lead.phone,
      });
      const phoneMatch = await request(
        `/contacts/search/duplicate?${phoneQuery}`,
      );
      if (phoneMatch.contact?.id) {
        // Shared phones must not silently merge two different people's records.
        if (phoneMatch.contact.email && !matchingEmail(phoneMatch.contact)) {
          throw new Error('Phone belongs to a different email');
        }
        contact = phoneMatch.contact;
      }
    }
    let isNew = false;
    if (!contact?.id) {
      // Let GHL's configured duplicate rules also guard concurrent creations.
      const created = await request('/contacts/upsert', 'POST', payload);
      contact = created.contact;
      isNew = created.new === true;
    } else {
      const update = { ...payload };
      delete update.locationId;
      await request(
        `/contacts/${encodeURIComponent(contact.id)}`,
        'PUT',
        update,
      );
    }
    if (typeof contact?.id !== 'string' || !contact.id)
      throw new Error('Contact ID missing');
    const contactPath = `/contacts/${encodeURIComponent(contact.id)}`;
    // Use authoritative values before filling original attribution. Neither the
    // standard source nor existing tags are overwritten by upsert/update.
    contact = (await request(contactPath)).contact;
    if (
      !contact?.id ||
      !matchingEmail(contact) ||
      (contact.locationId && contact.locationId !== locationId)
    ) {
      throw new Error('Saved contact identity could not be confirmed');
    }
    const existingFields = contactFieldValues(contact);
    if (fieldMap && lead.attribution?.version === 1) {
      const consent = { ...lead.attribution.consent };
      for (const key of ['ad_storage', 'ad_user_data']) {
        const recorded = existingFields[fieldMap[key]];
        if (
          consent[key] === 'unknown' &&
          ['granted', 'denied'].includes(recorded)
        )
          consent[key] = recorded;
      }
      if (consent.ad_storage === 'denied') consent.storage = false;
      lead.attribution = sanitizeAttribution({ ...lead.attribution, consent });
    }
    const tagged = await request(`${contactPath}/tags`, 'POST', { tags });
    if (
      !Array.isArray(tagged.tags) ||
      tags.some((tag) => !tagged.tags.includes(tag))
    ) {
      throw new Error('Required tags not confirmed');
    }
    const alreadyRecorded =
      fieldMap &&
      existingFields[fieldMap.last_inquiry_event_id] === lead.eventId;
    const changes = {};
    let inquiryFields = [];
    if (!contact.source && isNew) {
      changes.source =
        lead.attribution?.version === 1
          ? touchSource(lead.attribution.first)
          : lead.campaign === 'elpaso-roofer'
            ? 'Website - El Paso roofing consultation'
            : lead.campaign === 'demandflow-home-services'
              ? 'Website - DemandFlow qualification'
              : `Website - ${KIND_LABEL[lead.kind] || lead.kind}`;
    }
    if (fieldMap) {
      const fields = attributionContactFields({
        attribution: lead.attribution,
        map: fieldMap,
        contact,
        eventId: lead.eventId,
        submittedAt: alreadyRecorded
          ? existingFields[fieldMap.last_inquiry_at] || lead.submittedAt
          : lead.submittedAt,
        isNew,
      });
      const inquiryIds = new Set([
        fieldMap.last_inquiry_event_id,
        fieldMap.last_inquiry_at,
      ]);
      changes.customFields = fields.filter(({ id }) => !inquiryIds.has(id));
      inquiryFields = fields.filter(({ id }) => inquiryIds.has(id));
    }
    if (changes.source || changes.customFields?.length) {
      await request(contactPath, 'PUT', changes);
      const verified = (await request(contactPath)).contact;
      const fields = contactFieldValues(verified);
      if (
        !verified?.id ||
        (changes.source && verified.source !== changes.source) ||
        changes.customFields?.some(
          ({ id, fieldValue }) => String(fields[id] ?? '') !== fieldValue,
        )
      ) {
        throw new Error('Structured attribution not confirmed saved');
      }
    }
    // A native conversion workflow watches this receipt field, not a contact
    // creation or campaign-tag trigger. Write it only after attribution readback
    // and additive tags have both succeeded.
    if (inquiryFields.length) {
      await request(contactPath, 'PUT', { customFields: inquiryFields });
      const verified = contactFieldValues((await request(contactPath)).contact);
      if (
        inquiryFields.some(
          ({ id, fieldValue }) => String(verified[id] ?? '') !== fieldValue,
        )
      ) {
        throw new Error('Inquiry receipt not confirmed saved');
      }
    }
    if (!alreadyRecorded) {
      try {
        await request(`${contactPath}/notes`, 'POST', { body: leadNote(lead) });
      } catch {
        console.error('growth-lead: note could not be saved');
      }
    }
    return true;
  } catch (err) {
    console.error('growth-lead: GHL delivery failed', err.message);
    return false;
  }
}

async function deliverToWebhook({ url, secret }, lead) {
  try {
    const id = lead.eventId,
      payload = JSON.stringify({ id, ...lead }),
      signature = createHmac('sha256', secret).update(payload).digest('hex');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-DRM-Signature': signature,
        'X-DRM-Request-ID': id,
      },
      body: payload,
      signal: AbortSignal.timeout(8000),
      redirect: 'error',
    });
    if (!response.ok)
      console.error('growth-lead: webhook rejected', response.status);
    return response.ok;
  } catch (err) {
    console.error('growth-lead: webhook failed', err);
    return false;
  }
}
