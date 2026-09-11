import {test} from 'node:test';
import assert from 'node:assert/strict';
import {supportState} from '../app/support-system.mjs';
test('conversation replaces support while independently started audio remains available',()=>{for(const audio of ['playing','paused','ended','error']){const s=supportState({surface:'conversation',audio,audioStarted:true});assert.equal(s.visible,false);assert.equal(s.actions,false);assert.equal(s.player,true);}});
test('detail defaults to compact regardless of playback',()=>{for(const audio of ['unavailable','available','playing','paused']){const s=supportState({surface:'detail',audio});assert.equal(s.engagement,'compact');assert.equal(s.actions,false);assert.equal(s.visible,true);}});
test('audio does not hide main-page copy or actions',()=>{const s=supportState({surface:'main',audio:'playing',audioStarted:true});assert.equal(s.player,true);assert.equal(s.actions,true);assert.equal(s.engagement,'expanded');});
test('journeys expose help without a card or thinking state, independently of audio',()=>{for(const audioStarted of [false,true]){const s=supportState({surface:'journey',thinking:true,audioStarted});assert.equal(s.visible,false);assert.equal(s.details,false);assert.equal(s.actions,false);assert.equal(s.thinking,false);assert.equal(s.header,'screen');assert.equal(s.player,audioStarted);}});
