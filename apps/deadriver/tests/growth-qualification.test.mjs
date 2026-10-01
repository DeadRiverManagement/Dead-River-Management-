import test from 'node:test';
import assert from 'node:assert/strict';
import {
  qualificationContext,
  qualifyProspect,
  sanitizeSignals,
} from '../src/lib/growth-qualification.js';
import { validateLead } from '../api/growth-lead.js';
import { dimensions } from '../src/lib/growth-tools.js';
const answers = {
  ...Object.fromEntries(
    dimensions.flatMap((d) => d.questions.map(([k]) => [k, '2'])),
  ),
  stage: 'established',
  channels: '1',
  revenueRange: '25-50k',
  budgetRange: '5-10k',
  teamSize: '2-5',
  currentAcquisition: 'mixed',
  currentSystems: 'connected',
  timeline: 'now',
  challenge: 'demand',
  businessGoal: 'Build a consistent pipeline.',
  decision: 'yes',
  access: 'yes',
  traction: 'yes',
  capacity: 'yes',
};
test('qualification requires business context and rejects tampered options', () => {
  assert.equal(qualificationContext(answers).timeline, 'now');
  assert.throws(() =>
    qualificationContext({ ...answers, timeline: 'yesterday' }),
  );
  assert.throws(() =>
    qualificationContext({ ...answers, businessGoal: 'x'.repeat(801) }),
  );
});
test('sales prioritization combines readiness, budget, timing and bounded activity', () => {
  const summary = { recommended: 'Growth Partner', reviewReady: true };
  const high = qualifyProspect(summary, answers, 'home-services', {
    consented: true,
    pricing: 2,
    video: 1,
  });
  assert.equal(high.notifyCloser, true);
  assert.equal(high.priority, 'priority-review');
  const low = qualifyProspect(
    summary,
    { ...answers, budgetRange: 'under-1k', timeline: 'research' },
    'home-services',
    { consented: true, pricing: 999, video: 999, tools: 999 },
  );
  assert.equal(low.notifyCloser, false);
  assert.ok(low.score <= 100);
  const noAccess = qualifyProspect(
    { ...summary, reviewReady: false },
    answers,
    'home-services',
    { consented: true, pricing: 3, tools: 3, resources: 3, video: 3 },
  );
  assert.equal(noAccess.notifyCloser, false);
});
test('activity has no contribution without consent and is sanitized', () => {
  assert.equal(sanitizeSignals({ pricing: 99 }).pricing, 0);
  assert.equal(
    sanitizeSignals({ consented: true, pricing: 99, video: -2, tools: 'nan' })
      .pricing,
    3,
  );
  assert.equal(sanitizeSignals({ consented: true, video: -2 }).video, 0);
});
test('lead server computes priority and strips client routing overrides', () => {
  const base = {
    kind: 'growth-plan',
    name: 'Preview Test',
    email: 'preview@example.com',
    company: 'Example Company',
    phone: '+1 (555) 010-1234',
    industry: 'home-services',
    consent: true,
    answers,
    priority: 'admin',
    notifyCloser: false,
  };
  const lead = validateLead(base);
  assert.equal(lead.qualification.priority, 'priority-review');
  assert.equal(lead.qualification.notifyCloser, true);
  assert.equal(lead.phone, base.phone);
  assert.equal(lead.context.businessGoal, answers.businessGoal);
  assert.equal(lead.consent.smsMarketing, false);
  assert.throws(() => validateLead({ ...base, phone: '<script>' }));
});
