import { test, expect, type Page } from '@playwright/test';

async function boot(page: Page, person = 'jordan') {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.goto(`/?p=${person}&theme=vanilla&tab=now`);
  await expect(page.locator('.now-page')).toBeVisible();
}
async function click(page: Page, action: string) {
  await page.locator(`button[data-action="${action}"]`).filter({ visible: true }).first().click();
}
async function expectMainInteractive(page: Page, checkWheel = false) {
  await expect(page.locator('#overlay')).toBeEmpty();
  await expect(page.locator('#content')).not.toHaveAttribute('inert');
  await expect(page.locator('.tabbar')).not.toHaveAttribute('inert');
  await expect(page.locator('.tabbar')).toBeVisible();
  await expect(page.locator('#phone')).not.toHaveAttribute('aria-modal');
  await expect(page.locator('#phone')).not.toHaveClass(/has-modal/);
  await click(page, 'tab:future');
  await expect(page.locator('[data-action="tab:future"]')).toHaveAttribute('aria-current', 'page');
  await click(page, 'tab:now');
  // Wheel input is verified in the desktop context (mobile WebKit has no wheel API).
  if (checkWheel) {
    await page.locator('#content').hover();
    await page.mouse.wheel(0, 500);
    await expect
      .poll(() => page.locator('#content').evaluate((el) => el.scrollTop))
      .toBeGreaterThan(0);
  }
}

test('scenario switches release detail and nested agreement ownership', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1000 },
    isMobile: false,
    hasTouch: false,
  });
  const page = await context.newPage();
  await boot(page);
  await click(page, 'pot:grocery-wallet');
  await expect(page.locator('#content')).toHaveAttribute('inert');
  await click(page, 'person:sam');
  await expectMainInteractive(page, true);
  await click(page, 'person:jordan');
  await click(page, 'pot:grocery-wallet');
  await click(page, 'container-how:grocery-wallet');
  await expect(page.locator('.how-sheet')).toBeVisible();
  await click(page, 'person:elena');
  await expect(page.locator('#agreement-layer')).toHaveCount(0);
  await expectMainInteractive(page, true);
  await context.close();
});

test('completing a Story pin returns to an interactive Now screen', async ({ page }) => {
  await boot(page, 'alex');
  await click(page, 'story:a1');
  await page.locator('[data-action="story-step:2"]').click();
  await click(page, 'story-action:a1');
  await expectMainInteractive(page);
});

test('reset and theme changes clear modal ownership without an explicit close', async ({
  page,
}) => {
  await boot(page);
  for (const action of ['reset', 'direction:bento', 'direction:metro', 'direction:vanilla']) {
    await page.evaluate(() => window.atlas.dispatch('pot:grocery-wallet'));
    await expect(page.locator('#content')).toHaveAttribute('inert');
    await page.evaluate((a) => window.atlas.dispatch(a), action);
    await expectMainInteractive(page);
  }
});
