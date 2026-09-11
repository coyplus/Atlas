# Delivery and phone access

The prototype is live at https://hsbc-atlas-concept.vercel.app. GitHub repository `coyplus/Atlas` is the source; pushes to `main` deploy automatically through Vercel. See [the active deployment workflow](VERCEL-DEPLOYMENT.md).

## Local review

Run `npm ci`, `npm run build`, then `npm run preview -- --port 4174`. The terminal prints the network URL. Both devices must be on the same network, and the Mac must remain awake and reachable. Generate a new local QR after an IP change:

```sh
npm run qr -- 'http://YOUR-MAC-IP:4174/?p=jordan&theme=vanilla'
```

A LAN HTTP link supports the live demo but is not equivalent to an installed HTTPS PWA. The service worker is available on localhost for development; use an HTTPS deployment to review install/offline behaviour on a phone.

## Hosted release

The app is a static Vite application. The GitHub repository is rooted at the local `atlas-app/` directory. Configure the Vercel root as the repository root, install with `npm ci`, build with `npm run build`, and publish `dist/`. `vercel.json` defines Vercel routes/headers; `public/_redirects` provides the equivalent SPA routes for compatible static hosts. No secret, database or environment variable is required.

Use a dedicated HTTPS preview hostname and a stable review URL. `/app/*`, `/workbench.html`, `/support-blueprint.html`, `/bento.html` and `/metro.html` must return the app shell. Serve `/sw.js` without long-lived caching. Keep each built release intact so its hashed chunks remain available to open sessions. Host `dist/` only, not `node_modules`, source maps from a private source tree or the parent workspace. The build contains source maps for debugging; remove them before publishing if the review host should not expose source.

After deployment, check one persona, one manual-payment recovery, the full-screen conversation, the workbench, refresh on a deep link, and the update prompt. Generate the stakeholder QR from the **verified deployed URL**:

```sh
npm run qr -- 'https://YOUR-HOST/?p=jordan&theme=vanilla'
```

The cache is versioned per build. Updates wait for Save & restart and preserve the local session when the scenario version is unchanged. Scenario changes intentionally invalidate incompatible snapshots. Rollback means redeploying the previous complete build; verify offline reload after its worker becomes active.

## Device acceptance

Review on a real iPhone and Android phone: install/Add to Home Screen, safe areas, keyboard, back gestures, audio interruptions, reduced motion and offline relaunch. Browser-emulated WebKit is useful for layout and interactions, but is not a substitute for installed Safari testing. Playwright's [service worker automation is Chromium-only](https://playwright.dev/docs/service-workers), so offline/update checks are deliberately not claimed as verified on physical iOS.

Haptic feedback uses optional browser vibration where available. Consistent native haptics, native gesture navigation and app-store distribution require a native container and separate device validation; those packages are not part of this migration.
