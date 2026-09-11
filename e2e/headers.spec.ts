import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
});
for (const person of ['sam', 'elena'])
  test(`${person}: detail and journey headers use one scale across features`, async ({
    page,
  }, info) => {
    await page.goto(`/?p=${person}&theme=vanilla&tab=you`);
    await page.waitForFunction(() => !!window.atlas);
    const actions = [
      'collection',
      'points',
      'pot:fam',
      'rules',
      'settings',
      'gallery',
      'transfer',
      'quiz',
      'portrait',
      'feeling',
      'newplan',
    ];
    for (const action of actions) {
      await page.evaluate(
        (action) => window.atlas.dispatch(action),
        action === 'pot:fam' && person === 'sam' ? 'pot:hol' : action,
      );
      const header = page.locator('.sheet-header');
      await expect(header).toHaveAttribute('data-header-pattern', /detail|journey/);
      await expect(header).toHaveCSS('height', '58px');
      await expect(header).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
      expect(
        await header.evaluate((el) => getComputedStyle(el, '::before').backdropFilter),
      ).toContain('blur');
      await expect(header.locator('h2')).toHaveCSS('font-size', '18px');
      await expect(header.locator('h2')).toHaveCSS('font-weight', '500');
      await expect(header.locator('.screen-back')).toHaveCSS('width', '44px');
      const title = await header.locator('h2').boundingBox(),
        back = await header.locator('.screen-back').boundingBox();
      expect(title!.x).toBeGreaterThanOrEqual(back!.x + back!.width + 10);
      const body = await page.locator('.sheet-body').boundingBox();
      expect(body!.width).toBeLessThanOrEqual(420);
      if (['collection', 'transfer', 'feeling'].includes(action))
        await page.screenshot({
          path: `docs/screenshots/headers/${info.project.name}-${person}-${action}.png`,
        });
      await header.locator('.screen-back').click();
      if (action === 'feeling') await page.locator('.sheet-header .screen-back').click();
      await expect(page.locator('.sheet')).toHaveCount(0);
    }
  });
