import { esc, icon, button } from '../../design-system/templates.mjs';
import { journeyModel, milestoneDate } from './model.mjs';
function timeline(events, compact = false) {
  return `<ol class="journey-timeline ${compact ? 'journey-timeline--compact' : ''}">${events.map((m) => `<li><button class="journey-moment" data-action="journey-event:${m.id}"><span class="journey-node">${icon(m.icon)}</span><span class="journey-moment-copy"><time datetime="${esc(m.date)}">${esc(milestoneDate(m.date))}</time><b>${esc(m.title)}</b><span>${esc(m.summary)}</span></span>${icon('chev')}</button></li>`).join('')}</ol>`;
}
export function journeyEntry(p) {
  const m = journeyModel(p);
  return `<section class="journey-module" aria-labelledby="journey-heading"><div class="journey-module-heading"><h2 id="journey-heading">Your journey with us</h2><p>Since ${esc(m.since)}</p></div>${timeline(m.recent, true)}<button class="journey-explore" data-action="journey"><span>Explore your journey</span>${icon('arrow')}</button></section>`;
}
export function journeyDetail(p) {
  const m = journeyModel(p);
  return `<div class="journey-detail"><div class="journey-intro"><span class="eyebrow">SINCE ${esc(m.since.toUpperCase())}</span><h2>${p.l1.customer.id === 'alex' ? 'Your first steps.' : 'The moments that brought you here.'}</h2><p>${p.l1.customer.id === 'alex' ? 'The start of your story with HSBC.' : 'Your goals, your people and the progress you’ve made along the way.'}</p></div>${timeline(m.events)}</div>`;
}
export function journeyMilestone(p, id) {
  const m = journeyModel(p).events.find((x) => x.id === id);
  if (!m) return '';
  return `<article class="journey-memory"><div class="journey-memory-mark">${icon(m.icon)}</div><span class="eyebrow">${esc(m.category.toUpperCase())}</span><time datetime="${esc(m.date)}">${esc(milestoneDate(m.date))}</time><h2>${esc(m.title)}</h2>${m.figure ? `<div class="journey-memory-figure"><strong>${esc(m.figure)}</strong><span>${esc(m.figureLabel)}</span></div>` : ''}<p>${esc(m.detail)}</p>${m.action ? button(m.actionLabel, 'journey-open:' + m.id, 'secondary wide') : ''}</article>`;
}
