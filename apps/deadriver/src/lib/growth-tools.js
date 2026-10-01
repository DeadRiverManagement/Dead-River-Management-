export const checklists = {
  response: [
    'Every new inquiry has one person responsible for it.',
    'During business hours, new inquiries get a real reply within 15 minutes.',
    'A missed call automatically gets a text back.',
    'After-hours inquiries get a clear next step, not silence.',
    'We track how fast we reply and review the leads we lost.',
  ],
  readiness: [
    'We know which service and which customers we want more of.',
    'People already buy from us, and we make money on each job or order.',
    'Leads or orders are tracked in one place.',
    'We could handle more customers next month.',
    'One decision-maker owns the plan and the budget.',
  ],
  conversion: [
    'Visitors can tell what we offer without scrolling.',
    'There is one obvious next step, such as call or book.',
    'Forms and booking work well on a phone.',
    'Real reviews or results back up the offer, with no exaggerated claims.',
    'We count every call, form, and purchase the site produces.',
  ],
  seo: [
    'Each important page has its own clear title and description.',
    'Google can find and list our important pages.',
    'Headings say what each section is about, and images have descriptions.',
    'Pages load fast on a phone and have no broken links.',
    'Our name, address, phone, and links are consistent across the site.',
  ],
};
export const numericTools = {
  roi: {
    fields: [
      [
        'spend',
        'Total campaign cost, including ad spend ($)',
        2500,
        0.01,
        100000000,
      ],
      ['revenue', 'Revenue from the campaign ($)', 12000, 0, 1000000000],
      ['margin', 'Gross margin (%)', 60, 0, 100],
    ],
    method:
      'Gross profit is the revenue from the campaign times your gross margin. Campaign profit is gross profit minus everything the campaign cost. Return is campaign profit divided by campaign cost. Include ad spend, management fees, and creative in the cost.',
  },
  cac: {
    fields: [
      [
        'cost',
        'Marketing and sales spend in the period ($)',
        4500,
        0,
        100000000,
      ],
      ['customers', 'New customers in the same period', 30, 1, 10000000],
    ],
    method:
      'Cost per new customer is everything you spent on marketing and sales in the period divided by the number of new customers in the same period. It is an average across all channels, not what a customer is worth over time.',
  },
  revenue: {
    fields: [
      ['goal', 'New revenue goal ($)', 20000, 1, 1000000000],
      ['value', 'What an average customer is worth ($)', 1000, 0.01, 100000000],
      ['close', 'Close rate: leads that become customers (%)', 20, 0.01, 100],
    ],
    method:
      'Customers needed is your revenue goal divided by what an average customer is worth, rounded up. Leads needed is customers divided by your close rate, rounded up.',
  },
  budget: {
    fields: [
      ['customers', 'Target new customers', 15, 1, 10000000],
      ['close', 'Close rate: leads that become customers (%)', 20, 0.01, 100],
      ['cpl', 'Expected cost per lead ($)', 35, 0.01, 1000000],
    ],
    method:
      'Leads needed is your customer goal divided by your close rate, rounded up. Estimated ad budget is leads times your cost per lead. This is ad spend only; it does not include management, setup, or creative.',
  },
};
const money = (n) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(n);
export function calculate(type, values) {
  const cfg = numericTools[type];
  if (!cfg) throw new Error('Unknown calculator.');
  const v = {};
  for (const [key, label, , min, max] of cfg.fields) {
    const raw = values[key];
    if (raw === '' || raw == null)
      throw new Error('Enter ' + label.toLowerCase() + '.');
    const n = Number(raw);
    if (!Number.isFinite(n) || n < min || n > max)
      throw new Error(label + ' must be between ' + min + ' and ' + max + '.');
    if (key === 'customers' && !Number.isInteger(n))
      throw new Error('Enter a whole number of customers.');
    v[key] = n;
  }
  if (type === 'roi') {
    const gross = (v.revenue * v.margin) / 100,
      net = gross - v.spend;
    return {
      value: ((net / v.spend) * 100).toFixed(1) + '%',
      label: 'Return on the campaign',
      rows: [
        ['Gross profit from the campaign', money(gross)],
        ['Profit after campaign costs', money(net)],
        ['Total campaign cost', money(v.spend)],
      ],
    };
  }
  if (type === 'cac')
    return {
      value: money(v.cost / v.customers),
      label: 'Cost per new customer',
      rows: [
        ['Marketing and sales spend', money(v.cost)],
        ['New customers', String(v.customers)],
      ],
    };
  if (type === 'revenue') {
    const customers = Math.ceil(v.goal / v.value),
      leads = Math.ceil(customers / (v.close / 100));
    return {
      value: leads.toLocaleString('en-US'),
      label: 'Leads you need',
      rows: [
        ['Customers needed', String(customers)],
        ['Revenue goal', money(v.goal)],
      ],
    };
  }
  const leads = Math.ceil(v.customers / (v.close / 100));
  return {
    value: money(leads * v.cpl),
    label: 'Estimated ad budget',
    rows: [
      ['Leads needed', String(leads)],
      ['Target new customers', String(v.customers)],
    ],
  };
}
export function scoreChecklist(type, checks) {
  const list = checklists[type];
  if (!list) throw new Error('Unknown checkup.');
  const count = list.filter((_, i) => checks.includes(String(i))).length;
  return {
    score: Math.round((count / list.length) * 100),
    count,
    total: list.length,
    gaps: list.filter((_, i) => !checks.includes(String(i))),
  };
}
export function campaignUrl(input, source, medium, campaign) {
  const url = new URL(input);
  if (
    !['https:', 'http:'].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error('Use a normal web address that starts with http or https.');
  for (const [k, v] of [
    ['utm_source', source],
    ['utm_medium', medium],
    ['utm_campaign', campaign],
  ]) {
    if (!v?.trim())
      throw new Error(
        'Fill in where the link goes, the type, and the campaign name.',
      );
    url.searchParams.set(k, v.trim());
  }
  return url.toString();
}
export const dimensions = [
  {
    key: 'acquisition',
    name: 'Acquisition',
    questions: [
      ['demand', 'We have a reliable way to reach new customers every month.'],
      [
        'economics',
        'We know what a new customer costs us and what we can afford to pay.',
      ],
    ],
    recommendation:
      'Pick one type of customer and one place to advertise. Learn what a lead costs you today so you know what to improve.',
  },
  {
    key: 'conversion',
    name: 'Conversion',
    questions: [
      [
        'journey',
        'Our website gives visitors a clear next step, such as call or book.',
      ],
      [
        'tracking',
        'We can tell which ad or search brought us each lead or sale.',
      ],
    ],
    recommendation:
      'Fix the page people land on and the tracking first. Make the next step obvious and make sure every call and form is counted.',
  },
  {
    key: 'followup',
    name: 'Follow-up',
    questions: [
      [
        'response',
        'Every new inquiry has one person responsible and gets a fast reply.',
      ],
      [
        'pipeline',
        'Open leads and estimates are tracked and followed up every time.',
      ],
    ],
    recommendation:
      'Give every lead an owner, keep them in one list, and set up automatic follow-up texts and emails.',
  },
  {
    key: 'retention',
    name: 'Retention',
    questions: [
      [
        'repeat',
        'We have a plan for repeat orders, repeat jobs, or referrals.',
      ],
      [
        'reactivation',
        'We reach back out to past customers, with their permission.',
      ],
    ],
    recommendation:
      'Start with one simple campaign to bring past customers back before adding anything more.',
  },
  {
    key: 'strategy',
    name: 'Strategy',
    questions: [
      [
        'goals',
        'We have a specific growth goal and room to take on more customers.',
      ],
      [
        'review',
        'We look at the numbers every month and use them to decide what to do next.',
      ],
    ],
    recommendation:
      'Set one revenue goal, decide how many customers you can handle and what you can spend, and review the numbers monthly.',
  },
];
export function growthSummary(data) {
  const optimization = {
    acquisition:
      'Compare what each ad platform brings in, and add a new one only when the current numbers support it.',
    conversion:
      'Test small changes to your best-performing pages and keep the ones that measurably help.',
    followup:
      'Look at how fast leads are handed off and where good leads still stall, then fix those spots.',
    retention:
      'Group customers more precisely, time your messages better, and measure repeat revenue against a baseline.',
    strategy:
      'Use your monthly review to decide the next thing to fix, when to add capacity, and where to invest.',
  };
  const scores = dimensions.map((d) => ({
    ...d,
    score: Math.round(
      (d.questions.reduce((sum, [key]) => {
        const n = Number(data[key]);
        if (data[key] == null || data[key] === '' || ![0, 1, 2].includes(n))
          throw new Error('Please answer every question.');
        return sum + n;
      }, 0) /
        4) *
        100,
    ),
  }));
  const total = Math.round(scores.reduce((s, d) => s + d.score, 0) / 5);
  const infrastructure =
    scores.find((d) => d.key === 'conversion').score < 50 ||
    scores.find((d) => d.key === 'followup').score < 50;
  const recommended =
    data.channels === '0' || infrastructure || total < 45
      ? 'Foundation'
      : total >= 80 && data.channels === '2'
        ? 'Scale'
        : 'Growth Partner';
  const reviewReady = ['decision', 'access', 'traction', 'capacity'].every(
    (k) => data[k] === 'yes',
  );
  return {
    total,
    recommended,
    reviewReady,
    scores,
    priorities: [...scores]
      .sort((a, b) => a.score - b.score)
      .slice(0, 3)
      .map((d) => ({
        ...d,
        recommendation: d.score >= 75 ? optimization[d.key] : d.recommendation,
      })),
    strengths: scores.filter((d) => d.score >= 75).map((d) => d.name),
  };
}
