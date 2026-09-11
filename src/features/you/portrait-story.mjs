import { portraitModel, traitLanguage } from './portrait.mjs';
import { checkinModel } from '../checkin/model.mjs';
import { cash, potRate } from '../../domain/money.mjs';
import { potIcons } from '../../domain/numbers.mjs';
import { recordedCheckins } from './portrait-evidence.mjs';

// Observations come from the existing scenario. Interpretation stays separate,
// so a customer can question it without changing a transaction or a trait score.
const countIn = (text, label) =>
  Number(text?.match(new RegExp(`([\\d,]+) ${label}`))?.[1]?.replaceAll(',', '')) || 0;
const intros = {
  sam: 'You plan ahead. Life still gets a say.',
  jordan: 'Small steps are becoming your rhythm.',
  elena: 'A long view, with people at its heart.',
  alex: 'Your story is just beginning.',
};
const tone = (trait) => traitLanguage[trait] || traitLanguage.Planning;

function ruleTile(p) {
  const rules = p.l1.rules.filter(
    (r) => r.active && r.amount > 0 && !p.l1.pots.find((pot) => pot.id === r.potId)?.isDebt,
  );
  const parts = rules
    .map((r) => ({
      label: p.l1.pots.find((pot) => pot.id === r.potId)?.name || 'Saving',
      value: Math.max(
        0,
        potRate(
          { ...p, l1: { ...p.l1, rules: [r] } },
          p.l1.pots.find((pot) => pot.id === r.potId),
        ),
      ),
    }))
    .filter((r) => r.value > 0);
  const total = parts.reduce((n, r) => n + r.value, 0);
  return {
    id: 'routine',
    kind: 'flow',
    trait: 'Planning',
    label: 'A plan in motion',
    title:
      p.l1.customer.id === 'elena'
        ? 'You give the long view a regular place.'
        : 'You do the thinking up front.',
    value: cash(total),
    unit: 'a month, with a purpose',
    chart: { parts },
    summary: `${parts.length} saving rules make space for your priorities.`,
    observation: `Your current saving rules direct ${cash(total)} a month across ${parts.map((r) => r.label).join(', ')}.`,
    meaning:
      'Choosing a structure, then letting it work in the background, suggests that Planning is part of your approach. It is the routine that tells us something—not how much you can save.',
    source: 'Your current Money Rules and the Pots they fund.',
    watch: 'Whether you keep, pause or reshape these routines as life changes.',
    question: 'Does using rules make me a Planner?',
  };
}
function rhythmTile(p) {
  const sam = p.l1.customer.id === 'sam';
  const months = sam ? p.l1.spending.comparisons.groceries.monthsHeld : 7;
  const rule = p.l1.rules.find((r) => r.id === (sam ? 'r-hol-challenge' : 'r-ef-payday'));
  return {
    id: 'rhythm',
    kind: 'rhythm',
    trait: 'Rhythm',
    label: sam ? 'An everyday pattern' : 'Your saving rhythm',
    title: sam
      ? 'An everyday habit. Something to look forward to.'
      : 'A little, often, is adding up.',
    value: String(months),
    unit: 'months in a row',
    chart: { count: months, start: sam ? 'Jan' : 'Feb', end: sam ? 'Aug' : 'Aug' },
    summary: sam
      ? `Groceries within your £220 line. Your rule links that habit to family time.`
      : 'Your payday saving move has kept its rhythm.',
    observation: sam
      ? `${months} recorded months within the £220 grocery line. Your holiday rule sets aside ${cash(rule?.amount || 60)} when a month qualifies.`
      : 'Your recorded payday history shows seven consecutive monthly saving moves. The round-up rule adds smaller amounts alongside them.',
    meaning: sam
      ? 'You connect a routine today with something you want tomorrow. That steady rhythm adds a warmer side to your Planning: the plan makes room for enjoying life.'
      : 'Repeating a manageable step suggests that Rhythm matters more to you than an occasional big push. That is one reason “Steady builder” fits the picture so far.',
    source: sam
      ? 'Eight-month grocery history and your holiday Money Rule.'
      : 'Payday saving history since February and your round-up Money Rule.',
    watch: 'Whether the rhythm still works for you, especially when a month feels different.',
    question: 'What does this pattern tell you?',
  };
}
function comparisonTile(p) {
  const now = p.l1.spending.byCategory.groceries;
  const previous = p.l1.spending.comparisons.groceries.lastMonthToDate;
  return {
    id: 'attention',
    kind: 'compare',
    trait: 'Planning',
    label: 'Where your attention goes',
    title: 'You’re getting to know your everyday.',
    value: cash(Math.abs(previous - now)),
    unit: `${now <= previous ? 'less' : 'more'} on groceries so far`,
    chart: {
      parts: [
        { label: 'Last month', value: previous },
        { label: 'This month', value: now },
      ],
    },
    summary: 'Compared at the same point in each month.',
    observation: `Grocery spending is ${cash(now, true)}, compared with ${cash(previous, true)} at the same point last month. You have also checked this number weekly for seven weeks.`,
    meaning:
      'The repeated check-ins suggest a wish to understand your spending. A lower amount alone does not tell us your motivation; prices, plans and circumstances can change too.',
    source: 'Grocery spending comparison and the weekly viewing pattern in your profile.',
    watch: 'Whether checking this number helps you make the choices you want.',
    question: 'Could there be another explanation?',
  };
}
function safetyTile(p) {
  const pot = p.l1.pots.find((x) => x.id === 'ef');
  return {
    id: 'buffer',
    kind: 'ring',
    trait: 'Planning',
    label: 'A little breathing room',
    title: 'A buffer before the bigger things?',
    value: cash(pot.balance),
    unit: `of your ${cash(pot.target)} safety net`,
    chart: { ratio: Math.min(1, pot.balance / pot.target) },
    summary: 'A working interpretation, for you to shape.',
    observation: `Your Emergency fund holds ${cash(pot.balance)} towards ${cash(pot.target)}. Your profile notes that you built a buffer before your house plan grew.`,
    meaning:
      'We read this as a preference for some breathing room before larger commitments. The balance shows progress; only you can tell us why this order matters.',
    source:
      'Emergency fund balance and the “Rainy-day first, then goals” interpretation in your profile.',
    watch: 'Whether you still want the safety net to come first when other priorities compete.',
    question: 'Why do you think the buffer comes first?',
  };
}
function prioritiesTile(p) {
  const goals = p.l1.goals.filter(
    (g) => g.potId && !p.l1.pots.find((pot) => pot.id === g.potId)?.isDebt,
  );
  return {
    id: 'priorities',
    kind: 'constellation',
    trait: p.l1.customer.id === 'elena' ? 'Patience' : 'Planning',
    label: 'The things you make room for',
    title:
      p.l1.customer.id === 'elena'
        ? 'Your future has people in it.'
        : 'There’s more than one future in your plan.',
    value: String(goals.length),
    unit: 'goals with a Pot of their own',
    chart: {
      parts: goals.map((g) => {
        const pot = p.l1.pots.find((x) => x.id === g.potId);
        return {
          label: pot?.name,
          icon: pot?.visualIcon || potIcons[g.potId] || 'target',
          value: 1,
        };
      }),
    },
    summary:
      p.l1.customer.id === 'elena'
        ? 'Retirement, home and time together all have a place.'
        : 'Home, family and your own ambitions sit side by side.',
    observation: `Your plans include ${goals.map((g) => p.l1.pots.find((x) => x.id === g.potId)?.name).join(', ')}. These are priorities you have chosen.`,
    meaning:
      p.l1.customer.id === 'elena'
        ? 'Your long view makes room for family life as well as later life. That gives the Patience in your portrait a personal purpose.'
        : 'Your Planning is about making room for several parts of life. Having several goals is not a measure of success; their meaning to you is the useful part.',
    source: 'The goals and Pots you have already added.',
    watch: 'Which priorities you bring forward, leave open or change your mind about.',
    question: 'Do my balances affect my personality?',
  };
}
function voiceTile(p, m) {
  const remembered = checkinModel(p).memories.at(-1);
  const belief =
    p.l2.beliefs.find((b) => b.status === 'corrected') ||
    p.l2.beliefs.find((b) => b.status === 'confirmed') ||
    p.l2.beliefs[0];
  const words =
    remembered?.insight ||
    p.ui.portraitQuizResponses?.[0]?.answer ||
    belief?.correction ||
    belief?.claim ||
    m.personality.copy ||
    'There’s more to your story than a transaction can tell us.';
  return {
    id: 'voice',
    kind: 'quote',
    trait: m.traits.length ? m.dominant : null,
    label: remembered
      ? 'You asked us to remember'
      : p.ui.portraitQuizResponses?.length
        ? 'In your own answers'
        : 'An interpretation, with you',
    title:
      remembered || p.ui.portraitQuizResponses?.length
        ? 'Your words add the meaning.'
        : belief?.status === 'confirmed'
          ? 'You helped shape this picture.'
          : 'An impression, open to your perspective.',
    value: words,
    unit: '',
    chart: { answers: p.ui.portraitQuizResponses || [] },
    summary: remembered
      ? 'A reflection you chose to keep with your picture.'
      : belief?.status === 'confirmed'
        ? 'An interpretation you confirmed.'
        : 'A first impression, open to your perspective.',
    observation:
      remembered?.insight ||
      belief?.evidence ||
      'Your answers gave us a first impression of how you approach money.',
    meaning:
      'Behaviour can show us a pattern. Your answers, reflections and corrections help us understand the reason behind it. What you tell us can change how we read the same pattern.',
    source: remembered
      ? 'A Money Check-in you chose to remember.'
      : belief
        ? 'Your money personality answers and feedback.'
        : 'Your money personality answers.',
    watch: 'What feels different now, and which reflections you want us to remember.',
    question: 'Can I change your interpretation?',
  };
}
function longHabitTile() {
  return {
    id: 'rhythm',
    kind: 'rhythm',
    trait: 'Planning',
    label: 'A routine that stays in the background',
    title: 'The everyday has a steady foundation.',
    value: '9',
    unit: 'years paying your card in full',
    chart: { count: 9, start: '9 years ago', end: 'Now' },
    summary: 'A long-running habit in your recorded history.',
    observation: 'Your profile records nine years of paying the Premier card in full each month.',
    meaning:
      'A routine you sustain over time supports the Planning in your portrait. It tells us about an approach, not a better or worse kind of person.',
    source: 'Your card repayment history.',
    watch: 'Whether this routine still supports the way you want to manage everyday money.',
    question: 'How does this shape the portrait?',
  };
}
export function portraitStory(p, member = 'self') {
  const m = portraitModel(p, member),
    own = m.self;
  const provenance = m.personality.provenance || m.personality.src || '';
  const moves =
    m.evidence.moves ||
    countIn(provenance, 'money moves') ||
    countIn(provenance, 'pocket-money moves');
  const answers =
    p.ui.portraitQuizAnswers?.length && own
      ? p.ui.portraitQuizAnswers.length
      : m.evidence.answers ||
        countIn(provenance, 'answers') ||
        (own && p.l1.behaviour.app.quizDone && p.l1.customer.id === 'alex' ? 3 : 0);
  const checkins = own ? recordedCheckins(p) : null;
  const inputs = [
    ...(moves
      ? [{ value: moves.toLocaleString('en-GB'), label: 'money moves', symbol: 'swap' }]
      : []),
    ...(own && p.l1.customer.id === 'elena'
      ? [{ value: '12 years', label: 'of decisions', symbol: 'clock' }]
      : []),
    ...(answers ? [{ value: String(answers), label: 'answers', symbol: 'edit' }] : []),
    ...(checkins
      ? [
          {
            value: typeof checkins === 'number' ? String(checkins) : 'Weekly',
            label: 'check-ins',
            symbol: 'spark',
          },
        ]
      : []),
    ...(own && p.l1.customer.id === 'elena'
      ? [{ value: '3', label: 'rehearsals', symbol: 'trend' }]
      : []),
  ];
  let cards;
  if (!own) {
    cards = m.traits.map(([trait]) => ({
      id: trait.toLowerCase(),
      kind: 'shape',
      trait,
      label: 'A shared perspective',
      title: trait,
      value: '',
      unit: '',
      chart: {},
      summary: m.personality.copy,
      observation: m.source,
      meaning: `The ${trait.toLowerCase()} shape comes from this shared portrait. ${tone(trait).copy}`,
      source: m.source,
      watch: 'Only updates that are shared with you appear in this picture.',
      question: 'What is this shape based on?',
    }));
  } else if (p.l1.customer.id === 'sam')
    cards = [ruleTile(p), rhythmTile(p), safetyTile(p), prioritiesTile(p), voiceTile(p, m)];
  else if (p.l1.customer.id === 'jordan')
    cards = [rhythmTile(p), comparisonTile(p), prioritiesTile(p), voiceTile(p, m)];
  else if (p.l1.customer.id === 'elena')
    cards = [ruleTile(p), prioritiesTile(p), longHabitTile(), voiceTile(p, m)];
  else
    cards = [
      voiceTile(p, m),
      {
        id: 'starting',
        kind: 'starting',
        trait: null,
        label: 'What we’re still learning',
        title: 'A first look, with room to grow.',
        value: 'Early days',
        unit: '',
        chart: {},
        summary: 'Your everyday activity will add context over time.',
        observation:
          'Your Direct Debits have moved across, and we can see the first days of everyday activity.',
        meaning:
          'That is a starting point, not enough to describe a lasting spending or saving pattern. Your answers help us begin with your perspective.',
        source: 'Your new account activity and Direct Debits.',
        watch: 'The routines you choose, the priorities you add, and what you tell us matters.',
        question: 'What will you learn next?',
      },
    ];
  cards = cards.map((card) => ({
    ...card,
    ...tone(card.trait),
    note: own ? p.ui.portraitNotes?.[card.id]?.text : null,
  }));
  return {
    ...m,
    own,
    intro: own ? intros[p.l1.customer.id] : 'The perspective behind a shared picture.',
    inputs,
    cards,
  };
}

export function portraitStorySupport(p, s, context) {
  const m = portraitStory(p, s.member),
    topic = context.topic || context.id;
  const card = m.cards.find((c) => c.id === topic);
  const titles = {
    routine: 'Your rules suggest you like a plan that runs quietly.',
    rhythm:
      p.l1.customer.id === 'sam'
        ? 'Your grocery habit makes room for family time.'
        : 'A repeated routine adds rhythm to your portrait.',
    buffer: 'A safety net can mean breathing room. Does it, for you?',
    priorities: 'Your goals tell us what the long view is for.',
    voice: 'Your words can change how we read the same pattern.',
    inputs: 'Your answers give the numbers their meaning.',
    learning: 'We keep noticing what changes, and listening to you.',
    starting: 'Your answers help us start with your perspective.',
    attention: 'A lower amount tells only part of the story. What’s behind it?',
  };
  let message = card
    ? card.note
      ? `You told us: “${card.note}” We’ll keep that perspective alongside the observation as your picture develops.`
      : card.meaning
    : m.own
      ? 'Your portrait connects what you do with what matters to you. Explore a pattern below, or tell me where the picture misses something.'
      : 'This story uses the perspective shared with you. It does not draw on their private accounts or check-ins.';
  if (topic === 'inputs')
    message = `${m.own ? m.evidence.description : m.source} ${m.inputs.map((i) => i.value + ' ' + i.label).join(', ')}${m.inputs.length ? ' form part of this picture. ' : ''}Your answers and remembered reflections help explain what the observations mean to you.`;
  if (topic === 'learning')
    message =
      'We notice when routines change, which priorities move, and what you ask us to remember. We can revisit an interpretation when your circumstances or perspective change.';
  return {
    source: 'ai',
    author: 'HSBC AI',
    singleMessage: true,
    title: card?.note
      ? 'Your perspective is part of this picture.'
      : m.own
        ? titles[topic] ||
          (p.l1.customer.id === 'alex'
            ? 'Your story starts with what matters to you.'
            : 'Your habits suggest a pattern. You give it meaning.')
        : 'These are the perspectives they’ve chosen to share.',
    message,
    cta: 'Back to the portrait story',
    action: 'portrait',
    chips: [
      card?.question || 'What is my portrait based on?',
      'What if that doesn’t feel like me?',
    ],
  };
}

export function portraitStoryReply(p, s, context, text) {
  const m = portraitStory(p, s.member),
    card = m.cards.find((c) => c.id === (context.topic || context.id));
  if (/wrong|doesn.t|not me|change.*interpret|another explanation|disagree|correct/i.test(text))
    return `${card ? card.meaning + ' ' : ''}You know the reason behind your choices. ${m.own ? 'Use “Add your perspective” on the story to tell us what we have missed. We’ll keep your words alongside the observation and revisit the interpretation.' : 'This is their shared interpretation; they can update it from their own portrait.'}`;
  if (/balance|wealth|tier|score|rank/i.test(text))
    return 'Your balance and HSBC tier do not set your personality. The portrait uses your approach—such as the routines you choose—alongside your answers and feedback. The amounts here make a pattern understandable; they are not a score.';
  if (/data|based|source|information|observe|watch|learn next/i.test(text))
    return card
      ? `${card.source} ${card.observation} We continue to notice ${card.watch[0].toLowerCase() + card.watch.slice(1)}`
      : `${m.own ? m.evidence.description : m.source} ${m.inputs.map((i) => i.value + ' ' + i.label).join(', ')}${m.inputs.length ? ' form part of this picture. ' : ''}Each tile separates what we observed from what we think it could mean. Reflections you choose to remember can add your own explanation.`;
  return card
    ? `${card.observation} ${card.note ? 'You added: “' + card.note + '”. ' : ''}${card.meaning}`
    : `${m.personality.copy || 'Your answers will give us a first impression.'} Tap a pattern in the portrait story and we can explore why we read it that way.`;
}
