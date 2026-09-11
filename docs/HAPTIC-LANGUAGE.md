# Haptics: a quiet physical accent

Haptics mark a meaningful boundary or completed outcome. They do not acknowledge
every tap. The experience must remain understandable with haptics switched off.

## Vocabulary

| Meaning | Browser rhythm | Where it belongs |
| --- | --- | --- |
| Selection | One 6 ms tick | A What If idea actually changes the experiment; joining/pausing a challenge; crossing a goal date |
| Snap | One 10 ms pulse | A widget lands in a new position; a dragged Future drawer settles at a different stop |
| Commitment | One 14 ms pulse | A reviewed plan or Money Rule is applied; an imagined possibility becomes a real demo goal |
| Success | 10 ms, 40 ms pause, 10 ms | Daily Money Check-in completes; a transfer completes; account connection succeeds |
| Attention | 18 ms, 65 ms pause, 10 ms | A requested action is blocked or submitted input needs correction |
| Reward | 8 ms, 50 ms pause, 16 ms | Newly earned Points or a completed Badge Challenge |

These are short timing patterns, not intensity values. The browser API cannot
set motor strength or guarantee an identical sensation on different devices.
The vocabulary can map to native selection/impact/notification feedback if the
prototype is later packaged in a native app; no native wrapper is assumed here.

A daily check-in's success includes its Points award: it plays one closing pair,
not success followed by a reward. Badge progress gets a tick; the final earned
badge gets the reward. Undoing, revisiting, restoring or resetting state never
replays a celebration. Reviewing a plan is silent; applying it is the commitment.

## Silence is the default design choice

No feedback for ordinary navigation, opening details, scrolling, typing, AI
messages, loading, background updates, chart pan/zoom, preview animations,
check-in answers, personality interpretation, saving cosmetic choices, or closing
an already-completed flow. Existing warning banners and forecast shortfalls stay
silent. Attention is only a response to an action the visitor just attempted,
and remains paired with visible error information.

Changing drawer state by tapping is ordinary navigation and stays silent. A
physical drag earns a snap only if it settles at a different stop. Widget movement
is silent during the drag; only a changed, committed order gets a snap. Cancelling
or dropping back into the original position is silent.

## Time Travel and repetition

- Tick only when crossing a dated goal in the active forecast, forwards or back.
- No ticks for arbitrary months/years or AI ghost suggestions.
- A jump across multiple goals produces one tick, never one pulse per goal.
- At most one cue per goal per gesture and three across the whole gesture.
- A new pointer drag or fresh keyboard gesture starts a new crossing budget.
- Tapping an actual goal milestone gives the same selection tick if the date changes.
- Initialization, scenario changes and programmatic redraws do not produce ticks.

The shared controller also enforces a 220 ms global gap, 600 ms between selections,
450 ms between snaps, 900 ms between commitments, 1.4 seconds between successes,
3 seconds between attention patterns, and 4 seconds between rewards. The same
attention cause is suppressed for 5 seconds. No more than three low-priority cues
or five cues of any type can play within a rolling five-second window.

One event-loop turn produces only its highest-priority cue: attention, reward,
success, commitment, snap, then selection. Suppressed cues are discarded, never
queued to vibrate after the user has moved on.

## Availability and control

Supported touch devices default to enabled; a saved on/off choice takes precedence.
The existing **HSBC logo → Haptic feedback** setting controls the whole system.
Unsupported browsers show an unavailable setting and a plain explanation. Reduced
Motion, a hidden page or lack of user activation suppresses output. Disabling the
setting or hiding the page cancels pending feedback. Haptics are never replaced
with unexpected sounds or extra visual decoration.

The standard Vibration API is unavailable in iPhone Safari. It is not equivalent
to iOS native haptics, and adding the web app to the Home Screen does not create
that API. We do not simulate it with hidden switches or misleading controls.
Reference: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/vibrate

## Implementation and verification

- `src/platform/haptic-language.mjs`: vocabulary, outcome classification, priority,
  repetition limits and goal-crossing logic.
- `src/platform/haptics.ts`: device capability, preference and browser driver.
- Root command execution compares before/after state. Nested commands coalesce;
  action names containing "save" or "done" are not treated as success.
- Time Travel and drawer controllers request semantic cues at gesture boundaries.
- `tests/haptics.test.mjs`: deterministic clock/driver checks for noise limits,
  coalescing, no-op handling, blocked hardware and milestone jitter.
- `e2e/haptics.spec.ts`: browser checks with a recording vibration driver. This
  verifies event timing and patterns without claiming physical hardware validation.

Before a stakeholder phone demo, feel the six rhythms on a compatible device.
The chosen durations should read as light accents; tune this one vocabulary if a
particular device makes them feel too weak or too insistent.
