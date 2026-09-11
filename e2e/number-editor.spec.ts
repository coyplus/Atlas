import { test, expect, type Page } from '@playwright/test';
async function boot(page: Page, persist = false) {
  await page.addInitScript((persist) => {
    window.__ATLAS_TEST__ = !persist;
  }, persist);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?p=sam&theme=vanilla&tab=now');
  await expect(page.locator('.now-page')).toBeVisible();
}
const order = (page: Page) => page.evaluate(() => window.atlas.getState().people.sam.ui.order);
async function visibleCards(page: Page) {
  await page.locator('[data-module="container-family-budget"]').scrollIntoViewIfNeeded();
  await page.locator('#content').evaluate((el) => {
    const card = el.querySelector('[data-module="container-family-budget"]')!;
    el.scrollTop += card.getBoundingClientRect().top - 220;
  });
  const a = (await page.locator('[data-module="container-family-budget"]').boundingBox())!;
  const b = (await page.locator('[data-module="holiday"]').boundingBox())!;
  return { a, b };
}
test('edit mode rearranges live, commits once, persists, and supports removal and Done', async ({
  page,
}, info) => {
  await boot(page, true);
  await page.getByRole('button', { name: 'Customise', exact: true }).click();
  const initial = await order(page);
  const { a, b } = await visibleCards(page);
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 });
  await expect(page.locator('.number-drag-ghost')).toBeVisible();
  await expect
    .poll(async () => (await page.locator('[data-module="holiday"]').boundingBox())!.x)
    .toBeLessThan(b.x - 50);
  expect(await order(page)).toEqual(initial); // preview has not written a transaction
  await page.screenshot({ path: `docs/screenshots/${info.project.name}-number-drag.png` });
  await page.mouse.up();
  await expect(page.locator('.number-drag-ghost')).toHaveCount(0);
  const moved = await order(page);
  expect(moved.indexOf('holiday')).toBeLessThan(moved.indexOf('container-family-budget'));
  await expect(page.locator('#overlay')).toBeEmpty();
  await page.getByRole('button', { name: 'Remove Family groceries', exact: true }).click();
  await expect(page.locator('[data-module="container-family-budget"]')).toHaveCount(0);
  await expect(page.locator('.module-grid')).toHaveClass(/editing/);
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(page.locator('.edit-tools')).toHaveCount(0);
  const saved = await order(page);
  await page.waitForTimeout(350); // let the debounced IndexedDB save finish
  await page.reload();
  await expect(page.locator('.now-page')).toBeVisible();
  expect(await order(page)).toEqual(saved);
});
test('long press enters edit mode without opening a detail; moving first cancels the hold', async ({
  page,
}) => {
  await boot(page);
  const { a } = await visibleCards(page);
  const tile = page.locator('[data-module="container-family-budget"] .module-face');
  await tile.dispatchEvent('pointerdown', {
    pointerId: 77,
    pointerType: 'touch',
    isPrimary: true,
    button: 0,
    clientX: a.x + 50,
    clientY: a.y + 50,
  });
  await tile.dispatchEvent('pointermove', {
    pointerId: 77,
    pointerType: 'touch',
    clientX: a.x + 50,
    clientY: a.y + 80,
  });
  await page.waitForTimeout(550);
  expect(await page.evaluate(() => window.atlas.getState().edit)).toBe(false);
  await tile.dispatchEvent('pointercancel', { pointerId: 77 });
  await page.mouse.move(a.x + 50, a.y + 50);
  await page.mouse.down();
  await expect(page.locator('.module-grid')).toHaveClass(/editing/);
  await page.mouse.up();
  await expect(page.locator('#overlay')).toBeEmpty();
  await expect(page.getByRole('button', { name: 'Remove Family groceries' })).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect
    .poll(() =>
      page.locator('[data-module="holiday"]').evaluate((el) => getComputedStyle(el).animationName),
    )
    .toBe('number-wiggle');
});
test('cancelled drag restores order; keyboard reordering remains available', async ({ page }) => {
  await boot(page);
  await page.getByRole('button', { name: 'Customise', exact: true }).click();
  const before = await order(page);
  const { a, b } = await visibleCards(page);
  await page.mouse.move(a.x + 60, a.y + 60);
  await page.mouse.down();
  await page.mouse.move(b.x + 60, b.y + 60, { steps: 10 });
  await expect(page.locator('.number-drag-ghost')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.mouse.up();
  await expect(page.locator('.number-drag-ghost')).toHaveCount(0);
  expect(await order(page)).toEqual(before);
  const face = page.locator('[data-module="holiday"] .module-face');
  await face.focus();
  await page.keyboard.press('ArrowLeft');
  expect((await order(page)).indexOf('holiday')).toBe(before.indexOf('holiday') - 1);
  await expect(page.locator('#overlay')).toBeEmpty();
});
test('dragging near the bottom scrolls the grid and interruption cleans up', async ({ page }) => {
  await boot(page);
  await page.getByRole('button', { name: 'Customise', exact: true }).click();
  const { a } = await visibleCards(page);
  const before = await page.locator('#content').evaluate((el) => el.scrollTop);
  const bottom = (await page.locator('#content').boundingBox())!;
  await page.mouse.move(a.x + 60, a.y + 60);
  await page.mouse.down();
  await page.mouse.move(a.x + 60, bottom.y + bottom.height - 15, { steps: 12 });
  await expect
    .poll(() => page.locator('#content').evaluate((el) => el.scrollTop))
    .toBeGreaterThan(before + 50);
  await page.evaluate(() => window.atlas.dispatch('person:elena'));
  await page.mouse.up();
  await expect(page.locator('.number-drag-ghost')).toHaveCount(0);
  await page.getByRole('button', { name: 'Future', exact: true }).click();
  await expect(page.locator('[data-action="tab:future"]')).toHaveAttribute('aria-current', 'page');
});

test('native touch scroll, hold and drag do not compete with one another', async ({
  page,
  context,
  browserName,
}) => {
  test.skip(
    browserName !== 'chromium',
    'Touch gesture injection uses the Chromium device protocol.',
  );
  await boot(page);
  let { a, b } = await visibleCards(page);
  const cdp = await context.newCDPSession(page);
  const touch = async (type: string, x = 0, y = 0) =>
    cdp.send('Input.dispatchTouchEvent', {
      type,
      touchPoints: type === 'touchEnd' || type === 'touchCancel' ? [] : [{ x, y, id: 1 }],
    });
  const startScroll = await page.locator('#content').evaluate((el) => el.scrollTop);
  await touch('touchStart', a.x + 70, a.y + 110);
  for (let i = 1; i <= 8; i++) await touch('touchMove', a.x + 70, a.y + 110 - i * 12);
  await touch('touchEnd');
  await expect
    .poll(() => page.locator('#content').evaluate((el) => el.scrollTop))
    .toBeGreaterThan(startScroll);
  expect(await page.evaluate(() => window.atlas.getState().edit)).toBe(false);
  ({ a, b } = await visibleCards(page));
  await touch('touchStart', a.x + 70, a.y + 70);
  await expect(page.locator('.module-grid')).toHaveClass(/editing/);
  await touch('touchEnd');
  await expect(page.locator('#overlay')).toBeEmpty();
  ({ a, b } = await visibleCards(page));
  await touch('touchStart', a.x + 70, a.y + 70);
  for (let i = 1; i <= 12; i++)
    await touch('touchMove', a.x + 70 + ((b.x - a.x) * i) / 12, a.y + 70);
  await expect(page.locator('.number-drag-ghost')).toBeVisible();
  await expect
    .poll(async () => (await page.locator('[data-module="holiday"]').boundingBox())!.x)
    .toBeLessThan(b.x - 50);
  await touch('touchEnd');
  await expect(page.locator('.number-drag-ghost')).toHaveCount(0);
  const result = await order(page);
  expect(result.indexOf('holiday')).toBeLessThan(result.indexOf('container-family-budget'));
});
