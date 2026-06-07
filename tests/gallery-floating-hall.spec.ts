import { test, expect } from '@playwright/test';

test.describe('Gallery views', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseURL!}/gallery/`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
    await page.waitForSelector('[data-gallery-ready="true"]', { timeout: 25000 });
  });

  test('@ui gallery loads grid by default with collection header', async ({ page }) => {
    await expect(page.locator('.gallery-view-switcher')).toBeAttached();
    await expect(page.locator('.gallery-view-switcher__tab--active')).toContainText(/Grid/i);
    await expect(page.locator('.gallery-collection__title')).not.toBeEmpty();
    await expect(page.locator('.gallery-collection__watermark')).not.toBeEmpty();
    await expect(page.locator('.errl-gallery-title')).toHaveCount(0);
    await expect(page.locator('.gallery-grid__list')).toBeVisible();
  });

  test('@ui circles view fills with density slider', async ({ page }) => {
    await page.locator('.gallery-view-switcher__tab', { hasText: 'Circles' }).click();
    await expect(page.locator('.gallery-circles__grid')).toBeVisible();
    await expect(page.locator('.gallery-density__range')).toBeVisible();
  });

  test('@ui grid view shows photo wall', async ({ page }) => {
    await expect(page.locator('.gallery-grid__list')).toBeVisible();
    const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    expect(scrollHeight).toBeGreaterThan(844);
  });

  test('@ui collection picker switches album', async ({ page }) => {
    await page.locator('.gallery-collection__trigger').click();
    const second = page.locator('.gallery-collection__option').nth(1);
    const label = await second.locator('.gallery-collection__option-title').textContent();
    await second.click();
    if (label) {
      await expect(page.locator('.gallery-collection__title')).toContainText(label);
    }
  });

  test('@ui clicking a photo opens lightbox with download', async ({ page }) => {
    await page.locator('.gallery-grid__card').first().click();
    await expect(page.locator('.gallery-lightbox')).toBeVisible();
    await expect(page.locator('.gallery-lightbox__download')).toBeVisible();
  });
});
