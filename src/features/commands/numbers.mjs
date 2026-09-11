import { numberIdeas } from '../../domain/number-visuals.mjs';
import { renderRegion } from '../../design-system/Markup.tsx';
import { transaction } from '../../domain/money.mjs';
import { moduleModel } from '../../domain/numbers.mjs';
import { galleryDialog, modulePreviewDialog, suggestedNumber } from '../../features/dialogs.mjs';
export function handle(ctx, type, id, p, action) {
  if (type === 'reorder-numbers') {
    const order = id.split(',');
    if (
      order.length !== p.ui.order.length ||
      new Set(order).size !== order.length ||
      order.some((x) => !p.ui.order.includes(x))
    )
      return;
    if (order.join(',') === p.ui.order.join(',')) return;
    transaction(p, 'Reordered your numbers', () => {
      p.ui.order = order;
    });
    ctx.render();
    return;
  }
  if (type === 'size') {
    const sizes = 'SWTF';
    transaction(
      p,
      'Resized a number on Now',
      () => (p.ui.sizes[id] = sizes[(sizes.indexOf(p.ui.sizes[id] || 'S') + 1) % 4]),
    );
    ctx.render();
    return;
  }
  if (type === 'up') {
    const i = p.ui.order.indexOf(id);
    if (i > 0)
      transaction(p, 'Reordered your numbers', () => {
        [p.ui.order[i - 1], p.ui.order[i]] = [p.ui.order[i], p.ui.order[i - 1]];
      });
    ctx.render();
    return;
  }
  if (type === 'remove') {
    transaction(p, 'Removed a number from Now', () => {
      p.ui.order = p.ui.order.filter((x) => x !== id);
    });
    ctx.render();
    ctx.toast('Number removed');
    return;
  }
  if (type === 'gallery') {
    p.ui.seenNumberIdeas = [
      ...new Set([...(p.ui.seenNumberIdeas || []), ...numberIdeas(p).map((r) => r.moduleId)]),
    ];
    ctx.S.edit = false;
    ctx.render();
    return ctx.openJourney('Choose your numbers', galleryDialog(p, ctx.DATA));
  }
  if (type === 'suggestion-size' || type === 'add-suggestion') {
    const cut = id.lastIndexOf('/'),
      key = id.slice(0, cut),
      size = id.slice(cut + 1);
    const idea = numberIdeas(p).find((r) => r.moduleId === key);
    if (!idea || !['S', 'W', 'T', 'F'].includes(size)) return;
    if (type === 'suggestion-size') {
      const section = [...document.querySelectorAll('[data-suggestion]')].find(
        (el) => el.dataset.suggestion === key,
      );
      if (section) {
        renderRegion(section, suggestedNumber(p, ctx.DATA, idea, size));
        section.querySelector('[aria-pressed="true"]')?.focus({ preventScroll: true });
      }
      return;
    }
    return ctx.change(
      'Added ' + moduleModel(p, key, ctx.DATA.shared.modules).title + ' to Now',
      () => {
        if (!p.ui.order.includes(key)) p.ui.order.push(key);
        p.ui.sizes[key] = size;
      },
    );
  }
  if (type === 'preview-module') {
    ctx.galleryId = id;
    ctx.gallerySize = p.ui.sizes[id] || 'S';
    return ctx.openJourney(
      'Preview your number',
      modulePreviewDialog(p, ctx.DATA, id, ctx.gallerySize),
    );
  }
  if (type === 'preview-size') {
    ctx.gallerySize = id;
    return ctx.openJourney(
      'Preview your number',
      modulePreviewDialog(p, ctx.DATA, ctx.galleryId, id),
    );
  }
  if (type === 'pin-preview')
    return ctx.change(
      'Added ' + moduleModel(p, id, ctx.DATA.shared.modules).title + ' to Now',
      () => {
        if (!p.ui.order.includes(id)) p.ui.order.push(id);
        p.ui.sizes[id] = ctx.gallerySize;
      },
    );
  if (type === 'pin') {
    if (!p.ui.order.includes(id))
      transaction(p, 'Added ' + id + ' to Now', () => p.ui.order.push(id));
    ctx.closeModal();
    ctx.render();
    ctx.toast('Added to your page');
    return;
  }
}
