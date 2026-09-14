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
    title: 'Sam can transact. Progress is a different job.',
    theme: 'conflict',
    content: `<div class="wide-heading"><p class="eyebrow">DIGITISATION HAS MADE THE EVERYDAY EASIER</p><h1>Sam can transact.<br><em>Progress is a different job.</em></h1></div><p class="transaction-proof">Pay someone. Check a balance. Apply for an account or product.</p><div class="gap-diagram"><div class="tool-cloud"><span>Accounts</span><span>Budgets</span><span>Investments</span><span>Payments</span><span>Mortgages</span><span>Pensions</span><span>Alerts</span><span>Savings Pots</span><span>Life Planner</span></div><div class="missing-link"><span class="broken-line"></span><b>Choosing a path.<br>Keeping it going.</b><span class="broken-line"></span></div><div class="outcome-destination">${icon('trending_up')}<span>The life<br>Sam wants</span></div></div><p class="closing-line">The next opportunity is to help him turn access into lasting progress.</p>`,
  },
  {
    stage: 'Conflict',
    title: 'Complete a task. Support a lasting change.',
    theme: 'behaviour-bridge',
    content: `<div class="wide-heading"><p class="eyebrow">TWO DIFFERENT DESIGN JOBS</p><h1>Complete a task.<br><em>Support a lasting change.</em></h1></div><div class="journey-comparison"><article class="transaction-journey"><span class="mini-label">TRANSACTIONAL JOURNEY</span><h2>“I need to pay someone.”</h2><div class="transaction-steps"><span>Need</span>${icon('arrow_forward')}<span>Action</span>${icon('arrow_forward')}<span>Done</span></div><p class="journey-time">A clear result at the end of the task.</p><div class="journey-design"><b>Design a feature or product journey.</b><p>Make it easy to understand, act and finish.</p></div></article><article class="transformation-journey"><span class="mini-label">TRANSFORMATIONAL JOURNEY</span><h2>“I want a financial buffer.”</h2><div class="behaviour-cycle"><span>Prompt</span>${icon('arrow_forward')}<span>Act</span>${icon('arrow_forward')}<span>Feedback</span>${icon('repeat')}</div><p class="journey-time">Repeat and adapt. Progress builds over time.</p><div class="journey-design"><b>Design a system of support.</b><p>Keep the reason meaningful, the action manageable and progress visible.</p></div></article></div><p class="journey-conclusion">Features make the steps work. A trusted relationship helps us support the change between them.</p>`,
  },
  {
    stage: 'Strategic shift',
    title: 'From product loyalty to relationship loyalty',
    theme: 'loyalty',
    content: `<div class="wide-heading"><p class="eyebrow">THE STRATEGIC SHIFT</p><h1>From product loyalty<br>to <em>relationship loyalty.</em></h1></div><div class="continuity-story"><article><span class="mini-label">WE HAVE DONE THIS BEFORE</span>${icon('group')}<h2>A conversation.<br>A familiar face.</h2><p>Through branches and personal bankers,<br>we built relationships over time.</p></article><article><span class="mini-label">DIGITAL CONVENIENCE</span>${icon('credit_card')}<h2>More access.<br>Less effort.</h2><p>Everyday banking in Sam’s hands.<br>This convenience stays essential.</p></article><article><span class="mini-label">THE NEXT OPPORTUNITY</span>${icon('auto_awesome')}<h2>Personal support.<br>At digital scale.</h2><p>Offer relevant help over time.<br>Earn a role beyond the transaction.</p></article></div><p class="strategy-close">The relationship is not a new idea. The opportunity is to bring that continuity into everyday digital banking.<br><strong>We still have to make it worth Sam’s while.</strong></p>`,
  },
  {
    stage: 'Big idea',
    title: 'Making banking a relationship again',
    theme: 'big-idea',
    content: `<p class="eyebrow">THE BIG IDEA</p><h1>Making banking<br>a <em>relationship</em><br>again.</h1><p class="lead">Earn trust through useful support.<br>Help customers choose, act and keep going.</p><div class="relationship-promise"><span>Relevant to my life.</span><span>On my terms.</span><span>With me over time.</span></div>`,
  },
  {
    stage: 'Resolution',
    title: 'Three sides of a person. Three foundations for progress.',
    theme: 'principles',
    content: `<div class="wide-heading"><p class="eyebrow">GROUNDED IN BEHAVIOURAL SCIENCE</p><h1>Three sides of a person.<br><em>Three foundations for progress.</em></h1></div><div class="needs"><article class="need competence"><span class="person-side">My everyday life</span><div class="need-symbol">${icon('check')}</div><h2>Competence</h2><p>“I can manage this.”</p><span class="need-tab">Now</span></article><article class="need autonomy"><span class="person-side">My possible future</span><div class="need-symbol">${icon('trending_up')}</div><h2>Autonomy</h2><p>“I can choose my path.”</p><span class="need-tab">Future</span></article><article class="need relatedness"><span class="person-side">My relationships</span><div class="need-symbol">${icon('group')}</div><h2>Relatedness</h2><p>“I belong. I’m valued.”</p><span class="need-tab">You</span></article></div><p class="science-foundation"><a href="https://selfdeterminationtheory.org/the-theory/" target="_blank" rel="noreferrer">Self-Determination Theory · Deci & Ryan</a><span>Three psychological needs that support motivation and wellbeing.<br>Our application: Now, Future and You.</span></p>`,
  },
  {
    stage: 'Resolution',
    title: 'Now: build the confidence to act',
    theme: 'product now',
    content: `<div class="product-copy"><p class="eyebrow">NOW · COMPETENCE · MY EVERYDAY LIFE</p><h1>Build the confidence<br>to <em>act.</em></h1><p class="lead">“I can see where I stand.<br>I know what I can do next.”</p><div class="action-sequence"><div><span>01</span><p><b>Make sense of today</b>My numbers and Stories turn activity into a clear picture.</p></div><div><span>02</span><p><b>Make a useful move</b>The Companion helps explain a relevant next step.</p></div><div><span>03</span><p><b>Make it easier to repeat</b>Pots and Money Rules turn a choice into a routine.</p></div></div><p class="tab-handoff">Confidence today creates room to choose a future.</p><a class="text-link" data-demo href="/?p=sam&tab=now&theme=vanilla">Explore Sam’s Now ${icon('arrow_forward')}</a></div>${phone('now', 'Sam’s Now screen with the AI Companion, money overview and everyday commitments.')}`,
  },
  {
    stage: 'Resolution',
    title: 'Future: choose a future worth keeping going for',
    theme: 'product future',
    content: `<div class="product-copy"><p class="eyebrow">FUTURE · AUTONOMY · MY POSSIBLE FUTURE</p><h1>Choose a future.<br><em>Make it your own.</em></h1><p class="lead">“I can try a different path.<br>The choice is mine.”</p><div class="future-example"><span class="mini-label">SAM TRIES A PAYDAY SAVINGS RULE</span><div class="example-amount">+£50<span>/month</span></div><p>Emergency fund: <strong>11 months closer.</strong></p></div><p class="supporting">Time Travel and What If reveal the trade-offs.<br>Review turns his choice into a Money Rule.</p><p class="tab-handoff">A personally meaningful goal gives the routine a reason.</p><a class="text-link" data-demo href="/?p=sam&tab=future&theme=vanilla">Explore Sam’s Future ${icon('arrow_forward')}</a></div>${phone('future', 'Sam’s Future bubble canvas and Time Travel bar, showing goals and suggested possibilities.')}`,
  },
  {
    stage: 'Resolution',
    title: 'You: feel connected, recognised and valued',
    theme: 'product you',
    content: `<div class="product-copy"><p class="eyebrow">YOU · RELATEDNESS · MY RELATIONSHIPS</p><h1>Feel connected.<br>Recognised.<br><em>Valued.</em></h1><div class="action-sequence"><div><span>01</span><p><b>A relationship that listens</b>Check-ins and the portrait make room for reflection, evidence and disagreement.</p></div><div><span>02</span><p><b>A relationship that includes my world</b>My household, shared goals and human support.</p></div><div><span>03</span><p><b>A relationship worth celebrating</b>Journey milestones, Points and Badges recognise progress. Status brings benefits to explore.</p></div></div><p class="tab-handoff">Understanding, recognition and benefits give him reasons to stay connected.</p><a class="text-link" data-demo href="/?p=sam&tab=you&theme=vanilla">Explore Sam’s You ${icon('arrow_forward')}</a></div>${phone('you', 'Sam’s You screen with household recognition, Money Check-in and his Planner portrait.')}`,
  },
  {
    stage: 'Resolution',
    title: 'The intelligence between capability and customer',
    theme: 'system',
    content: `<div class="wide-heading"><p class="eyebrow">HOW WE DELIVER ALL THREE</p><h1>The whole bank.<br><em>Made relevant to one person.</em></h1></div><div class="system-flow"><div class="bank-inputs"><span class="flow-label">What the bank can offer</span><div class="input-bubbles"><span>Capabilities</span><span>Tools</span><span>Messages</span><span>Features</span><span>Products</span><span>Data</span></div></div><span class="flow-arrow" aria-hidden="true">${icon('arrow_forward')}</span><div class="behaviour-layer"><span class="flow-label">Connecting the dots</span>${icon('auto_awesome')}<h2>AI behavioural<br> layer</h2><p>Observe · Understand<br> Prepare · Support</p><div class="layer-faces"><span>Behind the scenes</span><span>In the experience</span></div></div><span class="flow-arrow" aria-hidden="true">${icon('arrow_forward')}</span><div class="system-output"><span class="flow-label">What the customer experiences</span><div class="companion-example"><span>${icon('auto_awesome')}</span><p>A relevant next step.<br>At the right moment.</p></div><div class="system-tabs"><b>Now</b><b>Future</b><b>You</b></div><p class="customer-choice">Customer choice.<br>Human support when it matters.</p></div></div><div class="system-loop"><span></span><p>One shared understanding across Now, Future and You.</p><span></span></div>`,
  },
  {
    stage: 'Resolution',
    title: 'A relationship earned, again and again',
    theme: 'flywheel',
    content: `<div class="flywheel-intro"><p class="eyebrow">HOW THE SYSTEM STRENGTHENS OVER TIME</p><h1>A relationship<br>is <em>earned.</em><br>Again and again.</h1><p class="lead">Each useful moment can make<br>the next one more relevant.</p><p class="supporting">Now helps Sam act. Future gives it purpose.<br>You builds connection and recognition.</p></div><div class="relationship-wheel"><div class="wheel-center"><span>AI + behavioural tools</span><b>Learn. <br>Support. <br>Earn trust.</b></div><ol class="wheel-steps"><li><span class="wheel-number">01</span><h2>Meaningful <br>interactions</h2><p>A check-in. A useful next step.</p>${icon('arrow_forward')}</li><li><span class="wheel-number">02</span><h2>Deeper <br>understanding</h2><p>What Sam shares and chooses.</p>${icon('arrow_forward')}</li><li><span class="wheel-number">03</span><h2>Stronger relationship <br>and trust</h2><p>Built through dependable help.</p>${icon('arrow_forward')}</li><li><span class="wheel-number">04</span><h2>More personal <br>support</h2><p>Relevant choices and routines.</p>${icon('arrow_forward')}</li><li><span class="wheel-number">05</span><h2>Sustained behaviours.<br>Better outcomes.</h2><p>Progress gives a reason to return.</p>${icon('arrow_forward')}</li></ol><p class="wheel-return">Progress brings the next meaningful interaction.</p></div><p class="flywheel-principle">The reinforcing loop we want to test: more useful support, sustained action, greater progress.</p>`,
  },
  {
    stage: 'Resolution',
    title: 'Why the bank should earn that deeper role',
    theme: 'shared-value',
    content: `<div class="wide-heading"><p class="eyebrow">WHY THIS MATTERS TO HSBC</p><h1>When customers move forward,<br><em>the relationship can grow too.</em></h1></div><div class="shared-value-grid"><article><span class="mini-label">VALUE FOR THE CUSTOMER</span><h2>More capable.<br>More choice.<br>More progress.</h2><p>Clearer decisions and sustainable routines<br>in service of their own goals.</p></article><div class="shared-value-link">${icon('swap_horiz')}<span>Value earned<br>over time</span></div><article><span class="mini-label">VALUE FOR THE BANK</span><h2>More trust.<br>More continuity.<br>More relevance.</h2><p>A reason to stay, to seek help again,<br>and to choose HSBC when new needs arise.</p></article></div><p class="shared-value-test">Our hypothesis: helping customers sustain progress can build loyalty and appropriate growth.</p>`,
  },
  {
    stage: 'Soundbite',
    title: 'Building better customers builds a better bank',
    theme: 'closing',
    content: `<p class="eyebrow">MAKING BANKING A RELATIONSHIP AGAIN</p><h1>Building better<br>customers builds<br><em>a better bank.</em></h1><p class="lead">Capable in the Now. Free to shape the Future.<br>Connected and valued in You.</p><div class="value-chain"><span>Customer progress</span>${icon('arrow_forward')}<span>Earned trust & loyalty</span>${icon('arrow_forward')}<span>Long-term value for HSBC</span></div><div class="closing-action"><a class="primary-link" data-demo href="/?p=sam&tab=now&theme=vanilla">Experience it with Sam ${icon('arrow_forward')}</a><p>A reason to stay. A reason to turn to HSBC<br>when the next financial need arrives.</p></div>`,
  },
];
