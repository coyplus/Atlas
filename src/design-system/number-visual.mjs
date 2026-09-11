const esc = (s) =>
  String(s ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const money = (n) =>
  new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 2,
  }).format(n);
export function numberVisualMarkup(v, expanded = false) {
  if (!v) return '';
  const items = v.items || [],
    total = items.reduce((n, x) => n + x.value, 0);
  // A single holding has no composition to compare. Keep its identity, not an empty ring.
  if (v.type === 'ring' && items.length === 1 && v.label === 'Investment mix')
    return `<div class="number-visual ${expanded ? 'is-expanded' : ''}" data-visual="holding"><span>Held in ${esc(items[0].label)}</span></div>`;
  let graphic = '',
    legend = '';
  if (['split', 'ring'].includes(v.type)) {
    if (!total) return '';
    let offset = 0;
    graphic =
      v.type === 'ring'
        ? `<svg viewBox="0 0 120 120" aria-hidden="true">${items
            .map((x, i) => {
              const length = (x.value / total) * 100,
                start = offset;
              offset += length;
              return `<circle cx="60" cy="60" r="44" fill="none" stroke-width="15" pathLength="100" stroke-dasharray="${length} ${100 - length}" stroke-dashoffset="${-start}" transform="rotate(-90 60 60)" class="number-tone-${i % 5}" data-viz-role="${esc(x.role || v.role || 'neutral')}"/>`;
            })
            .join('')}</svg>`
        : `<div class="number-split" aria-hidden="true">${items.map((x, i) => `<i class="number-tone-${i % 5}" data-viz-role="${esc(x.role || v.role || 'neutral')}" style="flex:${x.value}"></i>`).join('')}</div>`;
    legend = `<div class="number-legend">${items
      .slice(0, expanded ? items.length : 3)
      .map(
        (x, i) =>
          `<span><i class="number-tone-${i % 5}" data-viz-role="${esc(x.role || v.role || 'neutral')}"></i><span>${esc(x.label)}</span>${expanded ? `<b>${money(x.value)}</b>` : ''}</span>`,
      )
      .join(
        '',
      )}${!expanded && items.length > 3 ? `<small>+${items.length - 3} more</small>` : ''}</div>`;
  } else if (v.type === 'line') {
    const start = Date.parse(items[0].label),
      end = Math.max(start + 86400000, Date.parse(v.end));
    const max = Math.max(1, ...items.map((x) => x.value));
    const points = items
      .map(
        (x) =>
          `${8 + ((Date.parse(x.label) - start) / (end - start)) * 224},${70 - (x.value / max) * 58}`,
      )
      .join(' ');
    graphic = `<svg viewBox="0 0 240 80" preserveAspectRatio="none" aria-hidden="true"><path d="M8 70H232" class="number-axis"/><polyline points="${points}" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`;
    legend = `<div class="number-axis-labels"><span>1 ${new Date(start).toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' })}</span><span>${esc(v.end.slice(8))} ${new Date(end).toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' })}</span></div>`;
  } else if (v.type === 'coverage' || v.type === 'streak') {
    const count = v.type === 'coverage' ? 6 : Math.min(v.value, 12);
    graphic = `<div class="number-blocks" aria-hidden="true">${Array.from({ length: count }, (_, i) => `<i><span style="width:${v.type === 'streak' ? 100 : Math.max(0, Math.min(100, ((v.value - i * 30) / 30) * 100))}%">${v.type === 'streak' ? '✓' : ''}</span></i>`).join('')}</div>`;
    legend = `<div class="number-axis-labels"><span>${v.type === 'coverage' ? '0' : 'Completed months'}</span><span>${v.type === 'coverage' ? '180 days' : v.value}</span></div>`;
  } else if (v.type === 'gauge') {
    const pct = Math.max(0, Math.min(100, v.value));
    graphic = `<svg viewBox="0 0 180 100" aria-hidden="true"><path d="M15 85 A75 75 0 0 1 165 85" pathLength="100" class="number-gauge-track"/><path d="M15 85 A75 75 0 0 1 165 85" pathLength="100" stroke-dasharray="${pct} 100" class="number-gauge-value"/></svg>`;
    legend = '<div class="number-axis-labels"><span>0%</span><span>100%</span></div>';
  }
  const accessible = items.length
    ? items.map((x) => x.label + ' ' + money(x.value)).join(', ')
    : v.value + (v.type === 'coverage' ? ' days' : v.type === 'gauge' ? '%' : ' months');
  return `<div class="number-visual ${expanded ? 'is-expanded' : ''}" data-visual="${v.type}" data-viz-role="${esc(v.role || 'neutral')}" data-viz-state="${esc(v.state || 'normal')}" role="img" aria-label="${esc(v.label + ': ' + accessible + (v.stateLabel ? '. ' + v.stateLabel : ''))}">${expanded ? `<h3>${esc(v.label)}</h3>` : ''}<div class="number-graphic">${graphic}</div>${legend}${v.stateLabel ? `<p class="viz-state-label"><span aria-hidden="true">!</span> ${esc(v.stateLabel)}</p>` : ''}${expanded && v.caption ? `<p class="support">${esc(v.caption)}</p>` : ''}</div>`;
}
