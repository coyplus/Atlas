import {
  clone,
  sum,
  potRate,
  valueAt,
  moneyProjectionSeries,
  redirectRuleAmount,
  addRule,
  applyIdea,
  dateAt,
} from './money.mjs';

export const HORIZON = 240;
export const planningPots = (p) =>
  p.l1.pots.filter((g) => g.kind !== 'budget' && !g.futureArchived);
export const protectedGoal = (p, g) =>
  g.isDebt ||
  g.kind === 'committed-plan' ||
  Boolean(g.arrangementState?.lockedUntil > p.l1.asOf) ||
  p.l1.rules.some((r) => r.potId === g.id && r.active && (r.locked || r.committed));
export const futureState = (p) =>
  p.ui.future || { mode: 'view', ideas: [], messages: [], proposal: null };
export function ensureFuture(p) {
  return (p.ui.future ||= { mode: 'view', ideas: [], messages: [], proposal: null });
}
export const role = (g) =>
  g.isDebt ? 'borrowing' : g.growthAnnual || g.kind === 'investment' ? 'investment' : 'savings';
export const glyph = (g) =>
  g.visualIcon ||
  (g.isDebt
    ? 'car'
    : /home|house/i.test(g.name)
      ? 'home'
      : /holiday/i.test(g.name)
        ? 'sun'
        : /retire|invest/i.test(g.name)
          ? 'trend'
          : 'target');
export function endMonth(p, g) {
  if (!g.target && !g.isDebt) return null;
  for (let m = 0; m <= HORIZON; m++)
    if (g.isDebt ? valueAt(p, g, m) <= 0 : valueAt(p, g, m) >= g.target) return m;
  return null;
}
export const when = (p, m) =>
  m == null ? 'Beyond this horizon' : m === 0 ? 'Already there' : dateAt(p, m);
export function movement(a, b) {
  if (a === b) return 'Same date';
  if (b == null) return 'Beyond 20 years';
  if (a == null) return 'Now within reach';
  return `${Math.abs(b - a)}mo ${b < a ? 'earlier' : 'later'}`;
}
function positive(n, max = 10000) {
  if (!Number.isFinite(n) || n <= 0 || n > max)
    throw new Error('Choose a positive amount within the prototype limits.');
}
function editable(p, id) {
  const g = p.l1.pots.find((x) => x.id === id && !x.futureArchived);
  if (!g)
    throw new Error('This goal is no longer available. Reset your experiments and try again.');
  if (protectedGoal(p, g))
    throw new Error('This commitment stays in place. Try another goal instead.');
  return g;
}
// Both preview and approval use the same mutations on the same financial model.
// Preview always starts from a clone. No draft mutates the live person.
export function applyExperiments(p, ideas) {
  for (const idea of ideas) {
    if (idea.kind === 'authored') {
      applyIdea(p, clone(idea.authored));
    } else if (idea.kind === 'add') {
      positive(idea.amount);
      positive(idea.target, 1e7);
      if (!idea.name?.trim() || idea.name.length > 60)
        throw new Error('Give your goal a short name.');
      if (p.l1.pots.some((g) => g.id === idea.goal))
        throw new Error('This goal is already in your plan.');
      const g = {
        id: idea.goal,
        name: idea.name,
        kind: idea.investment ? 'investment' : 'goal',
        balance: 0,
        target: idea.target,
        stopsAtTarget: !idea.investment,
        ...(idea.investment ? { growthAnnual: 0.05 } : {}),
        ...(idea.possibilityKey ? { possibilityKey: idea.possibilityKey } : {}),
        ...(idea.visualIcon ? { visualIcon: idea.visualIcon } : {}),
        rules: [],
        description: 'A future you chose',
        isDebt: false,
      };
      p.l1.pots.push(g);
      const rule = addRule(p, g, idea.amount, idea.title);
      if (idea.investment) rule.stopsAt = 0;
    } else {
      const g = editable(p, idea.goal);
      if (idea.kind === 'roundup') {
        positive(idea.amount);
        const rule = addRule(p, g, idea.amount, idea.title);
        rule.type = 'round-up';
        rule.amountIsAverage = true;
        rule.limitMonthly = 30;
        if (idea.amount > rule.limitMonthly)
          throw new Error('Keep the round-up estimate within its monthly cap.');
      } else if (idea.kind === 'extra') {
        positive(idea.amount);
        addRule(p, g, idea.amount, idea.title);
      } else if (idea.kind === 'pause') {
        positive(idea.months, 24);
        if (!Number.isInteger(idea.months)) throw new Error('Choose a whole number of months.');
        const rs = p.l1.rules.filter((r) => r.potId === g.id && r.active && r.amount > 0);
        if (!rs.length) throw new Error('There is no contribution to pause yet.');
        const resume = new Date(p.l1.asOf + 'T12:00:00Z');
        resume.setUTCDate(1);
        resume.setUTCMonth(resume.getUTCMonth() + idea.months);
        for (const r of rs) {
          r.resumeOn = resume.toISOString().slice(0, 10);
          r.pauseStarted = p.l1.asOf;
        }
      } else if (idea.kind === 'priority') {
        positive(idea.amount);
        const from = editable(p, idea.from);
        if (from.id === g.id) throw new Error('Choose two different goals.');
        redirectRuleAmount(p, from, g, idea.amount, idea.title);
      } else if (idea.kind === 'remove') {
        for (const r of p.l1.rules.filter((r) => r.potId === g.id && r.active)) r.active = false;
        g.futureArchived = true; // Keep its Pot, balance and history; retire only the goal.
      } else throw new Error('This experiment is not supported yet.');
    }
  }
  return p;
}
// Month scrubbing changes only the selected snapshot. Keep a small LRU of
// prepared scenarios; cloned What If candidates can share the same financial path.
// Transient Future UI state never affects the numbers and is excluded from the key.
const forecastCache = new Map();
const FORECAST_CACHE_LIMIT = 32;
function prepareForecast(p, ideas, horizon = HORIZON) {
  const ui = { ...p.ui };
  delete ui.future;
  const key = JSON.stringify([p.l1, p.l2, ui, ideas, horizon]);
  let prepared = forecastCache.get(key);
  if (prepared) {
    forecastCache.delete(key);
    forecastCache.set(key, prepared);
    return prepared;
  }
  const person = applyExperiments(clone(p), ideas),
    goals = planningPots(person),
    path = moneyProjectionSeries(person, horizon),
    dates = Object.fromEntries(
      goals.map((g) => {
        const month =
          !g.target && !g.isDebt
            ? -1
            : path
                .slice(0, HORIZON + 1)
                .findIndex((step) =>
                  g.isDebt ? step.values[g.id] <= 0 : step.values[g.id] >= g.target,
                );
        return [g.id, month < 0 ? null : month];
      }),
    );
  const hasInvestments = person.l1.pots.some((g) => g.growthAnnual || g.kind === 'investment');
  const ranges = hasInvestments
    ? [-0.02, 0.08].map((growth) => {
        const q = clone(person);
        q.l1.pots
          .filter((g) => g.growthAnnual || g.kind === 'investment')
          .forEach((g) => (g.growthAnnual = growth));
        return moneyProjectionSeries(q, horizon);
      })
    : [path, path];
  prepared = { person, path, dates, ranges };
  forecastCache.set(key, prepared);
  if (forecastCache.size > FORECAST_CACHE_LIMIT)
    forecastCache.delete(forecastCache.keys().next().value);
  return prepared;
}
export function forecast(p, ideas = [], month = 0) {
  const at = Math.max(0, Math.min(1200, Math.floor(Number(month) || 0))),
    prepared = prepareForecast(p, ideas, Math.max(HORIZON, at)),
    t = prepared.path[at],
    person = clone(prepared.person);
  // Return detached data: a consumer may inspect/edit a preview without touching
  // either the actual plan or the reusable calculation snapshots.
  if (p.ui.future) person.ui.future = clone(p.ui.future);
  else delete person.ui.future;
  const goals = planningPots(person),
    goalIds = new Set(goals.map((g) => g.id)),
    rates = Object.fromEntries(goals.map((g) => [g.id, t.rates[g.id] || 0]));
  return {
    person,
    goals,
    dates: { ...prepared.dates },
    values: Object.fromEntries(goals.map((g) => [g.id, t.values[g.id]])),
    net: t.net,
    range: prepared.ranges.map((path) => path[at].net),
    speed: sum(Object.values(rates).map(Math.abs)),
    rates,
    ruleCount: t.allocations.filter((a) => goalIds.has(a.potId)).length,
    cash: t.cash,
  };
}
export function suggestIdeas(p) {
  const gs = planningPots(p).filter((g) => !protectedGoal(p, g));
  const home = gs.find((g) => /home|house/i.test(g.name)) || gs.find((g) => g.target) || gs[0];
  const saving =
    gs.find((g) => /emergency|buffer/i.test(g.name)) ||
    gs.find((g) => g.id !== home?.id && g.target);
  const ideas = [];
  if (home)
    ideas.push({
      id: 'closer-' + home.id,
      kind: 'extra',
      goal: home.id,
      amount: 50,
      title: 'Save first on payday',
      why: `Savings Rule · £50/month to ${home.name.toLowerCase()}, if your budget has room.`,
    });
  if (home && !p.l1.rules.some((r) => r.active && r.type === 'round-up'))
    ideas.push({
      id: 'roundup-' + home.id,
      kind: 'roundup',
      goal: home.id,
      amount: 20,
      title: 'Let the small change add up',
      why: `Smart Rule · round purchases up to the next £1 for ${home.name.toLowerCase()}. Try a £20/month estimate, capped at £30.`,
    });
  const pausable = [home, ...gs].find((g) => g && potRate(p, g) > 0);
  if (pausable)
    ideas.push({
      id: 'pause-' + pausable.id,
      kind: 'pause',
      goal: pausable.id,
      months: 6,
      title: 'Make room for today',
      why: `Pause ${pausable.name.toLowerCase()} for six months. Keep the money in cash.`,
    });
  const source = gs.find((g) => g.id !== saving?.id && potRate(p, g) >= 25);
  if (saving && source)
    ideas.push({
      id: 'priority-' + saving.id,
      kind: 'priority',
      goal: saving.id,
      from: source.id,
      amount: Math.min(50, potRate(p, source)),
      title: `Put ${saving.name.toLowerCase()} first`,
      why: `Redirect part of your ${source.name.toLowerCase()} contribution. Same monthly total.`,
    });
  if (!ideas.length)
    ideas.push({
      id: 'first-goal',
      kind: 'add',
      goal: 'future-first',
      name: 'Breathing room',
      target: 1000,
      amount: 25,
      title: 'Build a little breathing room',
      why: 'Explore a £1,000 cushion, starting with £25 a month.',
    });
  return ideas;
}
export function ideaDescription(p, i) {
  if (i.kind === 'authored') return i.authored.explainer || i.authored.summary || i.title;
  const name = planningPots(p).find((g) => g.id === i.goal)?.name || i.name || 'Goal';
  if (i.kind === 'roundup')
    return `Create a round-up Smart Rule for ${name}, funded from your current account. Round eligible purchases up to the next £1, capped at £30/month. This projection assumes £${i.amount}/month; actual saving depends on spending and can be lower or zero.`;
  if (i.kind === 'extra')
    return `Add £${i.amount}/month to ${name}. Funded from your current account; check this fits your budget.`;
  if (i.kind === 'pause')
    return `Pause ${name} for ${i.months} months, then resume automatically. Contributions stay in your current account during the pause.`;
  if (i.kind === 'priority')
    return `Move £${i.amount}/month from ${p.l1.pots.find((g) => g.id === i.from)?.name || 'another goal'} to ${name}. Your total contribution stays the same.`;
  if (i.kind === 'remove')
    return `Retire ${name} as a goal and stop its Money Rules. Its existing Pot and balance stay available in Now.`;
  if (i.kind === 'add' && i.investment)
    return `Model ${i.name} with £${i.amount}/month from your current account and a £${i.target} milestone. Contributions continue after the milestone. This prototype uses 5% annual growth with an illustrative range; values can fall. Applying adds a simulated investment Pot and Money Rule, not a real investment account.`;
  return `Create ${i.name}, a £${i.target} goal, with a £${i.amount}/month Money Rule from your current account.`;
}
export function interpretIdea(p, text, previous = null) {
  const t = text.toLowerCase(),
    gs = planningPots(p);
  const match =
    gs.find((g) => t.includes(g.name.toLowerCase())) ||
    gs.find((g) =>
      g.name
        .toLowerCase()
        .split(' ')
        .some((w) => w.length > 3 && t.includes(w)),
    ) ||
    gs.find((g) => /home|house/i.test(g.name) && /home|house/.test(t));
  const g =
    match ||
    gs.find((g) => g.id === previous?.goal) ||
    gs.find((g) => /home|house/i.test(g.name)) ||
    gs.find((g) => g.target && !protectedGoal(p, g));
  if (!g) return { error: 'Start with a goal, then we can explore its contributions together.' };
  if (protectedGoal(p, g))
    return {
      error: `${g.name} is a protected commitment in this model. Choose another goal to keep that commitment intact.`,
    };
  const month = t.match(/\b(\d{1,2})\s*(?:months?|instead)/),
    word = t.match(/\b(one|two|three|four|five|six|twelve)\s+months?/);
  if (
    /pause|break|stop/.test(t) ||
    (previous?.kind === 'pause' && (month || word || /instead/.test(t)))
  ) {
    const months = month
      ? +month[1]
      : word
        ? { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, twelve: 12 }[word[1]]
        : 6;
    if (months < 1 || months > 24) return { error: 'Try a pause between 1 and 24 months.' };
    return {
      id: 'chat-pause-' + g.id,
      kind: 'pause',
      goal: g.id,
      months,
      title: `Pause ${g.name.toLowerCase()} for ${months} months`,
      why: 'A little room today. A clear view of tomorrow.',
    };
  }
  const amount = t.match(/£\s*(\d+)/) || t.match(/(?:extra|another|add)\s+(\d+)/);
  if (amount) {
    const n = +amount[1];
    if (n < 1 || n > 10000) return { error: 'Try a monthly amount between £1 and £10,000.' };
    if (/from|redirect|move/.test(t))
      return {
        error:
          'Try a priority idea in the What If cards to redirect an existing contribution. Your total monthly commitment stays the same.',
      };
    return {
      id: 'chat-extra-' + g.id,
      kind: 'extra',
      goal: g.id,
      amount: n,
      title: `Add £${n} a month to ${g.name.toLowerCase()}`,
      why: 'Explore the difference a little more could make.',
    };
  }
  return {
    error: `Try “Pause ${g.name} for six months” or “Add £50 a month to ${g.name}”. You can refine the amount or duration in your next message. This prototype uses simulated AI responses.`,
  };
}
export function toggleExperiment(p, idea) {
  const f = ensureFuture(p);
  if (f.ideas.some((i) => i.id === idea.id)) {
    f.ideas = f.ideas.filter((i) => i.id !== idea.id);
    return;
  }
  const ideas = f.ideas.filter(
    (i) =>
      !(
        i.goal === idea.goal &&
        (i.kind === idea.kind ||
          ['pause', 'remove'].includes(i.kind) ||
          ['pause', 'remove'].includes(idea.kind))
      ),
  );
  const compatible = ideas.filter(
    (i) =>
      !(idea.kind === 'priority' && ['pause', 'remove'].includes(i.kind) && i.goal === idea.from) &&
      !(['pause', 'remove'].includes(idea.kind) && i.kind === 'priority' && i.from === idea.goal),
  );
  compatible.push(clone(idea));
  forecast(p, compatible);
  f.ideas = compatible;
}
