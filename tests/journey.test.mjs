import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {journeyModel,milestoneDate} from '../src/features/journey/model.mjs';
const person=(folder)=>({l1:JSON.parse(readFileSync(new URL('../data/moments/'+folder+'/l1.json',import.meta.url)))});
test('journey dates keep their precision and exclude future plans',()=>{
 assert.equal(milestoneDate('2020'),'2020');assert.equal(milestoneDate('2026-01'),'January 2026');
 const p=person('m4-elena'),m=journeyModel(p);assert.equal(m.events.length,6);assert.equal(m.recent.length,3);assert.equal(m.events[0].id,'decade');assert.equal(m.events.at(-1).id,'joined');
 p.l1.relationship.milestones.push({date:'2028-01',event:'Not yet',story:{id:'later'}});assert.equal(journeyModel(p).events.length,6);
});
test('partial dates retain recorded ordering; milestones never change financial state',()=>{
 const p=person('m3-sam'),before=structuredClone(p),m=journeyModel(p);
 assert.equal(m.events.at(-1).id,'joined');assert.equal(m.events.at(-2).id,'personality');assert.equal(m.events.find(x=>x.id==='safety-buffer').figure,'90');assert.deepEqual(p,before);
});
