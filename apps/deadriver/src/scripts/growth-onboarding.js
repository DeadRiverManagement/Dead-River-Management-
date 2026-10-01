const form = document.querySelector('#access-planner-form'),
  result = document.querySelector('#access-checklist');
let selected = [],
  engagement = 'Growth Partner';
function update() {
  const checks = [...result.querySelectorAll('[data-access-ready]')].filter(
    (c) =>
      !c.closest('[data-platform]') || selected.includes(c.dataset.accessReady),
  );
  const done = checks.filter((c) => c.checked).length;
  const requiredPlatforms =
    engagement === 'Foundation' ? 0 : engagement === 'Scale' ? 2 : 1;
  const paidPlatforms = selected.filter((p) =>
    ['meta', 'google'].includes(p),
  ).length;
  document.querySelector('#access-readiness').textContent =
    paidPlatforms < requiredPlatforms
      ? done +
        ' of ' +
        checks.length +
        ' items ready. ' +
        engagement +
        ' includes ads on ' +
        requiredPlatforms +
        ' platform' +
        (requiredPlatforms === 1 ? '' : 's') +
        ', so also tick Meta or Google Ads above, or tell us if you want a different platform.'
      : done === checks.length
        ? 'Your checklist is complete. We will confirm access on our side and then set your start date.'
        : done +
          ' of ' +
          checks.length +
          ' items ready. Finish the remaining items and we can set a start date.';
}
form.addEventListener('submit', (e) => {
  e.preventDefault();
  selected = new FormData(form).getAll('platform');
  engagement = form.elements.engagement.value;
  const status = form.querySelector('.form-status');
  if (!selected.length) {
    status.textContent = 'Choose at least one account to prepare.';
    return;
  }
  status.textContent =
    'Here is your ' +
    engagement +
    ' checklist for ' +
    (form.elements.model.value === 'ecommerce'
      ? 'an online store'
      : 'a service business') +
    '. It stays on this page; nothing is sent.';
  result
    .querySelectorAll('[data-platform]')
    .forEach((row) => (row.hidden = !selected.includes(row.dataset.platform)));
  result.hidden = false;
  update();
  result.focus();
});
result.addEventListener('change', update);
form.elements.model.addEventListener('change', () => {
  const store = form.elements.model.value === 'ecommerce';
  form.querySelector('[value="shopify"]').checked = store;
  form.querySelector('[value="crm"]').checked = !store;
  if (store) form.querySelector('[value="email"]').checked = true;
});
form.addEventListener('change', () => {
  result.hidden = true;
  form.querySelector('.form-status').textContent =
    'Click "Build my checklist" again to update it.';
});
document
  .querySelector('#print-access')
  .addEventListener('click', () => window.print());
