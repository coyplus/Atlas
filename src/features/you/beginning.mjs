import { button, icon } from '../../design-system/templates.mjs';
import { portraitArt, portraitModel } from './portrait.mjs';

// Depth is evidence, not tenure, wealth or the number of times a control was clicked.
export function isEarlyPortrait(p, member = 'self') {
  const m = portraitModel(p, member);
  return m.self && (!m.named || m.fidelity === 'early');
}
export function portraitBeginning(p) {
  const m = portraitModel(p);
  return `<section class="personality money-portrait portrait-beginning" aria-label="Money personality" data-portrait-stage="outline">
    <div class="portrait-canvas">${portraitArt(m)}</div>
    <div class="portrait-glass"><span class="eyebrow">YOUR MONEY PORTRAIT</span>
      <h1>Discover how you<br>approach money.</h1>
      <p class="portrait-summary">Explore your strengths and the things worth watching out for.</p>
      ${button('Answer three questions', 'quiz', 'primary wide')}
      <small class="portrait-reward">A first impression you can shape and correct.</small>
    </div>
  </section>
  <div class="portrait-beginning-promise"><span>${icon('spark')}</span><p>As we learn together, your portrait and support become more personal.</p></div>`;
}
