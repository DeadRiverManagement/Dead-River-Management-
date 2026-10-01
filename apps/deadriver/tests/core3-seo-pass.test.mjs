import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const CORE3 = {
  foundation: { name: 'Foundation', range: '$1,500–$3,000' },
  'growth-partner': { name: 'Growth Partner', range: '$3,000–$7,500' },
  scale: { name: 'Scale', range: '$7,500+' },
};

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test('Quinn SEO PASS: Core 3 slugs, titles, H1s, and recommended ranges only', () => {
  const config = readFileSync('src/data/onboarding.ts', 'utf8').replace(/\r\n/g, '\n');
  const slugPage = readFileSync('src/pages/onboarding/[slug].astro', 'utf8');
  const llms = readFileSync('src/pages/llms.txt.ts', 'utf8');
  const sitemapFilter = readFileSync('astro.config.mjs', 'utf8');
  const vercel = JSON.parse(readFileSync('vercel.json', 'utf8'));
  assert.match(slugPage, /robots="noindex, nofollow"/);
  assert.match(slugPage, /landing=\{isCore3\}/);
  assert.match(sitemapFilter, /!path\.startsWith\('\/onboarding\/'\)/);
  const onboardHeader = vercel.headers.find((h) => h.source === '/onboarding/:path*');
  assert.ok(onboardHeader);
  assert.ok(
    onboardHeader.headers.some(
      (h) => h.key === 'X-Robots-Tag' && /noindex/i.test(h.value) && /follow/i.test(h.value),
    ),
  );
  for (const [slug, expect] of Object.entries(CORE3)) {
    assert.match(config, new RegExp(`slug: '${slug}'`));
    assert.match(config, new RegExp(`name: '${expect.name}'`));
    assert.match(config, new RegExp(`title: '${expect.name}'`));
    assert.match(config, new RegExp(escapeRegExp(expect.range)));
    assert.doesNotMatch(llms, new RegExp('/onboarding/' + slug));
  }
  const core3Block = config.slice(config.indexOf("  foundation: {\n    slug: 'foundation'"));
  assert.match(core3Block, /nationwide/i);
  assert.doesNotMatch(core3Block, /Dead River Complete|Front Desk Complete|Front Desk AI|30 leads/i);
});

test('Quinn SEO PASS: built Core 3 pages stay unlisted and nationwide', () => {
  const pages = Object.keys(CORE3).map((slug) => ({
    slug,
    file: `dist/onboarding/${slug}.html`,
  }));
  if (!pages.every((page) => existsSync(page.file))) {
    return;
  }
  const sitemap = existsSync('dist/sitemap-0.xml') ? readFileSync('dist/sitemap-0.xml', 'utf8') : '';
  const llms = readFileSync('dist/llms.txt', 'utf8');
  for (const { slug, file } of pages) {
    const html = readFileSync(file, 'utf8');
    const expect = CORE3[slug];
    const path = `/onboarding/${slug}`;
    assert.match(html, /name="robots" content="noindex,\s*(?:no)?follow"/, path);
    assert.match(html, new RegExp(`<title>${escapeRegExp(expect.name)} \\|`));
    assert.match(html, new RegExp(`<h1>${escapeRegExp(expect.name)}</h1>`));
    assert.match(html, new RegExp(escapeRegExp(expect.range)));
    for (const [otherSlug, other] of Object.entries(CORE3)) {
      if (otherSlug === slug) continue;
      assert.doesNotMatch(html, new RegExp(escapeRegExp(other.range)));
    }
    assert.doesNotMatch(html, /Dead River Complete|Front Desk Complete|Front Desk AI/i);
    assert.match(html, /nationwide/i);
    assert.doesNotMatch(sitemap, new RegExp(`${path.replaceAll('/', '\\/')}</loc>`));
    assert.doesNotMatch(llms, new RegExp(path.replaceAll('/', '\\/')));
  }
});
