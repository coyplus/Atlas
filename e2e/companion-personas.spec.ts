import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('atlas-welcome-seen', 'yes'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('compare styles, cancel, save and restore without changing money or recording a transaction', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/?p=sam&tab=you&theme=vanilla');
  await expect(page.locator('.companion-entry')).toBeVisible();
  const before = await page.evaluate(() =>
    JSON.stringify((window.atlas.getState() as any).people.sam.l1),
  );
  await page.locator('[data-action="companion-settings"]').click();
  await expect(page.locator('.companion-recommendation')).toContainText('Try the Analyst');
  await page.locator('[data-action="companion-style:listener"]').click();
  await expect(page.locator('.companion-preview-card')).toContainText(
    'What would help you feel clearer',
  );
  await page.locator('[data-action="companion-preview:future"]').click();
  await expect(page.locator('.companion-preview-card')).toContainText('at your pace');
  await page.locator('[data-action="companion-style:coach"]').click();
  await page.locator('.sheet-header [data-action="close"]').click();
  await expect(page.locator('.companion-entry-current b')).toHaveText('Listener');
  await page.locator('[data-action="companion-settings"]').click();
  await page.locator('[data-action="companion-style:analyst"]').click();
  await expect(page.locator('.companion-preview-card')).toContainText('£3,120.44');
  await page.locator('[data-action="companion-initiative:ask"]').click();
  await page.locator('[data-action="companion-save"]').click();
  await expect(page.locator('.companion-entry-current b')).toHaveText('Analyst');
  expect(
    await page.evaluate(() => JSON.stringify((window.atlas.getState() as any).people.sam.l1)),
  ).toBe(before);
  expect(
    await page.evaluate(() => (window.atlas.getState() as any).people.sam.ui.receipts.length),
  ).toBe(0);
  await page.locator('[data-action="tab:now"]').click();
  await expect(page.locator('#support-dock .support-copy')).toContainText('Here when you need me');
  await page.locator('#support-dock .support-summary').click();
  await expect(page.locator('.chat-thread')).toContainText('£6,400');
  await expect(page.locator('.chat-thread')).not.toContainText('Your Companion is now');
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          new Promise((resolve) => {
            const req = indexedDB.open('hsbc-atlas-demo', 1);
            req.onsuccess = () => {
              const db = req.result;
              const read = db.transaction('sessions').objectStore('sessions').get('session');
              read.onsuccess = () => {
                resolve(read.result?.state?.people?.sam?.ui?.companion?.style);
                db.close();
              };
            };
          }),
      ),
    )
    .toBe('analyst');
  await page.reload();
  await page.waitForFunction(() => !!window.atlas);
  expect(
    await page.evaluate(() => (window.atlas.getState() as any).people.sam.ui.companion),
  ).toEqual({ style: 'analyst', initiative: 'ask' });
  await page.evaluate(() => window.atlas.go('jordan', 'you'));
  await expect(page.locator('.companion-entry-current b')).toHaveText('Coach');
  await page.locator('[data-action="companion-settings"]').click();
  await expect(page.locator('.companion-recommendation')).toContainText('Try the Coach');
  expect(
    await page.locator('.sheet-body').evaluate((el) => el.scrollWidth > el.clientWidth + 1),
  ).toBe(false);
  await page.locator('[data-action="companion-style:guide"]').click();
  await page.locator('[data-action="companion-defaults"]').click();
  await expect(page.locator('[data-action="companion-style:coach"]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.locator('[data-action="companion-save"]').click();
  await expect(page.locator('.companion-entry-current b')).toHaveText('Coach');
  expect(errors).toEqual([]);
});

test('balanced portrait reflection accepts a perspective and leaves evidence separate', async ({
  page,
}) => {
  await page.goto('/?p=sam&tab=you&theme=vanilla');
  await page.locator('.portrait-link[data-action="portrait"]').click();
  await expect(page.locator('.portrait-balance')).toContainText('STRENGTHS');
  await expect(page.locator('.portrait-balance')).toContainText('POSSIBLE BLIND SPOTS');
  await page.locator('.portrait-balance [data-action="portrait-note:overall"]').click();
  await page.locator('#portrait-note').fill('I like a plan with room for family adventures.');
  await page.locator('[data-action="portrait-note-save:overall"]').click();
  await expect(page.locator('.ps-own-perspective')).toContainText('room for family adventures');
  await page.locator('.sheet [data-action="portrait-story"]').click();
  await expect(page.locator('.portrait-balance')).toHaveCount(0);
  expect(
    await page.locator('.sheet-body').evaluate((el) => el.scrollWidth > el.clientWidth + 1),
  ).toBe(false);
});
