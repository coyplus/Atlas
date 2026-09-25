import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
    sessionStorage.setItem('atlas-welcome-seen', 'yes');
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
});
test('You begins with one invitation and quiz grows an editable first impression', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/?p=alex&tab=you&theme=vanilla');
  await expect(page.locator('.portrait-beginning')).toBeVisible();
  await expect(page.locator('.you-more')).not.toHaveAttribute('open');
  await expect(page.locator('.companion-entry')).not.toBeVisible();
  await page.locator('.portrait-beginning [data-action="quiz"]').click();
  for (let i = 0; i < 3; i++) await page.locator('[data-action="answer:0"]').click();
  await page.locator('[data-action="quiz-finish"]').click();
  await expect(page.locator('.money-portrait')).toHaveAttribute('data-portrait-stage', 'named');
  await expect(page.locator('.portrait-depth')).toHaveText('A first impression');
  await page.locator('.portrait-link[data-action="portrait"]').click();
  await expect(page.locator('.portrait-detail')).toBeVisible();
  await page.locator('[data-action="personality-confirm"]').click();
  await page.locator('.you-more > summary').click();
  await expect(page.locator('.companion-entry')).toBeVisible();
  expect(errors).toEqual([]);
});
test('Future previews an idea without changing money and reset returns to the invitation', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/?p=alex&tab=future&theme=vanilla');
  await expect(page.locator('.future-beginning')).toBeVisible();
  await expect(page.locator('.future-drawer')).toHaveCount(0);
  const before = await page.evaluate(() =>
    JSON.stringify((window.atlas.getState() as any).people.alex.l1),
  );
  await page.locator('.beginning-possibility').first().click();
  await expect(page.locator('#future-add-form')).toBeVisible();
  await page.locator('#future-add-form button[type="submit"]').click();
  await expect(page.locator('.future-studio')).toBeVisible();
  await expect(page.locator('.future-beginning')).toHaveCount(0);
  expect(
    await page.evaluate(() => JSON.stringify((window.atlas.getState() as any).people.alex.l1)),
  ).toBe(before);
  await page.evaluate(() => window.atlas.dispatch('future-reset'));
  await expect(page.locator('.future-beginning')).toBeVisible();
  await page.locator('[data-action="future-own"]').click();
  await expect(page.locator('#future-add-form input[name="name"]')).toHaveValue('');
  expect(errors).toEqual([]);
});
test('Planning tools stay available and mature scenarios keep their full experience', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/?p=alex&tab=future&theme=vanilla');
  await page.locator('[data-action="future-studio"]').click();
  await expect(page.locator('.future-studio')).toBeVisible();
  await page.evaluate(() => window.atlas.go('sam', 'future'));
  await expect(page.locator('.future-studio')).toBeVisible();
  await expect(page.locator('.future-orbit')).not.toHaveCount(0);
  await page.locator('[data-action="tab:you"]').click();
  await expect(page.locator('.you-more')).toHaveCount(0);
  await expect(page.locator('.companion-entry')).toBeVisible();
  expect(errors).toEqual([]);
});
