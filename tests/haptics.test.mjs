import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createHapticEngine,
  createMilestoneTracker,
  hapticPatterns,
  outcomeCue,
} from '../src/platform/haptic-language.mjs';
function harness() {
  let time = 0,
    enabled = true;
  const jobs = [],
    played = [];
  const engine = createHapticEngine({
    available: () => enabled,
    play: (p) => played.push(p),
    now: () => time,
    defer: (f) => jobs.push(f),
  });
  return {
    engine,
    played,
    flush: () => {
      while (jobs.length) jobs.shift()();
    },
    advance: (n) => (time += n),
    disable: () => (enabled = false),
  };
}
test('one action produces the highest priority cue, never a stack or delayed replay', () => {
  const h = harness();
  h.engine.request('selection');
  h.engine.request('success');
  h.engine.request('reward');
  h.flush();
  assert.deepEqual(h.played, [hapticPatterns.reward]);
  h.engine.request('snap');
  h.flush();
  h.advance(5000);
  h.flush();
  assert.equal(h.played.length, 1);
});
test('attention overrides success; repeats and rapid low priority cues are bounded', () => {
  const h = harness();
  h.engine.request('success');
  h.engine.request('attention', 'invalid-form');
  h.flush();
  assert.deepEqual(h.played[0], hapticPatterns.attention);
  h.advance(3500);
  h.engine.request('attention', 'invalid-form');
  h.flush();
  assert.equal(h.played.length, 1);
  const r = harness();
  for (let i = 0; i < 12; i++) {
    r.engine.request('selection', 'boundary-' + i);
    r.flush();
    r.advance(610);
  }
  assert.equal(r.played.length, 6); // At most three in either five-second window.
});
test('disabled/background policy and cancellation discard pending feedback', () => {
  const h = harness();
  h.engine.request('success');
  h.disable();
  h.flush();
  assert.equal(h.played.length, 0);
  const c = harness();
  c.engine.request('success');
  c.engine.clear();
  c.flush();
  assert.equal(c.played.length, 0);
});
test('blocked hardware cannot throw into banking interactions', () => {
  const engine = createHapticEngine({
    available: () => true,
    play: () => {
      throw Error('blocked');
    },
    defer: (f) => f(),
  });
  assert.doesNotThrow(() => engine.request('success'));
});
test('Time Travel has one cue per crossed milestone, three per gesture, no render or jitter pulses', () => {
  const t = createMilestoneTracker(),
    dates = { a: 12, b: 24, c: 48, d: 60, e: 90, unknown: null };
  t.begin();
  assert.equal(t.cross(0, 1, dates), null);
  assert.equal(t.cross(1, 25, dates), 'b');
  assert.equal(t.cross(25, 0, dates), null);
  assert.equal(t.cross(0, 25, dates), null);
  assert.equal(t.cross(25, 48, dates), 'c');
  assert.equal(t.cross(48, 60, dates), 'd');
  assert.equal(t.cross(60, 100, dates), null);
  t.begin();
  assert.equal(t.cross(100, 80, dates), 'e');
  assert.equal(t.cross(80, 80, dates), null);
});
const before = {
  person: 'sam',
  points: 480,
  days: 0,
  receipts: 1,
  order: 'a,b',
  persistent: 'old',
  selection: 'a',
};
test('success means a verified outcome, not a save/done action name', () => {
  for (const action of [
    'save-pot',
    'checkin-save',
    'checkin-done',
    'transfer-confirm',
    'future-commit',
    'future-try',
  ])
    assert.equal(outcomeCue(action, before, before), null);
  assert.equal(outcomeCue('checkin-save', before, { ...before, days: 1, points: 485 }), 'success');
  assert.equal(outcomeCue('badge-record:one', before, { ...before, points: 580 }), 'reward');
  assert.equal(
    outcomeCue('future-commit', before, { ...before, receipts: 2, persistent: 'new' }),
    'commitment',
  );
  assert.equal(
    outcomeCue('transfer-confirm', before, { ...before, receipts: 2, persistent: 'new' }),
    'success',
  );
  assert.equal(outcomeCue('future-try:one', before, { ...before, selection: 'b' }), 'selection');
  assert.equal(outcomeCue('reorder-numbers:b,a', before, { ...before, order: 'b,a' }), 'snap');
});
test('restoring state, ordinary navigation and same-value changes stay silent', () => {
  assert.equal(
    outcomeCue('person:elena', before, { ...before, person: 'elena', points: 900 }),
    null,
  );
  assert.equal(outcomeCue('undo', before, { ...before, points: 900 }), null);
  assert.equal(outcomeCue('reset', before, { ...before, points: 900 }), null);
  assert.equal(outcomeCue('tab:future', before, before), null);
});
