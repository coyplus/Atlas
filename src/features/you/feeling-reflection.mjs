// Authored AI prompts for the prototype. Reflect selections without diagnosing or inferring causes.
const reasonOrder = [
  'Everyday spending',
  'Bills',
  'Savings',
  'Borrowing',
  'Family',
  'Something else',
];
export const reflectionReasons = (draft) =>
  reasonOrder.filter((reason) => draft.reasons?.includes(reason));
const names = {
  'Everyday spending': 'everyday spending',
  Bills: 'bills',
  Savings: 'saving',
  Borrowing: 'borrowing',
  Family: 'family life',
};

export function reflectionPrompt(draft) {
  const reasons = reflectionReasons(draft);
  const key = `${draft.feeling}:${reasons.join('|') || 'Money'}`;
  const pressure = ['worried', 'stretched'].includes(draft.feeling);
  if (reasons.length > 2 || (reasons.length === 2 && reasons.includes('Something else'))) {
    return {
      key,
      kind: 'focus',
      question: 'Which would you like to explore first?',
      choices: reasons,
    };
  }
  if (reasons.length === 2) {
    const [a, b] = reasons;
    const pair = reasons.join('|');
    const question =
      {
        'Bills|Family': pressure
          ? 'Are family costs making the bills harder to manage, or are these separate concerns?'
          : 'Are bills and family life feeling connected for you, or are they separate?',
        'Everyday spending|Savings': pressure
          ? 'Is everyday spending making it harder to save, or are these separate concerns?'
          : 'Does your everyday spending leave room to save, or are these separate for you?',
        'Savings|Borrowing': pressure
          ? 'Is balancing repayments with saving on your mind, or are these separate concerns?'
          : 'Do saving and repaying borrowing feel connected for you, or are they separate?',
      }[pair] || `Do ${names[a]} and ${names[b]} feel connected for you, or are they separate?`;
    return {
      key,
      kind: 'connection',
      question,
      choices: ['They’re connected', 'Separate concerns', 'Not sure'],
    };
  }
  return { ...singleReasonPrompt(draft.feeling, reasons[0]), key, kind: 'single' };
}
function singleReasonPrompt(feeling, selectedReason) {
  const pressure = ['worried', 'stretched'].includes(feeling);
  const reason = selectedReason || 'Money';
  const topic =
    {
      Bills: pressure
        ? [
            'What feels hardest about the bills right now?',
            ['The amounts', 'The payment dates', 'Not knowing what’s next'],
          ]
        : [
            'What is helping the bills feel manageable?',
            ['Knowing what’s due', 'Having money set aside', 'A regular routine'],
          ],
      Family: pressure
        ? [
            'Which part of family spending is taking the most headspace?',
            ['Unexpected costs', 'Balancing priorities', 'Talking about money'],
          ]
        : [
            'What is helping money feel this way at home?',
            ['A shared plan', 'Everyday costs covered', 'Room for things we enjoy'],
          ],
      Savings: pressure
        ? [
            'What is weighing on you about saving?',
            ['Getting started', 'Keeping it going', 'Needing to dip in'],
          ]
        : [
            'What feels encouraging about your savings?',
            ['A growing cushion', 'A goal getting closer', 'Making it a habit'],
          ],
      Borrowing: pressure
        ? [
            'Which part of borrowing is on your mind?',
            ['Monthly repayments', 'The balance', 'Understanding the costs'],
          ]
        : [
            'What is helping you feel more settled about borrowing?',
            ['A clear repayment plan', 'Seeing the balance fall', 'Knowing the costs'],
          ],
      'Everyday spending': pressure
        ? [
            'What feels hardest about everyday spending?',
            ['Prices adding up', 'Unexpected purchases', 'Knowing what’s left'],
          ]
        : [
            'What is helping with everyday spending?',
            ['A budget that works', 'Knowing what’s left', 'Spending on what matters'],
          ],
    }[reason] ||
    (pressure
      ? [
          'What would feel useful to understand a little better?',
          ['What’s coming up', 'What I can change', 'What matters most'],
        ]
      : [
          'What has contributed most to this feeling?',
          ['Something I did', 'A change in circumstances', 'A plan taking shape'],
        ]);
  // Neutral feelings shouldn't be interpreted as a positive outcome.
  if (feeling === 'okay' && names[reason])
    return {
      question: `What is on your mind about ${names[reason]}?`,
      choices: ['What’s working', 'What feels uncertain', 'Something I want to change'],
    };
  return { question: topic[0], choices: topic[1] };
}
export function reflectionFollowup(draft) {
  const answer = draft.reflection?.answer || '';
  const prompt = reflectionPrompt(draft);
  if (prompt.kind === 'focus' && prompt.choices.includes(answer))
    return singleReasonPrompt(draft.feeling, answer).question;
  if (answer === 'They’re connected')
    return 'Where do you notice that connection most in everyday life?';
  if (answer === 'Separate concerns') return 'Which would you like to look at first?';
  if (answer === 'Not sure')
    return 'Was there a particular moment that brought these things to mind today?';
  if (answer === 'In my own words') return 'Would you like to explore this together?';
  if (draft.feeling === 'okay') return 'Is there anything you would like to understand or change?';
  if (/dates|due|coming up|next/i.test(answer))
    return 'Would seeing upcoming payments together help, or is there one date you want to look at first?';
  if (/talking|shared/i.test(answer))
    return 'What would you want the other person to understand about how this feels for you?';
  if (/unexpected|dip in/i.test(answer))
    return 'Does this feel like a one-off, or something you would like to make more room for?';
  if (
    /amount|price|cost|repayment|balance/i.test(answer) &&
    ['worried', 'stretched'].includes(draft.feeling)
  )
    return 'Is there one amount you would like to look at together, to see what options you have?';
  if (['worried', 'stretched'].includes(draft.feeling))
    return 'What would make this feel a little more manageable over the next week?';
  return 'What would you like to keep doing, so this continues to work for you?';
}
