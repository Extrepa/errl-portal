import { test, expect } from '@playwright/test';
import { ensurePhonePanelOpen } from './helpers/test-helpers';

test.describe('Errl phone panel size', () => {
  test('expanded panel is at least 100x100px after opening', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
    await ensurePhonePanelOpen(page);

    const panel = page.locator('#errlPanel');
    await expect(panel).toBeVisible();

    const box = await panel.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;
    expect(box.width).toBeGreaterThan(100);
    expect(box.height).toBeGreaterThan(100);
  });
});
