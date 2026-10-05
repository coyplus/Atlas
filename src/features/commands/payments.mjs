import { reportValidity, fieldError } from '../../design-system/forms.mjs';
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
    if (!reportValidity(f)) return;
    const vals = new FormData(f),
      payment = f.dataset.mode === 'pay';
    const draft = {
      from: vals.get('from'),
      to: vals.get('to'),
      amount: Number(vals.get('amount')),
    };
    // Domain checks explain themselves beside the field they concern.
    try {
      moveMoney(clone(p), draft.from, draft.to, draft.amount);
    } catch (error) {
      const field = /different/.test(error.message)
        ? 'to'
        : /locked/.test(error.message)
          ? 'from'
          : 'amount';
      const el = f.querySelector(`[name=${field}]`);
      fieldError(el, error.message);
      el.focus();
      return;
    }
    ctx.transferDraft = draft;
    const all = [...p.l1.accounts, ...p.l1.pots];
    return ctx.openJourney(
      payment ? 'Review payment' : 'Review transfer',
      `${rows([
        ['From', all.find((x) => x.id === ctx.transferDraft.from).name],
        ['To', all.find((x) => x.id === ctx.transferDraft.to).name],
        ['Amount', cash(ctx.transferDraft.amount, true)],
      ])}<p class="support">A matching entry appears in both places, with a receipt you can undo.</p>${button(payment ? 'Confirm payment' : 'Confirm transfer', 'transfer-confirm', 'primary wide')}`,
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
