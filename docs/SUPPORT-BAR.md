# Vanilla support system · v8

9 September 2026. Current contract: [live blueprint](support-blueprint.html), [workbench](workbench.html), [Vanilla](index.html). All use the same implementation. The shared `../Shared assets/ai-greeting-bar-blueprint_1.html` is generated too; its original is preserved at `baseline/ai-greeting-bar-blueprint-original.html`.

## Screen ownership and initial states

| Screen | Header | Initial support | Scrolling / return |
| --- | --- | --- | --- |
| Now, Future, You | HSBC brand + profile; no duplicate AI button | Expanded context and relevant CTAs | Header moves out over its first 58 px; compact support stays at the top. Returning to the top restores header, initial message and CTAs. |
| Stories | Story title, Play/Pause, AI and Close | **No AI card** | Timed visual narrative. Header AI carries the current frame into conversation; returning resumes the same reading position. See STORIES.md. |
| Reading details: accounts, pots, numbers, activity and transcript | Own title + back control, fixed | **Compact** two-line card | Header stays fixed; support stays compact, including at the top. Tap to engage in conversation. |
| Guided journeys: quiz, task forms, setup and confirmation reviews | Own title + back control + AI help icon, fixed | **No support card or glass** | Instructions begin directly below the header. Help opens conversation and returns to the same step. |
| AI/human conversation | Identity + close control | No support card | Full-screen modal covers the phone through the status-bar area. Messages scroll; suggestions, composer and any ongoing audio remain accessible. |

Conversation closes to the originating page or preserved detail (including its inputs and scroll position). The new Quick Actions, Products and services, and Statements catalogues preserve their originating screen when an item opens. Back returns to that catalogue, including its scroll position and any shortcut draft. Other sequential non-chat screens replace one another and return to the underlying page.

## Guided journeys

A journey asks the user to complete a task: the personality quiz and result, corrections, plan creation and agreement, payment/transfer/add-money forms and reviews, pot editing, rule setup/redirect, invitations, reward redemption, appointment booking/rescheduling, choosing/previewing dashboard numbers, Quick Actions customisation and currency conversion. These routes explicitly open with the journey surface; classification does not depend on matching screen titles. Reading an account, pot, number, story or transcript remains a detail view with compact support.

A journey has a fixed screen header with back control, title and one 44 px **Ask AI about this step** icon button using the shared AI avatar. There is no AI card, thinking delay, glass layer or reserved support-card gap. Task content begins 24 px below the header. Existing playback may continue in its independent player, with reserved space at the bottom.

The help icon opens the existing full-screen AI conversation with the task context. For the quiz, the context includes the actual question and step. The journey DOM, entered form values, answers and scroll position are preserved while asking for help; close restores the same screen and keyboard focus to its help button. Closing the journey itself follows the existing navigation boundary: back returns to the underlying tab rather than stepping through earlier task forms. AI does not submit answers or confirm the journey on the user’s behalf.

Detail and journey headers share the status bar’s `--canvas` background, with no bottom divider. This continuous navigation surface uses the existing light or Premier charcoal palette; spacing and the floating card provide separation from content.

The glass layer is restricted to **below** fixed detail headers. It cannot blur or cover the title/back controls, including when a detail is opened directly from an expanded AI card CTA. Journey and conversation surfaces hide both the support card and its glass layer.

## Now thinking introduction

On fresh arrival at the top of Now, AI shows “Thinking…” and “Bringing your money into focus” for **2,000 ms**, then reveals its actual message and CTAs. A 1.5 px masked red/white rim rotates on a 3-second cycle, with a soft red outer glow, adapted from the preserved original blueprint. The message body and CTAs remain hidden and inert until ready; the avatar opens conversation immediately. Sam’s play offer appears only after the summary is ready.

Scrolling, tapping the card or acting on page content cancels the introduction immediately. Future, You, detail screens, journeys, conversation and authored human notes have no thinking delay. Returning to the top after scrolling does not replay it; a new Now arrival at the top or reset does. Returning to a saved scrolled Now position skips it. Timers are cancelled on navigation, interaction, reset and theme changes so a delayed reveal cannot replace a newer context. Reduced motion keeps the two-second status with a static rim.

This is a timed concept demonstration, not a live model request. The workbench's **Now · thinking** case replays the actual two-second introduction; other presets settle immediately into their named state.

## Return-to-top behaviour

Page position and user intent are reconciled, rather than allowing the last wheel event to win. At the top (within 8 px), scrolling or upward wheel input restores the initial expanded state. Trailing trackpad events, scroll-end and touch-end also settle back to expanded. Detail scrolling is excluded. This fixes the prior race where a wheel event minimised the card after the scroll event had expanded it.

Interactions with page controls still prioritise content and may compact the card. Closing conversation restores compact support; an upward gesture at the top restores the initial state even when the scroll position cannot move any farther.

## Card anatomy, context and authorship

Expanded main-page cards show a headline, full message and relevant CTAs. Compact cards show two lines and one avatar; full copy and CTAs are hidden and inert. There are no manual size controls, generic taglines or permanent link toolbars.

AI context follows the visible content near the lower edge of the card, open details, projected date, story step and selected household member. Context updates settle for 140 ms and use the same scenario models as the page.

The message area and non-control padding open AI immediately with the current context. AI always uses the shared Google Material Symbols auto_awesome avatar. In an AI-only conversation, the header supplies its identity and bubbles omit the repeated author row. Once human messages are present, all author rows remain visible to distinguish contributors. Priya/Maya messages use their profile photos and retain their authored text. Priya’s original note enters the conversation as a human message followed by an AI offer to help prepare.

Only Premier exposes a direct human route. Other users begin with AI triage; human handover carries their current context. Replies retain the human identity until the user returns to AI. Conversations and handovers are local scripted demonstrations; nothing is sent externally.

## Summary audio and independent playback

**The audio offer belongs only to Sam’s Now money-summary message.** Its play avatar disappears when the card switches to another contextual message, another tab or a detail. Those contexts show the normal AI avatar. Merely visiting Future, You or chat never exposes a new audio offer or starts playback.

Starting the recap opens a **separate compact player above the bottom navigation**. It stays available across tabs, details and conversation, including while paused or ended. On details/chat without navigation, it floats near the bottom edge. Content and the conversation composer reserve enough space to remain reachable above it. Returning to the summary does not create another media element or reset the recording.

| Event/state | Result |
| --- | --- |
| Tap summary play | Starts the bundled recording immediately; opens the bottom player. |
| Scroll or change context | AI card updates normally; ongoing player remains independent. |
| Navigate within the same person | Same media, time and playback speed. |
| Playing / paused | Play/pause, seek, rewind 10 seconds, speed, transcript and close remain available in the bottom player. |
| Ended | Replay from zero. |
| Error | Short error status plus the transcript route; retry remains possible. |
| Close player | Stops/disposes audio and removes its reserved space. Start again from the Now summary. |
| Change person, reset or leave Vanilla | Stop/dispose playback. |

The player shows a concise title and elapsed time. Its seek control is a 2 px line with HSBC red progress; an 8 px thumb appears on hover, focus or dragging. A 24 px interaction area and native keyboard seeking are retained, with elapsed/total time exposed to assistive technology. Speed cycles 1× → 1.25× → 1.5×. No duplicate player lives in the AI card or chat header. The Now summary avatar can also pause/resume an existing recap. Player controls are named icon buttons with 44 px targets.

The 66.45-second recording and transcript represent the supplied 8 September scenario. They are bundled for offline caching and are not regenerated after demo edits. This implementation boundary stays here, not in repetitive customer-facing copy.

## Full-screen conversation design

The modal surface extends from the top of the phone to its bottom, beneath the simulated status text. It has one continuous Vanilla canvas; no separately clipped rounded edge or shadow stops below the status bar. Phone-frame corners provide the outer shape.

A restrained identity header, circular close control, surface-coloured speech bubbles, consistent spacing and a surface-coloured composer establish hierarchy. Human portraits replace AI identity when appropriate. The contextual CTA sits **inside the same quick-response group** as suggested questions, using identical type, padding, border and pill geometry. A red outline distinguishes its role without changing its size. Its text is red in light mode and white in Premier for contrast. Human handover utilities remain separate named icons.

Incoming AI and human bubbles align left, with 16 px rounding and a crisp 2 px lower-left corner; user replies align right and mirror the lower corner. Bubbles fit their content up to the thread width minus 24 px, with 14 × 16 px internal padding and an 8 px gap between messages. Body copy uses existing 14 px Vanilla type with 1.55 line height. Long text wraps without widening the thread. These rules apply equally in light and Premier themes.

The conversation enters with a short 28 px vertical movement over 300 ms. It does not clip, scale or physically move the support card. Existing chat replies do not replay the entrance. Close restores the previous view synchronously, avoiding delayed callbacks and flashes.

## Geometry, accessibility and system model

One persistent support portal floats above the active scroller, with a feathered glass layer behind it so its shadow falls over softly blurred content. The glass uses 12 px backdrop blur and a 64% canvas tint, fading to transparent over its last 48 px. On main tabs it extends through the space above the card; on reading details it starts below the fixed header. It extends 24 px below the dock, never intercepts gestures, and disappears in journeys and conversation. Unsupported backdrop blur falls back to the feathered tint. The card itself remains opaque for clear typography. The header offset follows scrolling only on main pages. Main and reading-detail content reserves the measured support height; journeys reserve none. The scroll viewport continues behind it. A separate stable audio portal owns playback controls.

`supportState` separates screen, card engagement, thinking readiness, author, audio lifecycle and whether audio has started. Detail defaults are compact; audio never replaces card copy or actions. Controller events update these states instead of creating per-screen implementations.

Use existing Vanilla typography, page gutter, surface, ink, muted, red, radius and spacing tokens. Premier remains charcoal/near-black, with a stronger neutral shadow beneath the floating support card. Input focus uses Vanilla near-black in the light theme and white in Premier. Layout variables measure header, support and player space. Card geometry transitions take 280 ms; content fades take 160–200 ms. Reduced motion disables animation.

Hidden support/player controls are inert. The phone owns Vanilla modal semantics so both active portals and the sheet belong to the same focus scope. Background page/header/navigation are inert during a modal. Named icon controls, Escape, focus containment and focus return remain supported. Photos are decorative alongside explicit identities. Chat messages scroll independently of the composer; detached audio does not obscure it.

## Review and maintenance

Workbench and blueprint provide live cases for Now thinking, main expanded/compact, journey quiz, detail compact, AI conversation, Priya’s note, Maya handover, audio ready/playing/across screens/paused/ended/error. Their diagnostics report live state. Error/ended/paused presets deliberately prepare demo states; Playing and Across screens use real playback. Selecting a case resets its named review moment.

Sources: `src/features/support/`, `src/features/dialogs.mjs`, `src/app/runtime.mjs` and `src/design-system/support.css`. Build with `npm run build`; the workbench and blueprint use this same application. See [migration architecture](ARCHITECTURE.md) and [asset credits](ASSET-CREDITS.md).

## Now composition

See [NOW-TAB.md](NOW-TAB.md) for the page order and component contracts. Support follows Quick Actions, the ordinary Number widgets, accounts and pots, stories and the products entry as the user scrolls. Products and account activity use compact reading-detail support; Quick Actions and conversion use journey-header help.

The Accounts & pots detail recommends Open Banking through the compact AI card. Opening the conversation reveals the full explanation and Connect another bank action. After connecting, the message reflects the selected sample balances and offers to explore the combined picture. Bank selection, account-sharing consent and disconnection are guided journeys with header help. See ACCOUNTS-POTS.md.
