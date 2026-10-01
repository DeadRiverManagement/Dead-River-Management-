import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculate,
  campaignUrl,
  scoreChecklist,
  growthSummary,
  dimensions,
} from '../src/lib/growth-tools.js';
test('ROI uses contribution after gross margin and campaign costs', () => {
  assert.equal(
    calculate('roi', { spend: 2500, revenue: 12000, margin: 60 }).value,
    '188.0%',
  );
  assert.equal(
    calculate('roi', { spend: 100, revenue: 0, margin: 60 }).value,
    '-100.0%',
  );
});
test('CAC and backwards planning round customer and lead requirements appropriately', () => {
  assert.equal(
    calculate('cac', { cost: 4500, customers: 30 }).value,
    '$150.00',
  );
  assert.equal(
    calculate('revenue', { goal: 1001, value: 1000, close: 30 }).value,
    '7',
  );
  assert.equal(
    calculate('budget', { customers: 15, close: 20, cpl: 35 }).value,
    '$2,625.00',
  );
});
test('calculators reject missing, invalid, impossible, and zero-denominator inputs', () => {
  for (const spend of [0, -1, Infinity, '', null, 'abc'])
    assert.throws(() => calculate('roi', { spend, revenue: 100, margin: 50 }));
  assert.throws(() =>
    calculate('roi', { spend: 100, revenue: 100, margin: 101 }),
  );
  assert.throws(() => calculate('cac', { cost: 50, customers: 1.2 }));
  assert.throws(() =>
    calculate('revenue', { goal: 100, value: 100, close: 0 }),
  );
});
test('URL builder preserves query and fragment, replaces existing UTM, and encodes values', () => {
  const u = new URL(
    campaignUrl(
      'https://example.com/path?a=1&utm_source=old#offer',
      'news letter',
      'email',
      'fall & winter',
    ),
  );
  assert.equal(u.searchParams.get('a'), '1');
  assert.equal(u.searchParams.get('utm_source'), 'news letter');
  assert.equal(u.searchParams.get('utm_campaign'), 'fall & winter');
  assert.equal(u.hash, '#offer');
  assert.throws(() => campaignUrl('javascript:alert(1)', 'a', 'b', 'c'));
  assert.throws(() =>
    campaignUrl('https://user:password@example.com', 'a', 'b', 'c'),
  );
});
test('self-assessment does not score duplicates or unknown answers', () => {
  assert.equal(scoreChecklist('seo', ['0', '0', '1', 'unknown']).score, 40);
  assert.equal(scoreChecklist('seo', []).gaps.length, 5);
});
const answers = (value) =>
  Object.fromEntries(
    dimensions.flatMap((d) => d.questions.map(([key]) => [key, String(value)])),
  );
test('diagnostic prioritizes infrastructure and only suggests Scale with readiness and two-channel intent', () => {
  assert.equal(
    growthSummary({ ...answers(0), channels: '2' }).recommended,
    'Foundation',
  );
  assert.equal(
    growthSummary({ ...answers(1), channels: '1' }).recommended,
    'Growth Partner',
  );
  assert.equal(
    growthSummary({ ...answers(2), channels: '1' }).recommended,
    'Growth Partner',
  );
  assert.equal(
    growthSummary({ ...answers(2), channels: '0' }).recommended,
    'Foundation',
  );
  assert.equal(
    growthSummary({ ...answers(2), channels: '2' }).recommended,
    'Scale',
  );
  assert.equal(
    growthSummary({ ...answers(2), tracking: '0', journey: '0', channels: '2' })
      .recommended,
    'Foundation',
  );
  assert.throws(() => growthSummary({}));
});
test('fit route uses collaboration readiness, never invented pricing cutoffs', () => {
  const a = {
    ...answers(2),
    decision: 'yes',
    access: 'yes',
    traction: 'yes',
    capacity: 'yes',
  };
  assert.equal(growthSummary({ ...a, budget: '0' }).reviewReady, true);
  assert.equal(growthSummary({ ...a, access: 'not-yet' }).reviewReady, false);
});
