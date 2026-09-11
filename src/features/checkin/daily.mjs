import { award } from '../../domain/money.mjs';
export const DAILY_POINTS = 5;
export function dailyCheckin(p) {
  const date = p.l1.asOf;
  const recorded = (p.ui.checkinDays || []).find((d) => d.date === date);
  if (recorded) return recorded;
  const existing = (p.ui.checkins || []).find((d) => d.date === date);
  if (existing) return { date, tool: existing.tool, recordId: existing.id, points: 0 };
  if ((p.ui.moneyFeelings || []).some((d) => d.date === date))
    return { date, tool: 'feeling', recordId: 'feeling-' + date, points: 0 };
  return null;
}
export function canCheckin(p, tool) {
  const today = dailyCheckin(p);
  return !today || (tool === 'feeling' && today.tool === 'feeling');
}
export function completeDaily(p, tool, recordId) {
  const date = p.l1.asOf;
  const existing = (p.ui.checkinDays || []).find((d) => d.date === date);
  if (existing) return { ...existing, awardedNow: 0 };
  const points = award(p, 'daily-checkin:' + date, DAILY_POINTS, 'Daily money check-in');
  const day = { date, tool, recordId, points };
  p.ui.checkinDays ||= [];
  p.ui.checkinDays.push(day);
  return { ...day, awardedNow: points };
}
