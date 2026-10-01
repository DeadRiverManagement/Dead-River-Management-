export const qualificationOptions = {
  revenueRange: [
    ['under-10k', 'Under $10,000'],
    ['10-25k', '$10,000–$24,999'],
    ['25-50k', '$25,000–$49,999'],
    ['50-100k', '$50,000–$99,999'],
    ['100k-plus', '$100,000+'],
    ['prefer-not', 'I’d rather discuss it'],
  ],
  budgetRange: [
    ['under-1k', 'Under $1,000'],
    ['1-2.5k', '$1,000–$2,499'],
    ['2.5-5k', '$2,500–$4,999'],
    ['5-10k', '$5,000–$9,999'],
    ['10k-plus', '$10,000+'],
    ['unsure', 'Not sure yet'],
  ],
  teamSize: [
    ['solo', 'Just me'],
    ['2-5', '2–5 people'],
    ['6-20', '6–20 people'],
    ['21-50', '21–50 people'],
    ['51-plus', '51+ people'],
  ],
  currentAcquisition: [
    ['referrals', 'Word of mouth and repeat customers'],
    ['organic', 'Google search, without ads'],
    ['paid', 'Paid ads'],
    ['outbound', 'Cold calls or outreach'],
    ['mixed', 'A mix of these'],
    ['none', 'No steady source yet'],
  ],
  currentSystems: [
    ['connected', 'A CRM or store with reporting, all connected'],
    ['partial', 'Some tools, not all connected'],
    ['manual', 'Spreadsheets and memory'],
    ['unsure', 'Not sure'],
  ],
  timeline: [
    ['now', 'Within 30 days'],
    ['quarter', 'Within 1–3 months'],
    ['later', 'More than 3 months away'],
    ['research', 'Just looking for now'],
  ],
  challenge: [
    ['demand', 'Not enough of the right leads'],
    ['conversion', 'Leads come in but do not turn into sales'],
    ['followup', 'Follow-up and booking fall through the cracks'],
    ['retention', 'Not enough repeat business'],
    ['measurement', 'I cannot tell what is working'],
  ],
};
export function qualificationContext(answers) {
  const context = {};
  for (const [key, options] of Object.entries(qualificationOptions)) {
    if (!options.some(([value]) => value === answers[key]))
      throw new Error(
        'Complete the ' +
          key.replace(/[A-Z]/g, (c) => ' ' + c.toLowerCase()) +
          ' field.',
      );
    context[key] = answers[key];
  }
  if (
    typeof answers.businessGoal !== 'string' ||
    !answers.businessGoal.trim() ||
    answers.businessGoal.length > 800
  )
    throw new Error('Tell us your main goal in 800 characters or fewer.');
  context.businessGoal = answers.businessGoal.trim();
  return context;
}
export function sanitizeSignals(signals = {}) {
  const clean = {
    consented: signals?.consented === true,
    pricing: 0,
    tools: 0,
    resources: 0,
    industry: 0,
    video: 0,
  };
  if (clean.consented)
    for (const key of ['pricing', 'tools', 'resources', 'industry', 'video']) {
      const n = Number(signals[key]);
      clean[key] = Number.isFinite(n)
        ? Math.min(3, Math.max(0, Math.floor(n)))
        : 0;
    }
  return clean;
}
export function qualifyProspect(summary, answers, industry, rawSignals) {
  const signals = sanitizeSignals(rawSignals);
  const [low, high] = {
    'under-1k': [0, 999],
    '1-2.5k': [1000, 2499],
    '2.5-5k': [2500, 4999],
    '5-10k': [5000, 9999],
    '10k-plus': [10000, Infinity],
    unsure: [0, 0],
  }[answers.budgetRange] || [0, 0];
  const fee = { Foundation: 997, 'Growth Partner': 2497, Scale: 4497 }[
    summary.recommended
  ];
  const budgetScore = low >= fee ? 20 : high >= fee ? 10 : 0;
  const timelineScore =
    answers.timeline === 'now' ? 20 : answers.timeline === 'quarter' ? 12 : 0;
  const supported = [
    'home-services',
    'med-spas',
    'dental',
    'real-estate',
    'ecommerce',
  ].includes(industry);
  const components = {
    assessment: summary.reviewReady ? 25 : 10,
    budget: budgetScore,
    timeline: timelineScore,
    industry: supported ? 10 : 5,
    activity: Math.min(
      25,
      signals.pricing * 5 +
        signals.tools * 3 +
        signals.resources * 2 +
        signals.industry * 2 +
        signals.video * 4,
    ),
  };
  const score = Object.values(components).reduce((a, b) => a + b, 0);
  const highIntent =
    summary.reviewReady && budgetScore > 0 && timelineScore > 0 && score >= 65;
  return {
    score,
    priority: highIntent ? 'priority-review' : 'standard-review',
    notifyCloser: highIntent,
    components,
    signals,
    budgetFit:
      budgetScore === 20
        ? 'service-fee-supported'
        : budgetScore === 10
          ? 'scope-discussion'
          : 'budget-discussion',
    note: 'Based on self-reported answers. Used only to decide who follows up first; ad budget and setup are confirmed on a call.',
  };
}
