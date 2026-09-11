import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkinModel, contextualReflection, instincts, purchases, resultFor, reviewCards, saveCheckin } from '../src/features/checkin/model.mjs';
import { canCheckin, completeDaily, dailyCheckin } from '../src/features/checkin/daily.mjs';
import { toolReflection } from '../src/features/checkin/reflection.mjs';
const person = () => ({l1:{asOf:'2026-09-10',customer:{id:'alex'},transactions:[],rewards:{points:{balance:100,ledger:[]}}},l2:{beliefs:[]},ui:{moneyFeelings:[],awarded:[]}});
const future = () => ({tool:'ahead',future:'space',horizon:'A year from now',note:''});
test('one daily completion awards exactly five Points, including across tools, deletion and reload',()=>{
 const p=person(), d=future();p.ui.moneyFeelings=[{date:'2026-09-09',feeling:'calm'}];
 const r=saveCheckin(p,d,undefined,false);
 assert.equal(checkinModel(p).streak,2);assert.equal(checkinModel(p).memories.length,0);
 assert.equal(p.l1.rewards.points.balance,105);assert.equal(d.reward,5);
 assert.equal(saveCheckin(p,d,'again',true).id,r.id);
 assert.throws(()=>saveCheckin(p,future(),'again',false),/complete/);
 assert.equal(canCheckin(p,'feeling'),false);
 p.ui.checkins=[];
 const copy=structuredClone(p);assert.equal(dailyCheckin(copy).tool,'ahead');
 assert.equal(completeDaily(copy,'feeling','feeling-date').awardedNow,0);
 assert.equal(copy.l1.rewards.points.balance,105);
 copy.l1.asOf='2026-09-11';saveCheckin(copy,future(),undefined,false);
 assert.equal(copy.l1.rewards.points.balance,110);assert.equal(checkinModel(copy).streak,3);
});
test('feeling edits do not earn twice; records are dated per customer',()=>{
 const p=person();completeDaily(p,'feeling','feeling-2026-09-10');
 assert.equal(canCheckin(p,'feeling'),true);assert.equal(canCheckin(p,'worth'),false);
 completeDaily(p,'feeling','feeling-2026-09-10');assert.equal(p.l1.rewards.points.ledger.length,1);
 assert.equal(dailyCheckin(person()),null);
});
test('private, forgotten and other-household memories cannot drive later support',()=>{
 const p=person(), s={tab:'future',member:'self'}, context={kind:'top'};
 saveCheckin(p,future(),'More family time',false);
 assert.equal(contextualReflection(p,s,context),null);
 p.ui.checkins[0].remember=true;
 assert.match(contextualReflection(p,s,context).message,/More family time/);
 assert.equal(contextualReflection(p,{...s,member:'riley'},context),null);
 assert.equal(contextualReflection(p,{tab:'you',member:'self'},context),null);
 assert.equal(contextualReflection(p,s,{kind:'dialog',title:'Money check-in'}),null);
 p.ui.checkins[0].insight='A little room to learn';
 assert.match(contextualReflection(p,s,context).message,/room to learn/);
 p.ui.checkins[0].remember=false;assert.equal(contextualReflection(p,s,context),null);
});
test('review preserves source beliefs and excludes investment-risk claims from playful swipes',()=>{
 const p=person();p.l2.beliefs=[{id:'family',claim:'Family first',evidence:'Last review',status:'confirmed'},{id:'risk',claim:'You’d hold through a 20% dip',status:'confirmed'}];
 const before=JSON.stringify(p.l2.beliefs),cards=reviewCards(p);
 assert.equal(cards.length,1);
 const d={tool:'instinct',mode:'review',cards,answers:['no'],corrections:{0:'I need time for myself too'}};
 assert.match(resultFor(p,d).text,/time for myself/);
 saveCheckin(p,d,undefined,false);assert.equal(JSON.stringify(p.l2.beliefs),before);
 const empty=person();assert.throws(()=>saveCheckin(empty,{tool:'instinct',cards:instincts,answers:['skip','skip','skip','skip','skip']},'',false));
 assert.equal(empty.l1.rewards.points.balance,100);assert.equal(dailyCheckin(empty),null);
});
test('purchase reflection excludes transfers, debt payments, future entries and other members',()=>{
 const p=person();p.l1.transactions=[
 {id:'coffee',amount:-5,date:'2026-09-09',category:'eating-out',counterparty:'Coffee'},
 {id:'transfer',amount:-50,date:'2026-09-09',category:'transfer'},
 {id:'debt',amount:-50,date:'2026-09-09',category:'debt'},
 {id:'future',amount:-5,date:'2026-09-12',category:'groceries'},
 {id:'other',amount:-5,date:'2026-09-09',category:'eating-out',memberId:'riley'},
 ];
 assert.deepEqual(purchases(p).map(x=>x.id),['coffee']);
 assert.equal(resultFor(p,{tool:'worth',purchase:'transfer',verdict:'A little mixed'}),null);
});
test('optional reflection responds to reasons and verdict without inferring a product need',()=>{
 const d={tool:'worth',verdict:'A little mixed',reasons:['Time back']};
 assert.match(toolReflection(d).question,/mixed feelings.*time back/);
 d.reasons.push('Connection');const prompt=toolReflection(d);
 assert.equal(prompt.focus,true);assert.deepEqual(prompt.choices,['Time back','Connection']);
 d.reflectionFocus='Connection';assert.match(toolReflection(d).question,/moment with someone/);
 assert.notEqual(toolReflection(d).key,toolReflection({...d,verdict:'Glad I chose it'}).key);
});
test('stamp card shows seven calendar days, deduplicates tools and preserves an earned stamp after deletion',()=>{
 const p=person(); p.l1.asOf='2026-10-02';
 p.ui.moneyFeelings=[{date:'2026-09-30',feeling:'calm'},{date:'2026-10-01',feeling:'hopeful'}];
 p.ui.checkinDays=[{date:'2026-10-01',tool:'feeling'}];
 let m=checkinModel(p);
 assert.deepEqual(m.days.map(d=>d.date),['2026-09-26','2026-09-27','2026-09-28','2026-09-29','2026-09-30','2026-10-01','2026-10-02']);
 assert.equal(m.days.filter(d=>d.complete).length,2);assert.equal(m.streak,2);
 assert.equal(m.days.at(-1).today,true);assert.equal(m.days.at(-1).complete,false);
 saveCheckin(p,future(),undefined,false);p.ui.checkins=[];
 m=checkinModel(p);assert.equal(m.days.at(-1).complete,true);assert.equal(m.streak,3);
});
