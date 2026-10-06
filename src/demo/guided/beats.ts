/* The demo as presenter-paced beats. Each beat makes one point with one visible change, performed
   on the real prototype: the audience sees every back, scroll, drag and tap that leads to it.
   Presenter notes are kept outside this public repository. */
import type { Act } from './act';

export type Customer = 'alex' | 'jordan' | 'sam' | 'elena';
export type Run = { id: string; person: Customer; tab: 'now' | 'future' | 'you' };
/** `centre` points at the middle of a large target, such as a bubble, instead of its leading edge. */
export type Pointer = { run: string; target: string; label: string; centre?: boolean };
export type Beat = {
  id: string;
  chapter: string;
  headline: string;
  sub: string;
  who: Customer[];
  layout: 'single' | 'compare' | 'quad' | 'live';
  runs: string[];
  steps?: Partial<Record<string, (a: Act) => Promise<void>>>;
  pointers?: Pointer[];
  montage?: boolean;
  optional?: boolean;
};

export const stages: [Customer, string, string, string][] = [
  ['alex', 'Join', 'Alex', 'day 9'],
  ['jordan', 'Stabilise', 'Jordan', 'month 7'],
  ['sam', 'Grow', 'Sam', 'month 8'],
  ['elena', 'Graduate', 'Elena', 'year 12'],
];

export const runs: Run[] = [
  { id: 'alex', person: 'alex', tab: 'now' },
  { id: 'jordan', person: 'jordan', tab: 'now' },
  { id: 'sam', person: 'sam', tab: 'now' },
  { id: 'elena', person: 'elena', tab: 'now' },
  { id: 'm-alex', person: 'alex', tab: 'now' },
  { id: 'm-jordan', person: 'jordan', tab: 'now' },
  { id: 'm-sam', person: 'sam', tab: 'now' },
  { id: 'm-elena', person: 'elena', tab: 'now' },
  { id: 'live', person: 'sam', tab: 'now' },
];

const CAST = ['alex', 'jordan', 'sam', 'elena'] as Customer[];
const companion = 'The Companion · one voice',
  now = 'Now · your numbers',
  future = 'Future · start with a possibility',
  you = 'You · understood, and shown';

// Close any open sheet with visible Back taps, so the audience sees the way out.
async function backOut(a: Act) {
  for (let i = 0; i < 3 && a.has('#overlay .sheet'); i++) await a.back();
}

export const beats: Beat[] = [
  {
    id: 'cast',
    chapter: 'Meet the customers',
    headline: 'Four customers. Four moments in one relationship.',
    sub: 'Same app, same three tabs. What changes is how well we know each other.',
    who: CAST,
    layout: 'quad',
    runs: ['alex', 'jordan', 'sam', 'elena'],
  },
  {
    id: 'c1',
    chapter: companion,
    headline: 'One place for the bank to talk to you.',
    sub: 'On day one, one useful invitation. Not a feed of offers.',
    who: ['alex'],
    layout: 'single',
    runs: ['alex'],
    pointers: [{ run: 'alex', target: '#support-dock', label: 'AI Companion' }],
  },
  {
    id: 'c2',
    chapter: companion,
    headline: 'It follows what you’re looking at.',
    sub: 'Scroll to the balance, and it explains what’s already committed.',
    who: ['alex'],
    layout: 'single',
    runs: ['alex'],
    steps: {
      alex: async (a) => {
        await a.scrollTo('[data-module="container-ac-cur"]');
        await a.hold(1400);
      },
    },
    pointers: [{ run: 'alex', target: '#support-dock', label: 'Changes as you scroll' }],
  },
  {
    id: 'c3',
    chapter: companion,
    headline: 'Months later, it has more to say.',
    sub: 'A one-minute weekly briefing on savings, plans and next steps.',
    who: ['sam'],
    layout: 'single',
    runs: ['sam'],
    optional: true,
    steps: {
      sam: async (a) => {
        await a.tap('[data-action="support:play"]', 'Play');
        await a.hold(900);
      },
    },
    pointers: [{ run: 'sam', target: '#support-dock', label: 'Weekly briefing' }],
  },
  {
    id: 'c4',
    chapter: companion,
    headline: 'When a person needs to speak, they use the same space.',
    sub: 'Elena is a Premier customer. Priya, her Relationship Manager, has a note.',
    who: ['elena'],
    layout: 'single',
    runs: ['elena'],
    pointers: [{ run: 'elena', target: '#support-dock', label: 'A note from Priya' }],
  },
  {
    id: 'c5',
    chapter: companion,
    headline: 'One tap, and the conversation starts with context.',
    sub: 'No blank box. Priya’s note and the AI’s offer are already there.',
    who: ['elena'],
    layout: 'single',
    runs: ['elena'],
    steps: {
      elena: async (a) => {
        await a.tap('#support-slot text:Prepare with AI', 'Prepare with AI');
        await a.wait('.chat-thread');
        await a.hold(500);
      },
    },
    pointers: [
      { run: 'elena', target: 'text:I can help you prepare', label: 'Ready to help prepare' },
    ],
  },
  {
    id: 'c6',
    chapter: companion,
    headline: 'Or just talk.',
    sub: '“Help me get ready for Thursday with Priya.”',
    who: ['elena'],
    layout: 'single',
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
    id: 'c7',
    chapter: companion,
    headline: 'The AI prepares. Priya advises.',
    sub: 'Three things for the review, ready before Thursday.',
    who: ['elena'],
    layout: 'single',
    runs: ['elena'],
    steps: {
      elena: async (a) => {
        a.dispatch('support:voice-think');
        await a.hold(900);
        a.dispatch('support:voice-answer');
        await a.wait('.voice-review-list');
        await a.hold(700);
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
    id: 'n1',
    chapter: now,
    headline: 'Day one: the numbers everyone needs.',
    sub: 'Balance, Direct Debits, credit score. Nothing new to learn.',
    who: ['alex'],
    layout: 'single',
    runs: ['alex'],
    steps: { alex: async (a) => a.scrollTo('[data-module="container-ac-cur"]') },
    pointers: [
      { run: 'alex', target: '[data-module="container-ac-cur"]', label: 'Current account' },
    ],
  },
  {
    id: 'n2',
    chapter: now,
    headline: 'Not sure what to add? The Companion suggests.',
    sub: '“Payday is in 8 days. Want one number that says what’s truly spendable?”',
    who: ['alex'],
    layout: 'single',
    runs: ['alex'],
    steps: {
      alex: async (a) => {
        await a.scrollTo('[data-action="gallery"]', { into: 'view' });
        await a.tap('[data-action="gallery"]', 'Add a number');
        await a.wait('[data-action="add-suggestion:safespend/W"]');
        await a.hold(600);
      },
    },
    pointers: [{ run: 'alex', target: 'text:Payday is in 8 days', label: 'Suggested for Alex' }],
  },
  {
    id: 'n3',
    chapter: now,
    headline: 'Then it looks out for Alex.',
    sub: '“£742 safe to spend until payday. Want a nudge if it drops below £150?”',
    who: ['alex'],
    layout: 'single',
    runs: ['alex'],
    steps: {
      alex: async (a) => {
        await a.tap('[data-action="add-suggestion:safespend/W"]', 'Add to My numbers');
        await a.waitGone('#overlay .sheet');
        await a.hold(700);
        await a.scrollTo('[data-action="customise"]');
        await a.tap('[data-action="customise"]', 'Customise');
        await a.hold(500);
        await a.dragToTop('[data-module="safespend"]');
        await a.tap('[data-action="customise"]', 'Done');
        await a.waitText('#support-dock', 'safe to spend');
        await a.hold(500);
      },
    },
    pointers: [{ run: 'alex', target: '#support-dock', label: 'Offers an alert' }],
  },
  {
    id: 'n4',
    chapter: now,
    headline: 'Same screen. Different priorities.',
    sub: 'Jordan keeps on top of spending and debt. Sam follows investments, the deposit and family pots.',
    who: ['jordan', 'sam'],
    layout: 'compare',
    runs: ['jordan', 'sam'],
    steps: {
      jordan: async (a) => a.scrollTo('.module-grid > :nth-child(2)', { instant: true }),
      sam: async (a) => {
        a.dispatch('support:stop');
        a.closeAll();
        await a.scrollTo('[data-module="investments"]', { instant: true });
      },
    },
    pointers: [
      {
        run: 'jordan',
        target: '.module-grid > :nth-child(2)|.module-grid > :nth-child(3)',
        label: 'Spending first',
      },
      { run: 'sam', target: '[data-module="investments"]', label: 'Investing first' },
    ],
  },
  {
    id: 'f1',
    chapter: future,
    headline: 'Day one: a possibility is enough to begin.',
    sub: 'Two ideas to explore, or something of Alex’s own. Nothing moves until Alex approves.',
    who: ['alex'],
    layout: 'single',
    runs: ['alex'],
    steps: {
      alex: async (a) => {
        await backOut(a);
        await a.tap('[data-action="tab:future"]', 'Future');
        await a.wait('text:Build a safety net');
        await a.hold(500);
      },
    },
    pointers: [
      {
        run: 'alex',
        target: 'text:Build a safety net|text:Something of my own',
        label: 'Two ideas, or Alex’s own',
      },
    ],
  },
  {
    id: 'f2',
    chapter: future,
    headline: 'Start small, and see where it leads.',
    sub: '£25 a month towards a safety net.',
    who: ['alex'],
    layout: 'single',
    runs: ['alex'],
    steps: {
      alex: async (a) => {
        await a.tap('text:Build a safety net', 'Build a safety net');
        await a.wait('#goal-time');
        await a.hold(700);
      },
    },
    pointers: [{ run: 'alex', target: '.goal-growth-stage', label: 'A safety net' }],
  },
  {
    id: 'f3',
    chapter: future,
    headline: 'Time Travel makes the future feel closer.',
    sub: 'Ten years ahead, the same £25 a month has added up.',
    who: ['alex'],
    layout: 'single',
    runs: ['alex'],
    steps: { alex: async (a) => a.drag('#goal-time', 120) },
    pointers: [{ run: 'alex', target: 'text:years old', label: 'Ten years ahead' }],
  },
  {
    id: 'f4',
    chapter: future,
    headline: 'Try another path, before committing.',
    sub: 'What if it were invested? A range, not a promise.',
    who: ['alex'],
    layout: 'single',
    runs: ['alex'],
    optional: true,
    steps: {
      alex: async (a) => {
        await a.tap('text:Explore a first investment', 'Explore a first investment');
        await a.hold(700);
      },
    },
    pointers: [
      { run: 'alex', target: 'text:Explore a first investment', label: 'An illustrative range' },
    ],
  },
  {
    id: 'f5',
    chapter: future,
    headline: 'Alex’s first goal, on the map.',
    sub: 'One goal today. More will follow.',
    who: ['alex'],
    layout: 'single',
    runs: ['alex'],
    steps: {
      alex: async (a) => {
        await a.tap('text:Try this in my Future', 'Try this in my Future');
        await a.waitGone('#overlay .sheet');
        await a.hold(600);
        if (a.has('.future-drawer-grip[aria-expanded="true"]'))
          await a.tap('.future-drawer-grip', 'Panel down');
        await a.hold(700);
      },
    },
    pointers: [
      { run: 'alex', target: '[id^="future-bubble-"]', label: 'Alex’s first goal', centre: true },
    ],
  },
  {
    id: 'f6',
    chapter: future,
    headline: 'Ideas for what comes next.',
    sub: 'Suggestions drawn from Alex’s situation and the Time Travel view.',
    who: ['alex'],
    layout: 'single',
    runs: ['alex'],
    optional: true,
    steps: {
      alex: async (a) => {
        await a.tap('[data-action="future-add"]', 'Goal');
        await a.hold(700);
      },
    },
    pointers: [{ run: 'alex', target: 'text:Try investing a little', label: 'Ideas to explore' }],
  },
  {
    id: 'f7',
    chapter: future,
    headline: 'Months later: priorities compete for the same money.',
    sub: 'The house deposit, an emergency fund, a family holiday, Ella’s next chapter.',
    who: ['sam'],
    layout: 'single',
    runs: ['sam'],
    steps: {
      sam: async (a) => {
        a.closeAll();
        await a.tap('[data-action="tab:future"]', 'Future');
        await a.wait('#time-slider');
        await a.hold(900);
      },
    },
    pointers: [
      {
        run: 'sam',
        target: '#future-bubble-house|#future-bubble-ef|#future-bubble-hol',
        label: 'Competing goals',
      },
    ],
  },
  {
    id: 'f8',
    chapter: future,
    headline: 'See the trade-offs years ahead.',
    sub: 'At 40: could a bigger family adventure be on the horizon?',
    who: ['sam'],
    layout: 'single',
    runs: ['sam'],
    steps: {
      sam: async (a) => {
        await a.drag('#time-slider', 84);
        await a.hold(1200);
      },
    },
    pointers: [
      { run: 'sam', target: 'text:years old|text:Projected net worth', label: 'Sam at 40' },
    ],
  },
  {
    id: 'f9',
    chapter: future,
    headline: 'Try a change. See the impact first.',
    sub: 'Save £50 on payday: the emergency fund is ready 11 months sooner.',
    who: ['sam'],
    layout: 'single',
    runs: ['sam'],
    steps: {
      sam: async (a) => {
        if (!a.visible('[data-action="future-try:closer-ef"]'))
          await a.tap('.future-drawer text:What if', 'What if');
        await a.hold(500);
        await a.tap('[data-action="future-try:closer-ef"]', 'Save £50 on payday');
        await a.hold(1000);
      },
    },
    pointers: [
      {
        run: 'sam',
        target: '[data-action="future-try:closer-ef"]',
        label: 'A preview, not a commitment',
      },
    ],
  },
  {
    id: 'f10',
    chapter: future,
    headline: 'What keeps the plan moving.',
    sub: 'What moves each month, and where it goes. Speed up or slow down.',
    who: ['sam'],
    layout: 'single',
    runs: ['sam'],
    optional: true,
    steps: {
      sam: async (a) => {
        await a.tap('[data-action="future-speed"]', 'Money Speed');
        await a.hold(700);
      },
    },
    pointers: [{ run: 'sam', target: '.fg-speed-ring', label: 'Money Speed' }],
  },
  {
    id: 'y1',
    chapter: you,
    headline: 'Day one: we ask, rather than assume.',
    sub: 'Three light questions. A first impression Alex can shape.',
    who: ['alex'],
    layout: 'single',
    runs: ['alex'],
    steps: {
      alex: async (a) => {
        await backOut(a);
        await a.tap('[data-action="tab:you"]', 'You');
        await a.wait('[data-action="quiz"]');
        await a.hold(500);
      },
    },
    pointers: [{ run: 'alex', target: 'text:Discover how you', label: 'Three questions' }],
  },
  {
    id: 'y2',
    chapter: you,
    headline: 'No right answers.',
    sub: '“It’s three days to payday and £60 is left. What’s your instinct?”',
    who: ['alex'],
    layout: 'single',
    runs: ['alex'],
    optional: true,
    steps: {
      alex: async (a) => {
        await a.tap('[data-action="quiz"]', 'Answer three questions');
        await a.wait('text:three days to payday');
        await a.hold(500);
      },
    },
    pointers: [{ run: 'alex', target: 'text:three days to payday', label: 'Question 1 of 3' }],
  },
  {
    id: 'y3',
    chapter: you,
    headline: 'Something useful back, straight away.',
    sub: 'A first impression, with strengths and watch-outs. Alex can say “that’s not me”.',
    who: ['alex'],
    layout: 'single',
    runs: ['alex'],
    steps: {
      alex: async (a) => {
        if (!a.has('text:three days to payday'))
          await a.tap('[data-action="quiz"]', 'Answer three questions');
        for (const answer of ['roughly what I planned', 'A little for later', 'A small check-in']) {
          await a.tap('#overlay text:' + answer, 'An answer');
          await a.hold(350);
        }
        await a.tap('#overlay text:Explore your portrait', 'Explore your portrait');
        await a.wait('.portrait-engagement-dock');
        await a.hold(600);
      },
    },
    pointers: [{ run: 'alex', target: '.portrait-engagement-dock', label: 'Alex can correct it' }],
  },
  {
    id: 'y4',
    chapter: you,
    headline: 'Eight months on, the picture is richer.',
    sub: 'Built from Sam’s choices, check-ins and household.',
    who: ['sam'],
    layout: 'single',
    runs: ['sam'],
    steps: {
      sam: async (a) => {
        await backOut(a);
        await a.tap('[data-action="tab:you"]', 'You');
        await a.wait('.portrait-glass');
        await a.hold(600);
      },
    },
    pointers: [{ run: 'sam', target: '.portrait-glass', label: 'Money Portrait' }],
  },
  {
    id: 'y5',
    chapter: you,
    headline: 'A portrait Sam recognises.',
    sub: 'Planner: a plan for money, room for life.',
    who: ['sam'],
    layout: 'single',
    runs: ['sam'],
    steps: {
      sam: async (a) => {
        await a.tap('[data-action="portrait"]', 'Explore your portrait');
        await a.wait('#overlay .sheet-body');
        await a.hold(700);
      },
    },
    pointers: [{ run: 'sam', target: 'text:A plan for money', label: 'What comes naturally' }],
  },
  {
    id: 'y6',
    chapter: you,
    headline: 'Each trait, explained. And what’s changed.',
    sub: 'Since July: a new everyday habit, and an updated safety buffer.',
    who: ['sam'],
    layout: 'single',
    runs: ['sam'],
    steps: {
      sam: async (a) => {
        await a.scrollTo('text:How we read the picture', { container: '#overlay .sheet-body' });
        await a.hold(500);
      },
    },
    pointers: [{ run: 'sam', target: '.ps-tile.has-update .ps-update', label: 'What’s new' }],
  },
  {
    id: 'y7',
    chapter: you,
    headline: 'We show our working.',
    sub: 'Eight months under the grocery line. Each figure with its source.',
    who: ['sam'],
    layout: 'single',
    runs: ['sam'],
    steps: {
      sam: async (a) => {
        await a.scrollTo('#overlay [data-action="portrait-story"]', {
          container: '#overlay .sheet-body',
          into: 'view',
        });
        await a.tap('#overlay [data-action="portrait-story"]', 'See the measurable evidence');
        await a.wait('.pm-card.pm-kind-cadence');
        await a.hold(600);
      },
    },
    pointers: [{ run: 'sam', target: '.pm-card.pm-kind-cadence', label: '8 months in a row' }],
  },
  {
    id: 'y8',
    chapter: you,
    headline: 'All the data behind it, in the open.',
    sub: 'Saving by rule, monthly timing, app rhythm, 52 check-ins. 431 money moves, 15 answers.',
    who: ['sam'],
    layout: 'single',
    runs: ['sam'],
    steps: {
      sam: async (a) => {
        await a.scrollTo('text:THE RECORD BEHIND THE PORTRAIT', {
          container: '#overlay .sheet-body',
          slow: true,
        });
        await a.hold(500);
      },
    },
    pointers: [{ run: 'sam', target: 'text:THE RECORD BEHIND THE PORTRAIT', label: 'The record' }],
  },
  {
    id: 'y9',
    chapter: you,
    headline: 'Premier is within reach.',
    sub: '£2,000 to go. A Relationship Manager, family cover and benefits Sam chooses.',
    who: ['sam'],
    layout: 'single',
    runs: ['sam'],
    steps: {
      sam: async (a) => {
        await backOut(a);
        await a.scrollTo('[data-action="membership"]');
        await a.tap('[data-action="membership"]', 'HSBC Status');
        await a.wait('#overlay [data-action="membership-tier:premier"]');
        await a.hold(500);
        await a.tap('#overlay [data-action="membership-tier:premier"]', 'Premier');
        await a.hold(600);
        await a.scrollTo('#overlay text:Expert access', { container: '#overlay .sheet-body' });
        await a.hold(400);
      },
    },
    pointers: [{ run: 'sam', target: '#overlay text:Expert access', label: 'Premier benefits' }],
  },
  {
    id: 'y10',
    chapter: you,
    headline: 'Points that help with the next step.',
    sub: 'An hour with a coach, a rate boost, fee-free transfers. Not cash.',
    who: ['sam'],
    layout: 'single',
    runs: ['sam'],
    steps: {
      sam: async (a) => {
        await backOut(a);
        await a.scrollTo('.points-banner');
        await a.tap('.points-banner', 'HSBC Points');
        await a.wait('#overlay text:Use your Points');
        await a.hold(500);
        await a.scrollTo('#overlay text:Use your Points', { container: '#overlay .sheet-body' });
        await a.hold(400);
      },
    },
    pointers: [
      {
        run: 'sam',
        target: '#overlay text:An hour with a financial coach',
        label: 'Use your Points',
      },
    ],
  },
  {
    id: 'y11',
    chapter: you,
    headline: 'Small steps, worth recognising.',
    sub: 'Challenges give the next behaviour a shape.',
    who: ['sam'],
    layout: 'single',
    runs: ['sam'],
    optional: true,
    steps: {
      sam: async (a) => {
        await backOut(a);
        await a.scrollTo('[data-action="badges"]');
        await a.tap('[data-action="badges"]', 'See all');
        await a.hold(600);
      },
    },
    pointers: [{ run: 'sam', target: '#overlay text:Find your rhythm', label: 'Challenges' }],
  },
  {
    id: 'e1',
    chapter: 'Ending · one relationship, growing',
    headline: 'One relationship, growing.',
    sub: 'Same three tabs, from day 9 to year 12.',
    who: CAST,
    layout: 'quad',
    runs: ['m-alex', 'm-jordan', 'm-sam', 'm-elena'],
    montage: true,
  },
];

// After the closing slide: the real prototype, for questions.
export const live: Beat = {
  id: 'live',
  chapter: 'Over to you',
  headline: 'Over to you.',
  sub: 'The working prototype. Ask for anything you’d like to see.',
  who: ['sam'],
  layout: 'live',
  runs: ['live'],
};
