import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import handler, {
  verifyStripeSignature,
  mapProducts,
  isNewPaidSignup,
  extractSignal,
  resetOnboardMemory,
  onboardingIntakePath,
  normalizePackageKey,
} from '../api/stripe/onboarding.js';

const SECRET = 'whsec_test_only';

function sign(payload, secret = SECRET, ts = Math.floor(Date.now() / 1000)) {
  const hmac = createHmac('sha256', secret).update(`${ts}.${payload}`).digest('hex');
  return `t=${ts},v1=${hmac}`;
}

function mockRes() {
  return {
    headers: {},
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

function eventPayload(type, object, extra = {}) {
  return JSON.stringify({
    id: extra.eventId || 'evt_test_1',
    object: 'event',
    type,
    data: { object, previous_attributes: extra.previous_attributes || {} },
  });
}

test.describe('stripe onboard webhook', { concurrency: 1 }, () => {
test.beforeEach(() => resetOnboardMemory());

test('signature: accepts a matching v1 HMAC and rejects a bad or stale one', () => {
  const body = '{"id":"evt_1"}';
  const now = 1_700_000_000;
  const header = sign(body, SECRET, now);
  assert.equal(verifyStripeSignature(body, header, SECRET, now), true);
  assert.equal(verifyStripeSignature(body, header, 'whsec_other', now), false);
  assert.equal(verifyStripeSignature(body, 't=1,v1=nope', SECRET, now), false);
  assert.equal(verifyStripeSignature(body, sign(body, SECRET, now - 400), SECRET, now), false);
  assert.equal(verifyStripeSignature(body, '', SECRET, now), false);
});

test('product map: known Offer v1 ids, unknown stays unknown', () => {
  assert.deepEqual(mapProducts(['prod_VFTgb1v4pBInDc']), {
    productIds: ['prod_VFTgb1v4pBInDc'],
    plans: ['Essentials'],
    unknown: [],
  });
  assert.deepEqual(mapProducts(['prod_not_in_map']), {
    productIds: ['prod_not_in_map'],
    plans: [],
    unknown: ['prod_not_in_map'],
  });
  assert.deepEqual(mapProducts(['prod_VFTiCN04jgFhu6', 'prod_VFTmWFkteZzzzL']), {
    productIds: ['prod_VFTiCN04jgFhu6', 'prod_VFTmWFkteZzzzL'],
    plans: ['Front Desk AI', 'Website'],
    unknown: [],
  });
});

test('product map: live Core 3 prices and package metadata keys', () => {
  assert.deepEqual(mapProducts(['price_1UHpijRtJXKDYNEJfnEM7HqW']), {
    productIds: ['price_1UHpijRtJXKDYNEJfnEM7HqW'],
    plans: ['Foundation'],
    unknown: [],
  });
  assert.deepEqual(mapProducts(['price_1UHpl0RtJXKDYNEJjEaguvcR']), {
    productIds: ['price_1UHpl0RtJXKDYNEJjEaguvcR'],
    plans: ['Growth Partner'],
    unknown: [],
  });
  assert.deepEqual(mapProducts(['price_1UHpm1RtJXKDYNEJrO5pJTh5']), {
    productIds: ['price_1UHpm1RtJXKDYNEJrO5pJTh5'],
    plans: ['Scale'],
    unknown: [],
  });
  assert.deepEqual(mapProducts(['foundation']), {
    productIds: ['foundation'],
    plans: ['Foundation'],
    unknown: [],
  });
  assert.deepEqual(mapProducts(['growth_partner']), {
    productIds: ['growth_partner'],
    plans: ['Growth Partner'],
    unknown: [],
  });
  assert.deepEqual(mapProducts(['growth-partner']), {
    productIds: ['growth-partner'],
    plans: ['Growth Partner'],
    unknown: [],
  });
  assert.deepEqual(mapProducts(['scale']), {
    productIds: ['scale'],
    plans: ['Scale'],
    unknown: [],
  });
  assert.deepEqual(
    mapProducts(['price_1UHpl0RtJXKDYNEJjEaguvcR', 'growth_partner']),
    {
      productIds: ['price_1UHpl0RtJXKDYNEJjEaguvcR', 'growth_partner'],
      plans: ['Growth Partner'],
      unknown: [],
    },
  );
  assert.equal(normalizePackageKey('Growth Partner'), 'growth_partner');
  assert.equal(
    onboardingIntakePath('Growth Partner', { customer: 'cus_1', subscription: 'sub_1' }),
    '/onboarding/growth-partner?plan=growth-partner&customer=cus_1&subscription=sub_1',
  );
  assert.equal(onboardingIntakePath('Foundation'), '/onboarding/foundation?plan=foundation');
  assert.equal(onboardingIntakePath('Scale'), '/onboarding/scale?plan=scale');
});

test('new paid signup: first invoice and checkout, not a renewal', () => {
  assert.equal(isNewPaidSignup({
    type: 'invoice.paid',
    data: { object: { billing_reason: 'subscription_create' } },
  }), true);
  assert.equal(isNewPaidSignup({
    type: 'invoice.paid',
    data: { object: { billing_reason: 'subscription_cycle' } },
  }), false);
  assert.equal(isNewPaidSignup({
    type: 'checkout.session.completed',
    data: { object: { status: 'complete', payment_status: 'paid' } },
  }), true);
  assert.equal(isNewPaidSignup({
    type: 'customer.subscription.created',
    data: { object: { status: 'incomplete' } },
  }), false);
  assert.equal(isNewPaidSignup({
    type: 'customer.subscription.updated',
    data: { object: { status: 'active' }, previous_attributes: { status: 'incomplete' } },
  }), true);
  assert.equal(isNewPaidSignup({ type: 'ping', data: { object: {} } }), false);
});

test('extractSignal reads product, customer, and subscription from invoice lines', () => {
  const signal = extractSignal({
    id: 'evt_abc',
    type: 'invoice.paid',
    data: {
      object: {
        customer: 'cus_1',
        customer_email: 'owner@shop.com',
        customer_name: 'Pat Owner',
        subscription: 'sub_1',
        lines: { data: [{ price: { product: 'prod_VFTgb1v4pBInDc' } }] },
      },
    },
  });
  assert.equal(signal.email, 'owner@shop.com');
  assert.equal(signal.subscriptionId, 'sub_1');
  assert.deepEqual(signal.productIds, ['prod_VFTgb1v4pBInDc']);

  const fromSub = extractSignal({
    id: 'evt_sub',
    type: 'customer.subscription.created',
    data: {
      object: {
        id: 'sub_created',
        customer: 'cus_created',
        status: 'active',
        items: { data: [{ price: { product: 'prod_VFTk7NuZqeANdK' } }] },
      },
    },
  });
  assert.equal(fromSub.subscriptionId, 'sub_created');
  assert.deepEqual(fromSub.productIds, ['prod_VFTk7NuZqeANdK']);
});

test('extractSignal collects price.id and Core 3 package metadata', () => {
  const fromPrice = extractSignal({
    id: 'evt_price',
    type: 'invoice.paid',
    data: {
      object: {
        customer: 'cus_core3',
        customer_email: 'owner@shop.com',
        subscription: 'sub_core3',
        lines: { data: [{ price: { id: 'price_1UHpijRtJXKDYNEJfnEM7HqW' } }] },
        metadata: { package: 'foundation' },
      },
    },
  });
  assert.deepEqual(fromPrice.priceIds, ['price_1UHpijRtJXKDYNEJfnEM7HqW']);
  assert.deepEqual(fromPrice.productIds, []);
  assert.equal(fromPrice.packageKey, 'foundation');

  const fromDetails = extractSignal({
    id: 'evt_price_details',
    type: 'invoice.paid',
    data: {
      object: {
        lines: {
          data: [{ pricing: { price_details: { price: 'price_1UHpm1RtJXKDYNEJrO5pJTh5' } } }],
        },
        metadata: { plan: 'growth_partner' },
      },
    },
  });
  assert.deepEqual(fromDetails.priceIds, ['price_1UHpm1RtJXKDYNEJrO5pJTh5']);
  assert.equal(fromDetails.packageKey, 'growth_partner');
});

async function post(payload, { env = {}, fetchImpl, signature, extraHeaders } = {}) {
  const saved = { ...process.env };
  const originalFetch = globalThis.fetch;
  Object.assign(process.env, {
    STRIPE_WEBHOOK_SECRET: SECRET,
    ...env,
  });
  const calls = [];
  globalThis.fetch = fetchImpl || (async (url, options) => {
    calls.push({ url: String(url), options });
    if (String(url).includes('leadconnectorhq.com/contacts/lookup')) {
      return { ok: false, status: 404, json: async () => ({}), text: async () => '' };
    }
    if (String(url).includes('leadconnectorhq.com')) {
      return { ok: true, json: async () => ({ contact: { id: 'ghl_1' } }), text: async () => '' };
    }
    if (String(url).includes('api.stripe.com')) {
      return { ok: true, json: async () => ({}), text: async () => '' };
    }
    throw new Error(`unexpected fetch ${url}`);
  });
  const res = mockRes();
  try {
    await handler({
      method: 'POST',
      headers: { 'stripe-signature': signature ?? sign(payload), ...extraHeaders },
      body: Buffer.from(payload, 'utf8'),
    }, res);
    return { res, calls };
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of Object.keys(process.env)) {
      if (!(key in saved)) delete process.env[key];
    }
    Object.assign(process.env, saved);
  }
}

test('handler: rejects unsigned and badly signed POSTs with 400', async () => {
  const payload = eventPayload('ping', {});
  const bad = await post(payload, { signature: 't=1,v1=nope' });
  assert.equal(bad.res.code, 400);
  assert.equal(bad.res.body.error, 'bad_signature');

  const saved = { ...process.env };
  delete process.env.STRIPE_WEBHOOK_SECRET;
  const res = mockRes();
  await handler({ method: 'POST', headers: {}, body: Buffer.from(payload) }, res);
  Object.assign(process.env, saved);
  assert.equal(res.code, 500);
  assert.equal(res.body.error, 'not_configured');
});

test('handler: 200 quickly for events that are not an onboard signal', async () => {
  const ping = await post(eventPayload('ping', {}));
  assert.equal(ping.res.code, 200);
  assert.equal(ping.res.body.ignored, true);
  assert.equal(ping.calls.length, 0);

  const renewal = await post(eventPayload('invoice.paid', {
    billing_reason: 'subscription_cycle',
    customer: 'cus_1',
    subscription: 'sub_1',
  }));
  assert.equal(renewal.res.code, 200);
  assert.equal(renewal.res.body.ignored, true);
  assert.equal(renewal.calls.some((c) => c.url.includes('resend.com')), false);
});

test('handler: new Essentials signup writes a GHL ledger note, no email', async () => {
  const payload = eventPayload('invoice.paid', {
    billing_reason: 'subscription_create',
    customer: 'cus_ess',
    customer_email: 'shop@example.com',
    customer_name: 'Alex Shop',
    subscription: 'sub_ess',
    lines: { data: [{ price: { product: 'prod_VFTgb1v4pBInDc' } }] },
  }, { eventId: 'evt_ess_1' });

  const { res, calls } = await post(payload, {
    env: { GHL_PIT: 'pit', GHL_LOCATION_ID: 'loc' },
  });
  assert.equal(res.code, 200);
  assert.equal(res.body.onboarded, true);
  assert.equal(calls.some((c) => c.url.includes('resend.com')), false);

  const ghl = calls.find((c) => c.url.includes('contacts/upsert'));
  assert.ok(ghl);
  const contact = JSON.parse(ghl.options.body);
  assert.ok(contact.tags.includes('essentials'));
  assert.ok(contact.tags.includes('drm-sub-sub_ess'));
  assert.equal(contact.source, 'Stripe onboard - Essentials');

  const note = calls.find((c) => c.url.includes('/notes'));
  assert.ok(note);
  const noteBody = JSON.parse(note.options.body).body;
  assert.match(noteBody, /Plan: Essentials/);
  assert.match(noteBody, /prod_VFTgb1v4pBInDc/);
  assert.match(noteBody, /cus_ess/);
  assert.match(noteBody, /sub_ess/);
  assert.doesNotMatch(noteBody, /\$|915|30 leads|guarantee/i);
});

test('handler: unknown product still records and does not invent a plan', async () => {
  const payload = eventPayload('checkout.session.completed', {
    status: 'complete',
    payment_status: 'paid',
    customer: 'cus_x',
    customer_details: { email: 'new@example.com', name: 'New Person' },
    subscription: 'sub_x',
    metadata: { product: 'prod_UNKNOWN99' },
  }, { eventId: 'evt_unk_1' });

  const { res, calls } = await post(payload, {
    env: { GHL_PIT: 'pit', GHL_LOCATION_ID: 'loc' },
  });
  assert.equal(res.code, 200);
  assert.equal(res.body.onboarded, true);
  assert.equal(calls.some((c) => c.url.includes('resend.com')), false);
  const contact = JSON.parse(calls.find((c) => c.url.includes('contacts/upsert')).options.body);
  assert.equal(contact.source, 'Stripe onboard - unknown product');
  assert.equal(contact.tags.includes('essentials'), false);
  const noteBody = JSON.parse(calls.find((c) => c.url.includes('/notes')).options.body).body;
  assert.match(noteBody, /do not invent a plan/i);
  assert.doesNotMatch(noteBody, /Essentials|Front Desk|Website|Complete/);
});

test('handler: retries of the same event or subscription do not write twice', async () => {
  const object = {
    billing_reason: 'subscription_create',
    customer: 'cus_dup',
    customer_email: 'dup@example.com',
    subscription: 'sub_dup',
    lines: { data: [{ pricing: { price_details: { product: 'prod_VFTnbwnV5zp9Xh' } } }] },
  };
  const first = eventPayload('invoice.paid', object, { eventId: 'evt_dup_1' });
  const a = await post(first);
  assert.equal(a.res.body.onboarded, true);

  const again = await post(first);
  assert.equal(again.res.code, 200);
  assert.equal(again.res.body.duplicate, true);
  assert.equal(again.calls.some((c) => c.url.includes('leadconnectorhq.com')), false);

  const sibling = eventPayload('invoice.payment_succeeded', object, { eventId: 'evt_dup_2' });
  const b = await post(sibling);
  assert.equal(b.res.code, 200);
  assert.equal(b.res.body.duplicate, true);
});

test('handler: live Foundation price writes foundation tags, no email', async () => {
  const payload = eventPayload('invoice.paid', {
    billing_reason: 'subscription_create',
    customer: 'cus_found',
    customer_email: 'grow@example.com',
    customer_name: 'Casey Grow',
    subscription: 'sub_found',
    lines: { data: [{ price: { id: 'price_1UHpijRtJXKDYNEJfnEM7HqW' } }] },
  }, { eventId: 'evt_found_1' });

  const { res, calls } = await post(payload, {
    env: { GHL_PIT: 'pit', GHL_LOCATION_ID: 'loc' },
  });
  assert.equal(res.code, 200);
  assert.equal(res.body.onboarded, true);
  assert.equal(calls.some((c) => c.url.includes('resend.com')), false);

  const contact = JSON.parse(calls.find((c) => c.url.includes('contacts/upsert')).options.body);
  assert.ok(contact.tags.includes('foundation'));
  assert.equal(contact.source, 'Stripe onboard - Foundation');
  const noteBody = JSON.parse(calls.find((c) => c.url.includes('/notes')).options.body).body;
  assert.match(noteBody, /Plan: Foundation/);
  assert.match(noteBody, /price_1UHpijRtJXKDYNEJfnEM7HqW/);
  assert.doesNotMatch(noteBody, /30 leads|guarantee/i);
  assert.doesNotMatch(noteBody, /\/onboarding\/foundation/);
});

test('handler: growth_partner metadata maps to Growth Partner slug', async () => {
  const payload = eventPayload('checkout.session.completed', {
    status: 'complete',
    payment_status: 'paid',
    customer: 'cus_gp',
    customer_details: { email: 'gp@example.com', name: 'G P' },
    subscription: 'sub_gp',
    metadata: { package: 'growth_partner' },
  }, { eventId: 'evt_gp_1' });

  const { res, calls } = await post(payload, {
    env: { GHL_PIT: 'pit', GHL_LOCATION_ID: 'loc' },
  });
  assert.equal(res.code, 200);
  const contact = JSON.parse(calls.find((c) => c.url.includes('contacts/upsert')).options.body);
  assert.ok(contact.tags.includes('growth-partner'));
  assert.equal(contact.source, 'Stripe onboard - Growth Partner');
  assert.equal(contact.tags.includes('growth_partner'), false);
  const noteBody = JSON.parse(calls.find((c) => c.url.includes('/notes')).options.body).body;
  assert.match(noteBody, /Plan: Growth Partner/);
  assert.doesNotMatch(noteBody, /Product id: growth_partner/);
});

test('handler: missing Resend key still returns 200', async () => {
  const payload = eventPayload('customer.subscription.created', {
    status: 'active',
    id: 'sub_no_mail',
    customer: 'cus_no_mail',
    items: { data: [{ price: { product: 'prod_VFTk31wYRBJjBr' } }] },
  }, { eventId: 'evt_no_mail' });
  const { res, calls } = await post(payload);
  assert.equal(res.code, 200);
  assert.equal(res.body.onboarded, true);
  assert.equal(calls.some((c) => c.url.includes('resend.com')), false);
});
});
