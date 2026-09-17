import { materialIcons, materialViewBoxes } from '../design-system/icons.mjs';

const icon = (name: keyof typeof materialIcons) =>
  `<svg class="deck-icon" aria-hidden="true" viewBox="${materialViewBoxes[name] || '0 -960 960 960'}">${materialIcons[name] || materialIcons.auto_awesome}</svg>`;
const heading = (label: string, title: string, intro = '') =>
  `<div class="r-heading"><p class="eyebrow">${label}</p><h1>${title}</h1>${intro ? `<p class="r-intro">${intro}</p>` : ''}</div>`;
const close = (text: string) => `<p class="r-close">${text}</p>`;
const source = (url: string, text: string) =>
  `<p class="r-source"><a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a></p>`;
const arrow = `<span class="r-arrow" aria-hidden="true">${icon('arrow_forward')}</span>`;

export const slides = [
  {
    stage: 'The commercial problem',
    title: 'A relationship, or a utility?',
    theme: 'r-slide r-history',
    content: `${heading('THE COMMERCIAL PROBLEM', 'A relationship, <br>or <em>a utility?</em>')}
      <div class="r-timeline">
        <article><span class="r-label">Past</span><div class="r-time-icon">${icon('group')}</div><h2>A familiar face.</h2><p>Personal conversations built loyalty to a local bank. <br>That relationship was hard to scale.</p></article>
        <article><span class="r-label">Present</span><div class="r-time-icon">${icon('credit_card')}</div><h2>Convenience at scale.</h2><p>Digitisation made banking easier. <br>The relationship became more transactional.</p></article>
        <article><span class="r-label">Future · If we do not act</span><div class="r-time-icon">${icon('swap_horiz')}</div><h2>A race to the bottom.</h2><p>Competing on rates and incentives risks making us an interchangeable utility.</p></article>
      </div>
      ${close('We need to earn a place in customers’ lives beyond the next transaction or better offer.')}`,
  },
  {
    stage: 'The opportunity',
    title: 'Give customers a reason to stay.',
    theme: 'r-slide r-opportunity',
    content: `${heading('THE OPPORTUNITY', 'Give customers <br><em>a reason to stay.</em>', 'Help them make lasting progress towards the life they want.')}
      <div class="r-gap">
        <div><span class="r-label">What we already provide</span><h2>Access to tools.</h2><p>Accounts. Savings Pots. <br>Investments. Life planning.</p></div>
        <div class="r-gap-bridge">${icon('arrow_forward')}</div>
        <div><span class="r-label">What customers want</span><h2>Progress in life.</h2><p>A home. Financial security. <br>More choice about the future.</p></div>
      </div>
      <blockquote class="r-quote">If features alone were the solution, <br><strong>good financial outcomes would be the norm.</strong></blockquote>`,
  },
  {
    stage: 'The behavioural gap',
    title: 'Complete a task. Sustain a change.',
    theme: 'r-slide r-journeys',
    content: `${heading('WHY TOOLS ALONE ARE NOT ENOUGH', 'Complete a task. <br><em>Sustain a change.</em>')}
      <div class="r-comparison">
        <article><span class="r-label">Transactional journey</span><h2>An immediate result.</h2><div class="r-path"><span>Need</span>${arrow}<span>Action</span>${arrow}<span>Result</span></div><p>The need prompts action. <br>Solving it provides the reward.</p><b>Make the task easy to complete.</b></article>
        <article><span class="r-label">Transformational journey</span><h2>A result built over time.</h2><div class="r-path"><span>Goal</span>${arrow}<span class="r-repeat">Repeated action ${icon('repeat')}</span></div><p>The goal can feel distant. <br>Today’s effort needs a payoff along the way.</p><b>Help the customer keep going.</b></article>
      </div>
      ${close('Long-term outcomes depend on what customers can sustain between individual transactions.')}`,
  },
  {
    stage: 'The behaviours',
    title: 'Small actions. Sustained over time.',
    theme: 'r-slide r-behaviours',
    content: `${heading('THE BEHAVIOURS WE WANT TO SUPPORT', 'Small actions. <br><em>Sustained over time.</em>', 'Practical habits that fit each customer’s means and goals.')}
      <div class="r-habits">
        <article><span>01</span><div><h2>Stay on top.</h2><p>Understand income, spending and commitments.</p></div>${icon('grid_view')}</article>
        <article><span>02</span><div><h2>Save regularly.</h2><p>Build a buffer and fund chosen goals.</p></div>${icon('account_balance_wallet')}</article>
        <article><span>03</span><div><h2>Invest appropriately.</h2><p>Build for the long term when circumstances allow.</p></div>${icon('trending_up')}</article>
        <article><span>04</span><div><h2>Review and adjust.</h2><p>Adapt as priorities and circumstances change.</p></div>${icon('swap_horiz')}</article>
      </div>
      ${close('The design challenge is to make these behaviours easier to sustain.')}`,
  },
  {
    stage: 'The design shift',
    title: 'From individual features to a system of support.',
    theme: 'r-slide r-system-design',
    content: `${heading('THE DESIGN MINDSET SHIFT', 'From individual features <br>to <em>a system of support.</em>', 'Connect the parts around the customer’s goal.')}
      <ol class="r-support-loop">
        <li><span class="r-step-number">01</span><h2>Prompt</h2><p>Make the next step timely and meaningful.</p>${arrow}</li>
        <li><span class="r-step-number">02</span><h2>Enable</h2><p>Make action manageable and easy to repeat.</p>${arrow}</li>
        <li><span class="r-step-number">03</span><h2>Recognise</h2><p>Show progress. Give effort a payoff now.</p>${arrow}</li>
        <li><span class="r-step-number">04</span><h2>Adapt</h2><p>Learn from the response and adjust the support.</p>${icon('repeat')}</li>
      </ol>
      ${close('For customers to welcome ongoing support, it must fit their lives and earn their trust.')}
      ${source('https://www.behaviormodel.org/', 'Behavioural foundation: Fogg Behavior Model · motivation, ability and prompts')}`,
  },
  {
    stage: 'The Atlas proposition',
    title: 'Make banking a relationship again.',
    theme: 'r-proposition r-slide',
    content: `${heading('THE ATLAS PROPOSITION', 'Make banking <br>a <em>relationship</em> <br>again.', 'Earn trust through useful, personal support over time.')}
      <div class="r-promises"><p><b>Know me.</b><span>Understand my life. <br>Remember what matters.</span></p><p><b>Work with me.</b><span>Listen and explain. <br>Let me choose.</span></p><p><b>Stay useful.</b><span>Recognise progress. <br>Adapt as life changes.</span></p></div>
      ${close('Trust makes support welcome. Useful support earns trust.')}`,
  },
  {
    stage: 'Why now · AI orchestration',
    title: 'The whole bank. Made relevant to one person.',
    theme: 'r-slide r-orchestration',
    content: `${heading('WHY NOW · AI AS ORCHESTRATOR AND CURATOR', 'The whole bank. <br><em>Made relevant to one person.</em>')}
      <div class="r-orchestrator-flow">
        <div class="r-inputs"><span class="r-label">What AI connects</span><h2>Customer context</h2><p>Financial patterns <br>Shared memory <br>What I’m viewing as I scroll</p><h2>Bank capabilities</h2><p>Products and tools <br>Insights and messages <br>Human expertise</p></div>
        <div class="r-ai-core">${icon('auto_awesome')}<span class="r-label">The enabling layer</span><h2>Understand. <br>Curate. <br>Coordinate.</h2><p>AI connects the context <br>to the right support.</p></div>
        <div class="r-modes"><article><span class="r-label">Proactive</span><h2>Offer a starting point.</h2><p>Suggest relevant possibilities when the customer does not know where to begin.</p></article><article><span class="r-label">Responsive</span><h2>Follow their lead.</h2><p>Listen and explore through conversation, visual insight and approved action.</p></article></div>
      </div>
      ${close('Models can interpret context and use tools, making personal support more scalable.')}
      ${source('https://www.anthropic.com/engineering/building-effective-agents', 'Proposed model + memory + tools architecture. Prototype AI responses are authored.')}`,
  },
  {
    stage: 'Customer memory and trust',
    title: 'A relationship that remembers.',
    theme: 'r-slide r-memory',
    content: `${heading('HOW THE RELATIONSHIP DEVELOPS', 'A relationship <br><em>that remembers.</em>', 'Small exchanges build understanding over time.')}
      <div class="r-memory-layout">
        <div class="r-memory-inputs"><span class="r-label">Everyday exchanges</span><p>${icon('account_balance_wallet')}Financial patterns</p><p>${icon('check')}Choices and goals</p><p>${icon('group')}Check-ins and conversations</p></div>
        <div class="r-memory-record"><span class="r-label">One shared customer memory</span><h2>Carry understanding <br>into the next interaction.</h2><div><b>Visible</b><p>Show what we have learned and the evidence behind it.</p></div><div><b>Open to correction</b><p>Let customers question the interpretation and update the picture.</p></div></div>
      </div>
      ${close('Customers see the value of being understood. Each useful exchange earns the opportunity for another.')}`,
  },
  {
    stage: 'Now, You and Future',
    title: 'Three sides of a person. One connected system.',
    theme: 'r-slide r-three',
    content: `${heading('THE EXPERIENCE · GROUNDED IN BEHAVIOURAL SCIENCE', 'Three sides of a person. <br><em>One connected system.</em>')}
      <div class="r-tab-columns">
        <article><span class="r-label">Competence</span><h2>Now</h2><b>“I can manage my money.”</b><p>Understand where I stand. <br>Act with confidence. <br>Build useful routines.</p></article>
        <article><span class="r-label">Relatedness</span><h2>You</h2><b>“I feel heard and valued.”</b><p>See what the bank understands. <br>Share my perspective. <br>Receive recognition and support.</p></article>
        <article><span class="r-label">Autonomy</span><h2>Future</h2><b>“I choose my direction.”</b><p>Explore possibilities. <br>Understand trade-offs. <br>Choose goals and commitments.</p></article>
      </div>
      ${close('Future sets the direction. Now supports action. You brings learning and recognition back into the plan.')}
      ${source('https://selfdeterminationtheory.org/the-theory/', 'Self-Determination Theory · Deci & Ryan. The tab mapping is our design application; the needs work across all three.')}`,
  },
  {
    stage: 'The relationship flywheel',
    title: 'A relationship earned. Again and again.',
    theme: 'r-slide r-flywheel',
    content: `${heading('THE RELATIONSHIP FLYWHEEL', 'A relationship earned. <br><em>Again and again.</em>')}
      <ol class="r-cycle">
        <li><span>01</span><h2>Useful interactions</h2><p>Offer value. Invite a response.</p>${arrow}</li>
        <li><span>02</span><h2>Customer memory</h2><p>Carry learning forward.</p>${arrow}</li>
        <li><span>03</span><h2>Relationship and trust</h2><p>Make understanding visible.</p>${arrow}</li>
        <li><span>04</span><h2>More personal support</h2><p>Make the next step relevant.</p>${arrow}</li>
        <li><span>05</span><h2>Sustained behaviours</h2><p>Help customers keep going.</p>${arrow}</li>
        <li><span>06</span><h2>Progress and recognition</h2><p>Give customers a reason to return.</p>${arrow}</li>
      </ol>
      ${close('Each return adds context. Each useful response can strengthen the relationship.')}`,
  },
  {
    stage: 'Shared value',
    title: 'When customers move forward, so do we.',
    theme: 'r-value r-slide',
    content: `${heading('THE VALUE FOR CUSTOMERS AND HSBC', 'When customers move forward, <br><em>so do we.</em>')}
      <div class="r-value-pair"><article><span class="r-label">For customers</span><h2>Stronger financial <br>standing.</h2><p>Reserves for the unexpected. <br>Progress towards chosen goals. <br>More control over the future.</p></article><article><span class="r-label">For HSBC</span><h2>A relationship <br>worth growing.</h2><p>Greater loyalty. <br>More deposits and assets under management. <br>More opportunities to serve changing needs.</p></article></div>
      <p class="r-value-condition">Customer progress creates this opportunity when customers choose to grow with HSBC.</p>
      <div class="r-finale"><h2>Building better customers <br>builds a better bank.</h2><a class="primary-link" data-demo href="/?p=sam&tab=now&theme=vanilla">Explore Atlas ${icon('arrow_forward')}</a></div>
      <p class="r-source">Concept hypothesis: validate customer progress, retention and financial growth. Demo: Now, You, Future.</p>`,
  },
];
