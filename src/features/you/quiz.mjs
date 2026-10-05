import { esc, icon, button } from '../../design-system/templates.mjs';
import { portraitArt, portraitModel, traitGlyph } from './portrait.mjs';

// A short reflection, not a risk assessment or a definitive personality test.
export function quizDialog(p, data, answers) {
  const q = data.shared.modules.quiz[answers.length];
  if (!q)
    return `<div class="portrait-quiz portrait-quiz-result"><span class="eyebrow">YOUR FIRST IMPRESSION</span><div class="quiz-art">${portraitArt(portraitModel(p), 'quiz')}</div><h1>${esc(p.l2.personality.name)}</h1><p>${esc(p.l2.personality.copy)}</p><p class="quiz-quiet">Three answers begin the picture. Your everyday experiences will bring it to life.</p>${button('Explore your portrait', 'quiz-finish', 'primary wide')}<small>Your answers are saved. The 25 HSBC Points bonus is awarded once.</small></div>`;
  const n = answers.length;
  const themes = ['Planning', 'Spontaneity', 'Rhythm'];
  const prompts = [
    'Your everyday instinct',
    'A little room for possibility',
    'Support, on your terms',
  ];
  const symbols = [
    ['clock', 'list', 'spark'],
    ['target', 'spark', 'home'],
    ['check', 'clock', 'user'],
  ];
  return `<section class="portrait-quiz" data-quiz-step="${n}"><header><span class="eyebrow">${esc(prompts[n])}</span><span>${n + 1} / 3</span></header><div class="quiz-progress" aria-label="Question ${n + 1} of 3">${[0, 1, 2].map((i) => `<i class="${i <= n ? 'active' : ''}"></i>`).join('')}</div><div class="quiz-art quiz-art-symbol">${traitGlyph(themes[n])}</div><h1 class="quiz-question">${esc(q.q)}</h1><p class="quiz-quiet">Go with what feels closest. There’s no right answer.</p><div class="quiz-options">${q.o.map((o, i) => `<button class="quiz-option" data-action="answer:${i}"><span class="quiz-option-symbol">${icon(symbols[n][i])}</span><span>${esc(o)}</span>${icon('chev')}</button>`).join('')}</div><small>A starting point, never a label you have to keep.</small></section>`;
}
