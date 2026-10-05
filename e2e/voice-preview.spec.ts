import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.__ATLAS_TEST__ = true;
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
});

test('voice is a mode of the same conversation, with spoken turns kept in the thread', async ({
  page,
}) => {
  await page.goto('/?p=sam&tab=now&theme=vanilla');
  await page.waitForFunction(() => !!window.atlas);
  await page.evaluate(() => window.atlas.dispatch('support:discuss'));
  const sheet = page.locator('.sheet.support-conversation');
  await page.getByRole('button', { name: 'Talk by voice' }).click();
  // Same sheet and header; the persona mark becomes the voice presence.
  await expect(sheet).toBeVisible();
  await expect(page.locator('.voice-stage')).toHaveAttribute('data-phase', 'ready');
  await expect(page.locator('.conversation-identity')).toContainText('Voice · microphone off');
  await expect(page.locator('.voice-orbit .companion-avatar-listener.is-orb')).toBeVisible();
  expect((await page.locator('.voice-orbit').boundingBox())!.width).toBeGreaterThanOrEqual(160);
  await expect(page.locator('.chat-thread')).toHaveAttribute('inert', '');
  await page.getByRole('button', { name: 'Try a sample question', exact: true }).click();
  await expect(page.locator('.voice-stage')).toHaveAttribute('data-phase', 'listening');
  // The exchange paces itself: listening, a beat to think, then the answer.
  await expect(page.locator('.voice-money')).toContainText('£420', { timeout: 6000 });
  await expect(page.locator('.voice-allocation-key > span')).toHaveCount(3);
  await expect(page.locator('.voice-stage .chat-message')).toHaveCount(0);
  await page.getByRole('button', { name: 'Type instead', exact: true }).click();
  await expect(page.locator('.voice-stage')).toHaveAttribute('data-phase', 'off');
  await expect(page.locator('.chat-message.ai').last()).toContainText('£420');
  await expect(page.locator('.chat-message.user .message-via').last()).toContainText('Spoken');
  await expect(page.locator('#chat-input')).toBeFocused();
});

test('Escape leaves voice before closing, and a new conversation starts in text', async ({
  page,
}) => {
  await page.goto('/?p=jordan&tab=now&theme=vanilla');
  await page.waitForFunction(() => !!window.atlas);
  await page.evaluate(() => window.atlas.dispatch('support:discuss'));
  await page.getByRole('button', { name: 'Talk by voice' }).click();
  await expect(page.locator('.voice-stage')).toHaveAttribute('data-phase', 'ready');
  await page.keyboard.press('Escape');
  await expect(page.locator('.voice-stage')).toHaveAttribute('data-phase', 'off');
  await expect(page.locator('.sheet.support-conversation')).toBeVisible();
  await page.getByRole('button', { name: 'Talk by voice' }).click();
  await page.getByRole('button', { name: 'Close conversation' }).click();
  await expect(page.locator('#overlay')).toBeEmpty();
  await page.evaluate(() => window.atlas.dispatch('support:discuss'));
  await expect(page.locator('.voice-stage')).toHaveAttribute('data-phase', 'off');
  await expect(page.locator('#chat-input')).toBeFocused();
});

test('a person joins from voice with the plans and the spoken question in view', async ({
  page,
}) => {
  await page.goto('/?p=elena&tab=now&theme=vanilla');
  await page.waitForFunction(() => !!window.atlas);
  await page.evaluate(() => window.atlas.dispatch('support:discuss'));
  await page.getByRole('button', { name: 'Talk by voice' }).click();
  await page.getByRole('button', { name: 'Try a sample question', exact: true }).click();
  await page.getByRole('button', { name: 'Bring in Priya' }).click({ timeout: 6000 });
  await expect(page.locator('.voice-person img')).toBeVisible();
  await expect(page.locator('.voice-handover')).toContainText('Your plans come with you.');
  await page.getByRole('button', { name: 'Continue with Priya', exact: true }).click();
  await expect(page.locator('.voice-stage')).toHaveAttribute('data-phase', 'off');
  await expect(page.locator('.conversation-identity')).toContainText('Priya');
  await expect(page.locator('.chat-message.human').last()).toContainText(
    'the question you asked by voice',
  );
});
