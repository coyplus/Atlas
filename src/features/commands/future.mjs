import { ensureFuture, toggleExperiment } from '../../domain/future.mjs';
import {
  clone,
  cash,
  dateAt,
  milestone,
  potRate,
  applyIdea,
  previewPerson,
} from '../../domain/money.mjs';
import { esc, icon, button } from '../../design-system/templates.mjs';
import { ideaDialog, reviewIdeaDialog, newPlanDialog } from '../../features/dialogs.mjs';
export function handle(ctx, type, id, p, action) {
  if (type === 'view') {
    ctx.S.view = id;
    ctx.S.zoom = 1;
    ctx.render();
    return;
  }
  if (type === 'zoom') {
    ctx.S.zoom = id === 'fit' ? 1 : Math.max(0.75, Math.min(2, ctx.S.zoom + Number(id)));
    ctx.updateFuture();
    return;
  }
  if (type === 'time') {
    ctx.S.month = Number(id);
    document.querySelector('#time-slider').value = ctx.S.month;
    ctx.updateFuture();
    return;
  }
  if (type === 'idea') {
    const w = p.l2.whatIfs.find((x) => x.id === id);
    return ctx.openModal('What if…', ideaDialog(p, w));
  }
  if (type === 'toggle-idea') {
    if (p.ui.preview.includes(id)) p.ui.preview = p.ui.preview.filter((x) => x !== id);
    else {
      const trial = clone(p);
      trial.ui.preview.push(id);
      previewPerson(trial);
      p.ui.preview.push(id);
    }
    const draft = ensureFuture(p);
    const idea = p.l2.whatIfs.find((x) => x.id === id);
    if (idea?.canCommit) {
      toggleExperiment(p, {
        id,
        kind: 'authored',
        title: idea.title,
        why: idea.summary,
        authored: clone(idea),
      });
      draft.mode = 'sandbox';
    }
    ctx.closeModal();
    if (ctx.S.tab !== 'future') ctx.navigate('future');
    else ctx.render();
    return;
  }
  if (type === 'review-idea') {
    const w = p.l2.whatIfs.find((x) => x.id === id) || ctx.planDraft;
    return ctx.openJourney('Review your plan', reviewIdeaDialog(p, w));
  }
  if (type === 'commit-idea') {
    const w = p.l2.whatIfs.find((x) => x.id === id) || ctx.planDraft;
    if (!w) throw new Error('Choose a plan first.');
    if (
      document.querySelector('#advice-agreed') &&
      !document.querySelector('#advice-agreed').checked
    )
      throw new Error('Review the illustrative plan with Maya before agreeing.');
    const input = document.querySelector('#commit-amount'),
      amount = input ? Number(input.value) : undefined;
    return ctx.change('Started ' + w.title, () => {
      if (!p.l2.whatIfs.some((x) => x.id === w.id)) p.l2.whatIfs.push(clone(w));
      applyIdea(p, w, amount);
      const draft = ensureFuture(p);
      draft.ideas = draft.ideas.filter((i) => i.id !== w.id);
      if (!draft.ideas.length) draft.mode = 'view';
    });
  }
  if (type === 'preview-summary') {
    const ws = p.ui.preview.map((id) => p.l2.whatIfs.find((x) => x.id === id)).filter(Boolean);
    return ctx.openModal(
      'Your possibilities',
      `<p>Review each plan and its amount before agreeing. Nothing has moved yet.</p>${ws.map((w) => `<button class="gallery-row" data-action="${w.canCommit ? 'review-idea:' + w.id : 'idea:' + w.id}"><span><b>${esc(w.title)}</b><small>${esc(w.summary)}</small></span>${icon('arrow')}</button>`).join('') || '<p class="support">Try a What If to see it here.</p>'}`,
    );
  }
  if (type === 'newplan') return ctx.openJourney('A new plan', newPlanDialog(p, ctx.DATA));
  if (type === 'plan-intent') {
    if (id === 'auto')
      return ctx.openJourney(
        'Choose a pot for your rule',
        p.l1.pots
          .map(
            (x) =>
              `<button class="gallery-row" data-action="new-rule:${x.id}"><span>${esc(x.name)}</span>${icon('arrow')}</button>`,
          )
          .join('') || button('Create your first pot', 'plan-intent:goal'),
      );
    return ctx.openJourney('Shape your plan', newPlanDialog(p, ctx.DATA, id));
  }
  if (type === 'plan-review') {
    const f = document.querySelector('#plan-form');
    if (!f.reportValidity()) return;
    const values = new FormData(f),
      rec = ctx.DATA.shared.modules.newPlanRecommendations[id];
    ctx.planDraft = {
      id: 'custom-' + p.l1.pots.length + '-' + p.ui.receipts.length,
      type: 'create',
      title: String(values.get('name')).trim(),
      summary: 'Your own plan',
      explainer: 'A plan shaped by you.',
      canCommit: true,
      effect: {
        newPot: {
          name: String(values.get('name')).trim(),
          monthlyRate: Number(values.get('amount')),
          target: Number(values.get('target')) || null,
          openingBalance: 0,
          growthAnnual: rec.grow ? 0.05 : null,
          icon: rec.shared ? 'users' : 'target',
        },
      },
    };
    if (!ctx.planDraft.title) throw new Error('Give your plan a name.');
    return ctx.openJourney('Review your plan', reviewIdeaDialog(p, ctx.planDraft));
  }
  if (type === 'redirect') {
    const pot = p.l1.pots.find((x) => x.id === id);
    if (!pot) return ctx.act('preview-summary');
    const m = milestone(p, pot);
    return ctx.openJourney(
      'When this rule ends',
      `<h3 class="idea-title">${esc(pot.name)} finishes ${m !== null ? dateAt(p, m) : 'when it reaches its target'}.</h3><p>Its ${cash(Math.abs(potRate(p, pot)))} monthly rule stops. Choose another goal for that money, or leave it in your current account.</p><label class="field">Send future contributions to<select id="redirect-to">${p.l1.pots
        .filter((x) => x.id !== id && !x.isDebt)
        .map((x) => `<option value="${x.id}">${esc(x.name)}</option>`)
        .join(
          '',
        )}</select></label>${button('Schedule the next step', 'save-redirect:' + id, 'primary wide')}${button('Create a different pot', 'newplan', 'text')}${button('Keep it in my account', 'close', 'text')}`,
    );
  }
  if (type === 'save-redirect') {
    const from = p.l1.pots.find((x) => x.id === id),
      to = p.l1.pots.find((x) => x.id === document.querySelector('#redirect-to').value),
      m = milestone(p, from);
    if (!to || m === null || (!from.isDebt && !from.stopsAtTarget))
      throw new Error('Choose a rule that stops at a known finishing date.');
    if (p.ui.redirects.some((r) => r.from === to.id && r.to === from.id))
      throw new Error('Choose a different destination to avoid a circular plan.');
    return ctx.change(
      'Scheduled ' + from.name + ' contributions to ' + to.name + ' after ' + dateAt(p, m),
      () => {
        p.ui.redirects = p.ui.redirects.filter((r) => r.from !== from.id);
        p.ui.redirects.push({
          from: from.id,
          to: to.id,
        });
      },
    );
  }
}
