// Vercel compiles cleanUrls into a catch-all route, ^/(.*)\.html/?$ → 308,
// and places that route ahead of vercel.json redirects and this middleware.
// A request for /page.html therefore never reaches those layers, even when
// no such file exists. The .html aliases in ONE_HOP are collapsed in one 301
// by redirects/html-one-hop.json (vercel.json bulkRedirectsPath), which Vercel
// runs before deployment routes. This middleware still sends the extensionless
// aliases to the same destinations in one 301. Query strings stay on the
// destination. No pixels, cookies, or analytics.

const ONE_HOP = new Map([
  ['/watch', '/'],
  ['/watch.html', '/'],
  ['/voiceiq-demo', '/demand-intelligence'],
  ['/voiceiq-demo.html', '/demand-intelligence'],
  ['/talk', '/book'],
  ['/talk.html', '/book'],
]);

export const config = {
  matcher: [
    '/watch',
    '/watch.html',
    '/voiceiq-demo',
    '/voiceiq-demo.html',
    '/talk',
    '/talk.html',
  ],
};

export default function middleware(request) {
  const incoming = new URL(request.url);
  const path = ONE_HOP.get(incoming.pathname);
  if (!path) return;

  const destination = new URL(path, incoming.origin);
  destination.search = incoming.search;
  return Response.redirect(destination, 301);
}
