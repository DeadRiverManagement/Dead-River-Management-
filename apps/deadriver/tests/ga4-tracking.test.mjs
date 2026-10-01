import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  trackSavedInquiry,
  GA4_MEASUREMENT_ID,
} from '../src/lib/ga4-tracking.js';

const event_id = 'drm_inquiry_12345678-1234-4234-8234-123456789abc';
const makeWindow = () => {
  const calls = [];
  return {
    calls,
    dataLayer: [],
    navigator: {},
    gtag: (...args) => calls.push(args),
  };
};
test('each industry reaches GA4 once per saved receipt, without contact data or Ads routing', () => {
  for (const industry of [
    'home-services',
    'dental',
    'real-estate',
    'ecommerce',
    'med-spas',
    'other',
  ]) {
    const win = makeWindow();
    const detail = {
      event_id,
      industry,
      kind: 'strategy',
      email: 'private@example.com',
      value: 4497,
    };
    assert.equal(trackSavedInquiry(win, detail), true);
    assert.equal(trackSavedInquiry(win, detail), false);
    assert.deepEqual(win.calls, [
      [
        'event',
        'generate_lead',
        {
          send_to: GA4_MEASUREMENT_ID,
          industry,
          event_id,
          lead_type: 'strategy',
        },
      ],
    ]);
  }
});
test('failed, preview, missing receipt, GPC and denied analytics never create a GA4 lead', () => {
  for (const detail of [
    {},
    { event_id: 'invalid' },
    { event_id, preview: true },
    { event_id, analytics_allowed: false },
  ]) {
    const win = makeWindow();
    assert.equal(trackSavedInquiry(win, detail), false);
    assert.equal(win.calls.length, 0);
  }
  const win = makeWindow();
  win.navigator.globalPrivacyControl = true;
  assert.equal(trackSavedInquiry(win, { event_id }), false);
  win.navigator.globalPrivacyControl = false;
  win.dataLayer.push(['consent', 'default', { analytics_storage: 'denied' }]);
  assert.equal(trackSavedInquiry(win, { event_id }), false);
  win.dataLayer.push(['consent', 'update', { analytics_storage: 'granted' }]);
  assert.equal(
    trackSavedInquiry(win, { event_id, industry: 'private text' }),
    true,
  );
  assert.equal(win.calls[0][2].industry, 'other');
});
test('shared layouts load one branded visitor tracker, not two identical vendor copies', () => {
  for (const name of ['Base', 'Growth']) {
    const source = readFileSync(
      new URL('../src/layouts/' + name + '.astro', import.meta.url),
      'utf8',
    );
    assert.equal(source.includes('app.datamoon.com/script'), false);
    assert.equal(
      source.split('app.deadrivermanagement.com/script').length - 1,
      1,
    );
  }
});
