import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
});
test('feeling reflection remains optional, keeps drafts and ends with one quiet action', async ({
  page,
}) => {
  await page.goto('/?p=sam&theme=vanilla&tab=you');
  await page.locator('.checkin-entry').click();
  await page.locator('.toolkit-card[data-action="feeling"]').click();
  await page.locator('[data-action="feeling-select:worried"]').click();
  await page.locator('[data-action="feeling-next"]').click();
  await page.locator('[data-action="feeling-reason:4"]').click();
  await page.locator('[data-action="feeling-reason:1"]').click();
  await expect(page.locator('.reflection-invitation')).toContainText('family costs');
  await page.locator('[data-action="feeling-reflect"]').click();
  await page.getByRole('button', { name: 'In my own words', exact: true }).click();
  await page.locator('#feeling-note').fill('Two big bills arrive before payday.');
  await page.locator('.sheet-header [data-action="feeling-context"]').click();
  await page.locator('[data-action="feeling-reflect"]').click();
  await expect(page.locator('#feeling-note')).toHaveValue('Two big bills arrive before payday.');
  await page.locator('[data-action="feeling-save"]').click();
  await expect(page.locator('.feeling-saved')).toContainText('Two big bills');
  await expect(page.locator('.feeling-saved .calm-footer button')).toHaveCount(1);
  await page.locator('[data-action="feeling-done"]').click();
  expect(await page.evaluate(() => window.atlas.getState().people.sam.ui.chat.length)).toBe(0);
});
test('feeling quick path fits a small phone, reduced motion and shared portrait remain private', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 680 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?p=elena&theme=vanilla&tab=you');
  await page.locator('[data-action="member:aisha"]').click();
  await page.locator('.checkin-entry').click();
  await page.locator('.toolkit-card[data-action="feeling"]').click();
  await expect(page.locator('[data-action="feeling-next"]')).toBeDisabled();
  await page.locator('[data-action="feeling-select:calm"]').click();
  await expect(page.locator('.feeling-hero>.feeling-glyph')).toHaveCSS('animation-name', 'none');
  await page.locator('[data-action="feeling-next"]').click();
  await page.locator('[data-action="feeling-save"]').click();
  await expect(page.locator('.daily-reward')).toContainText('+5 HSBC Points');
  await page.locator('[data-action="feeling-done"]').click();
  await expect(page.locator('.money-portrait')).toHaveAttribute('data-portrait-member', 'aisha');
  const state = await page.evaluate(() => window.atlas.getState().people.elena.ui);
  expect(state.moneyFeelings.at(-1).feeling).toBe('calm');
  expect(state.checkinDays).toHaveLength(1);
});
