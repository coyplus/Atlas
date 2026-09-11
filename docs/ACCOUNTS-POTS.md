# Accounts & pots — Vanilla specification

9 September 2026. Source: `app/accounts-system.mjs`. Uses existing Vanilla colours, typography, surfaces, Material Symbols and support behavior.

## Entry and hierarchy

Now: Quick Actions → My numbers / Customise → complete Number grid → **All accounts and pots · X** → My stories → All HSBC products. The count is the number of actual HSBC accounts plus pots plus connected external accounts, never the number of pinned Number widgets. Creating a pot, connecting selected accounts or disconnecting a bank updates it.

Accounts & pots is a full-screen reading detail with its own fixed header and a compact contextual AI card. Content: held/owed/net overview, HSBC accounts, pots with monthly contributions and target progress, other-bank accounts, and Connect another bank. Empty pots offer a first-plan action. Debt is labelled to repay; it is not counted as money held. Reading a holding returns to the preserved collection on Back.

## Open Banking recommendation

Before a connection, AI explains that seeing money held elsewhere enables a more complete financial picture and more useful insights and support. The compact card has the same tap-to-conversation behavior as other reading details; the conversation exposes the full copy and connection CTA. A clear Connect another bank button within the Other banks section provides an independent entry.

After a connection, AI acknowledges the included external amount and offers to explain the combined picture. The summary shows combined held and net amounts with the outside-bank contribution clearly labelled. Accounts carry bank name, account label, masked identifier and “Connected · sample”.

## Local demonstration journey

1. Choose Monzo, Starling Bank or NatWest from a local sample-bank picker. Already connected banks are disabled.
2. Review and select individual sample accounts. No accounts are selected by default. Shared data is explicitly limited to account details and balances, with read-only access and no money movement.
3. Confirm selected accounts. An empty selection produces inline validation. Back cancels without adding a connection. AI header help preserves selections and screen position.
4. Return to Accounts & pots with the new balances, updated count and confirmation. Open a connected account to inspect its information, discuss the combined picture or disconnect its bank.
5. Disconnect confirms that all selected accounts from that bank will disappear from the overview. Undo restores the previous connection. Reset restores the original scenario.

No credentials, redirects, network requests or real Open Banking authorisations are involved. All external balances are labelled sample data. This flow demonstrates consent and the connected experience; it does not claim that an institution’s live consent process works this way.

## Data boundaries

`ui.connectedBanks` stores only the selected sample accounts. Collection totals add their balances exactly once to HSBC totals; connected accounts have no payment or transfer actions. Existing Number modules, safe-to-spend calculations, Future projections, HSBC ledger entries and rules remain based on the supplied scenario data. The combined AI explanation states that distinction. Disconnect removes accounts from the live overview; earlier conversation messages remain historical.

## Review cases

Light and Premier layouts; a customer with no pots; savings and debt rows; contextual AI connection CTA; selected versus unselected sample accounts; missing-selection validation; cancellation; duplicate prevention; count and total reconciliation; account → Back; AI help → return to consent; disconnect and Undo; customer isolation and reset.

Verified 9 September 2026: all 63 automated checks pass, including selected-account consent, empty-selection validation, cancellation, count updates, unchanged HSBC balances, disconnect/Undo and collection return navigation. Browser review covered Sam’s overview and pot rows, the connection entry, bank selection and consent, the connected overview, and Premier styling. All generated prototypes, blueprint and decks pass freshness checks.

## Starting connections for Sam and Elena

Source: `data/shared/connected-accounts.json`. These are fictional sample balances, embedded with the scenario dataset and copied into each customer’s connection state on start/reset.

| Moment | Bank | Account nickname | Sample balance |
| --- | --- | --- | ---: |
| Sam | Monzo | Everyday spending | £845.60 |
| Sam | Starling | Weekend plans | £1,500.00 |
| Elena | NatWest | Household bills | £3,840.80 |
| Elena | NatWest | Cash reserve | £18,000.00 |
| Elena | Starling | Travel account | £1,260.25 |

Sam begins with 7 accounts and pots, £2,345.60 of external money, and £16,916.04 combined held. Elena begins with 9 accounts and pots, £23,101.05 of external money, £307,701.05 combined held, and £306,461.05 net. HSBC Number modules and projections retain their original scope. Alex and Jordan still demonstrate the unconnected entry state.

Disconnect/Undo remain available. Reset restores these starting connections; reconnecting a seeded bank uses that customer’s original sample balances and nicknames. The accounts list, bank picker, consent header and account detail use one shared bank-avatar renderer with locally bundled public identity assets. Source credits are in ASSET-CREDITS.md.

Seeded-account update verified: 64 automated checks pass. Browser review confirms Monzo and Starling avatars in Sam’s light view and NatWest/Starling avatars in Elena’s Premier view. Account totals, reset, reconnect and embedded logo sources are covered by the interface checks; generated files and presentation embeds are current.

## Container details and Numbers — 9 September 2026

The collection now leads into the [Pots & Accounts system](POTS-ACCOUNTS-SYSTEM.md): the supplied balance → actions → rules → activity hierarchy, five capability/ownership variations, personalised agreements, reviewed rule controls and pot evolution. Read-only external details follow the same section order. Every HSBC container and connected balance can be added from the Number gallery. Jordan’s new empty budget wallet changes the container count but adds no funds or scheduled contribution.
