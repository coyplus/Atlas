import { Direction } from './direction';
import type { Scene, Step } from './scenes';
import type { DemoApi } from '../app/contracts';
type AppWindow = Window & { atlas?: DemoApi };
/** Controls the actual app, using its existing commands. A fresh frame owns every scene. */
export class SceneRunner {
  readonly abort = new AbortController();
  paused = false;
  readonly direction: Direction;
  private person = '';
  private tab = '';
  private stepIndex = 0;
  private stepElapsed = 0;
  private stepDuration = 1;
  constructor(
    readonly frame: HTMLIFrameElement,
    readonly report: (text: string) => void,
    readonly progress: (step: number, fraction: number) => void = () => {},
  ) {
    this.direction = new Direction(this);
  }
  get app() {
    return this.frame.contentWindow as AppWindow;
  }
  get doc() {
    return this.frame.contentDocument!;
  }
  stop() {
    this.abort.abort();
    this.direction.reset();
    this.doc?.querySelectorAll('audio,video').forEach((el) => (el as HTMLMediaElement).pause());
  }
  check() {
    if (this.abort.signal.aborted) throw new DOMException('Scene cancelled', 'AbortError');
  }
  async delay(ms: number, tick?: (fraction: number) => void) {
    let remaining = ms,
      last = performance.now();
    while (remaining > 0) {
      this.check();
      await new Promise<void>((resolve) => setTimeout(resolve, 30));
      this.check();
      const now = performance.now();
      if (!this.paused && !document.hidden) {
        remaining -= Math.min(now - last, 100);
        tick?.(Math.min(1, 1 - remaining / ms));
      }
      last = now;
    }
    this.check();
    while (this.paused || document.hidden) {
      this.check();
      await new Promise((resolve) => setTimeout(resolve, 30));
    }
  }
  async ready(test: () => unknown, description: string) {
    let attempts = 0;
    while (!test()) {
      if (++attempts > 300) throw new Error('Unable to show ' + description);
      await this.delay(50);
    }
    this.check();
  }
  async element(selector: string): Promise<HTMLElement> {
    await this.ready(() => this.doc?.querySelector(selector), selector);
    return this.doc.querySelector<HTMLElement>(selector)!;
  }
  async animate(duration: number, draw: (t: number) => void) {
    const start = this.stepElapsed;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fast = !!window.__ATLAS_TEST__;
    const frames = reduced || fast ? 1 : Math.ceil(duration / 30);
    for (let i = 1; i <= frames; i++) {
      await this.delay(frames === 1 ? 1 : 30);
      const t = i / frames;
      draw(t * t * (3 - 2 * t));
      this.advance(start + duration * t);
    }
  }
  private advance(elapsed: number) {
    this.stepElapsed = elapsed;
    // Never announce a completed step until its expected UI state has arrived.
    this.progress(this.stepIndex, Math.min(0.99, elapsed / this.stepDuration));
  }
  async hold(ms: number) {
    const start = this.stepElapsed;
    await this.delay(window.__ATLAS_TEST__ ? 30 : ms, (t) => this.advance(start + ms * t));
  }
  async step(s: Step) {
    await this.delay(1);
    this.direction.clear();
    this.direction.beat(s.beat);
    this.report(s.label);
    if (s.compare) await this.direction.compare();
    if (s.endCompare) this.direction.endCompare();
    if (s.wide) await this.direction.zoom(1);
    if (s.person) {
      this.person = s.person;
      this.tab = s.tab || this.tab;
      this.app.atlas!.go(s.person, s.tab);
      this.direction.identity(this.person, this.tab);
    }
    if (s.tap) await this.direction.tap(s.tap);
    if (s.close) (this.app.atlas!.closeAll as () => void)();
    if (s.action) this.app.atlas!.dispatch(s.action);
    if (s.fill) {
      const el = (await this.element(s.fill.selector)) as HTMLInputElement;
      el.value = s.fill.value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (s.check) {
      const el = (await this.element(s.check)) as HTMLInputElement;
      if (!el.checked) el.click();
    }
    if (s.pauseStory) {
      const toggle = await this.element('[data-story-toggle]');
      if (toggle.getAttribute('aria-label')?.includes('Pause')) toggle.click();
    }
    if (s.click) {
      const el = await this.element(s.click);
      if ((el as HTMLButtonElement).disabled) throw new Error('This action is unavailable');
      el.click();
    }
    if (s.scroll) {
      const target = await this.element(s.scroll);
      const area =
        target.closest<HTMLElement>(s.container || '#content') ||
        (await this.element(s.container || '#content'));
      const dock = this.doc.querySelector('#support-dock')?.getBoundingClientRect();
      const inset =
        area.id === 'content' && dock
          ? Math.max(24, dock.bottom - area.getBoundingClientRect().top + 20)
          : 24;
      const start = area.scrollTop;
      const max = area.scrollHeight - area.clientHeight;
      const end = Math.max(
        0,
        Math.min(
          max,
          start + target.getBoundingClientRect().top - area.getBoundingClientRect().top - inset,
        ),
      );
      if (s.gesture) {
        this.direction.point(338, 590, true);
        await this.hold(650);
      }
      await this.animate(s.gesture ? 1800 : 1300, (t) => {
        if (s.gesture) this.direction.point(338, 590 - 180 * t, true);
        area.scrollTop = start + (end - start) * t;
      });
    }
    if (s.time !== undefined) {
      const start = Number(((await this.element('#time-slider')) as HTMLInputElement).value);
      const end = s.time;
      const track = (await this.element('#time-slider')).getBoundingClientRect();
      const point = (value: number) =>
        this.direction.point(
          track.left + 19 + ((track.width - 38) * value) / 240,
          track.top + track.height / 2,
          true,
        );
      if (s.gesture) {
        point(start);
        await this.hold(1000);
      }
      await this.animate(s.gesture ? 3200 : 1900, (t) => {
        const value = Math.round(start + (end - start) * t);
        (this.app.atlas!.setT as (m: number) => void)(value);
        if (s.gesture) point(value);
      });
    }
    this.direction.touch.hidden = true;
    if (s.wait) await this.element(s.wait);
    if (s.focus) await this.direction.focus(s.focus, s.zoom || 1);
    await this.hold(s.hold ?? 2000);
  }
  async run(scene: Scene) {
    this.person = scene.person;
    this.tab = scene.tab;
    this.direction.identity(this.person, this.tab);
    await this.ready(() => this.app?.atlas && this.doc.querySelector('#content'), 'the prototype');
    for (const [i, s] of scene.steps.entries()) {
      this.stepIndex = i;
      this.stepElapsed = 0;
      // Authored motion and reading holds; unknown loading time deliberately stalls progress.
      this.stepDuration =
        (s.hold ?? 2000) +
        (s.wide ? 1000 : 0) +
        (s.focus ? 1000 : 0) +
        (s.tap ? 1500 : 0) +
        (s.scroll ? (s.gesture ? 2450 : 1300) : 0) +
        (s.time !== undefined ? (s.gesture ? 4200 : 1900) : 0);
      this.progress(i, 0);
      await this.step(s);
    }
    await this.element(scene.end);
    this.progress(scene.steps.length - 1, 1);
  }
}
