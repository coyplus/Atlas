# Money Check-in toolkit

Implemented prototype scope: four tools only. Updated 10 September 2026.

## Purpose

A little space for reflection, self-understanding and a more mindful relationship with money. Each experience delivers value without a purchase, product recommendation or commitment to a financial plan.

The compact Money check-in entry sits below the AI companion on You. It opens a four-card chooser. The tools share the Level 2 header, self-paced navigation, quiet colour, automatic completion saving and reduced-motion support. Each has a distinct visual interaction.

## The four tools

### Money Feeling

The existing flow remains: five expressive feelings, optional multiple reasons, a quick save path, optional authored AI reflection, and optional conversation. It preserves the seven-day feeling history and once-per-day editing. It opens from the toolkit alongside the other three tools.

### Money Instinct

Five short statement cards explore planning, reserves, experiences, routines and discussing decisions. Swipe or tap to answer; keyboard arrows work on the card. Depends, Skip and Undo are always available. A negative answer is not treated as proof of the opposite preference. Skipping every card produces no interpretation or saved insight.

A second mode, Does our picture still fit?, revisits up to three existing scenario beliefs with their original evidence. Customers can say Still fits, Things have changed, Depends or Skip. A change can include optional writing. The resulting review is saved separately from original evidence, so a playful interaction cannot silently rewrite a profile or investment setting. Investment-risk statements are excluded from this exercise.

The payoff reflects actual choices using authored prototype wording. Its insight can be edited and managed later in History and is not a personality score or validated assessment.

### Was It Worth It?

Choose an actual recent purchase, existing credit account or current goal, grouped in a single list. Credit and goals use appropriate questions, reasons and optional AI prompts. Outstanding borrowing and goal targets are labelled distinctly.

For a purchase, The receipt shows the exact amount and date. Reflect using Glad I chose it, A little mixed, Would choose differently or It was necessary. Optional reasons include connection, time back, comfort, practical value, enjoyment and habit, with an optional note.

The result describes the customer's view of that purchase; it does not rate spending as good or bad. Transfers, rule movements, repayments, future transactions and transactions attributed to another household member are excluded. No budget changes are made. Customers may return on another day to reflect on a different purchase.

### An Ordinary Day Ahead

Choose six months, one year or five years. Imagine one ordinary day with more room for people, a place of one's own, time, learning, adventure or another idea. A single optional AI invitation offers suggested answers or “In my own words”. There is no competing text field on the picture screen; writing is never required.

The payoff is an automatically saved postcard with a scene reflecting the selected aspiration and the customer's words. It contains no forecast, savings target or immediate goal/Pot CTA. The saved reflection retains the selected scene.

## Calm layout, completion and daily rhythm

Step progress is anchored below the screen header, outside the scrolling content. All four tools use a shared journey layout: a stationary bottom action area and a vertically centred content area that can scroll on small screens. Headers sit over the content with translucent, feathered glass. The status area shares the same header treatment. Reduced motion preserves every interaction.

Money Instinct's background cards remain fixed during a swipe. Only the face moves; text selection and native text dragging are disabled on the card. Tap, keyboard, undo and skip remain available.

The first completed check-in each scenario day earns **5 HSBC Points**, recorded once in the real prototype Points ledger. One completed tool is available per day. History and today's reflection remain accessible. Points do not depend on an answer, disclosure, memory permission or conversation. Skipping every instinct card produces no interpretation or reward and leaves the daily check-in available.

The compact entry uses an outlined daily stamp before completion and a filled stamp afterwards, alongside an explicit “X day streak” label. The toolkit shows seven calendar days with dated stamps and today distinguished. Gaps remain empty; this is a record of pauses, not a separate reward threshold.

The Points acknowledgement makes one soft press with a fading halo and four small glints. It never loops; reduced motion shows a static reward.

Completion automatically keeps the reflection privately and opens a calm closing screen with a small reward acknowledgement and a single Done action. There are no Save, Remember or product decisions on the ending. Returning, editing a feeling, deleting a reflection or reloading cannot earn a second reward or reopen the daily slot. A separate completion record preserves the reward history after a reflection is deleted.

Dates follow each prototype scenario's frozen date. Use Reset this moment to review another tool on the same scenario day; the customer journey does not include a bypass.

## Reflection History and remembering

Reflection History holds all four tools, including the existing Money Feeling entries. Saved moments and HSBC remembers are two filters. Customers can edit an insight, enable or disable its use in future support, or delete a reflection. Original answer context remains separate from the editable insight. Saving privately does not grant household sharing or personalisation permission.

The prototype keeps records in the current person's persistent local demo state. Each new tool record carries a scenario date, tool and content version, original answer context, original reflection and an editable insight. A completed draft cannot create duplicate records. A customer can revisit dated feelings without gaining extra Points.

## Optional AI reflection

Money Feeling retains its adaptive reason prompts. Was It Worth It? now uses the same invitation → optional prompt → optional answer → optional conversation pattern. Prompts respond to verdict and reason; multiple reasons invite a focus. An empty writing box is not presented on the quick spending path. Writing appears only when In my own words is selected.

Money Instinct and An Ordinary Day Ahead offer the same optional reflection pattern at a meaningful pause. Every tool can be completed without choosing that path. Prompts and follow-ups are authored prototype responses. Continuing to a conversation carries the selected prompt and answer, without converting them into a sales lead.

## Later contextual support

There is no cross-sell at the end of any new check-in tool. A remembered aspiration can be recalled when the customer later visits Future; a remembered spending reflection can be recalled in relevant spending Number detail contexts; a remembered instinct can be recalled in personality context. The CTA revisits the reflection, rather than opening a product or changing money.

Only records explicitly marked for remembering in History are eligible. Private records, forgotten records and other household participants' context do not produce these suggestions. Edited text is used on the next relevant presentation. Recall is deterministic for this prototype, not a live AI inference or production recommendation engine.

## Validation

- Model checks cover daily rhythm, idempotent saving, privacy and contextual eligibility, immutable original beliefs, investment-risk exclusion and purchase filtering.
- Browser checks cover the four-tool chooser, feeling quick path and reflection, instinct undo/skip/correction, exact receipt amounts, optional memory, editing/forgetting/deletion, future contextual recall, keyboard/swipe interaction, local persistence and narrow screens.
- Visual review includes light and dark themes, individual tools, result screens and reduced motion. Screenshots live in `docs/screenshots/checkin/`.

## Reference rationale

The supplied How We Feel screenshots informed tactile cards, purposeful transformation and a personal artifact worth revisiting. Its other exercises are outside this prototype's agreed scope. No Mobbin MCP access was available; supplied images were reviewed directly.

Earlier research informing the concept: [How We Feel](https://howwefeel.org/), [CFPB financial well-being](https://www.consumerfinance.gov/consumer-tools/educator-tools/financial-well-being-resources/explore-findings/), [CFPB effective financial education](https://files.consumerfinance.gov/f/documents/201706_cfpb_five-principles-financial-well-being.pdf), and [Hershfield's future-self research](https://www.anderson.ucla.edu/faculty/hal.hershfield/resources/Research/Annals-of-the-New-York-Academy-of-Sciences-2011-Hershfield.pdf). These support hypotheses to test, not claims that this prototype improves financial outcomes.
