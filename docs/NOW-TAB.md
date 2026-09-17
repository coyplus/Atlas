# Now tab — Vanilla component specification

Updated 9 September 2026. This supersedes earlier Vanilla descriptions of a separate hero balance and “What you hold”. Bento and Metro retain their existing compositions pending visual review.

## Page order

Scrolling global header → floating AI companion → Quick Actions → My numbers / Customise → Number grid → All accounts and pots (live count) → My stories → All HSBC products → fixed tab navigation. The established support rules remain in SUPPORT-BAR.md. The counted entry opens the refined Accounts & pots overview. See ACCOUNTS-POTS.md for its Open Banking journey.

## Numbers

Every item comes from the same Number model and renderer, including the first item. The scenario selects the starting set and size; there is no separately rendered hero or protected first position. A wide Number spans two columns with a large value; Square, Wide, Tall and Full share the same amount, detail destination and edit controls. Any item can be resized, reordered, removed and added again. Customise reveals the controls and enables grid dragging; Move earlier provides a keyboard alternative. Changes support Undo. Add a number uses one grid cell and opens the existing size-preview gallery.

The starting numbers remain appropriate to each supplied scenario: Alex’s current account, Jordan’s safe-to-spend amount, Sam’s deposit and Elena’s wealth. These are ordinary wide widgets, not mandatory dashboard sections. Alex begins with a familiar account widget; the Number gallery lets the home screen evolve as the relationship grows. Customisation never changes the underlying financial values.

## Quick Actions

Three personal shortcut positions and a fixed More entry. Defaults: Pay, Transfer, Add money. More opens a full-screen journey with its own fixed header and optional AI help. No AI bar competes with the controls.

The first section shows primary shortcuts; the second shows the remaining available actions. Normal mode launches actions. Customise creates a draft and exposes the edit states:

- Drag an available action onto a primary position to replace it; the displaced action returns to More.
- Drag between primary positions to swap them.
- Drag a primary action into More to remove it. Vacant positions accept a new action.
- Tap or keyboard-activate an action to select it, then activate a destination above or “Move here” below. Activate the selected action again to cancel selection.
- The selected action has a monochrome ring; a valid drag target has a dashed red outline. A pointer cancellation or drop outside a destination makes no change.
- Done saves the draft and returns to Now. Back or Escape discards unsaved edits. Saved preferences belong to the current customer and survive tab changes. Undo restores the previous set; demo reset restores defaults; reload preserves saved preferences.
- More cannot be replaced or removed. Primary slots are unique and limited to three. Available actions are derived from the catalogue, so a replacement never loses an action.

Catalogue: Pay, Transfer, Add money, Statements, Invest, Manage cards, Convert, Standing orders, Direct Debits and Help. Existing transfer, investment and rule journeys are reused. Statements display actual scenario account activity. Card freeze is local demo state. Conversion uses explicitly labelled illustrative rates, with no exchange transaction. Back from a launched action returns to the catalogue; AI help preserves the editor draft.

## Products and services

The bottom entry opens a reading detail with its own header and compact contextual support. A three-column Material Symbols grid contains Credit cards, Savings, Invest, Mortgages, Loans, International services, Overdrafts, Insurance, Current accounts and Business banking. A Sustainability resource follows the grid. Each category opens an overview with a relevant planning, account or conversation entry. Back restores the catalogue.

The directory uses existing Vanilla tokens and locally bundled assets. This is an offline concept directory, not a live product comparison or application service. No rates or eligibility claims are presented as current HSBC offers.

## Review

Use the workbench’s Quick Actions and Products contracts. Verify desktop or touch dragging, equivalent tap placement, save/cancel/undo, each customer’s first Number, and catalogue → detail → back. The automated interface tests cover saved state, cancellation, customer isolation, number editing, account data and return paths; the pure shortcut tests cover swaps, removal, insertion and invalid drops.

Verified on 9 September 2026: 61 automated checks pass across the shared model, interface, support and presentation pathways. Generated prototypes, shared blueprint and both decks pass freshness checks. Browser review covered Vanilla Now, the ordinary wide Number in edit mode, products catalogue, light/Premier shortcut screens and dragging Statements from More onto Pay’s primary position.

## Shared Quick Action button

Now shortcuts and Vanilla pot/account actions use `quickActionButton` from `app/primitives.mjs`: one circular icon target and its text label, sharing sizing and styling. Container detail screens supply context-specific actions and retain their own section insets.

## Spending insights and spendable pots

Grocery spending is a transaction insight labelled “Spent this month”; Grocery budget is a money container labelled “Left to spend”. Both can be pinned, resized and opened independently. They link to each other in detail. Jordan and Sam’s default grids now reflect spending control, borrowing and their shared households. The dated Grocery budget cashback recovery model and ledger scope are documented in POTS-ACCOUNTS-SYSTEM.md.

## Compact Number visual grammar · 10 September

S and W cards show a name, figure and at most one short context line. Pots/accounts use a purpose or bank icon enclosed in a soft square on a solid surface. Aggregated insights use an open chart icon on a standard card surface. The cue combines shape and surface, so colour is not the sole distinction; Premier stays neutral charcoal. The selected title, e.g. Grocery budget versus Grocery spending, also carries meaning. Role labels, chevrons, long explanations, W footers and mini-card progress bars are removed. Shared membership is an avatar stack only, mixing photos and initials. Accessible labels retain the figure meaning and participant names.

T and F sizes may include a small number of useful rows and goal progress. Full Agreement conditions, qualification dates, transaction scope and actions remain available on the detail screen. The shared card component renders this consistently in Now, the gallery and the workbench. The workbench adds a side-by-side comparison when the selected customer has a grocery pot.

The revised live layout still needs screenshot review: the browser’s local-file navigation policy blocks inspection of the prototype. Source and functional checks do not replace that visual review.

Current colour treatment: all Number cards use the same standard surface, border and text palette within their theme. There is no Pot-versus-Insight colour identifier. Enclosed purpose icons identify money containers; open chart icons identify Insights. Premier inherits the same shared card treatment in its existing dark palette.

## Budget Numbers and Jordan’s default grid · 10 September

Safe to spend is Jordan’s first wide Number. Grocery spending remains in the catalogue but is not pinned by default; his Grocery budget pot remains visible.

A Budget Pot Number now leads with the monthly allowance (£320/mo), shows recorded spending (£150.30 spent), and a thin usage bar. The calculation uses the same calendar-month spending condition as the pot detail. Funding transfers do not count as spending or increase the budget; cash actually available remains explicit in the detail. For example Jordan has £69.70 available, £150.30 spent and a £320 monthly allowance: unused allowance is not presented as available cash. Above-budget spending keeps the actual amount, adds the excess in text and caps the red bar at 100%. Shared avatars remain compact. This budget-specific presentation replaces the benefit note in mini widgets; current cashback and agreement conditions remain in the detail.

Compact Budget Pot usage bars sit at the bottom of the card’s content area, with a minimum 12 px gap above. Adjacent cards share the same bar baseline even when one has participant avatars or wrapped copy.

## My stories

Stories now open a timed three-frame viewer: claim, visual working, then an optional decision. The first two pages have no decision CTAs. Swipe, pause and header AI access follow [STORIES.md](STORIES.md), including reduced-motion and evidence-sheet behaviour.
