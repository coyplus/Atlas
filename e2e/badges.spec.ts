import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }, info) => {
  await page.addInitScript((testMode) => {
    window.__ATLAS_TEST__ = testMode;
  }, !info.title.includes('preserve progress'));
});
test('twenty badges, filters, progress sheets and Points navigation', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/?p=elena&theme=vanilla&tab=you');
  await page.locator('[data-action="badges"]').click();
  await expect(page.locator('.badge-collection .badge-tile')).toHaveCount(20);
  await page.screenshot({ path: `docs/screenshots/${info.project.name}-badge-gallery.png` });
  await page.locator('[data-action="badge-filter:earned"]').click();
  await expect(page.locator('.badge-collection .badge-tile')).toHaveCount(6);
  await page.locator('.badge-collection [data-action="badge:in-touch"]').click();
  await expect(page.locator('.secondary-shell')).toContainText('100 Points earned');
  await page.getByRole('button', { name: 'Close sheet', exact: true }).click();
  await expect(page.locator('.badge-filters [aria-pressed=true]')).toHaveText('Earned 6');
  await page.locator('.sheet-header [data-action="close"]').click();
  await page.locator('.points-banner').click();
  await page.locator('.points-challenge-link').click();
  await expect(page.locator('.badge-collection')).toBeVisible();
  await page.goBack();
  await expect(page.locator('#dialog-title')).toHaveText('Your rewards');
  expect(errors).toEqual([]);
});
test('join, record, pause and resume preserve progress and require confirmation', async ({
  page,
}, info) => {
  await page.goto('/?p=alex&theme=vanilla&tab=you');
  await page.locator('[data-action="badges"]').click();
  await page.locator('[data-action="badge-filter:earned"]').click();
  await expect(page.locator('.badge-empty')).toContainText('Your collection starts here');
  await page.locator('[data-action="badge-filter:all"]').last().click();
  await page.locator('.badge-collection [data-action="badge:growing-savings"]').click();
  await expect(page.locator('.secondary-shell')).toContainText('£465 in total');
  await page.locator('[data-action="badge-join:growing-savings"]').click();
  await expect(page.locator('.secondary-shell [role=progressbar]')).toHaveAttribute(
    'aria-valuenow',
    '0',
  );
  await page.locator('[data-action="badge-log:growing-savings"]').click();
  await page.locator('[data-action="badge-record:growing-savings"]').click();
  await expect(page.locator('#badge-confirm')).not.toBeChecked();
  await page.locator('#badge-confirm').check();
  await page.locator('[data-action="badge-record:growing-savings"]').click();
  await expect(page.locator('.secondary-shell [role=progressbar]')).toHaveAttribute(
    'aria-valuenow',
    '1',
  );
  await expect(
    page.locator('.secondary-shell [data-action="badge-log:growing-savings"]'),
  ).toHaveCount(0);
  await page.locator('[data-action="badge-pause:growing-savings"]').click();
  await expect(page.locator('.secondary-shell')).toContainText('PAUSED · PROGRESS KEPT');
  await page.locator('[data-action="badge-pause:growing-savings"]').click();
  await page.screenshot({ path: `docs/screenshots/${info.project.name}-badge-progress.png` });
  await page.getByRole('button', { name: 'Close sheet', exact: true }).click();
  await page.locator('[data-action="badge-filter:started"]').click();
  await expect(page.locator('.badge-collection .badge-tile')).toHaveCount(1);
  expect(
    await page.evaluate(() => window.atlas.getState().people.alex.l1.rewards.points.balance),
  ).toBe(0);
  await page.locator('.sheet-header [data-action="close"]').click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          new Promise<number>((resolve) => {
            const request = indexedDB.open('hsbc-atlas-demo', 1);
            request.onsuccess = () => {
              const db = request.result;
              const read = db.transaction('sessions').objectStore('sessions').get('session');
              read.onsuccess = () => {
                resolve(
                  read.result?.state?.people?.alex?.l1?.rewards?.challenges?.['growing-savings']
                    ?.count || 0,
                );
                db.close();
              };
            };
          }),
      ),
    )
    .toBe(1);
  await page.reload();
  await page.locator('[data-action="badges"]').click();
  await page.locator('.badge-collection [data-action="badge:growing-savings"]').click();
  await expect(page.locator('.secondary-shell [role=progressbar]')).toHaveAttribute(
    'aria-valuenow',
    '1',
  );
});
test('last milestone awards Points once, returns to fresh collection and leaves accounts unchanged', async ({
  page,
}, info) => {
  await page.goto('/?p=elena&theme=vanilla&tab=you');
  await page.waitForFunction(() => !!window.atlas);
  const before = await page.evaluate(() =>
    JSON.parse(JSON.stringify(window.atlas.getState().people.elena.l1)),
  );
  await page.locator('.badge-entry-preview [data-action="badge:steady-investor"]').click();
  await page.locator('[data-action="badge-log:steady-investor"]').click();
  await page.locator('#badge-confirm').check();
  await page.locator('[data-action="badge-record:steady-investor"]').click();
  await expect(page.locator('.secondary-shell')).toContainText('200 Points earned');
  await expect(page.locator('.badge-celebrate .badge-art')).toHaveCSS('opacity', '1');
  await page.screenshot({ path: `docs/screenshots/${info.project.name}-badge-unlocked.png` });
  const after = await page.evaluate(() => window.atlas.getState().people.elena.l1);
  expect(after.rewards.points.balance).toBe(before.rewards.points.balance + 200);
  expect(after.accounts).toEqual(before.accounts);
  expect(after.pots).toEqual(before.pots);
  await page.locator('[data-action="badge-browse"]').click();
  await expect(page.locator('.badge-collection-stats')).toContainText('7 / 20');
  await page.locator('.badge-collection [data-action="badge:steady-investor"]').click();
  await expect(page.locator('[data-action="badge-log:steady-investor"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Close sheet', exact: true }).click();
  await page.locator('.sheet-header [data-action="close"]').click();
  await page.locator('[data-action="tab:now"]').click();
  await expect(page.locator('.now-page')).toBeVisible();
});
test('all challenge details fit a narrow screen with reachable actions and reduced motion', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?p=jordan&theme=vanilla&tab=you');
  await page.locator('[data-action="badges"]').click();
  const actions = await page
    .locator('.badge-collection .badge-tile')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-action')));
  for (const action of actions) {
    await page.locator(`.badge-collection [data-action="${action}"]`).click();
    await expect(page.locator('.badge-detail')).toBeVisible();
    expect(await page.locator('.secondary-shell .sheet-body').evaluate((el) => el.scrollTop)).toBe(
      0,
    );
    expect(
      await page
        .locator('.secondary-shell .sheet-body')
        .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    ).toBe(true);
    await page.getByRole('button', { name: 'Close sheet', exact: true }).click();
  }
  await page.screenshot({ path: `docs/screenshots/${info.project.name}-badge-narrow.png` });
});

test('Points activity includes earned and spent entries and returns to the rewards screen', async ({
  page,
}, info) => {
  await page.goto('/?p=elena&theme=vanilla&tab=you');
  await page.locator('.points-banner').click();
  await page.locator('[data-action="benefit:coach"]').click();
  await page.locator('[data-action="redeem:coach"]').click();
  await page.locator('.points-entry [data-action="points-activity"]').click();
  await expect(page.locator('#dialog-title')).toHaveText('Points activity');
  await expect(page.locator('.points-activity .detail-number')).toHaveText('3,650');
  await expect(page.locator('.points-activity-totals')).toContainText('+4,050');
  await expect(page.locator('.points-activity-totals')).toContainText('−400');
  await expect(page.locator('.points-activity-row')).toHaveCount(10);
  await expect(page.locator('.points-activity-row').first()).toContainText('Spent');
  await expect(page.locator('.points-activity-row').first()).toContainText('−400');
  await expect(page.locator('.points-activity-row strong').first()).toHaveCSS(
    'text-decoration-line',
    'none',
  );
  await page.screenshot({ path: `docs/screenshots/${info.project.name}-points-activity.png` });
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.locator('.points-banner').click();
  await page.locator('.sheet [data-action="points-activity"]').click();
  await page.goBack();
  await expect(page.locator('#dialog-title')).toHaveText('Your rewards');
});

test('Points module is independent of the journey; earned rewards are struck through, empty history works', async ({
  page,
}, info) => {
  await page.goto('/?p=elena&theme=vanilla&tab=you');
  await expect(page.locator('.points-module .milestones')).toHaveCount(0);
  await expect(page.locator('.journey-module .points-entry')).toHaveCount(0);
  await expect(page.locator('.journey-module')).toContainText('Your journey with us');
  await page.locator('.points-entry').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `docs/screenshots/${info.project.name}-points-module.png` });
  await page.locator('[data-action="badges"]').click();
  await page.locator('[data-action="badge-filter:earned"]').click();
  await expect(page.locator('.badge-collection .badge-bonus').first()).toHaveCSS(
    'text-decoration-line',
    'line-through',
  );
  await page.locator('.badge-collection [data-action="badge:in-touch"]').click();
  await expect(page.locator('.badge-detail-points .is-awarded')).toHaveCSS(
    'text-decoration-line',
    'line-through',
  );
  await page.screenshot({ path: `docs/screenshots/${info.project.name}-badge-awarded.png` });
  await page.goto('/?p=alex&theme=vanilla&tab=you');
  await page.locator('.points-entry [data-action="points-activity"]').click();
  await expect(page.locator('.points-activity')).toContainText('No Points activity yet');
  await page.getByRole('button', { name: 'Explore challenges', exact: true }).click();
  await expect(page.locator('.badge-collection')).toBeVisible();
  await page.goBack();
  await expect(page.locator('#dialog-title')).toHaveText('Points activity');
});
