import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {validSession} from '../src/platform/session.ts';
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
