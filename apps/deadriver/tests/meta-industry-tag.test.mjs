import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const template = readFileSync(new URL('../docs/tracking/meta-saved-inquiry.html', import.meta.url), 'utf8');
const eventId = 'drm_inquiry_7dd4ed8e-9207-4381-a0de-624a898f7033';
function run(industry, pathname = '/book', id = eventId, win = { navigator: {}, dataLayer: [] }, repeat = false) {
  const calls = [];
  const script = template.replace(/<\/?script>/g, '')
    .replace('{{DLV - DRM Event ID}}', JSON.stringify(id) ?? 'undefined')
    .replace('{{DLV - DRM Industry}}', JSON.stringify(industry) ?? 'undefined');
  const context = {window: win, location: {pathname}, fbq: (...args) => calls.push(args)};
  vm.runInNewContext(script, context);
  if (repeat) vm.runInNewContext(script, context);
  return calls;
}

for (const [industry, label] of Object.entries({
  'home-services': 'Home Services', dental: 'Dental', 'real-estate': 'Real Estate',
  ecommerce: 'E-commerce', 'med-spas': 'Med Spas', other: 'General Business',
})) {
  test(`Meta saved Lead retains ${industry} and the deduplication receipt`, () => {
    const calls = run(industry);
    assert.equal(calls.length, 1);
    assert.equal(calls[0][0], 'trackSingle');
    assert.equal(calls[0][1], '4422109568077296');
    assert.equal(calls[0][2], 'Lead');
    assert.equal(calls[0][3].industry, industry);
    assert.equal(calls[0][3].content_category, label);
    assert.equal(calls[0][4].eventID, eventId);
    for (const path of ['/book/thanks', '/demandflow/book', '/demandflow/watch', '/']) {
      assert.equal(run(industry, path).length, 0);
    }
  });
}
test('Meta does not default an unknown industry or missing receipt to home services', () => {
  for (const industry of [undefined, null, '', '__proto__', 'constructor']) {
    assert.equal(run(industry).length, 0);
  }
  for (const id of [null, '', 'not-saved']) assert.equal(run('dental', '/book', id).length, 0);
  assert.equal(run('home-services', '/demandflow').length, 1);
});

test('current inquiry routes fire once per receipt and honor explicit consent denial', () => {
  for (const path of ['/book', '/demand-intelligence', '/growth-plan']) {
    assert.equal(run('other', path, eventId, { navigator: {}, dataLayer: [] }, true).length, 1);
    assert.equal(run('other', path, eventId, { navigator: { globalPrivacyControl: true } }).length, 0);
    for (const key of ['ad_storage', 'ad_user_data']) {
      assert.equal(run('other', path, eventId, { dataLayer: [['consent', 'update', { [key]: 'denied' }]] }).length, 0);
    }
  }
});
