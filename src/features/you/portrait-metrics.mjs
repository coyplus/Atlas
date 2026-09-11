import { cash, potRate } from '../../domain/money.mjs';
import { portraitStory } from './portrait-story.mjs';
import { recordedCheckins } from './portrait-evidence.mjs';

export const metricColours = { Saving: '#4D8590', Spending: '#C6854E', Routines: '#8E7FA6' };
const total = (xs) => xs.reduce((n, x) => n + x, 0);
const monthName = (date) =>
  new Date(date + 'T12:00:00Z').toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' });
export const metricDate = (date) =>
  new Date(date + 'T12:00:00Z').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

function allocation(p) {
  const parts = p.l1.pots
    .filter((x) => !x.isDebt)
    .map((pot) => ({
      name: pot.name,
      value: potRate(p, pot),
    }))
    .filter((x) => x.value > 0);
  const rules = p.l1.rules.filter(
    (r) => r.active && r.amount > 0 && !p.l1.pots.find((x) => x.id === r.potId)?.isDebt,
  );
  const conditional = rules.some((r) => r.type === 'challenge');
  const averaged = rules.some((r) => r.amountIsAverage);
  const amount = total(parts.map((x) => x.value));
  return {
    id: 'allocation',
    group: 'Saving',
    title: 'Saving by rule',
    icon: 'repeat',
    value: cash(amount),
    unit: '/ month',
    kind: 'allocation',
    parts,
    span: 'wide',
    period: 'Current setup',
    caption: `${rules.length} saving rules · ${conditional ? 'includes a conditional move' : averaged ? 'includes average round-ups' : 'monthly'}`,
    source: 'Active Money Rules and their destination Pots.',
    calculation: `${parts.map((x) => cash(x.value) + ' to ' + x.name).join(' + ')}${parts.length ? ' = ' + cash(amount) + ' a month.' : 'No saving moves are set up yet.'} ${conditional ? 'The holiday move only runs when its grocery condition is met.' : averaged ? 'Round-ups use their recorded monthly average; the actual total varies.' : 'These are scheduled contributions, not a record of completed transfers.'}`,
    observing: 'Amounts, frequency and whether each rule is active or paused.',
    message: `${cash(amount)} is your current monthly saving setup${conditional ? ', including the conditional holiday move' : averaged ? ', including average round-ups' : ''}.`,
  };
}
function rhythm(p) {
  const sam = p.l1.customer.id === 'sam';
  const count = sam ? p.l1.spending.comparisons.groceries.monthsHeld : 7;
  const labels = sam
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
    : ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  return {
    id: 'cadence',
    group: sam ? 'Spending' : 'Saving',
    title: sam ? 'Grocery consistency' : 'Saving cadence',
    icon: sam ? 'basket' : 'repeat',
    value: String(count),
    unit: 'months in a row',
    kind: 'cadence',
    labels,
    span: 'wide',
    period: `${labels[0]}–Aug 2026`,
    caption: sam
      ? 'Below your £220 grocery line, every month.'
      : 'A payday saving move in every recorded month.',
    source: sam
      ? 'Recorded grocery history, January to August 2026.'
      : 'Payday saving history, February to August 2026.',
    calculation: sam
      ? 'Eight consecutive completed months below £220. September is still in progress and is not included in the streak.'
      : 'Seven consecutive completed months with a payday saving move. This measures frequency, not the amount saved in each month.',
    observing: sam
      ? 'The monthly grocery total against the same £220 line.'
      : 'Whether a payday saving move happens each month.',
    message: sam
      ? 'That’s eight completed months. September is still in progress.'
      : 'Seven months, seven payday saving moves. The dots show frequency.',
  };
}
function groceries(p) {
  const now = p.l1.spending.byCategory.groceries;
  const previous = p.l1.spending.comparisons.groceries.lastMonthToDate;
  const day = Number(p.l1.asOf.slice(-2));
  if (previous != null)
    return {
      id: 'groceries',
      group: 'Spending',
      title: 'Grocery spending',
      icon: 'basket',
      value: cash(now, true),
      unit: 'this month',
      kind: 'comparison',
      span: 'wide',
      parts: [
        { name: `1–${day} Aug`, value: previous },
        { name: `1–${day} Sept`, value: now },
      ],
      period: `1–${day} Sept 2026`,
      caption: `${cash(Math.abs(now - previous))} ${now <= previous ? 'less' : 'more'} · ${Math.round((Math.abs(now - previous) / previous) * 100)}% ${now <= previous ? 'lower' : 'higher'}`,
      source: 'Grocery spending totals, compared at the same point in each month.',
      calculation: `${cash(previous, true)} last month and ${cash(now, true)} this month, both through day ${day}. Difference: ${cash(Math.abs(now - previous), true)}. The bars start from zero and use the same scale.`,
      observing:
        'Grocery purchases across accounts and Pots. Transfers between them are not purchases.',
      message: 'These totals cover the same number of days, so the comparison is like for like.',
    };
  const line = p.l1.spending.comparisons.groceries.line;
  return {
    id: 'groceries',
    group: 'Spending',
    title: 'Groceries so far',
    icon: 'basket',
    value: cash(now, true),
    unit: 'this month',
    kind: 'gauge',
    span: 'wide',
    ratio: now / line,
    limit: line,
    period: `1–${day} Sept 2026`,
    caption: `${cash(Math.max(0, line - now), true)} to the £220 line`,
    source: 'The grocery spending total and the £220 condition on your holiday Money Rule.',
    calculation: `${cash(now, true)} ÷ ${cash(line)} = ${Math.round((now / line) * 100)}% of the line. This is spending to date, not a forecast for the full month.`,
    observing: 'Qualifying grocery purchases, counted once across accounts and Pots.',
    message: `${cash(now, true)} spent through ${day} September. The £220 line belongs to your holiday rule.`,
  };
}
function timing(p) {
  const bills = p.l1.bills.filter((b) => b.frequency === 'monthly' && Number.isFinite(b.amount));
  const amount = total(bills.map((b) => b.amount));
  const early = total(bills.filter((b) => b.day <= 7).map((b) => b.amount));
  const days = [...new Set(bills.map((b) => b.day))]
    .sort((a, b) => a - b)
    .map((day) => ({
      day,
      value: total(bills.filter((b) => b.day === day).map((b) => b.amount)),
      names: bills.filter((b) => b.day === day).map((b) => b.name),
    }));
  const payday = p.l1.income.find((x) => x.frequency === 'monthly')?.payDay;
  const first = early / amount >= 0.5;
  return {
    id: 'timing',
    group: 'Routines',
    title: 'Your monthly timing',
    icon: 'clock',
    value: first ? Math.round((early / amount) * 100) + '%' : String(days.length),
    unit: first ? 'of bills due in the first week' : 'bill days each month',
    kind: 'calendar',
    span: 'wide',
    days,
    payday,
    period: 'Monthly schedule',
    caption: `${cash(amount)} in known monthly bills · payday ${payday}`,
    source: 'Monthly bill instructions with a known amount, and your regular income date.',
    calculation: `${cash(early)} of ${cash(amount)} is scheduled on days 1–7. ${p.l1.bills.some((b) => b.amount == null) ? 'The variable card repayment is excluded because its next amount is not fixed. ' : ''}A scheduled date is not confirmation that a payment has cleared.`,
    observing: 'Due dates and amounts. Each column is one day; its height shows the amount due.',
    message: first
      ? `${cash(early)} of your known monthly bills falls in the first week.`
      : `Your known bills fall on ${days.length} dates. The separate marker is payday.`,
  };
}
function checkins(p) {
  const value = recordedCheckins(p);
  const count = typeof value === 'number' ? value : null;
  return {
    id: 'checkins',
    group: 'Routines',
    title: 'Money check-ins',
    icon: 'edit',
    value: count == null ? 'Weekly' : String(count),
    unit: count == null ? 'recorded rhythm' : 'recorded',
    kind: count == null ? 'visits' : 'dots',
    count: count ?? 1,
    span: 'half',
    period: 'Profile history',
    caption: count == null ? 'A recurring weekly habit' : 'One dot, one check-in',
    source: 'Check-in count or frequency in your app activity profile.',
    calculation:
      count == null
        ? 'Your profile records a weekly check-in rhythm. It does not provide an exact lifetime count.'
        : `${count} check-ins are recorded in your activity profile. The dots represent that count, not a calendar of when they happened.`,
    observing: 'Frequency of check-ins. Private reflections stay outside the remembered portrait.',
    message:
      count == null
        ? 'The recorded rhythm is weekly; there isn’t an exact lifetime count here.'
        : `${count} check-ins recorded. The dots show a count, not particular dates.`,
  };
}
function visits(p) {
  const app = p.l1.behaviour.app,
    frequency = app.sessionsPerWeek;
  return {
    id: 'visits',
    group: 'Routines',
    title: 'App rhythm',
    icon: 'grid',
    value: String(frequency ?? app.sessionsSinceJoin),
    unit: frequency != null ? 'visits / week' : 'visits since joining',
    kind: 'visits',
    count: frequency ?? app.sessionsSinceJoin,
    span: 'half',
    period: frequency != null ? 'Recorded frequency' : 'Since 11 Aug',
    caption: 'Opening and checking in',
    source: 'Recorded app session frequency in your activity profile.',
    calculation:
      frequency != null
        ? `${frequency} sessions per week in the profile. One session means opening the app, not a purchase or a money movement.`
        : `${app.sessionsSinceJoin} sessions since joining. There is not yet enough history for a weekly pattern.`,
    observing: 'How often you open the app. The marks are a count, not assigned weekdays.',
    message: `${frequency ?? app.sessionsSinceJoin} app visits ${frequency != null ? 'per week in your recorded activity' : 'since joining'}. This is separate from Money Check-ins.`,
  };
}
function repayment() {
  return {
    id: 'repayment',
    group: 'Routines',
    title: 'Card repayment rhythm',
    icon: 'card',
    value: '9',
    unit: 'years paying in full',
    kind: 'years',
    count: 9,
    span: 'wide',
    period: 'Recorded history',
    caption: 'Every monthly statement, paid in full.',
    source: 'The nine-year monthly repayment history recorded in your profile.',
    calculation:
      'The recorded pattern spans nine years. Each ring represents one year of monthly repayments; it is not a balance or a credit score.',
    observing: 'Whether the monthly statement balance is paid in full.',
    message: 'Nine years describes the repayment pattern, not the amount spent.',
  };
}
function recent(p) {
  const joined = p.l1.customer.joined;
  const days = Math.round((new Date(p.l1.asOf) - new Date(joined)) / 86400000);
  const records = p.l1.transactions.filter((t) => t.date >= joined && t.date <= p.l1.asOf);
  const series = Array.from({ length: days + 1 }, (_, i) => {
    const d = new Date(joined + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + i);
    return {
      day: d.getUTCDate(),
      value: records.filter((t) => t.date === d.toISOString().slice(0, 10)).length,
    };
  });
  return {
    id: 'recent',
    group: 'Routines',
    title: 'Your first days',
    icon: 'clock',
    value: String(days),
    unit: 'days with HSBC',
    kind: 'recent',
    series,
    span: 'wide',
    period: '11–20 Aug 2026',
    caption: `${records.length} recorded money movements`,
    source: 'Transactions recorded between joining and the scenario date.',
    calculation: `${records.length} ledger entries across ${days} elapsed days. Bars count entries by date, including incoming money; they do not represent spending amounts.`,
    observing: 'New activity as it arrives. Longer trends will need more time.',
    message: 'This is the activity recorded so far. It is too early to describe a lasting pattern.',
  };
}
export function portraitMetrics(p, s = { member: 'self' }) {
  const story = portraitStory(p, s.member);
  let cards;
  if (!story.own)
    cards = story.inputs.map((x, i) => ({
      id: 'shared-' + i,
      group: 'Routines',
      title: x.label === 'money moves' ? 'Recorded money moves' : 'Personality answers',
      icon: x.symbol,
      value: x.value,
      unit: x.label,
      kind: 'dots',
      count: Number(x.value.replaceAll(',', '')),
      span: 'wide',
      period: 'Shared profile',
      caption: story.source,
      source: story.source,
      calculation:
        'This is the aggregate count included in the shared profile. Individual transactions and private answers are not included.',
      observing: 'Only updates shared with you.',
      message: 'This total is shared with you; the underlying private records are not.',
    }));
  else {
    const id = p.l1.customer.id;
    cards =
      id === 'alex'
        ? [recent(p), allocation(p), timing(p), visits(p), checkins(p)]
        : id === 'elena'
          ? [repayment(), allocation(p), timing(p), visits(p), checkins(p)]
          : [rhythm(p), groceries(p), allocation(p), timing(p), visits(p), checkins(p)];
  }
  return {
    own: story.own,
    member: story.member,
    asOf: metricDate(p.l1.asOf),
    month: monthName(p.l1.asOf),
    cards: cards.map((c) => ({ ...c, colour: metricColours[c.group] })),
    inputs: story.inputs,
  };
}
export function portraitMetricsSupport(p, s, context) {
  const m = portraitMetrics(p, s),
    card = m.cards.find((c) => c.id === (context.topic || context.id));
  return {
    source: 'ai',
    author: 'HSBC AI',
    singleMessage: true,
    title: card?.message || 'Dates, amounts and rhythms. Tap a metric to see how it’s measured.',
    message: card
      ? `${card.calculation} ${card.source}`
      : 'These are the observed numbers behind the portrait. Each metric has its own period and source. Explore your portrait connects these observations to our interpretation.',
    action: 'portrait-story',
    cta: 'Back to your metrics',
    chips: card
      ? ['How is this calculated?', 'What counts in this number?']
      : ['What data is included?', 'How does this differ from my portrait?'],
  };
}
export function portraitMetricsReply(p, s, context, text) {
  const m = portraitMetrics(p, s),
    card = m.cards.find((c) => c.id === (context.topic || context.id));
  if (/differ|personality|interpret|portrait mean/i.test(text))
    return 'This screen shows measurements: what happened, how often and over which period. Explore your portrait is where we explain what those patterns might say about your approach to money. A number is an observation, not a personality score.';
  if (card)
    return /count|include|data|source/i.test(text)
      ? `${card.source} ${card.observing} ${card.calculation}`
      : card.calculation;
  return m.own
    ? 'The metrics use your recorded spending and repayment history, current saving rules, scheduled bills and app activity. Each tile labels its period. Completed activity and scheduled payments are kept distinct.'
    : 'These are the aggregate counts in the profile shared with you. Individual transactions and private check-in content are not included.';
}
