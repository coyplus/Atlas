import { test, expect, type Page } from '@playwright/test';
async function boot(page: Page, person = 'jordan') {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.goto(`/?p=${person}&theme=vanilla&tab=now`);
  await expect(page.locator('.now-page')).toBeVisible();
}
async function dispatch(page: Page, action: string) {
  await page.evaluate((a) => window.atlas.dispatch(a), action);
}
const viewer = (page: Page) => page.locator('#overlay > .story-shell .story-viewer');
for (const person of ['alex', 'jordan', 'sam', 'elena'])
  test(`${person}: every Story has three legible frames and inspectable evidence`, async ({
    page,
  }, info) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await boot(page, person);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const ids = await page.evaluate(() =>
      window.atlas
        .getState()
        .people[window.atlas.getState().person].l2.stories.map((s: { id: string }) => s.id),
    );
    for (const id of ids) {
      await dispatch(page, 'story:' + id);
      expect(
        await viewer(page).evaluate(async (el) => {
          const source = (el as HTMLElement).style
            .getPropertyValue('--story-image')
            .replace(/^url\(["']?|["']?\)$/g, '');
          const image = new Image();
          image.src = source;
          try {
            await image.decode();
            return image.naturalWidth > 0;
          } catch {
            return false;
          }
        }),
      ).toBe(true);
      for (let step = 0; step < 3; step++) {
        await dispatch(page, 'story-step:' + step);
        await expect(viewer(page)).toHaveAttribute('data-step', String(step));
        await expect(page.locator('#support-dock')).toBeHidden();
        await expect(
          page.getByRole('button', { name: 'Discuss this story with AI' }),
        ).toBeVisible();
        await expect(viewer(page).locator('h1')).toBeVisible();
        await expect(viewer(page)).not.toContainText(/undefined|NaN/);
        expect(await viewer(page).evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(
          true,
        );
        if (step < 2) await expect(viewer(page).locator('.story-choice')).toHaveCount(0);
        await page.screenshot({
          path: `docs/screenshots/${info.project.name}-story-${id}-${step}.png`,
          animations: 'disabled',
        });
      }
      await dispatch(page, 'story-step:1');
      await viewer(page).locator('[data-action^="story-evidence:"]').first().click();
      await expect(page.locator('.story-evidence-shell')).toBeVisible();
      expect(
        await page.locator('.story-underlay').evaluate((el) => (el as HTMLElement).inert),
      ).toBe(true);
      await expect(page.locator('.story-evidence')).not.toContainText(/undefined|NaN/);
      await page.locator('.story-evidence-shell [data-action=close]').click();
      await expect(viewer(page)).toHaveAttribute('data-step', '1');
      await page.getByRole('button', { name: 'Close story', exact: true }).click();
    }
    expect(errors).toEqual([]);
  });
test('timer fills, pauses, advances to an untimed final page and waits for a choice', async ({
  page,
}) => {
  await page.clock.install();
  await boot(page);
  await dispatch(page, 'story:j1');
  await page.clock.runFor(3100);
  const fill = await viewer(page)
    .locator('[aria-current] i')
    .evaluate((el) => getComputedStyle(el).transform);
  expect(fill).not.toBe('matrix(0, 0, 0, 1, 0, 0)');
  await page.getByRole('button', { name: 'Pause story', exact: true }).click();
  await page.clock.runFor(15000);
  await expect(viewer(page)).toHaveAttribute('data-step', '0');
  await page.getByRole('button', { name: 'Play story', exact: true }).click();
  await page.clock.runFor(5500);
  await expect(viewer(page)).toHaveAttribute('data-step', '1');
  await page.clock.runFor(12500);
  await expect(viewer(page)).toHaveAttribute('data-step', '2');
  await expect(viewer(page).locator('.story-pagination')).toBeVisible();
  await expect(viewer(page).locator('.story-return')).toHaveCount(0);
  expect(
    await viewer(page)
      .locator('.story-pagination i')
      .evaluateAll((els) => els.map((el) => (el as HTMLElement).style.transform)),
  ).toEqual(['scaleX(1)', 'scaleX(1)', 'scaleX(1)']);
  await expect(page.locator('[data-story-toggle]')).toHaveCount(0);
  await page.clock.runFor(120000);
  await expect(viewer(page)).toHaveAttribute('data-step', '2');
  expect(
    await viewer(page)
      .locator('[aria-current] i')
      .evaluate((el) => (el as HTMLElement).style.transform),
  ).toBe('scaleX(1)');
  await viewer(page).getByRole('button', { name: 'Not now', exact: true }).click();
  await expect(viewer(page)).toHaveCount(0);
  const state = await page.evaluate(() => window.atlas.getState().people.jordan);
  expect(state.ui.storyVisits.j1.read).toBe(true);
  expect(state.l2.stories.find((s: { id: string }) => s.id === 'j1').state).toBe('new');
  expect(state.ui.history).toHaveLength(0);
});
test('swipes, hold, evidence and AI preserve reading position; Back returns to Story', async ({
  page,
}) => {
  await page.clock.install();
  await boot(page);
  await dispatch(page, 'story:j1');
  await page.clock.runFor(1500);
  const content = viewer(page).locator('.story-page');
  await content.dispatchEvent('pointerdown', {
    pointerId: 8,
    isPrimary: true,
    clientX: 280,
    clientY: 260,
  });
  await page.clock.runFor(10000);
  await expect(viewer(page)).toHaveAttribute('data-step', '0');
  await content.dispatchEvent('pointerup', {
    pointerId: 8,
    isPrimary: true,
    clientX: 60,
    clientY: 260,
  });
  await expect(viewer(page)).toHaveAttribute('data-step', '1');
  await viewer(page)
    .locator('.story-page')
    .dispatchEvent('pointerdown', { pointerId: 9, isPrimary: true, clientX: 60, clientY: 260 });
  await viewer(page)
    .locator('.story-page')
    .dispatchEvent('pointerup', { pointerId: 9, isPrimary: true, clientX: 280, clientY: 260 });
  await expect(viewer(page)).toHaveAttribute('data-step', '0');
  await dispatch(page, 'story-step:1');
  const mark = await viewer(page).locator('.story-mark').first().boundingBox();
  await page.mouse.move(mark!.x + mark!.width - 10, mark!.y + 12);
  await page.mouse.down();
  await page.mouse.move(mark!.x + 10, mark!.y + 12, { steps: 4 });
  await page.mouse.up();
  await expect(viewer(page)).toHaveAttribute('data-step', '2');
  await expect(page.locator('.story-evidence-shell')).toHaveCount(0);
  await page.clock.runFor(500);
  await dispatch(page, 'story-step:1');
  await page.clock.runFor(2100);
  await page.getByRole('button', { name: 'Discuss this story with AI' }).click();
  await expect(page.locator('.chat-thread')).toContainText('Eating out');
  await expect(page.locator('.chat-thread')).toContainText('Pizza Express');
  await page.clock.runFor(16000);
  await page.locator('.support-conversation [data-action=close]').click();
  await expect(viewer(page)).toHaveAttribute('data-step', '1');
  await viewer(page).locator('.story-receipt').click();
  await page.clock.runFor(16000);
  await page.goBack();
  await expect(viewer(page)).toHaveAttribute('data-step', '1');
  await page.getByRole('button', { name: 'Pause story', exact: true }).click();
  await page.getByRole('button', { name: 'Close story', exact: true }).click();
  await dispatch(page, 'story:j1');
  await expect(viewer(page)).toHaveAttribute('data-step', '0');
});
test('reduced motion defaults to manual; small and landscape screens keep every control reachable', async ({
  page,
}) => {
  await page.clock.install();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await boot(page, 'elena');
  await dispatch(page, 'story:e1');
  await page.clock.runFor(20000);
  await expect(viewer(page)).toHaveAttribute('data-step', '0');
  await expect(page.getByRole('button', { name: 'Play story', exact: true })).toBeVisible();
  for (const size of [
    { width: 320, height: 568 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(size);
    for (let i = 0; i < 3; i++) {
      await dispatch(page, 'story-step:' + i);
      expect(await viewer(page).evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
      await viewer(page).locator('.story-receipt').scrollIntoViewIfNeeded();
      await expect(viewer(page).locator('.story-receipt')).toBeInViewport();
      await expect(page.getByRole('button', { name: 'Close story', exact: true })).toBeInViewport();
    }
  }
});

async function swipe(page: Page, dx: number, dy: number) {
  const content = viewer(page).locator('.story-page');
  await content.dispatchEvent('pointerdown', {
    pointerId: 42,
    isPrimary: true,
    clientX: 190,
    clientY: 300,
  });
  await content.dispatchEvent('pointerup', {
    pointerId: 42,
    isPrimary: true,
    clientX: 190 + dx,
    clientY: 300 + dy,
  });
}
test('backward swipes reset every later fill and restart the current timer', async ({ page }) => {
  await page.clock.install();
  await boot(page);
  await dispatch(page, 'story:j1');
  await page.clock.runFor(4000);
  await swipe(page, -120, 0);
  await page.clock.runFor(4000);
  await swipe(page, 120, 0);
  const fills = await viewer(page)
    .locator('.story-pagination i')
    .evaluateAll((els) => els.map((el) => (el as HTMLElement).style.transform));
  expect(fills).toEqual(['scaleX(0)', 'scaleX(0)', 'scaleX(0)']);
  await page.clock.runFor(7000);
  await expect(viewer(page)).toHaveAttribute('data-step', '0');
  await page.clock.runFor(1500);
  await expect(viewer(page)).toHaveAttribute('data-step', '1');
  await dispatch(page, 'story-step:2');
  await swipe(page, 120, 0);
  await page.clock.runFor(11000);
  await expect(viewer(page)).toHaveAttribute('data-step', '1');
});
test('vertical swipes change Stories with a fresh clock; boundaries do not wrap or nest', async ({
  page,
}) => {
  await page.clock.install();
  await boot(page);
  await dispatch(page, 'story:j1');
  await swipe(page, 0, 120);
  await expect(viewer(page)).toHaveAttribute('data-story', 'j1');
  await page.clock.runFor(2500);
  await swipe(page, 0, -120);
  await expect(viewer(page)).toHaveAttribute('data-story', 'j2');
  await expect(viewer(page)).toHaveAttribute('data-step', '0');
  await page.clock.runFor(7000);
  await expect(viewer(page)).toHaveAttribute('data-step', '0');
  await swipe(page, 0, -120);
  await expect(viewer(page)).toHaveAttribute('data-story', 'j3');
  await swipe(page, 0, -120);
  await expect(viewer(page)).toHaveAttribute('data-story', 'j3');
  await expect(
    viewer(page).getByRole('button', { name: 'Next story', exact: true }),
  ).toBeDisabled();
  await swipe(page, 0, 120);
  await expect(viewer(page)).toHaveAttribute('data-story', 'j2');
  await expect(viewer(page)).toHaveAttribute('data-step', '0');
  await page.clock.runFor(500);
  await page.getByRole('button', { name: 'Close story', exact: true }).click();
  await expect(page.locator('.story-viewer')).toHaveCount(0);
  await expect(page.locator('.now-page')).toBeVisible();
});
test('dragging text does not select it; short pages scroll before switching Stories', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await boot(page);
  await dispatch(page, 'story:j1');
  const sentence = viewer(page).locator('.story-sentence');
  expect(await sentence.evaluate((el) => getComputedStyle(el).userSelect)).toBe('none');
  const box = await sentence.boundingBox();
  await page.mouse.move(box!.x + 20, box!.y + 10);
  await page.mouse.down();
  await page.mouse.move(box!.x + 110, box!.y + 12, { steps: 5 });
  await page.mouse.up();
  expect(await page.evaluate(() => window.getSelection()?.toString())).toBe('');
  await page.setViewportSize({ width: 320, height: 568 });
  await dispatch(page, 'story-step:1');
  const content = viewer(page).locator('.story-page');
  expect(await content.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(true);
  await content.dispatchEvent('pointerdown', {
    pointerId: 7,
    isPrimary: true,
    clientX: 180,
    clientY: 400,
  });
  await content.dispatchEvent('pointermove', {
    pointerId: 7,
    isPrimary: true,
    clientX: 180,
    clientY: 240,
  });
  await content.dispatchEvent('pointerup', {
    pointerId: 7,
    isPrimary: true,
    clientX: 180,
    clientY: 240,
  });
  await expect(viewer(page)).toHaveAttribute('data-story', 'j1');
  expect(await content.evaluate((el) => el.scrollTop)).toBeGreaterThan(0);
  await content.evaluate((el) => {
    el.scrollTop = el.scrollHeight;
  });
  await swipe(page, 0, -120);
  await expect(viewer(page)).toHaveAttribute('data-story', 'j2');
});

test('evidence stays above desktop phone chrome and restores the final pagination', async ({
  browser,
}, info) => {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1000 },
    isMobile: false,
    hasTouch: false,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto(
    (process.env.ATLAS_TEST_URL || 'http://localhost:4173') + '/?p=jordan&theme=vanilla&tab=now',
  );
  await expect(page.locator('.now-page')).toBeVisible();
  await dispatch(page, 'story:j2');
  await dispatch(page, 'story-step:2');
  await expect(viewer(page)).not.toContainText('Take your time');
  await viewer(page).locator('.story-receipt').click();
  await expect(page.locator('.story-evidence-shell')).toBeVisible();
  await expect(page.locator('.tabbar')).toBeHidden();
  await expect(page.locator('#audio-dock')).toBeHidden();
  await expect(page.locator('.story-evidence')).not.toContainText(
    /demo moment|live account feed|prototype data/,
  );
  const phone = await page.locator('#phone').boundingBox();
  expect(
    await page.evaluate(
      ({ x, y }) => !!document.elementFromPoint(x, y)?.closest('.story-evidence-shell'),
      { x: phone!.x + phone!.width / 2, y: phone!.y + phone!.height - 35 },
    ),
  ).toBe(true);
  const status = await page.locator('.statusbar').boundingBox();
  expect(
    await page.evaluate(
      ({ x, y }) => document.elementFromPoint(x, y)?.classList.contains('scrim'),
      { x: status!.x + status!.width / 2, y: status!.y + status!.height / 2 },
    ),
  ).toBe(true);
  await page.screenshot({
    path: `docs/screenshots/${info.project.name}-story-evidence-desktop.png`,
    animations: 'disabled',
  });
  await page.getByRole('button', { name: 'Close evidence', exact: true }).click();
  await expect(viewer(page)).toHaveAttribute('data-step', '2');
  await expect(viewer(page).locator('.story-pagination')).toBeVisible();
  await viewer(page)
    .getByRole('button', { name: 'Story page 2: The working', exact: true })
    .click();
  await expect(viewer(page)).toHaveAttribute('data-step', '1');
  expect(
    await viewer(page)
      .locator('.story-pagination i')
      .evaluateAll((els) => els.map((el) => (el as HTMLElement).style.transform)),
  ).toEqual(['scaleX(1)', 'scaleX(0)', 'scaleX(0)']);
  await page.getByRole('button', { name: 'Close story', exact: true }).click();
  await expect(page.locator('.tabbar')).toBeVisible();
  await context.close();
});

test('opening a Story from My stories always starts fresh, including after reload', async ({
  page,
}) => {
  await page.clock.install();
  await boot(page, 'sam');
  const tile = page.locator('.story-tile[data-action="story:s1"]');
  await tile.click();
  await dispatch(page, 'story-step:2');
  await viewer(page).locator('.story-receipt').click();
  await page.getByRole('button', { name: 'Close evidence', exact: true }).click();
  await expect(viewer(page)).toHaveAttribute('data-step', '2');
  await page.getByRole('button', { name: 'Close story', exact: true }).click();
  await page.reload();
  await expect(page.locator('.now-page')).toBeVisible();
  await tile.click();
  await expect(viewer(page)).toHaveAttribute('data-step', '0');
  const fills = await viewer(page)
    .locator('.story-pagination i')
    .evaluateAll((els) => els.map((el) => (el as HTMLElement).style.transform));
  // The current timer is already running during browser assertions; later pages
  // must stay exactly reset, while the first must still be at its beginning.
  expect(Number(fills[0].match(/scaleX\(([^)]+)\)/)?.[1])).toBeLessThan(0.05);
  expect(fills.slice(1)).toEqual(['scaleX(0)', 'scaleX(0)']);
  await page.clock.runFor(7000);
  await expect(viewer(page)).toHaveAttribute('data-step', '0');
  await page.clock.runFor(1500);
  await expect(viewer(page)).toHaveAttribute('data-step', '1');
  await page.getByRole('button', { name: 'Close story', exact: true }).click();
  await tile.click();
  await expect(viewer(page)).toHaveAttribute('data-step', '0');
});
