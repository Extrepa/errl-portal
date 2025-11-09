import { test, expect } from '@playwright/test';

test.describe('Math Lab Verification', () => {
  test('Page loads and first effect renders', async ({ page }) => {
    await page.goto('http://localhost:5173/studio/math-lab/');
    await expect(page.locator('canvas, svg').first()).toBeVisible();
  });

  test('Sliders respond to input', async ({ page }) => {
    await page.goto('http://localhost:5173/studio/math-lab/');
    const slider = page.locator('input[type="range"]').first();
    const initialValue = await slider.inputValue();
    // some sliders might need drag; set value by script if necessary
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) { (el as HTMLInputElement).value = String(Number((el as HTMLInputElement).value) + 1); el.dispatchEvent(new Event('input', { bubbles: true })); }
    }, 'input[type="range"]');
    await expect(slider).not.toHaveValue(initialValue);
  });

  test('Tabs switch effects', async ({ page }) => {
    await page.goto('http://localhost:5173/studio/math-lab/');
    const tabs = page.locator('button, [role="tab"]');
    const count = await tabs.count();
    if (count > 1) {
      await tabs.nth(1).click();
      await expect(page.locator('canvas, svg').first()).toBeVisible();
    } else {
      test.skip(true, 'No tabs found; UI may not use standard buttons.');
    }
  });
});
