import { award } from '../../domain/money.mjs';
import { challenges } from './catalog.mjs';
export { challenges } from './catalog.mjs';
export const challenge = (id) => challenges.find((b) => b.id === id);
export function badgeState(p, id) {
  const b = challenge(id),
    stored = p.l1.rewards.challenges?.[id];
  if (!b) return null;
  const count = Math.max(0, Math.min(b.target, stored?.count || 0));
  return {
    ...stored,
    count,
    status: stored?.earnedAt
      ? 'earned'
      : stored?.paused
        ? 'paused'
        : stored?.joinedAt
          ? 'active'
          : 'available',
    percent: Math.round((count / b.target) * 100),
  };
}
function addMonths(date, n) {
  const d = new Date(date + 'T12:00:00Z'),
    day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + n);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return d.toISOString().slice(0, 10);
}
function period(date, cadence) {
  if (cadence === 'month') return date.slice(0, 7);
  if (cadence === 'day') return date;
  const d = new Date(date + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
}
export function canRecord(p, id) {
  const b = challenge(id),
    s = badgeState(p, id);
  if (!b || s.status !== 'active') return false;
  if (b.mature && p.l1.asOf < addMonths(s.joinedAt, s.count + 1)) return false;
  return !s.confirmedDates?.some((d) => period(d, b.cadence) === period(p.l1.asOf, b.cadence));
}
export function nextStep(p, id) {
  const b = challenge(id),
    s = badgeState(p, id);
  if (s.status === 'earned') return 'Challenge complete';
  if (b.schedule === 'ramp') return `Next saving day: £${s.count + 1}`;
  return b.steps?.[s.count] || b.step;
}
export function joinChallenge(p, id) {
  if (!challenge(id) || badgeState(p, id).status !== 'available') return false;
  p.l1.rewards.challenges ||= {};
  p.l1.rewards.challenges[id] = { count: 0, joinedAt: p.l1.asOf, confirmedDates: [] };
  return true;
}
export function pauseChallenge(p, id) {
  const s = badgeState(p, id);
  if (!s || !['active', 'paused'].includes(s.status)) return false;
  p.l1.rewards.challenges[id].paused = s.status === 'active';
  return true;
}
export function recordChallenge(p, id) {
  if (!canRecord(p, id)) return 0;
  const b = challenge(id),
    s = p.l1.rewards.challenges[id];
  s.confirmedDates ||= [];
  s.confirmedDates.push(p.l1.asOf);
  s.count += 1;
  if (s.count < b.target) return 0;
  s.earnedAt = p.l1.asOf;
  return award(p, 'challenge:' + id, b.points, b.title + ' · badge bonus');
}
export function badgeSummary(p) {
  return {
    earned: challenges.filter((b) => badgeState(p, b.id).status === 'earned'),
    active: challenges.filter((b) => ['active', 'paused'].includes(badgeState(p, b.id).status)),
  };
}
