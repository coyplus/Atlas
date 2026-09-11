import { test, expect } from '@playwright/test';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
test('an available release waits for consent, then saves and restarts', async ({
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
      if (pathname === '/sw.js' && revision === 2)
        content = Buffer.from(
          content.toString().replace(/atlas-([a-z0-9]+)/, 'atlas-$1-updatecheck'),
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
      await navigator.serviceWorker.ready;
    });
    await page.evaluate(() => window.atlas.dispatch('remove:container-ac-cc'));
    revision = 2;
    await page.evaluate(async () => {
      await (await navigator.serviceWorker.getRegistration())!.update();
    });
    await expect(page.locator('.update-notice')).toBeVisible();
    await expect(page.locator('#content [data-module=container-ac-cc]')).toHaveCount(0);
    await page.locator('.update-notice button').first().click();
    await expect(page.locator('.update-notice')).toHaveCount(0);
    await expect(page.locator('.now-page')).toBeVisible();
    await expect(page.locator('#content [data-module=container-ac-cc]')).toHaveCount(0);
  } finally {
    await new Promise<void>((r) => server.close(() => r()));
  }
});
