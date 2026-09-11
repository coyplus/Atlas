import { test, expect, type Page } from '@playwright/test';
async function enter(page: Page, person = 'sam') {
  await page.goto(`/?p=${person}&theme=vanilla&tab=you`);
  await page.locator('.checkin-entry').click();
}
async function shot(page: Page, name: string) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('.checkin-flow,.feeling-flow').evaluateAll(async (els) => {
    await Promise.all(
      els
        .flatMap((el) => el.getAnimations({ subtree: true }))
        .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
        .map((a) => a.finished.catch(() => {})),
    );
  });
  await page.screenshot({ path: `docs/screenshots/checkin/${name}.png` });
}
async function footerAtBottom(page: Page, selector: string) {
  const footer = await page.locator('.calm-footer').boundingBox(),
    button = await page.locator(selector).boundingBox();
  expect(footer!.y + footer!.height).toBeGreaterThan(page.viewportSize()!.height - 3);
  expect(button!.y + button!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
}
test.beforeEach(async ({ page }, info) => {
  if (!info.title.startsWith('daily completion survives'))
    await page.addInitScript(() => {
      window.__ATLAS_TEST__ = true;
    });
});
test('feeling completes quietly with five Points and one daily tool; history keeps the controls', async ({
  page,
}, info) => {
  await enter(page);
  await expect(page.locator('.toolkit-card')).toHaveCount(4);
  await expect(page.locator('.checkin-stamp-week li')).toHaveCount(7);
  await expect(page.locator('.checkin-stamp-week .is-today .is-empty')).toHaveCount(1);
  await expect(page.locator('.checkin-entry .feeling-streak')).toContainText('day streak');
  await page.locator('.toolkit-card[data-action="feeling"]').click();
  await page.locator('[data-action="feeling-select:calm"]').click();
  await footerAtBottom(page, '[data-action="feeling-next"]');
  await page.locator('[data-action="feeling-next"]').click();
  await page.locator('[data-action="feeling-save"]').click();
  await expect(page.locator('.feeling-saved')).toContainText('+5 HSBC Points');
  await expect(page.locator('.daily-reward')).toHaveCSS('animation-name', 'reward-press');
  await expect(page.locator('.daily-reward')).toHaveCSS('animation-iteration-count', '1');
  await expect(page.locator('.feeling-saved .calm-footer button')).toHaveCount(1);
  await expect(page.locator('.feeling-saved input,.feeling-saved textarea')).toHaveCount(0);
  await shot(page, info.project.name + '-feeling-finish');
  await expect(page.locator('.reward-sparkles')).toHaveCSS('display', 'none');
  await page.locator('[data-action="feeling-done"]').click();
  await expect(page.locator('.points-module')).toContainText('485');
  await expect(page.locator('.checkin-entry .daily-stamp.is-complete')).toHaveCount(1);
  await page.locator('.checkin-entry').click();
  await expect(page.locator('.toolkit-card:disabled')).toHaveCount(4);
  await expect(page.locator('.checkin-stamp-week .is-today .is-complete')).toHaveCount(1);
  await shot(page, info.project.name + '-stamp-card');
  await page.locator('[data-action="checkin-library"]').click();
  await page.locator('[data-action="checkin-saved:feeling-2026-09-08"]').click();
  await expect(page.locator('#checkin-remember')).not.toBeChecked();
  await expect(page.locator('[data-action^="checkin-delete:"]')).toBeVisible();
});
test('swipe moves only the top card, suppresses selection and keeps actions anchored', async ({
  page,
}, info) => {
  await enter(page, 'elena');
  await page.locator('[data-action="checkin-tool:instinct"]').click();
  await page.locator('[data-action="checkin-mode:discover"]').click();
  const stack = page.locator('.instinct-deck'),
    card = page.locator('[data-checkin-swipe]');
  const before = (await stack.boundingBox())!,
    box = (await card.boundingBox())!;
  await expect(card).toHaveCSS('user-select', 'none');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 90, box.y + box.height / 2, { steps: 8 });
  const during = (await stack.boundingBox())!,
    face = (await card.boundingBox())!;
  expect(Math.abs(during.x - before.x)).toBeLessThan(1);
  expect(face.x).toBeGreaterThan(box.x + 45);
  expect(await page.evaluate(() => window.getSelection()?.toString())).toBe('');
  await page.mouse.up();
  await expect(card).toContainText('reserve');
  await page.getByRole('button', { name: 'Undo', exact: true }).click();
  await footerAtBottom(page, '[data-action="checkin-answer:depends"]');
  await shot(page, info.project.name + '-fixed-stack');
  for (const a of ['depends', 'yes', 'yes', 'no', 'skip'])
    await page.locator(`[data-action="checkin-answer:${a}"]`).click();
  await expect(page.locator('.checkin-reflection-invitation')).toBeVisible();
  await page.locator('[data-action="checkin-result"]').click();
  await expect(page.locator('[data-stage="saved"]')).toContainText('+5 HSBC Points');
  await expect(page.locator('[data-stage="saved"] input,[data-stage="saved"] details')).toHaveCount(
    0,
  );
  await shot(page, info.project.name + '-quiet-ending');
  await page.locator('[data-action="checkin-done"]').click();
  await page.evaluate(() => window.atlas.dispatch('checkin-tool:ahead'));
  await expect(page.locator('.toolkit-home')).toContainText('Your next check-in is tomorrow');
  expect(
    await page.evaluate(() => window.atlas.getState().people.elena.l1.rewards.points.balance),
  ).toBe(4055);
});
test('spending AI adapts to multiple reasons and keeps reflection optional', async ({
  page,
}, info) => {
  await enter(page, 'jordan');
  await page.locator('[data-action="checkin-tool:worth"]').click();
  await page.locator('[data-action="checkin-purchase:tx-jordan-014"]').click();
  await expect(page.locator('.reflection-receipt')).toContainText('£24.90');
  await page.locator('[data-action="checkin-verdict:1"]').click();
  await expect(page.locator('#checkin-note')).toHaveCount(0);
  await page.locator('[data-action="checkin-reason:1"]').click();
  await expect(page.locator('.reflection-invitation')).toContainText('time back');
  await page.locator('[data-action="checkin-reason:0"]').click();
  await expect(page.locator('.reflection-invitation')).toContainText('explore first');
  await footerAtBottom(page, '[data-action="checkin-result"]');
  await shot(page, info.project.name + '-worth-invitation');
  await page.locator('[data-action="checkin-reflect"]').click();
  await page.getByRole('button', { name: 'Time back', exact: true }).click();
  await expect(page.locator('.calm-inner h1')).toContainText('time back');
  await page.getByRole('button', { name: 'Rest', exact: true }).click();
  await expect(page.locator('.reflection-followup')).toContainText('Rest');
  await shot(page, info.project.name + '-worth-ai');
  await page.locator('[data-action="checkin-result"]').click();
  await expect(page.locator('[data-stage="saved"]')).toContainText('You noticed: rest');
  const ui = await page.evaluate(() => window.atlas.getState().people.jordan.ui);
  expect(ui.checkins[0].remember).toBe(false);
  expect(ui.checkins[0].answers.reflection.answer).toBe('Rest');
  expect(ui.chat).toHaveLength(0);
  await page.locator('[data-action="checkin-done"]').click();
  await page.locator('.checkin-entry').click();
  await page.locator('[data-action="checkin-library"]').click();
  await page.locator('[data-action="checkin-saved:reflection-1"]').click();
  await page.locator('#checkin-remember').check();
  await page.locator('#checkin-insight').fill('Protect time to rest after late work.');
  await page.locator('[data-action="checkin-update:reflection-1"]').click();
  await page.locator('[data-action="checkin-library:remembered"]').click();
  await expect(page.locator('.checkin-saved-list')).toContainText('Protect time to rest');
});
test('future exercise keeps its postcard and administration moves to History', async ({
  page,
}, info) => {
  await enter(page, 'alex');
  await page.locator('[data-action="checkin-tool:ahead"]').click();
  await page.locator('[data-action="checkin-horizon:1"]').click();
  await page.locator('[data-action="checkin-future:space"]').click();
  await expect(page.locator('#checkin-note')).toHaveCount(0);
  await expect(page.locator('.reflection-invitation')).toBeVisible();
  await shot(page, info.project.name + '-ahead-invitation');
  await page.locator('[data-action="checkin-reflect"]').click();
  await page.getByRole('button', { name: 'In my own words', exact: true }).click();
  await page.locator('#checkin-note').fill('A sunny kitchen with friends around the table.');
  await page.locator('[data-action="checkin-result"]').click();
  await expect(page.locator('[data-stage="saved"]')).toContainText('sunny kitchen');
  await expect(page.locator('[data-stage="saved"] .calm-footer button')).toHaveCount(1);
  await footerAtBottom(page, '[data-action="checkin-done"]');
  await shot(page, info.project.name + '-postcard-finish');
  await page.locator('[data-action="checkin-done"]').click();
  await page.locator('.checkin-entry').click();
  await page.locator('[data-action="checkin-library"]').click();
  await page.locator('[data-action="checkin-saved:reflection-1"]').click();
  await expect(page.locator('.future-scene')).toBeVisible();
  await page.locator('#checkin-remember').check();
  await page.locator('[data-action="checkin-update:reflection-1"]').click();
  await page.evaluate(() => window.atlas.closeAll());
  await page.locator('[data-action="tab:future"]').click();
  await expect(page.locator('#support-dock')).toContainText('sunny kitchen');
});
test('daily completion survives deletion and reload without a second reward', async ({ page }) => {
  await enter(page, 'alex');
  await page.locator('[data-action="checkin-tool:ahead"]').click();
  await page.locator('[data-action="checkin-horizon:0"]').click();
  await page.locator('[data-action="checkin-future:learn"]').click();
  await page.locator('[data-action="checkin-result"]').click();
  await page.locator('[data-action="checkin-done"]').click();
  await page.locator('.checkin-entry').click();
  await page.locator('[data-action="checkin-library"]').click();
  await page.locator('[data-action="checkin-saved:reflection-1"]').click();
  await page.locator('[data-action="checkin-delete:reflection-1"]').click();
  await page.waitForTimeout(350);
  await page.reload();
  await page.locator('.checkin-entry').click();
  await expect(page.locator('.toolkit-card:disabled')).toHaveCount(4);
  await page.evaluate(() => window.atlas.dispatch('feeling'));
  await expect(page.locator('.toolkit-home')).toBeVisible();
  expect(
    await page.evaluate(() => window.atlas.getState().people.alex.l1.rewards.points.balance),
  ).toBe(5);
  expect(
    await page.evaluate(() => window.atlas.getState().people.elena.ui.checkinDays || []),
  ).toHaveLength(0);
});
test('small-phone controls stay accessible while content scrolls underneath the glass header', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 680 });
  await enter(page, 'sam');
  await page.locator('[data-action="checkin-tool:instinct"]').click();
  await page.locator('[data-action="checkin-mode:discover"]').click();
  await footerAtBottom(page, '[data-action="checkin-answer:depends"]');
  const header = page.locator('.sheet-header');
  expect(await header.evaluate((el) => getComputedStyle(el, '::before').backdropFilter)).toContain(
    'blur',
  );
  expect(await header.evaluate((el) => getComputedStyle(el).backgroundColor)).toBe(
    'rgba(0, 0, 0, 0)',
  );
  await page.locator('[data-checkin-swipe]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.instinct-card')).toContainText('reserve');
  expect(
    await page.locator('.calm-main').evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
  ).toBe(true);
  await shot(page, info.project.name + '-narrow-fixed');
});

test('reflection offers existing credit and goals with appropriate questions', async ({
  page,
}, info) => {
  await enter(page, 'elena');
  await page.locator('[data-action="checkin-tool:worth"]').click();
  await expect(page.locator('.reflection-item-group')).toHaveCount(3);
  await expect(page.locator('[data-action^="checkin-purchase:goal-"]')).toHaveCount(4);
  await page.locator('[data-action="checkin-purchase:credit-ac-cc"]').click();
  await expect(page.locator('.reflection-receipt')).toContainText('Outstanding balance');
  await expect(page.locator('.reflection-receipt')).toContainText('£1,240.00');
  await page.getByRole('button', { name: 'Feels manageable', exact: true }).click();
  await page.getByRole('button', { name: 'Peace of mind', exact: true }).click();
  await expect(page.locator('.reflection-invitation')).toContainText('clearer');
  await page.locator('.screen-back').click();
  await page.locator('.screen-back').click();
  await page.locator('[data-action="checkin-purchase:goal-goal-fam"]').click();
  await expect(page.locator('.reflection-receipt')).toContainText('Goal target');
  await expect(page.locator('.reflection-receipt')).toContainText('£3,000.00');
  await page.getByRole('button', { name: 'Still feels right', exact: true }).click();
  await page.getByRole('button', { name: 'Family', exact: true }).click();
  await expect(page.locator('.reflection-invitation')).toContainText('goal to make room');
  await shot(page, info.project.name + '-goal-reflection');
  await page.locator('[data-action="checkin-result"]').click();
  await expect(page.locator('.daily-reward')).toContainText('+5');
});

test('desktop phone keeps the footer inset and progress fixed while content scrolls', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 1200, height: 900 });
  await enter(page, 'elena');
  await page.locator('[data-action="checkin-tool:instinct"]').click();
  await page.locator('[data-action="checkin-mode:discover"]').click();
  const progress = page.locator('.calm-progress'),
    before = await progress.boundingBox();
  const header = await page.locator('.sheet-header').boundingBox();
  expect(before!.y + 74).toBeGreaterThan(header!.y + header!.height);
  await page.locator('.calm-main').evaluate((el) => (el.scrollTop = 200));
  expect((await progress.boundingBox())!.y).toBe(before!.y);
  await page.evaluate(() => window.atlas.dispatch('feeling'));
  await page.locator('[data-action="feeling-select:calm"]').click();
  await page.locator('[data-action="feeling-next"]').click();
  await page.locator('[data-action="feeling-reason:0"]').click();
  await page.locator('[data-action="feeling-reflect"]').click();
  const sheet = await page.locator('.sheet').boundingBox(),
    cta = await page.locator('[data-action="feeling-save"]').boundingBox();
  expect(sheet!.y + sheet!.height - cta!.y - cta!.height).toBeGreaterThanOrEqual(31);
  await shot(page, info.project.name + '-desktop-footer');
});
