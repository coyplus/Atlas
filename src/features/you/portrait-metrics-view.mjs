import { esc, icon, button } from '../../design-system/templates.mjs';
import { cash } from '../../domain/money.mjs';
import { portraitMetrics } from './portrait-metrics.mjs';
const palette = ['#4D8590', '#8E7FA6', '#C6854E', '#B87989'];
function graphic(c) {
  if (c.kind === 'cadence')
    return `<div class="pm-cadence" role="img" aria-label="${esc(c.value + ' consecutive months: ' + c.period)}">${c.labels.map((label) => `<span><i></i><small>${label}</small></span>`).join('')}</div>`;
  if (c.kind === 'allocation') {
    const sum = c.parts.reduce((n, x) => n + x.value, 0) || 1;
    return `<div class="pm-allocation"><div class="pm-allocation-track">${c.parts.map((x, i) => `<i style="flex:${x.value / sum};--part:${palette[i % 4]}"></i>`).join('')}</div><div class="pm-allocation-key">${c.parts.map((x, i) => `<span style="--part:${palette[i % 4]}"><b>${cash(x.value)}</b><small>${esc(x.name)}</small></span>`).join('')}</div></div>`;
  }
  if (c.kind === 'comparison') {
    const max = Math.max(...c.parts.map((x) => x.value));
    return `<div class="pm-comparison">${c.parts.map((x, i) => `<div><span>${esc(x.name)}</span><b>${cash(x.value, true)}</b><i style="--bar:${(x.value / max) * 100}%;--opacity:${i ? 1 : 0.35}"></i></div>`).join('')}</div>`;
  }
  if (c.kind === 'gauge')
    return `<div class="pm-gauge"><div><i style="width:${Math.min(1, c.ratio) * 100}%"></i><span></span></div><p><span>£0</span><b>${Math.round(c.ratio * 100)}% of the line</b><span>${cash(c.limit)}</span></p></div>`;
  if (c.kind === 'calendar') {
    const max = Math.max(...c.days.map((d) => d.value), 1);
    return `<div class="pm-calendar"><svg viewBox="0 0 310 118" role="img" aria-label="Bill amounts by day of month; payday ${c.payday}"><path class="pm-axis" d="M8 84H302"/>${Array.from({ length: 31 }, (_, i) => `<circle class="pm-day-dot" cx="${8 + i * 9.8}" cy="88" r="1.6"/>`).join('')}${c.days.map((d) => `<rect class="pm-calendar-bar" x="${5 + (d.day - 1) * 9.8}" y="${81 - (55 * d.value) / max}" width="6" height="${(55 * d.value) / max + 3}" rx="3"><title>Day ${d.day}: ${cash(d.value, true)}</title></rect>`).join('')}<path class="pm-payday-line" d="M${8 + (c.payday - 1) * 9.8} 14v64"/><circle class="pm-payday" cx="${8 + (c.payday - 1) * 9.8}" cy="15" r="5"/><text x="${Math.max(36, Math.min(270, 8 + (c.payday - 1) * 9.8))}" y="7" text-anchor="middle">Payday ${c.payday}</text><text x="8" y="113">1</text><text x="155" y="113" text-anchor="middle">Day of month</text><text x="302" y="113" text-anchor="end">31</text></svg></div>`;
  }
  if (c.kind === 'years')
    return `<div class="pm-year-rings"><svg viewBox="0 0 300 118" role="img" aria-label="Nine rings, one for each year">${Array.from({ length: c.count }, (_, i) => `<path d="M${150 - (103 - i * 10)} 111a${103 - i * 10} ${103 - i * 10} 0 0 1 ${2 * (103 - i * 10)} 0" stroke-opacity="${0.35 + i * 0.07}"/>`).join('')}</svg></div>`;
  if (c.kind === 'recent') {
    const max = Math.max(...c.series.map((x) => x.value), 1);
    return `<div class="pm-recent" role="img" aria-label="Recorded entries by date">${c.series.map((x) => `<span><i style="height:${5 + (x.value / max) * 60}px;opacity:${x.value ? 1 : 0.2}"></i><small>${x.day}</small></span>`).join('')}</div>`;
  }
  if (c.kind === 'visits')
    return `<div class="pm-visits" aria-hidden="true">${Array.from({ length: c.count }, () => '<i></i>').join('')}</div>`;
  return `<div class="pm-count-dots" aria-hidden="true">${Array.from({ length: c.count }, () => '<i></i>').join('')}</div>`;
}
const stat = (c) =>
  `<div class="pm-stat"><strong>${esc(c.value)}</strong><span>${esc(c.unit)}</span></div>`;
const tile = (c) =>
  `<button class="pm-card pm-${c.span} pm-kind-${c.kind}" data-action="portrait-metric:${c.id}" data-support-topic="${c.id}" style="--metric:${c.colour}" aria-label="${esc(c.title + ': ' + c.value + ' ' + c.unit + '. View measurement')} "><span class="pm-card-heading">${icon(c.icon)}<span>${esc(c.title)}</span>${icon('chev')}</span>${stat(c)}${graphic(c)}<span class="pm-card-caption">${esc(c.caption)}</span><span class="pm-card-period">${esc(c.period)}</span></button>`;
export function portraitMetricsView(p, s) {
  const m = portraitMetrics(p, s),
    groups = [
      'All',
      ...['Saving', 'Spending', 'Routines'].filter((g) => m.cards.some((c) => c.group === g)),
    ];
  const filter = groups.includes(p.ui.portraitMetricFilter) ? p.ui.portraitMetricFilter : 'All';
  const cards = m.cards.filter((c) => filter === 'All' || c.group === filter);
  return `<div class="portrait-metrics" data-metric-person="${esc(m.member)}"><header class="pm-intro" data-support-topic="intro"><span class="eyebrow">${m.own ? 'OBSERVED ACTIVITY' : 'SHARED OBSERVATIONS'}</span><h2>${m.own ? 'Your money,<br>in motion.' : 'The shared<br>numbers.'}</h2><p>As of ${esc(m.asOf)}</p></header>${m.own ? `<nav class="pm-filters" aria-label="Metric categories">${groups.map((g) => `<button aria-pressed="${g === filter}" data-action="portrait-metric-filter:${g}">${g}</button>`).join('')}</nav>` : ''}<div class="pm-grid">${cards.map(tile).join('')}</div>${!cards.length ? '<p class="pm-shared-note">Individual activity isn’t included in this shared portrait.</p>' : ''}<footer class="pm-footer" data-support-topic="sources"><span class="eyebrow">THE RECORD BEHIND THE PORTRAIT</span><div>${m.inputs.map((x) => `<span><strong>${esc(x.value)}</strong><small>${esc(x.label)}</small></span>`).join('')}</div><p>Each metric has its own period and source. Tap to see what’s counted.</p><button class="portrait-link" data-action="portrait"><span>Explore what this says about you</span>${icon('arrow')}</button></footer></div>`;
}
export function portraitMetricDetail(p, s, id) {
  const m = portraitMetrics(p, s),
    c = m.cards.find((x) => x.id === id);
  if (!c) return portraitMetricsView(p, s);
  return `<div class="portrait-metric-detail" style="--metric:${c.colour}"><header class="pm-detail-heading"><span>${icon(c.icon)}${esc(c.group)}</span><h2>${esc(c.title)}</h2><p>${esc(c.period)}</p></header><section class="pm-detail-figure">${stat(c)}${graphic(c)}<p>${esc(c.caption)}</p></section><section class="pm-definition"><h3>How it’s measured</h3><p>${esc(c.calculation)}</p>${c.kind === 'calendar' ? `<div class="pm-day-breakdown">${c.days.map((d) => `<div><b>Day ${d.day}</b><span>${esc(d.names.join(' · '))}</span><strong>${cash(d.value, true)}</strong></div>`).join('')}</div>` : ''}</section><section class="pm-definition"><h3>What’s included</h3><p>${esc(c.observing)}</p></section><footer class="pm-data-source">${icon('info')}<p><b>Source</b>${esc(c.source)}<small>Updated ${esc(m.asOf)}</small></p></footer>${button('Ask about this number', 'support:discuss', 'secondary wide')}</div>`;
}
