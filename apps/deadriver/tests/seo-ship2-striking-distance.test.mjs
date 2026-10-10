import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

// Ship 2 (2026-10-10): titles, metas, answer blocks and internal links on
// pages that already rank at about position 5 to 20. Runs against dist/.
const page = (route) => {
  const file = `dist${route}.html`;
  return existsSync(file) ? readFileSync(file, 'utf8') : null;
};
const decode = (s) =>
  s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const title = (html) => decode(html.match(/<title>([\s\S]*?)<\/title>/)[1]);
const meta = (html) => decode(html.match(/<meta name="description" content="([^"]*)"/)[1]);
const answer = (html) => html.match(/<div class="answer-block"[^>]*>([\s\S]*?)<\/div>/)?.[1] ?? '';
const text = (s) => decode(s.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

const targets = {
  '/locations/el-paso': {
    title: 'El Paso Marketing Agency, Local SEO | Dead River Management',
    links: ['/services/local-seo', '/marketing-advice/rank-higher-on-google-maps-checklist', '/marketing-advice/el-paso-home-services-marketing-agency'],
  },
  '/services/local-seo': {
    title: 'Local SEO & Google Business Profile | Dead River Management',
    links: ['/locations/el-paso', '/marketing-advice/free-business-listings-worth-claiming', '/marketing-advice/rank-higher-on-google-maps-checklist'],
    metaLocked: true,
  },
  '/marketing-advice/ai-receptionist-cost': {
    title: 'AI Receptionist Cost and Pricing | Dead River Management',
    links: ['/marketing-advice/lead-response-time', '/tools/lead-response'],
    intro: 'AI receptionist prices are all over the place. Here is how to compare them the same way before you buy.',
  },
  '/marketing-advice/free-business-listings-worth-claiming': {
    title: 'Free Business Listings for Local SEO | Dead River Management',
    links: ['/marketing-advice/google-business-profile-categories', '/marketing-advice/is-your-website-on-google', '/services/local-seo'],
    intro: 'Nine free business listings for local SEO, rated 1 to 10. What each one does, why it matters, and how to claim it in one step.',
  },
};
const built = existsSync('dist/sitemap-0.xml');

for (const [route, t] of Object.entries(targets)) {
  test(`ship 2 ${route}`, { skip: !built && 'dist not built' }, () => {
    const html = page(route);
    assert.ok(html, route + ' built');
    assert.equal(title(html), t.title);
    assert.ok(title(html).length <= 60, route + ' title length');
    if (!t.metaLocked) {
      const m = meta(html);
      assert.ok(m.length >= 140 && m.length <= 160, route + ' meta length ' + m.length);
      assert.doesNotMatch(m, /[\u2013\u2014-]|\$|guarantee|refund|money back/i, route + ' meta');
    }
    const a = answer(html);
    assert.ok(a, route + ' answer block');
    const words = text(a);
    assert.doesNotMatch(words, /[\u2013\u2014]| - |guarantee|refund|money back|Demand Flow|playbook|30 leads|30 in 60/i, route + ' answer copy');
    assert.doesNotMatch(words, /\b(Foundation|Growth Partner|Growth|Scale|Complete)\b/, route + ' retired menu names');
    // The answer itself (first paragraph) stays 2 to 3 sentences; the related line is separate.
    const first = text(a.match(/<p[^>]*>([\s\S]*?)<\/p>/)[1]);
    const sentences = first.split(/(?<=[.?!])\s+/).length;
    assert.ok(sentences >= 2 && sentences <= 3, route + ' answer length ' + sentences);
    for (const href of t.links) assert.match(a, new RegExp(`href="${href}"`), route + ' link ' + href);
    if (t.intro) assert.match(html, new RegExp(`<p class="intro"[^>]*>${t.intro.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</p>`), route + ' hero intro unchanged');
  });
}

test('ship 2 internal link targets are built and in the sitemap', { skip: !built && 'dist not built' }, () => {
  const sitemap = readFileSync('dist/sitemap-0.xml', 'utf8');
  const hrefs = new Set(Object.values(targets).flatMap((t) => t.links).concat(['/marketing-advice/ai-receptionist-cost']));
  for (const href of hrefs) {
    assert.ok(page(href), href + ' built');
    assert.match(sitemap, new RegExp(`<loc>https://www\\.deadrivermanagement\\.com${href}</loc>`), href + ' in sitemap');
  }
  assert.match(page('/marketing-advice/lead-response-time'), /href="\/marketing-advice\/ai-receptionist-cost"/);
});
