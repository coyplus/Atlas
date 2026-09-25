import { test, expect, type Page } from '@playwright/test';
async function revealCanvas(page: Page) {
  const grip = page.locator('.future-drawer-grip');
  await grip.focus();
  await grip.press('Home');
  await page.getByRole('button', { name: 'Fit all bubbles' }).click();
}
async function expandDrawer(page: Page) {
  const grip = page.locator('.future-drawer-grip');
  await grip.focus();
  await grip.press('End');
}
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?p=elena&theme=vanilla&tab=future');
  await page.waitForFunction(() => !!window.atlas);
});
test('Time Travel, combined ideas, collapse and deselection preserve the real plan', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const original = await page.evaluate(() =>
    JSON.stringify(window.atlas.getState().people.elena.l1),
  );
  await expect(page.locator('.future-orbit')).toHaveCount(4);
  await page.locator('#time-slider').evaluate((el: HTMLInputElement) => {
    el.value = '120';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(page.locator('#fg-moment')).toContainText('2036');
  await expect(page.locator('.fg-range')).toBeVisible();
  await expandDrawer(page);
  await page.locator('[data-action="future-try:closer-hup"]').click();
  await expect(page.locator('#support-dock')).toContainText('18mo earlier');
  await page.locator('[data-action="future-try:priority-ret"]').click();
  await expect(page.locator('.fg-footer [data-action="future-review"]')).toHaveText(
    'Review before applying',
  );
  await revealCanvas(page);
  expect(await page.evaluate(() => JSON.stringify(window.atlas.getState().people.elena.l1))).toBe(
    original,
  );
  await expandDrawer(page);
  await expect(page.locator('.fg-footer [data-action="future-review"]')).toHaveText(
    'Review before applying',
  );
  while (await page.locator('.fg-idea[aria-pressed="true"]').count()) {
    await page.locator('.fg-idea[aria-pressed="true"]').first().click();
  }
  await expect(page.locator('[data-action="future-reset"]')).toHaveCount(0);
  await expect(page.locator('.fg-footer [data-action="future-review"]')).toHaveCount(0);
  await expect(page.locator('#time-slider')).toHaveValue('120');
  expect(errors).toEqual([]);
});
test('conversational pause can be refined, reviewed and applied to existing Rules, then undone', async ({
  page,
}) => {
  await expandDrawer(page);
  await page.locator('#support-dock .support-avatar').click();
  await page.getByRole('button', { name: 'Explore with AI', exact: true }).click();
  await page.locator('#future-chat-input').fill('Pause my house upgrade for six months');
  await page.getByRole('button', { name: 'Explore this thought' }).click();
  await expect(page.locator('.fg-proposal')).toContainText('6 months');
  await page.locator('#future-chat-input').fill('Make it three months instead');
  await page.getByRole('button', { name: 'Explore this thought' }).click();
  await expect(page.locator('.fg-proposal')).toContainText('3 months');
  await page.locator('[data-action="future-proposal"]').click();
  await expect(page.locator('#support-dock')).toContainText('3mo later');
  await page.locator('.fg-footer [data-action="future-review"]').click();
  await page.locator('#future-approval').check();
  await page.locator('[data-action="future-commit"]').click();
  expect(
    await page.evaluate(
      () =>
        window.atlas.getState().people.elena.l1.rules.find((r: any) => r.potId === 'hup')?.resumeOn,
    ),
  ).toBe('2026-12-01');
  await expect(page.locator('.future-studio')).toHaveAttribute('data-has-experiments', 'false');
  await page.evaluate(() => window.atlas.dispatch('rules'));
  await expect(page.locator('.container-rule').filter({ hasText: 'House upgrade' })).toContainText(
    'resumes 2026-12-01',
  );
  await page.evaluate(() => {
    window.atlas.closeAll();
    window.atlas.dispatch('undo');
  });
  expect(
    await page.evaluate(
      () =>
        window.atlas.getState().people.elena.l1.rules.find((r: any) => r.potId === 'hup')?.resumeOn,
    ),
  ).toBeUndefined();
});
test('new goals stay in the preview until approval and appear in the existing Pots afterwards', async ({
  page,
}) => {
  await page.locator('[data-action="future-add"]').first().click();
  await page.getByRole('button', { name: 'Create my own', exact: true }).click();
  await page.locator('[name="name"]').fill('A long summer');
  await page.getByRole('button', { name: 'Try this in my future' }).click();
  await expect(page.locator('.future-orbit')).toHaveCount(5);
  expect(await page.evaluate(() => window.atlas.getState().people.elena.l1.pots.length)).toBe(4);
  await page.locator('.fg-footer [data-action="future-review"]').click();
  await page.locator('#future-approval').check();
  await page.locator('[data-action="future-commit"]').click();
  expect(
    await page.evaluate(() =>
      window.atlas.getState().people.elena.l1.pots.some((g: any) => g.name === 'A long summer'),
    ),
  ).toBe(true);
});
test('all personas and narrow layouts keep circles legible, contained and controls reachable', async ({
  page,
}, info) => {
  for (const person of ['alex', 'jordan', 'sam', 'elena']) {
    await page.evaluate((person) => window.atlas.go(person, 'future'), person);
    if (person === 'alex') await page.locator('[data-action="future-studio"]').click();
    const sizes = await page.locator('.future-orbit').evaluateAll((es) =>
      es.map((e) => {
        let r = e.getBoundingClientRect();
        return [r.width, r.height, r.left, r.right];
      }),
    );
    for (const [w, h, l, r] of sizes) {
      expect(Math.abs(w - h)).toBeLessThan(1);
      expect(l).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(page.viewportSize()!.width);
    }
    await expandDrawer(page);
    await page.locator('.fg-idea').first().click();
    await expect(page.locator('.fg-footer [data-action="future-review"]')).toBeEnabled();
    await page.screenshot({ path: `/tmp/future-${person}-${info.project.name}.png` });
  }
  await page.setViewportSize({ width: 320, height: 700 });
  await page.evaluate(() => window.atlas.go('sam', 'future'));
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
  await expect(page.locator('.future-drawer')).toBeVisible();
  await page.screenshot({ path: `/tmp/future-narrow-${info.project.name}.png` });
});

test('bubbles use the actual Pot detail in the baseline and an experiment, preserving the future on Back', async ({
  page,
}) => {
  await page.evaluate(() => window.atlas.go('elena', 'now'));
  await page.evaluate(() => window.atlas.dispatch('pot:hup'));
  const actualPot = await page.locator('.container-detail').innerHTML();
  await page.evaluate(() => {
    window.atlas.closeAll();
    window.atlas.go('elena', 'future');
  });
  await page.locator('#time-slider').evaluate((el: HTMLInputElement) => {
    el.value = '120';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await revealCanvas(page);
  await page.locator('[data-action="future-goal:hup"]').click();
  await expect(page.locator('.container-detail')).toHaveAttribute('data-container', 'hup');
  expect(await page.locator('.container-detail').innerHTML()).toBe(actualPot);
  await expect(page.locator('.fg-detail')).toHaveCount(0);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.locator('#time-slider')).toHaveValue('120');
  await expandDrawer(page);
  await page.locator('[data-action="future-try:closer-hup"]').click();
  await revealCanvas(page);
  await page.locator('[data-action="future-goal:hup"]').click();
  expect(await page.locator('.container-detail').innerHTML()).toBe(actualPot);
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.locator('.fg-footer [data-action="future-review"]')).toHaveText(
    'Review before applying',
  );
  await expandDrawer(page);
  await page.locator('[data-action="future-try:priority-ret"]').click();
  await expect(page.locator('#support-dock')).toContainText('earlier');
  await expect(page.locator('.future-drawer-body [data-action="future-goals"]')).toHaveCount(0);
  while (await page.locator('.fg-idea[aria-pressed="true"]').count()) {
    await page.locator('.fg-idea[aria-pressed="true"]').first().click();
  }
  await expect(page.locator('[data-action="future-reset"]')).toHaveCount(0);
  await expect(page.locator('.future-orbit')).toHaveCount(4);
});

test('an uncommitted goal opens plan review without creating a real Pot', async ({ page }) => {
  await page.locator('[data-action="future-add"]').first().click();
  await page.getByRole('button', { name: 'Create my own', exact: true }).click();
  await page.locator('[name="name"]').fill('A new adventure');
  await page.getByRole('button', { name: 'Try this in my future' }).click();
  await revealCanvas(page);
  await page.locator('.future-orbit').filter({ hasText: 'A new adventure' }).click();
  await expect(page.locator('.fg-review-list')).toContainText('A new adventure');
  await expect(page.locator('.container-detail')).toHaveCount(0);
  expect(await page.evaluate(() => window.atlas.getState().people.elena.l1.pots.length)).toBe(4);
});

test('balance areas, target rings, fixed type, zoom limits and drag safety', async ({ page }) => {
  const diameter = (id: string) =>
    page
      .locator(`#future-bubble-${id} .future-value`)
      .evaluate((e) => e.getBoundingClientRect().width);
  const investment = await diameter('inv'),
    house = await diameter('hup');
  expect((investment / house) ** 2).toBeCloseTo(182400 / 42000, 1);
  const target = await page
    .locator('#future-bubble-hup .future-target')
    .evaluate((e) => e.getBoundingClientRect().width);
  expect((target / house) ** 2).toBeCloseTo(60000 / 42000, 1);
  await expect(page.locator('#future-bubble-inv .future-target')).toHaveCount(0);
  await expect(page.locator('#future-bubble-fam')).toHaveAttribute('data-labels', 'false');
  const font = await page
    .locator('#future-bubble-inv b')
    .evaluate((e) => getComputedStyle(e).fontSize);
  await page.locator('#future-stage').focus();
  for (let i = 0; i < 12; i++) await page.locator('#future-stage').press('+');
  await expect(page.getByRole('button', { name: 'Zoom in', exact: true })).toHaveCount(0);
  await expect(page.locator('#future-stage')).toHaveAttribute('data-zoom', '32');
  await expect(page.locator('#future-bubble-fam')).toHaveAttribute('data-labels', 'true');
  expect(
    await page.locator('#future-bubble-inv b').evaluate((e) => getComputedStyle(e).fontSize),
  ).toBe(font);
  await page.getByRole('button', { name: 'Fit all bubbles' }).click();
  const chart = page.locator('#future-stage'),
    rect = await chart.boundingBox();
  await page.mouse.move(rect!.x + rect!.width / 2, rect!.y + 260);
  await page.mouse.down();
  await page.mouse.move(rect!.x + rect!.width / 2 + 55, rect!.y + 260 + 20, {
    steps: 8,
  });
  await page.mouse.up();
  await expect(page.locator('.container-detail')).toHaveCount(0);
  await page.getByRole('button', { name: 'Fit all bubbles' }).click();
  await page.locator('#time-slider').evaluate((el: HTMLInputElement) => {
    el.value = '120';
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  expect(await diameter('inv')).toBeGreaterThan(investment);
  await expect(page.locator('#fg-tick-fam .icon')).toHaveCount(1);
  await expect(page.locator('#future-bubble-hup')).toHaveClass(/is-complete/);
});

test('two-finger pinch zooms the chart without changing the future or opening a Pot', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'Chromium protocol provides real multi-touch injection.');
  await page.locator('#future-stage').scrollIntoViewIfNeeded();
  const rect = (await page.locator('#future-stage').boundingBox())!;
  const x = rect.x + rect.width / 2,
    y = (await page.locator('.fg-field-add').boundingBox())!.y + 110;
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [
      { x: x - 30, y, id: 1 },
      { x: x + 30, y, id: 2 },
    ],
  });
  for (let d = 35; d <= 70; d += 5)
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        { x: x - d, y, id: 1 },
        { x: x + d, y, id: 2 },
      ],
    });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  expect(Number(await page.locator('#future-stage').getAttribute('data-zoom'))).toBeGreaterThan(
    1.8,
  );
  await expect(page.locator('.container-detail')).toHaveCount(0);
  await expect(page.locator('#time-slider')).toHaveValue('0');
  await expect(page.locator('#support-dock')).toHaveAttribute('data-state', 'compact');
});

test('canvas fills the screen and drawer snaps without moving the timeline or banking data', async ({
  page,
}) => {
  const canvas = await page.locator('#future-stage').boundingBox(),
    phone = await page.locator('#phone').boundingBox();
  expect(canvas!.width).toBeGreaterThan(phone!.width - 16);
  expect(canvas!.height).toBeGreaterThan(phone!.height - 95);
  const original = await page.evaluate(() =>
    JSON.stringify(window.atlas.getState().people.elena.l1),
  );
  const grip = page.locator('.future-drawer-grip');
  await grip.focus();
  await grip.press('Home');
  await expect(page.locator('.future-drawer')).toHaveAttribute('data-state', 'docked');
  await expect(page.locator('#time-slider')).not.toBeVisible();
  await grip.press('ArrowUp');
  await expect(page.locator('#time-slider')).toBeVisible();
  await expect(page.locator('.future-drawer-invitation')).toBeVisible();
  await expect(page.locator('.future-drawer-body')).toHaveAttribute('inert');
  await grip.press('End');
  await expect(page.locator('.future-drawer')).toHaveAttribute('data-state', 'expanded');
  await expect(page.locator('.future-drawer-body')).not.toHaveAttribute('inert');
  await page.locator('[data-action="future-speed"]').click();
  await expect(page.locator('.fg-detail')).toBeVisible();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.locator('.future-drawer')).toHaveAttribute('data-state', 'expanded');
  const box = (await grip.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2,
    (await page.locator('#phone').boundingBox())!.y +
      (await page.locator('#phone').boundingBox())!.height -
      95,
    { steps: 12 },
  );
  await page.mouse.up();
  await expect(page.locator('.future-drawer')).toHaveAttribute('data-state', 'docked');
  await expect(page.locator('#time-slider')).toHaveValue('0');
  expect(await page.evaluate(() => JSON.stringify(window.atlas.getState().people.elena.l1))).toBe(
    original,
  );
  await expect(page.locator('.container-detail')).toHaveCount(0);
});

test('one Future keeps ideas in play, previews rule counts and leads with age', async ({
  page,
}) => {
  await expect(page.getByRole('group', { name: 'Future mode' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Zoom out', exact: true })).toHaveCount(0);
  await expect(page.locator('.fg-field-add')).toContainText('Goal');
  await expect(page.locator('.future-age')).toContainText('47');
  await expandDrawer(page);
  await expect(page.locator('.fg-years,.fg-sandbox-tools,.fg-footnote,.future-key')).toHaveCount(0);
  await expect(
    page.locator(
      '.future-drawer-body [data-action="future-goals"],.future-drawer-body [data-action="future-chat"]',
    ),
  ).toHaveCount(0);
  const type = await page
    .locator('.fg-idea')
    .first()
    .evaluate((el) =>
      ['b', 'small', 'em'].map((tag) =>
        parseFloat(getComputedStyle(el.querySelector(tag)!).fontSize),
      ),
    );
  expect(type.every((size) => size >= 14)).toBe(true);
  await page.locator('[data-action="future-try:roundup-hup"]').click();
  await expect(page.locator('#future-commitments')).toContainText('£870');
  await expect(page.locator('#future-commitments')).toContainText('3 → 4');
  await expect(page.locator('.future-studio')).toHaveAttribute('data-has-experiments', 'true');
  await revealCanvas(page);
  await expandDrawer(page);
  await expect(page.locator('[data-action="future-try:roundup-hup"]')).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.locator('#time-slider').focus();
  await page.locator('#time-slider').press('End');
  await expect(page.locator('.future-age')).toContainText('67');
  await expect(page.locator('.future-time-track')).toHaveAttribute('style', /100%/);
  await page.locator('.fg-footer [data-action="future-review"]').click();
  await expect(page.locator('.fg-review-list')).toContainText('capped at £30');
  await expect(page.locator('.fg-review-list')).toContainText('actual saving depends on spending');
  expect(
    await page.evaluate(() =>
      window.atlas.getState().people.elena.l1.rules.some((r: any) => r.type === 'round-up'),
    ),
  ).toBe(false);
});

test('milestone taps share capsule geometry and dockable drawer controls', async ({ page }) => {
  await page.evaluate(() => window.atlas.go('sam', 'future'));
  const grip = page.locator('.future-drawer-grip');
  await grip.focus();
  await grip.press('Home');
  await expect(page.locator('.future-drawer')).toHaveAttribute('data-state', 'docked');
  await expect(page.locator('.future-drawer-invitation')).not.toBeVisible();
  await grip.press('ArrowUp');
  await expect(page.locator('.future-drawer')).toHaveAttribute('data-state', 'timeline');
  const icons = await page
    .locator('.future-milestone:not(.is-ghost)')
    .evaluateAll((es) => es.map((e) => e.id));
  for (const id of icons) {
    await page.locator(`[id="${id}"]`).click();
    const geometry = await page.locator('.future-time-track').evaluate((el) => {
      const slider = el.querySelector('input')!,
        fill = el.querySelector('.future-time-fill')!;
      return {
        actual: fill.getBoundingClientRect().width,
        expected: 38 + ((slider.getBoundingClientRect().width - 38) * Number(slider.value)) / 240,
      };
    });
    expect(Math.abs(geometry.actual - geometry.expected)).toBeLessThan(1);
  }
  const labels = await page.locator('.future-milestones').evaluate((el) => {
    const top = el.getBoundingClientRect().top;
    return [...el.querySelectorAll('.future-milestone')].every(
      (marker) => marker.getBoundingClientRect().top >= top,
    );
  });
  expect(labels).toBe(true);
  await expandDrawer(page);
  const goal = await page.locator('.fg-field-add').boundingBox(),
    fit = await page.getByRole('button', { name: 'Fit all bubbles' }).boundingBox();
  expect(Math.abs(goal!.y + goal!.height / 2 - fit!.y - fit!.height / 2)).toBeLessThan(1);
  await expect(page.locator('[data-action="future-reset"]')).toHaveCount(0);
});

test('starlight accelerates with travel, stays inside the fill and respects reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const rate = () =>
    page
      .locator('.future-time-track')
      .evaluate((el) => Number((el as HTMLElement).dataset.warpRate));
  const initial = await rate();
  await page.locator('#time-slider').focus();
  await page.locator('#time-slider').press('End');
  expect(await rate()).toBeGreaterThan(initial);
  await expect
    .poll(() => page.locator('.future-starlight').evaluate((el) => el.getAnimations().length))
    .toBe(1);
  const start = await page
    .locator('.future-starlight')
    .evaluate((el) => Number(el.getAnimations()[0].currentTime));
  await expect
    .poll(() =>
      page.locator('.future-starlight').evaluate((el) => Number(el.getAnimations()[0].currentTime)),
    )
    .toBeGreaterThan(start);
  await expect(page.locator('.future-time-fill')).toHaveCSS('overflow', 'hidden');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.future-starlight')).toHaveCSS('display', 'none');
  await expect
    .poll(() => page.locator('.future-starlight').evaluate((el) => el.getAnimations().length))
    .toBe(0);
});

test('combined What If impacts and future Money Speed agree with the selected timeline', async ({
  page,
}) => {
  await page.evaluate(() => window.atlas.go('sam', 'future'));
  await expandDrawer(page);
  await page.locator('[data-action="future-try:closer-ef"]').click();
  await page.locator('[data-action="future-try:roundup-ef"]').click();
  const effects = await page.locator('.fg-idea[aria-pressed="true"] em').allTextContents();
  expect(new Set(effects).size).toBe(1);
  expect(effects[0]).toContain('Together:');
  const milestone = await page.locator('#fg-tick-ef').getAttribute('aria-label');
  expect(effects[0].replace('Together: ', '').replace(/ months/g, 'mo')).toContain(
    milestone!.split(' · ').at(-1)!,
  );
  await page.locator('[data-action="future-try:pause-ef"]').click();
  for (const month of [3, 12]) {
    await page.evaluate((m) => window.atlas.setT(m), month);
    await page.locator('[data-action="future-speed"]').click();
    const total = Number((await page.locator('.fg-detail h2').innerText()).replace(/[^\d.]/g, ''));
    const rows = (await page.locator('.fg-flow-row strong').allTextContents()).reduce(
      (sum, text) => sum + Number(text.replace(/[^\d.]/g, '')),
      0,
    );
    expect(rows).toBe(total);
    if (month === 12) await expect(page.locator('.fg-flow')).not.toContainText('Scheduled pause');
    await page.getByRole('button', { name: 'Back', exact: true }).click();
  }
  await page.evaluate(() => window.atlas.setT(240));
  await expect(page.locator('#time-slider')).toHaveValue('240');
});
