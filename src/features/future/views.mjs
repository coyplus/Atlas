import { isFutureBeginning, futureBeginning } from './beginning.mjs';
import { moneySpeedModel } from './money-speed.mjs';
import { displayDate } from '../../domain/dates.mjs';
import { esc, icon, button } from '../../design-system/templates.mjs';
import { cash, dateAt, clone, potRate } from '../../domain/money.mjs';
import { horizonPossibilities, visiblePossibilities } from '../ideas/horizon.mjs';
import { potAppearance, appearanceStyle, potColours } from '../pots/appearance.mjs';
import { possibilities } from '../ideas/model.mjs';
import {
  HORIZON,
  forecast,
  futureState,
  planningPots,
  protectedGoal,
  role,
  glyph,
  when,
  movement,
  suggestIdeas,
  ideaDescription,
  toggleExperiment,
} from '../../domain/future.mjs';
const money = (n) => cash(Math.round(n));
const btn = (label, action, cls = 'text', extra = '') =>
  button(label, 'future-' + action, cls, extra);
const roundMoney = (n) => money(Math.round(n / 100) * 100);
export function futureModel(p, s) {
  const state = futureState(p),
    ideas = state.ideas;
  return {
    ghosts: visiblePossibilities(p, s),
    state,
    base: forecast(p, [], s.month),
    next: forecast(p, ideas, s.month),
    ideas,
  };
}
export function impact(p, base, next, limit = 2, preferred = []) {
  const goals = [
    ...next.goals,
    ...base.goals.filter((g) => !next.goals.some((n) => n.id === g.id)),
  ];
  goals.sort((a, b) => Number(preferred.includes(b.id)) - Number(preferred.includes(a.id)));
  const changes = goals
    .filter((g) => base.dates[g.id] !== next.dates[g.id] || !next.goals.some((n) => n.id === g.id))
    .map((g) =>
      !next.goals.some((n) => n.id === g.id)
        ? `${g.name} · removed from this plan`
        : `${g.name} · ${movement(base.dates[g.id], next.dates[g.id])}`,
    );
  if (changes.length) return changes.slice(0, limit).join(' · ');
  const delta = next.net - base.net,
    speed = next.speed - base.speed;
  if (Math.abs(delta) >= 1)
    return `${money(Math.abs(delta))} ${delta > 0 ? 'more' : 'less'} projected at this date`;
  if (Math.abs(speed) >= 1)
    return `${money(Math.abs(speed))}/month ${speed > 0 ? 'more' : 'less'} towards your future`;
  return 'Your milestone dates stay the same';
}
export function futureMoment(p, s, model = futureModel(p, s)) {
  const { next } = model,
    invested = next.goals.some((g) => g.growthAnnual) && s.month > 0;
  return `<button class="fg-date" data-action="future-assumptions"><small>${s.month ? dateAt(p, s.month) : 'Today'}</small><span class="future-age">${p.l1.customer.age + Math.floor(s.month / 12)}<em>years old</em></span></button><button class="fg-net" data-action="future-assumptions"><small>${s.month ? 'Projected net worth' : 'Net worth today'}</small><strong id="future-total">${s.month ? '~ ' : ''}${s.month ? roundMoney(next.net) : money(next.net)}</strong>${invested ? `<span class="fg-range">${roundMoney(next.range[0])}–${roundMoney(next.range[1])}</span>` : ''}</button>`;
}
const bubbleName = (g) =>
  ({
    'Family holiday': 'Holiday',
    'Emergency fund': 'Safety net',
    'Long-term savings': 'Savings',
    'Not decided yet': 'Undecided',
  })[g.name] || g.name;
export function futureField(p, s, model = futureModel(p, s)) {
  const { next } = model,
    unread = possibilities(p, s).filter((i) => i.isNew).length;
  return `<button class="fg-field-add" data-action="future-add" aria-label="Add a goal${unread ? ` · ${unread} new possibilities` : ''}">${icon('plus')}<span>Goal</span>${unread ? `<span class="possibility-count" aria-hidden="true">${unread}</span>` : ''}</button>${next.goals
    .map((g) => {
      const v = next.values[g.id],
        done = g.isDebt ? v === 0 : !!g.target && v >= g.target,
        a = potAppearance(p, g);
      return `<button style="${appearanceStyle(a)}" class="future-orbit ${a.photo ? 'has-photo' : ''} ${done ? 'is-complete' : ''}" id="future-bubble-${esc(g.id)}" data-action="future-goal:${esc(g.id)}" data-viz-role="${role(g) === 'savings' ? 'cash' : role(g)}" aria-label="${esc(g.name)}, ${money(v)}${g.target ? ', target ' + money(g.target) : ''}${done ? ', reached' : ''}">${g.target ? '<svg class="future-target" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="49" pathLength="100" /></svg>' : ''}<span class="future-value" aria-hidden="true">${a.photo ? `<img src="${esc(a.photo)}" alt="" draggable="false">` : ''}</span><span class="future-orbit-copy">${icon(glyph(g))}<b>${esc(bubbleName(g))}</b><span>${money(v)}</span>${done ? '<em>Reached</em>' : ''}</span></button>`;
    })
    .join(
      '',
    )} ${(model.ghosts || []).map((i) => `<button class="future-ghost" id="future-bubble-${esc(i.id)}" data-action="future-horizon:${esc(i.id)}" aria-label="AI possibility: ${esc(i.name)} · around ${dateAt(p, i.month)}"><span class="future-value" aria-hidden="true"></span><span class="future-orbit-copy">${icon('plus')}<b>${esc(i.shortName)}</b></span></button>`).join('')}<div class="future-zoom" aria-label="Chart zoom"><button data-chart="fit" aria-label="Fit all bubbles">Fit</button></div>`;
}
export function futureTicks(p, s, model = futureModel(p, s)) {
  const { next, base, ideas } = model,
    lanes = [];
  const entries = [
    ...next.goals
      .filter((g) => next.dates[g.id] != null)
      .map((g) => ({ g, month: next.dates[g.id] })),
    ...horizonPossibilities(p, s).map((g) => ({ g, month: g.month, ghost: true })),
  ];
  const ticks = entries
    .sort((a, b) => a.month - b.month)
    .map(({ g, month, ghost }) => {
      const x = (month / HORIZON) * 100;
      let lane = lanes.findIndex((last) => x - last > 9);
      if (lane < 0) lane = lanes.length;
      lanes[lane] = x;
      const done = !ghost && month <= s.month,
        changed = !ghost && ideas.length && base.dates[g.id] != null && base.dates[g.id] !== month;
      return `<button id="fg-tick-${esc(g.id)}" class="future-milestone ${ghost ? 'is-ghost' : ''} ${done ? 'is-complete' : ''}" data-action="future-${ghost ? 'horizon' : 'land'}:${esc(g.id)}" data-viz-role="${ghost ? 'cash' : role(g) === 'savings' ? 'cash' : role(g)}" style="left:${x}%;--lane:${lane};${ghost ? '' : appearanceStyle(potAppearance(p, g))}" aria-label="${ghost ? 'AI possibility: ' : ''}${esc(g.name)} · ${ghost ? 'around ' : ''}${when(p, month)}${changed ? ' · ' + movement(base.dates[g.id], month) : ''}">${icon(ghost ? 'plus' : glyph(g))}</button>${changed ? `<span id="fg-before-${esc(g.id)}" class="future-before" style="left:${(base.dates[g.id] / HORIZON) * 100}%" title="Previous date: ${when(p, base.dates[g.id])}"></span>` : ''}`;
    })
    .join('');
  return `<span class="future-milestone-space" aria-hidden="true" style="height:${Math.max(45, 34 + (lanes.length - 1) * 28)}px"></span>${ticks}`;
}
// The card carries the decision and its effect. Review carries the mechanics.
function ideaPreview(i) {
  if (i.kind === 'extra') return [`Save ${money(i.amount)} on payday`, 'An automatic Savings Rule'];
  if (i.kind === 'roundup')
    return ['Round up your spending', `${money(i.amount)}/month estimate · £30 cap`];
  if (i.kind === 'pause') return [`Pause for ${i.months} months`, 'Keep contributions in cash'];
  if (i.kind === 'priority') return [i.title, `Redirect ${money(i.amount)}/month`];
  if (i.kind === 'add') return [i.name, `${money(i.amount)}/month towards ${money(i.target)}`];
  return [i.title, i.why || 'Try a different future'];
}
export function futureIdeas(p, s, model = futureModel(p, s)) {
  const { state, base, next } = model,
    catalog = [
      ...suggestIdeas(p),
      ...state.ideas.filter((i) => !suggestIdeas(p).some((c) => c.id === i.id)),
    ];
  return `<div class="fg-ideas-head"><span>${icon('spark')} What if…</span><small>${state.ideas.length ? state.ideas.length + ' selected' : ''}</small></div><div class="fg-ideas" aria-label="Ideas to try">${catalog
    .map((i) => {
      let effect;
      try {
        const selected = state.ideas.some((x) => x.id === i.id);
        const candidate = clone(p);
        if (!selected) toggleExperiment(candidate, i);
        const result = selected ? next : forecast(candidate, futureState(candidate).ideas, s.month);
        effect = impact(p, base, result, i.kind === 'priority' ? 2 : 1, [i.goal, i.from]);
        if ((selected ? state.ideas : futureState(candidate).ideas).length > 1)
          effect = 'Together: ' + effect;
      } catch {
        effect = 'Review this idea';
      }
      const [title, detail] = ideaPreview(i);
      return `<button class="fg-idea" data-action="future-try:${esc(i.id)}" aria-pressed="${state.ideas.some((x) => x.id === i.id)}"><span><b>${esc(title)}</b><small>${esc(detail)}</small></span><i>${icon(state.ideas.some((x) => x.id === i.id) ? 'check' : 'plus')}</i><em>${esc(effect.replace(/(\d+)mo/g, '$1 months').replace(/(\d+)yr/g, '$1 years'))}</em></button>`;
    })
    .join('')}</div>`;
}
export function futureCommitments(p, s, model = futureModel(p, s)) {
  const { base, next, ideas } = model;
  const count = (m) => m.ruleCount;
  const changed = ideas.length && base.speed !== next.speed;
  return `<div class="future-commitments"><button class="fg-entry" data-action="future-speed"><span class="fg-entry-symbol">${icon('bolt')}</span><span><b>Money Speed</b><small>${count(base) !== count(next) ? count(base) + ' → ' : ''}${count(next)} Money Rules</small></span><strong>${changed ? `<del>${money(base.speed)}</del> ` : ''}${money(next.speed)}<small>/month</small></strong>${icon('chev')}</button></div>`;
}
export function futureScreen(p, s) {
  if (isFutureBeginning(p)) return futureBeginning(p, s);
  const model = futureModel(p, s),
    { state } = model;
  return `<div class="future-page future-studio" data-has-experiments="${!!state.ideas.length}" data-drawer="${state.drawer || 'timeline'}">
    <div class="future-universe" id="future-stage" tabindex="0" aria-label="Your goals and priorities. Pinch to zoom and drag to pan. Use plus or minus keys to zoom, or Home to fit.">${futureField(p, s, model)}</div>
    
    <section class="future-drawer" aria-label="Time Travel and your plan" data-state="${state.drawer || 'timeline'}">
      <button class="future-drawer-grip" data-drawer-to="toggle" aria-label="Expand future drawer" aria-expanded="false" aria-controls="future-drawer-body"><span></span></button>
      <div class="future-drawer-summary"><div class="fg-moment" id="fg-moment">${futureMoment(p, s, model)}</div>
        <div class="fg-travel"><div class="future-milestones" id="fg-ticks">${futureTicks(p, s, model)}</div><label class="sr-only" for="time-slider">Explore your future in months</label><div class="future-time-track" style="--time-progress:${(s.month / HORIZON) * 100}%;--time-inset:${38 - (38 * s.month) / HORIZON}px"><span class="future-time-fill" aria-hidden="true"><span class="future-starlight"></span></span><input type="range" id="time-slider" min="0" max="${HORIZON}" step="1" value="${s.month}" aria-valuetext="${s.month ? dateAt(p, s.month) : 'Today'}, age ${p.l1.customer.age + Math.floor(s.month / 12)}"></div></div>
      </div>
      <button class="future-drawer-invitation" data-drawer-to="expanded"><span>${icon('spark')} What if…</span><span>${state.ideas.length ? state.ideas.length + ' selected' : 'Try a change'} ${icon('chev')}</span></button>
      <div class="future-drawer-body" id="future-drawer-body" tabindex="-1">
        <div class="fg-secondary"><div id="future-ideas">${futureIdeas(p, s, model)}</div><div id="future-commitments">${futureCommitments(p, s, model)}</div></div>
        ${state.ideas.length ? `<footer class="fg-footer">${btn('Review before applying', 'review', 'primary wide')}</footer>` : ''}
      </div>
    </section>
  </div>`;
}
export function goalsEditor(p, s) {
  const { next } = futureModel(p, s);
  return `<div class="fg-detail fg-goals-editor"><p>Try a different balance between your goals. Your real plan stays unchanged until you approve.</p>${
    next.goals
      .map((g) => {
        const exists = p.l1.pots.some((pot) => pot.id === g.id);
        return `<section class="fg-goal-controls"><h3>${esc(g.name)}</h3>${protectedGoal(p, g) ? '<p class="support">Protected commitment · stays in place.</p>' : `<div>${exists ? btn('Contribution', 'adjust:' + g.id) + btn('Prioritise', 'priority:' + g.id) : '<small>New goal · not yet a Pot</small>'}${btn('Remove', 'remove:' + g.id)}</div>`}</section>`;
      })
      .join('') || '<p>No goals in your future yet.</p>'
  }${btn('Add a goal', 'add', 'secondary wide')}</div>`;
}
function futureMonthDate(p, month) {
  const date = new Date(p.l1.asOf + 'T12:00:00Z');
  date.setUTCMonth(date.getUTCMonth() + month, 1);
  return date.toISOString().slice(0, 10);
}
export function speedDetail(p, s) {
  const model = moneySpeedModel(p, s),
    q = model.next.person;
  let cursor = 0;
  const stops = model.active
    .map(({ goal, amount }) => {
      const from = cursor;
      cursor += (amount / model.total) * 100;
      return `${potColours[potAppearance(p, goal).colour][1]} ${from}% ${cursor}%`;
    })
    .join(',');
  return `<div class="fg-detail fg-speed-detail"><span class="eyebrow">YOUR MONTHLY MOMENTUM</span><h2>Your future in motion.</h2><p>${s.month ? esc(displayDate(futureMonthDate(p, s.month))) : 'Today'} · Your next month’s planned contributions</p>
    <div class="fg-speed-ring" style="--speed-ring:${stops ? `conic-gradient(${stops})` : 'var(--line)'}" role="img" aria-label="${esc(model.active.map((x) => x.goal.name + ': ' + money(x.amount) + ' a month').join(', ') || 'No monthly contributions yet')}"><div><strong>${money(model.total)}</strong><span>each month</span><small>${model.active.length} ${model.active.length === 1 ? 'goal' : 'goals'} in motion</small></div></div>
    <div class="fg-speed-key">${model.active.map(({ goal, amount }) => `<button data-action="future-goal:${esc(goal.id)}" style="${appearanceStyle(potAppearance(p, goal))}"><i></i><span>${esc(goal.name)}</span><b>${money(amount)}</b></button>`).join('')}</div>
    <article class="fg-speed-insight"><span class="fg-ai-label">${icon('spark')} HSBC AI</span><h3>${esc(model.insight)}</h3><p>${esc(model.idea)}</p>${btn('Explore a different pace', 'chat', 'text')}</article>
    <h3 class="fg-speed-rules-heading">Your contributions</h3><div class="fg-flow">${
      model.allocations
        .map((x) => x.goal)
        .map(
          (g) =>
            `<button class="fg-flow-row" data-action="future-goal:${esc(g.id)}" data-viz-role="${role(g)}"><i>${icon(glyph(g))}</i><span><b>${esc(g.name)}</b><small>${protectedGoal(q, g) ? 'Protected commitment' : q.l1.rules.some((r) => r.potId === g.id && r.resumeOn && r.resumeOn > futureMonthDate(p, s.month)) ? 'Scheduled pause · resumes ' + esc(q.l1.rules.find((r) => r.potId === g.id && r.resumeOn && r.resumeOn > futureMonthDate(p, s.month)).resumeOn) : q.l1.rules.some((r) => r.potId === g.id && (r.amountIsAverage || r.condition)) ? 'Includes estimated or conditional contributions' : !model.next.rates[g.id] ? 'No contribution at this date' : 'Agreed Money Rules'}</small></span><strong>${money(Math.abs(model.next.rates[g.id] || 0))}</strong></button>`,
        )
        .join('') || '<p>Your first Money Rule will appear here.</p>'
    }</div><p class="support">Monthly amounts include estimated round-ups and conditional rules where present. Actual contributions can vary. Standing watches do not move money.</p>${btn('See all Money Rules', 'rules', 'text wide')}</div>`;
}
export function assumptions(p, s) {
  const m = futureModel(p, s);
  return `<div class="fg-detail future-explainer"><p class="eyebrow">YOUR FUTURE, EXPLAINED</p><h2>A view of what could be.</h2><p>Based on your Pots, borrowing and Money Rules on ${esc(displayDate(p.l1.asOf))}.</p>
    <h3>Read the picture</h3><p>Solid circles show balances; dotted circles show targets on the same scale. Grey possibilities are ideas, with no money attached. They join the projection only when you make them real.</p><p>Pinch to zoom and drag to explore. Labels appear when there is room and stay the same size. With a keyboard, use + or − to zoom and Home to fit.</p>
    <h3>What’s included</h3><div class="fg-facts"><span>Cash and balances<b>Included in net worth</b></span><span>Everyday budgets<b>Included, outside the bubbles</b></span><span>Completed goals<b>Stay saved until you spend them</b></span></div>
    <h3>Investment outcomes can vary</h3><p>The central estimate uses your illustrative growth assumption. The range explores −2% to +8% annual growth. It is a set of scenarios, not a confidence interval or guarantee. Outcomes can fall outside it, including losses.</p>
    <details class="terms"><summary>Projection assumptions</summary><p>These are nominal values. Inflation, tax, fees, product interest and changes to earnings or spending are not modelled.</p><p>Current-account allocations assume future income can fund them. Paused contributions, and money released when a Rule stops at its target or a loan is repaid, stay in cash unless redirected. Rules from other Pots transfer existing balances.</p><p>Conditional Rules assume their condition is met. Round-ups use their stated monthly estimate and cap. Personal colours and photos identify Pots; “Reached” marks a completed target or repaid loan.</p></details>
    <p class="support">AI ideas, conversations and life-stage prompts are simulated for this prototype, not based on peer data. No real bank is connected.</p>${btn('Back to my future', 'dismiss', 'primary wide')}<span class="sr-only">${money(m.next.net)}</span></div>`;
}
export function review(p, s) {
  const f = futureState(p),
    base = forecast(p),
    next = forecast(p, f.ideas),
    difference = next.speed - base.speed,
    firstGoal = next.goals.find((g) => f.ideas.some((i) => i.goal === g.id)) || next.goals[0],
    colour = appearanceStyle(potAppearance(p, firstGoal || { name: 'Future' })),
    effect = impact(p, base, next, 8).replace(/(\d+)mo/g, '$1 months'),
    investment = f.ideas.some((i) => i.authored?.effect?.newPot?.growthAnnual),
    extra = f.ideas.some((i) => ['extra', 'add', 'roundup'].includes(i.kind));
  return `<div class="fg-detail fg-plan-review" style="${colour}">
    <header class="fg-review-heading"><span class="fg-ai-label">${icon('spark')} Your plan, made practical</span><h2>Make this<br>future yours.</h2></header>
    <section class="fg-review-summary" aria-label="Monthly commitment">
      <span class="fg-review-summary-label">Your monthly plan from today</span>
      <div class="fg-review-amounts">${difference ? `<span class="fg-review-before">${money(base.speed)}</span>${icon('arrow')}` : ''}<strong>${money(next.speed)}<small>/month</small></strong></div>
      <span class="fg-review-difference">${difference ? `${money(Math.abs(difference))} ${difference > 0 ? 'more towards your goals' : 'less committed each month'}` : 'Your total monthly commitment stays the same'}</span>
    </section>
    <div class="fg-review-list">${f.ideas
      .map((i) => {
        const g = next.goals.find((g) => g.id === i.goal) || firstGoal;
        return `<article><span class="fg-review-rule-icon" style="${appearanceStyle(potAppearance(p, g || { name: i.name || 'Future' }))}">${icon(g ? glyph(g) : 'target')}</span><div><b>${esc(i.title)}</b><p>${esc(ideaDescription(p, i))}</p></div></article>`;
      })
      .join('')}</div>
    <aside class="fg-review-impact">${icon('trend')}<div><small>Projected impact</small><strong>${esc(effect)}</strong></div></aside>
    <footer class="fg-review-approval"><label class="fg-confirm"><input id="future-approval" type="checkbox"><span>I’ve reviewed ${investment ? 'the illustrative investment plan with Maya and ' : ''}the changes${extra ? ' and the extra contributions fit my budget' : ''}.</span></label>${btn('Apply to my plan', 'commit', 'primary wide')}<p class="fg-review-assurance">Protected commitments stay in place.<br>Changes stay in this demo. You can undo them.</p>${btn('Keep experimenting', 'dismiss', 'text wide')}</footer>
  </div>`;
}
export function chatDetail(p) {
  const f = futureState(p),
    g =
      planningPots(p).find((g) => /home|house/i.test(g.name)) ||
      planningPots(p).find((g) => g.target);
  return `<div class="fg-detail fg-conversation"><span class="fg-ai-label">${icon('spark')} Imagine with HSBC AI</span><h2>What’s on<br>your mind?</h2><p>Try a thought. See where it takes you.</p><div class="fg-chat-messages" aria-live="polite">${f.messages.map((m) => `<p class="fg-message ${m.role}">${esc(m.text)}</p>`).join('') || `<p class="fg-message ai">For example, “What if I pause my ${esc(g?.name || 'goal')} contributions for six months?”</p>`}</div>${f.proposal ? `<article class="fg-proposal"><b>${esc(f.proposal.title)}</b><p>${esc(ideaDescription(p, f.proposal))}</p>${btn('Try this idea', 'proposal', 'primary wide')}</article>` : ''}<form id="future-chat-form"><label class="field">Your idea<input name="message" id="future-chat-input" maxlength="300" required placeholder="What if I…" autocomplete="off"></label><button class="btn primary wide" type="submit">Explore this thought</button></form><small class="support">Simulated AI · refine an amount or pause duration in your next message.</small></div>`;
}
export function possibilityDiscovery(p, s) {
  const items = possibilities(p, s);
  return `<div class="fg-detail possibility-discovery">
    <span class="fg-ai-label">${icon('spark')} Imagine with HSBC AI</span>
    <h2>What could<br>come next?</h2>
    <p>A few possibilities from your picture. See what feels like you.</p>
    <div class="possibility-own-link">${btn('Create my own', 'own', 'text')} ${icon('arrow')}</div>
    <div class="possibility-list">${
      items
        .map(
          (i) => `<article class="possibility-card" data-viz-role="${i.role}">
      <button class="possibility-open" data-action="future-possibility:${esc(i.id)}">
        <span class="possibility-art" aria-hidden="true">${icon('plus')}</span>
        <span class="possibility-copy"><small>${esc(i.source)}</small><strong>${esc(i.title)}</strong><span>${esc(i.why)}</span><b>Imagine this ${icon('arrow')}</b></span>
      </button><button class="possibility-dismiss icon-btn" data-action="future-hide-possibility:${esc(i.id)}" aria-label="Dismiss ${esc(i.title)}">${icon('close')}</button>
    </article>`,
        )
        .join('') || '<p class="possibility-empty">Space for an idea that’s entirely yours.</p>'
    }</div>
    <div class="possibility-own"><small>Personalised ideas · simulated AI</small></div>
  </div>`;
}
export function addDetail(i = null, p = null) {
  if (i?.month && p) return horizonDetail(p, i);
  return `<div class="fg-detail possibility-detail" ${i ? `data-possibility="${esc(i.id)}" data-viz-role="${i.role}"` : ''}>
    ${i ? `<span class="possibility-art" aria-hidden="true">${icon('plus')}</span><span class="fg-ai-label">${esc(i.source)}</span>` : `<span class="fg-ai-label">${icon('spark')} A future that feels like you</span>`}
    <h2>${esc(i?.prompt || 'What would you love to make possible?')}</h2>
    <p>${esc(i?.why || 'Start with something that matters to you. You can try it before deciding.')}</p>
    <form id="future-add-form" data-make-real="false" ${i ? `data-possibility="${esc(i.id)}"` : ''}>
      <label class="field">${i ? 'Give this possibility a name' : 'Something to look forward to'}<input name="name" required maxlength="60" value="${esc(i?.name || '')}" placeholder="A place by the sea"></label>
      ${i ? '<section class="possibility-numbers" aria-label="Shape the numbers"><h3>Shape the numbers <span>Optional to adjust</span></h3><p>Keep these starting figures or choose your own.</p>' : ''}
      <div class="possibility-number-fields"><label class="field">${i?.investment ? 'A milestone to explore' : 'Your target'} (£)<input name="target" type="number" min="1" max="10000000" step="1" required value="${i?.target || 3000}" inputmode="numeric"></label>
      <label class="field">Each month (£)<input name="amount" type="number" min="1" max="10000" step="1" required value="${i?.amount || 50}" inputmode="numeric"></label></div>
      ${i ? '</section>' : ''}
      <p class="support">${i?.investment ? 'Illustrative investment: 5% annual growth, with a range of outcomes. You could get back less than you put in. This does not open an investment account.' : 'Explore a monthly Money Rule from your current account. Review how it fits alongside your existing commitments before applying.'}</p>
      <button type="submit" class="btn primary wide">Try this in my future</button>
    </form>
    ${i ? btn('Create my own instead', 'own', 'text wide') : ''}
  </div>`;
}
export function adjustDetail(p, id, priority = false) {
  const g = p.l1.pots.find((g) => g.id === id);
  if (!g) return '<p>Add this goal to your plan before adjusting its rule.</p>';
  const eligible = planningPots(p).filter(
    (x) => x.id !== id && !protectedGoal(p, x) && potRate(p, x) > 0,
  );
  return `<div class="fg-detail"><h2>${priority ? 'A little more focus.' : 'A little more momentum.'}</h2><p>${esc(g.name)}</p>${priority && !eligible.length ? '<p>There are no other flexible contributions to move. Your protected commitments stay in place.</p>' : `<form id="future-adjust-form" data-goal="${esc(id)}" data-priority="${priority}">${priority ? `<label class="field">Move a contribution from<select name="from">${eligible.map((x) => `<option value="${esc(x.id)}">${esc(x.name)} · ${money(potRate(p, x))}/month</option>`).join('')}</select></label>` : ''}<label class="field">${priority ? 'Redirect each month' : 'Add each month'} (£)<input name="amount" required type="number" min="1" max="10000" value="25" step="1" inputmode="numeric"></label><p class="support">${priority ? 'Moves this amount between your existing Money Rules. No extra monthly funding.' : 'This is extra funding from your current account. Check your budget before committing.'}</p><button class="btn primary wide" type="submit">Watch my future change</button></form>`}</div>`;
}

export function horizonDetail(p, i) {
  return `<div class="fg-detail possibility-detail horizon-detail" data-possibility="${esc(i.id)}">
    <div class="horizon-content">
      <div class="horizon-when">${icon('plus')}<span>Around ${dateAt(p, i.month)} · age ${i.age}</span></div>
      <form id="future-add-form" data-make-real="true" data-possibility="${esc(i.id)}">
        <label class="horizon-name"><span class="sr-only">Goal name</span><input name="name" required maxlength="60" value="${esc(i.shortName || i.name)}" aria-describedby="horizon-reason">${icon('edit')}</label>
        <p class="horizon-reason" id="horizon-reason">${esc(i.why)}</p>
        <section class="possibility-numbers" aria-label="Shape the numbers">
          <h3>Shape the numbers <span>Optional to adjust</span></h3>
          <div class="possibility-number-fields">
            <label class="field">Your target (£)<input name="target" type="number" min="1" max="10000000" step="1" required value="${i.target}" inputmode="numeric"></label>
            <label class="field">Each month (£)<input name="amount" type="number" min="1" max="10000" step="1" required value="${i.amount}" inputmode="numeric"></label>
          </div>
        </section>
      </form>
    </div>
    <footer class="horizon-actions">
      <p>Creates a Pot and monthly Money Rule from today. You can undo this.</p>
      <div class="horizon-decisions"><button type="submit" form="future-add-form" class="btn primary">Make it real</button>${btn('Not for me', 'horizon-hide:' + i.id, 'text')}</div>
    </footer>
  </div>`;
}
