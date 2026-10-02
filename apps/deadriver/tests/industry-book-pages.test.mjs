import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');

const bookData = read('src/data/book-pages.ts');
const rootBook = read('src/pages/book.astro');
const sitemapScript = read('scripts/check-growth.mjs').split('const sitemapKeep = new Set([')[1].split(']);')[0];
const sitemapData = read('src/data/nationwide-faq.ts');

test('/book is the only booking page and carries the Demand Flow guarantee', () => {
  assert.match(rootBook, /homeServicesBook/);
  assert.doesNotMatch(rootBook, /sendVerticalsToOwnPage/);
  assert.match(bookData, /industry: 'home-services'/);
  assert.match(bookData, /\$50,000 in new revenue within 45 to 60 days/);
  assert.match(bookData, /we pay you \$500/);
  assert.doesNotMatch(bookData, /investment:/);
  assert.doesNotMatch(bookData, /industryBooks/);
  assert.equal(existsSync(new URL('../src/pages/book/[slug].astro', import.meta.url)), false);
});

test('book page does not publish agency Foundation, Growth Partner, or Scale prices', () => {
  for (const dollars of [/\$997\b/, /\$2,497\b/, /\$1,497\b/, /\$1,997\b/, /\$4,497\b/]) {
    assert.doesNotMatch(bookData, dollars);
  }
  assert.doesNotMatch(bookData, /Foundation|Growth Partner/);
});

test('sitemap keep lists have /book only and omit /talk and the retired industry books', () => {
  for (const script of [sitemapScript, sitemapData]) {
    assert.match(script, /'\/book'/);
    assert.doesNotMatch(script, /'\/talk'/);
    for (const retired of ['/book/home-services', '/book/dental', '/book/med-spas', '/book/real-estate', '/book/ecommerce']) {
      assert.doesNotMatch(script, new RegExp("'" + retired.replaceAll('/', '\\/') + "'"));
    }
  }
});

test('/talk is only a 301 to /book and the advice hub is retired', () => {
  assert.equal(existsSync(new URL('../src/pages/talk.astro', import.meta.url)), false);
  const vercel = JSON.parse(read('vercel.json'));
  const rule = vercel.redirects.find((entry) => entry.source === '/talk');
  assert.equal(rule?.destination, '/book');
  assert.equal(rule?.statusCode, 301);
  // The advice hub was folded into /marketing-advice; /advice only redirects now.
  assert.equal(existsSync(new URL('../src/pages/advice', import.meta.url)), false);
});
