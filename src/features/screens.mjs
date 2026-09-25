import { isEarlyPortrait, portraitBeginning } from './you/beginning.mjs';
import { companionEntry } from './companion/view.mjs';
import { futureScreen as futureStudio } from './future/views.mjs';
import { journeyEntry } from './journey/views.mjs';
import { pointsEntry } from './badges/views.mjs';
import { membershipEntry } from './membership/views.mjs';
import { checkinEntry } from './checkin/views.mjs';
import { portraitComponent } from './you/portrait-view.mjs';
import { newNumberIdeas } from '../domain/number-visuals.mjs';
import { numberGridVacancy } from './now/grid.mjs';
import { storyPlate } from './stories/model.mjs';
import { collectionCount } from './accounts/accounts.mjs';
import { shortcutBar } from './now/actions.mjs';
import { agentAvatar, householdAvatar } from '../design-system/templates.mjs';
import {
  current,
  totals,
  cash,
  dateAt,
  potRate,
  milestone,
  valueAt,
  previewPerson,
} from '../domain/money.mjs';
import { moduleModel, aiMessage, potIcons } from '../domain/numbers.mjs';
import {
  esc,
  icon,
  logo,
  button,
  section,
  rows,
  progress,
  moduleCard,
  moneyHTML,
} from '../design-system/templates.mjs';
export function companion(p, s) {
  if (s.direction === 'vanilla') return '';
  const m = aiMessage(p, s.tab, s.month);
  return `<aside class="ai-card"><div class="ai-heading"><span class="ai-symbol">${p.l1.customer.id === 'elena' && s.tab === 'now' ? 'P' : icon('spark')}</span><span>${p.l1.customer.id === 'elena' && s.tab === 'now' ? 'Priya · Relationship Manager' : 'AI · Here for you'}</span><button class="icon-btn" data-action="chat" aria-label="Open conversation">${icon('arrow')}</button></div><h2>${esc(m.title)}</h2><p>${esc(m.message)}</p>${button(m.cta, m.action, 'ai-link')}</aside>`;
}
export function quickActions() {
  return `<nav class="quick-actions" aria-label="Everyday banking">${[
    ['Pay', 'up', 'pay'],
    ['Transfer', 'swap', 'transfer'],
    ['Add money', 'plus', 'addmoney'],
    ['More', 'grid', 'collection'],
  ]
    .map(([t, i, a]) => `<button data-action="${a}"><span>${icon(i)}</span>${t}</button>`)
    .join('')}</nav>`;
}
export function storyTiles(p, s) {
  return `<div class="stories">${p.l2.stories.map((st) => `<button class="story-tile ${st.state}" data-action="story:${esc(st.id)}" style="--story-image:url('${storyPlate(st.id)}')"><span class="story-state">${st.state === 'saved' ? 'In place' : p.ui.storyVisits?.[st.id]?.declinedAt ? 'Not now' : p.ui.storyVisits?.[st.id]?.read ? 'Read' : st.state === 'new' ? 'New story' : 'For you'}</span><span class="story-title">${esc(st.title)}</span><span class="story-summary">${esc(st.state === 'saved' ? st.residue : st.claim)}</span><span class="story-arrow">${icon('arrow')}</span></button>`).join('')}</div>`;
}
export function nowScreen(p, s, data) {
  const cards = p.ui.order.map((id, i) =>
    moduleCard(moduleModel(p, id, data.shared.modules), p.ui.sizes[id] || 'S', s.edit, i),
  );
  if (s.direction === 'vanilla') {
    const slot = numberGridVacancy(p.ui.order.map((id) => p.ui.sizes[id] || 'S'));
    const addNumber = `<button class="add-module ${slot ? '' : 'add-number-entry'}" data-action="gallery" ${slot ? `style="grid-row:${slot.row};grid-column:${slot.column}"` : ''}><span class="add-number-label">${icon('plus')}<span>Add a number</span></span>${newNumberIdeas(p) ? `<span class="number-ideas-badge" aria-label="${newNumberIdeas(p)} new AI number ideas">${icon('assistant')}${newNumberIdeas(p)} new</span>` : ''}</button>`;
    return `<div class="now-page">${shortcutBar(p)}${section('My numbers', 'customise', s.edit ? 'Done' : 'Customise')}<span id="number-grid-announcement" class="sr-only" role="status" aria-live="polite"></span><div class="module-grid ${s.edit ? 'editing' : ''}">${cards.join('')}${slot ? addNumber : ''}</div>${slot ? '' : addNumber}<button class="now-entry pots-entry" data-action="collection">${icon('wallet')}<span>All accounts and pots · ${collectionCount(p)}</span>${icon('chev')}</button>${section('My stories')}${storyTiles(p, s)}<button class="now-entry products-entry" data-action="products">${icon('grid')}<span>All HSBC products</span>${icon('chev')}</button></div>`;
  }
  const lead = cards.shift() || '';
  const widgets = `${section('What you hold', 'customise', s.edit ? 'Done' : 'Customise')}<div class="module-grid ${s.edit ? 'editing' : ''}">${cards.join('')}<button class="add-module" data-action="gallery"><span class="add-number-label">${icon('plus')}<span>Add a number</span></span>${newNumberIdeas(p) ? `<span class="number-ideas-badge" aria-label="${newNumberIdeas(p)} new AI number ideas">${icon('assistant')}${newNumberIdeas(p)} new</span>` : ''}</button></div>`;
  // Each composition uses the same models/actions. Presentation is free to differ.
  const primary =
    s.direction === 'bento'
      ? `<div class="lead-number">${lead}</div>${companion(p, s)}${quickActions()}`
      : s.direction === 'metro'
        ? `${companion(p, s)}<div class="lead-number">${lead}</div>${quickActions()}`
        : `${companion(p, s)}<div class="lead-number">${lead}</div>${quickActions()}`;
  return `<div class="now-page">${primary}${widgets}${section('Your stories')}${storyTiles(p, s)}<button class="collection-link" data-action="collection">${icon('wallet')}<span><b>Pots & accounts</b><small>Everything, in one place</small></span>${icon('arrow')}</button></div>`;
}
export function potRow(p, pot, month = 0) {
  const m = milestone(p, pot);
  return `<button class="pot-row" data-action="pot:${esc(pot.id)}"><span class="pot-icon">${icon(potIcons[pot.id] || (pot.growthAnnual ? 'trend' : 'wallet'))}</span><span class="pot-row-text"><b>${esc(pot.name)}</b><small>${pot.isDebt ? 'Left to repay' : pot.target ? 'of ' + cash(pot.target) : 'Open-ended'}${m !== null ? ' · ' + dateAt(p, m) : ''}</small>${pot.target ? progress(valueAt(p, pot, month) / pot.target, pot.name) : ''}</span><span class="pot-row-value">${cash(valueAt(p, pot, month))}<small>${cash(Math.abs(potRate(p, pot)))}/mo</small></span></button>`;
}
export function futureChart(p, s) {
  return `<div class="chart-viewport" style="width:${(s.zoom || 1) * 100}%;min-width:100%">${chartContent(p, s)}</div>`;
}
function chartContent(p, s) {
  const pp = previewPerson(p),
    pots = pp.l1.pots;
  if (!pots.length)
    return `<div class="empty-state">${icon('bubbles')}<h3>Make room for a possibility.</h3><p>A first cushion. A trip. Something that’s yours. Try an idea below to see it take shape.</p>${button('Create a plan', 'newplan', 'secondary')}</div>`;
  if (s.view === 'list')
    return `<div class="future-list">${pots.map((x) => potRow(pp, x, s.month)).join('')}</div>`;
  if (s.view === 'rings')
    return `<div class="rings-chart"><svg viewBox="0 0 330 260" role="img" aria-label="Progress toward each goal">${pots
      .slice(0, 6)
      .map((x, i) => {
        const radius = 100 - i * 13,
          den = x.target || x.balance || 1;
        const pr = x.isDebt ? 1 - valueAt(pp, x, s.month) / den : valueAt(pp, x, s.month) / den;
        return `<circle cx="165" cy="125" r="${radius}" class="ring-track"/><circle cx="165" cy="125" r="${radius}" pathLength="100" stroke-dasharray="${Math.max(0, Math.min(100, pr * 100))} 100" transform="rotate(-90 165 125)" class="ring-value tone-${i} ${x.isDebt ? 'tone-debt' : ''}"/>`;
      })
      .join(
        '',
      )}<text x="165" y="122" class="ring-center">${s.month ? 'In ' + Math.round((s.month / 12) * 10) / 10 + ' years' : 'Today'}</text><text x="165" y="143" class="ring-sub">${pots.length} plans</text></svg><div class="chart-legend">${pots.map((x, i) => `<button data-action="pot:${esc(x.id)}"><i class="tone-${i} ${x.isDebt ? 'tone-debt' : ''}"></i>${esc(x.name)}<b>${cash(valueAt(pp, x, s.month))}</b></button>`).join('')}</div></div>`;
  if (s.view === 'area') {
    const samples = Array.from({ length: 21 }, (_, i) => i * 6),
      positive = pots.filter((x) => !x.isDebt),
      negative = pots.filter((x) => x.isDebt);
    let min = -Math.max(
        1,
        ...samples.map((m) => negative.reduce((a, x) => a + valueAt(pp, x, m), 0)),
      ),
      max = Math.max(1, ...samples.map((m) => positive.reduce((a, x) => a + valueAt(pp, x, m), 0)));
    if (!negative.length) min = 0;
    const y = (v) => 220 - ((v - min) / (max - min)) * 180,
      x = (m) => 35 + (m / 120) * 278;
    const paths = positive
      .map((pot, i) => {
        const before = (m) => positive.slice(0, i).reduce((a, pot) => a + valueAt(pp, pot, m), 0);
        return `<path class="area-fill tone-${pots.indexOf(pot)}" d="${samples.map((m, j) => (j ? 'L' : 'M') + x(m) + ',' + y(before(m) + valueAt(pp, pot, m))).join(' ')} ${[
          ...samples,
        ]
          .reverse()
          .map((m) => 'L' + x(m) + ',' + y(before(m)))
          .join(' ')}Z"/>`;
      })
      .join('');
    return `<svg class="area-chart" viewBox="0 0 340 255" role="img" aria-label="Illustrated savings and debt over ten years">${paths}${negative.length ? `<path class="debt-area" d="M35,${y(0)} ${samples.map((m) => 'L' + x(m) + ',' + y(-negative.reduce((a, pot) => a + valueAt(pp, pot, m), 0))).join(' ')} L313,${y(0)}Z"/>` : ''}<line x1="35" y1="${y(0)}" x2="313" y2="${y(0)}" class="axis"/><line x1="${x(s.month)}" x2="${x(s.month)}" y1="30" y2="223" class="time-cursor"/><text x="3" y="35">${Math.round(max / 1000)}k</text><text x="5" y="${y(0) + 4}">£0</text><text x="35" y="246">Today</text><text x="150" y="246">+5 years</text><text x="275" y="246">+10 years</text></svg><div class="chart-legend compact">${pots.map((x, i) => `<button data-action="pot:${esc(x.id)}"><i class="tone-${i} ${x.isDebt ? 'tone-debt' : ''}"></i>${esc(x.name)}</button>`).join('')}</div>`;
  }
  const max = Math.max(
    ...pots.map((x) => Math.max(x.target || 0, x.balance, valueAt(pp, x, s.month))),
    1,
  );
  return `<div class="bubble-field" style="height:${pots.length > 4 ? 510 : pots.length > 2 ? 365 : 225}px">${pots
    .map((pot, i) => {
      const total = pot.target || Math.max(pot.balance, valueAt(pp, pot, 120)),
        diam = 24 + Math.sqrt(total / max) * 102,
        fill = pot.target
          ? Math.sqrt(valueAt(pp, pot, s.month) / pot.target)
          : Math.sqrt(valueAt(pp, pot, s.month) / total);
      return `<button class="pot-bubble tone-${i} ${pot.isDebt ? 'tone-debt' : ''} ${p.l1.pots.some((x) => x.id === pot.id) ? '' : 'provisional'}" data-action="${p.l1.pots.some((x) => x.id === pot.id) ? 'pot:' + esc(pot.id) : 'preview-summary'}" style="left:${i % 2 ? 73 : 27}%;top:${75 + Math.floor(i / 2) * 165}px;--diam:${diam}px;--fill:${Math.min(1, fill)}" aria-label="${esc(pot.name)} ${cash(valueAt(pp, pot, s.month))}${s.month ? ' projected' : ''}"><span class="bubble-target"><span class="bubble-fill"></span>${icon(potIcons[pot.id] || 'wallet')}</span><span class="bubble-label"><b>${esc(pot.name)}</b><small>${cash(valueAt(pp, pot, s.month))}${pot.target ? ' / ' + cash(pot.target) : ''}</small></span></button>`;
    })
    .join('')}</div>`;
}
export function goalEvents(p, s) {
  const pp = previewPerson(p);
  return pp.l1.pots
    .map((pot) => ({ pot, m: milestone(pp, pot) }))
    .filter((x) => x.m !== null && x.m <= s.month && (x.pot.isDebt || x.pot.stopsAtTarget))
    .map(
      ({ pot, m }) =>
        `<button class="goal-event" data-action="${p.ui.preview.length ? 'preview-summary' : 'redirect:' + esc(pot.id)}">${icon('check')}<span>${esc(pot.name)} ${pot.isDebt ? 'paid off' : 'reaches its target'}<small>${dateAt(pp, m)} · the rule stops here</small></span>${icon('arrow')}</button>`,
    )
    .join('');
}
export function futureScreen(p, s, data) {
  return futureStudio(p, s, data);
}
export function legacyFutureScreen(p, s, data) {
  const pp = previewPerson(p),
    t = totals(pp, s.month);
  return `<div class="future-page">${companion(p, s)}<header class="future-heading"><div><span class="eyebrow">NET WORTH</span><h1 id="future-total">${cash(t.net)}</h1><p id="future-date">${s.month ? dateAt(p, s.month) + ' · projected' : 'Today'} · age ${p.l1.customer.age + Math.floor(s.month / 12)}</p></div><button class="icon-btn" data-action="newplan" aria-label="Create a plan">${icon('plus')}</button></header><div class="future-toolbar"><h2>What you’re building</h2><div class="view-switch" role="group" aria-label="Future view">${['bubbles', 'rings', 'area', 'list'].map((v) => `<button aria-label="${v === 'area' ? 'Timeline' : v[0].toUpperCase() + v.slice(1)} view" aria-pressed="${s.view === v}" class="${s.view === v ? 'selected' : ''}" data-action="view:${v}">${icon(v === 'area' ? 'chart' : v)}</button>`).join('')}</div></div><div class="chart-tools">${button('−', 'zoom:-0.25', 'text', 'aria-label="Zoom out"')}${button('Fit', 'zoom:fit', 'text', 'aria-label="Fit chart"')}${button('+', 'zoom:0.25', 'text', 'aria-label="Zoom in"')}<small>Zoom, then scroll to explore</small></div><div id="future-stage">${futureChart(p, s)}</div><div class="time-control"><div><b id="time-label">${s.month ? dateAt(p, s.month) : 'Today'}</b><small>A projection, not a promise</small></div><label class="sr-only" for="time-slider">Explore your future in months</label><input id="time-slider" type="range" min="0" max="120" value="${s.month}" step="1"><div class="time-marks">${[
    [0, 'Today'],
    [12, '+1y'],
    [24, '+2y'],
    [60, '+5y'],
    [120, '+10y'],
  ]
    .map(([m, t]) => button(t, 'time:' + m, 'time-tick'))
    .join(
      '',
    )}</div></div><div id="goal-events">${goalEvents(p, s)}</div>${p.ui.preview.length ? `<div class="preview-bar"><span><b>${p.ui.preview.length} ${p.ui.preview.length === 1 ? 'possibility' : 'possibilities'}</b><small>Nothing has moved yet</small></span>${button('Review', 'preview-summary', 'primary')}${button('Clear', 'clear-preview', 'text')}</div>` : ''}${section('What Ifs')}<div class="whatif-list">${p.l2.whatIfs
    .filter((x) => !p.ui.applied.includes(x.id))
    .map(
      (w) =>
        `<button class="whatif-card ${p.ui.preview.includes(w.id) ? 'applied' : ''}" data-action="idea:${esc(w.id)}"><span class="whatif-icon">${icon(p.ui.preview.includes(w.id) ? 'check' : 'plus')}</span><span><b>${esc(w.title)}</b><small>${esc(w.summary)}</small></span>${icon('chev')}</button>`,
    )
    .join(
      '',
    )}</div><button class="money-speed" data-action="rules"><span><small>Money speed</small><b>${cash(totals(p).speed)}<em>/month</em></b></span><span>${p.l1.rules.filter((x) => x.active).length} agreed rules${icon('arrow')}</span></button><p class="projection-note">Illustrative model. Scheduled contributions only; current-account cash is held constant. Investment growth is illustrated at 5%, not guaranteed. Product interest and future income or spending are not modelled.</p></div>`;
}
export function youScreen(p, s, data) {
  let personality = p.l2.personality;
  const selected = personality.members?.find((x) => x.memberId === s.member);
  if (selected) personality = { ...selected.personality, provenance: selected.personality.src };
  const members = [
    { id: 'self', name: 'You', initials: p.l1.customer.firstName[0] },
    ...p.l1.household.members.filter((x) => x.relation !== 'self' && p.l1.customer.id === 'elena'),
    ...(p.l2.personality.members?.length > 0
      ? [{ id: 'household', name: 'Household', initials: '+' }]
      : []),
  ];
  const traits = personality.traits || [];
  const early = s.direction === 'vanilla' && isEarlyPortrait(p, s.member);
  return `<div class="you-page">${companion(p, s)}${
    s.direction === 'vanilla'
      ? early
        ? personality.name
          ? portraitComponent(p, s) + checkinEntry(p)
          : portraitBeginning(p)
        : checkinEntry(p) + portraitComponent(p, s)
      : `${section('What we believe')}<section class="personality"><div class="member-picker">${members.map((m) => `<button class="${s.member === m.id ? 'selected' : ''}" aria-pressed="${s.member === m.id}" aria-label="${esc(m.name)}" data-action="member:${m.id}">${m.id === 'household' ? `<span>${icon('users')}</span>` : householdAvatar(m.id === 'self' ? p.l1.customer.id : m.id, m.name)}<small>${esc(m.name)}</small></button>`).join('')}<button data-action="invite"><span>${icon('plus')}</span><small>Invite</small></button></div>${p.ui.requests
          .filter((r) => r.kind === 'invite')
          .map(
            (r) =>
              `<p class="support">${esc(r.name)} · demo invitation created · awaiting consent</p>`,
          )
          .join(
            '',
          )}${personality.name ? `<span class="eyebrow">MONEY PERSONALITY</span><h1>${esc(personality.name)}</h1><p>${esc(personality.copy)}</p><div class="traits">${traits.map(([t, n]) => `<div><span>${esc(t)}</span><span class="trait-bars" aria-label="${esc(t)} ${n} of 5">${Array.from({ length: 5 }, (_, i) => `<i class="${i < n ? 'filled' : ''}"></i>`).join('')}</span></div>`).join('')}</div><small class="personality-source">${esc(personality.provenance || 'Shared by consent')}</small>${s.member === 'self' ? `<div class="button-row">${button(p.ui.confirmed ? 'Confirmed' : 'This sounds like me', 'personality-confirm', p.ui.confirmed ? 'secondary' : 'primary', p.ui.confirmed ? 'disabled' : '')}${button('Not quite', 'personality-correct', 'text')}</div>` : `<p class="support">Shared by consent. Their other money stays private.</p>`}` : `<div class="personality-empty">${icon('spark')}<h1>Let’s start with you.</h1><p>Three questions. No right answers. A first picture you can always change.</p>${button('Take the 2-minute quiz', 'quiz')}</div>`}</section>`
  }${early ? '<details class="you-more"><summary>Your HSBC relationship<span>Check-ins, benefits and support</span></summary>' + (!personality.name ? checkinEntry(p) + button('Add household member', 'invite', 'text beginning-household') : '') : ''}${s.direction === 'vanilla' ? membershipEntry(p) : section('What you’ve built')}<section class="points-module" aria-label="HSBC Points and challenges">${s.direction === 'vanilla' ? '' : `<span class="eyebrow">${esc(p.l1.relationship.tier)}</span><h2>${p.l1.relationship.nearPremier ? 'Your next chapter: Premier' : 'A relationship that grows.'}</h2><p>${esc(p.l1.relationship.statusNote)}</p>`}${pointsEntry(p)}</section>${journeyEntry(p)}${s.direction === 'vanilla' ? companionEntry(p) : ''}${section('On your behalf')}<section class="autonomy"><div class="autonomy-status">${icon('shield')}<span><b>${p.l1.autonomy.paused ? 'Everything is paused' : esc(p.l1.autonomy.level)}</b><small>${esc(p.l1.autonomy.limits)}</small></span></div>${button('Review your rules', 'rules', 'secondary')}${button(p.l1.autonomy.paused ? 'Restore agreed permissions' : 'Step everything down', 'autonomy', 'text')}<button class="human-link" data-action="${s.direction === 'vanilla' && p.l1.customer.tier !== 'Premier' ? 'support:discuss' : 'human'}">${icon('user')}<span><b>${p.l1.customer.id === 'elena' ? 'Priya, your Relationship Manager' : s.direction === 'vanilla' ? 'Ask HSBC AI' : 'A person, whenever you need one'}</b></span>${icon('arrow')}</button></section>${early ? '</details>' : ''}</div>`;
}
