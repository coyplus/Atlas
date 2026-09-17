import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createSession, completeQuiz } from '../src/domain/money.mjs';
import {
  companionPreferences,
  companionRecommendation,
  personaliseSupport,
} from '../src/features/companion/model.mjs';
import { moduleModel } from '../src/domain/numbers.mjs';
import { supportModel } from '../src/features/support/model.mjs';
import { portraitBalance } from '../src/features/you/portrait-balance.mjs';
const data = JSON.parse(readFileSync(new URL('../public/scenarios.json', import.meta.url)));
const person = (id) => createSession(data).people[id];
const state = { tab: 'now', member: 'self', month: 0, direction: 'vanilla' };
test('recommendations follow traits, never wealth, and do not select a style for the customer', () => {
  const p = person('sam');
  assert.equal(companionRecommendation(p).style, 'analyst');
  assert.equal(companionPreferences(p).style, 'guide');
  p.ui.companion = { style: 'listener', initiative: 'ask' };
  const recommendation = companionRecommendation(p);
  p.l1.accounts[0].balance = 90000000;
  p.l1.customer.tier = 'Elite';
  assert.deepEqual(companionRecommendation(p), recommendation);
  p.l2.personality.traits = [['Rhythm', 5]];
  assert.equal(companionRecommendation(p).style, 'coach');
  assert.equal(companionPreferences(p).style, 'listener');
  assert.equal(companionRecommendation(person('alex')).trait, null);
});
test('quiet mode keeps the reading context available on explicit request and preserves attention', () => {
  const p = person('sam');
  p.ui.companion = { style: 'listener', initiative: 'ask' };
  const context = { kind: 'module', id: 'balance' };
  assert.equal(supportModel(p, state, context, data.shared.modules).quiet, true);
  const open = supportModel(p, state, { ...context, explicit: true }, data.shared.modules);
  assert.match(open.message, /where you stand/);
  assert.notEqual(open.quiet, true);
  const warning = {
    source: 'ai',
    title: 'Payment needs attention',
    message: 'Payment due tomorrow',
    attentionKey: 'due',
  };
  assert.deepEqual(personaliseSupport(p, state, context, warning), {
    ...warning,
    companionStyle: 'listener',
  });
  const human = { source: 'human', author: 'Priya', message: 'Let’s meet' };
  assert.equal(personaliseSupport(p, state, context, human), human);
});
test('all styles use the same measured amount and leave financial state unchanged', () => {
  const p = person('sam'),
    before = JSON.stringify(p.l1),
    texts = [];
  for (const style of ['listener', 'analyst', 'coach']) {
    p.ui.companion = { style, initiative: 'context' };
    const m = supportModel(p, state, { kind: 'module', id: 'balance' }, data.shared.modules);
    assert.ok(m.message.includes(moduleModel(p, 'balance', data.shared.modules).value));
    texts.push(m.message);
  }
  assert.equal(new Set(texts).size, 3);
  assert.equal(JSON.stringify(p.l1), before);
});
test('next-step mode promotes the actual contextual action without inventing a permission', () => {
  const p = person('sam');
  p.ui.companion = { style: 'coach', initiative: 'lead' };
  const base = supportModel(
    { ...p, ui: { ...p.ui, companion: { style: 'guide', initiative: 'context' } } },
    state,
    { kind: 'stories' },
    data.shared.modules,
  );
  const changed = supportModel(p, state, { kind: 'stories' }, data.shared.modules);
  assert.equal(changed.action, base.action);
  assert.equal(changed.title, base.cta);
});
test('reflections use their own traits, with no inferred weaknesses for an unformed or household portrait', () => {
  const p = person('alex');
  assert.equal(portraitBalance(p), null);
  completeQuiz(p, [0, 1, 2]);
  assert.ok(portraitBalance(p));
  const e = person('elena');
  assert.equal(portraitBalance(e, 'household'), null);
  assert.equal(portraitBalance(e, 'aisha').trait, 'Spontaneity');
  assert.equal(portraitBalance(e, 'aisha').own, false);
  assert.equal(portraitBalance(person('sam')).trait, 'Planning');
});
test('invalid saved preferences fall back independently', () => {
  const p = person('sam');
  p.ui.companion = { style: 'unknown', initiative: 'ask' };
  assert.deepEqual(companionPreferences(p), { style: 'guide', initiative: 'ask' });
});
