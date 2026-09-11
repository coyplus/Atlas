# Atlas concept presentation

Live entry: `/presentation/`. Also available beside Add to Home Screen in the
mobile scenario chooser, including when the prototype is installed.

## Story structure

The ten slides follow the Visual Story Planner supplied by the user:
setting, characters, conflict, big idea, resolution, soundbite.

1. Setting — Introducing Atlas and the ambition for the next decade.
2. Characters — Sam, his household and competing priorities.
3. Conflict — Access to tools does not automatically create progress.
4. Big idea — Making banking a relationship again.
5. Resolution — Competence, autonomy and relatedness as design principles.
6. Resolution — The shared AI behavioural layer connecting capabilities to people.
7. Resolution — Now makes everyday money manageable.
8. Resolution — Future makes choices and trade-offs tangible.
9. Resolution — You makes understanding and recognition personal and transparent.
10. Soundbite — Building better customers builds a better bank; experience Sam.

Speaker notes retain the fuller reasoning and a clear distinction between the
system vision and the current authored prototype. The £50 / 11-month example
comes from Sam’s existing What If scenario. Outcomes for the bank are presented
as hypotheses to validate, rather than measured claims.

## Editing

- `src/presentation/slides.ts`: headlines, visuals and speaker notes.
- `src/presentation/deck.css`: independent responsive presentation styling.
- `src/presentation/deck.ts`: controls, slide links, notes and navigation.
- `presentation/index.html`: HTML entry point.
- `assets/presentation/`: optimised captures of the actual Sam prototype.

The deck is a separate Vite HTML entry, using the same HSBC fonts, Material
Symbols and colour language as the app. It does not load the banking runtime.
The shared service worker resolves both HTML entries so installed-app visitors
can move between the deck and the prototype.

## Interaction

Arrow buttons, left/right keys and Page Up/Down move through the slides. Home and
End jump to the beginning or end. Horizontal swipes navigate on touch devices;
vertical gestures scroll longer slides. The slide count opens the overview.
Notes adds speaker context; Escape closes notes and the overview. Each slide has
an addressable hash, for example `/presentation/#6` for the system diagram.

Desktop uses a horizontal system flow. Phone layouts recompose it into inputs,
AI layer and customer experience vertically; they do not shrink a desktop image.
Reduced Motion suppresses transitions. Print styles expose all ten slides.

## Inputs and references

- User’s `deck/Notes.txt` and supplied foundational-system diagram.
- User’s screenshot of the Visual Story Planner: Setting → Characters →
  Conflict → Big Idea → Resolution → Soundbite.
- [Self-Determination Theory](https://selfdeterminationtheory.org/the-theory/),
  referenced on slide 5 and in its speaker notes.

Verification covers all slides in mobile Chromium and WebKit, the chooser entry,
notes, navigation, standalone visibility and service-worker routing. Visual
review includes every slide at 1440 × 900 and 390 × 844, with the phone diagram
reviewed through its full scrollable length.
