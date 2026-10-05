# Focused Future: shaping a goal

Implemented 5 October 2026 following the request to bring goal creation into the visual and logical world of Future. Applies to personal goals, suggested possibilities and life-stage invitations across all four scenarios.

## Design

The focused session uses the same visual grammar as Future: one filled goal bubble above a continuous, translucent Time Travel panel. Contribution and optional target sit in a separate floating glass pill above the Time Travel panel. The goal-name area and navigation/status chrome use translucent glass, allowing the growing field to tint these layers. The date and age sit opposite contributions paid in for cash, or the illustrative range for investments; the redundant direction label is removed. The separate trajectory chart, duplicated sticky summary and inline AI block were removed after visual review: they fragmented the experience without adding enough value.

“Goal name” and “Tap to rename” identify the editable name explicitly. A monthly contribution is required; no target is the default. An empty target field means no target; entering an amount sets one, and clearing it restores an open-ended preview. There is no separate toggle. Number steppers are hidden; amounts are entered directly. Changing inputs updates the bubble and date; Time Travel changes the moment being inspected.

This focused session deliberately uses the shared **detail** surface, with the real floating AI Companion, rather than the usual journey help icon. The initial message explains the suggested possibility; after edits it acknowledges the monthly pace and invites exploration. The full conversation can compare amounts, explain assumptions and suggest ways to frame the goal. It retains the customer’s Companion identity. Returning preserves the form, and each possibility retains its own temporary context. These are scripted prototype responses.

The shared `time-travel.mjs` renderer now supplies the actual Future slider in both screens, including its fill, markers, thumb and starlight. The focused view omits other goals’ milestone buttons. The canvas continues behind the floating Companion, and active fields use a subtle border treatment instead of a boxed outline.

The bubble grows with the projected amount against a dotted reference for one year of the selected monthly contributions. Both circles now use the same uncapped square-root scale: the reference is 80px across, and pot diameter is 80 × √(projected value / one year of contributions). Areas are therefore proportional. Large pots crop at the phone edge and continue behind the translucent glass controls, without a gradient fade. The reference circle contains a short “1 year” and contribution-value label. Its pale backing keeps the label legible over the growing pot. The zero balance has zero area, with its value label retained separately. This is a personal reference, not an assumed purchase price. Investment What If uses the existing domain projection: a 5% central illustration and −2%/8% annual-growth alternatives. The range is shown for this pot, not the customer’s entire net worth, and is not a probability interval or a bound on losses. Selection carries into the sandbox and approval. Cash assumes no interest. Alex also receives an investing possibility framed as curiosity, without inferring experience or a life stage. Locked savings were not added in this iteration; no new rate or lock agreement has been invented.

The extra preview-assumptions accordion, exploratory subtitle and sandbox footer explanation were removed as requested. Investment assumptions remain beside the range because they explain the numbers being compared.

The interface supports normal and Premier surfaces, narrow screens and reduced motion. One scrollable body keeps every control reachable. The initial Companion message is shortened, with fuller context kept in conversation. Time Travel is visible without scrolling at 375×812 and 320×667. Returning from a new goal preview, direct creation or approval explicitly resets the Future chart camera and fits the updated goals.

## Projection and approval

`goal-session.mjs` reads the same `forecast` model as the wider Future canvas. New cash Pots assume no interest, with contributions stopping at an optional target. Investment suggestions retain the prototype’s illustrative 5% growth assumption, visibly identify uncertainty, and continue contributions after their milestone. Projections are illustrative; the controls do not assert affordability.

Time Travel changes the date being inspected, not the agreed payment or a deadline. The focused preview models this one possibility against the current plan. “Try this in my future” adds it to the wider sandbox at the selected date, where other experiments and commitments can be reviewed before approval. Existing life-stage “Make it real” retains its explicit creation route, creates only that Pot and rule, and supports Undo. Neither input edits, conversation nor time scrubbing move money.

The domain now accepts a target of zero as an explicit open-ended Pot; other invalid targets remain rejected. Monthly amounts retain the existing limits. No existing balances, scenario facts, rates or reward rules changed.

## Verification

Browser checks cover all four scenarios, live updates, conversation return, optional targets, preview isolation, approval, life-stage creation and Undo, narrow-screen reachability, and existing progressive beginnings. Domain checks compare preview and committed projections and validate targetless growth. The guided-demo goal scene now focuses on the projection rather than an isolated input.

The scripted Companion can compare a customer-supplied monthly amount or explain growth and affordability limits. A conversational comparison does not rewrite the form. Returning uses the existing journey snapshot; temporary contexts are keyed to the individual possibility so creating another idea does not replace the first idea’s context.
