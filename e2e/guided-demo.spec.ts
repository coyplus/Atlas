import { test, expect } from '@playwright/test';
import { scenes } from '../src/demo/scenes';
test.use({ viewport: { width: 1440, height: 1000 } });
for (const scene of scenes) {
  test(`guided scene: ${scene.id}`, async ({ page }) => {
    await page.addInitScript(() => {
      window.__ATLAS_TEST__ = true;
    });
    await page.goto('/demo/?version=original#' + scene.id);
    await expect(page.locator('#demo-stage')).toHaveAttribute('data-status', 'ready', {
      timeout: 30000,
    });
    await expect(page.locator('#scene-progress')).toHaveAttribute('aria-valuenow', '100');
    await expect(page.frameLocator('#guided-app').locator(scene.end).first()).toBeAttached();
    if (process.env.ATLAS_CAPTURE_DIR)
      await page.screenshot({ path: process.env.ATLAS_CAPTURE_DIR + '/' + scene.id + '.png' });
  });
}
test('presenter can take control, replay and skip supporting scenes', async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.goto('/demo/?version=original#money-feeling');
  await expect(page.locator('#demo-stage')).toHaveAttribute('data-status', 'ready');
  await page.getByRole('button', { name: 'Take control', exact: true }).click();
  await expect(page.locator('#guided-app')).not.toHaveAttribute('inert', '');
  await page.frameLocator('#guided-app').getByRole('button', { name: 'Done', exact: true }).click();
  await page.getByRole('button', { name: 'Replay', exact: false }).click();
  await expect(page.locator('#demo-stage')).toHaveAttribute('data-status', 'ready');
  await expect(page.frameLocator('#guided-app').locator('.feeling-saved')).toContainText('5');
  await page.goto('/demo/?version=original#the-system');
  await page.getByRole('button', { name: 'Go to closing' }).click();
  await expect(page).toHaveURL(/#closing$/);
  await page.keyboard.press('Home');
  await expect(page.locator('#narrative-0')).toBeVisible();
});
test('pause holds the choreography and next cancels it', async ({ page }) => {
  await page.goto('/demo/?version=original#a-familiar-start');
  await expect(page.locator('#demo-stage')).toHaveAttribute('data-status', 'playing');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const before = await page
    .frameLocator('#guided-app')
    .locator('body')
    .evaluate(() => window.atlas.getState().person);
  expect(before).toBe('alex');
  await page.waitForTimeout(4000);
  await expect(page.locator('#demo-stage')).toHaveAttribute('data-status', 'paused');
  expect(
    await page
      .frameLocator('#guided-app')
      .locator('body')
      .evaluate(() => window.atlas.getState().person),
  ).toBe(before);
  await page.getByRole('button', { name: 'Next slide', exact: true }).click();
  await expect(page).toHaveURL(/#contextual-support$/);
  await expect(page.locator('#demo-stage')).toHaveAttribute('data-status', 'playing');
  await page.getByRole('button', { name: 'Take control', exact: true }).click();
  await page.frameLocator('#guided-app').locator('[data-action="tab:you"]').click();
  await page.waitForTimeout(4500);
  await expect(page.frameLocator('#guided-app').locator('.you-page')).toBeVisible();
  await page
    .locator('#guided-app')
    .contentFrame()
    .locator('.you-page')
    .click({ position: { x: 10, y: 10 } });
  await page.keyboard.press('PageDown');
  await expect(page).toHaveURL(/#personal-numbers$/);
});
test('guided manual changes do not read or overwrite a normal saved session', async ({ page }) => {
  await page.goto('/demo/?version=original#slide-1');
  const sentinel = {
    schema: 1,
    scenarioVersion: 'isolation-test',
    state: { private: 'normal prototype' },
    savedAt: 123,
  };
  await page.evaluate(async (value) => {
    await new Promise<void>((resolve, reject) => {
      const r = indexedDB.open('hsbc-atlas-demo', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('sessions');
      r.onsuccess = () => {
        const db = r.result;
        const tx = db.transaction('sessions', 'readwrite');
        tx.objectStore('sessions').put(value, 'session');
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
      };
      r.onerror = () => reject(r.error);
    });
  }, sentinel);
  await page.goto('/demo/?version=original#human-support');
  await expect(page.locator('#demo-stage')).toHaveAttribute('data-status', 'ready');
  await page.getByRole('button', { name: 'Take control', exact: true }).click();
  await page.frameLocator('#guided-app').locator('[data-action="tab:you"]').click();
  await page.waitForTimeout(350);
  const stored = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const r = indexedDB.open('hsbc-atlas-demo', 1);
        r.onsuccess = () => {
          const db = r.result;
          const q = db.transaction('sessions').objectStore('sessions').get('session');
          q.onsuccess = () => {
            db.close();
            resolve(q.result);
          };
        };
      }),
  );
  expect(stored).toEqual(sentinel);
});
test('customer memory requires permission and retains the customer words', async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.goto('/demo/?version=original#customer-memory');
  await expect(page.locator('#demo-stage')).toHaveAttribute('data-status', 'ready');
  await expect(page.frameLocator('#guided-app').locator('.checkin-saved-list')).toContainText(
    'sunny kitchen',
  );
});
test('narrow view and reduced motion retain controls and the real prototype', async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/demo/?version=original#time-travel');
  await expect(page.locator('#demo-stage')).toHaveAttribute('data-status', 'ready', {
    timeout: 40000,
  });
  await expect(page.frameLocator('#guided-app').locator('#time-slider')).toHaveValue('168');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('#scroll-cue')).toBeVisible();
  await page.getByRole('button', { name: 'Next slide', exact: true }).click();
  await expect(page).toHaveURL(/#goal-possibilities$/);
});
test('comparison makes the customer change explicit and takeover removes the comparison', async ({
  page,
}) => {
  await page.goto('/demo/?version=original#a-familiar-start');
  await expect(page.locator('#device-slot')).toHaveAttribute('data-comparing', 'true', {
    timeout: 15000,
  });
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(page.locator('#main-identity')).toContainText('Sam · Now');
  await expect(page.locator('#compare-identity')).toContainText('Alex · Now');
  await expect(page.locator('#compare-device iframe')).toHaveAttribute('inert', '');
  await page.getByRole('button', { name: 'Take control', exact: true }).click();
  await expect(page.locator('#compare-device')).toHaveCount(0);
  await page.frameLocator('#guided-app').locator('[data-action="tab:you"]').click();
  await expect(page.locator('#main-identity')).toContainText('Sam · You');
});
test('number journey shows its entry, a readable close-up and the actual added widget', async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.goto('/demo/?version=original#personal-numbers');
  await expect(page.locator('.demo-touch:not([hidden])')).toBeVisible({ timeout: 15000 });
  await expect(page.frameLocator('#guided-app').locator('[data-action="gallery"]')).toBeVisible();
  await expect(page.locator('#guided-device')).toHaveAttribute('data-closeup', 'true', {
    timeout: 15000,
  });
  await expect(page.locator('.demo-camera')).toHaveCSS('transform', /^matrix\(1\.28,/);
  await expect(page.locator('.demo-focus')).toBeHidden();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const bounds = await page.locator('.demo-aperture').boundingBox();
  const widget = await page
    .frameLocator('#guided-app')
    .locator('.number-suggestion')
    .first()
    .boundingBox();
  expect(widget!.x).toBeGreaterThanOrEqual(bounds!.x);
  expect(widget!.x + widget!.width).toBeLessThanOrEqual(bounds!.x + bounds!.width + 1);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.locator('#demo-stage')).toHaveAttribute('data-status', 'ready', {
    timeout: 35000,
  });
  await expect(
    page.frameLocator('#guided-app').locator('.now-page [data-module="safetydays"]'),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Replay', exact: false }).click();
  await expect(page.frameLocator('#guided-app').locator('.now-page')).toBeVisible();
  await expect(
    page.frameLocator('#guided-app').locator('.now-page [data-module="safetydays"]'),
  ).toHaveCount(0);
});

test('animation progress follows playback, pauses, resets and is not a scrubber', async ({
  page,
}) => {
  await page.goto('/demo/?version=original#contextual-support');
  const progress = page.getByRole('progressbar', { name: 'Demo animation progress' });
  await expect
    .poll(async () => Number(await progress.getAttribute('aria-valuenow')))
    .toBeGreaterThan(5);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const held = await progress.getAttribute('aria-valuenow');
  const fill = await progress.locator('[data-state="current"]').getAttribute('style');
  await page.waitForTimeout(700);
  await expect(progress).toHaveAttribute('aria-valuenow', held!);
  await expect(progress.locator('[data-state="current"]')).toHaveAttribute('style', fill!);
  await expect(progress).not.toHaveAttribute('tabindex');
  expect(await progress.evaluate((el) => getComputedStyle(el).pointerEvents)).toBe('none');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.locator('#demo-stage')).toHaveAttribute('data-status', 'ready', {
    timeout: 20000,
  });
  await expect(progress).toHaveAttribute('aria-valuenow', '100');
  await expect(progress).toHaveAttribute('aria-valuetext', 'Demonstration complete');
  await page.getByRole('button', { name: 'Replay', exact: false }).click();
  await expect
    .poll(async () => Number(await progress.getAttribute('aria-valuenow')))
    .toBeLessThan(5);
  await expect(page.locator('#demo-stage')).toHaveAttribute('data-status', 'playing');
  await page.getByRole('button', { name: 'Take control', exact: true }).click();
  await expect(progress).toBeHidden();
});
