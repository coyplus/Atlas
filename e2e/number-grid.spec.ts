import { test, expect } from '@playwright/test';

test('Add a number follows vacancies through removal, resizing and adding', async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?p=sam&theme=vanilla&tab=now');
  const entry = page.locator('.add-number-entry');
  const slot = page.locator('.module-grid .add-module');
  await expect(entry).toBeVisible();
  await expect(slot).toHaveCount(0);
  const entryBox = await entry.boundingBox();
  const potsBox = await page.locator('.pots-entry').boundingBox();
  expect(entryBox!.width).toBeCloseTo(potsBox!.width, 0);
  expect(entryBox!.height).toBeCloseTo(potsBox!.height, 0);
  await page.getByRole('button', { name: 'Customise', exact: true }).click();
  await page.locator('[data-action="remove:points"]').click();
  await expect(slot).toBeVisible();
  await expect(entry).toHaveCount(0);
  // A gap before the full-width activity card is filled without moving that card.
  const neighbour = await page.locator('[data-module="grocery"]').boundingBox();
  const slotBox = await slot.boundingBox();
  expect(slotBox!.y).toBeCloseTo(neighbour!.y, 0);
  expect(slotBox!.width).toBeCloseTo(neighbour!.width, 0);
  expect(slotBox!.height).toBeCloseTo(neighbour!.height, 0);
  expect((await page.locator('[data-module="activity"]').boundingBox())!.y).toBeGreaterThan(
    slotBox!.y,
  );
  await page.locator('[data-action="size:grocery"]').click(); // S → W fills the gap
  await expect(entry).toBeVisible();
  await page.locator('[data-action="size:grocery"]').click(); // W → T leaves space beside a tall card
  await expect(slot).toBeVisible();
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await slot.click();
  await expect(page.locator('.sheet-header h2')).toHaveText('Choose your numbers');
  await page.locator('[data-action="preview-module:points"]').click();
  await page.locator('[data-action="pin-preview:points"]').click();
  await expect(page.locator('[data-module="points"]')).toBeVisible();
  await expect(page.locator('.now-page [data-action="gallery"]')).toHaveCount(1);
  await page.screenshot({ path: `docs/screenshots/${info.project.name}-adaptive-number-grid.png` });
});
