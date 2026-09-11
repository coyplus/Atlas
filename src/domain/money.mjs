import { relationshipQualification } from './membership.mjs';
// Shared state and behaviour. No DOM or visual-direction dependencies.
export const clone = (value) => JSON.parse(JSON.stringify(value));
export const round = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
export const sum = (list) => round(list.reduce((a, b) => a + b, 0));
// Seeded setup entries can be appended out of order. Read the ledger by date;
// for the same day, the most recently recorded entry appears first.
export const recentTransactions = (p, ledger = null, limit = Infinity) =>
  p.l1.transactions
    .filter((x) => !ledger || x.ledger === ledger)
    .reverse()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, limit);
export const cash = (n, decimals = false) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: decimals ? 2 : 0,
    minimumFractionDigits: decimals ? 2 : 0,
  }).format(n);
export const defaults = {
  alex: ['balance', 'dd', 'creditscore', 'activity'],
  jordan: [
    'safespend',
    'container-grocery-wallet',
    'container-ac-cc',
    'container-flat',
    'container-social',
    'efpot',
    'container-loan',
    'activity',
  ],
  sam: [
    'housepot',
    'container-family-budget',
    'holiday',
    'efpot',
    'goldenratio',
    'grocery',
    'points',
    'activity',
  ],
  elena: ['wealth', 'familypot', 'investments', 'retpot', 'points', 'rateswatch'],
};
export function createSession(dataset) {
  const people = {};
  for (const [id, data] of Object.entries(dataset.moments)) {
    const p = clone(data);
    p.ui = {
      quickActions: ['pay', 'transfer', 'addmoney'],
      frozenCards: [],
      connectionExamples: clone(dataset.shared?.['connected-accounts']?.[id] || []),
      connectedBanks: clone(dataset.shared?.['connected-accounts']?.[id] || []),
      order: [...defaults[id]],
      sizes: { [defaults[id][0]]: 'W', activity: 'W' },
      confirmed: p.l2.personality.status === 'confirmed',
      awarded: [
        ...(p.l1.behaviour.app.quizDone ? ['quiz'] : []),
        ...p.l2.beliefs.filter((b) => b.status === 'confirmed').map((b) => 'belief:' + b.id),
      ],
      preview: [],
      applied: [],
      chat: [],
      receipts: [],
      history: [],
      scroll: { now: 0, future: 0, you: 0 },
      appointment: null,
      requests: [],
      redirects: [],
    };
    p.l1.pots.push(...clone(dataset.shared?.['container-experience']?.[id] || []));
    for (const item of [...p.l1.accounts, ...p.l1.pots])
      item.personalOffer = clone(
        dataset.shared?.['container-experience']?.offers?.[id]?.[item.id] || null,
      );
    if (id === 'elena') p.ui.sizes.familypot = 'W';
    people[id] = p;
  }
  return {
    people,
    person: 'alex',
    tab: 'now',
    month: 0,
    view: 'bubbles',
    zoom: 1,
    member: 'self',
    edit: false,
    modal: null,
    direction: 'vanilla',
  };
}
export function current(session) {
  return session.people[session.person];
}
export function scheduledMonth(p, date) {
  if (!date) return 0;
  const a = new Date(p.l1.asOf),
    b = new Date(date);
  return Math.max(
    0,
    (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + b.getUTCMonth() - a.getUTCMonth(),
  );
}
// One monthly ledger drives balances, milestones, cash and Money Speed. Contributions
// arrive at the end of each month, after growth. Current-account rules assume that
// future income funds the agreed allocation; unallocated/paused funding stays in
// that account. Rules sourced from another Pot/account move existing money instead.
const projectionCache = new WeakMap();
const monthIndex = (n) => Math.max(0, Math.min(1200, Math.floor(Number(n) || 0)));
const ruleBudget = (r) =>
  Math.max(0, Math.min(Number(r.amount) || 0, r.limitMonthly > 0 ? r.limitMonthly : Infinity));
const isDebt = (item) => item.isDebt || item.owed != null;
const reached = (item, balances) =>
  item &&
  (isDebt(item) ? balances[item.id] <= 0 : item.target > 0 && balances[item.id] >= item.target);

export function moneyProjection(p, months = 0, includeRedirects = true) {
  const count = monthIndex(months),
    signature = JSON.stringify([
      p.l1.asOf,
      p.l1.accounts,
      p.l1.pots,
      p.l1.rules,
      p.l1.autonomy.paused,
      includeRedirects && p.ui.redirects,
    ]);
  let cached = projectionCache.get(p);
  if (!cached || cached.signature !== signature) {
    const items = [...p.l1.accounts, ...p.l1.pots];
    cached = {
      signature,
      items: new Map(items.map((item) => [item.id, item])),
      balances: Object.fromEntries(
        items.map((item) => [
          item.id,
          Number(isDebt(item) ? (item.owed ?? item.balance) : item.balance) || 0,
        ]),
      ),
      snapshots: [],
    };
    projectionCache.set(p, cached);
  }
  while (cached.snapshots.length <= count) {
    const month = cached.snapshots.length,
      opening = { ...cached.balances },
      balances = { ...opening },
      rates = Object.fromEntries(p.l1.pots.map((g) => [g.id, 0])),
      fundedRules = [],
      allocations = [];
    // Keep full precision for compounding; round only the presented ledger snapshot.
    for (const g of p.l1.pots)
      if (g.growthAnnual && g.growthAnnual > -1)
        balances[g.id] *= Math.pow(1 + g.growthAnnual, 1 / 12);
    if (!p.l1.autonomy.paused) {
      for (const r of p.l1.rules) {
        const source = cached.items.get(r.source),
          original = cached.items.get(r.potId),
          budget = ruleBudget(r);
        if (
          !r.active ||
          !budget ||
          !source ||
          !original ||
          source.id === original.id ||
          isDebt(source) ||
          month < scheduledMonth(p, r.since)
        )
          continue;
        if (
          source.arrangementState?.lockedUntil &&
          month < scheduledMonth(p, source.arrangementState.lockedUntil)
        )
          continue;
        const fromIncome = source.kind === 'current';
        if (fromIncome) balances[source.id] += budget;
        if (month < scheduledMonth(p, r.resumeOn)) continue;
        let destination = original;
        // A redirect moves the original allocation, once, starting the month after
        // its source milestone. Chains are supported; duplicate routes cannot mint money.
        const visited = new Set();
        while (includeRedirects && reached(destination, opening)) {
          if (visited.has(destination.id)) {
            destination = null;
            break;
          }
          visited.add(destination.id);
          const route = (p.ui.redirects || []).find(
            (x) => x.from === destination.id && x.to !== destination.id && cached.items.has(x.to),
          );
          if (!route) break;
          destination = cached.items.get(route.to);
        }
        if (!destination || destination.id === source.id) continue;
        const ceiling = Math.min(
            destination.stopsAtTarget && destination.target > 0 ? destination.target : Infinity,
            destination.id === original.id && r.stopsAt > 0 ? r.stopsAt : Infinity,
          ),
          room = isDebt(destination)
            ? balances[destination.id]
            : Math.max(0, ceiling - balances[destination.id]),
          available = Math.max(0, balances[source.id] - (r.reserve || 0)),
          amount = Math.min(budget, available, room);
        if (amount <= 0) continue;
        balances[source.id] -= amount;
        balances[destination.id] += isDebt(destination) ? -amount : amount;
        rates[destination.id] =
          (rates[destination.id] || 0) + (isDebt(destination) ? -amount : amount);
        fundedRules.push(r.id);
        allocations.push({ ruleId: r.id, potId: destination.id, amount: round(amount) });
      }
    }
    const values = Object.fromEntries(
      Object.entries(opening).map(([id, value]) => [
        id,
        round(p.l1.accounts.some((a) => a.id === id && !isDebt(a)) ? value : Math.max(0, value)),
      ]),
    );
    const cashHeld = sum(p.l1.accounts.filter((a) => !isDebt(a)).map((a) => values[a.id])),
      invested = sum(
        p.l1.pots
          .filter((g) => !g.isDebt && (g.growthAnnual || g.kind === 'investment'))
          .map((g) => values[g.id]),
      ),
      saved = sum(
        p.l1.pots
          .filter((g) => !g.isDebt && !g.growthAnnual && g.kind !== 'investment')
          .map((g) => values[g.id]),
      ),
      owed = sum([...p.l1.accounts, ...p.l1.pots].filter(isDebt).map((g) => values[g.id]));
    cached.snapshots.push({
      values,
      rates: Object.fromEntries(Object.entries(rates).map(([id, value]) => [id, round(value)])),
      ruleCount: fundedRules.length,
      fundedRules,
      allocations,
      cash: cashHeld,
      invested,
      saved,
      held: round(cashHeld + invested + saved),
      owed,
      net: round(cashHeld + invested + saved - owed),
      speed: sum(Object.values(rates).map((rate) => Math.abs(round(rate)))),
    });
    cached.balances = balances;
  }
  return cached.snapshots[count];
}
// Consumers needing a complete path can validate the cache signature once rather
// than repeating it for every milestone candidate and every month.
export function moneyProjectionSeries(p, months = 240, includeRedirects = true) {
  moneyProjection(p, months, includeRedirects);
  return projectionCache.get(p).snapshots.slice(0, monthIndex(months) + 1);
}
export function potRate(p, pot, month = 0) {
  return moneyProjection(p, month).rates[pot.id] || 0;
}
export function valueAt(p, pot, months, includeRedirects = true) {
  return moneyProjection(p, months, includeRedirects).values[pot.id] ?? pot.balance;
}
export function milestone(p, pot) {
  if (!pot.target && !pot.isDebt) return null;
  for (let m = 0; m <= 240; m++)
    if (pot.isDebt ? valueAt(p, pot, m) <= 0 : valueAt(p, pot, m) >= pot.target) return m;
  return null;
}
export function dateAt(p, months = 0) {
  const d = new Date(p.l1.asOf + 'T12:00:00Z');
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}
export function totals(p, months = 0) {
  const { cash, invested, saved, held, owed, net, speed } = moneyProjection(p, months);
  return { cash, invested, saved, held, owed, net, speed };
}
export function addRule(p, pot, amount, title, id) {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Choose an amount above £0.');
  const rule = {
    id: id || 'r-' + p.l1.rules.length + '-' + p.ui.receipts.length,
    potId: pot.id,
    type: 'payday-fixed',
    amount: round(amount),
    source: 'ac-cur',
    since: p.l1.asOf,
    active: true,
    title,
    stopsAt: pot.target || 0,
  };
  p.l1.rules.push(rule);
  pot.rules = pot.rules || [];
  pot.rules.push(rule.id);
  return rule;
}
// Reprioritising changes the destination of an existing commitment, including its
// source and conditions. It must not turn a conditional/estimated rule into salary.
export function redirectRuleAmount(p, from, to, amount, title) {
  if (!Number.isFinite(amount) || amount <= 0 || amount > potRate(p, from) + 0.001)
    throw new Error('There is not enough available in these contributions.');
  let left = round(amount);
  const eligible = p.l1.rules.filter(
    (r) => r.active && r.potId === from.id && (!r.resumeOn || r.resumeOn <= p.l1.asOf),
  );
  for (const r of eligible) {
    const available = ruleBudget(r),
      delta = Math.min(available, left);
    if (!delta) continue;
    const moved = addRule(p, to, delta, title);
    for (const key of [
      'type',
      'source',
      'condition',
      'amountIsAverage',
      'reserve',
      'dayOfMonth',
      'resumeOn',
    ])
      if (r[key] != null) moved[key] = clone(r[key]);
    if (r.limitMonthly > 0) {
      moved.limitMonthly = delta;
      r.limitMonthly = round(Math.max(0, r.limitMonthly - delta));
    }
    // Remove from the effective budget, even if a cap is below the old amount.
    r.amount = round(available - delta);
    if (!r.amount) r.active = false;
    left = round(left - delta);
    if (!left) break;
  }
  if (left > 0.001) throw new Error('There is not enough available in these contributions.');
}
function transferInPlace(p, fromId, toId, amount, label) {
  amount = round(amount);
  const from = p.l1.accounts.find((a) => a.id === fromId) || p.l1.pots.find((a) => a.id === fromId);
  const to = p.l1.accounts.find((a) => a.id === toId) || p.l1.pots.find((a) => a.id === toId);
  if (!from || !to || from === to || from.isDebt || from.owed != null)
    throw new Error('Choose two different accounts or pots.');
  if (from.arrangementState?.lockedUntil > p.l1.asOf)
    throw new Error(
      'This pot is locked until ' +
        from.arrangementState.lockedUntil +
        '. Withdrawals and outgoing rules are unavailable.',
    );
  if (!Number.isFinite(amount) || amount <= 0 || amount > from.balance)
    throw new Error('Choose an amount within the available balance.');
  if ((to.owed != null && amount > to.owed) || (to.isDebt && amount > to.balance))
    throw new Error('That is more than the remaining debt.');
  from.balance = round(from.balance - amount);
  if (to.owed != null) to.owed = round(to.owed - amount);
  else to.balance = round(to.balance + (to.isDebt ? -amount : amount));
  const stamp = 'demo-' + p.l1.transactions.length;
  p.l1.transactions.push(
    {
      id: stamp + '-out',
      date: p.l1.asOf,
      ledger: from.id,
      counterparty: label || 'Transfer to ' + to.name,
      category: 'transfer',
      amount: -amount,
      receipt: true,
    },
    {
      id: stamp + '-in',
      date: p.l1.asOf,
      ledger: to.id,
      counterparty: 'Transfer from ' + from.name,
      category: 'transfer',
      amount: to.isDebt || to.owed != null ? -amount : amount,
      receipt: true,
    },
  );
}
export function applyIdea(p, idea, override) {
  if (!idea.canCommit) throw new Error('This is an illustration. Discuss it with your adviser.');
  if (p.ui.applied.includes(idea.id)) throw new Error('This plan is already running.');
  const e = idea.effect;
  if (e.newPot) {
    const n = e.newPot;
    const pot = {
      id: 'plan-' + idea.id,
      name: n.name,
      kind:
        n.growthAnnual || n.icon === 'trend'
          ? 'investment'
          : n.icon === 'users'
            ? 'shared'
            : 'goal',
      balance: 0,
      target: n.target || null,
      stopsAtTarget: !!n.target,
      isDebt: false,
      growthAnnual: n.growthAnnual || null,
      description: 'Created by you',
      rules: [],
      members: n.icon === 'users' ? [p.l1.customer.id] : null,
    };
    p.l1.pots.push(pot);
    if (n.openingBalance)
      transferInPlace(p, 'ac-cur', pot.id, n.openingBalance, 'Opening ' + pot.name);
    addRule(p, pot, override ?? n.monthlyRate, idea.title);
  } else if (e.from) {
    const from = p.l1.pots.find((x) => x.id === e.from),
      to = p.l1.pots.find((x) => x.id === e.to);
    redirectRuleAmount(p, from, to, e.monthlyAmount, idea.title);
  } else if (e.potId) {
    const pot = p.l1.pots.find((x) => x.id === e.potId);
    if (!pot) throw new Error('This pot is no longer available.');
    addRule(p, pot, override ?? e.monthlyRateDelta, idea.title);
    if (idea.type === 'cap') {
      p.l1.spending.softCaps = {
        ...p.l1.spending.softCaps,
        'eating-out': round(
          p.l1.spending.comparisons.eatingOut.sixMonthAverage - (override ?? e.monthlyRateDelta),
        ),
      };
    }
  }
  p.ui.applied.push(idea.id);
  p.ui.preview = p.ui.preview.filter((x) => x !== idea.id);
  for (const st of p.l2.stories) if (st.action === 'wifstart:' + idea.id) st.state = 'saved';
}
export function previewPerson(p) {
  const copy = clone(p);
  for (const id of p.ui.preview) {
    const w = p.l2.whatIfs.find((x) => x.id === id);
    if (w && !copy.ui.applied.includes(id) && (w.canCommit || w.type === 'illustration'))
      applyIdea(copy, { ...w, canCommit: true });
  }
  return copy;
}
export function transaction(p, description, action) {
  const before = {
    l1: clone(p.l1),
    l2: clone(p.l2),
    ui: clone({ ...p.ui, history: [], receipts: [] }),
  };
  try {
    action();
  } catch (e) {
    p.l1 = before.l1;
    p.l2 = before.l2;
    Object.assign(p.ui, before.ui, { history: p.ui.history, receipts: p.ui.receipts });
    throw e;
  }
  p.ui.history.push(before);
  p.ui.receipts.push({
    id: 'receipt-' + p.ui.receipts.length,
    date: p.l1.asOf,
    title: description,
    undone: false,
  });
  return p.ui.receipts.at(-1);
}
export function undo(p) {
  const before = p.ui.history.pop();
  if (!before) return false;
  const history = p.ui.history,
    receipts = p.ui.receipts;
  const active = [...receipts].reverse().find((r) => !r.undone && !r.reversal);
  if (active) active.undone = true;
  receipts.push({
    id: 'receipt-' + receipts.length,
    date: p.l1.asOf,
    title: 'Undone: ' + (active?.title || 'last change'),
    reversal: true,
  });
  p.l1 = before.l1;
  p.l2 = before.l2;
  p.ui = { ...before.ui, history, receipts, preview: [], chat: p.ui.chat, scroll: p.ui.scroll };
  return true;
}
export function award(p, key, amount, reason) {
  if (p.ui.awarded.includes(key)) return 0;
  p.ui.awarded.push(key);
  p.l1.rewards.points.balance += amount;
  p.l1.rewards.points.ledger.push({ date: p.l1.asOf, reason, points: amount });
  return amount;
}
export function completeQuiz(p, answers, questions = []) {
  if (answers.length !== 3 || answers.some((x) => !Number.isInteger(x) || x < 0 || x > 2))
    throw new Error('Answer all three questions.');
  const name =
    answers[0] === 0 ? 'Planner' : answers[1] === 1 ? 'Balanced builder' : 'Finding your rhythm';
  p.l2.personality = {
    ...p.l2.personality,
    name,
    copy:
      name === 'Planner'
        ? 'You like to know where you stand, then get on with life. A clear plan and quiet updates can help.'
        : name === 'Balanced builder'
          ? 'You make room for today and tomorrow. Small, regular steps can protect both.'
          : 'You want money to feel less demanding. We can start with one useful number and one small step.',
    traits: [
      ['Planning', answers[0] === 0 ? 4 : 3],
      ['Rhythm', answers[1] === 0 ? 4 : 2],
      ['Spontaneity', answers[1] === 1 ? 4 : 2],
    ],
    status: 'named',
    provenance: 'From your three answers · ' + p.l1.asOf,
  };
  p.ui.portraitQuizAnswers = [...answers];
  p.ui.portraitQuizResponses = questions
    .map((q, i) => ({ question: q.q, answer: q.o[answers[i]] }))
    .filter((q) => q.answer);
  p.l1.behaviour.app.quizDone = true;
  for (const story of p.l2.stories) if (story.action === 'quiz') story.state = 'saved';
  if (!p.l2.beliefs.length)
    p.l2.beliefs.push({
      id: 'belief-quiz',
      claim: 'You prefer a clear plan',
      evidence: 'From your answers today',
      status: 'open',
      basis: ['l1:behaviour/app'],
    });
  award(p, 'quiz', 25, 'Money personality quiz');
}
export function confirmBelief(p, id, correction) {
  const b = p.l2.beliefs.find((x) => x.id === id);
  if (!b) throw new Error('Belief not found.');
  if (correction !== undefined) {
    if (!correction.trim()) throw new Error('Tell us what to change.');
    b.previous = b.claim;
    b.correction = correction.trim();
    b.status = 'corrected';
  } else b.status = 'confirmed';
  b.confirmedAt = p.l1.asOf;
  return award(p, 'belief:' + id, 10, correction ? 'A belief corrected' : 'A belief confirmed');
}
export const rewardSavingsPots = (p) =>
  p.l1.pots.filter(
    (pot) => !pot.isDebt && !pot.growthAnnual && !['budget', 'investment'].includes(pot.kind),
  );
export function rewardAvailability(p, benefit) {
  if (!benefit) return { available: false, reason: 'This reward is no longer available.' };
  if (benefit.premier && relationshipQualification(p).index < 1)
    return { available: false, reason: 'Available with Premier or Elite' };
  const remaining = Math.max(0, benefit.cost - p.l1.rewards.points.balance);
  if (remaining)
    return {
      available: false,
      reason: `${remaining.toLocaleString('en-GB')} more Points to unlock`,
    };
  if (benefit.id === 'boost' && !rewardSavingsPots(p).length)
    return { available: false, reason: 'A savings Pot is needed for this reward' };
  return { available: true, reason: 'Available with your Points' };
}
export function redeem(p, benefit, potId) {
  const eligibility = rewardAvailability(p, benefit);
  if (!eligibility.available) throw new Error(eligibility.reason);
  if (benefit.id === 'boost' && !rewardSavingsPots(p).some((pot) => pot.id === potId))
    throw new Error('Choose a savings pot.');
  p.l1.rewards.points.balance -= benefit.cost;
  p.l1.rewards.points.ledger.push({ date: p.l1.asOf, reason: benefit.t, points: -benefit.cost });
  p.l1.rewards.activeBenefits.push({ id: benefit.id, title: benefit.t, potId, date: p.l1.asOf });
}
export function moveMoney(p, from, to, amount) {
  transferInPlace(p, from, to, amount);
}
