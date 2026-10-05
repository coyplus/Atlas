import { esc, icon, button } from '../../design-system/templates.mjs';
import { cash, dateAt } from '../../domain/money.mjs';
import { forecast } from '../../domain/future.mjs';
import { companionAvatar } from '../companion/identity.mjs';
import { companionPreferences } from '../companion/model.mjs';

// A focused, disposable preview. Neither scrubbing nor conversation changes the plan.
const sessions = new WeakMap();
const money = (n) => cash(Math.round(n));
export const goalSessionTitles = ['Imagine this', 'Your own possibility', 'Make it mine'];
export function goalSessionModel(p, draft) {
  const idea = {
    id: 'focused-preview',
    kind: 'add',
    goal: 'focused-preview',
    name: draft.name.trim() || 'Your possibility',
    target: draft.target,
    amount: draft.amount,
    investment: draft.investment,
    title: 'Your monthly contribution',
  };
  const next = forecast(p, [idea], draft.month);
  return { value: next.values[idea.goal], reached: next.dates[idea.goal], idea };
}
function words(p, d, m) {
  if (!d.target)
    return `${money(d.amount)} a month could become ${money(m.value)} by ${dateAt(p, d.month)}. You don’t need a fixed destination to start. What would this money give you room to do?`;
  if (m.reached == null)
    return `At ${money(d.amount)} a month, this target sits beyond our 20-year view. Try a smaller target or a different monthly amount, and see what feels realistic for you.`;
  return `${money(d.amount)} a month could bring ${d.name.trim() ? '“' + d.name.trim() + '”' : 'this possibility'} within reach around ${dateAt(p, m.reached)}. Try a different pace—there’s room to find one that fits your life.`;
}
export function goalSessionSupport(p, context) {
  const d = sessions.get(p)?.get(context.kind === 'possibility' ? context.id : 'own');
  if (!d) return null;
  return {
    source: 'ai',
    author: 'HSBC AI',
    title: 'Shape it around your life',
    message: words(p, d, goalSessionModel(p, d)),
    cta: 'Back to this possibility',
    action: 'close',
  };
}
export function goalSessionReply(p, context, text) {
  const d = sessions.get(p)?.get(context.kind === 'possibility' ? context.id : 'own');
  if (!d) return null;
  const match = text.match(/£([\d,]+)(?:\s*(?:a|per|each)\s*month)?/i);
  if (match && !/target|milestone/i.test(text)) {
    const amount = Number(match[1].replaceAll(',', ''));
    if (amount > 0 && amount <= 10000) {
      const alternative = { ...d, amount };
      return (
        words(p, alternative, goalSessionModel(p, alternative)) +
        ' I haven’t changed your draft. Set that monthly amount when you return if you want to try it.'
      );
    }
  }
  if (/interest|growth|assum|return/i.test(text))
    return d.investment
      ? 'This illustration assumes 5% annual growth, not a guaranteed return. Values can fall. Your contributions continue beyond the milestone; you can compare a different monthly amount before deciding.'
      : 'This new Pot assumes no interest: the preview comes from your monthly contributions. With a target, contributions stop once it is reached. Without one, they continue. The numbers are an illustration, not an affordability check.';
  if (/afford|budget|too much|comfortable/i.test(text))
    return 'Start with what you can comfortably set aside after essentials and existing commitments. This projection does not establish affordability. Try a smaller monthly amount and see the date move; a slower pace is a valid choice.';
  return (
    words(p, d, goalSessionModel(p, d)) +
    ' We can compare a monthly amount—for example, “What about £25 a month?”—or look at what the projection assumes.'
  );
}
export function goalSessionPreview(p, d) {
  const m = goalSessionModel(p, d);
  const limit = Math.max(d.target || d.amount * 60, m.value, 1);
  const fill = Math.max(0.13, Math.min(1, Math.sqrt(m.value / limit)));
  const span = Math.max(12, d.month);
  const samples = Array.from({ length: 13 }, (_, n) => {
    const month = Math.round((n * span) / 12);
    return forecast(p, [m.idea], month).values[m.idea.goal];
  });
  const top = Math.max(...samples, d.target || 0, 1);
  const path = samples
    .map((v, n) => `${n ? 'L' : 'M'}${8 + n * 24} ${76 - (v / top) * 64}`)
    .join(' ');
  const reached = d.target && m.value >= d.target;
  return `<div class="goal-session-scene" data-investment="${d.investment}">
    <div class="goal-session-date"><span>${d.month ? dateAt(p, d.month) : 'Today'}</span><small>Age ${p.l1.customer.age + Math.floor(d.month / 12)}</small></div>
    <div class="goal-session-orbit ${reached ? 'is-reached' : ''}" style="--goal-fill:${fill}"><div class="goal-session-fill"></div><div class="goal-session-orbit-copy">${icon(d.glyph || 'target')}<small>${d.month ? 'You could have' : 'Your starting point'}</small><strong>${money(m.value)}</strong><span>${d.target ? `${reached ? 'Target reached' : money(d.target) + ' target'}` : 'Room to keep growing'}</span></div></div>
    <div class="goal-session-trajectory"><svg viewBox="0 0 304 88" role="img" aria-label="Illustrative balance from today to ${esc(dateAt(p, span))}">${d.target ? `<path class="goal-target-line" d="M8 ${76 - (d.target / top) * 64} H296"/>` : ''}<path class="goal-area" d="${path} L296 80 L8 80Z"/><path class="goal-line" d="${path}"/><circle cx="296" cy="${76 - (samples[12] / top) * 64}" r="4"/></svg><div><small>Today</small><small>${dateAt(p, span)}</small></div></div>
    <small class="goal-session-basis">${d.investment ? 'Illustrative investment growth · values can fall' : 'Contributions only · no interest assumed'}</small>
    <p class="goal-session-outlook" aria-live="polite">${d.target ? (m.reached == null ? 'Try a different pace to bring this target closer.' : `Your target could be reached in ${dateAt(p, m.reached)}.`) : 'A growing Pot. No fixed target needed.'}</p>
  </div>`;
}
function goalSummary(p, d) {
  const m = goalSessionModel(p, d);
  return `<span>${icon(d.glyph || 'target')}<span><small>Your preview</small><b>${d.month ? dateAt(p, d.month) : 'Today'}</b></span></span><span class="goal-summary-value"><strong>${money(m.value)}</strong>${d.target ? `<small>Target ${m.reached == null ? 'beyond 20 years' : dateAt(p, m.reached)}</small>` : '<small>No fixed target</small>'}</span>`;
}
export function goalSession(p, i = null, makeReal = false) {
  const d = {
    name: i?.shortName || i?.name || '',
    target: i?.target || 3000,
    amount: i?.amount || 50,
    month: Math.min(240, i?.month || Math.ceil((i?.target || 3000) / (i?.amount || 50))),
    investment: !!i?.investment,
    glyph: i?.glyph || 'target',
  };
  if (!sessions.has(p)) sessions.set(p, new Map());
  sessions.get(p).set(i?.id || 'own', d);
  return `<div class="goal-session" ${i ? `data-possibility="${esc(i.id)}"` : ''}>
    <form id="future-add-form" data-session="${esc(i?.id || 'own')}" data-make-real="${makeReal}" ${i ? `data-possibility="${esc(i.id)}"` : ''}>
      <header class="goal-session-heading"><span class="eyebrow">ONE POSSIBILITY. YOUR PACE.</span><label><span class="sr-only">Goal name</span><textarea name="name" required maxlength="60" rows="2" placeholder="What would you love to do?">${esc(d.name)}</textarea></label><p>${esc(i?.why || 'Give this future a name. Then see how small steps could bring it closer.')}</p></header>
      <div data-goal-preview>${goalSessionPreview(p, d)}</div>
      <section class="goal-session-time" aria-label="Time Travel"><div><b>${icon('clock')} Time Travel</b><span>Slide into your future</span></div><label class="sr-only" for="goal-time">Preview months from today</label><input id="goal-time" style="--time-fill:${(d.month / 240) * 100}%" name="previewMonth" type="range" min="0" max="240" step="1" value="${d.month}" aria-valuetext="${dateAt(p, d.month)}"><div class="goal-time-labels"><span>Today</span><span>10 years</span><span>20 years</span></div></section>
      <div class="goal-live-summary" data-goal-summary>${goalSummary(p, d)}</div>
      <section class="goal-session-controls possibility-numbers" aria-label="Shape this future"><h3>Find your pace <span>Optional to adjust</span></h3><div class="goal-session-fields"><label class="field">Each month (£)<input name="amount" type="number" required min="1" max="10000" step="1" value="${d.amount}" inputmode="numeric"></label><label class="field">Your target (£)<input name="target" type="number" required min="1" max="10000000" step="1" value="${d.target}" inputmode="numeric"></label></div><label class="goal-open-ended"><input type="checkbox" name="openEnded"> I don’t have a target yet</label></section>
      <button type="button" class="goal-session-companion" data-action="support:discuss">${companionAvatar(companionPreferences(p).style)}<span><b>Let’s shape this together</b><span data-goal-insight>${esc(words(p, d, goalSessionModel(p, d)))}</span><strong>Talk it through ${icon('arrow')}</strong></span></button>
      <details class="goal-session-assumptions"><summary>What this preview assumes</summary><p>${d.investment ? 'An illustrative 5% annual investment growth assumption. Actual returns vary and may be negative; you could get back less than you put in. Contributions continue beyond your milestone.' : 'Monthly contributions from today, with no interest assumed for this new Pot. If you set a target, contributions stop when it is reached.'} It uses the same projection as Future. Check that the monthly amount fits alongside your existing commitments.</p></details>
      <footer class="goal-session-footer"><button type="submit" class="btn primary wide">${makeReal ? 'Make it real' : 'Try this in my future'}</button><p>${makeReal ? 'Creates a Pot and monthly Money Rule from today. You can undo this.' : 'Adds a preview to Future. Review it alongside your other plans before committing.'}</p>${i ? button(makeReal ? 'Not for me' : 'Create my own instead', makeReal ? 'future-horizon-hide:' + i.id : 'future-own', 'text wide') : ''}</footer>
    </form>
  </div>`;
}
export function updateGoalSession(p, form, render) {
  const previous = sessions.get(p)?.get(form.dataset.session);
  if (!previous) return;
  const target = form.elements.target;
  target.disabled = form.elements.openEnded.checked;
  target.required = !target.disabled;
  const amount = Number(form.elements.amount.value);
  const value = target.disabled ? 0 : Number(target.value);
  if (!form.elements.amount.validity.valid || (!target.disabled && !target.validity.valid)) return;
  const d = {
    ...previous,
    name: form.elements.name.value,
    amount,
    target: value,
    month: Number(form.elements.previewMonth.value),
  };
  sessions.get(p).set(form.dataset.session, d);
  form.elements.previewMonth.style.setProperty('--time-fill', (d.month / 240) * 100 + '%');
  form.elements.previewMonth.setAttribute('aria-valuetext', d.month ? dateAt(p, d.month) : 'Today');
  render(form.querySelector('[data-goal-preview]'), goalSessionPreview(p, d));
  render(form.querySelector('[data-goal-summary]'), goalSummary(p, d));
  form.querySelector('[data-goal-insight]').textContent = words(p, d, goalSessionModel(p, d));
}
