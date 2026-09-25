import { isFutureBeginning } from './beginning.mjs';
import { forecast, futureState, when, movement, suggestIdeas } from '../../domain/future.mjs';
import { cash, dateAt } from '../../domain/money.mjs';
import { visiblePossibilities } from '../ideas/horizon.mjs';
import { possibilities } from '../ideas/model.mjs';
export function futureInsight(p, s) {
  const f = futureState(p),
    ideas = f.ideas,
    next = forecast(p, ideas, s.month),
    base = ideas.length ? forecast(p, [], s.month) : next;
  const ai = (title, message, cta = 'Explore with AI', action = 'future-chat') => ({
    source: 'ai',
    author: 'HSBC AI',
    title,
    singleMessage: true,
    message,
    cta,
    action,
  });
  if (isFutureBeginning(p))
    return ai(
      'A possibility is enough to begin.',
      'You don’t need a complete plan. We can explore an idea together and see what might work for you.',
      'Explore possibilities',
      'future-add',
    );
  const milestones = next.goals.filter((g) => g.target || g.isDebt),
    allDated = milestones.length && milestones.every((g) => next.dates[g.id] != null),
    lastMonth = allDated ? Math.max(...milestones.map((g) => next.dates[g.id])) : null,
    possible = possibilities(p, s)[0];
  const horizon = visiblePossibilities(p, s)[0];
  if (
    s.month >= 48 &&
    horizon &&
    (!ideas.length || Math.abs(s.month - (f.lastExperimentMonth ?? 0)) > 12)
  ) {
    const age = p.l1.customer.age + Math.floor(s.month / 12);
    const unplanned = milestones.find((g) => next.dates[g.id] == null);
    return ai(
      `At ${age}, ${
        {
          'family-adventure': 'could a bigger family adventure be on the horizon?',
          'work-flexibility': 'could shorter weeks give you more time with family?',
          'family-head-start': `could you help ${p.l1.household?.members.find((m) => m.relation === 'child')?.name || 'your child'} with a first move?`,
          'later-freedom': 'what would a life with less work look like?',
          'career-chapter': 'could a course open up a new direction?',
          'home-life': 'would you want more room for the life you love?',
          'time-away': 'what would a month away from your routine make possible?',
          'later-options': 'would more choice about when to stop working appeal?',
          'shared-experiences': 'what would you love to experience together?',
          'new-rhythm': 'how would you fill a week with more time for yourself?',
          'family-giving': 'would you like to help someone take their next step?',
          'future-comfort': 'what would make home easier to enjoy?',
        }[horizon.key]
      }`,
      `${horizon.why}${unplanned ? ` ${unplanned.name} still needs a funding route in your current plan.` : ''}${ideas.length ? ' Your experiments are included in the numbers; grey possibilities are not.' : ' The grey possibilities are invitations, separate from your projected balances.'}`,
      'Imagine ' + horizon.name.toLowerCase(),
      'future-horizon:' + horizon.id,
    );
  }
  if (lastMonth != null && s.month > lastMonth) {
    const age = p.l1.customer.age + Math.floor(s.month / 12);
    return ai(
      `At ${age}, your planned milestones could be behind you. What would you love to do next?`,
      `By ${dateAt(p, s.month)}, ${ideas.length ? 'this version of your future' : 'your current plan'} could put your existing milestones behind you. ${possible ? possible.why : 'What would you like this next chapter to make possible?'}${ideas.length ? ' Your changes are still a preview.' : ''}`,
      'Explore new possibilities',
      'future-add',
    );
  }
  if (ideas.length) {
    const changed = next.goals.filter((g) => base.dates[g.id] !== next.dates[g.id]);
    return ai(
      changed.length
        ? `${changed[0].name}, ${movement(base.dates[changed[0].id], next.dates[changed[0].id]).toLowerCase()}`
        : `Your ideas could mean ${cash(Math.round(next.net))} by ${dateAt(p, s.month)}`,
      changed.length
        ? changed.map((g) => `${g.name}: ${when(p, next.dates[g.id])}`).join('; ') +
            '. These experiments stay as previews until you approve them.'
        : 'Your balances respond to your ideas, even when milestone dates stay the same. Nothing changes until you approve.',
      'Review my changes',
      'future-review',
    );
  }
  if (f.drawer === 'expanded' && !s.month) {
    const idea = suggestIdeas(p)[0],
      trial = idea ? forecast(p, [idea]) : next;
    const goal = trial.goals.find((g) => g.id === idea?.goal);
    return ai(
      goal && base.dates[goal.id] !== trial.dates[goal.id]
        ? `${idea.title}: ${goal.name.toLowerCase()} ${movement(base.dates[goal.id], trial.dates[goal.id]).toLowerCase()}.`
        : 'What if a small payday Savings Rule helped your next goal grow?',
      goal && base.dates[goal.id] !== trial.dates[goal.id]
        ? `${idea.title} could bring ${goal.name.toLowerCase()} ${movement(base.dates[goal.id], trial.dates[goal.id]).toLowerCase()}. Try it below and watch the timeline respond.`
        : 'Try a Savings Rule, explore a different priority, or bring your own idea. Your real plan stays unchanged until you approve.',
    );
  }
  const upcoming = next.goals
    .filter((g) => next.dates[g.id] > s.month)
    .sort((a, b) => next.dates[a.id] - next.dates[b.id])[0];
  const reached = next.goals
    .filter((g) => next.dates[g.id] != null && next.dates[g.id] <= s.month)
    .sort((a, b) => next.dates[b.id] - next.dates[a.id])[0];
  const unresolved = milestones.find((g) => next.dates[g.id] == null);
  if (s.month && !upcoming && unresolved)
    return ai(
      `${unresolved.name} ${next.rates[unresolved.id] ? 'needs more funding to reach its target' : 'has no contribution yet. Could a Money Rule help?'}`,
      `In ${dateAt(p, s.month)}, ${unresolved.name} is still beyond this projection’s horizon. ${next.rates[unresolved.id] ? 'Try changing its contribution to see what could bring it closer.' : 'It has no contribution at this point. Explore a Money Rule or a different priority to give it momentum.'}`,
    );
  if (s.month && reached)
    return ai(
      `${reached.name} could be ${reached.isDebt ? 'repaid' : 'fully funded'} by ${when(p, next.dates[reached.id])}.`,
      `By ${dateAt(p, s.month)}, ${reached.name} could be ${reached.isDebt ? 'paid off' : 'fully funded'}${upcoming ? `; ${upcoming.name} comes next in ${when(p, next.dates[upcoming.id])}` : ''}. Your projection follows the commitments you have today.`,
      upcoming ? 'Travel to the next milestone' : 'Explore this Pot',
      upcoming ? 'future-land:' + upcoming.id : 'future-goal:' + reached.id,
    );
  if (upcoming)
    return ai(
      `${upcoming.name}: ${cash(upcoming.isDebt ? upcoming.balance : upcoming.target || 0)} could be ${upcoming.isDebt ? 'repaid' : 'ready'} by ${when(p, next.dates[upcoming.id])}.`,
      `${cash(upcoming.isDebt ? upcoming.balance : upcoming.target || 0)} could be ${upcoming.isDebt ? 'repaid' : 'ready'} in ${when(p, next.dates[upcoming.id])}. Your current commitments put ${cash(next.speed)} a month towards your future.`,
      'Take me there',
      'future-land:' + upcoming.id,
    );
  return ai(
    milestones.some((g) => next.dates[g.id] == null)
      ? `${milestones.find((g) => next.dates[g.id] == null).name} needs a funding route. Try a Savings Rule?`
      : possible?.prompt || 'What would you love to save for? A first goal can start small.',
    milestones.some((g) => next.dates[g.id] == null)
      ? `At your current pace, ${milestones.find((g) => next.dates[g.id] == null).name} sits beyond this 20-year view. Try a What If idea to see what could bring it closer.`
      : possible?.why ||
          'A first goal gives your future a shape. Start with something that matters to you.',
    'Explore possibilities',
    'future-add',
  );
}
