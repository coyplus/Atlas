import { relationshipQualification } from '../../domain/membership.mjs';
import { addRule } from '../../domain/money.mjs';
// Proposed membership economics are isolated from the agreed TRB thresholds.
export const tiers = [
  {
    id: 'hsbc',
    name: 'HSBC',
    threshold: 0,
    choices: 0,
    promise: 'Clarity for your everyday money.',
    access: [
      'Your money, together in Atlas',
      'Personalised insights and Money Rules',
      'HSBC Points and rewards',
    ],
  },
  {
    id: 'premier',
    name: 'Premier',
    threshold: 100000,
    choices: 3,
    promise: 'Expert access. More choice for your life.',
    access: [
      'Your personal Relationship Manager',
      'Family travel cover and digital GP',
      'Member booking opportunities',
    ],
  },
  {
    id: 'elite',
    name: 'Elite',
    threshold: 250000,
    choices: 5,
    promise: 'A dedicated relationship. Exceptional access.',
    access: [
      'A named Relationship Manager',
      'Specialist planning for you and your family',
      'Private invitations and priority opportunities',
    ],
  },
];
export const benefits = [
  {
    id: 'culture',
    tier: 1,
    title: 'Art & culture',
    subtitle: 'Arts Pass and priority booking.',
    icon: 'spark',
    category: 'Experiences',
    detail:
      'Arts Pass access and priority cultural booking, selected around the places and experiences you enjoy.',
    scope: 'You · guest access varies by event',
    terms:
      'Priority booking gives you an earlier booking window. Tickets and guest places depend on availability.',
  },
  {
    id: 'family',
    tier: 1,
    title: 'Family support',
    subtitle: 'Tutoring, elder-care and will-writing.',
    icon: 'users',
    category: 'Family',
    detail:
      'Access to family services, including tutoring offers, elder-care support and will-writing services. Choose the support relevant to your household.',
    scope: 'Eligible household members',
    terms:
      'Each service has its own eligibility and appointment availability. Sharing a pot does not automatically enrol another person.',
  },
  {
    id: 'protection',
    tier: 1,
    title: 'Everyday protection',
    subtitle: 'Breakdown and gadget cover options.',
    icon: 'shield',
    category: 'Services',
    detail:
      'Explore breakdown or gadget cover through your membership. Review the policy and your eligibility before activating any cover.',
    scope: 'You · cover-specific eligibility',
    terms:
      'Selecting this choice does not activate insurance. Policy limits, exclusions and a separate activation step apply.',
  },
  {
    id: 'career',
    tier: 1,
    title: 'Business & career',
    subtitle: 'Workspace and professional learning.',
    icon: 'globe',
    category: 'Services',
    detail:
      'Member access to workspace offers, professional learning and career services. Explore the options that fit your work.',
    scope: 'You',
    terms: 'Individual services may require registration and have their own usage limits.',
  },
  {
    id: 'sport',
    tier: 2,
    title: 'Sport, closer',
    subtitle: 'Hospitality and priority ticket opportunities.',
    icon: 'award',
    category: 'Experiences',
    detail:
      'Register your interest in member hospitality and priority ticket opportunities across selected sporting events.',
    scope: 'You · guest places where offered',
    terms:
      'An invitation opportunity is not a guaranteed ticket. Limited places may be allocated by ballot; any price and allocation method are shown before you apply.',
  },
  {
    id: 'legacy',
    tier: 2,
    title: 'Your family’s future',
    subtitle: 'Specialist planning for your family.',
    icon: 'users',
    category: 'Family',
    detail:
      'Access to a specialist planning conversation about the family’s longer-term priorities, succession and the questions you want to resolve together.',
    scope: 'You · family joins by invitation',
    terms:
      'A planning conversation does not authorise financial changes. Any advice service, scope and fees are agreed separately.',
  },
];
export function membershipModel(p) {
  const { holdings, trb, index } = relationshipQualification(p);
  const tier = tiers[index],
    next = tiers[index + 1] || null;
  const selected = [...new Set(p.ui.membershipChoices || [])].filter((id) =>
    benefits.some((b) => b.id === id),
  );
  const active = selected
    .filter((id) => benefits.find((b) => b.id === id).tier <= index)
    .slice(0, tier.choices);
  return {
    holdings,
    trb,
    index,
    tier,
    next,
    remaining: next ? Math.max(0, Math.round((next.threshold - trb) * 100) / 100) : 0,
    selected,
    active,
    available: Math.max(0, tier.choices - active.length),
  };
}
export function saveMembershipChoices(p, ids) {
  const m = membershipModel(p),
    unique = [...new Set(ids)];
  if (
    unique.length > m.tier.choices ||
    unique.some((id) => !benefits.some((b) => b.id === id && b.tier <= m.index))
  )
    throw new Error('Choose benefits available with your current membership.');
  p.ui.membershipChoices = unique;
  return unique;
}

export function membershipSuggestion(p) {
  const m = membershipModel(p);
  if (p.l1.customer.id !== 'sam' || m.index !== 0 || m.remaining > 5000) return null;
  const rule = p.l1.rules.find((r) => r.id === 'r-premier-savings');
  const limit = Math.max(
    0,
    Math.floor(
      p.l1.accounts.filter((a) => a.kind === 'current').reduce((n, a) => n + a.balance, 0) -
        p.l1.bills.reduce((n, b) => n + b.amount, 0) -
        p.l1.rules
          .filter((r) => r.active && r.id !== 'r-premier-savings')
          .reduce((n, r) => n + r.amount, 0),
    ),
  );
  if (!rule && limit < 1) return null;
  return {
    remaining: m.remaining,
    amount: rule?.amount || Math.min(500, limit),
    limit,
    rule,
    paused: !!p.l1.autonomy.paused || rule?.active === false,
  };
}
export function saveMembershipRule(p, amount) {
  if (
    !membershipSuggestion(p) ||
    !Number.isFinite(amount) ||
    amount < 1 ||
    amount > membershipSuggestion(p).limit
  )
    throw new Error('Choose an amount within your available surplus.');
  const existing = p.l1.rules.find((r) => r.id === 'r-premier-savings');
  if (existing) return existing;
  return addRule(
    p,
    p.l1.pots.find((x) => x.id === 'un'),
    amount,
    'Save from each new payday',
    'r-premier-savings',
  );
}
