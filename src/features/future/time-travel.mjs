import { esc } from '../../design-system/templates.mjs';
export function timeTravel({ id = 'time-slider', name, month, label, horizon = 240 }) {
  return `<div class="future-time-track" style="--time-progress:${(month / horizon) * 100}%;--time-inset:${38 - (38 * month) / horizon}px"><span class="future-time-fill" aria-hidden="true"><span class="future-starlight"></span></span><input type="range" id="${esc(id)}" ${name ? `name="${esc(name)}"` : ''} min="0" max="${horizon}" step="1" value="${month}" aria-label="Explore your future in months" aria-valuetext="${esc(label)}"></div>`;
}
