import { esc, icon, button } from '../../design-system/templates.mjs';
export const potColours = {
  blue: ['Coast', '#477895'],
  clay: ['Clay', '#a0674f'],
  sand: ['Sand', '#d4b786'],
  rose: ['Rose', '#ad617d'],
  plum: ['Plum', '#806899'],
  lilac: ['Lilac', '#b5a2cb'],
  peach: ['Apricot', '#d7ac92'],
  slate: ['Slate', '#9cabb7'],
};
const assetPhotos = new Set([
  '/assets/stories/horizon.jpg',
  '/assets/stories/cooking.jpg',
  '/assets/backgrounds/elena-family.png',
]);
export function safePotPhoto(src) {
  return typeof src === 'string' &&
    (assetPhotos.has(src) || /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(src))
    ? src
    : '';
}
// Purpose colours reuse the infographic library; custom choices always win.
function purposeColour(item) {
  const name = item.name || '';
  if (item.isDebt || /loan|credit/i.test(name)) return 'clay';
  if (item.growthAnnual || /invest|pension|retirement|later choices/i.test(name)) return 'plum';
  if (/education|learn|career|ella|next chapter/i.test(name)) return 'lilac';
  if (/friends|social|together|giving/i.test(name)) return 'rose';
  if (/business|my own|work|freedom/i.test(name)) return 'sand';
  if (/holiday|travel|trip|adventure|time away/i.test(name)) return 'peach';
  if (/home|house|deposit/i.test(name)) return 'slate';
  return (
    { sun: 'peach', users: 'rose', spark: 'lilac', bolt: 'sand', trend: 'plum', home: 'slate' }[
      item.visualIcon
    ] || 'blue'
  );
}
// Select the higher-contrast ink, using sRGB relative luminance (not a brightness guess).
export function contrastInk(hex) {
  const rgb = hex
    .replace('#', '')
    .match(/.{2}/g)
    .map((v) => parseInt(v, 16) / 255);
  const [r, g, b] = rgb.map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return (luminance + 0.05) / 0.05 >= 1.05 / (luminance + 0.05) ? '#000000' : '#ffffff';
}
export function potAppearance(p, item) {
  const a = p.ui.potAppearance?.[item.id] || item.appearance || {};
  return {
    colour: potColours[a.colour] ? a.colour : purposeColour(item),
    photo: safePotPhoto(a.photo),
  };
}
export function appearanceStyle(a) {
  const colour = potColours[a.colour]?.[1] || potColours.blue[1];
  return `--pot-colour:${colour};--pot-ink:${contrastInk(colour)};`;
}
export function potColourControl(p, item) {
  const a = potAppearance(p, item);
  return `<div class="pot-appearance-tools"><details class="pot-colour-control"><summary><i class="pot-colour-dot" aria-hidden="true"></i><span>Pot colour · <b>${potColours[a.colour][0]}</b></span>${icon('chev')}</summary><div class="pot-inline-colours" aria-label="Choose a Pot colour">${Object.entries(
    potColours,
  )
    .map(
      ([key, [name, colour]]) =>
        `<button type="button" style="--swatch:${colour};--pot-ink:${contrastInk(colour)}" data-action="pot-appearance-pick:${esc(item.id)}:${key}" aria-label="${name}" aria-pressed="${key === a.colour}">${icon('check')}</button>`,
    )
    .join(
      '',
    )}</div></details><button class="pot-personalise-link" data-action="pot-personalise:${esc(item.id)}" aria-label="Personalise photo"><span>Photo</span></button></div>`;
}
export function potBackdrop(p, item) {
  const a = potAppearance(p, item);
  return a.photo
    ? `<div class="pot-backdrop" aria-hidden="true"><img src="${esc(a.photo)}" alt="" draggable="false"></div>`
    : '';
}
export function potAppearanceView(p, item, draft) {
  const a = draft || potAppearance(p, item);
  return `<div class="pot-personalisation" data-pot="${esc(item.id)}"><h2>Make it feel<br>like yours.</h2><p>A favourite place. A reason to look forward.</p><div class="pot-appearance-preview ${a.photo ? 'has-photo' : ''}" style="${appearanceStyle(a)}">${a.photo ? `<img src="${esc(a.photo)}" alt="Your chosen Pot photo">` : ''}<span>${icon('target')}<b>${esc(item.name)}</b></span></div><fieldset class="pot-colours"><legend>A colour for this Pot</legend>${Object.entries(
    potColours,
  )
    .map(
      ([key, [name, colour]]) =>
        `<button type="button" style="--swatch:${colour};--pot-ink:${contrastInk(colour)}" data-action="pot-appearance-colour:${key}" aria-label="${name}" aria-pressed="${a.colour === key}">${a.colour === key ? icon('check') : ''}</button>`,
    )
    .join(
      '',
    )}</fieldset><input id="pot-photo-input" type="file" accept="image/jpeg,image/png,image/webp" hidden>${button(a.photo ? 'Choose another photo' : 'Add a photo', 'pot-appearance-choose', 'secondary wide')}${a.photo ? button('Remove photo', 'pot-appearance-remove', 'text wide') : ''}<small>Your photo stays on this device. Colour and photo never change your money.</small>${button('Save appearance', 'pot-appearance-save', 'primary wide')}</div>`;
}
