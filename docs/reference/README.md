# HSBC Atlas — local prototype editions

Rebuilt 8 September 2026; Vanilla support refined 9 September 2026. Open any delivered HTML file directly in a browser. No hosting, server, account, installation or network connection is needed to use it.

| File | Experience |
| --- | --- |
| `index.html` | Vanilla — HSBC typography, clear financial hierarchy, restrained surfaces |
| `bento.html` | Bento — dark ground, large figures, layered colour blocks, floating navigation |
| `metro.html` | Metro — continuous sections, joined tiles, editorial type and photographic stories |
| `support-blueprint.html` | Focused support system blueprint — live cases, state diagnostics, header diagrams and product rules |
| `workbench.html` | Live component system — four moments, three directions, size specimens, behaviour contracts and real actions |
| `../deck/index.html` | Existing presentation, updated to embed the same Vanilla build |

Vanilla now uses one floating support system: a two-second thinking introduction for Now AI summaries, then expanded context and CTAs, a two-line compact card on scroll, and a full-screen conversation on tap. Reading details own their header and start with compact support. Guided journeys omit the support bar and glass, with AI help available in their fixed header. Priya and Maya use attributed profile photos; AI uses a consistent Google Material Symbols avatar. Sam’s audio offer appears only on the Now summary; once started, a separate player carries the recap across screens. Premier remains near-black charcoal. Start review in [the support blueprint](support-blueprint.html) or [workbench](workbench.html), with [the written specification](SUPPORT-BAR.md) alongside. The original shared blueprint path is updated too, with its previous content preserved in `baseline/`.

Each standalone edition contains its fonts, photographs, customer data, styles and behaviour. The HTML files are generated. **Edit `app/` and `Scenarios/`, then rebuild; do not patch an exported HTML file.**

## Four demonstration journeys

- **Alex / Join:** take the three-question quiz; inspect the result in You; confirm or correct it and see the points. In Now, add a suggested number through the size preview. In Future, try an emergency fund, review the monthly amount, agree, inspect the new pot, then undo.
- **Jordan / Stabilise:** open the eating-out story; move from claim to working to choice; preview the What If. Move time to see the fund finish, review the amount and agree. Inspect the rules and soft budget, transfer money into the fund, and reverse the changes through Activity.
- **Sam / Grow:** tap the play avatar at the top of Now and explore another tab while it continues; use the independent player for pause, rewind, speed, transcript and close. Then inspect the house deposit and its terms; preview investing alongside another idea; compare the dates and monthly amounts. Review the investment illustration with the demo acknowledgement, then agree. The £1,300 starting transfer leaves current cash and enters the new investment pot. Explore a reward and use points; the receipt and points ledger update together.
- **Elena / Graduate:** open Priya’s review and confirm or request another time. In You, switch between Elena, Aisha, Leo and the household. Open the conversation and bring in a person. Explore Leo’s future pot. Step down permissions, see monthly automation pause, then restore it.

“Reset this moment” restores only the selected customer. Switching customers preserves each customer’s independent in-memory changes. Reloading a file resets the whole demonstration. `#p=sam&tab=future` can open a chosen customer/tab.

## Source structure

| Layer | Source | Responsibility |
| --- | --- | --- |
| Data | `../Scenarios/moments/*/l1.json`, `l2.json`, `../Scenarios/shared/` | Customer facts, authored intelligence and component catalogue |
| Behaviour | `app/core.mjs` | Independent customer sessions, projections, preview, commit, transfers, rules, rewards, receipts and undo |
| Models | `app/models.mjs` | Derive all module values and contextual companion messages from the active customer |
| Vanilla support | `app/support-system.mjs`, `support.mjs`, `support-controller.mjs`, `styles/zz-support.css` | Persistent context, explicit authorship, compact / expanded states and local snapshot audio |
| Primitives | `app/primitives.mjs` | Buttons, icons, rows, progress and the same financial module in four sizes |
| Screens | `app/screens.mjs` | Now, Future, You; charts, stories and household presentation |
| Dialogs | `app/dialogs.mjs` | Collection, pot, rule, transfer, What If, quiz, gallery, conversation and rewards flows |
| Application | `app/app.mjs` | Route actions, manage focus/scroll, render state, preserve the deck API |
| Workbench | `app/workbench.mjs` | Live specimens and fourteen behaviour contracts; uses the actual application |
| Foundations | `app/styles/base.css`, `experience.css` | Semantic tokens, shared anatomy, responsive layout and interaction states |
| Directions | `app/styles/z-directions.css` | Bento and Metro composition, surfaces, typography, navigation, imagery and Premier treatments |
| Build | `build.py` | Embed data and assets and produce all four standalone files |

The direction is presentation state, never a separate financial or behavioural implementation. There is no runtime backend or framework. Source `.mjs` modules can be imported directly by tests; the build bundles them into one inline script for offline delivery.

## Behaviour decisions

- Preview uses a cloned customer. Agreement alone changes the live session. A non-committable Premier illustration can be previewed but cannot be agreed as a financial change.
- Starting investment money is a transfer, not newly created wealth. Transfers validate funds, distinct endpoints and the remaining debt, then write both ledger entries.
- Active rules drive monthly contributions. Sam’s “Not decided yet” pot has no agreed rule in L1, so the unexplained `monthlyRate: 30` does not create a contribution.
- Debt cannot fall below zero. Targets cap only pots whose `stopsAtTarget` is true; continuing plans can exceed their target. A completed stopping rule can be redirected to another pot. Global permission pause also pauses scheduled redirects.
- What If cap/remainder/round-up amounts are monthly assumptions. The soft spending cap is recorded and shown; it does not block card payments. Original bank activity is not rewritten to make a budget appear successful.
- Quiz answers shape the personality result. Repeating the quiz or confirming the same belief cannot repeatedly mint points. Corrections retain original evidence. Redemption checks points and Premier eligibility and records the selected benefit.
- Every material demo change has a receipt. Undo restores data, rules, rewards and relevant content together, latest change first; the audit trail remains. Navigation and conversation remain usable.
- Tabs preserve their own scroll position. Sheets make the background inert, trap keyboard focus, close on Escape and restore the invoking control where it still exists. Icon-only navigation has explicit names. Reduced-motion preferences disable animations.

## Modelling and demo boundaries

This is an interactive product concept, not connected banking. Payments move between the accounts and pots in the supplied dataset; no external payee or bank receives money. Invitations and appointment requests are recorded locally and never sent. The human review and conversation are scripted demonstrations.

The projection assumes the recorded monthly contributions continue. It holds current-account cash constant and omits future income, spending and product interest. Investment pots with a recorded growth assumption use monthly compounding; growth is illustrative. Target dates therefore describe this model, not a promise or a full cash-flow forecast. Bubble sizes use minimum readable dimensions; the list exposes exact values. Nested future redirections are a simplified model; the demonstrated redirection is one completed rule moving to one destination.

The dataset does not contain real credit scores for these moments. The UI shows Learning / unavailable states rather than inventing values. Product rates and benefits are scenario content, not claims about current HSBC products. Reward rate boosts appear as active benefits; interest is not calculated by the prototype.

## Build and verification

From the project root:

```sh
python3 prototype/build.py
python3 deck/regen.py
python3 prototype/build.py --check
python3 deck/regen.py --check
python3 Scenarios/validate.py
node --test prototype/tests/*.test.mjs
```

Core tests need only Node. Interface tests need `jsdom` (the `prototype/package.json` dev dependency). They accept `ATLAS_JSDOM` pointing to an existing installation; this workspace also has a tested local fallback. No dependencies are needed to open the delivered prototypes.

See `VERIFICATION.md` for completed checks and their limits. Browser verification used the local in-app browser; DOM integration tests are not a substitute for the visual checks.

## Previous implementation

`baseline/index-v1.9.html` is the untouched playable prior prototype. `baseline/build-v1.9.py` preserves its old build script. The numbered files in `src/` remain historical source; only the HSBC font file is used by the new build. Original reference documents and photographs in `Shared assets/` remain untouched. The new web renditions are in `app/assets/`.

## Money-container detail structure

The September 8 presentation revision unifies current, credit, saving, borrowing and investment detail views through `containerDialog` in `app/dialogs.mjs`. They share balance → actions → features and rules → information → activity. Existing Vanilla styles and controls are reused; AI assistance is contextual to the selected account or pot. The collection lists these containers together. This is a presentation/component unification: the underlying account/pot ledger schema and financial model are unchanged. Specific ISA feature selection is not yet present in the scenario UI.

Design direction for future refinements: [DESIGN-PRINCIPLES.md](DESIGN-PRINCIPLES.md). Prefer meaningful icon controls and adaptive states over toolbars of explanatory links.

Vanilla Now follows the updated [Now tab specification](NOW-TAB.md): one Number grid, customisable Quick Actions, a counted accounts-and-pots entry below the Number grid and All HSBC products at the bottom. The action catalogue and product directory are implemented in `app/now-system.mjs`.

[Accounts & pots specification](ACCOUNTS-POTS.md) covers the refined collection, contextual Open Banking prompt, read-only sample connections and disconnect flow. Source: `app/accounts-system.mjs`.

### Pots & Accounts system

See [POTS-ACCOUNTS-SYSTEM.md](POTS-ACCOUNTS-SYSTEM.md) for the supplied IA, five live variants, agreements, rule review/execution, shared consent, evolution and Number behavior. The workbench opens each example directly. Domain logic: `app/container-model.mjs`; Vanilla views: `app/container-views.mjs`; layout: `app/styles/zzz-containers.css`. The empty wallet extension is separate from the original scenario snapshots.
