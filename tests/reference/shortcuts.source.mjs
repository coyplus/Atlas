import {test} from 'node:test';
import assert from 'node:assert/strict';
import {moveShortcut} from '../app/now-system.mjs';
test('drag swaps and removals conserve unique shortcuts with at most three positions',()=>{
 const original=['pay','transfer','addmoney'];
 assert.deepEqual(moveShortcut(original,'pay','2'),['addmoney','transfer','pay']);
 assert.deepEqual(moveShortcut(original,'statements','0'),['statements','transfer','addmoney']);
 assert.deepEqual(moveShortcut(original,'pay','available'),['transfer','addmoney']);
 assert.deepEqual(moveShortcut(['transfer','addmoney'],'pay','2'),['transfer','addmoney','pay']);
 assert.deepEqual(moveShortcut(original,'unknown','1'),original);
 assert.deepEqual(moveShortcut(original,'pay','4'),original);
 assert.deepEqual(original,['pay','transfer','addmoney']);
});
