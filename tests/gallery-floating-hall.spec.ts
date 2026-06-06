import { test, expect } from '@playwright/test';

test.describe('Gallery floating hall', () => {
  test('@ui gallery page loads floating hall with manifest art', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseURL!}/gallery/`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});

    await expect(page.locator('.errl-gallery-title')).toContainText(/Floating Hall/i);
    await page.waitForSelector('[data-gallery-ready="true"]', { timeout: 20000 });
    await expect(page.locator('.gallery-hall__canvas canvas')).toBeAttached();
  });

  test('@ui gallery scroll runway increases scroll height', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseURL!}/gallery/`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-gallery-ready="true"]', { timeout: 20000 });

    const before = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(600);
    const after = await page.evaluate(() => window.scrollY);

    expect(after).toBeGreaterThan(before);
    const metrics = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
    }));
    expect(metrics.scrollHeight).toBeGreaterThan(metrics.innerHeight + 200);
  });
});
