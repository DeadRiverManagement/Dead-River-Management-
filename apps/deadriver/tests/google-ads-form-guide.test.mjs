import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const FORM = '/marketing-advice/google-ads-form-that-stops-wasted-spend';
const FIX = '/marketing-advice/google-ads-fix-that-stops-wasted-spend';

const vercel = JSON.parse(readFileSync(resolve('vercel.json'), 'utf8'));
const unconditional = (vercel.redirects ?? []).filter((rule) => !rule.missing && !rule.has);
const bySource = new Map(unconditional.map((rule) => [rule.source, rule]));

function assert301(source, destination) {
  const rule = bySource.get(source);
  assert.ok(rule, `${source} redirect missing`);
  assert.equal(rule.destination, destination, `${source} destination`);
  assert.equal(rule.statusCode, 301, `${source} must be HTTP 301`);
}

test('google ads form guide is the published post, not the old fix filename', () => {
  const formPath = resolve('src/content/blog/google-ads-form-that-stops-wasted-spend.md');
  assert.equal(existsSync(formPath), true, 'form guide markdown must exist');
  const text = readFileSync(formPath, 'utf8');
  assert.equal(text.includes('draft: true'), false);
  assert.match(text, /^title: "/m);
  assert.match(text, /^date: 2026-10-02$/m);
  assert.equal(
    existsSync(resolve('src/content/blog/google-ads-fix-that-stops-wasted-spend.md')),
    false,
    'collection id is the filename, so the old fix file would emit the wrong URL',
  );
});

test('structure, search, and the previously shipped fix slug 301 to the form guide', () => {
  for (const source of [
    '/marketing-advice/google-ads-structure-that-stops-wasted-spend',
    '/marketing-advice/google-ads-structure-that-stops-wasted-spend.html',
    '/marketing-advice/google-ads-search-that-stops-wasted-spend',
    '/marketing-advice/google-ads-search-that-stops-wasted-spend.html',
    FIX,
    `${FIX}.html`,
  ]) {
    assert301(source, FORM);
  }
  assert.equal(bySource.has(FORM), false, 'form slug must build as a page, not redirect away');
  assert.equal(bySource.has(`${FORM}.html`), false);
});

test('industry guide link targets the form slug', () => {
  const text = readFileSync(resolve('src/data/industry-pages.ts'), 'utf8');
  assert.match(text, /href: '\/marketing-advice\/google-ads-form-that-stops-wasted-spend'/);
  assert.doesNotMatch(text, /google-ads-fix-that-stops-wasted-spend/);
});
