import { test, expect } from '@playwright/test';

/**
 * Verification tests for Assets page iframe fixes and Designer page routing
 * 
 * These tests verify:
 * 1. Color Customizer and Pin Widget iframes load correctly on Assets page
 * 2. Designer page routes correctly and loads the app
 */

test.describe('Assets Page - Iframe Fixes', () => {
  test('@ui Assets page loads Color Customizer iframe correctly', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/assets/');
    await page.waitForLoadState('networkidle');
    
    // Find the Color Customizer iframe
    const colorCustomizerIframe = page.locator('iframe[src*="svg-colorer"]');
    await expect(colorCustomizerIframe).toBeVisible({ timeout: 10000 });
    
    // Check that iframe loads content (not just a blank page)
    const iframeContent = await colorCustomizerIframe.contentFrame();
    if (iframeContent) {
      await iframeContent.waitForLoadState('networkidle');
      const title = await iframeContent.title();
      expect(title).toContain('Color Customizer');
    }
  });

  test('@ui Assets page loads Pin Widget iframe correctly', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/assets/');
    await page.waitForLoadState('networkidle');
    
    // Find the Pin Widget iframe
    const pinWidgetIframe = page.locator('iframe[src*="pin-widget"]');
    await expect(pinWidgetIframe).toBeVisible({ timeout: 10000 });
    
    // Check that iframe loads content
    const iframeContent = await pinWidgetIframe.contentFrame();
    if (iframeContent) {
      await iframeContent.waitForLoadState('networkidle');
      const title = await iframeContent.title();
      expect(title).toContain('Widget');
    }
  });

  test('@ui Assets page iframes use relative paths', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/assets/');
    await page.waitForLoadState('networkidle');
    
    // Check that Color Customizer uses relative path
    const colorCustomizerIframe = page.locator('iframe[src*="svg-colorer"]');
    const colorSrc = await colorCustomizerIframe.getAttribute('src');
    expect(colorSrc).toContain('../studio/svg-colorer');
    expect(colorSrc).not.toContain('/studio/svg-colorer'); // Should not be absolute
    
    // Check that Pin Widget uses relative path
    const pinWidgetIframe = page.locator('iframe[src*="pin-widget"]');
    const pinSrc = await pinWidgetIframe.getAttribute('src');
    expect(pinSrc).toContain('../studio/pin-widget');
    expect(pinSrc).not.toContain('/studio/pin-widget'); // Should not be absolute
  });
});

test.describe('Designer Page - Routing Fix', () => {
  test('@ui Designer page loads via /designer.html', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/designer.html');
    await page.waitForLoadState('networkidle');
    
    // Check that designer app loads (should have root div)
    const root = page.locator('#root');
    await expect(root).toBeVisible({ timeout: 10000 });
    
    // Verify title
    const title = await page.title();
    expect(title).toContain('Designer');
  });

  test('@ui Designer page loads via /designer/', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/designer/');
    await page.waitForLoadState('networkidle');
    
    // Check that designer app loads
    const root = page.locator('#root');
    await expect(root).toBeVisible({ timeout: 10000 });
  });

  test('@ui Designer page loads via /designer (no trailing slash)', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/designer');
    await page.waitForLoadState('networkidle');
    
    // Should redirect or load designer app
    const root = page.locator('#root');
    await expect(root).toBeVisible({ timeout: 10000 });
  });

  test('@ui Designer page does not load home page', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/designer.html');
    await page.waitForLoadState('networkidle');
    
    // Should NOT have portal-specific elements
    const portalPanel = page.locator('#errlPanel');
    await expect(portalPanel).not.toBeVisible();
    
    // Should have designer app root
    const root = page.locator('#root');
    await expect(root).toBeVisible();
  });
});
