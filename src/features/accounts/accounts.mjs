import { moneyVisualRole } from '../../domain/visual-semantics.mjs';
import { containerModel, memberDetails } from '../../domain/containers.mjs';
import {
  esc,
  icon,
  button,
  progress,
  rows,
  bankAvatar,
  moneyHTML,
  householdStack,
} from '../../design-system/templates.mjs';
import { totals, cash, sum, potRate } from '../../domain/money.mjs';
import { potIcons } from '../../domain/numbers.mjs';
// External balances are read-only sample data. They never become transfer sources or alter HSBC projections.
export const connectionBanks = [
  {
    id: 'monzo',
    name: 'Monzo',
    initial: 'M',
    accounts: [
      { id: 'current', name: 'Current account', masked: '4821', balance: 845.6 },
      { id: 'savings', name: 'Easy-access savings', masked: '0916', balance: 2100 },
    ],
  },
  {
    id: 'starling',
    name: 'Starling',
    initial: 'S',
    accounts: [
      { id: 'current', name: 'Personal account', masked: '7362', balance: 620.25 },
      { id: 'savings', name: 'Savings account', masked: '5508', balance: 1500 },
    ],
  },
  {
    id: 'natwest',
    name: 'NatWest',
    initial: 'N',
    accounts: [
      { id: 'current', name: 'Current account', masked: '3140', balance: 1240.8 },
      { id: 'savings', name: 'Savings account', masked: '8062', balance: 3200 },
    ],
  },
];
export function connectionBanksFor(p) {
  return connectionBanks.map(
    (bank) => p.ui.connectionExamples?.find((b) => b.id === bank.id) || bank,
  );
}
export function connectedAccounts(p) {
  return (p.ui.connectedBanks || []).flatMap((b) =>
    b.accounts.map((a) => ({ ...a, bankId: b.id, bankName: b.name })),
  );
}
export function collectionCount(p) {
  return p.l1.accounts.length + p.l1.pots.length + connectedAccounts(p).length;
}
export function collectionFigures(p) {
  const t = totals(p),
    outside = sum(connectedAccounts(p).map((a) => a.balance));
  return {
    ...t,
    outside,
    combinedHeld: sum([t.held, outside]),
    combinedNet: sum([t.net, outside]),
  };
}
export function accountsCollection(p) {
  const t = collectionFigures(p),
    external = connectedAccounts(p),
    pots = p.l1.pots;
  const accountRow = (a) =>
    `<button class="holding-row" data-action="account:${a.id}">${bankAvatar('hsbc')}<span class="holding-copy"><b>${esc(a.name)}</b><small>${a.owed != null ? 'Credit card' : 'Current account'} · •• ${esc(a.masked)}</small></span><span class="holding-value"><b>${cash(a.owed ?? a.balance, true)}</b>${a.owed != null ? '<small>to repay</small>' : ''}</span>${icon('chev')}</button>`;
  const potTile = (x) =>
    `<button class="holding-row pot-holding" data-action="pot:${x.id}">${x.members?.length ? `<span class="holding-shared">${householdStack(memberDetails(p, x))}</span>` : `<span class="holding-icon">${icon(potIcons[x.id] || 'wallet')}</span>`}<span class="holding-copy"><b>${esc(x.name)}</b><small>${esc(containerModel(p, x).label)}${potRate(p, x) ? ' · ' + cash(Math.abs(potRate(p, x))) + '/mo' : ''}</small>${x.target && !x.isDebt ? progress(Math.min(1, x.balance / x.target), x.name, moneyVisualRole(containerModel(p, x).type)) : ''}</span><span class="holding-value"><b>${cash(x.balance, true)}</b><small>${x.isDebt ? 'to repay' : x.kind === 'budget' ? 'spending wallet' : x.target ? 'of ' + cash(x.target) : 'Open-ended'}</small></span>${icon('chev')}</button>`;
  return `<div class="accounts-collection"><section class="holdings-overview"><div class="overview-kicker"><span>${collectionCount(p)} accounts & pots</span></div><span class="overview-label">Total held${external.length ? ' · all connected banks' : ''}</span><div class="overview-value">${cash(t.combinedHeld, true)}</div><div class="holdings-split"><div><small>To repay</small><b>${cash(t.owed, true)}</b></div><div><small>Net worth</small><b>${cash(t.combinedNet, true)}</b></div></div><p class="overview-footnote">${external.length ? 'Includes ' + cash(t.outside, true) + ' in connected sample accounts.' : 'Your HSBC accounts, savings and investments.'}</p></section><section class="holdings-group"><div class="holdings-heading"><h3>HSBC accounts <span>${p.l1.accounts.length}</span></h3></div><div class="holdings-list">${p.l1.accounts.map(accountRow).join('')}</div></section><section class="holdings-group"><div class="holdings-heading"><h3>Your pots <span>${pots.length}</span></h3>${button('New pot', 'newplan', 'text')}</div>${pots.length ? `<div class="holdings-list">${pots.map(potTile).join('')}</div>` : `<div class="pots-empty">${icon('wallet')}<b>Create a pot</b><p>Set aside money for a goal or a monthly budget.</p>${button('Create your first pot', 'newplan', 'secondary')}</div>`}</section><section class="holdings-group other-banks"><div class="holdings-heading"><h3>Other banks <span>${external.length}</span></h3></div>${external.length ? `<div class="holdings-list">${external.map((a) => `<button class="holding-row" data-action="connected-account:${a.bankId}/${a.id}">${bankAvatar(a.bankId)}<span class="holding-copy"><b>${esc(a.bankName)}</b><small>${esc(a.nickname || a.name)} · •• ${a.masked}</small></span><span class="holding-value"><b>${cash(a.balance, true)}</b><small>Connected · sample</small></span>${icon('chev')}</button>`).join('')}</div>` : ''}<div class="connect-entry"><span class="connect-mark">${icon('globe')}</span><h3>${external.length ? 'Bring another bank into view.' : 'A fuller picture of your money.'}</h3><p>See accounts from other banks here too. Give HSBC AI more context for useful insights and support.</p>${button('Connect another bank', 'connect-bank', 'secondary wide')}<small>You choose what to share.</small></div></section></div>`;
}
export function bankPicker(p) {
  return `<span class="eyebrow">OPEN BANKING</span><h3 class="idea-title">Bring your money into view.</h3><p>Choose a bank to connect. You’ll review the accounts and information you share next.</p><div class="connection-sample">${icon('info')}<span>This demo uses sample accounts. No bank sign-in or real data is needed.</span></div><div class="holdings-list">${connectionBanksFor(
    p,
  )
    .map((b) => {
      const linked = p.ui.connectedBanks?.some((x) => x.id === b.id);
      return `<button class="holding-row" data-action="connect-review:${b.id}" ${linked ? 'disabled' : ''}>${bankAvatar(b.id)}<span class="holding-copy"><b>${b.name}</b><small>${linked ? 'Connected' : 'Explore with sample accounts'}</small></span>${icon(linked ? 'check' : 'chev')}</button>`;
    })
    .join('')}</div>`;
}
export function bankConsent(bank) {
  return `<div class="connection-bank">${bankAvatar(bank.id)}<span><b>${bank.name}</b><small>Sample connection</small></span></div><h3 class="idea-title">You decide what to share.</h3><p>Choose the accounts HSBC AI can include in your financial picture.</p><form id="connection-form"><div class="consent-accounts">${bank.accounts.map((a) => `<label><input type="checkbox" name="account" value="${a.id}"><span><b>${esc(a.nickname || a.name)} · •• ${a.masked}</b><small>${cash(a.balance, true)} · sample balance</small></span></label>`).join('')}</div><div class="connection-permissions"><h4>What this gives you</h4><p>Balances and account details together, so AI can help explain your overall position and spot useful next steps.</p><h4>Access and permissions</h4><p>Read-only access. Connecting doesn’t move money. Remove the connection from its account screen whenever you choose.</p></div><p id="connection-error" role="alert" class="connection-error" hidden>Choose at least one account to connect.</p>${button('Connect selected accounts', 'connect-confirm:' + bank.id, 'primary wide', 'type="button"')}</form>`;
}
export function connectedAccountDialog(p, key) {
  const [bankId, id] = key.split('/'),
    a = connectedAccounts(p).find((x) => x.bankId === bankId && x.id === id);
  if (!a) return '<p>This connection is no longer available.</p>';
  return `<div class="container-detail container-system" data-container="external-${esc(key)}" data-container-type="connected"><section class="container-hero" data-container-section="balance"><div class="container-amount"><div><span class="container-value-label">Connected balance</span><div class="detail-number">${moneyHTML(a.balance)}</div></div><div class="container-facts"><div class="container-meta">${bankAvatar(a.bankId)}<span><b>${esc(a.bankName)}</b><small>•• ${a.masked}</small></span></div></div></div><p class="support">${esc(a.nickname && a.nickname !== a.name ? a.name : 'Read-only connection')}</p></section><section class="container-section" data-container-section="actions"><div class="button-stack">${button('Add to My numbers', 'preview-module:external-' + key, 'secondary wide')}${button('Manage connection', 'disconnect-review:' + bankId, 'text')}</div><details class="terms"><summary>Account information</summary>${rows(
    [
      ['Bank', a.bankName],
      ['Account ending', '•• ' + a.masked],
      ['Shared information', 'Account details and balance'],
      ['Connection', 'Simulated · read-only'],
    ],
  )}</details></section><section class="container-section" data-container-section="rules"><p class="support">Balance shared with HSBC. Payments and rules stay with ${esc(a.bankName)}.</p></section><section class="container-section" data-container-section="activity"><header><h3>Recent activity</h3></header><p class="activity-empty">Transactions aren’t shared by this connection.</p></section></div>`;
}
