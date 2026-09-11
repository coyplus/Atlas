# Future in Atlas

Future is one continuous experience over the existing Pots, balances and Money
Rules. There is no View/Sandbox switch. The unmodified path appears first; choosing
What If ideas layer experiments over it. Collapsing the drawer does not clear or
hide selected experiments. There is no Reset button; each selected idea can be
unticked without changing the selected date.

## Canvas and drawer

The full-screen canvas sits beneath shared Atlas chrome, contextual AI and glossy
floating controls. + Goal is the single main goal-creation entry. Pinch/trackpad
and keyboard +/− zoom between 0.4× and 32×; drag pans; Fit/Home restores the view.
Visible +/− zoom buttons have been removed. Circle area represents money, with a
dotted target on the same scale. Fixed-size labels appear when the solid circle
has room. Purpose-based colours and personal choices identify Pots; Reached labels
mark completed goals. Soft grey possibilities always use a plus icon, while actual
Pots retain their own icons. Bubble taps open the actual Pot detail; uncommitted goals open review.

The non-modal drawer has three positions: docked, timeline and expanded. Docked
leaves a shallow glossy drawer lip and handle visible to maximise the canvas while keeping the drawer discoverable. The default timeline position
shows Time Travel and a What If preview; legacy compact states migrate to it. Drag its handle,
tap it or use Up/Down and Home/End. Hidden content is inert. Expanded content scrolls
independently; Escape returns to the timeline. The date sits above a large age,
with projected net worth alongside. The capsule Time Travel control fills as time
advances, has a tactile thumb, and remains month-precise. The fill follows the thumb's
right edge, keeping a minimum 38px circle and consistent capsule ends. Switching
scenarios resets the native thumb, date, projections, fill and animation together.
White timeline dots keep the track light. Horizontal starlight
is clipped inside the fill; its speed responds to distance and input velocity and
is disabled for reduced motion. Expanded Fit and + Goal buttons share one baseline. Milestone icons provide
exact-date destinations and move as experiments change achievement dates. There are
no separate Today/+10/+20 shortcuts. Circle and colour explanations live in the
projection detail instead of floating over the canvas.

Raising the drawer shifts attention to the timeline, What If cards and commitments.
The shared AI responds to this focus and to selected ideas. The expanded drawer
shows original and experimental Money Speed and Rule counts, then review when
there are changes. Cards use readable action-and-effect copy; the full Rule mechanics
stay in review. Selected ideas use violet, leaving green for completed goals. The
standalone Goals & priorities and Explore with AI buttons are removed; custom ideas
remain available through the shared Companion. “Review before applying” carries the
preview reassurance without a separate footnote. No real changes happen
until the customer reviews and explicitly approves.

## What If and shared data

Ideas are locally composed for the prototype, with a simulated conversation for
extra saving and pauses. Examples include a £50 payday Savings Rule, a round-up
Smart Rule (illustrative £20/month, capped at £30), reprioritisation and a six-month
pause. Round-up estimates are explicitly labelled, are not guaranteed, and depend
on spending. A persona with active round-ups is not offered another such rule.

Preview and approval invoke the same mutations. Preview uses a cloned person;
approval updates existing Pots/Rules via the shared transaction, receipt and Undo
system. The round-up Rule retains its type, monthly cap and average flag. Paused
contributions stay in cash and resume on schedule. Reprioritisation conserves the
monthly total. Protected commitments cannot be paused or used as funding sources.
Retiring a goal keeps its Pot, balance and history and stops its future rules.

One monthly ledger drives projected balances, milestone dates, cash and the next
month’s allocations at the selected date. Funding released by target stops or loan
repayment remains in cash unless redirected. Rule caps, Rule-specific targets,
funding sources and scheduled pauses are honoured. Pot-sourced Rules transfer
existing balances; current-account Rules assume future income funds the allocation.
Candidate cards apply the actual selection/conflict logic to combined ideas. Selected
cards show combined outcomes against the original plan; priority cards expose both
the receiving goal and the delayed donor goal. Money Speed and its detail rows use
the same projected allocation data. Conditional Rules assume their conditions hold.

A bounded prepared-scenario cache reuses full projection paths while Time Travel
scrubs between months. Changed financial data or ideas invalidate it; preview data
returned to callers is detached. The expanded-drawer calculation workload (including
candidate ideas and AI context) measured about 5–6ms per update on the local runtime.

Drafts live in the existing per-person `ui.future` session. The legacy mode action
remains an adapter for older presentation scripts; it no longer gates projections.
There is no separate financial store and no real bank or AI-service connection.

## Projection limits and verification

Investment bounds illustrate −2% and +8% annual scenarios alongside the existing
central assumption; they are not probability estimates. Inflation, tax, fees,
product interest and future earnings/spending changes are omitted. Contributions
assume future income can fund them. A reached target remains saved until spent.

Domain tests cover proportional areas, collision spacing, baseline reconciliation,
combined Rule previews, round-up caps, approval equivalence, pauses, redirection,
protected commitments and Undo. Mobile tests cover the unified flow, actual Pot
details, drawer snaps, fixed typography, keyboard/pinch zoom, timeline interaction,
Rule-count previews and shared navigation ownership. Real multi-touch injection is
run in Chromium; WebKit covers the remaining mobile interactions.
