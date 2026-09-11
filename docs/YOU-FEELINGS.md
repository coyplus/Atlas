# Money Feeling Check-in

The Vanilla You page places a 60px check-in entry immediately after the AI companion and before household portraits. A small days indicator reflects consecutive daily check-ins; a new joiner has no invented streak. After saving, the entry shows today's feeling and its shape.

The full-screen journey has three stages: choose a feeling; optionally select reasons; review the saved feeling and seven-day visual history. Editing replaces today's entry, never increments the streak twice. Cancelling leaves the saved history unchanged. The check-in always belongs to the account holder, independent of the household portrait being viewed.

Calm, hopeful, okay, stretched and worried have distinct shapes and muted colour accents. The main page stays neutral. The journey uses generous space, one primary action per stage, and no AI card. An optional AI reflection invitation appears after selecting reasons. It leads to a tailored prompt with quick answers. Writing is shown only after choosing “In my own words”. Save remains available without any conversation; Continue with AI saves the current reflection and carries it into conversation. Returning from conversation preserves the completed check-in.

Recent historical feelings are authored demonstration examples, not inferred from transactions. Dates are anchored to the frozen scenario date, as with other prototype data. New entries live in the existing local demo session; they are not sent to a server or shared with household members. No rewards, personality changes or financial actions follow automatically.

Implementation:
- `src/features/you/feelings.mjs`: feelings, illustrative history, daily streak and validated save.
- `src/features/you/feeling-view.mjs`: compact entry and three journey stages.
- `src/features/you/feelings.css`: component and immersive surface styles.
- `src/features/commands/feelings.mjs`: private drafts and navigation; only Save writes history.

Verified in Chromium and WebKit: optional context, cancel, edit, same-day streak, household isolation, persistence, AI return, browser Back, 320px layout, Premier contrast and reduced motion. Domain tests cover date gaps, duplicate-day edits and input validation.

## Optional reflection

Prompts and follow-ups are authored prototype responses selected from the feeling and reason; no live model call is made. They ask rather than infer a cause. Positive and difficult feelings receive different prompts. Saved reflections record the displayed question and chosen answer, with optional words. Changing the feeling/reasons invalidates the prior prompt response. Drafts are retained when navigating between check-in steps; only Save or Continue with AI commits them. Continuing to conversation returns to the saved check-in when closed.

Header styling and navigation follow `LEVEL-2-HEADERS.md`. The global header Back control replaces the former secondary “Your feeling” back link in the body.

## Multi-reason refinement

Reflection considers the complete, canonical set of reasons, independent of selection order. One reason uses a focused question. Two topics ask whether there is a connection, with connected / separate / unsure responses. Three or more reasons (or a pair containing Something else) let the customer choose where to begin. The follow-up then focuses on that choice, and is carried into conversation rather than restarting the reflection. These are authored prototype patterns, not live generative AI. No relationship is inferred as a fact.

The check-in uses quiet monochrome actions, translucent surfaces, slowly floating feeling shapes, and a short fade/lift only between stages. Selecting a feeling gently reveals its shape; selecting reasons retains scroll and doesn't replay the whole screen transition. Reduced motion disables movement. Saved entries show selected reasons and a seven-day visual history with unambiguous weekday labels.

The separate personality artwork now drifts through a wider translation, rotation and scale range on staggered 24–40 second cycles. It retains the approved composition, edge bleed and glass overlay.
