# Development workflow

1. **Define the behaviour.** Add or revise the relevant specification and identify the affected persona/Agreement state. Confirm whether a number is money held, debt, spending evidence or an insight.
2. **Change the source of truth.** Edit `data/` for facts and authored scenario content. Edit `src/domain/` for calculations and evidence. Keep conditions separate from automation.
3. **Implement in one feature boundary.** Views belong beside their feature; actions belong in the corresponding command handler. Reuse cards, icons, avatars, sheet ownership and tokens. Do not add another global click handler or bypass transaction/Undo helpers.
4. **Update the workbench.** Include the default, empty/paused, attention, confirmation and recovery states relevant to the change. Existing specimens use real components.
5. **Run targeted checks, then the release gate.** Domain changes need meaningful evidence/invariant tests. Interaction changes need browser checks. `npm run verify` is the full non-browser gate; `npm run test:production` runs against the built app.
6. **Review visually.** Check Alex/Jordan/Sam plus Elena's Premier theme at 390px and a narrow 320px viewport. Check keyboard, focus, long copy and scroll restoration. Screenshots belong in `docs/screenshots/`; keep the main screen compact.
7. **Publish an intentional release.** Commit the reviewed source and push to `main`. Vercel builds that commit and updates the public URL automatically; verify the deployment before reporting it live. Never mutate a demo's data in a service worker. Updated builds wait for the user to restart.

Generated test cases adapt the frozen behaviour contract to the migrated module paths. The only intentional assertion changes concern local asset URLs instead of base64 data URLs and preserving restored form values/scroll instead of requiring detached DOM identity. Test cases run in isolated React/JSDOM realms. New regression tests should go in `tests/platform.test.mjs`, a new non-generated test file (update `.gitignore`), or `e2e/`.

Migration scripts under `scripts/migration-archive/` are provenance, not routine build commands. Do not rerun them over the migrated source.

A GitHub Actions workflow is supplied at `.github/workflows/verify.yml` for a repository rooted at `atlas-app/`. It runs the local release gate and production browser suite, then uploads the browser evidence. It runs on pushes and pull requests in `coyplus/Atlas`.
