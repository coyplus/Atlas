import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {validSession,upgradeSession} from '../src/platform/session.ts';
import {createSession} from '../src/domain/money.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../public/scenarios.json',import.meta.url)));
test('persisted sessions reject missing people and malformed navigation before boot',()=>{const session=createSession(data);assert.equal(validSession(session),true);for(const value of [null,{}, {...session,person:'unknown'},{...session,people:{alex:session.people.alex}},{...session,tab:'missing'}])assert.equal(validSession(value),false)});
test('all media references are local files with preserved assets',()=>{const media=JSON.parse(fs.readFileSync(new URL('../public/media.json',import.meta.url)));for(const url of [...Object.values(media.portraits),...Object.values(media.bankLogos),media.audio.src]){assert.ok(url.startsWith('/assets/'));assert.ok(fs.statSync(new URL('../public'+url,import.meta.url)).size>0)}for(const size of [192,512])assert.ok(fs.statSync(new URL('../public/app-icon-'+size+'.png',import.meta.url)).size>0)});

// Story assets must survive preparation even when their name matches an excluded root original.
test('every Story photograph is shipped locally, byte-for-byte', async()=>{
 const {storyPlate}=await import('../src/features/stories/model.mjs');
 const data=JSON.parse(fs.readFileSync(new URL('../public/scenarios.json',import.meta.url)));
 for(const person of Object.values(data.moments)) for(const story of person.l2.stories){
  const path=storyPlate(story.id);
  assert.deepEqual(fs.readFileSync(new URL('../public'+path,import.meta.url)),fs.readFileSync(new URL('..'+path,import.meta.url)));
 }
 assert.equal(fs.existsSync(new URL('../public/assets/conversation.jpg',import.meta.url)),false);
});


test('Alex starts with a wide current account and only untouched legacy layouts are upgraded',()=>{
 const fresh=createSession(data);
 assert.equal(fresh.people.alex.ui.order[0],'container-ac-cur');
 assert.equal(fresh.people.alex.ui.sizes['container-ac-cur'],'W');
 const legacy=structuredClone(fresh);
 legacy.people.alex.ui.order[0]='balance';
 legacy.people.alex.ui.sizes={balance:'W',activity:'W'};
 const financial=JSON.stringify(legacy.people.alex.l1);
 const sam=JSON.stringify(legacy.people.sam);
 const reordered=structuredClone(legacy);
 reordered.people.alex.ui.order.reverse();
 const resized=structuredClone(legacy);
 resized.people.alex.ui.sizes.balance='T';
 for(const custom of [reordered,resized]){
  const before=JSON.stringify(custom);
  upgradeSession(custom);
  assert.equal(JSON.stringify(custom),before);
 }
 upgradeSession(legacy);
 assert.deepEqual(legacy.people.alex.ui.order,fresh.people.alex.ui.order);
 assert.deepEqual(legacy.people.alex.ui.sizes,fresh.people.alex.ui.sizes);
 assert.equal(JSON.stringify(legacy.people.alex.l1),financial);
 assert.equal(JSON.stringify(legacy.people.sam),sam);
 const migrated=JSON.stringify(legacy);
 upgradeSession(legacy);
 assert.equal(JSON.stringify(legacy),migrated);
});
