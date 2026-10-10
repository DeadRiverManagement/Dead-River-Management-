import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

// /plans was a retired-tier page. Its source is deleted; the URL 301s home in one hop.
test('/plans source is deleted and /plans 301s to the homepage', () => {
  assert.equal(existsSync('src/pages/plans.astro'), false);
  const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
  for (const source of ['/plans', '/plans.html']) {
    const rule = vercel.redirects.find((r) => r.source === source);
    assert.ok(rule, `${source} redirect missing`);
    assert.equal(rule.destination, '/');
    assert.equal(rule.statusCode, 301);
  }
});
