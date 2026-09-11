# Secondary content and bottom-sheet review

10 September 2026 · Global audit, with How it works implementation updated after review.

**Implemented refinement:** How it works now opens one sheet with all conditions, essential evidence and controls visible together. Conditions do not have separate detail pages or accordions. Full terms use the same sheet with Back navigation. Focused follow-up tasks retain their existing routes and return to the overview. This supersedes the per-condition navigation proposed below. Other global migrations remain recommendations.

## Decision

Use a bottom sheet for a focused explanation, contextual choice or short follow-up task. Use a full-screen view for a destination or a substantial journey. Keep essential status and consequences visible on the parent screen. Do not use nested accordions in the customer experience.

The issue is not that accordions are inherently unsuitable for mobile. In this prototype they mostly conceal a separate task or destination, and expanding them repeatedly moves the surrounding page. A bottom sheet preserves the pot/account as the visual context while giving the secondary content a clear beginning and end.

## Complete accordion inventory

Source audit covers current app modules, their shared workbench/blueprint outputs and the older detail renderer still used by Bento/Metro. Historical baseline files and colleague reference documents are not live product surfaces.

| Current use | Assessment | Recommended replacement |
| --- | --- | --- |
| Pot/account “How it works” overview | The compact summary works; expanding it disrupts the detail page and introduces nested disclosures. | Keep the benefit, status, short reason and rule count visible. Tap the card to open a “How it works” bottom sheet. |
| Individual Agreement conditions: payment, merchant, spending, lock, capital or statement | Each contains its own evidence or action. Multiple expanded rows become a long form. | Short condition/status rows in the overview sheet. Tap to navigate to that condition within the same sheet; Back returns to the overview. Show the selected condition’s essential content directly, with no further accordion. |
| “Other money moves” | Hides related rules behind another control and makes optional automation difficult to discover. | A labelled list of optional rules after the condition rows, visible in the overview sheet. Selecting a rule opens its summary in the same sheet. Long lists scroll. |
| Connected external account → “Account information” | A small reference panel, well suited to temporary inspection. | An Account info action opens a bottom sheet with bank, masked account, shared data and connection state. Keep read-only status visible on the account page. |
| Money rule → “Try this rule in the demo” | Presenter functionality, not customer information. | A quiet “Preview sample trigger” action opens the existing preview content in a bottom sheet, with explicit confirmation before applying the simulated event. Put this action in the workbench/demo area where practical. |
| “Your terms” in the older Bento/Metro pot/account renderer | Another version of a pattern already handled by the Agreement sheet in Vanilla. | Align with the shared terms sheet when updating those themes. Do not retain a second accordion implementation. |

Sources: `app/container-views.mjs`, `app/accounts-system.mjs`, `app/dialogs.mjs`. Five current use cases, plus one older themed-renderer use case. The AI card’s automatic expansion, Future view changes and editable action grids are not accordions and should retain their purpose-specific behaviour.

## Proposed pot flow

Pot detail → How it works sheet → selected condition → short choice or payment-method summary.

Only one sheet is visible. Moving deeper replaces its body and adds a Back control; it does not pile up dimmed sheets. Close returns directly to the pot at its original scroll position. Back returns to the previous sheet page, preserving its scroll.

For Jordan, the pot still visibly says “Benefit changed”, “0% cashback”, the shortfall reason and rule status. In the sheet, show the recovery next step first, then compact condition/status rows. “Review my options” opens the explanation and alternatives within that sheet. A reviewed payment then moves into the full-screen payment journey. Completing it refreshes the originating pot and its benefit state; it must not imply that September cashback has been restored early.

## Adjacent surfaces to align

- **Now and pot/account More:** the same action-grid bottom sheet for browsing. Customise can use a taller state of that sheet, retaining the shared drag/tap mechanism and explicit Done. Do not turn the grid into an accordion.
- **Rule summary, payment methods, merchant selection and simple limit/goal edits:** bottom sheets. Creating a multi-field rule, reviewing an investment change or inviting a member with permissions remains a full-screen journey.
- **Full Agreement terms and audio transcript:** scrollable reading sheets. Important costs, deadlines or restrictions remain visible before confirmation, not hidden exclusively in terms.
- **Accounts & pots, account/pot details, transaction history, product browsing and AI conversation:** full-screen destinations. AI conversation retains its established full-screen modal treatment.
- **Payments, bank-connection consent and consequential reviews:** full-screen journeys with clear progress and explicit confirmation. A sheet is an entry point, not a reason to compress the whole journey.

## Shared sheet behaviour

Use the existing Agreement sheet’s Vanilla surfaces, rounded top corners, handle, close button and scrim as the visual foundation. Short content fits its height; longer content can occupy up to about 85% of the phone viewport, with a fixed header and independently scrolling body. Preserve Premier colours and focus contrast. Avoid nested scrolling and automatic height jumps between condition pages.

The status bar and entire background receive the scrim. Background interaction and scrolling are disabled. Focus enters the sheet, stays in it, and returns to its trigger on dismissal. Close, Escape and scrim dismissal work for read-only content. For edited forms, prevent silent loss of changes and offer Keep editing or Discard; opening or dismissing a sheet never commits a payment, rule or consent. Any swipe dismissal must follow the same rule.

Do not repeat the floating AI bar inside a sheet. A contextual help action can open the existing conversation experience, preserving the originating sheet and draft so closing chat returns to the same task.

## Implementation assessment

The existing `openAgreementSheet` is a good visual starting point but currently supports only a single read-only Agreement body. It is not yet a general sheet controller. Before migrating these surfaces, generalise it to support internal Back navigation, focus/scroll restoration, draft handling and safe transitions into full-screen journeys. The function named `openModal` currently renders full-screen detail/journey views in Vanilla; changing CSS alone would not establish the correct behaviour.

Suggested order: shared sheet controller and workbench states; Agreement/conditions/rules; external Account info and demo preview; More/actions and simple follow-ups; themed parity. Verify dismissal, keyboard use, preserved parent scroll, cancelled edits, global rule pause, manual fulfilment and recovery dates throughout.

No current customer-facing accordion needs to be retained. Future purely optional inline reading content could justify one, but it should not hide an actionable task or create nested navigation.
