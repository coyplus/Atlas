# Atlas scenario database — the single source of truth for the four moments

*Created 8 Sep 2026 from the prototype's own data (v1.9), enriched to a coherent financial picture per customer, and cross-checked. Purpose: any Now, Future, You, Pots, Stories, What Ifs, AI chat or deck built by any colleague or agent uses **this** data, not a slightly different invention of it.*

## The three layers
```
Level 1  moments/<m>/l1.json   What HSBC knows      — customer, household, accounts, pots, rules, income, bills, ledger, spending, credit, wealth, net worth, goals, rewards, relationship, behaviour, autonomy
Level 2  moments/<m>/l2.json   What Atlas understands and generates — signals → insights, personality, beliefs, companion messages, stories, What Ifs, projections, actions, recommendations, opportunities, risks
Front end                      What the customer sees — the prototype (Prototype/index.html) and the deck render from the same figures
```
Every Level-2 item carries `basis[]`: references such as `l1:transactions/tx-jordan-003` or `l2:signals/sig-eating-out`. If Atlas recommends something, follow the basis to the customer data that caused it. `validate.py` checks that every reference resolves.

## Folders
- `shared/` — moments, cast, products, rule and What-If types, doctrine, banned words, the module catalogue (front-end vocabulary).
- `moments/m1-alex … m4-elena/` — one folder per moment; `l1.json` and `l2.json`.
- `schema/schema.md` (plain English) and `schema/schema.json` (draft-07 JSON Schema).
- `validate.py` — the cross-check; writes `CROSS-CHECK.md`. Run it after any edit: `python3 Scenarios/validate.py`.
- `queries.md` — the questions Coy listed, answered as paths into the data.

## What "coherent" means here (and is checked)
Opening balance + every transaction = today's balance, for every account and pot · Safe to spend = balance − what is set aside, to the penny · essentials, subscriptions and groceries sum to the figures the prototype shows · net worth = held − owed and equals the prototype engine's number · money speed = Σ scheduled rules · Points ledgers sum to the balance · cashback = rate × card spending · every rule points at a pot and every pot's members are in the household · every What If's effect targets a real pot · every story's action runs a real What If or pins a real module · projections recompute from the engine formula to the same month.

## Design decision — four people, not one person four times
The pack rules that the four moments are **life stages mapped to segments** (`Data/04` §5.4), each with a representative customer: Alex (Join) · Jordan (Stabilise) · Sam (Grow) · Elena (Graduate). The schema is identical across moments and each snapshot carries its own history (rule `since` dates, milestones, the ledger window) and its own computed future, so "what changed" is answerable *within* a customer and any two snapshots of the same customer diff cleanly. If Coy prefers one person moving through four moments, the schema already supports it: add `moments/m2-alex` etc. with the same `customer.id` and let the diffs tell the story. That is a content decision, not a schema change.

## How to use it
- **Build a screen:** read `l1` for the numbers, `l2` for what the AI says and offers; never invent a figure that is not in `l1` or derivable from it by the formulas in `schema.md`.
- **Add a scenario element:** add the L1 fact first, then the L2 item with its `basis[]`, then run `validate.py`.
- **Change a number:** change it in `l1`, re-run the validator, and fix whatever it reports — the prototype's data parts (`Prototype/src/40–49`) should then be updated to match (they are the front end, not the source of truth from here on).
- **Regenerate from the prototype:** `node Scenarios/tools/dump_prototype_data.js` (dumps the prototype's data parts to `tools/proto-data.json`) then `python3 Scenarios/tools/build_from_prototype.py` rebuilds this database; then `python3 Scenarios/validate.py`. Useful until the prototype is switched to read from here. Note: the authored enrichment (income, bills, ledger, behaviour) lives inside the build script.

## Provenance and honesty
Figures, copy, pots, rules, What Ifs, stories, personality and companion messages come from the prototype v1.9 (`Data/artifacts/atlas-hifi-v1-9.html`). Income, bills, transactions, behaviour, engagement, relationship history and products-held were **authored** to reconcile with those figures — they are demo data, not research, and are marked where an assumption had to be made (see `CROSS-CHECK.md` → Known inconsistencies).
