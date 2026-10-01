// Vercel Serverless Function — receives the site's lead-form POST (same-origin)
// and creates/updates the contact in GoHighLevel via the v2 Contacts API.
//
// This replaces the GoHighLevel "Inbound Webhook" workflow trigger, which is a
// premium trigger billed per execution. The Contacts API is included in the
// plan, so leads cost nothing to ingest. In GHL, trigger workflows off the
// free "Contact Tag" trigger matching GHL_LEAD_TAG.
//
// Server-only env vars (Vercel -> Settings -> Environment Variables).
// Do NOT prefix these with PUBLIC_ — that would ship them to the browser.
//   GHL_PIT            Private Integration Token (scopes: contacts.write,
//                      contacts.readonly, and notes for the qualifying answers)
//   GHL_LOCATION_ID    Sub-account (location) ID
//   GHL_LEAD_TAG       optional, defaults to "website-lead"
//   GHL_PAGE_FIELD_ID  optional custom-field id to receive the page URL

const GHL_UPSERT_URL = 'https://services.leadconnectorhq.com/contacts/upsert';
const GHL_API_VERSION = '2021-07-28';
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Unlocks /watch. vercel.json redirects that page away from anyone without
// this cookie, so it is set on any successful lead: they have given us their
// details, whichever form they used. HttpOnly because only the edge reads it.
const WATCH_COOKIE = 'drm_watch';
const WATCH_COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // 180 days

const unlockWatch = (res) =>
  res.setHeader(
    'Set-Cookie',
    `${WATCH_COOKIE}=1; Path=/; Max-Age=${WATCH_COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`
  );

const clean = (value, max) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

// Form-specific tags are allowlisted rather than accepted from public input.
// Complete and the Scale playbook use only their dedicated tags. Other forms
// retain the generic lead tag and their optional form tag.
const FORM_TAGS = {
  // Route the Complete landing-page form into the Google Lead Forms workflow.
  'dead-river-complete-walkthrough': 'google-ads-website-form',
  'whole-river-walkthrough': 'whole-river-walkthrough',
  // Scale playbook lead magnet. Casey owns the GHL email/SMS + PDF workflow.
  'scale-playbook': 'scale-playbook',
};

// Forms that ask a qualifying question send the answers here. There is no
// custom field to put them in, so they ride along as a note on the contact,
// the same way api/onboard.js handles its answers.
const EXTRA_FIELDS = [
  ['business_type', 'Type of business', 80],
  ['leads_per_month', 'Leads a month right now', 40],
];

// One "Your name" box is friendlier than two, so split it here rather than
// dropping a full name into firstName. Forms that post first_name still work.
function splitName(full) {
  const parts = full.split(/\s+/).filter(Boolean);
  return { firstName: parts.shift() || '', lastName: parts.join(' ') };
}

export default async function handler(req, res) {
  if (process.env.VERCEL_ENV === "preview") return res.status(409).json({ error: "Legacy production integrations are disabled in this preview." });
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const token = process.env.GHL_PIT;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !locationId) {
    console.error('lead: GHL_PIT or GHL_LOCATION_ID is not set');
    return res.status(500).json({ ok: false, error: 'not_configured' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = null; }
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ ok: false, error: 'bad_request' });
  }

  // Honeypot: real people never fill this in. Answer 200 so bots learn nothing.
  // Forms that also ask for a business name use hp_fax, because a hidden field
  // called "company" next to a real organization field risks the browser
  // autofilling it and silently binning a genuine lead.
  if (clean(body.company, 100) || clean(body.hp_fax, 100)) {
    return res.status(200).json({ ok: true });
  }

  const name = clean(body.name, 160);
  const split = name ? splitName(name) : null;
  const firstName = split ? split.firstName : clean(body.first_name, 80);
  const lastName = split ? split.lastName : clean(body.last_name, 80);
  const email = clean(body.email, 160).toLowerCase();
  const phone = clean(body.phone, 40);
  const businessName = clean(body.business_name, 120);
  const formName = clean(body.form, 60);
  const formTag = Object.hasOwn(FORM_TAGS, formName) ? FORM_TAGS[formName] : undefined;
  const source = clean(body.source, 80) || 'Website';
  const page = clean(body.page, 300);

  if (!firstName || !email || !phone) {
    return res.status(400).json({ ok: false, error: 'missing_fields' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ ok: false, error: 'bad_email' });
  }

  const payload = {
    locationId,
    firstName,
    email,
    phone,
    source: `Website - ${source}`,
    tags: formName === 'dead-river-complete-walkthrough' || formName === 'scale-playbook'
      ? [formTag]
      : [process.env.GHL_LEAD_TAG || 'website-lead', ...(formTag ? [formTag] : [])],
  };
  if (lastName) payload.lastName = lastName;
  if (businessName) payload.companyName = businessName;
  if (process.env.GHL_PAGE_FIELD_ID && page) {
    payload.customFields = [{ id: process.env.GHL_PAGE_FIELD_ID, field_value: page }];
  }

  try {
    const upstream = await fetch(GHL_UPSERT_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Version: GHL_API_VERSION,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      console.error('lead: GHL rejected', upstream.status, detail.slice(0, 500));
      return res.status(502).json({ ok: false, error: 'upstream', status: upstream.status });
    }

    const data = await upstream.json().catch(() => null);
    const contactId = data?.contact?.id ?? data?.id ?? null;

    // Whether this is a lead we have never seen. The browser uses it to decide
    // whether to count an ad conversion: the same person filling the form again
    // on a second device is one lead, not two, and counting both would inflate
    // the campaign. Prefer an explicit flag; fall back to how recently the
    // contact was created, since an upsert returns the existing record's
    // dateAdded when it matched. Unknown means count it, so a missing field
    // never silently loses a real conversion.
    const added = Date.parse(data?.contact?.dateAdded ?? data?.dateAdded ?? '');
    const isNew =
      typeof data?.new === 'boolean'
        ? data.new
        : Number.isNaN(added)
          ? true
          : Date.now() - added < 2 * 60 * 1000;

    // The lead is saved, so unlock the video here: every success below this
    // point returns with the cookie set, whether or not the note lands.
    unlockWatch(res);

    console.log('lead: upserted', JSON.stringify({ source, page }));

    // The contact is saved from here on, so the visitor is done either way: a
    // failed note must not cost them the video. Log the answers so they are
    // recoverable if the note does not land.
    const answers = EXTRA_FIELDS
      .map(([key, label, max]) => [label, clean(body[key], max)])
      .filter(([, value]) => value);

    if (answers.length && contactId) {
      const noteBody = [`Lead from ${source}`, page, '', ...answers.map(([l, v]) => `${l}: ${v}`)]
        .filter((line) => line !== undefined)
        .join('\n');
      try {
        const noteRes = await fetch(
          `https://services.leadconnectorhq.com/contacts/${encodeURIComponent(contactId)}/notes`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              Version: GHL_API_VERSION,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({ body: noteBody }),
          }
        );
        if (!noteRes.ok) {
          console.error('lead: note rejected', noteRes.status);
          console.error('lead: ANSWERS FOR', contactId, '>>>', noteBody);
          return res.status(200).json({ ok: true, note: false, isNew });
        }
      } catch (err) {
        console.error('lead: note request failed', err);
        console.error('lead: ANSWERS FOR', contactId, '>>>', noteBody);
        return res.status(200).json({ ok: true, note: false, isNew });
      }
      return res.status(200).json({ ok: true, note: true, isNew });
    }

    if (answers.length && !contactId) {
      console.error('lead: no contact id, ANSWERS >>>', JSON.stringify(answers));
    }
    return res.status(200).json({ ok: true, isNew });
  } catch (err) {
    console.error('lead: request to GHL failed', err);
    return res.status(502).json({ ok: false, error: 'upstream_unreachable' });
  }
}
