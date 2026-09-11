/** One shared vocabulary. Milliseconds approximate rhythm, not motor intensity. */
export const hapticPatterns = {
  selection: [6],
  snap: [10],
  commitment: [14],
  success: [10, 40, 10],
  attention: [18, 65, 10],
  reward: [8, 50, 16],
};
const priority = { selection: 1, snap: 2, commitment: 3, success: 4, reward: 5, attention: 6 };
const cooldown = {
  selection: 600,
  snap: 450,
  commitment: 900,
  success: 1400,
  attention: 3000,
  reward: 4000,
};

/** Injectable clock/driver makes noise limits testable without vibrating hardware. */
export function createHapticEngine({
  available,
  play,
  now = () => performance.now(),
  defer = queueMicrotask,
}) {
  let pending = null,
    scheduled = false,
    lastAt = -Infinity;
  const lastKind = new Map(),
    lastKey = new Map();
  let recent = [];
  function clear() {
    pending = null;
  }
  function request(kind, key = kind) {
    if (!hapticPatterns[kind] || !available()) return false;
    if (!pending || priority[kind] > priority[pending.kind]) pending = { kind, key };
    if (!scheduled) {
      scheduled = true;
      defer(() => {
        scheduled = false;
        const cue = pending;
        pending = null;
        if (!cue || !available()) return;
        const t = now(),
          { kind, key } = cue;
        recent = recent.filter((at) => t - at < 5000);
        // Never queue a late buzz, stack patterns, or replay an oscillating boundary.
        if (
          t - lastAt < 220 ||
          t - (lastKind.get(kind) ?? -Infinity) < cooldown[kind] ||
          t - (lastKey.get(key) ?? -Infinity) < (kind === 'attention' ? 5000 : 1200) ||
          (priority[kind] <= 2 && recent.length >= 3) ||
          recent.length >= 5
        )
          return;
        try {
          if (play([...hapticPatterns[kind]]) === false) return;
          lastAt = t;
          lastKind.set(kind, t);
          lastKey.set(key, t);
          recent.push(t);
          for (const [key, at] of lastKey) if (t - at > 10000) lastKey.delete(key);
        } catch {
          /* Unsupported/blocked hardware must never interrupt an action. */
        }
      });
    }
    return true;
  }
  return { request, clear };
}

export function createMilestoneTracker() {
  let seen = new Set(),
    count = 0;
  return {
    begin() {
      seen = new Set();
      count = 0;
    },
    cross(from, to, dates) {
      if (from === to || count >= 3) return null;
      const hit = Object.entries(dates).filter(
        ([id, month]) =>
          Number.isFinite(month) &&
          month > 0 &&
          month <= 240 &&
          !seen.has(id) &&
          (to > from ? from < month && month <= to : to <= month && month < from),
      );
      if (!hit.length) return null;
      // A leap across several goals is one moment, never a burst of vibrations.
      hit.forEach(([id]) => seen.add(id));
      count++;
      return hit.sort((a, b) => Math.abs(a[1] - to) - Math.abs(b[1] - to))[0][0];
    },
  };
}

const commitments = new Set([
  'future-commit',
  'future-add-save',
  'commit-idea',
  'commit-all',
  'container-rule-save',
  'container-rule-confirm',
  'container-evolve-confirm',
  'plan-confirm',
]);
const successes = new Set([
  'transfer-confirm',
  'container-trigger-confirm',
  'condition-choice-confirm',
  'connect-confirm',
  'container-invite-save',
  'container-accept',
]);
const selections = new Set([
  'future-try',
  'future-proposal',
  'future-adjust-save',
  'future-add-save',
  'future-remove-confirm',
  'toggle-idea',
  'badge-join',
  'badge-pause',
]);
export function captureHapticOutcome(p) {
  return {
    person: p.l1.customer.id,
    points: p.l1.rewards?.points?.balance || 0,
    days: p.ui.checkinDays?.length || 0,
    receipts: p.ui.receipts?.length || 0,
    order: JSON.stringify(p.ui.order),
    // Compare actual state, not the wording of an action or its toast.
    persistent: JSON.stringify([p.l1, p.ui.connectedBanks]),
    selection: JSON.stringify([p.ui.future?.ideas, p.ui.preview, p.l1.rewards?.challenges]),
  };
}
export function outcomeCue(action, before, after) {
  if (before.person !== after.person) return null;
  const type = action.split(':')[0];
  if (['undo', 'reset', 'person', 'dismiss', 'checkin-done', 'feeling-done'].includes(type))
    return null;
  if (after.days > before.days) return 'success'; // Includes its Points: one closing gesture.
  if (after.points > before.points) return 'reward';
  if (type === 'reorder-numbers' && after.order !== before.order) return 'snap';
  if (after.receipts > before.receipts && before.persistent !== after.persistent) {
    if (commitments.has(type)) return 'commitment';
    if (successes.has(type)) return 'success';
    if (type === 'badge-record') return 'selection';
  }
  if (selections.has(type) && before.selection !== after.selection) return 'selection';
  return null;
}
