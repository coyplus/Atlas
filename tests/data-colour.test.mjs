import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createSession } from '../src/domain/money.mjs';
import { moduleModel } from '../src/domain/numbers.mjs';
import { spendingRole, moneyVisualRole, limitState } from '../src/domain/visual-semantics.mjs';
import { numberVisualMarkup } from '../src/design-system/number-visual.mjs';
const data = JSON.parse(readFileSync(new URL('../public/scenarios.json', import.meta.url)));
const model = (p, id) => moduleModel(p, id, data.shared.modules);

test('spending identity survives reordered data and matches the category trend', () => {
  const p = createSession(data).people.jordan;
  const identities = () => Object.fromEntries(model(p, 'whereitgoes').visual.items.map(x => [x.label, x.role]));
  const before = identities();
  p.l1.spending.byCategory = Object.fromEntries(Object.entries(p.l1.spending.byCategory).reverse());
  p.l1.spending.byCategory.groceries += 100;
  assert.deepEqual(identities(), before);
  assert.equal(model(p, 'grocery').visual.role, before.groceries);
  assert.equal(model(p, 'eatingout').visual.role, before['eating out']);
  assert.equal(spendingRole('unclassified'), 'neutral');
});

test('wealth, goal progress and credit share the same information roles', () => {
  const p = createSession(data).people.elena;
  assert.deepEqual(model(p, 'wealth').visual.items.map(x => x.role), ['cash', 'savings', 'investment']);
  assert.equal(moneyVisualRole('investment'), 'investment');
  assert.equal(moneyVisualRole('savings'), 'savings');
  assert.equal(moneyVisualRole('credit'), 'borrowing');
  assert.equal(model(createSession(data).people.jordan, 'cardusage').visual.role, 'borrowing');
});

test('only an actual reached or exceeded limit overrides the information role', () => {
  assert.equal(limitState(39, 100), 'normal');
  assert.equal(limitState(99.9, 100), 'normal');
  assert.equal(limitState(100, 100), 'at-limit');
  assert.equal(limitState(100.01, 100), 'over-limit');
  assert.equal(limitState(50, 0), 'normal');
  const p = createSession(data).people.jordan;
  const account = p.l1.accounts.find(x => x.id === 'ac-cc');
  account.owed = 2000;
  assert.equal(model(p, 'cardusage').visual.state, 'at-limit');
  account.owed = 2100;
  const visual = model(p, 'cardusage').visual;
  assert.equal(visual.state, 'over-limit');
  assert.equal(visual.value, 105);
  assert.match(numberVisualMarkup(visual, true), /aria-label="[^"]*Over your credit limit/);
  assert.match(numberVisualMarkup(visual, true), /class="viz-state-label"/);
});
