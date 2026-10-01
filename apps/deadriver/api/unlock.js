// Vercel Serverless Function — preview-only walkthrough unlock.
//
// Production access must always follow the real conversion path:
// /dead-river-complete -> successful form submission -> /watch.
//
// Preview deployments cannot safely submit the form because they may share
// production GoHighLevel and advertising configuration. For real-device media
// checks, a token stored only in Vercel's Preview environment may set the same
// cookie without creating a lead or firing the conversion event.

const PREVIEW_UNLOCK_KEY = process.env.PREVIEW_UNLOCK_KEY;
const WATCH_COOKIE_MAX_AGE = 60 * 60 * 24 * 180; // Same as api/lead.js
const DESTINATION = '/watch';
const FALLBACK = '/dead-river-complete#get-video';

export default function handler(req, res) {
  if (process.env.VERCEL_ENV === "preview") return res.status(409).json({ error: "Legacy production integrations are disabled in this preview." });
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  res.setHeader('Cache-Control', 'no-store');

  const isPreview = process.env.VERCEL_ENV === 'preview';
  const suppliedKey = req.query?.k;
  const validPreviewKey =
    isPreview &&
    typeof PREVIEW_UNLOCK_KEY === 'string' &&
    PREVIEW_UNLOCK_KEY.length >= 16 &&
    suppliedKey === PREVIEW_UNLOCK_KEY;

  // Never set the walkthrough cookie in production. Missing preview
  // configuration and invalid tokens fail closed to the real lead form.
  if (!validPreviewKey) {
    return res.redirect(307, FALLBACK);
  }

  res.setHeader(
    'Set-Cookie',
    `drm_watch=1; Path=/; Max-Age=${WATCH_COOKIE_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`
  );
  return res.redirect(307, DESTINATION);
}
