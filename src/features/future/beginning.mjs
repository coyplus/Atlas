import { button, esc, icon } from '../../design-system/templates.mjs';
import { futureState, planningPots } from '../../domain/future.mjs';
import { possibilities } from '../ideas/model.mjs';

export const isFutureBeginning = (p) =>
  !planningPots(p).length && !futureState(p).ideas.length && !futureState(p).showStudio;

export function futureBeginning(p, s) {
  const ideas = possibilities(p, s);
  // These are the same context-aware suggestions used by Add a goal, not invented plans.
  const picks = ideas.filter((i) => i.key !== 'annual-costs').slice(0, 2);
  return `<div class="future-page future-beginning">
    <header><span class="eyebrow">YOUR FUTURE</span><h1>What would you like money to make possible?</h1><p>Start with one possibility.<br>See what a small, regular amount could do.</p></header>
    <div class="beginning-possibilities" aria-label="Ideas to explore">
      ${picks.map((i, index) => `<button class="beginning-possibility beginning-possibility-${index}" data-action="future-possibility:${esc(i.id)}"><span class="beginning-orb" aria-hidden="true">${icon(i.glyph)}</span><span><strong>${esc(i.title)}</strong><small>${esc(i.source)}</small></span>${icon('arrow')}</button>`).join('')}
      <button class="beginning-possibility beginning-own" data-action="future-own"><span class="beginning-orb" aria-hidden="true">${icon('plus')}</span><span><strong>Something of my own</strong><small>Start with your own idea</small></span>${icon('arrow')}</button>
    </div>
    <p class="beginning-promise">Try an idea before you commit.<br>Nothing moves until you approve.</p>
    ${button('Open all planning tools', 'future-studio', 'text beginning-tools')}
  </div>`;
}
