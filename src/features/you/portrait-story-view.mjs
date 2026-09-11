import { esc, icon, button } from '../../design-system/templates.mjs';
import { cash } from '../../domain/money.mjs';
import { portraitStory } from './portrait-story.mjs';
import { traitGlyph } from './portrait.mjs';

function chart(card) {
  const c = card.chart;
  if (card.kind === 'flow') {
    const total = c.parts.reduce((n, p) => n + p.value, 0) || 1;
    return `<div class="ps-flow" aria-label="Monthly saving allocation"><div class="ps-flow-bar">${c.parts.map((p, i) => `<i style="flex:${p.value / total};--part:${['#4D8590', '#8E7FA6', '#C6854E', '#B87989'][i % 4]}"></i>`).join('')}</div><div class="ps-flow-key">${c.parts.map((p, i) => `<span><i style="--part:${['#4D8590', '#8E7FA6', '#C6854E', '#B87989'][i % 4]}"></i><b>${cash(p.value)}</b><small>${esc(p.label)}</small></span>`).join('')}</div></div>`;
  }
  if (card.kind === 'rhythm')
    return `<div class="ps-rhythm" role="img" aria-label="${c.count} consecutive ${c.count === 9 ? 'years' : 'months'}"><div class="ps-rhythm-line">${Array.from({ length: c.count }, (_, i) => `<span style="--beat:${i}">${icon('check')}</span>`).join('')}</div><div class="ps-chart-axis"><span>${esc(c.start)}</span><span>${esc(c.end)}</span></div></div>`;
  if (card.kind === 'compare') {
    const max = Math.max(...c.parts.map((p) => p.value), 1);
    return `<div class="ps-comparison">${c.parts.map((p) => `<div><span>${esc(p.label)}</span><div><i style="width:${(p.value / max) * 100}%"></i></div><b>${cash(p.value, true)}</b></div>`).join('')}</div>`;
  }
  if (card.kind === 'ring')
    return `<div class="ps-target"><svg viewBox="0 0 104 104" aria-label="${Math.round(c.ratio * 100)}% of the safety net target" role="img"><circle cx="52" cy="52" r="43" class="ps-ring-track"/><circle cx="52" cy="52" r="43" pathLength="100" stroke-dasharray="${c.ratio * 100} 100" class="ps-ring-value"/><text x="52" y="51" text-anchor="middle">${Math.round(c.ratio * 100)}%</text><text x="52" y="68" text-anchor="middle" class="ps-ring-caption">of goal</text></svg><span>${traitGlyph(card.trait)}<b>A sense of<br>breathing room</b></span></div>`;
  if (card.kind === 'constellation')
    return `<div class="ps-priority-map" aria-label="Your chosen goals">${c.parts.map((p, i) => `<span style="--order:${i}">${icon(p.icon)}${esc(p.label)}</span>`).join('')}</div>`;
  if (card.kind === 'shape') return `<div class="ps-shared-shape">${traitGlyph(card.trait)}</div>`;
  if (card.kind === 'starting')
    return `<div class="ps-starting-art" aria-hidden="true">${icon('wallet')}<i></i>${icon('edit')}<i></i>${icon('spark')}</div>`;
  return '';
}
const style = (c) => `--signal:${c.color};--signal-light:${c.light}`;
export function portraitInterpretationsView(p, s) {
  const m = portraitStory(p, s.member);
  return `<section class="portrait-interpretations" data-portrait-story="${esc(m.member)}"><div class="ps-section-heading"><h3>How we read the picture</h3></div><div class="ps-tiles">${m.cards.map((c) => `<button class="ps-tile ps-interpretation" data-action="portrait-signal:${c.id}" data-support-topic="${c.id}" style="${style(c)}"><span class="ps-tile-top"><span>${esc(c.label)}</span>${icon('arrow')}</span><h3>${esc(c.title)}</h3><div class="ps-interpretation-body">${c.trait ? traitGlyph(c.trait) : icon('spark')}<p>${esc(c.note || c.meaning)}</p></div><span class="ps-trait">${esc(c.note ? 'Your perspective added' : c.trait ? 'Part of your ' + c.trait.toLowerCase() : 'Still taking shape')}</span></button>`).join('')}</div>${m.own && p.ui.portraitNotes?.overall ? `<section class="ps-own-perspective"><span class="eyebrow">YOU ADDED</span><blockquote>${esc(p.ui.portraitNotes.overall.text)}</blockquote>${button('Edit your perspective', 'portrait-note:overall', 'text')}</section>` : ''}</section>`;
}

export function portraitSignalView(p, s, id) {
  const m = portraitStory(p, s.member),
    c = m.cards.find((x) => x.id === id);
  if (!c) return portraitInterpretationsView(p, s);
  return `<div class="portrait-signal" style="${style(c)}"><div class="ps-signal-heading"><span class="ps-trait">${c.trait ? traitGlyph(c.trait) : icon('spark')}${esc(c.trait || 'A first outline')}</span><h2>${esc(c.title)}</h2></div><section class="ps-evidence-chart ps-${c.kind}">${c.kind === 'quote' ? `<blockquote>${esc(c.value)}</blockquote>` : c.value ? `<div class="ps-stat"><strong>${esc(c.value)}</strong><span>${esc(c.unit)}</span></div>` : ''}${chart(c)}</section><section class="ps-reading"><span class="eyebrow">WHAT WE OBSERVED</span><p>${esc(c.observation)}</p>${c.chart.answers?.length ? `<div class="ps-answers">${c.chart.answers.map((a) => `<article><small>${esc(a.question)}</small><b>${esc(a.answer)}</b></article>`).join('')}</div>` : ''}<small>${esc(c.source)}</small></section><section class="ps-reading"><span class="eyebrow">WHAT IT COULD MEAN</span><p>${esc(c.meaning)}</p></section>${c.note ? `<section class="ps-own-perspective"><span class="eyebrow">YOUR PERSPECTIVE</span><blockquote>${esc(c.note)}</blockquote><p>Kept alongside the observation as this picture develops.</p></section>` : ''}<section class="ps-reading"><span class="eyebrow">WHAT WE KEEP NOTICING</span><p>${esc(c.watch)}</p></section>${m.own ? `<div class="ps-signal-actions">${button(c.note ? 'Edit your perspective' : 'Add your perspective', 'portrait-note:' + id, 'primary wide')}${button('Talk it through', 'support:discuss', 'text wide')}</div>` : ''}</div>`;
}

export function portraitNoteView(p, s, id) {
  const m = portraitStory(p, s.member),
    c = m.cards.find((x) => x.id === id);
  return `<form class="ps-note-form" id="portrait-note-form"><div><span class="ps-trait">${icon('edit')}YOUR PERSPECTIVE</span><h2>What’s the story<br>behind the pattern?</h2>${c ? `<p class="ps-note-context">${esc(c.note || c.meaning)}</p>` : '<p>Tell us what feels right, what has changed, or what this picture has missed.</p>'}<label class="field">In your own words<textarea id="portrait-note" name="note" rows="5" maxlength="600" required placeholder="For me, it’s more about…">${esc(p.ui.portraitNotes?.[id]?.text || '')}</textarea></label></div><footer><p>Your words stay with this interpretation.</p>${button('Save my perspective', 'portrait-note-save:' + id, 'primary wide', 'type="button"')}</footer></form>`;
}
