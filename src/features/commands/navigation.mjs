import { numberVisualMarkup } from '../../design-system/number-visual.mjs';
import { storyEvidence } from '../stories/views.mjs';
import { renderRegion } from '../../design-system/Markup.tsx';
import { moneyContainer, ruleBenefitLinks } from '../../domain/containers.mjs';
import { containerDetailView, containerRuleRow } from '../../features/pots/views.mjs';
import {
  createSession,
  transaction,
  undo,
  cash,
  dateAt,
  milestone,
  potRate,
  confirmBelief,
  award,
  addRule,
  rewardAvailability,
  rewardSavingsPots,
} from '../../domain/money.mjs';
import { esc, icon, button, rows } from '../../design-system/templates.mjs';
import { moduleModel } from '../../domain/numbers.mjs';
import { potDialog, rulesDialog, storyDialog } from '../../features/dialogs.mjs';
export function handle(ctx, type, id, p, action) {
  if (type === 'bench-container') {
    const choices = {
        budget: ['jordan', 'budget'],
        savings: ['sam', 'house'],
        loan: ['jordan', 'loan'],
        investment: ['elena', 'inv'],
        shared: ['elena', 'fam'],
        lock: ['jordan', 'house'],
        recovery: ['jordan', 'grocery-wallet'],
        flat: ['jordan', 'flat'],
        family: ['sam', 'family-budget'],
        familySaving: ['sam', 'hol'],
      },
      entry = choices[id];
    ctx.S.person = entry[0];
    ctx.S.tab = 'now';
    ctx.render();
    return ctx.act('pot:' + entry[1]);
  }
  if (type === 'bench-story') return ctx.act('story:' + p.l2.stories[0].id);
  if (type === 'bench-idea') return ctx.act('idea:' + p.l2.whatIfs.find((w) => w.canCommit).id);
  if (type === 'tab') return ctx.navigate(id);
  if (type === 'person') {
    ctx.containerRuleOrigin = null;
    ctx.S.person = id;
    ctx.S.month = 0;
    ctx.S.member = 'self';
    ctx.S.modal = null;
    ctx.render();
    document.querySelector('#content').scrollTop = 0;
    return;
  }
  if (type === 'close') return ctx.closeModal();
  if (type === 'dismiss') {
    renderRegion(document.querySelector('#toast'), '');
    return;
  }
  if (type === 'reset') {
    ctx.S.people[ctx.S.person] = createSession(ctx.DATA).people[ctx.S.person];
    ctx.S.tab = 'now';
    ctx.S.month = 0;
    ctx.S.edit = false;
    ctx.render();
    return;
  }
  if (type === 'customise') {
    ctx.S.edit = !ctx.S.edit;
    ctx.render();
    return;
  }
  if (type === 'module') {
    const m = moduleModel(p, id, ctx.DATA.shared.modules);
    if (id === 'grocery')
      return ctx.openModal(
        m.title,
        `<span class="eyebrow">Spending insight · this month</span><div class="detail-number">${esc(m.value)}</div>${numberVisualMarkup(m.visual, true)}<p>Recorded grocery purchases across your accounts and pots. Transfers and top-ups aren’t counted.</p>${m.relatedPot ? `<button class="gallery-row insight-link" data-action="pot:${m.relatedPot}">${icon('basket')}<span><b>${esc(moneyContainer(p, m.relatedPot).name)}</b><small>${cash(moneyContainer(p, m.relatedPot).balance, true)} left to spend · money already set aside</small></span>${icon('chev')}</button>` : button('Explore a grocery budget pot', 'grocery-pot-intro', 'secondary wide')}<h3 class="dialog-section">Grocery purchases</h3>${rows(m.rows)}<p class="support">Includes the recorded purchases in your HSBC accounts and pots. Connected banks in this demo share balances only.</p>`,
      );
    const detailRows =
      ctx.S.tab !== 'now'
        ? m.rows
        : ['safespend', 'afterbills'].includes(id)
          ? m.rows.slice(0, 1)
          : ['subs', 'dd', 'spent', 'whereitgoes'].includes(id) && m.visual
            ? []
            : id === 'wealth'
              ? m.rows.slice(-2)
              : id === 'investments'
                ? []
                : m.rows;
    const investmentPots =
      id === 'investments' && ctx.S.tab === 'now'
        ? p.l1.pots.filter((x) => x.growthAnnual || x.kind === 'investment')
        : [];
    const holdingAction =
      investmentPots.length === 1
        ? button('View investment pot', 'pot:' + investmentPots[0].id, 'secondary wide')
        : '';
    const detail =
      ctx.S.tab === 'now' && ['safespend', 'afterbills', 'cardusage'].includes(id) ? '' : m.detail;
    return ctx.openModal(
      m.title,
      `<div class="number-detail" data-number="${esc(id)}"><div class="detail-number">${esc(m.value)}</div><p class="number-detail-note">${esc(m.note)}</p>${numberVisualMarkup(m.visual, true)}${detailRows.length ? rows(detailRows) : ''}${detail ? `<p class="support">${esc(detail)}</p>` : ''}${holdingAction}</div>`,
    );
  }
  if (type === 'grocery-pot-intro')
    return ctx.openJourney(
      'A pot for groceries',
      `<h3 class="idea-title">Set aside money before you spend</h3><p>Your spending insight keeps tracking all grocery purchases. A budget pot holds a separate allowance, so you can see what is left. Eligible purchases may also earn cashback under its agreement.</p>${button('Create a grocery pot', 'grocery-pot-create', 'primary wide')}`,
    );
  if (type === 'grocery-pot-create') {
    const existing = p.l1.pots.find((x) => x.spendingCategory === 'groceries');
    if (existing) return ctx.act('pot:' + existing.id);
    transaction(p, 'Created Grocery budget', () =>
      p.l1.pots.push({
        id: 'grocery-wallet',
        name: 'Grocery budget',
        kind: 'budget',
        spendingCategory: 'groceries',
        balance: 0,
        budgetLimit: 220,
        budgetAlert: 80,
        isDebt: false,
        rules: [],
      }),
    );
    ctx.render();
    return ctx.act('pot:grocery-wallet');
  }
  if (type === 'undo') {
    undo(p);
    ctx.render();
    ctx.toast('Your last change was undone');
    return;
  }
  if (type === 'direction') {
    ctx.S.direction = id;
    ctx.render();
    return;
  }
  if (type === 'sustainability')
    return ctx.openModal(
      'Sustainability',
      `<span class="eyebrow">SMALL STEPS · EVERYDAY LIFE</span><h3 class="idea-title">Make room for a greener plan.</h3><p>A home improvement, a different commute, or buying less and making things last. Give your next step a budget and a place in your plans.</p>${button('Create a saving goal', 'plan-intent:goal', 'primary wide')}${button('Products and services', 'products', 'text')}`,
    );
  if (type === 'pot') {
    const pot = p.l1.pots.find((x) => x.id === id);
    if (!pot) return ctx.act('preview-summary');
    ctx.containerRuleOrigin = id;
    return ctx.openModal(
      pot.name,
      ctx.S.direction === 'vanilla'
        ? containerDetailView(p, pot, { now: ['now', 'future'].includes(ctx.S.tab) })
        : potDialog(p, pot),
    );
  }
  if (type === 'rules') {
    ctx.containerRuleOrigin = null;
    return ctx.openModal(
      'Your agreed rules',
      ctx.S.direction === 'vanilla'
        ? `<p>Your agreed instructions. Open a rule to review its trigger, edit it or pause it.</p>${p.l1.rules.map((r) => containerRuleRow(p, r)).join('') || '<p>No rules yet.</p>'}`
        : rulesDialog(p),
    );
  }
  if (type === 'rule-toggle') {
    const r = p.l1.rules.find((x) => x.id === id);
    if (ctx.S.direction === 'vanilla' && ruleBenefitLinks(p, r).length) {
      ctx.containerRuleOrigin = r.potId;
      return ctx.act('container-rule-toggle:' + id);
    }
    return ctx.change(
      (r.active ? 'Paused' : 'Resumed') +
        ' ' +
        (r.title || p.l1.pots.find((x) => x.id === r.potId)?.name) +
        ' rule',
      () => (r.active = !r.active),
    );
  }
  if (type === 'clear-preview') {
    p.ui.preview = [];
    ctx.render();
    return;
  }
  if (type === 'member') {
    ctx.S.member = id;
    ctx.render();
    return;
  }
  if (type === 'save-personality') {
    const val = document.querySelector('#correction').value.trim();
    if (!val) throw new Error('Add your correction first.');
    return ctx.change('Corrected your money personality', () => {
      p.l2.personality.copy = val;
      p.l2.personality.provenance = 'Corrected by you · ' + p.l1.asOf;
      p.ui.confirmed = true;
      award(p, 'personality', 10, 'Money personality corrected');
    });
  }
  if (type === 'save-belief') {
    const val = document.querySelector('#correction').value;
    return ctx.change('Saved your correction', () => confirmBelief(p, id, val));
  }
  if (type === 'story') {
    ctx.storyId = id;
    // A tile or cross-story navigation is a fresh entry. Overlay returns restore their snapshot.
    ctx.storyStep = 0;
    p.ui.storyVisits ||= {};
    p.ui.storyVisits[id] = { ...p.ui.storyVisits[id], step: 0, elapsed: 0 };
    return ctx.openModal(
      p.l2.stories.find((x) => x.id === id).title,
      storyDialog(p, id, ctx.storyStep),
      'story',
    );
  }
  if (type === 'story-shift') {
    const active = document.querySelector('#overlay > .story-shell .story-viewer');
    if (!active) return;
    const index = p.l2.stories.findIndex((st) => st.id === active.dataset.story);
    const next = p.l2.stories[index + (Number(id) > 0 ? 1 : -1)];
    if (!next) return;
    return ctx.act('story:' + next.id);
  }
  if (type === 'story-step') {
    ctx.storyStep = Math.max(0, Math.min(2, Number(id) || 0));
    if (p.ui.storyVisits?.[ctx.storyId]) p.ui.storyVisits[ctx.storyId].elapsed = 0;
    return ctx.openModal(
      p.l2.stories.find((x) => x.id === ctx.storyId).title,
      storyDialog(p, ctx.storyId, ctx.storyStep),
      'story',
    );
  }
  if (type === 'story-evidence') {
    const [story, index] = id.split('/');
    return ctx.openModal(
      p.l2.stories.find((s) => s.id === story).title + ' · details',
      storyEvidence(p, story, index),
      'story-evidence',
    );
  }
  if (type === 'story-end' || type === 'story-decline') {
    p.ui.storyVisits ||= {};
    p.ui.storyVisits[ctx.storyId] = {
      step: 0,
      elapsed: 0,
      read: true,
      ...(type === 'story-decline' ? { declinedAt: p.l1.asOf } : {}),
    };
    ctx.closeModal();
    const badge = document.querySelector(`[data-action="story:${ctx.storyId}"] .story-state`);
    if (badge) badge.textContent = type === 'story-decline' ? 'Not now' : 'Read';
    return;
  }
  if (type === 'story-action') {
    const st = p.l2.stories.find((x) => x.id === id);
    const [a, target] = st.action.split(':');
    if (a === 'quiz') return ctx.act('quiz');
    if (a === 'pin') {
      ctx.change(
        'Pinned ' + ctx.DATA.shared.modules.modules.find((x) => x.id === target)?.title + ' to Now',
        () => {
          if (!p.ui.order.includes(target)) p.ui.order.push(target);
          st.state = 'saved';
        },
      );
      return;
    }
    return ctx.act('idea:' + target);
  }
  if (type === 'benefit') {
    const b = ctx.DATA.shared.modules.benefits.find((x) => x.id === id);
    if (!b) return;
    const eligibility = rewardAvailability(p, b);
    return ctx.openJourney(
      'Use your Points',
      `<h3 class="idea-title">${esc(b.t)}</h3><p>${esc(b.s)}</p>${rows([
        ['Cost', b.cost + ' points'],
        ['Your balance', p.l1.rewards.points.balance + ' points'],
      ])}${
        b.id === 'boost'
          ? `<label class="field">Choose a pot<select id="benefit-pot">${rewardSavingsPots(p)
              .map((x) => `<option value="${x.id}">${esc(x.name)}</option>`)
              .join('')}</select></label>`
          : ''
      }${eligibility.available ? button('Use ' + b.cost + ' Points', 'redeem:' + id, 'primary wide') : `<p class="notice">${esc(eligibility.reason)}</p>${button(b.premier ? 'Explore HSBC Status' : 'Explore challenges', b.premier ? 'membership' : 'badges', 'secondary wide')}`}`,
    );
  }
  if (type === 'pot-chat') {
    const pot = p.l1.pots.find((x) => x.id === id);
    p.ui.chat.push({
      role: 'ai',
      text:
        pot.name +
        ' has ' +
        cash(pot.balance, true) +
        '. Its active monthly rules total ' +
        cash(Math.abs(potRate(p, pot))) +
        '. ' +
        (milestone(p, pot) === null
          ? 'There is no target date yet.'
          : 'The current target date is ' + dateAt(p, milestone(p, pot)) + '.') +
        ' We can change the amount or bring in a person to talk it through.',
    });
    return ctx.openChat();
  }
  if (type === 'cancel-appointment')
    return ctx.change('Cancelled your demo appointment', () => (p.ui.appointment = null));
  if (type === 'reschedule')
    return ctx.openJourney(
      'Choose another time',
      `<label class="field">Preferred date<input id="meeting-date" type="date" min="${p.l1.asOf}" value="2026-09-11"></label><label class="field">Preferred time<input id="meeting-time" type="time" value="10:00"></label>${button('Request this time', 'request-appointment', 'primary wide')}`,
    );
  if (type === 'request-appointment') {
    const date = document.querySelector('#meeting-date').value,
      time = document.querySelector('#meeting-time').value;
    if (!date || date < p.l1.asOf || !time) throw new Error('Choose a future date and time.');
    return ctx.change(
      'Requested ' + date + ' at ' + time + ' with Priya',
      () => (p.ui.appointment = 'Requested: ' + date + 'T' + time),
    );
  }
  if (type === 'new-rule') {
    if (ctx.S.direction === 'vanilla') return ctx.act('container-rule-new:' + id);
    return ctx.openJourney(
      'Add a monthly rule',
      `<p>Choose a monthly amount for ${esc(p.l1.pots.find((x) => x.id === id).name)}. ${p.l1.pots.find((x) => x.id === id).stopsAtTarget || p.l1.pots.find((x) => x.id === id).isDebt ? 'The rule stops at the target.' : 'This rule continues until you pause it.'}</p><label class="field">Each month<span class="input-money"><span>£</span><input id="rule-amount" type="number" min="1" value="50"></span></label>${button('Start this rule', 'save-rule:' + id, 'primary wide')}`,
    );
  }
  if (type === 'save-rule') {
    const amount = Number(document.querySelector('#rule-amount').value),
      pot = p.l1.pots.find((x) => x.id === id);
    return ctx.change('Added ' + cash(amount) + ' monthly to ' + pot.name, () =>
      addRule(p, pot, amount, 'Monthly move'),
    );
  }
}
