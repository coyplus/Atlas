# You · money personality portrait

Component pass only. Status, Premier, Points, check-in, timeline and the remaining You sections are deferred for separate review.

## Visual language

The first hexagon-only pass made different personalities look like similar crystal clusters. The revised system uses six recognisable silhouettes, with the same shapes in the artwork, mini trait key and detail view:

| Trait | Form |
| --- | --- |
| Planning | Arch: structure to build on |
| Rhythm | Wave: regular repetition |
| Patience | Rings: a longer view |
| Spontaneity | Open bloom: room for the unexpected |
| Generosity | Joined forms: making room for others |
| Focus | Lens: a clear centre |

This is a designed visual metaphor, not a psychological assessment. Trait strength controls scale; ranked traits control composition. Colours are consistent per trait, but silhouettes also work without colour.

The two user-supplied How We Feel Mobbin references were visually inspected in the public browser. MCP was unavailable. The useful principle is recognisable silhouettes paired with colour and a readable key; the Atlas artwork is original and retains Vanilla typography and glass.

- https://mobbin.com/explore/screens/2379ccc2-93b9-429e-b7f4-67c5a7998d1b
- https://mobbin.com/explore/screens/d7620f89-5925-4eb2-b8c6-17d2fb654abd

## Evidence depth

`portrait-evidence.mjs` explicitly authors breadth and continuity for the frozen scenarios, using the evidence already cited in their profiles. It is separate from presentation and does not parse prose or infer depth from wealth, age, membership tier or mood.

Alex has an unassigned outline. A first named impression has one filled primary form and simple secondary outlines. Developing profiles have internal contours and a few related echoes. Elena’s broader history produces many finer layers and repeated forms. Leo’s limited pocket-money evidence stays simple. Unique confirmations/corrections add detail without replacing the identity or rewarding repeated clicks. In a connected product, these evidence bands would need to be supplied by the understanding model, not a client-side inference.

A household composition preserves each consented participant’s own shapes and fidelity. An invitation does not add understanding. Other people’s feedback cannot increase a shared person’s fidelity.

## Household interaction

Every scenario has a participant row with a persistent Add button. Participants scroll horizontally on narrow screens; Add stays visible beside them. Shared profiles can be selected. Existing household members without a shared personality open an explanation, never a fabricated portrait. Dependents without profiles are identified accordingly.

The existing invitation form records a demo invitation only. Pending participants appear with initials and an awaiting-consent state; tapping explains that no email has been sent and no data shared. No external messages are sent by this prototype.

## Detail and validation

Explore opens the same artwork, its key, evidence and existing confirm/correct controls. Free-text correction updates the visible description and confirmation state; it does not infer new trait scores. The entry animation respects reduced motion. SVG is decorative; interpretation remains available as text.

Reviewed all four scenarios, shared profiles, light/Premier appearances, 320px width, return navigation, quiz/confirmation/correction and invitation/consent boundaries in Chromium and WebKit. Screenshots: `docs/screenshots/you-portrait/`.

Premier source retained for the later Status pass: `/Users/coy/BDF/Projects/HSBC Premier final/03-design/premier-hub`.

## Ambient motion and integrated glass

The artwork now sits at 1.24× scale, extends beyond its former canvas, and is cropped horizontally by the portrait/phone bounds. The glass tile overlaps the canvas by 64px. Its translucent gradient, 14px backdrop blur and fine highlight keep the lower shapes visible beneath the heading. The standard backdrop declaration follows the WebKit-prefixed declaration so the production CSS retains both.

Individual shapes drift on staggered 30–46 second cycles: a few pixels of translation, roughly two degrees of rotation, and under 2% scale change. The entry reveal remains separate. Background portrait movement pauses when a modal opens, and reduced-motion preference disables both animations. Trait keys and text stay still.

### Portrait refinement
The tile sits 40px lower while retaining its overlap. The duplicate information control is removed; Explore opens the portrait detail. Riley now has an authored, consent-shared first-impression profile in Sam’s scenario and participates in Together. Ella remains unshared. Main-page content scrolls under the status region, which shares the companion’s continuous glass plane to avoid a second rectangular blur seam.

Together uses centred, count-specific arrangements: two overlapping portraits or a compact three-person cluster. Household scale is separate from the solo crop, with each person’s primary form visible above the glass.
