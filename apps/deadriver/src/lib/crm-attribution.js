import { TOUCH_KEYS, hasCampaign, sanitizeAttribution } from './attribution.js';

// Provision these contact fields in the active GHL location, then configure the
// actual IDs in GHL_ATTRIBUTION_FIELD_IDS. Names/keys are never sent as fake IDs.
export const ATTRIBUTION_FIELDS = [
  ...['first', 'latest'].flatMap((prefix) =>
    TOUCH_KEYS.map((key) => ({
      key: `${prefix}_${key}`,
      name: `DRM ${prefix === 'first' ? 'Original' : 'Latest'} ${key.replaceAll('_', ' ')}`,
    })),
  ),
  ...[
    ['original_source', 'Original source'],
    ['latest_source', 'Latest source'],
    ['gclid', 'Google GCLID'],
    ['gbraid', 'Google GBRAID'],
    ['wbraid', 'Google WBRAID'],
    ['google_click_at', 'Google click time'],
    ['google_landing_page', 'Google landing page'],
    ['fbclid', 'Meta FBCLID'],
    ['fbc', 'Meta FBC'],
    ['fbp', 'Meta FBP'],
    ['meta_click_at', 'Meta click time'],
    ['meta_landing_page', 'Meta landing page'],
    ['ad_storage', 'Advertising storage consent'],
    ['ad_user_data', 'Advertising user data consent'],
    ['cookie_notice', 'Cookie notice status'],
    ['last_inquiry_event_id', 'Last inquiry event ID'],
    ['last_inquiry_at', 'Last inquiry time'],
  ].map(([key, name]) => ({ key, name: `DRM ${name}` })),
].map((field) => ({ ...field, dataType: 'TEXT', model: 'contact' }));

export function readAttributionFieldMap(raw) {
  let map;
  try {
    map = typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
  if (!map || typeof map !== 'object' || Array.isArray(map)) return null;
  const ids = ATTRIBUTION_FIELDS.map(({ key }) => map[key]);
  if (
    ids.some(
      (id) => typeof id !== 'string' || !/^[a-zA-Z0-9_-]{8,100}$/.test(id),
    ) ||
    new Set(ids).size !== ids.length
  )
    return null;
  return Object.fromEntries(
    ATTRIBUTION_FIELDS.map(({ key }) => [key, map[key]]),
  );
}

export function resolveAttributionFieldMap({
  locationId,
  override,
  persisted,
}) {
  if (override !== undefined) return readAttributionFieldMap(override);
  if (
    !locationId ||
    persisted?.locationId !== locationId ||
    !persisted.verifiedAt
  )
    return null;
  return readAttributionFieldMap(persisted.fields);
}

export function contactFieldValues(contact) {
  return Object.fromEntries(
    (contact?.customFields || []).map((field) => [
      field.id,
      field.value ?? field.fieldValue,
    ]),
  );
}

export function touchSource(touch) {
  if (touch?.utm_source) return touch.utm_source;
  if (touch?.gclid || touch?.gbraid || touch?.wbraid) return 'Google Ads';
  if (touch?.fbclid || touch?.fbc) return 'Meta Ads';
  if (touch?.referrer) {
    try {
      return new URL(touch.referrer).hostname;
    } catch {
      /* Sanitized below. */
    }
  }
  return 'Direct website';
}

export function attributionContactFields({
  attribution,
  map,
  contact,
  eventId,
  submittedAt,
  isNew = false,
}) {
  const state = sanitizeAttribution(attribution);
  const existing = contactFieldValues(contact);
  const values = {};
  const put = (key, value, original = false) => {
    if (value == null || value === '') return;
    if (original && existing[map[key]] != null && existing[map[key]] !== '')
      return;
    if (String(existing[map[key]] ?? '') !== String(value))
      values[key] = String(value);
  };
  const replace = (key, value) => {
    if (value) put(key, value);
    else if (existing[map[key]]) values[key] = '';
  };
  if (state) {
    const consent = state.consent;
    put('ad_storage', consent.storage ? consent.ad_storage : 'denied');
    put('ad_user_data', consent.ad_user_data);
    put('cookie_notice', consent.notice);
    if (consent.storage && consent.ad_user_data !== 'denied') {
      // An existing CRM source predates this browser visit. Preserve it even
      // when the visitor has no browser history on this device.
      put(
        'original_source',
        contact?.source ||
          (isNew
            ? touchSource(state.first)
            : 'Existing contact (source unknown)'),
        true,
      );
      const firstTime = existing[map.first_occurred_at];
      if (
        (!firstTime && (isNew || !contact?.source)) ||
        firstTime === state.first?.occurred_at
      ) {
        for (const key of TOUCH_KEYS)
          put(`first_${key}`, state.first?.[key], true);
      }
      const latest = state.latest;
      const existingLatestTime = Date.parse(existing[map.latest_occurred_at]);
      const incomingLatestTime = Date.parse(latest?.occurred_at);
      const recentEnough =
        !Number.isFinite(existingLatestTime) ||
        incomingLatestTime >= existingLatestTime;
      if (
        latest &&
        recentEnough &&
        (hasCampaign(latest) || !existing[map.latest_occurred_at])
      ) {
        for (const key of TOUCH_KEYS) replace(`latest_${key}`, latest[key]);
        put('latest_source', touchSource(latest));
      }
      // Platform-specific clicks remain available after a visit from another
      // channel. Never let a direct return or older browser state erase them.
      for (const [platform, keys] of [
        ['google', ['gclid', 'gbraid', 'wbraid']],
        ['meta', ['fbclid', 'fbc']],
      ]) {
        const touch = state[platform];
        const oldTime = Date.parse(existing[map[`${platform}_click_at`]]);
        if (
          !touch ||
          (Number.isFinite(oldTime) && Date.parse(touch.occurred_at) < oldTime)
        )
          continue;
        for (const key of keys) replace(key, touch[key]);
        put(`${platform}_click_at`, touch.occurred_at);
        put(`${platform}_landing_page`, touch.landing_page);
      }
      put('fbp', state.fbp);
    }
  }
  put('last_inquiry_event_id', eventId);
  put('last_inquiry_at', submittedAt);
  return Object.entries(values).map(([key, fieldValue]) => ({
    id: map[key],
    fieldValue,
  }));
}
