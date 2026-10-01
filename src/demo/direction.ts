import type { SceneRunner } from './runner';
/** Audience cues live outside the app. They never alter product UI or saved data. */
export class Direction {
  private camera = { x: 0, y: 0, k: 1 };
  readonly device: HTMLElement;
  readonly slot: HTMLElement;
  readonly lens: HTMLElement;
  readonly touch: HTMLElement;
  readonly outline: HTMLElement;
  constructor(readonly runner: SceneRunner) {
    this.device = runner.frame.closest<HTMLElement>('#guided-device')!;
    this.slot = this.device.parentElement!;
    this.lens = this.device.querySelector<HTMLElement>('.demo-camera')!;
    this.touch = this.device.querySelector<HTMLElement>('.demo-touch')!;
    this.outline = this.device.querySelector<HTMLElement>('.demo-focus')!;
  }
  identity(person: string, tab: string) {
    const name = person.charAt(0).toUpperCase() + person.slice(1);
    const labels: Record<string, string> = {
      alex: 'Joining · a familiar start',
      sam: 'Growing · personal priorities',
      jordan: 'Stabilising',
      elena: 'An established relationship',
    };
    this.slot.querySelector('#device-person')!.textContent =
      `${name} · ${tab.charAt(0).toUpperCase() + tab.slice(1)}`;
    this.slot.querySelector('#device-context')!.textContent = labels[person] || '';
    this.slot.dataset.person = person;
  }
  beat(index?: number) {
    if (index === undefined) return;
    this.slot
      .closest('#demo-stage')!
      .querySelectorAll<HTMLElement>('[data-beat]')
      .forEach((el, i) => {
        el.dataset.active = String(i === index);
        if (i === index) el.setAttribute('aria-current', 'step');
        else el.removeAttribute('aria-current');
      });
  }
  clear() {
    this.touch.hidden = true;
    this.outline.hidden = true;
  }
  point(x: number, y: number, pressed = false) {
    this.touch.hidden = false;
    this.touch.style.left = x + 'px';
    this.touch.style.top = y + 'px';
    this.touch.dataset.pressed = String(pressed);
  }
  async tap(selector: string) {
    const el = await this.runner.element(selector);
    const r = el.getBoundingClientRect();
    if (
      r.width <= 0 ||
      r.height <= 0 ||
      r.top + r.height / 2 < 0 ||
      r.top + r.height / 2 > 844 ||
      r.left + r.width / 2 < 0 ||
      r.left + r.width / 2 > 390 ||
      (el as HTMLButtonElement).disabled
    )
      throw new Error('Tap target is not available: ' + selector);
    this.outline.hidden = true;
    this.point(r.left + r.width / 2, r.top + r.height / 2);
    await this.runner.hold(1000);
    this.touch.dataset.pressed = 'true';
    await this.runner.hold(220);
    el.click();
    await this.runner.hold(280);
    this.touch.hidden = true;
  }
  async focus(selector: string, scale = 1) {
    const el = await this.runner.element(selector),
      r = el.getBoundingClientRect();
    await this.zoom(scale, r);
    const x = Math.max(8, r.left - 5),
      y = Math.max(8, r.top - 5);
    Object.assign(this.outline.style, {
      left: x + 'px',
      top: y + 'px',
      width: Math.min(382 - x, r.width + 10) + 'px',
      height: Math.min(836 - y, r.height + 10) + 'px',
    });
    this.outline.hidden = false;
  }
  async zoom(k: number, r?: DOMRect) {
    const from = { ...this.camera };
    this.device.dataset.closeup = String(k > 1);
    this.layout();
    const width = k > 1 ? 500 : 390,
      height = k > 1 ? 640 : 844;
    const to = {
      k,
      x:
        k === 1
          ? 0
          : 390 * k <= width
            ? (width - 390 * k) / 2
            : Math.max(width - 390 * k, Math.min(0, width / 2 - (r!.left + r!.width / 2) * k)),
      y:
        k === 1
          ? 0
          : Math.max(height - 844 * k, Math.min(0, height / 2 - (r!.top + r!.height / 2) * k)),
    };
    await this.runner.animate(1000, (t) => {
      this.camera = {
        x: from.x + (to.x - from.x) * t,
        y: from.y + (to.y - from.y) * t,
        k: from.k + (to.k - from.k) * t,
      };
      this.paint();
    });
    this.device.dataset.closeup = String(k > 1);
  }
  paint() {
    this.lens.style.transform = `translate(${this.camera.x}px,${this.camera.y}px) scale(${this.camera.k})`;
  }
  async compare() {
    const aside = document.createElement('div');
    aside.id = 'compare-device';
    aside.hidden = true;
    aside.className = 'comparison-device';
    aside.innerHTML =
      '<iframe title="Alex · starting experience for comparison" tabindex="-1" inert></iframe>';
    const frame = aside.querySelector('iframe')!;
    frame.src = this.runner.frame.src;
    this.slot.append(aside);
    await this.runner.ready(
      () => !!(frame.contentWindow as Window & { atlas?: unknown })?.atlas,
      'Alex’s comparison',
    );
    const label = document.createElement('div');
    label.id = 'compare-identity';
    label.className = 'device-identity';
    label.innerHTML = '<strong>Alex · Now</strong><span>Joining · a familiar start</span>';
    this.slot.append(label);
    aside.hidden = false;
    this.slot.dataset.comparing = 'true';
    this.layout();
  }
  endCompare() {
    this.slot.querySelector('#compare-device')?.remove();
    this.slot.querySelector('#compare-identity')?.remove();
    delete this.slot.dataset.comparing;
    this.layout();
  }
  layout() {
    this.slot.dispatchEvent(new Event('direction-layout'));
  }
  reset() {
    this.clear();
    this.camera = { x: 0, y: 0, k: 1 };
    this.paint();
    delete this.device.dataset.closeup;
    this.endCompare();
  }
}
