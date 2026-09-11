import { canCheckin, dailyCheckin } from '../checkin/daily.mjs';
import { feelingHistory } from '../you/feelings.mjs';
import { toolReflection, toolFollowup } from '../checkin/reflection.mjs';
import { replaceRegion } from '../../design-system/Markup.tsx';
import {
  checkinEntry,
  toolkitHome,
  toolFlow,
  reflectionLibrary,
  savedReflection,
} from '../checkin/views.mjs';
import {
  instincts,
  reviewCards,
  reflectionItems,
  reflectionAnswers,
  reflectionReasons,
  horizons,
  futures,
  saveCheckin,
  resultFor,
} from '../checkin/model.mjs';
const drafts = new WeakMap();
const backStage = (d) =>
  d.stage === 'review'
    ? d.tool === 'instinct'
      ? 'deck'
      : d.tool === 'worth'
        ? 'reason'
        : 'detail'
    : d.tool === 'instinct'
      ? 'intro'
      : d.tool === 'worth'
        ? d.stage === 'reason'
          ? 'verdict'
          : 'choose'
        : d.stage === 'detail'
          ? 'future'
          : 'horizon';
export function handle(ctx, type, id, p) {
  const open = (body, back = 'checkin-home', animate = false) => {
    ctx.openJourney('Money check-in', body, { help: false, backAction: back });
    const el = document.querySelector('.sheet-body');
    if (el) el.scrollTop = 0;
    if (animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      document.querySelector('.calm-inner')?.animate(
        [
          { opacity: 0.25, transform: 'translateY(8px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' },
      );
  };
  const refreshEntry = () =>
    replaceRegion(document.querySelector('.checkin-entry'), checkinEntry(p));
  if (type === 'checkin-done') {
    ctx.closeModal();
    return ctx.render();
  }
  if (type === 'checkin' || type === 'checkin-home') {
    drafts.delete(p);
    refreshEntry();
    return open(toolkitHome(p), 'close');
  }
  if (type === 'checkin-library') return open(reflectionLibrary(p, id || 'all'));
  if (type === 'checkin-saved') return open(savedReflection(p, id), 'checkin-library');
  if (type === 'checkin-update') {
    if (id?.startsWith('feeling-')) p.ui.moneyFeelings = structuredClone(feelingHistory(p));
    const record = id?.startsWith('feeling-')
      ? p.ui.moneyFeelings.find((r) => 'feeling-' + r.date === id)
      : (p.ui.checkins || []).find((r) => r.id === id);
    if (!record) return;
    const text = document.querySelector('#checkin-insight')?.value.trim().slice(0, 1200);
    if (!text) throw new Error('Keep a few words for your reflection.');
    record.insight = text;
    record.remember = Boolean(document.querySelector('#checkin-remember')?.checked);
    return open(reflectionLibrary(p), 'checkin-home');
  }
  if (type === 'checkin-delete') {
    if (id?.startsWith('feeling-'))
      p.ui.moneyFeelings = feelingHistory(p).filter((r) => 'feeling-' + r.date !== id);
    else p.ui.checkins = (p.ui.checkins || []).filter((r) => r.id !== id);
    refreshEntry();
    return open(reflectionLibrary(p), 'checkin-home');
  }
  if (type === 'checkin-tool') {
    if (!['instinct', 'worth', 'ahead'].includes(id)) return;
    if (dailyCheckin(p)) return open(toolkitHome(p), 'close');
    drafts.set(p, {
      tool: id,
      stage: id === 'instinct' ? 'intro' : id === 'worth' ? 'choose' : 'horizon',
      index: 0,
      answers: [],
      corrections: {},
      reasons: [],
      note: '',
      remember: false,
    });
  }
  const d = drafts.get(p);
  if (!d) return ctx.act('checkin');
  if (d.savedId && !['checkin-back'].includes(type)) return open(toolFlow(p, d), 'checkin-home');
  const read = () => {
    const note = document.querySelector('#checkin-note');
    if (note) d.note = note.value.trim().slice(0, 500);
    const insight = document.querySelector('#checkin-insight');
    if (insight) d.insight = insight.value.trim().slice(0, 1200);
    const remember = document.querySelector('#checkin-remember');
    if (remember) d.remember = remember.checked;
  };
  const render = (animate = false) =>
    open(
      toolFlow(p, d),
      ['intro', 'choose', 'horizon', 'saved', 'result'].includes(d.stage)
        ? 'checkin-home'
        : d.stage === 'deck'
          ? d.index
            ? 'checkin-undo'
            : 'checkin-back'
          : 'checkin-back',
      animate,
    );
  if (type === 'checkin-back') {
    read();
    if (d.stage === 'reflect') {
      d.stage = d.reflectReturn;
      return render();
    }
    if (d.stage === 'correct') d.stage = 'deck';
    else {
      if (d.stage === 'review' && d.tool === 'instinct') d.index = Math.max(0, d.cards.length - 1);
      d.stage = backStage(d);
    }
    return render();
  }
  if (type === 'checkin-mode') {
    d.mode = id === 'review' ? 'review' : 'discover';
    d.cards = d.mode === 'review' ? reviewCards(p) : instincts;
    d.answers = [];
    d.corrections = {};
    d.index = 0;
    d.note = '';
    d.stage = 'deck';
    delete d.insight;
    if (!d.cards.length) return;
    return render(true);
  }
  if (type === 'checkin-undo') {
    d.index = Math.max(0, d.index - 1);
    d.stage = 'deck';
    d.answers = d.answers.slice(0, d.index);
    delete d.insight;
    return render();
  }
  const answer = (value) => {
    d.answers[d.index] = value;
    d.answers = d.answers.slice(0, d.index + 1);
    delete d.insight;
    if (d.index + 1 === d.cards.length) d.stage = 'review';
    else d.index++;
    return render(true);
  };
  if (type === 'checkin-answer') {
    if (!['yes', 'no', 'depends', 'skip'].includes(id) || d.stage !== 'deck') return;
    if (d.mode === 'review' && id === 'no') {
      d.stage = 'correct';
      return render(true);
    }
    return answer(id);
  }
  if (type === 'checkin-correct') {
    d.corrections[d.index] =
      document.querySelector('#checkin-note')?.value.trim().slice(0, 500) || '';
    d.stage = 'deck';
    return answer('no');
  }
  if (type === 'checkin-purchase') {
    const item = reflectionItems(p).find((x) => x.id === id);
    if (!item) return;
    d.reflectionKind = item.kind;
    delete d.reflection;
    delete d.reflectionFocus;
    d.purchase = id;
    d.verdict = null;
    d.reasons = [];
    d.note = '';
    delete d.insight;
    d.stage = 'verdict';
    return render(true);
  }
  if (type === 'checkin-verdict') {
    if (!reflectionAnswers(d.reflectionKind)[Number(id)]) return;
    d.verdict = reflectionAnswers(d.reflectionKind)[Number(id)];
    delete d.insight;
    d.stage = 'reason';
    return render(true);
  }
  if (type === 'checkin-reason') {
    read();
    const reason = reflectionReasons(d.reflectionKind)[Number(id)];
    if (!reason) return;
    d.reasons = d.reasons.includes(reason)
      ? d.reasons.filter((r) => r !== reason)
      : [...d.reasons, reason];
    delete d.insight;
    delete d.reflection;
    delete d.reflectionFocus;
    render();
    return document
      .querySelector(`[data-action="checkin-reason:${id}"]`)
      ?.focus({ preventScroll: true });
  }
  if (type === 'checkin-horizon') {
    if (!horizons[Number(id)]) return;
    d.horizon = horizons[Number(id)];
    delete d.insight;
    d.stage = 'future';
    return render(true);
  }
  if (type === 'checkin-future') {
    if (!futures.some((x) => x.id === id)) return;
    if (d.future !== id) d.note = '';
    d.future = id;
    delete d.insight;
    d.stage = 'detail';
    return render(true);
  }
  if (type === 'checkin-reflect') {
    read();
    d.reflectReturn = d.stage;
    d.stage = 'reflect';
    return render(true);
  }
  if (type === 'checkin-reflection-answer') {
    read();
    const prompt = toolReflection(d),
      answer = [...prompt.choices, 'In my own words'][Number(id)];
    if (!answer) return;
    if (prompt.focus && answer !== 'In my own words') {
      d.reflectionFocus = answer;
      delete d.reflection;
    } else d.reflection = { key: prompt.key, question: prompt.question, answer };
    return render(true);
  }
  if (type === 'checkin-chat') {
    read();
    const prompt = toolReflection(d);
    p.ui.chat.push({
      role: 'ai',
      text: `${prompt.question}${d.reflection ? ' You chose “' + d.reflection.answer + '”.' : ''}${d.note ? ' You added: “' + d.note + '”.' : ''} ${toolFollowup(d) || 'We can take a moment to explore this, at your pace.'}`,
    });
    return ctx.openChat();
  }
  if (type === 'checkin-result' || type === 'checkin-save') {
    read();
    if (!canCheckin(p, d.tool)) return ctx.act('checkin-home');
    if (!resultFor(p, d)?.text) {
      d.stage = 'result';
      return render(true);
    }
    saveCheckin(p, d, undefined, false);
    d.stage = 'saved';
    refreshEntry();
    return render(true);
  }
  return render(true);
}
// Swipe and keyboard alternatives belong to the card only; vertical scrolling stays native.
export function installCheckinGestures(dispatch) {
  let drag = null;
  document.addEventListener('pointerdown', (e) => {
    const node = e.target instanceof Element ? e.target.closest('[data-checkin-swipe]') : null;
    if (!node || (e.pointerType === 'mouse' && e.button !== 0)) return;
    window.getSelection()?.removeAllRanges();
    drag = { node, id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0 };
    node.setPointerCapture?.(e.pointerId);
  });
  document.addEventListener('selectstart', (e) => {
    if (e.target instanceof Element && e.target.closest('[data-checkin-swipe]')) e.preventDefault();
  });
  document.addEventListener('dragstart', (e) => {
    if (e.target instanceof Element && e.target.closest('[data-checkin-swipe]')) e.preventDefault();
  });
  document.addEventListener('pointermove', (e) => {
    if (!drag || drag.id !== e.pointerId) return;
    drag.dx = e.clientX - drag.x;
    if (Math.abs(e.clientY - drag.y) > 55 && Math.abs(drag.dx) < 55) {
      drag.node.style.transform = '';
      drag = null;
      return;
    }
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      drag.node.style.transform = `translateX(${Math.max(-85, Math.min(85, drag.dx))}px) rotate(${drag.dx / 30}deg)`;
  });
  const end = (e, cancel = false) => {
    if (!drag || drag.id !== e.pointerId) return;
    const d = drag;
    drag = null;
    d.node.style.transform = '';
    if (!cancel && Math.abs(d.dx) > 60) dispatch('checkin-answer:' + (d.dx > 0 ? 'yes' : 'no'));
  };
  document.addEventListener('pointerup', (e) => end(e));
  document.addEventListener('pointercancel', (e) => end(e, true));
  document.addEventListener('keydown', (e) => {
    if (!(e.target instanceof Element) || !e.target.matches('[data-checkin-swipe]')) return;
    if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault();
      dispatch('checkin-answer:' + (e.key === 'ArrowRight' ? 'yes' : 'no'));
    }
  });
}
