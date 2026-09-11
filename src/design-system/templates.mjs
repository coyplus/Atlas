import { displayDate } from '../domain/dates.mjs';
import { limitState } from '../domain/visual-semantics.mjs';
import { numberVisualMarkup } from './number-visual.mjs';
import { iconNames, materialIcons, materialViewBoxes } from './icons.mjs';
import { cash } from '../domain/money.mjs';
export const esc = (s) =>
  String(s ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
export const icon = (name, cls = '') =>
  `<svg class="icon ${cls}" data-material="${iconNames[name] || 'auto_awesome'}" viewBox="${materialViewBoxes[iconNames[name] || 'auto_awesome']}" fill="currentColor" aria-hidden="true">${materialIcons[iconNames[name] || 'auto_awesome']}</svg>`;
export const agentAvatar = (name = 'ai', cls = '') =>
  `<span class="agent-avatar ${name === 'ai' ? 'agent-ai' : 'agent-human'} ${cls}" data-author="${esc(name)}" aria-hidden="true">${name === 'ai' ? icon('assistant') : `<img src="${window.ATLAS_PORTRAITS[name]}" alt="">`}</span>`;
export const statusChip = (label, tone = 'neutral', symbol = '', cls = '') =>
  `<span class="status-chip ${cls}" data-tone="${esc(tone)}">${symbol ? icon(symbol) : ''}<span>${esc(label)}</span></span>`;
export const bankAvatar = (bank) =>
  `<span class="holding-icon bank-avatar" data-bank="${esc(bank)}" aria-hidden="true"><img src="${window.ATLAS_BANK_LOGOS[bank]}" alt=""></span>`;
export const householdAvatar = (id, name) =>
  `<span class="household-avatar" data-member="${esc(id)}" aria-hidden="true">${window.ATLAS_PORTRAITS?.[id] ? `<img src="${window.ATLAS_PORTRAITS[id]}" alt="">` : esc((name || '?')[0])}</span>`;
export const householdStack = (members) =>
  `<span class="household-stack" aria-hidden="true">${members
    .slice(0, 3)
    .map((m) => householdAvatar(m.id, m.name))
    .join(
      '',
    )}${members.length > 3 ? `<span class="household-avatar">+${members.length - 3}</span>` : ''}</span>`;
export const logo = () =>
  '<svg class="brand-mark" viewBox="0 0 42 24" aria-hidden="true"><path fill="#db0011" d="M0 12 12 0v24ZM12 0h18L21 12ZM12 24h18L21 12ZM30 0l12 12-12 12Z"/></svg>';
export const button = (text, act, cls = 'primary', extra = '') =>
  `<button class="btn ${cls}" data-action="${esc(act)}" ${extra}>${esc(text)}</button>`;
// The same icon-and-label action is used on Now and money-container details.
export const quickActionButton = (label, symbol, action) =>
  `<button class="quick-action" data-action="${esc(action)}"><span>${icon(symbol)}</span>${esc(label)}</button>`;
export const section = (name, action = '', label = '') =>
  `<header class="section-head"><h2>${esc(name)}</h2>${action ? button(label, action, 'text') : ''}</header>`;
export const rows = (list, cls = '') =>
  `<dl class="rows ${cls}">${list.map((r) => `<div><dt>${esc(r[0])}${r.length > 2 ? `<small>${esc(displayDate(r[1]))}</small>` : ''}</dt><dd>${esc(displayDate(r.at(-1)))}</dd></div>`).join('')}</dl>`;
export const moneyHTML = (n) => {
  const [main, cents] = cash(n, true).split('.');
  return `${esc(main)}<small>.${cents}</small>`;
};
export const progress = (v, label = 'Progress', role = '', state = 'normal') =>
  `<div class="progress" ${role ? `data-viz-role="${esc(role)}" data-viz-state="${esc(state)}"` : ''} role="progressbar" aria-label="${esc(label)}" aria-valuenow="${Math.max(0, Math.min(100, Math.round(v * 100)))}" aria-valuemin="0" aria-valuemax="100"><i style="width:${Math.max(0, Math.min(100, v * 100))}%"></i></div>`;
// Compact Numbers are glanceable summaries; explanations belong to their detail screen.
export function moduleCard(model, size = 'S', edit = false, index = 0, interactive = true) {
  const tag = interactive ? 'button' : 'div',
    act = model.potId ? 'pot:' + model.potId : model.action || 'module:' + model.id;
  const type =
    model.containerId || model.id.startsWith('external-')
      ? 'pot'
      : ['points', 'cashback'].includes(model.id)
        ? 'reward'
        : model.id === 'activity'
          ? 'activity'
          : 'insight';
  const compact = ['S', 'W'].includes(size),
    symbol = type === 'insight' ? 'chart' : model.icon;
  const shortNotes = {
    balance: 'Available balance',
    safespend: 'After commitments',
    afterbills: 'After bills',
    grocery: 'This month',
    points: '',
    cashback: 'Earned this year',
    wealth: 'Before debt',
    goldenratio: 'After essentials',
    investments: 'Investment value',
    safetydays: 'Essential bills covered',
    creditscore: 'Soft check',
    freedom: 'Loan paid off',
    spent: 'This month',
    whereitgoes: 'This month',
    rateswatch: 'Savings & mortgage rates',
  };
  const note = model.glance ?? shortNotes[model.id] ?? model.note;
  const extraRows = model.containerId
    ? model.rows.filter((r) => !['Type', 'Balance', 'To repay', 'Your benefit'].includes(r[0]))
    : model.rows;
  const label = [
    model.title,
    type === 'pot' ? 'Money container' : type === 'insight' ? 'Insight' : null,
    model.value,
    model.valueLabel,
    model.attention,
    note,
    model.members?.length ? 'Shared with ' + model.members.map((m) => m.name).join(', ') : null,
  ]
    .filter(Boolean)
    .join(' · ');
  return `<article class="module size-${size} kind-${model.kind}" data-module="${esc(model.id)}" data-number-type="${type}" data-attention="${model.attention ? 'benefit-changed' : 'none'}" ${edit ? 'draggable="true"' : ''}>
 ${edit ? `<div class="edit-tools">${button('Resize', 'size:' + model.id, 'small number-resize', 'aria-label="Resize ' + esc(model.title) + '"')}${button('↑', 'up:' + model.id, 'small', 'aria-label="Move ' + esc(model.title) + ' earlier"')}<button class="number-remove" data-action="remove:${esc(model.id)}" aria-label="Remove ${esc(model.title)}">${icon('close')}<span class="sr-only">Remove</span></button></div>` : ''}
 <${tag} class="module-face" ${interactive ? `data-action="${esc(act)}"` : 'role="img"'} aria-label="${esc(label)}">
 <div class="module-top"><span><span class="number-symbol">${model.bankId ? bankAvatar(model.bankId) : icon(symbol)}</span><span class="number-title">${esc(model.title)}</span></span><span class="ordinal">${String(index + 1).padStart(2, '0')}/</span></div>
 ${model.attention ? `<span class="number-attention">${icon('info')}${esc(model.attention)}</span>` : ''}
 ${model.id === 'activity' ? rows(model.rows.slice(0, compact ? 3 : 4)) : `<strong class="module-value">${esc(model.value).replace(/(\.\d{2})$/, '<small>$1</small>')}${model.budget ? '<small class="budget-period">/mo</small>' : ''}</strong><div class="number-meta">${note ? `<p class="module-note">${esc(note)}</p>` : ''}${model.members?.length ? `<div class="module-household">${householdStack(model.members)}</div>` : ''}</div>`}
 ${model.budget ? `<div class="progress budget-progress ${model.budget.spent > model.budget.limit ? 'is-over' : ''}" data-viz-role="cash" data-viz-state="${limitState(model.budget.spent, model.budget.limit)}" role="progressbar" aria-label="Monthly budget used" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.max(0, Math.min(100, Math.round((model.budget.spent / model.budget.limit) * 100)))}" aria-valuetext="${esc(cash(model.budget.spent, true) + ' spent of ' + cash(model.budget.limit) + ' monthly budget')}"><i style="width:${Math.max(0, Math.min(100, (model.budget.spent / model.budget.limit) * 100))}%"></i></div>` : ''}
 ${model.visual ? numberVisualMarkup(model.visual) : ''}
 ${!model.budget && size !== 'S' && model.progress != null ? `<div class="number-goal">${model.target ? `<span>${cash(model.target)} goal</span>` : ''}${progress(model.progress, model.title + ' goal', model.visualRole || 'savings')}</div>` : ''}
 ${model.id !== 'activity' && ((!model.visual && !compact) || (model.visual && size === 'F')) && extraRows.length ? rows(extraRows.slice(0, size === 'F' ? 4 : 2)) : ''}
 </${tag}></article>`;
}
