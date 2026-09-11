import { potAppearance, appearanceStyle, potBackdrop, potColourControl } from './appearance.mjs';
import { moneyVisualRole, limitState } from '../../domain/visual-semantics.mjs';
import { quickActionsDialog } from '../now/actions.mjs';
import { conditionDate } from '../../domain/agreements.mjs';
import { cash, round, recentTransactions } from '../../domain/money.mjs';
import {
  moneyContainer,
  containerModel,
  containerNumber,
  attachedRules,
  ruleDescription,
  memberDetails,
  ruleBenefitLinks,
} from '../../domain/containers.mjs';
import {
  statusChip,
  esc,
  icon,
  button,
  rows,
  progress,
  bankAvatar,
  moneyHTML,
  quickActionButton,
  householdAvatar,
  householdStack,
} from '../../design-system/templates.mjs';
export function containerDetailView(p, item, options = {}) {
  const c = containerModel(p, item),
    activity = recentTransactions(p, item.id, 8),
    members = memberDetails(p, item),
    pending = p.ui.requests.filter(
      (r) => r.kind === 'pot-invite' && r.potId === item.id && r.status === 'Awaiting acceptance',
    );
  const target = c.target
    ? `<div class="container-target"><div class="target-heading"><b>${cash(c.target)} goal</b><span>${cash(Math.max(0, c.target - c.amount))} to go</span></div>${progress(c.progress, item.name + ' target', moneyVisualRole(c.type))}</div>`
    : '';

  const budget = options.now ? containerNumber(p, item).budget : null;
  const budgetVisual = budget
    ? `<div class="container-budget" data-budget-spent="${budget.spent}" data-budget-limit="${budget.limit}"><div class="target-heading"><b>${cash(budget.spent, true)} spent</b><span>of ${cash(budget.limit)} monthly budget</span></div>${progress(budget.spent / budget.limit, 'Monthly budget used', 'cash', limitState(budget.spent, budget.limit))}<p>${budget.spent > budget.limit ? cash(budget.spent - budget.limit, true) + ' over budget' : budget.spent === budget.limit ? 'Monthly budget reached' : cash(budget.limit - budget.spent, true) + ' of your budget unused'}</p></div>`
    : '';
  const config = containerQuickConfig(p, item),
    actions = [
      ...config.slots.map((id) => {
        const a = config.catalogue.find((x) => x[0] === id);
        return quickActionButton(a[1], a[2], a[3]);
      }),
      quickActionButton('More', 'grid', 'container-more:' + item.id),
    ];
  return `<div class="container-detail container-system" style="${appearanceStyle(potAppearance(p, item))}" data-container="${esc(item.id)}" data-container-type="${c.type}" data-large-number="${c.amount >= 100000}">${potBackdrop(p, item)}<section class="container-hero" data-container-section="balance"><div class="container-amount"><div><span class="container-value-label">${c.debt ? 'Left to repay' : c.type === 'investment' ? 'Investment value' : c.type === 'budget' ? 'Left to spend' : 'Available balance'}</span><div class="detail-number">${moneyHTML(c.amount)}</div></div><div class="container-facts"><div class="container-meta">${bankAvatar('hsbc')}<span><b>${esc(c.label)}</b>${item.masked ? `<small>•• ${esc(item.masked)}</small>` : ''}</span></div></div></div>${!c.account && !c.debt && c.type !== 'budget' ? potColourControl(p, item) : ''}${target}${budgetVisual}${members.length ? `<button class="container-members" data-action="container-members:${item.id}">${householdStack(members)}<span>${esc(members.map((m) => m.name.split(' ')[0]).join(', '))}</span>${icon('chev')}</button>` : pending.length ? `<button class="container-members" data-action="container-members:${item.id}">${icon('users')}<span>${pending.length} invitation pending</span>${icon('chev')}</button>` : ''}</section><section data-container-section="actions" class="quick-actions container-actions" aria-label="Related actions">${actions.join('')}</section>${item.spendingCategory === 'groceries' ? `<button class="gallery-row insight-link" data-action="module:grocery">${icon('chart')}<span><b>Grocery spending</b><small>Purchases across accounts and pots</small></span>${icon('chev')}</button>` : ''}${arrangementView(p, item, c)}<section data-container-section="activity" class="container-section"><header><h3>Recent activity</h3>${activity.length ? button('View all', 'container-activity:' + item.id, 'text') : ''}</header>${activity.length ? `<div class="container-ledger">${activity.map((x) => `<div><i class="activity-symbol">${icon(x.amount < 0 ? 'up' : 'down')}</i><span><b>${esc(x.counterparty)}</b><small>${esc(options.now ? conditionDate(x.date) : x.date)}</small></span><strong>${cash(x.amount, true)}</strong></div>`).join('')}</div>` : '<p class="activity-empty">No activity yet.</p>'}</section></div>`;
}
export function containerRuleRow(p, r) {
  const active = r.active && !p.l1.autonomy.paused && !(r.resumeOn > p.l1.asOf);
  return `<button class="container-rule" data-action="container-rule:${r.id}"><span class="container-rule-icon">${icon(active ? 'repeat' : 'pause')}</span><span class="container-rule-copy"><span class="rule-heading"><b>${esc(r.title || { 'round-up': 'Round-ups', 'payday-fixed': 'Payday contribution', repayment: 'Monthly repayment', 'standing-watch': 'Allocation watch', challenge: 'Conditional contribution' }[r.type] || 'Money rule')}</b>${statusChip(active ? 'Running' : r.active && r.resumeOn > p.l1.asOf ? 'Scheduled pause' : r.active ? 'System paused' : 'Paused', active ? 'neutral' : 'pending', active ? 'repeat' : 'pause')}</span><small>${esc(ruleDescription(p, r))}</small></span>${icon('chev')}</button>`;
}
export function containerInfoView(p, item) {
  const c = containerModel(p, item);
  return `<div class="connection-bank">${bankAvatar('hsbc')}<span><b>${esc(item.name)}</b><small>${esc(c.label)}</small></span></div>${rows([['Container', c.label], ['Ownership', c.shared ? 'Shared' : 'Personal'], ...(item.masked ? [['Account ending', '•• ' + item.masked]] : []), ...(c.debt ? [['Outstanding', cash(c.amount, true)], ...(item.limit ? [['Credit limit', cash(item.limit)]] : []), ...(item.interestMonthly != null ? [['Recorded monthly interest', cash(item.interestMonthly, true)]] : [])] : [['Balance', cash(c.amount, true)]]), ['Attached rules', c.rules.length], ...(c.target ? [['Target', cash(c.target)]] : [])], 'container-fact-grid')}${c.terms.length ? `<h3 class="dialog-section">Your terms</h3>${rows(c.terms)}` : ''}${c.agreement ? `<h3 class="dialog-section">${esc(c.agreement.label)}</h3><p>${esc(c.agreement.detail)}</p>` : ''}${button('Add to My numbers', 'preview-module:container-' + item.id, 'secondary wide')}`;
}
export function containerQuickConfig(p, item) {
  const c = containerModel(p, item),
    id = item.id;
  const catalogue = [
    ['add', c.debt ? 'Repay' : 'Add money', 'plus', 'transfer-to:' + id],
    ...(!c.debt ? [['move', 'Move money', 'swap', 'transfer-from:' + id]] : []),
    ['info', 'Account info', 'info', 'container-info:' + id],
    ...(!c.account && !c.debt
      ? [
          [
            'goal',
            c.type === 'budget' ? 'Spending limit' : 'Edit goal',
            c.type === 'budget' ? 'basket' : 'target',
            c.type === 'budget' ? 'wallet-settings:' + id : 'edit-pot:' + id,
          ],
        ]
      : []),
    ...(!c.account && !c.debt && c.type !== 'budget'
      ? [['appearance', 'Personalise', 'spark', 'pot-personalise:' + id]]
      : []),
    ['rule', 'Add a rule', 'repeat', 'container-rule-new:' + id],
    ['number', 'My numbers', 'grid', 'preview-module:container-' + id],
    ...(!c.account && !c.debt && c.type !== 'investment'
      ? [['share', c.shared ? 'Shared access' : 'Share pot', 'users', 'container-members:' + id]]
      : []),
    ...(!c.account && !c.shared && c.type === 'savings'
      ? [['invest', 'Explore investing', 'trend', 'container-evolve:' + id]]
      : []),
    ['activity', 'Activity', 'clock', 'container-activity:' + id],
    ['help', 'Ask AI', 'assistant', (c.account ? 'account-chat:' : 'pot-chat:') + id],
  ];
  const saved = p.ui.containerQuickActions?.[id],
    defaults = c.debt ? ['add', 'info'] : ['add', 'move', 'info'];
  return {
    catalogue,
    slots: (saved || defaults).filter((id) => catalogue.some((a) => a[0] === id)).slice(0, 3),
    heading: 'On this ' + (c.account ? 'account' : 'pot'),
  };
}
export function containerMoreView(p, item, editing = false, selected = null, draft = null) {
  const config = containerQuickConfig(p, item);
  return quickActionsDialog(
    { ...p, ui: { ...p.ui, quickActions: draft || config.slots } },
    editing,
    selected,
    config,
  );
}
export function containerRuleForm(p, item, rule = null) {
  const all = [...p.l1.accounts, ...p.l1.pots],
    source =
      rule?.source ||
      (item.id === 'ac-cur'
        ? all.find((x) => x.id !== item.id && !x.isDebt && x.owed == null)?.id
        : 'ac-cur'),
    target = rule?.potId || item.id;
  return `<p>${rule ? 'Refine this money rule.' : 'Choose a trigger and where the money should go.'} You’ll review everything before agreeing.</p><form id="container-rule-form"><input type="hidden" name="id" value="${esc(rule?.id || '')}"><label class="field">When<select name="type">${[...(rule?.type === 'challenge' ? [['challenge', 'Monthly review · keep the existing condition']] : []), ['payday-fixed', 'When I get paid · fixed amount'], ['repayment', 'Each month · repayment'], ['round-up', 'When I spend · round-ups'], ['payday-sweep', 'When I get paid · sweep what’s left']].map(([v, t]) => `<option value="${v}" ${rule?.type === 'challenge' && v !== 'challenge' ? 'disabled' : ''} ${rule?.type === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label>${rule?.condition ? `<div class="notice">Condition retained: ${esc(rule.condition)}</div>` : ''}<label class="field">From<select name="source">${all
    .filter((x) => !x.isDebt && x.owed == null)
    .map(
      (x) => `<option value="${x.id}" ${x.id === source ? 'selected' : ''}>${esc(x.name)}</option>`,
    )
    .join(
      '',
    )}</select></label><label class="field">To<select name="potId">${all.map((x) => `<option value="${x.id}" ${x.id === target ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label><label class="field" id="rule-fixed-field">Amount per payment (£)<input name="amount" type="number" min="0.01" max="100000" step="0.01" value="${rule?.amount || 50}" required></label><label class="field">Maximum each month (£)<input name="limitMonthly" type="number" min="0.01" max="100000" step="0.01" value="${rule?.limitMonthly || rule?.amount || 50}" required></label><label class="field">Always leave in the source (£)<input name="reserve" type="number" min="0" max="10000000" step="0.01" value="${rule?.reserve || 0}" required></label><p id="rule-trigger-explanation" class="support">Money moves only when the trigger occurs and funds are available.</p>${button('Review rule', 'container-rule-review:' + item.id, 'primary wide', 'type="button"')}</form>`;
}
export function containerRuleDetail(p, r) {
  const to = moneyContainer(p, r.potId),
    from = moneyContainer(p, r.source),
    watch = r.type === 'standing-watch',
    title =
      r.title ||
      {
        'payday-fixed': 'Save on payday',
        repayment: 'Monthly repayment',
        'round-up': 'Save your round-ups',
        'payday-sweep': 'Save what’s left',
        challenge: 'Save when your rule is met',
        'standing-watch': 'Watch your investments',
      }[r.type] ||
      'Money Rule';
  return `${statusChip(r.active && r.resumeOn > p.l1.asOf ? 'Scheduled pause' : r.active && !p.l1.autonomy.paused ? 'Running' : r.active ? 'System paused' : 'Paused', r.active && !p.l1.autonomy.paused ? 'neutral' : 'pending', r.active && !p.l1.autonomy.paused ? 'repeat' : 'pause', 'rule-detail-status')}<h3 class="idea-title">${esc(title)}</h3><p>${esc(ruleDescription(p, r))}</p>${rows(
    [
      ['From', from?.name || 'Allocation monitoring'],
      ['To', to?.name || 'Your portfolio'],
      ...(!watch
        ? [
            ['Monthly limit', cash(r.limitMonthly || r.amount)],
            ...(r.reserve ? [['Always left in source', cash(r.reserve)]] : []),
          ]
        : []),
      [
        'Ends',
        to?.isDebt
          ? 'When the loan is repaid'
          : to?.stopsAtTarget
            ? 'When the target is reached'
            : 'When you pause the rule',
      ],
    ],
  )}${r.note || r.condition ? `<p class="support">${esc(r.note || r.condition)}</p>` : ''}<p class="support">${watch ? 'Monitoring never places a trade. Any rebalance needs your review.' : r.type === 'round-up' || r.type === 'payday-sweep' ? 'Variable contributions depend on future activity. New variable rules are excluded from the fixed monthly projection.' : 'If the source balance cannot cover the payment and your protected amount, the move is skipped.'}</p>${methodContextView(p, r)}${to?.isDebt ? '<p class="support">Pausing this rule does not cancel a required loan payment.</p>' : ''}<div class="button-stack">${button(r.active ? 'Pause rule' : 'Resume rule', 'container-rule-toggle:' + r.id, 'primary wide')}${!watch && ['payday-fixed', 'repayment', 'round-up', 'payday-sweep', 'challenge'].includes(r.type) ? button('Edit rule', 'container-rule-edit:' + r.id, 'secondary wide') : ''}${!watch ? button('Remove rule', 'container-rule-remove:' + r.id, 'text wide') : ''}</div>${r.lastOutcome ? `<div class="notice">Last demo outcome · ${esc(r.lastOutcome.reason)} ${r.lastOutcome.amount ? cash(r.lastOutcome.amount) + ' moved.' : 'No money moved.'}</div>` : ''}${!watch && r.type !== 'challenge' ? `<details class="terms"><summary>Try this rule in the demo</summary><p class="support">Preview a sample trigger before applying it to these demo balances. No real payment is sent.</p>${button('Preview sample trigger', 'container-trigger:' + r.id, 'secondary wide')}</details>` : ''}`;
}
export function containerMembersView(p, item) {
  const members = memberDetails(p, item),
    pending = p.ui.requests.filter(
      (r) => r.kind === 'pot-invite' && r.potId === item.id && r.status === 'Awaiting acceptance',
    );
  return `<h3 class="idea-title">One pot. Agreed access.</h3><p>Only ${esc(item.name)} is shared. Everything else stays private.</p><div class="container-people">${(members.length ? members : [{ id: p.l1.customer.id, name: p.l1.customer.firstName, role: 'Owner · personal pot' }]).map((m) => `<div>${householdAvatar(m.id, m.name)}<span><b>${esc(m.name)}</b><small>${esc(m.role)}</small></span></div>`).join('')}</div>${pending.map((r) => `<div class="container-invitation"><b>${esc(r.name)}</b><p>${esc(r.role)} · waiting for acceptance</p><small>No invitation has been sent. Use the demo control to preview the member’s acceptance.</small>${button('Simulate acceptance', 'container-accept:' + r.id, 'secondary wide')}${button('Cancel invitation', 'container-cancel-invite:' + r.id, 'text')}</div>`).join('')}<form id="container-invite-form" data-container="${item.id}"><label class="field">Member’s name<input name="name" maxlength="50" required placeholder="Who would you like to invite?"></label><label class="field">Their access<select name="role"><option>Contributor</option><option>View only</option></select></label><p class="support">Contributors can add money and see this pot’s activity. View-only members cannot move money. Neither can change your personal rules.</p>${button('Review invitation', 'container-invite-review:' + item.id, 'primary wide', 'type="button"')}</form>`;
}

export function conditionControls(p, item, c) {
  if (c.kind === 'payment')
    return `<div class="condition-controls">${c.remaining ? button(moneyContainer(p, item.id).isDebt ? 'Make a repayment' : 'Add money', 'condition-pay:' + item.id + '/' + c.id, 'secondary') : ''}${button(c.ruleIds.length ? 'Manage payments' : 'Automate this', 'condition-method:' + item.id + '/' + c.id, 'text')}</div>`;
  if (c.kind === 'choice')
    return button(
      item.arrangementState?.merchant ? 'Change' : 'Choose supermarket',
      'condition-merchant:' + item.id,
      'text',
    );
  if (c.kind === 'lock')
    return c.status === 'Locked'
      ? ''
      : button('Review lock option', 'condition-lock:' + item.id, 'text');
  if (c.kind === 'spending' && item.personalOffer?.recovery)
    return '<p class="support">This agreement’s £320 limit applies through September.</p>';
  if (c.kind === 'spending') return button('Edit limit', 'wallet-settings:' + item.id, 'text');
  if (c.kind === 'capital')
    return button('View investment approach', 'container-info:' + item.id, 'text');
  if (c.kind === 'statement') return button('View statements', 'statements', 'text');
  return '';
}
// A compact overview first; conditions and fulfilment controls are disclosed on demand.
export function arrangementOverview(a) {
  const r = a.recovery,
    issue = a.conditions.find((x) => ['Over limit', 'Below threshold'].includes(x.status)),
    action = a.conditions.find((x) => x.status === 'Your action'),
    choice = a.conditions.find((x) => x.status === 'Your choice' && x.kind !== 'lock');
  if (r?.failed && !r.restored)
    return {
      tone: r.ready ? 'pending' : 'attention',
      icon: r.ready ? 'clock' : 'info',
      status: r.ready ? 'Return scheduled' : 'Benefit changed',
      message: r.ready
        ? r.summary
        : 'August’s contribution was ' + cash(r.required - r.before) + ' short.',
    };
  if (issue)
    return { tone: 'attention', icon: 'info', status: 'Needs attention', message: issue.title };
  if (action)
    return {
      tone: 'action',
      icon: 'clock',
      status: 'Payment to make',
      message: cash(action.remaining) + ' due by ' + conditionDate(action.due) + '.',
    };
  if (choice) return { tone: 'action', icon: 'info', status: 'Your choice', message: choice.title };
  if (r?.restored)
    return {
      tone: 'normal',
      icon: 'check',
      status: 'Back on track',
      message: 'Your cashback is available again.',
    };
  const planned = a.conditions.find((x) => x.status === 'Planned'),
    locked = a.conditions.find((x) => x.status === 'Locked');
  return {
    tone: 'normal',
    icon: locked ? 'lock' : planned ? 'clock' : 'check',
    status: locked
      ? 'Locked'
      : planned
        ? 'Payment planned'
        : a.conditions.length
          ? 'On track'
          : 'Current',
    message: locked
      ? locked.description
      : planned
        ? planned.method
        : a.conditions.length
          ? 'View your conditions and payments.'
          : 'No conditions to meet.',
  };
}
export function arrangementView(p, item, c = containerModel(p, item)) {
  const a = c.arrangement,
    v = arrangementOverview(a),
    used = new Set(a.conditions.flatMap((x) => x.ruleIds || [])),
    optional = c.rules.filter((r) => !used.has(r.id)),
    active = c.running.length,
    paused = c.rules.length - active,
    ruleSummary = !c.rules.length
      ? 'No rules attached'
      : p.l1.autonomy.paused
        ? c.rules.length +
          ' ' +
          (c.rules.length === 1 ? 'rule' : 'rules') +
          ' · all paused globally'
        : active +
          ' active ' +
          (active === 1 ? 'rule' : 'rules') +
          (paused ? ' · ' + paused + ' paused' : '');
  return `<section class="pot-arrangement" data-container-section="arrangement"><header><h3>How it works</h3></header><button class="arrangement-surface arrangement-disclosure arrangement-overview" data-status="${v.tone}" data-action="container-how:${item.id}" aria-haspopup="dialog">${statusChip(v.status, v.tone === 'attention' ? 'attention' : v.tone === 'normal' ? 'neutral' : 'pending', v.icon, 'arrangement-status')}<span class="arrangement-benefit"><span>${esc(a.label)}</span><strong>${esc(a.benefit)}</strong></span><span class="arrangement-summary">${esc(v.message)}</span><span class="arrangement-rule-summary">${icon(paused && !active ? 'pause' : 'repeat')}<span>${esc(ruleSummary)}</span></span><span class="arrangement-explore"><span>View details</span>${icon('chev')}</span></button></section>`;
}
export function containerHowView(p, item) {
  const c = containerModel(p, item),
    a = c.arrangement,
    v = arrangementOverview(a),
    r = a.recovery,
    used = new Set(a.conditions.flatMap((x) => x.ruleIds || [])),
    optional = c.rules.filter((x) => !used.has(x.id));
  return `<div class="how-sheet" data-status="${v.tone}"><div class="how-benefit">${statusChip(v.status, v.tone === 'attention' ? 'attention' : v.tone === 'normal' ? 'neutral' : 'pending', v.icon, 'arrangement-status')}<div class="arrangement-benefit"><span>${esc(a.label)}</span><strong>${esc(a.benefit)}</strong></div></div>${r?.failed ? `<section class="arrangement-recovery"><p>${esc(r.restored ? 'Your cashback is available again.' : r.ready ? 'Your September contribution is complete.' : 'August’s contribution was ' + cash(r.required - r.before) + ' short. Your cashback changed from ' + r.normalBenefit + ' to ' + r.changedBenefit + ' on ' + conditionDate(r.changedOn) + '.')}</p><b>${esc(r.summary)}</b>${!r.restored ? '<p>Cashback already earned stays yours. There’s no fee.</p>' : ''}${button('Review my options', 'agreement-recovery:' + item.id, 'text')}</section>` : ''}${a.conditions.length ? `<h3 class="how-section-title">What you need to do</h3><div class="how-conditions">${a.conditions.map((x) => `<section class="pot-condition ${['Complete', 'Selected', 'Within limit', 'Met today'].includes(x.status) ? 'is-met' : ''}" data-condition="${x.id}"><div class="condition-heading"><h4>${esc(x.title)}</h4>${statusChip(x.status, ['Complete', 'Selected', 'Within limit', 'Met today', 'Locked'].includes(x.status) ? 'neutral' : 'pending', ['Complete', 'Selected', 'Within limit', 'Met today'].includes(x.status) ? 'check' : x.status === 'Locked' ? 'lock' : 'clock')}</div><div class="condition-content"><p>${esc(x.description)}</p>${x.kind === 'payment' && x.remaining ? progress(Math.min(1, x.received / x.required), x.title, 'savings') : ''}${x.kind === 'payment' ? `<p class="condition-method">${icon(x.scheduled ? 'repeat' : 'user')}${esc(x.method)}</p>` : ''}${conditionControls(p, item, x)}</div></section>`).join('')}</div>` : '<p class="support">No conditions to meet.</p>'}${optional.length ? `<section class="how-optional"><h3 class="how-section-title">Other money moves</h3>${optional.map((x) => containerRuleRow(p, x)).join('')}</section>` : ''}<footer>${button('View full agreement', 'container-agreement:' + item.id, 'text')}</footer></div>`;
}
export function conditionMethodsView(p, item, condition) {
  const rules = p.l1.rules.filter((r) => condition.ruleIds.includes(r.id));
  return `<div class="method-overview"><span class="eyebrow">${esc(item.name)}</span><h3>${esc(condition.title)}</h3><p>${esc(condition.description)}</p><p>${condition.remaining ? 'Automatic payments help you stay on time. If you prefer to pay manually, the same amount and due date apply.' : 'This month is complete. Changing an automatic payment cannot undo money already received.'}</p></div>${rules.map((r) => containerRuleRow(p, r)).join('')}${!rules.length ? '<p class="support">You’re paying manually. Set up an automatic payment for extra peace of mind.</p>' : ''}${button('Set up an automatic payment', 'condition-automate:' + item.id + '/' + condition.id, 'secondary wide')}${condition.remaining ? button('Pay manually', 'condition-pay:' + item.id + '/' + condition.id, 'text wide') : ''}`;
}
export function methodContextView(p, r) {
  const link = ruleBenefitLinks(p, r)[0];
  if (!link) return '';
  const x = link.condition;
  return `<div class="method-overview"><small>${esc(link.name)} · ${esc(link.benefit)}</small><h3>${esc(x.title)}</h3><p>${esc(x.description)}</p><p>Changing this instruction changes how you pay. Your agreement and money already received stay in place.</p></div>`;
}
export function containerAgreementView(p, item) {
  const a = containerModel(p, item).arrangement;
  return `<div class="agreement-full"><div class="agreement-heading"><span>${esc(item.name)}</span>${statusChip(a.benefitState)}</div><div class="agreement-line agreement-benefit"><small>${esc(a.label)}</small><p><strong>${esc(a.benefit)}</strong></p></div>${a.conditions.map((c) => `<div class="agreement-line"><small>${esc(c.kind === 'payment' ? 'Your contribution' : c.kind === 'choice' ? 'Your choice' : 'Your commitment')}</small><p><b>${esc(c.title)}</b><br>${esc(c.description)}</p></div>`).join('')}<div class="agreement-terms"><h3>Your terms</h3><p>${esc(a.terms)}</p>${a.shared ? '<p>Only this pot is shared. Each member keeps control of their own payments. The owner reviews changes to shared terms.</p>' : ''}</div><small class="agreement-disclaimer">Illustrative concept agreement. Current-month receipts use the scenario snapshot; no real instruction or contract is created.</small></div>`;
}
export function agreementEffectsView(effects) {
  return effects
    .map(
      (e) =>
        `<section class="method-overview" data-benefit-impact="${e.potId}"><small>${esc(e.name)} · ${esc(e.benefit)}</small><h3>${e.after.remaining ? 'Your contribution stays the same' : 'This month is already complete'}</h3><p>${cash(e.after.received)} received of ${cash(e.after.required)}. ${e.after.remaining ? cash(e.after.remaining) + ' is still due by ' + e.after.due + '.' : 'Changing automation does not undo this payment.'}</p><div class="method-change"><span>Automatic payment</span><b>${cash(e.before.scheduled)} → ${cash(e.after.scheduled)}/month</b></div><p>${e.after.remaining ? (e.after.scheduled >= e.after.remaining ? 'Your automatic payment is planned to cover the remainder. We’ll confirm once it arrives.' : cash(Math.max(0, e.after.remaining - e.after.scheduled)) + ' will need to be paid manually by the due date. You remain responsible for paying on time.') : 'Your new settings apply to future payments. Keep meeting the contribution each month, manually or automatically.'}</p><small>Your current benefit is unchanged by this instruction.</small></section>`,
    )
    .join('');
}

export function agreementRecoveryView(p, item) {
  const a = containerModel(p, item).arrangement,
    r = a.recovery;
  if (!r) return '<p>No benefit change is recorded for this pot.</p>';
  const late = p.l1.asOf > r.qualifyEnd;
  return `<div class="recovery-detail"><span class="eyebrow">${esc(item.name)} · benefit update</span><h3 class="idea-title">${r.restored ? 'Your cashback is back' : r.ready ? 'Ready for next month' : 'Let’s get your cashback back'}</h3><p>${r.restored ? 'You met September’s conditions. Eligible purchases earn 1% cashback again from ' + conditionDate(r.restoreOn) + '.' : 'Some months need a little flexibility. Your pot is still yours to use, and there’s a clear route back to your benefit.'}</p><div class="recovery-change"><span><small>Until 31 Aug</small><b>${esc(r.normalBenefit)}</b></span>${icon('arrow')}<span><small>From ${conditionDate(r.restored ? r.restoreOn : r.changedOn)}</small><b>${esc(r.benefit)}</b></span></div><h3>What happened</h3><p>${cash(r.before)} of the ${cash(r.required)} August contribution arrived by 31 August. Under this example agreement, September cashback changed to 0%. Cashback already earned stays yours. There’s no fee or backdated deduction.</p><h3>${r.restored ? 'What helped' : 'Your next step'}</h3><p>${r.ready ? 'September’s contribution is complete. ' + (r.restored ? 'Your benefit has returned.' : 'Keep your nominated supermarket and stay within your spending limit; 1% returns on ' + conditionDate(r.restoreOn) + '.') : late ? 'September’s recovery window has ended. Let’s review an affordable plan together.' : r.missing === 0 ? r.summary : cash(r.paid) + ' received in September. Add ' + cash(r.missing) + ' by ' + conditionDate(r.qualifyEnd) + ', keep your nominated supermarket and stay within your spending limit. Then 1% can return on ' + conditionDate(r.restoreOn) + '.'}</p>${r.missing > 0 && !late ? button('Add ' + cash(r.missing) + ' to this pot', 'condition-pay:' + item.id + '/funding', 'primary wide') : ''}${!item.arrangementState?.merchant && !late ? button('Choose my supermarket', 'condition-merchant:' + item.id, 'secondary wide') : ''}${!late ? button('Manage how I contribute', 'condition-method:' + item.id + '/funding', 'secondary wide') : ''}${button('Help me find an affordable plan', 'recovery-help:' + item.id, 'text wide')}${button('Keep using my pot', 'pot:' + item.id, 'text wide')}<p class="support">Paying now does not change the August result or earn September cashback. You can keep using this pot without its cashback benefit. These rates and dates are illustrative concept terms.</p></div>`;
}
