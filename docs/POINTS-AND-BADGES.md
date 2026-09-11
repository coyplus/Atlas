# Points and challenge badges

Twenty optional challenges live under You → HSBC Points → Your challenges. Points can also be earned elsewhere in Atlas; badges are an additional source, not the sole earning mechanism. Membership qualification continues to use Total Relationship Balance only.

## Catalogue

| Challenge | Commitment | Bonus Points | Category |
| --- | --- | ---: | --- |
| 30 days in touch | 30 days | 100 | Find your rhythm |
| The growing saver | 30 saving days | 200 | Build your savings |
| Small change, big start | 30 saving days | 100 | Build your savings |
| Pay yourself first | 3 monthly paydays | 120 | Build your savings |
| A little breathing room | 5 weeks | 150 | Build your savings |
| First hundred | 10 weeks | 150 | Build your savings |
| The leftover club | 12 weeks | 120 | Build your savings |
| The 48-hour pause | 10 purchases considered | 100 | Spend with intention |
| Cupboard creative | 7 different days | 80 | Spend with intention |
| Spending detective | 4 weeks | 80 | Spend with intention |
| Keep, change or cancel | 3 weeks | 80 | Spend with intention |
| In your own rhythm | 4 weeks | 120 | Find your rhythm |
| Better together | 4 months | 150 | Look ahead |
| Dear future me | 3 months | 100 | Look ahead |
| Ready for a rainy day | 4 weeks | 100 | Look ahead |
| Keep your guard up | 5 days | 80 | Grow your confidence |
| Make interest click | 4 weeks | 100 | Grow your confidence |
| Before the first step | 4 weeks | 100 | Grow your confidence |
| The patient investor | 6 months | 200 | Grow your confidence |
| Keep your promise | 6 months | 200 | Look ahead |

## Interaction

- The You entry combines the Points balance with three challenge previews. Active challenges come first; a new customer sees a daily review, the £1 saving challenge and scam-awareness practice.
- A portrait-style “View Points activity” row opens the full earned-and-spent ledger, available balance and totals. Older source summaries retain their period labels. The journey timeline is a separate sibling module.
- Completed challenge rewards use a subtle strikethrough alongside the earned label. Activity ledger amounts remain unstruck.
- The gallery shows all 20 badges, with Started and Earned filters. Locked artwork means the badge is not yet earned, not that a banking tier is required.
- A bottom sheet explains the challenge, full commitment, fixed reward and recovery approach. The growing-savings challenge makes its £465 total and £189 final week explicit before joining.
- Join, record a step, pause and resume work in every scenario. A confirmation is required before recording a step. Daily, weekly and monthly challenges permit one record per calendar period. The six-month investment challenge also requires complete elapsed months.
- Completed milestones persist when paused. Completion adds the bonus automatically once, records it in the existing Points ledger and reveals the badge with a brief reduced-motion-aware animation. Spending Points never removes an earned badge.
- Parent screens refresh after changes. Closing a sheet returns to the current gallery; browser back works for collection and detail navigation.

## Prototype boundaries

Reward values and challenge terms are illustrative design content. Progress is explicitly recorded by the customer; no bank-transaction verification is claimed. Joining or logging never transfers, invests or repays money. The existing scenario date is the clock, so time does not advance when a preview is reloaded. A production implementation would need consented activity verification, fair recovery rules, eligibility checks and a server-owned award ledger.

Investment and repayment challenges apply to existing arrangements, with no return target, top-up requirement or incentive to start borrowing. An investment-learning alternative requires no investment. Points must not be a reason to keep an unsuitable investment or neglect essentials.

## Scenario examples

Alex starts with no joined badges. Jordan has three in progress, including the smaller £1-a-day saving challenge. Sam has three in progress, including day 12 of The growing saver. Elena has six earned badges and three in progress; The patient investor is one confirmation from completion. Her six seeded bonuses total 630 Points, separately credited in the ledger (4,050 overall before any further interactions).

## Implementation and checks

Catalogue, SVG artwork, domain rules and templates are isolated in src/features/badges; commands are in src/features/commands/badges.mjs. Scenario progress is in l1.rewards.challenges. Six domain tests cover catalogue integrity, pause/undo, cadence, single-award completion and ledger/account integrity. Browser checks cover collection, empty states, joining, confirmation, persistence, completion, navigation and all 20 detail sheets at 320px in Chromium and WebKit.
