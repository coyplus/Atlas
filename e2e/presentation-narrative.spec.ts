import { test, expect } from '@playwright/test';

test('the narrative deck is selectable, deep-linkable and switches back', async ({ page }) => {
  await page.goto('/presentation/?p=sam');
  await page.getByRole('combobox', { name: 'Presentation version' }).selectOption('narrative');
  await expect(page).toHaveURL(/version=narrative#1$/);
  await expect(page.locator('#counter')).toHaveText('01 / 15');
  await expect(page.locator('.slide:not([hidden]) h1')).toContainText('Introducing');
  expect(new URL(page.url()).searchParams.get('p')).toBe('sam');
  await page.goto('/presentation/?version=narrative#6');
  await expect(page.locator('#counter')).toHaveText('06 / 15');
  await expect(page.locator('.slide:not([hidden]) h1')).toContainText('Building better customers');
  await expect(page.locator('body')).toHaveAttribute('data-theme', 'r-value');
  await page.locator('#deck-version').selectOption('relationship');
  await expect(page.locator('#counter')).toHaveText('01 / 11');
});

test('all narrative slides render without overflow and lead into the demo', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/presentation/?version=narrative');
  for (let n = 1; n <= 15; n++) {
    await expect(page.locator('#counter')).toHaveText(`${String(n).padStart(2, '0')} / 15`);
    await expect(page.locator('.slide:not([hidden])')).toHaveCount(1);
    await expect(page.locator('.slide:not([hidden]) h1')).toBeVisible();
    await expect
      .poll(() =>
        page
          .locator('.slide:not([hidden]) img')
          .evaluateAll((images) =>
            images.every(
              (image) =>
                (image as HTMLImageElement).complete &&
                (image as HTMLImageElement).naturalWidth > 0,
            ),
          ),
      )
      .toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(
      await page
        .locator('.slide:not([hidden])')
        .evaluate((el) => el.scrollWidth <= el.clientWidth + 2),
    ).toBe(true);
    if (n < 15) await page.locator('#next').click();
  }
  expect(errors).toEqual([]);
  await page.locator('#contents').click();
  await expect(page.locator('[data-slide]')).toHaveCount(15);
  await page.locator('#menu-close').click();
  await page.getByRole('link', { name: 'Experience it with Sam', exact: true }).click();
  await expect(page.locator('.now-page')).toBeVisible();
});

for (const viewport of [
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
]) {
  test(`the narrative fits ${viewport.width} × ${viewport.height} without scrolling`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto('/presentation/?version=narrative');
    await page.evaluate(() => document.fonts.ready);
    for (let n = 1; n <= 15; n++) {
      await expect(page.locator('#counter')).toHaveText(`${String(n).padStart(2, '0')} / 15`);
      await expect
        .poll(() => page.locator('#deck').evaluate((deck) => deck.scrollHeight - deck.clientHeight))
        .toBeLessThanOrEqual(2);
      if (n < 15) await page.locator('#next').click();
    }
  });
}

test('the shared Companion thinks, responds and follows each context without layout shifts', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.clock.install();
  await page.goto('/presentation/?version=narrative#8');
  const ai = page.locator('.n-ai-system');
  await expect(ai).toHaveAttribute('data-motion', 'running');
  await expect(page.locator('.n-motion-toggle')).toHaveCount(0);
  const initialHeight = (await ai.boundingBox())!.height;
  for (let phase = 0; phase < 3; phase++) {
    const example = ai.locator('.n-ai-example').nth(phase);
    await expect(example).toHaveAttribute('data-active', 'true');
    await expect(example.locator('.atlas-companion')).toContainText('Thinking…');
    await expect(ai.locator('.n-example-tabs > span').nth(phase)).toHaveAttribute(
      'data-active',
      'true',
    );
    await page.clock.runFor(2000);
    await expect(example.locator('[data-companion-state]')).toHaveAttribute(
      'data-companion-state',
      'responding',
    );
    await expect(example.locator('.support-copy')).not.toContainText('Thinking…');
    expect(Math.abs((await ai.boundingBox())!.height - initialHeight)).toBeLessThan(1);
    if (phase < 2) await page.clock.runFor(8000);
  }
  await page.keyboard.press('Home');
  await expect(ai).toHaveAttribute('data-motion', 'paused');
  const cover = page.locator('.n-cover-product');
  await expect(cover).toHaveAttribute('data-motion', 'running');
  await page.clock.runFor(2000);
  await expect(cover.locator('[data-active="true"] .atlas-companion')).toContainText(
    'Your home fund is growing, Sam.',
  );
  await page.keyboard.press('End');
  await expect(cover).toHaveAttribute('data-motion', 'paused');
});

test('the cover cycles all three tabs with matching Companion messages and a stable frame', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.clock.install();
  await page.goto('/presentation/?version=narrative#1');
  const cover = page.locator('.n-cover-product');
  await expect(cover).toHaveAttribute('data-motion', 'running');
  const initial = await cover.boundingBox();
  const messages = [
    'Your home fund is growing',
    'Does your portrait feel like you',
    'A home, a safety net, time together',
  ];
  for (const [index, tab] of ['now', 'you', 'future'].entries()) {
    const moment = cover.locator(`[data-cover-tab="${tab}"]`);
    await expect(moment).toHaveAttribute('data-active', 'true');
    await expect(moment).toHaveAttribute('aria-hidden', 'false');
    await expect(cover.locator('[aria-hidden="false"]')).toHaveCount(1);
    await page.clock.runFor(2000);
    await expect(moment.locator('.support-copy')).toContainText(messages[index]);
    expect(
      await moment.locator('img').evaluate((image) => image.complete && image.naturalWidth > 0),
    ).toBe(true);
    const frame = (await cover.boundingBox())!;
    expect(Math.abs(frame.width - initial!.width)).toBeLessThan(1);
    expect(Math.abs(frame.height - initial!.height)).toBeLessThan(1);
    await page.clock.runFor(7000);
  }
  await expect(cover.locator('[data-cover-tab="now"]')).toHaveAttribute('data-active', 'true');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(cover).toHaveAttribute('data-motion', 'paused');
  await page.clock.runFor(30000);
  await expect(cover.locator('[data-cover-tab="now"]')).toHaveCSS('opacity', '1');
  await expect(cover.locator('[data-cover-tab="you"]')).toHaveCSS('opacity', '0');
  await expect(cover.locator('[data-cover-tab="now"] .support-copy')).not.toContainText('Thinking');
});

test('ambient motion respects reduced motion and keeps a readable response', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/presentation/?version=narrative#14');
  await expect(page.locator('.n-wheel')).toBeVisible();
  expect(
    await page.locator('.n-wheel').evaluate((el) => el.getAnimations({ subtree: true }).length),
  ).toBe(0);
  await expect(page.locator('.n-wheel-signal')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/presentation/?version=narrative#8');
  await expect(page.locator('.n-ai-system')).toHaveAttribute('data-motion', 'paused');
  await expect(page.locator('.n-ai-example').first()).toHaveCSS('opacity', '1');
  await expect(page.locator('.n-ai-example').nth(1)).toHaveCSS('opacity', '0');
  await expect(page.locator('.n-ai-example').first().locator('.support-copy')).toContainText(
    'Your essentials are covered, Sam.',
  );
  await expect(page.locator('.is-thinking')).toHaveCount(0);
});
