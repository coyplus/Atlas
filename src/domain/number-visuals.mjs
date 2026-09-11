import { spendingRole, limitState } from './visual-semantics.mjs';
import { totals, cash } from './money.mjs';

// Visuals carry their evidence, units and scale into both the tile and its detail.
export function numberVisual(p, m) {
  const t = totals(p),
    id = m.id;
  if (['safespend', 'afterbills'].includes(id) && m.value !== 'Learning') {
    const reserved = Number(m.rows[1][1].replace(/[^\d.-]/g, ''));
    return {
      type: 'split',
      role: 'cash',
      label: 'Available and set aside',
      items: [
        { label: 'Available', role: 'cash', value: Math.max(0, t.cash - reserved) },
        { label: 'Set aside', role: 'reserved', value: reserved },
      ],
    };
  }
  if (['wealth', 'investments', 'whereitgoes', 'spent'].includes(id)) {
    const items =
      id === 'wealth'
        ? [
            ['Cash', t.cash, 'cash'],
            ['Pots', t.saved, 'savings'],
            ['Invested', t.invested, 'investment'],
          ]
        : id === 'investments'
          ? p.l1.pots
              .filter((x) => x.growthAnnual || x.kind === 'investment')
              .map((x) => [x.name, x.balance, 'investment'])
          : Object.entries(p.l1.spending.byCategory).map(([k, v]) => [
              k.replaceAll('-', ' '),
              v,
              spendingRole(k),
            ]);
    return {
      type: 'ring',
      label:
        id === 'wealth'
          ? 'Where your money is held'
          : id === 'investments'
            ? 'Investment mix'
            : 'Spending mix',
      items: items.filter((x) => x[1] > 0).map(([label, value, role]) => ({ label, value, role })),
    };
  }
  if (id === 'safetydays' && /days/.test(m.value))
    return {
      type: 'coverage',
      role: 'savings',
      label: 'Emergency cover',
      value: parseInt(m.value),
      max: 180,
      caption: 'Each block covers 30 days of essential bills',
    };
  if (id === 'cardusage' && m.utilisation != null)
    return {
      type: 'gauge',
      role: 'borrowing',
      state: limitState(m.utilisation, 100),
      stateLabel:
        m.utilisation > 100
          ? 'Over your credit limit'
          : m.utilisation === 100
            ? 'Credit limit reached'
            : '',
      label: 'Credit limit used',
      value: m.utilisation,
      max: 100,
      caption: '',
    };
  if (id === 'groceryrhythm' && m.streak)
    return {
      type: 'streak',
      role: 'savings',
      label: 'Months within your grocery line',
      value: m.streak,
      caption: `${cash(p.l1.spending.comparisons.groceries.line)} monthly line`,
    };
  if (['grocery', 'eatingout'].includes(id)) {
    const category = id === 'grocery' ? 'groceries' : 'eating-out';
    const credit = new Set(p.l1.accounts.filter((a) => a.owed != null).map((a) => a.id));
    const tx = p.l1.transactions
      .filter(
        (x) =>
          x.category === category &&
          x.date.slice(0, 7) === p.l1.asOf.slice(0, 7) &&
          x.date <= p.l1.asOf,
      )
      .sort((a, b) => a.date.localeCompare(b.date));
    let total = 0;
    const items = tx.map((x) => ({
      label: x.date,
      value: (total += credit.has(x.ledger) ? x.amount : -x.amount),
    }));
    if (items.length)
      return {
        type: 'line',
        role: spendingRole(category),
        label: 'Spending this month',
        items: [{ label: p.l1.asOf.slice(0, 7) + '-01', value: 0 }, ...items],
        caption: 'Cumulative recorded purchases',
        end: p.l1.asOf,
      };
  }
  if (['subs', 'dd'].includes(id) && m.rows.length)
    return {
      type: 'split',
      label: 'Recurring payments',
      role: 'reserved',
      items: m.rows.map(([label, value]) => ({
        label,
        role: 'reserved',
        value: Number(value.replace(/[^\d.-]/g, '')),
      })),
    };
  return null;
}

export function numberIdeas(p) {
  const extra = [];
  if (p.l1.credit.debts.some((d) => d.limit))
    extra.push({ moduleId: 'cardusage', why: 'Keep your card balance in view against its limit.' });
  if (p.l1.spending.byCategory['eating-out'])
    extra.push({ moduleId: 'eatingout', why: 'See how eating out adds up through the month.' });
  if (p.l1.pots.some((x) => x.id === 'ef'))
    extra.push({
      moduleId: 'safetydays',
      why: 'See how long your emergency fund could cover essential bills.',
    });
  if (p.l1.spending.comparisons?.groceries?.monthsHeld)
    extra.push({ moduleId: 'groceryrhythm', why: 'Keep your grocery budget habit in view.' });
  if (totals(p).invested > 0)
    extra.push({
      moduleId: 'investments',
      why: 'See how your long-term money is spread across pots.',
    });
  const seen = new Set();
  return [...extra, ...p.l2.recommendations.filter((r) => r.kind === 'module-suggestion')]
    .filter((r) => {
      if (seen.has(r.moduleId) || p.ui.order.includes(r.moduleId)) return false;
      seen.add(r.moduleId);
      return true;
    })
    .slice(0, 3);
}
export function newNumberIdeas(p) {
  return numberIdeas(p).filter((r) => !(p.ui.seenNumberIdeas || []).includes(r.moduleId)).length;
}
