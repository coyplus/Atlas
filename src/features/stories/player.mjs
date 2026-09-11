/** One clock for the active viewer. Overlay changes suspend it without losing reading position. */
export function createStoryPlayer(getPerson, dispatch) {
  let node = null,
    frame = 0,
    last = 0,
    record = null,
    activeKey = null,
    manualPause = false,
    held = false,
    pointer = null,
    suppressClickUntil = 0;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)') || { matches: true };
  const requestFrame = window.requestAnimationFrame?.bind(window) || (() => 0);
  const cancelFrame = window.cancelAnimationFrame?.bind(window) || (() => {});
  let pausedForMotion = reduced.matches;
  const current = () =>
    [...document.querySelectorAll('.story-shell .story-viewer')].find(
      (el) => !el.closest('[inert]'),
    ) || null;
  const blocked = () =>
    manualPause ||
    pausedForMotion ||
    held ||
    document.hidden ||
    !!node?.closest('[inert]') ||
    !!document.querySelector('.demo-menu-layer');
  function paint() {
    if (!node || !record) return;
    const step = Number(node.dataset.step),
      duration = Number(node.dataset.duration);
    node.querySelectorAll('.story-pagination i').forEach((fill, index) => {
      const progress =
        index < step || (index === step && duration === 0)
          ? 1
          : index === step && duration > 0
            ? Math.min(1, record.elapsed / duration)
            : 0;
      fill.style.transform = `scaleX(${progress})`;
    });
    const button = document.querySelector('[data-story-toggle]');
    const label = blocked() ? 'Play story' : 'Pause story';
    if (button && button.getAttribute('aria-label') !== label) {
      button.setAttribute('aria-label', label);
      button.title = label;
      button.querySelector('[data-pause-icon]').hidden = blocked();
      button.querySelector('[data-play-icon]').hidden = !blocked();
    }
    node.dataset.paused = String(blocked());
  }
  function tick(time) {
    frame = 0;
    if (!node?.isConnected || current() !== node) {
      sync();
      return;
    }
    if (last && !blocked()) record.elapsed += Math.min(100, time - last);
    last = time;
    paint();
    if (Number(node.dataset.duration) > 0 && record.elapsed >= Number(node.dataset.duration)) {
      dispatch('story-step:' + (Number(node.dataset.step) + 1));
      return;
    }
    frame = requestFrame(tick);
  }
  function sync() {
    const next = current();
    const phone = document.querySelector('#phone');
    const visibleStory = next || document.querySelector('.story-underlay .story-viewer');
    phone?.classList.toggle('has-story', !!visibleStory);
    phone?.classList.toggle('has-story-plate', !!visibleStory?.classList.contains('story-plate'));
    const key = next ? `${next.dataset.person}/${next.dataset.story}/${next.dataset.step}` : null;
    const nextRecord = next && getPerson().ui.storyVisits?.[next.dataset.story];
    if (next === node && key === activeKey && nextRecord === record) {
      paint();
      return;
    }
    cancelFrame(frame);
    frame = 0;
    last = 0;
    held = false;
    pointer = null;
    node = next;
    activeKey = key;
    if (!node) {
      record = null;
      return;
    }
    const p = getPerson();
    p.ui.storyVisits ||= {};
    record = p.ui.storyVisits[node.dataset.story] ||= { step: 0, elapsed: 0 };
    if (record.step !== Number(node.dataset.step)) {
      record.elapsed = 0;
      record.step = Number(node.dataset.step);
    }
    paint();
    if (Number(node.dataset.duration) > 0) frame = requestFrame(tick);
  }
  function refresh() {
    sync();
  }
  const observer = new MutationObserver(refresh);
  observer.observe(document.querySelector('#app'), { childList: true, subtree: true });
  const abort = new AbortController(),
    options = { signal: abort.signal };
  document.addEventListener(
    'visibilitychange',
    () => {
      last = 0;
      paint();
    },
    options,
  );
  reduced.addEventListener?.(
    'change',
    () => {
      pausedForMotion = reduced.matches;
      paint();
    },
    options,
  );
  document.addEventListener(
    'click',
    (e) => {
      if (e.target.closest('[data-story-toggle]')) {
        manualPause = !blocked();
        pausedForMotion = false;
        held = false;
        last = 0;
        paint();
      }
    },
    options,
  );
  document.addEventListener(
    'click',
    (event) => {
      if (performance.now() < suppressClickUntil && event.target.closest('.story-shell')) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    { ...options, capture: true },
  );
  document.addEventListener(
    'keydown',
    (e) => {
      if (!node || /input|textarea|select/i.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const step = Number(node.dataset.step) + (e.key === 'ArrowRight' ? 1 : -1);
        if (step >= 0 && step < 3) dispatch('story-step:' + step);
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        dispatch('story-shift:' + (e.key === 'ArrowUp' ? 1 : -1));
      } else if (e.code === 'Space' && !e.target.closest('button,a')) {
        e.preventDefault();
        manualPause = !blocked();
        pausedForMotion = false;
        paint();
      } else if (e.key === 'Tab') {
        // Keyboard exploration should never be raced by a timer. Play explicitly to resume.
        manualPause = true;
        paint();
      }
    },
    options,
  );
  document.addEventListener(
    'pointerdown',
    (e) => {
      if (!node?.contains(e.target) || !e.target.closest('.story-page') || !e.isPrimary) return;
      const page = e.target.closest('.story-page');
      pointer = {
        x: e.clientX,
        y: e.clientY,
        id: e.pointerId,
        page,
        scroll: page.scrollTop,
        atTop: page.scrollTop <= 2,
        atBottom: page.scrollTop + page.clientHeight >= page.scrollHeight - 2,
      };
      held = true;
      paint();
    },
    options,
  );
  document.addEventListener(
    'pointermove',
    (e) => {
      if (!pointer || pointer.id !== e.pointerId) return;
      const dx = e.clientX - pointer.x,
        dy = e.clientY - pointer.y;
      // On short screens, scroll the page first. Only an outward swipe from an edge changes Story.
      if (Math.abs(dy) > Math.abs(dx) * 1.3 && !(dy > 0 ? pointer.atTop : pointer.atBottom)) {
        pointer.page.scrollTop = pointer.scroll - dy;
      }
    },
    options,
  );
  document.addEventListener(
    'dragstart',
    (e) => {
      if (e.target.closest('.story-viewer')) e.preventDefault();
    },
    options,
  );
  document.addEventListener(
    'pointerup',
    (e) => {
      if (!pointer || pointer.id !== e.pointerId || !node) return;
      const dx = e.clientX - pointer.x,
        dy = e.clientY - pointer.y;
      const verticalEdge = dy < 0 ? pointer.atBottom : pointer.atTop;
      pointer = null;
      held = false;
      last = 0;
      if (Math.hypot(dx, dy) > 12) suppressClickUntil = performance.now() + 400;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        suppressClickUntil = performance.now() + 400;
        const step = Number(node.dataset.step) + (dx < 0 ? 1 : -1);
        if (step >= 0 && step < 3) dispatch('story-step:' + step);
      } else if (verticalEdge && Math.abs(dy) > 70 && Math.abs(dy) > Math.abs(dx) * 1.3) {
        dispatch('story-shift:' + (dy < 0 ? 1 : -1));
      }
      paint();
    },
    options,
  );
  document.addEventListener(
    'pointercancel',
    () => {
      pointer = null;
      held = false;
      last = 0;
      paint();
    },
    options,
  );
  window.addEventListener('atlas:change', refresh, options);
  return {
    sync: refresh,
    dispose() {
      cancelFrame(frame);
      observer.disconnect();
      abort.abort();
    },
  };
}
