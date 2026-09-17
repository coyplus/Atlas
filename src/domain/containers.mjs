import { savingsLockUntil, savingsBalanceCap } from './fixed-savings.mjs';
import { moneyVisualRole } from './visual-semantics.mjs';
import { clone, cash, round, sum, potRate, milestone, dateAt, moveMoney } from './money.mjs';
import { potArrangement, moneyType } from './agreements.mjs';
export const containerTypes = {
  current: { label: 'Current account', icon: 'wallet' },
  budget: { label: 'Budget wallet', icon: 'basket' },
  savings: { label: 'Savings pot', icon: 'shield' },
  credit: { label: 'Credit account', icon: 'card' },
  loan: { label: 'Loan pot', icon: 'car' },
  investment: { label: 'Investment pot', icon: 'trend' },
};
export function memberDetails(p, item) {
  return (item.members || []).map((entry) => {
    const id = entry.memberId || entry;
    const member = p.l1.household.members.find((m) => m.id === id),
      access = item.memberAccess?.[id];
    return {
      id,
      name: access?.name || member?.name || String(id),
      role:
        access?.role ||
        entry.role ||
        (id === p.l1.customer.id
          ? 'Owner'
          : String(id).includes('leo')
            ? 'View own activity'
            : 'Contributor'),
    };
  });
}
export function moneyContainer(p, id) {
  return [...p.l1.accounts, ...p.l1.pots].find((x) => x.id === id);
}
export function attachedRules(p, id) {
  return p.l1.rules.filter((r) => r.potId === id || r.source === id);
}
export function agreementCondition(p, item) {
  const c = potArrangement(p, item).conditions.find((c) => c.kind === 'payment');
  return c ? { ...c, amount: c.received, qualified: c.remaining === 0 } : null;
}
export function ruleBenefitLinks(p, r) {
  return p.l1.pots.flatMap((item) => {
    const a = potArrangement(p, item),
      condition = a.conditions.find((c) => c.ruleIds?.includes(r.id));
    return condition
      ? [
          {
            potId: item.id,
            name: item.name,
            benefit: a.benefit,
            required: false,
            status: condition.status,
            condition,
          },
        ]
      : [];
  });
}
export function agreementChangeEffects(p, mutate) {
  const after = clone(p);
  mutate(after);
  return p.l1.pots.flatMap((item) => {
    const before = agreementCondition(p, item),
      next = agreementCondition(after, moneyContainer(after, item.id));
    if (!before || !next) return [];
    return [
      {
        potId: item.id,
        name: item.name,
        benefit: potArrangement(p, item).benefit,
        before,
        after: next,
        changed: before.scheduled !== next.scheduled || before.received !== next.received,
      },
    ];
  });
}
export function removeContainerRule(p, id) {
  p.l1.rules = p.l1.rules.filter((r) => r.id !== id);
  for (const item of p.l1.pots) item.rules = (item.rules || []).filter((x) => x !== id);
}
export function containerModel(p, item) {
  const account = p.l1.accounts.includes(item),
    debt = !!(item.isDebt || item.owed != null),
    type = moneyType(p, item),
    shared = !!item.members?.length,
    variant = containerTypes[type],
    amount = item.owed ?? item.balance,
    rate = account ? 0 : Math.abs(potRate(p, item)),
    m = account ? null : milestone(p, item),
    rules = attachedRules(p, item.id),
    running = rules.filter((r) => r.active && !p.l1.autonomy.paused && !(r.resumeOn > p.l1.asOf)),
    arrangement = potArrangement(p, item, type);
  const agreement = {
    give: arrangement.benefit,
    label: 'Your ' + (type === 'credit' || type === 'loan' ? 'repayment' : 'pot') + ' agreement',
    do: arrangement.conditions.map((c) => c.title).join(' · ') || 'Use this pot at your own pace.',
    detail: arrangement.terms,
    status: arrangement.status,
    condition: agreementCondition(p, item),
  };
  const key = arrangement.benefit,
    target = item.target,
    progressValue = type === 'budget' ? 0 : target ? Math.min(1, amount / target) : null;
  return {
    item,
    id: item.id,
    account,
    debt,
    type,
    shared,
    label: (shared ? 'Shared · ' : '') + variant.label.toLowerCase(),
    icon: shared ? 'users' : variant.icon,
    amount,
    key,
    rate,
    rules,
    running,
    agreement,
    arrangement,
    target,
    progress: progressValue,
    date: m === null ? null : dateAt(p, m),
    action: (account ? 'account:' : 'pot:') + item.id,
    terms: [[arrangement.label, arrangement.benefit]],
  };
}
export function containerNumber(p, item, id = 'container-' + item.id) {
  const c = containerModel(p, item),
    spending = c.arrangement.conditions.find((x) => x.kind === 'spending'),
    budget =
      c.type === 'budget'
        ? { limit: spending.required, spent: spending.received, available: c.amount }
        : null;
  return {
    id,
    title: item.name,
    budget,
    visualRole: moneyVisualRole(c.type),
    attention:
      c.arrangement.recovery?.failed && !c.arrangement.recovery.restored ? 'Benefit changed' : null,
    value: budget ? cash(budget.limit) : cash(c.amount, true),
    icon: c.icon,
    bankId: c.account ? 'hsbc' : null,
    numberRole: c.type === 'budget' ? 'Money pot' : c.debt ? 'Borrowing' : null,
    valueLabel: c.type === 'budget' ? 'Monthly budget' : c.debt ? 'Left to repay' : null,
    glance: budget
      ? cash(budget.spent, true) +
        ' spent' +
        (budget.spent > budget.limit
          ? ' · ' + cash(budget.spent - budget.limit, true) + ' over'
          : budget.spent === budget.limit
            ? ' · Budget reached'
            : '')
      : c.type === 'investment'
        ? item.personalOffer?.capitalOffer
          ? c.key + ' service fee'
          : 'Value can rise or fall'
        : c.key
            .replace(' annual purchase rate · variable', ' variable')
            .replace(' fixed while committed', ' fixed')
            .replace(' AER variable', ' AER'),
    note:
      c.key +
      (c.type === 'investment'
        ? item.personalOffer?.capitalOffer
          ? ' · service fee'
          : ' · value can rise or fall'
        : ''),
    detail: c.arrangement.summary,
    relatedInsight: item.spendingCategory === 'groceries' ? 'grocery' : null,
    rows: [
      ['Type', c.label],
      [c.debt ? 'To repay' : 'Balance', cash(c.amount, true)],
      ['Your benefit', c.key],
      ...c.arrangement.conditions.map((x) => [x.title, x.description]),
    ],
    progress: c.progress,
    target: c.target,
    action: c.action,
    kind: c.type === 'investment' ? 'wealth' : c.type === 'savings' ? 'goal' : 'neutral',
    containerId: item.id,
    members: memberDetails(p, item),
  };
}
export function ruleDescription(p, r) {
  if (r.active && r.resumeOn > p.l1.asOf)
    return 'Paused · resumes ' + r.resumeOn + ' · ' + ruleDescription(p, { ...r, resumeOn: null });
  const from = moneyContainer(p, r.source)?.name || 'Your account',
    to = moneyContainer(p, r.potId)?.name || 'Your plan';
  if (r.type === 'challenge')
    return (
      cash(r.amount) +
      ' when ' +
      (r.condition ||
        p.l1.rules.find((x) => x.id === r.id)?.condition ||
        'the agreed condition holds') +
      ' → ' +
      to
    );
  if (r.type === 'standing-watch') return 'Watch the allocation · ask before rebalancing';
  if (r.type === 'payday-sweep')
    return 'On payday · sweep up to ' + cash(r.limitMonthly) + ' from ' + from + ' to ' + to;
  if (r.type === 'round-up')
    return 'Round up card payments → ' + to + ' · up to ' + cash(r.limitMonthly || 30) + '/month';
  return (
    cash(r.amount) +
    ' ' +
    (r.type === 'payday-fixed' ? 'on payday' : 'each month') +
    ' · ' +
    from +
    ' → ' +
    to
  );
}
export function validateContainerRule(p, draft) {
  const from = moneyContainer(p, draft.source),
    to = moneyContainer(p, draft.potId);
  if (
    p.l1.rules.some((r) => r.id === draft.id && r.type === 'challenge') &&
    draft.type !== 'challenge'
  )
    throw new Error('Keep this challenge’s agreed condition when editing its payment.');
  if (!from || !to || from.id === to.id || from.isDebt || from.owed != null)
    throw new Error('Choose a funded account or pot and a different destination.');
  if (
    !['payday-fixed', 'repayment', 'round-up', 'payday-sweep'].includes(draft.type) &&
    !(
      draft.type === 'challenge' &&
      p.l1.rules.some((r) => r.id === draft.id && r.type === 'challenge')
    )
  )
    throw new Error('Choose a supported money rule.');
  if (
    !Number.isFinite(draft.amount) ||
    draft.amount < 0 ||
    draft.amount > 100000 ||
    (!['round-up', 'payday-sweep'].includes(draft.type) && draft.amount <= 0)
  )
    throw new Error('Choose a valid amount above £0.');
  if (!Number.isFinite(draft.reserve) || draft.reserve < 0 || draft.reserve > 10000000)
    throw new Error('Choose a valid balance to keep.');
  if (
    !Number.isFinite(draft.limitMonthly) ||
    draft.limitMonthly <= 0 ||
    draft.limitMonthly > 100000
  )
    throw new Error('Choose a monthly cap above £0.');
  if (!['round-up', 'payday-sweep'].includes(draft.type) && draft.amount > draft.limitMonthly)
    throw new Error('The monthly cap must cover the payment.');
  return draft;
}
export function saveContainerRule(p, draft) {
  validateContainerRule(p, draft);
  const previous = p.l1.rules.find((r) => r.id === draft.id),
    id = previous?.id || 'rule-' + p.l1.rules.length + '-' + p.ui.receipts.length;
  const next = {
    ...previous,
    ...draft,
    id,
    active: previous ? previous.active : true,
    since: previous?.since || p.l1.asOf,
    title:
      draft.type === 'payday-sweep'
        ? 'Payday sweep'
        : draft.type === 'round-up'
          ? 'Round-ups'
          : draft.type === 'repayment'
            ? 'Monthly repayment'
            : draft.type === 'challenge'
              ? 'Conditional contribution'
              : 'Payday contribution',
  };
  // Variable rules are not treated as guaranteed monthly contributions.
  if (['round-up', 'payday-sweep'].includes(next.type) && !previous) next.amount = 0;
  if (previous) Object.assign(previous, next);
  else p.l1.rules.push(next);
  for (const x of p.l1.pots)
    x.rules = [...new Set([...p.l1.rules.filter((r) => r.potId === x.id).map((r) => r.id)])];
  return next;
}
export function evolveContainer(p, id, mode) {
  const x = moneyContainer(p, id),
    c = x && containerModel(p, x);
  if (!x || c.account || c.debt) throw new Error('This container cannot change type here.');
  if (mode === 'investment') {
    if (savingsLockUntil(x) > p.l1.asOf)
      throw new Error('Wait until the savings lock ends before changing this pot.');
    if (c.type !== 'savings' || c.shared) throw new Error('Choose a personal savings pot.');
    x.previousTerms = x.terms;
    x.terms = null;
    x.kind = 'investment';
    x.containerType = 'investment';
    x.growthAnnual = 0.05;
    x.stopsAtTarget = false;
    x.evolvedOn = p.l1.asOf;
  } else throw new Error('Review a supported change first.');
}
export function inviteToContainer(p, id, name, role) {
  const x = moneyContainer(p, id),
    c = x && containerModel(p, x);
  if (!x || c.account || c.debt || c.type === 'investment')
    throw new Error('Choose a budget or savings pot.');
  if (!name.trim() || !['Contributor', 'View only'].includes(role))
    throw new Error('Add a name and choose access.');
  const request = {
    kind: 'pot-invite',
    potId: id,
    name: name.trim(),
    role,
    status: 'Awaiting acceptance',
    id: 'invite-' + p.ui.requests.length,
  };
  p.ui.requests.push(request);
  return request;
}
export function acceptContainerInvite(p, id) {
  const request = p.ui.requests.find((r) => r.id === id && r.kind === 'pot-invite');
  if (!request || request.status !== 'Awaiting acceptance')
    throw new Error('This invitation is no longer pending.');
  const x = moneyContainer(p, request.potId);
  x.members = x.members?.length ? x.members : [p.l1.customer.id];
  x.members.push(request.id);
  x.memberAccess = { ...x.memberAccess, [request.id]: { name: request.name, role: request.role } };
  request.status = 'Accepted in demo';
}

// Explicit demo trigger only. Reading, previewing and enabling a rule never moves money.
export function previewRuleTrigger(p, r) {
  const source = moneyContainer(p, r.source),
    target = moneyContainer(p, r.potId),
    month = p.l1.asOf.slice(0, 7),
    used = r.executionMonth === month ? r.executedThisMonth || 0 : 0;
  const skip = (reason) => ({ amount: 0, reason, month, used });
  if (!r.active || p.l1.autonomy.paused) return skip('Automation is paused.');
  if (r.resumeOn > p.l1.asOf) return skip('This rule resumes on ' + r.resumeOn + '.');
  if (savingsLockUntil(source) > p.l1.asOf) return skip('The source pot is locked.');
  if (!source || !target || source.isDebt || source.owed != null)
    return skip('This rule does not authorise a money move.');
  if (!['payday-fixed', 'repayment', 'round-up', 'payday-sweep'].includes(r.type))
    return skip('This condition needs a separate review.');
  const debt = target.isDebt || target.owed != null,
    targetRoom = debt
      ? (target.owed ?? target.balance)
      : Math.max(
          0,
          Math.min(
            savingsBalanceCap(target),
            target.stopsAtTarget && target.target > 0 ? target.target : Infinity,
            r.stopsAt > 0 ? r.stopsAt : Infinity,
          ) - target.balance,
        );
  if (targetRoom <= 0)
    return skip(debt ? 'This debt is already repaid.' : 'The target is already reached.');
  const cap = r.limitMonthly || r.amount,
    capRoom = Math.max(0, cap - used),
    available = Math.max(0, source.balance - (r.reserve || 0));
  if (capRoom <= 0) return skip('The monthly cap has been reached.');
  const desired = r.type === 'round-up' ? 0.6 : r.type === 'payday-sweep' ? available : r.amount;
  const amount = round(Math.min(desired, capRoom, targetRoom));
  if (!amount || amount > available)
    return skip('There is not enough available after the protected balance.');
  return {
    amount,
    reason:
      r.type === 'round-up'
        ? 'Sample purchase £4.40 → round up £0.60.'
        : r.type === 'payday-sweep'
          ? 'Sample payday → sweep the eligible remainder.'
          : 'Sample payment trigger → agreed contribution.',
    month,
    used,
  };
}
export function executeRuleTrigger(p, id) {
  const r = p.l1.rules.find((x) => x.id === id);
  if (!r) throw new Error('Rule not found.');
  const result = previewRuleTrigger(p, r);
  if (result.amount) {
    moveMoney(p, r.source, r.potId, result.amount);
    r.executionMonth = result.month;
    r.executedThisMonth = round(result.used + result.amount);
  }
  r.lastOutcome = { ...result, date: p.l1.asOf };
  return result;
}
