/* Narrative short + guided demo: the slides, then presenter-paced beats on the live prototype.
   One press, one beat. Forward plays the beat's visible steps; back or a jump rebuilds its state. */
import '../../design-system/fonts.css';
import '../../presentation/deck.css';
import '../../presentation/relationship.css';
import '../../design-system/companion.css';
import '../../presentation/narrative.css';
import '../../presentation/short.css';
import './short.css';
import { slides as deckSlides } from '../../presentation/short';
import { initialiseNarrativeMotion } from '../../presentation/narrative-motion';
import { materialIcons, materialViewBoxes } from '../../design-system/icons.mjs';
import { beats, live, runs, stages, type Beat, type Customer } from './beats';
import { createAct, rectOf, type Act, type Cue } from './act';

type Slide = (typeof deckSlides)[number];
type Entry = { id: string; title: string; chapter: string; slide?: Slide; beat?: Beat };
const $ = <T extends HTMLElement>(s: string, root: ParentNode = document) =>
  root.querySelector<T>(s)!;
const esc = (t: string) =>
  t.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const fast = !!window.__ATLAS_TEST__;
const STAGE_W = 1600,
  STAGE_H = 900;

let showOptional = true;
try {
  showOptional = localStorage.getItem('atlas-guided-optional') !== 'off';
} catch {
  /* Optional beats stay shown without storage. */
}
const intro = deckSlides.slice(0, -1),
  close = deckSlides.at(-1)!;
const allEntries: Entry[] = [
  ...intro.map((s, i) => ({
    id: 'slide-' + String(i + 1).padStart(2, '0'),
    title: s.title,
    chapter: s.stage,
    slide: s,
  })),
  ...beats.map((b) => ({ id: b.id, title: b.headline, chapter: b.chapter, beat: b })),
  {
    id: 'slide-' + String(deckSlides.length).padStart(2, '0'),
    title: close.title,
    chapter: close.stage,
    slide: close,
  },
  { id: live.id, title: live.headline, chapter: live.chapter, beat: live },
];
const entries = () => allEntries.filter((e) => showOptional || !e.beat?.optional);

/* ---------- page ---------- */
document.body.dataset.version = 'narrative';
document.body.dataset.deck = 'short';
document.body.dataset.guided = 'short';
const main = $('#deck');
main.innerHTML =
  allEntries
    .filter((e) => e.slide)
    .map(
      (e) =>
        `<section class="slide ${e.slide!.theme}" id="${e.id}" hidden aria-label="${esc(e.title)}">${e.slide!.content}</section>`,
    )
    .join('') + '<section id="g-stage-host" hidden></section>';
main.tabIndex = -1;
initialiseNarrativeMotion(main);
document.querySelectorAll<HTMLElement>('[data-icon]').forEach((el) => {
  const name = el.dataset.icon as keyof typeof materialIcons;
  el.innerHTML = `<svg class="deck-icon" aria-hidden="true" viewBox="${materialViewBoxes[name] || '0 -960 960 960'}">${materialIcons[name] || ''}</svg>`;
});
document.querySelector('.guided-header span')!.textContent = 'Narrative short · guided demo';

const host = $('#g-stage-host');
host.innerHTML = `<div id="g-stage" role="region" aria-label="Guided demonstration">
  <div class="g-timeline">${stages.map(([id, stage, name, when]) => `<div data-customer="${id}"><b>${name}</b><span>${stage} · ${when}</span></div>`).join('')}</div>
  <div class="g-copy"><p class="g-label"></p><h1 class="g-headline"></h1><p class="g-sub"></p></div>
  <div class="g-montage-tab" hidden></div>
  <div class="g-frames"></div>
  <div class="g-overlay"><div class="g-touch" hidden><span></span></div></div>
  <div class="g-progress"></div>
  <p class="g-status" role="status" aria-live="polite"></p>
</div>`;
const stage = $('#g-stage'),
  framesLayer = $('.g-frames', stage),
  overlay = $('.g-overlay', stage),
  touchEl = $('.g-touch', stage);

function fit() {
  const r = host.getBoundingClientRect();
  const k = Math.min(r.width / STAGE_W, r.height / STAGE_H);
  stage.style.transform = `translate(-50%, -50%) scale(${k})`;
  return k;
}
addEventListener('resize', () => {
  fit();
  drawPointers();
});

/* ---------- frames ---------- */
type Slot = { x: number; y: number; k: number };
type Frame = {
  run: string;
  el: HTMLElement;
  iframe: HTMLIFrameElement;
  applied: number;
  ready: Promise<void>;
  slot?: Slot;
};
const frames = new Map<string, Frame>();
const runOf = (id: string) => runs.find((r) => r.id === id)!;
let loadSeq = 0;

function makeFrame(runId: string): Frame {
  const el = document.createElement('div');
  el.className = 'g-device';
  el.dataset.run = runId;
  el.innerHTML =
    '<div class="g-label-who"></div><div class="g-screen"><iframe tabindex="-1" title="Atlas prototype"></iframe></div>';
  framesLayer.append(el);
  const f: Frame = {
    run: runId,
    el,
    iframe: el.querySelector('iframe')!,
    applied: -1,
    ready: Promise.resolve(),
  };
  const who = stages.find(([id]) => id === runOf(runId).person)!;
  el.querySelector('.g-label-who')!.innerHTML = `<b>${who[2]}</b> · ${who[3]}`;
  frames.set(runId, f);
  return f;
}
function load(f: Frame) {
  const r = runOf(f.run);
  f.applied = -1;
  f.iframe.inert = true;
  f.ready = new Promise<void>((resolve, reject) => {
    const seq = ++loadSeq;
    f.iframe.src = `/demo/prototype.html?p=${r.person}&tab=${r.tab}&theme=vanilla&g=${seq}`;
    const started = performance.now();
    const poll = () => {
      const w = f.iframe.contentWindow as
        (Window & { atlas?: unknown; HTMLMediaElement?: typeof HTMLMediaElement }) | null;
      if (w?.atlas && f.iframe.contentDocument?.querySelector('#content')) {
        // The demo never makes sound: briefings play muted.
        const media = w.HTMLMediaElement!.prototype,
          play = media.play;
        media.play = function () {
          this.muted = true;
          return play.call(this);
        };
        // Focus can land inside the prototype (a chat input); the deck keys still work from there.
        f.iframe.contentDocument!.addEventListener('keydown', (ev) => {
          if (document.body.classList.contains('g-live') && ev.key !== 'Escape') return;
          if (['ArrowRight', 'ArrowLeft', 'PageDown', 'PageUp', ' ', 'Escape'].includes(ev.key)) {
            ev.preventDefault();
            onKey(ev);
          }
        });
        setTimeout(resolve, fast ? 50 : 900);
      } else if (performance.now() - started > 20000) reject(new Error('Prototype did not load'));
      else setTimeout(poll, 60);
    };
    setTimeout(poll, 60);
  });
  return f.ready;
}
const frameFor = (runId: string) => frames.get(runId) || makeFrame(runId);

/* ---------- layouts ---------- */
const layouts: Record<Beat['layout'], (n: number) => Slot[]> = {
  single: () => [{ x: STAGE_W - 130 - 390 * 0.8, y: 160, k: 0.8 }],
  // The right-hand margin leaves room for the second device's pointer, which points in from the right.
  compare: () =>
    [0, 1].map((i) => ({
      x: STAGE_W - 170 - 2 * 390 * 0.74 - 56 + i * (390 * 0.74 + 56),
      y: 196,
      k: 0.74,
    })),
  quad: () =>
    [0, 1, 2, 3].map((i) => ({
      x: STAGE_W - 80 - 4 * 390 * 0.44 - 66 + i * (390 * 0.44 + 22),
      y: 322,
      k: 0.44,
    })),
  // Live: the copy stays as a caption, and the larger device sits where the single device was.
  live: () => [{ x: STAGE_W - 130 - 390 * 0.92, y: (900 - 844 * 0.92) / 2 + 8, k: 0.92 }],
};
function place(f: Frame, slot: Slot | null, enterFrom?: 'right' | 'left') {
  if (!slot) {
    f.el.classList.remove('is-on');
    f.el.style.zIndex = '0';
    return;
  }
  if (enterFrom && !f.el.classList.contains('is-on')) {
    f.el.style.transition = 'none';
    f.el.style.transform = `translate(${slot.x + (enterFrom === 'right' ? 80 : -80)}px, ${slot.y}px) scale(${slot.k})`;
    void f.el.offsetWidth;
    f.el.style.transition = '';
  }
  f.slot = slot;
  f.el.style.zIndex = '2';
  f.el.classList.add('is-on');
  f.el.style.transform = `translate(${slot.x}px, ${slot.y}px) scale(${slot.k})`;
}

/* ---------- touch cue and pointers (stage coordinates) ---------- */
let cueFrame: Frame | null = null;
const toStage = (f: Frame, x: number, y: number) => ({
  x: f.slot!.x + x * f.slot!.k,
  y: f.slot!.y + y * f.slot!.k,
});
const cue: Cue = {
  touch(x, y, label) {
    if (!cueFrame) return;
    const p = toStage(cueFrame, x, y);
    touchEl.hidden = false;
    touchEl.style.transition = 'none';
    touchEl.style.left = p.x + 'px';
    touchEl.style.top = p.y + 'px';
    void touchEl.offsetWidth;
    touchEl.style.transition = '';
    touchEl.dataset.pressed = 'false';
    touchEl.querySelector('span')!.textContent = label || '';
  },
  press(pressed) {
    touchEl.dataset.pressed = String(pressed);
  },
  move(x, y) {
    if (!cueFrame) return;
    const p = toStage(cueFrame, x, y);
    touchEl.style.transition = 'none';
    touchEl.style.left = p.x + 'px';
    touchEl.style.top = p.y + 'px';
  },
  hide() {
    touchEl.hidden = true;
  },
  point(spec, label) {
    notePointer =
      spec && cueFrame
        ? {
            f: cueFrame,
            target: spec,
            label: label || '',
            compact: false,
            centre: false,
            edge: false,
            right: false,
          }
        : null;
    drawPointers();
  },
};
let pointers: {
  f: Frame;
  target: string;
  label: string;
  compact: boolean;
  centre: boolean;
  edge: boolean;
  right: boolean;
}[] = [];
// A pointer shown for a moment during a step (act.note), alongside the beat's own.
let notePointer: (typeof pointers)[number] | null = null;
function drawPointers() {
  overlay.querySelectorAll('.g-pointer').forEach((el) => el.remove());
  for (const p of notePointer ? [...pointers, notePointer] : pointers) {
    if (!p.f.slot || !p.f.iframe.contentDocument) continue;
    const r = rectOf(p.f.iframe.contentDocument, p.target);
    if (!r) continue;
    const inset = p.centre ? r.w / 2 : p.edge ? -10 : Math.min(30, r.w / 2);
    const dot = toStage(p.f, p.right ? r.x + r.w - inset : r.x + inset, r.y + r.h / 2);
    const el = document.createElement('div');
    el.className = 'g-pointer' + (p.right ? ' is-right' : '');
    el.innerHTML = `<span>${esc(p.label)}</span><i></i><b></b>`;
    overlay.append(el);
    const pill = (el.querySelector('span') as HTMLElement).offsetWidth;
    const line = el.querySelector('i') as HTMLElement;
    el.style.top = dot.y - 16 + 'px';
    if (p.right) {
      // Points in from the right, so it never crosses the device beside it.
      const pillX = p.f.slot.x + 390 * p.f.slot.k + 12;
      el.style.left = dot.x - 9 + 'px';
      line.style.width = Math.max(10, pillX - dot.x - 9) + 'px';
    } else {
      const startX = p.f.slot.x - (p.compact ? 12 : 44) - pill;
      el.style.left = startX + 'px';
      line.style.width = Math.max(10, dot.x - startX - pill) + 'px';
    }
  }
}

/* ---------- navigation ---------- */
let index = -1,
  token = 0,
  busy = false,
  rushing = false,
  montageTimer: ReturnType<typeof setTimeout> | undefined;
const beatOrder = (b: Beat) => beats.indexOf(b);
const active = (b: Beat) => showOptional || !b.optional;
// The last earlier beat that set up this run's state.
function lastBefore(b: Beat, run: string) {
  for (let i = beatOrder(b) - 1; i >= 0; i--)
    if (active(beats[i]) && beats[i].runs.includes(run)) return i;
  return -1;
}
async function quietly(
  f: Frame,
  b: Beat,
  work: ((a: Act) => Promise<void>) | undefined,
  alive: () => boolean,
) {
  if (!work) return;
  const a = createAct({ frame: f.iframe, visible: false, cue, alive, rush: () => true });
  try {
    await work(a);
  } catch (e) {
    if ((e as DOMException).name === 'AbortError') throw e;
    console.warn('Guided demo: instant step skipped', b.id, f.run, e);
  }
}
async function applyInstant(f: Frame, upTo: number, alive: () => boolean) {
  for (let i = f.applied + 1; i <= upTo; i++) {
    const b = beats[i];
    if (!active(b) || !b.runs.includes(f.run)) continue;
    await quietly(f, b, b.setup?.[f.run], alive);
    await quietly(f, b, b.steps?.[f.run], alive);
    f.applied = i;
  }
}
/** Bring a run's frame to the state just before `b` (or including it), reloading if it has gone past. */
async function prepare(f: Frame, target: number, alive: () => boolean) {
  if (f.applied > target || !f.iframe.src) await load(f);
  else await f.ready;
  if (!alive()) return;
  await applyInstant(f, target, alive);
}

function renderChrome(b: Beat) {
  const list = entries().filter((e) => e.beat && e.beat !== live);
  const chapterBeats = list.filter((e) => e.beat!.chapter === b.chapter);
  const copy = $('.g-copy', stage);
  copy.classList.remove('is-in');
  void copy.offsetWidth;
  $('.g-label', stage).innerHTML =
    `${esc(b.chapter)}${b === live ? '' : ` · <b>${chapterBeats.findIndex((e) => e.beat === b) + 1} of ${chapterBeats.length}</b>`}`;
  $('.g-headline', stage).textContent = b.headline;
  $('.g-sub', stage).textContent = b.sub;
  copy.classList.add('is-in');
  stage.dataset.layout = b.layout;
  const top = Math.max(...b.who.map((w) => stages.findIndex(([id]) => id === w)));
  stage.querySelectorAll<HTMLElement>('.g-timeline > div').forEach((el, i) => {
    el.dataset.state = b.who.includes(el.dataset.customer as Customer)
      ? 'on'
      : i < top
        ? 'past'
        : '';
  });
  const chapters = [...new Set(list.map((e) => e.beat!.chapter))];
  $('.g-progress', stage).innerHTML = chapters
    .map(
      (ch) =>
        `<div>${list
          .filter((e) => e.beat!.chapter === ch)
          .map(
            (e) =>
              `<i data-state="${e.beat === b ? 'current' : list.indexOf(e) < list.findIndex((x) => x.beat === b) ? 'done' : ''}"></i>`,
          )
          .join('')}</div>`,
    )
    .join('');
}

async function showBeat(b: Beat, forward: boolean, alive: () => boolean) {
  // preparing → playing → ready: lets a presenter window or a test know when the beat has settled.
  stage.dataset.status = 'preparing';
  renderChrome(b);
  pointers = [];
  notePointer = null;
  drawPointers();
  cue.hide();
  clearTimeout(montageTimer);
  $('.g-montage-tab', stage).hidden = !b.montage;
  const slots = layouts[b.layout](b.runs.length);
  const used = b.runs.map(frameFor);
  // Frames for other runs leave the stage; the next customer slides in from the side.
  frames.forEach((f) => {
    if (!used.includes(f)) place(f, null);
  });
  const ownTarget = beatOrder(b);
  const playable = used.map((f, i) => {
    const before = b === live ? -1 : lastBefore(b, f.run);
    return {
      f,
      before,
      slot: slots[i],
      visible: forward && f.applied === before && !!f.iframe.src,
    };
  });
  // Prepare frames that cannot play visibly: rebuild silently, then fade in.
  await Promise.all(
    playable.map(async (p) => {
      if (b === live) {
        if (!p.f.iframe.src) await load(p.f);
        else await p.f.ready;
        return;
      }
      const own = b.steps?.[p.f.run] || b.setup?.[p.f.run];
      if (!p.visible) {
        p.f.el.classList.add('is-preparing');
        await prepare(p.f, own ? p.before : ownTarget, alive);
        if (!own) p.f.applied = ownTarget;
      }
      // Setup happens off camera, so the customer is already where the beat begins.
      if (p.f.applied < ownTarget && alive()) await quietly(p.f, b, b.setup?.[p.f.run], alive);
    }),
  );
  if (!alive()) return;
  playable.forEach((p) => place(p.f, p.slot, forward ? 'right' : 'left'));
  await new Promise((r) => setTimeout(r, fast ? 10 : 560));
  if (!alive()) return;
  stage.dataset.status = 'playing';
  // Steps: visible on the frame the audience is watching; silent where it was rebuilt.
  for (const p of playable) {
    const step = b.steps?.[p.f.run];
    p.f.el.classList.remove('is-preparing');
    if (!step || b === live) {
      if (b !== live) p.f.applied = Math.max(p.f.applied, ownTarget);
      continue;
    }
    if (p.f.applied >= ownTarget) continue;
    cueFrame = p.f;
    const a = createAct({
      frame: p.f.iframe,
      visible: p.visible && b.layout === 'single',
      cue,
      alive,
      rush: () => rushing,
    });
    try {
      await step(a);
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return;
      console.warn('Guided demo: step failed, rebuilding', b.id, e);
      await load(p.f);
      await prepare(p.f, ownTarget, alive);
    }
    p.f.applied = ownTarget;
  }
  cue.hide();
  if (!alive()) return;
  if (b === live) {
    used[0].iframe.inert = false;
    used[0].iframe.tabIndex = 0;
    used[0].iframe.focus();
    stage.dataset.status = 'ready';
    return;
  }
  (document.activeElement as HTMLElement | null)?.blur();
  main.focus({ preventScroll: true });
  pointers = (b.pointers || []).map((p) => ({
    f: frames.get(p.run)!,
    target: p.target,
    label: p.label,
    compact: b.layout !== 'single',
    centre: !!p.centre,
    edge: !!p.edge,
    right: b.layout === 'compare' && b.runs.indexOf(p.run) === 1,
  }));
  drawPointers();
  stage.dataset.status = 'ready';
  if (b.montage) montage(used, alive);
}
// The ending: four customers step through the same three tabs together.
function montage(used: Frame[], alive: () => boolean) {
  const tabs = ['now', 'future', 'you'];
  const label = $('.g-montage-tab', stage);
  let i = 0;
  label.textContent = 'Now';
  const turn = () => {
    if (!alive()) return;
    i = (i + 1) % tabs.length;
    used.forEach((f) =>
      (
        f.iframe.contentWindow as Window & { atlas: { go: (p: string, t: string) => void } }
      ).atlas?.go(runOf(f.run).person, tabs[i]),
    );
    label.textContent = tabs[i][0].toUpperCase() + tabs[i].slice(1);
    montageTimer = setTimeout(turn, fast ? 50 : 4200);
  };
  montageTimer = setTimeout(turn, fast ? 50 : 3600);
}

// Look ahead: load the next beat's new frames out of sight so nothing loads in front of the room.
function preload(from: number) {
  const next = entries()[from + 1]?.beat;
  if (!next) return;
  next.runs.forEach((r) => {
    if (!frames.has(r)) load(makeFrame(r)).catch(() => undefined);
  });
}

function sync(e: Entry, i: number, list: Entry[]) {
  const message = {
    type: 'atlas-demo',
    id: e.id,
    index: i,
    total: list.length,
    title: e.title,
    chapter: e.chapter,
  };
  try {
    window.opener?.postMessage(message, '*');
  } catch {
    /* No presenter window. */
  }
  channel?.postMessage(message);
}
const channel = 'BroadcastChannel' in window ? new BroadcastChannel('atlas-guided-demo') : null;

async function show(target: number, forwardHint?: boolean) {
  const list = entries();
  const next = Math.max(0, Math.min(list.length - 1, target));
  if (next === index && forwardHint === undefined) return;
  const forward = forwardHint ?? next === index + 1;
  index = next;
  const mine = ++token;
  const alive = () => mine === token;
  rushing = false;
  const e = list[index];
  main.querySelectorAll<HTMLElement>('.slide').forEach((s) => (s.hidden = s.id !== e.id));
  host.hidden = !e.beat;
  document.body.dataset.theme = e.slide ? e.slide.theme.split(' ')[0] : 'guided';
  document.body.classList.toggle('g-live', e.beat === live);
  if (!e.beat) frames.forEach((f) => (f.iframe.inert = true));
  $('#counter').textContent = `${String(index + 1).padStart(2, '0')} / ${list.length}`;
  (document.querySelector('.deck-progress span') as HTMLElement).style.width =
    `${((index + 1) / list.length) * 100}%`;
  history.replaceState(null, '', '#' + e.id);
  document.title = `${e.title} · Atlas`;
  sync(e, index, list);
  if (e.beat) {
    fit();
    busy = true;
    try {
      await showBeat(e.beat, forward, alive);
    } catch (err) {
      if ((err as DOMException).name !== 'AbortError') console.error('Guided demo:', e.id, err);
    }
    if (alive()) busy = false;
  } else busy = false;
  if (alive()) preload(index);
}

/* ---------- controls ---------- */
const menu = $<HTMLDialogElement>('#slide-menu');
function buildMenu() {
  menu.querySelector('nav')!.innerHTML =
    entries()
      .map(
        (e, i) =>
          `<button data-index="${i}"><span>${String(i + 1).padStart(2, '0')}</span><div><small>${esc(e.chapter)}</small><b>${esc(e.title)}</b></div></button>`,
      )
      .join('') +
    `<button data-optional><span>⋯</span><div><small>Optional beats</small><b>${showOptional ? 'Shown · press O to skip' : 'Skipped · press O to show'}</b></div></button>`;
}
buildMenu();
menu.addEventListener('click', (ev) => {
  const btn = (ev.target as Element).closest<HTMLElement>('button');
  if (!btn) return;
  if (btn.dataset.optional !== undefined) return toggleOptional();
  if (btn.dataset.index) {
    menu.close();
    show(Number(btn.dataset.index), false);
  }
});
$('#menu-close').onclick = () => menu.close();
$('#contents').onclick = () => menu.showModal();
$('#next').onclick = () => advance(1);
$('#previous').onclick = () => advance(-1);
function toggleOptional() {
  const current = entries()[index]?.id;
  showOptional = !showOptional;
  try {
    localStorage.setItem('atlas-guided-optional', showOptional ? 'on' : 'off');
  } catch {
    /* Preference lasts for this session only. */
  }
  buildMenu();
  // Hiding the beat on screen steps back to the nearest one that stays.
  const list = entries();
  let from = allEntries.findIndex((e) => e.id === current);
  while (from > 0 && !list.includes(allEntries[from])) from--;
  index = -1;
  show(Math.max(0, list.indexOf(allEntries[from])), false);
}
function advance(step: number) {
  // A press while a beat is still playing finishes it at once; the next press moves on.
  if (step > 0 && busy && entries()[index]?.beat) {
    rushing = true;
    return;
  }
  show(index + step, step > 0);
}
function onKey(ev: KeyboardEvent) {
  if (menu.open || ev.altKey || ev.ctrlKey || ev.metaKey) return;
  const e = entries()[index];
  if (e?.beat === live && ev.key !== 'Escape') return;
  const keys: Record<string, () => void> = {
    ArrowRight: () => advance(1),
    ' ': () => advance(1),
    PageDown: () => advance(1),
    ArrowLeft: () => advance(-1),
    PageUp: () => advance(-1),
    Home: () => show(0, false),
    End: () => show(entries().length - 1, false),
    o: toggleOptional,
    O: toggleOptional,
    c: () => menu.showModal(),
    Escape: () => (e?.beat === live ? show(index - 1, false) : undefined),
  };
  const run = keys[ev.key];
  if (run) {
    ev.preventDefault();
    run();
  }
}
addEventListener('keydown', onKey);
// Controls stay out of the audience's way until the mouse moves.
let idle: ReturnType<typeof setTimeout> | undefined;
addEventListener('mousemove', () => {
  document.body.classList.add('g-controls');
  clearTimeout(idle);
  idle = setTimeout(() => document.body.classList.remove('g-controls'), 1800);
});
// A presenter window (the private notes) can ask the deck to move.
addEventListener('message', (ev) => {
  const d = ev.data as { type?: string; id?: string; step?: number };
  if (d?.type !== 'atlas-demo-control') return;
  if (d.step) advance(d.step);
  else if (d.id) {
    const at = entries().findIndex((x) => x.id === d.id);
    if (at >= 0) show(at, false);
  }
});
const fromHash = () => {
  const at = entries().findIndex((e) => e.id === location.hash.slice(1));
  return at >= 0 ? at : 0;
};
addEventListener('hashchange', () => {
  const at = fromHash();
  if (at !== index) show(at, false);
});
show(fromHash(), false);
// The overlay and frames are positioned in stage pixels.
fit();
