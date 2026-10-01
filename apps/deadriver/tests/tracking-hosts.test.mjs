import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';

for (const layout of ['Base', 'Growth']) {
  const source = readFileSync(new URL('../src/layouts/' + layout + '.astro', import.meta.url), 'utf8');
  const scripts = [...source.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const marketing = scripts.find(s => s.includes('var loadMarketing ='));
  const visitor = scripts.find(s => s.includes('app.deadrivermanagement.com/script'));
  function run(hostname, privacy = {}) {
    const loaded = [];
    const context = { location:{hostname}, gtm:'GTM-test', fb:'pixel-test', adsId:'AW-test', dataLayer:[],
      document:{readyState:'complete', createElement:()=>({}), getElementsByTagName:()=>[{parentNode:{insertBefore:node=>loaded.push(node.src)}}]},
      addEventListener(){}, setTimeout:fn=>fn(), Date,
    };
    context.window=context;
    context.navigator = { globalPrivacyControl: privacy.gpc === true };
    context.dataLayer = privacy.commands || [];
    const privacySource = readFileSync(new URL('../src/components/TrackingPrivacy.astro', import.meta.url), 'utf8').replace(/<script[^>]*>|<\/script>/g, '');
    vm.runInNewContext(privacySource, context);
    vm.runInNewContext(marketing,context);
    vm.runInNewContext(visitor,context);
    context.loadMarketing(); // A second interaction must not load the marketing tags again.
    return loaded;
  }
  test(layout + ': production loads its existing tags exactly once',()=>{
    for(const host of ['deadrivermanagement.com','www.deadrivermanagement.com']) {
      const loaded=run(host);
      assert.equal(loaded.length,4);
      assert.equal(loaded.filter(url=>url.includes('gtag/js')).length,1);
      assert.equal(loaded.filter(url=>url.includes('gtm.js')).length,1);
    }
  });
  test(layout + ': preview, localhost and lookalike domains cannot load production tags',()=>{
    for(const host of ['localhost','127.0.0.1','deadrivermanagement-site-preview-deadriver.vercel.app','www.deadrivermanagement.com.example.org']) {
      assert.deepEqual(run(host),[]);
    }
  });
  test(layout + ': privacy opt-outs prevent vendor requests on production',()=>{
    assert.deepEqual(run('www.deadrivermanagement.com', {gpc:true}), []);
    for (const key of ['ad_storage', 'ad_user_data', 'analytics_storage']) {
      assert.deepEqual(run('www.deadrivermanagement.com', {commands:[['consent','update',{[key]:'denied'}]]}), []);
    }
    assert.equal(run('www.deadrivermanagement.com', {commands:[['consent','default',{ad_storage:'denied'}],['consent','update',{ad_storage:'granted'}]]}).length, 4);
  });
}
