import { numberVisual } from './number-visuals.mjs';
import { moneyContainer, containerNumber } from './containers.mjs';
import {
  previewPerson,
  cash,
  sum,
  totals,
  potRate,
  milestone,
  dateAt,
  valueAt,
  recentTransactions,
  rewardAvailability,
} from './money.mjs';
export const potIcons = {
  ef: 'shield',
  house: 'home',
  loan: 'car',
  hol: 'plane',
  inv: 'trend',
  ret: 'sun',
  hup: 'home',
  fam: 'users',
  un: 'wallet',
};
export const moduleIcons = {
  balance: 'wallet',
  safespend: 'shield',
  grocery: 'basket',
  subs: 'repeat',
  points: 'spark',
  cashback: 'card',
  safetydays: 'shield',
  creditscore: 'chart',
  holiday: 'plane',
  housepot: 'home',
  wealth: 'globe',
  ratio: 'shield',
  familypot: 'users',
  activity: 'clock',
  dd: 'repeat',
  efpot: 'shield',
  retpot: 'sun',
  goldenratio: 'trend',
  rateswatch: 'chart',
  afterbills: 'wallet',
  spent: 'card',
  whereitgoes: 'chart',
  freedom: 'car',
  investments: 'trend',
};
export function evidenceFor(p, id) {
  return p.l2.insights.find((x) => x.id === 'ins-work-' + id);
}
export function safeAmount(p) {
  const work = evidenceFor(p, 'safe-to-spend');
  if (!work) return null;
  const parse = (v) => Number(String(v).replace(/[^\d.-]/g, ''));
  const reserved = sum(work.rows.slice(1).map((r) => Math.abs(parse(r[1]))));
  return Math.max(0, totals(p).cash - reserved);
}
export function groceryInsight(p) {
  const names = new Map([...p.l1.accounts, ...p.l1.pots].map((x) => [x.id, x.name])),
    credit = new Set(p.l1.accounts.filter((x) => x.owed != null).map((x) => x.id));
  const transactions = p.l1.transactions
    .filter(
      (t) =>
        t.category === 'groceries' &&
        t.date >= p.l1.asOf.slice(0, 7) + '-01' &&
        t.date <= p.l1.asOf,
    )
    .map((t) => ({
      ...t,
      spent: credit.has(t.ledger) ? t.amount : -t.amount,
      account: names.get(t.ledger) || t.ledger,
    }));
  return {
    total: sum(transactions.map((t) => t.spent)),
    transactions,
    pot: p.l1.pots.find((x) => x.spendingCategory === 'groceries'),
  };
}
export function moduleModel(p, id, catalogue) {
  const model = baseModuleModel(p, id, catalogue);
  return { ...model, visual: numberVisual(p, model) };
}
function baseModuleModel(p, id, catalogue) {
  if (id.startsWith('external-')) {
    const key = id.slice(9),
      [bankId, accountId] = key.split('/'),
      bank = p.ui.connectedBanks?.find((b) => b.id === bankId),
      item = bank?.accounts.find((a) => a.id === accountId);
    if (item)
      return {
        id,
        title: item.nickname || item.name,
        value: cash(item.balance, true),
        icon: 'wallet',
        bankId,
        glance: bank.name,
        note: bank.name + ' · connected',
        detail: 'Read-only · sample balance',
        rows: [
          ['Bank', bank.name],
          ['Account', '•• ' + item.masked],
          ['Access', 'Read-only'],
        ],
        action: 'connected-account:' + key,
        kind: 'neutral',
      };
    return {
      id,
      title: 'Connected account',
      value: 'Disconnected',
      note: 'Reconnect to include this balance',
      detail: 'No balance is shared',
      rows: [],
      icon: 'globe',
      action: 'connect-bank',
      kind: 'neutral',
    };
  }
  if (id.startsWith('container-')) {
    const item = moneyContainer(p, id.slice(10));
    if (item) return containerNumber(p, item, id);
  }
  const def = catalogue.modules.find((x) => x.id === id) || { title: id, description: '' };
  const model = {
    id,
    title: def.title,
    note: def.description,
    icon: moduleIcons[id] || 'wallet',
    value: '—',
    rows: [],
    detail: '',
    kind: 'neutral',
  };
  const t = totals(p),
    by = (key) => p.l1.pots.find((x) => x.id === key),
    amount = (n) => cash(n, true);
  const map = { efpot: 'ef', housepot: 'house', holiday: 'hol', familypot: 'fam', retpot: 'ret' };
  if (map[id]) {
    const pot = by(map[id]);
    if (!pot)
      return { ...model, value: 'Not started', note: 'Create a pot in Future', action: 'newplan' };
    return containerNumber(p, pot, id);
  }

  switch (id) {
    case 'eatingout': {
      const credit = new Set(p.l1.accounts.filter((a) => a.owed != null).map((a) => a.id));
      const tx = p.l1.transactions.filter(
        (x) =>
          x.category === 'eating-out' &&
          x.date.slice(0, 7) === p.l1.asOf.slice(0, 7) &&
          x.date <= p.l1.asOf,
      );
      Object.assign(model, {
        value: amount(sum(tx.map((x) => (credit.has(x.ledger) ? x.amount : -x.amount)))),
        note: 'This month',
        rows: tx.map((x) => [
          x.counterparty,
          x.date,
          amount(credit.has(x.ledger) ? x.amount : -x.amount),
        ]),
        detail: 'Recorded eating-out purchases across your accounts and pots.',
      });
      break;
    }
    case 'cardusage': {
      const cards = p.l1.credit.debts.filter((d) => d.limit);
      const used = sum(
        cards.map(
          (d) => p.l1.accounts.find((a) => 'accounts/' + a.id === d.ref)?.owed ?? d.balance,
        ),
      );
      const limit = sum(cards.map((d) => d.limit));
      Object.assign(model, {
        value: limit ? Math.round((used / limit) * 100) + '%' : 'No credit card',
        note: 'Of your credit limit',
        utilisation: limit ? (used / limit) * 100 : null,
        rows: limit
          ? [
              ['Used', amount(used)],
              ['Limit', amount(limit)],
            ]
          : [],
        detail: 'Balance as a share of the combined credit limit on your recorded cards.',
      });
      break;
    }
    case 'groceryrhythm': {
      const c = p.l1.spending.comparisons?.groceries;
      Object.assign(model, {
        value: c?.monthsHeld ? c.monthsHeld + ' months' : 'Learning',
        note: 'Within your grocery line',
        streak: c?.monthsHeld,
        rows: c?.monthsHeld
          ? [
              ['Monthly line', cash(c.line)],
              ['Completed months', String(c.monthsHeld)],
            ]
          : [],
        detail:
          'Completed months within your grocery spending line. The current month is still in progress.',
      });
      break;
    }
    case 'balance':
      Object.assign(model, {
        value: amount(t.cash),
        note: 'Current account · available balance',
        rows: p.l1.accounts
          .filter((a) => a.balance != null)
          .map((a) => [a.name, amount(a.balance)]),
      });
      break;
    case 'safespend':
    case 'afterbills': {
      const n = safeAmount(p);
      Object.assign(model, {
        value: n === null ? 'Learning' : amount(n),
        note: n === null ? 'Building your picture' : 'After your bills and commitments',
        rows: [
          ['Current balance', amount(t.cash)],
          ['Set aside', n === null ? 'Learning' : amount(t.cash - n)],
        ],
        detail: 'See what’s set aside.',
      });
      break;
    }
    case 'points': {
      const count = (catalogue.benefits || []).filter(
        (b) => rewardAvailability(p, b).available,
      ).length;
      Object.assign(model, {
        value: p.l1.rewards.points.balance.toLocaleString('en-GB'),
        note: 'For healthy habits',
        glance: `${count} redeemable ${count === 1 ? 'benefit' : 'benefits'}`,
        rows: p.l1.rewards.points.ledger.map((x) => [
          x.reason,
          (x.points > 0 ? '+' : '') + x.points,
        ]),
        action: 'points',
        kind: 'reward',
      });
      break;
    }
    case 'grocery': {
      const g = groceryInsight(p);
      Object.assign(model, {
        title: 'Grocery spending',
        value: amount(g.total),
        icon: 'chart',
        numberRole: 'Spending insight',
        valueLabel: 'Spent this month',
        note: 'Across accounts & pots',
        detail: 'Tracks purchases, wherever you paid from. This is not money available to spend.',
        rows: g.transactions.map((x) => [
          x.counterparty,
          x.account + ' · ' + x.date,
          amount(x.spent),
        ]),
        relatedPot: g.pot?.id,
      });
      break;
    }
    case 'subs':
    case 'dd': {
      const bills = p.l1.bills.filter((b) =>
        id === 'subs' ? b.category === 'subscriptions' : b.method === 'Direct Debit',
      );
      Object.assign(model, {
        value: amount(sum(bills.map((x) => x.amount))),
        note: bills.length + (id === 'subs' ? ' subscriptions' : ' Direct Debits'),
        rows: bills.map((x) => [x.name, amount(x.amount)]),
      });
      break;
    }
    case 'cashback': {
      const cb = p.l1.rewards.cashback;
      Object.assign(model, {
        value: cb ? amount(cb.ytd ?? 0) : 'Not enabled',
        note: 'A card benefit · never points for spending',
        rows: cb
          ? Object.entries(cb)
              .filter(([k, v]) => typeof v !== 'object')
              .map(([k, v]) => [k, String(v)])
          : [],
      });
      break;
    }
    case 'wealth':
      Object.assign(model, {
        value: cash(t.held),
        note: 'Total held · before debt',
        rows: [
          ['Current accounts', amount(t.cash)],
          ['Pots', amount(t.saved)],
          ['Investments', amount(t.invested)],
          ['Owed', amount(t.owed)],
          ['Net worth', amount(t.net)],
        ],
        kind: 'wealth',
      });
      break;
    case 'investments':
    case 'ratio': {
      const pct = p.l1.savingsAndInvestments.floorProtectedPct || 0;
      Object.assign(model, {
        value: cash(id === 'ratio' ? t.invested * pct : t.invested),
        note: id === 'ratio' ? Math.round(pct * 100) + '% floor allocation' : 'Long-term money',
        rows: [
          ['Invested', amount(t.invested)],
          ['Floor allocation', Math.round(pct * 100) + '%'],
          ['Illustrative growth', '5% a year · not guaranteed'],
        ],
      });
      break;
    }
    case 'goldenratio': {
      const work = evidenceFor(p, 'golden-ratio');
      const essentials = sum(
        p.l1.bills
          .filter((b) => !['subscriptions', 'debt'].includes(b.category))
          .map((b) => b.amount),
      );
      const available = work ? Math.max(0, t.cash - essentials - t.speed) : null;
      Object.assign(model, {
        title: 'Room to invest',
        value: available === null ? 'Let’s explore' : amount(available),
        note: 'After your essentials and commitments',
        rows:
          available === null
            ? []
            : [
                ['Current balance', amount(t.cash)],
                ['Essentials', cash(essentials)],
                ['Monthly plans', cash(t.speed)],
              ],
        detail:
          'An illustration to discuss with a financial expert. Your emergency fund stays separate.',
        kind: 'wealth',
      });
      break;
    }
    case 'safetydays': {
      const pot = by('ef'),
        bills = sum(
          p.l1.bills
            .filter((x) => !['subscriptions', 'debt'].includes(x.category))
            .map((x) => x.amount),
        );
      Object.assign(model, {
        value: pot && bills ? Math.round((pot.balance / bills) * 30) + ' days' : 'Not started',
        note: 'Based on essential monthly bills',
        rows: pot
          ? [
              ['Emergency fund', amount(pot.balance)],
              ['Monthly essentials', amount(bills)],
            ]
          : [],
      });
      break;
    }
    case 'freedom': {
      const pot = p.l1.pots.find((x) => x.isDebt),
        m = pot ? milestone(p, pot) : null;
      Object.assign(model, {
        value: pot ? (m === null ? 'Not set' : dateAt(p, m)) : 'No loan pot',
        note: pot
          ? 'When your ' + pot.name.toLowerCase() + ' reaches zero'
          : 'Your borrowing, in one place',
        rows: pot
          ? [
              ['Left to repay', amount(pot.balance)],
              ['Each month', cash(Math.abs(potRate(p, pot)))],
            ]
          : [],
        potId: pot?.id,
      });
      break;
    }
    case 'creditscore':
      Object.assign(model, {
        value: p.l1.credit.score ?? 'Learning',
        note: p.l1.credit.score
          ? 'Soft check · no impact on your score'
          : 'No score available in this snapshot',
        rows: [['Monitoring', 'Soft checks only']],
      });
      break;
    case 'rateswatch':
      Object.assign(model, {
        value: p.l1.customer.tier === 'Premier' ? 'Watching' : 'Available',
        note: 'Savings and mortgage rates',
        rows: evidenceFor(p, 'rates-watch')?.rows || [['Your rates', 'Ask AI to review']],
        action: 'chat',
      });
      break;
    case 'spent':
    case 'whereitgoes':
      Object.assign(model, {
        value: amount(sum(Object.values(p.l1.spending.byCategory))),
        note: 'This month so far',
        rows: Object.entries(p.l1.spending.byCategory).map(([k, v]) => [
          k.replaceAll('-', ' '),
          amount(v),
        ]),
      });
      break;
    case 'activity':
      Object.assign(model, {
        action: 'receipts',
        value: '',
        note: 'Your latest money moves',
        rows: recentTransactions(p, null, 4).map((x) => [x.counterparty, cash(x.amount, true)]),
      });
      break;
  }
  return model;
}
export function aiMessage(p, tab, month = 0) {
  const last = [...p.ui.receipts].reverse().find((x) => !x.undone);
  if (last && tab === 'now')
    return {
      title: last.reversal ? 'Change undone' : 'All taken care of',
      message: last.title,
      action: 'receipts',
      cta: 'See activity',
    };
  if (tab === 'future' && month > 0) {
    const pp = previewPerson(p),
      finished = pp.l1.pots.filter(
        (x) =>
          (x.isDebt || x.stopsAtTarget) && milestone(pp, x) !== null && milestone(pp, x) <= month,
      ),
      future = totals(pp, month);
    if (finished.length)
      return {
        title: 'A milestone ahead',
        message:
          finished[0].name +
          (finished[0].isDebt ? ' is paid off' : ' reaches its target') +
          ' by ' +
          dateAt(pp, milestone(pp, finished[0])) +
          '. That monthly rule stops; you choose the next step.',
        action: p.ui.preview.length ? 'preview-summary' : 'redirect:' + finished[0].id,
        cta: p.ui.preview.length ? 'Review possibilities' : 'Choose what comes next',
      };
    return {
      title: 'Looking ahead to ' + dateAt(pp, month),
      message:
        cash(future.saved + future.invested) +
        ' in savings and investments is illustrated here, using your current rules' +
        (p.ui.preview.length ? ' and selected What Ifs.' : '.'),
      action: 'rules',
      cta: 'See the rules behind it',
    };
  }
  if (tab === 'future' && p.ui.preview.length)
    return {
      title: 'A possibility, taking shape',
      message:
        'You’re trying ' +
        p.ui.preview.length +
        ' idea' +
        (p.ui.preview.length === 1 ? '' : 's') +
        '. The picture changes; your accounts do not.',
      action: 'preview-summary',
      cta: 'Review possibilities',
    };
  if (tab === 'future') {
    return {
      title: p.l1.pots.length ? 'Your plans, together' : 'Your next chapter',
      message: p.l1.pots.length
        ? cash(totals(p).speed) +
          ' a month is moving your plans forward. Explore a change before you commit.'
        : 'Start with something that matters to you. Try an idea and see how it could grow.',
      action: 'newplan',
      cta: 'Make a plan',
    };
  }
  if (tab === 'you')
    return {
      title: 'Your word comes first',
      message: p.l2.personality.name
        ? 'Everything we believe is yours to confirm or correct.'
        : 'Three short questions are a useful place to start.',
      action: p.l2.personality.name ? 'chat' : 'quiz',
      cta: p.l2.personality.name ? 'Talk to AI' : 'Get to know me',
    };
  const lines = {
    alex: {
      title: p.l1.behaviour.app.quizDone ? 'A good start, Alex' : 'Make money feel more manageable',
      message: p.l1.behaviour.app.quizDone
        ? 'Your answers are in You. Choose the numbers you want to see here.'
        : 'In two minutes, see how you plan, spend and save—with a money personality profile and 25 HSBC Points.',
      action: p.l1.behaviour.app.quizDone ? 'gallery' : 'quiz',
      cta: p.l1.behaviour.app.quizDone ? 'Choose your numbers' : 'Discover my money style',
    },
    jordan: {
      title: 'A little more breathing room',
      message:
        'Your emergency fund is growing. A small change to eating out could help it get there sooner.',
      action: 'story:j1',
      cta: 'Explore the idea',
    },
    sam: {
      title: 'Your plans are taking shape',
      message:
        'Your house deposit has ' +
        cash(p.l1.pots.find((x) => x.id === 'house')?.balance || 0) +
        '. Explore your next step, with your safety net kept separate.',
      action: 'idea:winvest',
      cta: 'Explore investing',
    },
    elena: {
      title: 'A note from Priya',
      message: 'Your quarterly review is ready. Let’s talk about your plans for Leo’s future.',
      action: 'appointment',
      cta: p.ui.appointment ? 'View your appointment' : 'Review with Priya',
    },
  };
  return lines[p.l1.customer.id];
}
