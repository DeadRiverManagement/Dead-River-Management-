import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Exercise the shipped inline script with click events and a minimal DOM.
test('choosing a new main problem clears the old choice and recommends the matching plan', () => {
  const source = readFileSync('src/pages/plans.astro', 'utf8');
  const script = source.match(/<script is:inline>([\s\S]*?)<\/script>/)[1];
  function element(key) {
    const classes = new Set();
    return { attrs: { 'data-p': key }, listeners: {}, style: {}, textContent: '',
      classList: { add: x => classes.add(x), remove: x => classes.delete(x), contains: x => classes.has(x) },
      getAttribute(k) { return this.attrs[k]; }, setAttribute(k,v) { this.attrs[k]=v; },
      addEventListener(k,v) { this.listeners[k]=v; }, insertAdjacentHTML() {},
      getBoundingClientRect() { return { top: 100 }; }
    };
  }
  const keys = ['calls','web','google','pages','ads','all'];
  const pills = keys.map(element);
  const nodes = new Map(['verdict','vName','vPrice','vWhy','vAlt','vBtn'].map(k => [k,element(k)]));
  const document = {
    querySelectorAll: s => s === '.pill' ? pills : [],
    getElementById: id => { if (!nodes.has(id)) nodes.set(id,element(id)); return nodes.get(id); }
  };
  runInNewContext(script, { document, window: { matchMedia: () => ({ matches: true }), scrollY: 0, scrollTo() {} }, requestAnimationFrame: fn => fn(), setTimeout: fn => fn() });
  const expected = { calls:'Essentials', web:'Website', google:'Local Visibility', pages:'Search Growth', ads:'Paid Growth', all:'Dead River Complete' };
  // Switching from higher-priority ads/all back to calls caught the original bug.
  for (const key of ['calls','ads','calls','all','web','google','pages']) {
    pills[keys.indexOf(key)].listeners.click();
    assert.equal(nodes.get('vName').textContent, expected[key]);
    assert.equal(pills.filter(p => p.getAttribute('aria-pressed') === 'true').length, 1);
  }
});
