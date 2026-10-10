// Builds public/downloads/dead-river-scale-playbook.pdf from the part*.mjs
// content files and figs.mjs, in the site's dark/copper look, with Playwright's
// Chromium. Run from apps/deadriver: node scripts/playbook/build.mjs
// Needs Playwright with Chromium: npx playwright install chromium (or npm i -D playwright).
import { chromium } from 'playwright';
import { pages as part1 } from './part1.mjs';
import { pages as part2 } from './part2.mjs';
import { pages as part3 } from './part3.mjs';
import { pages as part4 } from './part4.mjs';
import * as Fg from './figs.mjs';

const dir = new URL('.', import.meta.url).pathname;
const logo = 'data:image/png;base64,' + readFileSync(dir + '../../public/images/logo.png').toString('base64');
const font = (f) => 'data:font/woff2;base64,' + readFileSync(dir + 'fonts/' + f).toString('base64');

const css = Fg.css + `
@font-face { font-family: 'Bricolage'; font-weight: 700; src: url(${font('font-display-700-normal-latin-5049cd6d3ba1409d.woff2')}) format('woff2'); }
@font-face { font-family: 'Bricolage'; font-weight: 800; src: url(${font('font-display-800-normal-latin-5049cd6d3ba1409d.woff2')}) format('woff2'); }
@font-face { font-family: 'InterV'; font-weight: 100 900; src: url(${font('font-body-400-normal-latin-e868cdf4720e9ea5.woff2')}) format('woff2'); }
:root { --paper: #f4f1ea; --paper-2: #ebe7de; --ink: #121214; --ink-2: #3a3936; --muted: #6b6963; --line: rgba(18,18,20,.12);
  --black: #0a0a0b; --charcoal: #1d1d20; --cream: #ecebe6; --copper: #e3a070; --copper-deep: #c8743f; --ember: #f2b183; }
@page { size: letter; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: InterV, Inter, system-ui, sans-serif; color: var(--ink); background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { position: relative; width: 8.5in; height: 11in; padding: 0.7in 0.75in 0.8in; background: var(--paper); overflow: hidden; page-break-after: always; display: flex; flex-direction: column; }
.page.dark { background: var(--black); color: var(--cream); }
.page.charcoal { background: var(--charcoal); color: var(--cream); }
.head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 26px; }
.head img { height: 22px; }
.page.dark .head img, .page.charcoal .head img { filter: brightness(0) invert(1); }
.head .part { font-family: ui-monospace, 'JetBrains Mono', Menlo, monospace; font-size: 9.5px; letter-spacing: .18em; text-transform: uppercase; color: var(--muted); }
.page.dark .head .part, .page.charcoal .head .part { color: var(--copper); }
.foot { position: absolute; left: 0.75in; right: 0.75in; bottom: 0.42in; display: flex; justify-content: space-between; font-family: ui-monospace, Menlo, monospace; font-size: 9px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
.page.dark .foot, .page.charcoal .foot { color: rgba(236,235,230,.5); }
.kicker { font-family: ui-monospace, Menlo, monospace; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: var(--copper-deep); margin: 0 0 10px; }
.page.dark .kicker, .page.charcoal .kicker { color: var(--copper); }
h1 { font-family: Bricolage, sans-serif; font-weight: 800; font-size: 42px; line-height: 1.02; letter-spacing: -.035em; margin: 0 0 10px; max-width: 14ch; }
h1.wide { max-width: 20ch; }
.sub { font-size: 18px; line-height: 1.5; color: var(--ink-2); margin: 0 0 26px; max-width: 56ch; }
.page.dark .sub, .page.charcoal .sub { color: #cfccc4; }
.sub.lg { font-size: 20px; }
.body { flex: 1; }
.body p { font-size: 15.5px; line-height: 1.6; margin: 0 0 13px; color: var(--ink-2); max-width: 62ch; }
.body p.big { font-size: 18.5px; color: var(--ink); }
.page.dark .body p, .page.charcoal .body p { color: #cfccc4; }
.body strong { color: var(--ink); }
.page.dark .body strong, .page.charcoal .body strong { color: #fff; }
.body h2 { font-family: Bricolage, sans-serif; font-weight: 800; font-size: 22px; letter-spacing: -.02em; margin: 18px 0 8px; }
.body h2:first-child { margin-top: 0; }
.body ul, .body ol { margin: 0 0 12px; padding-left: 20px; }
.body li { font-size: 15px; line-height: 1.55; margin-bottom: 8px; color: var(--ink-2); max-width: 60ch; }
.page.dark .body li, .page.charcoal .body li { color: #cfccc4; }
.body li::marker { color: var(--copper-deep); font-weight: 700; }
.note { font-size: 12.5px; line-height: 1.5; color: var(--muted); margin: 14px 0 0; max-width: 62ch; }
.page.dark .note, .page.charcoal .note { color: rgba(236,235,230,.55); }
.donow { margin-top: auto; padding: 18px 22px; border-radius: 12px; background: var(--charcoal); color: var(--cream); display: flex; gap: 16px; align-items: baseline; }
.donow b { font-family: ui-monospace, Menlo, monospace; font-size: 9.5px; letter-spacing: .18em; text-transform: uppercase; color: var(--copper); white-space: nowrap; }
.donow span { font-size: 16px; line-height: 1.4; }
.page.dark .donow, .page.charcoal .donow { background: var(--copper); color: #140b04; }
.page.dark .donow b, .page.charcoal .donow b { color: #5a2d10; }
.ex { display: inline-block; font-family: ui-monospace, Menlo, monospace; font-size: 9px; letter-spacing: .16em; text-transform: uppercase; color: var(--muted); border: 1px solid var(--line); padding: 3px 8px; border-radius: 999px; margin-bottom: 12px; }
.cards { display: grid; gap: 10px; margin: 0 0 12px; }
.cards.c2 { grid-template-columns: 1fr 1fr; }
.cards.c3 { grid-template-columns: 1fr 1fr 1fr; }
.card { padding: 18px 20px; border-radius: 12px; background: #fff; border: 1px solid var(--line); }
.page.dark .card, .page.charcoal .card { background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.12); }
.card b { display: block; font-family: Bricolage, sans-serif; font-weight: 800; font-size: 17px; letter-spacing: -.01em; margin-bottom: 4px; }
.card small { display: block; font-size: 14px; line-height: 1.5; color: var(--ink-2); }
.page.dark .card small, .page.charcoal .card small { color: #cfccc4; }
.card .num { font-family: Bricolage, sans-serif; font-weight: 800; font-size: 30px; letter-spacing: -.04em; color: var(--copper-deep); line-height: 1; margin-bottom: 6px; }
.page.dark .card .num { color: var(--ember); }
.card .tag { font-family: ui-monospace, Menlo, monospace; font-size: 9px; letter-spacing: .16em; text-transform: uppercase; color: var(--copper-deep); margin-bottom: 6px; display: block; }
.steps { display: grid; gap: 8px; margin-bottom: 12px; }
.step { display: grid; grid-template-columns: 34px 1fr; gap: 14px; align-items: start; padding: 14px 18px; border-radius: 12px; background: #fff; border: 1px solid var(--line); }
.page.dark .step { background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.12); }
.step i { font-style: normal; display: grid; place-items: center; width: 30px; height: 30px; border-radius: 50%; background: var(--copper); color: #140b04; font-family: Bricolage, sans-serif; font-weight: 800; font-size: 14px; }
.step b { display: block; font-size: 16px; margin-bottom: 3px; }
.step small { display: block; font-size: 14px; line-height: 1.5; color: var(--ink-2); }
.page.dark .step small { color: #cfccc4; }
.rows { margin-bottom: 12px; }
.row { display: grid; grid-template-columns: 150px 1fr; gap: 14px; padding: 12px 0; border-bottom: 1px solid var(--line); font-size: 14.5px; line-height: 1.5; }
.row b { font-family: ui-monospace, Menlo, monospace; font-size: 10px; letter-spacing: .16em; text-transform: uppercase; color: var(--copper-deep); padding-top: 3px; }
.row.r3 { grid-template-columns: 150px 1fr 1fr; }
.page.dark .row { border-color: rgba(255,255,255,.12); }
.page.dark .row b { color: var(--copper); }
.check { display: grid; grid-template-columns: 1fr 44px 44px 44px; gap: 8px; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--line); font-size: 15px; }
.check small { display: block; font-size: 12.5px; color: var(--muted); }
.check i { font-style: normal; display: block; width: 18px; height: 18px; border: 1.5px solid var(--copper-deep); border-radius: 4px; margin: 0 auto; }
.checkhead { display: grid; grid-template-columns: 1fr 44px 44px 44px; gap: 8px; font-family: ui-monospace, Menlo, monospace; font-size: 9px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); text-align: center; padding-bottom: 6px; }
.checkhead span:first-child { text-align: left; }
.compare { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
.compare > div { padding: 18px 20px; border-radius: 12px; font-size: 14.5px; line-height: 1.5; }
.compare .bad { background: #fff; border: 1px solid var(--line); color: var(--muted); }
.compare .good { background: var(--charcoal); color: var(--cream); }
.compare b { display: block; font-family: ui-monospace, Menlo, monospace; font-size: 9px; letter-spacing: .16em; text-transform: uppercase; margin-bottom: 6px; }
.compare .bad b { color: var(--muted); }
.compare .good b { color: var(--copper); }
.bubble { max-width: 380px; padding: 16px 18px; border-radius: 16px 16px 16px 4px; background: #fff; border: 1px solid var(--line); font-size: 14.5px; line-height: 1.5; margin: 0 0 12px; }
.bubble.me { background: var(--copper); color: #140b04; border: 0; border-radius: 16px 16px 4px 16px; margin-left: auto; }
.page.dark .bubble { background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.12); color: #ecebe6; }
.funnel { display: grid; gap: 5px; margin-bottom: 12px; }
.funnel div { display: flex; justify-content: space-between; align-items: center; height: 38px; padding: 0 16px; border-radius: 8px; background: var(--charcoal); color: var(--cream); font-size: 14px; }
.funnel div b { font-family: Bricolage, sans-serif; font-weight: 800; font-size: 17px; color: var(--ember); }
.stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px; }
.stat { padding: 18px; border-radius: 12px; background: #fff; border: 1px solid var(--line); }
.stat b { display: block; font-family: Bricolage, sans-serif; font-weight: 800; font-size: 32px; letter-spacing: -.04em; color: var(--copper-deep); line-height: 1; }
.stat small { display: block; font-size: 13px; color: var(--muted); margin-top: 6px; line-height: 1.4; }
.page.dark .stat { background: rgba(255,255,255,.05); border-color: rgba(255,255,255,.12); }
.page.dark .stat b { color: var(--ember); }
.page.dark .stat small { color: rgba(236,235,230,.6); }
.quote { padding: 18px 22px; border-left: 3px solid var(--copper); background: #fff; border-radius: 0 12px 12px 0; margin-bottom: 12px; }
.quote p { font-family: Bricolage, sans-serif; font-weight: 700; font-size: 17px; line-height: 1.3; letter-spacing: -.01em; color: var(--ink) !important; margin: 0 0 6px !important; }
.quote small { font-family: ui-monospace, Menlo, monospace; font-size: 10px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); }
.callout { padding: 16px 20px; border-radius: 10px; background: var(--paper-2); font-size: 15px; line-height: 1.5; margin: 0 0 12px; border: 1px solid var(--line); }
.callout.dark { background: var(--charcoal); color: var(--cream); border: 0; }
.page.dark .callout { background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.12); color: #ecebe6; }
.ad { width: 300px; border: 1px solid var(--line); border-radius: 10px; background: #fff; overflow: hidden; font-size: 11.5px; line-height: 1.4; color: var(--ink); }
.ad .top { display: flex; gap: 8px; align-items: center; padding: 10px 12px; }
.ad .top i { width: 26px; height: 26px; border-radius: 50%; background: var(--charcoal); display: block; }
.ad .top b { display: block; font-size: 11px; }
.ad .top small { font-size: 9.5px; color: var(--muted); }
.ad .copy { padding: 0 12px 10px; }
.ad .img { height: 150px; background: linear-gradient(135deg, #2b2b2f, #141416); display: grid; place-items: center; color: rgba(255,255,255,.55); font-family: ui-monospace, Menlo, monospace; font-size: 9px; letter-spacing: .14em; text-transform: uppercase; }
.ad .img.photo { background: #c9c3b5 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='150'%3E%3Crect width='300' height='150' fill='%23c9c3b5'/%3E%3Cpath d='M0 110 L60 70 L110 95 L170 55 L230 85 L300 50 L300 150 L0 150Z' fill='%23a39d8f'/%3E%3C/svg%3E"); }
.ad .link { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 10px 12px; background: var(--paper-2); }
.ad .link b { display: block; font-size: 11.5px; }
.ad .link small { display: block; font-size: 9.5px; color: var(--muted); }
.ad .link span { white-space: nowrap; font-size: 10px; font-weight: 600; padding: 6px 10px; border-radius: 6px; background: #fff; border: 1px solid var(--line); }
.anat { display: grid; grid-template-columns: 300px 1fr; gap: 18px; align-items: start; margin-bottom: 12px; }
.anat .labels { display: grid; gap: 8px; }
.anat .labels div { padding: 10px 14px; border-radius: 10px; background: #fff; border: 1px solid var(--line); font-size: 13px; line-height: 1.4; }
.anat .labels b { display: block; font-size: 12.5px; color: var(--copper-deep); }
.circle { position: relative; }
.circle::after { content: ''; position: absolute; width: 90px; height: 54px; border: 3px solid #d0432a; border-radius: 50%; left: 110px; top: 50px; transform: rotate(-8deg); }
.worksheet { display: grid; gap: 10px; margin-bottom: 12px; }
.worksheet div { padding: 12px 16px; border: 1px dashed rgba(18,18,20,.3); border-radius: 10px; min-height: 62px; font-size: 13.5px; color: var(--ink-2); }
.worksheet div b { display: block; font-family: ui-monospace, Menlo, monospace; font-size: 9px; letter-spacing: .16em; text-transform: uppercase; color: var(--copper-deep); margin-bottom: 4px; }
.toc { columns: 1; font-size: 11px; }
.toc h3 { font-family: Bricolage, sans-serif; font-weight: 800; font-size: 14px; margin: 10px 0 4px; letter-spacing: -.02em; }
.toc h3:first-child { margin-top: 0; }
.toc h3 small { font-weight: 400; font-family: InterV; font-size: 10.5px; color: var(--muted); margin-left: 8px; }
.toc div { display: flex; justify-content: space-between; gap: 10px; padding: 2.5px 0; border-bottom: 1px dotted var(--line); color: var(--ink-2); }
.toc div span:last-child { font-family: ui-monospace, Menlo, monospace; font-size: 10px; color: var(--muted); }
.toc2 { columns: 2; column-gap: 30px; } .toc h3 { break-inside: avoid; break-after: avoid; } .toc div { break-inside: avoid; }
.cover .big { font-family: Bricolage, sans-serif; font-weight: 800; font-size: 74px; line-height: .92; letter-spacing: -.05em; margin: 0; text-transform: uppercase; }
.cover .big em { font-style: normal; color: var(--ember); }
.cover .slash { position: absolute; right: -40px; bottom: 150px; width: 320px; height: 36px; background: var(--copper); transform: skewY(-6deg); }
.cover .slash2 { position: absolute; right: 60px; bottom: 120px; width: 260px; height: 36px; background: rgba(227,160,112,.3); transform: skewY(-6deg); }
.cover .slash3 { position: absolute; left: -60px; top: 300px; width: 220px; height: 30px; background: rgba(227,160,112,.3); transform: skewY(-6deg); }
.divider .n { font-family: Bricolage, sans-serif; font-weight: 800; font-size: 170px; line-height: .85; letter-spacing: -.06em; color: #fff; margin: 60px 0 30px; }
.divider .rule { width: 120px; height: 3px; background: var(--copper); margin-bottom: 26px; }
.divider h1 { font-size: 52px; max-width: 12ch; }
.divider .sub { font-size: 19px; color: var(--copper) !important; }
.sig { font-family: Bricolage, sans-serif; font-weight: 700; font-size: 22px; margin-top: 10px; }
.page.tight h1 { font-size: 36px; } .page.tight .sub { font-size: 16px; margin-bottom: 18px; }
.page.tight .body p { font-size: 14px; margin-bottom: 10px; } .page.tight .body p.big { font-size: 16.5px; } .page.tight .body li { font-size: 13.5px; margin-bottom: 5px; }
.page.tight .body h2 { font-size: 19px; margin: 12px 0 6px; } .page.tight .card { padding: 12px 14px; } .page.tight .card small { font-size: 12.5px; } .page.tight .card b { font-size: 15px; }
.page.tight .step { padding: 10px 14px; } .page.tight .step small { font-size: 12.5px; } .page.tight .step b { font-size: 14px; }
.page.tight .row { padding: 8px 0; font-size: 13px; } .page.tight .compare > div { padding: 12px 14px; font-size: 13px; } .page.tight .callout { padding: 12px 14px; font-size: 13.5px; }
.page.tight .bubble { font-size: 13px; padding: 12px 14px; } .page.tight .donow { padding: 14px 18px; } .page.tight .donow span { font-size: 14px; } .page.tight .note { font-size: 11.5px; margin-top: 8px; }
.page.tight .check { padding: 8px 0; font-size: 13px; } .page.tight .cards { gap: 8px; } .page.tight .steps { gap: 6px; }
.page.tight .toc { font-size: 10px; } .page.tight .toc div { padding: 1.5px 0; } .page.tight .toc h3 { font-size: 13px; margin: 8px 0 3px; }
.page.tight2 h1 { font-size: 32px; } .page.tight2 .sub { font-size: 14.5px; margin-bottom: 14px; }
.page.tight2 .body p { font-size: 13px; margin-bottom: 8px; } .page.tight2 .body p.big { font-size: 15px; } .page.tight2 .body li { font-size: 12.5px; margin-bottom: 4px; }
.page.tight2 .body h2 { font-size: 17px; margin: 10px 0 5px; } .page.tight2 .card { padding: 10px 12px; } .page.tight2 .card small { font-size: 11.5px; } .page.tight2 .card b { font-size: 14px; }
.page.tight2 .step { padding: 8px 12px; } .page.tight2 .step small { font-size: 11.5px; } .page.tight2 .step b { font-size: 13px; }
.page.tight2 .row { padding: 6px 0; font-size: 12px; } .page.tight2 .compare > div { padding: 10px 12px; font-size: 12px; } .page.tight2 .callout { padding: 10px 12px; font-size: 12.5px; }
.page.tight2 .bubble { font-size: 12px; padding: 10px 12px; } .page.tight2 .donow { padding: 12px 16px; } .page.tight2 .donow span { font-size: 13px; } .page.tight2 .note { font-size: 11px; margin-top: 6px; }
.page.tight2 .check { padding: 6px 0; font-size: 12px; } .page.tight2 .cards { gap: 6px; } .page.tight2 .steps { gap: 5px; }
.page.tight2 .toc { font-size: 9.5px; } .page.tight2 .toc div { padding: 1px 0; } .page.tight2 .toc h3 { font-size: 12px; margin: 6px 0 2px; }
`;

const DONOW = (t) => (t ? `<div class="donow"><b>Do this now</b><span>${t}</span></div>` : '');

const foot = (partLabel, n) => `<div class="foot"><span>The Dead River Playbook</span><span>${partLabel ? partLabel + ' · ' : ''}${n}</span></div>`;

export function page({ part, kicker, title, wide, sub, ex, body, note, doNow, dark, toc }) {
  return { title: toc || title, part, render: (n) => `<section class="page ${dark ? 'dark' : ''}">
     <div class="head"><img src="${logo}" alt=""><span class="part">${part || ''}</span></div>
     ${kicker ? `<p class="kicker">${kicker}</p>` : ''}
     <h1${wide ? ' class="wide"' : ''}>${title}</h1>
     ${sub ? `<p class="sub">${sub}</p>` : ''}
     ${ex ? `<span class="ex">Illustrative example</span>` : ''}
     <div class="body">${body || ''}${note ? `<p class="note">${note}</p>` : ''}</div>
     ${DONOW(doNow)}${foot(part, n)}</section>` };
}

export function divider(num, title, sub) {
  return { title: `Part ${num}: ${title}`, divider: true, sub, render: (n) => `<section class="page dark divider">
     <div class="head"><img src="${logo}" alt=""><span class="part">Part ${num}</span></div>
     <p class="n">0${num}</p><div class="rule"></div><h1>${title}</h1><p class="sub">${sub}</p>${foot('', n)}</section>` };
}

const cover = { render: () => `<section class="page dark cover">
     <div class="head"><img src="${logo}" alt="" style="height:30px"></div>
     <p class="sub" style="color:#cfccc4;max-width:46ch;margin-top:40px">“This is the system we run for our clients. Over 5,000 jobs booked. Over $7 million in client revenue. 30 niches, 20 states.”<br><span style="color:var(--copper)">Brandon Aubey, Dead River Management</span></p>
     <p class="big" style="margin-top:50px">The Dead<br>River<br><em>Playbook</em></p>
     <p class="sub lg" style="color:#ecebe6;margin-top:36px;max-width:40ch">How to get the phone ringing with people who are already looking for what you sell. And what to do when it does.</p>
     <div class="slash3"></div><div class="slash"></div><div class="slash2"></div>
     <p class="kicker" style="position:absolute;bottom:.7in;left:.75in">deadrivermanagement.com · El Paso, Texas · Nationwide</p></section>` };

const items = [cover, ...part1(page, divider, Fg), ...part2(page, divider, Fg), ...part3(page, divider, Fg), ...part4(page, divider, Fg)];
// Pass 1: numbers. The TOC is the item flagged toc:true; it gets its entries from the rest.
items.forEach((it, i) => { it.n = i + 1; });
const tocItem = items.find((it) => it.isToc);
if (tocItem) {
  let html = '';
  for (const it of items) {
    if (it === cover || it.isToc || !it.title) continue;
    if (it.divider) html += `<h3>${it.title}<small>${it.sub}</small></h3>`;
    else html += `<div><span>${it.title.replace(/<[^>]+>/g, '')}</span><span>${it.n}</span></div>`;
  }
  tocItem.entries = html;
}
const html = `<!doctype html><html><head><meta charset="utf-8"><title>The Dead River Playbook</title><style>${css}</style></head><body>${items.map((it) => it.render(it.n)).join('\n')}</body></html>`;
// writeFileSync(dir + 'playbook.html', html); // uncomment to inspect the HTML

const b = await chromium.launch();
const p = await b.newPage();
await p.setContent(html, { waitUntil: 'load' });
await p.evaluate(() => document.fonts.ready);
// Auto-fit: any page whose content runs past the footer line gets a tighter scale.
const fit = () => [...document.querySelectorAll('.page')].map((pg, i) => {
  const limit = pg.getBoundingClientRect().top + 11 * 96 - 0.8 * 96;
  const els = [...pg.querySelectorAll('.body > *, .body, .donow, h1, .sub')];
  return { i, over: Math.max(...els.map((e) => e.getBoundingClientRect().bottom)) - limit };
});
for (const cls of ['tight', 'tight2']) {
  const over = await p.evaluate(fit);
  await p.evaluate(([over, cls]) => { over.forEach(({ i, over }) => { if (over > 2) document.querySelectorAll('.page')[i].classList.add(cls); }); }, [over, cls]);
}
const still = (await p.evaluate(fit)).filter((r) => r.over > 2);
if (still.length) console.log('still over', JSON.stringify(still));
await p.pdf({ path: dir + '../../public/downloads/dead-river-scale-playbook.pdf', format: 'Letter', printBackground: true, preferCSSPageSize: true, margin: { top: 0, right: 0, bottom: 0, left: 0 } });
await b.close();
console.log('pages', items.length);
