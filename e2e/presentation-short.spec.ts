import { test, expect } from '@playwright/test';

test('the short Narrative has its own URL, keeps the Narrative look and the old link', async ({
  page,
}) => {
  await page.goto('/presentation/?p=sam');
  await page.getByRole('combobox', { name: 'Presentation version' }).selectOption('short');
  await expect(page).toHaveURL(/version=short#1$/);
  await expect(page.locator('#counter')).toHaveText('01 / 11');
  await expect(page.locator('body')).toHaveAttribute('data-version', 'narrative');
  await expect(page.locator('body')).toHaveAttribute('data-deck', 'short');
  expect(new URL(page.url()).searchParams.get('p')).toBe('sam');
  await page.goto('/presentation/?version=short#4');
  await expect(page.locator('.slide:not([hidden]) h1')).toContainText('Building better customers');
  await page.goto('/presentation/?version=short#6');
  await expect(page.locator('.s-gap .n-matrix-head .r-label')).toHaveCount(3);
  await page.goto('/presentation/?version=short#7');
  await expect(page.locator('.slide:not([hidden]) .eyebrow')).toHaveText('Behavioural science');
  await expect(page.locator('.s-tabs h2')).toHaveText(['Now', 'Future', 'You']);
  await page.goto('/presentation/?version=short#9');
  await expect(page.locator('.slide:not([hidden]) .eyebrow')).toHaveText('A loyalty framework');
  await page.goto('/presentation/?version=behavioural#10');
  await expect(page.locator('#deck-version')).toHaveValue('short');
  await expect(page.locator('.slide:not([hidden]) h1')).toContainText('A relationship is earned');
});

test('all short Narrative slides render without overflow and lead into the demo', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/presentation/?version=short');
  for (let n = 1; n <= 11; n++) {
    await expect(page.locator('#counter')).toHaveText(`${String(n).padStart(2, '0')} / 11`);
    await expect(page.locator('.slide:not([hidden]) h1')).toBeVisible();
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
