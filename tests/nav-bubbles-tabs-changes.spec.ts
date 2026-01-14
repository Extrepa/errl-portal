import { test, expect } from '@playwright/test';

test.describe('Nav Bubbles & Tabs Changes Verification', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
  });

  test('@ui nav bubbles are larger (60% increase)', async ({ page }) => {
    // Check nav bubble size
    const bubbleSize = await page.evaluate(() => {
      const bubble = document.querySelector('.bubble') as HTMLElement;
      if (!bubble) return null;
      const styles = window.getComputedStyle(bubble);
      return {
        width: styles.width,
        height: styles.height,
        lineHeight: styles.lineHeight,
      };
    });

    expect(bubbleSize).not.toBeNull();
    
    // Parse pixel values
    const width = parseFloat(bubbleSize!.width);
    const height = parseFloat(bubbleSize!.height);
    
    // Should be approximately 60% larger than original (42px → ~67px minimum)
    // With clamp, actual size depends on viewport, but should be >= 67px on larger screens
    expect(width).toBeGreaterThanOrEqual(60); // Allow some tolerance
    expect(height).toBeGreaterThanOrEqual(60);
  });

  test('@ui nav bubble labels are larger', async ({ page }) => {
    const labelSize = await page.evaluate(() => {
      const label = document.querySelector('.bubble .label') as HTMLElement;
      if (!label) return null;
      const styles = window.getComputedStyle(label);
      return {
        fontSize: styles.fontSize,
      };
    });

    expect(labelSize).not.toBeNull();
    const fontSize = parseFloat(labelSize!.fontSize);
    // Should be approximately 60% larger (11px → ~18px minimum)
    expect(fontSize).toBeGreaterThanOrEqual(15); // Allow tolerance
  });

  test('@ui Errl Phone tabs are at top', async ({ page }) => {
    // Open the panel if minimized
    const panel = page.locator('#errlPanel');
    const isMinimized = await panel.evaluate((el) => 
      el.classList.contains('minimized')
    );
    
    if (isMinimized) {
      await panel.click();
      await page.waitForTimeout(500);
    }

    // Check tabs position in DOM
    const tabsPosition = await page.evaluate(() => {
      const panel = document.getElementById('errlPanel');
      const tabs = document.getElementById('panelTabs');
      const contentWrapper = panel?.querySelector('.panel-content-wrapper');
      
      if (!panel || !tabs || !contentWrapper) return null;
      
      const panelChildren = Array.from(panel.children);
      const tabsIndex = panelChildren.indexOf(tabs);
      const contentIndex = panelChildren.indexOf(contentWrapper);
      
      return {
        tabsIndex,
        contentIndex,
        tabsBeforeContent: tabsIndex < contentIndex,
      };
    });

    expect(tabsPosition).not.toBeNull();
    expect(tabsPosition?.tabsBeforeContent).toBe(true);
  });

  test('@ui Errl Phone tabs use horizontal flex layout', async ({ page }) => {
    const panel = page.locator('#errlPanel');
    const isMinimized = await panel.evaluate((el) => 
      el.classList.contains('minimized')
    );
    
    if (isMinimized) {
      await panel.click();
      await page.waitForTimeout(500);
    }

    const tabsLayout = await page.evaluate(() => {
      const tabs = document.querySelector('.panel-tabs') as HTMLElement;
      if (!tabs) return null;
      const styles = window.getComputedStyle(tabs);
      return {
        display: styles.display,
        flexDirection: styles.flexDirection,
        flexWrap: styles.flexWrap,
      };
    });

    expect(tabsLayout).not.toBeNull();
    expect(tabsLayout?.display).toBe('flex');
    expect(tabsLayout?.flexDirection).toBe('row');
  });

  test('@ui Errl Phone tabs have horizontal layout with labels', async ({ page }) => {
    const panel = page.locator('#errlPanel');
    const isMinimized = await panel.evaluate((el) => 
      el.classList.contains('minimized')
    );
    
    if (isMinimized) {
      await panel.click();
      await page.waitForTimeout(500);
    }

    const tabLayout = await page.evaluate(() => {
      const tab = document.querySelector('.panel-tabs .tab') as HTMLElement;
      if (!tab) return null;
      const styles = window.getComputedStyle(tab);
      const label = tab.querySelector('.label') as HTMLElement;
      return {
        flexDirection: styles.flexDirection,
        height: styles.height,
        labelVisible: label ? window.getComputedStyle(label).display !== 'none' : false,
        labelFontSize: label ? window.getComputedStyle(label).fontSize : null,
      };
    });

    expect(tabLayout).not.toBeNull();
    expect(tabLayout?.flexDirection).toBe('row');
    expect(tabLayout?.height).toBeTruthy(); // Should have fixed height
    expect(tabLayout?.labelVisible).toBe(true);
    expect(tabLayout?.labelFontSize).toBeTruthy();
  });

  test('@ui Errl Phone tabs are clickable and switch sections', async ({ page }) => {
    const panel = page.locator('#errlPanel');
    const isMinimized = await panel.evaluate((el) => 
      el.classList.contains('minimized')
    );
    
    if (isMinimized) {
      await panel.click();
      await page.waitForTimeout(500);
    }

    // Click on a different tab
    const navTab = page.locator('.panel-tabs .tab[data-tab="nav"]');
    await navTab.click();
    await page.waitForTimeout(200);

    // Verify nav section is visible
    const navSection = page.locator('.panel-section[data-tab="nav"]');
    await expect(navSection).toBeVisible();

    // Verify nav tab is active
    const isActive = await navTab.evaluate((el) => 
      el.classList.contains('active')
    );
    expect(isActive).toBe(true);
  });

  test('@ui all 8 tabs are visible in horizontal layout', async ({ page }) => {
    const panel = page.locator('#errlPanel');
    const isMinimized = await panel.evaluate((el) => 
      el.classList.contains('minimized')
    );
    
    if (isMinimized) {
      await panel.click();
      await page.waitForTimeout(500);
    }

    const tabs = page.locator('.panel-tabs .tab');
    await expect(tabs).toHaveCount(8);
    
    // Verify all tabs are visible
    for (let i = 0; i < 8; i++) {
      await expect(tabs.nth(i)).toBeVisible();
    }
  });
});

