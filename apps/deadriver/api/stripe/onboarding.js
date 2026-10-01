// Vercel Serverless Function — production Stripe webhook for Offer v1 and
// Core 3 (Foundation / Growth Partner / Scale) onboarding.
//
// Stripe Dashboard → Workbench → Webhooks → this URL:
//   https://www.deadrivermanagement.com/api/stripe/onboarding
//
// After the destination is created, paste the signing secret into Vercel
// (Production) as STRIPE_WEBHOOK_SECRET and redeploy. Events that arrive
// before that secret is live will 500 and Stripe will retry.
//
// Server-only env vars (Vercel → Settings → Environment Variables).
// Do NOT prefix these with PUBLIC_ — that would ship them to the browser.
//   STRIPE_WEBHOOK_SECRET   Endpoint signing secret (whsec_…). Required.
//   STRIPE_SECRET_KEY       optional. Restricted key preferred (rk_…). Used to
//                           pull customer email / product ids when the event
//                           does not include them, and to stamp the subscription
//                           so retries stay idempotent across cold starts.
//   GHL_PIT                 already used by api/lead.js and api/onboard.js.
//   GHL_LOCATION_ID         same. Durable ledger: a note + tag on the contact
//                           so a later invoice.paid does not double-process.
//
// Harper sends Email-1 via Gmail. This webhook does not send mail.
//
// This is not the post-payment form at api/onboard.js. That file still
// receives the customer-facing intake. This file is Stripe → us.

import { createHmac, timingSafeEqual } from 'node:crypto';

const GHL_UPSERT_URL = 'https://services.leadconnectorhq.com/contacts/upsert';
const GHL_API_VERSION = '2021-07-28';
const STRIPE_API = 'https://api.stripe.com/v1';
const SIGNATURE_TOLERANCE_SEC = 300;

const ONBOARD_EVENTS = new Set([
  'customer.subscription.created',
  'customer.subscription.updated',
  'invoice.paid',
  'invoice.payment_succeeded',
  'checkout.session.completed',
]);

// Stripe product id → Offer v1 plan name. Unknown ids stay unknown.
const PRODUCT_PLANS = {
  prod_VFTgb1v4pBInDc: 'Essentials',
  prod_VFTiCN04jgFhu6: 'Front Desk AI',
  prod_VFTjGZxJrsl54f: 'Front Desk Complete',
  prod_VFTk31wYRBJjBr: 'Local Visibility',
  prod_VFTk7NuZqeANdK: 'Search Growth',
  prod_VFTltGdSBJ0bCw: 'Paid Growth',
  prod_VFTmWFkteZzzzL: 'Website',
  prod_VFTnbwnV5zp9Xh: 'Dead River Complete',
};

// Live Core 3 price ids. Keep PRODUCT_PLANS above intact.
const PRICE_PLANS = {
  price_1UHpijRtJXKDYNEJfnEM7HqW: 'Foundation',
  price_1UHpl0RtJXKDYNEJjEaguvcR: 'Growth Partner',
  price_1UHpm1RtJXKDYNEJrO5pJTh5: 'Scale',
};

const PACKAGE_PLANS = {
  foundation: 'Foundation',
  growth_partner: 'Growth Partner',
  scale: 'Scale',
};

const PLAN_SLUGS = {
  Essentials: 'essentials',
  'Front Desk AI': 'front-desk-ai',
  'Front Desk Complete': 'front-desk-complete',
  'Local Visibility': 'local-visibility',
  'Search Growth': 'search-growth',
  'Paid Growth': 'paid-growth',
  Website: 'website',
  'Dead River Complete': 'dead-river-complete',
  Foundation: 'foundation',
  'Growth Partner': 'growth-partner',
  Scale: 'scale',
};

const seenEvents = new Set();
const seenSubscriptions = new Set();

export const config = {
  api: { bodyParser: false },
};

export function resetOnboardMemory() {
  seenEvents.clear();
  seenSubscriptions.clear();
}

export function verifyStripeSignature(rawBody, header, secret, nowSec = Math.floor(Date.now() / 1000)) {
  if (!secret || !header || rawBody == null) return false;
  const parts = String(header).split(',');
  let timestamp = '';
  const signatures = [];
  for (const part of parts) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (key === 't') timestamp = value;
    if (key === 'v1') signatures.push(value);
  }
  if (!timestamp || !signatures.length) return false;
  const age = Math.abs(nowSec - Number(timestamp));
  if (!Number.isFinite(Number(timestamp)) || age > SIGNATURE_TOLERANCE_SEC) return false;

  const expected = createHmac('sha256', secret)
    .update(`${timestamp}.${rawBody}`, 'utf8')
    .digest('hex');
  return signatures.some((sig) => timingSafeEqualHex(sig, expected));
}

function timingSafeEqualHex(a, b) {
  const left = Buffer.from(String(a), 'utf8');
  const right = Buffer.from(String(b), 'utf8');
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function normalizePackageKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

function resolvePlanName(id) {
  if (PRODUCT_PLANS[id]) return PRODUCT_PLANS[id];
  if (PRICE_PLANS[id]) return PRICE_PLANS[id];
  return PACKAGE_PLANS[normalizePackageKey(id)] || '';
}

export function mapProducts(productIds) {
  const ids = [...new Set((productIds || []).filter(Boolean))];
  const plans = [];
  const unknown = [];
  for (const id of ids) {
    const plan = resolvePlanName(id);
    if (plan) {
      if (!plans.includes(plan)) plans.push(plan);
    } else {
      unknown.push(id);
    }
  }
  return { productIds: ids, plans, unknown };
}

export function onboardingIntakePath(planName, query = {}) {
  const slug = PLAN_SLUGS[planName];
  if (!slug) return '';
  const params = new URLSearchParams({ plan: slug });
  if (query.customer) params.set('customer', query.customer);
  if (query.subscription) params.set('subscription', query.subscription);
  return `/onboarding/${slug}?${params.toString()}`;
}

export function isNewPaidSignup(event) {
  const obj = event?.data?.object || {};
  const prev = event?.data?.previous_attributes || {};
  switch (event?.type) {
    case 'checkout.session.completed':
      return obj.status === 'complete' || obj.payment_status === 'paid' || obj.payment_status === 'no_payment_required';
    case 'customer.subscription.created':
      return obj.status === 'active' || obj.status === 'trialing';
    case 'customer.subscription.updated':
      return prev.status === 'incomplete' && (obj.status === 'active' || obj.status === 'trialing');
    case 'invoice.paid':
    case 'invoice.payment_succeeded':
      return obj.billing_reason === 'subscription_create' || obj.billing_reason === 'subscription_start';
    default:
      return false;
  }
}

export function extractSignal(event) {
  const obj = event?.data?.object || {};
  const customerId = asId(obj.customer) || (startsWith(obj.id, 'cus_') ? obj.id : '');
  const subscriptionId =
    asId(obj.subscription) ||
    (obj.object === 'subscription' || startsWith(obj.id, 'sub_') ? asId(obj.id) : '') ||
    asId(obj.parent?.subscription_details?.subscription);
  const email = clean(
    obj.customer_email ||
      obj.customer_details?.email ||
      (obj.customer && typeof obj.customer === 'object' ? obj.customer.email : '') ||
      obj.receipt_email,
    160
  ).toLowerCase();
  const name = clean(
    obj.customer_name ||
      obj.customer_details?.name ||
      (obj.customer && typeof obj.customer === 'object' ? obj.customer.name : '') ||
      [obj.customer_details?.first_name, obj.customer_details?.last_name].filter(Boolean).join(' '),
    160
  );
  return {
    eventId: asId(event?.id),
    eventType: event?.type || '',
    customerId,
    subscriptionId,
    email,
    name,
    productIds: collectProductIds(obj),
    priceIds: collectPriceIds(obj),
    packageKey: collectPackageKey(obj),
    alreadyOnboardedOnStripe: obj.metadata?.drm_onboarded === '1' || obj.metadata?.drm_onboarded === 'true',
  };
}

function asId(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && typeof value.id === 'string') return value.id;
  return '';
}

function startsWith(value, prefix) {
  return typeof value === 'string' && value.startsWith(prefix);
}

function clean(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function collectPrefixedIds(obj, prefix, pick) {
  const ids = new Set();
  const add = (value) => {
    const id = asId(value) || (typeof value === 'string' ? value : '');
    if (id.startsWith(prefix)) ids.add(id);
  };
  pick(add, obj);
  return [...ids];
}

function collectProductIds(obj) {
  return collectPrefixedIds(obj, 'prod_', (add, source) => {
    add(source.metadata?.product);
    add(source.metadata?.stripe_product);
    add(source.metadata?.product_id);
    for (const item of source.items?.data || []) {
      add(item.price?.product);
      add(item.plan?.product);
      add(item.pricing?.price_details?.product);
    }
    for (const line of source.lines?.data || []) {
      add(line.price?.product);
      add(line.plan?.product);
      add(line.pricing?.price_details?.product);
    }
    for (const item of source.line_items?.data || []) {
      add(item.price?.product);
      add(item.pricing?.price_details?.product);
    }
  });
}

function collectPriceIds(obj) {
  return collectPrefixedIds(obj, 'price_', (add, source) => {
    add(source.metadata?.price);
    add(source.metadata?.stripe_price);
    add(source.metadata?.price_id);
    for (const item of source.items?.data || []) {
      add(item.price?.id);
      add(item.price);
      add(item.pricing?.price_details?.price);
    }
    for (const line of source.lines?.data || []) {
      add(line.price?.id);
      add(line.price);
      add(line.pricing?.price_details?.price);
    }
    for (const item of source.line_items?.data || []) {
      add(item.price?.id);
      add(item.price);
      add(item.pricing?.price_details?.price);
    }
  });
}

function collectPackageKey(obj) {
  const meta = obj?.metadata || {};
  const candidates = [meta.package, meta.plan, meta.engagement, meta.offer];
  for (const value of candidates) {
    const key = normalizePackageKey(value);
    if (PACKAGE_PLANS[key]) return key;
  }
  return '';
}

function stripeKey() {
  return process.env.STRIPE_SECRET_KEY || process.env.STRIPE_RESTRICTED_KEY || '';
}

async function stripeGet(path) {
  const key = stripeKey();
  if (!key) return null;
  try {
    const res = await fetch(`${STRIPE_API}${path}`, {
      headers: { Authorization: `Bearer ${key}` },
    });
    if (!res.ok) {
      console.error('stripe-onboard: stripe GET failed', path, res.status);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error('stripe-onboard: stripe GET error', path, err);
    return null;
  }
}

async function enrichSignal(event, signal) {
  if (signal.subscriptionId && (!signal.email || !signal.productIds.length || !signal.alreadyOnboardedOnStripe)) {
    const sub = await stripeGet(`/subscriptions/${encodeURIComponent(signal.subscriptionId)}`);
    if (sub) {
      if (!signal.productIds.length) signal.productIds = collectProductIds(sub);
      if (!signal.priceIds.length) signal.priceIds = collectPriceIds(sub);
      if (!signal.packageKey) signal.packageKey = collectPackageKey(sub);
      if (!signal.customerId) signal.customerId = asId(sub.customer);
      if (sub.metadata?.drm_onboarded === '1' || sub.metadata?.drm_onboarded === 'true') {
        signal.alreadyOnboardedOnStripe = true;
      }
    }
  }

  const sessionId = event?.type === 'checkout.session.completed' ? asId(event.data?.object?.id) : '';
  if (sessionId && !signal.productIds.length && !signal.priceIds.length) {
    const items = await stripeGet(`/checkout/sessions/${encodeURIComponent(sessionId)}/line_items?limit=20`);
    if (items) {
      if (!signal.productIds.length) signal.productIds = collectProductIds({ line_items: items });
      if (!signal.priceIds.length) signal.priceIds = collectPriceIds({ line_items: items });
    }
  }

  if (signal.customerId && (!signal.email || !signal.name)) {
    const customer = await stripeGet(`/customers/${encodeURIComponent(signal.customerId)}`);
    if (customer) {
      if (!signal.email) signal.email = clean(customer.email, 160).toLowerCase();
      if (!signal.name) signal.name = clean(customer.name, 160);
    }
  }
  return signal;
}

function memoryDedupeKey(signal) {
  if (signal.subscriptionId) return `sub:${signal.subscriptionId}`;
  if (signal.customerId && signal.productIds.length) {
    return `cus:${signal.customerId}:prod:${[...signal.productIds].sort().join(',')}`;
  }
  return signal.eventId ? `evt:${signal.eventId}` : '';
}

async function alreadyProcessed(signal) {
  if (signal.eventId && seenEvents.has(signal.eventId)) return 'event';
  const key = memoryDedupeKey(signal);
  if (key && seenSubscriptions.has(key)) return 'subscription';
  if (signal.alreadyOnboardedOnStripe) return 'stripe_metadata';
  if (await ghlAlreadyOnboarded(signal)) return 'ghl';
  return '';
}

function remember(signal) {
  if (signal.eventId) seenEvents.add(signal.eventId);
  const key = memoryDedupeKey(signal);
  if (key) seenSubscriptions.add(key);
}

function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) return Promise.resolve(req.body);
  if (typeof req.body === 'string') return Promise.resolve(Buffer.from(req.body, 'utf8'));
  if (!req || typeof req.on !== 'function') {
    return Promise.reject(new Error('raw_body_unavailable'));
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function header(req, name) {
  const headers = req.headers || {};
  return headers[name] || headers[name.toLowerCase()] || '';
}

export default async function handler(req, res) {
  if (process.env.VERCEL_ENV === "preview") return res.status(409).json({ error: "Legacy production integrations are disabled in this preview." });
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('stripe-onboard: STRIPE_WEBHOOK_SECRET is not set');
    return res.status(500).json({ ok: false, error: 'not_configured' });
  }

  let raw;
  try {
    raw = await readRawBody(req);
  } catch (err) {
    console.error('stripe-onboard: could not read raw body', err);
    return res.status(400).json({ ok: false, error: 'bad_request' });
  }

  const signature = header(req, 'stripe-signature');
  const rawText = raw.toString('utf8');
  if (!verifyStripeSignature(rawText, signature, secret)) {
    return res.status(400).json({ ok: false, error: 'bad_signature' });
  }

  let event;
  try {
    event = JSON.parse(rawText);
  } catch {
    return res.status(400).json({ ok: false, error: 'bad_request' });
  }

  if (!ONBOARD_EVENTS.has(event.type)) {
    return res.status(200).json({ ok: true, ignored: true });
  }

  let signal = extractSignal(event);
  try {
    signal = await enrichSignal(event, signal);
  } catch (err) {
    console.error('stripe-onboard: enrich failed', err);
  }

  if (!isNewPaidSignup(event)) {
    return res.status(200).json({ ok: true, ignored: true });
  }

  const mapped = mapProducts([
    ...signal.productIds,
    ...signal.priceIds,
    signal.packageKey,
  ].filter(Boolean));
  const record = buildRecord(signal, mapped);

  const dup = await alreadyProcessed(signal);
  if (dup) {
    console.log('stripe-onboard: duplicate', JSON.stringify({ reason: dup, eventId: signal.eventId }));
    return res.status(200).json({ ok: true, duplicate: true });
  }

  // Structured log first so a failed GHL write is still recoverable.
  console.log('stripe-onboard: NEW', JSON.stringify(record));

  remember(signal);
  await Promise.allSettled([
    writeGhlOnboard(record, signal),
    stampStripeSubscription(signal),
  ]);

  return res.status(200).json({ ok: true, onboarded: true });
}

function buildRecord(signal, mapped) {
  const plan = mapped.plans.length ? mapped.plans.join(' + ') : '';
  const stripeIds = [...new Set([
    ...(signal.productIds || []),
    ...(signal.priceIds || []),
  ].filter((id) => typeof id === 'string' && (id.startsWith('prod_') || id.startsWith('price_'))))];
  return {
    kind: 'drm_offer_v1_onboard',
    plan: plan || null,
    unknownProduct: mapped.unknown.filter((id) => id.startsWith('prod_') || id.startsWith('price_')).length > 0,
    productIds: stripeIds,
    packageKey: signal.packageKey || null,
    intakePath: plan && !plan.includes(' + ')
      ? onboardingIntakePath(plan, {
          customer: signal.customerId,
          subscription: signal.subscriptionId,
        })
      : '',
    customerName: signal.name || null,
    customerEmail: signal.email || null,
    stripeCustomerId: signal.customerId || null,
    stripeSubscriptionId: signal.subscriptionId || null,
    eventType: signal.eventType,
    eventId: signal.eventId,
  };
}

function textFor(record) {
  const lines = [
    'Offer v1 paid signup',
    '',
    `Plan: ${record.plan || '(unknown — do not invent a plan)'}`,
    `Product id: ${record.productIds.join(', ') || '(none in event)'}`,
    `Customer name: ${record.customerName || '(not in event)'}`,
    `Customer email: ${record.customerEmail || '(not in event)'}`,
    `Stripe customer: ${record.stripeCustomerId || '(none)'}`,
    `Stripe subscription: ${record.stripeSubscriptionId || '(none)'}`,
    `Event: ${record.eventType}`,
    `Event id: ${record.eventId}`,
  ];
  if (record.unknownProduct) {
    lines.push('', 'This product id is not in the Offer v1 map. Do not invent a plan name.');
  }
  return lines.join('\n');
}

async function ghlHeaders() {
  const token = process.env.GHL_PIT;
  const locationId = process.env.GHL_LOCATION_ID;
  if (!token || !locationId) return null;
  return {
    token,
    locationId,
    headers: {
      Authorization: `Bearer ${token}`,
      Version: GHL_API_VERSION,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  };
}

async function ghlAlreadyOnboarded(signal) {
  const auth = await ghlHeaders();
  if (!auth || !signal.email) return false;
  try {
    const lookup = await fetch(
      `https://services.leadconnectorhq.com/contacts/lookup?${new URLSearchParams({
        email: signal.email,
        locationId: auth.locationId,
      })}`,
      { headers: auth.headers }
    );
    if (!lookup.ok) return false;
    const data = await lookup.json().catch(() => null);
    const contact = data?.contact || data?.contacts?.[0] || null;
    if (!contact) return false;
    const tags = contact.tags || [];
    if (signal.subscriptionId && tags.includes(`drm-sub-${signal.subscriptionId}`)) return true;
    if (signal.eventId && tags.includes(`drm-evt-${signal.eventId}`)) return true;

    const notesRes = await fetch(
      `https://services.leadconnectorhq.com/contacts/${encodeURIComponent(contact.id)}/notes`,
      { headers: auth.headers }
    );
    if (!notesRes.ok) return false;
    const notes = await notesRes.json().catch(() => null);
    const list = notes?.notes || notes?.data || (Array.isArray(notes) ? notes : []);
    const blob = list.map((n) => n?.body || n?.note || '').join('\n');
    if (signal.eventId && blob.includes(`Stripe event: ${signal.eventId}`)) return true;
    if (signal.subscriptionId && blob.includes(`Stripe subscription: ${signal.subscriptionId}`)) return true;
    return false;
  } catch (err) {
    console.error('stripe-onboard: GHL lookup failed', err);
    return false;
  }
}

async function writeGhlOnboard(record, signal) {
  const auth = await ghlHeaders();
  if (!auth) return;
  const email = record.customerEmail;
  if (!email) {
    console.error('stripe-onboard: GHL skipped, no customer email. RECORD >>>', textFor(record));
    return;
  }

  const slug = record.plan && PLAN_SLUGS[record.plan] ? PLAN_SLUGS[record.plan] : '';
  const tags = ['drm-stripe-onboard', 'onboarding', 'customer'];
  if (slug) tags.push(slug);
  if (signal.subscriptionId) tags.push(`drm-sub-${signal.subscriptionId}`);
  if (signal.eventId) tags.push(`drm-evt-${signal.eventId}`);

  const nameParts = (record.customerName || '').split(/\s+/).filter(Boolean);
  const payload = {
    locationId: auth.locationId,
    email,
    source: record.plan ? `Stripe onboard - ${record.plan}` : 'Stripe onboard - unknown product',
    tags,
  };
  if (nameParts[0]) payload.firstName = nameParts.shift();
  if (nameParts.length) payload.lastName = nameParts.join(' ');

  let contactId = null;
  try {
    const upstream = await fetch(GHL_UPSERT_URL, {
      method: 'POST',
      headers: auth.headers,
      body: JSON.stringify(payload),
    });
    if (!upstream.ok) {
      const detail = await upstream.text();
      console.error('stripe-onboard: GHL rejected the contact', upstream.status, detail.slice(0, 500));
      console.error('stripe-onboard: UNSAVED RECORD >>>', textFor(record));
      return;
    }
    const data = await upstream.json().catch(() => null);
    contactId = data?.contact?.id ?? data?.id ?? null;
  } catch (err) {
    console.error('stripe-onboard: GHL upsert failed', err);
    console.error('stripe-onboard: UNSAVED RECORD >>>', textFor(record));
    return;
  }

  const noteBody = [
    record.plan ? `${record.plan} Offer v1 paid signup` : 'Offer v1 paid signup (unknown product)',
    `Submitted ${new Date().toISOString()}`,
    '',
    textFor(record),
  ].join('\n');

  if (!contactId) {
    console.error('stripe-onboard: upsert returned no contact id. RECORD >>>', noteBody);
    return;
  }

  try {
    const noteRes = await fetch(
      `https://services.leadconnectorhq.com/contacts/${encodeURIComponent(contactId)}/notes`,
      {
        method: 'POST',
        headers: auth.headers,
        body: JSON.stringify({ body: noteBody }),
      }
    );
    if (!noteRes.ok) {
      const detail = await noteRes.text();
      console.error('stripe-onboard: note rejected', noteRes.status, detail.slice(0, 300));
      console.error('stripe-onboard: RECORD FOR', contactId, '>>>', noteBody);
    }
  } catch (err) {
    console.error('stripe-onboard: note request failed', err);
    console.error('stripe-onboard: RECORD FOR', contactId, '>>>', noteBody);
  }
}

async function stampStripeSubscription(signal) {
  const key = stripeKey();
  if (!key || !signal.subscriptionId) return;
  try {
    const body = new URLSearchParams({
      'metadata[drm_onboarded]': '1',
      'metadata[drm_onboard_event]': signal.eventId || '1',
    });
    const res = await fetch(`${STRIPE_API}/subscriptions/${encodeURIComponent(signal.subscriptionId)}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
    if (!res.ok) {
      console.error('stripe-onboard: stripe metadata stamp failed', res.status);
    }
  } catch (err) {
    console.error('stripe-onboard: stripe metadata stamp error', err);
  }
}
