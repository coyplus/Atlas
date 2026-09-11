# Atlas data colour

Colour belongs to the information, not the chart position. Now tiles, the number gallery and expanded details and My Stories working pages share the same semantic mapping. The surrounding cards, typography, chart tracks and controls remain neutral.

## Information roles

| Role | Meaning | Light | Dark |
| --- | --- | --- | --- |
| Blue | Everyday cash and budget capacity | `#477895` | `#88afc8` |
| Teal | Savings, goals and financial resilience | `#3c8075` | `#85b5a8` |
| Violet | Investments and long-term invested money | `#806899` | `#b3a0ce` |
| Clay | Borrowing and credit utilisation | `#a0674f` | `#cb9d86` |
| Slate | Money already set aside or committed to recurring payments | `#80909b` | `#9ba7b2` |
| Neutral | Unclassified information | `#8b9194` | `#929a9e` |

A goal uses the colour of its underlying money type. Its unfilled track remains neutral. Low progress is not an adverse status. Borrowing uses clay at ordinary utilisation; it is not automatically a warning.

## Categories

Spending categories use stable, named identities: housing blue-grey, utilities slate, groceries olive, eating out rose, transport blue, subscriptions violet, telecoms periwinkle, family sand, shopping terracotta and leisure mauve. Exact light/dark values live in `src/design-system/data-colour.css`.

These colours identify a category, not whether the purchase was good or bad. Groceries retains the same colour in its cumulative trend and the spending mix, even when the data is reordered or amounts change. New, unmapped categories stay neutral until a deliberate role is assigned. Labels and values remain the primary way to distinguish similar hues.

## States take precedence

- **Amber:** a budget or credit limit is exactly reached, or an existing status is pending.
- **Red:** the amount is over its actual budget/credit limit, or an existing status explicitly needs attention.
- **Teal:** a condition has been met.

There is no invented percentage at which normal borrowing becomes dangerous. Pending means incomplete or awaiting a choice, not urgent. Budget exceptions have a written explanation; over-budget bars also use a diagonal pattern. Credit exceptions include a visible warning label and accessible description. The filled gauge is capped at 100%, while the actual percentage remains in the headline and accessible text.

## Movement

A rising spending line is a cumulative total, not a negative investment return; keep its category colour. Cash inflow is not necessarily success (it could be borrowing), and an outflow is not necessarily a loss (it could be repayment).

For future return/comparison charts, retain the signed value and direction marker. Use teal for favourable movement and clay for adverse movement only when the metric's meaning and comparison period are explicit. Reserve red for an exception needing attention. Current neutral comparison copy is preserved where no such judgement is supported.

## Accessibility and scope

Colour supplements labels, numbers, geometry and progress, never replaces them. Dark mode uses lighter pigments with the same meaning. Forced-colour mode retains chart structure and text with system colours. Small tiles can abbreviate the legend; opening a detail exposes the labels and values.

The shared model lives in `src/domain/visual-semantics.mjs` and `src/domain/number-visuals.mjs`. Rendering uses `data-viz-role` and `data-viz-state` in `src/design-system/number-visual.mjs` and the progress template. Vanilla light/dark use the semantic palette; earlier art directions retain their existing monochrome fallback.

Story charts use rose for eating-out comparisons, teal for savings targets and completed savings habits, blue for available cash and slate for deductions. Investment allocation uses violet with a lighter violet remainder; both remain invested money. Progress through story pages stays neutral because navigation progress is not financial progress.


## Personal Pot identities in Future

Canvas balances and timeline milestones share one Pot identity. Cash uses Coast blue; borrowing Clay; housing Slate; learning Lilac; investing Plum; work flexibility and business Sand; travel and experiences Apricot; time with friends and giving Rose. These reuse the infographic palette, with softer tints for personal goals. Customer colours and photos override the suggested identity. This identity layer does not alter status meanings on the Now charts.

Solid fills have no decorative outline. A `Reached` label and accessible status identify completion without recolouring all completed Pots green. Dotted target circles retain their monetary scale; soft grey possibilities have no monetary value and stay outside forecasts until accepted. Black or white text/icons are selected using the higher sRGB relative-luminance contrast ratio. Photos use a dark blue scrim with white text; the timeline keeps their underlying Pot colour.
