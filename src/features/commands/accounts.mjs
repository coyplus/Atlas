import { containerDetailView } from '../../features/pots/views.mjs';
import {
  accountsCollection,
  collectionFigures,
  connectionBanksFor,
  bankPicker,
  bankConsent,
  connectedAccountDialog,
} from '../../features/accounts/accounts.mjs';
import { current, clone, transaction, cash } from '../../domain/money.mjs';
import { esc, button } from '../../design-system/templates.mjs';
import { collectionDialog, accountDialog } from '../../features/dialogs.mjs';
export function handle(ctx, type, id, p, action) {
  if (type === 'collection') {
    if (ctx.modalStack.at(-1)?.title === 'Accounts & pots') return ctx.closeModal();
    return ctx.openModal(
      ctx.S.direction === 'vanilla' ? 'Accounts & pots' : 'Pots & accounts',
      ctx.S.direction === 'vanilla' ? accountsCollection(p) : collectionDialog(p),
    );
  }
  if (type === 'connect-bank') return ctx.openJourney('Connect another bank', bankPicker(p));
  if (type === 'connect-review') {
    const bank = connectionBanksFor(p).find((b) => b.id === id);
    if (bank && !p.ui.connectedBanks.some((b) => b.id === id))
      return ctx.openJourney('Choose what to share', bankConsent(bank));
    return;
  }
  if (type === 'connect-confirm') {
    const bank = connectionBanksFor(p).find((b) => b.id === id),
      chosen = [...document.querySelectorAll('#connection-form input:checked')].map((x) => x.value);
    if (!chosen.length) {
      document.querySelector('#connection-error').hidden = false;
      return;
    }
    if (p.ui.connectedBanks.some((b) => b.id === id)) return;
    transaction(p, 'Connected ' + bank.name + ' sample accounts', () =>
      p.ui.connectedBanks.push({
        id: bank.id,
        name: bank.name,
        accounts: clone(bank.accounts.filter((a) => chosen.includes(a.id))),
      }),
    );
    ctx.modalStack = [];
    ctx.render();
    ctx.openModal('Accounts & pots', accountsCollection(current(ctx.S)));
    ctx.toast(bank.name + ' connected · sample accounts');
    return;
  }
  if (type === 'connected-account')
    return ctx.openModal('Connected account', connectedAccountDialog(p, id));
  if (type === 'connected-insight') {
    const t = collectionFigures(p);
    p.ui.chat.push({
      role: 'ai',
      text:
        'With your connected sample accounts, I can see ' +
        cash(t.combinedHeld, true) +
        ' held across your financial picture, including ' +
        cash(t.outside, true) +
        ' at other banks. After ' +
        cash(t.owed, true) +
        ' to repay, that is ' +
        cash(t.combinedNet, true) +
        ' in net worth. Your HSBC plans and spending calculations are unchanged. What would you like to explore?',
    });
    return ctx.openChat();
  }
  if (type === 'disconnect-review') {
    const bank = p.ui.connectedBanks.find((b) => b.id === id);
    return ctx.openJourney(
      'Disconnect ' + bank.name,
      `<p>Remove the ${bank.accounts.length} connected sample account${bank.accounts.length === 1 ? '' : 's'} from ${esc(bank.name)}. HSBC AI will no longer include them in this overview. Your money stays where it is.</p>${button('Disconnect bank', 'disconnect-confirm:' + id, 'primary wide')}${button('Keep connection', 'disconnect-cancel:' + id, 'text')}`,
    );
  }
  if (type === 'disconnect-cancel') {
    const bank = p.ui.connectedBanks.find((b) => b.id === id);
    return ctx.openModal(
      'Connected account',
      connectedAccountDialog(p, id + '/' + bank.accounts[0].id),
    );
  }
  if (type === 'disconnect-confirm') {
    const bank = p.ui.connectedBanks.find((b) => b.id === id);
    transaction(
      p,
      'Disconnected ' + bank.name + ' sample accounts',
      () => (p.ui.connectedBanks = p.ui.connectedBanks.filter((b) => b.id !== id)),
    );
    ctx.modalStack = [];
    ctx.render();
    ctx.openModal('Accounts & pots', accountsCollection(current(ctx.S)));
    ctx.toast('Bank disconnected');
    return;
  }
  if (type === 'account') ctx.containerRuleOrigin = id;
  if (type === 'account')
    return ctx.openModal(
      p.l1.accounts.find((x) => x.id === id).name,
      ctx.S.direction === 'vanilla'
        ? containerDetailView(
            p,
            p.l1.accounts.find((x) => x.id === id),
            { now: ctx.S.tab === 'now' },
          )
        : accountDialog(
            p,
            p.l1.accounts.find((x) => x.id === id),
          ),
    );
  if (type === 'account-chat') {
    const account = p.l1.accounts.find((x) => x.id === id);
    p.ui.chat.push({
      role: 'ai',
      text:
        account.name +
        ' ' +
        (account.owed != null
          ? 'has ' +
            cash(account.owed, true) +
            ' to repay. Its recorded monthly interest is ' +
            cash(account.interestMonthly || 0, true) +
            '.'
          : 'holds ' +
            cash(account.balance, true) +
            '. ' +
            p.l1.transactions.filter((x) => x.ledger === id).length +
            ' transactions are recorded in this snapshot.') +
        ' We can explain the activity, move money or bring in a person to talk through the next step.',
    });
    return ctx.openChat();
  }
}
