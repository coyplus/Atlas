import { materialIcons, materialViewBoxes } from '../design-system/icons.mjs';
const icon = (name: keyof typeof materialIcons) =>
  `<svg class="deck-icon" aria-hidden="true" viewBox="${materialViewBoxes[name] || '0 -960 960 960'}">${materialIcons[name] || materialIcons.auto_awesome}</svg>`;
const phone = (tab: string, caption: string) =>
  `<figure class="product-figure"><div class="phone-frame"><img src="/assets/presentation/sam-${tab}.webp" alt="${caption}" width="390" height="844"></div><figcaption>Sam’s ${tab === 'you' ? 'You' : tab === 'now' ? 'Now' : 'Future'} · from the working prototype</figcaption></figure>`;
export const slides = [
  {
    stage: 'Setting',
    title: 'A concept for the next decade',
    theme: 'cover',
    content: `<div class="cover-copy"><p class="eyebrow">A CONCEPT FOR THE NEXT DECADE</p><h1>Introducing<br><em>Atlas.</em></h1><p class="lead">A world of opportunity.<br>Closer to everyday life.</p><div class="cover-ambition"><span>Our ambition</span><p>To be the most trusted bank globally.<br>To put customers at the heart of everything we do.</p></div></div><div class="cover-art" aria-hidden="true"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="orbit orbit-three"></div><span class="orbit-label label-now">Now</span><span class="orbit-label label-future">Future</span><span class="orbit-label label-you">You</span><span class="orbit-center">A life.<br>Connected.</span></div>`,
  },
  {
    stage: 'Characters',
    title: 'Meet Sam. One life, many priorities.',
    theme: 'sam',
    content: `<div class="intro"><p class="eyebrow">THE ASPIRING HOUSEHOLDER</p><h1>One life.<br><em>Many priorities.</em></h1><p class="lead">Sam, 33. A family to care for.<br>A business idea. A future to build.</p><p class="supporting">His money has several jobs.<br>His attention has even more.</p></div><div class="sam-world" role="img" aria-label="Sam is balancing Ella’s future, a home, an emergency fund, business ambitions, friends and family time."><div class="sam-center"><span>S</span><b>Sam</b><small>With Riley & Ella</small></div><div class="life-goal education">${icon('group')}<span>Ella’s next<br>chapter</span></div><div class="life-goal house">${icon('home')}<span>A home<br>to grow in</span></div><div class="life-goal safety">${icon('verified_user')}<span>Room for the<br>unexpected</span></div><div class="life-goal work">${icon('account_balance_wallet')}<span>Something<br>of his own</span></div><div class="life-goal friends">${icon('light_mode')}<span>Time with<br>friends</span></div><div class="life-goal family">${icon('flight')}<span>A family<br>adventure</span></div></div>`,
  },
  {
    stage: 'Conflict',
    title: 'More tools. Not necessarily more progress.',
    theme: 'conflict',
    content: `<div class="wide-heading"><p class="eyebrow">THE GAP WE NEED TO CLOSE</p><h1>More tools.<br><em>Not necessarily more progress.</em></h1></div><div class="gap-diagram"><div class="tool-cloud"><span>Accounts</span><span>Budgets</span><span>Investments</span><span>Payments</span><span>Mortgages</span><span>Pensions</span><span>Alerts</span><span>Savings</span></div><div class="missing-link"><span class="broken-line"></span><b>Knowing what<br>to do next</b><span class="broken-line"></span></div><div class="outcome-destination">${icon('trending_up')}<span>The life<br>Sam wants</span></div></div><p class="closing-line">If features alone were the answer,<br class="mobile-break"> we would already have solved this.</p>`,
  },
  {
    stage: 'Strategic shift',
    title: 'From product loyalty to relationship loyalty',
    theme: 'loyalty',
    content: `<div class="wide-heading"><p class="eyebrow">THE STRATEGIC SHIFT</p><h1>From product loyalty<br>to <em>relationship loyalty.</em></h1></div><div class="loyalty-comparison"><article class="loyalty-product"><span class="mini-label">A REASON TO TRANSACT</span><h2>“This product<br>works for me.”</h2><p>A useful feature.<br>A competitive offer.<br>A task completed.</p></article><span class="loyalty-arrow" aria-hidden="true">${icon('arrow_forward')}</span><article class="loyalty-relationship"><span class="mini-label">A REASON TO TURN TO US</span><h2>“This bank<br>understands me.”</h2><p>It remembers what matters.<br>It helps when life changes.<br>It earns my confidence.</p></article></div><p class="loyalty-foundation">Trust earns us an invitation into the bigger decisions in someone’s life.</p>`,
  },
  {
    stage: 'Big idea',
    title: 'Making banking a relationship again',
    theme: 'big-idea',
    content: `<p class="eyebrow">THE BIG IDEA</p><h1>Making banking<br>a <em>relationship</em><br>again.</h1><p class="lead">A partnership that gives customers<br>clarity, confidence and the ability to act.</p><div class="relationship-promise"><span>Know me.</span><span>Help me choose.</span><span>Stay with me.</span></div>`,
  },
  {
    stage: 'Resolution',
    title: 'A relationship earned, again and again',
    theme: 'flywheel',
    content: `<div class="flywheel-intro"><p class="eyebrow">THE RELATIONSHIP FLYWHEEL</p><h1>A relationship<br>is <em>earned.</em><br>Again and again.</h1><p class="lead">An assistant is a touchpoint.<br>The relationship needs a system.</p><p class="supporting">AI makes support more relevant.<br>Behavioural tools make it easier to act.</p></div><div class="relationship-wheel"><div class="wheel-center"><span>AI + behavioural tools</span><b>Learn. <br>Support. <br>Earn trust.</b></div><ol class="wheel-steps"><li><span class="wheel-number">01</span><h2>Meaningful <br>interactions</h2><p>A check-in. A useful next step.</p>${icon('arrow_forward')}</li><li><span class="wheel-number">02</span><h2>Deeper <br>understanding</h2><p>What matters, and what changes.</p>${icon('arrow_forward')}</li><li><span class="wheel-number">03</span><h2>Stronger relationship <br>and trust</h2><p>Feeling understood over time.</p>${icon('arrow_forward')}</li><li><span class="wheel-number">04</span><h2>More personal <br>support</h2><p>The right help, easier to act on.</p>${icon('arrow_forward')}</li><li><span class="wheel-number">05</span><h2>Better behaviours <br>and outcomes</h2><p>Progress gives a reason to return.</p>${icon('arrow_forward')}</li></ol><p class="wheel-return">Progress brings the next meaningful interaction.</p></div><p class="flywheel-principle">The aim is more value in each interaction — not more demands on the customer.</p>`,
  },
  {
    stage: 'Resolution',
    title: 'Design for financial agency',
    theme: 'principles',
    content: `<div class="wide-heading"><p class="eyebrow">THE BEHAVIOURAL FOUNDATION</p><h1>Help people feel able.<br><em>Keep them in control.</em></h1></div><div class="needs"><article class="need competence"><span class="need-number">01</span><div class="need-symbol">${icon('check')}</div><h2>Competence</h2><p>“I can manage this.”</p><span class="need-tab">Now</span></article><article class="need autonomy"><span class="need-number">02</span><div class="need-symbol">${icon('trending_up')}</div><h2>Autonomy</h2><p>“This is my choice.”</p><span class="need-tab">Future</span></article><article class="need relatedness"><span class="need-number">03</span><div class="need-symbol">${icon('group')}</div><h2>Relatedness</h2><p>“I feel understood.”</p><span class="need-tab">You</span></article></div><p class="source-line">Inspired by <a href="https://selfdeterminationtheory.org/the-theory/" target="_blank" rel="noreferrer">Self-Determination Theory</a>. Three needs; one connected experience.</p>`,
  },
  {
    stage: 'Resolution',
    title: 'The intelligence between capability and customer',
    theme: 'system',
    content: `<div class="wide-heading"><p class="eyebrow">OUR FOUNDATIONAL SYSTEM</p><h1>The whole bank.<br><em>Made relevant to one person.</em></h1></div><div class="system-flow"><div class="bank-inputs"><span class="flow-label">What the bank can offer</span><div class="input-bubbles"><span>Capabilities</span><span>Tools</span><span>Messages</span><span>Features</span><span>Products</span><span>Data</span></div></div><span class="flow-arrow" aria-hidden="true">${icon('arrow_forward')}</span><div class="behaviour-layer"><span class="flow-label">Connecting the dots</span>${icon('auto_awesome')}<h2>AI behavioural<br> layer</h2><p>Observe · Understand<br> Prepare · Support</p><div class="layer-faces"><span>Behind the scenes</span><span>In the experience</span></div></div><span class="flow-arrow" aria-hidden="true">${icon('arrow_forward')}</span><div class="system-output"><span class="flow-label">What the customer experiences</span><div class="companion-example"><span>${icon('auto_awesome')}</span><p>A relevant next step.<br>At the right moment.</p></div><div class="system-tabs"><b>Now</b><b>Future</b><b>You</b></div><p class="customer-choice">Customer choice.<br>Human support when it matters.</p></div></div><div class="system-loop"><span></span><p>Every interaction adds context to the next.</p><span></span></div>`,
  },
  {
    stage: 'Resolution',
    title: 'Now: make today feel manageable',
    theme: 'product now',
    content: `<div class="product-copy"><p class="eyebrow">NOW · COMPETENCE</p><h1>Make today<br>feel <em>manageable.</em></h1><p class="lead">Less searching.<br>A clearer next step.</p><div class="action-sequence"><div><span>01</span><p><b>See what matters</b>Money, commitments and attention in one view.</p></div><div><span>02</span><p><b>Make a useful move</b>Turn an insight into a manageable action.</p></div><div><span>03</span><p><b>Feel the progress</b>Clear feedback helps the habit stick.</p></div></div><a class="text-link" data-demo href="/?p=sam&tab=now&theme=vanilla">Explore Sam’s Now ${icon('arrow_forward')}</a></div>${phone('now', 'Sam’s Now screen with the AI Companion, money overview and everyday commitments.')}`,
  },
  {
    stage: 'Resolution',
    title: 'Future: make a change, see a future',
    theme: 'product future',
    content: `<div class="product-copy"><p class="eyebrow">FUTURE · AUTONOMY</p><h1>A simple change today.<br><em>A different tomorrow.</em></h1><p class="lead">Travel through time.<br>Try an idea. See the trade-offs.</p><div class="future-example"><span class="mini-label">ONE EXAMPLE FROM SAM’S SCENARIO</span><div class="example-amount">+£50<span>/month</span></div><p>A payday Savings Rule brings his emergency fund goal <strong>11 months closer.</strong></p></div><p class="supporting">Solid goals: the future he’s planning.<br>Ghost possibilities: futures still to discover.</p><a class="text-link" data-demo href="/?p=sam&tab=future&theme=vanilla">Explore Sam’s Future ${icon('arrow_forward')}</a></div>${phone('future', 'Sam’s Future bubble canvas and Time Travel bar, showing his goals and suggested possibilities eight years ahead.')}`,
  },
  {
    stage: 'Resolution',
    title: 'You: feel known, not categorised',
    theme: 'product you',
    content: `<div class="product-copy"><p class="eyebrow">YOU · RELATEDNESS</p><h1>A bank that sees<br><em>the person.</em></h1><p class="lead">Your habits. Your household.<br>Your aspirations.</p><div class="portrait-pair"><article><span>Explore your portrait</span><p>What we think your<br>behaviours might mean.</p></article><article><span>Behind this portrait</span><p>The measurable patterns<br>we actually observed.</p></article></div><p class="supporting">Recognition with understanding.<br>Room to question, reflect and grow.</p><a class="text-link" data-demo href="/?p=sam&tab=you&theme=vanilla">Explore Sam’s You ${icon('arrow_forward')}</a></div>${phone('you', 'Sam’s You screen with household recognition, Money Check-in and his Planner Money Personality portrait.')}`,
  },
  {
    stage: 'Soundbite',
    title: 'Building better customers builds a better bank',
    theme: 'closing',
    content: `<p class="eyebrow">MAKING BANKING A RELATIONSHIP AGAIN</p><h1>Building better<br>customers builds<br><em>a better bank.</em></h1><p class="lead">More confidence. More agency.<br>A relationship worth staying for.</p><div class="value-chain"><span>Supported choices</span>${icon('arrow_forward')}<span>Sustained behaviours</span>${icon('arrow_forward')}<span>Better outcomes</span></div><div class="closing-action"><a class="primary-link" data-demo href="/?p=sam&tab=now&theme=vanilla">Experience it with Sam ${icon('arrow_forward')}</a><p>Let’s test whether a better relationship<br>helps people move forward.</p></div>`,
  },
];
