# Queries — the questions any prototype should be able to ask

| Question | Where the answer lives |
|---|---|
| What does this customer own? | `l1.accounts` (balances, owed), `l1.pots` (balances, targets), `l1.savingsAndInvestments`, `l1.productsHeld`, `l1.netWorth` |
| What are they spending? | `l1.transactions` (window before `asOf`), `l1.spending.byCategory`, `l1.bills`, `l1.spending.comparisons` |
| What are they trying to achieve? | `l1.goals` (with `potId` where a pot exists), `l1.pots[].target`, `l2.projections.perPot[].reach` |
| What changed? | `l2.signals` (kind `spending-change`, `rule-ran`, `promise-kept`, `human-signed`, …) — each with `basis[]` into the ledger; across two snapshots of the same customer, diff the two `l1` documents |
| What has Atlas noticed? | `l2.signals`, `l2.insights` |
| What does Atlas recommend? | `l2.nextBestActions` (by context), `l2.recommendations` (modules with a *why*), `l2.opportunities`, `l2.risks` |
| What What Ifs are available? | `l2.whatIfs` — each with `type`, `effect` (the exact change to pots/rules), `canCommit`, `graph`, `basis[]` |
| What Stories should appear? | `l2.stories` — `state` sets the tile size (new · pending · saved); `action` names the What If or module it runs |
| How does this affect their Future projection? | apply `whatIf.effect` to a copy of `l1.pots` and recompute with the formula in `schema.md` (the prototype does exactly this: `applyWifTo` → `milestone`); baseline values in `l2.projections` |
| What will the AI say here? | `l2.companion.contexts[context]` — `now`, `future`, `me`, `you.believe / built / behalf`, `nowDone`, `human-takeover`; chips and answers in `l2.companion.conversation` |
| Who is in the household and what can they see? | `l1.household.members[]` (`sees`, `consent`), `l1.pots[].members[]`, `l2.personality.members[]`, `l2.householdInsights` |
| What does the relationship look like? | `l1.relationship` (tier, tenure, RM, milestones, contact history), `l1.rewards` |
| When does a rule end, and what then? | `l2.projections.ruleEnds[]` — month, date, and the prompt the AI makes |
| Why did Atlas say that? | follow `basis[]` from the item to signals, then from signals to `l1` records |

## Worked example — Jordan, "Eating out capped at £200"
`l2.whatIfs[weat]` → `basis: [l2:signals/sig-eating-out]` → `l1.spending.comparisons.eatingOut.sixMonthAverage = 245` and four eating-out transactions → `effect: {potId: "ef", monthlyRateDelta: 45}` → recompute `ef` milestone: 570 ÷ (72+45) = 5 months (Feb 2027) instead of 8 (May 2027) → the card's consequence line "Emergency fund done 3 months sooner · Feb 2027" → committing writes rule `cap` on `ef`, +£45 money speed, a receipt — all of which the prototype does in `startWif`.
