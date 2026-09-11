import { clone, cash, moveMoney } from '../../domain/money.mjs';
import { button, rows } from '../../design-system/templates.mjs';
import { transferDialog } from '../../features/dialogs.mjs';
export function handle(ctx, type, id, p, action) {
  if (type === 'transfer-from') {
    ctx.openJourney('Move money', transferDialog(p, null, 'transfer'));
    document.querySelector('[name=from]').value = id;
    return;
  }
  if (type === 'transfer-review') {
    const f = document.querySelector('#transfer-form');
    if (!f.reportValidity()) return;
    const vals = new FormData(f),
      payment = f.dataset.mode === 'pay';
    ctx.transferDraft = {
      from: vals.get('from'),
      to: vals.get('to'),
      amount: Number(vals.get('amount')),
    };
    const test = clone(p);
    moveMoney(test, ctx.transferDraft.from, ctx.transferDraft.to, ctx.transferDraft.amount);
    const all = [...p.l1.accounts, ...p.l1.pots];
    return ctx.openJourney(
      payment ? 'Review payment' : 'Review transfer',
      `${rows([
        ['From', all.find((x) => x.id === ctx.transferDraft.from).name],
        ['To', all.find((x) => x.id === ctx.transferDraft.to).name],
        ['Amount', cash(ctx.transferDraft.amount, true)],
      ])}<p class="support">This updates the demonstration only. A matching entry appears on both sides.</p>${button(payment ? 'Confirm payment' : 'Confirm transfer', 'transfer-confirm', 'primary wide')}`,
    );
  }
  if (type === 'transfer-confirm') {
    const origin = ctx.conditionTransferOrigin;
    ctx.conditionTransferOrigin = null;
    const d = ctx.transferDraft;
    if (!d) throw new Error('Review a transfer first.');
    ctx.change('Transferred ' + cash(d.amount, true), () => moveMoney(p, d.from, d.to, d.amount));
    ctx.transferDraft = null;
    if (origin)
      return ctx.act((p.l1.accounts.some((x) => x.id === origin) ? 'account:' : 'pot:') + origin);
    return;
  }
}
