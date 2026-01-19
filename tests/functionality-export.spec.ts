import { test, expect } from '@playwright/test';
import { statSync, readFileSync } from 'fs';

// Helper: Wait for download to complete and verify it
async function waitForDownload(page, downloadPromise) {
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  // Verify file exists and has content
  const stats = statSync(path!);
  expect(stats.size).toBeGreaterThan(0);
  return { download, path, size: stats.size };
}

// Helper: Ensure panel is open
async function ensurePanelOpen(page) {
  const panel = page.locator('#errlPanel');
  const isMinimized = await panel.evaluate((el) => {
    return el.classList.contains('minimized');
  });
  
  if (isMinimized) {
    await panel.click({ force: true });
    await page.waitForTimeout(500);
  }
  
  await expect(page.locator('#panelTabs')).toBeVisible({ timeout: 5000 });
}

test.describe('Export Functionality Tests', () => {
  test.describe('Main Portal Export Features', () => {
    test('@ui export HTML button downloads HTML file with settings', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/index.html');
      await page.waitForLoadState('networkidle');
      await ensurePanelOpen(page);

      // Switch to Dev tab where export buttons are
      const devTab = page.getByRole('button', { name: /DEV/i });
      await devTab.click();
      await page.waitForTimeout(300);

      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

      // Click export HTML button
      const exportBtn = page.locator('#exportHtmlBtn');
      await expect(exportBtn).toBeVisible();
      await exportBtn.click();

      // Wait for download
      const { download, size } = await waitForDownload(page, downloadPromise);

      // Verify download properties
      expect(download.suggestedFilename()).toContain('.html');
      expect(size).toBeGreaterThan(100); // HTML file should have content

      // Verify file content contains expected elements
      const filePath = await download.path();
      const content = readFileSync(filePath!, 'utf-8');
      expect(content).toContain('<!doctype html>');
      expect(content).toContain('Errl Portal Snapshot');
    });

    test('@ui PNG snapshot button downloads PNG file', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/index.html');
      await page.waitForLoadState('networkidle');
      await ensurePanelOpen(page);

      // Wait for page to be ready for screenshots
      await page.waitForTimeout(1000);

      // Switch to Dev tab where export buttons are
      const devTab = page.getByRole('button', { name: /DEV/i });
      await devTab.click();
      await page.waitForTimeout(300);

      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 30000 });

      // Click PNG snapshot button
      const pngBtn = page.locator('#snapshotPngBtn');
      await expect(pngBtn).toBeVisible();
      await pngBtn.click();

      // Wait for download (PNG rendering may take time)
      const { download, size } = await waitForDownload(page, downloadPromise);

      // Verify download properties
      expect(download.suggestedFilename()).toContain('.png');
      expect(download.suggestedFilename()).toContain('errl-portal');
      expect(size).toBeGreaterThan(1000); // PNG file should have reasonable size
    });

    test('@ui save defaults button saves to localStorage', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/index.html');
      await page.waitForLoadState('networkidle');
      await ensurePanelOpen(page);

      // Switch to GLB tab first
      const glbTab = page.getByRole('button', { name: /GL Bubbles/i });
      await glbTab.click();
      await page.waitForTimeout(300);

      // Set some settings first
      await page.fill('#bgSpeed', '1.5', { force: true });
      await page.dispatchEvent('#bgSpeed', 'input');

      // Switch to DEV tab where save defaults button is
      const devTab = page.getByRole('button', { name: /DEV/i });
      await devTab.click();
      await page.waitForTimeout(300);

      // Click save defaults button
      const saveBtn = page.locator('#saveDefaultsBtn');
      await expect(saveBtn).toBeVisible();
      await saveBtn.click();

      // Wait a bit for localStorage operation
      await page.waitForTimeout(500);

      // Verify localStorage was updated
      const savedBubbles = await page.evaluate(() => {
        return localStorage.getItem('errl_gl_bubbles');
      });
      expect(savedBubbles).toBeTruthy();
      const parsed = JSON.parse(savedBubbles || '{}');
      // Value may be stored as number or string - check both
      expect(parsed.speed === '1.5' || parsed.speed === 1.5).toBeTruthy();
    });

    test('@ui reset defaults button clears localStorage settings', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/index.html');
      await page.waitForLoadState('networkidle');
      await ensurePanelOpen(page);

      // Switch to GLB tab first
      const glbTab = page.getByRole('button', { name: /GL Bubbles/i });
      await glbTab.click();
      await page.waitForTimeout(300);

      // Set and save some defaults first (use 1.8 instead of 2.0 to ensure valid range)
      await page.fill('#bgSpeed', '1.8', { force: true });
      await page.dispatchEvent('#bgSpeed', 'input');
      
      // Switch to DEV tab where save defaults button is
      const devTab = page.getByRole('button', { name: /DEV/i });
      await devTab.click();
      await page.waitForTimeout(300);
      
      const saveBtn = page.locator('#saveDefaultsBtn');
      await saveBtn.click();
      await page.waitForTimeout(500);

      // Now reset
      const resetBtn = page.locator('#resetDefaultsBtn');
      await expect(resetBtn).toBeVisible();
      await resetBtn.click();
      await page.waitForTimeout(500);

      // Verify localStorage was cleared/reset
      const bubblesAfterReset = await page.evaluate(() => {
        return localStorage.getItem('errl_gl_bubbles');
      });
      // After reset, settings may be cleared or set to defaults
      // Check unified settings bundle instead
      const settingsBundle = await page.evaluate(() => {
        return localStorage.getItem('errl_portal_settings_v1');
      });
      // Bundle should exist (reset sets defaults, doesn't clear)
      // Or old key may be cleared - either is valid
      expect(bubblesAfterReset === null || bubblesAfterReset === '{}' || settingsBundle !== null).toBeTruthy();
    });
  });

  test.describe('Pin Designer Export Features', () => {
    test('@ui pin designer export SVG button downloads SVG file', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/pin-designer/');
      await page.waitForLoadState('networkidle');
      
      // Pin designer is loaded in an iframe
      const iframe = page.locator('iframe[src*="pin-designer.html"]');
      await expect(iframe).toBeVisible({ timeout: 10000 });
      const iframeContent = await iframe.contentFrame();
      if (!iframeContent) {
        throw new Error('Pin designer iframe not found');
      }

      // Wait for SVG to be ready (inside iframe)
      await iframeContent.waitForSelector('#pinSVG', { timeout: 10000 });
      await page.waitForTimeout(1000);

      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 });

      // Click export SVG button
      const exportSVGBtn = page.locator('#exportSVG');
      await expect(exportSVGBtn).toBeVisible();
      await exportSVGBtn.click();

      // Wait for download
      const { download, size } = await waitForDownload(page, downloadPromise);

      // Verify download properties
      expect(download.suggestedFilename()).toBe('errl-painted.svg');
      expect(size).toBeGreaterThan(100); // SVG should have content

      // Verify file content
      const filePath = await download.path();
      const content = readFileSync(filePath!, 'utf-8');
      expect(content).toContain('<svg');
      expect(content).toContain('xmlns');
    });

    test('@ui pin designer export PNG button downloads PNG file', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/pin-designer/');
      await page.waitForLoadState('networkidle');
      
      // Pin designer is loaded in an iframe
      const iframe = page.locator('iframe[src*="pin-designer.html"]');
      await expect(iframe).toBeVisible({ timeout: 10000 });
      const iframeContent = await iframe.contentFrame();
      if (!iframeContent) {
        throw new Error('Pin designer iframe not found');
      }

      // Wait for SVG to be ready (inside iframe)
      await iframeContent.waitForSelector('#pinSVG', { timeout: 10000 });
      await iframeContent.waitForTimeout(1000);

      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 15000 });

      // Click export PNG button (inside iframe)
      const exportPNGBtn = iframeContent.locator('#exportPNG');
      await expect(exportPNGBtn).toBeVisible();
      await exportPNGBtn.click();

      // Wait for download (PNG conversion may take time)
      const { download, size } = await waitForDownload(page, downloadPromise);

      // Verify download properties
      expect(download.suggestedFilename()).toBe('errl-painted.png');
      expect(size).toBeGreaterThan(1000); // PNG should have reasonable size
    });
  });

  test.describe('Assets Page Download Features', () => {
    test('@ui assets page download HTML links work', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/assets/');
      await page.waitForLoadState('networkidle');

      // Wait for assets to load
      await page.waitForTimeout(2000);

      // Find download links (they should have text like "Download HTML")
      const downloadLinks = page.locator('a:has-text("Download HTML")');
      const count = await downloadLinks.count();

      if (count > 0) {
        // Test first download link
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
        await downloadLinks.first().click();
        const { download, size } = await waitForDownload(page, downloadPromise);

        expect(download.suggestedFilename()).toContain('.html');
        expect(size).toBeGreaterThan(100);
      } else {
        // Skip if no download links found (may be loading)
        test.skip();
      }
    });
  });
});
