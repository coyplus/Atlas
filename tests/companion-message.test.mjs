import test from 'node:test';
import assert from 'node:assert/strict';
import { companionMessage, companionSignal } from '../src/features/support/message.mjs';
test('single-style messages preserve attention details and explicit single messages', () => {
  assert.equal(companionMessage({ title: 'Needs attention', message: 'Your benefit is paused.', attentionKey: 'benefit' }), 'Needs attention. Your benefit is paused.');
  assert.equal(companionMessage({ title: 'A possibility is enough to begin.', message: 'extra', singleMessage: true }), 'A possibility is enough to begin.');
  assert.equal(companionMessage({ title: 'Heading', message: 'The useful observation.' }), 'The useful observation.');
});
test('attention takes priority over discovery and ordinary messages keep their avatar', () => {
  assert.match(companionSignal({ action: 'quiz' }, false), /is-curious/);
  assert.match(companionSignal({ action: 'quiz', attentionKey: 'warning' }, false), /is-important/);
  assert.equal(companionSignal({ action: 'support:discuss' }, false), '');
});
