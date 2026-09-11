# Atlas migration workflow

Status: implementation and local review complete. Original `prototype/` preserved. Nothing published.

## Acceptance contract

All four personas, three tabs and three visual directions remain available. Preserve monetary calculations, ledger evidence, agreement recovery dates, manual/automatic equivalence, consent and review steps, account/pot types, shared access, connected-bank examples, configurable Numbers/actions, AI/human context and audio continuity. Preserve the workbench and support blueprint. No real financial services or hosted database is introduced.

## Completed work packages

- [x] **Inventory and freeze:** 133 reference file hashes, 138-command catalogue and original behavioural contracts.
- [x] **Modern build:** Vite, React/TypeScript shell, independent assets/scenarios, pinned dependencies and reproducible lockfile.
- [x] **Domain and feature separation:** isolated money/Agreement/container/Number models, nine command groups, shared component templates and an explicit React compatibility boundary. Every existing flow migrated.
- [x] **App services:** mobile viewport/safe areas, browser history/deep links, saved versioned sessions, media continuity, optional haptics and error recovery.
- [x] **PWA delivery:** local production build, manifest/icons, offline cache, explicit update policy, deployment configuration and QR tooling. Actual hosting is the next distribution step.
- [x] **Fidelity:** all directions, live workbench, blueprint, states and original scenario semantics retained; updated persistence/reset documentation.
- [x] **Verification:** reconciliation, domain/interface tests, Chromium/WebKit browser checks, screenshots, offline/reload/history/persistence/update checks and candid device-only limits.
- [x] **Handover:** architecture, development workflow, deployment guide, review route, screenshots and verification report.

## Review gates

A. Build/imports valid — passed. B. Migrated behaviour tests — passed. C. Browser screens without runtime errors — passed. D. Routing, persistence and Chromium PWA checks — passed. E. Mobile/theme visual review and identified fixes — complete. F. Device-only and native-package limits — recorded for joint review.

## Implementation discipline

One application and domain model. Existing behaviour moved before rewritten. Compatibility boundaries are named: the app uses React reconciliation of existing feature templates, with some controller-based interactions, rather than claiming a full JSX/TypeScript rewrite. No iframe embedding. Current exports remain unchanged. Source scenarios are reviewable JSON within the new app.

See [the migration review](MIGRATION-REVIEW.md) for results and [the review guide](REVIEW-GUIDE.md) to start testing.
