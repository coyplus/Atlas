import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
    sessionStorage.setItem('atlas-welcome-seen', 'yes');
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
});
test('focused goals react to time and contributions, support conversation, and stay previews', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const person of ['alex', 'jordan', 'sam', 'elena']) {
    await page.goto('/?p=' + person + '&tab=future&theme=vanilla');
    await page.waitForFunction(() => !!window.atlas);
    const before = await page.evaluate(
      (person) => JSON.stringify((window.atlas.getState() as any).people[person].l1),
      person,
    );
    await page.evaluate(() => window.atlas.dispatch('future-add'));
    await page.locator('.possibility-open').first().click();
    await page.locator('[name="name"]').fill('Time for myself');
    await page.locator('[name="target"]').fill('2400');
    await page.locator('[name="amount"]').fill('100');
    await page.locator('#goal-time').evaluate((el: HTMLInputElement) => {
      el.value = '12';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await expect(page.locator('.goal-session-orbit-copy strong')).toHaveText('£1,200');
    await page.locator('[name="amount"]').fill('200');
    await expect(page.locator('.goal-session-orbit-copy strong')).toHaveText('£2,400');
    await expect(page.locator('#support-dock')).toBeVisible();
    await page.locator('#support-dock .support-summary').click();
    await expect(page.locator('.chat-thread')).toContainText('£200');
    await expect(page.locator('.chat-thread')).toContainText('Time for myself');
    await page.locator('#chat-input').fill('What about £25 a month?');
    await page.locator('#chat-form button[type=submit]').click();
    await expect(page.locator('.chat-thread')).toContainText('I haven’t changed your draft.');
    await page.evaluate(() => window.atlas.dispatch('close'));
    await expect(page.locator('[name="amount"]')).toHaveValue('200');
    await page.locator('[name=target]').fill('');
    await page.locator('#goal-time').evaluate((el: HTMLInputElement) => {
      el.value = '24';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await expect(page.locator('.goal-session-orbit-copy strong')).toHaveText('£4,800');
    expect(
      await page.evaluate(
        (person) => JSON.stringify((window.atlas.getState() as any).people[person].l1),
        person,
      ),
    ).toBe(before);
    await page.getByRole('button', { name: 'Try this in my future', exact: true }).click();
    const result = await page.evaluate((person) => {
      const s = window.atlas.getState() as any;
      return {
        l1: JSON.stringify(s.people[person].l1),
        idea: s.people[person].ui.future.ideas.at(-1),
        month: s.month,
      };
    }, person);
    expect(result.l1).toBe(before);
    expect(result.idea.target).toBe(0);
    expect(result.idea.amount).toBe(200);
    expect(result.month).toBe(24);
  }
  expect(errors).toEqual([]);
});
test('new targetless Pot follows the same preview and approval projection', async ({ page }) => {
  await page.goto('/?p=sam&tab=future&theme=vanilla');
  await page.waitForFunction(() => !!window.atlas);
  await page.evaluate(() => window.atlas.dispatch('future-own'));
  await page.locator('[name="name"]').fill('Room for life');
  await page.getByRole('button', { name: 'Try this in my future', exact: true }).click();
  await page.evaluate(() => window.atlas.dispatch('future-review'));
  await expect(page.locator('.sheet-body')).toContainText('open-ended Pot');
  await page.locator('#future-approval').check();
  await page.locator('[data-action="future-commit"]').click();
  const pot = await page.evaluate(() =>
    (window.atlas.getState() as any).people.sam.l1.pots.find(
      (g: any) => g.name === 'Room for life',
    ),
  );
  expect(pot.target).toBe(0);
  expect(pot.balance).toBe(0);
  expect(pot.stopsAtTarget).toBe(false);
});

test('Alex can explore investing, with growing bubbles and the shared Time Travel control', async ({
  page,
}) => {
  await page.goto('/?p=alex&tab=future&theme=vanilla');
  await page.waitForFunction(() => !!window.atlas);
  await page.evaluate(() => window.atlas.dispatch('future-add'));
  await page.locator('.sheet [data-action="future-possibility:investing-curiosity"]').click();
  await expect(page.locator('.goal-session-arrival')).toBeVisible();
  await expect(page.locator('.future-time-track .future-starlight')).toBeAttached();
  const travel = async (month: string) =>
    page.locator('#goal-time').evaluate((el: HTMLInputElement, m) => {
      el.value = m;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, month);
  await travel('12');
  const small = await page
    .locator('.goal-session-orbit')
    .evaluate((e) => e.getBoundingClientRect().width);
  await travel('120');
  const large = await page
    .locator('.goal-session-orbit')
    .evaluate((e) => e.getBoundingClientRect().width);
  expect(large).toBeGreaterThan(small + 30);
  await page.getByRole('button', { name: 'Try this in my future', exact: true }).click();
  expect(
    await page.evaluate(
      () => (window.atlas.getState() as any).people.alex.ui.future.ideas.at(-1).investment,
    ),
  ).toBe(true);
});

test('proportional growth, compact controls and automatic fit on returning to Future', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/?p=sam&tab=future&theme=vanilla');
  await page.waitForFunction(() => !!window.atlas);
  await page.locator('#future-stage').focus();
  await page.locator('#future-stage').press('+');
  await page.evaluate(() => window.atlas.dispatch('future-own'));
  await page.locator('[name=name]').fill('A growing future');
  const control = await page.locator('[name=amount]').boundingBox(),
    slider = await page.locator('#goal-time').boundingBox();
  expect(control!.y).toBeLessThan(slider!.y);
  expect(slider!.y + slider!.height).toBeLessThan(812);
  await page.locator('#goal-time').evaluate((e: HTMLInputElement) => {
    e.value = '48';
    e.dispatchEvent(new Event('input', { bubbles: true }));
  });
  const sizes = await page.evaluate(() =>
    [
      document.querySelector('.goal-session-orbit')!,
      document.querySelector('.goal-reference')!,
    ].map((e) => e.getBoundingClientRect().width),
  );
  expect((sizes[0] / sizes[1]) ** 2).toBeCloseTo(4, 3);
  await page.getByRole('button', { name: 'Try this in my future', exact: true }).click();
  await expect(page.locator('#future-stage')).toHaveAttribute('data-zoom', '1');
  await page.locator('#future-stage').focus();
  await page.locator('#future-stage').press('+');
  await page.evaluate(() => window.atlas.dispatch('future-review'));
  await page.locator('#future-approval').check();
  await page.locator('[data-action=future-commit]').click();
  await expect(page.locator('#future-stage')).toHaveAttribute('data-zoom', '1');
});

test('oversized goal artwork never creates horizontal scrolling or clipped fields', async ({
  page,
}) => {
  for (const width of [320, 375, 1440]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1100 : 812 });
    await page.goto('/?p=sam&tab=future&theme=vanilla');
    await page.waitForFunction(() => !!window.atlas);
    await page.evaluate(() => window.atlas.dispatch('future-own'));
    await page.locator('[name=name]').fill('My long-term goal');
    await page.locator('[name=amount]').fill('10000');
    await page.locator('#goal-time').evaluate((e: HTMLInputElement) => {
      e.value = '240';
      e.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await page.locator('[name=target]').fill('10000000');
    const dimensions = await page.locator('.sheet-body').evaluate((e) => {
      e.scrollLeft = 500;
      return { client: e.clientWidth, scroll: e.scrollWidth, left: e.scrollLeft };
    });
    expect(dimensions.scroll).toBe(dimensions.client);
    expect(dimensions.left).toBe(0);
    const sheet = await page.locator('.sheet-body').boundingBox();
    for (const selector of ['[name=name]', '[name=amount]', '[name=target]', '#goal-time']) {
      const box = await page.locator(selector).boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(sheet!.x);
      expect(box!.x + box!.width).toBeLessThanOrEqual(sheet!.x + sheet!.width + 1);
    }
  }
});
