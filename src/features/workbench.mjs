import { supportLabMarkup } from './support/specimens.mjs';
import { moduleModel } from '../domain/numbers.mjs';
import { moduleCard, esc, button, icon } from '../design-system/templates.mjs';
export const componentContracts = [
  [
    'AI / human support',
    'support:discuss',
    'Vanilla · all screens and sheets',
    'Expanded, compact, detail, journey header help, conversation, human note, audio lifecycle',
    'One floating surface: full message and CTAs on main-page arrival, compact details and two lines on scroll, full-screen conversation on tap. Detail views own their header. Guided journeys omit the card and put AI help in that header. A play avatar starts Sam’s recap. AI triages human help; Premier can reach Priya directly. See SUPPORT-BAR.md.',
  ],
  [
    'Quick Actions',
    'quick-more',
    'Vanilla / Now',
    'Browse, customise, selected, dragging, drop target, saved, cancelled',
    'Three personal shortcuts plus fixed More. Drag between sections or tap an action and its destination. Done saves; Back cancels. Per-customer preferences support Undo. See NOW-TAB.md.',
  ],
  [
    'Products and services',
    'products',
    'Vanilla / Now',
    'Catalogue, category, resource, planning or conversation',
    'A bottom entry opens ten product categories and useful resources. Category Back returns to the catalogue. Local concept content only.',
  ],
  [
    'Financial module',
    'gallery',
    'Now',
    'S, W, T, F; available, pinned, editing, unavailable',
    'A model provides the same value to every size. In Vanilla, the first large Number belongs to the same editable grid as all others. Details expose its working; resize, reorder and remove support undo.',
  ],
  [
    'Accounts & pots',
    'collection',
    'Vanilla Now / details',
    'Summary, grouped holdings, empty pots, connected accounts',
    'A counted entry sits below My numbers. Held and owed remain separate. Other-bank sample balances join this overview without changing HSBC plans. See ACCOUNTS-POTS.md.',
  ],
  [
    'Open Banking',
    'connect-bank',
    'Accounts & pots / AI recommendation',
    'Bank picker, account consent, validation, connected, disconnect, undo',
    'AI explains the benefit; a persistent screen button starts the same journey. Only selected sample accounts are connected. Read-only information, no real login or money movement.',
  ],
  [
    'Transfer',
    'transfer',
    'Everyday actions / details',
    'Draft, invalid, review, confirmed, undone',
    'The source must fund the transfer; debt cannot be overpaid. Two matching ledger entries and a reversible receipt.',
  ],
  [
    'Future canvas',
    'tab:future',
    'Future',
    'Baseline, empty plan, Time Travel, uncertainty, combined What If ideas, reset',
    'A full-screen bubble canvas built from existing Pots and Money Rules. Floating Atlas controls and a three-position drawer reveal the timeline and experiments. Tap a bubble for the actual Pot detail; scrub up to 20 years. Experiments are isolated until reviewed. Test Alex’s empty state, Jordan’s debt, Sam’s protected commitment and Elena’s investment range.',
  ],
  [
    'What If',
    'bench-idea',
    'Future',
    'Available, previewed, removed, review, running, undone',
    'Preview uses a cloned person. Agree adds a pot/rule or redirects contributions. Opening money is transferred from current cash.',
  ],
  [
    'Pot & rules',
    'rules',
    'Future / collection',
    'No rules, running, paused, target reached, redirected',
    'Rules are explicit amounts. Individual pauses survive a global pause/resume. Future redirects are scheduled, not immediate money moves.',
  ],
  [
    'Personality quiz',
    'quiz',
    'You / companion',
    'Unanswered, answers 1–3, result, corrected',
    'Answers shape the result. Award 25 points once. Confirmation/correction grants 10 once.',
  ],
  [
    'Beliefs & household',
    'tab:you',
    'You',
    'Open, confirmed, corrected; self, shared member',
    'Corrections preserve the original evidence. Confirming the same belief cannot mint points repeatedly. Members expose only shared personality information.',
  ],
  [
    'Rewards',
    'points',
    'You / Now',
    'Insufficient points, eligible, review, redeemed, undone',
    'Redemption deducts points and records a benefit. Premier eligibility and savings-pot selection are checked before mutation.',
  ],
  [
    'Permissions',
    'autonomy',
    'You',
    'Running, confirm pause, paused, restored',
    'Stepping down pauses all automation, including future redirects. Restoring keeps individual rules’ prior active states.',
  ],
  [
    'Activity & undo',
    'receipts',
    'Across the app',
    'Bank entries, demo receipts, reversed receipts',
    'Undo restores data, rules, points and content together. Latest change is reversed first. Chat and navigation remain usable.',
  ],
  [
    'Story',
    'bench-story',
    'Now',
    'Timed claim, visual working, choice, paused, read, saved',
    'Swipe through three timed frames: 8 / 12 / 12 seconds. Hold or use Pause to read. Evidence opens in a sheet; header AI discusses the current frame. Automatic completion only marks the story read. See STORIES.md.',
  ],
  [
    'Sheet & feedback',
    'collection',
    'All screens',
    'Open, scroll, focus trap, close, validation, toast',
    'Background is inert; Escape closes; focus returns to the invoking control. Feedback has a dismiss action and Undo where available.',
  ],
];
export function workbenchMarkup(s, data) {
  const p = s.people[s.person];
  return `<header><span class="eyebrow">ATLAS / LIVE COMPONENT SYSTEM</span><h1>One behaviour.<br>Three expressions.</h1><p>This phone and the specimens below use the same component code, data and actions as the delivered prototypes. Try a state, inspect its result, then reset the moment.</p></header><section><h2>Pots & accounts</h2><p>One pot, one arrangement. See what you receive, what each condition asks of you, and how it is fulfilled. The same model drives the Number, pot detail and AI.</p><div class="container-lab">${[
    ['budget', 'Jordan · Budget wallet'],
    ['savings', 'Sam · Savings agreement'],
    ['loan', 'Jordan · Loan pot'],
    ['investment', 'Elena · Investment pot'],
    ['shared', 'Elena · Shared holiday pot'],
    ['lock', 'Jordan · Optional savings lock'],
    ['recovery', 'Jordan · Cashback recovery'],
    ['flat', 'Jordan · Shared flat utilities'],
    ['family', 'Sam · Family groceries'],
    ['familySaving', 'Sam · Shared family holiday'],
  ]
    .map(([id, t]) => button(t, 'bench-container:' + id, 'secondary'))
    .join(
      '',
    )}</div><p class="container-lab-note">Sam: pause automation, then make the £320 contribution manually. Jordan: nominate a supermarket for cashback, or review an optional three-month savings lock. His recorded September loan instalment is already complete. Elena: inspect the invested-capital condition and shared saving. For the missed-agreement example, open Jordan’s Cashback recovery: £100 completes September’s contribution; cashback remains 0% until the illustrated 1 October return. His Grocery spending insight counts all recorded grocery purchases, while Grocery budget holds money left to spend. Agreement terms open in a bottom sheet; methods are managed within each condition.</p><a href="POTS-ACCOUNTS-SYSTEM.md">Container system specification ↗</a></section>${p.l1.pots.some((x) => x.spendingCategory === 'groceries') ? `<section><h2>Numbers at a glance</h2><p>Enclosed icons identify money pots. Open chart icons identify insights; all cards use the same surface and border. Shared members use avatars; names and conditions remain in the detail view.</p><div class="module-grid wb-specimens">${moduleCard(moduleModel(p, 'container-' + p.l1.pots.find((x) => x.spendingCategory === 'groceries').id, data.shared.modules), 'S')}${moduleCard(moduleModel(p, 'grocery', data.shared.modules), 'S')}</div></section>` : ''}${supportLabMarkup()}<section class="wb-controls"><h2>Presentation</h2><div>${['vanilla', 'bento', 'metro'].map((d) => button(d, 'direction:' + d, s.direction === d ? 'primary' : 'secondary')).join('')}</div><div class="wb-links"><a href="/?theme=vanilla">Open Vanilla ↗</a><a href="/?theme=bento">Open Bento ↗</a><a href="/?theme=metro">Open Metro ↗</a></div></section><section><h2>Foundations</h2><div class="wb-swatches ${p.l1.customer.tier === 'Premier' ? 'premier' : ''}">${['ink', 'muted', 'canvas', 'surface', 'line', 'action', 'jade'].map((t) => `<span><i style="background:var(--${t})"></i>${t}</span>`).join('')}</div><dl class="wb-tokens"><div><dt>Display / figure</dt><dd>Univers Next · light · tabular figures</dd></div><div><dt>Title / body / metadata</dt><dd>Clear hierarchy; metadata never carries the only instruction</dd></div><div><dt>Interaction</dt><dd>Focus ring · pressed state · 44px primary targets · reduced motion</dd></div><div><dt>Semantics</dt><dd>Action / on-action follow the direction · jade = progress · grey = context</dd></div></dl></section><section><h2>Module anatomy & size states</h2><p>Live ${esc(p.l1.customer.firstName)} data. Activate a specimen to inspect the same detail sheet in the phone.</p><div class="module-grid wb-specimens ${p.l1.customer.tier === 'Premier' ? 'premier' : ''}">${['S', 'W', 'T', 'F'].map((sz) => `<div><span class="eyebrow">${sz} / ${{ S: 'Square', W: 'Wide', T: 'Tall', F: 'Full' }[sz]}</span>${moduleCard(moduleModel(p, p.ui.order[0] || 'balance', data.shared.modules), sz, false, 0)}</div>`).join('')}</div></section><section><h2>Behaviour contracts</h2><p><a href="SUPPORT-BAR.md">Vanilla support specification ↗</a> · <a href="NOW-TAB.md">Now tab specification ↗</a></p><p>Use these entry points to exercise real states in the phone. Financial and state invariants are covered by the tests described in the project README.</p><div class="wb-contracts">${componentContracts.map(([name, action, where, states, contract], i) => `<article><div><span class="eyebrow">${String(i + 1).padStart(2, '0')} / ${esc(where)}</span><h3>${esc(name)}</h3><p>${esc(contract)}</p><small>${esc(states)}</small></div>${button('Try', action === 'support:discuss' && s.direction !== 'vanilla' ? 'chat' : action, 'secondary')}</article>`).join('')}</div></section><footer><b>Scope of this prototype</b><p>Scenario JSON is versioned separately from the interface. Demo edits are saved on this device when storage is available; Reset restores the selected scenario. Conversations, banking, rewards and invitations are simulated. Projected balances omit future income and spending, and product interest. The underlying scenario files and original prototype are preserved in the project.</p></footer>`;
}
