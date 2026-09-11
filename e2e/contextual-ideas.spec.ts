import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?p=jordan&theme=vanilla&tab=future');
  await page.waitForFunction(() => !!window.atlas);
});

test('discovery, unseen badge, back navigation, dismissal and a personalised draft', async ({
  page,
}) => {
  const before = await page.evaluate(() =>
    JSON.stringify(window.atlas.getState().people.jordan.l1),
  );
  await expect(page.locator('.possibility-count')).toHaveText('3');
  await page.locator('[data-action="future-add"]').click();
  await expect(page.locator('.possibility-card')).toHaveCount(3);
  await expect(page.locator('#future-add-form')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Create my own', exact: true })).toBeVisible();
  await page.locator('[data-action="future-possibility:move-in"]').click();
  await expect(page.getByRole('heading', { name: 'Imagine this', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.locator('.possibility-card')).toHaveCount(3);
  await page.locator('[data-action="future-hide-possibility:learning"]').click();
  await expect(page.locator('[data-action="future-possibility:learning"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.locator('.possibility-count')).toHaveCount(0);
  await page.locator('[data-action="future-add"]').click();
  await expect(page.locator('[data-action="future-possibility:learning"]')).toHaveCount(0);
  await page.locator('[data-action="future-possibility:car-costs"]').click();
  await expect(page.locator('.possibility-number-fields')).toBeVisible();
  await page.locator('[name="target"]').fill('720');
  await page.locator('[name="amount"]').fill('60');
  await page.getByRole('button', { name: 'Try this in my future' }).click();
  await expect(page.locator('.future-orbit')).toHaveCount(4);
  expect(await page.evaluate(() => JSON.stringify(window.atlas.getState().people.jordan.l1))).toBe(
    before,
  );
  await page.locator('.fg-footer [data-action="future-review"]').click();
  await expect(page.locator('.fg-review-list')).toContainText('£60/month');
  await expect(page.locator('.fg-review-list')).toContainText('£720');
});

test('Time Travel beyond the final milestone suggests the next chapter and routes to possibilities', async ({
  page,
}) => {
  await page.goto('/?p=sam&theme=vanilla&tab=future');
  await page.locator('#time-slider').evaluate((el: HTMLInputElement) => {
    el.value = '120';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(page.locator('#support-dock')).toContainText(
    'At 43, could shorter weeks give you more time with family?',
  );
  await page.locator('#support-dock .support-avatar').click();
  await page
    .getByRole('button', { name: 'Imagine a little more freedom at work', exact: true })
    .click();
  await expect(page.locator('.horizon-detail')).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Goal name' })).toHaveValue('Shorter weeks');
});

test('the visible Badges section changes AI context and opens a relevant challenge without joining it', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'You', exact: true }).click();
  await page.locator('.badge-entry-context').evaluate((el) => {
    const content = document.querySelector('#content')!;
    content.scrollTop += el.getBoundingClientRect().top - content.getBoundingClientRect().top - 170;
  });
  await expect(page.locator('#support-dock')).toContainText('Pay yourself first');
  await expect(
    page.locator('.badge-entry-preview [data-action="badge:payday-first"]'),
  ).toBeVisible();
  await page.locator('#support-dock .support-avatar').click();
  await page.getByRole('button', { name: 'Explore this challenge', exact: true }).click();
  await expect(page.locator('.badge-detail h2')).toHaveText('Pay yourself first');
  await expect(page.getByRole('button', { name: 'Join challenge', exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => window.atlas.getState().people.jordan.l1.rewards.challenges['payday-first'],
    ),
  ).toBeUndefined();
});
