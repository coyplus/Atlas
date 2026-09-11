/** Keep the composer above the software keyboard without resizing desktop presentation. */
export function installViewport() {
  const update = () => {
    const focused = document.activeElement?.matches('input,textarea,select');
    const viewport = window.visualViewport;
    if (
      matchMedia('(max-width:730px), (hover:none) and (pointer:coarse)').matches &&
      focused &&
      viewport &&
      viewport.scale === 1
    )
      document.documentElement.style.setProperty('--app-height', viewport.height + 'px');
    else document.documentElement.style.removeProperty('--app-height');
  };
  window.visualViewport?.addEventListener('resize', update);
  document.addEventListener('focusin', update);
  document.addEventListener('focusout', () => requestAnimationFrame(update));
}

export function syncThemeChrome() {
  const phone = document.querySelector('#phone');
  if (!phone) return;
  const canvas =
    phone.querySelector('.story-shell .story-plate') &&
    !phone.querySelector('.story-evidence-shell')
      ? '#1b201f'
      : getComputedStyle(phone).getPropertyValue('--canvas').trim();
  if (canvas) document.querySelector('meta[name="theme-color"]')?.setAttribute('content', canvas);
}
