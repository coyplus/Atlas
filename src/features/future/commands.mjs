import {
  ensureFuture,
  futureState,
  forecast,
  suggestIdeas,
  toggleExperiment,
  interpretIdea,
  applyExperiments,
  ideaDescription,
} from '../../domain/future.mjs';
import { clone } from '../../domain/money.mjs';
import { esc, button } from '../../design-system/templates.mjs';
import { horizonPossibilities } from '../ideas/horizon.mjs';
import { possibilities, seePossibilities, dismissPossibility } from '../ideas/model.mjs';
import {
  horizonDetail,
  goalsEditor,
  speedDetail,
  assumptions,
  review,
  chatDetail,
  addDetail,
  possibilityDiscovery,
  adjustDetail,
} from './views.mjs';
export function handleFuture(ctx, type, id, p) {
  const f = ensureFuture(p),
    s = ctx.S;
  const show = (title, body) => ctx.openJourney(title, body);
  const refresh = () => ctx.render();
  if (type.startsWith('future-horizon')) {
    const i = horizonPossibilities(p, s).find((x) => x.id === id);
    if (!i) return;
    if (type === 'future-horizon-hide') {
      dismissPossibility(p, id);
      ctx.closeModal();
      refresh();
      return;
    }
    seePossibilities(p, [i]);
    show('Make it mine', horizonDetail(p, i));
    return;
  }
  if (type === 'future-mode') {
    f.mode = id === 'sandbox' ? 'sandbox' : 'view';
    f.drawer = f.mode === 'sandbox' ? 'expanded' : 'timeline';
    refresh();
  } else if (type === 'future-reset') {
    p.ui.future = {
      mode: 'sandbox',
      ideas: [],
      messages: [],
      proposal: null,
      page: 0,
      drawer: 'expanded',
    };
    p.ui.preview = [];
    refresh();
    ctx.futureChart.control('fit');
    ctx.toast('Back to your current path. All experiments cleared.');
  } else if (type === 'future-page') {
    f.page = Number(id);
    ctx.updateFuture();
  } else if (type === 'future-time') {
    s.month = Math.max(0, Math.min(240, Number(id) || 0));
    ctx.updateFuture();
  } else if (type === 'future-goal') {
    if (p.l1.pots.some((pot) => pot.id === id)) return ctx.act('pot:' + id);
    // A Sandbox-only goal has no actual Pot yet. Keep it in the existing plan review.
    return ctx.act('future-review');
  } else if (type === 'future-goals') show('Goals & priorities', goalsEditor(p, s));
  else if (type === 'future-assumptions') show('About your future', assumptions(p, s));
  else if (type === 'future-speed') show('Money Speed', speedDetail(p, s));
  else if (type === 'future-land') {
    const m = forecast(p, f.ideas).dates[id];
    s.month = m ?? 0;
    ctx.closeModal();
    ctx.updateFuture();
  } else if (type === 'future-try') {
    const i = [...suggestIdeas(p), ...f.ideas].find((x) => x.id === id);
    if (i) {
      toggleExperiment(p, i);
      f.lastExperimentMonth = s.month;
      refresh();
    }
  } else if (type === 'future-add' || type === 'future-hide-possibility') {
    if (type === 'future-hide-possibility') dismissPossibility(p, id);
    seePossibilities(p, possibilities(p, s));
    ctx.updateFuture();
    show('A new possibility', possibilityDiscovery(p, s));
  } else if (type === 'future-own') show('Your own possibility', addDetail());
  else if (type === 'future-possibility') {
    const idea = possibilities(p, s).find((i) => i.id === id);
    if (!idea) {
      show('A new possibility', possibilityDiscovery(p, s));
      return;
    }
    seePossibilities(p, [idea]);
    ctx.updateFuture();
    show('Imagine this', addDetail(idea));
  } else if (type === 'future-add-save') {
    const form = document.querySelector('#future-add-form');
    if (!form.reportValidity()) return;
    const v = new FormData(form),
      name = String(v.get('name')).trim();
    const suggestion = form.dataset.possibility
      ? [...possibilities(p, s), ...horizonPossibilities(p, s)].find(
          (i) => i.id === form.dataset.possibility,
        )
      : null;
    if (form.dataset.possibility && !suggestion) {
      show('A new possibility', possibilityDiscovery(p, s));
      return;
    }
    const i = {
      id: 'goal-' + Date.now(),
      kind: 'add',
      goal: suggestion?.month ? suggestion.id : 'future-' + Date.now(),
      name,
      target: Number(v.get('target')),
      amount: Number(v.get('amount')),
      title: 'Make room for ' + name,
      ...(suggestion
        ? {
            possibilityKey: suggestion.key,
            investment: !!suggestion.investment,
            visualIcon: suggestion.glyph,
          }
        : {}),
    };
    if (form.dataset.makeReal === 'true' && suggestion?.month) {
      // Commit only this reviewed possibility, never unrelated What If experiments.
      forecast(p, [i]);
      ctx.change('Created ' + name, () => applyExperiments(p, [i]));
      return;
    }
    toggleExperiment(p, i);
    f.lastExperimentMonth = s.month;
    f.mode = 'sandbox';
    f.drawer = 'expanded';
    ctx.closeModal();
    refresh();
  } else if (type === 'future-adjust' || type === 'future-priority')
    show('Shape your priorities', adjustDetail(p, id, type === 'future-priority'));
  else if (type === 'future-adjust-save') {
    const form = document.querySelector('#future-adjust-form');
    if (!form.reportValidity()) return;
    const v = new FormData(form),
      goal = form.dataset.goal,
      priority = form.dataset.priority === 'true',
      g = p.l1.pots.find((g) => g.id === goal);
    const i = {
      id: 'adjust-' + goal,
      kind: priority ? 'priority' : 'extra',
      goal,
      from: String(v.get('from') || ''),
      amount: Number(v.get('amount')),
      title: (priority ? 'Prioritise ' : 'Bring closer: ') + g.name,
    };
    toggleExperiment(p, i);
    f.lastExperimentMonth = s.month;
    ctx.closeModal();
    refresh();
  } else if (type === 'future-remove') {
    const g = forecast(p, f.ideas).goals.find((g) => g.id === id);
    if (!g) return;
    const i = { id: 'remove-' + id, kind: 'remove', goal: id, title: 'Retire ' + g.name };
    show(
      'Leave room for something else',
      `<div class="fg-detail"><h2>Let ${esc(g.name.toLowerCase())} go?</h2><p>${esc(ideaDescription(p, i))}</p><p>This is only an experiment until you approve it.</p>${button('Try without this goal', 'future-remove-confirm:' + id, 'primary wide')}</div>`,
    );
  } else if (type === 'future-remove-confirm') {
    const added = f.ideas.find((i) => i.kind === 'add' && i.goal === id);
    if (added) f.ideas = f.ideas.filter((i) => i.goal !== id);
    else
      toggleExperiment(p, {
        id: 'remove-' + id,
        kind: 'remove',
        goal: id,
        title: 'Retire ' + p.l1.pots.find((g) => g.id === id).name,
      });
    ctx.closeModal();
    refresh();
  } else if (type === 'future-chat') show('Explore an idea', chatDetail(p));
  else if (type === 'future-chat-send') {
    const form = document.querySelector('#future-chat-form');
    if (!form.reportValidity()) return;
    const text = String(new FormData(form).get('message')).trim();
    if (!text) return;
    f.messages.push({ role: 'user', text });
    const i = interpretIdea(p, text, f.proposal);
    if (i.error) {
      f.messages.push({ role: 'ai', text: i.error });
      f.proposal = null;
    } else {
      try {
        forecast(p, [i]);
        f.proposal = i;
        f.messages.push({ role: 'ai', text: 'Let’s try that. ' + ideaDescription(p, i) });
      } catch (e) {
        f.proposal = null;
        f.messages.push({ role: 'ai', text: e.message });
      }
    }
    ctx.closeModal();
    show('Explore an idea', chatDetail(p));
  } else if (type === 'future-proposal') {
    if (f.proposal) {
      toggleExperiment(p, f.proposal);
      f.lastExperimentMonth = s.month;
      f.mode = 'sandbox';
      f.drawer = 'expanded';
      ctx.closeModal();
      refresh();
    }
  } else if (type === 'future-review') {
    if (f.ideas.length) {
      forecast(p, f.ideas);
      f.reviewed = JSON.stringify({ ideas: f.ideas, l1: p.l1 });
      show('Your preferred future', review(p, s));
    }
  } else if (type === 'future-commit') {
    if (!document.querySelector('#future-approval')?.checked)
      throw new Error('Review the changes and confirm they work for you.');
    if (f.reviewed !== JSON.stringify({ ideas: f.ideas, l1: p.l1 }))
      throw new Error('Your plan has changed. Review this future again before applying.');
    const ideas = clone(f.ideas);
    forecast(p, ideas);
    ctx.change('Applied your preferred future', () => {
      applyExperiments(p, ideas);
      p.ui.future = { mode: 'view', ideas: [], messages: [], proposal: null };
      p.ui.preview = [];
    });
  } else if (type === 'future-dismiss') ctx.closeModal();
  else if (type === 'future-pot') {
    ctx.closeModal();
    ctx.act('pot:' + id);
  } else if (type === 'future-rules') {
    ctx.closeModal();
    ctx.act('rules');
  }
}
