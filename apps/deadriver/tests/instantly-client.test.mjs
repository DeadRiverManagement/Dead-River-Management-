import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInstantlyClient,
  InstantlyApiError,
  instantlyPages,
  findInstantlyLeadsByEmail,
  syncInstantlyLifecycle,
} from '../api/_lib/instantly-client.js';

const email = 'integration.test@example.test';
const fixtureLead = (extra = {}) => ({
  id: 'lead-1',
  email,
  campaign: 'campaign-1',
  status: 1,
  lt_interest_status: null,
  ...extra,
});

function fixtureClient(initial = [fixtureLead()]) {
  const leads = new Map(initial.map((lead) => [lead.id, { ...lead }]));
  const blocklist = [];
  const calls = [];
  const client = {
    async listLeads(options) {
      calls.push(['listLeads', options]);
      return { items: [...leads.values()] };
    },
    async listBlocklist(options) {
      calls.push(['listBlocklist', options]);
      return { items: blocklist };
    },
    async addBlocklistEmail(value) {
      calls.push(['addBlocklistEmail', value]);
      const entry = { id: 'block-1', bl_value: value, is_domain: false };
      blocklist.push(entry);
      return entry;
    },
    async setLeadInterest(leadId, status) {
      calls.push(['setLeadInterest', leadId, status]);
      leads.get(leadId).lt_interest_status = status;
    },
    async getLead(leadId) {
      calls.push(['getLead', leadId]);
      return leads.get(leadId);
    },
  };
  return { client, leads, calls, blocklist };
}

test('client uses supported schema, fixed origin, bearer auth, and no send/delete methods', async () => {
  const requests = [];
  const client = createInstantlyClient({
    apiKey: 'test-key-not-a-secret',
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      return { ok: true, status: 200, json: async () => ({ items: [] }) };
    },
  });
  await client.listLeads({ contacts: [email], limit: 100, unknown: 'drop-me' });
  await client.setLeadInterest('lead-1', 2);
  await client.addBlocklistEmail(email.toUpperCase());
  await client.listEmails({ email_type: 'received', limit: 100 });
  await client.getWebhookEvent('event-1');
  assert.equal(requests[0].url, 'https://api.instantly.ai/api/v2/leads/list');
  assert.deepEqual(JSON.parse(requests[0].options.body), {
    limit: 100,
    contacts: [email],
  });
  assert.deepEqual(JSON.parse(requests[1].options.body), {
    lt_interest_status: 2,
  });
  assert.deepEqual(JSON.parse(requests[2].options.body), { bl_value: email });
  assert.equal(requests[3].options.method, 'GET');
  assert.match(requests[3].url, /mode=emode_all/);
  assert.match(requests[3].url, /latest_of_thread=false/);
  assert.equal(
    requests[4].url,
    'https://api.instantly.ai/api/v2/webhook-events/event-1',
  );
  assert.equal(requests[4].options.method, 'GET');
  assert.throws(() => client.getWebhookEvent('../emails'));
  for (const request of requests) {
    assert.equal(new URL(request.url).origin, 'https://api.instantly.ai');
    assert.equal(request.options.redirect, 'error');
    assert.equal(
      request.options.headers.Authorization,
      'Bearer test-key-not-a-secret',
    );
  }
  assert.equal(client.sendEmail, undefined);
  assert.equal(client.deleteLead, undefined);
  assert.equal(client.activateCampaign, undefined);
  assert.throws(() => client.setLeadInterest('lead-1', null));
  assert.throws(() => client.setLeadInterest('../emails', 2));
  assert.throws(() => client.addBlocklistEmail('example.test'));
});

test('API errors expose status and retry timing without provider body/PII', async () => {
  const client = createInstantlyClient({
    apiKey: 'test-key',
    fetchImpl: async () => ({
      ok: false,
      status: 429,
      headers: { get: () => '30' },
      json: async () => ({ message: 'private contact details' }),
    }),
  });
  await assert.rejects(client.listLeads(), (error) => {
    assert.ok(error instanceof InstantlyApiError);
    assert.equal(error.retryAfter, '30');
    assert.doesNotMatch(error.message, /private|test-key/);
    return true;
  });
});

test('contact matching requires exact normalized email across every page', async () => {
  const queries = [];
  const matches = await findInstantlyLeadsByEmail(
    {
      listLeads: async (options) => {
        queries.push(options);
        return options.starting_after
          ? {
              items: [
                fixtureLead({
                  id: 'lead-2',
                  email: email.toUpperCase(),
                  campaign: 'campaign-2',
                }),
              ],
            }
          : {
              items: [
                fixtureLead(),
                fixtureLead({ id: 'wrong', email: `other.${email}` }),
              ],
              next_starting_after: 'page-2',
            };
      },
    },
    email,
  );
  assert.deepEqual(
    matches.map((lead) => lead.id),
    ['lead-1', 'lead-2'],
  );
  assert.deepEqual(queries[0].contacts, [email]);
  assert.equal(queries[0].distinct_contacts, false);
});

test('booking, attendance and sale confirm suppression plus correct status across campaigns', async () => {
  for (const [lifecycle, desired] of [
    ['appointment_booked', 2],
    ['appointment_attended', 3],
    ['customer_won', 4],
  ]) {
    const fixture = fixtureClient([
      fixtureLead(),
      fixtureLead({ id: 'lead-2', campaign: 'campaign-2' }),
    ]);
    const result = await syncInstantlyLifecycle(fixture.client, {
      email,
      lifecycle,
    });
    assert.equal(result.sequenceStopVerified, true);
    assert.equal(result.verification, 'workspace_blocklist_readback');
    assert.equal(result.changes.length, 2);
    assert.ok(
      [...fixture.leads.values()].every(
        (lead) => lead.lt_interest_status === desired,
      ),
    );
    const names = fixture.calls.map((call) => call[0]);
    assert.ok(
      names.indexOf('addBlocklistEmail') < names.indexOf('setLeadInterest'),
    );
    assert.equal(names.filter((name) => name === 'getLead').length, 2);
  }
});

test('duplicate reverse delivery is a no-op after the first verified status and suppression', async () => {
  const fixture = fixtureClient();
  await syncInstantlyLifecycle(fixture.client, {
    email,
    lifecycle: 'appointment_booked',
  });
  fixture.calls.length = 0;
  const repeat = await syncInstantlyLifecycle(fixture.client, {
    email,
    lifecycle: 'appointment_booked',
  });
  assert.equal(repeat.mutated, false);
  assert.equal(repeat.sequenceStopVerified, true);
  assert.ok(
    !fixture.calls.some(([name]) =>
      ['setLeadInterest', 'addBlocklistEmail'].includes(name),
    ),
  );
});

test('historical lifecycle import performs zero API calls', async () => {
  const fixture = fixtureClient();
  assert.deepEqual(
    await syncInstantlyLifecycle(fixture.client, {
      email,
      lifecycle: 'customer_won',
      historical: true,
    }),
    { skipped: 'historical', mutated: false },
  );
  assert.equal(fixture.calls.length, 0);
});

test('Instantly echoes can enforce stop but cannot generate another status echo', async () => {
  const fixture = fixtureClient([fixtureLead({ lt_interest_status: 2 })]);
  const result = await syncInstantlyLifecycle(fixture.client, {
    email,
    lifecycle: 'appointment_booked',
    origin: 'instantly',
  });
  assert.equal(result.sequenceStopVerified, true);
  assert.ok(!fixture.calls.some(([name]) => name === 'setLeadInterest'));
});

test('unsubscribe enforces workspace blocklist without overwriting customer history', async () => {
  const fixture = fixtureClient([fixtureLead({ lt_interest_status: 4 })]);
  const result = await syncInstantlyLifecycle(fixture.client, {
    email,
    lifecycle: 'unsubscribed',
  });
  assert.equal(result.sequenceStopVerified, true);
  assert.equal(fixture.leads.get('lead-1').lt_interest_status, 4);
  assert.ok(!fixture.calls.some(([name]) => name === 'setLeadInterest'));
});

test('late booking cannot regress won or attended leads or alter unsubscribed/bounced records', async () => {
  const fixture = fixtureClient([
    fixtureLead({ lt_interest_status: 4 }),
    fixtureLead({ id: 'attended', lt_interest_status: 3 }),
    fixtureLead({ id: 'unsubscribed', status: -2 }),
    fixtureLead({ id: 'bounced', status: -1 }),
  ]);
  const result = await syncInstantlyLifecycle(fixture.client, {
    email,
    lifecycle: 'appointment_booked',
  });
  assert.deepEqual(result.changes, []);
  assert.ok(!fixture.calls.some(([name]) => name === 'setLeadInterest'));
  assert.equal(result.sequenceStopVerified, true);
});

test('existing domain suppression is respected and never deleted or replaced', async () => {
  const fixture = fixtureClient();
  fixture.blocklist.push({
    id: 'existing-domain',
    bl_value: 'example.test',
    is_domain: true,
  });
  const result = await syncInstantlyLifecycle(fixture.client, {
    email,
    lifecycle: 'unsubscribed',
  });
  assert.equal(result.suppression.blocklistId, 'existing-domain');
  assert.equal(result.mutated, false);
  assert.ok(!fixture.calls.some(([name]) => name === 'addBlocklistEmail'));
});

test('no exact lead match cannot create a prospect, activity, or outbound request', async () => {
  const fixture = fixtureClient([
    fixtureLead({ email: 'someone.else@example.test' }),
  ]);
  assert.deepEqual(
    await syncInstantlyLifecycle(fixture.client, {
      email,
      lifecycle: 'customer_won',
    }),
    { skipped: 'no_exact_match', mutated: false },
  );
  assert.deepEqual(
    fixture.calls.map(([name]) => name),
    ['listLeads'],
  );
});

test('a successful blocklist POST without read-back cannot pass sequence-stop verification', async () => {
  const fixture = fixtureClient();
  fixture.client.addBlocklistEmail = async () => ({ id: 'unconfirmed' });
  await assert.rejects(
    syncInstantlyLifecycle(fixture.client, {
      email,
      lifecycle: 'appointment_booked',
    }),
    /suppression was not confirmed/,
  );
  assert.ok(!fixture.calls.some(([name]) => name === 'setLeadInterest'));
});

test('uncertain suppression mutation is reconciled by read-back before any retry', async () => {
  const fixture = fixtureClient();
  fixture.client.addBlocklistEmail = async () => {
    fixture.blocklist.push({ id: 'block-uncertain', bl_value: email });
    throw new Error('Response lost');
  };
  const result = await syncInstantlyLifecycle(fixture.client, {
    email,
    lifecycle: 'appointment_booked',
  });
  assert.equal(result.sequenceStopVerified, true);
  assert.equal(result.suppression.blocklistId, 'block-uncertain');
});

test('unconfirmed lifecycle write fails without reporting a completed sync', async () => {
  const fixture = fixtureClient();
  fixture.client.setLeadInterest = async () => {};
  await assert.rejects(
    syncInstantlyLifecycle(fixture.client, {
      email,
      lifecycle: 'customer_won',
    }),
    /lifecycle status was not confirmed/,
  );
});

test('pagination refuses cyclic cursors and partial history due to a safety limit', async () => {
  const collect = async (iterator) => {
    for await (const page of iterator) assert.ok(Array.isArray(page));
  };
  await assert.rejects(
    collect(
      instantlyPages(async () => ({ items: [], next_starting_after: 'same' })),
    ),
    /repeated a cursor/,
  );
  await assert.rejects(
    collect(
      instantlyPages(
        async () => ({ items: [], next_starting_after: 'next' }),
        {},
        { maxPages: 1 },
      ),
    ),
    /limit reached/,
  );
});
