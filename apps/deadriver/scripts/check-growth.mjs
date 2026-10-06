// Launch checks for the redesigned pages: run after `npm run build`.
// Every page built on the Growth layout must be indexable, except the ungated
// /free-playbook direct link (noindex). Each page must have exactly one
// H1, a description, a canonical URL, no leftover preview/draft wording, and
// no broken internal links.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import assert from 'node:assert/strict';
const root = resolve('dist');
function files(dir) {
  return readdirSync(dir).flatMap((f) =>
    statSync(join(dir, f)).isDirectory() ? files(join(dir, f)) : [join(dir, f)],
  );
}
const pages = files(root).filter(
  (f) =>
    f.endsWith('.html') &&
    (readFileSync(f, 'utf8').includes('class="menu-toggle"') ||
      readFileSync(f, 'utf8').includes('class="roofing-form"')),
);
const config = JSON.parse(readFileSync('vercel.json', 'utf8'));
const leftovers = [
  /design preview/i,
  /production unchanged/i,
  /brandon.s review/i,
  /preview only/i,
  /this preview/i,
  /review draft/i,
  /pending onboarding/i,
  /placeholder/i,
  /dry.run/i,
  /data ?moon/i,
  /pricing on request/i,
];
const errors = [];
for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const rel = file.slice(root.length).replace(/\\/g, '/');
  if ((html.match(/<h1(?:\s|>)/g) || []).length !== 1)
    errors.push(rel + ': expected one H1');
  if (
    rel !== '/free-playbook.html' &&
    /name="robots" content="[^"]*noindex/.test(html)
  )
    errors.push(rel + ': page is noindex');
  if (!/<meta name="description" content="[^"]+"/.test(html))
    errors.push(rel + ': missing description');
  if (!html.includes('rel="canonical"'))
    errors.push(rel + ': missing canonical');
  const text = html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<[^>]+>/g, ' ');
  for (const pattern of leftovers)
    if (pattern.test(text)) errors.push(rel + ': leftover wording ' + pattern);
  for (const match of html.matchAll(
    /(?:href|src)="(\/[^"#?]*)(?:[^"#]*)?(#[^"]*)?"/g,
  )) {
    const linkedPath = match[1];
    const path =
      config.redirects.find((r) => r.source === linkedPath && !r.missing)
        ?.destination || linkedPath;
    if (path.startsWith('//') || path.startsWith('/api/')) continue;
    let dest = resolve(root, '.' + decodeURIComponent(path));
    if (existsSync(dest + '.html')) dest += '.html';
    else if (existsSync(dest) && statSync(dest).isDirectory())
      dest = join(dest, 'index.html');
    if (!existsSync(dest)) errors.push(rel + ': missing ' + path);
  }
}
const home = readFileSync(join(root, 'index.html'), 'utf8');
assert.ok(
  !/<title>[^<]*El Paso/i.test(home) && /nationwide/i.test(home),
  'Homepage must carry nationwide positioning in its title and copy',
);
const retiredBaseLanders = {
  '/el-paso-home-services-marketing': '/',
  '/ai-receptionist-el-paso': '/',
  '/google-ads-management-el-paso': '/services/google-ads',
  '/social-media-management-el-paso': '/services/facebook-ads',
  '/web-design-el-paso': '/',
  '/ai-search-optimization-el-paso': '/marketing-advice/ai-search-for-local-business',
  '/google-business-profile-el-paso': '/services/local-seo',
  '/local-seo-el-paso': '/services/local-seo',
};
for (const [from, to] of Object.entries(retiredBaseLanders)) {
  const built = join(root, from.slice(1) + '.html');
  assert.ok(!existsSync(built), from + ': must not emit a Base lander HTML page');
  const rule = config.redirects.find((r) => r.source === from && !r.missing && !r.has);
  assert.equal(rule?.destination, to, from + ': vercel.json 301 destination');
  assert.equal(rule?.statusCode, 301, from + ': vercel.json must be 301');
}
const sitemap = existsSync(join(root, 'sitemap-0.xml'))
  ? readFileSync(join(root, 'sitemap-0.xml'), 'utf8')
  : '';
for (const from of Object.keys(retiredBaseLanders)) {
  assert.doesNotMatch(
    sitemap,
    new RegExp('deadrivermanagement\\.com' + from.replaceAll('/', '\\/') + '</loc>'),
    'sitemap must not list retired Base lander ' + from,
  );
}
assert.ok(!existsSync(join(root, 'talk.html')), '/talk must not emit an HTML page');
assert.doesNotMatch(
  sitemap,
  /deadrivermanagement\.com\/talk</,
  'sitemap must not list /talk',
);
const llmsTxt = readFileSync(join(root, 'llms.txt'), 'utf8');
assert.doesNotMatch(
  llmsTxt,
  /Dead River Complete says: 30 leads in 60 days or we work for free until we get them/,
);
assert.match(
  llmsTxt,
  /What to check before you buy a written lead promise\. Ask what a lead is\. Ask what happens if they miss\. Talk through current nationwide plans: https:\/\/www\.deadrivermanagement\.com\/book/,
);
assert.match(
  llmsTxt,
  /Compare booked-job tracking, missed-call coverage, and proof\. Dead River Management — Foundation, Growth Partner, and Scale\. Based in El Paso; nationwide\./,
);
assert.doesNotMatch(llmsTxt, /\/talk/);
assert.match(llmsTxt, /deadrivermanagement\.com\/book/);
assert.doesNotMatch(llmsTxt, /\/pricing/);
assert.doesNotMatch(
  llmsTxt,
  /Foundation[^$\n]{0,80}\$997|Growth Partner[^$\n]{0,80}\$2,497|Scale[^$\n]{0,120}\$4,497|\$997\/month|\$2,497\/month|\$4,497\/month|setup from \$/,
);
assert.match(llmsTxt, /Foundation/);
assert.match(llmsTxt, /Growth Partner/);
assert.match(llmsTxt, /Demand Intelligence/);
assert.doesNotMatch(llmsTxt, /deadrivermanagement\.com\/el-paso-home-services-marketing(?!-agency)/);
assert.doesNotMatch(llmsTxt, /ai-receptionist-el-paso/);
assert.doesNotMatch(llmsTxt, /Essentials is \$97/);
assert.doesNotMatch(llmsTxt, /Front Desk AI is \$197/);
assert.doesNotMatch(llmsTxt, /Local Visibility is \$297/);

const core3Onboarding = {
  foundation: { name: 'Foundation', range: '$1,500–$3,000' },
  'growth-partner': { name: 'Growth Partner', range: '$3,000–$7,500' },
  scale: { name: 'Scale', range: '$7,500+' },
};
for (const [slug, expect] of Object.entries(core3Onboarding)) {
  const html = readFileSync(join(root, 'onboarding', slug + '.html'), 'utf8');
  const path = '/onboarding/' + slug;
  assert.match(
    html,
    /name="robots" content="noindex,\s*(?:no)?follow"/,
    path + ': Quinn SEO PASS needs noindex,follow or stronger',
  );
  assert.match(
    html,
    new RegExp('<title>' + expect.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ' \\|'),
    path + ': title must match Core 3 name',
  );
  assert.match(
    html,
    new RegExp('<h1>' + expect.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '</h1>'),
    path + ': H1 must match Core 3 name',
  );
  assert.match(html, new RegExp(expect.range.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), path + ': recommended range');
  for (const [otherSlug, other] of Object.entries(core3Onboarding)) {
    if (otherSlug === slug) continue;
    assert.doesNotMatch(
      html,
      new RegExp(other.range.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      path + ': must not show ' + otherSlug + ' range',
    );
  }
  assert.doesNotMatch(
    html,
    /Dead River Complete|Front Desk Complete|Front Desk AI/i,
    path + ': no Complete/Front Desk restore',
  );
  assert.match(html, /nationwide/i, path + ': nationwide GP lock');
  assert.doesNotMatch(
    sitemap,
    new RegExp(path.replaceAll('/', '\\/') + '</loc>'),
    'sitemap must omit ' + path,
  );
  assert.doesNotMatch(llmsTxt, new RegExp(path.replaceAll('/', '\\/')), 'llms.txt must omit ' + path);
}

const flatten = (value) => {
  if (!value || typeof value !== 'object') return [];
  return [value, ...Object.values(value).flatMap(flatten)];
};
const faqFrom = (html) => {
  const nodes = flatten(
    [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map(
      (m) => JSON.parse(m[1]),
    ),
  ).filter((node) => node['@type'] === 'Question');
  const visible = [...html.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/gi)].map((match) => {
    const q = match[1].match(/<summary\b[^>]*>([\s\S]*?)<\/summary>/i);
    const a = match[1].replace(/<summary\b[^>]*>[\s\S]*?<\/summary>/i, '');
    const text = (value) =>
      value
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    return { q: text(q?.[1] ?? ''), a: text(a) };
  });
  return { nodes, visible };
};
const assertFaq = (html, expected, label) => {
  const { nodes, visible } = faqFrom(html);
  assert.ok(nodes.length >= expected.length, label + ': FAQPage count');
  assert.ok(visible.length >= expected.length, label + ': visible FAQ count');
  for (const item of expected) {
    const schema = nodes.find((node) => node.name === item.q);
    const shown = visible.find((row) => row.q === item.q);
    assert.ok(schema, label + ': missing schema ' + item.q);
    assert.ok(shown, label + ': missing visible ' + item.q);
    assert.equal(schema.acceptedAnswer?.text, item.a, label + ': schema drift ' + item.q);
    assert.equal(shown.a, item.a, label + ': visible drift ' + item.q);
  }
};
assert.match(
  home,
  /<title>\$50,000 in 45-60 Days, Guaranteed \| Dead River Management<\/title>/,
  'home title',
);
assert.match(
  home,
  /<meta name="description" content="Purchase intent data finds people ready to buy now\. We create, capture, and convert that demand\. \$50,000 in 45 to 60 days or money back \+ \$500\."/,
  'home meta',
);
assert.match(
  home,
  /<h1[^>]*>We(?:'|&#39;)ll help your business generate \$50,000 in new revenue with our Demand Flow system in 45 to 60 days\. <em[^>]*>Or your money back, and we pay you \$500 for wasting your time\.<\/em><\/h1>/,
  'home h1',
);
assert.match(
  home,
  /<link rel="canonical" href="https:\/\/www\.deadrivermanagement\.com\/"/,
  'home canonical',
);
assert.match(
  home,
  /property="og:title" content="\$50,000 in 45-60 Days, Guaranteed \| Dead River Management"/,
  'home og:title',
);
assert.match(
  home,
  /property="og:description" content="Purchase intent data finds people ready to buy now\. We create, capture, and convert that demand\. \$50,000 in 45 to 60 days or money back \+ \$500\."/,
  'home og:description',
);
assert.match(
  home,
  /property="og:url" content="https:\/\/www\.deadrivermanagement\.com\/"/,
  'home og:url',
);
assert.doesNotMatch(home, /name="robots" content="[^"]*noindex/, 'home must stay indexable');
assert.doesNotMatch(home, /\$4,497|\$2,997|30 Qualified Appointments/, 'home must not lead with the Complete offer');
const retiredIndustryPages = [
  '/el-paso-roofers',
  '/demandflow/watch',
  '/growth-plan',
  '/hvac',
  '/plumbing',
  '/roofing',
  '/electrical',
  '/landscaping',
  '/remodeling',
  '/pest-control',
  '/garage-doors',
  '/flooring',
  '/pool-service',
  '/industries',
  '/industries/home-services',
  '/industries/med-spas',
  '/industries/dental',
  '/industries/real-estate',
  '/industries/ecommerce',
  '/industries-we-serve',
];
for (const from of retiredIndustryPages) {
  assert.ok(!existsSync(join(root, from.slice(1) + '.html')), from + ': retired industry page must not build');
  const rule = config.redirects.find((r) => r.source === from && !r.missing && !r.has);
  assert.equal(rule?.destination, '/', from + ': must 301 to /');
  assert.equal(rule?.statusCode, 301, from + ': must be 301');
}
for (const [from, to] of [
  ['/book/dental', '/book'],
  ['/book/med-spas', '/book'],
  ['/book/real-estate', '/book'],
  ['/book/ecommerce', '/book'],
  ['/guarantee-terms', '/legal/guarantee'],
  ['/demandflow', '/demand-flow'],
  ['/demandflow/book', '/book/thanks'],
]) {
  assert.ok(!existsSync(join(root, from.slice(1) + '.html')), from + ': retired page must not build');
  const rule = config.redirects.find((r) => r.source === from && !r.missing && !r.has);
  assert.equal(rule?.destination, to, from + ': must 301 to ' + to);
  assert.equal(rule?.statusCode, 301, from + ': must be 301');
  assert.doesNotMatch(
    sitemap,
    new RegExp('deadrivermanagement\\.com' + from.replaceAll('/', '\\/') + '</loc>'),
    'sitemap must not list retired industry page ' + from,
  );
}
assert.ok(!existsSync(join(root, 'industries')), 'dist/industries must not exist');
const sitemapKeep = new Set([
  '/',
  '/home-service-case-studies',
  '/demand-intelligence',
  '/demand-flow',
  '/audience-builder',
  '/website-visitor-identification',
  '/intent-data-providers',
  '/solutions',
  '/book',
  '/demo',
  '/company',
  '/resources',
  '/advice',
  '/advice/lead-response-time',
  '/advice/after-a-bad-agency',
  '/privacy',
  '/terms',
  '/locations',
  '/locations/el-paso',
  '/services/facebook-ads',
  '/services/google-ads',
  '/services/google-local-services-ads',
  '/services/seo',
  '/services/local-seo',
  '/services/cold-email',
  '/work',
  '/work/parcel-management-group',
  '/work/total-auto-repair',
  '/work/gonzalez-and-sons-roofing',
  '/work/the-pipe-whisperers',
  '/work/wicked-logistics',
  '/work/only-fish',
  '/tools',
  '/tools/campaign-roi',
  '/tools/customer-acquisition-cost',
  '/tools/revenue-goal',
  '/tools/ad-budget',
  '/tools/lead-response',
  '/tools/growth-readiness',
  '/tools/website-conversion',
  '/tools/seo-foundations',
  '/tools/search-preview',
  '/tools/campaign-url',
  '/marketing-advice',
  '/marketing-advice/ai-receptionist-cost',
  '/marketing-advice/ai-search-for-local-business',
  '/marketing-advice/el-paso-home-services-marketing-agency',
  '/marketing-advice/facebook-ads-for-plumbers',
  '/legal/advertising',
  '/legal/cookies',
  '/legal/guarantee',
  '/legal/industries',
  '/legal/sms',
]);
const sitemapLocs = [...sitemap.matchAll(/<loc>https:\/\/www\.deadrivermanagement\.com([^<]*)<\/loc>/g)].map(
  (m) => m[1] || '/',
);
for (const loc of sitemapLocs) {
  assert.ok(sitemapKeep.has(loc), 'sitemap has unexpected loc ' + loc);
}
for (const keep of sitemapKeep) {
  assert.ok(sitemapLocs.includes(keep), 'sitemap missing keep loc ' + keep);
}
assert.ok(pages.length >= 40, 'Expected the complete redesigned route set');
assert.deepEqual(errors, []);
const pixelSnippet = /https:\/\/app\.deadrivermanagement\.com\/script",\s*"dead-river-management"/;
const htmlPages = files(root).filter((f) => f.endsWith('.html'));
assert.ok(htmlPages.length >= pages.length, 'Expected built HTML for public pages');
for (const file of htmlPages) {
  const html = readFileSync(file, 'utf8');
  const rel = file.slice(root.length);
  assert.equal(
    (html.match(/app\.deadrivermanagement\.com\/script/g) || []).length,
    1,
    rel + ': Dead River tracking pixel must appear once',
  );
  assert.match(
    html,
    pixelSnippet,
    rel + ': pixel client id must be "dead-river-management"',
  );
  assert.doesNotMatch(
    html,
    /app\.deadrivermanagement\.com\/script[^<]{0,160}"pmg"/,
    rel + ': pixel client id must not be pmg',
  );
}
assert.ok(
  !config.headers[0].headers.some(
    (h) => h.key === 'X-Robots-Tag' && h.value.includes('noindex'),
  ),
  'Site-wide noindex header must be gone before launch',
);
assert.ok(
  !readFileSync('public/robots.txt', 'utf8').includes('Disallow: /\n'),
  'robots.txt must allow crawling',
);
const playbook = readFileSync(join(root, 'free-playbook.html'), 'utf8');
assert.match(playbook, /<h1[^>]*>Get found\. Win the job\. Know the numbers\.<\/h1>/);
assert.match(playbook, /Nationwide/);
assert.match(playbook, /build demand/);
assert.match(playbook, /\/downloads\/dead-river-scale-playbook\.pdf/);
assert.match(playbook, /Download PDF/);
assert.match(playbook, /title="Dead River Scale playbook"/);
assert.match(playbook, /class="playbook-get"/);
assert.match(playbook, /Open the PDF/);
assert.match(playbook, /playbook-download-first/);
assert.match(playbook, /removeAttribute\('src'\)|removeAttribute\("src"\)/);
assert.match(playbook, /name="robots" content="noindex,nofollow"/);
assert.doesNotMatch(playbook, /name="name"/);
assert.doesNotMatch(playbook, /name="phone"/);
assert.doesNotMatch(playbook, /name="email"/);
assert.doesNotMatch(playbook, /\/api\/lead/);
assert.doesNotMatch(playbook, /trackSingle/);
assert.doesNotMatch(playbook, /Dead River Complete/);
assert.doesNotMatch(playbook, /\/welcome\//);
assert.ok(
  existsSync(join(root, 'downloads/dead-river-scale-playbook.pdf')),
  'Scale playbook PDF must be copied into the build',
);
assert.doesNotMatch(
  sitemap,
  /deadrivermanagement\.com\/free-playbook<\/loc>/,
  'sitemap must omit /free-playbook',
);
assert.doesNotMatch(llmsTxt, /\/free-playbook/, 'llms.txt must omit /free-playbook');
const builtCss = files(root)
  .filter((f) => f.endsWith('.css'))
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n');
assert.match(builtCss, /\.playbook-frame/, 'built CSS must style the playbook iframe');
assert.match(builtCss, /759px/, 'built CSS must hide the playbook iframe on small screens');
assert.match(builtCss, /pointer:\s*coarse/, 'built CSS must hide the playbook iframe on touch screens');
assert.match(builtCss, /\.playbook-get/, 'built CSS must style the download path');
console.log(
  JSON.stringify(
    { redesignedPages: pages.length, brokenLocalLinks: 0, indexable: true },
    null,
    2,
  ),
);
