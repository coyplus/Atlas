import { slides as narrative } from './narrative';
import { companionCard } from '../features/support/card.mjs';
import { materialIcons, materialViewBoxes } from '../design-system/icons.mjs';

/* Behavioural design edition: a short briefing before a live demo. It reuses the Narrative
   slides and styling, and adds the design reasoning: evidence, system and growth over time. */
export const look = 'narrative';

const icon = (name: keyof typeof materialIcons) =>
  `<svg class="deck-icon" aria-hidden="true" viewBox="${materialViewBoxes[name] || '0 -960 960 960'}">${materialIcons[name] || materialIcons.auto_awesome}</svg>`;
const heading = (label: string, title: string, support = '') =>
  `<div class="r-heading"><p class="eyebrow">${label}</p><h1>${title}</h1>${support ? `<p class="n-support">${support}</p>` : ''}</div>`;
const body = (inner: string) => `<div class="n-body">${inner}</div>`;
const source = (text: string) => `<p class="r-source">${text}</p>`;
const arrow = `<span class="r-arrow" aria-hidden="true">${icon('arrow_forward')}</span>`;
const capture = (customer: 'alex' | 'sam', tab: 'now' | 'you' | 'future', alt: string) =>
  `<div class="phone-frame"><img src="/assets/presentation/behavioural/${customer}-${tab}.webp" alt="${alt}" width="390" height="844" decoding="async"></div>`;
const companion = (message: string) =>
  `<div class="n-companion">${companionCard({ title: message, interactive: false })}</div>`;
const reuse = (stage: string) => {
  const slide = narrative.find((s) => s.stage === stage);
  if (!slide) throw new Error(`Narrative slide missing: ${stage}`);
  return slide;
};

const principles = [
  ['Meet people at moments that already happen.', 'Payday rules and a weekly briefing.'],
  ['Turn an intention into a simple plan.', '“Save £50 on payday”, chosen by the customer.'],
  ['Make progress visible.', 'Instalments, Money Speed and check-in history.'],
  ['Make the future feel closer.', 'Time Travel and What if.'],
  [
    'Keep the customer in control.',
    'Visible evidence, a portrait you can correct, approval before anything moves.',
  ],
  [
    'Reward progress, not activity.',
    'Points for reflection and plans kept, never for trading activity.',
  ],
]
  .map(
    ([principle, atlas], i) =>
      `<article><span class="b-number">${String(i + 1).padStart(2, '0')}</span><h2>${principle}</h2><p class="b-atlas"><b>In Atlas</b>${atlas}</p></article>`,
  )
  .join('');

const growth = (
  [
    ['now', 'Now', 'Familiar banking, and one invitation.', 'His numbers, added one at a time.'],
    ['you', 'You', 'Three questions to begin.', 'A portrait built from eight months of evidence.'],
    [
      'future',
      'Future',
      'A possibility is enough to begin.',
      'Competing priorities, explored safely.',
    ],
  ] as const
)
  .map(
    ([tab, name, alex, sam]) =>
      `<article class="b-growth-tab"><h2>${name}</h2><div class="b-growth-pair"><figure>${capture('alex', tab, `Alex’s ${name} on day nine: ${alex}`)}<figcaption><b>Day 9</b>${alex}</figcaption></figure>${arrow}<figure>${capture('sam', tab, `Sam’s ${name} at month eight: ${sam}`)}<figcaption><b>Month 8</b>${sam}</figcaption></figure></div></article>`,
  )
  .join('');

export const slides = [
  reuse('Cover'),
  {
    stage: 'The problem',
    title: 'If features alone were the solution',
    theme: 'r-slide n-want b-problem',
    content: `${heading('The problem', 'If features alone were the solution, good financial outcomes would be <em>the norm.</em>', 'In 2024, 13.1 million UK adults had low financial resilience, unchanged from 2022.')}
      ${body(`<div class="b-compare">
        <div><span class="r-label">What AI in today’s journeys improves</span><ul><li>Products that are easier to understand and use.</li><li>Help inside a single journey.</li><li>Support once a task has started.</li></ul></div>
        <div><span class="r-label">What remains unresolved</span><ul><li>More features do not ease financial pressure.</li><li>Help in one journey does not build overall understanding.</li><li>People still need help to start, and to manage their wider financial health.</li></ul></div>
      </div><p class="b-question">How do we build a real, lasting relationship, <em>using AI?</em></p>`)}
      ${source('FCA Financial Lives, 2024')}`,
  },
  {
    stage: 'The shift',
    title: 'From transactions to relationships',
    theme: 'r-value r-slide n-thesis b-shift',
    content: `${heading('The shift', 'From transactions <br>to <em>relationships.</em>', 'Behavioural design, AI and human expertise, working as one system around the customer’s life.')}
      ${body(`<ol class="n-chain b-chain" aria-label="How useful support becomes better outcomes">
        <li><h2>Useful support</h2><p>Relevant help at the right moment, from AI and from people.</p>${arrow}</li>
        <li><h2>A stronger relationship</h2><p>Customers share more because they get more back.</p>${arrow}</li>
        <li><h2>Sustained behaviours</h2><p>Save on payday. Keep the plan. Review when life changes.</p>${arrow}</li>
        <li><h2>Better outcomes</h2><p>A buffer, a deposit, a plan that holds. And a bank worth staying with.</p></li>
      </ol><p class="b-soundbite">Building better customers builds a better bank.</p>`)}`,
  },
  reuse('Why it is hard'),
  reuse('The behaviour gap'),
  {
    stage: 'Design principles',
    title: 'Every design decision has a behavioural reason',
    theme: 'r-slide b-evidence',
    content: `${heading('Behavioural design', 'Every design decision has <em>a behavioural reason.</em>', 'Six principles shaped what we built, and what we chose not to build.')}
      ${body(`<div class="b-evidence-grid">${principles}</div>`)}`,
  },
  (() => {
    const slide = reuse('Behavioural science');
    // In this edition the needs follow the evidence, not a numbered pillar list.
    return {
      ...slide,
      content: slide.content.replace('02 · Behavioural science', 'Behavioural science'),
    };
  })(),
  {
    stage: 'Systems thinking',
    title: 'Not a set of features. One system.',
    theme: 'r-slide b-system',
    content: `${heading('Systems thinking', 'Not a set of features. <br><em>One system.</em>', 'Each tab has one job. Together they keep the behaviour going, and AI carries what we learn from one to the next.')}
      ${body(`<div class="b-loop" role="img" aria-label="Future sets the direction, Now turns it into routines, You brings understanding and recognition back into the plan. The AI Companion and customer memory connect all three, and a person steps in when needed.">
        <article style="--tab:#447f99"><span class="n-tab-glyph" aria-hidden="true">${icon('trending_up')}</span><span class="r-label">Future</span><h2>Sets the direction.</h2><p>A goal the customer chooses.</p></article>
        <p class="b-link">${arrow}<span>A goal becomes a pot and a rule</span></p>
        <article style="--tab:#3e8178"><span class="n-tab-glyph" aria-hidden="true">${icon('grid_view')}</span><span class="r-label">Now</span><h2>Turns it into routines.</h2><p>Small actions, made easy and visible.</p></article>
        <p class="b-link">${arrow}<span>Actions become understanding and recognition</span></p>
        <article style="--tab:#8465a5"><span class="n-tab-glyph" aria-hidden="true">${icon('person')}</span><span class="r-label">You</span><h2>Brings understanding back.</h2><p>Reflection, evidence and recognition.</p></article>
        <p class="b-return"><span>${icon('repeat')} What we learn together shapes better possibilities in Future</span></p>
        <p class="b-layer">${icon('auto_awesome')}<span><b>AI Companion and customer memory</b> connect every step. A person steps in when judgement or care is needed.</span></p>
      </div>`)}`,
  },
  {
    stage: 'The AI Companion',
    title: 'One voice for the bank. Push and pull.',
    theme: 'r-slide b-companion',
    content: `${heading('The AI Companion', 'One voice for the bank. <br><em>Push and pull.</em>', 'HSBC’s messages, insights and support in one place, shaped by what the customer is looking at and what we know together.')}
      ${body(`<div class="b-modes">
        <article><span class="r-label">Push</span><h2>An opening, before you ask.</h2>${companion('Your essentials are covered, Sam. What could this £1,300 make possible for you?')}<p>An insight, a question or a possibility, matched to the screen and the moment. Calm when things are fine.</p><small>Most people don’t know what to ask. Relevant beats frequent.</small></article>
        <article><span class="r-label">Pull</span><h2>Listens when you want to talk.</h2><p class="b-utterance">“How is my money moving towards my goals?”</p><p>In your own words, by text or voice. The answer brings the numbers and the next step together.</p><small>Show the working when it matters, in one layer.</small></article>
        <article><span class="r-label">A person</span><h2>Brings in a human, with the context.</h2><p class="b-handover">${icon('group')}<span>Your plans come with you.</span></p><p>An adviser or Relationship Manager joins the same conversation. No need to start again.</p><small>People value human judgement most when the stakes are high.</small></article>
      </div><p class="b-memory">${icon('repeat')} Every response is carried into the next interaction. The customer sees what is remembered, and can change it.</p>`)}`,
  },
  {
    stage: 'Day one to month eight',
    title: 'The same three tabs, growing with the relationship',
    theme: 'r-slide b-growth',
    content: `${heading('Day one to month eight', 'The same three tabs, <br><em>growing with the relationship.</em>', 'Start simple. Earn the right to do more.')}
      ${body(`<div class="b-growth-grid">${growth}</div>`)}
      ${source('Alex, day nine, and Sam, month eight. Fictional customers in the working prototype.')}`,
  },
  reuse('Close'),
];
