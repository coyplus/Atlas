import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
    sessionStorage.setItem('atlas-welcome-seen', 'yes');
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
});
test('Companion restores hierarchy, a quiet action and the same identity in conversation', async ({
  page,
}) => {
  await page.goto('/?p=alex&tab=now&theme=vanilla');
  await expect(page.locator('.support-copy strong')).toHaveText('Your Money Portrait starts here');
  await expect(page.locator('.support-message')).toBeVisible();
  await expect(page.locator('.support-actions .btn.primary')).toHaveCount(0);
  await expect(page.locator('.support-avatar .companion-avatar-guide')).toBeVisible();
  await expect(page.locator('.companion-signal')).toHaveCount(0);
  await page.locator('.support-summary').click();
  await expect(page.locator('.conversation-identity .companion-avatar-guide')).toBeVisible();
});
test('Family groceries is a half-width tall card with transactions below the budget', async ({
  page,
}) => {
  await page.goto('/?p=sam&tab=now&theme=vanilla');
  const card = page.locator('[data-module="container-family-budget"]');
  await expect(card).toHaveClass(/size-T/);
  await card.scrollIntoViewIfNeeded();
  const cardBox = (await card.boundingBox())!;
  const gridBox = (await page.locator('.module-grid').first().boundingBox())!;
  expect(cardBox.width).toBeLessThan(gridBox.width * 0.6);
  const purchases = (await card.locator('.number-purchases').boundingBox())!;
  const progress = (await card.locator('.budget-progress').boundingBox())!;
  expect(purchases.y).toBeGreaterThan(progress.y + progress.height);
  await expect(card.locator('.number-purchases')).toContainText('Local grocer');
  await expect(card).not.toContainText('Eligible purchases');
});

test('audio briefing has one visible play action and playback still works', async ({ page }) => {
  await page.goto('/?p=sam&tab=now&theme=vanilla');
  await expect(page.locator('.support-audio-meta')).toContainText('MIN LISTEN');
  await expect(page.locator('.support-actions button')).toHaveCount(0);
  await page.getByRole('button', { name: 'Play briefing', exact: true }).first().click();
  await expect(page.locator('#audio-dock')).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Pause briefing', exact: true }).first(),
  ).toBeVisible();
});
