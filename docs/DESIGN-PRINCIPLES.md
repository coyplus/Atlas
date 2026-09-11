# Interaction principles

User direction, 9 September 2026. Apply these when refining subsequent Vanilla components and, later, the other art directions.

- Start with the information that matters now. Avoid generic AI taglines, repetitive labels and implementation explanations in the concept UI.
- Use recognisable icon buttons for compact utility actions, including playback, rewind, transcript and speed. Provide accessible names, hover titles and roughly 44px hit areas. Keep text on decisions whose outcome needs to be explained.
- Make component state respond to intent. Scrolling prioritises page content; tapping a component engages with it. Avoid explicit expand/minimise controls where the intent is already clear.
- Preserve DOM identity, focused controls and media across visual state updates. Animate layout changes in place and respect reduced motion.
- The support bar opens AI on a message tap. AI triages help and brings in a person when appropriate. Only Premier exposes a direct human option.
- A play button replaces the AI avatar only on the Now money-summary message. Once started, playback belongs to a separate bottom player; contextual support always remains free to change.
- Use the existing Vanilla tokens and component vocabulary. Reference designs guide overall visual treatment without overriding current IA or data.

- Treat support as one product-level surface. Main pages, detail views and conversations own distinct headers; a conversation replaces the card. Avoid stacked global, support and detail headers.
- Main pages restore full context and CTAs on return to the top; detail screens start compact. Full context and CTAs belong in the expanded state. A compact card hides them. Content scrolls beneath a transparent floating container and its shadow.
- Use the vendored Google Material Symbols Outlined library; do not hand-draw replacement utility glyphs. Use the same AI avatar wherever AI is identified and a credited profile photo wherever a human is identified.
- Preserve a detail’s context and position when entering and leaving conversation. Avoid clipped/scaled modal animations and moving the component between containers.
- Keep the live workbench, blueprint and written support contract aligned with the production component, rather than maintaining separate examples.

- Use neutral focus highlights in Vanilla: near-black on light surfaces and white in Premier. Avoid blue focus accents.
- Let the conversation header identify AI-only threads; repeat author identities only when mixed human/AI messages need attribution.
- Keep playback progress visually minimal while preserving native seeking, keyboard access and a comfortable invisible interaction area.

- Distinguish conversation from content cards through speech geometry: incoming bubbles have a crisp lower-left corner, outgoing bubbles mirror it. Keep text padding and message gaps compact, with room to read comfortably.

- Limit thinking choreography to fresh Now AI summaries. Never delay navigation or human-authored messages; user interaction always takes priority. Use a feathered glass layer behind floating support, with readable opaque card content.

- Guided journeys prioritise instructions: fixed title/back header with one AI help icon, no support card or glass layer. AI help preserves the current step, entered values and scroll position. Reading details retain compact support, with glass strictly below the header.

- Vanilla Now has one Number grid: size changes emphasis, never ownership or behaviour. The first Number has no special position or logic.
- Quick Actions reveal breadth through More and allow personal shortcuts through drag or equivalent tap placement. Save and cancel are explicit.
- Put the complete products and services directory at the end of Now, after personal numbers and stories. See NOW-TAB.md.
