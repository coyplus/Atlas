import { esc, button, agentAvatar, icon } from '../../design-system/templates.mjs';
import { cash } from '../../domain/money.mjs';
import { moneySpeedModel } from '../future/money-speed.mjs';
import { potAppearance, appearanceStyle } from '../pots/appearance.mjs';
import { companionAvatar } from '../companion/identity.mjs';
import { companionPreferences } from '../companion/model.mjs';

// Voice is a second way to talk within the same conversation, not a separate screen.
// The microphone stays off: a sample question demonstrates the exchange.
export const voicePhases = ['ready', 'listening', 'thinking', 'answer', 'human'];
export const adviserFor = (p) =>
  p.l1.customer.id === 'elena'
    ? { id: 'priya', name: 'Priya', role: 'Relationship Manager' }
    : { id: 'maya', name: 'Maya', role: 'Financial adviser' };

export function voiceTranscript(p, s) {
  const m = moneySpeedModel(p, s);
  return {
    question: 'How is my money moving towards my goals?',
    response: m.total
      ? `You have ${cash(Math.round(m.total))} a month moving towards ${m.active.length} goals. ${m.insight}`
      : 'You haven’t set a monthly contribution yet. We can explore a first step together.',
  };
}

const words = (text) =>
  esc(text)
    .split(' ')
    .map((w, i) => `<span class="voice-word" style="--i:${i}">${w}</span>`)
    .join(' ');

function presence(p, phase) {
  if (phase === 'human') {
    const a = adviserFor(p);
    return `<span class="voice-person">${agentAvatar(a.id)}</span>`;
  }
  const pose = { listening: 'listening', thinking: 'thinking', answer: 'speaking' }[phase] || '';
  return companionAvatar(companionPreferences(p).style, { state: pose, orb: true });
}

function caption(p, s, phase) {
  const turn = voiceTranscript(p, s),
    a = adviserFor(p);
  if (phase === 'listening')
    return `<small>Listening</small><span class="voice-caption">${words(turn.question)}</span>`;
  if (phase === 'thinking')
    return `<small>Thinking</small><span class="voice-caption is-settled">${esc(turn.question)}</span>`;
  if (phase === 'answer')
    return `<span class="voice-caption">${words(turn.response.split(/(?<=\.)\s/)[0])}</span>`;
  if (phase === 'human')
    return `<small>${esc(a.role)}</small><span class="voice-caption">${esc(a.name)} can join, with your plans in view.</span>`;
  return `<span class="voice-caption">What’s on your mind?</span>`;
}

function surfaces(p, s, phase) {
  const m = moneySpeedModel(p, s),
    a = adviserFor(p);
  // With nothing set aside yet, the answer offers a first step instead of an empty £0 chart.
  if (phase === 'answer' && !m.active.length)
    return `<article class="voice-evidence"><header><span>Each month, towards your goals</span>${icon('trend')}</header><p class="voice-empty">Nothing is set aside each month yet. A first goal can start small.</p><button class="voice-card-action" data-action="future-add"><span>Explore a first goal</span>${icon('arrow')}</button></article><button class="voice-adviser-action" data-action="support:voice-human">${agentAvatar(a.id)}<span><b>Bring in ${esc(a.name)}</b><small>${esc(a.role)}</small></span>${icon('arrow')}</button>`;
  if (phase === 'answer')
    return `<article class="voice-evidence"><header><span>Each month, towards your goals</span>${icon('trend')}</header><div class="voice-money">${cash(Math.round(m.total))}<small>a month</small></div><div class="voice-allocation-bar" aria-hidden="true">${m.active.map(({ goal, amount }) => `<i style="flex:${amount};${appearanceStyle(potAppearance(p, goal))}"></i>`).join('')}</div><div class="voice-allocation-key">${m.active.map(({ goal, amount }) => `<span style="${appearanceStyle(potAppearance(p, goal))}"><i></i>${esc(goal.name)}<b>${cash(Math.round(amount))}</b></span>`).join('')}</div><button class="voice-card-action" data-action="future-speed"><span>Explore your monthly plan</span>${icon('arrow')}</button></article><button class="voice-adviser-action" data-action="support:voice-human">${agentAvatar(a.id)}<span><b>Bring in ${esc(a.name)}</b><small>${esc(a.role)}</small></span>${icon('arrow')}</button>`;
  if (phase === 'human')
    return `<article class="voice-evidence voice-handover"><header><span>No need to start again</span>${icon('users')}</header><h2>Your plans come with you.</h2>${m.active.length ? `<div class="voice-handover-facts"><span><b>${m.active.length}</b>funded goals</span><span><b>${cash(Math.round(m.total))}</b>each month</span></div>` : `<p class="voice-empty">${esc(a.name)} sees your accounts and this conversation, so you won’t need to repeat yourself.</p>`}${button('Continue with ' + a.name, 'support:voice-connect', 'primary wide')}</article>`;
  return '';
}

function controls(phase) {
  // One way back to typing; the header still closes the whole conversation.
  const primary =
    phase === 'ready'
      ? `<button class="voice-primary" data-action="support:voice-sample">${icon('waveform')}<span>Try a sample question</span></button>`
      : `<span class="voice-wave" aria-hidden="true">${[12, 22, 30, 20, 12].map((h, i) => `<i style="--h:${h}px;--i:${i}"></i>`).join('')}</span>`;
  return `<footer class="voice-controls"><button class="voice-control" data-action="support:voice-text" aria-label="Type instead" title="Type instead">${icon('keyboard')}</button>${primary}<span class="voice-control-space" aria-hidden="true"></span></footer>`;
}

/** The voice stage is always present in the conversation, so switching modes can animate. */
export function voiceStage(p, s, phase = null) {
  if (!phase) return '<section class="voice-stage" data-phase="off" aria-hidden="true" inert></section>';
  return `<section class="voice-stage" data-phase="${esc(phase)}" aria-label="Voice conversation"><div class="voice-presence"><div class="voice-orbit">${presence(p, phase)}</div><p class="voice-status" aria-live="polite">${caption(p, s, phase)}</p></div><div class="voice-surfaces">${surfaces(p, s, phase)}</div>${controls(phase)}<span class="sr-only">Demonstration: the microphone is off and no call is connected.</span></section>`;
}
