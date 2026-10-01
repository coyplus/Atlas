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

- A translucent touch disc signals an actual customer action: press, scroll or timeline drag. A quiet teal outline means “notice this”; it does not imply a tap, especially when the Companion responds proactively.
- Alex and Sam appear briefly side by side, each named and contextualised, before the demonstration stays with Sam. The comparison is a second fresh, inert instance of the same prototype, not a screenshot or another implementation.
- Personal numbers starts at Now, scrolls to Add a number, opens the real gallery, enlarges the suggested number, adds it through the real button, and returns to the resulting Now widget. The suggestion uses a wider editorial detail window so magnification does not crop its text horizontally.
- Time Travel pauses on today, indicates the timeline, visibly drags through two future points, and separately directs attention to the Companion response. A final detail view brings the projected age and net worth closer before returning to the whole phone.
- Three short journey labels show where the audience is. Holds vary by meaning and reading load; the endpoint remains until Next. Replay starts fresh. Take control removes the comparison, touch cues, outline and magnification immediately.

`src/demo/direction.ts` owns these presentation-only cues outside the app iframe. Targets use real element geometry; the app remains the single source of product UI. Scripted delays and camera movement respect pause, cancellation and reduced-motion preferences. Reduced motion removes the camera, scroll and timeline tweening while retaining the resulting view and presenter pacing.

This is a trial of the visual language, not a decision to apply every treatment to every scene. Review audience comprehension and presenter timing before extending it.

## Boundaries and verification

This remains a fictional, deterministic concept—not a live banking or validated AI service. The memory demonstration uses the existing explicit Remember for future support control and the actual saved memory library. Known existing limitation: the Future support model currently prioritises forecast messaging ahead of remembered reflections. This release preserves that behaviour; the scene does not claim to demonstrate memory-driven Future messaging. Each scene resets independently; the complete deck is not one accumulating customer session. Reduced-motion preferences remove scroll and timeline tweening; presenter-controlled pacing remains available.

Verification: `ATLAS_TEST_URL=<local preview> npx playwright test e2e/guided-demo.spec.ts`. Test acceleration shortens holds only in the test harness. Session isolation is tested without that flag. Keep visual captures outside the public repository. Existing `/` and `/presentation/` remain separate entry points, with unchanged defaults and slide content.
