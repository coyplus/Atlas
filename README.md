# HSBC Atlas

Making banking a relationship again. Building better customers builds a better bank.

Live prototype: https://hsbc-atlas-concept.vercel.app

This repository is the working source for the prototype. Vercel builds and publishes pushes to `main`; other branches receive preview deployments.

## Open the experience

```sh
npm ci
npm run dev
```

Open **http://localhost:4173**. For the production build, offline cache and phone review:

```sh
npm run build
npm run preview -- --port 4174
```

Open **http://localhost:4174/?p=jordan**. On this Mac, `Start Atlas.command` runs the production preview. On a phone, use the computer's network address while both devices are on the same Wi-Fi. The current QR and instructions are in [the review guide](docs/REVIEW-GUIDE.md). The public prototype is at https://hsbc-atlas-concept.vercel.app.

On mobile, choose a scenario at the welcome screen or tap the current name in the header to switch. Tap the HSBC logo for art direction, optional haptics, reset and workbench access. Desktop keeps the presentation frame; touch devices use the full viewport. Reload preserves local demo edits where IndexedDB is available; **Reset** restores the selected scenario.

## What moved

- All four personas, three tabs and three art directions.
- Numbers, Accounts & Pots, shared members, connected-bank examples, Agreements, manual fulfilment, automation and recovery.
- AI/human conversation, contextual support, Now thinking state and independent recap playback.
- Quick Actions customisation, journeys, follow-up sheets, products, rewards, stories and Future projections.
- Live component workbench and support blueprint, using the same feature source.

This is a **fidelity-first migration**, not a claim that every legacy view has been rewritten into TypeScript. The application shell and platform services are React/TypeScript. Existing feature templates and tested domain functions are isolated ES modules; a React renderer reconciles their output. This compatibility boundary is documented in [the architecture](docs/ARCHITECTURE.md). No old HTML is loaded in an iframe.

## Work on the prototype

| Area | Source |
|---|---|
| Customer facts, scenarios and catalogues | `data/moments/`, `data/shared/` |
| Money, containers, Agreements and Number derivation | `src/domain/` |
| Feature views and commands | `src/features/` |
| Shared card/button/icon templates and visual tokens | `src/design-system/` |
| Application orchestration and presentation API | `src/app/` |
| Persistence, browser history, viewport, PWA and haptics | `src/platform/` |
| Fonts, images, logos, audio and attribution | `assets/` |
| Functional specifications and migration decisions | `docs/` |

`data/` is now the source of truth for this application. The earlier `../Scenarios/` folder belongs to the frozen reference. Build output and `public/assets/` are generated; edit source assets instead. The app can build without the original prototype directory.

## Check a change

```sh
npm run verify             # types, imports, scenario reconciliation, behaviour tests, build
npx playwright install chromium webkit   # first browser test run
npm run test:production    # starts or reuses production preview on port 4174
```

The browser suite covers both engines. Service worker offline/update checks run in Chromium; actual installed Safari offline behaviour is a physical-device review item. See [verification](docs/MIGRATION-REVIEW.md) for evidence and limits.

Node 22.12+ and Python 3 are required; `.nvmrc` records the tested Node version. Dependencies are pinned and `npm ci` uses the lockfile. See [the workflow](docs/DEVELOPMENT-WORKFLOW.md), [architecture](docs/ARCHITECTURE.md) and [deployment guide](docs/DEPLOYMENT.md).

## Publish changes

```sh
npm run verify
git add <changed-files>
git commit -m "Describe the update"
git push origin main
```

Vercel automatically builds the pushed commit and updates the same public URL after
a successful build. Saving a local file alone does not publish it. The GitHub Actions
workflow runs the full verification and browser suite independently.

See [deployment details](docs/VERCEL-DEPLOYMENT.md). Large visual review archives
remain in the local project and packaged handover; they are excluded from Git.
