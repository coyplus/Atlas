import { planningPots, futureState } from '../../domain/future.mjs';

// Fictional life-stage prompts, not peer statistics or inferred intentions.
// Dates locate an invitation to think; they never enter the financial forecast.
export function horizonPossibilities(p, s = {}) {
  if (s.member && s.member !== 'self') return [];
  const id = p.l1.customer.id,
    age = p.l1.customer.age;
  const existing = [...planningPots(p), ...futureState(p).ideas.filter((i) => i.kind === 'add')];
  const child = p.l1.household?.members.find((m) => m.relation === 'child');
  const candidates = [];
  const add = (key, month, name, glyph, target, why, planning, pattern, peer = '') => {
    if (existing.some((g) => g.possibilityKey === key || pattern.test(g.name))) return;
    candidates.push({
      id: 'horizon-' + key,
      key,
      month,
      name,
      title: name,
      shortName: {
        'family-adventure': 'Family adventure',
        'work-flexibility': 'Shorter weeks',
        'family-head-start': 'A first move',
        'later-freedom': 'More free time',
        'career-chapter': 'New career',
        'home-life': 'Room to grow',
        'time-away': 'Time away',
        'later-options': 'Later choices',
        'shared-experiences': 'Time together',
        'new-rhythm': 'A new rhythm',
        'family-giving': 'Giving back',
        'future-comfort': 'Home comforts',
      }[key],
      glyph,
      target,
      amount: Math.max(10, Math.ceil(target / month / 5) * 5),
      role: 'cash',
      source: 'A possibility, not a prediction',
      prompt: 'What could ' + name.toLowerCase() + ' look like for you?',
      why,
      planning,
      peer,
      age: age + Math.floor(month / 12),
      visualRadius: 42,
    });
  };
  if (id === 'sam') {
    add(
      'family-adventure',
      84,
      'A bigger family adventure',
      'sun',
      6000,
      `In seven years, ${child?.name || 'your child'} would be ${(child?.age || 4) + 7}. Would a different kind of trip together appeal?`,
      'Choose a rough trip and season. An occasional travel Pot could sit alongside your usual family holiday.',
      /bigger family adventure/i,
    );
    add(
      'work-flexibility',
      120,
      'A little more freedom at work',
      'clock',
      9000,
      'You are already balancing work and family, with money set aside for something of your own. Could a period of shorter weeks be part of that future?',
      'Start with the time you want back, then estimate the income gap. Keep this separate from the budget for your business idea.',
      /freedom at work|shorter weeks/i,
      'A possible mid-career question: more time, a new direction, or keeping things as they are?',
    );
    add(
      'family-head-start',
      180,
      'A head start beyond education',
      'home',
      12000,
      `By then, ${child?.name || 'your child'} would be ${(child?.age || 4) + 15}. Alongside education, you might want the option to help with a first move.`,
      'Decide what help would feel comfortable, if any. A flexible family gift Pot need not commit you to a particular home or path.',
      /head start beyond education|first move/i,
    );
    add(
      'later-freedom',
      228,
      'Life with a little less work',
      'sun',
      18000,
      `At ${age + 19}, what balance of work, family and time for yourself would feel good?`,
      'Picture an ordinary week. Review your pension picture with AI before choosing whether a separate cash bridge would help.',
      /life with.*less work/i,
      'Later-life inspiration can be about time and interests, as much as a retirement date.',
    );
  } else if (id === 'jordan' || id === 'alex') {
    add(
      'career-chapter',
      60,
      'Your next career chapter',
      'spark',
      3000,
      `At ${age + 5}, would a course, a new direction or time to try something interest you?`,
      'Choose a skill or experiment first. A small flexible Pot could cover learning and a little breathing room.',
      /career chapter|career change/i,
    );
    add(
      'home-life',
      108,
      'Make space for your life',
      'home',
      6000,
      'Your home plans may look different nine years from now. Would you want room for a new place, a hobby, or people you care about?',
      'Name the change before choosing a number. This is optional spending alongside a home deposit, not another assumed property purchase.',
      /make space for your life/i,
      'One life-stage prompt is to revisit what “home” means as interests and relationships change.',
    );
    add(
      'time-away',
      180,
      'Time for a different pace',
      'sun',
      9000,
      `At ${age + 15}, perhaps the thing you value most is time. What would you do with a month away from your usual routine?`,
      'Consider both the experience and any income you would pause. Try a monthly Savings Rule and see what it leaves for nearer priorities.',
      /different pace|sabbatical/i,
    );
    add(
      'later-options',
      228,
      'More choices for later',
      'trend',
      12000,
      `At ${age + 19}, would it help to revisit what you want later life to look like?`,
      'Bring your pension and any investments into the conversation. This cash Pot is only a starting idea, not a pension recommendation.',
      /more choices for later/i,
      'An invitation to think about future flexibility, with no age milestone to keep up with.',
    );
  } else {
    add(
      'shared-experiences',
      60,
      'More moments together',
      'users',
      6000,
      `As you picture life at ${age + 5}, are there experiences you would love to share with the people closest to you?`,
      'Choose one occasion or experience. Keep a flexible cash Pot separate from longer-term investments.',
      /more moments together/i,
    );
    add(
      'new-rhythm',
      108,
      'A new rhythm to your week',
      'sun',
      9000,
      'Alongside your retirement plans, what would you like an ordinary week to feel like: travel, learning, volunteering, or more time at home?',
      'Put a shape to the experiences first, then a rough spending budget. There is no need to choose a retirement date to explore it.',
      /new rhythm/i,
      'A later-life prompt: imagine how you want to spend your time, before planning how to pay for it.',
    );
    add(
      'family-giving',
      180,
      'Help someone take a next step',
      'users',
      12000,
      `At ${age + 15}, would you like the option to support someone or a cause you care about?`,
      'Think about who or what you would want to help, and how much you would be comfortable keeping aside. Revisit the idea as circumstances change.',
      /help someone take/i,
    );
    add(
      'future-comfort',
      228,
      'A home that keeps working for you',
      'home',
      12000,
      `Looking towards ${age + 19}, could making your home easier to enjoy be something to consider?`,
      'Start with comfort, interests and how you like to live. Keep any home changes as an option, without assuming your needs will change.',
      /home that keeps working/i,
    );
  }
  return candidates.filter((i) => !(p.ui.possibilities?.dismissed || []).includes(i.id));
}
export function visiblePossibilities(p, s = {}) {
  return horizonPossibilities(p, s)
    .sort((a, b) => Math.abs(a.month - (s.month || 0)) - Math.abs(b.month - (s.month || 0)))
    .slice(0, 2);
}
export function possibilityExperiment(i, overrides = {}) {
  return {
    id: 'try-' + i.id,
    goal: i.id,
    kind: 'add',
    visualIcon: i.glyph,
    name: i.name,
    target: i.target,
    amount: i.amount,
    possibilityKey: i.key,
    title: 'Make room for ' + i.name,
    ...overrides,
  };
}
