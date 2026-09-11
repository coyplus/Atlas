import { futures } from './model.mjs';
const reasonPrompts = {
  Connection: [
    'What did that moment with someone give you?',
    ['A sense of closeness', 'Time together', 'Feeling supported'],
  ],
  'Time back': [
    'What did having that time back make room for?',
    ['Rest', 'People I care about', 'Something I needed to do'],
  ],
  Comfort: [
    'What kind of comfort did you need in that moment?',
    ['A familiar routine', 'A little relief', 'A feeling of being cared for'],
  ],
  'Something practical': [
    'What did it help you take care of?',
    ['An everyday need', 'Someone I care about', 'One less thing on my mind'],
  ],
  Enjoyment: [
    'What stayed with you after the moment had passed?',
    ['A good memory', 'Feeling more like myself', 'Less than I expected'],
  ],
  Habit: [
    'How did this familiar choice feel this time?',
    ['Still right for me', 'Mostly automatic', 'Ready to try something different'],
  ],
};
export function toolReflection(d) {
  if (d.tool === 'worth') {
    const reasons = d.reasons || [];
    if (d.reflectionKind === 'goal' || d.reflectionKind === 'credit') {
      const goal = d.reflectionKind === 'goal';
      return {
        key: d.reflectionKind + ':' + d.verdict + ':' + reasons.join('|'),
        question: reasons.length
          ? `${new Intl.ListFormat('en-GB').format(reasons)} ${reasons.length === 1 ? 'is' : 'are'} on your mind. ${goal ? 'What would you like this goal to make room for?' : 'What would help this feel a little clearer?'}`
          : goal
            ? 'What matters most about this goal today?'
            : 'What would help this feel a little clearer?',
        choices: goal
          ? ['More security', 'Time with people I love', 'Room for myself']
          : ['Understanding what I owe', 'A sense of control', 'Less to keep track of'],
      };
    }
    if (reasons.length > 1 && !d.reflectionFocus)
      return {
        key: 'focus:' + reasons.slice().sort().join('|'),
        question:
          new Intl.ListFormat('en-GB').format(reasons) +
          ' have a place in this. Which would you like to explore first?',
        choices: reasons,
        focus: true,
      };
    const reason = d.reflectionFocus || reasons[0];
    const [question, choices] = reasonPrompts[reason] || [
      'What do you want to take from this choice?',
      ['What I valued', 'What I might change', 'Just noticing for now'],
    ];
    return {
      key: 'worth:' + (reason || 'choice') + ':' + d.verdict,
      question:
        d.verdict === 'A little mixed'
          ? 'There’s room for mixed feelings. ' + question
          : d.verdict === 'Would choose differently'
            ? 'With hindsight, ' + question.charAt(0).toLowerCase() + question.slice(1)
            : question,
      choices,
    };
  }
  if (d.tool === 'ahead') {
    const f = futures.find((x) => x.id === d.future);
    return {
      key: 'ahead:' + d.future,
      question: `What would “${f?.title.toLowerCase() || 'this day'}” change about how life feels?`,
      choices: ['More at ease', 'More connected', 'More like myself'],
    };
  }
  return {
    key: 'instinct:' + d.mode,
    question: 'Where do you notice these instincts in everyday life?',
    choices: ['Small daily choices', 'Decisions with other people', 'Thinking about what’s next'],
  };
}
export function toolFollowup(d) {
  const a = d.reflection?.answer;
  if (!a) return '';
  if (a === 'In my own words')
    return 'There’s room for your own way of seeing this. Write only what you want to keep.';
  if (d.tool === 'worth')
    return `“${a}” is part of what this choice meant to you. You can keep that in mind without deciding to change anything today.`;
  if (d.tool === 'ahead')
    return `“${a}” gives your picture a little more meaning. That feeling can be worth coming back to, even before you know the steps.`;
  return `“${a}” gives these preferences some context. They can shift with the situation; you don’t have to fit one fixed description.`;
}
