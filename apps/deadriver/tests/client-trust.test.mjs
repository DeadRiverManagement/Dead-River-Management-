import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const home = read('src/pages/index.astro');
const component = read('src/components/growth/ClientTrust.astro');
const markup = component.split('<style>')[0];
const assets = [
  ['total-auto-repair.webp', 'Total Auto Repair', 'd9fd289d177b34951e899061b9d37b2616a5e597'],
  ['gonzalez-and-sons-roofing.webp', 'Gonzalez and Sons Roofing', '7f8ad20dd2204605b87fc79913d4307aefd46fb2'],
  ['the-pipe-whisperers.webp', 'The Pipe Whisperers', 'b53089a1eca0e3ce8db7aacd1501eaa9b1e0d705'],
  ['parcel-management-group.webp', 'Parcel Management Group', 'f47aa5c3280df6011fc6aa825dc3737a6b86eb83'],
  ['wicked-logistics-transparent.webp', 'Wicked Logistics', '5556913f7b62e7688f363e314ee3f811bc828be5'],
  ['only-fish.webp', 'Only Fish', '8e21c33f6e86660096700d8fd28876a2750e40ce'],
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
  assert.match(home, /<h1>We'll help your business generate \$50,000 in new revenue with our Demand Flow system in 45 to 60 days\. <em>Or your money back, and we pay you \$500 for wasting your time\.<\/em><\/h1>/);
  assert.match(home, /Create demand\. Capture demand\. Convert demand\./);
  assert.match(home, /purchase intent data/);
  assert.doesNotMatch(home, /Choose your industry|\/industries/);
  assert.match(home, /href="\/book"/);
  assert.doesNotMatch(home, /href="\/talk"/);
  assert.doesNotMatch(home, /\$4,497|\$2,997|30 Qualified Appointments|Or You Pay Nothing/);
  assert.doesNotMatch(home, /noindex/);
});
test('contains six local image logos and no text substitutes', () => {
  assert.equal((markup.match(/<li>/g) || []).length, 6);
  assert.equal((markup.match(/<img\s/g) || []).length, 6);
  assert.doesNotMatch(markup, /WICKED<small>LOGISTICS<\/small>/);
  assert.doesNotMatch(markup, />Only Fish<\/span>|client-trust-wordmark/);
  for (const [file, alt] of assets) {
    assert.ok(markup.includes(`src="/images/clients/${file}"`));
    assert.ok(markup.includes(`alt="${alt}"`));
    assert.ok(markup.includes(`title="${alt}"`));
  }
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
  assert.ok(total < 45000, `logo transfer budget exceeded: ${total}`);
});
test('images have intrinsic sizes, accessible names, and lazy decoding', () => {
  for (const [tag] of markup.matchAll(/<img\b[\s\S]*?\/>/g)) {
    assert.match(tag, /width="\d+"/);
    assert.match(tag, /height="\d+"/);
    assert.match(tag, /alt="[^\"]+"/);
    assert.match(tag, /loading="lazy"/);
    assert.match(tag, /decoding="async"/);
  }
  assert.match(markup, /aria-labelledby="client-trust-title"/);
  assert.match(markup, /id="client-trust-title"/);
});
test('brand-scoped static layout has responsive grids and no performance claims', () => {
  assert.match(component, /var\(--line\)/);
  assert.match(component, /var\(--body\)/);
  assert.match(component, /var\(--muted\)/);
  assert.match(component, /repeat\(6, minmax\(0, 1fr\)\)/);
  assert.match(component, /repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(component, /repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(component, /object-fit: contain/);
  assert.doesNotMatch(component, /<script|is:global|https?:\/\//);
  assert.doesNotMatch(markup, /\$17\.70|30 days|100K|250K|guaranteed/i);
});
test('Wicked Logistics displays the transparent cutout without recoloring', () => {
  assert.match(markup, /class="client-trust-wicked-logo"\s+src="\/images\/clients\/wicked-logistics-transparent\.webp"/);
  assert.match(component, /\.client-trust-grid \.client-trust-wicked-logo\s*\{\s*mix-blend-mode: normal;/);
});
test('Only Fish displays the supplied image instead of the old text mark', () => {
  assert.match(markup, /class="client-trust-fish-logo"\s+src="\/images\/clients\/only-fish\.webp"\s+alt="Only Fish"\s+title="Only Fish"\s+width="153"\s+height="93"/);
  assert.match(component, /\.client-trust-grid \.client-trust-fish-logo\s*\{\s*mix-blend-mode: normal;/);
  assert.doesNotMatch(component, /font-family: Georgia|client-trust-wordmark/);
});

