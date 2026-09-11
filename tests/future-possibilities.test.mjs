import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createSession, clone } from '../src/domain/money.mjs';
import { forecast, applyExperiments, toggleExperiment } from '../src/domain/future.mjs';
import { horizonPossibilities, visiblePossibilities, possibilityExperiment } from '../src/features/ideas/horizon.mjs';
import { futureModel } from '../src/features/future/views.mjs';
import { dismissPossibility } from '../src/features/ideas/model.mjs';
import { potAppearance, safePotPhoto, potColours, contrastInk } from '../src/features/pots/appearance.mjs';
const data = JSON.parse(fs.readFileSync(new URL('../public/scenarios.json', import.meta.url)));
const people = () => createSession(data).people;

test('Sam earmarks existing money without changing Premier eligibility or monthly commitments', () => {
 const p=people().sam, m=forecast(p);
 assert.equal(m.net,98000); assert.equal(100000-m.net,2000); assert.equal(m.speed,420);
 assert.equal(p.l1.pots.find(g=>g.id==='ac-savings').balance,72727.66);
 assert.equal(['ella-next','my-own','friends'].reduce((v,id)=>v+p.l1.pots.find(g=>g.id===id).balance,0),10000);
 for(const id of ['ella-next','my-own','friends']) { assert.equal(m.dates[id],null); assert.equal(forecast(p,[],240).values[id],m.values[id]); }
});

test('discovery, dismissal and photo personalisation cannot add money to any projection', () => {
 for(const p of Object.values(people())) {
  const before=JSON.stringify(p), baseline=forecast(p,[],180);
  const list=horizonPossibilities(p); assert.ok(list.length>=3);
  assert.ok(list.every(i=>i.month>0&&i.month<=240));
  assert.equal(visiblePossibilities(p,{month:180}).length,2);
  futureModel(p,{month:180}); assert.equal(JSON.stringify(p),before);
  dismissPossibility(p,list[0].id); assert.ok(!horizonPossibilities(p).some(i=>i.id===list[0].id));
  p.ui.potAppearance={anything:{colour:'peach',photo:'/assets/stories/horizon.jpg'}};
  const after=forecast(p,[],180); assert.equal(after.net,baseline.net); assert.deepEqual(after.values,baseline.values);
  assert.deepEqual(horizonPossibilities(p,{member:'someone-else'}),[]);
 }
});

test('every ghost can become a reversible experiment, then the same funded Pot after approval', () => {
 for(const p of Object.values(people())) for(const idea of horizonPossibilities(p)) {
  const original=JSON.stringify(p.l1), draft=clone(p), experiment=possibilityExperiment(idea);
  toggleExperiment(draft,experiment);
  assert.equal(JSON.stringify(draft.l1),original);
  assert.ok(!horizonPossibilities(draft).some(i=>i.key===idea.key));
  const trial=forecast(draft,draft.ui.future.ideas,idea.month);
  assert.equal(forecast(draft,draft.ui.future.ideas,0).net,forecast(p).net);
  assert.equal(trial.values[idea.id],idea.target);
  applyExperiments(draft,draft.ui.future.ideas);
  const actual=forecast(draft,[],idea.month);
  assert.equal(actual.net,trial.net); assert.deepEqual(actual.values,trial.values);
  assert.ok(!horizonPossibilities(draft).some(i=>i.key===idea.key));
 }
});

test('photo rendering accepts only local approved assets or decoded raster data', () => {
 const p=people().sam,item=p.l1.pots.find(g=>g.id==='hol');
 assert.equal(potAppearance(p,item).photo,'/assets/stories/horizon.jpg');
 p.ui.potAppearance={hol:{colour:'lilac',photo:''}};
 assert.deepEqual(potAppearance(p,item),{colour:'lilac',photo:''});
 for(const src of ['https://tracking.invalid/p.png','javascript:alert(1)','data:image/svg+xml;base64,AAAA']) assert.equal(safePotPhoto(src),'');
});


test('every Pot pigment chooses the more legible black or white ink', () => {
  assert.equal(contrastInk('#477895'), '#ffffff');
  assert.equal(contrastInk('#d7ac92'), '#000000');
  for(const [,hex] of Object.values(potColours)) {
    const rgb=hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
    const L=rgb.reduce((sum,x,n)=>sum+x*[.2126,.7152,.0722][n],0);
    const contrast=contrastInk(hex)==='#000000'?(L+.05)/.05:1.05/(L+.05);
    assert.ok(contrast>=4.5, `${hex}: ${contrast}`);
  }
});
