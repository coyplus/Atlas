# Pots & accounts — one arrangement

Current Vanilla system · 9 September 2026

This version replaces the agreement/linked-rule card treatment. It implements the user’s clarified model: **Agreement → Conditions → Fulfilment methods → Benefit**. The interface summarises the current benefit and status, then progressively reveals conditions and fulfilment controls.

## Model

An account or pot has stable identity, money, purpose, participation, an arrangement and recorded activity. Shared ownership is an attribute, not a separate financial type. An arrangement defines the bank’s benefit and one or more customer conditions. Each condition has its own evidence, status and appropriate controls. Automation is a method; it is never itself proof of payment.

`app/arrangements.mjs` provides the common arrangement and condition model. `app/container-model.mjs` adapts it for all pots/accounts and Number sizes. `app/container-views.mjs` renders the detail, condition management and agreement sheet. AI reads that same model in `app/support.mjs`. Illustrative personal offers remain in `Scenarios/shared/container-experience.json`.

| Condition | Evidence and state | Customer interaction |
| --- | --- | --- |
| Contribution / instalment | Money received in the calendar-month demo period; remaining amount and month-end due date | Pay manually; create, edit, pause, resume or remove an automatic payment |
| Merchant nomination | Explicitly reviewed supermarket choice and effective date | Choose or change Tesco, Sainsbury’s or Aldi |
| Spending allowance | Actual eligible wallet outflows versus the monthly limit | Choose spending; edit the alert/limit settings |
| Savings lock | Explicit acceptance and a dated restriction | Review and accept; deposits allowed, withdrawals unavailable until expiry |
| Invested capital | Current invested value against a threshold | Inspect investment approach; monitor value and contribute separately |
| Credit statement | Existing statement information | Inspect statements; no minimum or due date invented for missing data |

**Current benefit**, **condition progress** and **planned method** are separate. A paused rule does not remove previously received money, lower a displayed rate or erase the monthly obligation. A running rule is described as planned. Only recorded qualifying receipts complete payment conditions.

## Customer experience and layout

1. Own detail header and compact floating AI support.
2. Large balance, type, purpose/target and participants.
3. Shared Now-style circular quick actions.
4. **How it works:** a compact bottom-sheet entry card showing a status icon and label, current benefit, one short explanation and **View details**. The detail screen contains no expanded Agreement content.
5. Activity.

Opening the card presents one bottom sheet with the benefit/status, recovery context where relevant, every condition and its essential evidence, and fulfilment controls visible together. Automation is shown alongside the condition it supports; optional rules appear in an uncollapsed Other money moves list. Full terms replace the content within the same sheet through **View full agreement**, with Back returning to the overview. Closing restores the pot’s position and focus. The overview is a summary of the same arrangement, not a separate agreement model.

A payment condition shows actual receipts, remaining amount, due date and planned automation. **Manage payments** opens the methods for that condition. Each method can be edited or removed with a review explaining what the customer will need to do manually. **Automate this** starts a reviewed instruction for the agreed amount. **Add money** prefills the remaining contribution and uses the normal reviewed transfer flow. After confirmation, the same pot reopens and progress updates from the new ledger entry.

There are no new surface, brand-colour or typography tokens. The composition uses Univers, existing Vanilla surfaces, Google Material Symbols, neutral focus and the shared quick-action primitive. Premier remains charcoal. Household portraits and bank identities continue to use the existing local assets.

## Demonstrated variations

- **Sam / House deposit:** 5.1% committed saving; £320 each calendar month, manual or automatic. The 8 September snapshot contains the last received payment on 28 August. September starts with zero received, and the existing payment is shown as planned. Disabling it makes manual responsibility clear while keeping the rate unchanged.
- **Jordan / Everyday budget:** 1% cashback, up to £5/month, with three conditions: nominated supermarket, funding the monthly allowance, and spending within it. These conditions appear together as compact rows after opening the card. Selection alone neither earns nor credits cashback. This wallet starts empty and has no fabricated spend history.
- **Jordan / House deposit:** existing 4.0% AER variable saving, plus an optional 4.6% AER fixed three-month lock. Rate and lock change only after explicit reviewed acceptance. Deposits are allowed. All withdrawal paths, outgoing rule execution and savings-to-investment conversion respect the lock. At expiry, access returns and the current demo rate reverts to 4.0%.
- **Jordan / Car loan:** 0% fixed illustrative interest and £150 monthly instalments. September’s repayment is already recorded, so the condition is complete even when automation is paused. Future instalments remain due.
- **Elena / Investments:** illustrative 0.20% service fee with a £100,000 capital condition; 0.30% is the illustrative standard fee described in terms. Falling below the threshold creates an attention state, not an automatically applied new fee. Future growth remains illustrative; monitoring cannot guarantee investment value.
- **Elena / Family holiday:** the shared £1,860 pot retains its 4.5% AER variable benefit, participant portraits, access roles and optional contribution instruction. Sharing does not invent an additional automation requirement.

All added pricing and terms are concept examples, not live HSBC offers. No balances, interest, charges or cashback are fabricated by opening or configuring these experiences.

## Fulfilment and safeguards

Payment evidence counts received contributions or repayments from the relevant ledger in the scenario’s current calendar month. Transfers and simulated rule executions both create ledger entries, so manual and automatic fulfilment are equivalent. Old-period contributions, pending schedules and investment growth do not count as current payment evidence. The demo measures gross contributions; it does not offset later withdrawals against them. A production agreement would state its qualifying-evidence policy explicitly.

Global pause stops automatic methods while preserving actual progress and the current benefit. Reviews show planned payment changes and manual responsibility. Cancelling changes nothing. Confirmed changes use reversible local transactions. Rules still respect available balances, caps, protected source amounts, debt limits and locks.

The savings lock is stored on the source container and checked by the shared transfer engine and rule execution. It is not merely a disabled button. Conversion to investment also checks the lock. Merchant and lock reviews require explicit confirmation; lock acceptance additionally requires acknowledging the unavailable period. No invitation, bank instruction or contract is sent outside the local demo.

## Scope and open policy

The user confirmed that automation is optional for payment conditions, and that agreements may combine monetary, behavioural, choice and commitment conditions. That model is implemented.

Except for the dated Grocery budget recovery example below, missed-condition grace periods, notifications, replacement rates and penalty policies remain unspecified. The prototype makes responsibility and current progress explicit, but does not invent automatic repricing or retroactive penalties. Capital threshold assessment shows current value, not proof of a continuously maintained balance. The Future projection continues to exclude product interest and charges.

Shared access retains the existing owner/contributor/viewer example. Separate authenticated member sessions and real multi-party contract changes are outside this local prototype; no additional authority is implied by a portrait or shared balance.

## Workbench and verification

The workbench includes direct entries for savings, wallet, loan, investment, shared saving and optional savings lock. Use them to review each condition type rather than a set of disconnected component specimens.

Tests cover manual completion after removing automation, payment already complete before pause, calendar-period reset, multiple methods, global pause, condition-choice cancellation, no reward on selection, lock consent, blocked withdrawal/execution/conversion and expiry, repayment evidence, capital attention without repricing, and retained navigation/support behaviour. DOM and model checks are separate from visual verification: a fresh live browser visual review remains unavailable under the previously encountered local-file browser restriction.

Original references and the user’s IA are retained. `POT-EXPERIENCE-RETHINK.md` records the reasoning behind this model. Asset credits remain in `ASSET-CREDITS.md`.

## Detail refinement

The final copy/layout cleanup removes the redundant `container-key` line, repeated wallet-limit summary and general condition explanations from the main detail. Goal progress uses the goal amount, remaining amount and one thin bar. The primary action row has at most four controls; goal editing and optional rule creation sit in More. Conditions retain the actual amount, deadline, status and any material payment responsibility. Full explanations remain in management and terms. Routine “Current/Available” benefit labels are omitted. Empty activity is one sentence and has no redundant View all action. Connected-account details retain the read-only restriction without repeating it across several cards.

This refinement is source-reviewed and covered by the existing behavioural checks. A fresh rendered visual review was attempted through the existing in-app browser tab and blocked by its local-file URL policy; pixel-level layout remains unverified.

## Household stories, spending insights and benefit recovery · 10 September

Jordan now watches Grocery budget (£69.70 available), Grocery spending (£212.40 spent), his £780 credit card, Flat utilities (£180 shared with Ben and Nia), Eating out budget (£69), his emergency fund and £3,600 car loan. The original empty Everyday budget remains available in the collection. The card has a recorded £60 September minimum payment and a 30 September due date; the recorded payment satisfies that condition.

Sam shares Family groceries (£101.90), Family holiday (£600) and the £4,200 emergency fund with Riley. Their four-year-old Ella is part of the household story, with no account access. The £6,400 house goal and £850 undecided savings remain separate. His existing recap remains accurate; it does not claim these are all his pots. Ben and Riley use public profile photos; Jordan, Sam and Nia retain initials. No private personality is inferred from joining a pot.

### Spending versus money available

Both are ordinary customisable Numbers. Current compact cards use an enclosed purpose icon on a solid surface for a money pot, and an open chart icon on a standard card surface for an insight. They show one short contextual note. Shared membership uses avatars alone. “Spent this month”, “Left to spend”, scope and ownership remain explicit in the detail and accessible label, without adding role labels to mini cards. See NOW-TAB.md for the current visual grammar.

The grocery insight sums recorded grocery purchases in the current calendar month, across all included ledgers. Card purchases increase spending; refunds reduce it. Top-ups, transfers, older transactions and future-dated entries do not count. It includes spending from the grocery pot once, not twice. Connected banks currently supply balances only and are explicitly excluded from the transaction insight until transaction sharing is implemented. The insight links to the matching pot and its available balance; the pot links back to spending across accounts. Where no pot exists, the insight explains it and offers a reviewed creation flow starting at £0.

### A defined unhappy path, not a general penalty policy

Jordan’s Grocery budget demonstrates one explicitly illustrative agreement. August required £320 of contributions; £220 was received. A recorded assessment changes September cashback from 1% to 0% on 1 September. Previously earned cashback remains his, with no fee or backdated deduction. The rest of the pot still works.

Recovery requires £320 received during September, a nominated supermarket, and spending within the agreed £320 limit. September starts with £220 received, so a reviewed £100 manual top-up completes the funding condition. An enabled rule alone cannot complete it. The interface then shows “Ready for cashback to return on 1 October”; September still shows 0%. On or after 1 October, the common model restores 1% only when September’s evidence satisfies all conditions. Changing an alert limit cannot rewrite the historical assessment. Undo restores the payment evidence and recovery state.

The current benefit and a short explanation appear on the closed **How it works** card. A red edge, information icon and **Benefit changed** label identify the changed benefit without relying on colour alone. Opening the card reveals the recovery summary and **Review my options**, which opens the dated explanation and actions to contribute, manage automation or ask for an affordable alternative. The AI explicitly offers continuing to use the pot without cashback, rather than pushing a payment at the expense of essentials. A request about affordability can bring in Maya through the existing human triage. Suggested chat questions cover the reason and manual payment.

This is a dated demonstration, not a complete recurring eligibility engine. It does not invent a second recovery window if September also fails. It instead offers help reviewing a new plan. Real product policy still needs decisions on notice, assessment timing, exceptions, ongoing eligibility and alternative offers. Other arrangements retain their previous behaviour; there is no universal repricing or credit penalty.

The workbench has direct entries for cashback recovery, flat utilities, family groceries and shared holiday saving. L1 snapshots, opening balances, totals and historical entries are reconciled. Shared-pot totals show the whole accessible pot, not a calculated beneficial ownership share. Projection assumptions still exclude future spending, product interest and fees.

## Budget Numbers and Jordan’s default grid · 10 September

Safe to spend is Jordan’s first wide Number. Grocery spending remains in the catalogue but is not pinned by default; his Grocery budget pot remains visible.

A Budget Pot Number now leads with the monthly allowance (£320/mo), shows recorded spending (£150.30 spent), and a thin usage bar. The calculation uses the same calendar-month spending condition as the pot detail. Funding transfers do not count as spending or increase the budget; cash actually available remains explicit in the detail. For example Jordan has £69.70 available, £150.30 spent and a £320 monthly allowance: unused allowance is not presented as available cash. Above-budget spending keeps the actual amount, adds the excess in text and caps the red bar at 100%. Shared avatars remain compact. This budget-specific presentation replaces the benefit note in mini widgets; current cashback and agreement conditions remain in the detail.


### Progressive disclosure and status (10 September)

- **Benefit changed / Needs attention:** red edge and information symbol, with a precise one-line reason. Only recorded benefit changes or failed limits/thresholds use this treatment.
- **Payment to make / Your choice:** neutral clock or information icon; this is an outstanding action, not a breach or an automatic loss of benefit.
- **Payment planned / Locked / On track / Current:** neutral status symbol. A planned payment never claims the condition is complete.
- **Return scheduled:** clock and effective date; current cashback remains 0% until restoration is effective. **Back on track** appears only after restoration.

There are two information levels: the compact pot-screen summary and one complete overview sheet. No condition accordions remain. Focused actions open their existing tasks, with Back restoring the sheet and its scroll position. Keyboard focus is contained within the active sheet. AI retains the empathetic explanation and next-best actions; financial consequences remain available in the recorded recovery details and full terms. Normal and Premier use the same status semantics and existing surface, text and red tokens.

The closed overview also carries one neutral automation line: **2 active rules**, **1 active rule · 1 paused**, **0 active rules · 2 paused**, or **No rules attached**. A global pause is explicit (**2 rules · all paused globally**). Counts include incoming and outgoing attached rules, including optional rules, and use the same state as rule management. The repeat/pause icon does not imply that a scheduled transfer has arrived or that a benefit condition is complete. Opening the overview reveals the corresponding condition controls and optional money moves.

### Pot/account More actions

**More** opens the shared Quick actions editor used on Now: circular icon buttons, a primary section and a separate More actions grid. **Customise** enables drag-to-replace/reorder and the equivalent tap-action-then-destination interaction. Up to three primary actions plus a fixed More entry can be shown; removed actions remain available in More. **Done** saves and returns to the originating pot/account. Leaving without Done discards the draft. Selections are stored per container within the scenario session and do not change Now or another container.

The catalogue follows the container’s capabilities: Add money/Repay, Move money where applicable, Account info, goal/limit editing, rule creation, My numbers, shared access, eligible investment exploration, activity and AI. All actions retain the originating container ID and existing review/consent flows. Credit containers do not offer withdrawals or sharing. The same component and pointer/tap handlers power both Now and container customisation, including Premier styling.
