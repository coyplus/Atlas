import {test} from 'node:test';
import assert from 'node:assert/strict';
import {feelingModel, saveFeeling, shiftDay} from '../src/features/you/feelings.mjs';
const person = () => ({l1:{asOf:'2026-09-10',customer:{id:'alex'}},ui:{moneyFeelings:[]}});
test('daily streak counts distinct consecutive dates and survives repeat edits',()=>{
 const p=person();
 p.ui.moneyFeelings=[{date:'2026-09-08',feeling:'okay'},{date:'2026-09-09',feeling:'calm'}];
 assert.equal(feelingModel(p).streak,2);
 saveFeeling(p,{feeling:'worried',reasons:['Bills','Bills','invalid'],note:'  hello  '});
 assert.equal(feelingModel(p).streak,3);
 saveFeeling(p,{feeling:'hopeful',reasons:[],note:''});
 assert.equal(feelingModel(p).streak,3);
 assert.equal(p.ui.moneyFeelings.length,3);
 assert.equal(feelingModel(p).entry.feeling,'hopeful');
});
test('gaps reset the streak without removing history; no future entries count',()=>{
 const p=person();p.ui.moneyFeelings=[{date:'2026-09-07',feeling:'calm'},{date:'2026-09-11',feeling:'calm'}];
 assert.equal(feelingModel(p).streak,0);
 saveFeeling(p,{feeling:'okay'});
 assert.equal(feelingModel(p).streak,1);
 assert.equal(p.ui.moneyFeelings.length,3);
 assert.equal(feelingModel(p).week.length,7);
 assert.equal(shiftDay('2026-03-01',-1),'2026-02-28');
});
test('invalid feeling does not save; notes are bounded and reasons validated',()=>{
 const p=person(); assert.throws(()=>saveFeeling(p,{feeling:'invalid'}));
 assert.equal(p.ui.moneyFeelings.length,0);
 saveFeeling(p,{feeling:'calm',reasons:['Bills','Bills','unknown'],note:'x'.repeat(600)});
 assert.deepEqual(feelingModel(p).entry.reasons,['Bills']);
 assert.equal(feelingModel(p).entry.note.length,500);
});

test('reflection prompts match mood and reason; saved reflections cannot be stale', async () => {
  const {reflectionPrompt} = await import('../src/features/you/feeling-reflection.mjs');
  const p=person();
  const draft={feeling:'worried',reasons:['Bills']};
  const prompt=reflectionPrompt(draft);
  assert.match(prompt.question,/bills/);
  assert.notEqual(prompt.question,reflectionPrompt({feeling:'calm',reasons:['Bills']}).question);
  saveFeeling(p,{...draft,reflection:{key:prompt.key,answer:prompt.choices[1]}});
  assert.equal(feelingModel(p).entry.reflection.answer,'The payment dates');
  saveFeeling(p,{...draft,feeling:'calm',reflection:{key:prompt.key,answer:prompt.choices[1]}});
  assert.equal(feelingModel(p).entry.reflection,undefined);
});

test('multi-reason prompts are order independent and use connection or focus patterns', async () => {
  const {reflectionPrompt, reflectionFollowup} = await import('../src/features/you/feeling-reflection.mjs');
  const draft={feeling:'worried',reasons:['Bills','Family']};
  const prompt=reflectionPrompt(draft);
  assert.equal(prompt.kind,'connection');
  assert.match(prompt.question,/family costs/);
  assert.deepEqual(prompt,reflectionPrompt({...draft,reasons:['Family','Bills','Bills']}));
  assert.match(reflectionFollowup({...draft,reflection:{answer:'Separate concerns'}}),/first/);
  const many={feeling:'worried',reasons:['Savings','Family','Bills']};
  const focus=reflectionPrompt(many);
  assert.equal(focus.kind,'focus');
  assert.deepEqual(focus.choices,['Bills','Savings','Family']);
  assert.match(reflectionFollowup({...many,reflection:{answer:'Savings'}}),/saving/);
  assert.equal(reflectionPrompt({...draft,reasons:['Bills','Something else']}).kind,'focus');
  const p=person();
  saveFeeling(p,{...draft,reflection:{key:prompt.key,answer:prompt.choices[0]}});
  assert.equal(feelingModel(p).entry.reflection.answer,'They’re connected');
  saveFeeling(p,{...draft,reasons:['Bills','Savings'],reflection:{key:prompt.key,answer:prompt.choices[0]}});
  assert.equal(feelingModel(p).entry.reflection,undefined);
});

test('all feeling and reason combinations have bounded, valid reflection paths', async () => {
  const {reflectionPrompt, reflectionFollowup} = await import('../src/features/you/feeling-reflection.mjs');
  const {feelings,feelingReasons} = await import('../src/features/you/feelings.mjs');
  for(const f of feelings) for(let mask=0;mask<64;mask++) {
    const reasons=feelingReasons.filter((_,i)=>mask & (1<<i));
    const draft={feeling:f.id,reasons};
    const prompt=reflectionPrompt(draft);
    assert.ok(prompt.question && !prompt.question.includes('undefined'));
    assert.ok(prompt.choices.length>=2 && prompt.choices.length<=6);
    assert.equal(new Set(prompt.choices).size,prompt.choices.length);
    assert.deepEqual(prompt,reflectionPrompt({...draft,reasons:[...reasons].reverse()}));
    for(const answer of [...prompt.choices,'In my own words'])
      assert.ok(reflectionFollowup({...draft,reflection:{answer}}));
  }
});
