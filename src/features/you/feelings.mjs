import { reflectionPrompt } from './feeling-reflection.mjs';
// Demo history is anchored to each scenario's frozen date, not the device clock.
export const feelings = [
  {
    id: 'calm',
    label: 'Calm',
    color: '#5D918C',
    light: '#DBEBE6',
    shape: 'round',
    line: 'At ease with where things stand.',
  },
  {
    id: 'hopeful',
    label: 'Hopeful',
    color: '#BB9550',
    light: '#F3E8CD',
    shape: 'sun',
    line: 'Looking forward with a little optimism.',
  },
  {
    id: 'okay',
    label: 'Okay',
    color: '#8F8CA7',
    light: '#E9E5F0',
    shape: 'soft',
    line: 'Somewhere in the middle.',
  },
  {
    id: 'stretched',
    label: 'Stretched',
    color: '#B98062',
    light: '#F3E3D8',
    shape: 'wave',
    line: 'A lot to balance at the moment.',
  },
  {
    id: 'worried',
    label: 'Worried',
    color: '#7089A6',
    light: '#DFE7F0',
    shape: 'cloud',
    line: 'Money is weighing on your mind.',
  },
];
export const feelingReasons = [
  'Everyday spending',
  'Bills',
  'Savings',
  'Borrowing',
  'Family',
  'Something else',
];
const examples = {
  alex: [],
  jordan: ['stretched', 'okay', 'stretched'],
  sam: ['okay', 'calm', 'hopeful', 'okay'],
  elena: ['calm', 'hopeful', 'calm', 'okay', 'calm'],
};
export const shiftDay = (date, offset) => {
  const d = new Date(date + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
};
export function feelingHistory(p) {
  return (
    p.ui.moneyFeelings ??
    (examples[p.l1.customer.id] || []).map((feeling, i) => ({
      date: shiftDay(p.l1.asOf, -i - 1),
      feeling,
      reasons: [],
      note: '',
    }))
  );
}
export function feelingModel(p) {
  const today = p.l1.asOf,
    history = feelingHistory(p);
  const entry = history.find((x) => x.date === today);
  const completedDays = new Set([
    ...history.map((x) => x.date),
    ...(p.ui.checkins || []).map((x) => x.date),
  ]);
  let day = completedDays.has(today) ? today : shiftDay(today, -1),
    streak = 0;
  while (completedDays.has(day)) {
    streak++;
    day = shiftDay(day, -1);
  }
  return {
    today,
    entry,
    streak,
    history,
    week: Array.from({ length: 7 }, (_, i) => {
      const date = shiftDay(today, i - 6);
      return { date, entry: history.find((x) => x.date === date) };
    }),
  };
}
export function saveFeeling(p, draft) {
  if (!feelings.some((x) => x.id === draft.feeling)) throw new Error('Choose a feeling first.');
  const date = p.l1.asOf;
  const entry = {
    date,
    feeling: draft.feeling,
    reasons: [...new Set(draft.reasons || [])].filter((x) => feelingReasons.includes(x)),
    note: String(draft.note || '')
      .trim()
      .slice(0, 500),
  };
  const prompt = reflectionPrompt(draft);
  if (
    draft.reflection?.key === prompt.key &&
    [...prompt.choices, 'In my own words'].includes(draft.reflection.answer)
  ) {
    entry.reflection = {
      key: prompt.key,
      question: prompt.question,
      answer: draft.reflection.answer,
    };
  }
  p.ui.moneyFeelings = [...feelingHistory(p).filter((x) => x.date !== date), entry];
  return entry;
}
