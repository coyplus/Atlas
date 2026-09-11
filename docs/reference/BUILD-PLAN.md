# Atlas Hi-Fi Prototype v1 — Build Plan

*31 Aug 2026. Commissioned by Coy: "update our prototype or create a new one, so it reflects what we've discussed… take your time, plan and develop it properly." Decision: clean rebuild (not a patch of v6) — the architecture changed (widget Now, bubble-field Future), the visual language changed (Design System v1.3), and v6's interaction shell carries the .snav defect family.*

## What it is

One self-contained `index.html`: a 390×844 phone running the Atlas product at high fidelity, with an editorial chrome around it (persona switcher + contextual "try this" rail). Desktop-first presentation; the phone itself fully usable at any width. No external dependencies; works offline. This is the **product prototype** — the interaction source for the guided walkthrough (which remains separately commissioned with its skeleton gate, `Data/09`).

## The seven commissioned states, mapped

| Commission (`Data/09` §4b) | In this build |
|---|---|
| 1 · 3–4 very different Nows, simple→advanced | Four personas: **Alex** (just switched — near-today), **Jordan** (spending awareness), **Sam** (saving with purpose — advanced, on track), **Elena** (**Premier — whole app dark**) |
| 2 · Adding a widget, AI suggesting | Add tile / companion → "New number ideas" sheet: AI suggestions with a "why", plus Spend/Save/Invest browse. Pin → lands in grid with New chip |
| 3 · Rearranging | Arrange mode (subtle wiggle, Apple-reference): drag to reorder, remove. **Position = prominence: the top widget renders as the hero** with the display numeral |
| 4 · Future starting point | Alex: single net-worth bubble + What If rail already inspiring |
| 5 · Exploring a What If | Tap idea → ghost target ring appears in the field, projection line, "Start this pot / Not now" — starting it is a real state change (+ commitment, speed updates, undoable) |
| 6 · Advanced Future, on track | Sam: 4 pots, 3 commitments + a Money Challenge, Money Speed £420/mo, everything dated |
| 7 · Into a bubble | Full-screen pot detail: balance, terms (5.1% + free exit on House), quick actions, linked commitments, receipts — account-screen familiar |

Plus, from the rulings: Pot field semantics (mass = money by **area**, dotted ring = target, ring-only = unfunded goal, mass-only = unnamed pot, jade ring when reached, ≥44px hit targets), time-travel slider (projections labelled), **bubble ⇄ list view switcher** (list ordered by time-to-target; the complete reduced-motion/screen-reader path), HSBC Points naming, no internal codes anywhere, one typeface, red ≤3 per screen, and a playable 3-question mini-quiz on Alex that closes the Promise Loop (answers → belief in Me, correctable, +25 points).

**Me tab:** built to settled doctrine only (points/badges permanent, beliefs with evidence + correction, plain-language autonomy, named humans) — direction is still pending and the rail says so.

## Numeric reconciliation (acceptance criterion #3)

Every visible number derives: Jordan's Safe to spend £820.00 = balance £2,340.18 − bills £1,520.18; groceries £212.40 = the four listed payments; subscriptions £58.90 = the four services; Sam's 90 safety days = £4,200 ÷ £1,400/mo essentials; points totals sum their stated sources; Money Speed = the sum of listed commitments (Jordan £72, Sam £420, Elena £850); Elena's £284,600 = 182,400 + 24,200 + 78,000 (pots sum 1,860 + 42,000 + 34,140). Projection maths linear on commitments (investments 5%/yr, labelled "for illustration").

## Verification checklist (before delivery)

- [ ] Click-walk EVERY control with Playwright — real clicks on elements, never function calls (the v6 lesson)
- [ ] Hit-test: elementFromPoint at each control's centre resolves to that control (no overlay regressions)
- [ ] Console clean on load and through the full walk
- [ ] Screenshot every persona × tab (incl. Premier dark) + sheets + detail + list view + arrange mode; visually audit each
- [ ] Red count ≤3 per screen; no internal codes; banned words absent (grep)
- [ ] Zero cropped text; reduced-motion respected
