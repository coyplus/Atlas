import { test, expect } from '@playwright/test';

test('mobile front door selects a life and supports switching without restarting', async ({
  page,
}) => {
  await page.goto('/?p=alex&tab=now&theme=vanilla');
  await expect(
    page.getByRole('heading', { name: 'Making banking a relationship again' }).last(),
  ).toBeVisible();
  await expect(page.locator('.scenario-welcome')).toBeVisible();
  await page.getByRole('button', { name: /Sam A busy life/ }).click();
  await expect(page.locator('.scenario-welcome')).toHaveCount(0);
  await expect(page.locator('.scenario-switch')).toHaveText('Sam ⌄');
  await page.locator('.scenario-switch').click();
  await page.getByRole('button', { name: /Elena More possibilities/ }).click();
  await expect(page.locator('.scenario-switch')).toHaveText('Elena ⌄');
  await page.reload();
  await expect(page.locator('.scenario-switch')).toHaveText('Elena ⌄');
  await expect(page.locator('.scenario-welcome')).toHaveCount(0);
  await page.locator('.scenario-switch').click();
  await page.getByRole('button', { name: 'Back to prototype' }).click();
  await expect(page.locator('.scenario-switch')).toHaveText('Elena ⌄');
});

test('the component workbench does not show the mobile welcome', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 1000 });
  // Emulated touch devices intentionally use the mobile front door even on wide screens.
  await page.goto('/?mode=workbench');
  await expect(page.locator('.scenario-welcome')).toHaveCount(0);
});
