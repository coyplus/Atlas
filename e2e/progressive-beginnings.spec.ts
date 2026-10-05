import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
    sessionStorage.setItem('atlas-welcome-seen', 'yes');
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
});
test('You offers a portrait invitation and quiz grows an editable first impression', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/?p=alex&tab=you&theme=vanilla');
  await expect(page.locator('.portrait-beginning')).toBeVisible();
  await expect(page.locator('.you-more')).toHaveCount(0);
  await expect(page.locator('.companion-entry')).toBeVisible();
  await page.locator('.portrait-beginning [data-action="quiz"]').click();
  for (let i = 0; i < 3; i++) await page.locator('[data-action="answer:0"]').click();
  await page.locator('[data-action="quiz-finish"]').click();
  await expect(page.locator('.money-portrait')).toHaveAttribute('data-portrait-stage', 'named');
  await expect(page.locator('.portrait-depth')).toHaveText('A first impression');

  await expect(page.locator('.portrait-detail')).toBeVisible();
  await page.locator('.portrait-engagement-dock [data-action="personality-confirm"]').click();

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
  await expect(page.locator('#future-add-form [name="name"]')).toHaveValue('');
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

test('Alex can start a savings habit without taking the portrait quiz', async ({ page }) => {
  await page.goto('/?p=alex&tab=you&theme=vanilla');
  const hero = page.locator('.savings-beginning');
  await expect(hero).toHaveAttribute('data-challenge-status', 'available');
  await expect(hero.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  const before = await page.evaluate(() => {
    const p = (window.atlas.getState() as any).people.alex;
    return { points: p.l1.rewards.points.balance, accounts: JSON.stringify(p.l1.accounts) };
  });
  await hero.locator('[data-action="badge:growing-savings"]').click();
  await expect(page.locator('.badge-detail')).toContainText('+200 Points on completion');
  await page.locator('[data-action="badge-join:growing-savings"]').click();
  await page.locator('[data-action="badge-log:growing-savings"]').click();
  await page.locator('#badge-confirm').check();
  await page.locator('[data-action="badge-record:growing-savings"]').click();
  await page.evaluate(() => window.atlas.dispatch('close'));
  await page.evaluate(() => window.atlas.dispatch('close'));
  await expect(hero).toHaveAttribute('data-challenge-status', 'active');
  await expect(hero.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  await expect(page.locator('.portrait-beginning')).toBeVisible();
  expect(
    await page.evaluate(() => {
      const p = (window.atlas.getState() as any).people.alex;
      return { points: p.l1.rewards.points.balance, accounts: JSON.stringify(p.l1.accounts) };
    }),
  ).toEqual(before);
  await hero.locator('[data-action="badge:growing-savings"]').click();
  await page.locator('[data-action="badge-pause:growing-savings"]').click();
  await page.evaluate(() => window.atlas.dispatch('close'));
  await page.evaluate(() => window.atlas.dispatch('close'));
  await expect(hero).toHaveAttribute('data-challenge-status', 'paused');
  await expect(hero).toContainText('1 of 30 saving days · Paused');
});
