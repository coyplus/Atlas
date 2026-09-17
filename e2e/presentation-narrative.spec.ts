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

test('ambient diagrams cycle, pause and respect reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/presentation/?version=narrative#8');
  const ai = page.locator('.n-ai-system');
  await expect(ai).toHaveAttribute('data-motion', 'running');
  await ai.getByRole('button', { name: 'Pause animation', exact: true }).click();
  await expect(ai).toHaveAttribute('data-motion', 'paused');
  const examples = ai.locator('.n-ai-example');
  const initialHeight = (await ai.boundingBox())!.height;
  for (const [phase, time] of [1000, 8000, 15000].entries()) {
    await ai.locator('.n-ai-example, .n-example-tabs > span').evaluateAll((elements, time) => {
      elements.forEach((element) =>
        element.getAnimations().forEach((animation) => {
          animation.currentTime = time;
        }),
      );
    }, time);
    await expect
      .poll(() =>
        examples.evaluateAll((elements) =>
          elements.map((element) => Number(getComputedStyle(element).opacity)),
        ),
      )
      .toEqual([0, 1, 2].map((index) => (index === phase ? 1 : 0)));
    expect(Math.abs((await ai.boundingBox())!.height - initialHeight)).toBeLessThan(1);
  }
  await ai.getByRole('button', { name: 'Resume animation', exact: true }).click();
  await expect(ai).toHaveAttribute('data-motion', 'running');
  await page.keyboard.press('End');
  await expect(ai).toHaveAttribute('data-motion', 'paused');
  await page.goto('/presentation/?version=narrative#14');
  await expect(page.locator('.n-wheel')).toHaveAttribute('data-motion', 'running');
  await expect
    .poll(() =>
      page
        .locator('.n-wheel-signal')
        .evaluate((element) =>
          element.getAnimations().some((animation) => animation.playState === 'running'),
        ),
    )
    .toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.n-wheel')).toHaveAttribute('data-motion', 'paused');
  await expect(page.locator('.n-wheel .n-motion-toggle')).toBeHidden();
  await expect
    .poll(() =>
      page.locator('.n-wheel-signal').evaluate((element) => element.getAnimations().length),
    )
    .toBe(0);
  await page.goto('/presentation/?version=narrative#8');
  await expect(page.locator('.n-ai-example').first()).toHaveCSS('opacity', '1');
  await expect(page.locator('.n-ai-example').nth(1)).toHaveCSS('opacity', '0');
});
