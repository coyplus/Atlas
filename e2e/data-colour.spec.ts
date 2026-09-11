import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('wealth roles match tile, detail and legend in both themes', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const person of ['jordan', 'elena']) {
    await page.goto('/?p=' + person + '&theme=vanilla&tab=now');
    await page.waitForFunction(() => !!window.atlas);
    await page.evaluate(() => {
      const s = window.atlas.getState();
      const p = s.people[s.person];
      if (!p.ui.order.includes('wealth')) p.ui.order.unshift('wealth');
      p.ui.sizes.wealth = 'W';
      window.atlas.go(s.person, 'now');
    });
    const tile = page.locator('.now-page [data-module="wealth"]');
    const colours = await tile
      .locator('circle[data-viz-role]')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).stroke));
    expect(new Set(colours).size).toBe(colours.length);
    await page.evaluate(() => window.atlas.dispatch('module:wealth'));
    const detail = page.locator('.sheet .number-visual');
    await expect(detail).toBeVisible();
    expect(
      await detail
        .locator('circle[data-viz-role]')
        .evaluateAll((els) => els.map((el) => getComputedStyle(el).stroke)),
    ).toEqual(colours);
    expect(
      await detail
        .locator('.number-legend i')
        .evaluateAll((els) => els.map((el) => getComputedStyle(el).backgroundColor)),
    ).toEqual(colours);
    await page.screenshot({
      path: `docs/screenshots/${info.project.name}-${person}-colour-wealth.png`,
    });
  }
  expect(errors).toEqual([]);
});

test('category colours match spending mix and trends; goal colour matches tile and detail', async ({
  page,
}, info) => {
  await page.goto('/?p=jordan&theme=vanilla&tab=now');
  await page.waitForFunction(() => !!window.atlas);
  await page.evaluate(() => window.atlas.dispatch('module:whereitgoes'));
  const category = page.locator('.sheet circle[data-viz-role="category-groceries"]');
  await expect(category).toBeVisible();
  const groceryColour = await category.evaluate((el) => getComputedStyle(el).stroke);
  await page.screenshot({ path: `docs/screenshots/${info.project.name}-colour-spending.png` });
  await page.evaluate(() => {
    window.atlas.closeAll();
    window.atlas.dispatch('module:grocery');
  });
  await expect(page.locator('.sheet polyline')).toHaveCSS('stroke', groceryColour);
  await page.screenshot({ path: `docs/screenshots/${info.project.name}-colour-trend.png` });
  await page.evaluate(() => window.atlas.go('elena', 'now'));
  const tile = page.locator('.now-page [data-module="familypot"] .progress');
  await expect(tile).toHaveAttribute('data-viz-role', 'savings');
  const colour = await tile.locator('i').evaluate((el) => getComputedStyle(el).backgroundColor);
  await page.evaluate(() => window.atlas.dispatch('pot:fam'));
  await expect(page.locator('.sheet .container-target .progress i')).toHaveCSS(
    'background-color',
    colour,
  );
  await page.screenshot({ path: `docs/screenshots/${info.project.name}-colour-goal.png` });
});

test('credit and budget exceptions retain explicit explanation as colour changes', async ({
  page,
}, info) => {
  await page.goto('/?p=jordan&theme=vanilla&tab=now');
  await page.waitForFunction(() => !!window.atlas);
  for (const [owed, state, label] of [
    [780, 'normal', ''],
    [2000, 'at-limit', 'Credit limit reached'],
    [2100, 'over-limit', 'Over your credit limit'],
  ] as const) {
    await page.evaluate((owed) => {
      window.atlas.closeAll();
      window.atlas
        .getState()
        .people.jordan.l1.accounts.find((a: { id: string }) => a.id === 'ac-cc').owed = owed;
      window.atlas.dispatch('module:cardusage');
    }, owed);
    const chart = page.locator('.sheet [data-visual="gauge"]');
    await expect(chart).toHaveAttribute('data-viz-state', state);
    if (label) {
      await expect(chart.locator('.viz-state-label')).toContainText(label);
      await expect(chart).toHaveAttribute('aria-label', new RegExp(label));
    }
    await page.screenshot({
      path: `docs/screenshots/${info.project.name}-colour-credit-${state}.png`,
    });
  }
  await page.evaluate(() => {
    window.atlas.closeAll();
    const p = window.atlas.getState().people.jordan;
    p.l1.transactions.push({
      id: 'colour-review',
      ledger: 'grocery-wallet',
      date: p.l1.asOf,
      amount: -1000,
      category: 'groceries',
      counterparty: 'Review fixture',
    });
    window.atlas.go('jordan', 'now');
  });
  const tile = page.locator('.now-page [data-module="container-grocery-wallet"] .progress');
  await expect(tile).toHaveAttribute('data-viz-state', 'over-limit');
  const pattern = await tile.locator('i').evaluate((el) => getComputedStyle(el).backgroundImage);
  expect(pattern).toContain('repeating-linear-gradient');
  await page.evaluate(() => window.atlas.dispatch('pot:grocery-wallet'));
  const budget = page.locator('.sheet .container-budget');
  await expect(budget).toContainText('over budget');
  await expect(budget.locator('.progress')).toHaveAttribute('data-viz-state', 'over-limit');
  await expect(budget.locator('.progress i')).toHaveCSS('background-image', pattern);
  await page.screenshot({ path: `docs/screenshots/${info.project.name}-colour-budget-over.png` });
});

test('story infographics share category, savings and investment roles', async ({ page }, info) => {
  await page.goto('/?p=jordan&theme=vanilla&tab=now');
  await page.waitForFunction(() => !!window.atlas);
  await page.evaluate(() => window.atlas.dispatch('module:eatingout'));
  const eatingOut = await page
    .locator('.sheet polyline')
    .evaluate((el) => getComputedStyle(el).stroke);
  await page.evaluate(() => {
    window.atlas.go('jordan', 'now');
    window.atlas.dispatch('story:j1');
    window.atlas.dispatch('story-step:1');
  });
  await expect(page.locator('.story-mark-track i').first()).toHaveCSS(
    'background-color',
    eatingOut,
  );
  await page.screenshot({
    path: `docs/screenshots/${info.project.name}-colour-story-spending.png`,
  });
  for (const [person, story, role, mark] of [
    ['sam', 's2', 'savings', '.story-target-bar i'],
    ['elena', 'e2', 'investment', '.story-split i'],
  ]) {
    await page.evaluate(
      ({ person, story }) => {
        window.atlas.go(person, 'now');
        window.atlas.dispatch('story:' + story);
        window.atlas.dispatch('story-step:1');
      },
      { person, story },
    );
    await expect(page.locator('.story-viewer')).toHaveAttribute('data-viz-role', role);
    const fill = await page
      .locator(mark)
      .first()
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    const ink = await page.locator('.story-viewer').evaluate((el) => getComputedStyle(el).color);
    expect(fill).not.toBe(ink);
    await page.screenshot({
      path: `docs/screenshots/${info.project.name}-colour-story-${story}.png`,
    });
  }
});
