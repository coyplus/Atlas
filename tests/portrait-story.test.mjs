import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createSession, completeQuiz } from '../src/domain/money.mjs';
import { portraitStory, portraitStoryReply } from '../src/features/you/portrait-story.mjs';
const data = JSON.parse(readFileSync(new URL('../public/scenarios.json', import.meta.url)));
const person = (id) => createSession(data).people[id];

test('portrait evidence and visuals use the scenario amounts and update with its saving rules', () => {
  const p = person('sam');
  let m = portraitStory(p);
  const flow = () => m.cards.find((c) => c.id === 'routine');
  assert.equal(flow().chart.parts.reduce((n, r) => n + r.value, 0), 420);
  assert.equal(m.cards.find((c) => c.id === 'buffer').chart.ratio, 4200 / 5000);
  assert.equal(m.inputs.find((i) => i.label === 'money moves').value, '431');
  p.l1.rules.find((r) => r.id === 'r-house-payday').amount = 350;
  m = portraitStory(p);
  assert.equal(flow().chart.parts.reduce((n, r) => n + r.value, 0), 450);
  const jordan = portraitStory(person('jordan'));
  const comparison = jordan.cards.find((c) => c.kind === 'compare');
  assert.equal(comparison.value, '£38');
  assert.deepEqual(comparison.chart.parts.map((x) => x.value), [250.4, 212.4]);
});

test('shared stories explain shared traits without borrowing the account owner’s evidence', () => {
  const p = person('elena');
  const before = portraitStory(p, 'aisha');
  assert.equal(before.own, false);
  assert.deepEqual(before.inputs.map((i) => i.value), ['186', '9']);
  assert.ok(before.cards.every((c) => c.kind === 'shape'));
  p.l1.rules = [];
  p.l1.accounts[0].balance = 9999999;
  p.ui.portraitNotes = { planning: { text: 'Only mine' } };
  assert.deepEqual(portraitStory(p, 'aisha'), before);
});

test('a new portrait retains its answers without inventing a historical pattern', () => {
  const p = person('alex');
  completeQuiz(p, [0, 1, 2]);
  const m = portraitStory(p);
  assert.deepEqual(p.ui.portraitQuizAnswers, [0, 1, 2]);
  assert.equal(m.inputs.find((i) => i.label === 'answers').value, '3');
  assert.ok(!m.inputs.some((i) => i.label === 'money moves'));
  assert.ok(!m.cards.some((c) => c.kind === 'rhythm'));
});

test('customer perspective and contextual replies stay attached to the relevant observation', () => {
  const p = person('sam');
  const money = JSON.stringify(p.l1);
  p.ui.portraitNotes = { routine: { text: 'Rules save me time for family.' } };
  const m = portraitStory(p);
  assert.equal(m.cards[0].note, 'Rules save me time for family.');
  assert.match(portraitStoryReply(p, { member: 'self' }, { id: 'routine' }, 'What is that based on?'), /£420/);
  assert.match(portraitStoryReply(p, { member: 'self' }, { id: 'rhythm' }, 'Could there be another explanation?'), /Add your perspective/);
  assert.match(portraitStoryReply(p, { member: 'self' }, {}, 'Do my balances affect my personality?'), /do not set your personality/);
  assert.equal(JSON.stringify(p.l1), money);
});

test('the story uses the words of a remembered reflection, never a private one', () => {
  const p = person('sam');
  const before = portraitStory(p).cards.find((c) => c.id === 'voice').value;
  p.ui.checkins = [{ id: 'test-reflection', tool: 'instinct', date: p.l1.asOf, result: { title: 'My view', text: 'My view' }, insight: 'Rules give me more time with my family.', remember: false }];
  assert.equal(portraitStory(p).cards.find((c) => c.id === 'voice').value, before);
  p.ui.checkins[0].remember = true;
  const voice = portraitStory(p).cards.find((c) => c.id === 'voice');
  assert.equal(voice.value, p.ui.checkins[0].insight);
  assert.equal(voice.observation, p.ui.checkins[0].insight);
});
