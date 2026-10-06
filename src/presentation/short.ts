import { slides as narrative } from './narrative';

/* Narrative, shortened for a presentation followed by a live demo. The slides are the
   Narrative ones, unchanged, in the order of the briefing: context, the business case,
   then the behavioural design and system thinking that lead into the demo. The product
   slides are left out because the demo shows each tab live. */
export const look = 'narrative';

const pick = (stage: string) => {
  const slide = narrative.find((s) => s.stage === stage);
  if (!slide) throw new Error(`Narrative slide missing: ${stage}`);
  return slide;
};
// The pillar numbers belong to the full Narrative, which introduces three numbered parts.
const unnumbered = (stage: string) => {
  const slide = pick(stage);
  return { ...slide, content: slide.content.replace(/(<p class="eyebrow">)0\d · /, '$1') };
};

export const slides = [
  pick('Cover'),
  pick('The problem'),
  pick('What customers want'),
  pick('Why a bank should build this'),
  pick('Why it is hard'),
  pick('The behaviour gap'),
  unnumbered('Behavioural science'),
  unnumbered('AI and human support'),
  unnumbered('A loyalty framework'),
  pick('The flywheel'),
  pick('Close'),
];
