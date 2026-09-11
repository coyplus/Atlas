import { test, expect } from '@playwright/test';

test('all twelve slides render with working navigation, notes and responsive content', async ({
  page,
  browserName,
}) => {
  await page.goto('/presentation/');
  await expect(page.locator('#counter')).toHaveText('01 / 12');
  for (let n = 1; n <= 12; n++) {
    await expect(page.locator('.slide:not([hidden])')).toHaveCount(1);
    await expect(page.locator('.slide:not([hidden]) h1')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    ).toBeTruthy();
    await expect(page.locator('#counter')).toHaveText(`${String(n).padStart(2, '0')} / 12`);
    await page.screenshot({ path: `reports/deck-${browserName}-${n}.png`, animations: 'disabled' });
    if (n < 12) await page.locator('#next').click();
  }
  await expect(page.locator('#next')).toBeDisabled();
  await page.locator('#contents').click();
  await page.locator('[data-slide="7"]').click();
  await expect(page).toHaveURL(/#8$/);
  await expect(page.locator('.behaviour-layer')).toContainText('AI behavioural');
  const flow = await page
    .locator('.system-flow')
    .evaluate((el) => getComputedStyle(el).gridTemplateColumns);
  expect(flow.split(' ').length).toBe(1);
  await page.locator('#notes-toggle').click();
  await expect(page.locator('#speaker-notes')).toContainText('authored scenarios');
  await page.locator('#notes-close').click();
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#9$/);
  await expect
    .poll(async () =>
      page
        .locator('#slide-9 img')
        .evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0),
    )
    .toBeTruthy();
});

test('presentation entry sits beside install and remains available in standalone mode', async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.goto('/?p=sam&tab=now&theme=vanilla');
  await page.getByRole('button', { name: 'Switch scenario, currently Sam' }).click();
  const install = page.getByRole('button', { name: 'Add to Home Screen', exact: true });
  const link = page.getByRole('link', { name: 'Presentation', exact: true });
  await link.scrollIntoViewIfNeeded();
  const a = await install.boundingBox(),
    b = await link.boundingBox();
  expect(Math.abs(a!.y - b!.y)).toBeLessThan(1);
  await page.screenshot({ path: 'reports/deck-entry.png' });
  await link.click();
  await expect(page.locator('#counter')).toHaveText('01 / 12');
  await page.locator('#contents').click();
  await page.locator('[data-slide="11"]').click();
  await page.getByRole('link', { name: 'Experience it with Sam' }).click();
  await expect(page.locator('.now-page')).toBeVisible();
  await expect(page.locator('.scenario-welcome')).toHaveCount(0);
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'standalone', { configurable: true, value: true }),
  );
  await page.getByRole('button', { name: 'Switch scenario, currently Sam' }).click();
  await expect(page.getByRole('link', { name: 'Presentation', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add to Home Screen', exact: true })).toHaveCount(
    0,
  );
});

test('an installed service worker opens the presentation shell rather than the banking shell', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Service worker automation is Chromium-only.');
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.goto('/?p=sam&tab=now&theme=vanilla');
  await page.evaluate(async () => {
    await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
  });
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await page.getByRole('button', { name: 'Switch scenario, currently Sam' }).click();
  await page.getByRole('link', { name: 'Presentation', exact: true }).click();
  await expect(page.locator('#counter')).toHaveText('01 / 12');
  await page.reload();
  await expect(page.locator('#counter')).toHaveText('01 / 12');
  await page.getByRole('link', { name: 'Open prototype' }).click();
  await expect(page.locator('.now-page')).toBeVisible();
});
