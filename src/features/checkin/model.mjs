import { dailyCheckin, canCheckin, completeDaily } from './daily.mjs';
import { feelingHistory, shiftDay } from '../you/feelings.mjs';
export const tools = [
  {
    id: 'feeling',
    title: 'Money Feeling',
    time: '30 seconds',
    purpose: 'Name what’s on your mind.',
    color: '#81aaa2',
    kind: 'Feel',
  },
  {
    id: 'instinct',
    title: 'Money Instinct',
    time: '1 minute',
    purpose: 'Find what feels like you.',
    color: '#a69bc2',
    kind: 'Discover',
  },
  {
    id: 'worth',
    title: 'Was It Worth It?',
    time: '1 minute',
    purpose: 'Notice what your spending gives you.',
    color: '#c79577',
    kind: 'Reflect',
  },
  {
    id: 'ahead',
    title: 'An Ordinary Day Ahead',
    time: '90 seconds',
    purpose: 'Picture more of what matters.',
    color: '#91a7bf',
    kind: 'Imagine',
  },
];
export const instincts = [
  {
    id: 'plan',
    claim: 'I like a plan that leaves room to change my mind.',
    yes: 'You like a plan with room to adapt.',
    no: 'Leaving room to change a plan isn’t always what you want.',
  },
  {
    id: 'buffer',
    claim: 'Having money in reserve brings me more joy than a treat today.',
    yes: 'A reserve brings you more joy than a treat right now.',
    no: 'A reserve isn’t always more rewarding than a treat today.',
  },
  {
    id: 'experience',
    claim: 'I’d rather spend on a memory than something I can keep.',
    yes: 'You lean towards memories over things.',
    no: 'You don’t always prefer an experience to something you can keep.',
  },
  {
    id: 'routine',
    claim: 'Small, regular steps suit me better than an occasional big push.',
    yes: 'Small, regular steps feel like your rhythm.',
    no: 'Small, regular steps aren’t always your preferred rhythm.',
  },
  {
    id: 'together',
    claim: 'Talking a money decision through helps me know what I want.',
    yes: 'Talking a decision through helps you find your own view.',
    no: 'Talking it through doesn’t always help you find your view.',
  },
];
export const worthAnswers = [
  'Glad I chose it',
  'A little mixed',
  'Would choose differently',
  'It was necessary',
];
export const worthReasons = [
  'Connection',
  'Time back',
  'Comfort',
  'Something practical',
  'Enjoyment',
  'Habit',
];
export const horizons = ['Six months from now', 'A year from now', 'Five years from now'];
export const futures = [
  {
    id: 'people',
    title: 'Time with my people',
    line: 'An unhurried evening with the people I care about.',
    short: 'Connection',
    prompt: 'Who would you like to have more time for?',
  },
  {
    id: 'space',
    title: 'A place that feels mine',
    line: 'Coming home to a place that feels like mine.',
    short: 'My own space',
    prompt: 'What would make that place feel like yours?',
  },
  {
    id: 'time',
    title: 'Room to slow down',
    line: 'A morning with enough time to breathe.',
    short: 'More time',
    prompt: 'What would you do with an hour that was just yours?',
  },
  {
    id: 'learn',
    title: 'Something new to learn',
    line: 'Making time for something I’ve always wanted to learn.',
    short: 'Discovery',
    prompt: 'What would you love to get curious about?',
  },
  {
    id: 'outside',
    title: 'A little more adventure',
    line: 'Getting outside my usual routine, even close to home.',
    short: 'Adventure',
    prompt: 'Where does your mind wander?',
  },
  {
    id: 'own',
    title: 'Something of my own',
    line: 'Making a little more room for what matters to me.',
    short: 'My own idea',
    prompt: 'What does your ordinary day look like?',
  },
];
export function reviewCards(p) {
  return (p.l2.beliefs || [])
    .filter((b) => !/20%|invest|risk|dip/i.test(b.claim))
    .slice(0, 3)
    .map((b) => ({
      id: b.id,
      claim: b.correction || b.claim,
      source: b.evidence,
      status: b.status,
      yes: 'Still fits: ' + (b.correction || b.claim),
      no: 'Things have changed: ' + (b.correction || b.claim),
    }));
}
export function purchases(p) {
  const categories = new Set([
    'groceries',
    'eating-out',
    'family',
    'transport',
    'subscriptions',
    'shopping',
    'leisure',
    'telecoms',
    'housing',
    'utilities',
    'insurance',
  ]);
  return (p.l1.transactions || [])
    .filter(
      (t) =>
        t.amount < 0 &&
        t.date <= p.l1.asOf &&
        categories.has(t.category) &&
        !t.ruleId &&
        (!t.memberId || t.memberId === p.l1.customer.id),
    )
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 12);
}
// Reflect on existing commitments, without creating a product recommendation.
export function reflectionItems(p) {
  return [
    ...purchases(p).map((t) => ({
      ...t,
      kind: 'transaction',
      detail: t.date,
      value: Math.abs(t.amount),
      valueLabel: 'Spent',
    })),
    ...(p.l1.accounts || [])
      .filter((a) => a.kind === 'credit' && (!a.memberId || a.memberId === p.l1.customer.id))
      .map((a) => ({
        id: 'credit-' + a.id,
        kind: 'credit',
        counterparty: a.name,
        detail: 'Your credit',
        value: a.owed,
        valueLabel: 'Outstanding balance',
        date: p.l1.asOf,
      })),
    ...(p.l1.goals || [])
      .filter((g) => !g.memberId || g.memberId === p.l1.customer.id)
      .slice(0, 4)
      .map((g) => {
        const pot = (p.l1.pots || []).find((x) => x.id === g.potId);
        return {
          id: 'goal-' + g.id,
          kind: 'goal',
          counterparty: pot?.name || g.statement,
          detail: 'Your goal',
          value: g.target ?? null,
          valueLabel: 'Goal target',
          date: p.l1.asOf,
        };
      }),
  ];
}
export function reflectionAnswers(kind = 'transaction') {
  return kind === 'goal'
    ? ['Still feels right', 'My priorities are changing', 'I’m not sure yet', 'Ready to revisit it']
    : kind === 'credit'
      ? [
          'Feels manageable',
          'A little mixed',
          'Taking up headspace',
          'I want to understand it better',
        ]
      : worthAnswers;
}
export function reflectionReasons(kind = 'transaction') {
  return kind === 'goal'
    ? ['Family', 'Security', 'Freedom', 'Something to look forward to', 'Personal growth', 'Time']
    : kind === 'credit'
      ? [
          'Everyday needs',
          'Flexibility',
          'Repayments',
          'Peace of mind',
          'Unexpected costs',
          'Uncertainty',
        ]
      : worthReasons;
}
export function reflectionRecords(p) {
  return [
    ...(p.ui.checkins || []),
    ...feelingHistory(p).map((f) => ({
      id: 'feeling-' + f.date,
      tool: 'feeling',
      date: f.date,
      result: {
        title: 'Feeling ' + f.feeling + '.',
        text:
          f.note ||
          (f.reasons?.length ? f.reasons.join(' · ') : 'A moment to notice how money felt.'),
      },
      insight:
        f.insight ||
        f.note ||
        'Feeling ' +
          f.feeling +
          (f.reasons?.length ? ' because of ' + f.reasons.join(', ').toLowerCase() : ''),
      remember: Boolean(f.remember),
      answers: f,
    })),
  ].sort((a, b) => a.date.localeCompare(b.date));
}
export function checkinModel(p) {
  const records = reflectionRecords(p),
    today = p.l1.asOf;
  const dates = new Set([
    ...feelingHistory(p).map((x) => x.date),
    ...records.map((x) => x.date),
    ...(p.ui.checkinDays || []).map((x) => x.date),
  ]);
  let day = dates.has(today) ? today : shiftDay(today, -1),
    streak = 0;
  while (dates.has(day)) {
    streak++;
    day = shiftDay(day, -1);
  }
  return {
    records,
    days: Array.from({ length: 7 }, (_, i) => {
      const date = shiftDay(today, i - 6);
      return { date, complete: dates.has(date), today: date === today };
    }),
    streak,
    memories: records.filter((r) => r.remember && r.insight),
    today,
    todayDone: Boolean(dailyCheckin(p)),
    daily: dailyCheckin(p),
  };
}
export function instinctSummary(d) {
  const answers = d.answers || [];
  const lines = d.cards.flatMap((card, i) => {
    const answer = answers[i];
    if (answer === 'yes') return [card.yes];
    if (answer === 'no')
      return [
        d.mode === 'review'
          ? d.corrections?.[i]
            ? 'Your updated view: ' + d.corrections[i]
            : 'You’d like us to revisit “' + card.claim + '”.'
          : card.no,
      ];
    if (answer === 'depends') return ['“' + card.claim + '” depends on the situation for you.'];
    return [];
  });
  return lines.length ? lines.join(' ') : '';
}
function baseResultFor(p, d) {
  if (d.tool === 'instinct')
    return {
      title: d.mode === 'review' ? 'Your view, as it is now.' : 'A little more like you.',
      text: instinctSummary(d),
    };
  if (d.tool === 'worth') {
    const t = reflectionItems(p).find((x) => x.id === d.purchase);
    if (!t || !reflectionAnswers(t.kind).includes(d.verdict)) return null;
    return {
      title:
        d.verdict === worthAnswers[0]
          ? 'Some things earn their place.'
          : d.verdict === worthAnswers[3]
            ? 'Necessary can be enough.'
            : 'A little more clarity.',
      text: `${t.counterparty}: ${d.verdict.toLowerCase()}.${d.reasons?.length ? ' What stood out: ' + d.reasons.join(', ').toLowerCase() + '.' : ''}${d.note ? ' ' + d.note : ''}`,
    };
  }
  if (d.tool === 'ahead') {
    const f = futures.find((x) => x.id === d.future);
    if (!f || !horizons.includes(d.horizon)) return null;
    return {
      title: 'A day worth imagining.',
      text: `${d.horizon}, I’d like more room for ${f.title.toLowerCase()}. ${d.note || f.line}`,
    };
  }
  return null;
}
export function resultFor(p, d) {
  const result = baseResultFor(p, d);
  if (!result) return null;
  const extra =
    d.reflection?.answer && d.reflection.answer !== 'In my own words'
      ? ' You noticed: ' + d.reflection.answer.toLowerCase() + '.'
      : '';
  return {
    ...result,
    text: result.text + extra + (d.tool === 'instinct' && d.note ? ' ' + d.note : ''),
  };
}
export function saveCheckin(p, d, insight, remember) {
  const result = resultFor(p, d);
  if (!result?.text) throw new Error('Choose something to reflect on first.');
  p.ui.checkins ||= [];
  if (d.savedId) return p.ui.checkins.find((r) => r.id === d.savedId);
  if (!canCheckin(p, d.tool))
    throw new Error('Your daily check-in is complete. Come back tomorrow.');
  const record = {
    id: 'reflection-' + ((p.ui.checkinSequence || 0) + 1),
    tool: d.tool,
    date: p.l1.asOf,
    version: 1,
    result,
    answers: structuredClone(d),
    insight: String(insight || result.text)
      .trim()
      .slice(0, 1200),
    remember: Boolean(remember),
  };
  p.ui.checkinSequence = (p.ui.checkinSequence || 0) + 1;
  p.ui.checkins.push(record);
  d.savedId = record.id;
  d.reward = completeDaily(p, d.tool, record.id).awardedNow;
  return record;
}
// Memory is offered only on a later, relevant screen. Never during a check-in,
// never as a generic sales lead, and never for another household participant.
export function contextualReflection(p, s, context) {
  if (s.member && s.member !== 'self') return null;
  const all = checkinModel(p).memories;
  const latest = (tool) => all.findLast((r) => r.tool === tool);
  const isFuture = context.kind === 'future' || (s.tab === 'future' && context.kind === 'top');
  const isSpending =
    context.kind === 'module' && ['grocery', 'subs', 'safespend', 'spending'].includes(context.id);
  const record = isFuture
    ? latest('ahead')
    : isSpending
      ? latest('worth')
      : context.kind === 'personality'
        ? latest('instinct')
        : null;
  if (!record) return null;
  return {
    source: 'ai',
    author: 'HSBC AI',
    title: 'Something you wanted us to remember',
    message:
      record.insight +
      (isFuture
        ? ' Does this still feel like a direction you’d like to explore?'
        : isSpending
          ? ' Keep what matters to you in view as you look at your spending.'
          : ' Your own words can help us understand what fits.'),
    cta: 'Revisit your reflection',
    action: 'checkin-saved:' + record.id,
  };
}
