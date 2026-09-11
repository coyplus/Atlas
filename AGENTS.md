# HSBC Atlas working project

This directory is the source repository for https://github.com/coyplus/Atlas.
The live prototype is https://hsbc-atlas-concept.vercel.app.

## Publishing workflow

The user has requested that future completed prototype updates are kept in sync
with the online version. After implementing and verifying an authorised update,
commit the relevant source changes and push to `origin main`, unless the user asks
to keep that work local or in a preview branch. Confirm the matching Vercel
production deployment succeeds before reporting the change live. Pushes to other
branches create preview deployments. Do not force-push or include unrelated work.

On 11 September 2026 the user explicitly confirmed publishing the latest version
and automatically publishing each future completed iteration. This includes the
prototype source, fictional demo scenarios, assets, documentation and tests in
the public `coyplus/Atlas` repository. Do not ask for publication approval again
for ordinary authorised prototype iterations. Keep a clear commit message for
each iteration; no pull request, release tag or manual promotion is required.
Use relevant checks rather than imposing a full release ceremony on small edits.

Use the Git integration, not the historical `deliveries/vercel-hsbc-atlas-concept`
staging copy. Local edits alone do not publish. Do not introduce a file watcher
that publishes incomplete edits.

## Build and scope

- Source: `src/`, `data/`, `assets/`. Build: `npm run build`; output: `dist/`.
- Node version: `.nvmrc`; Python 3 is needed by the data preparation scripts.
- Run checks appropriate to the change. `npm run verify` is the full local gate;
  browser checks use `ATLAS_TEST_URL` and Playwright.
- Preserve the established design language and fictional scenario arithmetic.
- Never commit credentials, `.vercel/`, dependency caches or build output.
- Large visual review archives stay locally under `docs/screenshots/` and in the
  packaged handover; they are intentionally excluded from Git.
