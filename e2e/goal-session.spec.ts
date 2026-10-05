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
    await expect(page.locator('.goal-session-orbit strong')).toHaveText('£1,200');
    await page.locator('[name="amount"]').fill('200');
    await expect(page.locator('.goal-session-orbit strong')).toHaveText('£2,400');
    await expect(page.locator('#support-dock')).toBeVisible();
    await page.locator('#support-dock .support-summary').click();
    await expect(page.locator('.chat-thread')).toContainText('£200');
    await expect(page.locator('.chat-thread')).toContainText('Time for myself');
    await page.locator('#chat-input').fill('What about £25 a month?');
    await page.locator('#chat-form button[type=submit]').click();
    await expect(page.locator('.chat-thread')).toContainText('I haven’t changed your draft.');
    await page.evaluate(() => window.atlas.dispatch('close'));
    await expect(page.locator('[name="amount"]')).toHaveValue('200');
    await page.locator('[name="openEnded"]').check();
    await expect(page.locator('[name="target"]')).toBeDisabled();
    await page.locator('#goal-time').evaluate((el: HTMLInputElement) => {
      el.value = '24';
      el.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await expect(page.locator('.goal-session-orbit strong')).toHaveText('£4,800');
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
  await page.locator('[name="openEnded"]').check();
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
