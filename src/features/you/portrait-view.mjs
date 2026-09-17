import { esc, icon, button, householdAvatar } from '../../design-system/templates.mjs';
import { portraitModel, portraitArt, traitExpression, traitGlyph } from './portrait.mjs';
import { portraitInterpretationsView, portraitBalanceView } from './portrait-story-view.mjs';
const summaries = {
  'Steady builder': 'You find your footing through small, regular steps.',
  Planner: 'You like a clear plan that makes room for everyday life.',
  'Long-game architect': 'You build for the future, with patience and purpose.',
  'Free spirit': 'You make room for spontaneity and the people you care about.',
  'Goal getter': 'You like a clear goal and seeing it get closer.',
  'Long game, lived warmly': 'Different approaches. A shared direction.',
};
export function portraitComponent(p, s) {
  const m = portraitModel(p, s.member);
  const members = p.l2.personality.members || [];
  const choices = [
    { id: 'self', name: 'You', shared: true },
    ...p.l1.household.members
      .filter((x) => x.relation !== 'self')
      .map((x) => ({ ...x, shared: members.some((m) => m.memberId === x.id) })),
    ...(members.some((x) => x.memberId === 'household')
      ? [{ id: 'household', name: 'Together', shared: true }]
      : []),
  ];
  const pending = p.ui.requests.filter((r) => r.kind === 'invite');
  const corrected = m.self && m.source.startsWith('Corrected by you');
  return `<section class="personality money-portrait" aria-label="Money personality" data-portrait-member="${esc(m.member)}" data-portrait-stage="${m.named ? 'named' : 'outline'}">
    <nav class="member-picker portrait-members" aria-label="Your household"><div class="portrait-people">${choices.map(({ id, name, shared }) => `<button data-action="${shared ? 'member' : 'portrait-member'}:${esc(id)}" aria-label="${esc(name)}${shared ? '' : ', personality not shared'}" ${shared ? `aria-pressed="${m.member === id}"` : ''} class="${m.member === id ? 'selected' : ''}">${id === 'household' ? `<span>${icon('users')}</span>` : householdAvatar(id === 'self' ? p.l1.customer.id : id, id === 'self' ? p.l1.customer.firstName : name)}<small>${esc(name)}</small></button>`).join('')}${pending.map((r, i) => `<button class="portrait-pending" data-action="portrait-invite:${i}" aria-label="${esc(r.name)}, invitation awaiting consent"><span>${esc(r.name[0])}<i></i></span><small>${esc(r.name)}</small></button>`).join('')}</div><button class="portrait-add" data-action="invite" aria-label="Add household member"><span>${icon('plus')}</span><small>Add</small></button></nav>
    <div class="portrait-canvas">${portraitArt(m)}<span class="portrait-depth">${esc(m.household ? 'Shared perspectives' : m.stage)}</span></div>
    <div class="portrait-glass"><span class="eyebrow">${m.household ? 'YOUR HOUSEHOLD' : 'MONEY PERSONALITY'}</span><h1>${esc(m.personality.name || 'A picture of you.')}</h1>
    <p class="portrait-summary">${esc(m.named ? (corrected ? m.personality.copy : summaries[m.personality.name] || m.personality.copy) : 'Discover how you plan, spend and save. Your answers shape your portrait.')}</p>
    ${m.named ? `<div class="portrait-traits">${m.traits.map(([t]) => `<span>${traitGlyph(t)}${esc(t)}</span>`).join('')}</div><button class="portrait-link" data-action="portrait"><span>${m.self ? 'Explore your portrait' : 'Explore this portrait'}</span>${icon('arrow')}</button>` : `${button('Take the 2-minute quiz', 'quiz', 'primary')}<small class="portrait-reward">Your money personality + 25 HSBC Points</small>`}
    <button class="portrait-link ps-entry" data-action="portrait-story"><span>Behind ${m.self ? 'your' : 'this'} portrait</span>${icon('arrow')}</button></div></section>`;
}
const coverLines = {
  Planner: 'A plan for money. Room for life.',
  'Steady builder': 'Progress, at your pace.',
  'Long-game architect': 'A long view. A life around it.',
  'Free spirit': 'Room for the unexpected.',
  'Goal getter': 'A direction that gives today a purpose.',
  'Long game, lived warmly': 'Different approaches. A shared direction.',
};
const coverReadings = {
  Planner:
    'You tend to give money a job before life gets busy. A little structure can free you to enjoy what matters, without making every decision all over again.',
  'Steady builder':
    'You don’t need a dramatic leap to move forward. The small things you return to can create a steadier footing over time.',
  'Long-game architect':
    'You tend to look beyond the next decision. A plan gives your money direction; patience gives it time to become something.',
  'Free spirit':
    'Money can be a way of saying yes: to an experience, a possibility, or someone you care about. Leaving room for life seems to matter to you.',
  'Goal getter':
    'Knowing what you’re working towards can make the everyday choices feel worthwhile. Progress becomes easier to notice when it has a destination.',
};
export function portraitDetail(p, s) {
  const m = portraitModel(p, s.member);
  const corrected = m.self && m.source.startsWith('Corrected by you');
  const name = m.self
    ? p.l1.customer.firstName
    : p.l1.household.members.find((x) => x.id === m.member)?.name;
  const title = m.household
    ? 'A shared portrait'
    : name
      ? `A portrait of ${name}`
      : 'A shared perspective';
  const interpretations = portraitInterpretationsView(p, s);
  return `<article class="portrait-detail portrait-explore portrait-editorial">
    <header class="pe-cover" data-support-topic="intro"><span class="eyebrow">${esc(title)}</span><h1>${esc(m.personality.name || 'Still becoming.')}</h1><div class="pe-art">${portraitArt(m, 'detail')}</div><span class="pe-stage">${esc(m.stage)}</span><h2>${esc(m.named ? coverLines[m.personality.name] || 'More than one way to see money.' : 'Every portrait begins with a conversation.')}</h2><p class="pe-intro">${esc(m.named ? (corrected ? m.personality.copy : coverReadings[m.personality.name] || summaries[m.personality.name] || m.personality.copy) : 'Three questions give us a first impression. Your perspective gives it meaning.')}</p>${m.named ? `<div class="portrait-explore-key">${m.traits.map(([trait]) => `<span title="${esc(traitExpression(trait))}">${traitGlyph(trait)}${esc(trait)}</span>`).join('')}</div>` : button('Discover your money personality', 'quiz', 'primary wide')}</header>
    ${portraitBalanceView(p, s, interpretations)}
    ${m.self && m.named ? `<section class="portrait-review" data-support-topic="learning"><span class="eyebrow">A PORTRAIT, NOT A LABEL</span><h3>Does this feel like you?</h3><p>You can recognise yourself in it, or help us see it differently. Your perspective belongs in this picture.</p><div class="button-row">${button(p.ui.confirmed ? 'Confirmed by you' : 'This sounds like me', 'personality-confirm', 'secondary', p.ui.confirmed ? 'disabled' : '')}${button('Not quite', 'personality-correct', 'text')}</div></section>` : ''}
    <footer class="pe-colophon"><p class="portrait-source">${esc(m.source)}${m.self ? '<br>Your balance and HSBC tier do not shape this artwork.' : '<br>Shared by consent. Other accounts and private details stay private.'}</p><button class="portrait-link" data-action="portrait-story"><span>See the measurable evidence</span>${icon('arrow')}</button></footer></article>`;
}
