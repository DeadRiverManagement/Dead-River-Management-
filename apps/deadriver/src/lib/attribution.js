// Attribution contains campaign data only. Form answers never enter browser storage.
export const ATTRIBUTION_KEY = 'drm_attribution_v1';
export const ATTRIBUTION_TTL_MS = 90 * 24 * 60 * 60 * 1000;
export const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
];
export const CLICK_KEYS = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'fbc', 'fbp'];
export const CAMPAIGN_KEYS = ['campaign_id'];
export const TOUCH_KEYS = [
  ...UTM_KEYS,
  ...CLICK_KEYS,
  'landing_page',
  'referrer',
  'occurred_at',
];

function text(value, limit = 160) {
  return typeof value === 'string'
    ? value
        .replace(/[\r\n\t]/g, ' ')
        .trim()
        .slice(0, limit)
    : '';
}

export function pageAddress(value) {
  try {
    const url = new URL(value);
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return '';
    return (url.origin + url.pathname).slice(0, 1000);
  } catch {
    return '';
  }
}

export function sanitizeTouch(input, now = Date.now()) {
  const touch = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return touch;
  for (const key of [...UTM_KEYS, ...CAMPAIGN_KEYS]) {
    const value = text(input[key]);
    if (value) touch[key] = value;
  }
  for (const key of CLICK_KEYS) {
    const value = input[key];
    // Never silently truncate an advertising identifier.
    if (
      typeof value === 'string' &&
      value.length <= 2048 &&
      /^[\w.~-]+$/.test(value)
    )
      touch[key] = value;
  }
  for (const key of ['landing_page', 'referrer']) {
    const value = pageAddress(input[key]);
    if (value) touch[key] = value;
  }
  const time = Date.parse(input.occurred_at);
  if (
    Number.isFinite(time) &&
    time <= now + 60000 &&
    now - time <= ATTRIBUTION_TTL_MS
  ) {
    touch.occurred_at = new Date(time).toISOString();
  }
  return touch;
}

function cookieValue(cookies, name) {
  const entry = String(cookies || '')
    .split(';')
    .find((part) => part.trim().startsWith(name + '='));
  if (!entry) return '';
  try {
    return decodeURIComponent(entry.trim().slice(name.length + 1));
  } catch {
    return '';
  }
}

export function captureTouch({
  href,
  referrer = '',
  cookies = '',
  now = Date.now(),
}) {
  const url = new URL(href);
  const input = Object.fromEntries(
    [...UTM_KEYS, ...CAMPAIGN_KEYS, ...CLICK_KEYS.slice(0, 4)].map((key) => [
      key,
      url.searchParams.get(key),
    ]),
  );
  input.landing_page = href;
  input.referrer = referrer;
  input.occurred_at = new Date(now).toISOString();
  input.fbp = cookieValue(cookies, '_fbp');
  input.fbc = cookieValue(cookies, '_fbc');
  const touch = sanitizeTouch(input, now);
  // Preserve a matching cookie's original click time. A new click gets a new fbc.
  if (touch.fbclid && !touch.fbc?.endsWith('.' + touch.fbclid)) {
    touch.fbc = `fb.1.${now}.${touch.fbclid}`;
  }
  return touch;
}

export function hasCampaign(touch) {
  return [...UTM_KEYS, ...CAMPAIGN_KEYS, 'gclid', 'gbraid', 'wbraid', 'fbclid'].some((key) =>
    Boolean(touch?.[key]),
  );
}

function validStoredTouch(touch, now) {
  const result = sanitizeTouch(touch, now);
  return result.occurred_at ? result : null;
}

export function mergeAttribution(previous, incoming, now = Date.now()) {
  const touch = sanitizeTouch(incoming, now);
  const old = previous?.version === 1 ? previous : {};
  const first = validStoredTouch(old.first, now);
  const latest = validStoredTouch(old.latest, now);
  // A campaign visit is a complete touch: don't attach a prior channel's click ID.
  const sameVisit =
    latest &&
    latest.landing_page === touch.landing_page &&
    [...UTM_KEYS, ...CAMPAIGN_KEYS, 'gclid', 'gbraid', 'wbraid', 'fbclid'].every(
      (key) => latest[key] === touch[key],
    );
  const next = {
    version: 1,
    first: first || touch,
    latest: hasCampaign(touch) && !sameVisit ? touch : latest || touch,
    google: validStoredTouch(old.google, now),
    meta: validStoredTouch(old.meta, now),
  };
  if (['gclid', 'gbraid', 'wbraid'].some((key) => touch[key])) {
    const sameClick =
      next.google &&
      ['gclid', 'gbraid', 'wbraid'].every(
        (key) => next.google[key] === touch[key],
      );
    if (!sameClick) next.google = touch;
  }
  if (touch.fbclid || touch.fbc) {
    const cookieTime = Number(touch.fbc?.match(/^fb\.\d+\.(\d+)\./)?.[1]);
    const metaTouch = touch.fbclid
      ? touch
      : Number.isFinite(cookieTime) &&
          cookieTime > now - ATTRIBUTION_TTL_MS &&
          cookieTime <= now + 60000
        ? validStoredTouch(
            { ...touch, occurred_at: new Date(cookieTime).toISOString() },
            now,
          )
        : null;
    const changed =
      (touch.fbclid && next.meta?.fbclid !== touch.fbclid) ||
      next.meta?.fbc !== touch.fbc;
    if (
      metaTouch &&
      changed &&
      (!next.meta ||
        Date.parse(metaTouch.occurred_at) >= Date.parse(next.meta.occurred_at))
    )
      next.meta = metaTouch;
  }
  // Pixel cookies can become available after the initial page capture.
  if (touch.fbp) next.fbp = touch.fbp;
  else if (typeof old.fbp === 'string')
    next.fbp = sanitizeTouch({ fbp: old.fbp }).fbp;
  if (next.meta && touch.fbc?.endsWith('.' + next.meta.fbclid))
    next.meta.fbc = touch.fbc;
  return next;
}

export function sanitizeAttribution(input, now = Date.now()) {
  if (input?.version !== 1) return null;
  const result = { version: 1 };
  result.consent = {
    storage: input.consent?.storage !== false,
    ad_storage: ['granted', 'denied'].includes(input.consent?.ad_storage)
      ? input.consent.ad_storage
      : 'unknown',
    ad_user_data: ['granted', 'denied'].includes(input.consent?.ad_user_data)
      ? input.consent.ad_user_data
      : 'unknown',
    notice:
      input.consent?.notice === 'accepted' ? 'accepted' : 'unacknowledged',
  };
  if (result.consent.ad_storage === 'denied') result.consent.storage = false;
  if (!result.consent.storage || result.consent.ad_user_data === 'denied')
    return result;
  for (const key of ['first', 'latest', 'google', 'meta']) {
    const touch = validStoredTouch(input[key], now);
    if (touch) result[key] = touch;
  }
  const fbp = sanitizeTouch({ fbp: input.fbp }).fbp;
  if (fbp) result.fbp = fbp;
  return result;
}

// The existing notice is informational: accepting it is not an ad-user-data grant.
// Explicit Google consent denials and Global Privacy Control take precedence.
export function attributionConsent(win) {
  const consent = {
    storage: win.navigator?.globalPrivacyControl !== true,
    ad_storage: 'unknown',
    ad_user_data: 'unknown',
    notice: 'unacknowledged',
  };
  try {
    if (win.localStorage.getItem('drm_cookie_ok') === '1')
      consent.notice = 'accepted';
  } catch {
    /* Storage can be blocked. */
  }
  for (const entry of win.dataLayer || []) {
    if (entry?.[0] !== 'consent' || !['default', 'update'].includes(entry[1]))
      continue;
    if (entry[2]?.ad_storage === 'denied') {
      consent.storage = false;
      consent.ad_storage = 'denied';
    }
    if (
      entry[2]?.ad_storage === 'granted' &&
      win.navigator?.globalPrivacyControl !== true
    ) {
      consent.storage = true;
      consent.ad_storage = 'granted';
    }
    if (['granted', 'denied'].includes(entry[2]?.ad_user_data))
      consent.ad_user_data = entry[2].ad_user_data;
  }
  if (win.navigator?.globalPrivacyControl === true) {
    consent.ad_storage = 'denied';
    consent.ad_user_data = 'denied';
  }
  return consent;
}

export function collectAttribution(win, now = Date.now()) {
  const consent = attributionConsent(win);
  let previous;
  try {
    previous = JSON.parse(win.localStorage.getItem(ATTRIBUTION_KEY) || 'null');
  } catch {
    /* Corrupt or blocked storage. */
  }
  if (!consent.storage || consent.ad_user_data === 'denied') {
    try {
      win.localStorage.removeItem(ATTRIBUTION_KEY);
    } catch {
      /* No storage. */
    }
    return { version: 1, consent };
  }
  const state = mergeAttribution(
    previous,
    captureTouch({
      href: win.location.href,
      referrer: win.document.referrer,
      cookies: win.document.cookie,
      now,
    }),
    now,
  );
  try {
    win.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(state));
  } catch {
    /* Current-page capture still works. */
  }
  return { ...state, consent };
}
