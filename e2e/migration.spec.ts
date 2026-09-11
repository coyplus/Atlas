import { test, expect, type Page } from '@playwright/test';
async function boot(page: Page, person = 'jordan', theme = 'vanilla') {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.goto(`/?p=${person}&theme=${theme}`);
  await expect(page.locator('.now-page')).toBeVisible();
}
async function action(page: Page, a: string) {
  await page.locator(`button[data-action="${a}"]`).filter({ visible: true }).first().click();
}
test('all personas, themes and tabs fit a phone and load local media', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  for (const theme of ['vanilla', 'bento', 'metro']) {
    await boot(page, 'alex', theme);
    for (const person of ['alex', 'jordan', 'sam', 'elena']) {
      await page.evaluate((id) => window.atlas.dispatch('person:' + id), person);
      for (const tab of ['now', 'future', 'you']) {
        await action(page, 'tab:' + tab);
        await expect(page.locator('#content')).not.toContainText(/undefined|NaN/);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        ).toBe(true);
      }
      await action(page, 'tab:now');
      if (theme === 'vanilla') {
        await page.waitForTimeout(person === 'elena' ? 100 : 2100);
        await page.screenshot({
          animations: 'disabled',
          path: `docs/screenshots/${info.project.name}-${person}-now.png`,
        });
      }
    }
  }
  expect(errors).toEqual([]);
});
test('Jordan recovery preserves current benefit and supports a manual payment', async ({
  page,
}, info) => {
  await boot(page);
  await action(page, 'pot:grocery-wallet');
  await action(page, 'container-how:grocery-wallet');
  await expect(page.locator('.how-sheet')).toContainText('0% cashback');
  await page.screenshot({
    animations: 'disabled',
    path: `docs/screenshots/${info.project.name}-agreement.png`,
  });
  await action(page, 'condition-pay:grocery-wallet/funding');
  await expect(page.locator('#transfer-form [name=amount]')).toHaveValue('100');
  await action(page, 'transfer-review');
  await action(page, 'transfer-confirm');
  await action(page, 'container-how:grocery-wallet');
  await expect(page.locator('.how-sheet')).toContainText('Ready for cashback to return');
  await expect(page.locator('.how-sheet')).toContainText('0% cashback');
});
test('quiz help preserves draft; chat, header and sheet fit viewport', async ({ page }, info) => {
  await boot(page, 'alex');
  await action(page, 'support:discuss');
  await action(page, 'quiz');
  await expect(page.locator('.sheet-header')).toContainText('Getting to know you');
  await expect(page.locator('#support-dock')).toBeHidden();
  await action(page, 'answer:0');
  await action(page, 'support:discuss');
  await page.screenshot({
    animations: 'disabled',
    path: `docs/screenshots/${info.project.name}-chat.png`,
  });
  await page.locator('.support-conversation [data-action=close]').click();
  await expect(page.locator('.sheet')).toContainText('QUESTION 2 OF 3');
  await action(page, 'answer:1');
  await action(page, 'answer:2');
  await action(page, 'quiz-finish');
  await expect(page.locator('#content')).toContainText('25');
});
test('quick action customisation saves and cancel discards draft', async ({ page }) => {
  await boot(page);
  await action(page, 'quick-more');
  await action(page, 'quick-edit');
  await action(page, 'quick-select:statements');
  await action(page, 'quick-select:pay');
  await action(page, 'quick-done');
  await expect(page.locator('#content .quick-actions')).toContainText('Statements');
  await action(page, 'quick-more');
  await action(page, 'quick-edit');
  await action(page, 'quick-select:transfer');
  await action(page, 'quick-place:available');
  await action(page, 'close');
  await expect(page.locator('#content .quick-actions')).toContainText('Transfer');
});
test('top restores AI and browser back closes the current sheet', async ({ page }) => {
  await boot(page);
  await page.waitForTimeout(2100);
  await page.locator('#content').evaluate((el) => {
    el.scrollTop = 650;
  });
  await expect(page.locator('#support-dock')).toHaveAttribute('data-state', 'compact');
  await page.locator('#content').evaluate((el) => {
    el.scrollTop = 0;
  });
  await expect(page.locator('#support-dock')).toHaveAttribute('data-state', 'expanded');
  await action(page, 'pot:grocery-wallet');
  await action(page, 'container-how:grocery-wallet');
  await page.goBack();
  await expect(page.locator('.how-sheet')).toHaveCount(0);
  await expect(page.locator('.container-detail')).toBeVisible();
  await page.goBack();
  await expect(page.locator('.container-detail')).toHaveCount(0);
  await expect(page.locator('.now-page')).toBeVisible();
});
test('shared members, photos and neutral cards survive small and landscape layouts', async ({
  page,
}, info) => {
  await boot(page, 'sam');
  await page.waitForTimeout(2100);
  for (const size of [
    { width: 320, height: 740 },
    { width: 844, height: 390 },
    { width: 768, height: 1024 },
  ]) {
    await page.setViewportSize(size);
    await action(page, 'tab:now');
    await page
      .locator('[data-module=container-family-budget]')
      .evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(180);
    const card = page.locator('[data-module=container-family-budget]');
    await expect(card.locator('img')).toBeVisible();
    expect(
      await card
        .locator('img')
        .evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0),
    ).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(
      true,
    );
    const bars = await page
      .locator('.budget-progress')
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().width));
    expect(bars.every((w) => w > 60)).toBe(true);
    await page.screenshot({
      animations: 'disabled',
      path: `docs/screenshots/${info.project.name}-sam-${size.width}.png`,
    });
  }
});
test('direct links, theme aliases and browser forward preserve navigation', async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.goto('/app/sam/future');
  await expect(page.locator('[data-action="tab:future"]')).toHaveAttribute('aria-current', 'page');
  await action(page, 'tab:now');
  await page.reload();
  await expect(page.locator('[data-action="tab:now"]')).toHaveAttribute('aria-current', 'page');
  await page.goto('/bento.html?p=jordan');
  await expect(page.locator('body')).toHaveAttribute('data-direction', 'bento');
  await page.goto('/?p=jordan');
  await action(page, 'pot:grocery-wallet');
  await action(page, 'container-how:grocery-wallet');
  await page.goBack();
  await expect(page.locator('.how-sheet')).toHaveCount(0);
  await page.goForward();
  await expect(page.locator('.how-sheet')).toBeVisible();
  await action(page, 'agreement-close');
  await action(page, 'close');
  await action(page, 'tab:future');
  await page.goBack();
  await expect(page.locator('[data-action="tab:now"]')).toHaveAttribute('aria-current', 'page');
});
test('persistent recap plays across tabs and an account detail', async ({ page }) => {
  await boot(page, 'sam');
  await page.waitForTimeout(2100);
  await action(page, 'support:play');
  await expect(page.locator('#audio-dock')).toBeVisible();
  await expect
    .poll(() => page.locator('#sam-audio').evaluate((a: HTMLAudioElement) => a.currentTime))
    .toBeGreaterThan(0);
  await action(page, 'tab:future');
  expect(await page.locator('#sam-audio').evaluate((a: HTMLAudioElement) => a.paused)).toBe(false);
  await action(page, 'tab:now');
  await action(page, 'pot:house');
  await expect(page.locator('#audio-dock')).toBeVisible();
  await expect(page.locator('.support-avatar')).toHaveAttribute('data-action', 'support:discuss');
  await action(page, 'support:stop');
  await expect(page.locator('#audio-dock')).toBeHidden();
});
