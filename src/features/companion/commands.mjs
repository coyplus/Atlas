import { companionPreferences, styles, initiatives } from './model.mjs';
import { companionSettings } from './view.mjs';
let draft = null;
export function handle(ctx, type, id, p) {
  if (type === 'companion-settings')
    draft = { ...companionPreferences(p), person: p.l1.customer.id, preview: 'now' };
  if (!draft || draft.person !== p.l1.customer.id) return;
  const focusAction = document.activeElement?.dataset.action;
  const scroll = document.querySelector('.sheet-body')?.scrollTop || 0;
  if (type === 'companion-style' && styles[id]) draft.style = id;
  if (type === 'companion-initiative' && initiatives[id]) draft.initiative = id;
  if (type === 'companion-preview' && ['now', 'you', 'future'].includes(id)) draft.preview = id;
  if (type === 'companion-defaults') draft = { ...draft, style: 'guide', initiative: 'context' };
  if (type === 'companion-save') {
    const prefs = { style: draft.style, initiative: draft.initiative };
    draft = null;
    p.ui.companion = prefs;
    ctx.closeModal();
    ctx.render();
    ctx.toast('Your Companion is now ' + styles[prefs.style].name);
    return;
  }
  ctx.openJourney('Your AI Companion', companionSettings(p, ctx.S, draft, ctx.DATA.shared.modules));
  if (type !== 'companion-settings') {
    document.querySelector('.sheet-body').scrollTop = scroll;
    if (focusAction)
      [...document.querySelectorAll('.companion-settings button')]
        .find((b) => b.dataset.action === focusAction)
        ?.focus({ preventScroll: true });
  }
}
