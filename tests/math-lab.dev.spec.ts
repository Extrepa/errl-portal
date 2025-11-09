import { test, expect } from '@playwright/test';

// Minimal smoke test for Math Lab dev-flagged features (export + fps)
// Uses explicit HTML path under Vite root to avoid route assumptions.

test.describe('Math Lab (dev flags)', () => {
  test('page loads at explicit path and shows the correct title', async ({ page, baseURL }) => {
    const url = baseURL! + '/portal/pages/studio/math-lab/index.html?export=1&fps=1';
    await page.goto(url);
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveTitle(/Psychedelic Math Lab/i);
  });
});
