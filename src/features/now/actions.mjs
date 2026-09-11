import { esc, icon, button, rows, quickActionButton } from '../../design-system/templates.mjs';
import { cash, recentTransactions } from '../../domain/money.mjs';
export const everydayActions = [
  ['pay', 'Pay', 'up', 'pay'],
  ['transfer', 'Transfer', 'swap', 'transfer'],
  ['addmoney', 'Add money', 'plus', 'addmoney'],
  ['statements', 'Statements', 'transcript', 'statements'],
  ['invest', 'Invest', 'trend', 'plan-intent:grow'],
  ['cards', 'Manage cards', 'card', 'cards'],
  ['convert', 'Convert', 'globe', 'convert'],
  ['rules', 'Standing orders', 'repeat', 'rules'],
  ['debits', 'Direct Debits', 'repeat', 'module:dd'],
  ['help', 'Help', 'assistant', 'support:discuss'],
];
export function shortcutBar(p) {
  return `<nav class="quick-actions" aria-label="Quick actions">${p.ui.quickActions
    .map((id) => {
      const a = everydayActions.find((x) => x[0] === id);
      return quickActionButton(a[1], a[2], a[3]);
    })
    .join('')}${quickActionButton('More', 'grid', 'quick-more')}</nav>`;
}
// Three fixed positions; swapping never duplicates or silently drops a shortcut.
export function moveShortcut(slots, id, target, catalogue = everydayActions) {
  const next = [...slots],
    from = next.indexOf(id);
  if (!catalogue.some((x) => x[0] === id)) return next;
  if (target === 'available') {
    if (from >= 0) next.splice(from, 1);
    return next;
  }
  const to = Number(target);
  if (!Number.isInteger(to) || to < 0 || to > 2) return next;
  if (from >= 0) {
    if (to >= next.length) {
      next.splice(from, 1);
      next.push(id);
    } else [next[from], next[to]] = [next[to], next[from]];
  } else if (to < next.length) next[to] = id;
  else next.push(id);
  return next;
}
export function quickActionsDialog(p, editing = false, selected = null, options = {}) {
  const catalogue = options.catalogue || everydayActions,
    heading = options.heading || 'On your Now tab';
  const tile = (id, index, primary) => {
    const a = catalogue.find((x) => x[0] === id);
    return `<button class="action-tile ${selected === id ? 'is-selected' : ''}" ${editing ? `data-shortcut="${id}" data-drop="${primary ? index : 'available'}" data-action="quick-select:${id}" aria-pressed="${selected === id}"` : `data-action="${a[3]}"`}><span>${icon(a[2])}${editing ? `<i>${icon(primary ? 'close' : 'plus')}</i>` : ''}</span><b>${a[1]}</b></button>`;
  };
  return `<div class="shortcut-editor ${editing ? 'is-editing' : ''}"><div class="action-section-title"><h3>${esc(heading)}</h3>${button(editing ? 'Done' : 'Customise', editing ? 'quick-done' : 'quick-edit', 'text')}</div><p class="support shortcut-instruction" aria-live="polite">${editing ? (selected ? 'Choose a position above, or move it to More below.' : 'Drag to replace, or tap an action then its destination.') : ''}</p><div class="actions-grid primary-actions">${p.ui.quickActions.map((id, i) => tile(id, i, true)).join('')}${editing ? Array.from({ length: 3 - p.ui.quickActions.length }, (_, i) => `<button class="action-tile empty-slot" data-drop="${p.ui.quickActions.length + i}" data-action="quick-place:${p.ui.quickActions.length + i}"><span>${icon('plus')}</span><b>Add action</b></button>`).join('') : ''}<div class="action-tile fixed-more"><span>${icon('grid')}</span><b>More</b></div></div><div class="available-actions" ${editing ? 'data-drop="available"' : ''}><div class="action-section-title"><h3>More actions</h3>${editing && selected && p.ui.quickActions.includes(selected) ? button('Move here', 'quick-place:available', 'text') : ''}</div><div class="actions-grid">${catalogue
    .filter((a) => !p.ui.quickActions.includes(a[0]))
    .map((a) => tile(a[0], 0, false))
    .join('')}</div></div></div>`;
}
export const productCategories = [
  [
    'credit',
    'Credit cards',
    'card',
    'Explore borrowing for everyday purchases and larger plans.',
    'Talk through credit options',
  ],
  [
    'savings',
    'Savings',
    'wallet',
    'Make space for a safety fund, a goal or something further ahead.',
    'Start a savings plan',
  ],
  [
    'invest',
    'Invest',
    'trend',
    'Explore how investing could fit your longer-term plans.',
    'Explore an investment plan',
  ],
  [
    'mortgages',
    'Mortgages',
    'home',
    'Talk through your plans for a first home, a move or your next mortgage.',
    'Talk about my home',
  ],
  [
    'loans',
    'Loans',
    'plus',
    'Work through a larger purchase and what repayment could mean for your budget.',
    'Explore borrowing',
  ],
  [
    'international',
    'International services',
    'globe',
    'Plan for life, work and money across borders.',
    'Explore international banking',
  ],
  [
    'overdrafts',
    'Overdrafts',
    'percent',
    'Understand your short-term borrowing needs and the options to discuss.',
    'Talk about overdrafts',
  ],
  [
    'insurance',
    'Insurance',
    'shield',
    'Explore protection for the people and things that matter to you.',
    'Talk about protection',
  ],
  [
    'current',
    'Current accounts',
    'wallet',
    'Bring your everyday banking together around the way you live.',
    'View my accounts',
  ],
  [
    'business',
    'Business banking',
    'users',
    'Explore banking for a business you are starting or growing.',
    'Talk about my business',
  ],
];
export function productsDialog() {
  return `<h3 class="catalogue-heading">Our products</h3><div class="products-grid">${productCategories.map(([id, title, i]) => `<button class="action-tile" data-action="product:${id}"><span>${icon(i)}</span><b>${title}</b></button>`).join('')}</div><h3 class="catalogue-heading">Useful resources</h3><button class="resource-card" data-action="sustainability"><span class="resource-photo"></span><span><b>Sustainability</b><small>Ideas for a more sustainable everyday life.</small></span>${icon('arrow')}</button>`;
}
export function productDialog(id) {
  const a = productCategories.find((x) => x[0] === id);
  if (!a) return '';
  return `<div class="product-mark">${icon(a[2])}</div><h3 class="idea-title">${a[1]}</h3><p>${a[3]}</p>${button(a[4], id === 'savings' ? 'plan-intent:goal' : id === 'invest' ? 'plan-intent:grow' : id === 'current' ? 'collection' : 'product-help:' + id, 'primary wide')}<p class="support">Explore the experience with illustrative information. Product applications are not part of this prototype.</p>${button('All products and services', 'products', 'text')}`;
}
export function statementsDialog(p) {
  return `<p>Choose an account to view the activity recorded in your money snapshot.</p>${p.l1.accounts.map((a) => `<button class="gallery-row" data-action="statement:${a.id}"><span><b>${esc(a.name)}</b><small>•• ${esc(a.masked)} · ${esc(p.l1.asOf)}</small></span>${icon('transcript')}</button>`).join('')}`;
}
export function statementDialog(p, id) {
  const a = p.l1.accounts.find((x) => x.id === id),
    tx = recentTransactions(p, id);
  return `<span class="eyebrow">ACCOUNT SNAPSHOT · ${esc(p.l1.asOf)}</span><h3 class="idea-title">${esc(a.name)}</h3>${rows(
    [
      ['Account', '•• ' + a.masked],
      [a.owed != null ? 'To repay' : 'Available', cash(a.owed ?? a.balance, true)],
    ],
  )}${tx.length ? rows(tx.map((x) => [x.date + ' · ' + (x.counterparty || x.merchant || x.description || x.label || x.category || 'Transaction'), cash(x.direction === 'out' ? -Math.abs(x.amount) : x.amount, true)])) : '<p>No transactions recorded in this snapshot.</p>'}<p class="support">Illustrative account activity, not an official bank statement.</p>${button('All statements', 'statements', 'text')}`;
}
export function cardsDialog(p) {
  return `<p>Cards connected to your everyday accounts.</p>${p.l1.accounts
    .filter((a) => a.kind === 'current' || a.owed != null)
    .map(
      (a) =>
        `<article class="bank-card"><div>${icon('card')}<b>${a.owed != null ? esc(a.name) : 'HSBC debit card'}</b></div><p>${esc(p.l1.customer.firstName)} · ${a.owed != null ? 'Credit' : 'Debit'}</p><small>Linked account •• ${esc(a.masked)}</small><div class="card-state">${p.ui.frozenCards?.includes(a.id) ? 'Frozen in this demo' : 'Ready to use'}</div>${button(p.ui.frozenCards?.includes(a.id) ? 'Unfreeze card' : 'Freeze card', 'card-freeze:' + a.id, 'secondary')}</article>`,
    )
    .join('')}`;
}
export function convertDialog() {
  return `<span class="eyebrow">CURRENCY CALCULATOR</span><h3 class="idea-title">See it in another currency.</h3><label class="field">You have · GBP<input id="convert-amount" type="number" min="0" max="1000000000" value="100" inputmode="decimal"></label><label class="field">Convert to<select id="convert-currency"><option value="EUR">EUR · Euro</option><option value="USD">USD · US dollar</option><option value="HKD">HKD · Hong Kong dollar</option></select></label><output id="convert-result" class="conversion-result">€117.00</output><p class="support" id="convert-rate">Example rate: £1 = €1.17</p><p class="support">Illustrative rates for this demo. No money is exchanged.</p>`;
}
