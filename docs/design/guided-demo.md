# Guided presentation and demo

1 October 2026 · implemented concept mode · `/demo/`

## Purpose and use

One continuous presentation: the existing 15 Narrative slides, then 14 core product scenes in Now → You → Future order, a system recap, six optional supporting scenes and a closing slide. Next advances only when the presenter chooses. Scenes demonstrate once and hold their final state. Contents supports direct jumps; named URL fragments can be bookmarked.

Replay reloads the current scene from its fictional starting scenario. Pause holds the choreography. Take control cancels it and makes the real prototype interactive; Replay returns to the authored journey. The next scene always starts clean. Previous/Next, arrow keys and Page Up/Down navigate the deck. After taking control, Page Up/Down still navigate while ordinary keys belong to the prototype. Opening Contents or leaving the browser tab pauses the sequence; Continue resumes it. No audio starts automatically. Existing prototype audio remains accessible through Take control.

The core sequence shows Alex briefly before Sam for each tab. It does not complete Alex’s onboarding. Supporting features sit after the recap and can be skipped with Go to closing. This mode does not publish or embed private presenter scripts.

## One prototype, two ways to operate it

- `src/presentation/narrative.ts` supplies the original slides directly.
- `demo/prototype.html` loads the same `src/main.tsx` as the normal app. It uses the same components, data, feature commands, calculations and AI simulations.
- `src/demo/scenes.ts` contains presentation copy, initial scenarios and choreography. There are no copied product screens, screenshots or recorded videos in the product scenes.
- `src/demo/runner.ts` invokes the existing `window.atlas` API and real controls. It waits for each expected state, scrolls real containers and moves the real timeline. It does not fake completed financial actions or edit scenario data.
- Every scene owns a fresh same-origin iframe. Cancelling removes its work; navigating removes the frame and its feature timers. Manual takeover keeps the current frame and state.
- `src/platform/demo-mode.ts` identifies this dedicated entry. Normal session restore/save, normal navigation history and PWA installation are disabled there. `session.ts` also blocks persistence directly. Embedded chrome adjustments are scoped to this mode.

Visual and component updates therefore flow through automatically on the next deployment. New features do not automatically add themselves to the demonstration. If an action, selector or journey changes, review the relevant scene and its copy. Commands are preferable to positional clicks. Scene endpoint, memory and control tests provide a regression check.

## Audience direction — three-scene trial

The first trial treats `a-familiar-start`, `personal-numbers` and `time-travel`. The other scenes retain their existing choreography. Customer/tab identity is visible across all product scenes, including manual takeover.

- A translucent touch disc signals an actual customer action: press, scroll or timeline drag. A soft, feathered spotlight gently dims the surroundings to direct attention. It replaces the early teal outline, which looked too much like product UI. Close-ups use magnification alone. There is no border or coloured halo around the target; it does not imply a tap, especially when the Companion responds proactively.
- Alex and Sam appear briefly side by side, each named and contextualised, before the demonstration stays with Sam. The comparison is a second fresh, inert instance of the same prototype, not a screenshot or another implementation.
- Personal numbers starts at Now, scrolls to Add a number, opens the real gallery, enlarges the suggested number, adds it through the real button, and returns to the resulting Now widget. The suggestion uses a wider editorial detail window so magnification does not crop its text horizontally.
- Time Travel pauses on today, indicates the timeline, visibly drags through two future points, and separately directs attention to the Companion response. A final detail view brings the projected age and net worth closer before returning to the whole phone.
- Three short journey labels show where the audience is. Holds vary by meaning and reading load; the endpoint remains until Next. Replay starts fresh. Take control removes the comparison, touch cues, spotlight and magnification immediately.

`src/demo/direction.ts` owns these presentation-only cues outside the app iframe. Targets use real element geometry; the app remains the single source of product UI. Scripted delays and camera movement respect pause, cancellation and reduced-motion preferences. Reduced motion removes the camera, scroll and timeline tweening while retaining the resulting view and presenter pacing.

Every product scene now has a non-interactive playback indicator outside the phone: upcoming steps are dots, the active step expands into a pill and fills during its authored motion and reading hold. Completed steps remain dark. It follows the runner, not an independent timer: loading stalls it, Pause freezes it, Replay resets it, and it reaches completion only after the final expected state is present. Taking control hides the indicator. It represents steps in the current demonstration, separately from the existing deck progress line. It is exposed as a labelled progressbar to assistive technology, with no keyboard focus or scrubbing behaviour.

This is a trial of the visual language, not a decision to apply every treatment to every scene. Review audience comprehension and presenter timing before extending it.

## Narrative short guided edition · 6 October 2026

Since 6 October 2026 this edition is the default at `/demo/` (also `/demo/?version=short`), for a 20–25 minute presentation and demo. The original edition described above stays at `/demo/?version=original`; `src/demo/entry.ts` chooses, and bookmarked links to the original scenes (for example `/demo/#time-travel`) still open the original. It follows a free demo that proved hard to operate: the presenter had to drive the prototype, jump between screens, reset it and remember notes at the same time. Here the presenter sets the pace and the screen carries the operation.

Order: the first eleven Narrative short slides, then 34 beats, the closing slide, and the working prototype. The beats are grouped in chapters: the four customers and their moments (one beat), the Companion (c1–c7), Now (n1–n4), Future (f1–f10), You (y1–y11) and an ending montage (e1). Each beat has copy on the left (chapter, step count, headline, one line) and one or more live prototypes on the right, with one small step and one focused motion. A timeline at the top shows which customer and moment is on screen. The stage is a fixed 1600 × 900 composition scaled to the window.

- `src/demo/guided/beats.ts` holds the copy, layout (single, compare, quad, live), customers, steps and pointers. `act.ts` performs steps on the real prototype; `short.ts` is the deck controller; `short.css` the stage.
- Each customer keeps one prototype frame for the whole edition, so a beat continues from the state the previous beat left: Alex adds Safe to spend in n3 and still has it in Future. Going back or jumping rebuilds the frame silently from the fictional starting scenario, applying earlier beats without motion.
- Every change of screen is shown, not cut: a touch disc for each tap, scroll, drag and Back, with a short label. A pointer (red label, line and dot, no outline) names what to look at once the step settles.
- Right arrow, Space and Page Down advance; left arrow and Page Up go back; Home and End jump. Pressing during a step finishes it. C opens the contents. O hides or shows the optional beats (c3, f4, f6, f10, y2, y11); the choice is kept in this browser. The controls appear when the mouse moves. In the working prototype the presenter uses the app directly; Escape returns to the closing slide.
- Each beat has a hash (`#n3`) and posts `{ type: 'atlas-demo', id, … }` to its opener and to the `atlas-guided-demo` BroadcastChannel; an `atlas-demo-control` message moves the deck. A presenter window can follow it. Presenter notes stay outside this repository.

Product changes made for this story apply to the app as a whole: Safe to spend is Alex's lead number suggestion; when Safe to spend leads My numbers, the Companion offers an alert below £150 (`safespend-alert`); the Companion leaves its Customise message once Done is pressed; Elena can prepare for Thursday's review by voice and add the open question to Priya's agenda; Money Portrait trait cards mark readings that are new or updated in the last three months; closing the weekly briefing player no longer reads the removed audio element.

## Boundaries and verification

This remains a fictional, deterministic concept—not a live banking or validated AI service. The memory demonstration uses the existing explicit Remember for future support control and the actual saved memory library. Known existing limitation: the Future support model currently prioritises forecast messaging ahead of remembered reflections. This release preserves that behaviour; the scene does not claim to demonstrate memory-driven Future messaging. Each scene resets independently; the complete deck is not one accumulating customer session. Reduced-motion preferences remove scroll and timeline tweening; presenter-controlled pacing remains available.

Verification: `ATLAS_TEST_URL=<local preview> npx playwright test e2e/guided-demo.spec.ts`. Test acceleration shortens holds only in the test harness. Session isolation is tested without that flag. Keep visual captures outside the public repository. Existing `/` and `/presentation/` remain separate entry points, with unchanged defaults and slide content.
