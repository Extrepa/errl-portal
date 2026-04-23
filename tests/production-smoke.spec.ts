import { test, expect } from '@playwright/test';

/**
 * Fast checks against a deployed site (or local when webServer is used).
 * Run locally:  PLAYWRIGHT_BASE_URL=https://errl.wtf  npx playwright test tests/production-smoke.spec.ts
 * CI:           workflow "Playwright against deployed URL" (optional)
 */
test.describe('production smoke', () => {
  test('home page responds and has nav', async ({ page, baseURL }) => {
    await page.goto((baseURL || 'http://127.0.0.1:5173') + '/', { waitUntil: 'domcontentloaded', timeout: 45_000 });
    const panel = page.locator('#errlPanel');
    await expect(panel).toBeAttached({ timeout: 20_000 });
  });
});
