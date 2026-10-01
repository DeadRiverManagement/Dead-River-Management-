// Vercel Serverless Function — receives the post-payment onboarding form and
// creates/updates the contact in GoHighLevel, then attaches the answers as a
// note on that contact.
//
// The answers go in a note rather than custom fields so this works without
// anyone pre-creating a custom field per question in GHL. If the notes call
// fails (usually a missing scope on the token), the full submission is written
// to the function log so it is recoverable, and the customer still gets a
// success screen, because they have already paid and a red error helps nobody.
//
// This endpoint does not send email.
//
// Server-only env vars (Vercel -> Settings -> Environment Variables).
// Do NOT prefix these with PUBLIC_ — that would ship them to the browser.
//   GHL_PIT            Private Integration Token (scopes: contacts.write,
//                      contacts.readonly, and notes for the note to attach)
//   GHL_LOCATION_ID    Sub-account (location) ID

const GHL_UPSERT_URL = 'https://services.leadconnectorhq.com/contacts/upsert';
const GHL_API_VERSION = '2021-07-28';
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Offer v1 and Core 3 plans that have an /onboarding/<slug> form. A stray `plan` value
// must not invent a tag. Display names (`plan=Front Desk AI`) and slugs
// (`plan=front-desk-ai`) resolve to the same plan. Intake posts
// form=onboarding and a different field set from /welcome/*.
export const PLAN_NAMES = {
  essentials: 'Essentials',
  'front-desk-ai': 'Front Desk AI',
  'front-desk-complete': 'Front Desk Complete',
  'local-visibility': 'Local Visibility',
  'search-growth': 'Search Growth',
  'paid-growth': 'Paid Growth',
  website: 'Website',
  'dead-river-complete': 'Dead River Complete',
  foundation: 'Foundation',
  'growth-partner': 'Growth Partner',
  scale: 'Scale',
};

const PLAN_ALIASES = {
  'missed-call-rescue': 'essentials',
  'front-desk-essentials': 'essentials',
  'whole-river-plan': 'dead-river-complete',
  growth_partner: 'growth-partner',
};

const PHONE_PROVISIONING = new Set(['new', 'port required']);

// Harper intake extras that must be present before we write the contact.
export const INTAKE_REQUIRED_EXTRAS = {
  essentials: ['phone_provisioning', 'booking_notify_name', 'booking_notify_phone'],
  'front-desk-ai': ['sms_setup_prefs', 'calendar_for_bookings'],
  'front-desk-complete': ['call_forwarding_notes', 'calendar_for_bookings', 'book_vs_transfer_rules'],
  'local-visibility': ['gbp_link_or_access_notes', 'review_request_source'],
  'search-growth': ['hosting_dns_owner', 'top_services', 'gbp_access_notes'],
  'paid-growth': ['ads_access_notes', 'monthly_ad_budget', 'brandon_kickoff_availability'],
  website: ['domain_status', 'design_approval_contact'],
  'dead-river-complete': ['calendar_for_bookings', 'gbp_ads_access_notes', 'ad_budget_60_days', 'brandon_kickoff_times'],
  foundation: ['monthly_ad_budget'],
  'growth-partner': ['monthly_ad_budget'],
  scale: ['monthly_ad_budget'],
};

const clean = (value, max) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

function incompleteNote(isIntake) {
  return isIntake
    ? { ok: false, note: false, error: 'note_failed' }
    : { ok: true, note: false };
}

export function resolveOnboardPlan(rawPlan) {
  const raw = clean(rawPlan, 60);
  if (!raw) return null;
  const lower = raw.toLowerCase();
  const aliased = PLAN_ALIASES[raw] || PLAN_ALIASES[lower];
  if (aliased) return { slug: aliased, name: PLAN_NAMES[aliased] };
  if (PLAN_NAMES[raw]) return { slug: raw, name: PLAN_NAMES[raw] };
  if (PLAN_NAMES[lower]) return { slug: lower, name: PLAN_NAMES[lower] };
  const byName = Object.entries(PLAN_NAMES).find(([, name]) => name.toLowerCase() === lower);
  if (byName) return { slug: byName[0], name: byName[1] };
  return null;
}

// Field order here is the order it reads in the note.
const FIELDS = [
  ['business_name', 'Business name', 120],
  ['business_phone', 'Number that receives the calls', 40],
  ['number_choice', 'Existing number or new one', 60],
  ['services', 'What they do', 1200],
  ['service_area', 'Service area', 300],
  ['hours', 'Business hours', 300],
  ['booking_calendar', 'Calendar to book into', 200],
  ['ai_notes', 'Notes for the AI', 1200],
  // Dead River Complete /welcome only. Absent fields are dropped.
  ['website', 'Website', 200],
  ['gbp', 'Google Business Profile', 60],
  ['jobs_wanted', 'Jobs they want more of', 1200],
  // /onboarding/* — Casey GHL create map (Rowan). Absent on /welcome/*
  // so those notes stay the same.
  ['business_legal_name', 'Business legal name', 120],
  ['business_dba', 'DBA', 120],
  ['phone_mobile', 'Mobile', 40],
  ['public_business_address', 'Public business address', 300],
  ['service_areas', 'Service areas', 300],
  ['phone_provisioning', 'Phone provisioning', 40],
  ['booking_notify_name', 'Booked-job texts go to', 120],
  ['booking_notify_phone', 'Booked-job texts phone', 40],
  ['booking_notify_email', 'Booked-job texts email', 160],
  ['preferred_timezone', 'Timezone', 80],
  ['business_website', 'Website', 200],
  ['business_hours_notes', 'Business hours notes', 1200],
  ['after_hours_notes', 'After-hours notes', 1200],
  ['phone_system_notes', 'Phone system notes', 1200],
  ['google_calendar_email', 'Google calendar email', 160],
  ['sms_setup_prefs', 'SMS setup prefs', 1200],
  ['calendar_for_bookings', 'Calendar for bookings', 200],
  ['after_hours_booking_rules', 'After-hours booking rules', 1200],
  ['call_forwarding_notes', 'Call forwarding', 1200],
  ['book_vs_transfer_rules', 'Book vs transfer rules', 1200],
  ['after_hours_emergency_rules', 'After-hours emergency rules', 1200],
  ['gbp_link_or_access_notes', 'GBP link or access', 1200],
  ['review_request_source', 'Review-request source', 300],
  ['hosting_dns_owner', 'Hosting / DNS owner', 300],
  ['top_services', 'Top services', 1200],
  ['gbp_access_notes', 'GBP access', 1200],
  ['pages_that_must_stay', 'Pages that must stay', 1200],
  ['ads_access_notes', 'Ads access', 1200],
  ['monthly_ad_budget', 'Monthly ad budget', 120],
  ['brandon_kickoff_availability', 'Brandon kickoff availability', 300],
  ['logo_brand_photos_notes', 'Logo, brand, and photos', 1200],
  ['domain_status', 'Domain status', 80],
  ['design_approval_contact', 'Design-approval contact', 200],
  ['gbp_ads_access_notes', 'GBP and ads access', 1200],
  ['ad_budget_60_days', '60-day ad budget', 120],
  ['brandon_kickoff_times', 'Brandon kickoff times', 300],
  ['notes', 'Notes', 1200],
  ['stripe_product', 'Stripe product', 80],
  ['stripe_customer_id', 'Stripe customer', 80],
  ['stripe_subscription_id', 'Stripe subscription', 80],
];

export default async function handler(req, res) {
  if (process.env.VERCEL_ENV === "preview") return res.status(409).json({ error: "Legacy production integrations are disabled in this preview." });
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const token = process.env.GHL_PIT;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !locationId) {
    console.error('onboard: GHL_PIT or GHL_LOCATION_ID is not set');
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
  if (clean(body.company, 100)) return res.status(200).json({ ok: true });

  const resolved = resolveOnboardPlan(body.plan);
  if (!resolved) return res.status(400).json({ ok: false, error: 'unknown_plan' });
  const { slug: planSlug, name: planName } = resolved;

  const firstName = clean(body.first_name, 80);
  const lastName = clean(body.last_name, 80);
  const email = clean(body.email, 160).toLowerCase();
  const businessName = clean(body.business_legal_name, 120) || clean(body.business_name, 120);
  const businessPhone = clean(body.business_phone, 40);
  const services = clean(body.services, 1200);

  // /onboarding/* is the Harper email intake. /welcome/* is the payment-redirect
  // setup form. Same endpoint, different required fields. Intake keys are
  // Casey's GHL create map and are not aliases of the welcome field names.
  const isIntake = clean(body.form, 40) === 'onboarding';
  const publicAddress = clean(body.public_business_address, 300);
  const serviceAreas = clean(body.service_areas, 300);
  const notifyName = clean(body.booking_notify_name, 120);
  const notifyPhone = clean(body.booking_notify_phone, 40);
  let notifyEmail = clean(body.booking_notify_email, 160).toLowerCase();
  if (isIntake && notifyName && !notifyEmail) {
    notifyEmail = email;
    body.booking_notify_email = email;
  }

  let phone = clean(body.phone_mobile, 40) || clean(body.phone, 40);
  if (isIntake) {
    phone = phone || notifyPhone || businessPhone;
    const extras = INTAKE_REQUIRED_EXTRAS[planSlug] || [];
    const extrasMissing = extras.some((key) => !clean(body[key], 1200));
    const badProvisioning = extras.includes('phone_provisioning')
      && !PHONE_PROVISIONING.has(clean(body.phone_provisioning, 40));
    if (
      !firstName ||
      !lastName ||
      !email ||
      !businessName ||
      !businessPhone ||
      !publicAddress ||
      !serviceAreas ||
      extrasMissing ||
      badProvisioning
    ) {
      return res.status(400).json({ ok: false, error: 'missing_fields' });
    }
    if (!EMAIL_RE.test(email) || (notifyEmail && !EMAIL_RE.test(notifyEmail))) {
      return res.status(400).json({ ok: false, error: 'bad_email' });
    }
  } else {
    // Someone taking a brand new number has no existing business number to give,
    // so it is only required when they are keeping or porting one.
    const numberChoice = clean(body.number_choice, 80);
    const wantsNewNumber = numberChoice === 'Brand new number, nothing to keep';

    if (!firstName || !email || !phone || !businessName || !services || !numberChoice) {
      return res.status(400).json({ ok: false, error: 'missing_fields' });
    }
    if (!wantsNewNumber && !businessPhone) {
      return res.status(400).json({ ok: false, error: 'missing_business_phone' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ ok: false, error: 'bad_email' });
    }
  }

  const answers = FIELDS
    .map(([key, label, max]) => [label, clean(body[key], max)])
    .filter(([, value]) => value);

  const noteBody = [
    `${planName} onboarding form`,
    `Submitted ${new Date().toISOString()}`,
    '',
    ...answers.map(([label, value]) => `${label}: ${value}`),
  ].join('\n');

  const payload = {
    locationId,
    firstName,
    email,
    phone,
    companyName: businessName,
    source: `Onboarding - ${planName}`,
    tags: [planSlug, 'onboarding', 'customer', ...(isIntake ? [`${planSlug}-onboarding`] : [])],
  };
  if (lastName) payload.lastName = lastName;

  let contactId = null;
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
      console.error('onboard: GHL rejected the contact', upstream.status, detail.slice(0, 500));
      console.error('onboard: UNSAVED SUBMISSION >>>', noteBody);
      return res.status(502).json({ ok: false, error: 'upstream', status: upstream.status });
    }

    const data = await upstream.json().catch(() => null);
    contactId = data?.contact?.id ?? data?.id ?? null;
  } catch (err) {
    console.error('onboard: request to GHL failed', err);
    console.error('onboard: UNSAVED SUBMISSION >>>', noteBody);
    return res.status(502).json({ ok: false, error: 'upstream_unreachable' });
  }

  // Contact upsert without the intake note is not completed onboarding.
  // /welcome/* still treats HTTP 200 as "we have you"; /onboarding/* requires
  // note:true before it shows thanks.
  if (!contactId) {
    console.error('onboard: upsert returned no contact id. ANSWERS >>>', noteBody);
    return res.status(200).json(incompleteNote(isIntake));
  }

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
      const detail = await noteRes.text();
      console.error('onboard: note rejected', noteRes.status, detail.slice(0, 300));
      console.error('onboard: ANSWERS FOR', contactId, '>>>', noteBody);
      return res.status(200).json(incompleteNote(isIntake));
    }
  } catch (err) {
    console.error('onboard: note request failed', err);
    console.error('onboard: ANSWERS FOR', contactId, '>>>', noteBody);
    return res.status(200).json(incompleteNote(isIntake));
  }

  console.log('onboard: saved', JSON.stringify({ plan: planSlug, contactId }));
  return res.status(200).json({ ok: true, note: true });
}
