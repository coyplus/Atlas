import test from 'node:test';
import assert from 'node:assert/strict';
import {seed,simulate,suggest,interpret} from '../public/concepts/future/model.mjs';
const pause={id:'pause',kind:'pause',goal:'home',months:6,to:'cash'};
test('combined ideas conserve every monthly funding pool without negative flows',()=>{
 const ideas=suggest();
 for(const selected of [[],ideas,[ideas[0],pause],[{...pause,to:'buffer'}],[{kind:'remove',goal:'home'}],[{kind:'add',goal:{id:'custom',name:'Trip',start:0,target:3000,rate:50}}]])
  for(const s of simulate(seed,selected).snapshots){
   assert.ok(Math.abs(Object.values(s.flow).reduce((a,b)=>a+b,0)-s.budget)<.001);
   assert.ok(Object.values(s.flow).every(v=>v>=0));
  }
});
test('pause keeps money in the requested destination and resumes after six months',()=>{
 const cash=simulate(seed,[pause]),buffer=simulate(seed,[{...pause,to:'buffer'}]);
 for(let m=0;m<6;m++){assert.equal(cash.snapshots[m].flow.home,0);assert.equal(cash.snapshots[m].flow.cash,150);assert.equal(buffer.snapshots[m].flow.home,0);assert.equal(buffer.snapshots[m].flow.cash,0);}
 assert.equal(cash.snapshots[6].flow.home,150);
 assert.ok(buffer.snapshots[6].values.buffer>cash.snapshots[6].values.buffer);
});
test('priority changes both affected dates without changing monthly funding or protected repayments',()=>{
 const base=simulate(),alt=simulate(seed,[suggest()[1]]);
 assert.ok(alt.dates.home>base.dates.home);assert.ok(alt.dates.buffer<base.dates.buffer);
 assert.equal(alt.dates.loan,base.dates.loan);assert.equal(alt.snapshots[0].budget,850);
});
test('conversation recognises the example and a follow-up without claiming unsupported requests',()=>{
 const a=interpret('What if I pause my Future Home contributions for six months?');
 assert.equal(a.months,6);assert.equal(a.goal,'home');
 assert.equal(interpret('Make it three months instead',a).months,3);
 assert.equal(interpret('Send it to the buffer instead',a).to,'buffer');
 assert.ok(interpret('Pause my loan repayments').error);assert.ok(interpret('Move to Mars').error);
});
test('simulation is isolated and investment scenarios widen with time',()=>{
 const copy=JSON.stringify(seed);simulate(seed,suggest());assert.equal(JSON.stringify(seed),copy);
 const low=simulate(seed,[],-.02),high=simulate(seed,[],.07),spread=m=>high.snapshots[m].net-low.snapshots[m].net;
 assert.equal(spread(0),0);assert.ok(spread(120)>spread(60));assert.ok(spread(60)>spread(12));
});
