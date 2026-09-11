import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createSession, moveMoney, totals } from '../src/domain/money.mjs';
import { moduleModel } from '../src/domain/numbers.mjs';
import { numberIdeas, newNumberIdeas } from '../src/domain/number-visuals.mjs';
import { numberVisualMarkup } from '../src/design-system/number-visual.mjs';
const data = JSON.parse(readFileSync(new URL('../public/scenarios.json', import.meta.url)));
const model = (p,id) => moduleModel(p,id,data.shared.modules);
test('investment and wealth visuals reconcile with each scenario, including growth-bearing goals', () => {
  for (const p of Object.values(createSession(data).people)) {
    const sum = (id) => Math.round(model(p,id).visual.items.reduce((total,item)=>total+item.value,0)*100)/100;
    assert.equal(sum('investments'), totals(p).invested);
    assert.equal(sum('wealth'), totals(p).held);
    const visual = model(p,'investments').visual;
    if (visual.items.length === 1) {
      assert.doesNotMatch(numberVisualMarkup(visual,true), /<svg/);
      assert.match(numberVisualMarkup(visual,true), /Held in/);
    }
  }
});
test('new ideas are personalised, unpinned, deduplicated and remembered independently', () => {
  const {people} = createSession(data), p=people.jordan;
  const ideas=numberIdeas(p); assert.equal(new Set(ideas.map(x=>x.moduleId)).size, ideas.length);
  assert(ideas.some(x=>x.moduleId==='cardusage'));
  assert(!numberIdeas(people.sam).some(x=>x.moduleId==='cardusage'));
  p.ui.seenNumberIdeas=ideas.map(x=>x.moduleId); assert.equal(newNumberIdeas(p),0);
  assert(newNumberIdeas(people.sam)>0);
  p.ui.order.push('cardusage'); assert(!numberIdeas(p).some(x=>x.moduleId==='cardusage'));
});
test('credit usage and its gauge update after repayment; absent data has no invented gauge', () => {
  const {people} = createSession(data), p=people.jordan;
  assert.equal(model(p,'cardusage').visual.value,39);
  moveMoney(p,'ac-cur','ac-cc',80);
  assert.equal(model(p,'cardusage').value,'35%');
  assert.equal(model(people.sam,'cardusage').visual,null);
});
test('spending lines reconcile with the headline, including refunds and credit purchases', () => {
  const p=createSession(data).people.jordan;
  assert.equal(model(p,'eatingout').visual.items.at(-1).value,131);
  p.l1.transactions.push({ledger:'ac-cc',date:p.l1.asOf,category:'eating-out',amount:10,counterparty:'Cafe'}, {ledger:'ac-cur',date:p.l1.asOf,category:'eating-out',amount:5,counterparty:'Refund'});
  assert.equal(model(p,'eatingout').value,'£136.00');
  assert.equal(model(p,'eatingout').visual.items.at(-1).value,136);
  const sam=createSession(data).people.sam;
  assert.equal(model(sam,'groceryrhythm').visual.value,8);
  assert.equal(model(p,'groceryrhythm').visual,null);
});
