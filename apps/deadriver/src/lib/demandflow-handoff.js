// Only this campaign's confirmed intake response may open its booking step.
export const DEMANDFLOW_BOOKING_PATH = '/demandflow/book';
export const DEMANDFLOW_CALENDAR_URL =
  'https://api.leadconnectorhq.com/widget/booking/rfaj3m31onqPQEFYhwyE';
export const DEMANDFLOW_ROUTE = 'demandflow-home-services';

const budgetLabels = {
  'under-2500': 'Under $2,500',
  '2500-5000': '$2,500–$5,000',
  '5000-10000': '$5,000–$10,000',
  '10000-plus': '$10,000+',
};
const bookVerticals = ['dental', 'real-estate', 'ecommerce', 'med-spas'];

export function industryFromBookPath(pathname) {
  const path = String(pathname || '').replace(/\/$/, '') || '/';
  const match = /^\/book\/(dental|med-spas|real-estate|ecommerce|home-services)$/.exec(path);
  return match ? match[1] : null;
}

export function isBookApplicationPath(pathname) {
  const path = String(pathname || '').replace(/\/$/, '') || '/';
  return path === '/book' || industryFromBookPath(path) != null;
}
const attributionKeys = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
];

// Do not append context to the visible input: retries must be idempotent.
// The existing server validates these values again and controls CRM tags.
export function buildDemandFlowPayload(values, search = '', source = '/demandflow') {
  const text = (key, limit) =>
    typeof values[key] === 'string' ? values[key].trim().slice(0, limit) : '';
  const goals = text('message', 500);
  const service = text('serviceType', 160);
  const area = text('serviceArea', 160);
  const budget = text('adBudget', 80);
  const params = new URLSearchParams(typeof search === 'string' ? search : '');
  const attribution = {};
  for (const key of attributionKeys) {
    const value = params.get(key);
    if (value) attribution[key] = value.replace(/[\r\n\t]/g, ' ').slice(0, 160);
  }
  return {
    name: text('name', 120),
    company: text('company', 160),
    email: text('email', 200),
    phone: text('phone', 40),
    fax: text('fax', 200),
    // The four-field intake leaves goals empty. Preserve optional context
    // from older cached forms without inventing qualification answers.
    message: goals ? [
      goals,
      service ? `Home service type: ${service}` : '',
      area ? `Service area: ${area}` : '',
      budget ? `Approx. monthly ad budget: ${budgetLabels[budget] || budget}` : '',
    ].filter(Boolean).join('\n\n') : '',
    consent: values.consent === 'on' || values.consent === true,
    industry: bookIndustry(values, source),
    interest: 'scale',
    kind: 'demandflow',
    source: isBookApplicationPath(source) ? '/book' : '/demandflow',
    attribution: sanitizeAttribution(search) || attribution,
  };
}

function bookIndustry(values, source) {
  if (!isBookApplicationPath(source)) return 'home-services';
  const fromPath = industryFromBookPath(source);
  if (fromPath) return fromPath;
  return bookVerticals.includes(values.industry) ? values.industry : 'home-services';
}

export function canOpenDemandFlowCalendar(result, industry = 'home-services') {
  const route = ['dental', 'real-estate', 'ecommerce', 'med-spas'].includes(industry)
    ? industry + '-growth-strategist' : DEMANDFLOW_ROUTE;
  return result?.ok === true &&
    result.route === route &&
    (result.preview === false || result.preview === true);
}
import { sanitizeAttribution } from './attribution.js';
