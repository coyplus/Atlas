import { moduleModel, safeAmount } from '../../domain/numbers.mjs';
import { cash } from '../../domain/money.mjs';
import { portraitModel } from '../you/portrait.mjs';

export const styles = {
  guide: {
    name: 'Guide',
    tone: 'Clear & balanced',
    description: 'A little perspective. A useful next step.',
    color: '#756189',
    light: '#ede8f2',
  },
  listener: {
    name: 'Listener',
    tone: 'Warm & reflective',
    description: 'Space to talk, with understanding first.',
    color: '#a65d51',
    light: '#f6e8e1',
  },
  analyst: {
    name: 'Analyst',
    tone: 'Detailed & reasoned',
    description: 'The numbers, the working and the why.',
    color: '#34766f',
    light: '#e1eeea',
  },
  coach: {
    name: 'Coach',
    tone: 'Encouraging & practical',
    description: 'One manageable step to move forward.',
    color: '#3f7393',
    light: '#e3edf3',
  },
};
export const initiatives = {
  ask: { name: 'When I ask', description: 'Keep the Companion quiet until I open it.' },
  context: { name: 'In useful moments', description: 'Offer context for what I’m looking at.' },
  lead: { name: 'Suggest a next step', description: 'Offer a way forward as I explore.' },
};
export function companionPreferences(p) {
  const saved = p.ui.companion || {};
  return {
    style: styles[saved.style] ? saved.style : 'guide',
    initiative: initiatives[saved.initiative] ? saved.initiative : 'context',
  };
}
export function companionRecommendation(p) {
  const m = portraitModel(p);
  if (!m.named || !m.ranked.length)
    return {
      style: 'guide',
      trait: null,
      reason: 'A balanced place to begin while your portrait takes shape.',
    };
  const trait = m.ranked[0][0];
  const recommendations = {
    Planning: [
      'analyst',
      'Your portrait suggests you like a clear plan. Seeing the working may be a useful fit.',
    ],
    Patience: [
      'analyst',
      'Your portrait suggests you take a longer view. Detail and reasoning may help you weigh your options.',
    ],
    Focus: [
      'coach',
      'Your portrait suggests you like a clear goal. Breaking it into manageable steps may suit you.',
    ],
    Rhythm: [
      'coach',
      'Your portrait suggests regular steps work for you. A practical, encouraging style may suit that rhythm.',
    ],
    Generosity: [
      'listener',
      'Your portrait puts people in the picture. A little more space to talk through what matters may suit you.',
    ],
    Spontaneity: [
      'guide',
      'Your portrait leaves room for possibilities. A balanced style can help you explore without fixing the path.',
    ],
  };
  const [style, reason] = recommendations[trait] || [
    'guide',
    'A balanced starting point for exploring your money.',
  ];
  return { style, trait, reason };
}

// Style is a presentation policy, never a source of financial facts or permissions.
export function companionReply(
  p,
  text,
  { style = companionPreferences(p).style, sensitive = false } = {},
) {
  if (style === 'guide' || sensitive) return text;
  if (style === 'listener') return `We can take this at your pace. ${text}`;
  if (style === 'analyst') return `Let’s look at the detail. ${text}`;
  return `One step at a time. ${text}`;
}
export function personaliseSupport(p, s, context, base, catalogue) {
  if (base.source === 'human') return base;
  const prefs = companionPreferences(p);
  const m = { ...base, companionStyle: prefs.style };
  // Warnings and transactional instructions retain their original wording and visibility.
  const essential =
    !!m.attentionKey ||
    !!m.essential ||
    m.action?.startsWith('agreement-recovery:') ||
    ['dialog', 'idea', 'rules'].includes(context.kind);
  if (prefs.initiative === 'ask' && !context.explicit && !essential && context.kind !== 'chat')
    return {
      ...m,
      title: 'Here when you need me',
      message: 'Open the Companion whenever you’d like to talk through what you’re seeing.',
      cta: 'Talk it through',
      action: 'support:discuss',
      singleMessage: true,
      quiet: true,
      chips: [],
    };
  if (essential) return m;
  const headings = {
    listener: {
      now: 'A little space to take stock',
      you: 'Your perspective comes first',
      future: 'A future that feels right for you',
    },
    analyst: {
      now: 'Your money, with the working',
      you: 'The evidence behind the picture',
      future: 'The numbers behind your options',
    },
    coach: {
      now: 'Find your next manageable step',
      you: 'Notice what’s working for you',
      future: 'Let’s turn a possibility into a plan',
    },
  };
  if (prefs.style !== 'guide') {
    m.message = companionReply(p, m.message);
    if (context.kind === 'module' && context.id === 'safespend' && safeAmount(p) !== null) {
      const amount = cash(safeAmount(p), true);
      const fact = `${amount} is the estimate after your recorded bills and commitments.`;
      m.message =
        prefs.style === 'listener'
          ? `${fact} A bit of breathing room can mean different things. What would you like this money to make space for?`
          : prefs.style === 'analyst'
            ? `${fact} It is not your account balance. The breakdown shows what has been deducted, so you can check the assumptions before deciding.`
            : `${fact} Start by checking the breakdown. Then choose whether to keep the room, set some aside, or explore a goal. Which feels useful?`;
      m.title =
        prefs.style === 'listener'
          ? 'What would a little breathing room mean?'
          : prefs.style === 'analyst'
            ? `${amount}, after commitments`
            : 'Give your breathing room a purpose';
    } else if (context.kind === 'module' && context.id === 'balance' && catalogue) {
      const number = moduleModel(p, 'balance', catalogue);
      const fact = `${number.value} is held in your current accounts.`;
      m.message =
        prefs.style === 'listener'
          ? `${fact} Some of it may already have a job to do. What would help you feel clearer about where you stand?`
          : prefs.style === 'analyst'
            ? `${fact} This is a balance, not a spendable amount. Review the accounts and commitments behind it before deciding what is available.`
            : `${fact} First, check what is already set aside for bills and plans. Then we can explore what you want the rest to do.`;
      m.title =
        prefs.style === 'listener'
          ? 'Let’s make sense of where you stand'
          : prefs.style === 'analyst'
            ? `${number.value}, in context`
            : 'Start with what’s already covered';
    } else if (prefs.style === 'analyst' && context.kind === 'module' && catalogue) {
      const number = moduleModel(p, context.id, catalogue);
      if (number.value && !m.message.includes(number.value))
        m.message = `${number.title}: ${number.value}. ${base.message}`;
    } else if (prefs.style === 'coach' && base.cta && !/^support:|^chat$/.test(base.action || '')) {
      m.message = `${base.message} A useful next step: ${base.cta.charAt(0).toLowerCase() + base.cta.slice(1)}.`;
    }
    if (['top', 'future', 'personality', 'companion'].includes(context.kind))
      m.title = headings[prefs.style][s.tab] || m.title;
    // On single-line surfaces the observation remains visible, with the style in the discussion.
    if (m.singleMessage) m.title = base.title;
  }
  if (prefs.initiative === 'lead' && m.cta && !/^support:|^chat$/.test(m.action || '')) {
    m.title = m.cta;
    m.singleMessage = false;
  }
  return m;
}
