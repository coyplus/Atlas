import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { createSession, moveMoney, transaction, undo, totals } from '../src/domain/money.mjs';
import { fixedSavingsProgress } from '../src/domain/fixed-savings.mjs';
import { potArrangement } from '../src/domain/agreements.mjs';
import { previewRuleTrigger, evolveContainer } from '../src/domain/containers.mjs';
const root = new URL('../data/', import.meta.url), data = { moments: {}, shared: {} };
for (const f of readdirSync(new URL('shared/',root)).filter(x=>x.endsWith('.json'))) data.shared[f.slice(0,-5)]=JSON.parse(readFileSync(new URL('shared/'+f,root)));
for (const dir of readdirSync(new URL('moments/',root))) {const l1=JSON.parse(readFileSync(new URL('moments/'+dir+'/l1.json',root))),l2=JSON.parse(readFileSync(new URL('moments/'+dir+'/l2.json',root)));data.moments[l1.customer.id]={l1,l2};}
const setup = () => { const p=createSession(data).people.sam; return [p,p.l1.pots.find(x=>x.id==='house')]; };
test('75 instalments reconcile to the cap and the maturity illustration', () => {
 const [p,item]=setup(), plan=fixedSavingsProgress(p,item);
 assert.equal(plan.months,75);assert.equal(plan.completed,20);assert.equal(plan.remaining,55);
 assert.equal(plan.funded,6400);assert.equal(plan.contributions,24000);
 const r=1.051**(1/12)-1, independentlyCalculated=320*((1+r)**75-1)/r;
 assert.ok(Math.abs(plan.maturityValue-independentlyCalculated)<.01);
 assert.equal(plan.maturityValue,plan.contributions+plan.interest);
 assert.equal(plan.maturesOn,'2031-04-01');
 assert.equal(potArrangement(p,item).conditions.find(c=>c.id==='fixed-term').status,'Locked');
});
test('only received contributions advance progress; partial payments, interest, future entries and undo are distinguished', () => {
 const [p,item]=setup(),net=totals(p).net;
 p.l1.transactions.push({ledger:'house',date:p.l1.asOf,category:'interest',amount:320},{ledger:'house',date:'2030-01-01',category:'transfer',amount:320});
 assert.equal(fixedSavingsProgress(p,item).completed,20);
 transaction(p,'Part payment',()=>moveMoney(p,'ac-cur','house',100));
 assert.equal(fixedSavingsProgress(p,item).completed,20);assert.equal(fixedSavingsProgress(p,item).partial,100);
 transaction(p,'Finish payment',()=>moveMoney(p,'ac-cur','house',220));
 assert.equal(fixedSavingsProgress(p,item).completed,21);assert.equal(totals(p).net,net);
 undo(p);assert.equal(fixedSavingsProgress(p,p.l1.pots.find(x=>x.id==='house')).completed,20);
});
test('lock blocks withdrawals and evolution until maturity; cap blocks manual and limits automated funding', () => {
 const [p,item]=setup();
 assert.throws(()=>moveMoney(p,'house','ac-cur',1),/locked/);
 assert.throws(()=>evolveContainer(p,'house','investment'),/lock/);
 const out={source:'house',potId:'ef',type:'payday-fixed',amount:320,limitMonthly:320,active:true};
 assert.equal(previewRuleTrigger(p,out).amount,0);
 item.balance=23900;
 assert.throws(()=>moveMoney(p,'ac-cur','house',101),/cap/);
 const rule=p.l1.rules.find(x=>x.id==='r-house-payday');assert.equal(previewRuleTrigger(p,rule).amount,100);
 moveMoney(p,'ac-cur','house',100);assert.equal(item.balance,24000);assert.equal(previewRuleTrigger(p,rule).amount,0);assert.equal(potArrangement(p,item).conditions[0].remaining,0);assert.equal(potArrangement(p,item).conditions[0].title,'Your contributions are complete');
 p.l1.asOf='2031-04-01';moveMoney(p,'house','ac-cur',100);assert.equal(item.balance,23900);
});
