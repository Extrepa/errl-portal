import { test, expect } from '@playwright/test';

// Helper to determine expected portal path based on environment
function getPortalPath(baseURL: string | undefined): string {
  // Simplified: pages are now at root level in both dev and production
  return '';
}

test.describe('Responsive Design Tests', () => {
  test('@ui mobile viewport (375x667) - main portal', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    
    // No horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBeFalsy();
    
    // Errl Phone panel should be accessible
    const panel = page.locator('#errlPanel');
    await expect(panel).toBeVisible();
    
    // Navigation bubbles should be visible
    const navOrbit = page.locator('#navOrbit');
    await expect(navOrbit).toBeVisible();
  });

  test('@ui mobile viewport - Errl Phone panel usable', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    
    // Open panel
    await page.evaluate(() => {
      const p = document.getElementById('errlPanel');
      if (p && p.classList.contains('minimized')) p.click();
    });
    
    // Panel should be visible and usable
    const panelTabs = page.locator('#panelTabs');
    await expect(panelTabs).toBeVisible();
    
    // Tabs should be clickable
    const hudTab = page.getByRole('button', { name: 'HUD' });
    await expect(hudTab).toBeVisible();
    await hudTab.click();
  });

  test('@ui mobile viewport - all pages load', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const portalPath = getPortalPath(baseURL);
    
    const pages = [
      `/about/`,
      `/gallery/`,
      `/assets/`,
      `/events/`,
      `/merch/`
    ];
    
    for (const pagePath of pages) {
      await page.goto(baseURL! + pagePath);
      await page.waitForLoadState('networkidle');
      
      // No horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBeFalsy();
    }
  });

  test('@ui tablet viewport (768x1024) - main portal', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    
    // No horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBeFalsy();
    
    // All elements should be visible
    await expect(page.locator('#errlPanel')).toBeVisible();
    await expect(page.locator('#navOrbit')).toBeVisible();
    await expect(page.locator('#errlCenter')).toBeVisible();
  });

  test('@ui tablet viewport - all pages load', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    const portalPath = getPortalPath(baseURL);
    
    const pages = [
      `/about/`,
      `/gallery/`,
      `/assets/`
    ];
    
    for (const pagePath of pages) {
      await page.goto(baseURL! + pagePath);
      await page.waitForLoadState('networkidle');
      
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBeFalsy();
    }
  });

  test('@ui desktop viewport (1920x1080) - main portal', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    
    // All effects should be visible
    await expect(page.locator('#bgParticles')).toBeVisible();
    await expect(page.locator('#errlWebGL')).toBeVisible();
    await expect(page.locator('#errlCenter')).toBeVisible();
    await expect(page.locator('#navOrbit')).toBeVisible();
    
    // No horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBeFalsy();
  });

  test('@ui large desktop viewport (2560x1440) - layout scales', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    
    // Layout should scale correctly
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBeFalsy();
    
    // Elements should still be properly positioned
    await expect(page.locator('#errlCenter')).toBeVisible();
    await expect(page.locator('#navOrbit')).toBeVisible();
  });

  test('@ui touch interactions work on mobile', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    
    // Test touch on navigation bubble - use click instead of tap (tap requires hasTouch context)
    const navBubble = page.locator('#navOrbit a').first();
    await expect(navBubble).toBeVisible();
    
    // Simulate touch with click (works on mobile viewports)
    await navBubble.click({ force: true });
    await page.waitForTimeout(500);
    
    // Should navigate or show interaction
    const url = page.url();
    expect(url).toMatch(/about|gallery|assets|studio/);
  });
});

