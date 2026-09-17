import { test, expect } from '@playwright/test';

test('both decks have independent shareable URLs and a working version selector', async ({
  page,
}) => {
  await page.goto('/presentation/?p=sam&tab=you#7');
  await expect(page.locator('#counter')).toHaveText('07 / 14');
  await expect(page.locator('#deck-version')).toHaveValue('original');
  await page.getByRole('combobox', { name: 'Presentation version' }).selectOption('relationship');
  await expect(page).toHaveURL(/version=relationship#1$/);
  await expect(page.locator('#counter')).toHaveText('01 / 11');
  expect(new URL(page.url()).searchParams.get('p')).toBe('sam');
  await page.keyboard.press('End');
  await expect(page.locator('#counter')).toHaveText('11 / 11');
  await page.reload();
  await expect(page.locator('#counter')).toHaveText('11 / 11');
  await page.locator('#contents').click();
  await expect(page.locator('[data-slide]')).toHaveCount(11);
  await page.locator('[data-slide="6"]').click();
  await expect(page.locator('.slide:not([hidden])')).toContainText('Follow their lead.');
  await page.locator('#deck-version').selectOption('original');
  await expect(page.locator('#counter')).toHaveText('01 / 14');
  await expect(page.locator('.slide:not([hidden]) h1')).toContainText('Introducing');
  expect(new URL(page.url()).searchParams.has('version')).toBe(false);
  await page.goBack();
  await expect(page.locator('#counter')).toHaveText('07 / 11');
});

test('all relationship slides render, scroll and lead into the demo', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/presentation/?version=relationship');
  for (let n = 1; n <= 11; n++) {
    await expect(page.locator('#counter')).toHaveText(`${String(n).padStart(2, '0')} / 11`);
    await expect(page.locator('.slide:not([hidden])')).toHaveCount(1);
    await expect(page.locator('.slide:not([hidden]) h1')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(
      await page
        .locator('.slide:not([hidden])')
        .evaluate((el) => el.scrollWidth <= el.clientWidth + 2),
    ).toBe(true);
    await page.locator('#deck').evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    const bottomFits = await page.locator('.slide:not([hidden])').evaluate((slide) => {
      const main = document.querySelector('#deck')!;
      return slide.getBoundingClientRect().bottom <= main.getBoundingClientRect().bottom + 2;
    });
    expect(bottomFits).toBe(true);
    if (n < 11) await page.locator('#next').click();
  }
  expect(errors).toEqual([]);
  await page.getByRole('link', { name: 'Explore Atlas', exact: true }).click();
  await expect(page.locator('.now-page')).toBeVisible();
  await expect(page.locator('.scenario-welcome')).toHaveCount(0);
});
