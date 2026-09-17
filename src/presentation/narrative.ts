import { materialIcons, materialViewBoxes } from '../design-system/icons.mjs';

const icon = (name: keyof typeof materialIcons) =>
  `<svg class="deck-icon" aria-hidden="true" viewBox="${materialViewBoxes[name] || '0 -960 960 960'}">${materialIcons[name] || materialIcons.auto_awesome}</svg>`;
const heading = (label: string, title: string, intro = '') =>
  `<div class="r-heading"><p class="eyebrow">${label}</p><h1>${title}</h1>${intro ? `<p class="r-intro">${intro}</p>` : ''}</div>`;
const close = (text: string) => `<p class="r-close">${text}</p>`;
const source = (url: string, text: string) =>
  `<p class="r-source"><a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a></p>`;
const arrow = `<span class="r-arrow" aria-hidden="true">${icon('arrow_forward')}</span>`;
const phone = (tab: 'now' | 'you' | 'future', caption: string) =>
  `<figure class="product-figure"><div class="phone-frame"><img src="/assets/presentation/sam-${tab}.webp" alt="${caption}" width="390" height="844" loading="lazy"></div><figcaption>Sam’s ${tab === 'you' ? 'You' : tab === 'now' ? 'Now' : 'Future'} · from the working prototype</figcaption></figure>`;
const note = (number: string, feature: string, text: string, builds: string) =>
  `<li><span class="n-note-number">${number}</span><div><b>${feature}</b><p>${text}</p><small>${builds}</small></div></li>`;

export const slides = [
  {
    stage: 'Cover',
    title: 'Making banking a relationship again',
    theme: 'cover n-cover',
    content: `<div class="cover-copy"><p class="eyebrow">HSBC ATLAS · A CONCEPT FOR THE NEXT DECADE</p><h1>Making banking <br>a relationship <br><em>again.</em></h1><p class="lead">Support for all of life’s complexity. <br>Designed to transform financial lives.</p></div><div class="cover-art" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="orbit orbit-three"></div><span class="orbit-label label-now">Now</span><span class="orbit-label label-future">Future</span><span class="orbit-label label-you">You</span><span class="orbit-center">One life.<br>Connected.</span></div>`,
  },
  {
    stage: 'The problem',
    title: 'Banking has become transactional',
    theme: 'r-slide n-history',
    content: `${heading('THE PROBLEM', 'Banking has become <br><em>transactional.</em>')}
      <div class="r-timeline">
        <article><span class="r-label">Past</span><div class="r-time-icon">${icon('group')}</div><h2>A familiar face.</h2><p>Loyalty to a person who knew you. <br>Hard to scale.</p></article>
        <article><span class="r-label">Present</span><div class="r-time-icon">${icon('credit_card')}</div><h2>Convenience at scale.</h2><p>Banking got easier. <br>The relationship became the app.</p></article>
        <article><span class="r-label">Future · If we do nothing</span><div class="r-time-icon">${icon('swap_horiz')}</div><h2>A race to the bottom.</h2><p>Customers chase rates and incentives. <br>We become an interchangeable utility.</p></article>
      </div>
      ${close('Loyalty to a product is rented. It leaves with the next offer.')}`,
  },
  {
    stage: 'What customers want',
    title: 'If features alone were the solution',
    theme: 'r-slide n-want',
    content: `${heading('WHAT CUSTOMERS WANT', 'If features alone were the solution, good financial outcomes would be <em>the norm.</em>')}
      <div class="n-want-grid">
        <div class="n-want-outcomes"><span class="r-label">What aspiring households tell us they want</span><h2>A home of their own.</h2><h2>A buffer for the unexpected.</h2><h2>Choice about work and later life.</h2></div>
        <div class="n-want-features"><span class="r-label">What we have given them</span><ul aria-label="Existing features"><li>Accounts</li><li>Savings Pots</li><li>Budgets</li><li>Alerts</li><li>Investments</li><li>Life Planner</li><li>Mortgages</li><li>Pensions</li><li>Money Rules</li><li>Insights</li><li>Round-ups</li><li>Cashback</li></ul></div>
      </div>
      ${close('Customers have told us for years. The industry has not solved it, because it is hard.')}`,
  },
  {
    stage: 'Why it is hard',
    title: 'You don’t build a deposit in a day',
    theme: 'r-slide n-journeys',
    content: `${heading('WHY IT IS HARD', 'You don’t build a deposit <br><em>in a day.</em>', 'Long-term outcomes are built from behaviours, sustained over years.')}
      <div class="r-comparison">
        <article><span class="r-label">Pay a bill</span><h2>An immediate result.</h2><div class="r-path"><span>Need</span>${arrow}<span>Act</span>${arrow}<span>Relief</span></div><p>The need is the prompt. <br>Relief is the reward.</p><b>Design a feature.</b></article>
        <article><span class="r-label">Build a buffer</span><h2>A result built over years.</h2><div class="r-path"><span>Goal</span>${arrow}<span class="r-repeat">Repeated action ${icon('repeat')}</span></div><p>Nothing prompts you this morning. <br>£100 saved doesn’t feel like anything yet.</p><b>Design for the behaviour.</b></article>
      </div>
      ${close('Only sustained behaviour drives long-term outcomes. So we design for the behaviours the outcome depends on.')}`,
  },
  {
    stage: 'The behaviour gap',
    title: 'Able to. The situation lets them. Wants to.',
    theme: 'r-slide n-conditions',
    content: `${heading('THE BEHAVIOUR GAP', 'A behaviour happens when someone is <em>able&nbsp;to,</em> the situation <em>lets&nbsp;them,</em> and they <em>want&nbsp;to.</em>', 'Most failures are one of the three missing. Take Sam moving £100 to his house deposit.')}
      <div class="n-conditions-grid">
        <article class="n-yes"><span class="n-mark">${icon('check')}</span><span class="r-label">Able to</span><h2>Yes.</h2><p>The Pot exists. The transfer takes ten seconds.</p><b>Features solve this.</b></article>
        <article><span class="n-mark">${icon('close')}</span><span class="r-label">The situation lets them</span><h2>No.</h2><p>Nothing on payday says <i>now</i>. <br>The bills say <i>not now</i>.</p><b>No prompt at the right moment.</b></article>
        <article><span class="n-mark">${icon('close')}</span><span class="r-label">Wants to</span><h2>No.</h2><p>£100 towards £24,000 feels like nothing. <br>The reward is years away.</p><b>No payoff today.</b></article>
      </div>
      ${close('Features make people able. They rarely fix the situation, or the wanting.')}
      ${source('https://implementationscience.biomedcentral.com/articles/10.1186/1748-5908-6-42', 'COM-B · capability, opportunity, motivation · Michie, van Stralen & West')}`,
  },
  {
    stage: 'The design shift',
    title: 'From features to a system',
    theme: 'r-slide n-shift',
    content: `${heading('THE DESIGN SHIFT', 'From designing features <br>to designing <em>a system</em> that supports the behaviour.')}
      <div class="n-shift-grid">
        <article class="n-feature"><span class="r-label">A feature</span><h2>One job.</h2><p>Done when the task is done.</p></article>
        <ol class="n-system" aria-label="What the system does">
          <li><span class="r-label">A system</span></li>
          <li><b>Prompt</b><p>The right nudge at the right moment.</p><small>The situation lets them</small></li>
          <li><b>Enable</b><p>A small step that is easy to take.</p><small>Able to</small></li>
          <li><b>Reward</b><p>A payoff now, while the outcome is years away. What’s rewarded is repeated.</p><small>Wants to</small></li>
          <li><b>Adapt</b><p>Learn from the response. Change the support as life changes.</p><small>Keeps all three true</small></li>
        </ol>
      </div>
      ${close('Features are the steps. The system is what keeps you walking.')}`,
  },
  {
    stage: 'Why a bank should build this',
    title: 'Building better customers builds a better bank',
    theme: 'r-value r-slide n-thesis',
    content: `${heading('WHY A BANK SHOULD BUILD THIS', 'Building better customers <br>builds <em>a better bank.</em>')}
      <ol class="n-chain" aria-label="How customer progress becomes bank value">
        <li><h2>Sustained behaviours</h2><p>Small actions, repeated over years.</p>${arrow}</li>
        <li><h2>A healthier financial standing</h2><p>A buffer. A deposit. A plan that holds.</p>${arrow}</li>
        <li><h2>A bank worth staying with</h2><p>Larger balances. More assets under management. A reason to stay.</p></li>
      </ol>
      ${close('When customers move forward, so do we.')}`,
  },
  {
    stage: 'What makes the system run',
    title: 'A relationship is earned and developed, again and again',
    theme: 'r-slide n-flywheel',
    content: `${heading('WHAT MAKES THE SYSTEM RUN', 'A relationship is earned and developed, <br><em>again and again.</em>', 'A prompt from a stranger is noise. A reward from a stranger is a gimmick. People follow a coach they trust.')}
      <ol class="r-cycle">
        <li><span>01</span><h2>Small interactions</h2><p>A check-in. A question. A choice.</p>${arrow}</li>
        <li><span>02</span><h2>Memory</h2><p>We remember what you told us.</p>${arrow}</li>
        <li><span>03</span><h2>Relationship</h2><p>You see what we think, and can correct it.</p>${arrow}</li>
        <li><span>04</span><h2>Better support</h2><p>The next suggestion fits your life.</p>${arrow}</li>
        <li><span>05</span><h2>Better outcomes</h2><p>Progress you can see.</p>${arrow}</li>
        <li><span>06</span><h2>More interactions</h2><p>A reason to come back.</p>${arrow}</li>
      </ol>
      ${close('Each small exchange makes the next one more personal.')}`,
  },
  {
    stage: 'The enabler',
    title: 'AI is the orchestrator and the curator',
    theme: 'r-slide n-ai',
    content: `${heading('THE ENABLER', 'AI is the orchestrator <br>and <em>the curator.</em>')}
      <div class="n-modes">
        <article><div class="n-mode-icon">${icon('arrow_upward')}</div><span class="r-label">Push</span><h2>It suggests when you don’t know where to start.</h2><p>A possibility at 41. A pattern in your spending. A next step, ready to approve.</p></article>
        <article><div class="n-mode-icon">${icon('arrow_downward')}</div><span class="r-label">Pull</span><h2>It listens when you want to talk.</h2><p>A conversation one tap from whatever is on screen. The whole bank’s tools, insight and people, brought to one person.</p></article>
        <article><div class="n-mode-icon">${icon('person')}</div><span class="r-label">Human</span><h2>People hold the pen where it matters.</h2><p>HSBC experts review the AI’s work and take over when judgement or care is needed.</p></article>
      </div>
      ${close('Not a chatbot. A system that knows when to speak, when to listen, and when to hand over.')}`,
  },
  {
    stage: 'The experience',
    title: 'Capable, connected and in control',
    theme: 'r-slide n-three',
    content: `${heading('THE EXPERIENCE', 'People keep going when they feel <em>capable, connected and in control.</em>', 'Now, You and Future are built on those three needs.')}
      <div class="r-tab-columns">
        <article><span class="r-label">Competence</span><h2>Now</h2><b>“I can see where I stand, and act.”</b></article>
        <article><span class="r-label">Relatedness</span><h2>You</h2><b>“I’m heard, known and recognised.”</b></article>
        <article><span class="r-label">Autonomy</span><h2>Future</h2><b>“I choose my direction.”</b></article>
      </div>
      ${close('The gap told us why behaviours fail. These needs tell us what keeps them going.')}
      ${source('https://selfdeterminationtheory.org/the-theory/', 'Self-Determination Theory · Deci & Ryan. The tab mapping is our design application.')}`,
  },
  {
    stage: 'Now',
    title: 'I can see where I stand. I know what to do next.',
    theme: 'r-slide n-product n-now',
    content: `<div class="n-product-copy">${heading('NOW · COMPETENCE', 'I can see where I stand. <br><em>I know what to do next.</em>')}
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
    content: `<div class="n-product-copy">${heading('YOU · RELATEDNESS', 'The bank that remembers <br><em>what I told it.</em>')}
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
    content: `<div class="n-product-copy">${heading('FUTURE · AUTONOMY', 'I choose my direction. <br><em>The bank shows me the trade-offs.</em>')}
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
    theme: 'r-value r-slide n-close',
    content: `${heading('MAKING BANKING A RELATIONSHIP AGAIN', 'Loyalty to a product is rented. <br>Loyalty to a relationship is <em>earned.</em>')}
      <div class="n-parts"><span class="r-label">What Atlas brings together</span><p><b>Behavioural science.</b><span>Designed around what keeps people going.</span></p><p><b>A loyalty framework.</b><span>Rewards sharing, and positive financial behaviour.</span></p><p><b>AI and human support.</b><span>Hyper-personal. Hands over when it matters.</span></p></div>
      <div class="r-finale"><h2>When customers move forward, <br>so do we.</h2><a class="primary-link" data-demo href="/?p=sam&tab=now&theme=vanilla">Experience it with Sam ${icon('arrow_forward')}</a></div>`,
  },
];
