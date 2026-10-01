export type Step = {
  fill?: { selector: string; value: string };
  check?: string;
  close?: boolean;
  pauseStory?: boolean;
  action?: string;
  click?: string;
  scroll?: string;
  container?: string;
  time?: number;
  person?: string;
  tab?: string;
  wait?: string;
  hold?: number;
  label: string;
};
export type Scene = {
  id: string;
  chapter: string;
  title: string;
  copy: string;
  person: string;
  tab: string;
  steps: Step[];
  end: string;
  optional?: boolean;
};
const action = (value: string, wait: string, label: string, hold = 2200): Step => ({
  action: value,
  wait,
  label,
  hold,
});
const scroll = (selector: string, label: string, container = '#content'): Step => ({
  scroll: selector,
  container,
  label,
  hold: 2700,
});
export const scenes: Scene[] = [
  {
    id: 'a-familiar-start',
    chapter: 'Now · Confidence',
    title: 'A familiar start.\nRoom to grow.',
    copy: 'Start with everyday banking. As priorities emerge, the experience becomes more personal.',
    person: 'alex',
    tab: 'now',
    steps: [
      { wait: '.now-page', hold: 3500, label: 'Alex · a familiar current-account view' },
      {
        person: 'sam',
        tab: 'now',
        wait: '.now-page',
        hold: 2800,
        label: 'Sam · a home screen shaped around his life',
      },
      scroll('.module-grid', 'The numbers that matter to Sam'),
    ],
    end: '.module-grid',
  },
  {
    id: 'contextual-support',
    chapter: 'Now · Contextual AI',
    title: 'An opening, before\nyou have to ask.',
    copy: 'The Companion brings relevant support into one place, responding to what the customer is looking at.',
    person: 'sam',
    tab: 'now',
    steps: [
      { wait: '#support-dock', hold: 3800, label: 'One place for HSBC to communicate' },
      scroll('[data-module="housepot"]', 'Support follows the customer’s attention'),
      action('support:discuss', '.chat-thread', 'One tap continues the conversation'),
    ],
    end: '.chat-thread',
  },
  {
    id: 'personal-numbers',
    chapter: 'Now · Personalisation',
    title: 'Your priorities.\nYour numbers.',
    copy: 'Customers choose what matters. AI offers a useful starting point when they are not sure what to add.',
    person: 'sam',
    tab: 'now',
    steps: [
      scroll('.module-grid', 'A view of personal priorities'),
      action('gallery', '.sheet', 'Suggestions help the customer discover useful numbers'),
    ],
    end: '.sheet',
  },
  {
    id: 'a-personal-agreement',
    chapter: 'Now · Sustained behaviour',
    title: 'Give the goal\na routine.',
    copy: 'A personal agreement connects regular contributions, a clear reward and visible progress towards the house deposit.',
    person: 'sam',
    tab: 'now',
    steps: [
      action('pot:house', '.sheet', 'Give money a purpose'),
      action('container-how:house', '.how-sheet', 'The agreement makes the commitment clear'),
      scroll(
        '.savings-instalments',
        'Contributions, progress and the maturity illustration',
        '.agreement-sheet-body',
      ),
    ],
    end: '.how-sheet',
  },
  {
    id: 'stories',
    chapter: 'Now · Meaning',
    title: 'Turn numbers\ninto understanding.',
    copy: 'Stories connect a useful insight, a visual explanation and a next step. The conversation is always close by.',
    person: 'sam',
    tab: 'now',
    steps: [
      action('story:s1', '.story-viewer', 'An insight worth exploring'),
      { pauseStory: true, label: 'Time to read', hold: 1800 },
      action(
        'story-step:1',
        '.story-viewer[data-step="1"]',
        'Make the numbers understandable',
        3200,
      ),
      action('story-step:2', '.story-viewer[data-step="2"]', 'A useful next action', 1800),
    ],
    end: '.story-viewer[data-step="2"]',
  },
  {
    id: 'a-growing-portrait',
    chapter: 'You · Relatedness',
    title: 'Understanding\ntakes shape.',
    copy: 'A few questions give Alex a useful first impression. A richer relationship gives Sam a more developed portrait.',
    person: 'alex',
    tab: 'you',
    steps: [
      {
        wait: '.portrait-beginning',
        hold: 3700,
        label: 'Alex · a first invitation, not a finished profile',
      },
      {
        person: 'sam',
        tab: 'you',
        wait: '.money-portrait',
        hold: 800,
        label: 'Sam · understanding built over time',
      },
      scroll('.money-portrait', 'A richer picture of the person'),
    ],
    end: '.money-portrait',
  },
  {
    id: 'know-and-show',
    chapter: 'You · Trust',
    title: 'Know the customer.\nShow your working.',
    copy: 'Strengths, watch-outs and visible evidence give something useful back. The customer can question and correct the interpretation.',
    person: 'sam',
    tab: 'you',
    steps: [
      action('portrait', '.portrait-detail', 'Something useful in return'),
      scroll('.pe-colophon', 'An interpretation the customer can challenge', '.sheet-body'),
      action('portrait-story', '.portrait-metrics', 'The evidence behind the portrait'),
      scroll('.pm-grid', 'AI helps explain what the customer sees', '.sheet-body'),
    ],
    end: '.portrait-metrics',
  },
  {
    id: 'money-feeling',
    chapter: 'You · Reflection',
    title: 'Listen beyond\nthe transaction.',
    copy: 'How someone feels—and why—creates an opening for more personal support. Recognition makes the small interaction worthwhile.',
    person: 'sam',
    tab: 'you',
    steps: [
      action('feeling', '.feeling-hero', 'A moment to reflect'),
      action('feeling-select:worried', '.feeling-hero', 'Choose a feeling', 1000),
      action('feeling-next', '.feeling-reasons', 'The reason matters'),
      action(
        'feeling-reason:4',
        '.reflection-invitation',
        'Family costs shape the conversation',
        1300,
      ),
      action(
        'feeling-reason:1',
        '.reflection-invitation',
        'The Companion responds to the combination',
        2800,
      ),
      action(
        'feeling-reflect',
        '[data-action="feeling-answer:0"]',
        'A more personal question',
        3200,
      ),
      action(
        'feeling-answer:0',
        '[data-action="feeling-save"]',
        'The customer can reflect in their own way',
        1000,
      ),
      action(
        'feeling-save',
        '.feeling-saved',
        'Five Points recognise the time taken to reflect',
        2000,
      ),
    ],
    end: '.feeling-saved',
  },
  {
    id: 'customer-memory',
    chapter: 'You · Customer memory',
    title: 'Remember what matters.\nMake support better.',
    copy: 'Customers decide what HSBC remembers. Their own words stay visible and editable, ready to inform relevant support.',
    person: 'sam',
    tab: 'you',
    steps: [
      action(
        'checkin-tool:ahead',
        '[data-action="checkin-horizon:1"]',
        'Imagine a future worth working towards',
        700,
      ),
      action('checkin-horizon:1', '[data-action="checkin-future:space"]', 'Choose a horizon', 700),
      action(
        'checkin-future:space',
        '.reflection-invitation',
        'A personal ambition gives the numbers meaning',
        2200,
      ),
      action(
        'checkin-reflect',
        '.reflection-options',
        'Make room for the customer’s own words',
        700,
      ),
      {
        click: '.reflection-options button:last-child',
        wait: '#checkin-note',
        label: 'Their words, not an inferred label',
        hold: 500,
      },
      {
        fill: {
          selector: '#checkin-note',
          value: 'A sunny kitchen with friends around the table.',
        },
        label: 'A home is more than a deposit target',
        hold: 2400,
      },
      action('checkin-result', '[data-stage="saved"]', 'Keep the reflection', 1300),
      action('checkin-done', '.you-page', 'Return to You', 200),
      action('checkin-library', '.checkin-saved-list', 'The customer owns what is remembered', 500),
      {
        click: '[data-action^="checkin-saved:"]',
        wait: '#checkin-remember',
        label: 'Review the memory before sharing it',
        hold: 1500,
      },
      {
        scroll: '.checkin-memory-choice',
        container: '.sheet-body',
        label: 'Choose whether it informs future support',
        hold: 1500,
      },
      { check: '#checkin-remember', label: 'Permission to remember', hold: 1800 },
      { click: '[data-action^="checkin-update:"]', label: 'Save the customer’s choice', hold: 300 },
      {
        action: 'checkin-library:remembered',
        wait: '.checkin-saved-list',
        label: 'A memory the customer can revisit, correct or remove',
        hold: 3500,
      },
    ],
    end: '.checkin-saved-list',
  },
  {
    id: 'a-first-possibility',
    chapter: 'Future · Autonomy',
    title: 'Start with\na possibility.',
    copy: 'Alex does not need a complete financial plan. As goals develop, the planner makes competing priorities visible.',
    person: 'alex',
    tab: 'future',
    steps: [
      { wait: '.future-beginning', hold: 4000, label: 'Alex · inspiration for a first plan' },
      {
        person: 'sam',
        tab: 'future',
        wait: '.future-page:not(.future-beginning)',
        hold: 3000,
        label: 'Sam · priorities competing for the same money',
      },
    ],
    end: '#time-slider',
  },
  {
    id: 'time-travel',
    chapter: 'Future · Perspective',
    title: 'Make your future\nfeel closer.',
    copy: 'Seeing a possible future gives today’s choices more meaning. The picture and the Companion respond together.',
    person: 'sam',
    tab: 'future',
    steps: [
      { wait: '#time-slider', hold: 1800, label: 'Begin with the current picture' },
      { time: 84, wait: '#time-slider', hold: 3200, label: 'Explore life at forty' },
      {
        time: 168,
        wait: '#time-slider',
        hold: 3000,
        label: 'Look further ahead · illustrative projections',
      },
    ],
    end: '#time-slider',
  },
  {
    id: 'goal-possibilities',
    chapter: 'Future · Inspiration',
    title: 'Help me see\nwhat is possible.',
    copy: 'Suggestions draw on the customer’s situation and chosen context. AI inspires; the customer decides what belongs in the plan.',
    person: 'sam',
    tab: 'future',
    steps: [
      action('future-add', '.sheet', 'Discover possibilities'),
      {
        click: '[data-action^="future-possibility:"]',
        wait: '[name="target"]',
        label: 'Explore a suggestion before making it yours',
        hold: 3000,
      },
    ],
    end: '[name="target"]',
  },
  {
    id: 'what-if',
    chapter: 'Future · Choice',
    title: 'Try a change.\nSee the difference.',
    copy: 'What If makes the trade-offs visible before commitment. Sometimes the right change is to do more; sometimes it is to pause.',
    person: 'sam',
    tab: 'future',
    steps: [
      { time: 84, wait: '#time-slider', hold: 1800, label: 'Look ahead before changing anything' },
      {
        click: '.future-drawer-invitation',
        wait: '.fg-idea',
        label: 'Explore a different path',
        hold: 2200,
      },
      {
        click: '.fg-idea',
        wait: '.fg-idea[aria-pressed="true"]',
        label: 'Compare the impact · a preview, not a commitment',
        hold: 3500,
      },
    ],
    end: '.fg-idea[aria-pressed="true"]',
  },
  {
    id: 'money-speed',
    chapter: 'Future · Follow-through',
    title: 'Make the routine\nvisible.',
    copy: 'Money Speed connects the plan to the regular actions that keep it moving. Goals, Pots and Money Rules work together.',
    person: 'sam',
    tab: 'future',
    steps: [action('future-speed', '.sheet', 'See the commitments behind the plan', 3500)],
    end: '.sheet',
  },
  {
    id: 'everyday-agreements',
    chapter: 'Further exploration · Everyday life',
    title: 'Different purpose.\nDifferent support.',
    copy: 'The same agreement principle can support everyday spending: fund the wallet, stay within the agreed limit and receive a relevant reward.',
    person: 'sam',
    tab: 'now',
    steps: [
      action('pot:family-budget', '.sheet', 'A shared everyday purpose'),
      action('container-how:family-budget', '.how-sheet', 'A different behaviour and reward', 3000),
    ],
    end: '.how-sheet',
    optional: true,
  },
  {
    id: 'human-support',
    chapter: 'Further exploration · Human support',
    title: 'A person can\ntake the lead.',
    copy: 'Elena’s relationship manager appears in the same communication space. AI and human support belong in one experience.',
    person: 'elena',
    tab: 'now',
    steps: [
      { wait: '#support-dock', hold: 3500, label: 'Priya · a personal message in the same space' },
    ],
    end: '#support-dock',
    optional: true,
  },
  {
    id: 'household',
    chapter: 'Further exploration · Household',
    title: 'Life is bigger\nthan one person.',
    copy: 'Information people choose to share brings household priorities into the picture, with consent and clear boundaries.',
    person: 'elena',
    tab: 'you',
    steps: [
      scroll('.portrait-members', 'The people around the money'),
      action(
        'member:household',
        '.money-portrait[data-portrait-member="household"]',
        'A shared picture, not an individual personality',
        3000,
      ),
    ],
    end: '.money-portrait[data-portrait-member="household"]',
    optional: true,
  },
  {
    id: 'recognition',
    chapter: 'Further exploration · Recognition',
    title: 'Reward the effort.\nSupport the next step.',
    copy: 'Status reflects the financial relationship. Points recognise participation and can unlock benefits that help customers move forward.',
    person: 'sam',
    tab: 'you',
    steps: [
      action('membership', '.sheet', 'Make relationship progression visible', 3000),
      action('close', '.you-page', 'Return to the relationship', 500),
      action('points', '.sheet', 'Benefits support the next positive behaviour', 3200),
    ],
    end: '.sheet',
    optional: true,
  },
  {
    id: 'habits-and-recognition',
    chapter: 'Further exploration · Positive habits',
    title: 'Small steps.\nWorth recognising.',
    copy: 'Challenges make repeated effort visible. Badges and Points recognise progress before a long-term goal is reached.',
    person: 'sam',
    tab: 'you',
    steps: [
      action('badges', '.badge-collection', 'Choose a habit to build', 2500),
      {
        click: '.badge-tile',
        wait: '.badge-detail',
        label: 'A clear behaviour, progress and recognition',
        hold: 3200,
      },
    ],
    end: '.badge-detail',
    optional: true,
  },
  {
    id: 'companion-style',
    chapter: 'Further exploration · Personal support',
    title: 'Support that\nfeels right.',
    copy: 'The portrait can suggest a style. The customer chooses how much detail, encouragement and initiative they want across all three tabs.',
    person: 'sam',
    tab: 'you',
    steps: [
      action(
        'companion-settings',
        '.companion-preview-card',
        'Choose how the Companion supports you',
      ),
      action(
        'companion-style:analyst',
        '.companion-preview-card',
        'More detail and explanation',
        2600,
      ),
      action(
        'companion-preview:future',
        '.companion-preview-card',
        'The same preference, across the experience',
        2500,
      ),
    ],
    end: '.companion-preview-card',
    optional: true,
  },
];
