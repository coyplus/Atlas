import { test, expect, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?p=sam&theme=vanilla&tab=now');
  await page.waitForFunction(() => !!window.atlas);
});

async function hidesPrimaryNavigation(page: Page) {
  const nav = page.locator('.tabbar');
  await expect(nav).toBeHidden();
  await expect(nav).toHaveAttribute('hidden');
  await expect(nav).toHaveAttribute('inert');
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toHaveCount(0);
}

test('primary navigation is absent from detail screens and task flows across Now, Future and You', async ({
  page,
}) => {
  const before = await page.evaluate(() => JSON.stringify(window.atlas.getState().people.sam.l1));
  for (const [tab, actions] of [
    [
      'now',
      [
        'pot:family-budget',
        'account:ac-cur',
        'module:grocery',
        'collection',
        'settings',
        'transfer',
        'pay',
        'chat',
        'receipts',
      ],
    ],
    ['future', ['pot:hol', 'future-add', 'future-horizon:horizon-family-adventure', 'future-own']],
    ['you', ['membership', 'points', 'badges', 'portrait', 'checkin-home', 'feeling']],
  ] as const) {
    for (const action of actions) {
      await page.evaluate((tab) => window.atlas.go('sam', tab), tab);
      await expect(page.locator('.tabbar')).toBeVisible();
      await page.evaluate((a) => window.atlas.dispatch(a), action);
      await expect(page.locator('.sheet')).toBeVisible();
      await hidesPrimaryNavigation(page);
      const phone = (await page.locator('#phone').boundingBox())!,
        sheet = (await page.locator('.sheet').boundingBox())!;
      expect(sheet.y + sheet.height, action).toBeCloseTo(phone.y + phone.height, 0);
      await page.evaluate(() => window.atlas.closeAll());
      await expect(page.locator('.tabbar')).toBeVisible();
      await expect(page.locator('.tabbar')).not.toHaveAttribute('inert');
    }
  }
  expect(await page.evaluate(() => JSON.stringify(window.atlas.getState().people.sam.l1))).toBe(
    before,
  );
});

test('nested sheets, browser Back and Forward preserve navigation ownership and main scroll', async ({
  page,
}) => {
  const entry = page.locator('[data-module="container-family-budget"] .module-face');
  await entry.scrollIntoViewIfNeeded();
  const scroll = await page.locator('#content').evaluate((el) => el.scrollTop);
  await entry.click();
  await hidesPrimaryNavigation(page);
  await page.locator('[data-action="container-how:family-budget"]').click();
  await expect(page.locator('#agreement-layer')).toBeVisible();
  await hidesPrimaryNavigation(page);
  await page.getByRole('button', { name: 'Close sheet', exact: true }).click();
  await expect(page.locator('.container-detail')).toBeVisible();
  await hidesPrimaryNavigation(page);
  await page.locator('[data-action="container-info:family-budget"]').click();
  await hidesPrimaryNavigation(page);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.locator('.container-detail')).toBeVisible();
  await hidesPrimaryNavigation(page);
  await page.goBack();
  await expect(page.locator('.tabbar')).toBeVisible();
  await expect(page.locator('#overlay')).toBeEmpty();
  expect(await page.locator('#content').evaluate((el) => el.scrollTop)).toBeCloseTo(scroll, 0);
  await page.goForward();
  await expect(page.locator('.container-detail')).toBeVisible();
  await hidesPrimaryNavigation(page);
});

test('all visual directions hide the navigation for details and restore it on return', async ({
  page,
}) => {
  for (const direction of ['vanilla', 'bento', 'metro']) {
    await page.evaluate((d) => window.atlas.dispatch('direction:' + d), direction);
    for (const tab of ['now', 'future', 'you']) {
      await page.evaluate((tab) => window.atlas.go('sam', tab), tab);
      await expect(page.locator('.tabbar')).toBeVisible();
      await page.evaluate(() => window.atlas.dispatch('settings'));
      await hidesPrimaryNavigation(page);
      await page.evaluate(() => window.atlas.closeAll());
      await expect(page.locator('.tabbar')).toBeVisible();
    }
  }
});

test('recent purchases appear before older appended setup entries without altering the ledger', async ({
  page,
}) => {
  const before = await page.evaluate(() => JSON.stringify(window.atlas.getState().people.sam.l1));
  const activity = page.locator('[data-module="activity"]');
  await activity.scrollIntoViewIfNeeded();
  await expect(activity.locator('.rows dt')).toHaveText(['Local grocer', 'Card cashback', 'Co-op']);
  await expect(activity.locator('.rows')).toBeVisible();
  await activity.locator('.module-face').click();
  await expect(page.locator('.sheet-body > .rows dt').first()).toHaveText(/Local grocer/);
  await page.evaluate(() => {
    window.atlas.closeAll();
    window.atlas.dispatch('pot:family-budget');
  });
  const ledger = page.locator('.container-ledger');
  await ledger.scrollIntoViewIfNeeded();
  await expect(ledger.locator('b').first()).toHaveText('Local grocer');
  await expect(ledger.locator('b')).toContainText(['Local grocer', 'Co-op', 'Lidl']);
  await page.locator('[data-action="container-activity:family-budget"]').click();
  await expect(page.locator('.sheet-body > .rows dt').first()).toHaveText(/Local grocer/);
  await expect(page.locator('.sheet-body > .rows dt')).toHaveCount(6);
  expect(await page.evaluate(() => JSON.stringify(window.atlas.getState().people.sam.l1))).toBe(
    before,
  );
});

test('Future has white timeline dots, active Goal ink, a visible docked lip and lighter single-message type', async ({
  page,
}) => {
  await page.evaluate(() => {
    window.atlas.go('sam', 'future');
    window.atlas.setT(240);
  });
  const dotPaint = await page
    .locator('.future-time-track')
    .evaluate((el) => getComputedStyle(el, '::after').backgroundImage);
  expect(dotPaint).toContain('rgb(255, 255, 255)');
  const ink = await page.locator('.fg-field-add').evaluate((el) => ({
    foreground: getComputedStyle(el).color,
    ink: getComputedStyle(el).getPropertyValue('--ink').trim(),
  }));
  await expect(page.locator('.fg-field-add')).not.toHaveCSS('color', 'rgb(97, 105, 112)');
  expect(ink.foreground).toBeTruthy();
  await expect(page.locator('#support-dock')).toHaveAttribute('data-single-message', 'true');
  await expect(page.locator('.support-copy strong')).toHaveCSS('font-weight', '400');
  await expect(page.locator('.support-subtitle')).toBeHidden();
  await page.locator('.future-drawer-grip').focus();
  await page.locator('.future-drawer-grip').press('Home');
  const lip = page.locator('.future-drawer');
  await expect(lip).toHaveAttribute('data-state', 'docked');
  await expect(lip).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  expect((await lip.boundingBox())!.height).toBeLessThanOrEqual(45);
  await expect(page.locator('#time-slider')).toBeHidden();
  await page.evaluate(() => {
    window.atlas.go('sam', 'now');
    window.atlas.dispatch('pot:family-budget');
  });
  await expect(page.locator('#support-dock')).toHaveAttribute('data-single-message', 'false');
  await expect(page.locator('.support-copy strong')).toHaveCSS('font-weight', '600');
});
