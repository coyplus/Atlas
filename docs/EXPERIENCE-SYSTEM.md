# Atlas experience system

Current product rules · 11 September 2026

This is the implementation reference for the current Vanilla experience. It records the
accepted direction across Now, Future and You. Earlier concept documents and the Bento
and Metro explorations remain historical alternatives, not competing component specs.

This is a concept for communicating the vision. Optimise the main experience for normal
and larger phones, with representative customer scenarios. Visual clarity, emotional
appeal and convincing core interactions take precedence over production completeness.
Device-edge fallbacks must remain isolated and must not compress the main composition.

## Hierarchy

Each screen has one dominant subject: a number, a Pot, a future, or a personal reflection.
Show the subject before its explanation. Keep detail in a relevant secondary surface;
do not shrink essential text to fit more content. Preserve the reason behind a suggestion.

- Large values are supported by a smaller label above. Units and dates are secondary.
- Page titles identify the destination. Content headings describe the actual subject;
  avoid repeating “Your money rule” when the rule can have a meaningful name.
- Body copy is normally 14–16 px. Useful captions are at least 12 px. Tiny plot labels
  are a deliberate exception for compact, inspectable infographics, not a form pattern.
- Amounts use tabular numerals; date-only records use `7 Sept 2026`, not an internal ISO value.
- Use one clear primary action. Secondary choices must remain readable and actionable.

## Navigation and ownership

`Now`, `Future` and `You` are the only Level 1 screens. The primary tab bar is absent
and inert in details, journeys, conversations and modal sheets. A shared runtime owner
handles this, including nested screens and browser Back/Forward. Individual features
must not implement another tab-bar visibility rule.

A Level 2 page uses `screenHeader`: 58 px navigation row, a 44 px Back control, a concise
18 px title, and the shared glass/status plane. Details can use the Companion; tasks use
the shared contextual help affordance without adding another large card above the form.
Returning restores the parent scroll position and useful focus. Nested sheets belong to
the parent journey, not to a new primary tab.

Opening a different detail destination starts its scroller at the top. Updating
the current destination keeps its reading position; Back restores the parent.

A bottom sheet keeps its context visible behind a scrim, has a clear close action and an
independent scroller. Full-page tasks use page navigation. Do not mix a Close treatment
with a navigated detail just because both use the same rendering infrastructure.

## Surfaces and controls

- Solid surfaces hold content. Translucent glass is reserved for chrome, the Companion,
  floating controls and drawers above content. Do not place extra blur slabs between them.
- The shared Companion elevation is `--elevation-companion` across primary tabs. Feature
  attention adds its explicit accent; routine screens do not acquire attention shadows.
- Primary actions use ink on the current surface's inverse colour, matching Future,
  check-ins and personalisation. HSBC red remains the brand and attention accent.
- Informational notices use a neutral surface. Green/teal status indicates a completed
  condition or successful outcome, not any piece of explanatory copy.
- Buttons and disclosures have a minimum 44 px touch area; default buttons are 48 px.
  Compact colour choices and conversation chips follow the same target rule.
- Preserve visible keyboard focus. `summary` receives the same focus treatment as a button.
  Disabled execution needs an explanation; an unavailable reward can still be inspected.
- Controls keep 16 px form text to avoid mobile input zoom. Validation retains the user's
  input and explains what is needed before applying anything.

## Motion

CSS and imperative animation share these tokens from `foundations.css`:

| Purpose | Duration | Behaviour |
| --- | --- | --- |
| Feedback | 160 ms | Press, small paint changes |
| Content | 220 ms | A new insight, membership selection, detail content |
| Surface | 300 ms | Sheet/conversation arrival, Companion expansion |
| Spatial | 380 ms | Bubble positions, milestones, drawer and floating-control movement |

Use `--ease-settle` for these transitions. `motion.mjs` reads the same tokens, replaces
an unfinished animation on the same element, and honours reduced motion. Details arrive
with a small horizontal shift; returning to a parent uses the opposite direction.
Sheets arrive vertically. Headers remain a stable navigation plane.

Ambient illustration, the Time Travel warp and Story reading progress have a different
purpose and retain their own pacing. They are not navigation animations. Reduced motion
removes decorative movement and leaves all controls and outcomes available. Direct drag
and pinch follow the user's movement without easing or a delayed animation queue.

## Future canvas and drawer

The canvas is the primary surface, without a framing card. Solid bubble area represents
balance; dotted circles represent targets on the same scale. Photos and purpose colours
identify real Pots. Ghost possibilities use soft grey and a plus, carry meaningful names,
and are outside balances and projections until adopted. Text does not scale with zoom.
Small bubbles reveal text when there is room. Their visual size must not be inflated to
meet a generic button-size rule: pinch, Fit, keyboard zoom and opening a bubble provide
inspection. Timeline marks are also a deliberate compact data-control exception.

The three drawer stops are docked (a visible 44 px lip), timeline (Time Travel plus a
What If preview), and expanded. Do not invent an intermediate stop per feature. Heights
are measured from actual controls. On short screens the expanded drawer becomes one
scroller, with the grip retained, so experiments cannot be stranded in a zero-height body.
Opening or docking resets this outer scroll; Time Travel and selected experiments persist.
On taller screens the timeline remains visible above the independent ideas scroller.

Time Travel thumb, fill, date, age, projections and milestone positions derive from the
same selected month. A scenario change resets them together. The filled track retains
its circular end at every width. White dots and the subtle warp live inside the fill.

## AI and copy

The Companion responds to the current person, date, visible section, goal, experiment,
attention condition and task. It uses the same scenario models as the visible data.
A single complete message uses regular-weight text; a title with explanation uses a
stronger title. Do not replace useful content with a vague headline.

Editorial detail pages can opt in to reading context with `data-support-topic`.
After scrolling settles, the Companion follows the section with the most visible
content beneath it. Conversation return restores the originating evidence. The
[portrait story](BEHIND-THE-PORTRAIT.md) uses this pattern to separate observation,
interpretation and the customer's own perspective.

Money Personality has two complementary destinations: Explore explains the
interpretation; Behind presents measurable activity. Metric tiles identify the
period, unit and source, with calculations in detail. Do not add trait judgements,
confidence scores or invented historical trends to the metrics dashboard.

Ideas explain why they may fit, leave room for disagreement, and never imply that a
life-stage possibility is a prediction or a peer benchmark. A goal, budget, balance,
projection, rule and agreement are distinct concepts and should be named accurately.
Labels such as “Learning” explain missing data rather than implying a zero balance.

AI conversations and life-stage ideas remain simulated locally. Keep that limitation
available in About, without repeating production caveats on the main experience.

## State and data contracts

Discovery and execution share eligibility logic. `relationshipQualification` is the
source for live HSBC Status and tier-dependent rewards. `rewardAvailability` drives both
reward detail availability and the redemption guard. Rate boosts accept savings Pots;
budgets, loans and investments are excluded. Browsing never changes balances or Points.

Mini widgets and details use the same money/visual models. A monthly budget measures
spending against allowance, not current balance. Transactions are date-sorted without
mutating the source ledger. Transfers are not purchases. A successful change produces
its existing receipt/Undo path; review and simulation do not commit money.

## Maintaining the system

Prefer changing the existing shared template, controller or token. Add a feature rule
only when its interaction has a different purpose. Keep these decisions alongside the
code and use the audit capture script and journey tests when shared patterns change.
