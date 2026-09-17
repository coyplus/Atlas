import { test, expect } from '@playwright/test';

test('the narrative deck is selectable, deep-linkable and switches back', async ({ page }) => {
  await page.goto('/presentation/?p=sam');
  await page.getByRole('combobox', { name: 'Presentation version' }).selectOption('narrative');
  await expect(page).toHaveURL(/version=narrative#1$/);
  await expect(page.locator('#counter')).toHaveText('01 / 15');
  await expect(page.locator('.slide:not([hidden]) h1')).toContainText('Introducing');
  expect(new URL(page.url()).searchParams.get('p')).toBe('sam');
  await page.goto('/presentation/?version=narrative#6');
  await expect(page.locator('#counter')).toHaveText('06 / 15');
  await expect(page.locator('.slide:not([hidden]) h1')).toContainText('Building better customers');
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'r-value');
  await page.locator('#deck-version').selectOption('relationship');
  await expect(page.locator('#counter')).toHaveText('01 / 11');
});

test('all narrative slides render without overflow and lead into the demo', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/presentation/?version=narrative');
  for (let n = 1; n <= 15; n++) {
    await expect(page.locator('#counter')).toHaveText(`${String(n).padStart(2, '0')} / 15`);
    await expect(page.locator('.slide:not([hidden])')).toHaveCount(1);
    await expect(page.locator('.slide:not([hidden]) h1')).toBeVisible();
    await expect
      .poll(() =>
        page
          .locator('.slide:not([hidden]) img')
          .evaluateAll((images) =>
            images.every(
              (image) =>
                (image as HTMLImageElement).complete &&
                (image as HTMLImageElement).naturalWidth > 0,
            ),
          ),
      )
      .toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(
      await page
        .locator('.slide:not([hidden])')
        .evaluate((el) => el.scrollWidth <= el.clientWidth + 2),
    ).toBe(true);
    if (n < 15) await page.locator('#next').click();
  }
  expect(errors).toEqual([]);
  await page.locator('#contents').click();
  await expect(page.locator('[data-slide]')).toHaveCount(15);
  await page.locator('#menu-close').click();
  await page.getByRole('link', { name: 'Experience it with Sam', exact: true }).click();
  await expect(page.locator('.now-page')).toBeVisible();
});

test('the narrative fits a laptop presentation viewport without scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/presentation/?version=narrative');
  await page.evaluate(() => document.fonts.ready);
  for (let n = 1; n <= 15; n++) {
    await expect(page.locator('#counter')).toHaveText(`${String(n).padStart(2, '0')} / 15`);
    await expect
      .poll(() => page.locator('#deck').evaluate((deck) => deck.scrollHeight - deck.clientHeight))
      .toBeLessThanOrEqual(2);
    if (n < 15) await page.locator('#next').click();
  }
});
