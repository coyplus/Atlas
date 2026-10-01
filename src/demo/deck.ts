import '../design-system/fonts.css';
import '../presentation/deck.css';
import '../presentation/relationship.css';
import '../design-system/companion.css';
import '../presentation/narrative.css';
import './demo.css';
import { slides } from '../presentation/narrative';
import { initialiseNarrativeMotion } from '../presentation/narrative-motion';
import { scenes, type Scene } from './scenes';
import { SceneRunner } from './runner';

const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const main = $('#deck');
const menu = $<HTMLDialogElement>('#slide-menu');
const count = slides.length + scenes.length + 2;
const closingIndex = count - 1;
const entries = [
  ...slides.map((s, i) => ({ id: 'slide-' + (i + 1), title: s.title, chapter: s.stage, slide: s })),
  ...scenes
    .filter((s) => !s.optional)
    .map((scene) => ({
      id: scene.id,
      title: scene.title.replace('\n', ' '),
      chapter: scene.chapter,
      scene,
    })),
  { id: 'the-system', title: 'One connected system', chapter: 'The core experience' },
  ...scenes
    .filter((s) => s.optional)
    .map((scene) => ({
      id: scene.id,
      title: scene.title.replace('\n', ' '),
      chapter: scene.chapter,
      scene,
    })),
  { id: 'closing', title: 'Making banking a relationship again', chapter: 'Closing' },
];
let index = -1,
  runner: SceneRunner | undefined;
let resize: ResizeObserver | undefined;
let mode: 'loading' | 'playing' | 'paused' | 'ready' | 'manual' | 'error' = 'ready';
const escape = (t: string) =>
  t.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  );
// Keep the original narrative DOM alive so its existing motion controller owns one set of observers.
main.innerHTML =
  slides
    .map(
      (s, i) =>
        `<section class="slide ${s.theme}" id="narrative-${i}" hidden aria-label="${escape(s.title)}">${s.content}</section>`,
    )
    .join('') + '<section id="demo-stage" class="slide guided-scene" hidden></section>';
initialiseNarrativeMotion(main);
const stage = $('#demo-stage');
function updateScrollCue() {
  $('#scroll-cue').hidden = main.scrollHeight - main.clientHeight - main.scrollTop < 40;
}
main.addEventListener('scroll', updateScrollCue, { passive: true });
addEventListener('resize', updateScrollCue);
new ResizeObserver(updateScrollCue).observe(main);
function status(state: typeof mode, text?: string) {
  mode = state;
  stage.dataset.status = state;
  const label = $('#scene-status');
  if (label)
    label.textContent =
      text ??
      {
        loading: 'Preparing scene…',
        playing: 'Demonstrating',
        paused: 'Paused · continue when ready',
        ready: 'Ready when you are',
        manual: 'You have control · Replay restores this scene',
        error: 'Sequence interrupted · replay or take control',
      }[state];
  const control = $<HTMLButtonElement>('#take-control');
  if (control) {
    control.disabled = state === 'loading';
    control.hidden = state === 'manual';
  }
  const pause = $<HTMLButtonElement>('#pause-scene');
  if (pause) {
    pause.hidden = !['playing', 'paused'].includes(state);
    pause.textContent = state === 'paused' ? 'Continue' : 'Pause';
  }
  const progress = $('#scene-progress');
  if (progress) progress.hidden = state === 'manual';
  const frame = $<HTMLIFrameElement>('#guided-app');
  if (frame) {
    frame.inert = state !== 'manual';
    frame.tabIndex = state === 'manual' ? 0 : -1;
  }
}
function fit() {
  const slot = $('#device-slot'),
    device = $('#guided-device');
  if (!slot || !device) return;
  const comparing = slot.dataset.comparing === 'true';
  const closeup = device.dataset.closeup === 'true';
  const scale = Math.min(
    (slot.clientWidth / (comparing ? 2 : 1) - 16) / (closeup ? 516 : 406),
    (slot.clientHeight - 54) / (closeup ? 656 : 860),
    1.25,
  );
  device.style.left = comparing ? '75%' : '50%';
  device.style.transform = `translate(-50%,-50%) scale(${scale})`;
  const comparison = slot.querySelector<HTMLElement>('#compare-device');
  if (comparison) comparison.style.transform = `translate(-50%,-50%) scale(${scale})`;
}
function takeControl() {
  if (!runner || mode === 'loading') return;
  runner.stop();
  status('manual');
  $('#guided-app')?.focus();
}
async function play(scene: Scene) {
  status('loading');
  const frame = $<HTMLIFrameElement>('#guided-app');
  const progress = $('#scene-progress');
  const marks = [...progress.querySelectorAll<HTMLElement>('.animation-mark')];
  const own = new SceneRunner(
    frame,
    (text) => {
      if (runner === own) $('#scene-step').textContent = text;
    },
    (step, fraction) => {
      if (runner !== own) return;
      progress.setAttribute(
        'aria-valuenow',
        String(Math.floor(((step + fraction) / marks.length) * 100)),
      );
      progress.setAttribute(
        'aria-valuetext',
        fraction === 1 && step === marks.length - 1
          ? 'Demonstration complete'
          : `Step ${step + 1} of ${marks.length}: ${scene.steps[step].label}`,
      );
      marks.forEach((mark, i) => {
        mark.dataset.state = i < step ? 'complete' : i === step ? 'current' : 'upcoming';
        mark.style.setProperty('--fill', String(i < step ? 1 : i === step ? fraction : 0));
      });
    },
  );
  runner = own;
  // Replacing the browsing context, rather than hydrating old UI, also clears modal stacks and feature clocks.
  frame.src = `/demo/prototype.html?p=${scene.person}&tab=${scene.tab}&theme=vanilla`;
  try {
    await own.ready(
      () => !!own.app?.atlas && !!own.doc?.querySelector('#content'),
      'the prototype',
    );
    own.app.addEventListener('atlas:change', ((event: CustomEvent) => {
      const state = event.detail.state;
      own.direction.identity(state.person, state.tab);
    }) as EventListener);
    own.doc.addEventListener('keydown', (e) => {
      if (
        (e.key === 'PageDown' || e.key === 'PageUp') &&
        !(e.target as Element).closest('input,textarea,select,[contenteditable]')
      ) {
        e.preventDefault();
        show(index + (e.key === 'PageDown' ? 1 : -1));
      }
    });
    own.check();
    $('#guided-device').classList.add('is-loaded');
    status('playing');
    await own.run(scene);
    if (runner === own) status('ready');
  } catch (e) {
    if (!own.abort.signal.aborted && runner === own) {
      console.error('Guided scene:', scene.id, e);
      status('error');
    }
  }
}
function stop() {
  runner?.stop();
  runner = undefined;
  resize?.disconnect();
  resize = undefined;
  stage.replaceChildren();
}
function show(target: number) {
  const next = Math.max(0, Math.min(entries.length - 1, target));
  if (index === next) return;
  stop();
  index = next;
  const e = entries[index];
  main.querySelectorAll<HTMLElement>('.slide').forEach((p) => (p.hidden = true));
  main.scrollTop = 0;
  if ('slide' in e) {
    $('#narrative-' + index).hidden = false;
    document.body.dataset.theme = e.slide.theme.split(' ')[0];
  } else {
    stage.hidden = false;
    document.body.dataset.theme = 'guided';
    if ('scene' in e) {
      stage.innerHTML = `<div class="guided-copy"><p class="eyebrow">${escape(e.scene.chapter)}</p><h1>${escape(e.scene.title).replace('\n', '<br>')}</h1><p class="guided-description">${escape(e.scene.copy)}</p>${e.scene.beats ? `<ol class="scene-beats" aria-label="The journey">${e.scene.beats.map((beat, i) => `<li data-beat="${i}" data-active="false"><span>${String(i + 1).padStart(2, '0')}</span>${escape(beat)}</li>`).join('')}</ol>` : ''}<div class="scene-caption"><span class="scene-dot"></span><p id="scene-step">Preparing the experience</p></div><div class="scene-tools"><div id="scene-progress" role="progressbar" aria-label="Demo animation progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">${e.scene.steps.map(() => '<span class="animation-mark" data-state="upcoming" aria-hidden="true"><span></span></span>').join('')}</div><button id="pause-scene">Pause</button><button id="replay">↺ Replay</button><button id="take-control">Take control</button></div><p id="scene-status" role="status" aria-live="polite"></p><p class="scene-footnote">Working prototype · illustrative scenarios</p></div><div id="device-slot"><div class="device-identity" id="main-identity"><strong id="device-person"></strong><span id="device-context"></span></div><div id="guided-device"><div class="demo-aperture"><div class="demo-camera"><iframe id="guided-app" title="Interactive Atlas prototype" tabindex="-1"></iframe><div class="demo-focus" hidden aria-hidden="true"></div><div class="demo-touch" hidden aria-hidden="true"></div></div></div><span class="closeup-label" aria-hidden="true">Closer look</span></div></div>`;
      $('#replay').onclick = () => {
        index = -1;
        show(next);
      };
      $('#take-control').onclick = takeControl;
      $('#pause-scene').onclick = () => {
        if (!runner) return;
        runner.paused = !runner.paused;
        status(runner.paused ? 'paused' : 'playing');
      };
      $('#device-slot').addEventListener('direction-layout', fit);
      resize = new ResizeObserver(fit);
      resize.observe($('#device-slot'));
      fit();
      void play(e.scene);
    } else {
      const closing = index === closingIndex;
      stage.dataset.status = 'ready';
      stage.innerHTML = closing
        ? `<div class="guided-closing"><p class="eyebrow">When customers move forward, so do we.</p><h1>Making banking<br>a relationship <em>again.</em></h1><p>Building better customers builds a better bank.</p><button id="restart-demo">Start again</button><a href="/?p=sam&tab=now&theme=vanilla" target="_blank" rel="noopener">Explore the prototype ↗</a></div>`
        : `<div class="guided-recap"><p class="eyebrow">One connected behavioural system</p><h1>Every useful moment<br>builds the <em>next.</em></h1><p>A reflection opens a conversation. A goal gives it direction.<br>A routine creates progress. Recognition helps it continue.</p><div class="recap-tabs"><span>Now<small>Clarity and action</small></span><span>You<small>Understanding and trust</small></span><span>Future<small>Direction and choice</small></span></div><p class="recap-memory">AI and customer memory connect the moments.</p><button id="skip-supporting">Go to closing →</button><span class="recap-next">Next explores the supporting features.</span></div>`;
      if (closing) $('#restart-demo').onclick = () => show(0);
      else $('#skip-supporting').onclick = () => show(closingIndex);
    }
  }
  $('#counter').textContent = `${String(index + 1).padStart(2, '0')} / ${entries.length}`;
  $<HTMLButtonElement>('#previous').disabled = index === 0;
  $<HTMLButtonElement>('#next').disabled = index === entries.length - 1;
  $('.deck-progress span').style.width = `${((index + 1) / entries.length) * 100}%`;
  menu
    .querySelectorAll<HTMLElement>('[data-index]')
    .forEach((b) => b.setAttribute('aria-current', String(Number(b.dataset.index) === index)));
  history.replaceState(null, '', '#' + e.id);
  document.title = `${e.title} · Atlas guided presentation`;
  main.tabIndex = -1;
  main.focus({ preventScroll: true });
  requestAnimationFrame(updateScrollCue);
}
menu.querySelector('nav')!.innerHTML = entries
  .map(
    (e, i) =>
      `<button data-index="${i}"><span>${String(i + 1).padStart(2, '0')}</span><div><small>${escape(e.chapter)}</small><b>${escape(e.title)}</b></div></button>`,
  )
  .join('');
$('#contents').onclick = () => {
  if (runner && mode === 'playing') {
    runner.paused = true;
    status('paused');
  }
  menu.showModal();
};
$('#menu-close').onclick = () => menu.close();
menu.addEventListener('click', (e) => {
  const b = (e.target as Element).closest<HTMLElement>('[data-index]');
  if (b) {
    menu.close();
    show(Number(b.dataset.index));
  }
});
$('#next').onclick = () => show(index + 1);
$('#previous').onclick = () => show(index - 1);
const fromHash = () => {
  const h = location.hash.slice(1);
  const found = entries.findIndex((e) => e.id === h);
  return found >= 0
    ? found
    : /^\d+$/.test(h)
      ? Math.min(entries.length - 1, Math.max(0, Number(h) - 1))
      : 0;
};
addEventListener('hashchange', () => show(fromHash()));
addEventListener('keydown', (e) => {
  if (
    menu.open ||
    e.altKey ||
    e.ctrlKey ||
    e.metaKey ||
    (e.target as Element).matches('input,textarea,select,[contenteditable]')
  )
    return;
  const keys: Record<string, number> = {
    ArrowRight: index + 1,
    PageDown: index + 1,
    ArrowLeft: index - 1,
    PageUp: index - 1,
    Home: 0,
    End: entries.length - 1,
  };
  if (keys[e.key] !== undefined) {
    e.preventDefault();
    show(keys[e.key]);
  }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && runner && mode === 'playing') {
    runner.paused = true;
    status('paused');
    runner.doc.querySelectorAll('audio,video').forEach((e) => (e as HTMLMediaElement).pause());
  }
});
addEventListener('pagehide', () => runner?.stop());
show(fromHash());
