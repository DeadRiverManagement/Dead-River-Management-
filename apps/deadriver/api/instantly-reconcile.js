import { verifyInstantlyWebhookSecret } from './_lib/instantly-events.js';
import {
  readOutreachConfig,
  createOutreachDependencies,
} from './_lib/outreach-sync.js';
import { recoverInstantlyDeliveries } from './_lib/instantly-recovery.js';

export const config = { maxDuration: 300 };

export function createInstantlyReconciliationHandler({
  env = process.env,
  dependenciesFactory = createOutreachDependencies,
  recover = recoverInstantlyDeliveries,
} = {}) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'GET')
      return res.status(405).json({ ok: false, error: 'method_not_allowed' });
    const supplied = req.headers?.authorization;
    if (
      typeof supplied !== 'string' ||
      !supplied.startsWith('Bearer ') ||
      !verifyInstantlyWebhookSecret(supplied.slice(7), env.CRON_SECRET)
    )
      return res.status(401).json({ ok: false, error: 'unauthorized' });
    if (env.ENABLE_INSTANTLY_RECOVERY !== 'true')
      return res.status(503).json({ ok: false, error: 'recovery_not_enabled' });
    try {
      const settings = readOutreachConfig(env);
      const result = await recover(settings, dependenciesFactory(settings), {
        activatedAt: env.INSTANTLY_LIVE_ACTIVATED_AT,
      });
      return res
        .status(result.failed || result.incomplete ? 503 : 200)
        .json({ ok: !result.failed && !result.incomplete, ...result });
    } catch {
      return res.status(503).json({ ok: false, error: 'recovery_incomplete' });
    }
  };
}
export default createInstantlyReconciliationHandler();
