import { materialIcons, materialViewBoxes } from '../design-system/icons.mjs';

const icon = (name: keyof typeof materialIcons) =>
  `<svg class="deck-icon" aria-hidden="true" viewBox="${materialViewBoxes[name] || '0 -960 960 960'}">${materialIcons[name] || materialIcons.auto_awesome}</svg>`;
const heading = (label: string, title: string, intro = '') =>
  `<div class="r-heading"><p class="eyebrow">${label}</p><h1>${title}</h1>${intro ? `<p class="r-intro">${intro}</p>` : ''}</div>`;
const body = (inner: string) => `<div class="n-body">${inner}</div>`;
const close = (text: string) => `<p class="r-close">${text}</p>`;
const source = (text: string, url = '') =>
  url
    ? `<p class="r-source"><a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a></p>`
    : `<p class="r-source">${text}</p>`;
const arrow = `<span class="r-arrow" aria-hidden="true">${icon('arrow_forward')}</span>`;
const stat = (figure: string, text: string) =>
  `<div class="n-stat"><b>${figure}</b><span>${text}</span></div>`;
const phone = (tab: 'now' | 'you' | 'future', caption: string) =>
  `<figure class="product-figure"><div class="phone-frame"><img src="/assets/presentation/sam-${tab}.webp" alt="${caption}" width="390" height="844" loading="lazy"></div><figcaption>Sam’s ${tab === 'you' ? 'You' : tab === 'now' ? 'Now' : 'Future'} · from the working prototype</figcaption></figure>`;
const note = (number: string, feature: string, text: string, builds: string) =>
  `<li><span class="n-note-number">${number}</span><div><b>${feature}</b><p>${text}</p><small>${builds}</small></div></li>`;

/* Circular flywheel: a hairline ring with six red chevrons, nodes placed around it. */
const wheelRing = (() => {
  const chevrons = [30, 90, 150, 210, 270, 330]
    .map(
      (a) =>
        `<path d="M275 59.5 L286 65 L275 70.5 Z" transform="rotate(${a} 280 280)" fill="#db0011"/>`,
    )
    .join('');
  return `<svg class="n-wheel-ring" viewBox="0 0 560 560" aria-hidden="true"><circle cx="280" cy="280" r="215" fill="none" stroke="#cdc8c6" stroke-width="1"/>${chevrons}</svg>`;
})();

export const slides = [
  {
    stage: 'Cover',
    title: 'Making banking a relationship again',
    theme: 'n-cover r-slide',
    content: `<div class="n-cover-copy"><p class="eyebrow">HSBC Atlas · A concept for the next decade</p><h1>Making banking <br>a relationship <br><em>again.</em></h1><p class="n-lead">Support for all of life’s complexity. <br>Designed to transform financial lives.</p></div><div class="n-cover-art" aria-hidden="true"></div>`,
  },
  {
    stage: 'The problem',
    title: 'Banking has become transactional',
    theme: 'r-slide n-history',
    content: `${heading('The problem', 'Banking has become <br><em>transactional.</em>')}
      ${body(`<div class="n-timeline">
        <article><span class="r-label">Past</span><h2>A familiar face.</h2><p>Loyalty to a person who knew you. Hard to scale.</p></article>
        <article><span class="r-label">Present</span><h2>Convenience at scale.</h2><p>Banking got easier. The relationship became the app.</p></article>
        <article><span class="r-label">Future, if we do nothing</span><h2>A race to the bottom.</h2><p>Customers chase rates and incentives. We become an interchangeable utility.</p></article>
      </div>`)}
      ${close('Loyalty to a product is rented. It leaves with the next offer.')}`,
  },
  {
    stage: 'What customers want',
    title: 'If features alone were the solution',
    theme: 'r-slide n-want',
    content: `${heading('What customers want', 'If features alone were the solution, good financial outcomes would be <em>the norm.</em>')}
      ${body(`<div class="n-want-grid">
        <div class="n-want-outcomes"><span class="r-label">What aspiring households tell us they want</span><h2>A home of their own.</h2><h2>A buffer for the unexpected.</h2><h2>Choice about work and later life.</h2></div>
        <div class="n-want-features"><span class="r-label">What we have given them</span><p>Accounts. Savings Pots. Budgets. Alerts. Investments. Life Planner. Mortgages. Pensions. Money Rules. Insights. Round-ups. Cashback.</p></div>
      </div>
      <div class="n-stats">
        ${stat('38%', 'of UK adults check a banking app every day.')}
        ${stat('13.1m', 'adults with low financial resilience. Unchanged since 2022.')}
      </div>`)}
      ${close('We have never had more of their attention. It has never made less difference.')}
      ${source('HSBC with YouGov, 2025 · FCA Financial Lives, 2024')}`,
  },
  {
    stage: 'Why it is hard',
    title: 'You don’t build a deposit in a day',
    theme: 'r-slide n-journeys',
    content: `${heading('Why it is hard', 'You don’t build a deposit <br><em>in a day.</em>', 'Sam is 33, with two kids and £6,400 of a £24,000 deposit. Outcomes like his are built from behaviours, sustained over years.')}
      ${body(`<div class="n-journeys-grid">
        <article><span class="r-label">Pay a bill</span><h2>An immediate result.</h2><div class="n-path"><span>Need</span>${arrow}<span>Act</span>${arrow}<span>Relief</span></div><p>The need is the prompt. Relief is the reward.</p><b>Design a feature.</b></article>
        <article><span class="r-label">Build a buffer</span><h2>A result built over years.</h2><div class="n-path"><span>Goal</span>${arrow}<span class="n-repeat">Repeated action ${icon('repeat')}</span></div><p>Nothing prompts you this morning. £100 saved doesn’t feel like anything yet.</p><b>Design for the behaviour.</b></article>
      </div>`)}
      ${close('Only sustained behaviour drives long-term outcomes. So we design for the behaviours the outcome depends on.')}`,
  },
  {
    stage: 'The behaviour gap',
    title: 'Able to. The situation lets them. Wants to.',
    theme: 'r-slide n-conditions',
    content: `${heading('The behaviour gap', 'A behaviour happens when someone is <em>able&nbsp;to,</em> the situation <em>lets&nbsp;them,</em> and they <em>want&nbsp;to.</em>', 'Most failures are one of the three missing. Take Sam moving £100 to his house deposit.')}
      ${body(`<div class="n-conditions-grid">
        <article><span class="r-label">Able to</span><h2>Yes.</h2><p>The Pot exists. The transfer takes ten seconds.</p><b>Features solve this.</b></article>
        <article class="n-no"><span class="r-label">The situation lets them</span><h2>No.</h2><p>Nothing on payday says <i>now</i>. The bills say <i>not now</i>.</p><b>No prompt at the right moment.</b></article>
        <article class="n-no"><span class="r-label">Wants to</span><h2>No.</h2><p>£100 towards £24,000 feels like nothing. The reward is years away.</p><b>No payoff today.</b></article>
      </div>`)}
      ${close('Features make people able. They rarely fix the situation, or the wanting.')}
      ${source('COM-B · capability, opportunity, motivation · Michie, van Stralen & West', 'https://implementationscience.biomedcentral.com/articles/10.1186/1748-5908-6-42')}`,
  },
  {
    stage: 'The design shift',
    title: 'From features to a system',
    theme: 'r-slide n-shift',
    content: `${heading('The design shift', 'From designing features <br>to designing <em>a system</em> that supports the behaviour.')}
      ${body(`<div class="n-shift-grid">
        <div class="n-feature"><span class="r-label">A feature</span><div class="n-node"><b>One job</b><p>Done when the task is done.</p></div></div>
        <div class="n-system"><span class="r-label">A system</span>
          <ol class="n-steps">
            <li><b>Prompt</b><p>The right nudge at the right moment.</p><small>The situation lets them</small></li>
            <li>${arrow}</li>
            <li><b>Enable</b><p>A small step that is easy to take.</p><small>Able to</small></li>
            <li>${arrow}</li>
            <li><b>Reward</b><p>A payoff now, while the outcome is years away. What’s rewarded is repeated.</p><small>Wants to</small></li>
            <li>${arrow}</li>
            <li><b>Adapt</b><p>Learn from the response. Change the support as life changes.</p><small>Keeps all three true</small></li>
          </ol>
          <div class="n-loop" aria-hidden="true"><span>${icon('repeat')} Again next payday, next month, next year</span></div>
        </div>
      </div>
      <div class="n-stats n-stats-one">
        ${stat(`42% <span class="n-stat-arrow" aria-hidden="true">${icon('arrow_forward')}</span> 86%`, 'UK pension auto-enrolment took workplace pension participation from 42% to 86% in a decade. Not a feature. A system.')}
      </div>`)}
      ${close('Features are the steps. The system is what keeps you walking.')}
      ${source('Institute for Fiscal Studies')}`,
  },
  {
    stage: 'Why a bank should build this',
    title: 'Building better customers builds a better bank',
    theme: 'n-red r-slide n-thesis',
    content: `${heading('Why a bank should build this', 'Building better customers <br>builds <em>a better bank.</em>')}
      ${body(`<ol class="n-chain" aria-label="How customer progress becomes bank value">
        <li><h2>Sustained behaviours</h2><p>Small actions, repeated over years.</p>${arrow}</li>
        <li><h2>A healthier financial standing</h2><p>A buffer. A deposit. A plan that holds.</p>${arrow}</li>
        <li><h2>A bank worth staying with</h2><p>Larger balances. More assets under management. A reason to stay.</p></li>
      </ol>`)}
      ${close('When customers move forward, so do we.')}`,
  },
  {
    stage: 'What makes the system run',
    title: 'A relationship is earned and developed, again and again',
    theme: 'r-slide n-flywheel',
    content: `<div class="n-flywheel-copy">${heading('What makes the system run', 'A relationship is earned and developed, <br><em>again and again.</em>', 'A prompt from a stranger is noise. A reward from a stranger is a gimmick. People follow a coach they trust.')}
      ${close('Each small exchange makes the next one more personal.')}</div>
      <div class="n-wheel" role="img" aria-label="A loop: small interactions build memory, memory builds the relationship, the relationship improves support, better support leads to better outcomes, and better outcomes bring more interactions.">
        ${wheelRing}
        <p class="n-wheel-centre"><em>The relationship</em><span>earned, again and again</span></p>
        <ol class="n-wheel-nodes">
          <li><span>01</span><b>Small interactions</b><p>A check-in. A question. A choice.</p></li>
          <li><span>02</span><b>Memory</b><p>We remember what you told us.</p></li>
          <li><span>03</span><b>Relationship</b><p>You see what we think, and can correct it.</p></li>
          <li><span>04</span><b>Better support</b><p>The next suggestion fits your life.</p></li>
          <li><span>05</span><b>Better outcomes</b><p>Progress you can see.</p></li>
          <li><span>06</span><b>More interactions</b><p>A reason to come back.</p></li>
        </ol>
      </div>`,
  },
  {
    stage: 'The enabler',
    title: 'AI is the orchestrator and the curator',
    theme: 'r-slide n-ai',
    content: `${heading('The enabler', 'AI is the orchestrator <br>and <em>the curator.</em>', '<b>49%</b> of people already use AI to help with money decisions. <b>11%</b> would let it act unsupervised. That gap is the design brief.')}
      ${body(`<div class="n-layer">
        <div class="n-layer-col"><span class="r-label">What the bank can offer</span><ul><li>Products and tools</li><li>Insight and messages</li><li>Human experts</li></ul></div>
        <div class="n-layer-arrow" aria-hidden="true">${icon('arrow_forward')}</div>
        <div class="n-layer-core"><span class="r-label">The AI layer</span><h2>Understands. <br>Curates. <br>Coordinates.</h2><div class="n-modes"><p><b>Push</b>It suggests when you don’t know where to start.</p><p><b>Pull</b>It listens when you want to talk.</p></div></div>
        <div class="n-layer-arrow" aria-hidden="true">${icon('arrow_forward')}</div>
        <div class="n-layer-col"><span class="r-label">What the customer experiences</span><ul><li>Now, You and Future</li><li>A conversation one tap from whatever is on screen</li><li>A person who takes over when judgement or care is needed</li></ul></div>
      </div>`)}
      ${close('Not a chatbot. A system that knows when to speak, when to listen, and when to hand over.')}
      ${source('EY global consumer survey, 2026, n=18,152')}`,
  },
  {
    stage: 'The experience',
    title: 'Capable, connected and in control',
    theme: 'r-slide n-three',
    content: `${heading('The experience', 'People keep going when they feel <em>capable, connected and in control.</em>', 'Now, You and Future are built on those three needs.')}
      ${body(`<div class="n-tabs">
        <article><span class="r-label">Competence</span><h2>Now</h2><p>“I can see where I stand, and act.”</p></article>
        <article><span class="r-label">Relatedness</span><h2>You</h2><p>“I’m heard, known and recognised.”</p></article>
        <article><span class="r-label">Autonomy</span><h2>Future</h2><p>“I choose my direction.”</p></article>
      </div>`)}
      ${close('The gap told us why behaviours fail. These needs tell us what keeps them going.')}
      ${source('Self-Determination Theory · Deci & Ryan. The tab mapping is our design application.', 'https://selfdeterminationtheory.org/the-theory/')}`,
  },
  {
    stage: 'Now',
    title: 'I can see where I stand. I know what to do next.',
    theme: 'r-slide n-product n-now',
    content: `<div class="n-product-copy">${heading('Now · Competence', 'I can see where I stand. <br><em>I know what to do next.</em>')}
      <ol class="n-notes" aria-label="What each part of Now is designed to build">
        ${note('01', 'My numbers and Stories', 'Turn data into meaning. Understand today.', 'Able to')}
        ${note('02', 'Contextual AI', 'Help that follows what you are looking at. No blank chat.', 'The situation')}
        ${note('03', 'Pots and Money Rules', 'Turn one good move into a routine.', 'Repeatable')}
      </ol>
      <a class="n-explore" data-demo href="/?p=sam&tab=now&theme=vanilla">Explore Sam’s Now ${icon('arrow_forward')}</a></div>
      ${phone('now', 'Sam’s Now: a recap, quick actions and the numbers he cares about.')}`,
  },
  {
    stage: 'You',
    title: 'The bank that remembers what I told it',
    theme: 'r-slide n-product n-you',
    content: `<div class="n-product-copy">${heading('You · Relatedness', 'The bank that remembers <br><em>what I told it.</em>')}
      <ol class="n-notes" aria-label="What each part of You is designed to build">
        ${note('01', 'Money check-in', 'How do you feel about money today? A daily moment that opens a conversation and builds memory.', 'Memory')}
        ${note('02', 'Your portrait', 'What we think you are like, with the evidence. Correct us.', 'Trust')}
        ${note('03', 'Points and challenges', 'What’s rewarded is repeated. Points buy things that build the next behaviour: a rate boost, a coaching session.', 'Wants to')}
      </ol>
      <a class="n-explore" data-demo href="/?p=sam&tab=you&theme=vanilla">Explore Sam’s You ${icon('arrow_forward')}</a></div>
      ${phone('you', 'Sam’s You: money check-in, household and money personality.')}`,
  },
  {
    stage: 'Future',
    title: 'I choose my direction. The bank shows me the trade-offs.',
    theme: 'r-slide n-product n-future',
    content: `<div class="n-product-copy">${heading('Future · Autonomy', 'I choose my direction. <br><em>The bank shows me the trade-offs.</em>')}
      <ol class="n-notes" aria-label="What each part of Future is designed to build">
        ${note('01', 'Possibilities', 'A starting point when you don’t have one. AI suggests. You decide.', 'The situation')}
        ${note('02', 'Time Travel and What if', 'See the consequence before you commit. £50 more on payday: the emergency fund lands 11 months sooner.', 'Able to')}
        ${note('03', 'Approve the plan', 'You commit. A Money Rule keeps it going.', 'Repeatable')}
      </ol>
      <a class="n-explore" data-demo href="/?p=sam&tab=future&theme=vanilla">Explore Sam’s Future ${icon('arrow_forward')}</a></div>
      ${phone('future', 'Sam’s Future: goals, time travel and what-if trade-offs.')}`,
  },
  {
    stage: 'Close',
    title: 'Loyalty to a relationship is earned',
    theme: 'r-value r-slide n-close n-grain',
    content: `${heading('Making banking a relationship again', 'Loyalty to a product is rented. <br>Loyalty to a relationship is <em>earned.</em>')}
      ${body(`<div class="n-parts"><span class="r-label">What Atlas brings together</span><p><b>Behavioural science.</b><span>Designed around what keeps people going.</span></p><p><b>A loyalty framework.</b><span>Rewards sharing, and positive financial behaviour.</span></p><p><b>AI and human support.</b><span>Hyper-personal. Hands over when it matters.</span></p></div>`)}
      <div class="r-finale"><h2>When customers move forward, <br>so do we.</h2><a class="primary-link" data-demo href="/?p=sam&tab=now&theme=vanilla">Experience it with Sam ${icon('arrow_forward')}</a></div>`,
  },
];
