import test from 'node:test';
import assert from 'node:assert/strict';
import { initWalkthroughForm } from '../src/scripts/walkthrough-form.js';

// A small DOM boundary lets the actual controller run without browser/network
// dependencies. The shared submit listener stands for the existing CRM handler.
function fixture() {
  const listeners = new Map();
  let focused;
  let submissions = 0;
  const node = (name) => ({
    hidden: false, value: '', textContent: '', attrs: {}, dataset: {},
    addEventListener(type, handler, capture = false) {
      const key = name + ':' + type;
      listeners.set(key, [...(listeners.get(key) || []), { handler, capture }]);
    },
    getAttribute(key) { return this.attrs[key] ?? null; },
    setAttribute(key, value) { this.attrs[key] = value; },
    removeAttribute(key) { delete this.attrs[key]; },
    focus() { focused = name; },
    checkValidity() { return name !== 'email' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.value); },
  });
  const keys = ['business_name', 'business_type', 'leads_per_month', 'name', 'phone', 'email'];
  const fields = Object.fromEntries(keys.map(key => [key, node(key)]));
  const errors = Object.fromEntries(keys.map(key => ['#' + key + '-err', node(key + '-err')]));
  keys.forEach(key => fields[key].attrs['aria-describedby'] = key + '-err');
  const steps = [keys.slice(0, 3), keys.slice(3)].map((names) => ({
    hidden: false,
    querySelectorAll() { return names.map(name => fields[name]); },
    querySelector() { return fields[names[0]]; },
  }));
  const next = node('next'), back = node('back'), submit = node('submit');
  const progress = node('progress'), status = node('status'), consent = node('consent');
  const targets = {
    '[data-step-next]': next, '[data-step-back]': back, '[type="submit"]': submit,
    '[data-step-progress]': progress, '[data-form-status]': status, '.form-consent': consent,
    ...errors,
  };
  const form = Object.assign(node('form'), {
    querySelectorAll() { return steps; },
    querySelector(selector) { return targets[selector]; },
  });
  // Base attaches before the deferred component script in the real document.
  form.addEventListener('submit', () => { submissions++; });
  initWalkthroughForm(form);
  function emit(name, type) {
    const event = { stopped: false, defaultPrevented: false,
      preventDefault() { this.defaultPrevented = true; },
      stopImmediatePropagation() { this.stopped = true; },
    };
    for (const item of [...(listeners.get(name + ':' + type) || [])].sort((a, b) => Number(b.capture) - Number(a.capture))) {
      item.handler(event);
      if (event.stopped) break;
    }
    return event;
  }
  function fillBusiness() {
    fields.business_name.value = 'Example Roofing';
    fields.business_type.value = 'Roofing';
    fields.leads_per_month.value = 'Under 10';
  }
  return { form, steps, fields, next, back, submit, progress, status, consent, emit, fillBusiness,
    get focused() { return focused; }, get submissions() { return submissions; } };
}

test('empty step stays visible, focuses the error, and never submits a lead', () => {
  const f = fixture();
  f.emit('next', 'click');
  assert.equal(f.steps[1].hidden, true);
  assert.equal(f.focused, 'business_name');
  assert.equal(f.fields.business_name.attrs['aria-invalid'], 'true');
  assert.equal(f.submissions, 0);
});

test('Enter advances to contact details without invoking the CRM handler', () => {
  const f = fixture(); f.fillBusiness();
  const event = f.emit('form', 'submit');
  assert.equal(event.defaultPrevented, true);
  assert.equal(f.steps[0].hidden, true);
  assert.equal(f.submit.hidden, false);
  assert.equal(f.focused, 'name');
  assert.equal(f.submissions, 0);
});

test('Back preserves business and contact values, including after advancing again', () => {
  const f = fixture(); f.fillBusiness(); f.emit('next', 'click');
  f.fields.name.value = 'Example Owner'; f.emit('back', 'click');
  assert.equal(f.fields.business_type.value, 'Roofing');
  assert.equal(f.focused, 'business_name');
  f.emit('next', 'click');
  assert.equal(f.fields.name.value, 'Example Owner');
});

test('malformed email blocks the CRM submission; valid data passes once', () => {
  const f = fixture(); f.fillBusiness(); f.emit('next', 'click');
  f.fields.name.value = 'Example Owner'; f.fields.phone.value = '+12025550123';
  f.fields.email.value = 'broken@'; f.emit('form', 'submit');
  assert.equal(f.submissions, 0); assert.equal(f.focused, 'email');
  f.fields.email.value = 'owner@example.com';
  assert.equal(f.emit('form', 'submit').defaultPrevented, false);
  assert.equal(f.submissions, 1);
});

test('an invalid field on the hidden step is revealed and focused on final submit', () => {
  const f = fixture(); f.fillBusiness(); f.emit('next', 'click');
  f.fields.business_name.value = '   '; f.emit('form', 'submit');
  assert.equal(f.steps[0].hidden, false);
  assert.equal(f.focused, 'business_name');
  assert.equal(f.submissions, 0);
});

test('initialization is idempotent so the user cannot accidentally advance twice', () => {
  const f = fixture(); initWalkthroughForm(f.form); f.fillBusiness();
  f.emit('next', 'click');
  assert.equal(f.progress.textContent, 'Step 2 of 2 · Your contact details');
  assert.equal(f.submissions, 0);
});
