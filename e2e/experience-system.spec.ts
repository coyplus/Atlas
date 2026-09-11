import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?p=sam&theme=vanilla&tab=you');
  await page.waitForFunction(() => !!window.atlas);
});

test('reward discovery explains eligibility and execution uses the same live qualification', async ({
  page,
}) => {
  await page.evaluate(() => window.atlas.go('jordan', 'you'));
  const original = await page.evaluate(() =>
    JSON.stringify(window.atlas.getState().people.jordan.l1),
  );
  await page.evaluate(() => window.atlas.dispatch('points'));
  const coach = page.locator('[data-action="benefit:coach"]');
  await expect(coach).toBeEnabled();
  await expect(coach).toContainText('260 more Points to unlock');
  await coach.click();
  await expect(page.locator('.notice')).toContainText('260 more Points');
  await expect(page.locator('[data-action="redeem:coach"]')).toHaveCount(0);
  expect(await page.evaluate(() => JSON.stringify(window.atlas.getState().people.jordan.l1))).toBe(
    original,
  );

  await page.evaluate(() => {
    window.atlas.go('sam', 'you');
    window.atlas.dispatch('benefit:lounge');
  });
  await expect(page.locator('[data-action="redeem:lounge"]')).toHaveCount(0);
  await expect(page.locator('.notice')).toContainText('Premier or Elite');
  await page.evaluate(() => {
    const state = window.atlas.getState();
    state.people.sam.l1.accounts[0].balance += 2000;
    window.atlas.hydrate(state);
    window.atlas.dispatch('benefit:lounge');
  });
  await expect(page.locator('[data-action="redeem:lounge"]')).toBeEnabled();
  await page.evaluate(() => {
    window.atlas.closeAll();
    window.atlas.dispatch('benefit:boost');
  });
  await expect(page.locator('#benefit-pot option[value="family-budget"]')).toHaveCount(0);
});

test('primary actions and useful captions share the same hierarchy across screen families', async ({
  page,
}) => {
  for (const person of ['sam', 'elena']) {
    for (const action of ['pay', 'future-own', 'checkin-tool:instinct']) {
      await page.evaluate(
        ({ person, action }) => {
          window.atlas.go(person, 'now');
          window.atlas.dispatch(action);
        },
        { person, action },
      );
      const button = page
        .locator('.sheet .btn.primary, .sheet [data-action="checkin-mode:discover"]')
        .first();
      await expect(button).toBeVisible();
      const paint = await button.evaluate((el) => {
        const css = getComputedStyle(el);
        const probe = document.createElement('span');
        probe.style.color = 'var(--ink)';
        el.append(probe);
        const ink = getComputedStyle(probe).color;
        probe.remove();
        return { ink, background: css.backgroundColor, height: el.getBoundingClientRect().height };
      });
      expect(paint.background, person + ' ' + action).toBe(paint.ink);
      expect(paint.height).toBeGreaterThanOrEqual(44);
    }
  }
  await page.evaluate(() => window.atlas.go('sam', 'now'));
  const caption = page.locator('[data-module="housepot"] .module-note').first();
  expect(
    await caption.evaluate((e) => parseFloat(getComputedStyle(e).fontSize)),
  ).toBeGreaterThanOrEqual(12);
});

test('short screens keep actions reachable and preserve the drawer invitation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  for (const [person, action, target] of [
    ['sam', 'pot-personalise:hol', '[data-action="pot-appearance-save"]'],
    ['sam', 'container-rule-new:ef', '[data-action="container-rule-review:ef"]'],
    ['elena', 'future-horizon:horizon-family-giving', 'button[form="future-add-form"]'],
  ]) {
    await page.evaluate(
      ({ person, action }) => {
        window.atlas.go(person, 'future');
        window.atlas.dispatch(action);
      },
      { person, action },
    );
    const cta = page.locator(target);
    await expect(cta).toHaveCount(1);
    await cta.scrollIntoViewIfNeeded();
    await expect(cta).toBeInViewport();
    await expect(page.locator('.tabbar')).toBeHidden();
    expect(
      await page.locator('.sheet').evaluate((e) => e.scrollWidth <= e.clientWidth + 1),
    ).toBeTruthy();
  }
  await page.evaluate(() => window.atlas.go('sam', 'future'));
  const invitation = page.locator('.future-drawer-invitation');
  await expect(invitation).toBeInViewport();
  const nav = (await page.locator('.tabbar').boundingBox())!;
  const rect = (await invitation.boundingBox())!;
  expect(rect.y + rect.height).toBeLessThanOrEqual(nav.y + 1);
  await page.locator('.future-drawer-grip').focus();
  await page.locator('.future-drawer-grip').press('End');
  const idea = page.locator('.fg-idea').first();
  await idea.scrollIntoViewIfNeeded();
  await expect(idea).toBeInViewport();
  await idea.click();
  await page.locator('.future-drawer-grip').press('Home');
  await expect(page.locator('.future-drawer')).toHaveAttribute('data-state', 'docked');
  expect(await page.locator('.future-drawer').evaluate((e) => e.scrollTop)).toBe(0);
});

test('rapid detail navigation replaces motion and reduced motion stays still', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const count = await page.evaluate(() => {
    window.atlas.dispatch('pay');
    window.atlas.dispatch('transfer');
    return document.querySelector('.sheet-body')!.getAnimations().length;
  });
  expect(count).toBe(1);
  await expect
    .poll(() => page.locator('.sheet-body').evaluate((e) => e.getAnimations().length))
    .toBe(0);
  await expect(page.locator('.sheet-body')).toHaveCSS('transform', 'none');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => window.atlas.dispatch('settings'));
  expect(await page.locator('.sheet-body').evaluate((e) => e.getAnimations().length)).toBe(0);
});
