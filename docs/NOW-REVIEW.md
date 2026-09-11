# Now experience — visual refinement review

10 September 2026. Scope: Now and its reachable detail/task surfaces, across Alex, Jordan, Sam and Elena. Future and You were not redesigned. Now-specific visual rules are scoped to `data-active-tab="now"`; their AI refinement is also gated by the active tab.

## Design decisions

**A quiet editorial hierarchy.** Keep one clear number, useful qualifiers and a small relevant visual. Remove decorative product banners, generic shortcut instructions and repeated amounts from expanded Number screens. Product browsing, statements and card management now use header AI access instead of a permanent generic card. Human notes and the audio recap retain their distinct roles.

**Glass at edges and controls.** Use restrained translucent support/audio surfaces, a feathered navigation edge and lightly highlighted action roundels. Reading surfaces stay solid enough for charts and amounts to remain legible. Reduced-transparency preferences receive opaque surfaces. Existing navigation hit areas and scroll ownership are preserved.

**Purposeful colour.** Number and goal graphics are neutral; ordinary Story bars and category icons no longer compete with important CTAs in red. Small benefit-change indicators remain explicit exceptions. Financial states retain their words and icons, so colour is never the only cue.

## Connections repaired

- Budget Pot details use the same recorded spent/limit values as their Number widget. They distinguish available money in the pot from unused monthly budget; topping up does not count as spending.
- Wide savings widgets expose the target and progress shown on the detail screen. Compact square widgets keep the lighter presentation.
- Safe to spend shows its allocation once, plus the current balance for reconciliation. Composition charts carry their full labelled values into detail without a duplicate table.
- Investment mix includes every pot treated as invested by the underlying totals, including growth-bearing goal pots. The wealth breakdown calls the non-invested money containers “Pots”, since these include budgets as well as savings.
- A single investment holding uses a plain holding label and a route into its pot. A composition chart appears only when multiple holdings make the comparison meaningful. Future planning controls stay out of this Now detail.
- Pot activity uses readable dates. Products and recurring actions share the same understated visual language.
- Payments start with an explicit destination choice, avoiding an accidental same-account default. Pay uses “Review payment” and “Confirm payment”; transfers retain their own wording.

## AI participation

Messages explain the reason, implication or available next step: contributions versus scheduled rules, locked-pot commitments, the gap to a goal, budget versus balance, credit utilisation, and how an infographic is calculated. They do not simply repeat a displayed balance. Full conversations retain the originating context when a customer asks for a person.

An outstanding, unreviewed benefit change gets a continuously travelling red rim and a small indicator. An eight-second cycle eases around the edge, softly brightening and fading like a breath, while that issue is visible and unreviewed. Opening its options, reading How it works, or discussing the issue acknowledges it for that scenario. Acknowledging does not restore a benefit or fulfil a condition. Routine updates and human notes do not receive the alert treatment. Reduced motion suppresses the animation.

## Review coverage

Visual captures: all four Now landing pages, grids and Accounts & pots; budget, shared, credit and savings details; How it works; Number gallery and expanded visuals; quick actions; payment/transfer; bank connection; products; Story opening, working and final frames. Both mobile browser engines are included.

Interaction checks include gallery sizes and persistence, long press, live reorder, removal, nested sheet return/focus ownership, Story timing/swipes/evidence/AI return, attention expiry/acknowledgement, reduced motion, narrow layouts, and widget/detail budget agreement. Data reconciliation and existing domain/interface tests remain part of verification.

The browser checks emulate iOS and Android browser engines; physical-device feel and native haptics remain a useful joint review on phones. No live banking data or external transactions were introduced.

Verification: the 96-test domain/interface suite passed, with an additional reconciliation test passing for investment/wealth graphics. The broad mobile regression run passed 47 checks (one WebKit-only CDP touch test skipped as unsupported); the final six Now checks passed on Chromium and WebKit. TypeScript, lint and the production build passed. Screenshots are in `docs/screenshots/now-review/`.


## Follow-up: chrome, attention and quiz invitation

- The simulated phone status bar uses translucent glass globally, including Story photo plates, with white status text over photography. Reduced-transparency preferences retain an opaque fallback. Real mobile browsers keep their native status bar rather than drawing a second one.
- The tab bar has a fine neutral divider and soft upper shadow, preserving the existing feathered edge and tap targets.
- Jordan’s Grocery budget widget carries a red-tinted “Benefit changed” marker and fine border. The AI names that pot and uses the same red for its continuously travelling attention rim. Reviewing acknowledges the message; the widget continues to show the actual benefit state until restoration.
- Alex’s AI invitation leads with a personal money profile and 25 HSBC Points. A new three-page Story explains his style, habits and completion reward, then opens the existing quiz. Completion marks the Story as saved and stops the quiz invitation. Points retain their existing once-only award rule.
- Verification: all 97 domain/interface checks, 176 data checks and 24 existing Story browser checks passed. Four new checks cover attention, quiz completion and visible desktop phone chrome across Chromium and WebKit. Build and lint pass.

Header follow-up: the scrolling global header is clipped at the status-bar boundary, keeping the logo out of the translucent status region. The new Number ideas badge uses 12px red text, a 16px icon and a light red tint. Six Chromium/WebKit checks cover top/partial-scroll header geometry, badge treatment, continuous attention and reduced motion.

## Recent Activity ordering

The Now summary, Pot details, full activity and statement views share date-based transaction ordering. Older setup transfers appended to a scenario must not displace more recent purchases. Same-day records show the most recently recorded entry first. Reading or sorting a view never changes the stored ledger, balances or Premier qualification.
