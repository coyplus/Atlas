import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }, testInfo) => {
  await page.addInitScript((persist) => {
    window.__ATLAS_TEST__ = !persist;
    sessionStorage.setItem('atlas-welcome-seen', 'yes');
  }, testInfo.title.includes('correction is saved'));
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?p=sam&theme=vanilla&tab=you');
  await page.waitForFunction(() => !!window.atlas);
});

test('interpretation and measurements have distinct destinations and restore their reading position', async ({
  page,
}) => {
  const entry = page.locator('.money-portrait [data-action="portrait-story"]');
  expect(await entry.evaluate((e) => e.previousElementSibling?.getAttribute('data-action'))).toBe(
    'portrait',
  );
  await entry.click();
  await expect(page.locator('#dialog-title')).toHaveText('Behind your portrait');
  await expect(page.locator('.portrait-metrics')).toBeVisible();
  await expect(page.locator('[data-action="portrait-signal:rhythm"]')).toHaveCount(0);
  await expect(page.locator('.tabbar')).toBeHidden();
  await page.locator('[data-action="portrait-metric-filter:Saving"]').click();
  await expect(page.locator('.pm-card')).toHaveCount(1);
  await expect(page.locator('.pm-card')).toContainText('£420');
  const tile = page.locator('[data-action="portrait-metric:allocation"]');
  await tile.scrollIntoViewIfNeeded();
  const scroll = await page.locator('.sheet-body').evaluate((e) => e.scrollTop);
  await tile.click();
  await expect(page.locator('#dialog-title')).toHaveText('Measured activity');
  expect(await page.locator('.sheet-body').evaluate((e) => e.scrollTop)).toBe(0);
  await expect(page.locator('.portrait-metric-detail')).toContainText('conditional');
  await page.locator('.sheet-header [data-action="close"]').click();
  expect(await page.locator('.sheet-body').evaluate((e) => e.scrollTop)).toBeCloseTo(scroll, 0);
  await page.evaluate(() => {
    window.atlas.closeAll();
    window.atlas.dispatch('portrait');
  });
  await expect(page.locator('#dialog-title')).toHaveText('Your money portrait');
  await expect(page.locator('.portrait-interpretations')).toContainText('How we read the picture');
  await expect(page.locator('[data-action="portrait-signal:rhythm"]')).toContainText(
    'You connect a routine today',
  );
  await expect(page.locator('[data-action="personality-confirm"]')).toBeAttached();
});

test('the Companion follows the signal and a correction is saved alongside it', async ({
  page,
}) => {
  const initial = await page.evaluate(() => JSON.stringify(window.atlas.getState().people.sam.l1));
  await page.evaluate(() => window.atlas.dispatch('portrait'));
  await page.locator('[data-action="portrait-signal:rhythm"]').scrollIntoViewIfNeeded();
  await expect(page.locator('.support-copy strong')).toContainText(
    'Your grocery habit makes room for family time.',
  );
  await page.locator('[data-action="portrait-signal:rhythm"]').click();
  await page.locator('.support-avatar').click();
  await expect(page.locator('.chat-chips')).toContainText('What does this pattern tell you?');
  await page.getByRole('button', { name: 'What does this pattern tell you?', exact: true }).click();
  await expect(page.locator('.chat-message.ai').last()).toContainText('connect a routine today');
  await page.getByRole('button', { name: 'Back to the evidence', exact: true }).click();
  await expect(page.locator('#dialog-title')).toHaveText('A closer look');
  await page.evaluate(() => {
    window.atlas.closeAll();
    window.atlas.dispatch('portrait-note:rhythm');
  });
  await page
    .locator('#portrait-note')
    .fill('This is about making family holidays possible, not following a strict budget.');
  await page.locator('[data-action="portrait-note-save:rhythm"]').click();
  await expect(page.locator('.ps-own-perspective')).toContainText(
    'making family holidays possible',
  );
  expect(
    await page.evaluate(() => window.atlas.getState().people.sam.ui.portraitNotes.rhythm.text),
  ).toContain('family holidays');
  expect(await page.evaluate(() => JSON.stringify(window.atlas.getState().people.sam.l1))).toBe(
    initial,
  );
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          new Promise((resolve) => {
            const request = indexedDB.open('hsbc-atlas-demo', 1);
            request.onsuccess = () => {
              const db = request.result;
              const read = db.transaction('sessions').objectStore('sessions').get('session');
              read.onsuccess = () => {
                resolve(read.result?.state.people.sam.ui.portraitNotes?.rhythm?.text || '');
                db.close();
              };
            };
          }),
      ),
    )
    .toContain('family holidays');
  await page.reload();
  await page.waitForFunction(() => !!window.atlas);
  await page.evaluate(() => window.atlas.dispatch('portrait-signal:rhythm'));
  await expect(page.locator('.ps-own-perspective')).toContainText(
    'making family holidays possible',
  );
});

test('every scenario has measured evidence and shared records remain separate', async ({
  page,
}) => {
  await page.setViewportSize({ width: 430, height: 932 });
  for (const [person, phrase] of [
    ['alex', 'Your first days'],
    ['jordan', 'Saving cadence'],
    ['sam', 'Grocery consistency'],
    ['elena', 'Card repayment rhythm'],
  ]) {
    await page.evaluate((person) => {
      window.atlas.go(person, 'you');
      window.atlas.dispatch('portrait-story');
    }, person);
    await expect(page.locator('.pm-grid')).toContainText(phrase);
    expect(
      await page.locator('.sheet').evaluate((e) => e.scrollWidth <= e.clientWidth),
    ).toBeTruthy();
    await expect(page.locator('.portrait-metrics .portrait-glyph')).toHaveCount(0);
  }
  await page.evaluate(() => {
    window.atlas.closeAll();
    window.atlas.dispatch('member:aisha');
    window.atlas.dispatch('portrait-story');
  });
  await expect(page.locator('[data-metric-person="aisha"]')).toContainText('186');
  await expect(page.locator('[data-action="portrait-metric:allocation"]')).toHaveCount(0);
});

test('metric conversation explains the current measurement and returns to it', async ({ page }) => {
  await page.evaluate(() => {
    window.atlas.go('jordan', 'you');
    window.atlas.dispatch('portrait-story');
  });
  await page.locator('[data-action="portrait-metric:groceries"]').scrollIntoViewIfNeeded();
  await expect(page.locator('.support-copy strong')).toContainText('same number of days');
  await page.locator('[data-action="portrait-metric:groceries"]').click();
  await page.locator('.support-avatar').click();
  await page.getByRole('button', { name: 'How is this calculated?', exact: true }).click();
  await expect(page.locator('.chat-message.ai').last()).toContainText('£250.40');
  await expect(page.locator('.chat-message.ai').last()).toContainText('£212.40');
  await page.getByRole('button', { name: 'Back to your metrics', exact: true }).click();
  await expect(page.locator('#dialog-title')).toHaveText('Measured activity');
});
