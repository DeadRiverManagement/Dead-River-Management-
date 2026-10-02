// Client submit rules for /onboarding/<slug>. Contact-only GHL upsert is not
// completed onboarding, thanks only after the intake note is saved.

export function isCompleteOnboardResponse(data) {
  return Boolean(data && data.ok === true && data.note === true);
}

function callHelp(phone, phoneE164, inbox) {
  return (
    'Call or text <a class="link" href="tel:' + phoneE164 + '">' + phone + '</a> ' +
    'or email <a class="link" href="mailto:' + inbox + '">' + inbox + '</a> ' +
    'and we will take these details down for you.'
  );
}

export function incompleteOnboardMessage(reason, phone, phoneE164, inbox) {
  if (reason === 'note_failed') {
    return (
      'We have your name, but the setup details did not save. Your answers are still here. ' +
      'Send this again, or ' +
      callHelp(phone, phoneE164, inbox)
    );
  }
  return (
    'That did not send, and we do not want you retyping it. ' +
    callHelp(phone, phoneE164, inbox)
  );
}

export function bindOnboardingForm(form, options = {}) {
  if (!form) return;

  const fetchImpl = options.fetchImpl || globalThis.fetch.bind(globalThis);
  const assign = options.assign || ((href) => { globalThis.window.location.assign(href); });
  const thanksPath = options.thanksPath || form.getAttribute('data-thanks-path') || '/onboarding/thanks';
  const phone = options.phone || form.getAttribute('data-phone') || '';
  const phoneE164 = options.phoneE164 || form.getAttribute('data-phone-e164') || '';
  const inbox = options.inbox || form.getAttribute('data-inbox') || '';
  const search = options.search != null
    ? options.search
    : (globalThis.window && globalThis.window.location ? globalThis.window.location.search : '');
  const err = form.querySelector('.err');
  if (!err) return;

  const params = new URLSearchParams(search);
  function fillHidden(name, keys) {
    const input = form.querySelector('input[name="' + name + '"]');
    if (!input) return;
    for (let i = 0; i < keys.length; i++) {
      const value = params.get(keys[i]);
      if (value) {
        input.value = value;
        return;
      }
    }
  }
  fillHidden('stripe_customer_id', ['stripe_customer_id', 'customer']);
  fillHidden('stripe_subscription_id', ['stripe_subscription_id', 'subscription']);

  form.addEventListener('input', function (e) {
    if (e.target && e.target.classList) e.target.classList.remove('bad');
  });
  form.addEventListener('change', function (e) {
    if (e.target && e.target.classList) e.target.classList.remove('bad');
  });

  function showIncomplete(reason) {
    const btn = form.querySelector('button[type=submit]');
    if (btn) {
      btn.disabled = false;
      if (btn.dataset.idleLabel) btn.innerHTML = btn.dataset.idleLabel;
    }
    err.innerHTML = incompleteOnboardMessage(reason, phone, phoneE164, inbox);
    err.hidden = false;
    err.dataset.state = reason === 'note_failed' ? 'pending' : 'failed';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    err.hidden = true;
    delete err.dataset.state;

    let ok = true;
    form.querySelectorAll('input, textarea, select').forEach(function (i) {
      if (i.name === 'company') return;
      const empty = !String(i.value || '').trim();
      const badEmail = i.type === 'email' && !empty && String(i.value).indexOf('@') < 0;
      const bad = (i.required && empty) || badEmail;
      if (i.classList) i.classList.toggle('bad', bad);
      if (bad && ok) {
        if (typeof i.focus === 'function') i.focus();
        ok = false;
      }
    });
    if (!ok) {
      err.textContent = 'A couple of fields still need filling in.';
      err.hidden = false;
      err.dataset.state = 'invalid';
      return;
    }

    const btn = form.querySelector('button[type=submit]');
    if (btn) {
      if (!btn.dataset.idleLabel) btn.dataset.idleLabel = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = 'Sending...';
    }

    const data = options.readPayload
      ? options.readPayload()
      : Object.fromEntries(new FormData(form));
    if (!String(data.booking_notify_email || '').trim() && data.booking_notify_name) {
      data.booking_notify_email = data.email || '';
    }

    Promise.resolve(fetchImpl('/api/onboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }))
      .then(function (r) {
        return Promise.resolve(r.json ? r.json() : r.body || null)
          .then(function (body) { return { httpOk: r.ok, body }; })
          .catch(function () { return { httpOk: r.ok, body: null }; });
      })
      .then(function (result) {
        if (!isCompleteOnboardResponse(result.body)) {
          const reason = result.body && result.body.note === false ? 'note_failed' : 'onboard';
          throw new Error(reason);
        }
        assign(thanksPath);
      })
      .catch(function (errObj) {
        const reason = errObj && errObj.message === 'note_failed' ? 'note_failed' : 'onboard';
        showIncomplete(reason);
      });
  });
}
