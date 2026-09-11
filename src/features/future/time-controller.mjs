// Keep the coloured track and native thumb on one inset scale. The stars live
// inside that fill; playback rate changes without restarting their phase.
export function createTimeTravel() {
  let track,
    animation,
    frame,
    media,
    personKey,
    month = 0,
    previousAt = 0,
    burst = 0;
  function rate() {
    const base = 0.4 + (month / 240) * 1.4;
    animation?.updatePlaybackRate(base + burst);
    if (track) track.dataset.warpRate = (base + burst).toFixed(2);
  }
  function decay() {
    if (!track?.isConnected) {
      animation?.cancel();
      frame = 0;
      return;
    }
    burst *= 0.9;
    rate();
    frame = burst > 0.02 ? requestAnimationFrame(decay) : 0;
    if (!frame) {
      burst = 0;
      rate();
    }
  }
  function motion() {
    animation?.cancel();
    animation = null;
    if (!track || media?.matches || !track.querySelector('.future-starlight')?.animate) return;
    animation = track
      .querySelector('.future-starlight')
      .animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-160px)' }], {
        duration: 6500,
        iterations: Infinity,
        easing: 'linear',
      });
    rate();
  }
  return {
    sync(value, person) {
      value = Math.max(0, Math.min(240, Math.round(Number(value) || 0)));
      const el = document.querySelector('.future-time-track');
      if (el !== track || person !== personKey) {
        personKey = person;
        animation?.cancel();
        if (frame) cancelAnimationFrame(frame);
        media?.removeEventListener?.('change', motion);
        track = el;
        media =
          typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
        media?.addEventListener?.('change', motion);
        month = value;
        burst = 0;
        previousAt = performance.now();
        frame = 0;
        motion();
      }
      if (!track) return;
      const slider = track.querySelector('input');
      if (slider) slider.value = String(value);
      const now = performance.now(),
        delta = Math.abs(value - month);
      if (delta && animation && !media?.matches) {
        burst = Math.min(2.4, (delta / Math.max(24, now - previousAt)) * 2);
        if (!frame) frame = requestAnimationFrame(decay);
      }
      month = value;
      previousAt = now;
      const fraction = Math.max(0, Math.min(1, value / 240));
      track.style.setProperty('--time-progress', `${fraction * 100}%`);
      track.style.setProperty('--time-inset', `${38 - 38 * fraction}px`);
      rate();
    },
  };
}
