import {
  potAppearance,
  potAppearanceView,
  potColours,
  appearanceStyle,
} from '../pots/appearance.mjs';
import { readBackgroundPhoto } from '../now/background.mjs';
import { conditionDate } from '../../domain/agreements.mjs';
import {
  moneyContainer,
  containerModel,
  ruleBenefitLinks,
  agreementChangeEffects,
  removeContainerRule,
  ruleDescription,
  validateContainerRule,
  previewRuleTrigger,
  executeRuleTrigger,
  saveContainerRule,
  evolveContainer,
  inviteToContainer,
  acceptContainerInvite,
} from '../../domain/containers.mjs';
import {
  agreementRecoveryView,
  conditionMethodsView,
  agreementEffectsView,
  containerInfoView,
  containerQuickConfig,
  containerRuleForm,
  containerRuleDetail,
  containerMembersView,
} from '../../features/pots/views.mjs';
import { transaction, cash, recentTransactions } from '../../domain/money.mjs';
import { esc, button, rows } from '../../design-system/templates.mjs';
import { transferDialog } from '../../features/dialogs.mjs';
let appearanceDraft = null;
export function handle(ctx, type, id, p, action) {
  if (type === 'pot-appearance-pick') {
    const [, potId, colour] = action.split(':');
    const item = p.l1.pots.find((g) => g.id === potId && !g.isDebt && g.kind !== 'budget');
    if (!item || !potColours[colour]) return;
    const appearance = { ...potAppearance(p, item), colour };
    (p.ui.potAppearance ||= {})[item.id] = appearance;
    const detail = document.querySelector('.container-detail');
    if (detail?.dataset.container === item.id) {
      detail.setAttribute('style', appearanceStyle(appearance));
      detail.querySelector('.pot-colour-control summary b').textContent = potColours[colour][0];
      for (const b of detail.querySelectorAll('.pot-inline-colours button'))
        b.setAttribute('aria-pressed', String(b.dataset.action.endsWith(':' + colour)));
      // Update the canvas beneath the detail without resetting its camera or scroll position.
      for (const id of ['future-bubble-' + item.id, 'fg-tick-' + item.id]) {
        const bubble = document.getElementById(id);
        for (const property of ['--pot-colour', '--pot-ink'])
          bubble?.style.setProperty(property, detail.style.getPropertyValue(property));
      }
    }
    return;
  }
  if (type === 'pot-personalise' || type.startsWith('pot-appearance-')) {
    if (type === 'pot-personalise') {
      const item = p.l1.pots.find((g) => g.id === id && !g.isDebt && g.kind !== 'budget');
      if (!item) return;
      appearanceDraft = { person: p.l1.customer.id, pot: id, ...potAppearance(p, item) };
    }
    if (!appearanceDraft || appearanceDraft.person !== p.l1.customer.id) return;
    const item = p.l1.pots.find((g) => g.id === appearanceDraft.pot);
    if (!item) return;
    if (type === 'pot-appearance-choose') {
      document.querySelector('#pot-photo-input')?.click();
      return;
    }
    if (type === 'pot-appearance-upload') {
      const input = document.querySelector('#pot-photo-input'),
        file = input?.files?.[0],
        draft = appearanceDraft;
      if (!file) return;
      readBackgroundPhoto(file)
        .then((photo) => {
          if (!input.isConnected || appearanceDraft !== draft) return;
          draft.photo = photo;
          ctx.openJourney('Personalise your Pot', potAppearanceView(p, item, draft));
        })
        .catch((e) => ctx.toast(e.message));
      return;
    }
    if (type === 'pot-appearance-colour' && potColours[id]) appearanceDraft.colour = id;
    if (type === 'pot-appearance-remove') appearanceDraft.photo = '';
    if (type === 'pot-appearance-save') {
      (p.ui.potAppearance ||= {})[item.id] = {
        colour: appearanceDraft.colour,
        photo: appearanceDraft.photo,
      };
      appearanceDraft = null;
      ctx.refreshContainer(item.id, 'Your Pot, a little more personal');
      return;
    }
    ctx.openJourney('Personalise your Pot', potAppearanceView(p, item, appearanceDraft));
    return;
  }
  if (type === 'container-info') {
    const item = moneyContainer(p, id);
    return ctx.openModal('Account information', containerInfoView(p, item));
  }
  if (type === 'container-more') {
    ctx.quickContainer = id;
    ctx.quickDraft = [...containerQuickConfig(p, moneyContainer(p, id)).slots];
    ctx.quickEditing = false;
    ctx.quickSelected = null;
    return ctx.showQuickActions();
  }
  if (type === 'container-activity') {
    const item = moneyContainer(p, id);
    return ctx.openModal(
      item.name + ' activity',
      rows(recentTransactions(p, id).map((x) => [x.counterparty, x.date, cash(x.amount, true)])) ||
        '<p>No activity yet.</p>',
    );
  }
  if (type === 'container-trigger') {
    const r = p.l1.rules.find((x) => x.id === id),
      result = previewRuleTrigger(p, r);
    return ctx.openJourney(
      'Sample rule trigger',
      `<p>${esc(result.reason)}</p>${rows([
        ['From', moneyContainer(p, r.source)?.name || 'No source'],
        ['To', moneyContainer(p, r.potId)?.name || 'No destination'],
        ['Will move', cash(result.amount, true)],
      ])}<p class="support">This applies one simulated trigger to the current demo snapshot. Undo restores the prior state. Reset starts this scenario again.</p>${button('Apply demo trigger', 'container-trigger-confirm:' + id, 'primary wide')}`,
    );
  }
  if (type === 'container-trigger-confirm') {
    const r = p.l1.rules.find((x) => x.id === id);
    let result;
    transaction(
      p,
      'Simulated ' + (r.title || 'money rule'),
      () => (result = executeRuleTrigger(p, id)),
    );
    return ctx.refreshContainer(
      ctx.containerRuleOrigin || r.potId,
      result.amount ? cash(result.amount, true) + ' moved' : result.reason,
    );
  }
  if (type === 'container-rule-new') {
    ctx.containerRuleOrigin = id;
    ctx.containerRuleDraft = null;
    ctx.openJourney('Create a money rule', containerRuleForm(p, moneyContainer(p, id)));
    ctx.updateRuleFields();
    return;
  }
  if (type === 'container-rule') {
    const rule = p.l1.rules.find((r) => r.id === id);
    ctx.containerRuleOrigin =
      document.querySelector('.container-system')?.dataset.container || rule.potId;
    return ctx.openModal('Money rule', containerRuleDetail(p, rule));
  }
  if (type === 'container-rule-edit') {
    const rule = p.l1.rules.find((r) => r.id === id);
    ctx.containerRuleOrigin = ctx.containerRuleOrigin || rule.potId;
    ctx.openJourney(
      'Edit money rule',
      containerRuleForm(p, moneyContainer(p, ctx.containerRuleOrigin), rule),
    );
    ctx.updateRuleFields();
    return;
  }
  if (type === 'container-rule-review') {
    const form = document.querySelector('#container-rule-form');
    if (!form.reportValidity()) return;
    const values = new FormData(form),
      variable = ['round-up', 'payday-sweep'].includes(values.get('type'));
    ctx.containerRuleDraft = {
      id: values.get('id') || undefined,
      type: values.get('type'),
      source: values.get('source'),
      potId: values.get('potId'),
      amount: variable ? 0 : Number(values.get('amount')),
      limitMonthly: Number(values.get('limitMonthly')),
      reserve: Number(values.get('reserve')),
    };
    validateContainerRule(p, ctx.containerRuleDraft);
    if (!variable && ctx.containerRuleDraft.amount > ctx.containerRuleDraft.limitMonthly)
      throw new Error('The monthly cap must cover the agreed payment.');
    ctx.containerRuleOrigin = id;
    return ctx.openJourney(
      'Review money rule',
      `<h3 class="idea-title">Your money. Your instruction.</h3><p>${esc(ruleDescription(p, ctx.containerRuleDraft))}</p>${rows(
        [
          ['Maximum per month', cash(ctx.containerRuleDraft.limitMonthly)],
          ['Leave in source', cash(ctx.containerRuleDraft.reserve)],
          ['First move', 'After the next matching trigger'],
          ['Money moved now', '£0'],
        ],
      )}${agreementEffectsView(agreementChangeEffects(p, (copy) => saveContainerRule(copy, ctx.containerRuleDraft)).filter((e) => e.changed || e.potId === ctx.containerRuleDraft.potId))}<p class="support">${variable ? 'Variable amounts depend on future activity and are excluded from the fixed monthly projection.' : 'If there isn’t enough available after your protected balance, the payment is skipped.'} You can pause or edit this rule later.</p>${button('Agree and save rule', 'container-rule-save', 'primary wide')}`,
    );
  }
  if (type === 'container-rule-save') {
    if (!ctx.containerRuleDraft) throw new Error('Review a rule first.');
    transaction(
      p,
      'Saved money rule for ' + moneyContainer(p, ctx.containerRuleDraft.potId).name,
      () => saveContainerRule(p, ctx.containerRuleDraft),
    );
    const origin = ctx.containerRuleOrigin;
    ctx.containerRuleDraft = null;
    return ctx.refreshContainer(origin, 'Your rule is saved');
  }
  if (type === 'container-rule-toggle' || type === 'container-rule-remove') {
    const r = p.l1.rules.find((x) => x.id === id),
      remove = type === 'container-rule-remove',
      links = ruleBenefitLinks(p, r),
      origin = ctx.containerRuleOrigin || r.potId;
    const mutate = (copy) =>
      remove
        ? removeContainerRule(copy, id)
        : (copy.l1.rules.find((x) => x.id === id).active = !r.active);
    if (remove || links.length) {
      const effects = agreementChangeEffects(p, mutate).filter(
        (e) => e.changed || links.some((l) => l.potId === e.potId),
      );
      ctx.pendingRuleChange = {
        id,
        remove,
        origin,
        active: !r.active,
      };
      return ctx.openJourney(
        'Review rule change',
        `<h3 class="idea-title">${remove ? 'Remove' : r.active ? 'Pause' : 'Resume'} this rule?</h3><p>${esc(ruleDescription(p, r))}</p>${agreementEffectsView(effects)}${!links.length ? '<p class="support">This optional instruction can be changed independently of your pot’s agreement.</p>' : ''}${moneyContainer(p, r.potId) && containerModel(p, moneyContainer(p, r.potId)).debt ? '<p class="support">Your contractual repayment is still due. Arrange another way to pay if you remove this rule.</p>' : ''}${button(remove ? 'Remove rule' : r.active ? 'Pause rule' : 'Resume rule', 'container-rule-confirm', 'primary wide')}${button('Keep my current rule', 'close', 'secondary wide')}`,
      );
    }
    transaction(p, (r.active ? 'Paused' : 'Resumed') + ' ' + (r.title || 'money rule'), () =>
      mutate(p),
    );
    return ctx.refreshContainer(origin, 'Rule updated');
  }
  if (type === 'container-rule-confirm') {
    const change = ctx.pendingRuleChange;
    if (!change) throw new Error('Review the rule change first.');
    transaction(
      p,
      change.remove
        ? 'Removed money rule'
        : change.active
          ? 'Resumed money rule'
          : 'Paused money rule',
      () => {
        if (change.remove) removeContainerRule(p, change.id);
        else p.l1.rules.find((r) => r.id === change.id).active = change.active;
      },
    );
    ctx.pendingRuleChange = null;
    return ctx.refreshContainer(change.origin, 'Rule updated');
  }
  if (type === 'wallet-settings') {
    const x = moneyContainer(p, id);
    return ctx.openJourney(
      'Your wallet limit',
      `<p>A spending guide with an alert, not a restriction on your card.</p><form id="wallet-form" data-container="${id}"><label class="field">Monthly limit (£)<input name="limit" type="number" min="1" max="100000" value="${x.budgetLimit || 220}" required></label><label class="field">Alert at (%)<input name="alert" type="number" min="1" max="100" value="${x.budgetAlert || 80}" required></label>${button('Review limit', 'wallet-review:' + id, 'primary wide', 'type="button"')}</form>`,
    );
  }
  if (type === 'wallet-review') {
    const f = document.querySelector('#wallet-form');
    if (!f.reportValidity()) return;
    const v = new FormData(f);
    ctx.walletDraft = {
      id,
      limit: Number(v.get('limit')),
      alert: Number(v.get('alert')),
    };
    return ctx.openJourney(
      'Review wallet limit',
      `${rows([
        ['Monthly spending limit', cash(ctx.walletDraft.limit)],
        ['Alert when spent', cash((ctx.walletDraft.limit * ctx.walletDraft.alert) / 100)],
      ])}<p>The illustrative cashback agreement will use this limit from now. No money is moved.</p>${button('Save limit', 'wallet-save', 'primary wide')}`,
    );
  }
  if (type === 'wallet-save') {
    const d = ctx.walletDraft;
    if (!d) throw new Error('Review the limit first.');
    transaction(p, 'Updated wallet limit', () => {
      const x = moneyContainer(p, d.id);
      x.budgetLimit = d.limit;
      x.budgetAlert = d.alert;
    });
    ctx.walletDraft = null;
    return ctx.refreshContainer(d.id, 'Wallet updated');
  }
  if (type === 'container-evolve') {
    const x = moneyContainer(p, id);
    return ctx.openJourney(
      'From saving to investing',
      `<span class="eyebrow">REVIEW A DIFFERENT PURPOSE</span><h3 class="idea-title">Same pot. A different future.</h3>${rows(
        [
          ['Pot', x.name],
          ['Balance carried forward', cash(x.balance, true)],
          ['Existing rules', 'Kept · review before agreeing'],
          ['Existing saving rate', 'Ends when this pot changes'],
          ['Access', 'Subject to selling investments'],
          ['Growth illustration', '5% a year · not guaranteed'],
        ],
      )}<p>Investments can fall in value. Your target becomes an ambition, not a guaranteed outcome. Any fixed saving benefit ends. The pot’s identity, activity and rules stay together.</p><label class="checkbox-label"><input id="container-risk-agreed" type="checkbox"> I have reviewed this illustrative change and the investment risks.</label>${button('Confirm demo change', 'container-evolve-confirm:' + id, 'primary wide')}`,
    );
  }
  if (type === 'container-evolve-confirm') {
    if (!document.querySelector('#container-risk-agreed')?.checked)
      throw new Error('Review the investment risks before agreeing.');
    transaction(p, 'Changed ' + moneyContainer(p, id).name + ' to an investment pot', () =>
      evolveContainer(p, id, 'investment'),
    );
    return ctx.refreshContainer(id, 'Your pot has changed');
  }
  if (type === 'condition-method' || type === 'condition-pay' || type === 'condition-automate') {
    const [potId, conditionId] = id.split('/'),
      item = moneyContainer(p, potId),
      condition = containerModel(p, item).arrangement.conditions.find((x) => x.id === conditionId);
    if (!condition) throw new Error('Condition unavailable.');
    if (type === 'condition-method')
      return ctx.openJourney('How you contribute', conditionMethodsView(p, item, condition));
    if (type === 'condition-pay') {
      ctx.conditionTransferOrigin = potId;
      ctx.openJourney('Complete your contribution', transferDialog(p, potId, 'transfer'));
      document.querySelector('#transfer-form [name=amount]').value = condition.remaining;
      return;
    }
    ctx.act('container-rule-new:' + potId);
    const form = document.querySelector('#container-rule-form');
    form.elements.amount.value = condition.required;
    form.elements.limitMonthly.value = condition.required;
    form.elements.type.value = item.isDebt || item.owed != null ? 'repayment' : 'payday-fixed';
    ctx.updateRuleFields();
    return;
  }
  if (type === 'condition-merchant') {
    const item = moneyContainer(p, id);
    return ctx.openJourney(
      'Your cashback supermarket',
      `<p>Choose where you shop most. Eligible purchases there can earn 1% cashback when your wallet conditions are met.</p><form id="merchant-form"><label class="field">Supermarket<select name="merchant">${['Tesco', 'Sainsbury’s', 'Aldi'].map((name) => `<option ${item.arrangementState?.merchant === name ? 'selected' : ''}>${esc(name)}</option>`).join('')}</select></label>${button('Review choice', 'condition-merchant-review:' + id, 'primary wide', 'type="button"')}</form>`,
    );
  }
  if (type === 'condition-merchant-review') {
    const merchant = document.querySelector('#merchant-form [name=merchant]').value;
    ctx.pendingConditionChoice = {
      kind: 'merchant',
      id,
      value: merchant,
    };
    return ctx.openJourney(
      'Review your choice',
      `<h3 class="idea-title">1% cashback at ${esc(merchant)}</h3><p>Applies to eligible purchases from today. Fund your monthly wallet allowance and stay within your spending limit. Cashback is assessed at month end, up to £5.</p><p>Choosing a merchant does not move money or earn cashback now.</p>${button('Confirm supermarket', 'condition-choice-confirm', 'primary wide')}`,
    );
  }
  if (type === 'condition-lock') {
    const item = moneyContainer(p, id),
      offer = item.personalOffer?.lockOffer;
    if (!offer) throw new Error('No lock offer for this pot.');
    const d = new Date(p.l1.asOf + 'T12:00:00Z');
    d.setUTCMonth(d.getUTCMonth() + offer.months);
    ctx.pendingConditionChoice = {
      kind: 'lock',
      id,
      value: d.toISOString().slice(0, 10),
    };
    return ctx.openJourney(
      'Review a savings lock',
      `<h3 class="idea-title">${esc(offer.rate)}</h3><p>Lock ${esc(item.name)} until ${conditionDate(ctx.pendingConditionChoice.value)} to receive this illustrative rate.</p><p>You can add money, but cannot withdraw or transfer money out before that date. Outgoing Money Rules will be skipped. Your current ${esc(item.personalOffer.rate)} returns when the lock ends.</p><label class="checkbox-label"><input id="lock-consent" type="checkbox"> I understand this money will be unavailable until ${conditionDate(ctx.pendingConditionChoice.value)}.</label>${button('Accept and lock pot', 'condition-choice-confirm', 'primary wide')}`,
    );
  }
  if (type === 'condition-choice-confirm') {
    const d = ctx.pendingConditionChoice;
    if (!d) throw new Error('Review your choice first.');
    if (d.kind === 'lock' && !document.querySelector('#lock-consent')?.checked)
      throw new Error('Confirm that you understand the lock before continuing.');
    transaction(
      p,
      d.kind === 'lock' ? 'Accepted savings lock' : 'Selected cashback supermarket',
      () => {
        const item = moneyContainer(p, d.id);
        item.arrangementState = {
          ...item.arrangementState,
          ...(d.kind === 'lock'
            ? {
                lockedUntil: d.value,
              }
            : {
                merchant: d.value,
                merchantSince: p.l1.asOf,
              }),
        };
      },
    );
    ctx.pendingConditionChoice = null;
    return ctx.refreshContainer(d.id, 'Your choice is saved');
  }
  if (type === 'agreement-close') return ctx.closeAgreementSheet();
  if (type === 'container-how') return ctx.openAgreementSheet(moneyContainer(p, id), 'overview');
  if (type === 'container-agreement') return ctx.openAgreementSheet(moneyContainer(p, id));
  if (type === 'container-members')
    return ctx.openJourney('Shared access', containerMembersView(p, moneyContainer(p, id)));
  if (type === 'container-invite-review') {
    const form = document.querySelector('#container-invite-form');
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    ctx.containerInviteDraft = {
      potId: id,
      name: values.get('name').trim(),
      role: values.get('role'),
    };
    if (!ctx.containerInviteDraft.name) throw new Error('Enter a member’s name.');
    return ctx.openJourney(
      'Review shared access',
      `${rows([
        ['Pot', moneyContainer(p, id).name],
        ['Member', ctx.containerInviteDraft.name],
        ['Access', ctx.containerInviteDraft.role],
        ['Other accounts and pots', 'Stay private'],
      ])}<p>The pot stays personal until the other person accepts. This demonstration records an invitation locally; no message is sent.</p>${button('Create demo invitation', 'container-invite-save', 'primary wide')}`,
    );
  }
  if (type === 'container-invite-save') {
    const d = ctx.containerInviteDraft;
    if (!d) throw new Error('Review an invitation first.');
    transaction(p, 'Created invitation for ' + d.name, () =>
      inviteToContainer(p, d.potId, d.name, d.role),
    );
    ctx.containerInviteDraft = null;
    ctx.render();
    return ctx.act('container-members:' + d.potId);
  }
  if (type === 'container-accept' || type === 'container-cancel-invite') {
    const request = p.ui.requests.find((r) => r.id === id);
    transaction(
      p,
      type === 'container-accept'
        ? 'Member accepted shared access in demo'
        : 'Cancelled pot invitation',
      () =>
        type === 'container-accept' ? acceptContainerInvite(p, id) : (request.status = 'Cancelled'),
    );
    return ctx.refreshContainer(request.potId, 'Shared access updated');
  }
  if (type === 'agreement-recovery') {
    const item = moneyContainer(p, id);
    ctx.supportController.before('pot:' + id);
    return ctx.openModal('Your cashback', agreementRecoveryView(p, item));
  }
  if (type === 'edit-pot') {
    const pot = p.l1.pots.find((x) => x.id === id);
    return ctx.openJourney(
      'Edit ' + pot.name,
      `<label class="field">Name<input id="pot-name" maxlength="40" value="${esc(pot.name)}"></label>${!pot.isDebt ? `<label class="field">Target<input id="pot-target" type="number" min="${pot.balance || 1}" value="${pot.target || ''}"></label>` : ''}${button('Save changes', 'save-pot:' + id, 'primary wide')}`,
    );
  }
  if (type === 'save-pot') {
    const pot = p.l1.pots.find((x) => x.id === id),
      name = document.querySelector('#pot-name').value.trim(),
      target = document.querySelector('#pot-target')?.value;
    if (!name) throw new Error('Give the pot a name.');
    if (target && Number(target) < pot.balance)
      throw new Error('Choose a target at least as large as the current balance.');
    return ctx.change('Updated ' + pot.name, () => {
      pot.name = name;
      if (target !== undefined) pot.target = Number(target) || null;
    });
  }
}
