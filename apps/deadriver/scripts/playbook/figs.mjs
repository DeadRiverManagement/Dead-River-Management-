// Branded figures for the playbook: inline SVG diagrams and photo mockups in
// Dead River colours. Every function returns an HTML string.
import { readFileSync } from 'node:fs';
const dir = new URL('./img/', import.meta.url).pathname;
const b64 = (f) => { const ext = f.split('.').pop(); const mime = ext === 'png' ? 'image/png' : 'image/jpeg'; return `data:${mime};base64,` + readFileSync(dir + f).toString('base64'); };
export const img = {
  brandon: b64('brandon.jpg'), mic: b64('brandon-mic.jpg'), pmg: b64('pmg-results.png'), diScreens: b64('di-screens.png'),
  desk: b64('desk.jpg'), diDemo: b64('di-demo.jpg'), diFrame: b64('di-frame.jpg'), map: b64('map.png'),
  logos: Object.fromEntries(['total-auto-repair', 'wicked-logistics', 'gonzalez-and-sons-roofing', 'parcel-management-group', 'the-pipe-whisperers', 'only-fish'].map((n) => [n, b64(`logo-${n}.png`)])),
};

const C = { copper: '#c8743f', ember: '#e3a070', pale: 'rgba(227,160,112,.28)', ink: '#121214', char: '#1d1d20', muted: '#6b6963', line: 'rgba(18,18,20,.14)', paper: '#f4f1ea', white: '#fff', red: '#d0432a' };
const F = { display: "font-family:Bricolage,sans-serif;font-weight:800", body: 'font-family:InterV,Inter,sans-serif', mono: 'font-family:ui-monospace,Menlo,monospace' };

export const css = `
.fig { margin: 0 0 14px; }
.fig svg { display: block; max-width: 100%; height: auto; }
.fig .cap { font-family: ui-monospace, Menlo, monospace; font-size: 9.5px; letter-spacing: .14em; text-transform: uppercase; color: var(--muted); margin-top: 8px; }
.shot { border-radius: 12px; overflow: hidden; border: 1px solid var(--line); background: #fff; box-shadow: 0 18px 40px -24px rgba(0,0,0,.45); }
.shot img { display: block; width: 100%; }
.fb { width: 320px; border: 1px solid var(--line); border-radius: 12px; background: #fff; overflow: hidden; font-size: 12px; line-height: 1.4; color: var(--ink); box-shadow: 0 18px 40px -24px rgba(0,0,0,.45); }
.fb .top { display: flex; gap: 9px; align-items: center; padding: 10px 12px; }
.fb .top img, .fb .top i { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; display: block; background: var(--charcoal); }
.fb .top b { display: block; font-size: 12px; }
.fb .top small { font-size: 10px; color: var(--muted); }
.fb .copy { padding: 0 12px 10px; white-space: pre-line; }
.fb .copy .more { color: var(--muted); }
.fb .media { position: relative; background: #000; }
.fb .media img { display: block; width: 100%; height: 190px; object-fit: cover; }
.fb .media.tall img { height: 260px; }
.fb .media .ov { position: absolute; left: 12px; right: 12px; bottom: 12px; color: #fff; font-family: Bricolage, sans-serif; font-weight: 800; font-size: 17px; line-height: 1.05; letter-spacing: -.02em; text-shadow: 0 2px 12px rgba(0,0,0,.8); text-transform: uppercase; }
.fb .media .ov em { font-style: normal; color: var(--ember); }
.fb .media .inset { position: absolute; right: 10px; bottom: 10px; width: 92px; height: 70px; object-fit: cover; border: 2px solid #fff; border-radius: 6px; box-shadow: 0 6px 16px rgba(0,0,0,.5); }
.fb .media .circ { position: absolute; width: 110px; height: 70px; border: 3px solid ${C.red}; border-radius: 50%; transform: rotate(-8deg); }
.fb .media .arrow { position: absolute; width: 60px; height: 30px; }
.fb .media .tag { position: absolute; left: 0; top: 14px; background: ${C.red}; color: #fff; font-family: Bricolage, sans-serif; font-weight: 800; font-size: 11px; letter-spacing: .08em; padding: 4px 10px; text-transform: uppercase; }
.fb .link { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding: 10px 12px; background: var(--paper-2); }
.fb .link b { display: block; font-size: 12px; line-height: 1.25; }
.fb .link small { display: block; font-size: 10px; color: var(--muted); margin-top: 2px; }
.fb .link span { white-space: nowrap; font-size: 10.5px; font-weight: 600; padding: 7px 10px; border-radius: 6px; background: #fff; border: 1px solid var(--line); }
.fb .react { display: flex; justify-content: space-between; padding: 8px 12px; font-size: 10px; color: var(--muted); border-top: 1px solid var(--line); }
.fb .sms { padding: 12px; background: #e9e5dc; display: grid; gap: 6px; }
.fb .sms div { max-width: 82%; padding: 8px 11px; border-radius: 14px; background: #fff; font-size: 11.5px; line-height: 1.35; }
.fb .sms div.me { background: var(--copper); color: #140b04; margin-left: auto; }
.fbrow { display: grid; grid-template-columns: repeat(auto-fit, 320px); gap: 16px; justify-content: start; }
.fbrow.sm .fb { width: 210px; font-size: 10px; } .fbrow.sm { grid-template-columns: repeat(auto-fit, 210px); }
.fbrow.sm .fb .media img { height: 124px; } .fbrow.sm .fb .media .ov { font-size: 13px; }
.phone { width: 230px; padding: 12px 10px; border-radius: 28px; background: var(--charcoal); box-shadow: 0 20px 40px -22px rgba(0,0,0,.6); }
.phone .scr { background: #f4f1ea; border-radius: 18px; padding: 14px 10px 16px; display: grid; gap: 7px; min-height: 200px; }
.phone .scr .who { text-align: center; font-size: 10px; color: var(--muted); margin-bottom: 4px; }
.phone .scr div.b { max-width: 88%; padding: 8px 10px; border-radius: 14px; background: #fff; font-size: 11px; line-height: 1.35; border: 1px solid var(--line); }
.phone .scr div.b.me { background: var(--copper); color: #140b04; margin-left: auto; border: 0; }
.side { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; align-items: start; margin-bottom: 12px; }
.side.r { grid-template-columns: 1.3fr 1fr; }
.side.l { grid-template-columns: 1fr 1.3fr; }
.logos { display: flex; gap: 14px; align-items: center; flex-wrap: wrap; padding: 14px 16px; border-radius: 12px; background: #fff; border: 1px solid var(--line); }
.logos img { height: 44px; width: auto; object-fit: contain; }
.portrait { width: 150px; height: 150px; border-radius: 16px; object-fit: cover; object-position: top; float: right; margin: 0 0 12px 18px; box-shadow: 0 18px 40px -24px rgba(0,0,0,.5); }
`;

const svg = (w, h, inner, extra = '') => `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" ${extra}>${inner}</svg>`;
const t = (x, y, s, o = {}) => `<text x="${x}" y="${y}" fill="${o.fill || C.ink}" font-size="${o.size || 13}" style="${o.display ? F.display : F.body};${o.mono ? F.mono : ''}" text-anchor="${o.anchor || 'start'}" font-weight="${o.weight || (o.display ? 800 : 400)}" letter-spacing="${o.ls || 0}">${s}</text>`;

export const fig = (inner, cap) => `<div class="fig">${inner}${cap ? `<div class="cap">${cap}</div>` : ''}</div>`;

// Facebook/Instagram ad mockup.
export function ad({ name = 'Dead River Management', lead = '', photo = img.mic, tall = false, ov = '', inset = '', circle = null, tag = '', headline = '', desc = 'deadrivermanagement.com', cta = 'Learn more', react = true, avatar = img.brandon }) {
  return `<div class="fb"><div class="top"><img src="${avatar}" alt=""><div><b>${name}</b><small>Sponsored · 🌐</small></div></div>
  ${lead ? `<div class="copy">${lead} <span class="more">… See more</span></div>` : ''}
  <div class="media ${tall ? 'tall' : ''}"><img src="${photo}" alt="">${tag ? `<span class="tag">${tag}</span>` : ''}${ov ? `<div class="ov">${ov}</div>` : ''}${inset ? `<img class="inset" src="${inset}" alt="">` : ''}${circle ? `<span class="circ" style="left:${circle[0]}px;top:${circle[1]}px"></span>` : ''}</div>
  <div class="link"><div><b>${headline}</b><small>${desc}</small></div><span>${cta}</span></div>
  ${react ? `<div class="react"><span>👍 ❤️ 41</span><span>6 comments · 3 shares</span></div>` : ''}</div>`;
}

export function sms(lines, who = 'Your company') {
  return `<div class="phone"><div class="scr"><div class="who">${who}</div>${lines.map(([s, me]) => `<div class="b ${me ? 'me' : ''}">${s}</div>`).join('')}</div></div>`;
}

export function pyramid() {
  const rows = [['3%', 'Buying now', 70], ['17%', 'Gathering information', 150], ['20%', 'Know they have the problem', 235], ['60%', "Don't know they have a problem yet", 330]];
  let s = `<defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.copper}"/><stop offset="1" stop-color="${C.ember}"/></linearGradient></defs>`;
  const H = 340, W = 520, cx = 260;
  s += `<polygon points="${cx},10 ${cx + 240},${H} ${cx - 240},${H}" fill="url(#pg)" opacity=".16" stroke="${C.copper}" stroke-width="2"/>`;
  let y0 = 10; const ys = [10, 92, 176, 262, H];
  rows.forEach(([p, l], i) => {
    const y = ys[i + 1]; const hw = 240 * (y - 10) / (H - 10);
    s += `<line x1="${cx - hw}" y1="${y}" x2="${cx + hw}" y2="${y}" stroke="${C.copper}" stroke-width="2"/>`;
    const my = (ys[i] + y) / 2;
    s += t(cx, my - 2, p, { anchor: 'middle', display: true, size: 26, fill: C.copper }) + t(cx, my + 18, l, { anchor: 'middle', size: 12.5, fill: C.ink });
  });
  return svg(W, H + 6, s);
}

export function venn() {
  return svg(520, 250, `
    <circle cx="200" cy="125" r="105" fill="${C.pale}" stroke="${C.copper}" stroke-width="2"/>
    <circle cx="320" cy="125" r="105" fill="rgba(29,29,32,.08)" stroke="${C.char}" stroke-width="2"/>
    ${t(150, 120, 'Clickbait', { anchor: 'middle', display: true, size: 17 })}${t(150, 140, 'wrong people click', { anchor: 'middle', size: 11, fill: C.muted })}
    ${t(370, 120, 'Plain benefit', { anchor: 'middle', display: true, size: 17 })}${t(370, 140, 'nobody notices', { anchor: 'middle', size: 11, fill: C.muted })}
    <circle cx="260" cy="125" r="30" fill="${C.copper}"/>${t(260, 130, 'DR', { anchor: 'middle', display: true, size: 16, fill: '#140b04' })}
    ${t(260, 190, 'The ad that works', { anchor: 'middle', display: true, size: 14 })}${t(260, 208, 'bait, aimed at your exact customer', { anchor: 'middle', size: 11, fill: C.muted })}`);
}

export function stack() {
  const items = [['1', 'Pattern interrupt', 'A picture odd enough to stop the thumb'], ['2', 'A question they have to click', 'In the picture and the headline'], ['3', 'One specific benefit', 'Aimed at your exact customer']];
  let s = `<rect x="0" y="0" width="520" height="330" rx="16" fill="${C.char}"/>`;
  items.forEach(([n, a, b], i) => {
    const y = 22 + i * 78;
    s += `<rect x="60" y="${y}" width="400" height="56" rx="10" fill="rgba(255,255,255,.07)"/><circle cx="92" cy="${y + 28}" r="16" fill="${C.copper}"/>${t(92, y + 33, n, { anchor: 'middle', display: true, size: 15, fill: '#140b04' })}${t(120, y + 25, a, { display: true, size: 15, fill: '#fff' })}${t(120, y + 43, b, { size: 11, fill: 'rgba(255,255,255,.65)' })}`;
    if (i < 2) s += t(260, y + 71, '+', { anchor: 'middle', display: true, size: 20, fill: C.ember });
  });
  s += t(260, 262, '=', { anchor: 'middle', display: true, size: 20, fill: C.ember });
  s += `<rect x="60" y="272" width="400" height="44" rx="10" fill="${C.copper}"/>${t(260, 300, 'An ad somebody stops for', { anchor: 'middle', display: true, size: 17, fill: '#140b04' })}`;
  return svg(520, 330, s);
}

export function obsess() {
  // tangle of settings vs. people with reactions
  let s = '';
  s += `<path d="M60 90 C 90 40, 140 40, 150 90 S 90 150, 120 110 S 190 70, 160 120 S 70 140, 100 80 S 170 60, 140 100" fill="none" stroke="${C.muted}" stroke-width="3" stroke-linecap="round"/>`;
  [['Targeting', 40, 32], ['Bidding', 150, 160], ['Lookalikes', 180, 36]].forEach(([l, x, y]) => { s += `<rect x="${x - 6}" y="${y - 14}" width="${l.length * 7 + 12}" height="20" rx="10" fill="#fff" stroke="${C.line}"/>` + t(x, y, l, { size: 11, fill: C.muted }); });
  s += t(260, 105, '≠', { anchor: 'middle', display: true, size: 44, fill: C.copper });
  [[340, 110, 22], [400, 100, 28], [460, 110, 22]].forEach(([x, y, r]) => { s += `<circle cx="${x}" cy="${y - 10}" r="${r * 0.55}" fill="none" stroke="${C.ink}" stroke-width="3"/><path d="M${x - r} 170 Q ${x} ${y + 10} ${x + r} 170" fill="none" stroke="${C.ink}" stroke-width="3"/>`; });
  [['👍 2K', 330, 48], ['💬 327', 395, 30], ['❤️ 1.4K', 450, 56]].forEach(([l, x, y]) => { s += `<rect x="${x - 8}" y="${y - 15}" width="58" height="22" rx="11" fill="${C.copper}"/>` + t(x + 21, y, l, { anchor: 'middle', size: 11, fill: '#140b04' }); });
  s += `<rect x="20" y="190" width="220" height="40" rx="8" fill="rgba(18,18,20,.06)"/>` + t(130, 214, "Don't obsess over the settings.", { anchor: 'middle', size: 12, weight: 600 });
  s += `<rect x="290" y="190" width="220" height="40" rx="8" fill="${C.pale}"/>` + t(400, 208, 'Obsess over people,', { anchor: 'middle', size: 12, weight: 600 }) + t(400, 223, 'and what gets them to engage.', { anchor: 'middle', size: 12, weight: 600 });
  return svg(530, 240, s);
}

export function flow(boxes, opts = {}) {
  // horizontal boxes with arrows; boxes: [title, sub]
  const n = boxes.length, W = 520, bw = (W - (n - 1) * 26) / n, h = opts.h || 86;
  let s = '';
  boxes.forEach(([a, b], i) => {
    const x = i * (bw + 26);
    s += `<rect x="${x}" y="0" width="${bw}" height="${h}" rx="12" fill="${i === n - 1 && opts.last ? C.copper : '#fff'}" stroke="${C.line}"/>`;
    s += t(x + bw / 2, 34, a, { anchor: 'middle', display: true, size: 14, fill: i === n - 1 && opts.last ? '#140b04' : C.ink });
    const words = (b || '').split(' '); let line = '', ly = 54, lines = [];
    words.forEach((w) => { if ((line + ' ' + w).length > bw / 6.2) { lines.push(line); line = w; } else line = (line + ' ' + w).trim(); }); lines.push(line);
    lines.slice(0, 2).forEach((l, k) => { s += t(x + bw / 2, ly + k * 14, l, { anchor: 'middle', size: 10.5, fill: i === n - 1 && opts.last ? '#140b04' : C.muted }); });
    if (i < n - 1) s += `<path d="M${x + bw + 6} ${h / 2} h 12 m -4 -5 l 5 5 l -5 5" fill="none" stroke="${C.copper}" stroke-width="2.5" stroke-linecap="round"/>`;
  });
  return svg(W, h + 2, s);
}

export function bars(groups, opts = {}) {
  // groups: [label, value, display]; simple columns
  const W = 520, H = 230, max = Math.max(...groups.map((g) => g[1])), n = groups.length, bw = 70, gap = (W - n * bw) / (n + 1);
  let s = `<line x1="0" y1="${H - 36}" x2="${W}" y2="${H - 36}" stroke="${C.line}"/>`;
  groups.forEach(([l, v, d, hi], i) => {
    const x = gap + i * (bw + gap), bh = Math.max(8, (H - 80) * v / max), y = H - 36 - bh;
    s += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="8" fill="${hi ? C.copper : C.char}"/>` + t(x + bw / 2, y - 8, d, { anchor: 'middle', display: true, size: 15 }) + t(x + bw / 2, H - 16, l, { anchor: 'middle', size: 11, fill: C.muted });
  });
  return svg(W, H, s);
}

export function mapFig() {
  const pulses = [[31.6, 70.5], [48.2, 66.5], [50.6, 78.4], [22.1, 63.8], [63.9, 30.5], [76.6, 94.2], [11.6, 61.5], [87.2, 35.1], [65.3, 53.1], [34.2, 39]];
  const dots = pulses.map(([x, y]) => `<circle cx="${x}%" cy="${y}%" r="7" fill="${C.ember}"/><circle cx="${x}%" cy="${y}%" r="16" fill="none" stroke="${C.ember}" stroke-width="2" opacity=".6"/><circle cx="${x}%" cy="${y}%" r="26" fill="none" stroke="${C.ember}" stroke-width="1.5" opacity=".3"/>`).join('');
  return `<div class="shot" style="position:relative;background:#1d1d20;max-width:440px"><img src="${img.map}" alt=""><svg viewBox="0 0 1000 548" style="position:absolute;inset:0;width:100%;height:100%">${dots}<rect x="40" y="440" width="330" height="70" rx="10" fill="rgba(10,10,11,.8)"/>${t(60, 468, '280M U.S. consumer profiles', { display: true, size: 20, fill: '#fff' })}${t(60, 494, '60B behaviors a week · updated daily', { size: 14, fill: C.ember, mono: true })}</svg></div>`;
}

export function shot(src, cap, style = '') {
  return `<div class="shot" style="${style}"><img src="${src}" alt=""></div>${cap ? `<div class="cap" style="font-family:ui-monospace,Menlo,monospace;font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:#6b6963;margin:8px 0 12px">${cap}</div>` : ''}`;
}

export function logos() {
  return `<div class="logos">${Object.values(img.logos).map((s) => `<img src="${s}" alt="">`).join('')}</div>`;
}

export function twoCampaigns() {
  let s = `<rect x="0" y="0" width="250" height="300" rx="14" fill="#fff" stroke="${C.line}"/><rect x="270" y="0" width="250" height="300" rx="14" fill="${C.char}"/>`;
  s += `<rect x="0" y="0" width="250" height="44" rx="14" fill="${C.pale}"/>` + t(125, 28, 'LAUNCH', { anchor: 'middle', display: true, size: 18 });
  s += `<rect x="270" y="0" width="250" height="44" rx="14" fill="${C.copper}"/>` + t(395, 28, 'SCALE', { anchor: 'middle', display: true, size: 18, fill: '#140b04' });
  const L = ['Every new ad starts here', 'Goal: find the winners', '1 ad set per 10 to 20 ads', 'Mix the formats, no grouping', 'Campaign budget, cost cap', 'Low budget for the first 3 to 5 days'];
  const R = ['Winners get copied here', 'Goal: squeeze every lead out', '1 ad set per page or offer', 'Original stays on in Launch', 'Campaign budget, cost cap', 'Budget ceiling at 2x expected spend'];
  L.forEach((l, i) => { s += `<circle cx="22" cy="${72 + i * 36}" r="4" fill="${C.copper}"/>` + t(34, 76 + i * 36, l, { size: 12 }); });
  R.forEach((l, i) => { s += `<circle cx="292" cy="${72 + i * 36}" r="4" fill="${C.ember}"/>` + t(304, 76 + i * 36, l, { size: 12, fill: '#fff' }); });
  s += `<path d="M250 150 h 16 m -5 -6 l 6 6 l -6 6" fill="none" stroke="${C.copper}" stroke-width="3" stroke-linecap="round"/>` + t(260, 138, 'winner', { anchor: 'middle', size: 9, fill: C.copper, mono: true });
  return svg(520, 302, s);
}

export function timeline() {
  const ph = [['Days 1 to 30', 'Fix the basics'], ['Days 31 to 60', 'Get more good leads'], ['Days 61 to 90', 'Keep what works']];
  let s = `<line x1="20" y1="40" x2="500" y2="40" stroke="${C.line}" stroke-width="4"/>`;
  ph.forEach(([a, b], i) => { const x = 60 + i * 190; s += `<circle cx="${x}" cy="40" r="14" fill="${C.copper}"/>` + t(x, 45, String(i + 1), { anchor: 'middle', display: true, size: 13, fill: '#140b04' }) + t(x, 78, a, { anchor: 'middle', size: 10, fill: C.copper, mono: true }) + t(x, 98, b, { anchor: 'middle', display: true, size: 14 }); });
  return svg(520, 110, s);
}

export function scent() {
  // ad headline mirrored on landing page
  return `<div class="side"><div>${ad({ lead: 'Twelve of the fourteen roofs had the same thing going on underneath, and it wasn\'t the hail…', photo: img.desk, headline: 'The 3 things we check before we quote a roof', desc: 'Same words on the page', react: false })}</div>
  <div class="shot" style="padding:18px 20px;background:#0a0a0b;color:#fff;min-height:290px"><img src="${img.logos ? '' : ''}" alt="" style="display:none"><div style="${F.mono};font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:${C.ember}">Landing page</div><div style="${F.display};font-size:24px;line-height:1.05;letter-spacing:-.03em;margin:10px 0 12px">The 3 things we check before we quote a roof</div><div style="font-size:12px;line-height:1.5;color:#cfccc4;margin-bottom:14px">Same promise the ad made. Same words. Same photo. Then the form.</div><div style="display:grid;gap:6px"><div style="height:26px;border-radius:7px;background:rgba(255,255,255,.1)"></div><div style="height:26px;border-radius:7px;background:rgba(255,255,255,.1)"></div><div style="height:30px;border-radius:7px;background:${C.copper}"></div></div></div></div>`;
}

export function crmCard() {
  const rows = [['Source', 'Facebook ad · Roof replacement'], ['Owner', 'Maria'], ['Status', 'Booked'], ['Next task', 'Confirm visit · Thu 9:00'], ['Last contact', 'Today 10:14 · called back in 3 min'], ['Visit / value', 'Thu · about $14,000']];
  return `<div class="shot" style="padding:0"><div style="display:flex;gap:6px;padding:10px 14px;border-bottom:1px solid ${C.line};${F.mono};font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:${C.muted}">${['New', 'In contact', 'Booked', 'Quoted', 'Won'].map((s, i) => `<span style="padding:4px 8px;border-radius:999px;background:${i === 2 ? C.copper : 'rgba(18,18,20,.06)'};color:${i === 2 ? '#140b04' : C.muted}">${s}</span>`).join('')}</div><div style="padding:6px 14px 10px">${rows.map(([a, b]) => `<div style="display:grid;grid-template-columns:110px 1fr;gap:10px;padding:7px 0;border-bottom:1px solid ${C.line};font-size:12px"><span style="${F.mono};font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:${C.copper}">${a}</span><span>${b}</span></div>`).join('')}</div></div>`;
}

export function swipe() {
  const tiles = [['LOCAL', 'Mechanic explains the three sounds most people ignore before the transmission goes'], ['HEADS UP', '{City} homeowners surprised by what\'s hiding in their attic insulation'], ['REVEALED', 'The $90 AC fix most techs in {city} skip'], ['NEW', 'Dentist shares the one habit that saves patients a crown']];
  return `<div class="cards c2">${tiles.map(([k, h]) => `<div class="card" style="padding:0;overflow:hidden"><div style="height:64px;background:linear-gradient(135deg,#2b2b2f,#141416);position:relative"><span style="position:absolute;left:0;top:12px;background:${C.red};color:#fff;${F.display};font-size:10px;letter-spacing:.08em;padding:3px 9px">${k}</span></div><div style="padding:10px 12px;${F.display};font-size:13px;line-height:1.2;letter-spacing:-.01em">${h}</div></div>`).join('')}</div>`;
}
