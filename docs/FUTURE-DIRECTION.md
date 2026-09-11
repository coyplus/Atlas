# Future · a little space for what comes next

Interaction study 02 · 10 September 2026

[Open the revised concept](http://127.0.0.1:4174/concepts/future/)

This revision replaces the parallel-lane study with a compact bubble field and progressively revealed controls. It uses six fictional priorities and supports two additional goals without increasing the field height. The existing Atlas Future tab is unchanged.

## The four questions in View

**Where am I going?** Six recognisable bubbles show home, breathing room, a car loan, long-term investments, a summer and learning. Labels remain visible. The larger bubbles have room for an amount; smaller ones reveal their amounts on selection.

**How am I getting there?** One entry shows Money Speed: the scheduled monthly amount currently going towards these priorities. Tap to see contributions, repayments and money remaining in cash. Its value changes during Time Travel as commitments finish.

**Where will I land?** A single time control updates bubble fills, balances and net-worth scenarios. Tap a bubble for its projected date, current contribution and target. “Take me there” travels to that milestone.

**What else do I want?** “What else would you love to do?” adds a goal as an experiment. A name, target and contribution are enough to test it. The contribution comes from the existing flexible pool, so the other goals respond.

## The bubble field

This is a collection of financial priorities within one space, rather than a list of six chart rows. It has a bounded height and scales as a whole on smaller phones.

The bubbles deliberately keep their locations during time travel and What If selection. Their sizes are chosen for a readable composition, **not** as a proportional comparison of wealth. This avoids a large investment balance swallowing smaller goals. This convention is explained in About; no quantitative claim is made from bubble area.

For savings, fill represents the proportion of the target funded. For debt, fill represents the proportion repaid. Investments have a dashed inner edge and a softened treatment; selecting the bubble shows the scenario range. A projected milestone being passed is labelled Funded or Cleared; it does not imply a real transaction has occurred.

The time rail carries dates. Trying an idea moves its coloured milestone marks while faint marks retain the original positions. A short sentence names the main effects, such as “Home 3mo earlier · Buffer 3mo earlier”. Affected bubbles show the same timing change. Precise dates and the full consequences are available on tap and in review.

This separates two jobs: **the field helps customers recognise what matters; the timeline explains when it could happen**. We avoid implying that an attractive bubble arrangement has a precise temporal axis. A larger portfolio would eventually need grouping or a focused selection; this prototype demonstrates six to eight priorities, not unlimited capacity.

## Sandbox starts with ideas

Sandbox has the same field and time control. It adds a small, horizontally browsable set of ideas and a visible **Reset** action. Detailed configuration stays behind selection.

The starting ideas demonstrate different purposes:

- **A little closer to home:** explore another £50 a month, explicitly assuming it can be freed from everyday spending.
- **Breathing room comes first:** change where money released by finished commitments goes first, with no increase in the monthly total.
- **A little room for today:** pause home contributions for six months and keep the money in everyday cash.

Ideas are selectable, reversible and combinable. Each card previews the result in the context of the experiments already selected. The visualization updates locally without loading or leaving the screen. Conflicting pauses for the same goal replace each other; selecting a different first priority replaces the previous first-priority choice.

The default screen does not show a slider, allocation chart, priority form, assumptions list and AI conversation at the same time. A single selected idea, bubble or conversation reveals the relevant detail.

## Co-creating with AI

“Ask AI” opens a short conversation. The customer can type:

> What if I pause my Future Home contributions for six months?

The prototype turns that into a reviewable scenario, shows the calculated impact, and asks where the paused money should go: everyday cash or the buffer. The customer can refine it with “make it three months instead”, then choose **Try this idea**. It becomes a selected card alongside the other ideas.

The conversation also supports extra monthly saving and prioritising the buffer. Unsupported requests receive a clear explanation of the available prototype interactions. Protected loan and investment commitments cannot be paused through the conversation.

**AI status:** responses and intent recognition are simulated locally. Suggestions are composed from the example household's current contributions and projected dates. There is no model API, live personalisation service or bank connection. The conversation identifies itself as a prototype. The scenario arithmetic is real, deterministic local calculation; numerical outcomes are not invented by the conversation.

For the integrated version, AI should propose typed scenario changes from an up-to-date financial snapshot and customer-approved context. Each proposal should contain the intent, affected goals, amounts, dates, funding source, assumptions and conflicts. The projection engine validates and calculates the outcome. AI explains it. Suggestions must include the option to make life easier today; they should not all encourage greater saving or product uptake. No insight from a reflection should be presented as a confirmed preference without the customer having confirmed it.

## Reset and psychological safety

**Reset discards every experiment:** selected quick ideas, conversational scenarios, custom goals and removals, altered priorities, and the conversation draft. It returns the selected date to today and the exact baseline projection while staying in Sandbox. It is one direct action, without a confirmation dialog.

Switching to Your path temporarily shows the baseline without discarding the draft. Switching back to Sandbox restores the experiment. No real accounts or commitments are changed.

## Details when needed

- **Bubble:** amount, target, date, monthly flow and investment uncertainty. In Sandbox it also provides priority and removal actions.
- **Money Speed:** the current distribution of scheduled contributions and the route of money released by finished goals.
- **Review this future:** the combined changes in timing and funding, followed by an example practical plan.
- **About:** what size, fill and the timeline mean, plus the illustrative assumptions and prototype AI scope.

Review preserves the bridge to reality without making it the focus of experimentation. In a live implementation, the plan must validate current funding, product terms, locked arrangements and joint permissions, then obtain approval for exact changes. This study ends at a reviewable example plan.

## Model boundaries

The example begins with £850 monthly funding, including a protected £400 loan repayment and £100 investment contribution. The remaining £350 is distributed between home, buffer, summer and learning. When a target is funded, its released contribution follows the priority order. Paused contributions have an explicit destination and cannot be counted twice.

Investment examples use constant annual returns of −2%, 4% and 7%; their spread widens over time and also affects net-worth scenarios. These are illustrative scenarios, not probabilities, confidence intervals, forecasts or worst-case limits. The investment detail says losses are possible. The visual soft edge signals uncertainty; it is not itself a calibrated probability display.

The model retains funded goal balances. Spending on a trip or home is not modelled. Loan interest, taxes, fees, inflation, future earnings and everyday spending are excluded. Affordability of the monthly pool is assumed. These limitations remain accessible alongside the projection.

## What to judge next

Can a customer understand the overview without opening every detail? Can they try two ideas, notice which goal moved, and explain the trade-off? Does the bubble field feel like their priorities rather than a set of financial instruments? Can they refine a scenario conversationally and then confidently discard it?

The research basis from the first study remains relevant: personal, concrete future-self framing can support engagement with longer-term choices, while precise-looking projections can create false certainty. Neither establishes that this particular bubble treatment is effective; that needs testing. Sources: [Hershfield on future-self continuity](https://pmc.ncbi.nlm.nih.gov/articles/PMC3764505/), [FCA on cashflow projections and uncertainty](https://www.fca.org.uk/firms/undertaking-cashflow-modelling-demonstrate-suitability-retirement-related-advice).
