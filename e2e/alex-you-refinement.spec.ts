import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
    sessionStorage.setItem('atlas-welcome-seen', 'yes');
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
});
test('Alex has light daily invitations and an openly visible HSBC relationship', async ({
  page,
}) => {
  await page.goto('/?p=alex&tab=you&theme=vanilla');
  await expect(page.locator('.savings-beginning')).toContainText('£465 altogether');
  await expect(page.locator('.daily-beginning')).toContainText('How’s money');
  await expect(page.locator('.you-relationship-intro')).toContainText(
    'Points recognise your small steps',
  );
  await expect(page.locator('.you-more')).toHaveCount(0);
  await page.locator('.daily-beginning [data-action=feeling]').click();
  await expect(page.locator('.sheet-body')).toContainText('feel');
  await page.evaluate(() => window.atlas.dispatch('close'));
  await page.locator('.savings-beginning [data-action="badge:growing-savings"]').click();
  await expect(page.locator('.badge-detail')).toContainText('Day 30: £30');
  await page.locator('[data-action="badge-join:growing-savings"]').click();
  await expect(page.locator('.badge-next')).toContainText('£1');
  await page.locator('[data-action="badge-log:growing-savings"]').click();
  await page.locator('#badge-confirm').check();
  await page.locator('[data-action="badge-record:growing-savings"]').click();
  await page.evaluate(() => {
    (window.atlas.getState() as any).people.alex.l1.asOf = '2026-08-21';
    window.atlas.dispatch('badge:growing-savings');
  });
  await expect(page.locator('.badge-next')).toContainText('£2');
});
test('quiz opens a first portrait, with a dock that yields to the inline response', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/?p=alex&tab=you&theme=vanilla');
  await page.locator('.portrait-beginning [data-action=quiz]').click();
  for (let i = 0; i < 3; i++) await page.locator('[data-action="answer:0"]').click();
  await page.locator('[data-action=quiz-finish]').click();
  await expect(page.locator('.portrait-detail')).toBeVisible();
  await expect(page.locator('.pe-stage')).toHaveText('A first impression');
  await expect(page.locator('.portrait-first-impression')).toContainText('Open Banking');
  await expect(page.locator('.pe-strengths article')).toHaveCount(1);
  const dock = page.locator('.portrait-engagement-dock');
  await expect(dock).toBeVisible();
  await page.locator('.portrait-review').scrollIntoViewIfNeeded();
  await expect(dock).toBeHidden();
  await page.locator('.sheet-body').evaluate((el) => {
    el.scrollTop = 0;
  });
  await expect(dock).toBeVisible();
  await dock.locator('[data-action="portrait-note:overall"]').click();
  await page.locator('#portrait-note').fill('I like a plan, but I want room to be spontaneous.');
  await page.locator('[data-action="portrait-note-save:overall"]').click();
  await expect(page.locator('.portrait-detail')).toBeVisible();
  expect(
    await page.evaluate(
      () => (window.atlas.getState() as any).people.alex.ui.portraitNotes.overall.text,
    ),
  ).toContain('spontaneous');
  expect(errors).toEqual([]);
});

test('completion artwork clears the headline, and quiz Points cannot repeat', async ({ page }) => {
  await page.goto('/?p=alex&tab=you&theme=vanilla');
  await page.waitForFunction(() => !!window.atlas);
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.evaluate(() => window.atlas.dispatch('quiz'));
    await expect(page.locator('.quiz-line-art')).toBeVisible();
    for (let i = 0; i < 3; i++) await page.locator('[data-action="answer:0"]').click();
    const art = await page.locator('.quiz-art').boundingBox();
    const title = await page.locator('.portrait-quiz-result h1').boundingBox();
    expect(art!.y + art!.height).toBeLessThanOrEqual(title!.y);
    if (!attempt) await expect(page.locator('.reward-points')).toHaveText('+25 HSBC Points');
    else await expect(page.locator('.reward-points')).toHaveCount(0);
    await page.evaluate(() => window.atlas.dispatch('close'));
  }
});
test('Jordan gets a welcoming daily invitation', async ({ page }) => {
  await page.goto('/?p=jordan&tab=you&theme=vanilla');
  await expect(page.locator('.daily-beginning')).toBeVisible();
  await expect(page.locator('.daily-beginning')).toContainText('Pick up your rhythm');
  await page.locator('.daily-beginning [data-action=feeling]').click();
  await expect(page.locator('.sheet-body')).toContainText('feel');
});
