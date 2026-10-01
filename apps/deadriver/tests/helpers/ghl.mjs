// Stateful API double: no network requests and no real contact data.
export function ghlMock({ contact = null, scenario = '' } = {}) {
  const state = { contact: structuredClone(contact), calls: [], notes: [] };
  const reply = (body, ok = true, status = 200) => ({
    ok,
    status,
    json: async () => structuredClone(body),
  });
  state.fetch = async (address, options = {}) => {
    const url = new URL(address),
      body = options.body ? JSON.parse(options.body) : null;
    const method = options.method || 'GET';
    state.calls.push({
      url: String(address),
      path: url.pathname,
      method,
      body,
    });
    if (scenario === 'crm-rejected') return reply({}, false, 500);
    if (url.pathname === '/contacts/search/duplicate') {
      const email = url.searchParams.get('email'),
        phone = url.searchParams.get('number');
      return reply({
        contact:
          state.contact &&
          ((email && state.contact.email === email) ||
            (phone && state.contact.phone === phone))
            ? state.contact
            : null,
      });
    }
    if (url.pathname === '/contacts/upsert') {
      if (scenario === 'no-id') return reply({});
      state.contact = { id: 'contact-1', ...body, customFields: [], tags: [] };
      return reply({ contact: state.contact, new: true });
    }
    if (url.pathname.endsWith('/tags')) {
      if (scenario === 'tag-rejected') return reply({}, false, 502);
      if (scenario === 'tag-missing') return reply({ tags: ['other'] });
      state.contact.tags = [
        ...new Set([...(state.contact.tags || []), ...body.tags]),
      ];
      return reply({ tags: state.contact.tags });
    }
    if (url.pathname.endsWith('/notes')) {
      state.notes.push(body.body);
      return reply({ note: { id: 'test-note' } });
    }
    if (url.pathname === '/contacts/contact-1') {
      if (method === 'PUT') {
        if (body.customFields && scenario === 'fields-rejected')
          return reply({}, false, 400);
        const { customFields, ...basic } = body;
        Object.assign(state.contact, basic);
        if (customFields && scenario !== 'fields-not-persisted') {
          const values = new Map(
            (state.contact.customFields || []).map((field) => [
              field.id,
              field.value,
            ]),
          );
          customFields.forEach(({ id, fieldValue }) =>
            values.set(id, fieldValue),
          );
          state.contact.customFields = [...values].map(([id, value]) => ({
            id,
            value,
          }));
        }
      }
      return reply({ contact: state.contact });
    }
    if (url.hostname === 'example.com') return reply({ ok: true });
    throw new Error(`Unexpected test API request: ${method} ${url.pathname}`);
  };
  return state;
}
