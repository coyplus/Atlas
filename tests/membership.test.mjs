import {test} from 'node:test';
import assert from 'node:assert/strict';
import {membershipModel,saveMembershipChoices} from '../src/features/membership/model.mjs';
const person = n => ({l1:{accounts:[{id:'current',name:'HSBC',balance:n,kind:'current'}],pots:[]},ui:{}});
test('membership thresholds are inclusive and TRB counts balances once without debt or external connections',()=>{
 for(const [value,tier] of [[0,'hsbc'],[99999.99,'hsbc'],[100000,'premier'],[249999.99,'premier'],[250000,'elite']])assert.equal(membershipModel(person(value)).tier.id,tier);
 const p=person(50000);p.l1.pots=[{id:'pot',name:'Saving',balance:40000},{id:'invest',name:'Invested',balance:10000},{id:'current',balance:50000},{id:'loan',balance:10000,isDebt:true}];
 p.ui.connectedBanks=[{balance:100000}];
 const m=membershipModel(p);assert.equal(m.trb,100000);assert.equal(m.remaining,150000);assert.equal(m.holdings.length,3);
 p.l1.accounts[0].balance-=1000;p.l1.pots[0].balance+=1000;assert.equal(membershipModel(p).trb,100000);
});
test('membership choices are tier restricted, capped and separate from Points and money',()=>{
 const p=person(120000);p.l1.rewards={points:{balance:800}};
 assert.throws(()=>saveMembershipChoices(p,['sport']));
 assert.throws(()=>saveMembershipChoices(p,['culture','family','career','protection']));
 saveMembershipChoices(p,['culture','family','culture']);
 assert.deepEqual(p.ui.membershipChoices,['culture','family']);assert.equal(membershipModel(p).available,1);
 assert.equal(p.l1.rewards.points.balance,800);assert.equal(p.l1.accounts[0].balance,120000);
 p.l1.accounts[0].balance=250000;saveMembershipChoices(p,['sport','legacy']);assert.equal(membershipModel(p).available,3);
 p.l1.accounts[0].balance=100000;assert.equal(membershipModel(p).active.length,0);assert.equal(p.ui.membershipChoices.length,2);
});

test('Sam starts £2,000 from Premier and a saving rule preserves cash, TRB and Points', async()=>{
 const {readFileSync}=await import('node:fs');
 const {membershipSuggestion,saveMembershipRule}=await import('../src/features/membership/model.mjs');
 const {moduleModel}=await import('../src/domain/numbers.mjs');
 const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),'utf8'));
 const p={l1:read('../data/moments/m3-sam/l1.json'),l2:read('../data/moments/m3-sam/l2.json'),ui:{receipts:[]}};
 const catalogue=read('../data/shared/modules.json');
 assert.equal(membershipModel(p).trb,98000);
 assert.equal(membershipSuggestion(p).limit,1300);
 assert.equal(moduleModel(p,'goldenratio',catalogue).value,'£1,300.44');
 assert.throws(()=>saveMembershipRule(p,1301));
 const rule=saveMembershipRule(p,500);
 assert.equal(rule.potId,'un');assert.equal(rule.source,'ac-cur');
 assert.equal(membershipModel(p).trb,98000);assert.equal(p.l1.accounts[0].balance,3120.44);
 assert.equal(p.l1.rewards.points.balance,480);
 assert.equal(moduleModel(p,'goldenratio',catalogue).value,'£800.44');
 saveMembershipRule(p,500);assert.equal(p.l1.rules.filter(r=>r.id===rule.id).length,1);
 p.l1.autonomy.paused=true;assert.equal(membershipSuggestion(p).paused,true);
 p.l1.accounts[0].balance+=2000;assert.equal(membershipModel(p).tier.id,'premier');
 assert.equal(membershipSuggestion(p),null);
});
