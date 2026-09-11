# GitHub and Vercel publishing

- Source repository: https://github.com/coyplus/Atlas
- Live prototype: https://hsbc-atlas-concept.vercel.app
- Vercel dashboard: https://vercel.com/coyplus-projects/hsbc-atlas-concept
- Project: `hsbc-atlas-concept` in `coyplus-projects`
- Local working repository: `HSBC Atlas/atlas-app`

## How updates reach the live site

1. Edit the app source, scenarios or assets locally.
2. Run the relevant checks (`npm run verify` for the full local gate).
3. Commit the finished change and push to `origin main`.
4. Vercel installs dependencies, builds that exact commit and publishes the result.
5. Check that the matching production deployment is Ready before sharing it.

```sh
git add <changed-files>
git commit -m "Describe the update"
git push origin main
```

The public address stays the same. Local saves and unpushed commits do not
publish. Feature branches receive Vercel preview deployments. GitHub Actions
runs verification and browser tests on pushes and pull requests, independently
of Vercel; a failing Actions run does not automatically block a Vercel build.

## Project configuration

The repository root corresponds to the local `atlas-app/` directory. Vercel uses
Node 24.x, `npm ci`, `npm run build`, and output directory `dist`. Python 3 prepares
local scenario data during the build. `vercel.json` preserves the SPA route
rewrites and cache headers. No runtime database, API key or deployment token in
GitHub Actions is required: the Vercel GitHub integration owns deployments.

The old static staging folder in `deliveries/vercel-hsbc-atlas-concept` is a
historical release snapshot. Do not publish future updates from that folder.
ZIP handovers are also snapshots, not the source of live updates.

## Browsers and saved demo state

Open tabs may offer Save & restart when a new build becomes available. That
refreshes the application while preserving compatible browser-local demo edits.
Repository source changes are shared; a visitor's simulated account actions and
saved settings remain local to their browser.

## Account

The project uses the existing Hobby workspace and included `vercel.app` address.
No subscription or paid service was added. Vercel's Hobby plan is restricted to
personal, non-commercial use; select an appropriate plan for commercial use.
