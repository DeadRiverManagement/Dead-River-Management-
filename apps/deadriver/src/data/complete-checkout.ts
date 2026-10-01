// Dead River Complete checkout. Post-video pages only (/watch, /flagship-offer).
// Never import this from the public Complete page, homepage, plans, or schema.
// Never print the dollar amount on the site — public pages, FAQ, schema, or llms.txt.

export const COMPLETE_CHECKOUT_URL =
  'https://link.fastpaydirect.com/payment-link/6aa5c974ceb12d9fc1a8c8ec';

/** Internal price lock to match the nurture video. Do not render. */
export const COMPLETE_MONTHLY = 2497;
/** Setup charged only after nurture checkout. Do not render. */
export const COMPLETE_SETUP = 2497;
