import { test, expect } from '@playwright/test';

test('the behavioural design edition reuses the Narrative look with its own URL', async ({
  page,
}) => {
  await page.goto('/presentation/?p=sam');
  await page.getByRole('combobox', { name: 'Presentation version' }).selectOption('behavioural');
  await expect(page).toHaveURL(/version=behavioural#1$/);
  await expect(page.locator('#counter')).toHaveText('01 / 11');
  await expect(page.locator('body')).toHaveAttribute('data-version', 'narrative');
  await expect(page.locator('body')).toHaveAttribute('data-deck', 'behavioural');
  await expect(page.locator('#deck-version')).toHaveValue('behavioural');
  expect(new URL(page.url()).searchParams.get('p')).toBe('sam');
  await page.goto('/presentation/?version=behavioural#6');
  await expect(page.locator('.slide:not([hidden]) h1')).toContainText('behavioural reason');
  await expect(page.locator('.b-evidence-grid article')).toHaveCount(6);
  await page.locator('#deck-version').selectOption('narrative');
  await expect(page.locator('#counter')).toHaveText('01 / 15');
});

test('all behavioural slides render without horizontal overflow and lead into the demo', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/presentation/?version=behavioural');
  for (let n = 1; n <= 11; n++) {
    await expect(page.locator('#counter')).toHaveText(`${String(n).padStart(2, '0')} / 11`);
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
    if (n < 11) await page.locator('#next').click();
  }
  expect(errors).toEqual([]);
  await page.getByRole('link', { name: 'Experience it with Sam', exact: true }).click();
  await expect(page.locator('.now-page')).toBeVisible();
});
