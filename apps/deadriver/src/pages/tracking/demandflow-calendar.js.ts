import attributionSource from '../../lib/attribution.js?raw';
import { connectCalendarAttribution } from '../../lib/calendar-attribution.js';

export const prerender = true;
export function GET() {
  return new Response(`${attributionSource}\n(${connectCalendarAttribution.toString()})(window, collectAttribution);`, {
    headers: { 'Content-Type': 'application/javascript; charset=utf-8' },
  });
}
