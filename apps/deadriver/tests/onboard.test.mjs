import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import handler, {
  resolveOnboardPlan,
  PLAN_NAMES,
  INTAKE_REQUIRED_EXTRAS,
} from '../api/onboard.js';

const SHARED_INTAKE = {
  form: 'onboarding',
  first_name: 'Pat',
  last_name: 'Owner',
  email: 'pat@shop.example',
  phone_mobile: '9155550100',
  business_legal_name: 'Shop LLC',
  business_dba: 'Shop',
  business_phone: '9155550101',
  public_business_address: 'El Paso, TX',
  service_areas: 'Westside, Eastside',
  business_website: 'https://shop.example',
  notes: 'Call after 3',
  stripe_customer_id: 'cus_test',
  stripe_subscription_id: 'sub_test',
};

const PLAN_EXTRAS = {
  essentials: {
    stripe_product: 'prod_VFTgb1v4pBInDc',
    phone_provisioning: 'new',
    booking_notify_name: 'Alex',
    booking_notify_phone: '9155550102',
    preferred_timezone: 'America/Denver',
    google_calendar_email: 'jobs@shop.example',
  },
  'front-desk-ai': {
    stripe_product: 'prod_VFTiCN04jgFhu6',
    sms_setup_prefs: 'Use our existing number',
    calendar_for_bookings: 'jobs@shop.example',
    after_hours_booking_rules: 'Book morning slots only',
  },
  'front-desk-complete': {
    stripe_product: 'prod_VFTjGZxJrsl54f',
    call_forwarding_notes: 'Forward to 9155550102',
    calendar_for_bookings: 'jobs@shop.example',
    book_vs_transfer_rules: 'Book routine. Transfer emergencies.',
    after_hours_emergency_rules: 'Water in the house is an emergency',
  },
  'local-visibility': {
    stripe_product: 'prod_VFTk31wYRBJjBr',
    gbp_link_or_access_notes: 'https://maps.example/shop',
    review_request_source: 'Text after the job',
  },
  'search-growth': {
    stripe_product: 'prod_VFTk7NuZqeANdK',
    hosting_dns_owner: 'Our web person',
    top_services: 'Water heaters, drain cleaning',
    gbp_access_notes: 'I can log in',
    pages_that_must_stay: 'The about page',
  },
  'paid-growth': {
    stripe_product: 'prod_VFTltGdSBJ0bCw',
    ads_access_notes: 'Invite brandon@deadrivermanagement.com',
    monthly_ad_budget: '1500',
    brandon_kickoff_availability: 'Tue or Thu after 2',
  },
  website: {
    stripe_product: 'prod_VFTmWFkteZzzzL',
    logo_brand_photos_notes: 'Logo is in Google Drive',
    domain_status: 'We have a domain',
    design_approval_contact: 'Pat Owner',
  },
  'dead-river-complete': {
    stripe_product: 'prod_VFTnbwnV5zp9Xh',
    calendar_for_bookings: 'jobs@shop.example',
    gbp_ads_access_notes: 'I can add a user on both',
    ad_budget_60_days: '3000',
    brandon_kickoff_times: 'Wed 10 to 12',
  },
  foundation: {
    stripe_product: 'price_1UHpijRtJXKDYNEJfnEM7HqW',
    monthly_ad_budget: '2000',
  },
  'growth-partner': {
    stripe_product: 'price_1UHpl0RtJXKDYNEJjEaguvcR',
    monthly_ad_budget: '5000',
  },
  scale: {
    stripe_product: 'price_1UHpm1RtJXKDYNEJrO5pJTh5',
    monthly_ad_budget: '8000',
  },
};

function mockRes() {
  return {
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

async function post(body, { env = { GHL_PIT: 'pit', GHL_LOCATION_ID: 'loc' }, fetchImpl } = {}) {
  const saved = { ...process.env };
  const originalFetch = globalThis.fetch;
  Object.assign(process.env, env);
  const calls = [];
  globalThis.fetch = fetchImpl || (async (url, options) => {
    calls.push({ url: String(url), options });
    if (String(url).includes('leadconnectorhq.com/contacts/upsert')) {
      return { ok: true, json: async () => ({ contact: { id: 'ghl_1' } }), text: async () => '' };
    }
    if (String(url).includes('/notes')) {
      return { ok: true, json: async () => ({ id: 'note_1' }), text: async () => '' };
    }
    throw new Error(`unexpected fetch ${url}`);
  });
  const res = mockRes();
  try {
    await handler({ method: 'POST', body }, res);
    return { res, calls };
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of Object.keys(process.env)) {
      if (!(key in saved)) delete process.env[key];
    }
    Object.assign(process.env, saved);
  }
}

test('resolveOnboardPlan maps slugs, display names, and retired aliases', () => {
  assert.deepEqual(resolveOnboardPlan('essentials'), { slug: 'essentials', name: 'Essentials' });
  assert.deepEqual(resolveOnboardPlan('Essentials'), { slug: 'essentials', name: 'Essentials' });
  assert.deepEqual(resolveOnboardPlan('Front Desk AI'), { slug: 'front-desk-ai', name: 'Front Desk AI' });
  assert.deepEqual(resolveOnboardPlan('missed-call-rescue'), { slug: 'essentials', name: 'Essentials' });
  assert.deepEqual(resolveOnboardPlan('whole-river-plan'), { slug: 'dead-river-complete', name: 'Dead River Complete' });
  assert.deepEqual(resolveOnboardPlan('foundation'), { slug: 'foundation', name: 'Foundation' });
  assert.deepEqual(resolveOnboardPlan('Growth Partner'), { slug: 'growth-partner', name: 'Growth Partner' });
  assert.deepEqual(resolveOnboardPlan('growth_partner'), { slug: 'growth-partner', name: 'Growth Partner' });
  assert.deepEqual(resolveOnboardPlan('scale'), { slug: 'scale', name: 'Scale' });
  assert.equal(resolveOnboardPlan('not-a-plan'), null);
  assert.equal(Object.keys(PLAN_NAMES).length, 11);
});

test('intake: every Offer v1 plan upserts with the plan-specific onboarding tag', async () => {
  for (const slug of Object.keys(PLAN_NAMES)) {
    const { res, calls } = await post({
      ...SHARED_INTAKE,
      plan: slug,
      ...PLAN_EXTRAS[slug],
    });
    assert.equal(res.code, 200, slug);
    assert.equal(res.body.ok, true, slug);
    assert.equal(calls.some((c) => /resend|docusign|email/i.test(c.url)), false, slug);

    const upsert = calls.find((c) => c.url.includes('contacts/upsert'));
    const contact = JSON.parse(upsert.options.body);
    assert.equal(contact.source, `Onboarding - ${PLAN_NAMES[slug]}`);
    assert.ok(contact.tags.includes(slug), slug);
    assert.ok(contact.tags.includes(`${slug}-onboarding`), slug);
    assert.ok(contact.tags.includes('onboarding'), slug);
    assert.ok(contact.tags.includes('customer'), slug);

    const note = JSON.parse(calls.find((c) => c.url.includes('/notes')).options.body).body;
    assert.match(note, new RegExp(`${PLAN_NAMES[slug]} onboarding form`));
    assert.match(note, /cus_test/);
    assert.match(note, /sub_test/);
    assert.match(note, new RegExp(PLAN_EXTRAS[slug].stripe_product));
    assert.doesNotMatch(note, /CSA|DocuSign|same day/i);
  }
});

test('intake: Essentials still requires phone_provisioning and booked-job texts', async () => {
  const base = { ...SHARED_INTAKE, plan: 'Essentials', stripe_product: 'prod_VFTgb1v4pBInDc' };
  const missing = await post(base);
  assert.equal(missing.res.code, 400);
  assert.equal(missing.res.body.error, 'missing_fields');

  const noNotify = await post({ ...base, phone_provisioning: 'new' });
  assert.equal(noNotify.res.code, 400);
  assert.equal(noNotify.res.body.error, 'missing_fields');

  const badChoice = await post({
    ...base,
    phone_provisioning: 'maybe later',
    booking_notify_name: 'Alex',
    booking_notify_phone: '9155550102',
  });
  assert.equal(badChoice.res.code, 400);

  const ok = await post({
    ...base,
    phone_provisioning: 'port required',
    booking_notify_name: 'Alex',
    booking_notify_phone: '9155550102',
  });
  assert.equal(ok.res.code, 200);
  const note = JSON.parse(ok.calls.find((c) => c.url.includes('/notes')).options.body).body;
  assert.match(note, /Phone provisioning: port required/);
  assert.match(note, /Booked-job texts go to: Alex/);
});

test('intake: other plans do not require Essentials notify fields', async () => {
  const { res, calls } = await post({
    ...SHARED_INTAKE,
    plan: 'front-desk-ai',
    ...PLAN_EXTRAS['front-desk-ai'],
  });
  assert.equal(res.code, 200);
  const note = JSON.parse(calls.find((c) => c.url.includes('/notes')).options.body).body;
  assert.doesNotMatch(note, /Booked-job texts/);
  assert.match(note, /SMS setup prefs/);
});

test('intake: Core 3 requires monthly_ad_budget and keeps Offer v1 extras optional', async () => {
  const missing = await post({ ...SHARED_INTAKE, plan: 'foundation' });
  assert.equal(missing.res.code, 400);
  assert.equal(missing.res.body.error, 'missing_fields');

  const ok = await post({
    ...SHARED_INTAKE,
    plan: 'growth_partner',
    stripe_product: 'price_1UHpl0RtJXKDYNEJjEaguvcR',
    monthly_ad_budget: '4500',
  });
  assert.equal(ok.res.code, 200);
  const contact = JSON.parse(ok.calls.find((c) => c.url.includes('contacts/upsert')).options.body);
  assert.ok(contact.tags.includes('growth-partner'));
  assert.ok(contact.tags.includes('growth-partner-onboarding'));
  const note = JSON.parse(ok.calls.find((c) => c.url.includes('/notes')).options.body).body;
  assert.match(note, /Growth Partner onboarding form/);
  assert.match(note, /Monthly ad budget: 4500/);
  assert.doesNotMatch(note, /Booked-job texts|Phone provisioning/);
});

test('intake: unknown_plan is reserved for plans that are not sold', async () => {
  const { res } = await post({ ...SHARED_INTAKE, plan: 'rapids-plan' });
  assert.equal(res.code, 400);
  assert.equal(res.body.error, 'unknown_plan');
});

test('intake: contact-only save is incomplete; a later retry can persist the note', async () => {
  let notes = 0;
  const fetchImpl = async (url) => {
    if (String(url).includes('leadconnectorhq.com/contacts/upsert')) {
      return { ok: true, json: async () => ({ contact: { id: 'ghl_1' } }), text: async () => '' };
    }
    if (String(url).includes('/notes')) {
      notes += 1;
      if (notes === 1) {
        return { ok: false, status: 403, json: async () => ({}), text: async () => 'missing notes scope' };
      }
      return { ok: true, json: async () => ({ id: 'note_1' }), text: async () => '' };
    }
    throw new Error(`unexpected fetch ${url}`);
  };

  const first = await post({
    ...SHARED_INTAKE,
    plan: 'essentials',
    ...PLAN_EXTRAS.essentials,
  }, { fetchImpl });
  assert.equal(first.res.code, 200);
  assert.equal(first.res.body.ok, false);
  assert.equal(first.res.body.note, false);
  assert.equal(first.res.body.error, 'note_failed');

  const retry = await post({
    ...SHARED_INTAKE,
    plan: 'essentials',
    ...PLAN_EXTRAS.essentials,
  }, { fetchImpl });
  assert.equal(retry.res.code, 200);
  assert.equal(retry.res.body.ok, true);
  assert.equal(retry.res.body.note, true);
  assert.equal(notes, 2);
});

test('welcome note failure still returns HTTP 200 with note:false', async () => {
  const { res } = await post({
    plan: 'essentials',
    first_name: 'Pat',
    email: 'pat@shop.example',
    phone: '9155550100',
    business_name: 'Shop LLC',
    number_choice: 'Brand new number, nothing to keep',
    services: 'Drain cleaning',
  }, {
    fetchImpl: async (url) => {
      if (String(url).includes('upsert')) {
        return { ok: true, json: async () => ({ contact: { id: 'ghl_1' } }), text: async () => '' };
      }
      if (String(url).includes('/notes')) {
        return { ok: false, status: 403, json: async () => ({}), text: async () => 'missing notes scope' };
      }
      throw new Error(`unexpected fetch ${url}`);
    },
  });
  assert.equal(res.code, 200);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.note, false);
});

test('welcome Essentials form still works without form=onboarding', async () => {
  const { res, calls } = await post({
    plan: 'essentials',
    first_name: 'Pat',
    last_name: 'Owner',
    email: 'pat@shop.example',
    phone: '9155550100',
    business_name: 'Shop LLC',
    number_choice: 'Brand new number, nothing to keep',
    services: 'Drain cleaning',
  });
  assert.equal(res.code, 200);
  const contact = JSON.parse(calls.find((c) => c.url.includes('contacts/upsert')).options.body);
  assert.deepEqual(contact.tags, ['essentials', 'onboarding', 'customer']);
  assert.equal(contact.tags.includes('essentials-onboarding'), false);
});

test('honeypot returns 200 and does not write to GHL', async () => {
  const { res, calls } = await post({ ...SHARED_INTAKE, plan: 'essentials', company: 'bot' });
  assert.equal(res.code, 200);
  assert.equal(calls.length, 0);
});

test('required extras stay listed for every sold plan', () => {
  for (const slug of Object.keys(PLAN_NAMES)) {
    assert.ok(INTAKE_REQUIRED_EXTRAS[slug]?.length, slug);
  }
  assert.ok(INTAKE_REQUIRED_EXTRAS.essentials.includes('phone_provisioning'));
});

test('onboarding pages do not claim a CSA was or will be sent', () => {
  const files = [
    'src/data/onboarding.ts',
    'src/components/OnboardingForm.astro',
    'src/pages/onboarding/[slug].astro',
    'src/pages/onboarding/thanks.astro',
  ];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    assert.doesNotMatch(text, /CSA|DocuSign|sent the same day|will send the same day/i, file);
  }
});

test('onboarding config product ids match the Stripe Offer v1 map', () => {
  const config = readFileSync('src/data/onboarding.ts', 'utf8');
  const webhook = readFileSync('api/stripe/onboarding.js', 'utf8');
  const products = {
    essentials: 'prod_VFTgb1v4pBInDc',
    'front-desk-ai': 'prod_VFTiCN04jgFhu6',
    'front-desk-complete': 'prod_VFTjGZxJrsl54f',
    'local-visibility': 'prod_VFTk31wYRBJjBr',
    'search-growth': 'prod_VFTk7NuZqeANdK',
    'paid-growth': 'prod_VFTltGdSBJ0bCw',
    website: 'prod_VFTmWFkteZzzzL',
    'dead-river-complete': 'prod_VFTnbwnV5zp9Xh',
  };
  for (const [slug, id] of Object.entries(products)) {
    assert.match(config, new RegExp(`slug: '${slug}'[\\s\\S]*?stripeProduct: '${id}'`));
    assert.match(webhook, new RegExp(`${id}: '`));
  }
});

test('Core 3 onboarding slugs, live prices, and nationwide copy are wired', () => {
  const config = readFileSync('src/data/onboarding.ts', 'utf8');
  const webhook = readFileSync('api/stripe/onboarding.js', 'utf8');
  const slugPage = readFileSync('src/pages/onboarding/[slug].astro', 'utf8');
  const hub = readFileSync('src/pages/onboarding/index.astro', 'utf8');
  const prices = {
    foundation: 'price_1UHpijRtJXKDYNEJfnEM7HqW',
    'growth-partner': 'price_1UHpl0RtJXKDYNEJjEaguvcR',
    scale: 'price_1UHpm1RtJXKDYNEJrO5pJTh5',
  };
  const ranges = {
    foundation: '$1,500–$3,000/mo',
    'growth-partner': '$3,000–$7,500/mo',
    scale: '$7,500+/mo',
  };
  assert.match(slugPage, /ONBOARDING_SLUGS/);
  assert.match(slugPage, /noindex/);
  assert.doesNotMatch(hub, /monthly_ad_budget/);
  for (const [slug, id] of Object.entries(prices)) {
    assert.match(config, new RegExp(`slug: '${slug}'`));
    assert.match(config, new RegExp(id));
    assert.match(config, new RegExp(ranges[slug].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.match(webhook, new RegExp(`${id}: '`));
    assert.equal(PLAN_NAMES[slug] != null || slug === 'growth-partner', true);
  }
  assert.ok(INTAKE_REQUIRED_EXTRAS.foundation.includes('monthly_ad_budget'));
  assert.ok(INTAKE_REQUIRED_EXTRAS['growth-partner'].includes('monthly_ad_budget'));
  assert.ok(INTAKE_REQUIRED_EXTRAS.scale.includes('monthly_ad_budget'));
  assert.match(config, /City, State/);
  assert.match(config, /nationwide/i);
  const normalizedConfig = config.replace(/\r\n/g, '\n');
  const core3Block = normalizedConfig.slice(normalizedConfig.indexOf("  foundation: {\n    slug: 'foundation'"));
  assert.match(core3Block, /You paid for Foundation/);
  assert.doesNotMatch(core3Block, /30 leads|El Paso, TX|\/welcome\//i);
});
