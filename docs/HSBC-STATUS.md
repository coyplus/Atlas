# HSBC Status — design review

Implemented in the Vanilla You tab. Status is followed immediately by HSBC Points, with the existing journey timeline retained.

## Agreed qualification

| Tier | Total Relationship Balance |
| --- | --- |
| HSBC | Below £100,000 |
| Premier | £100,000 to below £250,000 |
| Elite | £250,000 or more |

The compact card and expanded screen share the same proportional tier ladder. Customers can inspect their qualifying holdings and browse all three memberships. Elite is the final tier. Points, badges, personality and check-ins do not affect qualification.

## Prototype assumptions to review

- TRB counts balances in HSBC accounts and pots once, including investments. Borrowing is excluded and is not deducted; externally connected accounts are excluded.
- Shared pots count once under their recorded owner. Selecting another household portrait does not change the customer's TRB or grant another person's membership.
- Premier includes three choices and Elite five. These allowances and the illustrative benefit catalogue are proposals, not confirmed economics or live HSBC product terms.
- The catalogue adapts the supplied Premier Hub concept. Core access remains included; customers choose additional services and experiences. Elite includes Premier access.
- Saving choices records preferences only. No Points are deducted, money moved, insurance activated, service registered or event booked. Activation and availability require separate follow-up flows.
- Qualification reflects the current scenario balances. Averaging periods, retention rules, grace periods and treatment of market-driven balance changes remain product decisions before a live implementation.
- Existing historical tier metadata remains for legacy scenarios, themes and support routing. This module and the Vanilla header derive status from TRB.

## Scenario results

| Customer | TRB | Status |
| --- | --- | --- |
| Alex | £1,180.62 | HSBC |
| Jordan | £3,238.88 | HSBC |
| Sam | £98,000.00 | HSBC · £2,000 from Premier |
| Elena | £284,600.00 | Elite |

Sam now includes £82,727.66 in a separate Long-term savings pot, bringing TRB to £98,000 while preserving his everyday cash and family plans. The opening ledger and stored totals reconcile. All tiers can be explored through the detail tabs; boundary tests and an injected Premier balance verify qualification.

## Interaction and structure

- `src/features/membership/model.mjs`: thresholds, catalogue, balance calculation and choice validation.
- `src/features/membership/views.mjs`: entry, tier comparison, balance/benefit/household sheets and choice journey.
- `src/features/commands/membership.mjs`: navigation and draft → review → save interactions.
- `src/features/membership/membership.css`: neutral membership treatment and responsive layouts.
- Detail screens use the shared Level 2 header; contextual details use secondary bottom sheets with the parent screen preserved underneath.
- AI can explain membership in context; Elena can enter the existing simulated Relationship Manager conversation.

Validation: threshold and choice domain tests, membership journeys on mobile Chromium and WebKit, 320px layout checks, common header tests, full regression suite, lint and production build.

## September 10 refinement

- HSBC retains its grey pass. Premier and Elite share the existing neutral dark app theme. Premier’s pass is deep graphite; Elite’s pass uses a black titanium treatment: neutral white ink, a fine platinum edge, a 12px corner and no inner frame or sweeping sheen. Premier retains a slow 18-second reflection, disabled for reduced motion; Elite has a static satin finish.
- Tier tabs change the complete detail-screen palette. A lock label, qualifying threshold and remaining amount distinguish an aspirational preview from current membership. Previewing does not alter qualification or benefit permissions.
- Both Premier and Elite provide a personal Relationship Manager route.
- Sam’s AI suggests retaining £500 from each new payday, editable within the remaining surplus. Four paydays assumes £500 of net balance growth each month; this is not a forecast or a promise of qualification.
- The rule uses the existing payday automation model, saving to the Not decided yet pot after salary arrives in HSBC Current. Setup does not move funds or increase TRB. Existing pause/edit/remove controls apply, including global pause.
- Internal transfers do not increase TRB. Qualification still depends on the balance actually reaching £100,000 after spending, withdrawals and any value changes.

Tier changes apply ink and surface colours together, without a colour fade. The pass settles horizontally over 280ms; repeated selections do nothing and reduced motion switches instantly.
