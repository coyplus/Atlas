import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { challenges, badgeState, canRecord, joinChallenge, pauseChallenge, recordChallenge } from '../src/features/badges/model.mjs';
import { transaction, undo } from '../src/domain/money.mjs';
const person = (name = 'alex') => ({l1: JSON.parse(readFileSync(new URL('../data/moments/' + ({alex:'m1-alex',elena:'m4-elena'}[name]) + '/l1.json',import.meta.url))),l2:{},ui:{awarded:[],history:[],receipts:[],chat:[],scroll:{}}});
test('20 distinct challenges have coherent rewards, commitments and visual identities',()=>{
 assert.equal(challenges.length,20); assert.equal(new Set(challenges.map(b=>b.id)).size,20);
 assert.equal(new Set(challenges.map(b=>b.motif)).size,20);
 for(const b of challenges){assert.ok(b.points>0);assert.ok(b.target>1);assert.ok(b.commitment);assert.ok(b.recovery);assert.ok(b.step||b.steps?.length===b.target);}
 assert.equal(Array.from({length:30},(_,i)=>i+1).reduce((a,b)=>a+b),465);
});
test('join and pause are reversible, isolated and never move money or award Points',()=>{
 const p=person(), before=structuredClone(p.l1);transaction(p,'Join',()=>joinChallenge(p,'growing-savings'));
 assert.equal(badgeState(p,'growing-savings').status,'active');assert.equal(joinChallenge(p,'growing-savings'),false);
 assert.equal(p.l1.rewards.points.balance,0);assert.deepEqual(p.l1.accounts,before.accounts);
 pauseChallenge(p,'growing-savings');assert.equal(canRecord(p,'growing-savings'),false);pauseChallenge(p,'growing-savings');assert.equal(canRecord(p,'growing-savings'),true);
 undo(p);assert.deepEqual(p.l1,before);
});
test('daily progress cannot be repeated, completion credits one bonus and earned badge survives spending',()=>{
 const p=person();joinChallenge(p,'little-often');
 for(let i=0;i<30;i++){p.l1.asOf=new Date(Date.UTC(2026,8,i+1)).toISOString().slice(0,10);assert.equal(canRecord(p,'little-often'),true);recordChallenge(p,'little-often');const n=badgeState(p,'little-often').count;assert.equal(recordChallenge(p,'little-often'),0);assert.equal(badgeState(p,'little-often').count,n);}
 assert.equal(p.l1.rewards.points.balance,100);assert.equal(p.l1.rewards.points.ledger.length,1);assert.equal(badgeState(p,'little-often').status,'earned');assert.equal(pauseChallenge(p,'little-often'),false);assert.equal(joinChallenge(p,'little-often'),false);
 p.l1.rewards.points.balance=0;assert.equal(badgeState(p,'little-often').status,'earned');
});
test('weekly and monthly confirmations use calendar periods, investment requires full elapsed months',()=>{
 const p=person();p.l1.asOf='2026-01-31';joinChallenge(p,'steady-investor');assert.equal(canRecord(p,'steady-investor'),false);
 p.l1.asOf='2026-02-27';assert.equal(canRecord(p,'steady-investor'),false);p.l1.asOf='2026-02-28';assert.equal(canRecord(p,'steady-investor'),true);recordChallenge(p,'steady-investor');
 p.l1.asOf='2026-03-01';assert.equal(canRecord(p,'steady-investor'),false);p.l1.asOf='2026-03-31';assert.equal(canRecord(p,'steady-investor'),true);
 joinChallenge(p,'spending-detective');recordChallenge(p,'spending-detective');p.l1.asOf='2026-04-01';assert.equal(canRecord(p,'spending-detective'),false);p.l1.asOf='2026-04-06';assert.equal(canRecord(p,'spending-detective'),true);
});
test('scenario earned badges reconcile with Points ledger; pending completion awards once without touching investments',()=>{
 const p=person('elena'), before=structuredClone(p.l1), balance=p.l1.rewards.points.balance;
 assert.equal(balance,p.l1.rewards.points.ledger.reduce((sum,x)=>sum+x.points,0));assert.equal(challenges.filter(b=>badgeState(p,b.id).status==='earned').length,6);
 assert.equal(recordChallenge(p,'in-touch'),0);assert.equal(recordChallenge(p,'steady-investor'),200);assert.equal(p.l1.rewards.points.balance,balance+200);assert.equal(recordChallenge(p,'steady-investor'),0);assert.deepEqual(p.l1.accounts,before.accounts);assert.deepEqual(p.l1.pots,before.pots);
});
test('unknown and unjoined challenges cannot mutate rewards',()=>{
 const p=person(),before=structuredClone(p.l1.rewards);assert.equal(joinChallenge(p,'missing'),false);assert.equal(recordChallenge(p,'missing'),0);assert.equal(recordChallenge(p,'in-touch'),0);assert.equal(pauseChallenge(p,'missing'),false);assert.deepEqual(p.l1.rewards,before);
});
