import { esc, button, icon } from '../../design-system/templates.mjs';
const elenaPhoto = '/assets/backgrounds/elena-family.png';
export function nowPhoto(p) {
  const choice = p.ui.nowBackground;
  if (choice?.kind === 'plain') return '';
  if (
    choice?.kind === 'photo' &&
    /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(choice.src)
  )
    return choice.src;
  return p.l1.customer.id === 'elena' ? elenaPhoto : '';
}
export const nowBackdrop = (p) =>
  nowPhoto(p)
    ? `<div class="now-backdrop" aria-hidden="true"><img src="${esc(nowPhoto(p))}" alt="" draggable="false"></div>`
    : '';
export function nowBackgroundSettings(p) {
  const photo = nowPhoto(p);
  return `<div class="now-background-settings"><h1>A little more you.</h1><p>A favourite place. Your favourite people. Make Now feel like home.</p><div class="now-background-preview ${photo ? 'has-photo' : ''}" aria-label="${photo ? 'Your current background photo' : 'Plain background'}">${photo ? `<img src="${esc(photo)}" alt="Your selected Now background">` : icon('home')}<span>${photo ? 'Your Now background' : 'Simple and quiet'}</span></div><p class="support">We’ll soften and tint your photo to keep your money easy to read.</p><input id="now-photo-input" type="file" accept="image/jpeg,image/png,image/webp" hidden>${button(photo ? 'Choose another photo' : 'Choose a photo', 'now-background-choose', 'primary wide')}<div class="now-background-options">${photo ? button('Use a plain background', 'now-background-plain', 'text') : ''}${p.l1.customer.id === 'elena' && p.ui.nowBackground ? button('Restore family photo', 'now-background-default', 'text') : ''}</div><small>Your photo stays in this demo on this device.</small></div>`;
}
// Decode locally, downsize for device storage and discard camera metadata.
export async function readBackgroundPhoto(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    throw new Error('Choose a JPEG, PNG or WebP photo.');
  if (file.size > 8 * 1024 * 1024) throw new Error('Choose a photo smaller than 8 MB.');
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    const scale = Math.min(1, 1440 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#242527';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  } catch {
    throw new Error('That photo could not be opened. Try another.');
  } finally {
    URL.revokeObjectURL(url);
  }
}
