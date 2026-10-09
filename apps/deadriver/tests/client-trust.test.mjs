import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const home = read('src/pages/index.astro');
const component = read('src/components/growth/ClientTrust.astro');
const wrapper = read('src/components/react-bits/ClientLogoLoop.jsx');
const markup = component.split('<style>')[0];
const assets = [
  ['total-auto-repair.webp', 'Total Auto Repair', '2136efc71778bd35dc0b74dd74cc33b9f8fdcebf'],
  ['gonzalez-and-sons-roofing.webp', 'Gonzalez and Sons Roofing', '45f783991547622c4898b4cf6d7e6d5da921038f'],
  ['the-pipe-whisperers.webp', 'The Pipe Whisperers', 'c5acf423e0ef34491622f2f8620007936e1e9768'],
  ['parcel-management-group.webp', 'Parcel Management Group', 'f3b694146090208a6317952b36a953232e46cd3c'],
  ['wicked-logistics-transparent.webp', 'Wicked Logistics', '5556913f7b62e7688f363e314ee3f811bc828be5'],
  ['only-fish.webp', 'Only Fish', '1fc4503189564536b1dae95264152efe92e62246'],
];

test('homepage includes the trust section once, immediately after the hero', () => {
  assert.equal((home.match(/<ClientTrust\s*\/>/g) || []).length, 1);
  assert.match(home, /<River\s*\/>\s*<\/section>\s*<ClientTrust\s*\/>/);
  assert.doesNotMatch(home, /class="proof-strip wrap"/);
  assert.doesNotMatch(home, /id="home-services"/);
});
test('homepage is the Demand Flow guarantee home', () => {
  assert.match(home, /title="\$50,000 in 45-60 Days, Guaranteed"/);
  assert.match(home, /description="Purchase intent data finds people ready to buy now\. We create, capture, and convert that demand\. \$50,000 in 45 to 60 days or money back \+ \$500\."/);
  assert.match(home, /<h1 data-split>\$50,000 in new revenue in 45-60 days\. <em>Or your money back, plus \$500 for wasting your time\.<\/em><\/h1>/);
  assert.match(home, /Create demand\. Capture demand\. Convert demand\./);
  assert.match(home, /purchase intent data/);
  assert.doesNotMatch(home, /Choose your industry|\/industries/);
  assert.match(home, /href="\/book"/);
  assert.doesNotMatch(home, /href="\/talk"/);
  assert.doesNotMatch(home, /\$4,497|\$2,997|30 Qualified Appointments|Or You Pay Nothing/);
  assert.doesNotMatch(home, /noindex/);
});
test('marquee lists six local image logos linking to their case studies', () => {
  const items = [...markup.matchAll(/\{ src: '([^']+)', alt: '([^']+)', href: '([^']+)', width: (\d+), height: (\d+)/g)];
  assert.equal(items.length, 6);
  for (const [file, alt] of assets) {
    const item = items.find(([, src]) => src === `/images/clients/${file}`);
    assert.ok(item, file);
    assert.equal(item[2], alt);
    assert.match(item[3], /^\/work\/[a-z-]+$/);
  }
  assert.doesNotMatch(markup, /WICKED<small>LOGISTICS<\/small>/);
  assert.doesNotMatch(markup, />Only Fish<\/span>|client-trust-wordmark/);
  assert.match(markup, /<ClientLogoLoop\s+client:idle/);
  assert.match(markup, /ariaLabel="[^"]+"/);
});
test('assets are valid WebP containers with verified committed bytes', () => {
  let total = 0;
  for (const [file, , expected] of assets) {
    const data = readFileSync(new URL(`public/images/clients/${file}`, root));
    assert.equal(data.subarray(0, 4).toString(), 'RIFF');
    assert.equal(data.subarray(8, 12).toString(), 'WEBP');
    assert.equal(data.readUInt32LE(4) + 8, data.length);
    const sha = createHash('sha1').update(`blob ${data.length}\0`).update(data).digest('hex');
    assert.equal(sha, expected);
    total += data.length;
  }
  assert.ok(total < 90000, `logo transfer budget exceeded: ${total}`);
});
test('marquee images have intrinsic sizes, accessible names, and lazy decoding', () => {
  const [tag] = wrapper.match(/<img\b[\s\S]*?\/>/);
  assert.match(tag, /width=\{item\.width\}/);
  assert.match(tag, /height=\{item\.height\}/);
  assert.match(tag, /alt=\{item\.alt\}/);
  assert.match(tag, /loading="lazy"/);
  assert.match(tag, /decoding="async"/);
  // Case-study links stay in the same tab, unlike LogoLoop's own link rendering.
  assert.match(wrapper, /<a\s+className="logoloop__link"\s+href=\{item\.href\}/);
  assert.doesNotMatch(wrapper, /target=/);
  assert.match(markup, /aria-labelledby="client-trust-title"/);
  assert.match(markup, /id="client-trust-title"/);
});
test('brand-scoped static layout makes no performance claims', () => {
  assert.match(component, /var\(--body\)/);
  assert.match(component, /var\(--muted\)/);
  assert.doesNotMatch(component, /<script|is:global|https?:\/\//);
  assert.doesNotMatch(markup, /\$17\.70|30 days|100K|250K|guaranteed/i);
});
test('Wicked Logistics and Only Fish keep their original colors in the marquee', () => {
  const premium = read('src/styles/premium.css');
  assert.match(markup, /wicked-logistics-transparent\.webp'[^}]*className: 'client-trust-wicked-logo'/);
  assert.match(markup, /only-fish\.webp', alt: 'Only Fish', href: '\/work\/only-fish', width: 153, height: 93, className: 'client-trust-fish-logo'/);
  assert.match(premium, /\.logoloop img\.client-trust-wicked-logo,\s*\.logoloop img\.client-trust-fish-logo\s*\{\s*mix-blend-mode: normal;/);
  assert.doesNotMatch(component, /font-family: Georgia|client-trust-wordmark/);
});
