import { test, expect } from '@playwright/test';

test('inline add entry, AI previews, size choice, add and expanded visual stay connected', async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.goto('/?p=jordan&theme=vanilla&tab=now');
  await page.waitForFunction(() => !!window.atlas);
  const entry = page.locator('.now-page [data-action="gallery"]');
  await entry.scrollIntoViewIfNeeded();
  await expect(entry.locator('.number-ideas-badge')).toBeVisible();
  await expect(entry.locator('.add-number-label')).toHaveCSS('flex-direction', 'row');
  const alignment = await entry.locator('.add-number-label').evaluate((el) => {
    const icon = el.querySelector('.icon')!.getBoundingClientRect();
    const label = el.querySelector('span')!.getBoundingClientRect();
    return Math.abs(icon.y + icon.height / 2 - label.y - label.height / 2);
  });
  expect(alignment).toBeLessThan(2);
  await entry.click();
  await expect(page.locator('.ideas-author')).toHaveText('HSBC AI');
  const suggestion = page.locator('[data-suggestion="cardusage"]');
  await expect(suggestion.locator('[data-visual="gauge"]')).toBeVisible();
  await suggestion.getByRole('button', { name: 'Square', exact: true }).click();
  await expect(suggestion.locator('.module')).toHaveClass(/size-S/);
  await suggestion.getByRole('button', { name: 'Full', exact: true }).click();
  await expect(suggestion.locator('.module')).toHaveClass(/size-F/);
  await suggestion.getByRole('button', { name: 'Wide', exact: true }).click();
  await page.screenshot({ path: `docs/screenshots/${info.project.name}-number-gallery.png` });
  await suggestion.getByRole('button', { name: 'Add to My numbers', exact: true }).click();
  const card = page.locator('.now-page [data-module="cardusage"]');
  await expect(card).toHaveClass(/size-W/);
  await card.scrollIntoViewIfNeeded();
  await expect(card.locator('[data-visual="gauge"]')).toBeVisible();
  await card.locator('.module-face').click();
  await expect(
    page.locator('.sheet .number-visual.is-expanded[data-visual="gauge"]'),
  ).toBeVisible();
  await expect(page.locator('.sheet .detail-number')).toHaveText('39%');
  await page.screenshot({ path: `docs/screenshots/${info.project.name}-number-detail.png` });
});

test('reading suggestions clears new marker across reload and stays scoped to the person', async ({
  page,
}) => {
  await page.goto('/?p=sam&theme=vanilla&tab=now');
  await page.waitForFunction(() => !!window.atlas);
  await page.locator('.now-page [data-action="gallery"]').click();
  await expect(page.locator('[data-suggestion="groceryrhythm"]')).toBeVisible();
  await page.locator('.sheet-header [data-action="close"]').click();
  await expect(page.locator('.now-page .number-ideas-badge')).toHaveCount(0);
  await page.waitForTimeout(400);
  await page.reload();
  await expect(page.locator('.now-page')).toBeVisible();
  await expect(page.locator('.now-page .number-ideas-badge')).toHaveCount(0);
  await page.evaluate(() => window.atlas.go('jordan', 'now'));
  await expect(page.locator('.now-page .number-ideas-badge')).toHaveCount(1);
});

test('all preview sizes fit a narrow mobile screen in Vanilla and Premier', async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.setViewportSize({ width: 360, height: 800 });
  for (const person of ['sam', 'elena']) {
    await page.goto('/?p=' + person + '&theme=vanilla&tab=now');
    await page.waitForFunction(() => !!window.atlas);
    await page.locator('.now-page [data-action="gallery"]').click();
    const first = page.locator('[data-suggestion]').first();
    for (const size of ['Square', 'Wide', 'Tall', 'Full']) {
      await first.getByRole('button', { name: size, exact: true }).click();
      expect(await first.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      expect(
        await first.locator('.module').evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      ).toBe(true);
    }
    await first.getByRole('button', { name: 'Wide', exact: true }).click();
    await page.screenshot({ path: `docs/screenshots/${info.project.name}-${person}-ideas.png` });
  }
});
