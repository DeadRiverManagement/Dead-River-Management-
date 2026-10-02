// Turns plain prose (FAQ answers, data-file paragraphs) into HTML with one
// link per known phrase: Demand Intelligence to its page, the guarantee to the
// booking page, each service to its service page. First mention only, never
// a link to the page you are already on. Text is escaped first, so this is
// safe on data strings; it is not meant for untrusted input.
const PHRASES: [RegExp, string][] = [
  [/Demand Intelligence/g, '/demand-intelligence'],
  [/Demand Flow guarantee|Demand Flow system|Demand Flow|written new-revenue guarantee|revenue guarantee|the guarantee|our guarantee/g, '/book'],
  [/AI search optimization|answer engine optimization|generative engine optimization/g, '/services/ai-search-optimization'],
  [/Google Local Services Ads|Local Services Ads/g, '/services/google-local-services-ads'],
  [/Google Ads/g, '/services/google-ads'],
  [/Facebook ads|Facebook and Instagram ads|Meta ads/g, '/services/facebook-ads'],
  [/local SEO|Local SEO/g, '/services/local-seo'],
  [/cold email/g, '/services/cold-email'],
  [/web design|website design/g, '/services/web-design'],
  [/\bSEO\b/g, '/services/seo'],
];

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function linkify(text: string, currentPath = ''): string {
  let html = esc(text);
  const used = new Set<string>();
  for (const [re, href] of PHRASES) {
    if (used.has(href) || href === currentPath) continue;
    let done = false;
    html = html.replace(re, (m, offset: number, whole: string) => {
      if (done) return m;
      // skip if we are inside a link already placed
      const before = whole.slice(0, offset);
      if ((before.match(/<a /g) || []).length > (before.match(/<\/a>/g) || []).length) return m;
      done = true;
      used.add(href);
      return `<a class="inline-link" href="${href}">${m}</a>`;
    });
  }
  return html;
}
