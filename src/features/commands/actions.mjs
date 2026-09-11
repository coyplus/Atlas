import {
  productsDialog,
  productCategories,
  productDialog,
  statementsDialog,
  statementDialog,
  cardsDialog,
  convertDialog,
} from '../../features/now/actions.mjs';
import { transaction } from '../../domain/money.mjs';
export function handle(ctx, type, id, p, action) {
  if (type === 'quick-more') {
    ctx.quickContainer = null;
    ctx.quickDraft = [...p.ui.quickActions];
    ctx.quickEditing = false;
    ctx.quickSelected = null;
    return ctx.showQuickActions();
  }
  if (type === 'quick-edit') {
    ctx.quickEditing = true;
    return ctx.showQuickActions();
  }
  if (type === 'quick-done') {
    if (ctx.quickContainer) {
      const containerId = ctx.quickContainer;
      transaction(p, 'Updated this pot’s quick actions', () => {
        p.ui.containerQuickActions ||= {};
        p.ui.containerQuickActions[containerId] = [...ctx.quickDraft];
      });
      ctx.quickContainer = null;
      ctx.refreshContainer(containerId, 'Quick actions saved');
      document.querySelector('[data-action="container-more:' + containerId + '"]')?.focus({
        preventScroll: true,
      });
      return;
    }
    if (JSON.stringify(ctx.quickDraft) !== JSON.stringify(p.ui.quickActions))
      transaction(p, 'Updated your quick actions', () => (p.ui.quickActions = [...ctx.quickDraft]));
    ctx.closeModal();
    ctx.render();
    ctx.toast('Quick actions saved');
    document.querySelector('[data-action=quick-more]')?.focus({
      preventScroll: true,
    });
    return;
  }
  if (type === 'quick-select') {
    if (!ctx.quickEditing) return;
    const index = ctx.quickDraft.indexOf(id);
    if (ctx.quickSelected && ctx.quickSelected !== id && index >= 0)
      return ctx.placeQuickAction(ctx.quickSelected, String(index));
    ctx.quickSelected = ctx.quickSelected === id ? null : id;
    return ctx.showQuickActions();
  }
  if (type === 'quick-place') {
    if (ctx.quickSelected) return ctx.placeQuickAction(ctx.quickSelected, id);
    return;
  }
  const browse = ctx.S.tab === 'now' ? ctx.openJourney : ctx.openModal;
  if (type === 'products') {
    if (ctx.modalStack.at(-1)?.title === 'Products and services') return ctx.closeModal();
    return browse('Products and services', productsDialog());
  }
  if (type === 'product') {
    const product = productCategories.find((x) => x[0] === id);
    if (product) return browse(product[1], productDialog(id));
    return;
  }
  if (type === 'product-help') {
    const product = productCategories.find((x) => x[0] === id);
    p.ui.chat.push({
      role: 'ai',
      text:
        'Let’s talk about ' +
        product[1].toLowerCase() +
        '. What would you like to achieve, and when? I can help you prepare your questions for the right person.',
    });
    return ctx.openChat();
  }
  if (type === 'statements') {
    if (ctx.modalStack.at(-1)?.title === 'Statements') return ctx.closeModal();
    return browse('Statements', statementsDialog(p));
  }
  if (type === 'statement') return browse('Account activity', statementDialog(p, id));
  if (type === 'cards') return browse('Manage cards', cardsDialog(p));
  if (type === 'card-freeze') {
    transaction(p, 'Updated demo card status', () => {
      p.ui.frozenCards = p.ui.frozenCards.includes(id)
        ? p.ui.frozenCards.filter((x) => x !== id)
        : [...p.ui.frozenCards, id];
    });
    return browse('Manage cards', cardsDialog(p));
  }
  if (type === 'convert') return ctx.openJourney('Convert currency', convertDialog());
}
