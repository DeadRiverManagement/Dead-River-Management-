import {
  normalizeInstantlyEvent,
  verifyInstantlyWebhookSecret,
} from './_lib/instantly-events.js';
import {
  OutreachSyncError,
  readOutreachConfig,
  validateOutreachAccount,
  createOutreachDependencies,
  processInstantlyOutreach,
} from './_lib/outreach-sync.js';

const MAX_BODY_BYTES = 192 * 1024;

/**
 * GHL Inbound Webhook -> configured Custom Webhook action -> this endpoint.
 * Headers: Authorization: Bearer <DRM_OUTREACH_WEBHOOK_SECRET>
 * JSON: { mode: "live" | "historical" | "validate", payload: <original event> }
 * Validation additionally requires test:true and NEVER performs network I/O.
 * Native Instantly has no documented payload HMAC; the GHL URL is a credential
 * and must stay secret. This receiver authenticates the configured GHL forwarder.
 */
export function createInstantlyWebhookHandler({
  env = process.env,
  dependenciesFactory = createOutreachDependencies,
} = {}) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json({ ok: false, error: 'method_not_allowed' });
    }
    const secret = env.DRM_OUTREACH_WEBHOOK_SECRET;
    if (typeof secret !== 'string' || secret.length < 32)
      return res
        .status(503)
        .json({ ok: false, error: 'receiver_not_configured' });
    const authorization = req.headers?.authorization;
    if (
      typeof authorization !== 'string' ||
      !authorization.startsWith('Bearer ') ||
      !verifyInstantlyWebhookSecret(authorization.slice(7), secret)
    ) {
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    }
    let body;
    try {
      const serialized =
        typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      if (!serialized || Buffer.byteLength(serialized) > MAX_BODY_BYTES)
        throw new Error();
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      if (
        !body ||
        typeof body !== 'object' ||
        Array.isArray(body) ||
        !['live', 'historical', 'validate'].includes(body.mode) ||
        !body.payload ||
        typeof body.payload !== 'object' ||
        Array.isArray(body.payload)
      )
        throw new Error();
    } catch {
      return res.status(400).json({ ok: false, error: 'invalid_envelope' });
    }
    const validation = body.mode === 'validate';
    if (validation && body.test !== true)
      return res
        .status(400)
        .json({ ok: false, error: 'validation_requires_test_flag' });
    let event;
    let config;
    try {
      let customLabels = [];
      try {
        customLabels = JSON.parse(env.INSTANTLY_CUSTOM_LABELS || '[]');
      } catch {
        throw new OutreachSyncError('CONFIG_CUSTOM_LABELS');
      }
      if (!Array.isArray(customLabels))
        throw new OutreachSyncError('CONFIG_CUSTOM_LABELS');
      event = normalizeInstantlyEvent(body.payload, {
        historical: body.mode === 'historical',
        customLabels,
      });
      if (validation) {
        // Return schema/category only: no emails, reply text, campaign names or IDs.
        return res.status(200).json({
          ok: true,
          test: true,
          dryRun: true,
          category: event.category,
          scope: event.scope,
          mutations: 0,
          conversions: 0,
        });
      }
      config = readOutreachConfig(env, { historical: event.historical });
      validateOutreachAccount(event, config);
    } catch (error) {
      const invalid =
        error instanceof TypeError ||
        [
          'WRONG_INSTANTLY_WORKSPACE',
          'CONTACT_EVENT_MISSING_CAMPAIGN',
          'INSTANTLY_CAMPAIGN_NOT_ALLOWED',
        ].includes(error.code);
      return res.status(invalid ? 400 : 503).json({
        ok: false,
        error: invalid ? 'invalid_or_unmapped_event' : 'receiver_not_ready',
      });
    }
    try {
      const result = await processInstantlyOutreach(
        event,
        config,
        dependenciesFactory(config),
      );
      return res.status(200).json({ ok: true, ...result });
    } catch {
      // Signal an incomplete effect to the configured GHL forwarding error path.
      // Instantly has already received GHL's initial response; this downstream
      // failure needs an explicitly verified GHL retry/reconciliation mechanism.
      // Never log upstream payloads, contact emails, reply bodies or credentials.
      return res
        .status(502)
        .json({ ok: false, error: 'sync_incomplete_retry' });
    }
  };
}

export default createInstantlyWebhookHandler();
