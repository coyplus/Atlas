# Narrative presentation UI captures

Captured from the working Atlas prototype on 17 September 2026, using the Sam
scenario, Vanilla theme and source revision `9d27976`. These are illustrative
prototype figures, not live customer data.

The captures use a 1440 × 1100 browser viewport at 2× pixel density. Screenshots
were converted to WebP at quality 92; no UI content was retouched.

| Asset | Prototype state |
| --- | --- |
| `cover-numbers.webp` | Now, scrolled to the My numbers grid; phone frame |
| `story-phone.webp` | Now → Golden Ratio Story → The working; phone frame |
| `cadence.webp` | You → Behind your portrait → Grocery consistency tile |
| `saving-rules.webp` | You → Behind your portrait → Saving by rule tile |
| `what-if.webp` | Future → expanded drawer → selected Save £50 on payday card |
| `points.webp` | You → HSBC Points and challenges module |
| `premier.webp` | You → Membership → Premier preview card |

The three primary phone views on slides 10–12 use the existing Sam screenshots
in the parent presentation assets directory. Layout, shadows and layering are
applied in `src/presentation/narrative.css`, keeping the source captures intact.

## Rotating cover · 18 September 2026

`cover-now.webp`, `cover-you.webp` and `cover-future.webp` were captured from the
local prototype at revision `69e80ca`, at the same viewport and density above.
Each is the full 414 × 864 CSS-pixel phone frame, without retouching the UI:

- Now: My numbers, scrolled 220px, including the deposit and family pots.
- You: the opening portrait and household view.
- Future: Time Travel moved to month 84, September 2033, age 40.

The cover crossfades these screens every nine seconds, with a matching live
Companion message. It pauses when hidden and shows Now for reduced motion.
