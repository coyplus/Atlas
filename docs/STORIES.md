# My stories · Vanilla component contract

Updated 10 September 2026. Applies to `atlas-app`, including Premier. Reference reviewed: `Shared assets/Component documentation/Story - Component Spec.dc.html`, especially interaction, chart shapes and Still/Video Plate sections. The original Metro source is retained as a reference, not rewritten.

## Review and design decision

The previous implementation was a regular detail dialog: a repeated claim and AI sentence, a row list, navigation CTAs on every page, and another AI card above the content. It had no gesture navigation, automatic progression or elapsed-time pagination.

The new experience uses the reference's **claim → working → choice** rhythm. One subject, an evidence-led visual, and one optional decision. Vanilla typography, neutral surfaces, rounded controls and existing HSBC actions remain; Metro's square corners, rigid measures and colour overrides do not transfer.

| Frame | Content | Surface | Duration |
| --- | --- | --- | --- |
| Claim | One leading figure, a short sentence, period and evidence link | Subject-related photograph with dark overlay | 8 seconds |
| Working | One explanation with recorded values and an appropriate chart or infographic | Plain white; charcoal in Premier | 12 seconds |
| Choice | One question, consequence, primary review action and “Not now”; completed stories show their outcome | Same photograph, stronger overlay | Untimed |

On the first two frames, the three top segments show page position and elapsed time. Every page change explicitly resets the current and later fills; earlier pages show complete. Returning to a page restarts its timer. **The final frame keeps all three pagination segments solid, with no animation, no Play/Pause button and no automatic advance.** It stays open until the user chooses an action or navigates away. Pagination remains interactive on every frame; selecting an earlier frame resets its timer and all later segments. There is no separate back button.

Time never commits an action, declines an offer or changes money. “Not now” records a dated reading decision separately from an agreed financial change. Every entry from My stories starts at page one with a fresh timer, regardless of a saved reading position or whether the Story was completed. Returning from evidence or AI within the open Story preserves its page and elapsed time. Read/declined status remains separate from this playback reset.

## Navigation and accessibility

- Swipe left/right between pages, including when starting on a chart. Swipe up for the next Story and down for the previous Story, in the same order as My stories. Each vertical arrival starts at page one with a fresh timer. At the first/last Story the gesture stops; it does not wrap or close the reader.
- On short or enlarged-text screens, vertical drags scroll overflowing content first. A subsequent outward swipe from the bottom/top edge changes Story. Swipes do not activate evidence links or select text. Selection is disabled only inside the immersive reader; evidence and AI retain their normal behaviour.
- The footer offers previous/next Story buttons and a Story count, so gestures are optional. Left/right arrow keys navigate pages; up/down keys navigate Stories.
- Top segments are direct page controls with accessible names and current-page state. Arrow keys also move between pages. No navigation CTAs interrupt the first two frames.
- Header has title, AI and Close, plus Play/Pause on the two timed frames. Initial focus goes to the title; keyboard focus on actual controls remains visible. Tab exploration pauses the timer.
- Hold a page to pause; release to continue. The explicit Play/Pause button remains available for longer reading. Hidden tabs, evidence sheets and AI conversation suspend playback without consuming reading time.
- Reduced motion starts in manual mode and suppresses entrance/chart animations. The user can explicitly choose Play. Still photography does not drift, zoom or parallax.
- Large text, short screens and landscape can scroll within the frame. Header, pagination and Close remain reachable. Progress and colour are never the only means of navigation.
- Closing restores the source screen's scroll. Browser Back from evidence or conversation returns to the same Story. Evidence's visible background is inert and hidden from assistive technology.

## AI and evidence

Stories contain no AI card, reserved card gap, floating support layer or audio offer. The header AI control carries the story title, current frame and relevant evidence into conversation. Closing AI returns to the reading position and remaining time. It uses the existing prototype AI conversation mechanism, not a new live model service.

Each frame has an evidence link; chart marks also open evidence. These are bottom sheets over the Story, with the relevant values, reporting window and limitations. Historical aggregates are labelled as aggregates. No missing historical transactions or monthly values are invented to make a chart.

## Visual assignments in the current scenarios

| Story | Working visual | Evidence principle |
| --- | --- | --- |
| Alex · Direct Debits | Proportional payment split with keyed amounts | Three supplied monthly payment amounts |
| Alex · Safe to spend | Dumbbell comparison on a shared money scale | Recorded balance less bills before payday |
| Jordan · Eating out | Ranked merchant bars | Four September transactions totalling £131; the £245 six-month average stays explicitly separate |
| Jordan · Round-ups | Source → destination diagram | £22 moved to the emergency fund; redirecting it is a later choice |
| Jordan · Payday rule | Seven connected milestones | Seven successful £50 moves from the scenario summary |
| Sam · Golden Ratio | Deduction waterfall | £3,120.44 less £1,400 essentials and £420 commitments = £1,300.44; headline rounds down |
| Sam · Payday remainder | Current target progress | £6,400 of £24,000, with no future growth plotted |
| Sam · Eight months held | Eight monthly tally cells | Authored completed-month count, not fabricated monthly spending |
| Elena · Leo’s future | Contribution arithmetic and fact tiles | £100 × 72 contributions; explicitly excludes growth, fees and withdrawals |
| Elena · The rebalance | Proportional allocation split | 36% floor allocation of £182,400; allocation is not a guarantee |

The catalogue currently contains **10** stories, rather than all 24 examples in the reference. Shapes follow the available evidence. A trend, threshold or a detailed ledger needs corresponding source data before it can be introduced.

## Media

Five photographs are used across the catalogue: dunes, cooking hands, reflection, conversation and a horizon. Four come from the supplied Story spec assets, reused at the user’s request; the horizon retains the previously attributed Pexels source because the spec’s ridge image has a visible watermark. The café plate remains available as an unused alternative. The four new JPEGs total approximately 319 KB, optimised locally to a maximum width of 1,100 px.

One asset appears on the tile and both photographic frames of each Story. Working frames stay plain so the chart remains the picture. Full provenance is in ASSET-CREDITS.md. Dark neutral overlays preserve readable white text; the solid backing preserves the message if an image cannot load.

Still plates are intentional for this catalogue. The reference reserves video for exceptional completed milestones (tier secured, seven-year history, global view), none of which is represented by these stories. Do not repurpose fireworks or generic motion for a product suggestion. When an eligible video story is authored: use a short muted inline clip, a poster, no audio, no required motion, and still fallback for reduced motion, data saving and load/decode failure. No video is loaded in the current build.

## Implementation and validation

- `src/features/stories/model.mjs`: editorial catalogue and evidence-derived presentation models.
- `views.mjs`: shared frame, chart and evidence templates, rendered by React's migrated markup boundary.
- `player.mjs`: one active clock, gesture handling, accessibility and overlay suspension.
- `stories.css`: scoped visual treatment, responsive layout and motion.
- Reading state lives in each persona's `ui.storyVisits`; financial state and agreement actions retain the existing domain commands.
- Story evidence participates in the shared navigation stack. No second router or financial store is introduced.
- `e2e/stories.spec.ts`: all stories and frames, chart evidence, timers and backward resets, untimed final pages, horizontal/vertical swipes and boundaries, text non-selection, overflow scrolling, no automatic commit, hold, chart swipes, AI return, browser Back, reduced motion, narrow and landscape layouts in Chromium and WebKit.

### Verification · 10 September refinement

Reviewed all 10 Stories across their three frames in Chromium and mobile WebKit, including Premier. The 22 Story browser checks cover the new gestures, solid final-page pagination, backward timer resets, selectable-text regression, images and evidence controls. The wider production suite covered account recovery, shared pots, AI, audio, navigation, storage and release activation. Two WebKit service-worker checks remain deliberately skipped because that automation capability is Chromium-only.

The image-decode checks caught a build filter that excluded a new nested `conversation.jpg`. The filter now excludes only the original unoptimised root photographs. A regression check verifies every assigned Story photograph is copied byte-for-byte into the public build assets. Mobile device feel still warrants the planned hands-on review; the browser tests do not replace physical-device testing.


### Visual and copy refinement

Evidence opens in a compact sheet above the Story, with its scrim covering the simulated status bar. Main tabs and the detached audio player stay hidden while evidence is open. Close restores the same page and reading position. The sheet uses the Story title, a close control, relevant rows, a short limitation where needed and one as-of date. Repeated scene labels, prototype boilerplate and instructional footers have been removed.

Final actions name the next step: Review budget, Review round-ups, Review investment, Review payday sweep, Review Leo’s plan, or Add to My numbers. No financial change happens without the existing review flow. Completed Stories state what is active or complete. The final page has no reassurance footer. Gesture instructions appear only on the first frame.

Round-ups show £22 for this recorded month, without implying a fixed monthly contribution. Leo’s £7,200 is labelled as contributions, not a guaranteed future value. Elena’s allocated capital is not labelled as protected against losses. Evidence keeps decision-relevant limits; source-authoring notes belong in documentation.

See COPY-PRINCIPLES.md for the app-wide editing standard. This pass also removed empty support-card suffixes and generic help subtitles, and made the Open Banking permissions heading explicit.
