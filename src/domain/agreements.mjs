import { displayDate } from './dates.mjs';
import { cash, sum } from './money.mjs';

export function moneyType(p, item) {
  return (
    item.containerType ||
    (item.isDebt || item.owed != null
      ? p.l1.accounts.includes(item)
        ? 'credit'
        : 'loan'
      : item.growthAnnual || item.kind === 'investment'
        ? 'investment'
        : item.kind === 'budget'
          ? 'budget'
          : p.l1.accounts.includes(item)
            ? 'current'
            : 'savings')
  );
}
export const conditionDate = displayDate;
export function conditionPeriod(p) {
  const start = p.l1.asOf.slice(0, 7) + '-01',
    d = new Date(start + 'T12:00:00Z');
  d.setUTCMonth(d.getUTCMonth() + 1);
  d.setUTCDate(0);
  return { start, end: d.toISOString().slice(0, 10) };
}
// A dated, illustrative assessment. Schedules never qualify as received money.
export function recoveryAssessment(p, item) {
  const r = item.personalOffer?.recovery;
  if (!r) return null;
  const transactions = (start, end) =>
    p.l1.transactions.filter(
      (t) => t.ledger === item.id && t.date >= start && t.date <= end && t.date <= p.l1.asOf,
    );
  const received = (list) =>
    sum(
      list
        .filter(
          (t) => t.amount > 0 && ['transfer', 'rule', 'payment', 'manual'].includes(t.category),
        )
        .map((t) => t.amount),
    );
  const before = received(transactions(r.assessmentStart, r.assessmentEnd)),
    current = transactions(r.qualifyStart, r.qualifyEnd),
    paid = received(current),
    spent = sum(
      current
        .filter((t) => t.amount < 0 && !['transfer', 'rule'].includes(t.category))
        .map((t) => -t.amount),
    );
  const missing = Math.max(0, r.required - paid),
    merchant = item.arrangementState?.merchant,
    ready = missing === 0 && !!merchant && spent <= r.required,
    failed = before < r.required && p.l1.asOf >= r.changedOn,
    restored = failed && ready && p.l1.asOf >= r.restoreOn;
  return {
    ...r,
    before,
    paid,
    spent,
    missing,
    ready,
    failed,
    restored,
    benefit: failed && !restored ? r.changedBenefit : r.normalBenefit,
    summary: restored
      ? 'Your cashback is back.'
      : ready
        ? 'Ready for cashback to return on ' + conditionDate(r.restoreOn) + '.'
        : missing
          ? cash(missing) + ' more to contribute by ' + conditionDate(r.qualifyEnd) + '.'
          : !merchant
            ? 'Choose your supermarket to complete the conditions.'
            : 'Spending is above the agreed limit. Let’s review your next month.',
  };
}
export function potArrangement(p, item, type = moneyType(p, item)) {
  const offer = item.personalOffer || {},
    period = conditionPeriod(p),
    state = item.arrangementState || {},
    all = p.l1.transactions.filter(
      (t) => t.ledger === item.id && t.date >= period.start && t.date <= p.l1.asOf,
    ),
    rules = p.l1.rules.filter((r) => r.potId === item.id),
    conditions = [];
  let benefit = offer.rate || '3.8% AER variable',
    label = 'Your savings rate',
    terms =
      'Interest is calculated daily and paid monthly. Variable rates may change with notice. You can add or withdraw money whenever you need.',
    benefitState = 'Current';
  const payment = (id, amount, repayment = false) => {
    const received = sum(
        all
          .filter(
            (t) =>
              ['rule', 'transfer', 'repayment', 'payment'].includes(t.category) &&
              (repayment ? t.amount < 0 : t.amount > 0),
          )
          .map((t) => Math.abs(t.amount)),
      ),
      remaining = Math.max(0, amount - received),
      methods = rules.filter((r) =>
        ['payday-fixed', 'repayment', 'round-up', 'payday-sweep'].includes(r.type),
      ),
      scheduled = sum(
        methods
          .filter(
            (r) =>
              r.active && !p.l1.autonomy.paused && ['payday-fixed', 'repayment'].includes(r.type),
          )
          .map((r) => Math.min(r.amount, r.limitMonthly ?? r.amount)),
      );
    conditions.push({
      id,
      kind: 'payment',
      title: (repayment ? 'Repay ' : 'Add ') + cash(amount) + ' this month',
      required: amount,
      received,
      remaining,
      scheduled,
      due: period.end,
      ruleIds: methods.map((r) => r.id),
      status: remaining === 0 ? 'Complete' : scheduled >= remaining ? 'Planned' : 'Your action',
      description:
        remaining === 0
          ? cash(received) + ' received this month.'
          : cash(received) + ' of ' + cash(amount) + ' received · due ' + conditionDate(period.end),
      method:
        remaining === 0
          ? scheduled
            ? 'Automatic payment still active—check it if you paid manually.'
            : 'Nothing more to pay this month.'
          : scheduled >= remaining
            ? cash(Math.min(scheduled, remaining)) + ' planned automatically.'
            : scheduled
              ? cash(Math.min(scheduled, remaining)) +
                ' planned automatically. Add ' +
                cash(Math.max(0, remaining - scheduled)) +
                ' yourself.'
              : 'Pay manually by the due date, or automate it.',
    });
  };
  if (type === 'savings') {
    if (offer.monthlyContribution) {
      payment('contribution', offer.monthlyContribution);
      terms =
        'Your rate is tied to contributing ' +
        cash(offer.monthlyContribution) +
        ' each calendar month, manually or automatically. This demo counts received contributions, not enabled instructions. Withdrawals remain available. A missed condition would need a terms review; no replacement rate or penalty is assumed.';
    }
    if (offer.lockOffer) {
      const locked = !!state.lockedUntil && state.lockedUntil > p.l1.asOf,
        ended = !!state.lockedUntil && !locked;
      benefit = locked ? offer.lockOffer.rate : benefit;
      conditions.push({
        id: 'lock',
        kind: 'lock',
        title: locked
          ? 'Keep this pot locked'
          : ended
            ? 'Your lock has ended'
            : 'Choose a three-month lock',
        status: locked ? 'Locked' : ended ? 'Complete' : 'Your choice',
        description: locked
          ? 'No withdrawals until ' + conditionDate(state.lockedUntil) + '.'
          : ended
            ? 'Your money is accessible again.'
            : offer.lockOffer.rate + ' with no withdrawals for three months. Optional.',
        method: 'Withdrawals are unavailable during the lock.',
        until: state.lockedUntil,
      });
      terms = locked
        ? 'You accepted a three-month lock. Contributions are allowed; withdrawals and outgoing rules are blocked until ' +
          conditionDate(state.lockedUntil) +
          '. At the end, this demo returns to ' +
          offer.rate +
          '.'
        : terms;
    }
  } else if (type === 'budget') {
    benefit = offer.cashback?.benefit || '1% cashback';
    label = offer.cashback?.label || 'At your chosen supermarket';
    benefitState = offer.cashback || state.merchant ? 'Available' : 'Choose to activate';
    if (!offer.cashback)
      conditions.push({
        id: 'merchant',
        kind: 'choice',
        title: state.merchant ? 'Shop at ' + state.merchant : 'Choose your supermarket',
        status: state.merchant ? 'Selected' : 'Your choice',
        description: state.merchant
          ? 'Eligible purchases from ' + conditionDate(state.merchantSince) + '.'
          : 'Tesco, Sainsbury’s or Aldi.',
        method: 'You choose the merchant. Automation cannot make this choice for you.',
      });
    payment('funding', offer.monthlyFunding || item.budgetLimit || 220);
    const spent = sum(
        all
          .filter((t) => t.amount < 0 && !['rule', 'transfer'].includes(t.category))
          .map((t) => -t.amount),
      ),
      limit = offer.recovery?.required || item.budgetLimit || 220;
    conditions.push({
      id: 'spending',
      kind: 'spending',
      title: 'Spend within ' + cash(limit) + ' this month',
      status: spent <= limit ? 'Within limit' : 'Over limit',
      description: cash(spent) + ' spent · ' + cash(Math.max(0, limit - spent)) + ' left',
      received: spent,
      required: limit,
      method: 'We track spending and alert you. You decide what to spend.',
    });
    terms =
      'Illustrative cashback up to £5 per calendar month. Choose one eligible supermarket, fund your monthly wallet allowance and stay within the spending limit. Only eligible purchases after nomination count. All conditions are assessed together at month end. No reward is earned simply by selecting a merchant or enabling a rule. Merchant changes apply to future purchases.';
    if (offer.cashback)
      terms =
        'Illustrative ' +
        benefit +
        ' on eligible ' +
        offer.cashback.category +
        ' payments, up to ' +
        cash(offer.cashback.cap) +
        ' per month. Fund the allowance and stay within the spending limit. Transfers and cash withdrawals do not earn cashback. All conditions are assessed at month end.';
  } else if (type === 'loan') {
    benefit = offer.rate || '0% fixed';
    label = 'Your borrowing rate';
    payment('instalment', Math.abs(item.monthlyRate || 150), true);
    terms =
      'Follow your agreed instalment plan. Manual payments and automated repayments both count. Overpay without an extra fee. Pausing automation does not pause the amount due. This illustrative loan does not apply an invented penalty or rate change.';
  } else if (type === 'credit') {
    benefit = offer.rate || '29.9% annual purchase rate · variable';
    label = 'Your purchase interest rate';
    if (item.statement) payment('card-payment', item.statement.minimum, true);
    else
      conditions.push({
        id: 'statement',
        kind: 'statement',
        title: 'Pay your statement on time',
        status: 'See statement',
        description: 'Your statement confirms the minimum payment and due date.',
        method: 'You can repay manually or automatically. Both satisfy the payment obligation.',
      });
    terms =
      'Pay at least the minimum on time. Paying the full statement balance can avoid purchase interest, subject to your card terms. Cash and balance transfers may have different rates. No minimum or due date has been invented for this snapshot.';
    if (item.statement)
      terms =
        'Your September statement requires at least ' +
        cash(item.statement.minimum) +
        ' by ' +
        conditionDate(item.statement.due) +
        '. Manual and automatic payments both count. Interest already recorded stays in your activity; the prototype does not accrue new charges. Paying more reduces the balance you owe.';
  } else if (type === 'investment') {
    benefit = offer.capitalOffer ? offer.capitalOffer.fee : 'Your chosen allocation';
    label = offer.capitalOffer ? 'Annual service fee' : 'Your investment approach';
    if (offer.capitalOffer) {
      const c = offer.capitalOffer;
      conditions.push({
        id: 'capital',
        kind: 'capital',
        title: 'Keep ' + cash(c.minimum) + ' invested',
        status: item.balance >= c.minimum ? 'Met today' : 'Below threshold',
        description: cash(item.balance) + ' invested today · values can rise or fall',
        received: item.balance,
        required: c.minimum,
        method:
          'We monitor the invested value. Contributions can help; automation cannot guarantee market value.',
      });
      terms =
        'Illustrative service-fee benefit: ' +
        c.fee +
        ' while invested value meets ' +
        cash(c.minimum) +
        ', with ' +
        c.standardFee +
        ' as the illustrative standard fee. This demo shows today’s qualification, not accrued charges or an effective fee change. Market movements can affect eligibility. Any future assessment and effective date would follow your agreed terms.';
    } else
      terms =
        'Your chosen allocation, access and risk remain subject to the investment terms. The 5% Future projection is an illustration, not a guaranteed return.';
  } else if (type === 'current') {
    benefit = 'Everyday access';
    label = 'How your account works';
    terms =
      'Use your available balance and set up optional money movements. No personalised reward condition is attached to this current account.';
  }
  const recovery = recoveryAssessment(p, item);
  if (recovery?.failed) {
    benefit = recovery.benefit;
    benefitState = recovery.restored ? 'Restored' : recovery.ready ? 'Return scheduled' : 'Changed';
    terms +=
      ' In this illustrative agreement, missing the August contribution changes September cashback from 1% to 0% from 1 September. Previously earned cashback stays yours; there is no fee or backdated deduction. Contribute £320 during September, keep a nominated supermarket and stay within the spending limit to restore 1% on 1 October. A payment now does not change August or earn September cashback.';
  }
  const attention = conditions.find((c) =>
      ['Your action', 'Your choice', 'Over limit', 'Below threshold'].includes(c.status),
    ),
    paymentCondition = conditions.find((c) => c.kind === 'payment'),
    summary = attention
      ? attention.title
      : paymentCondition
        ? paymentCondition.status === 'Complete'
          ? 'This month’s contribution is complete'
          : paymentCondition.method
        : conditions[0]?.description || 'No action needed to keep these terms.';
  return {
    benefit,
    label,
    benefitState,
    conditions,
    terms,
    summary: recovery?.failed ? recovery.summary : summary,
    recovery,
    period,
    status: attention ? attention.status : conditions.length ? 'On track' : 'No action needed',
    rules,
    shared: !!item.members?.length,
  };
}
