import { spendingRole } from '../../domain/visual-semantics.mjs';
// Editorial decisions are separate from the ledger and the player. Marks always describe
// recorded amounts; suggested changes and future outcomes stay in words.
export const STORY_DURATIONS = [8000, 12000, 0];
const plates = {
  'a-quiz': 'conversation',
  a1: 'dunes',
  a2: 'horizon',
  j1: 'cooking',
  j2: 'dunes',
  j3: 'horizon',
  s1: 'reflection',
  s2: 'horizon',
  s3: 'cooking',
  e1: 'conversation',
  e2: 'reflection',
};
export const storyPlate = (id) => `/assets/stories/${plates[id] || 'horizon'}.jpg`;
const money = (n) =>
  '£' + Number(n).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const amount = (s) => Number(String(s).replace(/[^0-9.-]/g, ''));
const editorial = {
  'a-quiz': [
    'Made for you',
    'Understand your money habits. Find an approach that feels like you.',
    'Discover your money style?',
    'Three questions. A personal profile you can review and correct. Around two minutes.',
  ],
  a1: [
    'This month',
    'a month across your three transferred Direct Debits.',
    'Track your Direct Debits?',
    'Add their monthly total to My numbers.',
  ],
  a2: [
    'Until payday',
    'is available after the bills due before payday are set aside.',
    'Track what’s safe to spend?',
    'Add Safe to spend to My numbers. It updates as your balance and bills change.',
  ],
  j1: [
    'Six-month average',
    'a month goes on eating out, on average.',
    'Try a £200 budget?',
    'That’s about £45 less than your average. Explore the effect before deciding.',
  ],
  j2: [
    'This month',
    'in round-ups went to your emergency fund. They could help with your loan instead.',
    'Put round-ups towards your loan?',
    'Redirect future round-ups to your car loan. Keep your regular savings move.',
  ],
  j3: [
    'February–August',
    'saved through seven payday moves of £50.',
    'Your £50 payday rule is active.',
    'You can pause or edit it in Money Rules.',
  ],
  s1: [
    'Your cash today',
    'could be available to invest, with essentials and commitments kept back.',
    'Explore £200 a month?',
    'Rehearse the investment idea first. Check the assumptions and risk before agreeing.',
  ],
  s2: [
    'Six-month average',
    'is left at payday on average. Small remainders could help your house deposit.',
    'Put the remainder towards home?',
    'Explore a payday sweep. Nothing moves when there’s nothing spare.',
  ],
  s3: [
    'January–August',
    'with grocery spending within your £220 limit.',
    'Your grocery challenge is active.',
    'It’s linked to your holiday pot.',
  ],
  e1: [
    'Planning for age 18',
    'a month could build a pot that belongs to Leo at 18.',
    'Start something for Leo?',
    'Explore the plan with your adviser before agreeing. At 18, the pot would be his.',
  ],
  e2: [
    'Rebalanced today',
    'is allocated to your chosen floor after Maya’s rebalance.',
    'Your rebalance is complete.',
    'Maya’s signed receipt records the new allocation.',
  ],
};
export function storyModel(p, id) {
  const story = p.l2.stories.find((s) => s.id === id);
  if (!story) return null;
  const [period, sentence, question, consequence] = editorial[id] || [
    'Your money',
    story.aiLine,
    story.verb,
    'Review the details before deciding.',
  ];
  const m = {
    ...story,
    period,
    sentence,
    question,
    consequence,
    plate: storyPlate(id),
    actionLabel:
      {
        j1: 'Review budget',
        j2: 'Review round-ups',
        s1: 'Review investment',
        s2: 'Review payday sweep',
        e1: 'Review Leo’s plan',
      }[id] || 'Review plan',
    claimFigure: id === 'e1' ? '£100' : story.figure,
    workingFigure: story.figure,
    caption: 'The numbers behind the story',
    shape: 'facts',
    visualRole:
      {
        a1: 'reserved',
        a2: 'cash',
        j1: spendingRole('eating-out'),
        j2: 'savings',
        j3: 'savings',
        s1: 'cash',
        s2: 'savings',
        s3: 'savings',
        e2: 'investment',
      }[id] || 'neutral',
    rows: story.rows.map(([label, detail, value]) => ({ label, detail, value })),
    receipt: 'View details',
    limit: '',
  };
  if (id === 'a-quiz') {
    m.shape = 'profile';
    m.workingFigure = 'What you’ll get';
    m.caption = '';
    m.actionLabel = 'Start the quiz';
    m.receipt = 'About your profile';
    m.limit =
      'Your profile comes from three answers, not a credit assessment. You can correct it. The 25 points are awarded once, on completion.';
    if (p.l1.behaviour.app.quizDone) {
      m.state = 'saved';
      m.question = 'Your profile is ready.';
      m.consequence =
        'Review your money style and habits in You. You can correct anything that doesn’t feel right.';
    }
  }
  if (id === 'a1') {
    m.shape = 'payment-split';
    m.caption = 'Three payments. One monthly total.';
    m.rows = m.rows.map((r) => ({ ...r, n: amount(r.value) }));
  }
  if (['a2', 's1'].includes(id)) {
    m.shape = id === 'a2' ? 'dumbbell' : 'waterfall';
    const remainder =
      Math.round(story.rows.reduce((sum, r, i) => sum + (i ? -1 : 1) * amount(r[2]), 0) * 100) /
      100;
    m.rows = m.rows.map((r) => ({ ...r, n: amount(r.value) }));
    m.rows.push({
      label: id === 'a2' ? 'Available' : 'Room to explore',
      detail: 'After these deductions',
      value: money(remainder),
      n: remainder,
      accent: true,
    });
    m.caption = 'What stays after the essentials';
    m.limit +=
      id === 's1'
        ? '£1,300 rounds down £1,300.44. Check your needs and investment risk before deciding.'
        : 'Includes only bills due before your next payday.';
  }
  if (id === 'j1') {
    m.shape = 'ranked';
    m.caption = 'Eating out · September so far';
    m.rows = p.l1.transactions
      .filter((t) => t.category === 'eating-out' && t.amount < 0)
      .map((t) => ({
        label: t.counterparty,
        detail: t.date,
        value: money(-t.amount),
        n: -t.amount,
      }))
      .sort((a, b) => b.n - a.n);
    m.workingFigure = money(m.rows.reduce((sum, r) => sum + r.n, 0));
    m.receipt = `View ${m.rows.length} payments`;
    m.limit += 'These September payments are separate from your £245 six-month monthly average.';
  }
  if (id === 'j2') {
    m.shape = 'flow';
    m.claimFigure = m.workingFigure = '£22';
    m.caption = 'Where your round-ups go today';
    m.limit +=
      'Round-ups currently go to Emergency fund. Redirecting future round-ups could reduce your loan balance; the repayment date depends on future payments.';
  }
  if (id === 'j3') {
    m.shape = 'sequence';
    m.count = 7;
    m.caption = 'Seven payday moves of £50';
    m.limit += 'Seven £50 transfers completed between February and August.';
  }
  if (id === 's2') {
    m.shape = 'target';
    m.workingFigure = '£6,400';
    m.caption = 'Already in your house deposit';
    m.value = 6400;
    m.target = 24000;
    m.limit +=
      '£85 is your average payday remainder, not a fixed monthly amount. The chart shows your current deposit.';
  }
  if (id === 's3') {
    m.shape = 'tally';
    m.count = 8;
    m.caption = 'Eight completed months within £220';
    m.limit += 'Groceries stayed within £220 in each completed month from January to August.';
  }
  if (id === 'e1') {
    m.workingFigure = '£100 × 72';
    m.caption = '£7,200 in contributions';
    m.rows = m.rows.map((r, i) =>
      i === 2
        ? { ...r, label: 'Contributions by 18', detail: 'Sep 2032 · before growth and fees' }
        : r,
    );
    m.limit +=
      '72 monthly contributions of £100, excluding growth, fees and withdrawals. This is an illustration, not a guaranteed return.';
  }
  if (id === 'e2') {
    m.shape = 'composition';
    m.caption = 'Your floor allocation';
    m.rows = m.rows.map((r, i) =>
      i === 1
        ? { ...r, detail: 'Share of invested capital' }
        : i === 2
          ? { ...r, label: 'Allocated amount', detail: 'Investment value can fall' }
          : r,
    );
    m.value = 36;
    m.limit +=
      '36% of £182,400 is £65,664. This allocation does not guarantee protection against investment losses.';
  }
  return m;
}
