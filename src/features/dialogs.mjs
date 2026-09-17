import { companionAvatar } from './companion/identity.mjs';
import { companionPreferences } from './companion/model.mjs';
import { displayDate } from '../domain/dates.mjs';
import { pointsActivityEntry } from './badges/views.mjs';
import { badgeArt } from './badges/art.mjs';
import { challenges } from './badges/catalog.mjs';
import { badgeSummary } from './badges/model.mjs';
import { numberIdeas } from '../domain/number-visuals.mjs';
import { agentAvatar, bankAvatar, statusChip } from '../design-system/templates.mjs';
import {
  clone,
  cash,
  totals,
  potRate,
  milestone,
  dateAt,
  valueAt,
  previewPerson,
  sum,
  recentTransactions,
  rewardAvailability,
} from '../domain/money.mjs';
import { moduleModel, potIcons } from '../domain/numbers.mjs';
import { moduleCard, esc, icon, button, rows, progress } from '../design-system/templates.mjs';
import { potRow } from './screens.mjs';
export function collectionDialog(p) {
  const all = [...p.l1.accounts, ...p.l1.pots];
  return `<div class="collection-total"><span class="eyebrow">TOTAL HELD</span><div class="detail-number">${cash(totals(p).held)}</div>${rows(
    [
      ['Owed', cash(totals(p).owed)],
      ['Net worth', cash(totals(p).net)],
    ],
  )}</div><h3 class="dialog-section">Your money containers</h3>${all
    .map((x) => {
      const account = p.l1.accounts.includes(x),
        debt = x.isDebt || x.owed != null;
      return `<button class="account-row" data-action="${account ? 'account' : 'pot'}:${x.id}"><span class="bank-tile">${icon(account ? 'card' : potIcons[x.id] || 'wallet')}</span><span><b>${esc(x.name)}</b><small>${esc(account ? (x.kind === 'credit' ? 'Credit · •• ' + x.masked : 'Everyday · •• ' + x.masked) : debt ? 'Borrowing' : x.growthAnnual ? 'Investing' : x.members ? 'Shared' : 'Saving')}</small></span><strong>${cash(x.balance ?? x.owed, true)}${debt ? '<small>to repay</small>' : ''}</strong>${icon('chev')}</button>`;
    })
    .join('')}${button('Create a pot', 'newplan', 'secondary')}`;
}
export function accountDialog(p, a) {
  return containerDialog(p, a, true);
}
export function potDialog(p, pot) {
  return containerDialog(p, pot, false);
}
export function containerDialog(p, item, isAccount = false) {
  const debt = !!(item.isDebt || item.owed != null),
    amount = item.balance ?? item.owed;
  const rate = isAccount ? 0 : potRate(p, item),
    m = isAccount ? null : milestone(p, item),
    rules = p.l1.rules.filter((r) => r.potId === item.id);
  const type = isAccount
    ? debt
      ? 'Credit'
      : 'Everyday'
    : debt
      ? 'Borrowing'
      : item.growthAnnual
        ? 'Investing'
        : item.members
          ? 'Shared saving'
          : 'Saving';
  const features = isAccount
    ? debt
      ? [
          ['Credit limit', cash(item.limit || 0)],
          ['Available credit', cash(Math.max(0, (item.limit || 0) - (item.owed || 0)))],
          ['Monthly interest', cash(item.interestMonthly || 0, true)],
          ['Repayment', item.paidInFull ? 'Paid in full' : 'Monthly payment'],
        ]
      : [
          ['Purpose', item.description],
          ['Move money', 'Between accounts and pots'],
          ['Activity', 'Payments in and out'],
        ]
    : [
        ['Monthly plan', cash(Math.abs(rate))],
        ['Target', item.target ? cash(item.target) : 'Open-ended'],
        ['Target date', m === null ? 'No date yet' : m === 0 ? 'Reached' : dateAt(p, m)],
      ];
  const information = [
    ['Container', item.name],
    ['Features', type],
    ...(item.masked ? [['Account ending', '•• ' + item.masked]] : []),
    ...(item.cardScheme ? [['Card scheme', item.cardScheme]] : []),
    ...(item.createdOn ? [['Created', item.createdOn]] : []),
  ];
  const activity = p.l1.transactions
    .filter((x) => x.ledger === item.id)
    .slice(-8)
    .reverse();
  const assist = isAccount
    ? debt
      ? `${cash(item.owed, true)} to repay. Explore the balance and your next payment.`
      : 'See what has moved, understand the balance, or talk through a next step.'
    : m === null
      ? 'Choose a rule or talk through what this money is for.'
      : `${cash(Math.abs(rate))} a month · ${dateAt(p, m)}. Explore what comes next.`;
  return `<div class="container-detail" data-container="${esc(item.id)}">${isAccount ? `<div class="connection-bank">${bankAvatar('hsbc')}<span><b>HSBC</b><small>${esc(type)} account</small></span></div>` : ''}<section data-container-section="balance"><span class="eyebrow">${esc(type)}${item.masked ? ' · •• ' + esc(item.masked) : ''}</span><div class="detail-number">${cash(amount, true)}</div><p class="support">${debt ? 'Left to repay' : item.target ? 'of ' + cash(item.target) : isAccount ? 'Available balance' : 'Held in this pot'}</p>${item.target ? progress(item.balance / item.target, item.name) : ''}</section><div class="button-row" data-container-section="actions">${button(debt ? 'Make a payment' : isAccount ? 'Move money' : 'Add money', isAccount && !debt ? 'transfer' : 'transfer-to:' + item.id, 'primary')}${!isAccount ? button('Edit plan', 'edit-pot:' + item.id, 'secondary') : ''}</div><button class="pot-companion" data-action="${isAccount ? 'account-chat' : 'pot-chat'}:${item.id}">${icon('spark')}<span><b>Make sense of this money</b><small>${esc(assist)}</small></span>${icon('arrow')}</button><section data-container-section="features"><h3 class="dialog-section">Features & rules</h3>${rows(features)}${!isAccount ? `${rules.map((r) => ruleRow(p, r)).join('') || '<p class="support">No rules yet. Choose an amount and a rhythm.</p>'}${button('Add a rule', 'new-rule:' + item.id, 'text')}<p class="support">${debt || item.stopsAtTarget ? 'At the target, this pot’s rule stops. You choose what happens next.' : 'This plan continues until you pause its rules.'}</p>` : ''}${p.l1.rewards.activeBenefits
    .filter((b) => b.potId === item.id)
    .map(
      (b) =>
        `<div class="notice">${esc(b.title)} · active in this demonstration. Product interest is not included in the projection.</div>`,
    )
    .join(
      '',
    )}</section><section data-container-section="information"><h3 class="dialog-section">Information</h3>${rows(information)}${item.terms ? `<details class="terms"><summary>Your terms</summary>${rows(item.terms)}</details>` : ''}${item.members ? '<p class="support">Members can see shared activity. Other containers stay private.</p>' : ''}</section><section data-container-section="activity"><h3 class="dialog-section">Activity</h3>${activity.length ? rows(activity.map((x) => [x.counterparty, x.date, cash(x.amount, true)])) : '<p class="support">No activity recorded for this container in this snapshot.</p>'}<button class="gallery-row" data-action="receipts"><span>See changes you’ve made</span>${icon('arrow')}</button></section></div>`;
}
export function ruleRow(p, r) {
  const pot = p.l1.pots.find((x) => x.id === r.potId);
  const scheduled = r.active && r.resumeOn && r.resumeOn > p.l1.asOf;
  const running = r.active && !p.l1.autonomy.paused && !scheduled;
  return `<div class="rule-row"><span>${icon(running ? 'repeat' : 'clock')}<span><b>${esc(r.title || pot?.name || 'Scheduled move')}</b><small>${cash(r.amount)} a month${scheduled ? ' · resumes ' + esc(r.resumeOn) : ''}</small>${statusChip(running ? 'Running' : scheduled ? 'Scheduled pause' : 'Paused', running ? 'neutral' : 'pending')}</span></span>${button(r.active ? 'Pause' : 'Resume', 'rule-toggle:' + r.id, 'text')}</div>`;
}
export function rulesDialog(p) {
  return `<div class="detail-number">${cash(totals(p).speed)}<small>/month</small></div><p>Your agreed rules. Pause one at a time, or step everything down in You.</p>${p.l1.spending.softCaps ? rows(Object.entries(p.l1.spending.softCaps).map(([k, v]) => [k + ' · soft monthly budget', cash(v)])) : ''}${p.ui.redirects.map((r) => `<p class="support">After ${esc(p.l1.pots.find((x) => x.id === r.from)?.name)} finishes, its contributions go to ${esc(p.l1.pots.find((x) => x.id === r.to)?.name)}.</p>`).join('')}${p.l1.rules.map((r) => ruleRow(p, r)).join('') || '<p class="support">No rules are running yet.</p>'}`;
}
export function ideaDialog(p, w) {
  const trial = clone(p);
  if (!trial.ui.preview.includes(w.id) && (w.canCommit || w.type === 'illustration'))
    trial.ui.preview.push(w.id);
  const pp = previewPerson(trial),
    e = w.effect,
    initial = e.newPot?.monthlyRate ?? e.monthlyRateDelta ?? e.monthlyAmount;
  const pot = e.potId
    ? p.l1.pots.find((x) => x.id === e.potId)
    : e.to
      ? p.l1.pots.find((x) => x.id === e.to)
      : null;
  const active = p.ui.preview.includes(w.id),
    canPreview = w.canCommit || w.type === 'illustration';
  const projectedPot = pot
    ? pp.l1.pots.find((x) => x.id === pot.id)
    : pp.l1.pots.find((x) => x.id === 'plan-' + w.id);
  const targetDate = (person, plan) => {
    const m = plan ? milestone(person, plan) : null;
    return m === null ? 'Open-ended' : dateAt(person, m);
  };
  return `<span class="eyebrow">${w.canCommit ? 'A POSSIBILITY' : 'AN ILLUSTRATION'}</span><h3 class="idea-title">${esc(w.title)}</h3><p>${esc(w.explainer)}</p>${initial ? `<div class="idea-amount">${cash(initial)}<small>/month${e.from ? ' · redirected' : e.monthlyRateDelta ? ' more' : ''}</small></div>` : ''}${rows(
    [
      ['Today’s monthly plans', cash(totals(p).speed)],
      ['With this idea', cash(totals(pp).speed)],
      ['Money moved so far', '£0'],
    ],
  )}${
    projectedPot
      ? rows([
          ['Target at today’s rate', pot ? targetDate(p, pot) : 'No plan yet'],
          ['With this idea', targetDate(pp, projectedPot)],
        ])
      : rows([
          ['Today’s net worth', cash(totals(p).net)],
          ['In five years · illustrated', cash(totals(p, 60).net)],
          ['In ten years · illustrated', cash(totals(p, 120).net)],
        ])
  }${pot ? `<p class="support">${esc(pot.name)} today: ${cash(pot.balance)}. Every projection updates when you try this idea.</p>` : ''}${w.type === 'cap' ? '<div class="notice">A soft budget, never a card restriction. The projection assumes the monthly saving is available to move.</div>' : ''}${w.effect.newPot?.openingBalance ? `<div class="notice">Starting this plan moves ${cash(w.effect.newPot.openingBalance)} from your current account into the new pot. The monthly rule starts after that.</div>` : ''}<div class="button-stack">${canPreview ? button(active ? 'Remove from preview' : 'Try this What If', 'toggle-idea:' + w.id, active ? 'secondary' : 'primary') : button('Explore with an expert', 'human', 'primary')}${w.canCommit ? button('Review and start', 'review-idea:' + w.id, 'text') : canPreview ? button('Explore with an expert', 'human', 'text') : ''}</div><p class="support">${w.canCommit ? 'Trying an idea changes the picture, not your money. Review the amount and agree before anything starts.' : 'This idea does not change your accounts or permissions. A human reviews plans and financial decisions.'}</p>`;
}
export function reviewIdeaDialog(p, w) {
  const e = w.effect,
    amount = e.newPot?.monthlyRate ?? e.monthlyRateDelta ?? e.monthlyAmount;
  return `<p>${esc(w.title)}</p>${rows([
    ['Monthly amount', cash(amount || 0)],
    ['Starts', 'Next payday'],
    ['Starting transfer', cash(e.newPot?.openingBalance || 0)],
    ['Exit', 'Pause or undo any time'],
  ])}${!e.from ? `<label class="field">${e.monthlyRateDelta ? 'Extra each month' : 'Each month'}<span class="input-money"><span>£</span><input id="commit-amount" type="number" min="1" step="1" value="${amount}" inputmode="decimal" required></span></label>` : ''}${e.newPot?.growthAnnual || /investment/i.test(w.title) ? `<div class="human-review">${agentAvatar('maya')}<span><b>Maya · Financial planning</b><small>Demo review: discuss the growth assumption, your allocation and your ability to hold through a fall.</small></span></div><label class="checkbox-label"><input id="advice-agreed" type="checkbox"> I’ve reviewed this illustrative plan with Maya.</label>` : ''}<p class="support">A receipt will record this change. You can undo it from Activity.</p>${button('Agree and start', 'commit-idea:' + w.id, 'primary wide')}`;
}
export function quizDialog(p, data, answers) {
  const q = data.shared.modules.quiz[answers.length];
  if (!q)
    return `<div class="success-mark">${icon('check')}</div><h3 class="idea-title">${esc(p.l2.personality.name)}</h3><p>${esc(p.l2.personality.copy)}</p><div class="notice">Your answers have been saved. Points are awarded once per quiz.</div>${button('See your picture', 'quiz-finish', 'primary wide')}`;
  return `<span class="eyebrow">QUESTION ${answers.length + 1} OF 3</span><div class="quiz-progress">${[0, 1, 2].map((i) => `<i class="${i <= answers.length ? 'active' : ''}"></i>`).join('')}</div><h3 class="quiz-question">${esc(q.q)}</h3><div class="quiz-options">${q.o.map((o, i) => button(o, 'answer:' + i, 'quiz-option')).join('')}</div><p class="support">Your answers are a starting point, never a label you have to keep.</p>`;
}
export { immersiveStory as storyDialog } from './stories/views.mjs';
export function pointsDialog(p, data) {
  return `<span class="eyebrow">HSBC POINTS</span><div class="detail-number">${p.l1.rewards.points.balance.toLocaleString('en-GB')}</div><p>Earn Points through everyday money habits, sharing what matters to you and completing challenges.</p><button class="points-challenge-link" data-action="badges">${badgeArt(challenges[0], badgeSummary(p).earned.length ? 'earned' : 'available')}<span><b>Your challenges</b><small>20 badges to discover · ${badgeSummary(p).earned.length} earned</small></span>${icon('chev')}</button><h3 class="dialog-section">Use your Points</h3>${data.shared.modules.benefits.map((b) => `<button class="benefit-card" data-action="benefit:${b.id}" ><span>${icon(b.icon)}<b>${esc(b.t)}</b><small>${esc(b.s)}</small><small class="reward-availability">${esc(rewardAvailability(p, b).reason)}</small></span><strong>${b.cost}<small>points</small></strong></button>`).join('')}${p.l1.rewards.activeBenefits.length ? `<h3 class="dialog-section">Your active benefits</h3>${rows(p.l1.rewards.activeBenefits.map((b) => [b.title, b.date]))}` : ''}${pointsActivityEntry()}`;
}
export function receiptsDialog(p) {
  return `<p>Changes made in this demonstration stay here. Undo reverses the latest change first.</p>${p.ui.history.length ? button('Undo latest change', 'undo', 'secondary wide') : ''}<div class="receipt-list">${
    [...p.ui.receipts]
      .reverse()
      .map(
        (r) =>
          `<article>${icon(r.reversal ? 'undo' : r.undone ? 'close' : 'check')}<span><b>${esc(r.title)}</b><small>${esc(displayDate(r.date))}${r.undone ? ' · undone' : ''}</small></span></article>`,
      )
      .join('') || '<p class="support">No changes made yet. Your bank activity is below.</p>'
  }</div><h3 class="dialog-section">Bank activity</h3>${rows(
    recentTransactions(p, null, 12).map((x) => [x.counterparty, x.date, cash(x.amount, true)]),
  )}`;
}
export function newPlanDialog(p, data, intent) {
  if (!intent)
    return `<h3 class="idea-title">What would you like to do?</h3><div class="plan-intents">${data.shared.modules.newPlanIntents.map((x) => `<button class="gallery-row" data-action="plan-intent:${x.id}"><span><b>${esc(x.t)}</b><small>${esc(x.s)}</small></span>${icon('arrow')}</button>`).join('')}</div>`;
  const rec =
    data.shared.modules.newPlanRecommendations[intent] ||
    data.shared.modules.newPlanRecommendations.goal;
  return `<p>Give your plan a name and an amount that feels right. You can change both later.</p><form id="plan-form"><label class="field">Name<input name="name" value="${esc(rec.pt)}" maxlength="40" required></label><label class="field">Each month<span class="input-money"><span>£</span><input name="amount" type="number" min="1" max="10000" step="1" value="${rec.rate}" required></span></label>${!rec.grow ? `<label class="field">Target (optional)<span class="input-money"><span>£</span><input name="target" type="number" min="1" max="10000000" value="${rec.target || ''}"></span></label>` : '<div class="notice">Investment plans are reviewed with Maya before you agree. Growth is illustrative.</div>'}${button(rec.grow ? 'Review with Maya' : 'Review your plan', 'plan-review:' + intent, 'primary wide', 'type="button"')}</form>`;
}
export function transferDialog(p, toId, mode = 'transfer') {
  const sources = [
      ...p.l1.accounts.filter((a) => a.balance != null),
      ...p.l1.pots.filter((x) => !x.isDebt),
    ],
    targets = [...p.l1.accounts, ...p.l1.pots];
  return `<p>${mode === 'pay' ? 'Make a payment between the accounts in this demo.' : mode === 'addmoney' ? 'Move money from one of your existing accounts or pots.' : 'Move money between your accounts and pots.'} No real payment is sent.</p><form id="transfer-form" data-mode="${mode}"><label class="field">From<select name="from">${sources.map((x) => `<option value="${x.id}" ${x.id === toId ? 'disabled' : ''}>${esc(x.name)} · ${cash(x.balance, true)}</option>`).join('')}</select></label><label class="field">To<select name="to" required>${!toId ? '<option value="" selected disabled>Choose an account or pot</option>' : ''}${targets.map((x) => `<option value="${x.id}" ${x.id === toId ? 'selected' : ''}>${esc(x.name)}</option>`).join('')}</select></label><label class="field">Amount<span class="input-money"><span>£</span><input name="amount" type="number" min="0.01" step="0.01" placeholder="0.00" required inputmode="decimal"></span></label>${button(mode === 'pay' ? 'Review payment' : 'Review transfer', 'transfer-review', 'primary wide', 'type="button"')}</form>`;
}
export function chatDialog(p, options = null) {
  const msgs = p.ui.chat;
  return `<div class="chat-thread" data-ai-only="${!!options && !msgs.some((m) => m.role === 'human')}">${msgs.length ? msgs.map((m) => `<div class="chat-message ${m.role}"><span class="message-author">${m.role === 'user' ? '' : (m.role === 'human' ? agentAvatar(m.author || (p.l1.customer.id === 'elena' ? 'priya' : 'maya')) : companionAvatar(companionPreferences(p).style))}${m.role === 'user' ? 'You' : m.role === 'human' ? (m.author === 'priya' || p.l1.customer.id === 'elena' ? 'Priya' : 'Maya') : 'HSBC AI'}</span><p>${esc(m.text)}</p></div>`).join('') : `<div class="chat-message ai"><span class="message-author">${companionAvatar(companionPreferences(p).style)}HSBC AI</span><p>Hello ${esc(p.l1.customer.firstName)}. We can explore your plans, explain a number, or bring a person into the conversation.</p></div>`}</div>${options ? `<div class="chat-context-actions">${options.premier ? `<button class="icon-btn" data-action="human" aria-label="Speak directly to Priya" title="Speak directly to Priya">${agentAvatar('priya')}</button>` : ''}${msgs.at(-1)?.role === 'human' ? `<button class="icon-btn" data-action="support:ai" aria-label="Return to AI" title="Return to AI">${agentAvatar('ai')}</button>` : ''}</div>` : ''}<div class="chat-chips">${options?.context ? button(options.context.cta, options.context.action, 'secondary chat-suggestion-primary') : ''}${(options?.context?.chips || (options?.context?.action?.startsWith('agreement-recovery:') ? ['Why did my cashback change?', 'Can I pay manually?'] : options ? p.l2.companion.conversation.chips.filter((c) => options.premier || !/person|human|priya|maya/i.test(c)).slice(0, 2) : p.l2.companion.conversation.chips)).map((c) => button(c, 'chat-chip:' + encodeURIComponent(c), 'secondary')).join('')}</div><form id="chat-form"><label class="sr-only" for="chat-input">Your message to ${msgs.at(-1)?.role === 'human' ? (p.l1.customer.id === 'elena' ? 'Priya' : 'Maya') : 'AI'}</label><div class="chat-compose"><input id="chat-input" name="message" placeholder="Ask about your money…" autocomplete="off" maxlength="600" required><button type="submit" class="icon-btn" aria-label="Send message">${icon('up')}</button></div></form><p class="support chat-note">A scripted concept conversation, using this moment’s data.</p>`;
}

export function suggestedNumber(p, data, r, size = 'W') {
  const m = moduleModel(p, r.moduleId, data.shared.modules);
  return `<p class="suggestion-reason">${esc(r.why)}</p><div class="module-grid module-preview preview-${size}">${moduleCard(m, size, false, 0, false)}</div><div class="size-picker" role="group" aria-label="${esc(m.title)} size">${['S', 'W', 'T', 'F'].map((sz) => button({ S: 'Square', W: 'Wide', T: 'Tall', F: 'Full' }[sz], 'suggestion-size:' + r.moduleId + '/' + sz, sz === size ? 'primary' : 'secondary', `aria-pressed="${sz === size}"`)).join('')}</div>${button('Add to My numbers', 'add-suggestion:' + r.moduleId + '/' + size, 'secondary wide')}`;
}
export function galleryDialog(p, data) {
  const recs = numberIdeas(p);
  return `<div class="number-gallery">${recs.length ? `<header class="ideas-heading"><span class="ideas-author">${icon('assistant')} HSBC AI</span><h3>Suggested for you</h3></header><div class="gallery-suggestions">${recs.map((r) => `<section class="number-suggestion" data-suggestion="${esc(r.moduleId)}">${suggestedNumber(p, data, r)}</section>`).join('')}</div>` : ''}<h3 class="dialog-section">Accounts & pots</h3><div class="gallery-list">${[...p.l1.accounts, ...p.l1.pots].map((x) => `<button class="gallery-row" data-action="preview-module:container-${x.id}"><span><b>${esc(x.name)}</b><small>Your money container · balance, terms and rules</small></span>${icon(p.ui.order.includes('container-' + x.id) ? 'check' : 'plus')}</button>`).join('')}</div>${p.ui.connectedBanks?.length ? `<h3 class="dialog-section">Connected accounts</h3><div class="gallery-list">${p.ui.connectedBanks.flatMap((b) => b.accounts.map((a) => `<button class="gallery-row" data-action="preview-module:external-${b.id}/${a.id}"><span><b>${esc(a.nickname || a.name)}</b><small>${esc(b.name)} · read-only</small></span>${icon('plus')}</button>`)).join('')}</div>` : ''}<h3 class="dialog-section">All your numbers</h3><div class="gallery-list">${data.shared.modules.modules.map((m) => `<button class="gallery-row" data-action="preview-module:${m.id}"><span><b>${esc(m.title)}</b><small>${esc(m.description)}</small></span>${icon(p.ui.order.includes(m.id) ? 'check' : 'plus')}</button>`).join('')}</div></div>`;
}
export function modulePreviewDialog(p, data, id, size) {
  const m = moduleModel(p, id, data.shared.modules);
  return `<div class="size-picker" role="group" aria-label="Module size">${['S', 'W', 'T', 'F'].map((sz) => button({ S: 'Square', W: 'Wide', T: 'Tall', F: 'Full' }[sz], 'preview-size:' + sz, size === sz ? 'primary' : 'secondary', `aria-pressed="${sz === size}"`)).join('')}</div><div class="module-grid module-preview preview-${size}">${moduleCard(m, size, false, 0, false)}</div><p class="support">${esc(m.detail || m.note)}</p>${button(p.ui.order.includes(id) ? 'Update this number' : 'Add to Now', 'pin-preview:' + id, 'primary wide')}`;
}
