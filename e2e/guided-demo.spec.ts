import { test, expect } from '@playwright/test';
import { scenes } from '../src/demo/scenes';
test.use({ viewport: { width: 1440, height: 1000 } });
for (const scene of scenes) {
  test(`guided scene: ${scene.id}`, async ({ page }) => {
    await page.addInitScript(() => {
      window.__ATLAS_TEST__ = true;
    });
    await page.goto('/demo/#' + scene.id);
    await expect(page.locator('#demo-stage')).toHaveAttribute('data-status', 'ready', {
      timeout: 30000,
    });
    await expect(page.frameLocator('#guided-app').locator(scene.end).first()).toBeAttached();
    if (process.env.ATLAS_CAPTURE_DIR)
      await page.screenshot({ path: process.env.ATLAS_CAPTURE_DIR + '/' + scene.id + '.png' });
  });
}
test('presenter can take control, replay and skip supporting scenes', async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.goto('/demo/#money-feeling');
  await expect(page.locator('#demo-stage')).toHaveAttribute('data-status', 'ready');
  await page.getByRole('button', { name: 'Take control', exact: true }).click();
  await expect(page.locator('#guided-app')).not.toHaveAttribute('inert', '');
  await page.frameLocator('#guided-app').getByRole('button', { name: 'Done', exact: true }).click();
  await page.getByRole('button', { name: 'Replay', exact: false }).click();
  await expect(page.locator('#demo-stage')).toHaveAttribute('data-status', 'ready');
  await expect(page.frameLocator('#guided-app').locator('.feeling-saved')).toContainText('5');
  await page.goto('/demo/#the-system');
  await page.getByRole('button', { name: 'Go to closing' }).click();
  await expect(page).toHaveURL(/#closing$/);
  await page.keyboard.press('Home');
  await expect(page.locator('#narrative-0')).toBeVisible();
});
test('pause holds the choreography and next cancels it', async ({ page }) => {
  await page.goto('/demo/#a-familiar-start');
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
  await page.goto('/demo/#slide-1');
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
  await page.goto('/demo/#human-support');
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
  await page.goto('/demo/#customer-memory');
  await expect(page.locator('#demo-stage')).toHaveAttribute('data-status', 'ready');
  await expect(page.frameLocator('#guided-app').locator('.checkin-saved-list')).toContainText(
    'sunny kitchen',
  );
});
test('narrow view and reduced motion retain controls and the real prototype', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/demo/#time-travel');
  await expect(page.locator('#demo-stage')).toHaveAttribute('data-status', 'ready', {
    timeout: 20000,
  });
  await expect(page.frameLocator('#guided-app').locator('#time-slider')).toHaveValue('168');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await expect(page.locator('#scroll-cue')).toBeVisible();
  await page.getByRole('button', { name: 'Next slide', exact: true }).click();
  await expect(page).toHaveURL(/#goal-possibilities$/);
});
