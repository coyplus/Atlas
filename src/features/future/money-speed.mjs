import { forecast, futureState, planningPots } from '../../domain/future.mjs';
import { cash } from '../../domain/money.mjs';
export function moneySpeedModel(p, s) {
  const next = forecast(p, futureState(p).ideas, s.month);
  const allocations = planningPots(next.person).map((goal) => ({
    goal,
    amount: Math.abs(next.rates[goal.id] || 0),
  }));
  const active = allocations.filter((x) => x.amount > 0);
  const total = active.reduce((sum, x) => sum + x.amount, 0);
  const largest = [...active].sort((a, b) => b.amount - a.amount)[0];
  return {
    next,
    allocations,
    active,
    total,
    insight: largest
      ? `${largest.goal.name} receives ${Math.round((largest.amount / total) * 100)}% of your monthly plan.`
      : 'A small regular step can give your future momentum.',
    idea: largest
      ? `That’s ${cash(Math.round(largest.amount))} a month. Explore a different pace before changing your agreed rules.`
      : 'Choose a goal, then explore an amount that works for you.',
  };
}
