import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?p=elena&theme=vanilla&tab=now');
  await page.waitForFunction(() => !!window.atlas);
});

test('the three passes share corners and keep distinct restrained artwork', async ({
  page,
}, info) => {
  await page.evaluate(() => window.atlas.dispatch('membership'));
  for (const tier of ['hsbc', 'premier', 'elite']) {
    await page.evaluate((tier) => window.atlas.dispatch('membership-tier:' + tier), tier);
    const pass = page.locator('.membership-pass');
    await expect(pass).toHaveAttribute('data-pass-tier', tier);
    await expect(pass).toHaveCSS('border-radius', '24px');
    expect(await pass.evaluate((el) => getComputedStyle(el, '::before').display)).not.toBe('none');
    await page.screenshot({
      path: `docs/screenshots/${info.project.name}-pass-${tier}-geometry.png`,
    });
  }
});

test('Elena photo fades with scrolling and stays out of detail screens and other tabs', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const backdrop = page.locator('.now-backdrop');
  await expect(backdrop).toBeVisible();
  expect(
    await backdrop
      .locator('img')
      .evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0),
  ).toBe(true);
  await expect(page.locator('.phone')).toHaveAttribute('data-now-photo-at-top', 'true');
  await page.screenshot({ path: `docs/screenshots/${info.project.name}-elena-personal-now.png` });
  await page.locator('#content').evaluate((el) => {
    el.scrollTop = 500;
  });
  await expect(page.locator('.phone')).toHaveAttribute('data-now-photo-at-top', 'false');
  await expect
    .poll(() => backdrop.evaluate((el) => getComputedStyle(el).transform))
    .not.toBe('matrix(1, 0, 0, 1, 0, 0)');
  await page.screenshot({
    path: `docs/screenshots/${info.project.name}-elena-personal-scrolled.png`,
  });
  await page.evaluate(() => window.atlas.dispatch('module:wealth'));
  await expect(backdrop).toBeHidden();
  for (const tab of ['you', 'future']) {
    await page.evaluate((tab) => window.atlas.go('elena', tab), tab);
    await expect(backdrop).toHaveCount(0);
  }
  await page.evaluate(() => window.atlas.go('sam', 'now'));
  await expect(backdrop).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('choose, remove and restore a background without changing another person', async ({
  page,
}, info) => {
  await page.getByRole('button', { name: 'Settings', exact: true }).click();
  await page.getByRole('button', { name: 'Your Now background Make this space your own' }).click();
  await expect(page.locator('.now-background-preview img')).toBeVisible();
  await page.screenshot({
    path: `docs/screenshots/${info.project.name}-now-background-settings.png`,
  });
  await page.getByRole('button', { name: 'Use a plain background' }).click();
  await expect(page.locator('.now-backdrop')).toHaveCount(0);
  await page.evaluate(() => window.atlas.dispatch('now-background'));
  await page.locator('#now-photo-input').setInputFiles('assets/backgrounds/elena-family.png');
  await expect(page.locator('.now-backdrop img')).toHaveAttribute(
    'src',
    /^data:image\/jpeg;base64,/,
  );
  const photo = await page.evaluate(
    () => window.atlas.getState().people.elena.ui.nowBackground.src,
  );
  expect(photo.length).toBeLessThan(1500000);
  await page.evaluate(() => window.atlas.go('sam', 'now'));
  await expect(page.locator('.now-backdrop')).toHaveCount(0);
  await page.evaluate(() => window.atlas.go('elena', 'now'));
  await expect(page.locator('.now-backdrop img')).toHaveAttribute('src', photo);
  await page.evaluate(() => window.atlas.dispatch('now-background'));
  await page.getByRole('button', { name: 'Restore family photo' }).click();
  await expect(page.locator('.now-backdrop img')).toHaveAttribute(
    'src',
    '/assets/backgrounds/elena-family.png',
  );
});

test('a selected photo survives reload on this device', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  try {
    await page.goto(baseURL + '/?p=elena&theme=vanilla&tab=now');
    await page.waitForFunction(() => !!window.atlas);
    await page.evaluate(() => window.atlas.dispatch('now-background'));
    await page.locator('#now-photo-input').setInputFiles('assets/backgrounds/elena-family.png');
    await expect(page.locator('.now-backdrop img')).toHaveAttribute(
      'src',
      /^data:image\/jpeg;base64,/,
    );
    const photo = await page.locator('.now-backdrop img').getAttribute('src');
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            new Promise((resolve) => {
              const request = indexedDB.open('hsbc-atlas-demo', 1);
              request.onsuccess = () => {
                const db = request.result;
                const record = db.transaction('sessions').objectStore('sessions').get('session');
                record.onsuccess = () => {
                  resolve(record.result?.state?.people?.elena?.ui?.nowBackground?.kind);
                  db.close();
                };
              };
            }),
        ),
      )
      .toBe('photo');
    await page.reload();
    await page.waitForFunction(() => !!window.atlas);
    await expect(page.locator('.now-backdrop img')).toHaveAttribute('src', photo!);
  } finally {
    await context.close();
  }
});
