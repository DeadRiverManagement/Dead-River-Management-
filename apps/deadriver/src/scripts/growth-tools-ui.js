import { calculate, scoreChecklist, campaignUrl } from '../lib/growth-tools.js';
const root = document.querySelector('[data-tool]'),
  form = document.querySelector('#tool-form'),
  out = document.querySelector('#tool-output');
function node(tag, text, cls) {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (cls) el.className = cls;
  return el;
}
function render() {
  if (!root || !form || !out) return;
  const type = root.dataset.tool,
    values = Object.fromEntries(new FormData(form)),
    status = form.querySelector('.form-status');
  try {
    let result;
    out.replaceChildren();
    if (['roi', 'cac', 'revenue', 'budget'].includes(type)) {
      result = calculate(type, values);
      out.append(
        node('strong', result.value, 'result-number'),
        node('div', result.label, 'result-label'),
      );
      const rows = node('div', undefined, 'result-lines');
      result.rows.forEach(([k, v]) => {
        const row = node('div');
        row.append(node('span', k), node('strong', v));
        rows.append(row);
      });
      out.append(rows);
    } else if (['response', 'readiness', 'conversion', 'seo'].includes(type)) {
      const s = scoreChecklist(type, new FormData(form).getAll('checks'));
      out.append(
        node('strong', s.score + '/100', 'result-number'),
        node('p', s.count + ' of ' + s.total + ' basics in place.'),
      );
      out.append(
        node(
          'p',
          s.gaps.length
            ? 'Start with the items you did not tick:'
            : 'All five are ticked. Nice. Keep checking them every few months.',
        ),
      );
      const list = node('ul', undefined, 'check-list');
      s.gaps.forEach((g) => list.append(node('li', g)));
      out.append(list);
    } else if (type === 'meta') {
      const url = new URL(values.url);
      if (!['https:', 'http:'].includes(url.protocol))
        throw new Error(
          'Use a normal web address that starts with http or https.',
        );
      const snippet = node('div', undefined, 'snippet');
      snippet.append(
        node('small', url.hostname + url.pathname),
        node('h3', values.title),
        node('p', values.description),
      );
      out.append(
        snippet,
        node(
          'p',
          values.title.length +
            ' characters in the title · ' +
            values.description.length +
            ' in the description. Google usually shows about 60 and 155.',
        ),
      );
    } else {
      const text = campaignUrl(
        values.url,
        values.source,
        values.medium,
        values.campaign,
      );
      const area = node('textarea', undefined, 'output-url');
      area.readOnly = true;
      area.value = text;
      area.setAttribute('aria-label', 'Your tracking link');
      const button = node('button', 'Copy link', 'button secondary');
      button.type = 'button';
      button.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(text);
          button.textContent = 'Copied';
        } catch {
          area.focus();
          area.select();
          button.textContent = 'Select the link and copy it';
        }
      });
      out.append(area, button);
    }
    status.textContent = '';
    status.removeAttribute('data-state');
  } catch (e) {
    status.textContent = e.message;
    status.dataset.state = 'error';
    out.append(node('p', 'Fill in the boxes to see your result.'));
  }
}
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  if (form.reportValidity()) render();
});
form?.addEventListener('input', () => {
  if (root?.dataset.tool !== 'utm') render();
});
if (root?.dataset.tool !== 'utm') render();
else
  out?.append(
    node(
      'p',
      'Fill in the link and campaign details, then click Build the link.',
    ),
  );
