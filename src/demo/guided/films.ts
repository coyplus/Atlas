/* Stand-alone films: one customer, one device on a white stage, no slides or copy. They reuse the guided
   demo's beats engine, so every tap, scroll, swipe and drag is shown and the presenter sets the pace. */
import type { Beat } from './beats';

const future = 'Future';
const companion = 'AI Companion';

// Sam's Future: competing goals, Time Travel, What ifs, then Money Speed.
const futureFilm: Beat[] = [
  {
    id: 'goals',
    chapter: future,
    headline: 'Goals that compete for the same money',
    sub: '',
    who: ['sam'],
    layout: 'film',
    runs: ['sam'],
    setup: {
      sam: async (a) => {
        a.closeAll();
        a.dispatch('tab:future');
        await a.wait('#time-slider');
        await a.settle(500);
        await a.zoomChart(1.55);
      },
    },
    steps: { sam: (a) => a.hold(900) },
    pointers: [
      {
        run: 'sam',
        target: '#future-bubble-house|#future-bubble-ef|#future-bubble-hol',
        label: 'Competing goals',
      },
    ],
  },
  {
    id: 'time-travel',
    chapter: future,
    headline: 'Time Travel',
    sub: '',
    who: ['sam'],
    layout: 'film',
    runs: ['sam'],
    steps: {
      sam: async (a) => {
        await a.drag('#time-slider', 84, 'Time Travel');
        await a.hold(1200);
      },
    },
    pointers: [
      { run: 'sam', target: 'text:years old|text:Projected net worth', label: 'Sam at 40' },
    ],
  },
  {
    id: 'what-if',
    chapter: future,
    headline: 'What if: one change',
    sub: '',
    who: ['sam'],
    layout: 'film',
    runs: ['sam'],
    steps: {
      sam: async (a) => {
        if (!a.visible('[data-action="future-try:closer-ef"]'))
          await a.tap('.future-drawer text:What if', 'What if');
        await a.hold(500);
        await a.tap('[data-action="future-try:closer-ef"]', 'Save £50 on payday');
        await a.hold(1200);
      },
    },
    pointers: [{ run: 'sam', target: '#support-dock', label: 'A preview, before agreeing' }],
  },
  {
    id: 'combine',
    chapter: future,
    headline: 'What if: changes combine',
    sub: '',
    who: ['sam'],
    layout: 'film',
    runs: ['sam'],
    steps: {
      sam: async (a) => {
        await a.swipeTo('[data-action="future-try:roundup-ef"]');
        await a.tap('[data-action="future-try:roundup-ef"]', 'Round up your spending');
        await a.hold(1200);
      },
    },
    pointers: [
      {
        run: 'sam',
        target: '[data-action="future-try:roundup-ef"]',
        label: 'Two changes together',
      },
    ],
  },
  {
    id: 'money-speed',
    chapter: future,
    headline: 'Money Speed',
    sub: '',
    who: ['sam'],
    layout: 'film',
    runs: ['sam'],
    steps: {
      sam: async (a) => {
        // Money Speed shows the agreed plan for the month on the timeline: clear the previews, back to today.
        for (const el of a.doc.querySelectorAll<HTMLElement>(
          '[data-action^="future-try:"][aria-pressed="true"]',
        ))
          a.dispatch(el.dataset.action!);
        await a.drag('#time-slider', 0, 'Back to today');
        await a.tap('[data-action="future-speed"]', 'Money Speed');
        await a.hold(900);
      },
    },
    pointers: [{ run: 'sam', target: '.fg-speed-ring', label: 'This month’s pace' }],
  },
];

// Elena's Companion: contextual as she scrolls, then the conversation with Priya in view.
const scrollBeat = (id: string, target: string, label: string): Beat => ({
  id,
  chapter: companion,
  headline: label,
  sub: '',
  who: ['elena'],
  layout: 'film',
  runs: ['elena'],
  steps: {
    elena: async (a) => {
      await a.scrollTo(target);
      await a.hold(1300);
    },
  },
  pointers: [{ run: 'elena', target: '#support-dock', label }],
});
const companionFilm: Beat[] = [
  {
    id: 'note',
    chapter: companion,
    headline: 'One place for the bank to speak',
    sub: '',
    who: ['elena'],
    layout: 'film',
    runs: ['elena'],
    steps: { elena: (a) => a.hold(700) },
    pointers: [{ run: 'elena', target: '#support-dock', label: 'A note from Priya' }],
  },
  scrollBeat('wealth', '[data-module="wealth"]', 'Explains what’s on screen'),
  scrollBeat('goal', '[data-module="familypot"]', 'Keeps a goal in view'),
  scrollBeat('points', '[data-module="points"]', 'Recognises progress'),
  {
    id: 'back',
    chapter: companion,
    headline: 'Back to Priya’s note',
    sub: '',
    who: ['elena'],
    layout: 'film',
    runs: ['elena'],
    steps: {
      elena: async (a) => {
        await a.scrollToTop();
        await a.waitText('#support-dock', 'Priya');
        await a.hold(700);
      },
    },
    pointers: [{ run: 'elena', target: '#support-dock', label: 'A person, same place' }],
  },
  {
    id: 'prepare',
    chapter: companion,
    headline: 'The conversation starts with context',
    sub: '',
    who: ['elena'],
    layout: 'film',
    runs: ['elena'],
    steps: {
      elena: async (a) => {
        await a.tap('#support-slot text:Prepare with AI', 'Prepare with AI');
        await a.wait('.chat-thread');
        await a.hold(700);
      },
    },
    pointers: [
      { run: 'elena', target: 'text:I can help you prepare', label: 'Ready to help prepare' },
    ],
  },
  {
    id: 'voice',
    chapter: companion,
    headline: 'Or just talk',
    sub: '',
    who: ['elena'],
    layout: 'film',
    runs: ['elena'],
    steps: {
      elena: async (a) => {
        await a.tap('[aria-label="Talk by voice"]', 'Talk by voice');
        await a.wait('.voice-stage[data-phase="ready"]');
        await a.hold(700);
        await a.tap('.voice-primary', 'Ask', 'support:voice-ask');
        await a.wait('.voice-stage[data-phase="listening"]');
        await a.hold(1600);
      },
    },
    pointers: [{ run: 'elena', target: '.voice-status', label: 'Elena’s question' }],
  },
  {
    id: 'answer',
    chapter: companion,
    headline: 'The AI prepares',
    sub: '',
    who: ['elena'],
    layout: 'film',
    runs: ['elena'],
    steps: {
      elena: async (a) => {
        a.dispatch('support:voice-think');
        await a.hold(900);
        a.dispatch('support:voice-answer');
        await a.wait('.voice-review-list');
        await a.hold(900);
      },
    },
    pointers: [
      {
        run: 'elena',
        target: '.voice-review-list [data-state="open"]',
        label: 'The open question',
      },
    ],
  },
  {
    id: 'agenda',
    chapter: companion,
    headline: 'Priya advises',
    sub: '',
    who: ['elena'],
    layout: 'film',
    runs: ['elena'],
    steps: {
      elena: async (a) => {
        await a.tap('[data-action="support:voice-agenda"]', 'Add to Priya’s agenda');
        await a.wait('.voice-review-added');
        await a.hold(900);
      },
    },
    pointers: [
      { run: 'elena', target: '.voice-review-added', label: 'On Priya’s agenda', edge: true },
    ],
  },
];

export const films: Record<string, Beat[]> = { future: futureFilm, companion: companionFilm };
