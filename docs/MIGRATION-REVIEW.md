# Migration review — 10 September 2026

## Outcome and scope

The entire interactive prototype is running from `atlas-app/`: four personas, three tabs, Vanilla/Bento/Metro, component workbench and support blueprint. The original prototype remains the reference; SHA-256 checks confirm **133 original source/asset files unchanged** (`reference-integrity.json`). Existing slide/presentation exports are preserved separately; they have not been republished or replaced.

The new app builds independently from its own `src/`, `data/` and `assets/`. The original exported HTML is not an iframe or runtime dependency. The migration includes a React/TypeScript shell, isolated domain and feature modules, versioned local persistence, browser navigation, responsive mobile shell, a PWA cache and update flow, and deployment configuration.

**Compatibility boundary:** existing view templates and domain functions remain ES modules. A shared React renderer reconciles those templates. The controller still coordinates some DOM-based interactions. This preserves the designed behaviours while allowing bounded component replacement; it is not a claim that every view is now authored JSX or every domain function is strictly typed. See [architecture](ARCHITECTURE.md).

## Verified evidence

| Gate | Result |
|---|---|
| Scenario/ledger reconciliation | **176 checks passed**, 0 failed (`data/CROSS-CHECK.md`) |
| Migrated behaviour and platform contracts | **92 passed**, 0 failed |
| TypeScript build checks | Passed |
| Unresolved bindings in migrated JavaScript | ESLint passed |
| Production bundle | Passed; hashed code/CSS, local media, manifest and service worker |
| Browser suite | **28 passed**, 0 failed; **2 intentionally skipped** service-worker cases in WebKit |
| Engines | Playwright Chromium and WebKit, phone profiles |
| Responsive coverage | 320px, standard phone widths, 844×390 landscape and 768×1024 tablet; desktop presentation reviewed separately |
| Reference integrity | 133 tracked reference source/asset hashes unchanged |

The WebKit skips are offline navigation and release activation. [Playwright documents service-worker automation as Chromium-only](https://playwright.dev/docs/service-workers). Both pass in Chromium. Installed Safari offline behaviour remains a real-device acceptance check, rather than an unverified pass.

Browser report: `reports/browser/index.html`. Visual evidence: `docs/screenshots/`. Tests are repeatable with `npm run verify` and `npm run test:production` against the production preview.

## Interaction cross-check

- All four customer stories and all three tabs/directions render without undefined values or runtime exceptions. Primary controls have accessible names.
- Alex's quiz, confirmation, points and Undo; question/draft preservation when asking AI for help.
- Jordan's What If, amount editing, reviewed transfers, credit repayment and Undo.
- Sam's investment acknowledgement and opening transfer; shared family pots and mixed photo/initial avatars.
- Elena's household selection, attributed human conversation, appointment and global automation permissions.
- Configurable Number sizes/order/removal; neutral Pot/Insight cards; monthly budget, spent amount and bottom-aligned progress.
- Now and pot More: edit, replace, remove, save, cancel and independent per-container preferences.
- All product/account catalogues, connected-bank consent, disconnect, reset and balance identity.
- Savings, spending, credit, investment and shared containers use the same underlying model.
- Agreements preserve manual/automated equivalence, consent to locking, merchant selection, review steps, fulfilment evidence and recovery dates. Completing Jordan's contribution does not restore September cashback prematurely.
- How it works, full terms and follow-up journeys preserve parent context, scroll and focus.
- AI Now thinking, scroll minimisation/top restoration, compact details, journey header help, full-screen conversation, human attribution and independent recap playback.
- Local preferences survive reload; Reset restores the seed. Unavailable storage leaves a usable demo.
- Browser Back/Forward and deep-link refresh operate on view metadata. Navigation history does not copy financial sessions or replay transfer confirmations.
- Chromium offline navigation loads the cached shell, data and portraits. Updates wait for explicit Save & restart and retain compatible local preferences.
- Keyboard navigation is contained in the demo menu and returns focus on close; software-keyboard viewport support and reduced-motion styles are present.

## Corrections made during review

1. Persona changes now remount the appropriate AI/audio controls even when React preserves the surrounding DOM.
2. Chat quick responses receive the complete action payload after command extraction.
3. Dialog restoration preserves actual form values, question state, scroll and focus without relying on detached-node identity.
4. Budget progress bars explicitly stretch across their flex container; the migration initially collapsed them to zero width.
5. Browser history stores small view descriptors and returns to matching parent views after a task closes. Deep-link paths track tab/persona changes so reload does not reopen a stale tab.
6. Mobile layouts use the full viewport, safe areas and coarse-pointer landscape treatment; browser chrome follows the active canvas colour.
7. Fonts, photographs, bank logos and audio use local cacheable files. Original full-resolution photography stays in source; the shipped web renditions reduce the complete offline cache to about 2.5 MB. Legacy edition URLs resolve to the correct direction.
8. Workbench/specification copy now explains saved local state and Reset, replacing obsolete reload-to-reset instructions.
9. Service-worker updates require an explicit restart; initial installation does not interrupt an active journey.

## Visual assessment

The existing design language, spacing, shared components and restrained Number surfaces have been preserved rather than redesigned during migration. Reviewed screenshots include each persona in Vanilla, Premier, conversation, the Agreement attention state, narrow cards, tablet and landscape. No new colour identifier was introduced for Pot versus Insight. The fixed mobile tab bar, compact AI overlay, bottom sheet and recap retain their established hierarchy.

The mobile version intentionally removes the simulated device frame/status bar. Desktop retains it for presenting. No pixel-difference claim is made against the old file-based export; the visual review uses the preserved styling, supplied references and migrated screenshots, alongside behavioural checks.

## Remaining acceptance items

- Real iPhone and Android: keyboard/safe areas, back gestures, audio interruptions and long-session behaviour.
- Installed HTTPS PWA, particularly Safari offline relaunch and updates. The current QR uses the local network preview.
- Actual haptics on supported hardware. Browser vibration is optional; a native package is not part of this build.
- Choose a hosting destination and verify its HTTPS URL before distributing a stakeholder QR. Nothing has been published.
- Continue replacing legacy template/controller boundaries with typed components as those features change. The current compatibility layer is deliberate and documented.

The prototype uses fictional/local services throughout; no live bank connections, real payments or hosted customer database were added.
