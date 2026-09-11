import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createSession, clone } from '../src/domain/money.mjs';
import { forecast, applyExperiments } from '../src/domain/future.mjs';
import { possibilities, seePossibilities, dismissPossibility, badgeRecommendation } from '../src/features/ideas/model.mjs';
import { futureInsight } from '../src/features/future/insights.mjs';
import { supportModel } from '../src/features/support/model.mjs';
import { joinChallenge, challenges } from '../src/features/badges/model.mjs';
const data = JSON.parse(fs.readFileSync(new URL('../public/scenarios.json', import.meta.url)));
const people = () => createSession(data).people;
const state = { tab: 'future', direction: 'vanilla', member: 'self', month: 0 };

test('possibilities derive from the customer picture, stay relevant and never mutate it', () => {
  const ps = people();
  for (const p of Object.values(ps)) {
    const before = JSON.stringify(p), list = possibilities(p);
    assert.equal(list.length, 3);
    assert.deepEqual(possibilities(p), list);
    assert.equal(JSON.stringify(p), before);
    assert.ok(list.every((i) => !p.l1.pots.some((g) => g.name === i.name)));
  }
  assert.ok(possibilities(ps.jordan).some((i) => i.key === 'car-costs'));
  assert.ok(possibilities(ps.sam).some((i) => i.investment));
  assert.ok(possibilities(ps.elena).some((i) => i.key === 'legacy' && i.source === 'Something you told us'));
  assert.ok(possibilities(ps.alex).some((i) => i.key === 'buffer'));
  assert.doesNotMatch(possibilities(ps.alex)[0].why, /spender|saver|spontaneity/i);
});

test('unseen counts follow discovery and dismissal, scoped to each person', () => {
  const { jordan, sam } = people(), list = possibilities(jordan);
  assert.equal(list.filter((i) => i.isNew).length, 3);
  seePossibilities(jordan, list);
  assert.equal(possibilities(jordan).filter((i) => i.isNew).length, 0);
  assert.equal(possibilities(sam).filter((i) => i.isNew).length, 3);
  dismissPossibility(jordan, list[0].id);
  assert.ok(!possibilities(jordan).some((i) => i.id === list[0].id));
  assert.deepEqual(possibilities(jordan, { member: 'ben' }), []);
});

test('remembered intentions lead, disappear on revocation and do not leak between household portraits', () => {
  const p = people().sam;
  p.ui.checkins = [{ id: 'r1', version: 1, tool: 'ahead', date: p.l1.asOf, remember: true,
    insight: 'Room to learn', answers: { future: 'learn' } }];
  const idea = possibilities(p)[0];
  assert.equal(idea.memoryId, 'r1');
  assert.equal(idea.source, 'From your check-in');
  assert.equal(badgeRecommendation(p).id, 'future-letter');
  assert.equal(badgeRecommendation(p, { member: 'riley' }), null);
  p.ui.checkins[0].remember = false;
  assert.ok(!possibilities(p).some((i) => i.memoryId));
  assert.equal(badgeRecommendation(p).id, 'investment-curious');
  p.ui.checkins[0].remember = true;
  p.ui.checkins = [];
  assert.ok(!possibilities(p).some((i) => i.memoryId));
});

test('tentative beliefs are not retold as things the customer said', () => {
  const p = people().alex;
  p.l2.beliefs.push({ claim: 'A place of my own', status: 'open' });
  assert.ok(!possibilities(p).some((i) => i.key === 'home'));
  p.l2.beliefs[0].status = 'confirmed';
  assert.equal(possibilities(p)[0].key, 'home');
});

test('suggested and custom goals share preview and approval maths, including investment uncertainty', () => {
  for (const p of Object.values(people())) for (const suggestion of possibilities(p)) {
    const original = JSON.stringify(p.l1), i = { ...suggestion, id: 'trial', kind: 'add', goal: 'trial-pot',
      possibilityKey: suggestion.key };
    const trial = forecast(p, [i], 120);
    assert.equal(JSON.stringify(p.l1), original);
    const committed = clone(p);
    applyExperiments(committed, [i]);
    const applied = forecast(committed, [], 120);
    assert.deepEqual(applied.values, trial.values);
    assert.equal(applied.net, trial.net);
    assert.ok(!possibilities(committed).some((x) => x.key === i.key));
    if (i.investment) {
      assert.ok(trial.range[1] > trial.range[0]);
      assert.ok(trial.values[i.goal] > i.target);
      assert.equal(trial.rates[i.goal], i.amount);
    }
  }
});

test('long-range travel offers a new life-stage possibility, even with an expanded drawer and unfunded goals', () => {
  const p = people().sam;
  p.ui.future = { ideas: [], drawer: 'expanded' };
  const early = futureInsight(p, { ...state, month: 96 }), late = futureInsight(p, { ...state, month: 180 });
  assert.match(early.action, /^future-horizon:/);
  assert.match(late.action, /^future-horizon:/);
  assert.notEqual(early.action, late.action);
  assert.notEqual(early.message, late.message);
  assert.match(late.message, /Ella.*19/);
  assert.match(late.message, /still needs a funding route/);
  assert.doesNotMatch(late.message, /milestones behind you/);
});

test('a goal beyond the horizon prevents claims that all goals are behind you', () => {
  const p = people().jordan;
  p.l1.pots.push({ id: 'unreachable', name: 'A distant dream', kind: 'goal', target: 1e7, balance: 0, rules: [] });
  assert.doesNotMatch(futureInsight(p, { ...state, month: 240 }).message, /milestones behind you/);
});

test('badges respond to personality and habits, prioritise active challenges and never join automatically', () => {
  const { jordan, sam, elena } = people();
  assert.equal(badgeRecommendation(jordan).id, 'payday-first');
  assert.equal(badgeRecommendation(sam).id, 'investment-curious');
  assert.equal(badgeRecommendation(elena).id, 'future-letter');
  const before = JSON.stringify(jordan.l1);
  const m = supportModel(jordan, { ...state, tab: 'you' }, { kind: 'badges' }, data.shared.modules);
  assert.equal(m.action, 'badge:payday-first');
  assert.match(m.message, /steady habits/);
  assert.equal(JSON.stringify(jordan.l1), before);
  joinChallenge(jordan, 'rainy-day-ready');
  assert.equal(badgeRecommendation(jordan).id, 'rainy-day-ready');
  jordan.l1.rewards.challenges['rainy-day-ready'].paused = true;
  assert.equal(badgeRecommendation(jordan).id, 'payday-first');
  jordan.l1.rewards.challenges = Object.fromEntries(challenges.map((b) => [b.id, { earnedAt: jordan.l1.asOf, count: b.target }]));
  assert.equal(badgeRecommendation(jordan), null);
});
