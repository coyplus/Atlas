import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createSession, completeQuiz, confirmBelief } from '../src/domain/money.mjs';
import { portraitModel, portraitArt } from '../src/features/you/portrait.mjs';
const data = JSON.parse(readFileSync(new URL('../public/scenarios.json', import.meta.url)));
const person = id => createSession(data).people[id];
test('portrait evolves after answers and confirmation, independently of money and tier', () => {
  const p = person('alex'), outline = portraitModel(p);
  completeQuiz(p, [0,1,2]);
  const formed = portraitModel(p);
  assert.ok(formed.layers > outline.layers);
  confirmBelief(p, p.l2.beliefs[0].id);
  const confirmed = portraitArt(portraitModel(p));
  assert.ok(portraitModel(p).layers > formed.layers);
  p.l1.customer.tier = 'Premier';
  p.l1.rewards.points.balance = 900000;
  p.l1.accounts[0].balance = 1000000;
  assert.equal(portraitArt(portraitModel(p)), confirmed);
  confirmBelief(p, p.l2.beliefs[0].id);
  assert.equal(portraitArt(portraitModel(p)), confirmed);
});
test('same profile stays deterministic; shared profiles use only their own traits', () => {
  const p = person('elena');
  const shared = portraitModel(p,'aisha');
  assert.equal(shared.dominant, 'Spontaneity');
  assert.equal(shared.self, false);
  const before = portraitArt(shared);
  p.ui.confirmed = true;
  p.l2.beliefs.push({status:'confirmed'});
  assert.equal(portraitArt(portraitModel(p,'aisha')), before);
  assert.notEqual(portraitArt(portraitModel(p)), before);
  assert.equal(portraitModel(p,'unshared').self, true);
  assert.equal(portraitModel(p,'household').householdPalettes.length, 3);
});
test('trait changes alter the composition and the starting outline contains no inferred traits', () => {
  const p = person('alex');
  assert.equal(portraitModel(p).traits.length, 0);
  assert.equal(portraitModel(p).named, false);
  const a = person('sam'), first = portraitArt(portraitModel(a));
  a.l2.personality.traits = [['Spontaneity',5],['Planning',1]];
  assert.notEqual(portraitArt(portraitModel(a)), first);
});
test('evidence depth makes Elena substantially richer than a limited shared profile', () => {
  const p = person('elena'), elena = portraitModel(p), leo = portraitModel(p,'leo');
  assert.equal(elena.fidelity, 'rich');
  assert.equal(leo.fidelity, 'early');
  assert.ok(elena.layers > leo.layers * 4);
  assert.ok((portraitArt(elena).match(/data-evidence-echo/g)||[]).length >= 8);
  assert.equal((portraitArt(leo).match(/data-evidence-echo/g)||[]).length, 0);
  // Inviting someone adds no knowledge and must not enrich an existing portrait.
  const before = portraitArt(elena);
  p.ui.requests.push({kind:'invite',name:'New member',status:'Awaiting consent'});
  assert.equal(portraitArt(portraitModel(p)), before);
});
test('trait shape language is distinct and survives greyscale presentation', async () => {
  const {traitGlyph,traitLanguage} = await import('../src/features/you/portrait.mjs');
  assert.equal(new Set(Object.values(traitLanguage).map(t=>t.shape)).size,6);
  assert.equal(new Set(Object.keys(traitLanguage).map(t=>traitGlyph(t).replace(/#[\dA-Fa-f]{6}/g,'#000000'))).size,6);
});
