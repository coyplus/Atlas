import { rewardMoment } from '../checkin/ritual.mjs';
import { calmFrame } from '../checkin/layout.mjs';
import { reflectionPrompt, reflectionFollowup, reflectionReasons } from './feeling-reflection.mjs';
import { esc, icon, button } from '../../design-system/templates.mjs';
import { feelings, feelingReasons, feelingModel } from './feelings.mjs';
const paths = {
  round: 'M50 8C78 8 93 28 92 52C91 78 74 92 49 91C23 90 8 73 9 49C10 24 27 8 50 8Z',
  sun: 'M50 5L61 18L78 13L81 31L97 40L87 55L91 73L73 78L63 95L47 85L28 90L24 72L7 61L17 46L12 28L31 24L40 7Z',
  soft: 'M25 10H75Q90 10 90 27V73Q90 90 73 90H27Q10 90 10 73V27Q10 10 25 10Z',
  wave: 'M16 23Q28 3 44 18Q60 0 74 17Q96 15 88 41Q103 57 84 67Q83 95 62 83Q47 102 34 84Q9 94 14 67Q-2 51 16 41Z',
  cloud:
    'M21 38Q8 13 34 15Q47 0 63 17Q91 9 87 37Q105 53 84 68Q91 94 65 88Q48 106 32 87Q6 93 13 68Q-4 51 21 38Z',
};
export function feelingGlyph(feeling = 'okay') {
  const f = feelings.find((x) => x.id === feeling) || feelings[2];
  return `<svg class="feeling-glyph" viewBox="0 0 100 100" aria-hidden="true"><path d="${paths[f.shape]}" fill="${f.color}"/><path d="${paths[f.shape]}" transform="translate(9 9) scale(.82)" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width=".7"/></svg>`;
}
export function feelingEntry(p) {
  const m = feelingModel(p),
    f = feelings.find((x) => x.id === m.entry?.feeling);
  return `<button class="feeling-entry" data-action="feeling" aria-label="${f ? `Money check-in: feeling ${f.label.toLowerCase()} today` : 'Money feeling check-in'}${m.streak ? `, ${m.streak}-day streak` : ''}"><span class="feeling-entry-symbol">${f ? feelingGlyph(f.id) : `<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 27S4 20 4 12a7 7 0 0 1 12-5 7 7 0 0 1 12 5c0 8-12 15-12 15Z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>`}</span><span class="feeling-entry-label">${f ? `Feeling ${f.label.toLowerCase()} today` : 'How’s money feeling?'}</span>${m.streak ? `<span class="feeling-streak"><i aria-hidden="true"></i>${m.streak} day streak</span>` : ''}${icon('chev')}</button>`;
}
function feelingContent(p, draft, stage = 'choose') {
  const f = feelings.find((x) => x.id === draft.feeling);
  const reasons = reflectionReasons(draft);
  const style = f ? `style="--feeling-color:${f.color};--feeling-light:${f.light}"` : '';
  if (stage === 'saved')
    return `<div class="feeling-flow feeling-saved" ${style}><span class="checkin-eyebrow">A MOMENT, JUST FOR YOU</span><div class="feeling-hero checkin-closing-art">${feelingGlyph(f.id)}</div><h1>You made space<br>for how you feel.</h1><p class="feeling-saved-note">Feeling ${f.label.toLowerCase()}${reasons.length ? ' · ' + esc(reasons.join(' · ')) : ''}${draft.note ? '<br>' + esc(draft.note) : ''}</p><p class="checkin-closing-line">You don’t have to work it all out today.<br>This moment is enough.</p>${rewardMoment(draft.reward)}<div class="feeling-footer">${button('Done', 'feeling-done', 'primary wide')}</div></div>`;
  const prompt = reflectionPrompt(draft);
  if (stage === 'reflect') {
    const answer = draft.reflection?.answer;
    const reasonText = new Intl.ListFormat('en-GB', { style: 'long', type: 'conjunction' }).format(
      reasons.map((reason) => reason.toLowerCase()),
    );
    return `<div class="feeling-flow feeling-reflect" ${style}><div class="feeling-context-heading">${feelingGlyph(f.id)}<span>Feeling ${f.label.toLowerCase()}${reasonText ? ' because of ' + esc(reasonText) : ''}</span></div><span class="reflection-author">${icon('assistant')} HSBC AI</span><h1>${esc(prompt.question)}</h1><div class="reflection-options" aria-label="Your reflection">${[...prompt.choices, 'In my own words'].map((choice, i) => `<button data-action="feeling-answer:${i}" aria-pressed="${answer === choice}">${esc(choice)}${answer === choice ? icon('check') : ''}</button>`).join('')}</div>${answer === 'In my own words' ? `<label class="feeling-note-label" for="feeling-note">What would you like to share? <span>Optional</span></label><textarea id="feeling-note" rows="3" maxlength="500" placeholder="What’s on your mind?">${esc(draft.note || '')}</textarea>` : ''}${answer ? `<aside class="reflection-followup" aria-live="polite"><p>${esc(reflectionFollowup(draft))}</p>${button('Continue with AI', 'feeling-chat', 'text')}</aside>` : ''}<div class="feeling-footer">${button('Finish check-in', 'feeling-save', 'primary wide')}</div></div>`;
  }
  if (stage === 'context')
    return `<div class="feeling-flow feeling-context" ${style}><div class="feeling-context-heading">${feelingGlyph(f.id)}<span>Feeling ${f.label.toLowerCase()}</span></div><h1>What’s behind it?</h1><p>Choose any that fit, or skip and save.</p><div class="feeling-reasons" aria-label="What is on your mind?">${feelingReasons.map((r, i) => `<button data-action="feeling-reason:${i}" aria-pressed="${draft.reasons.includes(r)}">${esc(r)}</button>`).join('')}</div>${draft.reasons.length ? `<button class="reflection-invitation" data-action="feeling-reflect"><span class="reflection-author">${icon('assistant')} HSBC AI · optional</span><span>${esc(prompt.question)}</span><b>Reflect for a moment ${icon('arrow')}</b></button>` : ''}<small class="feeling-privacy">This check-in isn’t shared with your household.</small><div class="feeling-footer">${button('Finish check-in', 'feeling-save', 'primary wide')}</div></div>`;
  return `<div class="feeling-flow feeling-choose" ${style}><h1>How does money<br>feel today?</h1><div class="feeling-hero">${f ? feelingGlyph(f.id) : `<div class="feeling-intro-art">${feelings.map((x) => feelingGlyph(x.id)).join('')}</div>`}</div><div class="feeling-caption" aria-live="polite"><h2>${f?.label || 'Choose what feels closest'}</h2><p>${f?.line || ''}</p></div><div class="feeling-options" aria-label="Your feeling">${feelings.map((x) => `<button data-action="feeling-select:${x.id}" aria-pressed="${draft.feeling === x.id}">${feelingGlyph(x.id)}<span>${x.label}</span></button>`).join('')}</div><div class="feeling-footer">${button('Continue', 'feeling-next', 'primary wide', f ? '' : 'disabled')}</div></div>`;
}

export function feelingFlow(p, draft, stage = 'choose') {
  const html = feelingContent(p, draft, stage),
    start = html.indexOf('>') + 1;
  return (
    html.slice(0, start).replace('feeling-flow', 'feeling-flow is-calm') +
    calmFrame(html.slice(start, -6), 'feeling-footer') +
    '</div>'
  );
}
