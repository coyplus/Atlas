import { esc } from '../../design-system/templates.mjs';
import { styles } from './model.mjs';

// The established three-star sparkle, split into its stars so a state can move them.
// Paths are the Material `auto_awesome` glyph; at rest the mark is unchanged.
const stars =
  '<svg class="companion-mark" viewBox="0 0 24 24" aria-hidden="true"><path class="mark-star mark-star-a" d="m19 9-1.25-2.75L15 5l2.75-1.25L19 1l1.25 2.75L23 5l-2.75 1.25Z"/><path class="mark-star mark-star-b" d="m19 23-1.25-2.75L15 19l2.75-1.25L19 15l1.25 2.75L23 19l-2.75 1.25Z"/><path class="mark-star mark-star-main" d="M9 20l-2.5-5.5L1 12l5.5-2.5L9 4l2.5 5.5L17 12l-5.5 2.5Zm0-4.85L10 13l2.15-1L10 11 9 8.85 8 11l-2.15 1L8 13Z"/></svg>';

let active = 'guide';
// The runtime records the current customer's saved style so shared headers and bylines match.
export function rememberCompanionStyle(style) {
  if (styles[style]) active = style;
}
export function activeCompanionStyle() {
  return active;
}
/**
 * One AI identity. `state` is an interaction pose (thinking, speaking, attention, curious);
 * `still` removes the ambient breathing for utility and historic placements.
 */
export function companionAvatar(style = active, { still = false, state = '' } = {}) {
  const id = styles[style] ? style : 'guide',
    c = styles[id];
  return `<span class="companion-avatar companion-avatar-${id}${still ? ' is-still' : ''}"${state ? ` data-mark="${esc(state)}"` : ''} style="--companion-color:${c.color};--companion-light:${c.light}" aria-hidden="true"><i></i><i></i>${stars}</span>`;
}
/** Inline attribution for AI-authored content inside a page. */
export function aiByline(label = 'HSBC AI', style = active) {
  return `<span class="ai-byline">${companionAvatar(style, { still: true })}<span>${esc(label)}</span></span>`;
}
