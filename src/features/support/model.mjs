import { personaliseSupport } from '../companion/model.mjs';
import { moneySpeedModel } from '../future/money-speed.mjs';
import { portraitStorySupport } from '../you/portrait-story.mjs';
import { portraitMetricsSupport } from '../you/portrait-metrics.mjs';
import { horizonPossibilities } from '../ideas/horizon.mjs';
import { futureInsight } from '../future/insights.mjs';
import { contextualReflection } from '../checkin/model.mjs';
import { membershipModel, membershipSuggestion } from '../membership/model.mjs';
import { feelingModel, feelings } from '../you/feelings.mjs';
import { reflectionFollowup } from '../you/feeling-reflection.mjs';
import { storyModel } from '../stories/model.mjs';
import { recoveryAssessment } from '../../domain/agreements.mjs';
import { containerModel, moneyContainer } from '../../domain/containers.mjs';
import { connectedAccounts, collectionFigures } from '../accounts/accounts.mjs';
import { totals, cash, potRate, milestone, dateAt, previewPerson } from '../../domain/money.mjs';
import { aiMessage, moduleModel, safeAmount } from '../../domain/numbers.mjs';
import { badgeRecommendation, possibilities } from '../ideas/model.mjs';
import { challenge, badgeState, nextStep } from '../badges/model.mjs';

// Copy is derived from the same scenario models as the screen, never scraped from pixels.
function baseSupportModel(p, s, context = { kind: 'top' }, catalogue) {
  const ai = (title, message, cta = 'Talk it through', action = 'support:discuss') => ({
    source: 'ai',
    author: 'HSBC AI',
    title,
    message,
    cta,
    action,
  });
  const human = () => ({
    ...ai(
      'A note from Priya',
      'Your quarterly review is ready. Let’s talk about your plans for Leo’s future.',
      p.ui.appointment ? 'View your appointment' : 'Review with Priya',
      'appointment',
    ),
    source: 'human',
    author: 'Priya · Relationship Manager',
  });
  const k = context.kind;
  if (context.title === 'Money Speed') {
    const speed = moneySpeedModel(p, s);
    return ai(speed.insight, speed.idea, 'Explore a different pace', 'future-chat');
  }
  if (k === 'portrait-story') return portraitStorySupport(p, s, context);
  if (k === 'portrait-metrics') return portraitMetricsSupport(p, s, context);
  if (s.tab === 'future' && ['top', 'future', 'ideas'].includes(k)) return futureInsight(p, s);
  const reflection = contextualReflection(p, s, context);
  if (reflection) return reflection;
  if (k === 'badges') {
    const pick = badgeRecommendation(p, s);
    if (pick)
      return ai(
        pick.state.status === 'active' ? 'A habit you’ve already started' : pick.challenge.title,
        pick.why,
        pick.state.status === 'active' ? 'Continue my challenge' : 'Explore this challenge',
        'badge:' + pick.id,
      );
    return ai(
      'Your challenges, at your pace',
      'Explore the habits and ideas you might like to try.',
      'Browse challenges',
      'badges',
    );
  }
  if (k === 'badge' && challenge(context.id)) {
    const b = challenge(context.id),
      state = badgeState(p, b.id),
      pick = badgeRecommendation(p, s);
    return ai(
      b.title,
      state.status === 'earned'
        ? 'You completed this challenge. Take a moment to notice the habit you built.'
        : state.status === 'paused'
          ? 'Your progress is kept. You can return to this whenever it feels useful.'
          : state.status === 'active'
            ? nextStep(p, b.id)
            : (pick?.id === b.id ? pick.why + ' ' : '') + b.description,
      'View challenge',
      'badge:' + b.id,
    );
  }
  if (context.kind === 'possibility') {
    const idea = horizonPossibilities(p, s).find((i) => i.id === context.id);
    if (idea)
      return ai(
        idea.name,
        idea.why + ' ' + idea.planning,
        'Make it mine',
        'future-horizon-edit:' + idea.id,
      );
  }
  if (['A new possibility', 'Imagine this', 'Your own possibility'].includes(context.title)) {
    const items = possibilities(p, s);
    const selected = context.kind === 'possibility' && items.find((i) => i.id === context.id);
    if (selected)
      return ai(
        selected.title,
        selected.why + ' ' + selected.prompt,
        'Shape this possibility',
        'future-possibility:' + selected.id,
      );
    return ai(
      'A possibility, at your pace',
      context.title === 'A new possibility' && items.length
        ? items[0].why + ' These are starting points; you can make your own.'
        : 'Start with what this would mean to you. The amounts are yours to change, and you can see the effect before applying anything.',
      'Create my own',
      'future-own',
    );
  }
  if (
    s.direction === 'vanilla' &&
    s.tab === 'you' &&
    ['top', 'personality'].includes(k) &&
    !context.surface
  ) {
    const next = membershipSuggestion(p);
    if (next && !next.rule && s.member === 'self')
      return ai(
        cash(next.remaining) + ' to reach Premier',
        'Your savings bring you close. A ' +
          cash(next.amount) +
          ' payday rule could help you retain new income and close the gap while keeping your family plans funded.',
        'Explore a saving rule',
        'membership-rule',
      );
    const member = p.l1.household.members.find((x) => x.id === s.member);
    if (s.member !== 'self' && p.l2.personality.members?.some((x) => x.memberId === s.member))
      return ai(
        s.member === 'household'
          ? 'Different people, a shared picture'
          : (member?.name || 'Their portrait') + ' · shared with you',
        'This portrait is shared by consent. Other accounts and private details stay private.',
        'Explore the portrait',
        'portrait',
      );
    if (!p.l2.personality.name)
      return ai(
        'Let’s start with your perspective.',
        'Your transactions show what you do with money. Three questions can help us understand how you approach it.',
        'Answer three questions',
        'quiz',
      );
    return ai(
      p.ui.confirmed ? 'Your perspective shapes this picture' : 'Does this still sound like you?',
      p.ui.confirmed
        ? 'Your portrait includes your feedback. You can revisit it whenever your priorities change.'
        : 'Review your money personality and tell us what fits or what has changed.',
      'Review your portrait',
      'portrait',
    );
  }
  if (['HSBC Status', 'Your membership choices'].includes(context.title)) {
    const m = membershipModel(p);
    return ai(
      'Your membership, around you',
      m.index === 2
        ? `Your ${cash(m.trb, true)} relationship balance qualifies for Elite. You can choose access that matters to you, or explore a family planning conversation with ${p.l1.customer.rmId === 'priya' ? 'Priya' : 'a specialist'}. What would be useful?`
        : `Your relationship balance is ${cash(m.trb, true)}. ${cash(m.remaining, true)} remains to ${m.next.name}. We can explore the access it offers alongside your own priorities. There is no need to change a plan just to reach a tier. What would you like to understand?`,
    );
  }
  if (context.title === 'Money check-in') {
    const entry = feelingModel(p).entry;
    const feeling = feelings.find((f) => f.id === entry?.feeling);
    return ai(
      'Your money check-in',
      feeling
        ? `You said money feels ${feeling.label.toLowerCase()} today.${entry.reflection ? ' You chose “' + entry.reflection.answer + '”.' : ''}${entry.note ? ' You added: “' + entry.note + '”.' : ''}${entry.reasons.length ? ' You mentioned ' + entry.reasons.join(', ').toLowerCase() + '.' : ''} ${entry.reflection ? reflectionFollowup(entry) : ['worried', 'stretched'].includes(feeling.id) ? 'What would help most right now?' : 'Would you like to explore what is contributing to that feeling?'}`
        : 'Choose the feeling that fits today. Adding context is optional, and this check-in is not shared with your household.',
    );
  }
  if (context.surface === 'journey' && context.title === 'Getting to know you') {
    const q = context.question ? { q: context.question } : null;
    return ai(
      'Getting to know you',
      q
        ? 'You’re on question ' +
            (context.step + 1) +
            ': “' +
            q.q +
            '” There’s no right or wrong answer. Choose what feels closest to you; this quiz is a starting point, not a fixed label.'
        : 'Your answers have been saved. You can review your money personality and change anything that doesn’t feel right.',
    );
  }
  if (k === 'priya') return human();
  if (k === 'chat') {
    const last = p.ui.chat.at(-1),
      name = p.l1.customer.id === 'elena' ? 'Priya' : 'Maya';
    return last?.role === 'human'
      ? {
          ...ai(
            'You’re talking with ' + name,
            'Your plans and this conversation are here together.',
            'Continue conversation',
            'support:continue',
          ),
          source: 'human',
          author: name + ' · ' + (name === 'Priya' ? 'Relationship Manager' : 'Financial expert'),
        }
      : ai(
          'Let’s work through it',
          'Ask about what you were exploring, or bring a person into the conversation.',
          'Continue conversation',
          'support:continue',
        );
  }
  if (k === 'pot') {
    const pot = p.l1.pots.find((x) => x.id === context.id);
    if (pot) {
      const c = containerModel(p, pot);
      if (c.arrangement.recovery?.failed) {
        const r = c.arrangement.recovery;
        return ai(
          r.restored
            ? 'Your cashback is back'
            : r.ready
              ? 'Ready for next month'
              : 'Let’s work through this together',
          r.restored
            ? 'You met September’s conditions. Your 1% cashback is back.'
            : cash(r.before) +
                ' of the ' +
                cash(r.required) +
                ' August contribution arrived, so cashback is 0% this month. Your earlier cashback is safe. ' +
                r.summary,
          'See your options',
          'agreement-recovery:' + pot.id,
        );
      }
      return ai(
        pot.name,
        cash(c.amount) +
          (c.debt
            ? ' left to repay. '
            : c.type === 'investment'
              ? ' invested. Values can rise or fall. '
              : c.type === 'budget'
                ? ' left to spend. '
                : ' saved. ') +
          c.arrangement.summary,
        'Discuss this pot',
        'pot-chat:' + pot.id,
      );
    }
  }
  if (k === 'account') {
    const a = p.l1.accounts.find((x) => x.id === context.id);
    if (a)
      return ai(
        a.owed != null ? 'Your borrowing, explained' : 'Your everyday money',
        a.name +
          (a.owed != null
            ? ' has ' + cash(a.owed, true) + ' to repay.'
            : ' holds ' + cash(a.balance, true) + '.') +
          ' Open the activity below to follow the money.',
        'Discuss this account',
        'account-chat:' + a.id,
      );
  }
  if (k === 'module') {
    const m = moduleModel(p, context.id, catalogue);
    if (m.containerId) {
      const x = moneyContainer(p, m.containerId);
      return contextualSupportModel(
        p,
        s,
        { kind: p.l1.accounts.includes(x) ? 'account' : 'pot', id: x.id },
        catalogue,
      );
    }
    if (m.potId) return contextualSupportModel(p, s, { kind: 'pot', id: m.potId }, catalogue);
    if (context.id === 'grocery') {
      const pot = p.l1.pots.find((x) => x.spendingCategory === 'groceries');
      return ai(
        'Spending and setting aside',
        m.value +
          ' spent on groceries this month across your accounts and pots. ' +
          (pot
            ? cash(pot.balance, true) + ' is still available in ' + pot.name + '.'
            : 'A grocery budget pot can help you set an allowance before you spend, with cashback on eligible purchases.'),
        pot ? 'Open your grocery pot' : 'Explore a grocery pot',
        pot ? 'pot:' + pot.id : 'grocery-pot-intro',
      );
    }
    const lines = {
      balance: [
        'Make room for what’s next',
        'Your balance includes money you may need for bills. Check what is set aside before moving it.',
      ],
      safespend: [
        'After the commitments',
        safeAmount(p) === null
          ? 'There is not enough information to calculate a spendable amount yet.'
          : cash(safeAmount(p), true) +
            ' remains after the commitments recorded in this snapshot. Open the number to check the working.',
      ],
      afterbills: [
        'Room after your bills',
        'Check the commitments behind this number before deciding what to move.',
      ],
      creditscore: [
        'A soft check, on your terms',
        p.l1.credit.score
          ? 'Checking this score does not affect it. It is one part of your financial picture.'
          : 'There is no credit score in this snapshot yet. We’ll keep that clear instead of guessing.',
      ],
      grocery: [
        'A closer look at groceries',
        'This is spending so far this month. Review the transactions before deciding whether a change feels realistic.',
      ],
      subs: [
        'Small payments, together',
        'Recurring payments add up. Check which ones still earn their place before changing a plan.',
      ],
      dd: [
        'Your regular commitments',
        'Check the names and amounts behind your Direct Debits before deciding what is free to use.',
      ],
      goldenratio: [
        'An idea to talk through',
        'This illustration keeps your emergency fund separate. Explore the assumptions with a financial expert before agreeing to invest.',
      ],
      investments: [
        'Keep the long view',
        'The 5% growth used in Future is illustrative. Values can fall as well as rise.',
      ],
      spent: [
        'Your spending so far',
        `${m.value} is recorded this month. The breakdown shows where it went; transfers between your own accounts aren’t spending.`,
      ],
      whereitgoes: [
        'See what shapes your spending',
        `${m.value} is recorded this month. Start with the categories that matter to you, rather than a target for every purchase.`,
      ],
      rateswatch: [
        'Your rates, in view',
        'Compare the rates shown here with the terms of each account. A rate change does not move your money automatically.',
      ],
      ratio: [
        'An allocation, not a guarantee',
        'This floor is part of your investment plan. It is not a guaranteed balance or protection against investment losses.',
      ],
      freedom: [
        'Borrowing, in one place',
        'There is no loan Pot in this snapshot. A repayment date appears when there is a loan and a repayment plan to project.',
      ],
      cashback: [
        'A benefit of your account',
        'Cashback and HSBC Points are different. Points recognise healthy habits; they are not earned by spending.',
      ],
    };
    if (context.id === 'activity')
      return contextualSupportModel(p, s, { kind: 'activity' }, catalogue);
    if (context.id === 'points')
      return contextualSupportModel(p, s, { kind: 'rewards' }, catalogue);
    const line = lines[context.id] || [
      m.title,
      `${m.value}${m.note ? ' · ' + m.note : ''}. The detail below shows what is included in this snapshot.`,
    ];
    return ai(line[0], line[1], 'Explore ' + m.title, m.action || 'module:' + context.id);
  }
  if (k === 'story') {
    const story = storyModel(p, context.id);
    if (story) {
      const step = context.step || 0;
      return ai(
        story.title +
          (step === 1 ? ' · the working' : step === 2 ? ' · your choice' : ' · an idea to explore'),
        `You’re looking at “${story.title}” — ${['the idea', 'the working', 'your choice'][step]}. ` +
          (step === 1
            ? story.rows.map((r) => `${r.label}: ${r.value}`).join('; ') +
              '. These figures belong to this scenario snapshot. What would you like to understand?'
            : step === 2
              ? story.verb + ' We can explore the details before you agree to a change.'
              : story.aiLine + ' What would you like to talk through?'),
        step < 2 ? 'See ' + (step === 0 ? 'the working' : 'your choices') : 'Talk it through',
        step < 2 ? 'story-step:' + (step + 1) : 'support:discuss',
      );
    }
  }
  if (k === 'idea') {
    const idea = p.l2.whatIfs.find((x) => x.id === context.id);
    if (idea)
      return ai(
        'Exploring: ' + idea.title,
        idea.canCommit
          ? 'This is a possibility until you agree. Check the monthly amount, starting money and assumptions in the review.'
          : 'This idea is an illustration only. You can compare its effect, but it cannot be agreed as a change here.',
      );
  }
  if (k === 'activity')
    return ai(
      'Every change leaves a record',
      p.ui.receipts.length
        ? 'Your latest change is recorded here: ' +
            p.ui.receipts.at(-1).title +
            '. You can undo your latest change.'
        : 'Follow the recorded transactions and any changes you make in this demonstration.',
      'Open activity',
      'receipts',
    );
  if (k === 'quick-actions' || context.title === 'Quick actions')
    return ai(
      'Your everyday, a little easier',
      'Keep your most-used actions here. Open More to find everything else or choose your shortcuts.',
      'Choose your shortcuts',
      'quick-more',
    );
  if (k === 'collection' || ['Pots & accounts', 'Accounts & pots'].includes(context.title)) {
    const linked = connectedAccounts(p);
    return linked.length
      ? ai(
          'Your picture is coming together',
          'Your connected sample accounts add ' +
            cash(collectionFigures(p).outside, true) +
            ' to the money I can see. We can explore this fuller picture together.',
          'Explore my complete picture',
          'connected-insight',
        )
      : ai(
          'Your other banks belong here too',
          'Connect accounts you hold elsewhere so I can see more of your finances and offer more useful insights and support. You choose what to share.',
          'Connect another bank',
          'connect-bank',
        );
  }
  if (['Connect another bank', 'Choose what to share'].includes(context.title))
    return ai(
      'A fuller picture, on your terms',
      'Choose a bank, then the accounts to share. This demonstration adds read-only sample balances and account details. You can remove the connection later.',
    );
  if (k === 'products' || (k === 'dialog' && context.title === 'Products and services'))
    return ai(
      'Room for your next chapter',
      'Explore accounts, saving, borrowing and protection. We can talk through what matters to you before you choose.',
    );
  if (k === 'stories')
    return ai(
      'A useful next step',
      'These stories explain the working behind your numbers. Open one to explore an idea before changing anything.',
      'Explore a story',
      'story:' + p.l2.stories[0].id,
    );
  if (k === 'ideas')
    return ai(
      'Try it before you decide',
      p.ui.preview.length
        ? 'Your selected possibilities change the projection only. Review each amount before agreeing.'
        : 'What Ifs let you explore a different future. Trying one leaves your accounts untouched.',
      p.ui.preview.length ? 'Review possibilities' : 'Make your own plan',
      p.ui.preview.length ? 'preview-summary' : 'newplan',
    );
  if (k === 'rules')
    return ai(
      p.l1.autonomy.paused ? 'Your rules are paused' : 'The engine of your plans',
      p.l1.autonomy.paused
        ? 'Your money stays where it is. Restore your previously agreed permissions whenever you are ready.'
        : cash(totals(p).speed) +
            ' a month is modelled from your agreed rules. Check conditions and finishing dates before changing an amount.',
      'Review your rules',
      'rules',
    );
  if (k === 'beliefs')
    return ai(
      'You have the final word',
      'A belief is a starting point, not a label. Confirm what fits, or correct it in your own words.',
    );
  if (k === 'personality') {
    const member = p.l1.household.members.find((x) => x.id === s.member),
      name = s.member === 'household' ? 'Your household' : member?.name || 'Your money personality';
    return ai(
      name + ' · your perspective',
      s.member === 'self'
        ? 'This picture can change as you do. Confirm what fits, or tell us what we have missed.'
        : 'This view is shared by consent. Individual accounts and private money stay private.',
    );
  }
  if (k === 'rewards')
    return ai(
      'Consistency adds up',
      p.l1.rewards.points.balance +
        ' HSBC Points recognise openness and healthy habits. Explore what is available before using them.',
      'Explore rewards',
      'points',
    );
  if (k === 'customise')
    return ai(
      'Make this page yours',
      'Choose the numbers that matter, resize them or change their order. Your underlying accounts stay the same.',
      'Choose a number',
      'gallery',
    );
  if (k === 'future')
    return { ...aiMessage(p, 'future', s.month), source: 'ai', author: 'HSBC AI' };
  if (k === 'audio')
    return ai(
      'Your money, in a minute',
      'Your house deposit has ' +
        cash(p.l1.pots.find((x) => x.id === 'house')?.balance || 0) +
        ', with ' +
        cash(p.l1.pots.find((x) => x.id === 'ef')?.balance || 0) +
        ' kept separately in your emergency fund. What would you like to explore?',
      'Open audio recap',
      'support:listen',
    );
  if (k === 'dialog') {
    const title = context.title || 'Your next step';
    const copy = /review.*plan|possibilities|what if/i.test(title)
      ? 'Check the amount and the assumptions. Exploring an idea does not move money; only your confirmation changes this demonstration.'
      : /transfer|payment|money/i.test(title)
        ? 'Check the source, destination and amount. You will review the details before confirming.'
        : /priya|another time/i.test(title)
          ? 'Choose a time that works for you. Priya’s original note is kept separate from this AI guidance.'
          : /getting to know|view comes first/i.test(title)
            ? 'Your answers belong to you. You can change this picture as you go.'
            : /numbers|number/i.test(title)
              ? 'Choose a number and a size, then add it to Now. The value stays consistent in every size.'
              : 'Ask about ' + title.toLowerCase() + ', or request help from an adviser.';
    return ai(title, copy);
  }
  const recoveryPot = p.l1.pots.find((x) => x.personalOffer?.recovery);
  if (recoveryPot && s.tab === 'now' && k === 'top')
    return contextualSupportModel(p, s, { kind: 'pot', id: recoveryPot.id }, catalogue);
  if (p.l1.customer.id === 'elena' && s.tab === 'now' && !p.ui.receipts.length) return human();
  if (p.l1.customer.id === 'sam' && s.tab === 'now' && !p.ui.receipts.length)
    return contextualSupportModel(p, s, { kind: 'audio' }, catalogue);
  return { ...aiMessage(p, s.tab, s.month), source: 'ai', author: 'HSBC AI' };
}

// Now adds an observation or decision, rather than repeating the screen headline.
function contextualSupportModel(p, s, context = { kind: 'top' }, catalogue) {
  const m = baseSupportModel(p, s, context, catalogue);
  if (
    s.tab !== 'now' ||
    m.source === 'human' ||
    context.surface === 'journey' ||
    ['story', 'chat', 'dialog'].includes(context.kind)
  )
    return m;
  if (m.action?.startsWith('agreement-recovery:')) {
    const item = moneyContainer(p, m.action.split(':')[1]);
    const r = item && containerModel(p, item).arrangement.recovery;
    if (r?.failed && !r.restored && !r.ready)
      return {
        ...m,
        title: item.name + ' needs attention',
        message:
          'Cashback is 0% this month after August’s contribution fell short. ' +
          r.summary +
          ' Earlier cashback stays yours.',
        attentionKey: 'benefit:' + item.id + ':' + r.changedOn,
      };
    return m;
  }
  const key = context.kind === 'module' ? context.id : null;
  const insights = {
    safespend: [
      'What’s already set aside',
      'Bills and commitments are deducted before this amount is available. Check the breakdown before moving money.',
    ],
    afterbills: [
      'What’s already set aside',
      'Bills and commitments are deducted before this amount is available.',
    ],
    cardusage: [
      'Your credit limit, in context',
      'This shows the share of your limit already used. Repayments reduce the balance; the limit stays the same.',
    ],
    eatingout: [
      'Follow the spending pattern',
      'The line adds up recorded eating-out purchases. The payment list shows what contributed.',
    ],
    safetydays: [
      'Your cushion, measured in time',
      'This compares your emergency fund with essential monthly bills. It excludes discretionary spending.',
    ],
    groceryrhythm: [
      'A habit you’ve kept',
      'Each mark is a completed month within your grocery line. This month is still in progress.',
    ],
    wealth: [
      'What the total includes',
      'Money held and money owed are shown separately. The breakdown shows what is available now and what is saved or invested.',
    ],
    investments: [
      'Where your investments sit',
      'The breakdown shows where your money is invested. Values can fall as well as rise.',
    ],
  };
  if (key && insights[key]) {
    if (['safespend', 'afterbills'].includes(key) && safeAmount(p) === null) return m;
    const [title, message] = insights[key];
    return { ...m, title, message };
  }
  if (['pot', 'account', 'module'].includes(context.kind)) {
    const model = key ? moduleModel(p, key, catalogue) : null;
    const id = model?.containerId || (context.kind !== 'module' ? context.id : null);
    const item = id && moneyContainer(p, id);
    if (item) {
      const c = containerModel(p, item),
        due = c.arrangement.conditions.find((x) => x.kind === 'payment' && x.remaining > 0),
        locked = c.arrangement.conditions.find((x) => x.status === 'Locked');
      if (due)
        return {
          ...m,
          essential: true,
          title: due.scheduled ? 'Your next payment is planned' : 'A payment to keep in view',
          message:
            due.description +
            ' ' +
            (due.scheduled
              ? 'Your rule is scheduled; the condition is met when the money arrives.'
              : 'You can pay manually or set up a rule.'),
        };
      if (locked)
        return {
          ...m,
          essential: true,
          title: 'Your commitment keeps this rate',
          message: locked.description,
        };
      if (c.type === 'budget')
        return {
          ...m,
          title: 'Your allowance and your balance',
          message:
            'The budget tracks what you spend this month. Your available balance is the money already in this pot.',
        };
      if (c.debt)
        return {
          ...m,
          essential: true,
          title: 'Stay on top of repayments',
          message:
            'Your agreement shows the payment conditions and interest rate. You can pay manually or use an automated rule.',
        };
      if (c.type === 'current' && safeAmount(p) !== null)
        return {
          ...m,
          title: 'Your balance includes commitments',
          message:
            'Some of this balance is set aside for bills and plans. Safe to spend shows the estimate after those commitments.',
          cta: 'See Safe to spend',
          action: 'module:safespend',
        };
      if (c.target && c.amount >= c.target)
        return {
          ...m,
          title: 'Your goal is funded',
          message:
            'You’ve reached your ' +
            cash(c.target) +
            ' ' +
            item.name +
            ' goal. Review any continuing contributions before redirecting them.',
          cta: 'Review contributions',
          action: 'container-how:' + item.id,
        };
      if (c.target)
        return {
          ...m,
          title: 'Keep your goal in view',
          message:
            cash(Math.max(0, c.target - c.amount)) +
            ' to reach your ' +
            cash(c.target) +
            ' ' +
            item.name +
            ' goal.' +
            (c.running.length
              ? ' Your active rules help you build towards it.'
              : ' You can add money manually or set up a regular contribution.'),
        };
      if (c.type === 'investment')
        return {
          ...m,
          title: 'Check the terms behind your benefit',
          message:
            'Your agreement shows any capital conditions and fees. Investment values can fall as well as rise.',
        };
    }
  }
  return m;
}

export function supportModel(p, s, context = { kind: 'top' }, catalogue) {
  const model =
    context.kind === 'companion' || context.title === 'Your AI Companion'
      ? {
          source: 'ai',
          author: 'HSBC AI',
          title: 'A style that works for you',
          message:
            'Your portrait suggests a starting point. Compare the styles and choose how you would like to be supported.',
          cta: 'Shape your Companion',
          action: 'companion-settings',
        }
      : contextualSupportModel(p, s, context, catalogue);
  return personaliseSupport(p, s, context, model, catalogue);
}
