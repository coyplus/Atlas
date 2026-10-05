import { rewardMoment } from '../checkin/ritual.mjs';
const quizRewards = new WeakMap();
export const setQuizReward = (p, points) => quizRewards.set(p, points);
import { esc, icon, button } from '../../design-system/templates.mjs';
import { portraitArt, portraitModel, traitGlyph } from './portrait.mjs';

// A short reflection, not a risk assessment or a definitive personality test.
export function quizDialog(p, data, answers) {
  const q = data.shared.modules.quiz[answers.length];
  if (!q)
    return `<div class="portrait-quiz portrait-quiz-result"><span class="eyebrow">YOUR FIRST IMPRESSION</span><div class="quiz-art">${portraitArt(portraitModel(p), 'quiz')}</div><h1>${esc(p.l2.personality.name)}</h1><p>${esc(p.l2.personality.copy)}</p><p class="quiz-quiet">A first impression. Yours to explore and shape.</p>${rewardMoment(quizRewards.get(p) || 0, 'for sharing your perspective')}${button('Explore your portrait', 'quiz-finish', 'primary wide')}<small>${quizRewards.get(p) ? 'Your answers and Points are saved.' : 'Your answers are updated. Your quiz Points were already awarded.'}</small></div>`;
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
  return `<section class="portrait-quiz" data-quiz-step="${n}"><header><span class="eyebrow">${esc(prompts[n])}</span><span>${n + 1} / 3</span></header><div class="quiz-progress" aria-label="Question ${n + 1} of 3">${[0, 1, 2].map((i) => `<i class="${i <= n ? 'active' : ''}"></i>`).join('')}</div><div class="quiz-art quiz-art-symbol">${traitGlyph(themes[n])}${questionIllustration(n)}</div><h1 class="quiz-question">${esc(q.q)}</h1><p class="quiz-quiet">Go with what feels closest. There’s no right answer.</p><div class="quiz-options">${q.o.map((o, i) => `<button class="quiz-option" data-action="answer:${i}"><span class="quiz-option-symbol">${icon(symbols[n][i])}</span><span>${esc(o)}</span>${icon('chev')}</button>`).join('')}</div><small>A starting point, never a label you have to keep.</small></section>`;
}

function questionIllustration(n) {
  const drawings = [
    '<rect x="100" y="28" width="91" height="75" rx="9"/><path d="M100 49h91M119 20v16m52-16v16M115 64h13m13 0h13m13 0h10M115 81h13m13 0h13"/><rect x="145" y="111" width="81" height="48" rx="8"/><path d="M203 124h23v22h-23a11 11 0 0 1 0-22Z"/><circle cx="211" cy="135" r="2"/>',
    '<path d="M108 68h110v85H108zM100 52h126v23H100zM163 52v101M163 52c-42 0-43-40-18-31 11 4 18 31 18 31Zm0 0c42 0 43-40 18-31-11 4-18 31-18 31Z"/><path d="m235 31 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z"/>',
    '<rect x="113" y="23" width="69" height="132" rx="13"/><path d="M133 34h29M139 144h17"/><path d="M158 55h67a10 10 0 0 1 10 10v33a10 10 0 0 1-10 10h-37l-19 14v-14h-11a10 10 0 0 1-10-10V65a10 10 0 0 1 10-10Z"/><path d="M165 74h52m-52 17h36"/>',
  ];
  return `<svg class="quiz-line-art" viewBox="0 0 280 180" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${drawings[n]}</g></svg>`;
}
