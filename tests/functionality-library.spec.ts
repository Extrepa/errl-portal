import { test, expect } from '@playwright/test';

test.describe('Library Functionality Tests', () => {
  test.describe('Pin Designer Library System', () => {
    test('@ui library button opens library overlay', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/pin-designer/');
      await page.waitForLoadState('networkidle');
      
      // Pin designer is loaded in an iframe
      const iframe = page.locator('iframe[src*="pin-designer.html"]');
      await expect(iframe).toBeVisible({ timeout: 10000 });
      const iframeContent = await iframe.contentFrame();
      if (!iframeContent) {
        throw new Error('Pin designer iframe not found');
      }
      
      await iframeContent.waitForSelector('#pinSVG', { timeout: 10000 });
      await iframeContent.waitForTimeout(1000);

      // Find library button (inside iframe)
      const openLibraryBtn = iframeContent.locator('#openLibrary');
      await expect(openLibraryBtn).toBeVisible();

      // Check if library bridge is available (may not be in standalone mode)
      const bridgeAvailable = await iframeContent.evaluate(() => {
        return (window as any).pinAssetBridge?.available === true;
      });

      if (!bridgeAvailable) {
        // Library bridge not available (not in Studio context)
        // Button should be disabled, so skip this test
        test.skip();
        return;
      }

      // Click library button
      await openLibraryBtn.click();

      // Verify overlay is visible (inside iframe)
      const libraryOverlay = iframeContent.locator('#pinLibraryOverlay');
      await expect(libraryOverlay).toBeVisible({ timeout: 5000 });
      await expect(libraryOverlay).toHaveClass(/active/);

      // Verify overlay has content area (inside iframe)
      const libraryBody = iframeContent.locator('#pinLibraryBody');
      await expect(libraryBody).toBeVisible();
    });

    test('@ui library overlay closes correctly', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/pin-designer/');
      await page.waitForLoadState('networkidle');
      
      // Pin designer is loaded in an iframe
      const iframe = page.locator('iframe[src*="pin-designer.html"]');
      await expect(iframe).toBeVisible({ timeout: 10000 });
      const iframeContent = await iframe.contentFrame();
      if (!iframeContent) {
        throw new Error('Pin designer iframe not found');
      }
      
      await iframeContent.waitForSelector('#pinSVG', { timeout: 10000 });
      await iframeContent.waitForTimeout(1000);

      const bridgeAvailable = await iframeContent.evaluate(() => {
        return (window as any).pinAssetBridge?.available === true;
      });

      if (!bridgeAvailable) {
        test.skip();
        return;
      }

      // Open library (inside iframe)
      const openLibraryBtn = iframeContent.locator('#openLibrary');
      await openLibraryBtn.click();
      await iframeContent.waitForTimeout(500);

      // Verify overlay is open (inside iframe)
      const libraryOverlay = iframeContent.locator('#pinLibraryOverlay');
      await expect(libraryOverlay).toHaveClass(/active/);

      // Close using close button (inside iframe)
      const closeLibraryBtn = iframeContent.locator('#closeLibrary');
      await closeLibraryBtn.click();
      await iframeContent.waitForTimeout(500);

      // Verify overlay is closed
      await expect(libraryOverlay).not.toHaveClass(/active/);
    });

    test('@ui library overlay closes on Escape key', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/pin-designer/');
      await page.waitForLoadState('networkidle');
      
      // Pin designer is loaded in an iframe
      const iframe = page.locator('iframe[src*="pin-designer.html"]');
      await expect(iframe).toBeVisible({ timeout: 10000 });
      const iframeContent = await iframe.contentFrame();
      if (!iframeContent) {
        throw new Error('Pin designer iframe not found');
      }
      
      await iframeContent.waitForSelector('#pinSVG', { timeout: 10000 });
      await iframeContent.waitForTimeout(1000);

      const bridgeAvailable = await iframeContent.evaluate(() => {
        return (window as any).pinAssetBridge?.available === true;
      });

      if (!bridgeAvailable) {
        test.skip();
        return;
      }

      // Open library (inside iframe)
      const openLibraryBtn = iframeContent.locator('#openLibrary');
      await openLibraryBtn.click();
      await iframeContent.waitForTimeout(500);

      // Verify overlay is open (inside iframe)
      const libraryOverlay = iframeContent.locator('#pinLibraryOverlay');
      await expect(libraryOverlay).toHaveClass(/active/);

      // Press Escape (on iframe content)
      await iframeContent.keyboard.press('Escape');
      await iframeContent.waitForTimeout(500);

      // Verify overlay is closed
      await expect(libraryOverlay).not.toHaveClass(/active/);
    });

    test('@ui save design button saves to library', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/pin-designer/');
      await page.waitForLoadState('networkidle');
      
      // Pin designer is loaded in an iframe
      const iframe = page.locator('iframe[src*="pin-designer.html"]');
      await expect(iframe).toBeVisible({ timeout: 10000 });
      const iframeContent = await iframe.contentFrame();
      if (!iframeContent) {
        throw new Error('Pin designer iframe not found');
      }
      
      await iframeContent.waitForSelector('#pinSVG', { timeout: 10000 });
      await iframeContent.waitForTimeout(1000);

      const bridgeAvailable = await iframeContent.evaluate(() => {
        return (window as any).pinAssetBridge?.available === true;
      });

      if (!bridgeAvailable) {
        test.skip();
        return;
      }

      // Set up dialog handler for prompt (dialogs bubble to parent)
      let promptValue: string | null = null;
      page.on('dialog', async dialog => {
        if (dialog.type() === 'prompt') {
          promptValue = 'Test Design ' + Date.now();
          await dialog.accept(promptValue);
        } else if (dialog.type() === 'alert') {
          // Success alert
          await dialog.accept();
        }
      });

      // Click save design button (inside iframe)
      const saveDesignBtn = iframeContent.locator('#saveDesign');
      await expect(saveDesignBtn).toBeVisible();
      await saveDesignBtn.click();

      // Wait for prompt and alert
      await page.waitForTimeout(2000);

      // Verify prompt was shown and accepted
      expect(promptValue).toBeTruthy();
    });

    test('@ui library bridge connection check', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/pin-designer/');
      await page.waitForLoadState('networkidle');
      
      // Pin designer is loaded in an iframe
      const iframe = page.locator('iframe[src*="pin-designer.html"]');
      await expect(iframe).toBeVisible({ timeout: 10000 });
      const iframeContent = await iframe.contentFrame();
      if (!iframeContent) {
        throw new Error('Pin designer iframe not found');
      }
      
      await iframeContent.waitForSelector('#pinSVG', { timeout: 10000 });
      await iframeContent.waitForTimeout(1000);

      // Check if bridge exists and has correct interface (inside iframe)
      const bridgeInfo = await iframeContent.evaluate(() => {
        const bridge = (window as any).pinAssetBridge;
        if (!bridge) return { exists: false };
        return {
          exists: true,
          available: bridge.available === true,
          hasList: typeof bridge.list === 'function',
          hasGet: typeof bridge.get === 'function',
          hasSave: typeof bridge.save === 'function',
          hasRemove: typeof bridge.remove === 'function',
        };
      });

      expect(bridgeInfo.exists).toBeTruthy();
      expect(bridgeInfo.hasList).toBeTruthy();
      expect(bridgeInfo.hasGet).toBeTruthy();
      expect(bridgeInfo.hasSave).toBeTruthy();
      expect(bridgeInfo.hasRemove).toBeTruthy();
    });
  });
});
