import { test, expect } from '@playwright/test';

test.use({ isMobile: false, hasTouch: false });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.setViewportSize({ width: 1280, height: 1000 });
});

test('Jordan links benefit attention to the budget without erasing it on review', async ({
  page,
}, info) => {
  await page.goto('/?p=jordan&theme=vanilla&tab=now');
  const dock = page.locator('#support-dock');
  await expect(dock).toHaveAttribute('data-attention', 'unread');
  await expect(dock).toContainText('Grocery budget needs attention');
  await expect(dock).toHaveClass(/is-attention-pulse/);
  const tile = page.locator('[data-module="container-grocery-wallet"]');
  await expect(tile).toHaveAttribute('data-attention', 'benefit-changed');
  await expect(tile.locator('.number-attention')).toHaveText('Benefit changed');
  await tile.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page
    .locator('.phone')
    .screenshot({ path: `docs/screenshots/now-review/${info.project.name}-attention-widget.png` });
  await tile.locator('.module-face').click();
  await page.locator('[data-action="container-how:grocery-wallet"]').click();
  await expect(dock).toHaveAttribute('data-attention', 'none');
  await expect(tile).toHaveAttribute('data-attention', 'benefit-changed');
});

test('Alex quiz Story explains the return, opens the quiz, and completes without duplicate rewards', async ({
  page,
}, info) => {
  await page.goto('/?p=alex&theme=vanilla&tab=now');
  await expect(page.locator('#support-dock')).toContainText(
    'money personality profile and 25 HSBC Points',
  );
  await page.locator('[data-action="story:a-quiz"]').click();
  await expect(page.locator('.story-viewer')).toHaveAttribute('data-step', '0');
  await page.locator('.story-pagination [data-action="story-step:1"]').click();
  await expect(page.locator('.story-profile')).toContainText('3 traits');
  await page.waitForTimeout(400);
  await page.locator('.phone').screenshot({
    path: `docs/screenshots/now-review/${info.project.name}-quiz-story-working.png`,
  });
  await page.locator('.story-pagination [data-action="story-step:2"]').click();
  await expect(page.locator('.story-viewer')).toHaveAttribute('data-duration', '0');
  await page.waitForTimeout(400);
  await page
    .locator('.phone')
    .screenshot({ path: `docs/screenshots/now-review/${info.project.name}-quiz-story-final.png` });
  const status = page.locator('.statusbar');
  await expect(status).toBeVisible();
  expect(await status.evaluate((el) => getComputedStyle(el).backgroundColor)).toMatch(
    /rgba|color\(/,
  );
  await page.locator('[data-action="story-action:a-quiz"]').click();
  await expect(page.locator('.quiz-question')).toBeVisible();
  for (let i = 0; i < 3; i++) await page.locator('[data-action="answer:0"]').click();
  await expect(page.locator('.sheet-body')).toContainText('Planner');
  await page.evaluate(() => window.atlas.dispatch('close'));
  await expect(page.locator('[data-action="story:a-quiz"]')).toContainText('In place');
  await expect(page.locator('#support-dock')).not.toContainText('In two minutes');
  await expect(page.locator('.tabbar')).toHaveCSS('border-top-width', '1px');
});

test('global header stays below status glass and new ideas use a larger red badge', async ({
  page,
}, info) => {
  await page.goto('/?p=alex&theme=vanilla&tab=now');
  await page.waitForTimeout(2200);
  const header = page.locator('.app-header'),
    status = page.locator('.statusbar');
  for (const offset of [30, 120, 0]) {
    await page.locator('#content').evaluate((el, y) => {
      el.scrollTop = y;
      el.dispatchEvent(new Event('scroll'));
    }, offset);
    await page.waitForTimeout(250);
    const geometry = await header.evaluate((el) => {
      const r = el.getBoundingClientRect(),
        s = document.querySelector('.statusbar')!.getBoundingClientRect();
      const clip = parseFloat(getComputedStyle(el).clipPath.replace('inset(', ''));
      return { visibleTop: r.top + clip, statusBottom: s.bottom, clip };
    });
    expect(geometry.visibleTop).toBeGreaterThanOrEqual(geometry.statusBottom - 1);
    if (offset === 0) expect(geometry.clip).toBe(0);
  }
  await expect(status).toBeVisible();
  await page
    .locator('.phone')
    .screenshot({ path: `docs/screenshots/now-review/${info.project.name}-header-top.png` });
  const badge = page.locator('.number-ideas-badge').first();
  await expect(badge).toHaveCSS('font-size', '12px');
  expect(await badge.evaluate((el) => getComputedStyle(el).color)).toBe('rgb(219, 0, 17)');
  await badge.scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  await page
    .locator('.phone')
    .screenshot({ path: `docs/screenshots/now-review/${info.project.name}-new-ideas.png` });
});
