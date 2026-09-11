# Prototype access

Vercel Routing Middleware protects every page, asset and data file. The password
page is generated on the server and never includes the password. Local Vite
preview remains available for development without the deployment gate.

`ATLAS_ACCESS_PASSWORD` and `ATLAS_ACCESS_SECRET` are sensitive Vercel environment
variables for production and preview, not client-side variables. Login issues a
signed, Secure, HttpOnly, SameSite cookie for seven days. Changing the password
and redeploying invalidates existing sessions. Missing configuration fails closed.

Home Screen display remains available, but offline content caching is retired.
The public `/sw.js` contains only cleanup instructions for old Atlas caches; it
contains no prototype content. Previously downloaded copies cannot be revoked
while a device stays offline. The public source repository and historical
Vercel deployments are separate from the current protected site.

Checks: `node --test tests/access.test.mjs`; verify anonymous page and asset
requests, incorrect password, successful login, deep links and cookie persistence
against a deployment. Ordinary Vite preview does not execute Vercel middleware.
