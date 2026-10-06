import { test, expect, type Page } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 900 } });
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
});

const stage = (page: Page) => page.locator('#g-stage');
const ready = (page: Page) =>
  expect(stage(page)).toHaveAttribute('data-status', 'ready', { timeout: 60000 });
const frame = (page: Page, run: string) => page.frameLocator(`.g-device[data-run="${run}"] iframe`);
const pointers = (page: Page) => page.locator('.g-pointer span');

test('the slides lead into the four customers, then the Companion', async ({ page }) => {
  const failures: string[] = [];
  page.on('console', (m) => {
    if (/step failed/.test(m.text())) failures.push(m.text());
  });
  // /demo/ opens this edition by default.
  await page.goto('/demo/#slide-11');
  await expect(page.locator('#slide-11')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#cast$/);
  await ready(page);
  await expect(stage(page)).toHaveAttribute('data-layout', 'quad');
  await expect(page.locator('.g-device.is-on')).toHaveCount(4);
  await expect(page.locator('.g-timeline [data-state="on"]')).toHaveCount(4);
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#c1$/);
  await ready(page);
  await expect(page.locator('.g-headline')).toHaveText('One place for the bank to talk to you.');
  await expect(pointers(page)).toHaveText(['AI Companion']);
  expect(failures).toEqual([]);
});

test('the original edition stays at ?version=original, and its old links still open it', async ({
  page,
}) => {
  await page.goto('/demo/#time-travel');
  await expect(page.locator('#demo-stage')).toBeAttached();
  await expect(page.locator('#g-stage')).toHaveCount(0);
  await page.goto('/demo/?version=original');
  await expect(page.locator('#demo-stage')).toBeAttached();
});

test('Alex’s numbers carry forward, and going back rebuilds the same state', async ({ page }) => {
  await page.goto('/demo/?version=short#n2');
  await ready(page);
  await expect(pointers(page)).toHaveText(['Suggested for Alex']);
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#n3$/);
  await ready(page);
  const alex = frame(page, 'alex');
  await expect(alex.locator('.module-grid [data-module]').first()).toHaveAttribute(
    'data-module',
    'safespend',
  );
  await expect(alex.locator('#support-dock')).toContainText('safe to spend until payday');
  await expect(pointers(page)).toHaveText(['Offers an alert']);
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#n4$/);
  await ready(page);
  await expect(stage(page)).toHaveAttribute('data-layout', 'compare');
  await expect(pointers(page)).toHaveText(['Spending first', 'Investing first']);
  await page.keyboard.press('ArrowLeft');
  await expect(page).toHaveURL(/#n3$/);
  await ready(page);
  await expect(alex.locator('#support-dock')).toContainText('safe to spend until payday');
});

test('optional beats can be skipped, and the choice is remembered', async ({ page }) => {
  await page.goto('/demo/?version=short#f5');
  await ready(page);
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#f6$/);
  await ready(page);
  // Hiding the beat on screen steps back to the nearest one that stays.
  await page.keyboard.press('o');
  await expect(page).toHaveURL(/#f5$/);
  await ready(page);
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#f7$/);
  await page.goto('/demo/?version=short#f9');
  await page.reload();
  await ready(page);
  await page.keyboard.press('ArrowRight');
  await expect(page).toHaveURL(/#y1$/);
});

test('Money Speed shows Sam’s agreed plan for today, not a previewed or future month', async ({
  page,
}) => {
  await page.goto('/demo/?version=short#f10');
  await ready(page);
  const sheet = frame(page, 'sam').locator('#overlay');
  await expect(sheet).toContainText('£420');
  await expect(sheet).toContainText('3 goals in motion');
});

test('Sam’s portrait shows what changed, then Premier opens from it', async ({ page }) => {
  await page.goto('/demo/?version=short#y5');
  await ready(page);
  const sam = frame(page, 'sam');
  await expect(sam.locator('.ps-updates-line')).toHaveText('Since July: one new, one updated.');
  await expect(sam.locator('.ps-tile').first().locator('.ps-update')).toHaveText('New · August');
  await expect(pointers(page)).toHaveText(['What’s new']);
  await page.goto('/demo/?version=short#y8');
  await ready(page);
  await expect(sam.locator('#overlay')).toContainText('Expert access');
  await expect(pointers(page)).toHaveText(['Premier benefits']);
});

test('the close hands over the working prototype, and Escape returns', async ({ page }) => {
  await page.goto('/demo/?version=short#live');
  await ready(page);
  await expect(page.locator('body')).toHaveClass(/g-live/);
  const device = page.locator('.g-device[data-run="live"] iframe');
  await expect(device).not.toHaveAttribute('inert', '');
  await frame(page, 'live').locator('[data-action="tab:future"]').click();
  await expect(frame(page, 'live').locator('#future-stage')).toBeVisible();
  await page.locator('#g-stage').click({ position: { x: 40, y: 40 } });
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/#slide-12$/);
  await expect(page.locator('#slide-12')).toBeVisible();
});
