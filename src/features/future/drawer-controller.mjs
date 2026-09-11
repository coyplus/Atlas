// A non-modal sheet: the canvas and main navigation remain available at every stop.
export function createFutureDrawer(onLayout) {
  let root, abort, observer, state, lastMode;
  const stops = ['docked', 'timeline', 'expanded'];
  function heights() {
    const h = root.clientHeight;
    root.dataset.short = String(h < 600);
    const top =
      root.querySelector('.fg-field-add')?.getBoundingClientRect().bottom -
        root.getBoundingClientRect().top || 170;
    // Measure the actual shared controls, including an invitation hidden in the
    // expanded state. Never clip the minimum state's entry to What If.
    const required =
      root.querySelector('.future-drawer-summary').offsetHeight +
      44 +
      (parseFloat(getComputedStyle(root.querySelector('.future-drawer-invitation')).minHeight) ||
        48) +
      2;
    const max = Math.min(h - 16, Math.max(required, h - top - 14));
    return { docked: 44, timeline: Math.min(max, Math.max(264, required)), expanded: max };
  }

  function apply(height) {
    if (!root) return;
    const mode = state.drawer || 'timeline',
      sheet = root.querySelector('.future-drawer');
    root.dataset.drawer = mode;
    root.style.setProperty('--future-drawer-height', `${height ?? heights()[mode]}px`);
    sheet.dataset.state = mode;
    const expanded = mode === 'expanded',
      docked = mode === 'docked';
    const summary = root.querySelector('.future-drawer-summary');
    summary.inert = docked;
    summary.setAttribute('aria-hidden', String(docked));
    const body = root.querySelector('.future-drawer-body');
    body.inert = !expanded;
    body.setAttribute('aria-hidden', String(!expanded));
    const grip = root.querySelector('.future-drawer-grip');
    grip.setAttribute('aria-expanded', String(!docked));
    grip.setAttribute(
      'aria-label',
      docked
        ? 'Open Time Travel drawer'
        : expanded
          ? 'Collapse future drawer'
          : 'Expand future drawer',
    );
    const invitation = root.querySelector('.future-drawer-invitation');
    invitation.inert = expanded || docked;
    invitation.setAttribute('aria-hidden', String(expanded || docked));
  }
  function snap(mode) {
    state.drawer = stops.includes(mode) ? mode : 'timeline';
    root.classList.remove('drawer-dragging');
    apply();
    onLayout?.(true);
  }
  function bind(el) {
    abort?.abort();
    observer?.disconnect();
    root = el;
    if (!el) return;
    abort = new AbortController();
    const opts = { signal: abort.signal },
      grip = el.querySelector('.future-drawer-grip');
    let drag = null,
      suppress = 0;
    grip.addEventListener(
      'pointerdown',
      (e) => {
        if (e.button > 0) return;
        grip.setPointerCapture(e.pointerId);
        drag = {
          start: e.clientY,
          height: el.querySelector('.future-drawer').getBoundingClientRect().height,
          time: performance.now(),
          moved: false,
        };
      },
      opts,
    );
    grip.addEventListener(
      'pointermove',
      (e) => {
        if (!drag) return;
        const delta = drag.start - e.clientY;
        if (!drag.moved && Math.abs(delta) < 5) return;
        drag.moved = true;
        e.preventDefault();
        el.classList.add('drawer-dragging');
        const hs = heights();
        apply(Math.min(hs.expanded, Math.max(hs.docked, drag.height + delta)));
      },
      opts,
    );
    const end = (e) => {
      if (!drag) return;
      if (drag.moved) {
        suppress = Date.now() + 400;
        const hs = heights(),
          height = el.querySelector('.future-drawer').getBoundingClientRect().height,
          delta = drag.start - e.clientY,
          velocity = delta / Math.max(1, performance.now() - drag.time);
        const projected = height + velocity * 110;
        snap(
          stops.reduce(
            (best, s) => (Math.abs(hs[s] - projected) < Math.abs(hs[best] - projected) ? s : best),
            'timeline',
          ),
        );
      }
      drag = null;
      el.classList.remove('drawer-dragging');
    };
    grip.addEventListener('pointerup', end, opts);
    grip.addEventListener(
      'pointercancel',
      () => {
        drag = null;
        el.classList.remove('drawer-dragging');
        apply();
      },
      opts,
    );
    el.addEventListener(
      'click',
      (e) => {
        const target = e.target.closest('[data-drawer-to]');
        if (!target) return;
        e.stopPropagation();
        if (Date.now() < suppress) return;
        snap(
          target.dataset.drawerTo === 'toggle'
            ? state.drawer === 'docked'
              ? 'timeline'
              : state.drawer === 'expanded'
                ? 'timeline'
                : 'expanded'
            : target.dataset.drawerTo,
        );
      },
      opts,
    );
    grip.addEventListener(
      'keydown',
      (e) => {
        const i = stops.indexOf(state.drawer || 'timeline');
        if (e.key === 'ArrowUp') snap(stops[Math.min(stops.length - 1, i + 1)]);
        else if (e.key === 'ArrowDown') snap(stops[Math.max(0, i - 1)]);
        else if (e.key === 'Home') snap('docked');
        else if (e.key === 'End') snap('expanded');
        else return;
        e.preventDefault();
      },
      opts,
    );
    el.querySelector('.future-drawer').addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape') {
          snap('timeline');
          grip.focus();
          e.stopPropagation();
        }
      },
      opts,
    );
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        apply();
        onLayout?.();
      });
      observer.observe(el);
    }
  }
  return {
    sync(p) {
      const el = document.querySelector('.future-studio');
      if (el !== root) bind(el);
      if (!el) return;
      state =
        p.ui.future || (p.ui.future = { mode: 'view', ideas: [], messages: [], proposal: null });
      state.drawer = stops.includes(state.drawer) ? state.drawer : 'timeline';
      const phone = el.closest('.phone');
      phone.style.setProperty(
        '--future-nav-height',
        `${phone.querySelector('.tabbar').offsetHeight || 65}px`,
      );
      apply();
      const key = p.l1.customer.id + ':' + state.drawer;
      if (lastMode !== key) {
        el.querySelector('.future-drawer').scrollTop = 0;
        lastMode = key;
        queueMicrotask(() => {
          if (el.isConnected && root === el && !abort.signal.aborted) onLayout?.(true);
        });
      }
    },
    snap,
  };
}
