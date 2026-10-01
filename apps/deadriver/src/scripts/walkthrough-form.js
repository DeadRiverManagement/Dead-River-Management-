/** All six values stay in one form so the existing CRM and redirect keep the
 * same payload. Capture submission so Enter on step one acts as Next. */
export function initWalkthroughForm(form) {
  if (form.dataset.stepsReady) return;
  const steps = [...form.querySelectorAll('[data-form-step]')];
  if (steps.length !== 2) return;
  form.dataset.stepsReady = 'true';
  const next = form.querySelector('[data-step-next]');
  const back = form.querySelector('[data-step-back]');
  const submit = form.querySelector('[type="submit"]');
  const progress = form.querySelector('[data-step-progress]');
  const status = form.querySelector('[data-form-status]');
  const consent = form.querySelector('.form-consent');
  let active = 0;

  function show(index, focus = false) {
    active = index;
    steps.forEach((step, i) => { step.hidden = i !== index; });
    next.hidden = index !== 0;
    back.hidden = index !== 1;
    submit.hidden = index !== 1;
    consent.hidden = index !== 1;
    progress.hidden = false;
    progress.textContent = index === 0 ? 'Step 1 of 2 · Your business' : 'Step 2 of 2 · Your contact details';
    status.textContent = '';
    status.removeAttribute('data-tone');
    if (focus) steps[index].querySelector('input, select').focus();
  }

  function validate(step) {
    let firstInvalid = null;
    step.querySelectorAll('[required]').forEach((field) => {
      const invalid = !field.value.trim() || !field.checkValidity();
      field.setAttribute('aria-invalid', invalid ? 'true' : 'false');
      const error = form.querySelector('#' + field.getAttribute('aria-describedby'));
      if (error) error.hidden = !invalid;
      if (invalid && !firstInvalid) firstInvalid = field;
    });
    return firstInvalid;
  }

  function report(field) {
    status.textContent = 'Please check the highlighted fields.';
    status.setAttribute('data-tone', 'error');
    field.focus();
  }

  function advance() {
    const invalid = validate(steps[0]);
    if (invalid) report(invalid);
    else show(1, true);
  }

  next.addEventListener('click', advance);
  back.addEventListener('click', () => show(0, true));
  form.addEventListener('submit', (event) => {
    if (active === 0) {
      event.preventDefault();
      event.stopImmediatePropagation();
      advance();
      return;
    }
    for (let i = 0; i < steps.length; i++) {
      const invalid = validate(steps[i]);
      if (invalid) {
        event.preventDefault();
        event.stopImmediatePropagation();
        show(i);
        report(invalid);
        return;
      }
    }
    // Valid final submissions reach Base's existing CRM/redirect handler.
  }, true);
  show(0);
}
