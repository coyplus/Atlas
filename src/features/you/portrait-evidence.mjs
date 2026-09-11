// Authored evidence depth for the frozen scenarios. Not derived from wealth, membership or age.
// Levels describe breadth and continuity of information already cited in each profile.
export function recordedCheckins(p) {
  const baseline = p.l1.behaviour.app.checkIns;
  return typeof baseline === 'number' ? baseline + (p.ui.checkins?.length || 0) : baseline;
}
export const portraitEvidence = {
  alex: { depth: 0, description: 'Your quiz answers are our starting point.' },
  jordan: {
    depth: 1,
    moves: 214,
    answers: 12,
    description: 'Your answers and recurring spending and saving patterns.',
  },
  sam: {
    depth: 1,
    moves: 431,
    answers: 15,
    description: 'Your answers, regular routines and plans across several priorities.',
  },
  elena: {
    depth: 3,
    description:
      'Twelve years of decisions across saving, investing and family plans, including three rehearsals.',
  },
  riley: {
    depth: 0,
    description: 'A first picture from the money personality answers Riley shared.',
  },
  aisha: {
    depth: 0,
    moves: 186,
    answers: 9,
    description: 'A first picture from nine answers and the activity shared with us.',
  },
  leo: { depth: 0, moves: 42, description: 'A limited picture from pocket-money activity.' },
};
