const reply = document.querySelector('#concierge-reply'),
  next = document.querySelector('#concierge-next');
function show(text, label, url) {
  reply.textContent = text;
  next.textContent = label + ' →';
  next.href = url;
}
function answer(raw) {
  const q = raw.toLowerCase();
  if (/price|pricing|cost|fee|discount|\$|much/.test(q))
    return show(
      'Foundation builds tracking, CRM and pipeline, booking, and follow-up. Growth Partner adds a managed acquisition strategy and ongoing conversion work. Scale expands across more channels. Scope and fees are confirmed before you start. Ad spend is separate.',
      'Talk through scope',
      '/book',
    );
  if (/term|contract|cancel|commit|long/.test(q))
    return show(
      'Every plan starts with a three-month commitment. After that it runs month to month, and you can cancel with 30 days notice.',
      'Read the plan terms',
      '/terms',
    );
  if (/guarantee|30 leads|promise/.test(q))
    return show(
      'Demand Flow comes with a written guarantee: $50,000 in new revenue in 45 to 60 days, or your service fees back plus $500. It applies to businesses accepted into Demand Flow with a signed agreement.',
      'Read the guarantee terms',
      '/legal/guarantee',
    );
  if (/platform|intelligence|prospect|data|list/.test(q))
    return show(
      'Dead River Demand Intelligence identifies people and businesses showing relevant buying signals across B2B and B2C markets, so your sales or marketing team has a better place to start. Full platform access is $3,000 a month with no setup fee.',
      'Learn about Demand Intelligence',
      '/demand-intelligence',
    );
  if (/book|calendar|call|appointment|human|talk|speak/.test(q))
    return show(
      'Of course. Tell us a little about your business and when you prefer to talk, and we will email you to set up a time.',
      'Book a call',
      '/book',
    );
  if (/tool|calculat|resource|guide|article/.test(q))
    return show(
      'We have ten free tools: calculators for campaign ROI, acquisition cost, revenue goals, and ad budgets, plus diagnostics for lead response, readiness, website conversion, and search foundations. No email required.',
      'Open the free tools',
      '/tools',
    );
  if (/website|rebuild|shoot|rebrand|software|unlimited|video/.test(q))
    return show(
      'Campaign landing pages and conversion improvements are part of the engagements. Full website rebuilds, rebrands, photo or video production, and custom software are scoped separately.',
      'Talk through scope',
      '/book',
    );
  if (/service|help|growth|foundation|scale|partner|do you|what/.test(q))
    return show(
      'Foundation builds the infrastructure: tracking, CRM and pipeline, booking, and follow-up. Growth Partner adds a managed acquisition strategy and ongoing conversion work. Scale expands across more channels with deeper retention, intelligence, and strategy.',
      'Call (915) 228-3054',
      'tel:+19152283054',
    );
  if (/privacy|store|saved|live|person|bot|automated|real/.test(q))
    return show(
      'These are prepared answers, not a live chat. Your question stays on this page. To reach a person, use the contact form or call (915) 228-3054.',
      'Read our privacy notice',
      '/privacy',
    );
  show(
    'I can answer questions about pricing, scope, free tools, Demand Intelligence, and booking a call. For advice specific to your business, call (915) 228-3054.',
    'Call (915) 228-3054',
    'tel:+19152283054',
  );
}
document
  .querySelector('#concierge-question')
  .addEventListener('submit', (e) => {
    e.preventDefault();
    answer(new FormData(e.currentTarget).get('question'));
    e.currentTarget.reset();
  });
document
  .querySelectorAll('[data-concierge-question]')
  .forEach((b) =>
    b.addEventListener('click', () => answer(b.dataset.conciergeQuestion)),
  );
document
  .querySelector('#concierge-fit-form')
  .addEventListener('submit', (e) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget),
      p = d.get('priority'),
      industry = d.get('industry'),
      names = {
        foundation: 'Foundation',
        'growth-partner': 'Growth Partner',
        scale: 'Scale',
      };
    show(
      names[p] +
        ' is usually the right starting point for that priority. A strategist will confirm fit with you, including budget, timing, and the systems you already have in place.',
      'Call (915) 228-3054',
      'tel:+19152283054',
    );
  });
