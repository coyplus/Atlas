import { test, expect } from '@playwright/test';
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
});
for (const person of ['alex', 'jordan', 'sam', 'elena']) {
  test(`${person} portrait is responsive, opens and returns without blocking the page`, async ({
    page,
  }, info) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(`/?p=${person}&theme=vanilla&tab=you`);
    await expect(page.locator('.money-portrait')).toBeVisible();
    await expect(page.locator('#support-dock')).toHaveClass(/is-compact/);
    // Artwork may bleed past its component; the page must not scroll horizontally.
    const overflow = await page
      .locator('#content')
      .evaluate((el) => el.scrollWidth > el.clientWidth + 1);
    expect(overflow).toBe(false);
    const glass = page.locator('.portrait-glass');
    await expect(glass).toHaveCSS('backdrop-filter', 'blur(14px) saturate(1.1)');
    const canvasBox = await page.locator('.portrait-canvas').boundingBox();
    const tileBox = await glass.boundingBox();
    expect(canvasBox!.y + canvasBox!.height - tileBox!.y).toBeGreaterThan(60);
    const motion = page.locator('.money-portrait .portrait-drift').first();
    expect(
      parseFloat(await motion.evaluate((el) => getComputedStyle(el).animationDuration)),
    ).toBeGreaterThanOrEqual(24);
    const before = await motion.evaluate((el) => getComputedStyle(el).transform);
    await page.waitForTimeout(1600);
    expect(await motion.evaluate((el) => getComputedStyle(el).transform)).not.toBe(before);
    await page
      .locator('.phone')
      .screenshot({ path: `docs/screenshots/you-portrait/${info.project.name}-${person}.png` });
    await expect(page.locator('.portrait-art-info')).toHaveCount(0);
    if (person === 'alex') {
      await page.locator('.money-portrait [data-action="quiz"]').click();
      for (let i = 0; i < 3; i++) await page.locator('[data-action="answer:0"]').click();
      await page.locator('[data-action="quiz-finish"]').click();
    }
    await page.locator('.portrait-link[data-action="portrait"]').click();
    await expect(page.locator('.portrait-detail')).toBeVisible();
    await page.locator('.sheet-header [data-action="close"]').click();
    await page.locator('[data-action="tab:now"]').click();
    await expect(page.locator('.now-page')).toBeVisible();
    expect(errors).toEqual([]);
  });
}
test('quiz and confirmation grow the portrait; correction survives reopening', async ({ page }) => {
  await page.goto('/?p=alex&theme=vanilla&tab=you');
  await expect(page.locator('.money-portrait')).toHaveAttribute('data-portrait-stage', 'outline');
  await page.locator('.money-portrait [data-action="quiz"]').click();
  for (let i = 0; i < 3; i++) await page.locator('[data-action="answer:0"]').click();
  await page.locator('[data-action="quiz-finish"]').click();
  await expect(page.locator('.money-portrait')).toHaveAttribute('data-portrait-stage', 'named');
  const layers = Number(
    await page.locator('.money-portrait svg.portrait-art').getAttribute('data-layers'),
  );
  await page.locator('.portrait-link[data-action="portrait"]').click();
  await page.locator('[data-action="personality-confirm"]').click();
  expect(
    Number(await page.locator('.money-portrait svg.portrait-art').getAttribute('data-layers')),
  ).toBe(layers + 1);
  await page.locator('.portrait-link[data-action="portrait"]').click();
  await page.locator('[data-action="personality-correct"]').click();
  await page.locator('#correction').fill('I prefer flexibility, with a small savings routine.');
  await page.locator('[data-action="save-personality"]').click();
  await expect(page.locator('.portrait-summary')).toHaveText(
    'I prefer flexibility, with a small savings routine.',
  );
});
test('shared portraits switch with consent and cannot confirm someone else’s personality', async ({
  page,
}, info) => {
  await page.goto('/?p=elena&theme=vanilla&tab=you');
  for (const id of ['aisha', 'leo', 'household']) {
    await page.locator(`[data-action="member:${id}"]`).click();
    await expect(page.locator('.money-portrait')).toHaveAttribute('data-portrait-member', id);
    await page.locator('#content').evaluate((el) => {
      el.scrollTop = 0;
    });
    await page.waitForTimeout(1600);
    await page
      .locator('.phone')
      .screenshot({ path: `docs/screenshots/you-portrait/${info.project.name}-${id}.png` });
    await page.locator('.portrait-link[data-action="portrait"]').click();
    await expect(page.locator('.portrait-source')).toContainText('consent');
    await expect(page.locator('[data-action="personality-confirm"]')).toHaveCount(0);
    await page.locator('.sheet-header [data-action="close"]').click();
  }
  await page.locator('#content').evaluate((el) => {
    el.scrollTop = 0;
  });
  await page.waitForTimeout(1600);
  await page
    .locator('.phone')
    .screenshot({ path: `docs/screenshots/you-portrait/${info.project.name}-household.png` });
});
test('reduced motion removes portrait animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?p=jordan&theme=vanilla&tab=you');
  await expect(page.locator('.portrait-form').first()).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.portrait-drift').first()).toHaveCSS('animation-name', 'none');
});
test('household add stays available at narrow widths and creates only a pending invitation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 780 });
  await page.goto('/?p=elena&theme=vanilla&tab=you');
  const add = page.getByRole('button', { name: 'Add household member', exact: true });
  await expect(add).toBeVisible();
  const box = await add.boundingBox();
  expect(box!.x + box!.width).toBeLessThanOrEqual(320);
  await add.click();
  await page.locator('#invite-name').fill('Morgan');
  await page.locator('#invite-email').fill('morgan@example.com');
  await page.locator('[data-action="save-invite"]').click();
  await expect(
    page.getByRole('button', { name: 'Morgan, invitation awaiting consent' }),
  ).toBeAttached();
  await expect(add).toBeVisible();
  await page.getByRole('button', { name: 'Morgan, invitation awaiting consent' }).click();
  await expect(page.locator('.portrait-unshared')).toContainText('No email has been sent');
  await expect(page.locator('.portrait-detail')).toHaveCount(0);
});
test('unshared household member has no inferred portrait and new joiner can add someone', async ({
  page,
}) => {
  await page.goto('/?p=sam&theme=vanilla&tab=you');
  await page.locator('[data-action="portrait-member:ella"]').click();
  await expect(page.locator('.portrait-unshared')).toContainText(
    'do not have a money personality profile',
  );
  await page.locator('.sheet-header [data-action="close"]').click();
  await expect(page.locator('.money-portrait')).toHaveAttribute('data-portrait-member', 'self');
  await page.goto('/?p=alex&theme=vanilla&tab=you');
  await expect(
    page.getByRole('button', { name: 'Add household member', exact: true }),
  ).toBeVisible();
});

test('Riley has a shared portrait and contributes to the household composition', async ({
  page,
}) => {
  await page.goto('/?p=sam&theme=vanilla&tab=you');
  await page.locator('[data-action="member:riley"]').click();
  await expect(page.locator('.portrait-glass h1')).toHaveText('Thoughtful nurturer');
  await expect(page.locator('.money-portrait')).toHaveAttribute('data-portrait-member', 'riley');
  await page.locator('.portrait-link[data-action="portrait"]').click();
  await expect(page.locator('.portrait-source')).toContainText('shared by consent');
  await expect(page.locator('[data-action="personality-confirm"]')).toHaveCount(0);
  await page.locator('.sheet-header [data-action="close"]').click();
  await page.locator('[data-action="member:household"]').click();
  await expect(page.locator('.portrait-glass h1')).toHaveText('A plan with room for life');
});

test('desktop phone content scrolls beneath status glass while header retains its initial spacing', async ({
  browser,
}, info) => {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 1100 },
    isMobile: false,
    hasTouch: false,
  });
  const page = await context.newPage();
  for (const person of ['sam', 'elena']) {
    await page.goto(`/?p=${person}&theme=vanilla&tab=you`);
    const bar = page.locator('.statusbar');
    await expect(bar).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    expect(
      await page
        .locator('#support-slot')
        .evaluate((el) => getComputedStyle(el, '::before').backdropFilter),
    ).toBe('blur(12px)');
    const statusBox = await bar.boundingBox();
    const headerBox = await page.locator('.app-header').boundingBox();
    const contentBox = await page.locator('#content').boundingBox();
    expect(headerBox!.y).toBeGreaterThanOrEqual(statusBox!.y + statusBox!.height - 1);
    expect(contentBox!.y).toBeLessThanOrEqual(statusBox!.y + 1);
    await page.locator('#content').evaluate((el) => {
      el.scrollTop = 310;
    });
    await page.waitForTimeout(600);
    await page.locator('.phone').screenshot({
      path: `docs/screenshots/you-portrait/${info.project.name}-${person}-status-glass.png`,
    });
  }
  await context.close();
});
