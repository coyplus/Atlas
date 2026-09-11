import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
});
for (const [person, total] of [
  ['alex', 2],
  ['jordan', 5],
  ['sam', 6],
  ['elena', 6],
] as const) {
  test(`${person} has a compact personal timeline and full dated history`, async ({
    page,
  }, info) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`/?p=${person}&theme=vanilla&tab=you`);
    await expect(page.locator('.journey-module .journey-moment')).toHaveCount(Math.min(total, 3));
    await expect(page.locator('.points-module .journey-module')).toHaveCount(0);
    await page.locator('[data-action="journey"]').click();
    await expect(page.locator('.journey-detail .journey-moment')).toHaveCount(total);
    await expect(page.locator('.journey-detail')).not.toContainText('Quarterly review');
    await page.screenshot({ path: `docs/screenshots/${info.project.name}-journey-${person}.png` });
    await page.locator('.journey-detail .journey-moment').first().click();
    await expect(page.locator('.journey-memory')).toBeVisible();
    await page.getByRole('button', { name: 'Close sheet', exact: true }).click();
    await expect(page.locator('.journey-detail .journey-moment')).toHaveCount(total);
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.locator('[data-action="tab:now"]').click();
    await expect(page.locator('.now-page')).toBeVisible();
    expect(errors).toEqual([]);
  });
}
test('historical milestone opens current membership and returns to the journey', async ({
  page,
}, info) => {
  await page.goto('/?p=elena&theme=vanilla&tab=you');
  await page.locator('[data-action="journey"]').click();
  await page.locator('.journey-detail [data-action="journey-event:premier"]').click();
  await expect(page.locator('.journey-memory')).toContainText('2020');
  await page.locator('[data-action="journey-open:premier"]').click();
  await expect(page.locator('.membership-detail')).toHaveAttribute('data-membership-tier', 'elite');
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.locator('.journey-detail')).toBeVisible();
  await page.locator('.journey-detail [data-action="journey-event:decade"]').click();
  await expect(page.locator('.journey-memory-figure')).toContainText('October 2024');
  await page.screenshot({ path: `docs/screenshots/${info.project.name}-journey-milestone.png` });
  await page.goBack();
  await expect(page.locator('.journey-detail')).toBeVisible();
});
test('narrow timeline and milestone sheets fit and linked pots preserve navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?p=jordan&theme=vanilla&tab=you');
  await page.locator('.journey-module [data-action="journey-event:home-goal"]').click();
  expect(
    await page
      .locator('.secondary-shell .sheet-body')
      .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
  ).toBe(true);
  await page.locator('[data-action="journey-open:home-goal"]').click();
  await expect(page.locator('#dialog-title')).toHaveText('House deposit');
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.locator('[data-action="journey"]').click();
  expect(
    await page.locator('.sheet-body').evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
  ).toBe(true);
});
