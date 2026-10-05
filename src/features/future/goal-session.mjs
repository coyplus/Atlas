import { timeTravel } from './time-travel.mjs';
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
    ...(draft.lockYears ? { lockYears: draft.lockYears } : {}),
    title: 'Your monthly contribution',
  };
  const next = forecast(p, [idea], draft.month);
  return {
    value: next.values[idea.goal],
    reached: next.dates[idea.goal],
    range: next.goalRanges[idea.goal],
    idea,
  };
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
    title: d.lockYears
      ? `Set this money aside until ${dateAt(p, 36)}. Would that leave enough accessible for everyday life?`
      : d.edited
        ? `${money(d.amount)} a month. Try a different pace and see what feels right for you.`
        : 'Start with a monthly amount. See where it could take you.',
    singleMessage: true,
    message: [d.why, words(p, d, goalSessionModel(p, d))].filter(Boolean).join(' '),
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
      : d.lockYears
        ? 'The locked savings illustration uses 5% AER for three years, compounded monthly. No further interest is assumed after maturity. You can keep contributing, but withdrawals are locked until maturity. This is an illustrative rate, not a product offer.'
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
  const reference = d.amount * 12;
  const diameter = (value) => 80 * Math.sqrt(Math.max(0, value) / reference);
  return `<div class="goal-session-scene" data-investment="${d.investment}">
    <div class="goal-growth-stage"><div class="goal-reference" style="width:${diameter(reference)}px;height:${diameter(reference)}px"><span><small>1 year</small><b>${money(reference)}</b></span></div><div class="goal-session-orbit" style="width:${diameter(m.value)}px;height:${diameter(m.value)}px"></div><div class="goal-session-orbit-copy" data-light="${diameter(m.value) < 145}">${icon(d.investment ? 'trend' : d.glyph || 'target')}<small>${d.month ? 'You could have' : 'Starting here'}</small><strong>${money(m.value)}</strong></div></div>


  </div>`;
}

function goalMoment(p, d) {
  const m = goalSessionModel(p, d);
  const contribution = Math.min(
    d.amount * d.month,
    d.target && !d.investment ? d.target : Infinity,
  );
  return `<div class="goal-session-date"><div><small>${d.month ? dateAt(p, d.month) : 'Today'}</small><strong>${p.l1.customer.age + Math.floor(d.month / 12)} <span>years old</span></strong></div><div class="goal-session-arrival"><small>${d.investment ? 'Illustrative range' : 'You put in'}</small><b>${d.investment ? money(m.range[0]) + '–' + money(m.range[1]) : money(contribution)}</b></div></div>`;
}
export function goalSession(p, i = null, makeReal = false) {
  const d = {
    name: i?.shortName || i?.name || '',
    target: 0,
    amount: i?.amount || 50,
    month: Math.min(240, i?.month || Math.ceil((i?.target || 3000) / (i?.amount || 50))),
    investment: !!i?.investment,
    glyph: i?.glyph || 'target',
    why: i?.why || '',
  };
  const cashPreview = goalSessionModel(p, { ...d, investment: false });
  const investmentPreview = goalSessionModel(p, { ...d, investment: true });
  const lockedPreview = goalSessionModel(p, { ...d, investment: false, lockYears: 3 });
  if (!sessions.has(p)) sessions.set(p, new Map());
  sessions.get(p).set(i?.id || 'own', d);
  return `<div class="goal-session" ${i ? `data-possibility="${esc(i.id)}"` : ''}>
    <form id="future-add-form" data-session="${esc(i?.id || 'own')}" data-make-real="${makeReal}" ${i ? `data-possibility="${esc(i.id)}"` : ''}>
      <div class="goal-session-hero">
      <header class="goal-session-heading"><label class="sr-only" for="goal-name">Goal name</label><div class="goal-name-field"><input id="goal-name" name="name" required maxlength="60" placeholder="Something you’d love to do" value="${esc(d.name)}" autocomplete="off"><button type="button" class="goal-name-edit" data-action="future-rename" aria-label="Edit goal name">${icon('edit')}</button></div></header>
      <div data-goal-preview>${goalSessionPreview(p, d)}</div>
      <section class="goal-session-controls possibility-numbers" aria-label="Shape this future"><div class="goal-session-fields"><label class="field">Monthly contribution (£)<input name="amount" type="number" required min="1" max="10000" step="1" value="${d.amount}" inputmode="numeric"></label><label class="field">Target (£)<input name="target" type="number" min="1" max="10000000" step="1" value="" placeholder="No target" inputmode="numeric"></label></div></section>
      </div>
      <div class="goal-session-panel">
      <section class="goal-session-time" aria-label="Time Travel"><div data-goal-moment>${goalMoment(p, d)}</div>${timeTravel({ id: 'goal-time', name: 'previewMonth', month: d.month, label: dateAt(p, d.month) })}</section>
      <section class="goal-what-if" aria-label="What if"><h3>What if…</h3><div class="goal-paths"><label><input type="radio" name="approach" value="cash" ${!d.investment && !d.lockYears ? 'checked' : ''}><span>${icon('target')}<b>Keep it in an ISA</b><small>Build up cash, with access when needed</small><strong data-whatif-cash>${money(cashPreview.value)}</strong></span></label><label><input type="radio" name="approach" value="investment" ${d.investment ? 'checked' : ''}><span>${icon('trend')}<b>Explore a first investment</b><small>See how a fund could grow over time</small><strong data-whatif-investment>${money(investmentPreview.range[0])}–${money(investmentPreview.range[1])}</strong></span></label><label><input type="radio" name="approach" value="locked" ${d.lockYears ? 'checked' : ''}><span>${icon('target')}<b>Lock it away for 3 years</b><small>5% AER fixed · illustrative. Locked until ${dateAt(p, 36)}.</small><strong data-whatif-locked>${money(lockedPreview.value)}</strong></span></label></div><p>Illustrations at your selected date. ISA: no interest assumed. Locked savings: 5% AER for 3 years, then no further interest assumed; ISA eligibility and allowances not modelled. Fund: −2% to 8% annual growth, not a forecast or a limit on losses.</p></section>
      <footer class="goal-session-footer"><button type="submit" class="btn primary wide">${makeReal ? 'Make it real' : 'Try this in my future'}</button>${i ? button(makeReal ? 'Not for me' : 'Create my own instead', makeReal ? 'future-horizon-hide:' + i.id : 'future-own', 'text wide') : ''}</footer>
      </div>
    </form>
  </div>`;
}
export function updateGoalSession(p, form, render) {
  const previous = sessions.get(p)?.get(form.dataset.session);
  if (!previous) return;
  const target = form.elements.target;
  const amount = Number(form.elements.amount.value);
  const value = target.value === '' ? 0 : Number(target.value);
  if (!form.elements.amount.validity.valid || !target.validity.valid) return;
  const d = {
    ...previous,
    edited: true,
    investment: form.elements.approach.value === 'investment',
    lockYears: form.elements.approach.value === 'locked' ? 3 : undefined,
    name: form.elements.name.value,
    amount,
    target: value,
    month: Number(form.elements.previewMonth.value),
  };
  sessions.get(p).set(form.dataset.session, d);
  const track = form.querySelector('.future-time-track');
  track.style.setProperty('--time-progress', (d.month / 240) * 100 + '%');
  track.style.setProperty('--time-inset', 38 - (38 * d.month) / 240 + 'px');
  form.elements.previewMonth.setAttribute('aria-valuetext', d.month ? dateAt(p, d.month) : 'Today');
  render(form.querySelector('[data-goal-preview]'), goalSessionPreview(p, d));
  render(form.querySelector('[data-goal-moment]'), goalMoment(p, d));
  form.querySelector('[data-whatif-cash]').textContent = money(
    goalSessionModel(p, { ...d, investment: false, lockYears: undefined }).value,
  );
  form.querySelector('[data-whatif-locked]').textContent = money(
    goalSessionModel(p, { ...d, investment: false, lockYears: 3 }).value,
  );
  const range = goalSessionModel(p, { ...d, investment: true, lockYears: undefined }).range;
  form.querySelector('[data-whatif-investment]').textContent =
    money(range[0]) + '–' + money(range[1]);
}
