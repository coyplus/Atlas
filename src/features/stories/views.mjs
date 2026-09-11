import { esc, icon, button } from '../../design-system/templates.mjs';
import { storyModel, STORY_DURATIONS } from './model.mjs';
const evidenceAction = (m, index = 'all') => `story-evidence:${m.id}/${index}`;
function chart(m) {
  if (m.shape === 'profile')
    return `<div class="story-profile">${m.rows.map((r, i) => `<div><span class="story-profile-icon">${icon(['user', 'trend', 'spark'][i])}</span><span><strong>${esc(r.label)}</strong><p>${esc(r.detail)}</p></span><b>${esc(r.value)}</b></div>`).join('')}</div>`;
  if (m.shape === 'payment-split') {
    const total = m.rows.reduce((n, r) => n + r.n, 0);
    return `<div class="story-payment-split"><div class="story-split">${m.rows.map((r, i) => `<button style="flex:${r.n}" data-action="${evidenceAction(m, i)}" aria-label="${esc(r.label + ' ' + r.value)}"></button>`).join('')}</div><div class="story-split-key">${m.rows.map((r, i) => `<button data-action="${evidenceAction(m, i)}"><i class="part-${i}" aria-hidden="true"></i><span>${esc(r.label)}<small>${Math.round((r.n / total) * 100)}% of total</small></span><b>${esc(r.value)}</b></button>`).join('')}</div></div>`;
  }
  if (m.shape === 'dumbbell') {
    const first = m.rows[0],
      last = m.rows.at(-1);
    const availableX = 20 + (last.n / first.n) * 280;
    return `<button class="story-dumbbell" data-action="${evidenceAction(m)}" aria-label="${esc(first.value + ' balance, less ' + m.rows[1].value.replace('−', '') + ' bills, leaves ' + last.value)}"><svg viewBox="0 0 320 128" role="img" aria-hidden="true"><line class="dumbbell-axis" x1="20" y1="64" x2="300" y2="64"/><line class="dumbbell-link" x1="${availableX}" y1="64" x2="300" y2="64"/><circle cx="300" cy="64" r="8"/><circle class="dumbbell-available" cx="${availableX}" cy="64" r="8"/><text class="dumbbell-caption" x="${availableX}" y="18" text-anchor="end">After bills</text><text x="${availableX}" y="40" text-anchor="end">${esc(last.value)}</text><text class="dumbbell-caption" x="20" y="100">£0</text><text x="300" y="100" text-anchor="end">${esc(first.value)}</text><text class="dumbbell-caption" x="300" y="122" text-anchor="end">Balance</text></svg><small>${esc(m.rows[1].value.replace('−', ''))} set aside for bills</small></button>`;
  }
  if (m.shape === 'waterfall') {
    const total = m.rows[0].n;
    let remaining = total;
    return `<div class="story-waterfall" aria-label="Balance reduced by essentials and commitments">${m.rows
      .map((r, i) => {
        const end = i === 0 ? 0 : i === m.rows.length - 1 ? 0 : remaining - r.n;
        if (i > 0 && i < m.rows.length - 1) remaining -= r.n;
        return `<button data-action="${evidenceAction(m, i)}" class="${r.accent ? 'is-accent' : ''}"><strong>${esc(r.value)}</strong><span class="waterfall-column" aria-hidden="true"><i data-viz-role="${i === 0 || i === m.rows.length - 1 ? 'cash' : 'reserved'}" style="bottom:${(end / total) * 100}%;height:${(r.n / total) * 100}%"></i></span><span>${esc(['Balance', 'Essentials', 'Commitments', 'Remaining'][i])}</span></button>`;
      })
      .join('')}</div>`;
  }
  if (m.shape === 'ranked') {
    const max = Math.max(...m.rows.map((r) => r.n), 1);
    return `<div class="story-chart story-${m.shape}" aria-label="${esc(m.caption)}">${m.rows.map((r, i) => `<button class="story-mark ${r.accent || (m.shape === 'ranked' && i === 0) ? 'is-accent' : ''}" data-action="${evidenceAction(m, i)}"><span class="story-mark-label">${esc(r.label)}</span><strong>${esc(r.value)}</strong><span class="story-mark-track" aria-hidden="true"><i style="--mark:${Math.max(1, (r.n / max) * 100)}%;--mark-delay:${i * 80}ms"></i></span></button>`).join('')}</div>`;
  }
  if (['sequence', 'tally'].includes(m.shape)) {
    const names =
      m.id === 'j3'
        ? ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    return `<button class="story-milestones story-${m.shape}" data-action="${evidenceAction(m)}" aria-label="${esc(m.caption)}. View evidence.">${names.map((name, i) => `<span><i class="${i === names.length - 1 ? 'is-accent' : ''}">${m.shape === 'tally' ? icon('check') : ''}</i><small>${name}</small></span>`).join('')}</button>`;
  }
  if (m.shape === 'target')
    return `<button class="story-target" data-action="${evidenceAction(m)}" aria-label="£6,400 saved towards £24,000. View evidence."><span class="story-target-bar"><i style="width:${(m.value / m.target) * 100}%"></i></span><span><b>Saved so far</b><span>£24,000 target</span></span></button>`;
  if (m.shape === 'composition')
    return `<button class="story-composition" data-action="${evidenceAction(m)}" aria-label="36 percent floor allocation, 64 percent remaining allocation. View evidence."><span class="story-split"><i style="flex:36"></i><i style="flex:64"></i></span><span class="story-split-labels"><span><b>£65,664</b>Floor allocation · 36%</span><span><b>£116,736</b>Remaining · 64%</span></span></button>`;
  if (m.shape === 'flow')
    return `<button class="story-flow" data-action="${evidenceAction(m)}" aria-label="£22 round-ups moved to Emergency fund. View evidence."><span>${icon('swap')}<b>Round-ups</b><small>This month</small></span>${icon('arrow')}<span>${icon('shield')}<b>Emergency fund</b><small>Current destination</small></span></button>`;
  return `<div class="story-facts">${m.rows.map((r, i) => `<button data-action="${evidenceAction(m, i)}"><span>${esc(r.label)}</span><strong>${esc(r.value)}</strong><small>${esc(r.detail)}</small></button>`).join('')}</div>`;
}
export function immersiveStory(p, id, step = 0) {
  const m = storyModel(p, id);
  if (!m) return '';
  const done = m.state === 'saved';
  return `<article class="story-viewer ${step === 1 ? 'story-paper' : 'story-plate'}" data-viz-role="${esc(m.visualRole)}" data-story="${esc(id)}" data-person="${esc(p.l1.customer.id)}" data-step="${step}" data-duration="${STORY_DURATIONS[step]}" style="--story-image:url('${m.plate}')">
    <div class="story-pagination" aria-label="Story pages">${STORY_DURATIONS.map((_, i) => `<button data-action="story-step:${i}" aria-label="Story page ${i + 1}: ${['The idea', 'The working', 'Your choice'][i]}" ${i === step ? 'aria-current="step"' : ''}><span><i style="transform:scaleX(${i < step || (i === step && step === 2) ? 1 : 0})"></i></span></button>`).join('')}</div>
    <div class="story-page" id="story-page-${id}-${step}" aria-label="Page ${step + 1} of 3" aria-live="polite">
      <p class="story-eyebrow">${esc(step === 0 ? m.period : step === 1 ? (m.shape === 'profile' ? 'In two minutes' : 'The working') : done ? 'Already in place' : 'Your choice')}</p>
      <div class="story-editorial">${step === 0 ? `<h1 class="${m.shape === 'profile' ? 'story-question' : 'story-figure'}">${esc(m.claimFigure)}</h1><p class="story-sentence">${esc(m.sentence)}</p>` : step === 1 ? `<h1 class="story-figure ${['facts', 'profile'].includes(m.shape) ? 'is-formula' : ''}">${esc(m.workingFigure)}</h1><p class="story-caption">${esc(m.caption)}</p>${chart(m)}` : `<h1 class="story-question">${esc(m.question)}</h1><p class="story-sentence">${esc(m.consequence)}</p><div class="story-choice">${done || !m.action ? button('Back to My stories', 'story-end', 'secondary') : `${button('Not now', 'story-decline', 'secondary')}${button(m.action.startsWith('pin:') ? 'Add to My numbers' : m.actionLabel, 'story-action:' + id, 'primary')}`}</div>`}</div>
      <footer class="story-footer"><button class="story-receipt" data-action="${evidenceAction(m)}">${esc(m.receipt)} ${icon('transcript')}</button>${step === 0 ? '<span class="story-hint">Swipe sideways for pages · up or down for Stories</span>' : ''}</footer>
    </div>
    <nav class="story-browse" aria-label="Browse stories">${button('Previous story', 'story-shift:-1', 'text', p.l2.stories[0].id === id ? 'disabled' : '')}<span>${p.l2.stories.findIndex((st) => st.id === id) + 1} / ${p.l2.stories.length} stories</span>${button('Next story', 'story-shift:1', 'text', p.l2.stories.at(-1).id === id ? 'disabled' : '')}</nav>
  </article>`;
}
export function storyEvidence(p, id, index = 'all') {
  const m = storyModel(p, id);
  if (!m) return '';
  const selected = index === 'all' ? m.rows : m.rows.filter((_, i) => i === Number(index));
  return `<div class="story-evidence"><div class="story-evidence-rows">${selected.map((r) => `<div><span><b>${esc(r.label)}</b><small>${esc(r.detail)}</small></span><strong>${esc(r.value)}</strong></div>`).join('')}</div>${m.limit ? `<p>${esc(m.limit)}</p>` : ''}<small>As of ${new Date(p.l1.asOf + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</small></div>`;
}
