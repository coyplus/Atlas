import {test} from 'node:test';
import assert from 'node:assert/strict';
import {balanceScale,packBalances,separateHitAreas} from '../src/features/future/layout.mjs';
test('circle area compares money on one scale, including target rings',()=>{
  const goals=[{id:'a',balance:1000,target:4000},{id:'b',balance:4000}];
  const scale=balanceScale(goals),nodes=packBalances(goals,{a:1000,b:4000},scale);
  assert.equal(nodes[1].valueRadius/nodes[0].valueRadius,2);
  assert.equal(nodes[0].targetRadius,nodes[1].valueRadius);
  const future=packBalances(goals,{a:4000,b:16000},scale,nodes);
  assert.equal(future[0].valueRadius/nodes[0].valueRadius,2);
  assert.equal(future[0].targetRadius,nodes[0].targetRadius);
});
test('organic packing separates many simultaneous priorities without pagination',()=>{
  const goals=Array.from({length:24},(_,i)=>({id:String(i),balance:i*i*50,target:i%2?i*i*200:null}));
  const values=Object.fromEntries(goals.map(g=>[g.id,g.balance]));
  const nodes=packBalances(goals,values,balanceScale(goals));
  for(const a of nodes)for(const b of nodes){if(a===b)continue;assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>=a.radius+b.radius+13.9);}
  assert.deepEqual(packBalances(goals,values,balanceScale(goals)),nodes);
  assert.equal(nodes[0].valueRadius,0);
});

test('small-screen tap targets stay separate without distorting monetary circle areas', () => {
 const goals=Array.from({length:10},(_,i)=>({id:String(i),balance:100+500*i,target:10000}));
 const nodes=packBalances(goals,Object.fromEntries(goals.map(g=>[g.id,g.balance])),balanceScale(goals));
 const original=structuredClone(nodes), points=separateHitAreas(nodes,.12);
 for(let i=0;i<points.length;i++) for(let j=i+1;j<points.length;j++) {
  const a=points[i],b=points[j]; assert.ok(Math.hypot(a.x-b.x,a.y-b.y)>=a.hitRadius+b.hitRadius+3.99);
 }
 assert.deepEqual(nodes,original);
 assert.deepEqual(points.map(n=>n.valueRadius),nodes.map(n=>n.valueRadius));
});
