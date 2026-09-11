import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createSession,clone,totals,valueAt,potRate,transaction,undo} from '../src/domain/money.mjs';
import {forecast,applyExperiments,suggestIdeas,toggleExperiment,ensureFuture,interpretIdea,planningPots} from '../src/domain/future.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../public/scenarios.json',import.meta.url)));
const people=()=>createSession(data).people;
test('all personas use existing balances and omit spending wallets from the field',()=>{
 for(const p of Object.values(people())) {
  const original=JSON.stringify(p),f=forecast(p);
  assert.equal(f.net,totals(p).net);assert.ok(f.goals.every(g=>g.kind!=='budget'));
  assert.equal(JSON.stringify(p),original);
  for(const m of [12,120,240]) assert.equal(forecast(p,[],m).net,totals(p,m).net);
 }
});
test('six month pause retains cash, resumes contributions and agrees after commit',()=>{
 const p=people().elena,idea={id:'pause',kind:'pause',goal:'hup',months:6};
 const before=JSON.stringify(p),base=forecast(p,[],12),draft=forecast(p,[idea],12);
 assert.equal(draft.dates.hup,base.dates.hup+6);
 assert.equal(draft.values.hup,base.values.hup-1200);
 assert.equal(draft.net,base.net);assert.equal(JSON.stringify(p),before);
 const q=clone(p);applyExperiments(q,[idea]);const g=q.l1.pots.find(g=>g.id==='hup');
 assert.equal(potRate(q,g),0);assert.equal(potRate(q,g,6),200);
 assert.equal(valueAt(q,g,6),42000);assert.equal(valueAt(q,g,7),42200);
 assert.equal(forecast(q,[],12).net,draft.net);
});
test('prioritising conserves monthly commitments and shifts both dates',()=>{
 const p=people().elena,i={id:'prioritise',kind:'priority',goal:'ret',from:'hup',amount:50};
 const base=forecast(p),changed=forecast(p,[i]);
 assert.equal(base.speed,changed.speed);assert.ok(changed.dates.ret<base.dates.ret);assert.ok(changed.dates.hup>base.dates.hup);
 assert.throws(()=>forecast(p,[{...i,amount:500}]),/not enough/);
 assert.throws(()=>forecast(people().sam,[{...i,goal:'ef',from:'house'}]),/commitment/);
});
test('generated ideas are applicable, combinable or replaced without mutating live data',()=>{
 for(const p of Object.values(people())) {
  const original=JSON.stringify(p.l1);for(const idea of suggestIdeas(p)){toggleExperiment(p,idea);forecast(p,ensureFuture(p).ideas);}
  assert.equal(JSON.stringify(p.l1),original);
 }
});
test('new and retired goals preserve held balances and apply through the existing undo transaction',()=>{
 const p=people().elena,original=JSON.stringify(p.l1),i={id:'new',kind:'add',goal:'new-goal',name:'Adventure',target:3000,amount:50,title:'Adventure'};
 const f=forecast(p,[i]);assert.equal(f.goals.length,5);assert.equal(f.dates['new-goal'],60);
 transaction(p,'New future',()=>applyExperiments(p,[i]));assert.ok(p.l1.rules.some(r=>r.potId==='new-goal'&&r.amount===50));undo(p);assert.equal(JSON.stringify(p.l1),original);
 const removed=forecast(p,[{kind:'remove',goal:'hup'}]);assert.equal(removed.net,totals(p).net);assert.equal(removed.person.l1.pots.find(g=>g.id==='hup').balance,42000);assert.ok(!planningPots(removed.person).some(g=>g.id==='hup'));
});
test('conversation refines a specific goal and rejects ambiguous transfers or protected debt',()=>{
 const p=people().elena,a=interpretIdea(p,'Pause my house upgrade for six months');assert.equal(a.goal,'hup');assert.equal(a.months,6);
 assert.equal(interpretIdea(p,'Make it three months instead',a).months,3);
 assert.ok(interpretIdea(people().jordan,'Pause my car loan').error);
 assert.ok(interpretIdea(p,'Move £50 from retirement to house upgrade').error);
});
test('a scheduled pause blocks the shared demo trigger until its resume date',async()=>{
 const {previewRuleTrigger}=await import('../src/domain/containers.mjs');
 const p=people().elena;applyExperiments(p,[{kind:'pause',goal:'hup',months:3}]);
 const r=p.l1.rules.find(r=>r.potId==='hup');assert.equal(previewRuleTrigger(p,r).amount,0);assert.match(previewRuleTrigger(p,r).reason,/resumes/);
 p.l1.asOf='2026-12-01';assert.equal(previewRuleTrigger(p,r).amount,200);
});
test('Savings and Smart Rule ideas share preview, approval and capped round-up semantics',async()=>{
 const p=people().elena,original=JSON.stringify(p.l1),ideas=suggestIdeas(p);
 const payday=ideas.find(i=>i.id==='closer-hup'),roundup=ideas.find(i=>i.kind==='roundup');
 assert.ok(roundup);const projected=forecast(p,[payday,roundup],12),base=forecast(p,[],12);
 assert.equal(projected.speed,base.speed+70);assert.ok(projected.dates.hup<base.dates.hup);
 assert.equal(JSON.stringify(p.l1),original);
 transaction(p,'Try rules',()=>applyExperiments(p,[payday,roundup]));
 const r=p.l1.rules.find(r=>r.type==='round-up');assert.equal(r.limitMonthly,30);assert.equal(r.amountIsAverage,true);assert.equal(r.amount,20);
 const {previewRuleTrigger}=await import('../src/domain/containers.mjs');assert.equal(previewRuleTrigger(p,r).amount,.6);
 assert.equal(forecast(p,[],12).values.hup,projected.values.hup);
 undo(p);assert.equal(JSON.stringify(p.l1),original);
});
