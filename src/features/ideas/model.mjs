import { planningPots, futureState, forecast } from '../../domain/future.mjs';
import { checkinModel } from '../checkin/model.mjs';
import { badgeState, challenge } from '../badges/model.mjs';

// A local, deterministic stand-in for AI. Only the customer's own picture and
// explicitly remembered reflections inform ideas; household portraits are not inputs.
export function customerContext(p) {
  const pots = planningPots(p);
  return {
    pots,
    age: p.l1.customer.age,
    traits: Object.fromEntries(p.l2.personality.traits || []),
    beliefs: (p.l2.beliefs || []).filter((b) => b.status === 'confirmed'),
    memories: checkinModel(p).memories,
    investor: pots.some((g) => !g.isDebt && (g.kind === 'investment' || g.growthAnnual)),
    savings: pots.filter((g) => !g.isDebt).reduce((n, g) => n + g.balance, 0),
  };
}

const memoryIdeas = {
  space: [
    'A place that feels mine',
    'What would make a place feel like yours?',
    'home',
    3000,
    50,
    /home|house|place.*mine/i,
  ],
  people: [
    'More time together',
    'What would a lovely day together look like?',
    'users',
    600,
    25,
    /time together|family time/i,
  ],
  time: [
    'Room to slow down',
    'What would you love to have more time for?',
    'sun',
    1500,
    50,
    /slow down|sabbatical|time off/i,
  ],
  learn: [
    'Something new to learn',
    'What have you always wanted to try?',
    'spark',
    600,
    25,
    /learn|course|skills/i,
  ],
  outside: [
    'A little adventure',
    'Where would you love to find yourself?',
    'sun',
    1200,
    50,
    /adventure/i,
  ],
  own: [
    'Something of my own',
    'What would you love to bring into the world?',
    'target',
    1500,
    50,
    /something.*own|business/i,
  ],
};

export function possibilities(p, s = {}) {
  if (s.member && s.member !== 'self') return [];
  const c = customerContext(p),
    ideas = [],
    projection = s.month > 0 ? forecast(p, futureState(p).ideas, s.month) : null,
    milestones = projection?.goals.filter((g) => g.target || g.isDebt) || [],
    nextChapter =
      milestones.length > 0 &&
      milestones.every((g) => projection.dates[g.id] != null && projection.dates[g.id] < s.month),
    viewedAge = c.age + Math.floor((s.month || 0) / 12),
    existing = [...c.pots, ...futureState(p).ideas.filter((i) => i.kind === 'add')],
    preferences = p.ui.possibilities || {},
    has = (pattern) => existing.some((g) => pattern.test(g.name));
  const add = (key, title, why, prompt, glyph, target, amount, pattern, extra = {}) => {
    if (has(pattern) || existing.some((g) => g.possibilityKey === key)) return;
    ideas.push({
      id: key,
      key,
      title,
      name: title,
      why,
      prompt,
      glyph,
      target,
      amount,
      source: 'From your current picture',
      role: 'cash',
      ...extra,
    });
  };
  const memory = [...c.memories]
    .reverse()
    .find((r) => r.tool === 'ahead' && memoryIdeas[r.answers?.future]);
  if (memory) {
    const [title, prompt, glyph, target, amount, pattern] = memoryIdeas[memory.answers.future];
    add(
      'reflection-' + memory.answers.future,
      title,
      `You pictured “${memory.answers.note?.trim() || title.toLowerCase()}” in a check-in you chose to remember.`,
      prompt,
      glyph,
      target,
      amount,
      pattern,
      {
        id: `memory-${memory.id}-${memory.version || 1}`,
        source: 'From your check-in',
        memoryId: memory.id,
      },
    );
  }
  if (nextChapter)
    add(
      'next-chapter',
      viewedAge >= 60 ? 'Life on your own terms' : 'Time to try something different',
      `In your age-${viewedAge} view, your current milestones could be behind you. What would you like more room for then?`,
      viewedAge >= 60
        ? 'What would make this chapter feel like yours?'
        : 'What would you do with a little more freedom?',
      'sun',
      3000,
      50,
      /new chapter|time for myself|sabbatical/i,
      { name: 'My next chapter', source: 'From your Time Travel view' },
    );
  const homeIntent = c.beliefs.find((b) => /place.*own|home|house/i.test(b.claim));
  if (homeIntent)
    add(
      'home',
      'A place of my own',
      `You told us: “${homeIntent.claim}”. A goal could give that thought a shape.`,
      'What does a place of your own mean to you?',
      'home',
      3000,
      50,
      /home|house|place.*own/i,
      { source: 'Something you told us' },
    );
  if (!has(/emergency|buffer|rainy|breathing room/i))
    add(
      'buffer',
      'A little breathing room',
      c.traits.Spontaneity >= 4
        ? 'Your portrait makes room for spontaneity. A small cushion could leave more room for the unexpected.'
        : 'There isn’t an emergency fund in your Atlas picture yet. A small cushion could be a place to start.',
      'What would a little more breathing room feel like?',
      'target',
      1000,
      25,
      /emergency|buffer|rainy|breathing room/i,
    );
  if (!nextChapter && has(/house deposit|home deposit/i))
    add(
      'move-in',
      'Make the move feel like home',
      'You’re saving for a home. Give moving day and the first essentials a little room too.',
      'What would make your first week there feel like home?',
      'home',
      1500,
      50,
      /move.in|moving cost/i,
      { name: 'Moving-in costs', source: 'Alongside your home goal' },
    );
  if (!nextChapter && has(/car|vehicle/i))
    add(
      'car-costs',
      'Take the surprise out of car costs',
      'Your car loan is in your plan. A separate pot could soften the next insurance bill or service.',
      'Which car costs would you like to feel ready for?',
      'car',
      600,
      50,
      /car costs|car insurance|servicing/i,
      { name: 'Annual car costs', source: 'Alongside your car loan' },
    );
  if (!c.investor && c.savings >= 10000 && c.traits.Planning >= 4)
    add(
      'first-investment',
      'Could some money grow with you?',
      'You’ve built up longer-term savings. Explore investing for later, with your nearer goals kept separate.',
      'What might you want this money to do in ten years?',
      'trend',
      5000,
      50,
      /invest/i,
      {
        name: 'A first investment',
        source: 'From your saving habits',
        role: 'investment',
        investment: true,
      },
    );
  if (c.investor && c.age >= 40) {
    const family = c.beliefs.some((b) => /family/i.test(b.claim));
    add(
      'legacy',
      family ? 'A head start for someone you love' : 'Something to pass on',
      family
        ? 'You told us family comes first. Alongside your investments, a separate giving goal could make that intention tangible.'
        : 'You already invest for the long term. Is there someone or something you would like part of that future to support?',
      'Who or what would you love to help?',
      'users',
      5000,
      50,
      /legacy|head start|pass on|giving/i,
      {
        name: 'A head start',
        source: family ? 'Something you told us' : 'Alongside your investments',
      },
    );
    add(
      'later-life',
      'More freedom, later on',
      has(/retire|pension/i)
        ? 'Retirement is already in your plan. A separate pot for the experiences you imagine could give that chapter more colour.'
        : `At ${c.age}, with investments already in place, you could explore what you want your later life to feel like.`,
      'What would an ordinary, lovely day look like then?',
      'sun',
      3000,
      50,
      /later.life|later freedom/i,
      { name: 'Later-life adventures', source: 'Your next chapter' },
    );
  }
  if (!has(/car|vehicle/i))
    add(
      'annual-costs',
      'A quieter year for bills',
      'A dedicated pot could spread a larger annual bill into smaller monthly amounts, if that would suit you.',
      'Is there a yearly bill you would like to plan around?',
      'repeat',
      600,
      50,
      /annual.*cost|annual.*bill|council tax/i,
      { name: 'Annual bills', source: 'An idea to consider' },
    );
  if (c.age < 40)
    add(
      'learning',
      'Make room for something new',
      'Is there a skill or interest you’d love to explore? A small goal could give it a little room.',
      'What would you love to learn, just for you?',
      'spark',
      600,
      25,
      /learn|course|skills/i,
      { name: 'Something new to learn', source: 'An idea to consider' },
    );
  return ideas
    .filter(
      (i) =>
        !(preferences.dismissed || []).includes(i.id) &&
        !futureState(p).ideas.some((g) => g.possibilityKey === i.key),
    )
    .slice(0, 3)
    .map((i) => ({ ...i, isNew: !(preferences.seen || []).includes(i.id) }));
}

export function seePossibilities(p, items) {
  const prefs = (p.ui.possibilities ||= { seen: [], dismissed: [] });
  prefs.seen = [...new Set([...(prefs.seen || []), ...items.map((i) => i.id)])];
}
export function dismissPossibility(p, id) {
  const prefs = (p.ui.possibilities ||= { seen: [], dismissed: [] });
  prefs.dismissed = [...new Set([...(prefs.dismissed || []), id])];
}

export function badgeRecommendation(p, s = {}) {
  if (s.member && s.member !== 'self') return null;
  const c = customerContext(p),
    ranked = [];
  const propose = (id, why) => ranked.push({ id, why });
  if (c.memories.some((r) => r.tool === 'ahead'))
    propose(
      'future-letter',
      'You’ve been picturing your future in a remembered check-in. This challenge helps you stay connected to why it matters.',
    );
  if (c.memories.some((r) => r.tool === 'worth'))
    propose(
      'spending-detective',
      'You’ve been reflecting on what spending gives back. This challenge helps you notice those patterns over four weeks.',
    );
  if (c.traits.Spontaneity >= 4)
    propose(
      'pause-purchase',
      'Your portrait leaves room for spontaneity. Try giving ten non-essential purchases 48 hours of thought; buying or skipping both count.',
    );
  if (c.investor && c.age >= 40)
    propose(
      'future-letter',
      'Your investments already look a long way ahead. This challenge brings the focus back to the life you want them to support.',
    );
  if (!c.investor && c.savings >= 10000)
    propose(
      'investment-curious',
      'You’ve built up savings. This learning challenge explores investing before you decide whether it belongs in your future.',
    );
  if (c.traits.Rhythm >= 4)
    propose(
      'payday-first',
      'Your portrait points to steady habits. Try setting aside an amount that fits on three paydays, towards a goal you already care about.',
    );
  if (c.pots.some((g) => /emergency|buffer/i.test(g.name)))
    propose(
      'rainy-day-ready',
      'You already have an emergency fund. This challenge helps you think through when and how you would use it.',
    );
  propose(
    'future-letter',
    'A short letter to your future self can help you decide what you want your money to make possible.',
  );
  propose(
    'scam-spotter',
    'Practise spotting pressure in a money request, so you have a moment to think before acting.',
  );
  // A relevant existing commitment wins. Paused challenges stay quiet.
  const active = ranked.find((r) => badgeState(p, r.id).status === 'active');
  const picked = active || ranked.find((r) => badgeState(p, r.id).status === 'available');
  return picked
    ? { ...picked, challenge: challenge(picked.id), state: badgeState(p, picked.id) }
    : null;
}
