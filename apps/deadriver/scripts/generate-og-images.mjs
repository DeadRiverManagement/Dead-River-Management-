// One-shot generator for 1200×630 OG/Twitter cards and favicon.ico.
// Uses @resvg/resvg-js (install --no-save) and the committed logo + Inter.
// Set INTER_DIR to a folder holding Inter-Bold/SemiBold/Regular.ttf if the
// default path does not exist. Pass card file names to regenerate only those
// (the favicon is skipped when a filter is given):
//   node scripts/generate-og-images.mjs demand-flow.png home.png
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { Resvg } from '@resvg/resvg-js';

const root = process.cwd();
const interDir = process.env.INTER_DIR || '/usr/share/fonts/truetype/macos';
const interBold = join(interDir, 'Inter-Bold.ttf');
const interSemi = join(interDir, 'Inter-SemiBold.ttf');
const interReg = join(interDir, 'Inter-Regular.ttf');
const only = new Set(process.argv.slice(2));
// Square emblem. The wide lockup in logo.png does not fit this 72px slot.
const logoB64 = readFileSync(join(root, 'public/images/logo-mark.png')).toString('base64');

const cards = [
  {
    // The site-wide default card (Growth layout) and the old home.png URL,
    // regenerated with the same Demand Flow content so cached links match.
    file: 'demand-flow.png',
    kicker: 'THE DEMAND FLOW GUARANTEE · NATIONWIDE',
    title: ['$50,000 in new revenue', 'in 45 to 60 days.'],
    sub: 'Or your money back, and we pay you $500 for wasting your time.',
  },
  {
    file: 'home.png',
    kicker: 'THE DEMAND FLOW GUARANTEE · NATIONWIDE',
    title: ['$50,000 in new revenue', 'in 45 to 60 days.'],
    sub: 'Or your money back, and we pay you $500 for wasting your time.',
  },
  {
    file: 'whole-river.png',
    kicker: 'FLAGSHIP PLAN',
    title: 'Dead River Complete',
    sub: '30 leads in 60 days or we work for free until we get them.',
  },
  {
    file: 'missed-call-rescue.png',
    kicker: 'FROM $97 / MONTH',
    title: 'Front Desk',
    sub: 'We answer the phone when you can’t.',
  },
  {
    file: 'ai-receptionist.png',
    kicker: 'FROM $97 / MONTH',
    title: 'We answer.',
    sub: 'We book the job while you sleep.',
  },
];

function cardSvg({ kicker, title, sub }) {
  const lines = Array.isArray(title) ? title : [title];
  const size = lines.length > 1 ? 64 : 72;
  const titleSvg = lines
    .map((line, i) => `<text x="88" y="${lines.length > 1 ? 318 + i * 74 : 340}" fill="#F2F0EB" font-family="Inter" font-weight="700" font-size="${size}">${line}</text>`)
    .join('\n  ');
  const subY = lines.length > 1 ? 448 : 410;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="glow" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="#C8722E" stop-opacity="0.22"/>
      <stop offset="55%" stop-color="#0E0F11" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#0E0F11"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="0" y="0" width="1200" height="4" fill="#C8722E"/>
  <rect x="56" y="56" width="1088" height="518" rx="22" fill="none" stroke="#26292F" stroke-width="1.5"/>
  <image href="data:image/png;base64,${logoB64}" x="88" y="88" width="72" height="72"/>
  <text x="180" y="134" fill="#F2F0EB" font-family="Inter" font-weight="600" font-size="26">Dead River Management</text>
  <text x="88" y="250" fill="#D98438" font-family="Inter" font-weight="600" font-size="18" letter-spacing="3">${kicker}</text>
  ${titleSvg}
  <text x="88" y="${subY}" fill="#9A9890" font-family="Inter" font-weight="400" font-size="28">${sub}</text>
  <text x="88" y="530" fill="#858479" font-family="Inter" font-weight="500" font-size="18">deadrivermanagement.com</text>
</svg>`;
}

mkdirSync(join(root, 'public/images/og'), { recursive: true });

const fontOpts = {
  fontFiles: [interBold, interSemi, interReg],
  loadSystemFonts: false,
  defaultFontFamily: 'Inter',
};

for (const card of cards) {
  if (only.size && !only.has(card.file)) continue;
  const svg = cardSvg(card);
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 }, font: fontOpts }).render().asPng();
  const out = join(root, 'public/images/og', card.file);
  writeFileSync(out, png);
  console.log(`wrote ${out} (${png.length} bytes)`);
}

if (only.size) process.exit(0);
const favSvg = readFileSync(join(root, 'public/favicon.svg'), 'utf8');
const favPng = new Resvg(favSvg, { fitTo: { mode: 'width', value: 32 }, font: { loadSystemFonts: false } }).render().asPng();

function pngToIco(png) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  const entry = Buffer.alloc(16);
  entry.writeUInt8(32, 0);
  entry.writeUInt8(32, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12);
  return Buffer.concat([header, entry, png]);
}

writeFileSync(join(root, 'public/favicon.ico'), pngToIco(favPng));
console.log('wrote public/favicon.ico');
