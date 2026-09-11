import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?p=sam&theme=vanilla&tab=future');
  await page.waitForFunction(() => !!window.atlas);
});
test('a named possibility becomes real without applying other experiments, and Undo restores it', async ({
  page,
}) => {
  const before = await page.evaluate(() => JSON.stringify(window.atlas.getState().people.sam.l1));
  await page.locator('.future-drawer-invitation').click();
  await page.locator('.fg-idea').first().click();
  const experiments = await page.evaluate(() =>
    JSON.stringify(window.atlas.getState().people.sam.ui.future.ideas),
  );
  await page.locator('#fg-tick-horizon-family-adventure').click();
  await expect(page.getByRole('heading', { name: 'Make it mine', exact: true })).toBeVisible();
  await expect(page.locator('[name="target"]')).toBeVisible();
  await expect(page.locator('[name="amount"]')).toBeVisible();
  await expect(page.locator('.possibility-numbers')).toContainText('Optional to adjust');
  await expect(page.getByRole('button', { name: 'Try this possibility', exact: true })).toHaveCount(
    0,
  );
  await page.locator('[name="name"]').fill('Our family adventure');
  await page.locator('[name="target"]').fill('7000');
  await page.locator('[name="amount"]').fill('80');
  expect(await page.evaluate(() => JSON.stringify(window.atlas.getState().people.sam.l1))).toBe(
    before,
  );
  await page.getByRole('button', { name: 'Make it real', exact: true }).click();
  const created = await page.evaluate(() => {
    const p = window.atlas.getState().people.sam;
    return {
      pot: p.l1.pots.find((g: any) => g.id === 'horizon-family-adventure'),
      rule: p.l1.rules.find((r: any) => r.potId === 'horizon-family-adventure'),
      ideas: JSON.stringify(p.ui.future.ideas),
    };
  });
  expect(created.pot.name).toBe('Our family adventure');
  expect(created.pot.balance).toBe(0);
  expect(created.pot.target).toBe(7000);
  expect(created.rule.amount).toBe(80);
  expect(created.ideas).toBe(experiments);
  await expect(page.locator('#future-total')).toHaveText('£98,000');
  await expect(page.locator('#fg-tick-horizon-family-adventure')).not.toHaveClass(/is-ghost/);
  await page.evaluate(() => window.atlas.dispatch('undo'));
  expect(await page.evaluate(() => JSON.stringify(window.atlas.getState().people.sam.l1))).toBe(
    before,
  );
  expect(
    await page.evaluate(() => JSON.stringify(window.atlas.getState().people.sam.ui.future.ideas)),
  ).toBe(experiments);
  await expect(page.locator('#fg-tick-horizon-family-adventure')).toHaveClass(/is-ghost/);
});
test('long-range prompts change with life stage and ghost markers remain separate', async ({
  page,
}) => {
  await page.goto('/?p=jordan&theme=vanilla&tab=future');
  async function travel(month: string) {
    await page.locator('#time-slider').evaluate((el: HTMLInputElement, m) => {
      el.value = m;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, month);
  }
  await travel('96');
  await expect(page.locator('#support-dock')).toContainText('At 37');
  const early = await page.locator('#support-dock').textContent();
  await travel('180');
  await expect(page.locator('#support-dock')).toContainText('At 44');
  expect(await page.locator('#support-dock').textContent()).not.toBe(early);
  await expect(page.locator('.future-milestone.is-ghost')).toHaveCount(4);
  await page.locator('#fg-tick-horizon-time-away').click();
  await expect(page.getByRole('textbox', { name: 'Goal name' })).toHaveValue('Time away');
  await page.getByRole('button', { name: 'Not for me', exact: true }).click();
  await expect(page.locator('#fg-tick-horizon-time-away')).toHaveCount(0);
  await expect(page.locator('#time-slider')).toHaveValue('180');
});
test('Pot photo and colour use the shared detail and cancel leaves the appearance unchanged', async ({
  page,
}) => {
  await page.locator('#future-bubble-hol').click();
  await expect(page.locator('.pot-backdrop img')).toHaveAttribute(
    'src',
    '/assets/stories/horizon.jpg',
  );
  await page.getByRole('button', { name: 'Personalise photo', exact: true }).click();
  await page.getByRole('button', { name: 'Lilac', exact: true }).click();
  await page.getByRole('button', { name: 'Remove photo', exact: true }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.locator('.pot-backdrop img')).toHaveAttribute(
    'src',
    '/assets/stories/horizon.jpg',
  );
  await page.getByRole('button', { name: 'Personalise photo', exact: true }).click();
  await page.getByRole('button', { name: 'Apricot', exact: true }).click();
  await page.locator('#pot-photo-input').setInputFiles('assets/stories/cooking.jpg');
  await expect(page.locator('.pot-appearance-preview img')).toHaveAttribute(
    'src',
    /^data:image\/jpeg;base64,/,
  );
  await page.getByRole('button', { name: 'Save appearance', exact: true }).click();
  await expect(page.locator('.pot-backdrop img')).toHaveAttribute(
    'src',
    /^data:image\/jpeg;base64,/,
  );
  expect(
    await page.evaluate(() => window.atlas.getState().people.sam.ui.potAppearance.hol.colour),
  ).toBe('peach');
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.locator('#future-bubble-hol .future-value img')).toHaveAttribute(
    'src',
    /^data:image\/jpeg;base64,/,
  );
  await expect(page.locator('#future-total')).toHaveText('£98,000');
});

test('Make it mine keeps its reasoning, editable figures and both decisions above the fold', async ({
  page,
}) => {
  for (const [width, height] of [
    [390, 844],
    [375, 667],
  ]) {
    await page.setViewportSize({ width, height });
    await page.goto('/?p=elena&theme=vanilla&tab=future');
    await page.locator('#fg-tick-horizon-family-giving').click();
    await expect(page.getByRole('textbox', { name: 'Goal name' })).toHaveValue('Giving back');
    await expect(page.locator('.horizon-reason')).toHaveText(
      'At 62, would you like the option to support someone or a cause you care about?',
    );
    await expect(page.locator('.tabbar')).toBeHidden();
    const sheet = await page.locator('.sheet').boundingBox();
    for (const locator of [
      page.locator('.horizon-reason'),
      page.locator('[name="target"]'),
      page.locator('[name="amount"]'),
      page.getByRole('button', { name: 'Make it real', exact: true }),
      page.getByRole('button', { name: 'Not for me', exact: true }),
    ]) {
      await expect(locator).toBeVisible();
      const box = await locator.boundingBox();
      expect(box!.y).toBeGreaterThan(58);
      expect(box!.y + box!.height).toBeLessThanOrEqual(sheet!.y + sheet!.height);
    }
    // On unusually short displays content scrolls independently of the decisions.
    await page.setViewportSize({ width, height: 500 });
    const action = page.getByRole('button', { name: 'Make it real', exact: true });
    const initial = await action.boundingBox();
    await page.locator('.horizon-content').evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });
    expect((await action.boundingBox())!.y).toBeCloseTo(initial!.y, 0);
    const fields = await page.locator('[name="amount"]').boundingBox();
    const footer = await page.locator('.horizon-actions').boundingBox();
    expect(fields!.y + fields!.height).toBeLessThanOrEqual(footer!.y);
    await page.getByRole('button', { name: 'Not for me', exact: true }).click();
    await expect(page.locator('#fg-tick-horizon-family-giving')).toHaveCount(0);
  }
});
