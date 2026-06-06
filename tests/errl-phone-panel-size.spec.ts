import { test, expect } from '@playwright/test';
import { ensurePhonePanelOpen, gotoPortalLanding } from './helpers/test-helpers';

test.describe('Errl phone panel size', () => {
  test('expanded panel stays usable after bundle write and reload', async ({ page, baseURL }) => {
    await gotoPortalLanding(page, baseURL!);
    await ensurePhonePanelOpen(page);

    await page.evaluate(() => {
      const key = 'errl_portal_settings_v1';
      const raw = localStorage.getItem(key);
      const bundle = raw ? JSON.parse(raw) : { version: 1, ui: {} };
      bundle.ui = bundle.ui || {};
      bundle.ui.errlPhonePanelSize = '1.15';
      localStorage.setItem(key, JSON.stringify(bundle));
      const api = window.errlSceneControls;
      if (api && typeof api.reloadFromStorage === 'function') api.reloadFromStorage();
    });

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
    await ensurePhonePanelOpen(page);

    const panel = page.locator('#errlPanel');
    await panel.evaluate((el) => {
      el.classList.remove('minimized');
      el.setAttribute('aria-expanded', 'true');
    });
    await expect(panel).toBeVisible();

    const box = await panel.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;
    expect(box.width).toBeGreaterThan(100);
    expect(box.height).toBeGreaterThan(100);
  });

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
