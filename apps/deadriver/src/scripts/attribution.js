import { collectAttribution } from '../lib/attribution.js';

collectAttribution(window);
window.addEventListener('drm:cookie-consent', () => collectAttribution(window));
window.addEventListener('pageshow', () => collectAttribution(window));
