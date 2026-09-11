import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
});
async function openChooser(page: import('@playwright/test').Page) {
  await page.goto('/?p=sam&tab=now&theme=vanilla');
  await page.getByRole('button', { name: 'Switch scenario, currently Sam' }).click();
}
test('the chooser gives platform-specific instructions without changing the scenario', async ({
  page,
  browserName,
}) => {
  await openChooser(page);
  await page.getByRole('button', { name: 'Add to Home Screen', exact: true }).click();
  const guide = page.locator('#install-guide');
  await expect(guide).toBeVisible();
  await expect(guide).toContainText(browserName === 'webkit' ? 'Open as Web App' : 'Install app');
  await page.screenshot({ path: `reports/install-${browserName}.png`, fullPage: true });
  await page.getByRole('button', { name: 'Got it', exact: true }).click();
  await expect(guide).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Add to Home Screen', exact: true })).toBeFocused();
  await page.locator('.welcome-scenarios [data-scenario="sam"]').click();
  await expect(page.locator('.now-page')).toBeVisible();
});
test('native installation is visitor-triggered, single-use, and hides after installation', async ({
  page,
}) => {
  await openChooser(page);
  await page.evaluate(() => {
    (window as any).installCalls = 0;
    const event = new Event('beforeinstallprompt', { cancelable: true });
    Object.assign(event, {
      prompt: async () => {
        (window as any).installCalls++;
      },
      userChoice: Promise.resolve({ outcome: 'dismissed' }),
    });
    window.dispatchEvent(event);
  });
  expect(await page.evaluate(() => (window as any).installCalls)).toBe(0);
  await page.getByRole('button', { name: 'Add to Home Screen', exact: true }).click();
  expect(await page.evaluate(() => (window as any).installCalls)).toBe(1);
  await expect(page.locator('#install-guide')).toHaveCount(0);
  await page.getByRole('button', { name: 'Add to Home Screen', exact: true }).click();
  await expect(page.locator('#install-guide')).toBeVisible();
  expect(await page.evaluate(() => (window as any).installCalls)).toBe(1);
  await page.evaluate(() => window.dispatchEvent(new Event('appinstalled')));
  await expect(page.locator('.welcome-install')).toHaveCount(0);
});
test('installed mode hides the entry and the manifest launches the front door', async ({
  page,
  request,
}) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'standalone', { value: true }));
  await openChooser(page);
  await expect(page.locator('.welcome-install')).toHaveCount(0);
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest.start_url).toBe('/');
  expect(manifest.display).toBe('standalone');
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
    'href',
    '/app-icon-192.png',
  );
});
