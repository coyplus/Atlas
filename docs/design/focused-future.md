# Focused Future: shaping a goal

Implemented 5 October 2026 following the request to bring goal creation into the visual and logical world of Future. Applies to personal goals, suggested possibilities and life-stage invitations across all four scenarios.

## Design

One editable goal leads the screen. A single orbit shows its projected balance at the selected date, with a target boundary when relevant. A small trajectory makes the accumulation and eventual plateau visible. Time Travel uses the existing Future gradient and thumb language; date and customer age move together. Changing the contribution or target updates the preview and the Companion’s explanation immediately. A compact preview remains visible while scrolling through the controls.

The name is editable in place. A monthly contribution is required; a target is optional. “I don’t have a target yet” creates an open-ended preview rather than forcing an arbitrary finish line. The portrait’s Companion identity carries into the session. Conversation opens with the current draft’s amounts and goal; returning preserves the form. Each possibility retains its own temporary draft context within the session.

The interface uses the normal and Premier surfaces and respects reduced motion. The body is one scrollable journey; it does not compress everything above the fold.

## Projection and approval

`goal-session.mjs` reads the same `forecast` model as the wider Future canvas. New cash Pots assume no interest, with contributions stopping at an optional target. Investment suggestions retain the prototype’s illustrative 5% growth assumption, visibly identify uncertainty, and continue contributions after their milestone. Projections are illustrative; the controls do not assert affordability.

Time Travel changes the date being inspected, not the agreed payment or a deadline. The focused preview models this one possibility against the current plan. “Try this in my future” adds it to the wider sandbox at the selected date, where other experiments and commitments can be reviewed before approval. Existing life-stage “Make it real” retains its explicit creation route, creates only that Pot and rule, and supports Undo. Neither input edits, conversation nor time scrubbing move money.

The domain now accepts a target of zero as an explicit open-ended Pot; other invalid targets remain rejected. Monthly amounts retain the existing limits. No existing balances, scenario facts, rates or reward rules changed.

## Verification

Browser checks cover all four scenarios, live updates, conversation return, optional targets, preview isolation, approval, life-stage creation and Undo, narrow-screen reachability, and existing progressive beginnings. Domain checks compare preview and committed projections and validate targetless growth. The guided-demo goal scene now focuses on the projection rather than an isolated input.

The scripted Companion can compare a customer-supplied monthly amount or explain growth and affordability limits. A conversational comparison does not rewrite the form. Returning uses the existing journey snapshot; temporary contexts are keyed to the individual possibility so creating another idea does not replace the first idea’s context.
