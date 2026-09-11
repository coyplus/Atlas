import { test, expect } from '@playwright/test';

test('settings opens from the header and child screens return to it', async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  for (const person of ['jordan', 'elena']) {
    await page.goto(`/?p=${person}&theme=vanilla&tab=now`);
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await expect(page.locator('.sheet-header h2')).toHaveText('Settings');
    await expect(page.locator('#support-dock')).toBeHidden();
    await page.getByRole('button', { name: 'Money rules View and manage your automation' }).click();
    await expect(page.locator('.sheet-header h2')).toHaveText('Your agreed rules');
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await expect(page.locator('.sheet-header h2')).toHaveText('Settings');
    await page.getByRole('button', { name: /Accounts and connections Manage accounts/ }).click();
    await expect(page.locator('.sheet-header h2')).toHaveText('Accounts & pots');
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await expect(page.locator('.sheet-header h2')).toHaveText('Settings');
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('button', { name: 'You', exact: true }).click();
    await expect(page.locator('[data-action="tab:you"]')).toHaveAttribute('aria-current', 'page');
    await page.getByRole('button', { name: 'Settings', exact: true }).click();
    await page.goBack();
    await expect(page.locator('#overlay')).toBeEmpty();
    await page.goForward();
    await expect(page.locator('.sheet-header h2')).toHaveText('Settings');
  }
});
