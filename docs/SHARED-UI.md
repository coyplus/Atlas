# Shared interface treatments

## Add a number

The button recalculates placement from the current two-column Number layout whenever Numbers are added, removed, reordered or resized. It occupies the first unfilled half-width slot, matching the row height of its neighbour. Wide and tall widgets are included in this calculation; existing Numbers keep their order. If no slot is available (including an empty collection), it appears below the grid at the same width and height as All accounts and pots. Both sizes retain the identical dashed outline, transparent background, centred plus icon and label; the wide version has no chevron. Both placements open the same gallery.

When filling a slot, Vanilla uses a 1.5px dashed outline mixed from the foreground and surface tokens, with foreground-coloured text and icon. This makes the empty slot legible beside filled Number cards without making it a primary action. Premier inherits the same contrast relationship.

## Detail headers

Vanilla level-two detail and journey screens share a transparent header over the scrolling content. A translucent canvas tint, 16px backdrop blur and a feathered lower edge keep the title readable without an opaque divider. The scroll surface extends behind the header; its initial padding keeps the first content below the fixed title and contextual AI card. Journeys reserve only the title clearance. Stories, conversations and secondary bottom sheets retain their own header layouts. Reduced transparency falls back to the canvas surface.

## Status chips

`statusChip()` in `src/design-system/templates.mjs` is the shared non-interactive status component. `status.css` supplies its tokens and geometry. Use a short status, optionally with a 14px icon, in a compact rounded chip. Text and icon carry meaning independently of colour.

- Neutral: current, on track, running, selected and fulfilled conditions.
- Pending: paused, planned, a choice or a payment still to make.
- Attention: benefit changed or needs attention. Use a restrained red tint, with a lighter foreground in Premier.

The same component appears on the compact How it works card, its overview sheet, condition rows, agreement status and Money Rules. Do not add chips to the deliberately minimal Number widgets by default.

## Settings

The global header uses a 44px settings button with the vendored Google Material Settings icon. It opens existing controls for Money Rules, automation permissions, accounts and connections, and activity. Child screens return to Settings; browser Back and Forward support the entry. The You tab continues to hold the personal profile experience. No new financial preferences or non-functional switches are introduced.

## Editing My numbers

Tap Customise or hold any Number for 500ms to enter the same edit mode. Movement beyond 8px before the hold completes cancels it so ordinary touch scrolling wins. Edit mode uses a subtle alternating wiggle, black circular close controls and compact Resize controls; Done restores normal widget navigation. Reduced motion retains the controls without the wiggle or reflow animation.

`features/now/editor.mjs` owns pointer dragging for Vanilla and Premier. The lifted widget follows the pointer while other cards animate into their preview positions. The shared two-column layout model includes wide and tall Numbers. Dragging near the scroll surface's edges scrolls the grid. Only releasing a changed arrangement creates a reorder transaction; Escape, a cancelled pointer, leaving the page or a screen change removes the preview without saving it. The React-owned DOM order stays unchanged during preview, preventing reconciliation problems. The committed order uses the existing session persistence and Undo history.

While editing, tapping a Number does not open its detail. Keyboard users can focus a Number and use arrow keys to move it; a live region announces its new position. Remove and Resize remain separately named buttons. Automated browser coverage includes live movement before release, persistence, cancellation, keyboard movement, edge scrolling, gallery placement and device-protocol touch scroll/hold/drag.

### Number discovery and visual continuity

The Add a number entry keeps its dashed, neutral treatment in both grid states. In a vacant tile it stacks its contents; when it occupies the full row its plus and label sit on one line. A small AI badge counts unviewed, eligible suggestions. Opening the gallery records those ideas as seen for that scenario, independently of financial transactions. Newly eligible suggestions can surface later; pinned suggestions leave the list.

The gallery leads with up to three suggestions attributed to HSBC AI. Each has a concise reason, the actual `moduleCard` preview, Square / Wide / Tall / Full selection and a direct Add action. Size changes are local previews until Add; they do not change existing widgets. Browsing the complete catalogue and existing account/pot previews remains available below.

The reference `Shared assets/HSBC Atlas Prototype_6.html` informed safety-net coverage, credit-limit use, spending patterns and investment composition. New catalogue entries include Eating out, Credit used and Grocery rhythm. Suggestions are deterministic, persona-specific demo insights, not a live model service. No unrecorded investment returns, merchant history, credit scores or readiness scores are fabricated.

`domain/number-visuals.mjs` creates evidence-backed visual models; `design-system/number-visual.mjs` renders the same model in tiles, previews and expanded Number details:

- Spending: cumulative recorded purchases against actual dates, with refunds and credit-account signs respected.
- Credit used: balance / limit gauge, recalculated after repayment.
- Safety net: days of essential bills covered, in 30-day blocks on a 180-day scale (a scale, not a customer-agreed target).
- Grocery rhythm: completed months within the recorded grocery line; no inferred history where unavailable.
- Wealth / investments / spending mix: proportional rings with the same labelled breakdown in detail.
- Safe to spend / recurring bills: proportional allocation strips.

Square widgets retain only the number, short qualifier and a small visual without extra legends. Wide adds compact visual context; Tall allows more space; Full includes supporting evidence rows. Existing pot target and budget-spent progress remain grounded in their container models. All surfaces remain neutral, including Premier. Charts have accessible summaries; unavailable data remains an explicit learning/empty state.

Verification: domain reconciliation, repayment/refund behaviour, persona-scoped seen state, all preview sizes at 360px, direct add → Now → detail continuity, and existing removal, drag, long-press and adaptive grid flows are covered by tests.
