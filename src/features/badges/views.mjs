import { esc, icon, button } from '../../design-system/templates.mjs';
import { challenges, categories } from './catalog.mjs';
import { badgeState, badgeSummary, canRecord, nextStep, challenge } from './model.mjs';
import { badgeArt } from './art.mjs';
import { badgeRecommendation } from '../ideas/model.mjs';
const number = (v) => v.toLocaleString('en-GB');
const date = (v) =>
  new Date(v + 'T12:00:00Z').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
export function badgeTile(p, b) {
  const s = badgeState(p, b.id);
  return `<button class="badge-tile" data-action="badge:${b.id}" aria-label="${esc(b.title)} · ${s.status === 'earned' ? 'Earned' : s.status === 'available' ? 'Not started' : s.count + ' of ' + b.target + ' ' + b.unit} · ${b.points} Points">
    <span class="badge-tile-art">${badgeArt(b, s.status)}${s.status === 'earned' ? '' : `<span class="badge-state-mark">${icon(s.status === 'available' ? 'lock' : s.status === 'paused' ? 'pause' : 'clock')}</span>`}</span>
    <b>${esc(b.title)}</b><small>${s.status === 'earned' ? 'Earned' : s.status === 'available' ? esc(b.duration) : `${s.count} / ${b.target} ${esc(b.unit)}${s.status === 'paused' ? ' · Paused' : ''}`}</small>
    <span class="badge-bonus ${s.status === 'earned' ? 'is-awarded' : ''}">${s.status === 'earned' ? '' : '+'}${b.points} Points</span>
    ${['active', 'paused'].includes(s.status) ? `<span class="badge-tile-progress" aria-hidden="true"><i style="width:${s.percent}%"></i></span>` : ''}
  </button>`;
}
export function pointsEntry(p) {
  const summary = badgeSummary(p),
    recommended = badgeRecommendation(p)?.challenge,
    preview = [
      ...(recommended ? [recommended] : []),
      ...summary.active.sort((a, b) => badgeState(p, b.id).percent - badgeState(p, a.id).percent),
      ...summary.earned,
      ...[...['in-touch', 'little-often', 'scam-spotter'].map(challenge), ...challenges].filter(
        (b) => badgeState(p, b.id).status === 'available',
      ),
    ]
      .filter((b, index, list) => list.findIndex((other) => other.id === b.id) === index)
      .slice(0, 3);
  return `<div class="points-entry"><button class="points-banner" data-support-context="rewards" data-action="points"><span><strong>${number(p.l1.rewards.points.balance)}</strong><small>HSBC Points</small></span><span>Use your Points ${icon('arrow')}</span></button><section class="badge-entry-context" data-support-context="badges" aria-label="Your challenges"><div class="badge-entry-heading"><b>Your challenges</b><button class="text" data-action="badges">See all 20 ${icon('chev')}</button></div><div class="badge-entry-preview">${preview.map((b) => badgeTile(p, b)).join('')}</div></section>${pointsActivityEntry()}</div>`;
}
export function badgeCollection(p, filter = 'all') {
  const summary = badgeSummary(p),
    shown = challenges.filter(
      (b) =>
        filter === 'all' ||
        (filter === 'started'
          ? ['active', 'paused'].includes(badgeState(p, b.id).status)
          : badgeState(p, b.id).status === 'earned'),
    );
  return `<div class="badge-collection" data-badge-filter="${filter}"><div class="badge-collection-intro"><h2>Find your next challenge.</h2><p>Build a money habit. Earn a badge and bonus Points when you complete it.</p><div class="badge-collection-stats"><span><b>${number(p.l1.rewards.points.balance)}</b> Points</span><span><b>${summary.earned.length} / 20</b> badges earned</span></div></div>
  <div class="badge-filters" role="group" aria-label="Filter challenges">${[
    ['all', 'All 20'],
    ['started', 'Started ' + summary.active.length],
    ['earned', 'Earned ' + summary.earned.length],
  ]
    .map(
      ([key, label]) =>
        `<button data-action="badge-filter:${key}" aria-pressed="${key === filter}">${label}</button>`,
    )
    .join('')}</div>
  ${
    shown.length
      ? categories
          .map((c) => {
            const list = shown.filter((b) => b.category === c);
            return list.length
              ? `<section class="badge-category"><h3>${esc(c)}</h3><div class="badge-grid">${list.map((b) => badgeTile(p, b)).join('')}</div></section>`
              : '';
          })
          .join('')
      : `<div class="badge-empty">${icon(filter === 'earned' ? 'award' : 'target')}<h3>${filter === 'earned' ? 'Your collection starts here' : 'Find your first challenge'}</h3><p>${filter === 'earned' ? 'Complete a challenge to add its badge and Points to your collection.' : 'Choose a challenge that fits your life. You can pause at any time.'}</p>${button('Explore challenges', 'badge-filter:all', 'secondary')}</div>`
  }
  </div>`;
}
export function badgeDetail(p, id, mode = 'detail') {
  const b = challenge(id),
    s = badgeState(p, id),
    earned = s.status === 'earned',
    active = ['active', 'paused'].includes(s.status),
    ready = canRecord(p, id);
  if (!b) return '';
  return `<div class="badge-detail ${mode === 'celebrate' ? 'badge-celebrate' : ''}"><div class="badge-detail-hero">${badgeArt(b, s.status)}<span class="eyebrow">${earned ? 'BADGE EARNED' : s.status === 'paused' ? 'PAUSED · PROGRESS KEPT' : s.status === 'active' ? 'YOUR CHALLENGE' : 'A NEW CHALLENGE'}</span><h2>${esc(b.title)}</h2><span class="badge-detail-points">${earned ? '' : icon('award')}${earned ? '<span class="is-awarded">' + b.points + ' Points</span> earned' : '+' + b.points + ' Points on completion'}</span></div>
    ${
      earned
        ? `<p class="badge-earned-copy">${esc(b.description)}</p><div class="badge-earned-receipt"><span>Completed ${date(s.earnedAt)}</span><b class="is-awarded">+${b.points} Points</b><small>Added to your Points balance. This badge is yours to keep.</small></div>${button('Explore more challenges', 'badge-browse', 'primary wide')}`
        : `<p class="badge-description">${esc(b.description)}</p>
    ${active ? `<div class="badge-progress-summary"><b>${s.count}<span> / ${b.target}</span></b><span>${esc(b.unit)}</span></div><div class="badge-checkpoints" role="progressbar" aria-label="Challenge progress" aria-valuemin="0" aria-valuemax="${b.target}" aria-valuenow="${s.count}" style="--badge-columns:${b.target > 12 ? 10 : Math.min(b.target, 6)}">${Array.from({ length: b.target }, (_, i) => `<i class="${i < s.count ? 'is-done' : ''}" aria-hidden="true">${i < s.count ? icon('check') : i + 1}</i>`).join('')}</div>` : ''}
    <div class="badge-commitment"><h3>${active ? 'The commitment' : 'Before you begin'}</h3><p>${esc(b.commitment)}</p>${b.schedule === 'ramp' ? `<div class="badge-ramp" aria-label="Increasing daily savings: £1 on day 1, £15 on day 15 and £30 on day 30">${Array.from({ length: 30 }, (_, i) => `<i style="height:${8 + (i + 1) * 1.5}px" class="${i < s.count ? 'is-done' : ''}"></i>`).join('')}</div><div class="badge-ramp-labels"><span>Day 1 · £1</span><span>Day 30 · £30</span></div>` : ''}</div>
    ${b.steps ? `<ol class="badge-step-list">${b.steps.map((step, i) => `<li class="${i < s.count ? 'is-done' : ''}">${esc(step)}</li>`).join('')}</ol>` : ''}
    ${mode === 'record' ? `<form id="badge-record-form" class="badge-record"><h3>${b.schedule === 'ramp' ? nextStep(p, id) : 'Record your step'}</h3><label class="checkbox-label"><input id="badge-confirm" type="checkbox" required> <span>${esc(b.steps ? 'I completed this step: ' + nextStep(p, id) : b.step)}</span></label><p class="support">Recorded by you. This does not move money or change any account.</p>${button(s.count + 1 === b.target ? 'Finish challenge · earn ' + b.points + ' Points' : 'Save my progress', 'badge-record:' + id, 'primary wide', 'type="button"')}${button('Not yet', 'badge:' + id, 'text wide', 'type="button"')}</form>` : active ? `<div class="badge-next"><h3>${s.status === 'paused' ? 'Ready when you are' : ready ? 'Your next step' : 'Step recorded'}</h3><p>${esc(s.status === 'paused' ? b.recovery : ready ? nextStep(p, id) : b.mature ? 'Return after your next full month of the challenge.' : 'Come back ' + (b.cadence === 'day' ? 'another day' : b.cadence === 'week' ? 'next week' : 'next month') + ' to record your next step.')}</p>${s.status === 'paused' ? button('Resume challenge', 'badge-pause:' + id, 'primary wide') : `${ready ? button('Record my step', 'badge-log:' + id, 'primary wide') : ''}${button('Pause challenge', 'badge-pause:' + id, 'text wide')}`}</div>` : `${button('Join challenge', 'badge-join:' + id, 'primary wide')}<p class="badge-join-note">No money moves when you join. Progress is recorded by you.</p>`}
    ${mode !== 'record' && s.status !== 'paused' ? `<p class="badge-recovery">${esc(b.recovery)}</p>` : ''}`
    }
  </div>`;
}

export function pointsActivityEntry() {
  return `<button class="points-activity-link" data-action="points-activity"><span>View Points activity</span>${icon('arrow')}</button>`;
}
function activityDate(value) {
  const format = (part) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(part)) return date(part);
    if (/^\d{4}-\d{2}$/.test(part))
      return new Date(part + '-01T12:00:00Z').toLocaleDateString('en-GB', {
        month: 'short',
        year: 'numeric',
      });
    return part;
  };
  return value.split('..').map(format).join(' – ');
}
export function pointsActivity(p) {
  const entries = p.l1.rewards.points.ledger.map((x, i) => ({ ...x, index: i }));
  const recent = entries
    .filter((x) => !x.date.includes('..'))
    .sort((a, b) => b.date.localeCompare(a.date) || b.index - a.index);
  const grouped = entries.filter((x) => x.date.includes('..')).reverse();
  const earned = entries.reduce((sum, x) => sum + Math.max(0, x.points), 0);
  const spent = entries.reduce((sum, x) => sum + Math.max(0, -x.points), 0);
  const list = (items) =>
    `<ol class="points-activity-list">${items.map((x) => `<li class="points-activity-row" data-points-direction="${x.points < 0 ? 'spent' : 'earned'}"><span class="points-activity-symbol">${icon(x.points < 0 ? 'up' : 'down')}</span><span class="points-activity-description"><b>${esc(x.reason)}</b><small>${x.points < 0 ? 'Spent' : 'Earned'} · ${esc(activityDate(x.date))}</small></span><strong>${x.points < 0 ? '−' : '+'}${number(Math.abs(x.points))}</strong></li>`).join('')}</ol>`;
  return `<div class="points-activity"><span class="eyebrow">AVAILABLE POINTS</span><div class="detail-number">${number(p.l1.rewards.points.balance)}</div><div class="points-activity-totals"><span><small>Total earned</small><b>+${number(earned)}</b></span><span><small>Total spent</small><b>−${number(spent)}</b></span></div>${entries.length ? `${recent.length ? list(recent) : ''}${grouped.length ? `<h3 class="dialog-section">Earlier activity</h3><p class="support">Grouped by period.</p>${list(grouped)}` : ''}` : `<div class="badge-empty">${icon('clock')}<h3>No Points activity yet</h3><p>Points you earn and spend will appear here.</p>${button('Explore challenges', 'badges', 'secondary')}</div>`}</div>`;
}
