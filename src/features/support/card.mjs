import { esc, agentAvatar } from '../../design-system/templates.mjs';

/** The contextual Companion card, shared by the product and its presentation. */
export function companionCard({ title = '', subtitle = '', interactive = true } = {}) {
  const tag = interactive ? 'button' : 'div';
  const action = interactive ? ' data-action="support:discuss"' : '';
  return `<aside class="atlas-companion ai-card support-bar" aria-label="Contextual support"><div class="support-top"><${tag} class="support-summary"${action}${interactive ? ' aria-haspopup="dialog"' : ''}><span class="support-copy"${interactive ? ' aria-live="polite" aria-atomic="true"' : ''}><strong>${esc(title)}</strong><span class="support-subtitle">${esc(subtitle)}</span></span></${tag}><${tag} class="support-avatar icon-btn"${action}${interactive ? ' aria-label="Open conversation"' : ' aria-hidden="true"'}>${agentAvatar('ai')}</${tag}></div><div${interactive ? ' id="support-details"' : ''} class="support-reveal"><div class="support-inner"><p class="support-message"></p><div class="support-actions"></div></div></div></aside>`;
}
