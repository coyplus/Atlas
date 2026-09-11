# Atlas experience audit · 11 September 2026

## Scope and method

The current Atlas experience across Alex, Jordan, Sam and Elena: Now, Future, You,
their detail screens and task flows. The priority is the strongest concept presentation
on normal and larger phones: coherent hierarchy, expressive visuals and smooth core
journeys that communicate the vision to stakeholders. Production completeness, legal
review and unusual device/input combinations are not acceptance criteria for this stage.
Keep the alternative art directions working, without treating archived visual concepts
as the current design language.

1. Inventory screens, feature states and existing checks; establish a full regression baseline.
2. Capture and inspect the screen families, including long content, empty states,
   attention, success, errors, drawers, nested returns and contextual AI.
3. Fix recurring problems at their shared source; consolidate component, surface,
   typography, colour, motion and gesture rules in the experience system.
4. Polish the affected screens and rerun the complete journeys and relevant visual checks.
5. Record the implemented decisions, evidence, coverage and practical limits here.

## Review inventory

| Family | Screens and states |
| --- | --- |
| App shell | Three primary tabs; light/dark; loading/error; demo options; settings; browser history; scroll restoration; safe areas |
| Now | Every mini-widget and detail; number gallery; editing/reordering/resizing; accounts/Pots; connected banks; Stories |
| Money containers | Current, savings, investment, debt and budget; personal/shared/locked; photo/colour; activity; rules; agreements; warnings/recovery |
| Everyday tasks | Payments/transfers; review/success/Undo; cards; statements; products; sharing/invitations; validation |
| Future | Balance/target/ghost conventions; pan/pinch/Fit; all drawer stops; Time Travel; milestones/ranges; What If; add/edit/dismiss; review/commit/Undo |
| You | Membership tiers; rewards/points; portrait/household; beliefs/autonomy; badges/challenges; relationship history |
| Check-ins | Feelings; instinct; spending reflection; future self; optional reflection; completion; saved/history; remembered/private |
| Companion | Initial/loading; compact/single/two-part; attention; contextual transitions; conversation/human; audio states; task help/return |
| Shared patterns | Headers, sheets, fixed actions, form fields, rows/cards, chips/status, icons, touch/focus, reduced motion/transparency |

## Outcome

Completed an inventory-led review and implemented a system-level polish pass. The
strongest existing hierarchy remains: personal context in the Companion, one dominant
subject, and detail revealed through the existing screen or drawer. The work removes
inconsistencies rather than adding another navigation layer or redesigning each feature.

The shared rules now live in [the Atlas experience system](EXPERIENCE-SYSTEM.md).

## Findings and changes

### One control and surface language

Primary actions had diverged between the older forms and newer Future/check-in screens.
Vanilla now uses the same ink/inverse treatment through the shared action variables,
including dark mode. Routine informational notices use neutral surfaces; successful
conditions retain their status treatment. HSBC red remains the brand/attention accent.

Regular Companion elevation, floating-control elevation and glass blur now have shared
tokens. This keeps the three primary tabs in the same surface hierarchy without removing
intentional attention states, personalised photos or purpose colours.

### Readable content instead of shrinking controls

Useful number captions, row details, reward availability and expanded plot legends were
inconsistently small. Their shared typography is now larger. Buttons, disclosures,
conversation chips and colour choices have at least a 44 px touch area; standard buttons
use 48 px. Keyboard focus also covers disclosure summaries.

Dense mini-infographic labels and timeline marks remain deliberate compact visualisation
exceptions. Making their visual size identical to ordinary buttons would distort the
data or crowd the timeline. Existing inspection and keyboard paths remain available.

### Shared motion, without competing entrances

Imperative detail, conversation and membership animation now use the same duration and
easing tokens as CSS. A new animation replaces an unfinished one on the same element.
Detail navigation has a small directional content movement while the header stays still;
sheet movement remains vertical. The duplicate generic sheet entrance was removed.

Drawer, bubble and milestone movement share the spatial timing. Direct gestures remain
immediate. Reduced motion suppresses decorative entrances; Story reading and Time Travel
ambient effects keep their distinct purpose and existing reduced-motion behaviour.

### Drawer rhythm

On the standard phone, redundant spacing between Time Travel, What If and Money Speed
was tightened so the Money Speed text sits comfortably above the tab bar. Type, idea
card size and the main canvas composition remain generous.

At 320 × 568, the Future drawer could hide the What If invitation and leave almost no
scrollable area for experiments. Drawer limits now derive from the measured summary,
handle and invitation. In the expanded short-screen layout the whole drawer scrolls,
with its grip retained. Taller screens keep the summary above the independently scrolling
ideas. Changing drawer state resets the short-screen outer scroll.

This fallback is isolated to short screens and does not set the normal-phone design.
The established three stops remain: visible docked lip, Time Travel with What If preview,
and expanded experiments. No extra mode or control was added.

### Discovery and execution agree

Reward discovery, detail and redemption previously used inconsistent eligibility checks.
They now share live relationship qualification and reward availability. Unavailable
rewards remain inspectable, with a specific explanation and an appropriate next step.
Rate boosts exclude budgets, debt and investment Pots at both selection and execution.

Sam's source balances remain **£98,000**, exactly **£2,000 below Premier**. This audit did
not change the financial scenario seeds. Tests confirm that a qualifying balance change
updates both Status and reward eligibility, and an invalid redemption leaves Points intact.

### Copy that explains the actual thing

Rule headings describe their behaviour. Empty reserve and irrelevant cap rows were
removed. Standalone dates share a readable UK format. Future projection assumptions are
grouped into scannable explanations with the calculation details available underneath.

Several number-detail Companion messages now describe the visible model instead of a
generic “full picture”. Sam's investment copy and the number gallery no longer present
illustrative options as unconditionally safe or expose internal design instructions.
Recorded customer intent remains distinct from an AI claim. The startup error now gives
a useful recovery message while retaining technical detail in the console.

## Navigation and data checks

The shared Level 1/Level 2 ownership rule was already the correct architecture and was
retained. Regression checks cover hiding/inerting the main tabs in details and tasks,
nested sheets, browser Back/Forward, scenario/theme changes, parent scroll restoration,
and returning focus. This avoids a second set of feature-specific navigation rules.

Recent Activity, mini-widget/detail consistency, transfers and receipts, rules,
agreements, qualification, Future simulation/commit/Undo, scenario resets, contextual
Companion, check-ins, Stories, badges and appearance editing remain covered by their
existing domain and browser journeys. No activity entries were removed.

## Visual evidence and coverage

- **236 screen/state variants** at 390 × 844 across all four scenarios, reviewed by
  screen family, with close inspection of dense or suspect screens and their scroll ends.
- **45 larger-phone variants** at 430 × 932, covering primary screens, drawers and
  representative tasks; these and the standard-phone set are the concept reference.
- Supplemental captures: **45 desktop-presentation variants** at 1280 × 980 and **45
  short-screen variants** at 320 × 568. The latter informed an isolated fallback only.
- Light and dark scenarios, empty/attention states, numeric details, long forms, nested
  screens, and Future at several dates. Intermediate journey, validation, success and
  interaction states are exercised by the browser suite as well as the static inventory.
- Automated inventory checks found no page errors or horizontal overflow in the captured
  variants. Static captures use reduced motion for repeatability; animations and gestures
  are checked separately.

Local evidence:

- [Final phone gallery](audit/after/index.html)
- [Larger-phone gallery](audit/large/index.html)
- [Short-screen gallery](audit/compact/index.html)
- [Desktop-presentation gallery](audit/desktop/index.html)
- [Baseline gallery](audit/before/index.html)

`node scripts/audit-experience.mjs after` rebuilds the phone evidence from the running
local preview. Add `--large`, `--compact` or `--desktop` and use a different output name for the
responsive sets. It uses isolated demo state and does not modify the user's session.

## Verification

- Type checking, lint, scenario validation and production build: passed.
- Domain/interface tests: **172 passed**.
- Complete Chromium and WebKit browser regression: **262 passed, 4 platform-specific
  skips**. The pre-change baseline was 254 passed, 4 skips.
- After the final normal-phone drawer spacing adjustment: **26 relevant browser checks
  passed**, and the standard/larger-phone Future captures were refreshed.
- Added regression checks for reward eligibility, readable dates, shared primary action
  treatment, short-screen drawer access, touch targets and interrupted/reduced motion.

## Practical limits

This is a concept-quality audit across representative screen families and journeys,
not production certification or a claim to cover every device/input combination. Four
platform-specific browser cases run in Chromium and are skipped in WebKit where the
automation mechanism differs. Broader physical-device and production checks are deferred.

AI conversation and future suggestions remain local simulations. Forecasts retain their
stated illustrative assumptions. Archived concept pages and alternative themes were
regression-checked where covered, but Vanilla is the design-system reference.
