import { createHash, timingSafeEqual } from 'node:crypto';
import { createGhlOutreachClient } from './_lib/outreach-sync.js';
import { createInstantlyClient, findInstantlyLeadsByEmail, findInstantlySuppression } from './_lib/instantly-client.js';
import { normalizedEmail } from './_lib/instantly-events.js';
import { REQUESTED_VSL_CAMPAIGN, REQUESTED_VSL_TAG } from './_lib/requested-vsl-config.js';

const stoppedTags = ['demandflow-booked', 'drm-email-unsubscribed', 'drm-stop-cold-prospecting'];

/** One rep tag, existing authenticated relay, provider-side campaign deduplication.
 * Contact email/names come from GHL, not an untrusted webhook payload. Never
 * remove opt-outs or booking suppression to force a requested email through.
 */
export function createRequestedVslHandler({ env = process.env, fetchImpl = fetch } = {}) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') return res.status(405).json({ ok: false });
    const secret = env.DRM_GHL_LIFECYCLE_WEBHOOK_SECRET;
    const auth = req.headers?.authorization;
    if (typeof secret !== 'string' || secret.length < 32) return res.status(503).json({ ok: false, error: 'not_configured' });
    if (typeof auth !== 'string' || !auth.startsWith('Bearer ') || !timingSafeEqual(
      createHash('sha256').update(auth.slice(7)).digest(), createHash('sha256').update(secret).digest(),
    )) return res.status(401).json({ ok: false });
    let input;
    try {
      const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      if (!raw || Buffer.byteLength(raw) > 65536) throw new Error();
      const body = JSON.parse(raw);
      input = body.customData ?? body;
      if (!/^[A-Za-z0-9_-]{1,100}$/.test(input.contact_id ?? '')) throw new Error();
    } catch { return res.status(400).json({ ok: false, error: 'invalid_contact_reference' }); }
    if (env.VERCEL_ENV !== 'production' || env.ENABLE_INSTANTLY_GHL_SYNC !== 'true' ||
      !env.GHL_LOCATION_ID || !env.INSTANTLY_WORKSPACE_ID || !env.INSTANTLY_API_KEY ||
      !(env.GHL_OUTREACH_PIT || env.GHL_PIT)) return res.status(503).json({ ok: false, error: 'not_configured' });
    try {
      const ghl = createGhlOutreachClient({ token: env.GHL_OUTREACH_PIT || env.GHL_PIT, locationId: env.GHL_LOCATION_ID, fetchImpl });
      const contact = await ghl.getContact(input.contact_id);
      if (contact?.id !== input.contact_id || contact.locationId !== env.GHL_LOCATION_ID) return res.status(400).json({ ok: false, error: 'wrong_contact' });
      const email = normalizedEmail(contact.email);
      if (!email || !contact.tags?.includes(REQUESTED_VSL_TAG)) return res.status(400).json({ ok: false, error: 'email_or_request_tag_missing' });
      if (contact.dnd === true || contact.dndSettings?.Email?.status === 'active' || contact.dndSettings?.email?.status === 'active' ||
        stoppedTags.some(tag => contact.tags.includes(tag))) return res.status(200).json({ ok: true, skipped: 'booked_or_opted_out' });
      const instantly = createInstantlyClient({ apiKey: env.INSTANTLY_API_KEY, fetchImpl });
      if (await findInstantlySuppression(instantly, email)) return res.status(200).json({ ok: true, skipped: 'instantly_suppressed' });
      const existing = await findInstantlyLeadsByEmail(instantly, email);
      if (existing.some(lead => lead.campaign === REQUESTED_VSL_CAMPAIGN)) return res.status(200).json({ ok: true, duplicate: true });
      if (existing.some(lead => [-1, -2].includes(lead.status) || [2, 3, 4].includes(lead.lt_interest_status)))
        return res.status(200).json({ ok: true, skipped: 'existing_stop_status' });
      const campaign = await instantly.getCampaign(REQUESTED_VSL_CAMPAIGN);
      if (campaign.organization !== env.INSTANTLY_WORKSPACE_ID) throw new Error();
      if (input.validate === true || input.validate === 'true') return res.status(200).json({ ok: true, dryRun: true, mutations: 0 });
      const response = await fetchImpl('https://api.instantly.ai/api/v2/leads', {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000),
        headers: { Authorization: `Bearer ${env.INSTANTLY_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaign: REQUESTED_VSL_CAMPAIGN, email,
          first_name: contact.firstName || '', last_name: contact.lastName || '', skip_if_in_campaign: true }),
      });
      if (!response.ok) throw new Error();
      const confirmed = await findInstantlyLeadsByEmail(instantly, email);
      if (!confirmed.some(lead => lead.campaign === REQUESTED_VSL_CAMPAIGN && lead.organization === env.INSTANTLY_WORKSPACE_ID)) throw new Error();
      return res.status(200).json({ ok: true, enrolled: true });
    } catch { return res.status(502).json({ ok: false, error: 'handoff_failed_retry' }); }
  };
}
export default createRequestedVslHandler();
