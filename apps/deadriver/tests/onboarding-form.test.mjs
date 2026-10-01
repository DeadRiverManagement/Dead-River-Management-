import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  bindOnboardingForm,
  isCompleteOnboardResponse,
} from '../src/lib/onboarding-form.js';

const ANSWERS = {
  plan: 'essentials',
  form: 'onboarding',
  first_name: 'Pat',
  last_name: 'Owner',
  email: 'pat@shop.example',
  business_legal_name: 'Shop LLC',
  business_phone: '9155550101',
  public_business_address: 'El Paso, TX',
  service_areas: 'Westside',
  phone_provisioning: 'new',
  booking_notify_name: 'Alex',
  booking_notify_phone: '9155550102',
  notes: 'Keep the thread on my phone',
};

function field(name, value) {
  const classes = new Set();
  return {
    name,
    value,
    type: name.includes('email') ? 'email' : 'text',
    required: true,
    classList: {
      toggle(cls, on) { if (on) classes.add(cls); else classes.delete(cls); },
      remove(cls) { classes.delete(cls); },
      contains(cls) { return classes.has(cls); },
    },
    focus() {},
  };
}

function makeForm(values) {
  const fields = Object.entries(values).map(([name, value]) => field(name, value));
  const err = { hidden: true, textContent: '', innerHTML: '', dataset: {} };
  const btn = {
    disabled: false,
    innerHTML: 'Send this over',
    dataset: {},
    set textContent(v) { this.innerHTML = v; },
    get textContent() { return this.innerHTML; },
  };
  const listeners = {};
  const form = {
    querySelector(sel) {
      if (sel === '.err') return err;
      if (sel === 'button[type=submit]') return btn;
      const match = String(sel).match(/input\[name="([^"]+)"\]/);
      if (match) return fields.find((item) => item.name === match[1]) || null;
      return null;
    },
    querySelectorAll() { return fields; },
    addEventListener(type, fn) {
      listeners[type] = listeners[type] || [];
      listeners[type].push(fn);
    },
    getAttribute() { return ''; },
  };
  return {
    form,
    err,
    btn,
    fields,
    submit() {
      for (const fn of listeners.submit || []) fn({ preventDefault() {} });
    },
    snapshot() {
      return Object.fromEntries(fields.map((item) => [item.name, item.value]));
    },
  };
}

function tick() {
  return new Promise((resolve) => setImmediate(resolve));
}

test('only ok+note true counts as completed onboarding', () => {
  assert.equal(isCompleteOnboardResponse({ ok: true, note: true }), true);
  assert.equal(isCompleteOnboardResponse({ ok: true, note: false }), false);
  assert.equal(isCompleteOnboardResponse({ ok: false, note: false, error: 'note_failed' }), false);
  assert.equal(isCompleteOnboardResponse({ ok: true }), false);
  assert.equal(isCompleteOnboardResponse(null), false);
});

test('failed note save keeps answers and retry reaches thanks', async () => {
  const fixture = makeForm(ANSWERS);
  const assigned = [];
  const bodies = [];
  let attempt = 0;

  bindOnboardingForm(fixture.form, {
    thanksPath: '/onboarding/thanks?plan=essentials',
    phone: '(915) 228-3054',
    phoneE164: '+19152283054',
    inbox: 'onboarding@deadrivermanagement.com',
    search: '',
    readPayload() {
      return Object.fromEntries(fixture.fields.map((item) => [item.name, item.value]));
    },
    assign(href) { assigned.push(href); },
    async fetchImpl(_url, options) {
      attempt += 1;
      bodies.push(JSON.parse(options.body));
      // First response is the live bug shape: HTTP 200, contact saved, note missing.
      if (attempt === 1) {
        return { ok: true, json: async () => ({ ok: true, note: false }) };
      }
      return { ok: true, json: async () => ({ ok: true, note: true }) };
    },
  });

  fixture.submit();
  await tick();
  await tick();

  assert.deepEqual(assigned, []);
  assert.equal(fixture.err.hidden, false);
  assert.equal(fixture.err.dataset.state, 'pending');
  assert.match(fixture.err.innerHTML, /setup details did not save/);
  assert.match(fixture.err.innerHTML, /Send this again/);
  assert.equal(fixture.btn.disabled, false);
  assert.deepEqual(fixture.snapshot(), ANSWERS);
  assert.equal(bodies[0].first_name, 'Pat');
  assert.equal(bodies[0].notes, 'Keep the thread on my phone');

  fixture.submit();
  await tick();
  await tick();

  assert.deepEqual(assigned, ['/onboarding/thanks?plan=essentials']);
  assert.equal(attempt, 2);
  assert.deepEqual(fixture.snapshot(), ANSWERS);
  assert.equal(bodies[1].first_name, 'Pat');
  assert.equal(bodies[1].notes, 'Keep the thread on my phone');
});

test('OnboardingForm uses the shared complete-response check', () => {
  const source = readFileSync('src/components/OnboardingForm.astro', 'utf8');
  assert.match(source, /bindOnboardingForm/);
  assert.doesNotMatch(source, /if\s*\(\s*!r\.ok\s*\)[\s\S]*location\.assign/);
  assert.doesNotMatch(source, /CSA|DocuSign/i);
});
