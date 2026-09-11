# Two views of the Money Personality

Implemented concept · 11 September 2026

**Explore your portrait** explains what we think the patterns say about the person.
**Behind your portrait** shows the measurable activity itself. The two destinations
sit together in the Money Personality section of You, with Explore first.

## Explore: interpretation

The original portrait artwork and trait key now lead into the interpretation-led
stories. Each story connects an observed behaviour to its possible meaning and
its contribution to a trait. Tapping it opens the fuller observation, reasoning
and ongoing signals. Confirmation, correction and saved personal perspectives
remain here. The customer can inspect the reasoning without accepting it.

## Behind: measurements

A separate dashboard leads with numbers, periods and visual measurements. It has
no trait labels or interpretive judgements on the metric tiles. Saving, Spending
and Routines filters let the customer follow one subject. A tile opens its
calculation, scope and source.

| Measurement | Visual | Source and scope |
| --- | --- | --- |
| Saving or grocery cadence | One equal capsule per completed month | Existing seven-month payday history or eight-month grocery streak; the incomplete month is excluded |
| Grocery change | Two bars on the same zero-based scale | Same point in each month; Jordan's £250.40 versus £212.40 |
| Grocery spending to date | Filled amount against the rule's line | Sam's £198.10 against the £220 holiday-rule condition, distinct from the shared grocery budget |
| Saving by rule | Proportional allocation strip | Current contribution model; conditional amounts and average round-ups are explicitly labelled |
| Bill timing | Amount by day, with a separate payday marker | Known scheduled monthly bills; dates do not imply completed payment; variable card repayments are excluded |
| Repayment rhythm | One ring per recorded year | Elena's nine-year pattern of monthly payment in full |
| App visits and check-ins | Count marks and dot fields | Recorded session frequency and check-in counts; marks do not invent particular weekdays |
| First activity | Entries by actual recorded date | Alex's short ledger history, without an invented long-term trend |

No synthetic spending history, confidence score, peer ranking or financial
behaviour score has been added. Existing frozen profile history is distinguished
from current schedules and new check-ins. Current allocations remain connected to
the same rules used elsewhere. Sam's balances and £2,000 gap to Premier are unchanged.
Shared portraits show only the aggregate evidence supplied in the shared profile.

## Companion and navigation

The shared Companion follows the visible interpretation or measurement after
scrolling settles. Interpretation conversations explain possible meanings; metric
conversations explain periods, calculations and what is counted. Returning from
conversation restores its originating detail. Cross-links connect the two views.
Level 2 pages use the shared header and have no primary tab bar.

## Implementation and review

- `portrait-view.mjs` and `portrait-story*` compose Explore and its reasoning.
- `portrait-metrics.mjs` owns measurable data and its Companion context.
- `portrait-metrics-view.mjs` and its CSS own the dashboard and measurement detail.
- `recordedCheckins` keeps the evidence count aligned with newly saved reflections.

Run `node scripts/capture-portrait-story.mjs` to refresh the normal and larger-phone
[review gallery](screenshots/portrait-metrics/index.html). Earlier captures under
`portrait-story` document the superseded interpretation-led Behind screen.

Tests cover arithmetic and period scope, live rule changes, shared-data isolation,
interpretation versus measurement routing, saved perspectives, contextual
conversations, filters and return navigation. Existing portrait confirmation,
correction and shared navigation regressions are retained.
