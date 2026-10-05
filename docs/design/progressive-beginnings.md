# Progressive beginnings — You and Future

Implemented 25 September 2026 following the owner's roadshow review. The demo briefly shows Alex's opening screen, then switches to Sam; it does not walk through onboarding.

## You

An unnamed portrait leads with an invitation: three questions to discover an approach to money. The existing outline artwork, glass card and contextual Companion show both the action and its value. The quiz retains its existing scoring, 25-point reward, source trail and correctable first impression. A check-in does not infer personality.

An early self portrait keeps the invitation light while HSBC membership, Points, journey, Companion preferences and permissions remain visible below an introduction to the relationship. Alex also sees a daily pause card: a direct Money Feeling entry, seven real check-in stamps, a five-point daily reward and a route to the other tools. A completed day changes the invitation to reflection history. Missed days do not reset completed moments.

### Alex’s savings invitation · revised 5 October 2026

A Small Start features the existing **The growing saver** challenge: £1 on saving day one, £2 on saving day two, up to £30 on day thirty — £465 in total, with 200 HSBC Points on completion. The detail makes the increasing commitment clear, including the £189 final week. Pause/resume preserves progress; the £1-a-day alternative remains in the challenge collection. Joining and self-recording do not move money or award the completion bonus early.

### Questionnaire and portrait

Three illustrated, single-question screens retain the existing demonstration scoring, with warmer answer language. The reference wealth-personality profiles inspired the editorial hierarchy and strengths / watch-outs / reflection structure; their investment recommendations are not used. The result opens the existing portrait detail. Alex’s limited evidence produces simpler artwork, one strength and no inferred history tiles. A first-impression explanation describes how banking interactions, reflections and optional Open Banking can add context; the Open Banking link uses the existing consent journey. Connecting accounts does not fabricate observed patterns or silently change the portrait classification.

A glass response dock offers confirmation and reflection while reading a self portrait. It hides when the inline response section enters the reading area, and returns above it. Shared portraits have neither response control. Corrections remain available in the inline section. The dock belongs to the sheet, outside the scrollable article, and follows existing snapshot/back navigation.

## Future

With no planning Pots and no preview experiments, the tab introduces possibilities instead of opening the complete canvas and drawer. Two ideas use the existing contextual suggestion model, including explicitly remembered check-in material where relevant; routine annual-bill inspiration is omitted from this short opening selection. A third action accepts the customer's own idea. A quiet route opens all planning tools immediately.

Selecting a suggestion uses the existing editable possibility form. Trying it creates a draft and reveals the planning canvas; it does not move money or establish an approved rule. Existing review and explicit approval still control commitment. Clearing all experiments returns to the invitation when no plan exists. Opening all tools is an explicit UI choice, retained within the current scenario state. Changing scenarios respects each customer's own plan and evidence.

This is deterministic prototype behaviour, not a live AI recommendation or validated personality assessment. No financial values or reward rules changed.

## Verification

Chromium and WebKit: initial layouts, three-question quiz, first impression/confirmation, secondary-tool access, first-goal preview without L1 mutation, reset and switching to Sam. Desktop, 390px and 320px layouts reviewed. Existing portrait and Future regression checks accompany the new `e2e/progressive-beginnings.spec.ts` checks. Private presenter material and review captures remain outside this repository.

### Visual refinement · 5 October evening
Question scenes combine the existing trait glyph with a light line illustration of the situation. The result artwork has explicit dimensions and a clipping boundary, preventing SVG overflow into the heading. Reading, reward and next action have separate spacing. Quiz and newly completed challenge rewards reuse the Money Check-in reward component and its reduced-motion behavior; quiz rewards reflect the actual awarded delta, so retaking does not claim another bonus. Earned challenge history remains static. The early-portrait invitation is shortened to “More you, with time.” Jordan receives the daily-pause card with a return invitation and real check-in stamps, without inventing a streak.

### Lightweight invitations · 5 October follow-up
Jordan’s returning check-in is a compact invitation rather than a seven-day hero. Alex’s HSBC Status opens through a membership-pass discovery card; eligibility and benefits remain in the existing detail journey. Now’s opening Companion messages are shorter, and Sam’s existing audio recap is introduced as his weekly money report with direct playback.

### Returning check-in and naming · 5 October evening
Jordan’s compact invitation includes the last seven days of recorded check-ins and opens the full check-in chooser, not Money feeling alone. Customer-facing entry points consistently call the experience Money Portrait; personality traits remain the subject of the portrait, not a competing product name.
