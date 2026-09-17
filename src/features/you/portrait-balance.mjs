import { portraitModel } from './portrait.mjs';
const perspectives = {
  Planning: {
    strength: 'You give your money a direction.',
    detail: 'A clear plan can make everyday decisions feel easier.',
    blind: 'A plan can become too tight.',
    caution: 'You may leave less room for an unexpected opportunity or a change of heart.',
    question: 'Where would a little flexibility make your plan easier to live with?',
  },
  Rhythm: {
    strength: 'You make small steps count.',
    detail: 'Routines can keep progress going when life gets busy.',
    blind: 'A familiar routine can outlive its purpose.',
    caution: 'An amount that once worked may need to change as your life does.',
    question: 'Which routine still serves you, and which is ready for a rethink?',
  },
  Patience: {
    strength: 'You keep the longer view.',
    detail: 'Giving a plan time can help you look beyond short-term noise.',
    blind: 'Waiting can become putting things off.',
    caution: 'A long view can make it easier to postpone a useful review today.',
    question: 'Is there a decision you would feel better about reviewing now?',
  },
  Spontaneity: {
    strength: 'You leave room for possibility.',
    detail: 'Being open to change can help your money support the life you enjoy.',
    blind: 'The moment can crowd out the longer view.',
    caution: 'An appealing choice today can make another priority harder to fund.',
    question: 'What would you like to keep protected before saying yes to something new?',
  },
  Generosity: {
    strength: 'You put people in the picture.',
    detail: 'Your money can create shared experiences and support the people who matter.',
    blind: 'Your own needs can slip down the list.',
    caution: 'Supporting others may leave less room for your own breathing space.',
    question: 'What would looking after yourself as well as others look like?',
  },
  Focus: {
    strength: 'You know what you’re working towards.',
    detail: 'A clear priority can help you follow through.',
    blind: 'One goal can fill the whole picture.',
    caution: 'You may overlook a smaller need or a different possibility along the way.',
    question: 'What else needs a little space alongside your main goal?',
  },
};
export function portraitBalance(p, member = 'self') {
  const m = portraitModel(p, member);
  if (!m.named || m.household) return null;
  const ranked = m.ranked.filter(([name, score]) => perspectives[name] && score >= 3);
  if (!ranked.length) return null;
  const [trait] = ranked[0];
  return {
    trait,
    ...perspectives[trait],
    strengths: ranked.slice(0, 2).map(([name]) => ({ trait: name, ...perspectives[name] })),
    own: m.self,
  };
}
