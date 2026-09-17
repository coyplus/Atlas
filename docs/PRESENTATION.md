# Atlas concept presentation

Live entry: `/presentation/`. Also available beside Add to Home Screen in the
mobile scenario chooser, including when the prototype is installed.

## Story structure

The fourteen slides follow the Visual Story Planner: setting, character, conflict,
strategic response, big idea, resolution and soundbite. Each transition answers
the question raised by the previous slide.

1. Setting — Introducing Atlas and the ambition for the next decade.
2. Character — Sam, his household and competing priorities.
3. Conflict — Digital banking makes transactions easier; sustained progress is another job.
4. Causal bridge — Transactional journeys lead to completion; transformational journeys need repeated action, feedback and adaptation, so we design a system of support.
5. Strategic shift — Carry personal context and continuity into digital convenience; earn relationship loyalty through usefulness.
6. Big idea — Making banking a relationship again: help customers choose, act and keep going.
7. Behavioural foundation — Three sides of one person: Now/competence, Future/autonomy, You/relatedness.
8. Now — Build confidence, take a useful action and make it repeatable.
9. Future — Choose a personally meaningful future and see the reason for the routine.
10. You — Listen, connect, celebrate and recognise the relationship, including benefits.
11. Architecture — A shared AI behavioural layer delivers all three customer experiences.
12. Flywheel — Show how the experiences reinforce trust, relevant support and sustained progress over time.
13. Shared value — Explain why customer progress can support loyalty and appropriate bank growth; a hypothesis to test.
14. Soundbite — Customer progress → earned trust and loyalty → long-term value for HSBC.

The personal-banking heritage is explicit on slide 5: through branches and personal bankers, we built relationships over time. It sits inside the strategic shift rather than a
separate nostalgia slide. It identifies qualities to carry forward, without
claiming that all historic customer experiences were personal or better.
The narrative does not assume customers are asking to be understood by a bank;
the bank must offer useful support that earns a deeper role. Behaviour is not the
only determinant of outcomes, and the flywheel is not presented as proven causation.

Presenter notes are held outside this public repository in the owner’s local deck folder.
The published deck contains no notes control, notes text or notes keyboard shortcut. The £50 / 11-month example
comes from Sam’s existing What If scenario. Outcomes for the bank are presented
as hypotheses to validate, rather than measured claims.

## Versions

The header selector switches between three decks. Each has its own shareable URL and keeps the `p` scenario parameter.

- Original (default): `/presentation/`, fourteen slides, `src/presentation/slides.ts`.
- Relationship: `/presentation/?version=relationship`, eleven slides, `src/presentation/relationship.ts`.
- Narrative: `/presentation/?version=narrative`, fourteen slides, `src/presentation/narrative.ts` and `narrative.css`.

The narrative deck argues as a chain: banking has become transactional; customers want outcomes and features have not delivered them; outcomes are built from sustained behaviour; a behaviour needs three conditions (able to, the situation lets them, wants to) and features fix only the first; so design a system that prompts, enables, rewards and adapts; better customers build a better bank; a relationship is what makes the system run; AI is the orchestrator and curator, with human handover; Now, You and Future are built on the three needs that sustain motivation; three product slides annotate each feature with the condition it serves; the close returns to rented versus earned loyalty. It reuses the relationship deck's base styles and adds `n-` prefixed rules only where the argument needs a new layout. Browser coverage: `e2e/presentation-narrative.spec.ts`.

## Editing

- `src/presentation/slides.ts`: audience-facing headlines and visuals.
- `src/presentation/deck.css`: independent responsive presentation styling.
- `src/presentation/deck.ts`: controls, slide links and navigation.
- `presentation/index.html`: HTML entry point.
- `assets/presentation/`: optimised captures of the actual Sam prototype.

The deck is a separate Vite HTML entry, using the same HSBC fonts, Material
Symbols and colour language as the app. It does not load the banking runtime.
Both entries share the server-side access gate.

## Interaction

Arrow buttons, left/right keys and Page Up/Down move through the slides. Home and
End jump to the beginning or end. Horizontal swipes navigate on touch devices;
vertical gestures scroll longer slides. The slide count opens the overview.
Escape closes the overview. Each slide has
an addressable hash, for example `/presentation/#11` for the system diagram.

Desktop uses a horizontal system flow. Phone layouts recompose it into inputs,
AI layer and customer experience vertically; they do not shrink a desktop image.
Reduced Motion suppresses transitions. Print styles expose all fourteen slides.

## Inputs and references

- User’s `deck/Notes.txt` and supplied foundational-system diagram.
- User’s screenshot of the Visual Story Planner: Setting → Characters →
  Conflict → Big Idea → Resolution → Soundbite.
- [Self-Determination Theory](https://selfdeterminationtheory.org/the-theory/),
  referenced on slide 7.
- [HSBC History](https://history.hsbc.com/history), background for the move from physical to digital access.

Verification covers all slides in mobile Chromium and WebKit, the chooser entry,
absence of notes, navigation, standalone visibility and entry routing. Visual
review includes every slide at 1440 × 900 and 390 × 844, with the phone diagram
reviewed through its full scrollable length.

The flywheel explains the reinforcing relationship hypothesis; the architecture
explains how the bank delivers it. On phones, the circular flywheel becomes an
ordered vertical loop with an explicit return to meaningful interactions.

The published site requires a server-side password. Offline application caching
is retired so presentation and prototype navigation pass the access check.

Slide 4 takes inspiration from the supplied transactional and transformational
journey diagrams. It is a design distinction, not a claim that every transaction
has an instant result or that a system guarantees behavioural change. Slide 7
names Self-Determination Theory and its authors; the tab mapping is our design
application, not a scientifically validated prototype.

Slide 4 distinguishes an immediate need and the relief of completing it from a
distant goal that needs timely prompts, manageable repeat actions and nearer
feedback or recognition. The [Fogg Behavior Model](https://www.behaviormodel.org/)
informs the motivation, ability and prompt framing. Reward is described as a
design mechanism for the ongoing journey, not a fourth element of B=MAP.
