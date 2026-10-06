import { slides as narrative } from './narrative';
import { materialIcons, materialViewBoxes } from '../design-system/icons.mjs';

/* Narrative, shortened for a presentation followed by a live demo. The slides are the
   Narrative ones in the order of the briefing: context, the business case, then the
   behavioural design and system thinking that lead into the demo. The product slides
   are left out because the demo shows each tab live. Three slides are simplified here
   (the behaviour gap, the big idea and the three needs); the full Narrative keeps its versions. */
export const look = 'narrative';

const icon = (name: keyof typeof materialIcons) =>
  `<svg class="deck-icon" aria-hidden="true" viewBox="${materialViewBoxes[name] || '0 -960 960 960'}">${materialIcons[name]}</svg>`;
const pick = (stage: string) => {
  const slide = narrative.find((s) => s.stage === stage);
  if (!slide) throw new Error(`Narrative slide missing: ${stage}`);
  return slide;
};
// The parts are numbered in this deck's order, set by the anchor slide.
const numbered = (stage: string, number: string) => {
  const slide = pick(stage);
  return {
    ...slide,
    content: slide.content.replace(/(<p class="eyebrow">)0\d · /, `$1${number} · `),
  };
};
const heading = (label: string, title: string, support: string) =>
  `<div class="r-heading"><p class="eyebrow">${label}</p><h1>${title}</h1><p class="n-support">${support}</p></div>`;

// Three conditions, words only: Sam's answer today, then what a system adds.
const gap = {
  ...pick('The behaviour gap'),
  content: `${heading('The behaviour gap', 'A behaviour happens when someone is <em>able&nbsp;to,</em> the situation <em>lets&nbsp;them,</em> and they <em>want&nbsp;to.</em>', 'Features make the action possible. A system makes it happen, and keep happening.')}
    <div class="n-body"><div class="n-matrix s-gap" role="table" aria-label="Three conditions for a behaviour, today and with a system">
      <div class="n-matrix-head" role="row"><span></span><span class="r-label">Able to</span><span class="r-label">The situation lets them</span><span class="r-label">Wants to</span></div>
      <div class="n-matrix-row" role="row"><span class="r-label n-matrix-label">Sam saving £100, today</span><article><h2>Yes.</h2><p>The pot exists.</p></article><article class="n-no"><h2>No.</h2><p>Nothing marks payday.</p></article><article class="n-no"><h2>No.</h2><p>£100 feels like nothing.</p></article></div>
      <div class="n-matrix-row n-matrix-system" role="row"><span class="r-label n-matrix-label">What a system does</span><article><b>Enable</b><p>A small step.</p></article><article><b>Prompt</b><p>The right moment.</p></article><article><b>Reward</b><p>Progress you can see now.</p></article></div>
      <p class="s-adapt">${icon('repeat')}<span><b>Adapt</b> as life changes, so it keeps happening.</span></p>
    </div></div>
    <p class="r-source"><a href="https://implementationscience.biomedcentral.com/articles/10.1186/1748-5908-6-42" target="_blank" rel="noopener noreferrer">COM-B · capability, opportunity, motivation · Michie, van Stralen &amp; West</a></p>`,
};

// The big idea as a signpost: three numbered parts, in the order this deck presents them.
const anchor = {
  ...pick('What the system needs'),
  content: `${heading('Atlas · A behavioural operating system', 'Making banking <br><em>a relationship again.</em>', 'The system has to know you, and you have to trust it. Three things earn that.')}
    <div class="n-body"><ol class="n-pillar-list" aria-label="How Atlas earns the relationship">
      <li><span>01</span><h2>Behavioural science</h2><p>Makes the support feel like yours.</p></li>
      <li><span>02</span><h2>AI and human support</h2><p>Knows you, and finds the right moment.</p></li>
      <li><span>03</span><h2>A loyalty framework</h2><p>Makes the effort worth it now.</p></li>
    </ol></div>`,
};

// The three needs become the three tabs, in the app's own order, with where each shows up.
const needs = {
  ...pick('Behavioural science'),
  theme: `${pick('Behavioural science').theme} s-needs`,
  content: `${heading('01 · Behavioural science', 'People keep going when they feel <em>capable, connected and in control.</em>', 'So Atlas has three tabs, one for each need.')}
    <div class="n-body"><div class="n-tabs s-tabs">
      <article style="--tab:#3e8178"><span class="n-tab-glyph" aria-hidden="true">${icon('grid_view')}</span><span class="r-label">Competence</span><h2>Now</h2><p>“I can see where I stand, and act.”</p><p class="s-atlas">My numbers, stories and routines that run on payday.</p></article>
      <article style="--tab:#447f99"><span class="n-tab-glyph" aria-hidden="true">${icon('trending_up')}</span><span class="r-label">Autonomy</span><h2>Future</h2><p>“I choose my direction.”</p><p class="s-atlas">Possibilities, Time Travel and What if, before I commit.</p></article>
      <article style="--tab:#8465a5"><span class="n-tab-glyph" aria-hidden="true">${icon('person')}</span><span class="r-label">Relatedness</span><h2>You</h2><p>“I’m heard, known and recognised.”</p><p class="s-atlas">A portrait I can shape, check-ins and Points.</p></article>
    </div><p class="s-companion">${icon('auto_awesome')}<span>One AI Companion across all three, carrying what we learn from one to the next.</span></p></div>
    <p class="r-source"><a href="https://selfdeterminationtheory.org/the-theory/" target="_blank" rel="noopener noreferrer">Self-Determination Theory · Deci &amp; Ryan. The tab mapping is our design application.</a></p>`,
};

export const slides = [
  pick('Cover'),
  pick('The problem'),
  pick('What customers want'),
  pick('Why a bank should build this'),
  pick('Why it is hard'),
  gap,
  anchor,
  needs,
  numbered('AI and human support', '02'),
  numbered('A loyalty framework', '03'),
  pick('The flywheel'),
  pick('Close'),
];
