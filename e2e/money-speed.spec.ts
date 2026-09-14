import { test, expect } from '@playwright/test';
test('Money Speed keeps its visual breakdown and AI insight aligned with Time Travel', async ({ page }) => {
  await page.addInitScript(() => { window.__ATLAS_TEST__ = true; });
  await page.goto('/?p=sam&theme=vanilla&tab=future');
  await page.waitForFunction(() => !!window.atlas);
  await page.evaluate(() => window.atlas.dispatch('future-speed'));
  await expect(page.locator('.fg-speed-ring strong')).toHaveText('£420');
  await expect(page.locator('.fg-speed-key button')).toHaveCount(3);
  await expect(page.locator('.fg-speed-insight')).toContainText('76%');
  await page.getByRole('button', { name: 'Explore a different pace', exact: true }).click();
  await expect(page.locator('#future-chat-input')).toBeVisible();
  await page.evaluate(() => { window.atlas.closeAll(); window.atlas.dispatch('future-time:144'); window.atlas.dispatch('future-speed'); });
  await expect(page.locator('.fg-speed-ring strong')).toHaveText('£380');
  await expect(page.locator('.fg-speed-key button')).toHaveCount(2);
  await expect(page.locator('.fg-speed-insight')).toContainText('84%');
});
