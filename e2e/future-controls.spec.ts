import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?p=sam&theme=vanilla&tab=future');
  await page.waitForFunction(() => !!window.atlas);
});

test('every suggested possibility uses plus, while real Pots keep their identity', async ({
  page,
}) => {
  for (const selector of ['.future-ghost .icon', '.future-milestone.is-ghost .icon']) {
    const symbols = await page
      .locator(selector)
      .evaluateAll((es) => es.map((e) => e.getAttribute('data-material')));
    expect(symbols.length).toBeGreaterThan(0);
    expect(new Set(symbols)).toEqual(new Set(['add']));
  }
  await expect(page.locator('#future-bubble-house .icon')).toHaveAttribute('data-material', 'home');
  await page.locator('[data-action="future-add"]').click();
  const discovery = await page
    .locator('.possibility-art .icon')
    .evaluateAll((es) => es.map((e) => e.getAttribute('data-material')));
  expect(new Set(discovery)).toEqual(new Set(['add']));
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await page.locator('#fg-tick-horizon-family-adventure').click();
  await expect(page.locator('.horizon-when .icon')).toHaveAttribute('data-material', 'add');
});

test('swiping down docks the drawer to its handle and reopening preserves the selected time', async ({
  page,
}) => {
  await page.evaluate(() => window.atlas.setT(96));
  const before = await page.evaluate(() => JSON.stringify(window.atlas.getState().people.sam.l1));
  const grip = page.locator('.future-drawer-grip');
  const box = (await grip.boundingBox())!,
    nav = (await page.locator('.tabbar').boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, nav.y - 8, { steps: 15 });
  await page.mouse.up();
  await expect(page.locator('.future-drawer')).toHaveAttribute('data-state', 'docked');
  expect((await page.locator('.future-drawer').boundingBox())!.height).toBeLessThanOrEqual(45);
  await expect(page.locator('.future-drawer-summary')).toHaveAttribute('inert');
  await expect(page.locator('#time-slider')).not.toBeVisible();
  await expect(page.locator('.future-drawer-invitation')).not.toBeVisible();
  await expect(page.locator('.future-drawer-body')).not.toBeVisible();
  await expect(grip).toBeVisible();
  await grip.focus();
  await grip.press('ArrowUp');
  await expect(page.locator('.future-drawer')).toHaveAttribute('data-state', 'timeline');
  await expect(page.locator('#time-slider')).toBeVisible();
  await expect(page.locator('#time-slider')).toHaveValue('96');
  expect(await page.evaluate(() => JSON.stringify(window.atlas.getState().people.sam.l1))).toBe(
    before,
  );
});

test('scenario changes reset the dirty native thumb, fill, date and warp together', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  for (const route of ['person:elena', 'go:sam', 'go:jordan', 'person:sam']) {
    await page.locator('#time-slider').focus();
    await page.locator('#time-slider').press('End');
    await expect(page.locator('#time-slider')).toHaveValue('240');
    await page.evaluate((route) => {
      const [kind, person] = route.split(':');
      if (kind === 'person') window.atlas.dispatch(route);
      else window.atlas.go(person, 'future');
    }, route);
    await expect(page.locator('#time-slider')).toHaveValue('0');
    await expect(page.locator('.fg-date > small')).toHaveText('Today');
    await expect(page.locator('#time-slider')).toHaveAttribute('aria-valuetext', /^Today, age /);
    await expect(page.locator('.future-time-track')).toHaveAttribute('data-warp-rate', '0.40');
    const size = await page.locator('.future-time-fill').boundingBox();
    expect(size!.width).toBeCloseTo(size!.height, 0);
    expect(await page.evaluate(() => window.atlas.getState().month)).toBe(0);
  }
  for (const month of [0, 1, 12, 120, 240]) {
    await page.evaluate((m) => window.atlas.setT(m), month);
    const geometry = await page.locator('.future-time-track').evaluate((el) => {
      const fill = el.querySelector('.future-time-fill')!,
        slider = el.querySelector('input')!;
      return {
        width: fill.getBoundingClientRect().width,
        height: fill.getBoundingClientRect().height,
        track: el.clientWidth,
        value: Number(slider.value),
        radius: parseFloat(getComputedStyle(fill).borderTopLeftRadius),
      };
    });
    expect(geometry.width).toBeGreaterThanOrEqual(geometry.height);
    expect(geometry.width).toBeCloseTo(38 + ((geometry.track - 38) * month) / 240, 0);
    expect(geometry.radius).toBeGreaterThanOrEqual(geometry.height / 2);
  }
});

test('Pot colours edit in place, preserve photos and money, and the final detail row is reachable', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  const original = await page.evaluate(() => JSON.stringify(window.atlas.getState().people.sam.l1));
  await page.locator('#future-bubble-hol').click();
  await expect(page.locator('.pot-colour-control summary')).toContainText('Apricot');
  await page.locator('.pot-colour-control summary').click();
  await page
    .locator('.pot-inline-colours')
    .getByRole('button', { name: 'Rose', exact: true })
    .click();
  await expect(page.locator('.pot-colour-control summary')).toContainText('Rose');
  await expect(
    page.locator('.pot-inline-colours').getByRole('button', { name: 'Rose', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  const appearance = await page.evaluate(
    () => window.atlas.getState().people.sam.ui.potAppearance.hol,
  );
  expect(appearance).toEqual({ colour: 'rose', photo: '/assets/stories/horizon.jpg' });
  expect(await page.evaluate(() => JSON.stringify(window.atlas.getState().people.sam.l1))).toBe(
    original,
  );
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.locator('#fg-tick-hol')).toHaveCSS('--pot-colour', '#ad617d');
  for (const [person, pot, tab] of [
    ['sam', 'hol', 'future'],
    ['elena', 'fam', 'future'],
    ['jordan', 'house', 'now'],
  ]) {
    await page.evaluate(
      ({ person, pot, tab }) => {
        window.atlas.go(person, tab);
        window.atlas.dispatch('pot:' + pot);
      },
      { person, pot, tab },
    );
    const sheet = page.locator('.sheet-body');
    await sheet.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    const finalRow = await page.locator('[data-container-section="activity"]').boundingBox(),
      viewport = await page.locator('.sheet-body').boundingBox();
    await expect(page.locator('.tabbar')).toBeHidden();
    expect(finalRow!.y + finalRow!.height).toBeLessThanOrEqual(viewport!.y + viewport!.height);
    await expect(page.locator('[data-container-section="activity"]')).toBeVisible();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
  }
});
