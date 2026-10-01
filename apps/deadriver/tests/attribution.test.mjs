import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  ATTRIBUTION_KEY,
  ATTRIBUTION_TTL_MS,
  captureTouch,
  collectAttribution,
  mergeAttribution,
  sanitizeAttribution,
} from '../src/lib/attribution.js';
import {
  ATTRIBUTION_FIELDS,
  attributionContactFields,
  readAttributionFieldMap,
  resolveAttributionFieldMap,
} from '../src/lib/crm-attribution.js';
import handler from '../api/growth-lead.js';
import { ghlMock } from './helpers/ghl.mjs';
import liveFieldConfig from '../src/data/ghl-attribution-fields.json' with { type: 'json' };

const now = Date.now();
const href = 'https://www.deadrivermanagement.com/demandflow';
const map = Object.fromEntries(
  ATTRIBUTION_FIELDS.map(({ key }, index) => [key, `test_field_${index}`]),
);
const touch = (query = '', time = now) =>
  captureTouch({ href: href + query, now: time });
function browser(url = href) {
  const storage = new Map();
  return {
    storage,
    navigator: {},
    location: { href: url },
    document: { cookie: '', referrer: '' },
    dataLayer: [],
    localStorage: {
      getItem: (key) => storage.get(key),
      setItem: (key, value) => storage.set(key, value),
      removeItem: (key) => storage.delete(key),
    },
  };
}
const fieldValues = (fields) =>
  Object.fromEntries(
    fields.map(({ id, fieldValue }) => [
      Object.keys(map).find((key) => map[key] === id),
      fieldValue,
    ]),
  );
const stored = (values) =>
  Object.entries(values).map(([key, value]) => ({ id: map[key], value }));

test('ad IDs and campaign survive navigation and direct return without capturing PII query values', () => {
  const win = browser(
    href +
      '?gclid=google-click&utm_source=google&utm_campaign=contractors&email=private%40example.test',
  );
  const first = collectAttribution(win, now);
  win.location.href = 'https://www.deadrivermanagement.com/book';
  const afterNavigation = collectAttribution(win, now + 1000);
  win.location.href = href;
  const directReturn = collectAttribution(win, now + 60000);
  assert.deepEqual(directReturn.first, first.first);
  assert.deepEqual(afterNavigation.latest, first.latest);
  assert.equal(directReturn.google.gclid, 'google-click');
  assert.equal(directReturn.latest.utm_campaign, 'contractors');
  assert.equal(directReturn.first.landing_page, href);
  assert.doesNotMatch(win.storage.get(ATTRIBUTION_KEY), /private|email=/);
});

test('a later channel gets a separate complete touch while original and platform clicks remain', () => {
  const google = mergeAttribution(
    null,
    touch('?gclid=google-1&utm_source=google'),
  );
  const meta = mergeAttribution(
    google,
    touch(
      '?fbclid=facebook-1&utm_source=facebook&utm_campaign=fall',
      now + 1000,
    ),
    now + 1000,
  );
  assert.equal(meta.first.gclid, 'google-1');
  assert.equal(meta.latest.fbclid, 'facebook-1');
  assert.equal(meta.latest.gclid, undefined);
  assert.equal(meta.google.gclid, 'google-1');
  assert.equal(meta.meta.fbclid, 'facebook-1');
  assert.equal(meta.meta.fbc, `fb.1.${now + 1000}.facebook-1`);
});

test('Meta cookie arrival does not reset original click time or erase its click ID', () => {
  const first = mergeAttribution(null, touch('?fbclid=facebook-1'));
  const later = captureTouch({
    href,
    cookies: `_fbc=fb.1.${now}.facebook-1; _fbp=fb.1.${now}.1234`,
    now: now + 5000,
  });
  const merged = mergeAttribution(first, later, now + 5000);
  assert.equal(merged.meta.fbclid, 'facebook-1');
  assert.equal(merged.meta.occurred_at, first.meta.occurred_at);
  assert.equal(merged.fbp, `fb.1.${now}.1234`);
  const older = mergeAttribution(
    merged,
    { ...later, fbc: `fb.1.${now - 5000}.old-click` },
    now + 6000,
  );
  assert.equal(older.meta.fbclid, 'facebook-1');
});

test('braid identifiers survive navigation and corrupt/expired history is discarded', () => {
  const win = browser(href + '?gbraid=braid-g&wbraid=braid-w');
  win.storage.set(ATTRIBUTION_KEY, '{broken');
  const state = collectAttribution(win, now);
  assert.equal(state.google.gbraid, 'braid-g');
  assert.equal(state.google.wbraid, 'braid-w');
  win.location.href = href;
  const expired = collectAttribution(win, now + ATTRIBUTION_TTL_MS + 1);
  assert.equal(expired.google, null);
  assert.equal(expired.first.gbraid, undefined);
});

test('GPC and explicit consent denial clear storage and suppress identifiers, acceptance alone grants no ad user data', () => {
  for (const restriction of ['gpc', 'ad_storage', 'ad_user_data']) {
    const win = browser(href + '?gclid=google-click');
    collectAttribution(win, now);
    win.storage.set('drm_cookie_ok', '1');
    if (restriction === 'gpc') win.navigator.globalPrivacyControl = true;
    else win.dataLayer.push(['consent', 'update', { [restriction]: 'denied' }]);
    const state = collectAttribution(win, now + 1000);
    assert.equal(win.storage.has(ATTRIBUTION_KEY), false);
    assert.equal(state.first, undefined);
    assert.equal(state.google, undefined);
    assert.equal(sanitizeAttribution(state).first, undefined);
  }
  const allowed = browser();
  allowed.storage.set('drm_cookie_ok', '1');
  const state = collectAttribution(allowed, now);
  assert.equal(state.consent.ad_storage, 'unknown');
  assert.equal(state.consent.ad_user_data, 'unknown');
});

test('blocked local storage still captures allowed current-page IDs', () => {
  const win = browser(href + '?gclid=google-click');
  win.localStorage = {
    getItem() {
      throw new Error('blocked');
    },
    setItem() {
      throw new Error('blocked');
    },
  };
  assert.equal(collectAttribution(win, now).google.gclid, 'google-click');
});

test('field mapping requires real distinct IDs for every configured field', () => {
  assert.equal(readAttributionFieldMap('{}'), null);
  assert.equal(readAttributionFieldMap('broken'), null);
  assert.equal(readAttributionFieldMap({ ...map, gclid: map.fbc }), null);
  assert.deepEqual(readAttributionFieldMap(JSON.stringify(map)), map);
});

test('a verified saved map applies only to its exact GHL location, with explicit environment override', () => {
  const persisted = {
    locationId: 'location-1',
    verifiedAt: new Date(now).toISOString(),
    fields: map,
  };
  assert.deepEqual(
    resolveAttributionFieldMap({ locationId: 'location-1', persisted }),
    map,
  );
  assert.equal(
    resolveAttributionFieldMap({ locationId: 'different-location', persisted }),
    null,
  );
  assert.equal(
    resolveAttributionFieldMap({
      locationId: 'location-1',
      persisted: { ...persisted, verifiedAt: null },
    }),
    null,
  );
  assert.equal(
    resolveAttributionFieldMap({
      locationId: 'location-1',
      persisted,
      override: '{}',
    }),
    null,
  );
  assert.deepEqual(
    resolveAttributionFieldMap({
      locationId: 'different-location',
      persisted,
      override: JSON.stringify(map),
    }),
    map,
  );
});

test('production location uses its verified checked-in real IDs without requiring a large environment JSON', async () => {
  await productionTest(async (mock) => {
    process.env.GHL_LOCATION_ID = liveFieldConfig.locationId;
    delete process.env.GHL_ATTRIBUTION_FIELD_IDS;
    const res = response();
    await handler(
      req(intake(mergeAttribution(null, touch('?gclid=google-config-test')))),
      res,
    );
    assert.equal(res.code, 200);
    assert.equal(
      mock.contact.customFields.find(
        ({ id }) => id === liveFieldConfig.fields.gclid,
      ).value,
      'google-config-test',
    );
    assert.equal(liveFieldConfig.locationId, 'dzfd13SYs0Jg3qbvmugD');
    assert.equal(
      Object.keys(liveFieldConfig.fields).length,
      ATTRIBUTION_FIELDS.length,
    );
  });
});

test('existing original source and first touch survive a later device and campaign', () => {
  const state = mergeAttribution(
    null,
    touch('?gclid=new-google&utm_source=google'),
  );
  const contact = {
    source: 'Instantly',
    customFields: stored({
      original_source: 'Instantly',
      first_occurred_at: new Date(now - 50000).toISOString(),
      first_utm_campaign: 'cold-email-1',
      latest_gclid: 'old-google',
      latest_occurred_at: new Date(now - 50000).toISOString(),
    }),
  };
  const fields = fieldValues(
    attributionContactFields({
      attribution: state,
      map,
      contact,
      eventId: 'event-1',
      submittedAt: new Date(now).toISOString(),
    }),
  );
  assert.equal(fields.original_source, undefined);
  assert.equal(fields.first_gclid, undefined);
  assert.equal(fields.first_utm_campaign, undefined);
  assert.equal(fields.latest_gclid, 'new-google');
});

test('direct visits never overwrite useful latest attribution and new channels clear mismatched latest IDs', () => {
  const contact = {
    customFields: stored({
      latest_gclid: 'old-google',
      latest_utm_campaign: 'google-campaign',
      latest_occurred_at: new Date(now - 5000).toISOString(),
    }),
  };
  const direct = fieldValues(
    attributionContactFields({
      attribution: mergeAttribution(null, touch()),
      map,
      contact,
      eventId: 'event-1',
    }),
  );
  assert.equal(direct.latest_gclid, undefined);
  assert.equal(direct.latest_utm_campaign, undefined);
  const meta = fieldValues(
    attributionContactFields({
      attribution: mergeAttribution(
        null,
        touch('?fbclid=facebook-1&utm_source=facebook'),
      ),
      map,
      contact,
      eventId: 'event-2',
    }),
  );
  assert.equal(meta.latest_gclid, '');
  assert.equal(meta.latest_utm_campaign, '');
  assert.equal(meta.latest_fbclid, 'facebook-1');
});

const intake = (state) => ({
  kind: 'demandflow',
  source: '/demandflow',
  industry: 'home-services',
  name: 'Tracking Test',
  company: 'Test Only',
  email: 'tracking@example.test',
  phone: '+15555550101',
  consent: true,
  inquiryId: '7dd4ed8e-9207-4381-a0de-624a898f7033',
  attribution: state,
});
const req = (body) => ({
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    host: 'www.deadrivermanagement.com',
    origin: 'https://www.deadrivermanagement.com',
  },
  body,
});
function response() {
  return {
    code: 200,
    setHeader() {},
    status(value) {
      this.code = value;
      return this;
    },
    json(value) {
      this.data = value;
      return this;
    },
  };
}
async function productionTest(callback, mockOptions) {
  const oldEnv = { ...process.env },
    oldFetch = globalThis.fetch;
  const mock = ghlMock(mockOptions);
  try {
    Object.assign(process.env, {
      VERCEL_ENV: 'production',
      GHL_PIT: 'test-token',
      GHL_LOCATION_ID: 'test-location',
      GHL_ATTRIBUTION_FIELD_IDS: JSON.stringify(map),
    });
    delete process.env.ENABLE_GROWTH_INTAKE;
    globalThis.fetch = mock.fetch;
    await callback(mock);
  } finally {
    process.env = oldEnv;
    globalThis.fetch = oldFetch;
  }
}

test('inquiry saves structured attribution, reads back real fields, and uses one stable browser/server ID across retry', async () => {
  await productionTest(async (mock) => {
    const state = mergeAttribution(
      null,
      touch('?gclid=google-click&utm_source=google&utm_campaign=test-campaign'),
    );
    const body = intake(state),
      first = response(),
      second = response();
    await handler(req(body), first);
    assert.equal(first.code, 200);
    assert.equal(first.data.event_id, `drm_inquiry_${body.inquiryId}`);
    const fields = Object.fromEntries(
      mock.contact.customFields.map(({ id, value }) => [id, value]),
    );
    assert.equal(fields[map.gclid], 'google-click');
    assert.equal(fields[map.first_utm_campaign], 'test-campaign');
    assert.equal(fields[map.last_inquiry_event_id], first.data.event_id);
    assert.equal(mock.contact.source, 'google');
    const attributionWrite = mock.calls.findIndex((call) =>
      call.body?.customFields?.some(({ id }) => id === map.gclid),
    );
    const receiptWrite = mock.calls.findIndex((call) =>
      call.body?.customFields?.some(
        ({ id }) => id === map.last_inquiry_event_id,
      ),
    );
    assert.ok(receiptWrite > attributionWrite + 1);
    assert.equal(mock.calls[attributionWrite + 1].method, 'GET');
    await handler(req(body), second);
    assert.equal(second.code, 200);
    assert.equal(second.data.event_id, first.data.event_id);
    assert.equal(
      mock.calls.filter((call) => call.path === '/contacts/upsert').length,
      1,
    );
    assert.equal(mock.notes.length, 1);
  });
});

test('missing mappings and unconfirmed field writes never report a conversion-ready inquiry', async () => {
  await productionTest(async (mock) => {
    delete process.env.GHL_ATTRIBUTION_FIELD_IDS;
    const res = response();
    await handler(
      req(intake(mergeAttribution(null, touch('?gclid=google-click')))),
      res,
    );
    assert.equal(res.code, 503);
    assert.equal(mock.calls.length, 0);
  });
  for (const scenario of ['fields-rejected', 'fields-not-persisted']) {
    await productionTest(
      async (mock) => {
        const res = response();
        await handler(
          req(intake(mergeAttribution(null, touch('?gclid=google-click')))),
          res,
        );
        assert.equal(res.code, 502);
        assert.equal(res.data.event_id, undefined);
        assert.equal(
          mock.calls.some((call) =>
            call.body?.customFields?.some(
              ({ id }) => id === map.last_inquiry_event_id,
            ),
          ),
          false,
        );
      },
      { scenario },
    );
  }
});

test('existing contact is updated by ID without replacing tags, source, or DND', async () => {
  await productionTest(
    async (mock) => {
      const res = response();
      await handler(
        req(intake(mergeAttribution(null, touch('?fbclid=facebook-click')))),
        res,
      );
      assert.equal(res.code, 200);
      assert.equal(mock.contact.source, 'Instantly');
      assert.equal(mock.contact.dnd, true);
      assert.deepEqual(mock.contact.tags, [
        'customer',
        'cold-email-assigned',
        'demandflow-home-services',
      ]);
      assert.equal(
        mock.calls.some((call) => call.path === '/contacts/upsert'),
        false,
      );
    },
    {
      contact: {
        id: 'contact-1',
        email: 'tracking@example.test',
        phone: '+15555550101',
        source: 'Instantly',
        tags: ['customer', 'cold-email-assigned'],
        dnd: true,
        customFields: [],
      },
    },
  );
});

test('phone shared with a different email fails safely before changing a contact', async () => {
  await productionTest(
    async (mock) => {
      const res = response();
      await handler(req(intake(mergeAttribution(null, touch()))), res);
      assert.equal(res.code, 502);
      assert.equal(
        mock.calls.some((call) => call.method !== 'GET'),
        false,
      );
    },
    {
      contact: {
        id: 'contact-1',
        email: 'different@example.test',
        phone: '+15555550101',
      },
    },
  );
});

test('consent denial saves inquiry consent but no advertising IDs and disallows the browser conversion', async () => {
  await productionTest(async (mock) => {
    const state = {
      ...mergeAttribution(null, touch('?gclid=private-click')),
      consent: { storage: false, ad_user_data: 'denied' },
    };
    const res = response();
    await handler(req(intake(state)), res);
    assert.equal(res.code, 200);
    assert.equal(res.data.analytics_allowed, false);
    assert.equal(JSON.stringify(mock.contact).includes('private-click'), false);
    assert.equal(
      mock.contact.customFields.find((field) => field.id === map.ad_user_data)
        .value,
      'denied',
    );
  });
});

test('a return visit with unknown consent cannot undo a recorded CRM denial', async () => {
  await productionTest(
    async (mock) => {
      const res = response();
      await handler(
        req(
          intake(mergeAttribution(null, touch('?gclid=private-return-click'))),
        ),
        res,
      );
      assert.equal(res.code, 200);
      assert.equal(res.data.analytics_allowed, false);
      assert.equal(
        JSON.stringify(mock.contact).includes('private-return-click'),
        false,
      );
      assert.equal(
        mock.contact.customFields.find((field) => field.id === map.ad_user_data)
          .value,
        'denied',
      );
    },
    {
      contact: {
        id: 'contact-1',
        email: 'tracking@example.test',
        source: 'Existing source',
        customFields: stored({ ad_user_data: 'denied', ad_storage: 'denied' }),
      },
    },
  );
});

test('tracking bootstrap covers both layouts', () => {
  for (const layout of ['Growth', 'Base'])
    assert.match(
      readFileSync(
        new URL(`../src/layouts/${layout}.astro`, import.meta.url),
        'utf8',
      ),
      /scripts\/attribution\.js/,
    );
});
