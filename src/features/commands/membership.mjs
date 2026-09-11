import { motion } from '../../design-system/motion.mjs';
import {
  membershipModel,
  benefits,
  saveMembershipChoices,
  saveMembershipRule,
  membershipSuggestion,
  tiers,
} from '../membership/model.mjs';
import {
  membershipDetail,
  membershipBalance,
  membershipBenefit,
  membershipChoices,
  membershipHousehold,
  membershipRuleView,
} from '../membership/views.mjs';
const drafts = new WeakMap();
const ruleDrafts = new WeakMap();
let passMotion;
export function handle(ctx, type, id, p) {
  const showChoices = (review = false) =>
    ctx.openJourney('Your membership choices', membershipChoices(p, drafts.get(p) || [], review), {
      backAction: review ? 'membership-edit' : 'close',
    });
  if (type === 'membership' || type === 'membership-tier') {
    if (type === 'membership-tier' && !tiers.some((t) => t.id === id)) return;
    const previous = document.querySelector('.membership-detail')?.dataset.membershipTier;
    if (type === 'membership-tier' && previous === id) {
      document
        .querySelector(`[data-action="membership-tier:${id}"]`)
        ?.focus({ preventScroll: true });
      return;
    }
    passMotion?.cancel();
    ctx.openJourney('HSBC Status', membershipDetail(p, type === 'membership-tier' ? id : null));
    if (type === 'membership-tier') {
      document
        .querySelector(`[data-action="membership-tier:${id}"]`)
        ?.focus({ preventScroll: true });
      const pass = document.querySelector('.membership-pass');
      if (pass?.animate && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const direction =
          tiers.findIndex((t) => t.id === id) > tiers.findIndex((t) => t.id === previous) ? 1 : -1;
        passMotion = motion(
          pass,
          [{ transform: `translateX(${direction * 12}px)` }, { transform: 'translateX(0)' }],
          'content',
        );
      }
    }
    return;
  }
  if (type === 'membership-balance')
    return ctx.openModal('What counts towards TRB', membershipBalance(p), 'secondary');
  if (type === 'membership-household')
    return ctx.openModal('Your household', membershipHousehold(p), 'secondary');
  if (type === 'membership-benefit') {
    const b = benefits.find((x) => x.id === id);
    if (!b) return;
    return ctx.openModal(b.title, membershipBenefit(p, id), 'secondary');
  }
  if (type === 'membership-expert') {
    if (!membershipModel(p).index) return;
    return ctx.humanHandover();
  }
  if (type === 'membership-rule' || type === 'membership-rule-edit') {
    if (!membershipSuggestion(p)) return;
    if (type === 'membership-rule') ruleDrafts.delete(p);
    return ctx.openJourney(
      'Your saving rule',
      membershipRuleView(p, ruleDrafts.get(p) || membershipSuggestion(p).amount),
    );
  }
  if (type === 'membership-rule-review') {
    const input = document.querySelector('#membership-rule-amount');
    if (!input?.reportValidity()) return;
    const amount = Number(input.value);
    ruleDrafts.set(p, amount);
    return ctx.openJourney('Your saving rule', membershipRuleView(p, amount, true), {
      backAction: 'membership-rule-edit',
    });
  }
  if (type === 'membership-rule-save') {
    if (!ruleDrafts.has(p)) return;
    ctx.change('Set up your payday saving rule', () => saveMembershipRule(p, ruleDrafts.get(p)));
    ruleDrafts.delete(p);
    return ctx.act('membership');
  }
  if (type === 'membership-open-choices') {
    ctx.closeModal();
    return ctx.act('membership-choices');
  }
  if (type === 'membership-choices') {
    if (!membershipModel(p).index) return;
    drafts.set(p, [...membershipModel(p).active]);
    return showChoices();
  }
  if (type === 'membership-toggle') {
    const m = membershipModel(p),
      b = benefits.find((x) => x.id === id),
      d = drafts.get(p);
    if (!d || !b || b.tier > m.index) return;
    if (d.includes(id))
      drafts.set(
        p,
        d.filter((x) => x !== id),
      );
    else if (d.length < m.tier.choices) drafts.set(p, [...d, id]);
    const scroll = document.querySelector('.sheet-body')?.scrollTop || 0;
    showChoices();
    document.querySelector('.sheet-body').scrollTop = scroll;
    document
      .querySelector(`[data-action="membership-toggle:${id}"]`)
      ?.focus({ preventScroll: true });
    return;
  }
  if (type === 'membership-edit') return showChoices();
  if (type === 'membership-review') return showChoices(true);
  if (type === 'membership-save') {
    if (!drafts.has(p)) return;
    ctx.change('Saved your membership choices', () => saveMembershipChoices(p, drafts.get(p)));
    drafts.delete(p);
    return ctx.act('membership');
  }
}
