import { test, expect } from '@playwright/test';
test('saved preferences survive reload; reset restores the seed', async ({ page }) => {
  await page.goto('/?p=jordan');
  await expect(page.locator('.now-page')).toBeVisible();
  await page.locator('button[data-action=customise]').click();
  await page.evaluate(() => window.atlas.dispatch('remove:container-ac-cc'));
  await expect(page.locator('#content [data-module=container-ac-cc]')).toHaveCount(0);
  await page.waitForTimeout(350);
  await page.reload();
  await expect(page.locator('.now-page')).toBeVisible();
  await expect(page.locator('#content [data-module=container-ac-cc]')).toHaveCount(0);
  await page.evaluate(() => window.atlas.dispatch('reset'));
  await expect(page.locator('#content [data-module=container-ac-cc]')).toBeVisible();
});
test('offline production launch includes fonts, portraits, data and routes', async ({
  page,
  context,
  baseURL,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'Playwright service worker automation is Chromium-only; verify installed Safari offline on a device.',
  );
  test.skip(!baseURL?.includes('4174'), 'Offline shell is enabled in the production preview');
  await page.goto('/?p=sam');
  await expect(page.locator('.now-page')).toBeVisible();
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    await new Promise<void>((resolve) => {
      if (navigator.serviceWorker.controller) resolve();
      else
        navigator.serviceWorker.addEventListener('controllerchange', () => resolve(), {
          once: true,
        });
    });
  });
  await context.setOffline(true);
  await page.goto('/app/elena/now');
  await expect(page.locator('.phone.premier')).toBeVisible();
  await expect(page.locator('.support-avatar img')).toBeVisible();
  expect(
    await page
      .locator('.support-avatar img')
      .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
  ).toBe(true);
  await page.locator('button[data-action="tab:future"]').click();
  await expect(page.locator('#future-stage')).toBeVisible();
  await context.setOffline(false);
});
test('unavailable device storage still permits the demonstration', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'indexedDB', {
      get() {
        throw new Error('Storage unavailable');
      },
    });
  });
  await page.goto('/?p=alex');
  await expect(page.locator('.now-page')).toBeVisible();
  await page.locator('button[data-action="tab:future"]').click();
  await expect(page.locator('#future-stage')).toBeVisible();
});
test('workbench and blueprint resolve using the same app and local specifications', async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  for (const url of ['/workbench.html', '/support-blueprint.html']) {
    await page.goto(url);
    await expect(page.locator('#workbench-panel')).toContainText('Support, across the product');
    await page.locator('button[data-action="support-case:detail"]').click();
    await expect(page.locator('#support-dock')).toHaveAttribute('data-state', 'compact');
  }
  const response = await page.request.get('/POTS-ACCOUNTS-SYSTEM.md');
  expect(response.ok()).toBe(true);
  expect(await response.text()).toContain('Agreement');
});
test('demo controls keep keyboard focus inside the menu and restore it', async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.goto('/?p=jordan');
  await page.locator('[data-demo-menu]').click();
  await expect(page.locator('.demo-menu')).toBeVisible();
  await page.locator('.demo-menu header button').focus();
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('.demo-menu a')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('.demo-menu header button')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('.demo-menu')).toHaveCount(0);
  await expect(page.locator('[data-demo-menu]')).toBeFocused();
});
test('history stores view metadata, not customer financial snapshots', async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.goto('/?p=jordan');
  await page.locator('button[data-action="pot:grocery-wallet"]').click();
  expect(await page.evaluate(() => JSON.stringify(history.state).length)).toBeLessThan(1000);
  expect(await page.evaluate(() => Object.hasOwn(history.state, 'people'))).toBe(false);
  await page.goBack();
  await expect(page.locator('.now-page')).toBeVisible();
});
