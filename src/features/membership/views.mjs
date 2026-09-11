import { membershipModel, membershipSuggestion, tiers, benefits } from './model.mjs';
import { esc, icon, button, householdStack, rows } from '../../design-system/templates.mjs';
import { cash } from '../../domain/money.mjs';
const mark = (level) =>
  `<span class="membership-mark" aria-hidden="true">${[0, 1, 2].map((i) => `<i class="${i <= level ? 'filled' : ''}"></i>`).join('')}</span>`;
const ladder = (m) =>
  `<div class="membership-ladder" aria-label="Membership tiers: HSBC, Premier at £100,000, Elite at £250,000"><div class="membership-track" role="progressbar" aria-label="Total relationship balance towards Elite" aria-valuemin="0" aria-valuemax="250000" aria-valuenow="${Math.min(250000, m.trb)}" aria-valuetext="${esc(cash(m.trb, true))}, ${m.tier.name}${m.next ? ', ' + cash(m.remaining, true) + ' to ' + m.next.name : ''}"><i style="width:${Math.min(100, m.trb / 2500)}%"></i><b style="left:40%"></b></div><div class="membership-stops">${tiers.map((t, i) => `<span class="${i === m.index ? 'current' : ''}" ${i === m.index ? 'aria-current="step"' : ''}><b>${t.name}</b><small>${i ? cash(t.threshold) : 'Your starting point'}</small></span>`).join('')}</div></div>`;
export function membershipEntry(p) {
  const m = membershipModel(p);
  return `<section class="membership-module"><header class="section-head"><h2>HSBC Status</h2></header><button class="membership-entry" data-pass-tier="${m.tier.id}" data-action="membership" aria-label="Your ${m.tier.name} membership. ${m.next ? cash(m.remaining, true) + ' to ' + m.next.name : 'Elite achieved'}. Explore your access."><div class="membership-entry-top"><span>${mark(m.index)}<b>${m.tier.name}</b></span>${icon('arrow')}</div><div class="membership-entry-value">${cash(m.trb, true)}<small>Total Relationship Balance</small></div>${ladder(m)}<div class="membership-entry-bottom">${m.next ? `<span><b>${cash(m.remaining, true)}</b> to ${m.next.name}</span>` : `<span>${icon('check')} Elite achieved</span>`}<span>${m.index ? `${m.available} ${m.available === 1 ? 'choice' : 'choices'} available` : 'Explore your access'}</span></div></button></section>`;
}
export function membershipDetail(p, selectedTier) {
  const m = membershipModel(p),
    index = Math.max(
      0,
      tiers.findIndex((t) => t.id === (selectedTier || m.tier.id)),
    ),
    t = tiers[index];
  const eligible = index <= m.index;
  const suggestion = membershipSuggestion(p);
  return `<div class="membership-detail" data-membership-tier="${t.id}"><div class="membership-tabs" role="tablist" aria-label="Explore memberships">${tiers.map((tier) => `<button role="tab" id="membership-tab-${tier.id}" aria-controls="membership-tier-panel" aria-selected="${tier.id === t.id}" data-action="membership-tier:${tier.id}">${tier.name}</button>`).join('')}</div><section class="membership-pass ${eligible ? '' : 'is-locked'}" data-pass-tier="${t.id}" aria-label="${t.name} membership pass${eligible ? '' : ', locked'}"><div class="membership-pass-top">${mark(index)}<span>${index === m.index ? 'Your membership' : eligible ? 'Included access' : 'Membership preview'}</span><b>${t.name}</b></div><div class="membership-pass-state">${icon(eligible ? 'check' : 'lock')} ${index === m.index ? 'Current membership' : eligible ? 'Included with ' + m.tier.name : 'Locked · ' + cash(t.threshold) + ' to qualify'}</div><div class="membership-trb">${cash(m.trb, true)}</div><button class="membership-balance-link" data-action="membership-balance">Your Total Relationship Balance ${icon('info')}</button>${ladder(m)}<p>${!eligible ? `<b>${cash(t.threshold - m.trb, true)}</b> to ${t.name}` : m.next ? `<b>${cash(m.remaining, true)}</b> to ${m.next.name}` : `${icon('check')} You’ve reached Elite`}</p></section>${suggestion && index < 2 ? membershipNudge(p) : ''}<section id="membership-tier-panel" role="tabpanel" aria-labelledby="membership-tab-${t.id}"><div class="membership-tier-heading"><span class="eyebrow">${index === m.index ? 'Your access' : eligible ? 'Included with your membership' : cash(t.threshold) + ' TRB'}</span><h1>${t.promise}</h1></div><div class="membership-included">${t.access.map((a) => `<div>${icon('check')}<span>${esc(a)}</span></div>`).join('')}</div>${index >= 1 ? `<button class="membership-expert" data-action="${eligible ? 'membership-expert' : 'membership-balance'}">${icon('user')}<span><b>${eligible && p.l1.customer.rmId === 'priya' ? 'Priya, your Relationship Manager' : 'Your own Relationship Manager'}</b><small>Expertise around your priorities</small></span>${icon('arrow')}</button>` : ''}${
    index
      ? `<div class="membership-choices-head"><div><h2>Your membership, your choices</h2><p>${t.choices} included choices · Points stay yours</p></div>${eligible && index === m.index ? button('Choose', 'membership-choices', 'text') : ''}</div><div class="membership-benefits">${benefits
          .filter((b) => b.tier <= index)
          .map(
            (b) =>
              `<button class="membership-benefit" data-action="membership-benefit:${b.id}"><span class="membership-benefit-icon">${icon(b.icon)}</span><span class="membership-benefit-copy"><small>${b.category}</small><b>${b.title}</b><span>${b.subtitle}</span></span>${m.active.includes(b.id) ? `<span class="membership-selected">${icon('check')} Chosen</span>` : icon('chev')}</button>`,
          )
          .join(
            '',
          )}</div>${!eligible ? `<div class="membership-qualification"><b>${cash(Math.max(0, t.threshold - m.trb), true)} more to qualify</b><p>Your HSBC balances count towards membership. Points and badge achievements stay separate.</p>${button('See what counts', 'membership-balance', 'text')}</div>` : ''}`
      : `<div class="membership-next"><span class="eyebrow">At £100,000</span><h2>Step into Premier</h2><p>Specialist access, family services and three benefits chosen by you.</p>${button('Explore Premier', 'membership-tier:premier', 'secondary')}</div>`
  }</section><button class="membership-household" data-action="membership-household">${householdStack(p.l1.household.members)}<span><b>Membership, shared</b><small>See which benefits can include your household</small></span>${icon('arrow')}</button><p class="membership-footnote">Membership follows your HSBC relationship balance. ${m.index === 2 ? 'Elite includes Premier access.' : 'View each tier to see what it includes.'}</p></div>`;
}
export function membershipBalance(p) {
  const m = membershipModel(p);
  return `<div class="membership-sheet-content"><span class="eyebrow">Your qualifying balance</span><div class="membership-trb">${cash(m.trb, true)}</div><p>Money held in your HSBC accounts and pots, including investments.</p>${rows(m.holdings.map((x) => [x.name, x.shared ? 'Shared pot · recorded owner' : 'HSBC-held balance', cash(x.amount, true)]))}<p>Each holding is counted once. Shared pots count under their recorded owner; other household members’ separate balances and accounts at other banks are not included. Borrowing does not count towards TRB and is not deducted from it.</p><div class="membership-thresholds">${rows(tiers.map((t) => [t.name, t.threshold ? cash(t.threshold) + ' or more' : 'From your first HSBC account']))}</div><small>Based on the balances shown as at ${esc(p.l1.asOf)}. Investment values can change.</small></div>`;
}
export function membershipBenefit(p, id) {
  const b = benefits.find((x) => x.id === id);
  if (!b) return '';
  const m = membershipModel(p),
    eligible = m.index >= b.tier;
  return `<div class="membership-sheet-content"><div class="membership-benefit-emblem">${icon(b.icon)}</div><span class="eyebrow">${tiers[b.tier].name}${b.tier === 1 ? ' & Elite' : ''} access</span><h2>${b.subtitle}</h2><p>${b.detail}</p><div class="membership-benefit-terms"><b>${b.scope}</b><p>${b.terms}</p></div>${eligible ? `<p>${m.active.includes(id) ? 'One of your saved membership choices.' : 'Uses one included choice. No HSBC Points required.'}</p>${button(m.active.includes(id) ? 'Manage choices' : 'Choose your benefits', 'membership-open-choices', 'primary wide')}` : `<p>Available from ${cash(tiers[b.tier].threshold)} Total Relationship Balance.</p>${button('Back to memberships', 'close', 'secondary wide')}`}</div>`;
}
export function membershipChoices(p, draft, review = false) {
  const m = membershipModel(p);
  return `<div class="membership-choice-flow"><span class="eyebrow">${m.tier.name} membership</span><h1>${review ? 'Review your choices.' : 'Choose what matters to you.'}</h1><p>${review ? 'Included in your membership. No Points will be spent.' : `Choose up to ${m.tier.choices}. You can leave spaces for later.`}</p><div class="membership-choice-count" role="status">${draft.length} of ${m.tier.choices} selected</div><div class="membership-benefits">${benefits
    .filter((b) => b.tier <= m.index && (!review || draft.includes(b.id)))
    .map(
      (b) =>
        `<${review ? 'div' : 'button'} class="membership-benefit" ${review ? '' : `data-action="membership-toggle:${b.id}" aria-pressed="${draft.includes(b.id)}" ${draft.length >= m.tier.choices && !draft.includes(b.id) ? 'disabled' : ''}`}><span class="membership-benefit-icon">${icon(b.icon)}</span><span class="membership-benefit-copy"><b>${b.title}</b><small>${review ? b.scope : b.subtitle}</small></span>${icon(draft.includes(b.id) ? 'check' : 'plus')}</${review ? 'div' : 'button'}>`,
    )
    .join(
      '',
    )}</div>${review ? '<p>Saving records your selections. Cover activation and event bookings are separate steps; availability and eligibility apply.</p>' : ''}<div class="membership-choice-footer">${button(review ? 'Save choices' : 'Review choices', review ? 'membership-save' : 'membership-review', 'primary wide')}${review ? button('Keep choosing', 'membership-edit', 'text wide') : ''}</div></div>`;
}
export function membershipHousehold(p) {
  return `<div class="membership-sheet-content"><div class="membership-household-avatars">${householdStack(p.l1.household.members)}</div><h2>Access for your household</h2><p>Family services and selected experiences can include eligible household members. Each benefit explains who can join.</p>${rows(p.l1.household.members.map((x) => [x.name, x.relation === 'self' ? 'Your membership' : 'Member of your household']))}<p>Being in your household does not share your tier, enrol someone in a benefit or reveal their balances. Confirm participation separately when setting up a shared service.</p>${button('Done', 'close', 'secondary wide')}</div>`;
}

export function membershipNudge(p) {
  const s = membershipSuggestion(p);
  if (!s) return '';
  return `<div class="membership-nudge"><span class="membership-ai-label">${icon('spark')} HSBC AI</span><h2>${s.rule ? 'Your saving rule is ' + (s.paused ? 'paused' : 'ready') : cash(s.remaining) + ' from Premier'}</h2><p>${s.rule ? cash(s.amount) + ' from each new payday. Your balance qualifies once it reaches £100,000.' : 'Set aside ' + cash(s.amount) + ' from each new payday to build your savings towards Premier.'}</p>${button(s.rule ? 'Manage rule' : 'Explore a saving rule', s.rule ? 'container-rule:r-premier-savings' : 'membership-rule', 'text')}</div>`;
}
export function membershipRuleView(p, amount = 500, review = false) {
  const m = membershipModel(p),
    suggestion = membershipSuggestion(p),
    months = Math.ceil(m.remaining / amount);
  return `<div class="membership-rule-flow"><span class="membership-ai-label">${icon('spark')} HSBC AI · Your saving plan</span><h1>${review ? 'Review your Money Rule' : 'A little closer each payday'}</h1><p>You’re ${cash(m.remaining)} from Premier. Build savings from new income while keeping your family plans funded.</p>${
    review
      ? rows([
          ['Amount', cash(amount) + ' each payday'],
          ['From', 'HSBC Current · after salary arrives'],
          ['To', 'Not decided yet'],
          ['Starts', 'Next payday'],
          ['Control', 'Pause, edit or remove at any time'],
        ])
      : `<label class="field">Save each payday (£)<input id="membership-rule-amount" type="number" min="1" max="${suggestion.limit}" step="1" value="${amount}" inputmode="decimal"></label><p class="support">Your current monthly surplus is ${cash(suggestion.limit)}. Choose an amount that still leaves room for your priorities.</p>`
  }<div class="membership-rule-illustration"><b>${cash(m.trb)} <span>→</span> £100,000</b><p>${months} ${months === 1 ? 'payday' : 'paydays'} if your total balance grows by ${cash(amount)} each month.</p></div><p>For this saving plan, progress comes from new money you retain. Transfers between HSBC accounts and pots don’t. Spending, withdrawals and investment changes can move the date.</p>${p.l1.autonomy.paused ? '<p>Money Rules are paused. This rule will wait until you restore your permissions.</p>' : ''}${review ? '<p>The rule sets aside salary already received into HSBC Current. It does not move money now or automatically unlock Premier.</p>' : ''}${button(review ? 'Set up Money Rule' : 'Review rule', review ? 'membership-rule-save' : 'membership-rule-review', 'primary wide')}${button('Not now', 'close', 'text wide')}</div>`;
}
