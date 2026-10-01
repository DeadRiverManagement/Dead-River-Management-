import { createHash, timingSafeEqual } from 'node:crypto';
import { GOOGLE_PAYMENT_DESTINATION, getGooglePaymentAccessToken } from './_lib/google-payment-conversions.js';

// Authenticated, fixed-destination diagnostics. This endpoint cannot upload a
// conversion: callers cannot supply events or override validateOnly.
export function createGoogleConversionCheck({ env = process.env,
  getAccessToken = getGooglePaymentAccessToken, fetchImpl = fetch, now = Date.now } = {}) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ ok: false, error: 'method_not_allowed' });
    }
    const secret = env.DRM_GHL_LIFECYCLE_WEBHOOK_SECRET;
    if (env.VERCEL_ENV !== 'production' || typeof secret !== 'string' || secret.length < 32)
      return res.status(503).json({ ok: false, error: 'check_not_configured' });
    const authorization = req.headers?.authorization;
    if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ') || !timingSafeEqual(
      createHash('sha256').update(authorization.slice(7)).digest(), createHash('sha256').update(secret).digest()))
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    let body;
    try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; } catch {}
    if (!body || Object.keys(body).length !== 1 || body.validateOnly !== true)
      return res.status(400).json({ ok: false, error: 'validation_only_required' });
    let token;
    try { token = await getAccessToken(); }
    catch { return res.status(502).json({ ok: false, error: 'google_auth_failed', conversions: 0 }); }
    try {
      const response = await fetchImpl('https://datamanager.googleapis.com/v1/events:ingest', {
        method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000),
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json',
          'x-goog-user-project': 'dead-river-os' },
        body: JSON.stringify({ validateOnly: true, destinations: [GOOGLE_PAYMENT_DESTINATION],
          events: [{ transactionId: 'drm_validation_only_no_payment', eventTimestamp: new Date(now() - 60000).toISOString(),
            eventSource: 'OTHER', adIdentifiers: { gclid: 'drm_validation_only_not_a_real_click' } }] }),
      });
      const result = await response.json();
      // Never return provider errors wholesale: they may echo request data.
      const status = String(result?.error?.status || '').replace(/[^A-Z_]/g, '').slice(0, 80);
      return res.status(response.ok && !result?.error ? 200 : 502).json({
        ok: response.ok && !result?.error, authenticated: true, validateOnly: true,
        providerStatus: response.status, ...(status ? { providerError: status } : {}),
        warningCount: Array.isArray(result.fieldWarnings) ? result.fieldWarnings.length : 0,
        mutations: 0, conversions: 0,
      });
    } catch { return res.status(502).json({ ok: false, error: 'google_validation_unavailable', conversions: 0 }); }
  };
}
export default createGoogleConversionCheck();
