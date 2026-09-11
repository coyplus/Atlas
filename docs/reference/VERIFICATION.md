# Journey focus and header review — v8, 9 September 2026

- 57 prototype/presentation checks passed. Added coverage for the expanded-card quiz CTA, all quiz steps/results, current-question help, preserved task DOM/scroll/form values, focus return, and journey/audio state separation.
- Visually verified entry from Alex’s expanded card CTA: visible title/back header and AI help icon, instructions directly below, no support card or glass. Opened help on question 2 and returned to that exact question. Final browser inspection confirmed focus on “Ask AI about this step”, journey surface, hidden card and no glass pseudo-element.
- Visually checked Groceries: fixed header remains clear above compact support and the glass layer. The previous missing-header appearance came from glass extending over the detail header’s stacking context; detail glass now starts below it.
- Browser warnings/errors were empty. Workbench/blueprint include Journey · quiz; written scope and navigation boundaries are documented. All generated editions, both blueprint paths and both presentations rebuilt; freshness checks pass.

---

# Material Symbols, glass and thinking review — v7, 9 September 2026

- All 55 prototype/presentation checks passed. New controlled-clock coverage verifies the 1,999/2,000 ms boundary, hidden CTAs/audio offer while thinking, immediate interaction override, timer cancellation across navigation/detail/chat, return-top behaviour and direct human-note arrival.
- Visually reviewed the preserved original glow reference, the live two-second Now introduction, the settled summary, immediate conversation from thinking, light/Premier glass fades over scrolled content, and Material playback controls in the delivered Vanilla file.
- All 42 official Material Symbols retain their original SVG paths and viewBoxes (Google supplies both 24-unit and 960-unit assets). Fill-based styling replaces the former stroke styling. Assets and the Apache license are embedded locally; source checksums are recorded.
- Browser warning/error logs were empty. Workbench and blueprint have a live Now thinking preset; other presets settle into their named state. All editions and both presentations rebuilt; freshness checks pass.

---

# Final support component review — v6, 9 September 2026

- Cross-checked the written contract and live blueprint/workbench rules; aligned audio disposal/replay, authorship, focus, shadows and final speech-bubble geometry.
- Visually reviewed light AI/user replies, Premier AI/human messages, Premier expanded support, Groceries compact detail and the detached paused player. Incoming bubbles have 16/16/16/2 px corners; outgoing bubbles mirror them, with content-fitting widths and 8 px gaps. Premier contextual response text is white inside its red outline.
- Browser warning/error logs were empty. Corrected the player hover title to follow its current play/pause/replay action.
- All 54 existing prototype/presentation checks passed; generated prototypes, workbench, both blueprint paths and both presentations are current. Delivery remains local HTML.

---

# Premier, focus and audio visual polish — 9 September 2026

- 54 existing prototype/presentation checks passed after these refinements. Financial logic and scenarios are unchanged.
- Visually reviewed Premier support scrolling above dark content: stronger neutral two-layer shadow gives the card a clear floating edge.
- Focused chat composer measured white in Premier (`rgb(255, 255, 255)`) and Vanilla near-black in light mode (`rgb(23, 25, 25)`).
- AI-only threads omit the duplicate bubble author row. On human handover, AI/human author rows remain visible and the human portrait is retained.
- Reviewed the thin progress line, hidden resting thumb and keyboard seek. At 38 seconds, native media time, slider value, painted progress and accessible elapsed/total text agreed. Playback updates continue even while the range retains focus.
- Browser logs were empty. Workbench, blueprint and both presentations rebuilt; build freshness checks pass. Browser review used loopback; delivery remains local HTML.

---

# Contextual support and detached audio — 9 September 2026

- 54 automated checks passed: 44 prototype checks and 10 presentation checks. New/updated coverage includes compact detail defaults, trailing upward-wheel/touch-end restoration, summary-only audio eligibility, independent playback, close/disposal and matching quick-response grouping.
- Visually reviewed the full-screen conversation through the desktop phone status area: continuous canvas, no inset seam, unified response chips and composer clearance above audio.
- At 390 × 844, native audio remained playing after navigation to Future while the card exposed AI instead of audio. The floating player ended 8 px above the tab bar. Playback continued through subsequent scrolling and detail/chat inspection to its natural end.
- Now changed to Emergency fund context with an AI avatar while playback remained available below. Repeated upward gestures at the top restored the expanded Now summary and play avatar. Groceries opened compact with a fixed title/header and no audio offer in support.
- Closing the independent player removed it. Browser logs were empty; viewport override reset after review.
- Fixed an additional vertical scroll trap in Future’s horizontally scrollable chart by allowing vertical scroll chaining. Existing financial/scenario data are unchanged.
- Prototype, workbench, both blueprint paths and both presentations rebuilt; freshness checks pass. Local HTML only.

---

# Scrolling header and conversation modal — 9 September 2026

- 52 automated checks passed, including a new regression covering header removal, top restoration on Now/Future/You and fixed detail header geometry.
- Visually checked all three tab screens at 390 × 844: global header scrolls away (58 px offset), support stays at the top, and returning to scroll position zero restores the header and initial expanded card. Detail scrolling leaves its header and support position fixed.
- Reviewed the conversation’s rounded full-screen modal, tinted background, separate close control and message/composer surfaces. No horizontal overflow; browser logs empty. Viewport override reset after review.
- Workbench, both blueprint paths and both presentations rebuilt with the same Vanilla code. All build freshness checks pass.

---

# Support system v3 — 9 September 2026

Current implementation; all earlier entries below are historical.

- **51 checks passed**: 16 financial model, 22 interface, 3 system-state and 10 presentation integration checks. These cover four people, three editions, workbench/blueprint presets, modal ownership, stable card identity, hidden/inert controls, returning to an originating detail, Premier access, attributed human messages, and audio continuity/fallback.
- Inspected the actual UI in the in-app browser at desktop and **390 × 844**. Checked expanded copy/CTAs, compact shadow over scrolling modules, full-screen Groceries header, conversation without a bar, return to Groceries, Priya’s two-CTA note, Maya’s portrait/identity, and unavailable-audio transcript.
- Mobile compact card measured **64 px** high. No horizontal overflow was present. Native media remained playing while scrolling and opening conversation; the conversation header exposed Pause. Context changed to the visible Emergency fund.
- Removed card reparenting, placeholder geometry, clip-path masks and delayed closing callbacks. The reviewed collapsed-card → conversation and return interactions did not show the reported black flash. Reviewed initial and settled states; physical-device frame-rate and cross-browser certification are outside this check.
- A late visual check caught audio controls persisting into a new detail. Playback and player engagement are now separate: opening a detail restores contextual copy/CTAs without stopping audio. A regression test covers this explicitly.
- Reviewed browser logs were empty. One cached loopback index initially showed an old build; subsequent checks used a fresh query URL. Delivered files themselves contain the current build.
- Lucide SVGs, portraits, fonts, financial data and audio are embedded. No network assets are required at runtime. Licenses and portrait credits are recorded in `ASSET-CREDITS.md`.
- `prototype/build.py --check`, both presentation build checks and offline asset checks pass. The shared blueprint path and `prototype/support-blueprint.html` are produced by the same build. Original reference preserved at `baseline/ai-greeting-bar-blueprint-original.html`.

No financial model or scenario JSON was changed. No external message, real banking action or deployment was made. This remains a scripted concept; the local recording is not regenerated after in-memory edits. Reduced-motion rules and focus containment are implemented; a full assistive-technology audit was not performed.

---

# Adaptive support refinement — 9 September 2026

Historical adaptive-support pass; superseded by v3 above.

- **35 tests passed** (16 core, 19 interface) after updating the journeys to enter AI through the message and reach next-step actions inside the conversation.
- New assertions cover persistent card/control identity, tapping card padding, automatic scroll collapse, concealed/inert player controls, immediate playback from the avatar, same-customer audio continuity, AI triage, Premier-only direct human access, contextual handover and transcript fallback.
- Desktop browser review covered the two-line resting bar, compact icon player, message-to-conversation transition, animated dismissal, readable chat/composer, AI triage and direct Premier handover. Priya’s original note remained identifiable.
- At **390 × 844**, the audio player and conversation remained readable with no horizontal overflow. The scrolled card settled at **68px** high while native audio was still playing and advancing. Player controls were marked hidden/inert. Pausing from that state did not expand it; tapping the message opened the conversation and revealed actions. The viewport override was reset.
- Inspected browser logs contained no warnings or errors.

Motion uses stable DOM nodes, CSS transitions and guarded native animations. Reduced-motion handling is implemented; physical-device performance and a full cross-browser/assistive-technology audit are not certified. Browser checks used the existing loopback preview, and delivery remains standalone local HTML. No external messages or financial actions were sent.

The current behaviour and design preferences are documented in `SUPPORT-BAR.md` and `DESIGN-PRINCIPLES.md`. The earlier exported version is preserved as `baseline/index-support-first-pass.html`.

---

# Vanilla support verification — 9 September 2026

## Completed checks

- **35 tests passed**: 16 core model tests and 19 interface tests, exercising the generated Vanilla, Bento, Metro and workbench HTML.
- All four exports pass `prototype/build.py --check`; the embedded presentation passes `deck/regen.py --check`.
- The original scenario data and financial calculations were not changed. This pass did not rerun the historical 163-check scenario validator.
- The 66.45-second MP3 decodes successfully and has a non-silent audio signal. Its duration is embedded with its transcript and audio bytes.

New interface coverage includes single-bar ownership across nested sheets and close; collapse and visible-section changes; reading-state protection and return to the top; Priya versus AI authorship and an explicit switch back to AI; contextual handover from a pot; household/story/idea context; audio continuity, seeking, person-change disposal and transcript fallback on media failure.

## Browser observations

The actual generated Vanilla was visually inspected and exercised in the local in-app browser:

- Expanded greeting, compact two-line bar and section-specific activity guidance while scrolling. The dock top and header bottom matched.
- Expansion of the current message without losing the content scroll position; activity and account/pot sheets retaining one support surface.
- Premier charcoal surfaces, Priya’s original note, AI-labelled appointment guidance, typed human conversation and explicit return to AI.
- Sam’s audio-ready view, actual Play/Pause, advancing native playback time, forward seek and 1.25× speed. Playback continued across his tabs and remained controllable from the compact bar.
- Audio transcript, including the snapshot date, with the bar still visible.
- A **390 × 844** mobile viewport: no horizontal page overflow, readable player, and sheet/support alignment immediately below the shorter mobile header. The viewport override was reset afterwards.
- Keyboard focus cycling from the modal’s last control to its first and back, Escape dismissal, and return focus to the compact support control.
- No warnings or errors in the inspected browser logs.

The review caught and fixed premature pointer-down collapse, media disposal during same-person tab navigation, clipped audio-card boundaries, duplicate expanded playback buttons and focus restoration to hidden controls.

## Limits

Browser interactions used a loopback-only preview. Browser tooling blocked direct `file://` navigation; direct-file opening was not browser-tested in this pass. The build embeds the data, fonts, photographs and audio, and interface tests execute the actual inline bundle. Delivery remains local standalone HTML.

The viewport check is not a physical-device or full assistive-technology certification. Cross-engine playback, operating-system interruptions, media-session lock-screen controls and background-tab policies are not certified. The native media state drives progress; the demo does not imitate playback with a timer.

Contextual messages and human conversations are scripted from the current scenario. Sam’s audio remains explicitly tied to the original 8 September snapshot and is not regenerated after local edits. No external message, booking or bank action was sent.

---

# Verification — 8 September 2026

## Completed automated checks

- **28 tests passed** across `tests/core.test.mjs` and `tests/interface.test.mjs`.
- **163 scenario checks passed**, zero failures, using `Scenarios/validate.py`.
- All four exported HTML files pass `build.py --check`; the presentation passes `deck/regen.py --check`.

Core checks cover today's accounting totals, every committable idea for every customer, preview isolation, opening-transfer conservation, duplicate agreement prevention, atomic rollback after insufficient funds, debt payments, individual/global rule pauses, target policy, future redirection, quiz outcomes and repeat-award prevention, belief correction, reward eligibility and sequential undo. Separate cases cover the non-committable Premier illustration and an edited soft budget.

DOM integration checks execute each delivered HTML's actual inline script. For Vanilla, Bento, Metro and the workbench they traverse all four customers and all three tabs, all four chart views, module details, stories and shared sheets, and reject runtime exceptions and `undefined`/`NaN` output. They also exercise the four complete moment journeys, the presentation API, chart zoom, accessible control names, gallery size selection/pinning/undo, and a time-aware companion entering the shared conversation from a pot.

These are component/application integration tests in jsdom, not a claim of automated browser screenshot or cross-browser coverage.

## Completed browser and visual review

The local in-app browser rendered the actual generated pages over a loopback-only development server. It was used to inspect and interact with:

- Vanilla Now, Alex's complete quiz and You result, the live suggestions gallery, Sam's Future list, amounts and dates.
- Bento's dark leading-figure composition, Sam's Future/rings view, floating navigation, Premier Now and the household personality card.
- Metro's joined Now layout, the full photographic story sequence, What If preview, date change, agreement and undo, editable modules, Premier You, Aisha's shared personality, Priya's appointment and persistent conversation access.
- The live workbench, its phone and foundations.
- The refreshed presentation, including switching its embedded live customer to Elena.

The review caught and corrected missing names on icon-only navigation, clipping of the Bento lead label, oversized image tokens that the browser dropped, gallery/pinning gaps, and the deck's failed Blob-based embedding. Smaller web renditions now render inside standalone CSS; the deck uses a direct embedded document.

The reference review used the original saved rendered captures, including Bento and Metro, alongside the larger visual review recorded in `../VISUAL-REVIEW.md`. Reference appearance was treated as inspiration. New implementation screenshots were inspected directly in the browser tool.

## Scope and limits

No real payments, messages, invitations, bookings, financial advice or bank integrations were exercised. Those actions are deliberately simulated in the local prototype. Projection assumptions and the in-memory reset behaviour are documented in `README.md` and explained in the relevant UI.

The scenario validator checks data references and arithmetic; it does not independently establish the truth of every authored claim. Unsupported future-dated belief evidence, unused-subscription language and an unsupported household safety claim were corrected. The Lisbon month was aligned with the monthly projection. Sam's undocumented £30 contribution is excluded from rules-based calculations.

The visual pass was at desktop review dimensions in the in-app browser. Physical-device touch behaviour, every browser engine, and a full assistive-technology audit have not been certified. Keyboard focus handling, named controls, reduced-motion rules, responsive CSS and reversible alternatives to drag reordering are implemented.

## Shared money-container revision — 8 September 2026

Account and pot detail now share one component, ordered balance → actions → features and rules → information → activity, with contextual AI. Existing Vanilla styling is reused. The collection combines the containers in one list. The interface suite (13 tests) and comparison-deck suite (10 tests) passed. A dedicated test covers current, credit, saving, loan and investment structure, account-specific AI and credit payment targeting. The in-app browser was used to inspect the unified collection and current-account sheet. No financial-model or scenario-data changes were made.
