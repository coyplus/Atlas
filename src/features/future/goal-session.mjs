import { esc, icon, button } from '../../design-system/templates.mjs';
import { cash, dateAt } from '../../domain/money.mjs';
import { forecast } from '../../domain/future.mjs';

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
    title: d.edited
      ? `${money(d.amount)} a month. Try a different pace and see what feels right for you.`
      : d.why ||
        'A little more freedom, a place of your own, or time to learn. What would you make room for?',
    singleMessage: true,
    message: words(p, d, goalSessionModel(p, d)),
    cta: 'Explore this together',
    action: 'support:discuss',
  };
}
export function goalSessionReply(p, context, text) {
  const d = sessions.get(p)?.get(context.kind === 'possibility' ? context.id : 'own');
  if (!d) return null;
  if (/idea|suggest|inspir|name/i.test(text) && !/£/.test(text))
    return `${d.why || 'Think about what this money would make possible in your life.'} You could name it after that moment, rather than an amount. Start with a monthly contribution that leaves room for everyday life, then use Time Travel to explore the pace. Nothing is committed until you choose.`;
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
  const reached = d.target && m.value >= d.target;
  return `<div class="goal-session-scene" data-investment="${d.investment}">
    <div class="goal-session-orbit ${reached ? 'is-reached' : ''}" style="--goal-fill:${fill}"><div class="goal-session-fill"></div><div class="goal-session-orbit-copy">${icon(d.glyph || 'target')}<small>${d.month ? 'You could have' : 'Your starting point'}</small><strong>${money(m.value)}</strong><span>${d.target ? `${reached ? 'Target reached' : money(d.target) + ' target'}` : 'Room to keep growing'}</span></div></div>
  </div>`;
}
function goalMoment(p, d) {
  const m = goalSessionModel(p, d);
  return `<div class="goal-session-date"><div><small>${d.month ? dateAt(p, d.month) : 'Today'}</small><strong>${p.l1.customer.age + Math.floor(d.month / 12)} <span>years old</span></strong></div><div class="goal-session-arrival"><small>${d.target ? 'Target in reach' : 'Your direction'}</small><b>${d.target ? (m.reached == null ? 'Beyond 20 years' : dateAt(p, m.reached)) : 'Keep growing'}</b></div></div>`;
}
export function goalSession(p, i = null, makeReal = false) {
  const d = {
    name: i?.shortName || i?.name || '',
    target: i?.target || 3000,
    amount: i?.amount || 50,
    month: Math.min(240, i?.month || Math.ceil((i?.target || 3000) / (i?.amount || 50))),
    investment: !!i?.investment,
    glyph: i?.glyph || 'target',
    why: i?.why || '',
  };
  if (!sessions.has(p)) sessions.set(p, new Map());
  sessions.get(p).set(i?.id || 'own', d);
  return `<div class="goal-session" ${i ? `data-possibility="${esc(i.id)}"` : ''}>
    <form id="future-add-form" data-session="${esc(i?.id || 'own')}" data-make-real="${makeReal}" ${i ? `data-possibility="${esc(i.id)}"` : ''}>
      <header class="goal-session-heading"><label for="goal-name">Goal name <span>Tap to rename ${icon('edit')}</span></label><input id="goal-name" name="name" required maxlength="60" placeholder="Something you’d love to do" value="${esc(d.name)}" autocomplete="off"></header>
      <div data-goal-preview>${goalSessionPreview(p, d)}</div>
      <div class="goal-session-panel">
      <section class="goal-session-time" aria-label="Time Travel"><div data-goal-moment>${goalMoment(p, d)}</div><label class="goal-time-heading" for="goal-time">Time Travel <span>Explore a different moment</span></label><input id="goal-time" style="--time-fill:${(d.month / 240) * 100}%" name="previewMonth" type="range" min="0" max="240" step="1" value="${d.month}" aria-label="Preview months from today" aria-valuetext="${dateAt(p, d.month)}"><div class="goal-time-labels"><span>Today</span><span>10 years</span><span>20 years</span></div></section>
      <section class="goal-session-controls possibility-numbers" aria-label="Shape this future"><div class="goal-session-fields"><label class="field">Each month (£)<input name="amount" type="number" required min="1" max="10000" step="1" value="${d.amount}" inputmode="numeric"></label><label class="field">Your target (£)<input name="target" type="number" required min="1" max="10000000" step="1" value="${d.target}" inputmode="numeric"></label></div><label class="goal-open-ended"><input type="checkbox" name="openEnded"> I don’t have a target yet</label></section>
      <details class="goal-session-assumptions"><summary>What this preview assumes</summary><p>${d.investment ? 'An illustrative 5% annual investment growth assumption. Actual returns vary and may be negative; you could get back less than you put in. Contributions continue beyond your milestone.' : 'Monthly contributions from today, with no interest assumed for this new Pot. If you set a target, contributions stop when it is reached.'} It uses the same projection as Future. Check that the monthly amount fits alongside your existing commitments.</p></details>
      <footer class="goal-session-footer"><button type="submit" class="btn primary wide">${makeReal ? 'Make it real' : 'Try this in my future'}</button><p>${makeReal ? 'Creates a Pot and monthly Money Rule from today. You can undo this.' : 'Adds a preview to Future. Review it alongside your other plans before committing.'}</p>${i ? button(makeReal ? 'Not for me' : 'Create my own instead', makeReal ? 'future-horizon-hide:' + i.id : 'future-own', 'text wide') : ''}</footer>
      </div>
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
    edited: true,
    name: form.elements.name.value,
    amount,
    target: value,
    month: Number(form.elements.previewMonth.value),
  };
  sessions.get(p).set(form.dataset.session, d);
  form.elements.previewMonth.style.setProperty('--time-fill', (d.month / 240) * 100 + '%');
  form.elements.previewMonth.setAttribute('aria-valuetext', d.month ? dateAt(p, d.month) : 'Today');
  render(form.querySelector('[data-goal-preview]'), goalSessionPreview(p, d));
  render(form.querySelector('[data-goal-moment]'), goalMoment(p, d));
}
