import { balanceScale, packBalances, separateHitAreas } from './layout.mjs';
export function createFutureChart() {
  let stage,
    abort,
    observer,
    nodes = [],
    camera = { zoom: 1, x: 0, y: 0 },
    unit = 1,
    fit = 1,
    centre = { x: 0, y: 0 },
    viewportKey = '',
    personId,
    signature = '',
    suppressUntil = 0;
  const pointers = new Map();
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  function fitScale(baseline = false) {
    const rect = stage.getBoundingClientRect(),
      studio = stage.closest('.future-studio');
    const top = Math.max(
      20,
      (studio.querySelector('.fg-field-add')?.getBoundingClientRect().bottom || rect.top) -
        rect.top +
        16,
    );
    const bottom = Math.max(
      top + 80,
      stage.clientHeight -
        parseFloat(studio.style.getPropertyValue('--future-drawer-height') || '264') -
        24,
    );
    centre = { x: stage.clientWidth / 2, y: (top + bottom) / 2 };
    return Math.max(
      0.05,
      Math.min(
        (stage.clientWidth - 46) / Math.max(1, ...nodes.map((n) => 2 * (Math.abs(n.x) + n.radius))),
        (baseline ? Math.max(100, stage.clientHeight - 264 - top - 24) : bottom - top) /
          Math.max(1, ...nodes.map((n) => 2 * (Math.abs(n.y) + n.radius))),
      ),
    );
  }
  function layout() {
    if (!stage) return;
    const key = stage.clientWidth + ':' + stage.clientHeight;
    if (viewportKey !== key) {
      viewportKey = key;
      if (nodes.length) {
        fit = fitScale(true);
        camera = { zoom: 1, x: 0, y: 0 };
      }
    }
    paint();
  }
  function paint() {
    if (!stage) return;
    const scale = fit * camera.zoom,
      w = stage.clientWidth,
      h = stage.clientHeight;
    const bx = Math.max(w / 2, ...nodes.map((n) => (Math.abs(n.x) + n.radius) * scale)),
      by = Math.max(h / 2, ...nodes.map((n) => (Math.abs(n.y) + n.radius) * scale));
    camera.x = clamp(camera.x, -bx, bx);
    camera.y = clamp(camera.y, -by, by);
    for (const n of separateHitAreas(nodes, scale)) {
      const el = stage.querySelector(`[id="future-bubble-${CSS.escape(n.id)}"]`);
      if (!el) continue;
      const d = n.valueRadius * scale * 2,
        t = n.targetRadius * scale * 2,
        hit = Math.max(d, t, 28);
      el.style.left = `${centre.x + n.x + camera.x}px`;
      el.style.top = `${centre.y + n.y + camera.y}px`;
      el.style.width = el.style.height = `${hit}px`;
      el.style.setProperty('--value-d', `${d}px`);
      el.style.setProperty('--target-d', `${t}px`);
      el.dataset.labels = String(d >= (el.classList.contains('future-ghost') ? 72 : 112));
      el.dataset.empty = String(n.valueRadius === 0);
      el.dataset.compact = String(d < 56);
      el.dataset.icon = String(d >= 14 || n.valueRadius === 0);
    }
    stage.dataset.zoom = String(camera.zoom);
    stage.querySelector('[data-chart="out"]')?.toggleAttribute('disabled', camera.zoom <= 0.4);
    stage.querySelector('[data-chart="in"]')?.toggleAttribute('disabled', camera.zoom >= 32);
  }
  function zoom(factor, x = centre.x, y = centre.y) {
    const old = camera.zoom,
      next = clamp(old * factor, 0.4, 32),
      r = next / old;
    camera.x = (camera.x - (x - centre.x)) * r + (x - centre.x);
    camera.y = (camera.y - (y - centre.y)) * r + (y - centre.y);
    camera.zoom = next;
    paint();
  }
  function control(action) {
    if (!stage) return;
    if (action === 'fit') {
      fit = fitScale();
      camera = { zoom: 1, x: 0, y: 0 };
      paint();
    } else zoom(action === 'in' ? 1.4 : 1 / 1.4);
  }
  function bind(el) {
    abort?.abort();
    observer?.disconnect();
    pointers.clear();
    stage = el;
    if (!el) return;
    abort = new AbortController();
    const options = { signal: abort.signal };
    let gesture = null;
    const point = (e) => ({ x: e.clientX, y: e.clientY });
    const geometry = () => {
      const ps = [...pointers.values()];
      return ps.length > 1
        ? {
            x: (ps[0].x + ps[1].x) / 2,
            y: (ps[0].y + ps[1].y) / 2,
            d: Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y),
          }
        : { ...ps[0], d: 0 };
    };
    el.addEventListener(
      'pointerdown',
      (e) => {
        if (e.target.closest('[data-chart],.fg-field-add,.future-canvas-reset') || e.button > 0)
          return;
        pointers.set(e.pointerId, point(e));
        gesture = { ...geometry(), moved: false };
      },
      options,
    );
    el.addEventListener(
      'pointermove',
      (e) => {
        if (!pointers.has(e.pointerId) || !gesture) return;
        pointers.set(e.pointerId, point(e));
        const next = geometry();
        if (
          !gesture.moved &&
          pointers.size === 1 &&
          Math.hypot(next.x - gesture.x, next.y - gesture.y) < 5
        )
          return;
        e.preventDefault();
        el.setPointerCapture(e.pointerId);
        el.classList.add('is-manipulating');
        if (next.d && gesture.d) {
          const rect = el.getBoundingClientRect();
          zoom(next.d / gesture.d, next.x - rect.left, next.y - rect.top);
        }
        camera.x += next.x - gesture.x;
        camera.y += next.y - gesture.y;
        paint();
        gesture = { ...next, moved: true };
        suppressUntil = Date.now() + 500;
      },
      options,
    );
    const end = (e) => {
      pointers.delete(e.pointerId);
      gesture = pointers.size ? { ...geometry(), moved: true } : null;
      if (!pointers.size) el.classList.remove('is-manipulating');
    };
    el.addEventListener('pointerup', end, options);
    el.addEventListener('pointercancel', end, options);
    el.addEventListener(
      'click',
      (e) => {
        const action = e.target.closest('[data-chart]')?.dataset.chart;
        if (action) {
          e.stopPropagation();
          control(action);
        } else if (Date.now() < suppressUntil) {
          e.preventDefault();
          e.stopPropagation();
        }
      },
      { ...options, capture: true },
    );
    el.addEventListener(
      'wheel',
      (e) => {
        if (!e.ctrlKey && !e.metaKey) return;
        e.preventDefault();
        e.stopPropagation();
        const r = el.getBoundingClientRect();
        zoom(Math.exp(-e.deltaY * 0.008), e.clientX - r.left, e.clientY - r.top);
      },
      { ...options, passive: false },
    );
    el.addEventListener(
      'keydown',
      (e) => {
        if (e.key === '+' || e.key === '=') control('in');
        else if (e.key === '-') control('out');
        else if (e.key === 'Home') control('fit');
        else if (e.target === el && e.key.startsWith('Arrow')) {
          camera.x += e.key === 'ArrowLeft' ? 30 : e.key === 'ArrowRight' ? -30 : 0;
          camera.y += e.key === 'ArrowUp' ? 30 : e.key === 'ArrowDown' ? -30 : 0;
          paint();
        } else return;
        e.preventDefault();
      },
      options,
    );
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(layout);
      observer.observe(el);
    }
  }
  return {
    sync(p, model) {
      const el = document.querySelector('#future-stage');
      if (el !== stage) bind(el);
      if (!el) return;
      if (personId !== p.l1.customer.id) {
        personId = p.l1.customer.id;
        nodes = [];
        signature = '';
        camera = { zoom: 1, x: 0, y: 0 };
        unit = balanceScale(model.base.goals);
      }
      const chartGoals = [...model.next.goals, ...(model.ghosts || [])];
      const sig = JSON.stringify(chartGoals.map((g) => [g.id, model.next.values[g.id], g.target]));
      if (sig !== signature) {
        nodes = packBalances(chartGoals, model.next.values, unit, nodes);
        if (!signature) fit = fitScale(true);
        signature = sig;
      }
      paint();
    },
    control,
    layout,
    reframe() {
      if (!stage) return;
      fitScale();
      paint();
    },
  };
}
