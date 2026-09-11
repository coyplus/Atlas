import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
});
test('Elite status, balance explanation, tier browsing and benefit sheets preserve navigation', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/?p=elena&theme=vanilla&tab=you');
  await expect(page.locator('.membership-entry')).toContainText('£284,600.00');
  await expect(page.locator('.app-header')).toContainText('Elite');
  await page.locator('[data-action="membership"]').click();
  await expect(page.locator('.membership-detail')).toHaveAttribute('data-membership-tier', 'elite');
  await page.screenshot({ path: `docs/screenshots/${info.project.name}-membership-elite.png` });
  await page.locator('[data-action="membership-expert"]').click();
  await expect(page.getByRole('textbox', { name: 'Your message to Priya' })).toBeVisible();
  await page.getByRole('button', { name: 'Close conversation' }).click();
  await expect(page.locator('.membership-detail')).toBeVisible();
  await page.locator('.membership-pass [data-action="membership-balance"]').click();
  await expect(page.locator('.secondary-shell')).toBeVisible();
  await expect(page.locator('.secondary-shell')).toContainText('£284,600.00');
  await page.getByRole('button', { name: 'Close sheet', exact: true }).click();
  await expect(page.locator('.membership-detail')).toBeVisible();
  await page.getByRole('tab', { name: 'Premier', exact: true }).click();
  await expect(page.locator('#membership-tier-panel')).toContainText('3 included choices');
  await page.locator('[data-action="membership-benefit:family"]').click();
  await expect(page.locator('.secondary-shell')).toContainText('Eligible household members');
  await page.goBack();
  await expect(page.locator('.membership-detail')).toHaveAttribute(
    'data-membership-tier',
    'premier',
  );
  await page.locator('[data-action="membership-household"]').click();
  await expect(page.locator('.secondary-shell')).toContainText('Aisha');
  await page.getByRole('button', { name: 'Close sheet', exact: true }).click();
  await page.locator('.sheet-header [data-action="close"]').click();
  await page.locator('[data-action="tab:now"]').click();
  await expect(page.locator('.now-page')).toBeVisible();
  expect(errors).toEqual([]);
});
test('choices review is reversible, enforces allowance, saves without spending Points', async ({
  page,
}, info) => {
  await page.goto('/?p=elena&theme=vanilla&tab=you');
  await page.locator('[data-action="membership"]').click();
  const before = await page.evaluate(
    () => window.atlas.getState().people.elena.l1.rewards.points.balance,
  );
  await page.locator('[data-action="membership-choices"]').click();
  for (const id of ['culture', 'family', 'career', 'sport', 'legacy'])
    await page.locator(`[data-action="membership-toggle:${id}"]`).click();
  await expect(page.locator('[data-action="membership-toggle:protection"]')).toBeDisabled();
  await page.locator('[data-action="membership-review"]').click();
  expect(
    await page.evaluate(() => window.atlas.getState().people.elena.ui.membershipChoices),
  ).toBeUndefined();
  await page.screenshot({ path: `docs/screenshots/${info.project.name}-membership-choices.png` });
  await page.getByRole('button', { name: 'Keep choosing', exact: true }).click();
  await page.locator('[data-action="membership-toggle:career"]').click();
  await page.locator('[data-action="membership-review"]').click();
  await page.locator('[data-action="membership-save"]').click();
  await expect(page.locator('.membership-selected')).toHaveCount(4);
  expect(
    await page.evaluate(() => window.atlas.getState().people.elena.l1.rewards.points.balance),
  ).toBe(before);
  await page.locator('.sheet-header [data-action="close"]').click();
  await expect(page.locator('.membership-entry')).toContainText('1 choice available');
});
test('HSBC progress is personal, higher-tier choices stay locked, narrow layout fits', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/?p=sam&theme=vanilla&tab=you');
  await page.locator('[data-action="member:riley"]').click();
  await expect(page.locator('.membership-entry')).toContainText('£98,000.00');
  await page.locator('[data-action="membership"]').click();
  await expect(page.locator('.membership-detail')).toContainText('£2,000.00');
  await page.getByRole('tab', { name: 'Premier', exact: true }).click();
  await page.locator('[data-action="membership-benefit:culture"]').click();
  await expect(page.locator('.secondary-shell')).toContainText('Available from £100,000');
  await expect(page.locator('[data-action="membership-open-choices"]')).toHaveCount(0);
  await page.getByRole('button', { name: 'Close sheet', exact: true }).click();
  expect(
    await page.locator('.sheet-body').evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
  ).toBe(true);
  await page.screenshot({ path: `docs/screenshots/${info.project.name}-membership-narrow.png` });
});
test('Premier qualification uses live balance rather than historic scenario tier', async ({
  page,
}) => {
  await page.goto('/?p=sam&theme=vanilla&tab=you');
  await page.waitForFunction(() => !!window.atlas);
  await page.evaluate(() => {
    const s = window.atlas.getState();
    s.people.sam.l1.accounts[0].balance = 110000;
    window.atlas.hydrate(s);
  });
  await expect(page.locator('.membership-entry-top')).toContainText('Premier');
  await page.locator('[data-action="membership"]').click();
  await page.locator('[data-action="membership-expert"]').click();
  await expect(page.getByRole('textbox', { name: 'Your message to Maya' })).toBeVisible();
  await page.getByRole('button', { name: 'Close conversation' }).click();
  await page.locator('[data-action="membership-choices"]').click();
  await expect(page.locator('[data-action="membership-toggle:sport"]')).toHaveCount(0);
  for (const id of ['culture', 'family', 'career'])
    await page.locator(`[data-action="membership-toggle:${id}"]`).click();
  await expect(page.locator('[data-action="membership-toggle:protection"]')).toBeDisabled();
});

test('tier previews theme the full phone and keep locked access separate from qualification', async ({
  page,
}, info) => {
  await page.goto('/?p=sam&theme=vanilla&tab=you');
  await page.locator('[data-action="membership"]').click();
  for (const [tier, canvas] of [
    ['Premier', '#17181a'],
    ['Elite', '#17181a'],
    ['HSBC', '#f4f6f6'],
  ]) {
    await page.getByRole('tab', { name: tier, exact: true }).click();
    await expect
      .poll(() =>
        page
          .locator('#phone')
          .evaluate((el) => getComputedStyle(el).getPropertyValue('--canvas').trim()),
      )
      .toBe(canvas);
    await expect(page.locator('.membership-pass-top b')).toHaveText(tier);
    await expect(page.locator('.membership-pass')).toHaveClass(
      tier === 'HSBC' ? /membership-pass(?!.*is-locked)/ : /is-locked/,
    );
    if (tier !== 'HSBC')
      await expect(page.locator('[data-action="membership-choices"]')).toHaveCount(0);
    await page.waitForTimeout(750);
    await page.screenshot({
      path: `docs/screenshots/${info.project.name}-membership-preview-${tier.toLowerCase()}.png`,
    });
  }
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.locator('.membership-entry-top b')).toHaveText('HSBC');
  await page.locator('[data-action="tab:now"]').click();
  await expect(page.locator('.now-page')).toBeVisible();
});

test('Sam saving rule reviews, edits, cancels and saves without changing TRB or Points', async ({
  page,
}, info) => {
  await page.goto('/?p=sam&theme=vanilla&tab=you');
  await page.locator('[data-action="membership"]').click();
  await page.locator('[data-action="membership-rule"]').click();
  await page.locator('#membership-rule-amount').fill('500');
  await page.locator('[data-action="membership-rule-review"]').click();
  await expect(page.locator('.membership-rule-illustration')).toContainText('4 paydays');
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.locator('#membership-rule-amount')).toHaveValue('500');
  await page.getByRole('button', { name: 'Not now', exact: true }).click();
  expect(
    await page.evaluate(() =>
      window.atlas.getState().people.sam.l1.rules.some((r) => r.id === 'r-premier-savings'),
    ),
  ).toBe(false);
  await page.locator('[data-action="membership-rule"]').click();
  await page.locator('#membership-rule-amount').fill('400');
  await page.locator('[data-action="membership-rule-review"]').click();
  await expect(page.locator('.membership-rule-illustration')).toContainText('5 paydays');
  await page.screenshot({
    path: `docs/screenshots/${info.project.name}-membership-rule-review.png`,
  });
  await page.locator('[data-action="membership-rule-save"]').click();
  await expect(page.locator('.membership-trb')).toHaveText('£98,000.00');
  await expect(page.locator('.membership-nudge')).toContainText('£400');
  const state = await page.evaluate(() => window.atlas.getState().people.sam);
  expect(state.l1.rules.filter((r) => r.id === 'r-premier-savings')).toHaveLength(1);
  expect(state.l1.accounts[0].balance).toBe(3120.44);
  expect(state.l1.pots.find((p) => p.id === 'un')?.balance).toBe(850);
  expect(state.l1.rewards.points.balance).toBe(480);
  await page.locator('[data-action="container-rule:r-premier-savings"]').click();
  await expect(page.locator('.sheet-body')).toContainText('£400');
});

test('pass changes keep colours in sync, preserve tab focus and respect reduced motion', async ({
  page,
}) => {
  await page.goto('/?p=sam&theme=vanilla&tab=you');
  await page.locator('[data-action="membership"]').click();
  for (const tier of ['Premier', 'Elite', 'HSBC', 'Elite']) {
    await page.getByRole('tab', { name: tier, exact: true }).click();
    await expect(page.getByRole('tab', { name: tier, exact: true })).toBeFocused();
    await expect(page.locator('.sheet')).toHaveCSS('transition-duration', '0s');
    await expect(page.locator('.membership-pass')).toHaveCSS('opacity', '1');
    await expect(page.locator('.sheet')).toHaveCSS(
      'background-color',
      tier === 'HSBC' ? 'rgb(255, 255, 255)' : 'rgb(36, 37, 40)',
    );
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('tab', { name: 'Premier', exact: true }).click();
  expect(
    await page
      .locator('.membership-pass')
      .evaluate((el) => el.getAnimations().filter((a) => a.playState === 'running').length),
  ).toBe(0);
  await page.getByRole('tab', { name: 'Premier', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Premier', exact: true })).toBeFocused();
});
