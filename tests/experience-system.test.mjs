import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createSession, rewardAvailability, rewardSavingsPots, redeem, clone } from '../src/domain/money.mjs';
import { relationshipQualification } from '../src/domain/membership.mjs';
import { displayDate } from '../src/domain/dates.mjs';
const data = JSON.parse(readFileSync(new URL('../public/scenarios.json', import.meta.url)));

test('reward availability follows live HSBC qualification and excludes debt, budgets and investments from rate boosts', () => {
  const p = createSession(data).people.sam;
  const lounge = data.shared.modules.benefits.find(b => b.id === 'lounge');
  assert.equal(relationshipQualification(p).trb, 98000);
  assert.equal(rewardAvailability(p, lounge).available, false);
  p.l1.accounts[0].balance += 2000;
  assert.equal(relationshipQualification(p).index, 1);
  assert.equal(rewardAvailability(p, lounge).available, true);
  const pots = rewardSavingsPots(p);
  assert.ok(pots.some(p => p.id === 'ef'));
  assert.ok(!pots.some(p => p.id === 'family-budget'));
  const boost = data.shared.modules.benefits.find(b => b.id === 'boost');
  const before = clone(p.l1.rewards);
  assert.throws(() => redeem(p, boost, 'family-budget'), /savings pot/);
  assert.deepEqual(p.l1.rewards, before);
  assert.equal(rewardAvailability(p, undefined).available, false);
});

test('date-only display is consistent and leaves ranges and customer copy untouched', () => {
  assert.equal(displayDate('2026-09-07'), '7 Sept 2026');
  assert.equal(displayDate('2026-12-31'), '31 Dec 2026');
  for (const text of ['Next payday', '£1,000', '2026-09-01..2026-09-07']) assert.equal(displayDate(text), text);
});
