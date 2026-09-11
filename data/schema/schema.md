# Scenario schema — plain English

*One schema, four moments. Level 1 is what HSBC knows; Level 2 is what Atlas understands and generates; the front end is what the customer sees. Every Level-2 item carries a `basis[]` of references back to Level 1 (`l1:<collection>/<id>`) or to other Level-2 items (`l2:<collection>/<id>`). `schema.json` is the machine-readable form; `validate.py` enforces the arithmetic and the references.*

## Shared (`shared/`)
| File | Holds |
|---|---|
| `moments.json` | The four moments: id, name, stage, the representative customer, the as-of date, tenure, segment |
| `cast.json` | HSBC people (Priya, Maya, the 24/7 human) and the AI's naming rule |
| `products.json` | The product catalogue every moment draws on (current accounts, cards, pots, committed plans, portfolio, Points, cashback, Premier) with the doctrine each carries |
| `rules.json` | Rule types, What-If types, the doctrine list, and the words banned from customer copy |
| `modules.json` | Front-end vocabulary: the module catalogue with sizes, New Plan intents and recommendations, benefits, tiers, the quiz |

## Level 1 — `moments/<m>/l1.json` (what HSBC knows)
| Collection | What it is | Key fields |
|---|---|---|
| `moment`, `asOf` | The snapshot's identity and date | |
| `customer` | The person: age, occupation, employer, city, joined, tenure, segment, tier, Relationship Manager | `id` is the persona key used everywhere (alex · jordan · sam · elena) |
| `household` | Members with relation, what each can see, the consent model | member ids are referenced by pots' `members[]` |
| `productsHeld` | Which catalogue products this customer holds, since when | refs `products.json` |
| `accounts` | Traditional accounts: current (balance) and credit (owed, limit, paid-in-full, monthly interest) | never bubble in Future (total · chosen · earned) |
| `pots` | The single container: kind (saving · goal · committed-plan · loan · investment · shared), balance, target, monthly rate, growth, whether it stops at target, members, rules, terms | `isDebt` pots shrink; `stopsAtTarget` pots end their rule |
| `rules` | Standing rules that move money: type, amount, source, since, active, stopsAt / condition | a "commitment" in front-end language is an active rule |
| `income` | Sources, net monthly, payday | |
| `bills` | Regular commitments: amount, day, method, category | |
| `transactions` | The ledger for the window before `asOf`: date, ledger (account or pot), counterparty, category, amount, rule or member that caused it, receipt flag | `ledgerOpeningBalances` are derived so opening + Σ = balance |
| `spending` | Month-to-date by category, comparisons, merchant classes | |
| `credit` | Score status (soft checks only), debts with balance, payment, interest | |
| `savingsAndInvestments` | Cash · in pots · invested · floor-protected share · illustrated growth | |
| `netWorth` | Held − owed = net, and the prototype engine's figure for the same | |
| `moneySpeed` | Σ active scheduled rules per month | |
| `goals` | What the customer is trying to achieve, in their words, linked to pots where one exists | |
| `rewards` | HSBC Points balance with a ledger that sums; cashback as a card fact; active benefits | |
| `relationship` | Joined, tenure, tier, Relationship Manager, experts, milestones (dated, with badges), contact history | |
| `behaviour` | Financial patterns in plain words; app engagement (sessions, features, quiz, check-ins, notifications) | |
| `autonomy` | What the AI may do, in words; limits; paused | |

## Level 2 — `moments/<m>/l2.json` (what Atlas understands and generates)
| Collection | What it is | Traceability |
|---|---|---|
| `signals` | Detected facts or changes that trigger everything else: kind, description, `basis[]` into L1, detected date | the root of every trace |
| `insights` | Sentences the AI can say about a pot, an account or a working | `basis[]` → L1 + signals |
| `personality` | Name, copy, traits, provenance, status; per-member personalities for a household | `basis[]` |
| `beliefs` | What the AI believes with evidence, confidence in words, status (open · confirmed · corrected, dated) | `basis[]` |
| `companion.contexts` | The one message per context (now · future · you · sections · human takeover) with its actions | `basis[]` → signals |
| `companion.conversation` | Reply chips and authored answers, always including "A person, please" | |
| `stories` | Claim → working (rows, chart flag) → action (verb, residue, the What If or pin it runs), state, trigger | `basis[]` → signals |
| `whatIfs` | Type (create · attach · redirect · cap · illustration · rehearsal), title, summary, explainer, **effect** (the exact change to pots/rules), graph spec, canCommit | `basis[]` → signals; effect → L1 pots |
| `projections` | Per pot: milestone month, reach date, value at 0/12/60/120 months; rule ends (what stops and what the AI asks); net worth at 0/12/24/60/120 | recomputed by `validate.py` from the engine formula |
| `nextBestActions` | Every action the AI offers, by context | `basis[]` |
| `recommendations` | Module suggestions with a *why* | `basis[]` |
| `opportunities`, `risks` | Named, with severity, tracing to signals | `basis[]` |
| `householdInsights` | Household-level readings | `basis[]` |
| `rewardsExplanation` | How Points and cashback are explained | |

## Reference syntax
`l1:pots/ef` · `l1:transactions/tx-jordan-003` · `l1:accounts/ac-cc` · `l1:household/members/leo` · `l1:spending/comparisons/groceries` · `l2:signals/sig-eating-out`. A path may point at a collection item (by `id`) or at a nested field.

## Time
Each moment is a snapshot at `asOf` with history inside it (rule `since` dates, milestones, the ledger window) and a future computed from it (projections). Across moments the schema is identical, so "what changed" between two snapshots of the *same* customer is a diff of two L1 documents; the four shipped customers are different people (Data/04 §5.4). See README → Design decision.
