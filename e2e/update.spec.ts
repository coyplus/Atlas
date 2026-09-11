import { test, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
test('old offline caches are retired without repeatedly reloading the app', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Playwright service worker automation is Chromium-only.');
  let revision = 1;
  const server = createServer(async (req, res) => {
    try {
      const pathname = new URL(req.url!, 'http://localhost').pathname;
      const file = resolve('dist', '.' + (pathname === '/' ? '/index.html' : pathname));
      if (!file.startsWith(resolve('dist') + '/')) {
        res.writeHead(404).end();
        return;
      }
      let content = await readFile(file);
      if (pathname === '/sw.js' && revision === 1)
        content = Buffer.from(
          "self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));",
        );
      const types: Record<string, string> = {
        '.js': 'text/javascript',
        '.html': 'text/html',
        '.css': 'text/css',
        '.json': 'application/json',
        '.svg': 'image/svg+xml',
        '.woff2': 'font/woff2',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.mp3': 'audio/mpeg',
      };
      res.writeHead(200, {
        'Content-Type': types[extname(file)] || 'text/plain',
        'Cache-Control': 'no-store',
      });
      res.end(content);
    } catch {
      res.writeHead(404).end();
    }
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  try {
    const address = server.address() as { port: number };
    await page.goto(`http://127.0.0.1:${address.port}/?p=jordan`);
    await page.locator('.welcome-scenarios [data-scenario="jordan"]').click();
    await expect(page.locator('.now-page')).toBeVisible();
    await page.evaluate(async () => {
      await caches.open('atlas-old-test');
      await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
    });
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    revision = 2;
    await page.evaluate(async () => {
      await (await navigator.serviceWorker.getRegistration())!.update();
    });
    await expect
      .poll(() =>
        page.evaluate(
          async () => (await caches.keys()).filter((k) => k.startsWith('atlas-')).length,
        ),
      )
      .toBe(0);
    await expect
      .poll(() =>
        page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length),
      )
      .toBe(0);
    await expect(page.locator('.now-page')).toBeVisible();
    await page.reload();
    await expect(page.locator('.now-page')).toBeVisible();
    expect(
      await page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length),
    ).toBe(0);
  } finally {
    await new Promise<void>((r) => server.close(() => r()));
  }
});
