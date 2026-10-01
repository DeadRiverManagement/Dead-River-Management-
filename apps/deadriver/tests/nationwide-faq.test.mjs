import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve('src/data/nationwide-faq.ts'), 'utf8');

const extractBlock = (name) => {
  const match = source.match(
    new RegExp(`export const ${name}: FaqItem\\[\\] = \\[([\\s\\S]*?)\\];`),
  );
  assert.ok(match, name + ' block missing');
  return match[1];
};

const questions = (name) =>
  [...extractBlock(name).matchAll(/q: '([^']+)'/g)].map((m) => m[1]);

test('nationwide FAQ pastes keep GP-only framing', () => {
  assert.deepEqual(questions('homeFaq'), [
    'What does Dead River Management actually do?',
    'Do you only work with businesses in El Paso?',
    'How long is the commitment?',
    'Do we need a new website?',
    'Is Demand Intelligence included?',
    'How much do nationwide plans cost?',
    'Is Dead River Management the same as Dead River Company?',
  ]);
  assert.deepEqual(questions('pricingFaq'), [
    'What is the difference between Foundation, Growth Partner, and Scale?',
    'What is included in the monthly fee?',
    'How long do I have to stay?',
    'What is Dead River Demand Intelligence?',
    'Do you still sell Dead River Complete or Front Desk plans?',
    'Who is a good fit?',
    'How do I start?',
  ]);
  assert.deepEqual(questions('homeServicesFaq'), [
    'Do you work with HVAC, plumbing, roofing, and other trades?',
    'Which plan should a home services company start with?',
    'Do you only serve El Paso home services?',
    'Is missed-call recovery part of Growth Partner?',
    'Are written lead promises part of current plans?',
    'How do I get pricing?',
  ]);
});

test('FAQ answers do not sell Complete or the old SKU ladder', () => {
  const answers = [...source.matchAll(/a: '([^']+)'/g)]
    .map((m) => m[1])
    .join('\n');
  assert.match(answers, /Those older offers are retired/);
  assert.match(answers, /not active public offers/);
  assert.doesNotMatch(answers, /Essentials is \$97/);
  assert.doesNotMatch(answers, /Front Desk AI is \$197/);
  assert.doesNotMatch(answers, /work for free until we get them/);
  assert.match(answers, /Foundation, Growth Partner, and Scale/);
  assert.doesNotMatch(
    answers,
    /\$997|\$1,497|\$1,997|\$2,497|\$2,997|\$4,497|See Pricing|\/pricing/,
  );
});
