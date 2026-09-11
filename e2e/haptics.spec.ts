import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
    localStorage.setItem('atlas-haptics', 'on');
    (window as any).hapticPulses = [];
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: (pattern: number[]) => {
        (window as any).hapticPulses.push(pattern);
        return true;
      },
    });
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?p=sam&tab=you&theme=vanilla');
  await page.waitForFunction(() => !!window.atlas);
});
test('a daily check-in emits one success; answers, Points accompaniment, Done and revisit do not stack cues', async ({
  page,
}) => {
  await page.locator('.checkin-entry').click();
  await page.locator('.toolkit-card[data-action="feeling"]').click();
  await page.locator('[data-action="feeling-select:calm"]').click();
  await page.locator('[data-action="feeling-next"]').click();
  expect(await page.evaluate(() => (window as any).hapticPulses)).toEqual([]);
  await page.locator('[data-action="feeling-save"]').click();
  await expect(page.locator('.feeling-saved')).toContainText('+5 HSBC Points');
  expect(await page.evaluate(() => (window as any).hapticPulses)).toEqual([[10, 40, 10]]);
  await page.locator('[data-action="feeling-done"]').click();
  await page.locator('.checkin-entry').click();
  expect(await page.evaluate(() => (window as any).hapticPulses)).toEqual([[10, 40, 10]]);
});
test('What If is a light selection, failed commitment is attention, ordinary tabs remain silent', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Future', exact: true }).click();
  expect(await page.evaluate(() => (window as any).hapticPulses)).toEqual([]);
  await page.locator('.future-drawer-invitation').click();
  await page.locator('[data-action="future-try:closer-ef"]').click();
  expect(await page.evaluate(() => (window as any).hapticPulses)).toEqual([[6]]);
  await page.waitForTimeout(250); // Beyond the global anti-overlap window.
  await page.evaluate(() => {
    try {
      window.atlas.dispatch('future-commit');
    } catch {}
  });
  expect(await page.evaluate(() => (window as any).hapticPulses)).toEqual([[6], [18, 65, 10]]);
});
test('unsupported browsers show an honest unavailable setting; Reduced Motion suppresses patterns', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('button', { name: 'Future', exact: true }).click();
  await page.locator('.future-drawer-invitation').click();
  await page.locator('[data-action="future-try:closer-ef"]').click();
  expect(
    await page.evaluate(() => (window as any).hapticPulses.filter((x: unknown) => x !== 0)),
  ).toEqual([]);
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'vibrate', { configurable: true, value: undefined });
  });
  await page.getByRole('button', { name: 'HSBC Atlas demo options' }).click();
  await expect(page.getByLabel('Haptic feedback')).toBeDisabled();
  await expect(page.locator('.demo-menu')).toContainText('This browser does not support haptics');
});

test('Time Travel initialization is silent and a jump across several goals is one tick', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Future', exact: true }).click();
  await page.evaluate(() => window.atlas.setT(0));
  expect(await page.evaluate(() => (window as any).hapticPulses)).toEqual([]);
  await page.locator('#time-slider').focus();
  await page.locator('#time-slider').press('End');
  expect(await page.evaluate(() => (window as any).hapticPulses)).toEqual([[6]]);
  await page.evaluate(() => window.atlas.setT(0));
  expect(await page.evaluate(() => (window as any).hapticPulses)).toEqual([[6]]);
});

test('an applied future plan gets commitment feedback while reviewing remains silent', async ({
  page,
}) => {
  await page.getByRole('button', { name: 'Future', exact: true }).click();
  await page.locator('.future-drawer-invitation').click();
  await page.locator('[data-action="future-try:closer-ef"]').click();
  await page.getByRole('button', { name: 'Review before applying', exact: true }).click();
  expect(await page.evaluate(() => (window as any).hapticPulses)).toEqual([[6]]);
  await page.locator('#future-approval').check();
  await page.waitForTimeout(250);
  await page.locator('[data-action="future-commit"]').click();
  expect(await page.evaluate(() => (window as any).hapticPulses)).toEqual([[6], [14]]);
});

test('a widget receives a snap only when its persisted position changes', async ({ page }) => {
  await page.getByRole('button', { name: 'Now', exact: true }).click();
  await page.evaluate(() => {
    const p = (window.atlas.getState() as any).people.sam;
    window.atlas.dispatch('reorder-numbers:' + p.ui.order.join(','));
  });
  expect(await page.evaluate(() => (window as any).hapticPulses)).toEqual([]);
  await page.evaluate(() => {
    const p = (window.atlas.getState() as any).people.sam;
    const order = [...p.ui.order];
    [order[0], order[1]] = [order[1], order[0]];
    window.atlas.dispatch('reorder-numbers:' + order.join(','));
  });
  expect(await page.evaluate(() => (window as any).hapticPulses)).toEqual([[10]]);
});
