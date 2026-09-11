import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createSession } from '../src/domain/money.mjs';
import { portraitMetrics, portraitMetricsReply } from '../src/features/you/portrait-metrics.mjs';
const data=JSON.parse(readFileSync(new URL('../public/scenarios.json',import.meta.url)));
const person=id=>createSession(data).people[id];
const metric=(p,id)=>portraitMetrics(p).cards.find(c=>c.id===id);

test('saving allocations use the live rules, distinguishing conditional and average amounts',()=>{
  const p=person('sam'),before=JSON.stringify(p.l1);
  assert.equal(metric(p,'allocation').value,'£420');
  assert.match(metric(p,'allocation').calculation,/only runs/);
  assert.equal(JSON.stringify(p.l1),before);
  p.l1.rules.find(r=>r.id==='r-house-payday').amount=350;
  assert.equal(metric(p,'allocation').value,'£450');
  assert.equal(metric(person('jordan'),'allocation').value,'£72');
  assert.match(metric(person('jordan'),'allocation').calculation,/average/);
  assert.equal(metric(person('elena'),'allocation').value,'£850');
  p.ui.checkins = [{id:'new-checkin'}];
  assert.equal(metric(p,'checkins').value,'53');
  assert.equal(portraitMetrics(p).inputs.find(x=>x.label==='check-ins').value,'53');
});
test('spending comparison, streak and bill timing have explicit periods and consistent arithmetic',()=>{
  const p=person('sam'),timing=metric(p,'timing');
  assert.equal(timing.days.reduce((n,d)=>n+d.value,0),1400);
  assert.equal(timing.value,'97%');
  assert.equal(metric(p,'cadence').labels.length,8);
  assert.match(metric(p,'cadence').calculation,/September.*not included/);
  const g=metric(person('jordan'),'groceries');
  assert.deepEqual(g.parts.map(x=>x.value),[250.4,212.4]);
  assert.equal(g.value,'£212.40');
  assert.match(g.caption,/£38 less.*15%/);
  assert.match(metric(person('elena'),'timing').calculation,/variable card repayment is excluded/);
});
test('new joiner and shared profiles do not acquire fabricated history',()=>{
  const alex=person('alex');
  assert.equal(metric(alex,'recent').series.reduce((n,d)=>n+d.value,0),4);
  assert.equal(metric(alex,'visits').value,'6');
  assert.equal(metric(alex,'checkins').value,'0');
  const elena=person('elena'),s={member:'aisha'};
  const shared=portraitMetrics(elena,s);
  assert.deepEqual(shared.cards.map(x=>x.value),['186','9']);
  assert.equal(shared.cards[0].count,186);
  elena.l1.rules=[];
  elena.ui.portraitNotes={rhythm:{text:'My private interpretation'}};
  assert.deepEqual(portraitMetrics(elena,s),shared);
});
test('measurement replies explain calculation, not a personality judgement',()=>{
  const p=person('jordan'),s={member:'self'};
  const reply=portraitMetricsReply(p,s,{id:'groceries'},'How is this calculated?');
  assert.match(reply,/£250.40/);assert.match(reply,/£212.40/);
  assert.doesNotMatch(reply,/Planner|Spontaneity/);
  assert.match(portraitMetricsReply(p,s,{},'How does this differ from my portrait?'),/not a personality score/);
});
