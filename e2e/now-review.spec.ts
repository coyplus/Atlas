import { test, expect } from '@playwright/test';

test('Now review: scenarios, detail surfaces, sheets and return paths', async ({ page }, info) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const shot = async (name: string) =>
    page.screenshot({ path: `docs/screenshots/now-review/${info.project.name}-${name}.png` });
  for (const persona of ['alex', 'jordan', 'sam', 'elena']) {
    await page.goto('/?p=' + persona + '&theme=vanilla&tab=now');
    await expect(page.locator('.now-page')).toBeVisible();
    await page.waitForTimeout(2100);
    await shot(persona + '-home');
    await page.locator('.pots-entry').scrollIntoViewIfNeeded();
    await shot(persona + '-grid');
    await page.locator('.pots-entry').click();
    await expect(page.locator('.accounts-collection')).toBeVisible();
    await shot(persona + '-accounts');
    await page.locator('.sheet-header [data-action="close"]').click();
    await expect(page.locator('.now-page')).toBeVisible();
  }
  const routes = [
    ['budget', 'pot:grocery-wallet'],
    ['credit', 'account:ac-cc'],
    ['shared', 'pot:flat'],
    ['saving', 'pot:ef'],
    ['gallery', 'gallery'],
    ['safe', 'module:safespend'],
    ['spending', 'module:grocery'],
    ['more', 'quick-more'],
    ['pay', 'pay'],
    ['transfer', 'transfer'],
    ['bank', 'connect-bank'],
    ['products', 'products'],
    ['story', 'story:j1'],
  ];
  for (const [name, action] of routes) {
    await page.evaluate(() => window.atlas.go('jordan', 'now'));
    await page.evaluate((action) => window.atlas.dispatch(action), action);
    await expect(page.locator('.sheet')).toBeVisible();
    await shot(name);
    expect(
      await page.locator('.sheet').evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      name,
    ).toBe(true);
    if (name === 'budget') {
      await page.locator('[data-action="container-how:grocery-wallet"]').click();
      await expect(page.locator('.how-sheet')).toBeVisible();
      await shot('how');
    }
    if (name === 'story') {
      await page.evaluate(() => window.atlas.dispatch('story-step:1'));
      await shot('story-chart');
      await page.evaluate(() => window.atlas.dispatch('story-step:2'));
      await shot('story-final');
    }
  }
  expect(errors).toEqual([]);
});

test('attention loops until acknowledged by review, and absent from routine pages', async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.goto('/?p=jordan&theme=vanilla&tab=now');
  const dock = page.locator('#support-dock');
  await expect(dock).toHaveAttribute('data-attention', 'unread');
  await expect(dock).toHaveClass(/is-attention-pulse/);
  await expect(page.locator('.support-bar')).toHaveCSS('animation-name', 'none');
  expect(
    await page
      .locator('.support-bar')
      .evaluate((el) => getComputedStyle(el, '::after').animationIterationCount),
  ).toBe('infinite');
  await page.waitForTimeout(6500);
  await expect(dock).toHaveClass(/is-attention-pulse/);
  await page.evaluate(() => window.atlas.dispatch('pot:grocery-wallet'));
  await expect(dock).toHaveClass(/is-attention-pulse/);
  await page.locator('[data-action="container-how:grocery-wallet"]').click();
  await expect(dock).toHaveAttribute('data-attention', 'none');
  await page.evaluate(() => window.atlas.go('jordan', 'now'));
  await expect(dock).toHaveAttribute('data-attention', 'none');
  await page.evaluate(() => window.atlas.go('sam', 'now'));
  await expect(dock).toHaveAttribute('data-attention', 'none');
  await page.evaluate(() => window.atlas.dispatch('products'));
  await expect(dock).toBeHidden();
  await expect(page.locator('.sheet-header [data-action="support:discuss"]')).toBeVisible();
});

test('budget evidence agrees with its tile; goal progress and reduced-motion cue are legible', async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?p=jordan&theme=vanilla&tab=now');
  await expect(page.locator('#support-dock')).toHaveAttribute('data-attention', 'unread');
  await expect(page.locator('#support-dock .support-bar')).toHaveCSS('animation-name', 'none');
  const pct = await page
    .locator('[data-module="container-grocery-wallet"] .progress')
    .getAttribute('aria-valuenow');
  await page.evaluate(() => window.atlas.dispatch('pot:grocery-wallet'));
  await expect(page.locator('.container-budget .progress')).toHaveAttribute('aria-valuenow', pct!);
  await expect(page.locator('.container-budget')).toContainText('£150.30 spent');
  await expect(page.locator('.container-budget')).toContainText('£320 monthly budget');
  await page.evaluate(() => window.atlas.go('sam', 'now'));
  await expect(page.locator('[data-module="housepot"] .number-goal')).toContainText('£24,000 goal');
  await page.evaluate(() => window.atlas.dispatch('pay'));
  await expect(page.locator('select[name="to"]')).toHaveValue('');
  await expect(page.locator('[data-action="transfer-review"]')).toHaveText('Review payment');
});
