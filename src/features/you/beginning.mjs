import { button, icon } from '../../design-system/templates.mjs';
import { portraitArt, portraitModel } from './portrait.mjs';
import { checkinModel } from '../checkin/model.mjs';
import { dailyStamp } from '../checkin/ritual.mjs';
import { toolArt } from '../checkin/views.mjs';
import { badgeArt } from '../badges/art.mjs';
import { badgeState, challenge } from '../badges/model.mjs';

export function savingsBeginning(p) {
  const b = challenge('growing-savings');
  const s = badgeState(p, b.id);
  const earned = s.status === 'earned';
  const started = s.status !== 'available';
  return `<section class="savings-beginning" aria-label="Your savings challenge" data-challenge-status="${s.status}" data-support-context="badges">
    <header><span class="eyebrow">${earned ? 'YOUR FIRST SAVINGS HABIT' : 'A SMALL START'}</span><span class="savings-beginning-reward">${earned ? '200 Points earned' : '+200 HSBC Points'}</span></header>
    <div class="savings-beginning-heading"><h2>${earned ? 'Small steps.<br>A real achievement.' : 'Small change,<br>big start.'}</h2><div class="savings-beginning-art">${badgeArt(b, s.status)}</div></div>
    <p>${earned ? '£465 put aside, one saving day at a time. Your badge and Points are yours to keep.' : '£1 on day one. £2 on day two. Keep adding £1 to each saving day, up to £30. That’s £465 altogether.'}</p>
    <div class="savings-beginning-progress" role="progressbar" aria-label="Saving days completed" aria-valuemin="0" aria-valuemax="30" aria-valuenow="${s.count}">${Array.from({ length: b.target }, (_, i) => `<i class="${i < s.count ? 'is-done' : ''}" aria-hidden="true"></i>`).join('')}</div>
    <div class="savings-beginning-caption"><b>${started ? `${s.count} of 30 saving days${s.status === 'paused' ? ' · Paused' : ''}` : 'Start with £1'}</b><span>${earned ? 'Challenge complete' : 'Points on completion'}</span></div>
    ${button(earned ? 'See your achievement' : started ? 'Continue your challenge' : 'Explore the challenge', 'badge:growing-savings', 'secondary wide')}
    <small>${earned ? 'Explore another challenge whenever you’re ready.' : 'Only save what feels manageable. Pause anytime; completed days stay.'}</small>
  </section>`;
}

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

export function dailyBeginning(p) {
  const m = checkinModel(p);
  return `<section class="daily-beginning" aria-label="Your daily money check-in" data-support-context="checkin"><header><span class="eyebrow">A MOMENT FOR YOU</span><small>${m.todayDone ? 'Today, complete' : '+5 HSBC Points'}</small></header><div class="daily-beginning-heading"><h2>${m.todayDone ? 'A little pause.<br>A little clearer.' : 'How does money<br>feel today?'}</h2>${toolArt('feeling')}</div><p>${m.todayDone ? 'You made room to reflect. Come back tomorrow for another small moment.' : 'Take a breath. Notice what’s on your mind. A quick check-in can be the start of a useful conversation.'}</p><div class="daily-beginning-week" aria-label="Your last seven days">${m.days.map((d) => `<span aria-label="${d.date}: ${d.complete ? 'checked in' : 'not recorded'}">${dailyStamp(d.complete)}<small>${d.today ? 'Today' : new Date(d.date + 'T12:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' })}</small></span>`).join('')}</div>${button(m.todayDone ? 'Revisit your reflections' : 'Take a moment', m.todayDone ? 'checkin-library' : 'feeling', 'secondary wide')}${!m.todayDone ? button('Try a different check-in', 'checkin', 'text wide') : ''}<small>One moment is enough. Miss a day? Just pick up where you are.</small></section>`;
}
