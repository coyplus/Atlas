import '../design-system/fonts.css';
import './deck.css';
import { slides } from './slides';
import { materialIcons, materialViewBoxes } from '../design-system/icons.mjs';
const main = document.querySelector<HTMLElement>('#deck')!;
main.innerHTML = slides
  .map(
    (slide, i) =>
      `<section class="slide ${slide.theme}" id="slide-${i + 1}" aria-label="${i + 1} of ${slides.length}: ${slide.title}" aria-roledescription="slide" tabindex="-1" hidden>${slide.content}</section>`,
  )
  .join('');
document.querySelectorAll<HTMLElement>('[data-icon]').forEach((el) => {
  const name = el.dataset.icon as keyof typeof materialIcons;
  el.innerHTML = `<svg class="deck-icon" aria-hidden="true" viewBox="${materialViewBoxes[name]}">${materialIcons[name]}</svg>`;
});
const pages = [...main.querySelectorAll<HTMLElement>('.slide')];
const menu = document.querySelector<HTMLDialogElement>('#slide-menu')!;
const next = document.querySelector<HTMLButtonElement>('#next')!;
const previous = document.querySelector<HTMLButtonElement>('#previous')!;
const counter = document.querySelector<HTMLElement>('#counter')!;
const progress = document.querySelector<HTMLElement>('.deck-progress span')!;
let current = -1;
const scrollCue = document.querySelector<HTMLElement>('#scroll-cue')!;
function updateScrollCue() {
  scrollCue.hidden = main.scrollHeight - main.clientHeight - main.scrollTop < 40;
}
main.addEventListener('scroll', updateScrollCue, { passive: true });
window.addEventListener('resize', updateScrollCue);
const numberFromHash = () => {
  const number = Number(location.hash.slice(1));
  return Number.isInteger(number) && number >= 1 && number <= slides.length ? number - 1 : 0;
};
function show(index: number, focus = true) {
  const target = Math.max(0, Math.min(slides.length - 1, index));
  if (target === current) return;
  if (current >= 0) pages[current].hidden = true;
  current = target;
  const slide = slides[current];
  pages[current].hidden = false;
  main.scrollTo({ top: 0, behavior: 'instant' });
  document.body.dataset.theme = slide.theme.split(' ')[0];
  document.title = `${current + 1}. ${slide.title} · HSBC Atlas`;
  counter.textContent = `${String(current + 1).padStart(2, '0')} / ${slides.length}`;
  previous.disabled = current === 0;
  next.disabled = current === slides.length - 1;
  progress.style.width = `${((current + 1) / slides.length) * 100}%`;
  menu.querySelectorAll('button[data-slide]').forEach((button) => {
    button.setAttribute(
      'aria-current',
      String(Number((button as HTMLElement).dataset.slide) === current),
    );
  });
  history.replaceState(null, '', `#${current + 1}`);
  if (focus) pages[current].focus({ preventScroll: true });
  requestAnimationFrame(updateScrollCue);
}
menu.querySelector('nav')!.innerHTML = slides
  .map(
    (slide, i) =>
      `<button data-slide="${i}"><span>${String(i + 1).padStart(2, '0')}</span><div><small>${slide.stage}</small><b>${slide.title}</b></div></button>`,
  )
  .join('');
menu.addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLElement>('[data-slide]');
  if (button) {
    menu.close();
    show(Number(button.dataset.slide));
  } else if (event.target === menu) {
    const rect = menu.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      menu.close();
  }
});
document.querySelector('#contents')!.addEventListener('click', () => menu.showModal());
document.querySelector('#menu-close')!.addEventListener('click', () => menu.close());
previous.addEventListener('click', () => show(current - 1));
next.addEventListener('click', () => show(current + 1));
window.addEventListener('hashchange', () => show(numberFromHash()));
document.addEventListener('keydown', (event) => {
  if (
    menu.open ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    (event.target as Element).matches('input,textarea,select')
  )
    return;
  const move = (
    {
      ArrowRight: current + 1,
      PageDown: current + 1,
      ArrowLeft: current - 1,
      PageUp: current - 1,
      Home: 0,
      End: slides.length - 1,
    } as Record<string, number>
  )[event.key];
  if (move !== undefined) {
    event.preventDefault();
    show(move);
  }
});
let touch: { x: number; y: number } | null = null;
main.addEventListener(
  'touchstart',
  (event) => {
    touch =
      event.touches.length === 1 && !(event.target as Element).closest('a,button')
        ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
        : null;
  },
  { passive: true },
);
main.addEventListener(
  'touchend',
  (event) => {
    if (!touch || event.changedTouches.length !== 1) return;
    const dx = event.changedTouches[0].clientX - touch.x;
    const dy = event.changedTouches[0].clientY - touch.y;
    touch = null;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) show(current + (dx < 0 ? 1 : -1));
  },
  { passive: true },
);
main.addEventListener(
  'touchcancel',
  () => {
    touch = null;
  },
  { passive: true },
);
document.querySelectorAll<HTMLAnchorElement>('a[data-demo]').forEach((link) => {
  link.addEventListener('click', () => {
    try {
      sessionStorage.setItem('atlas-welcome-seen', 'yes');
    } catch {
      /* Navigation still works without storage. */
    }
  });
});
show(numberFromHash(), false);
