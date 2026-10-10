// The strategy session form on /kk/strategy-session. One question per screen,
// Enter or a click moves on, choices advance on their own, the dots track
// progress, leaving the page pops the catch, and submit posts the answers to
// the lead API before the calendar or the not-yet page.
import { collectAttribution } from '../lib/attribution.js';

const root = document.querySelector('[data-kkf]');
if (root) {
  const form = root.querySelector('.kkf-form');
  const steps = [...root.querySelectorAll('.kkf-step')];
  const dots = [...root.querySelectorAll('.kkf-dots li')];
  const back = root.querySelector('[data-back]');
  const exit = document.querySelector('[data-exit]');
  const questions = steps.filter((s) => !['intro', 'verify'].includes(s.dataset.step));
  let i = 0;
  let exitShown = false;
  let submitting = false;

  const params = new URLSearchParams(location.search);
  if (params.get('email')) form.email.value = params.get('email');
  if (params.get('first')) form.first.value = params.get('first');

  const money = (n) => '$' + Number(n).toLocaleString('en-US');
  root.querySelectorAll('input[type=range]').forEach((r) => {
    const out = root.querySelector(`[data-out="${r.name}"]`);
    const paint = () => { if (out) out.textContent = money(r.value) + (Number(r.value) >= Number(r.max) ? '+' : ''); };
    r.addEventListener('input', paint);
    paint();
  });

  const show = (n) => {
    i = Math.max(0, Math.min(n, steps.length - 1));
    steps.forEach((s, k) => s.classList.toggle('is-active', k === i));
    const q = questions.indexOf(steps[i]);
    const done = q < 0 ? (i === 0 ? 0 : dots.length) : Math.round((q / questions.length) * dots.length);
    dots.forEach((d, k) => {
      d.classList.toggle('is-done', k < done);
      d.classList.toggle('is-current', k === done);
    });
    back.hidden = i === 0 || steps[i].dataset.step === 'verify';
    root.querySelectorAll('[data-name]').forEach((el) => { el.textContent = form.first.value.trim(); });
    if (steps[i].dataset.step === 'contact') {
      if (!form.firstName.value) form.firstName.value = form.first.value.trim();
      if (!form.website2.value) form.website2.value = form.website.value.trim();
    }
    const field = steps[i].querySelector('input:not([type=radio]):not([type=checkbox]):not([type=range]):not(.kkf-hp), textarea, select');
    if (field) setTimeout(() => field.focus(), 60);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fail = (step, msg) => { step.querySelector('.kkf-error').textContent = msg; };
  const ok = (step) => { const e = step.querySelector('.kkf-error'); if (e) e.textContent = ''; };

  const valid = (step) => {
    ok(step);
    const name = step.dataset.step;
    if (name === 'first' && !form.first.value.trim()) return fail(step, 'Please enter your first name.');
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.value.trim()))
      return fail(step, 'Unable to verify email, please double check the spelling or try a different address.');
    if (name === 'marketing' && !form.querySelectorAll('input[name=marketing]:checked').length) return fail(step, 'Please select at least one.');
    if (name === 'country' && !form.country.value) return fail(step, 'Please choose a country.');
    if (name === 'website' && !form.website.value.trim()) return fail(step, 'Website is required. If you don\'t have one, type "don\'t have one".');
    if (name === 'about' && form.about.value.trim().length < 10) return fail(step, 'Please tell us a little about your business.');
    if (name === 'obstacle' && form.obstacle.value.trim().length < 10) return fail(step, 'Please give us as much detail as you can.');
    if (name === 'source' && !form.source.value) return fail(step, 'Please select one.');
    if (name === 'contact') {
      if (!form.firstName.value.trim()) return fail(step, 'First Name is required.');
      if (!form.last.value.trim()) return fail(step, 'Last Name is required.');
      if (form.phone.value.replace(/\D/g, '').length < 10) return fail(step, 'Mobile is required.');
      if (!form.company.value.trim()) return fail(step, 'Company Name is required.');
      if (!form.website2.value.trim()) return fail(step, 'Website is required.');
    }
    return true;
  };

  const next = () => { if (valid(steps[i]) === true) show(i + 1); };

  root.querySelectorAll('[data-next]').forEach((b) => b.addEventListener('click', next));
  back.addEventListener('click', () => show(i - 1));
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && steps[i].dataset.step !== 'contact') { e.preventDefault(); next(); }
  });
  root.querySelectorAll('[data-auto] input').forEach((r) => r.addEventListener('change', () => setTimeout(next, 260)));

  // Leaving the page before the calendar pops the catch, once.
  document.addEventListener('mouseleave', (e) => {
    if (e.clientY > 10 || exitShown || i === 0 || steps[i].dataset.step === 'verify') return;
    exitShown = true;
    exit.hidden = false;
  });
  exit.querySelector('[data-exit-stay]').addEventListener('click', () => { exit.hidden = true; show(i); });
  exit.querySelector('[data-exit-close]').addEventListener('click', () => { exit.hidden = true; });

  const qualifies = () => {
    const lowBudget = form.budget.value === 'Under $5k';
    const noStart = ['Never', 'I’m just shooting the shit'].includes(form.timing.value);
    const noShow = form.pledge.value === 'No';
    return !(lowBudget || noStart || noShow);
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submitting || valid(steps[i]) !== true) return;
    submitting = true;
    const verify = steps.find((s) => s.dataset.step === 'verify');
    show(steps.indexOf(verify));
    const bar = verify.querySelector('.kkf-bar span');
    const pct = verify.querySelector('.kkf-pct');
    let p = 0;
    const tick = setInterval(() => { p = Math.min(p + 7, 92); bar.style.width = p + '%'; pct.textContent = p + '%'; }, 180);

    const v = (k) => (form[k]?.value || '').trim();
    const marketing = [...form.querySelectorAll('input[name=marketing]:checked')].map((x) => x.value).join(', ');
    const lines = [
      ['Sells', v('sell')], ['Marketing now', marketing], ['Country', v('country')], ['Monthly marketing budget', v('budget')],
      ['Website', v('website2') || v('website')], ['About', v('about')], ['Current monthly revenue', money(v('revenue') || 0)], ['Target monthly revenue', money(v('target') || 0)],
      ['Biggest obstacle', v('obstacle')], ['Start', v('timing')], ['Path', v('path')], ['Commitment 1-10', v('commit')],
      ['Heard about us', v('source') + (v('sourceOther') ? ' (' + v('sourceOther') + ')' : '')], ['Pledge to show up', v('pledge')], ['Qualifies', qualifies() ? 'Yes' : 'No'],
    ];
    const site = v('website2') || v('website');
    const website = /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}/i.test(site) ? (site.startsWith('http') ? site : 'https://' + site) : undefined;
    let sent = false;
    try {
      const r = await fetch('/api/growth-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${v('firstName') || v('first')} ${v('last')}`.trim(),
          email: v('email'),
          phone: v('phone'),
          company: v('company'),
          website,
          fax: v('fax'),
          kind: 'strategy',
          form: 'kk-strategy-session',
          industry: v('sell') === 'Service' ? 'home-services' : 'other',
          consent: true,
          source: '/kk/strategy-session',
          message: lines.map(([k, val]) => `${k}: ${val}`).join('\n'),
          submittedAt: new Date().toISOString(),
          attribution: collectAttribution(window),
          inquiryId: crypto.randomUUID(),
        }),
      });
      sent = r.ok;
    } catch {
      sent = false;
    }
    clearInterval(tick);
    bar.style.width = '100%';
    pct.textContent = '100%';
    try { sessionStorage.setItem('kk-answers', JSON.stringify(Object.fromEntries(lines))); } catch {}
    const dest = qualifies() ? '/kk/thanks' : '/kk/not-yet';
    setTimeout(() => { location.href = dest + (sent ? '' : '?sent=0'); }, 500);
  });

  show(0);
}
