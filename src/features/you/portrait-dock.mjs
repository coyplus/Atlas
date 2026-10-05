// Shared sheet snapshots keep the dock alongside the scroller, so returning from
// a reflection restores the same article and reading position.
export function splitPortraitDock(body) {
  const start = body.indexOf('<div class="portrait-engagement-dock">');
  if (start < 0) return { content: body, dock: '' };
  const end = body.indexOf('</div>', start) + 6;
  return { content: body.slice(0, start) + body.slice(end), dock: body.slice(start, end) };
}
let installed = false;
export function installPortraitDock() {
  if (installed) return;
  const overlay = document.querySelector('#overlay');
  if (!overlay) return;
  installed = true;
  const update = () => {
    const dock = overlay.querySelector('.sheet > .portrait-engagement-dock');
    if (!dock) return;
    const sheet = dock.parentElement;
    const review = sheet.querySelector('.portrait-review');
    const body = sheet.querySelector('.sheet-body');
    if (review && body)
      dock.hidden = review.getBoundingClientRect().top < body.getBoundingClientRect().bottom - 100;
  };
  overlay.addEventListener('scroll', update, true);
  new MutationObserver(update).observe(overlay, { childList: true, subtree: true });
  window.addEventListener('resize', update);
  update();
}
