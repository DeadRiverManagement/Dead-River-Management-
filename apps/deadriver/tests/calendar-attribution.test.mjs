import { test } from 'node:test';
import assert from 'node:assert/strict';
import { connectCalendarAttribution } from '../src/lib/calendar-attribution.js';
import { collectAttribution } from '../src/lib/attribution.js';

const base = 'https://api.leadconnectorhq.com/widget/bookings/demandflow';
function browser(query = '', storage = new Map()) {
  const links = [{href: base}, {href: 'https://example.com/'}];
  const frame = {src: base};
  return { links, frame, navigator: {}, dataLayer: [],
    location: {href: 'https://www.deadrivermanagement.com/50k-demand-flow' + query},
    localStorage: {getItem:k=>storage.get(k), setItem:(k,v)=>storage.set(k,v), removeItem:k=>storage.delete(k)},
    document: {cookie:'',referrer:'',querySelectorAll:()=>links,getElementById:()=>frame},
  };
}
test('campaign and click ID reach both calendar links and embed, without conversions', () => {
  const win=browser('?utm_source=facebook&utm_campaign=50k&campaign_id=120250024069110352&fbclid=click123&email=private');
  connectCalendarAttribution(win,collectAttribution);
  const url=new URL(win.frame.src);
  assert.equal(url.searchParams.get('fbclid'),'click123');
  assert.equal(url.searchParams.get('utm_campaign'),'50k');
  assert.equal(url.searchParams.get('campaign_id'),'120250024069110352');
  assert.equal(url.searchParams.has('email'),false);
  assert.equal(win.links[0].href,win.frame.src);
  assert.equal(win.links[1].href,'https://example.com/');
  assert.deepEqual(win.dataLayer,[]);
});
test('direct return retains campaign; new campaign does not inherit old click ID', () => {
  const storage=new Map();
  connectCalendarAttribution(browser('?utm_source=facebook&campaign_id=oldcampaign&fbclid=old',storage),collectAttribution);
  const returning=browser('',storage); connectCalendarAttribution(returning,collectAttribution);
  assert.equal(new URL(returning.frame.src).searchParams.get('fbclid'),'old');
  assert.equal(new URL(returning.frame.src).searchParams.get('campaign_id'),'oldcampaign');
  const newer=browser('?utm_source=google&gclid=new',storage); connectCalendarAttribution(newer,collectAttribution);
  assert.equal(new URL(newer.frame.src).searchParams.has('fbclid'),false);
  assert.equal(new URL(newer.frame.src).searchParams.has('campaign_id'),false);
  assert.equal(new URL(newer.frame.src).searchParams.get('gclid'),'new');
});
test('GPC and consent denials keep booking usable without forwarding attribution', () => {
  for (const key of ['gpc','ad_storage','ad_user_data','analytics_storage']) {
    const win=browser('?fbclid=blocked&utm_source=facebook');
    if(key==='gpc')win.navigator.globalPrivacyControl=true;
    else win.dataLayer.push(['consent','update',{[key]:'denied'}]);
    connectCalendarAttribution(win,collectAttribution);
    assert.equal(win.frame.src,base);
    assert.equal(win.links[0].href,base);
  }
});
