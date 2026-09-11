import { canCheckin, completeDaily } from '../checkin/daily.mjs';
import { checkinEntry } from '../checkin/views.mjs';
import { reflectionPrompt } from '../you/feeling-reflection.mjs';
import { replaceRegion } from '../../design-system/Markup.tsx';
import { feelingFlow } from '../you/feeling-view.mjs';
import { feelingModel, feelingReasons, feelings, saveFeeling } from '../you/feelings.mjs';
const drafts = new WeakMap();
export function handle(ctx, type, id, p) {
  const open = (stage) => {
    const draft = drafts.get(p);
    const changed = draft.stage !== stage;
    const scroll = document.querySelector('.sheet-body')?.scrollTop || 0;
    draft.stage = stage;
    ctx.openJourney('Money check-in', feelingFlow(p, draft, stage), {
      help: false,
      backAction:
        stage === 'context'
          ? 'feeling-back'
          : stage === 'reflect'
            ? 'feeling-context'
            : 'checkin-home',
    });
    const body = document.querySelector('.sheet-body');
    if (body) body.scrollTop = changed ? 0 : scroll;
    if (changed && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelector('.calm-inner')?.animate(
        [
          { opacity: 0, transform: 'translateY(10px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 440, easing: 'cubic-bezier(.2,.65,.2,1)' },
      );
    }
  };
  const save = () => {
    if (!canCheckin(p, 'feeling')) return;
    const draft = drafts.get(p);
    saveFeeling(p, draft);
    draft.reward = completeDaily(p, 'feeling', 'feeling-' + p.l1.asOf).awardedNow;
    replaceRegion(document.querySelector('.checkin-entry'), checkinEntry(p));
  };
  const rememberNote = () => {
    const field = document.querySelector('#feeling-note');
    if (field) drafts.get(p).note = field.value;
  };
  if (type === 'feeling') {
    if (!canCheckin(p, 'feeling')) return ctx.act('checkin-home');
    const entry = feelingModel(p).entry;
    drafts.set(p, entry ? structuredClone(entry) : { feeling: null, reasons: [], note: '' });
    return open(entry ? 'saved' : 'choose');
  }
  const draft = drafts.get(p);
  if (!draft) return ctx.act('feeling');
  if (type === 'feeling-select') {
    if (!feelings.some((f) => f.id === id)) return;
    if (draft.feeling !== id) {
      delete draft.reflection;
      draft.note = '';
    }
    draft.feeling = id;
    open('choose');
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelector('.feeling-hero')?.animate(
        [
          { opacity: 0.4, transform: 'scale(.94)' },
          { opacity: 1, transform: 'scale(1)' },
        ],
        { duration: 400, easing: 'cubic-bezier(.2,.65,.2,1)' },
      );
    }
    return document
      .querySelector(`[data-action="feeling-select:${id}"]`)
      ?.focus({ preventScroll: true });
  }
  if (type === 'feeling-next') {
    if (draft.feeling) return open('context');
    return;
  }
  if (type === 'feeling-back' || type === 'feeling-edit') {
    rememberNote();
    return open('choose');
  }
  if (type === 'feeling-context') {
    rememberNote();
    return open('context');
  }
  if (type === 'feeling-reflect') return open('reflect');
  if (type === 'feeling-answer') {
    rememberNote();
    const prompt = reflectionPrompt(draft);
    const answer = [...prompt.choices, 'In my own words'][Number(id)];
    if (!answer) return;
    draft.reflection = { key: prompt.key, question: prompt.question, answer };
    open('reflect');
    return document
      .querySelector(`[data-action="feeling-answer:${id}"]`)
      ?.focus({ preventScroll: true });
  }
  if (type === 'feeling-chat') {
    rememberNote();
    save();
    open('saved');
    return ctx.act('support:discuss');
  }
  if (type === 'feeling-reason') {
    const reason = feelingReasons[Number(id)];
    if (!reason) return;
    rememberNote();
    draft.reasons = draft.reasons.includes(reason)
      ? draft.reasons.filter((x) => x !== reason)
      : [...draft.reasons, reason];
    delete draft.reflection;
    draft.note = '';
    open('context');
    return document
      .querySelector(`[data-action="feeling-reason:${id}"]`)
      ?.focus({ preventScroll: true });
  }
  if (type === 'feeling-save') {
    rememberNote();
    save();
    return open('saved');
  }
  if (type === 'feeling-done') {
    return ctx.act('checkin-done');
  }
}
