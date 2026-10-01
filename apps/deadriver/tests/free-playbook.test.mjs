import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const page = readFileSync(
  new URL('../src/pages/free-playbook.astro', import.meta.url),
  'utf8',
);
const layout = readFileSync(
  new URL('../src/layouts/Growth.astro', import.meta.url),
  'utf8',
);
const llms = readFileSync(
  new URL('../src/pages/llms.txt.ts', import.meta.url),
  'utf8',
);
const config = readFileSync(
  new URL('../astro.config.mjs', import.meta.url),
  'utf8',
);
const vercel = JSON.parse(
  readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'),
);
const css = readFileSync(
  new URL('../src/styles/growth.css', import.meta.url),
  'utf8',
);

test('free-playbook stays on the Growth layout with nationwide results-first copy', () => {
  assert.match(page, /layouts\/Growth\.astro/);
  assert.match(page, /title="Free Scale Playbook"/);
  assert.match(page, /Get found\. Win the job\. Know the numbers\./);
  assert.match(page, /Nationwide/);
  assert.match(page, /build demand/);
  assert.match(page, /convert it/);
  assert.match(page, /measure what matters/);
  assert.match(page, /Get found/);
  assert.match(page, /Win more of the jobs/);
  assert.match(page, /Grow again/);
  assert.doesNotMatch(page, /Dead River Complete|\/welcome\//);
  assert.doesNotMatch(page, /onboarding/);
});

test('free-playbook is ungated: readable PDF, no lead form', () => {
  assert.match(page, /\/downloads\/dead-river-scale-playbook\.pdf/);
  assert.match(page, /Download PDF/);
  assert.match(page, /<iframe/);
  assert.match(page, /title="Dead River Scale playbook"/);
  assert.ok(
    existsSync(
      new URL(
        '../public/downloads/dead-river-scale-playbook.pdf',
        import.meta.url,
      ),
    ),
  );
  assert.doesNotMatch(page, /PlaybookForm|growth-playbook/);
  assert.doesNotMatch(page, /name="name"/);
  assert.doesNotMatch(page, /name="phone"/);
  assert.doesNotMatch(page, /name="email"/);
  assert.doesNotMatch(page, /\/api\/lead/);
  assert.doesNotMatch(page, /value="scale-playbook"/);
  assert.equal(
    existsSync(
      new URL('../src/components/growth/PlaybookForm.astro', import.meta.url),
    ),
    false,
  );
  assert.equal(
    existsSync(new URL('../src/scripts/growth-playbook.js', import.meta.url)),
    false,
  );
});

test('free-playbook stays noindex and out of discovery', () => {
  assert.match(page, /robots="noindex,nofollow"/);
  assert.match(
    layout,
    /\{robots && <meta name="robots" content=\{robots\} \/>\}/,
  );
  assert.match(config, /path !== '\/free-playbook'/);
  const header = vercel.headers.find((h) => h.source === '/free-playbook');
  assert.ok(header);
  assert.ok(
    header.headers.some(
      (h) => h.key === 'X-Robots-Tag' && h.value === 'noindex,nofollow',
    ),
  );
  assert.doesNotMatch(llms, /free-playbook/);
  assert.doesNotMatch(page, /fbq|trackSingle|Lead/);
});

test('free-playbook leads with Download where a PDF iframe is unreliable', () => {
  assert.match(page, /class="button-row playbook-actions"/);
  assert.match(page, /class="playbook-get"/);
  assert.match(page, /Download the PDF to read it on this device\./);
  assert.match(page, /Open the PDF/);
  assert.match(page, /class="small playbook-frame-note"/);
  assert.match(page, /playbook-download-first/);
  assert.match(page, /removeAttribute\('src'\)/);
  assert.match(page, /matchMedia\('\(max-width: 759px\)'\)/);
  assert.match(page, /matchMedia\('\(hover: none\) and \(pointer: coarse\)'\)/);
  assert.match(page, /iPhone\|iPad\|iPod\|Android/);
  assert.match(page, /maxTouchPoints > 1/);
  assert.match(page, /!narrow\.matches && !coarse\.matches && !mobileOS/);
  assert.match(
    css,
    /@media \(max-width: 759px\), \(\(hover: none\) and \(pointer: coarse\)\)/,
  );
  assert.match(
    css,
    /\.playbook-frame,\s*\.playbook-frame-note \{\s*display: none;/,
  );
  assert.match(css, /\.playbook-get \{\s*display: grid;/);
  assert.match(
    css,
    /\.playbook-reader\.playbook-download-first \.playbook-frame,\s*\.playbook-reader\.playbook-download-first \.playbook-frame-note \{\s*display: none;/,
  );
  assert.match(css, /\.playbook-actions \.button/);
  assert.match(css, /width: 100%/);
  assert.match(css, /max-width: 24rem/);
  assert.match(css, /min-height: 44px/);
  assert.doesNotMatch(
    page.slice(page.indexOf('playbook-get'), page.indexOf('playbook-frame')),
    /—/,
  );
  const downloads = page.match(/download="dead-river-scale-playbook\.pdf"/g);
  assert.ok(downloads && downloads.length >= 2);
});
