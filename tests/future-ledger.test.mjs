import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  createSession, clone, moneyProjection, valueAt, potRate, totals, round,
} from '../src/domain/money.mjs';
import { forecast, applyExperiments, endMonth } from '../src/domain/future.mjs';
const data = JSON.parse(fs.readFileSync(new URL('../public/scenarios.json', import.meta.url)));
const people = () => createSession(data).people;
function fixture(pots, rules) {
  const p = people().alex;
  p.l1.accounts[0].balance = 0;
  p.l1.pots = pots.map(g => ({ kind: 'goal', balance: 0, isDebt: false, ...g }));
  p.l1.rules = rules.map((r, i) => ({ id: 'r-' + i, type: 'payday-fixed', source: 'ac-cur', active: true, since: p.l1.asOf, ...r }));
  return p;
}

test('target and debt final payments keep the unallocated funding in cash, with matching next-month Money Speed', () => {
  const p = fixture([
    { id: 'goal', balance: 950, target: 1000, stopsAtTarget: true },
    { id: 'loan', balance: 50, isDebt: true },
  ], [{ potId: 'goal', amount: 100 }, { potId: 'loan', amount: 40 }]);
  assert.equal(totals(p).speed, 90); // £50 reaches the goal; £40 repays the loan.
  const first = forecast(p, [], 1), second = forecast(p, [], 2);
  assert.equal(first.values.goal, 1000);
  assert.equal(first.values.loan, 10);
  assert.equal(first.cash, 50);
  assert.equal(first.speed, 10);
  assert.deepEqual(first.rates, { goal: 0, loan: -10 });
  assert.equal(first.ruleCount, 1);
  assert.equal(second.values.loan, 0);
  assert.equal(second.cash, 180);
  assert.equal(second.speed, 0);
  assert.equal(second.ruleCount, 0);
  for (const m of [1, 2, 12, 240]) assert.equal(totals(p, m).net, totals(p).net + 140 * m);
});

test('individual Rule targets and monthly caps are respected even when a Pot keeps growing', () => {
  const p = fixture([{ id: 'goal', balance: 90, target: 1000, stopsAtTarget: false }], [
    { potId: 'goal', amount: 50, limitMonthly: 20, stopsAt: 100 },
  ]);
  assert.equal(potRate(p, p.l1.pots[0]), 10);
  assert.equal(valueAt(p, p.l1.pots[0], 12), 100);
  assert.equal(totals(p, 12).cash, 230);
  assert.equal(totals(p, 12).net, 330);
});

test('rules funded from existing Pots debit their source, protect reserves and create no net worth', () => {
  const p = fixture([{ id: 'source', balance: 120 }, { id: 'goal' }], [
    { potId: 'goal', source: 'source', amount: 50, reserve: 20 },
  ]);
  const first = forecast(p, [], 1), end = forecast(p, [], 12);
  assert.equal(first.values.source, 70);
  assert.equal(first.values.goal, 50);
  assert.equal(end.values.source, 20);
  assert.equal(end.values.goal, 100);
  assert.equal(end.net, 120);
  assert.equal(end.speed, 0);
});

test('monthly investment growth matches the end-of-month annuity formula and permits losses below the starting balance', () => {
  const p = fixture([{ id: 'inv', kind: 'investment', balance: 1000, growthAnnual: .12 }], [{ potId: 'inv', amount: 100 }]);
  const q = Math.pow(1.12, 1 / 12);
  assert.equal(valueAt(p, p.l1.pots[0], 12), round(1000 * q ** 12 + 100 * (q ** 12 - 1) / (q - 1)));
  const declining = fixture([{ id: 'inv', kind: 'investment', balance: 1200, target: 1000, stopsAtTarget: true, growthAnnual: -.02 }], []);
  assert.equal(valueAt(declining, declining.l1.pots[0], 12), 1176);
  const neutral = fixture([{ id: 'inv', kind: 'investment', balance: 1000, growthAnnual: 0 }], []);
  assert.deepEqual(forecast(neutral, [], 12).range, [980, 1080]);
});

test('post-milestone redirects work beyond ten years and move rather than duplicate a continuing contribution', () => {
  const p = fixture([{ id: 'first', target: 13000, stopsAtTarget: false }, { id: 'next' }], [{ potId: 'first', amount: 100 }]);
  p.ui.redirects = [{ from: 'first', to: 'next' }, { from: 'first', to: 'next' }];
  assert.equal(endMonth(p, p.l1.pots[0]), 130);
  assert.equal(valueAt(p, p.l1.pots[0], 131), 13000);
  assert.equal(valueAt(p, p.l1.pots[1], 131), 100);
  assert.equal(totals(p, 131).net, 13100);
  assert.equal(totals(p, 131).speed, 100);
  assert.equal(valueAt(p, p.l1.pots[0], 131, false), 13100);
});

test('conditional priority changes preserve the source, condition and capped monthly total', () => {
  const p = fixture([{ id: 'first' }, { id: 'next' }], [
    { potId: 'first', type: 'challenge', condition: 'groceries under £220', amount: 50, limitMonthly: 20 },
  ]);
  const i = { kind: 'priority', goal: 'next', from: 'first', amount: 10 };
  const before = clone(p);
  const result = forecast(p, [i], 12);
  assert.equal(result.speed, 20);
  assert.equal(result.values.first, 120);
  assert.equal(result.values.next, 120);
  const moved = result.person.l1.rules.find(r => r.potId === 'next');
  assert.equal(moved.type, 'challenge');
  assert.equal(moved.condition, 'groceries under £220');
  assert.equal(moved.source, 'ac-cur');
  assert.deepEqual(p, before);
});

test('a pause after it resumes remains reprioritisable and all speed components share the selected month', () => {
  const p = people().elena;
  applyExperiments(p, [{ kind: 'pause', goal: 'hup', months: 3 }]);
  const paused = forecast(p, [], 2), resumed = forecast(p, [], 4);
  assert.equal(paused.rates.hup, 0);
  assert.equal(paused.ruleCount, 2);
  assert.equal(resumed.rates.hup, 200);
  assert.equal(resumed.ruleCount, 3);
  for (const m of [0, 2, 3, 4, 240]) {
    const f = forecast(p, [], m);
    assert.equal(f.speed, round(Object.values(f.rates).reduce((total, rate) => total + Math.abs(rate), 0)));
  }
  p.l1.asOf = '2027-01-01';
  const changed = forecast(p, [{ kind: 'priority', goal: 'fam', from: 'hup', amount: 50 }]);
  assert.equal(changed.rates.hup, 150);
  assert.equal(changed.rates.fam, 200);
});

test('the four personas conserve monthly funding and growth across the full Time Travel horizon', () => {
  for (const p of Object.values(people())) {
    const funding = p.l1.rules.filter(r => r.active).reduce((total, r) => total + Math.min(r.amount, r.limitMonthly || Infinity), 0);
    let expected = totals(p).net;
    for (let m = 0; m < 240; m++) {
      const at = moneyProjection(p, m);
      const growth = p.l1.pots.filter(g => g.growthAnnual).reduce((total, g) => total + at.values[g.id] * (Math.pow(1 + g.growthAnnual, 1 / 12) - 1), 0);
      expected += funding + growth;
      assert.ok(Math.abs(totals(p, m + 1).net - expected) < .1, p.l1.customer.id + ' month ' + (m + 1));
    }
  }
});


test('the shared money trigger and Time Travel respect the same Rule-specific target', async () => {
  const { previewRuleTrigger, executeRuleTrigger } = await import('../src/domain/containers.mjs');
  const p = fixture([{ id: 'goal', name: 'Goal', balance: 90, target: 1000, stopsAtTarget: false }], [
    { potId: 'goal', amount: 50, stopsAt: 100 },
  ]);
  p.l1.accounts[0].balance = 100;
  const rule = p.l1.rules[0];
  assert.equal(previewRuleTrigger(p, rule).amount, 10);
  assert.equal(potRate(p, p.l1.pots[0]), 10);
  executeRuleTrigger(p, rule.id);
  assert.equal(p.l1.pots[0].balance, 100);
  assert.equal(previewRuleTrigger(p, rule).amount, 0);
  assert.equal(forecast(p).speed, 0);
});


test('an overdrawn current account remains a liability in net worth rather than being clamped to zero', () => {
  const p = fixture([{ id: 'goal' }], [{ potId: 'goal', amount: 50 }]);
  p.l1.accounts[0].balance = -100;
  assert.equal(totals(p).net, -100);
  assert.equal(totals(p, 1).net, -50);
  assert.equal(totals(p, 1).speed, 0);
  assert.equal(valueAt(p, p.l1.pots[0], 3), 50);
  assert.equal(totals(p, 3).net, 50);
});


test('Future Money Speed counts only allocations into visible priorities, including redirected Rules', () => {
  const p = fixture([
    { id: 'goal' },
    { id: 'budget', kind: 'budget' },
    { id: 'old', balance: 100, target: 100, futureArchived: true },
  ], [
    { potId: 'goal', amount: 20 },
    { potId: 'budget', amount: 10 },
    { potId: 'old', amount: 5 },
  ]);
  const f = forecast(p);
  assert.deepEqual(f.rates, { goal: 20 });
  assert.equal(f.speed, 20);
  assert.equal(f.ruleCount, 1);
  assert.equal(totals(p).speed, 35);
  p.ui.redirects = [{ from: 'old', to: 'goal' }];
  const redirected = forecast(p);
  assert.deepEqual(redirected.rates, { goal: 25 });
  assert.equal(redirected.speed, 25);
  assert.equal(redirected.ruleCount, 2);
});

test('prepared forecast paths stay consistent across scrubbing, state changes and detached preview edits', () => {
  const p = people().elena;
  const ideas = [{ kind: 'extra', goal: 'hup', amount: 50, title: 'Save a little more' }];
  const baseline = forecast(p, ideas, 120);
  for (const month of [240, 0, 72, 120]) {
    const projected = forecast(p, ideas, month);
    const independentlyApplied = clone(p);
    applyExperiments(independentlyApplied, ideas);
    assert.equal(projected.net, totals(independentlyApplied, month).net);
    for (const g of projected.goals) {
      assert.equal(projected.values[g.id], valueAt(independentlyApplied, g, month));
      assert.equal(projected.dates[g.id], endMonth(independentlyApplied, g));
    }
  }
  baseline.person.l1.pots[0].balance = 1;
  baseline.values.hup = 1;
  baseline.dates.hup = 1;
  assert.notEqual(forecast(p, ideas, 120).values.hup, 1);
  assert.notEqual(forecast(p, ideas, 120).dates.hup, 1);
  p.ui.future = { ideas, drawer: 'expanded' };
  assert.equal(forecast(p, ideas, 120).person.ui.future.drawer, 'expanded');
  p.l1.accounts[0].balance += 123;
  assert.equal(forecast(p, ideas, 120).net, baseline.net + 123);
  p.l1.rules.find(r => r.potId === 'hup').amount += 10;
  assert.notEqual(forecast(p, ideas, 120).values.hup, baseline.values.hup);
});
