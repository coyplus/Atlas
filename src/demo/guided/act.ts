/* Performs steps on one prototype frame. Visible mode shows the audience every tap, scroll and drag
   with a touch cue before the real control is used; instant mode rebuilds the same state silently. */
import type { DemoApi } from '../../app/contracts';

type AppWindow = Window & { atlas?: DemoApi };
export type Cue = {
  touch(x: number, y: number, label?: string): void;
  press(pressed: boolean): void;
  move(x: number, y: number): void;
  hide(): void;
  /** Point at something mid-step; null clears it. */
  point(spec: string | null, label?: string): void;
};
export type Act = ReturnType<typeof createAct>;

const CONTAINERS =
  'button,article,section,li,a,.chat-message,.voice-status,[class*="card"],[class*="module"],[class*="tile"],[class*="suggestion"]';
const visibleEl = (el: Element) =>
  (el as HTMLElement).offsetParent !== null || el.getClientRects().length > 0;

/** `selector`, `text:Words`, or `scope text:Words`; `|` joins alternatives for pointers. */
export function find(
  doc: Document,
  spec: string,
  purpose: 'tap' | 'point' | 'scroll' = 'tap',
): HTMLElement | null {
  const at = spec.indexOf('text:');
  if (at < 0) return [...doc.querySelectorAll<HTMLElement>(spec)].find(visibleEl) || null;
  const scope = at > 0 ? doc.querySelector<HTMLElement>(spec.slice(0, at).trim()) : doc.body;
  const text = spec.slice(at + 5).toLowerCase();
  if (!scope) return null;
  const includes = (el: Element) =>
    ((el as HTMLElement).innerText || '').toLowerCase().includes(text);
  // The innermost elements holding the words; their ancestors hold them too.
  const leaves = [...scope.querySelectorAll<HTMLElement>('*')].filter(
    (el) => visibleEl(el) && includes(el) && ![...el.children].some(includes),
  );
  // Prefer what the audience can see: an open sheet over the page behind it, then an on-screen match.
  const sheet = doc.querySelector('#overlay .sheet');
  const onScreen = (el: Element) => {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < 844;
  };
  const inSheet = sheet ? leaves.filter((el) => sheet.contains(el)) : [];
  const pool = inSheet.length ? inSheet : leaves;
  const leaf = pool.find(onScreen) || pool[0];
  if (!leaf || purpose === 'scroll') return leaf || null;
  if (purpose === 'tap')
    return leaf.closest<HTMLElement>('button,a,[role="button"],[data-action]') || leaf;
  const box = leaf.closest<HTMLElement>(CONTAINERS),
    r = box?.getBoundingClientRect();
  return box && r && r.width * r.height < 0.6 * 390 * 844 ? box : leaf;
}

/** The union of one or more targets, clipped to the phone screen. */
export function rectOf(doc: Document, spec: string) {
  const rects = spec
    .split('|')
    .map((s) => find(doc, s, 'point'))
    .filter((el): el is HTMLElement => !!el)
    .map((el) => el.getBoundingClientRect())
    .filter((r) => r.width && r.height);
  if (!rects.length) return null;
  const x = Math.max(4, Math.min(...rects.map((r) => r.left))),
    y = Math.max(4, Math.min(...rects.map((r) => r.top))),
    right = Math.min(386, Math.max(...rects.map((r) => r.right))),
    bottom = Math.min(840, Math.max(...rects.map((r) => r.bottom)));
  return bottom > y && right > x ? { x, y, w: right - x, h: bottom - y } : null;
}

export function createAct(opts: {
  frame: HTMLIFrameElement;
  visible: boolean;
  cue: Cue;
  alive: () => boolean;
  rush: () => boolean;
}) {
  const { frame, cue } = opts;
  const fast = !!(window as Window & { __ATLAS_TEST__?: boolean }).__ATLAS_TEST__;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const win = () => frame.contentWindow as AppWindow;
  const doc = () => frame.contentDocument!;
  const show = () => opts.visible && !opts.rush() && !fast;
  const check = () => {
    if (!opts.alive()) throw new DOMException('Beat changed', 'AbortError');
  };
  const sleep = async (ms: number) => {
    check();
    if (ms > 0) await new Promise((r) => setTimeout(r, fast ? Math.min(ms, 20) : ms));
    check();
  };
  async function animate(ms: number, draw: (t: number) => void) {
    if (!show() || reduced) return draw(1);
    const start = performance.now();
    for (;;) {
      check();
      const t = Math.min(1, (performance.now() - start) / ms);
      draw(t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
      if (t >= 1 || opts.rush()) return draw(1);
      await new Promise((r) => requestAnimationFrame(r));
    }
  }
  async function wait(spec: string, timeout = 8000, purpose: 'tap' | 'scroll' = 'tap') {
    const end = performance.now() + timeout;
    for (;;) {
      check();
      const el = find(doc(), spec, purpose);
      if (el) return el;
      if (performance.now() > end) throw new Error('Not found: ' + spec);
      await new Promise((r) => setTimeout(r, 40));
    }
  }
  const centre = (el: Element) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  function scroller(el: Element, container?: string): HTMLElement {
    if (container)
      return (
        doc().querySelector<HTMLElement>(container) || doc().querySelector<HTMLElement>('#content')!
      );
    let node = el.parentElement;
    while (node && node !== doc().body) {
      const s = getComputedStyle(node);
      if (/(auto|scroll)/.test(s.overflowY) && node.scrollHeight > node.clientHeight + 4)
        return node;
      node = node.parentElement;
    }
    return doc().querySelector<HTMLElement>('#content')!;
  }
  // Where a scrolled-to target should rest: just below the Companion where it floats at the top.
  function restingTop(area: HTMLElement) {
    const dock = doc().querySelector('#support-dock')?.getBoundingClientRect();
    if (dock && dock.height && dock.top < 200 && (area.id === 'content' || dock.bottom < 320))
      return dock.bottom + 14;
    return 150;
  }
  const api = {
    get doc() {
      return doc();
    },
    get win() {
      return win();
    },
    has: (spec: string) => !!find(doc(), spec),
    visible: (spec: string) => {
      const el = find(doc(), spec);
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.top >= 0 && r.bottom <= 844 && r.height > 0;
    },
    wait,
    async waitGone(spec: string, timeout = 6000) {
      const end = performance.now() + timeout;
      while (doc().querySelector(spec) && performance.now() < end) await sleep(40);
    },
    async waitText(selector: string, text: string, timeout = 6000) {
      const end = performance.now() + timeout;
      while (
        !(doc().querySelector<HTMLElement>(selector)?.innerText || '')
          .toLowerCase()
          .includes(text.toLowerCase())
      ) {
        if (performance.now() > end) throw new Error(`Text “${text}” not in ${selector}`);
        await sleep(40);
      }
    },
    hold: (ms: number) => (show() ? sleep(ms) : sleep(0)),
    /** Wait for the app to settle, in every mode (layout, observers). */
    settle: (ms: number) => sleep(ms),
    dispatch: (action: string) => win().atlas!.dispatch(action),
    closeAll: () => (win().atlas!.closeAll as () => void)(),
    /** Point at a control, press, then use it: click it, or dispatch an equivalent quieter action. */
    async tap(spec: string, label: string, action?: string) {
      const el = await wait(spec);
      if (show()) {
        const p = centre(el);
        cue.touch(p.x, p.y, label);
        await sleep(650);
        cue.press(true);
        await sleep(180);
        cue.press(false);
      }
      check();
      if (action) win().atlas!.dispatch(action);
      else el.click();
      if (show()) {
        await sleep(260);
        cue.hide();
      }
    },
    async back() {
      const target = find(doc(), '#overlay [data-action="close"][aria-label="Back"]')
        ? '#overlay [data-action="close"][aria-label="Back"]'
        : '#overlay [data-action="close"]';
      await api.tap(target, 'Back');
      await sleep(show() ? 450 : 60);
    },
    /** Scroll a target into its resting place with a finger drag, or instantly. */
    async scrollTo(
      spec: string,
      o: { container?: string; instant?: boolean; into?: 'view'; slow?: boolean } = {},
    ) {
      // Scroll to the words themselves, not the control that contains them.
      const el = await wait(spec, 8000, 'scroll');
      const area = scroller(el, o.container);
      area.style.scrollBehavior = 'auto';
      const r = el.getBoundingClientRect(),
        top = restingTop(area);
      let delta = r.top - top;
      if (o.into === 'view') {
        if (r.top >= top && r.bottom <= 844 - 110) return;
        delta = r.bottom > 844 - 110 ? r.bottom - (844 - 140) : r.top - top;
      }
      const start = area.scrollTop,
        end = Math.max(0, Math.min(area.scrollHeight - area.clientHeight, start + delta));
      if (Math.abs(end - start) < 2) return;
      const visibleScroll = show() && !o.instant;
      const fingerFrom = 640,
        travel = Math.max(-300, Math.min(300, end - start));
      if (visibleScroll) {
        cue.touch(300, fingerFrom, 'Scroll');
        await sleep(380);
        cue.press(true);
      }
      await animate(visibleScroll ? (o.slow ? 2600 : 1100) : 0, (t) => {
        area.scrollTop = start + (end - start) * t;
        area.dispatchEvent(new Event('scroll'));
        if (visibleScroll) cue.move(300, fingerFrom - travel * t);
      });
      if (visibleScroll) {
        cue.press(false);
        await sleep(200);
        cue.hide();
      }
      await sleep(show() ? 350 : 40);
    },
    /** Scroll a sheet or page back to its top with a finger drag. */
    async scrollToTop(container = '#content') {
      const area = doc().querySelector<HTMLElement>(container);
      if (!area || area.scrollTop < 2) return;
      area.style.scrollBehavior = 'auto';
      const start = area.scrollTop,
        travel = Math.min(300, start);
      if (show()) {
        cue.touch(300, 300, 'Scroll');
        await sleep(380);
        cue.press(true);
      }
      await animate(show() ? 1100 : 0, (t) => {
        area.scrollTop = start * (1 - t);
        area.dispatchEvent(new Event('scroll'));
        if (show()) cue.move(300, 300 + travel * t);
      });
      if (show()) {
        cue.press(false);
        await sleep(200);
        cue.hide();
      }
      await sleep(show() ? 350 : 40);
    },
    /** Swipe a horizontal carousel until a card is in view. */
    async swipeTo(spec: string) {
      const el = await wait(spec);
      let row = el.parentElement;
      while (
        row &&
        !(
          row.scrollWidth > row.clientWidth + 4 &&
          /(auto|scroll)/.test(getComputedStyle(row).overflowX)
        )
      )
        row = row.parentElement;
      if (!row) return;
      row.style.scrollBehavior = 'auto';
      const r = el.getBoundingClientRect(),
        box = row.getBoundingClientRect(),
        start = row.scrollLeft,
        end = Math.max(
          0,
          Math.min(row.scrollWidth - row.clientWidth, start + r.left - box.left - 24),
        );
      if (Math.abs(end - start) < 2) return;
      const y = r.top + r.height / 2,
        travel = Math.max(-240, Math.min(240, end - start));
      if (show()) {
        cue.touch(300, y, 'Swipe');
        await sleep(380);
        cue.press(true);
      }
      await animate(show() ? 900 : 0, (t) => {
        row!.scrollLeft = start + (end - start) * t;
        if (show()) cue.move(300 - travel * t, y);
      });
      if (show()) {
        cue.press(false);
        await sleep(200);
        cue.hide();
      }
      await sleep(show() ? 350 : 40);
    },
    /** Zoom the Future map by a factor, about the middle of its goals, through its own pinch-zoom. */
    async zoomChart(factor: number) {
      const stage = await wait('#future-stage');
      const goals = [...stage.querySelectorAll('.future-orbit')]
        .map((e) => e.getBoundingClientRect())
        .filter((r) => r.width);
      const box = stage.getBoundingClientRect(),
        mid = (lo: number[], hi: number[], fallback: number) =>
          goals.length ? (Math.min(...lo) + Math.max(...hi)) / 2 : fallback;
      const x = mid(
          goals.map((r) => r.left),
          goals.map((r) => r.right),
          box.left + box.width / 2,
        ),
        y = mid(
          goals.map((r) => r.top),
          goals.map((r) => r.bottom),
          box.top + box.height / 2,
        );
      const steps = show() ? 10 : 1;
      for (let i = 0; i < steps; i++) {
        stage.dispatchEvent(
          new WheelEvent('wheel', {
            deltaY: -Math.log(factor) / steps / 0.008,
            ctrlKey: true,
            clientX: x,
            clientY: y,
            bubbles: true,
            cancelable: true,
          }),
        );
        await sleep(show() ? 45 : 0);
      }
    },
    /** Point at something for a moment during a step, so the audience knows where to look. */
    async note(spec: string, label: string, ms = 1600) {
      if (!show()) return;
      cue.point(spec, label);
      await sleep(ms);
      cue.point(null);
    },
    /** Drag a range control (Time Travel) to a value with the finger following the thumb. */
    async drag(selector: string, value: number, label = 'Drag') {
      const input = (await wait(selector)) as HTMLInputElement;
      const from = Number(input.value),
        min = Number(input.min || 0),
        max = Number(input.max || 100);
      const set = (v: number) => {
        if (selector === '#time-slider') (win().atlas!.setT as (m: number) => void)(Math.round(v));
        else {
          input.value = String(Math.round(v));
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }
      };
      const thumb = (v: number) => {
        const r = (doc().querySelector(selector) as HTMLElement).getBoundingClientRect();
        return {
          x: r.left + 19 + ((r.width - 38) * (v - min)) / (max - min),
          y: r.top + r.height / 2,
        };
      };
      if (show()) {
        const p = thumb(from);
        cue.touch(p.x, p.y, label);
        await sleep(500);
        cue.press(true);
      }
      await animate(show() ? 2000 : 0, (t) => {
        const v = from + (value - from) * t;
        set(v);
        if (show()) {
          const p = thumb(v);
          cue.move(p.x, p.y);
        }
      });
      if (show()) {
        cue.press(false);
        await sleep(250);
        cue.hide();
      }
      await sleep(show() ? 500 : 60);
    },
    /** In Customise, press and drag a number to the top of My numbers. */
    async dragToTop(spec: string) {
      const el = await wait(spec);
      const area = doc().querySelector<HTMLElement>('#content')!;
      area.style.scrollBehavior = 'auto';
      if (show()) {
        await api.scrollTo(spec, { into: 'view' });
        const p = centre(el);
        cue.touch(p.x, p.y, 'Drag to the top');
        await sleep(600);
        cue.press(true);
        const start = area.scrollTop,
          y0 = p.y;
        await animate(1400, (t) => {
          area.scrollTop = start * (1 - t);
          cue.move(p.x, y0 + (260 - y0) * t);
        });
      }
      const order = [...doc().querySelectorAll<HTMLElement>('.module-grid [data-module]')]
        .map((x) => x.dataset.module!)
        .filter((id, i, all) => all.indexOf(id) === i);
      const id = (el as HTMLElement).dataset.module!;
      win().atlas!.dispatch('reorder-numbers:' + [id, ...order.filter((x) => x !== id)].join(','));
      if (show()) {
        cue.press(false);
        await sleep(300);
        cue.hide();
      }
      area.scrollTop = 0;
      area.dispatchEvent(new Event('scroll'));
      await sleep(show() ? 500 : 60);
    },
  };
  return api;
}
