import { test, expect } from '@playwright/test';

// Helper to determine expected portal path based on environment
function getPortalPath(baseURL: string | undefined): string {
  // Simplified: pages are now at root level in both dev and production
  return '';
}

// Helper: Test basic page load
async function testPageLoad(page, url: string, expectedTitle?: string) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('load', { timeout: 10000 }).catch(() => {});
  
  // Verify page loaded
  await expect(page.locator('body')).toBeVisible();
  
  // Verify title if provided
  if (expectedTitle) {
    const title = await page.title();
    expect(title.toLowerCase()).toContain(expectedTitle.toLowerCase());
  }
}

// Helper: Check for console errors
async function testConsoleErrors(page): Promise<string[]> {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  await page.waitForTimeout(1000); // Give time for errors to appear
  
  // Filter out non-critical errors
  const criticalErrors = errors.filter(err => 
    !err.includes('favicon') && 
    !err.includes('404') &&
    !err.includes('Failed to load resource') &&
    !err.includes('net::ERR_')
  );
  
  return criticalErrors;
}

// Helper: Verify design system is loaded
async function testDesignSystem(page): Promise<boolean> {
  const hasDesignSystem = await page.evaluate(() => {
    // Check if design system CSS is loaded by checking for CSS variables
    const styles = window.getComputedStyle(document.documentElement);
    const errlBg = styles.getPropertyValue('--errl-bg');
    const errlText = styles.getPropertyValue('--errl-text');
    return !!(errlBg && errlText);
  });
  
  return hasDesignSystem;
}

// Helper: Test navigation elements
async function testNavigation(page, baseURL: string) {
  // Check for back/home link
  const backLink = page.locator('a.errl-home-btn, a[href*="index.html"], a[href="/"], header a, nav a').first();
  const backLinkCount = await backLink.count();
  
  if (backLinkCount > 0) {
    await expect(backLink).toBeVisible({ timeout: 5000 });
  }
  
  // Check for navigation menu links
  const navLinks = page.locator('a[data-portal-link], a[href*="/studio"], nav a');
  const navLinkCount = await navLinks.count();
  
  // Navigation may or may not be present depending on page
  return { hasBackLink: backLinkCount > 0, navLinkCount };
}

// Helper: Test back to portal link
async function testBackLink(page, baseURL: string) {
  const backLink = page.locator('a.errl-home-btn, header a.errl-home-btn').first();
  const backLinkCount = await backLink.count();
  
  if (backLinkCount > 0) {
    await expect(backLink).toBeVisible({ timeout: 5000 });
    await backLink.click();
    
    // Wait for navigation
    await page.waitForURL('**/index.html**', { timeout: 10000 }).catch(() => {});
    
    // Verify we're back at main portal
    const isMainPortal = await page.evaluate(() => {
      return document.getElementById('errlPanel') !== null;
    });
    expect(isMainPortal).toBeTruthy();
  } else {
    // Fallback: try other back link patterns
    const altBackLink = page.locator('a[href="/"], a[href="/index.html"]').filter({ 
      hasNot: page.locator('[data-portal-link], .menuOrb, #navOrbit a') 
    }).first();
    const altCount = await altBackLink.count();
    if (altCount > 0) {
      await expect(altBackLink).toBeVisible({ timeout: 5000 });
      await altBackLink.click();
      await page.waitForURL('**/index.html**', { timeout: 10000 }).catch(() => {});
    }
  }
}

test.describe('Main Portal Pages - Comprehensive', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    // Set up error collection
    page.on('console', msg => {
      if (msg.type() === 'error') {
        // Errors collected in individual tests
      }
    });
  });

  test('@ui about page - comprehensive', async ({ page, baseURL }) => {
    const portalPath = getPortalPath(baseURL);
    const url = baseURL! + `/about/`;
    
    // Test page load
    await testPageLoad(page, url, 'about');
    
    // Test console errors
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    // Test design system
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Test UI elements
    await expect(page.locator('body')).toContainText(/about|errl/i, { timeout: 5000 });
    
    // Test navigation
    const nav = await testNavigation(page, baseURL!);
    expect(nav.hasBackLink || nav.navLinkCount > 0).toBe(true);
    
    // Test back link functionality
    await page.goto(url); // Reload page
    await page.waitForLoadState('load', { timeout: 10000 }).catch(() => {});
    await testBackLink(page, baseURL!);
  });

  test('@ui gallery page - comprehensive', async ({ page, baseURL }) => {
    const portalPath = getPortalPath(baseURL);
    const url = baseURL! + `/gallery/`;
    
    await testPageLoad(page, url, 'gallery');
    
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Verify images are present
    const images = page.locator('img');
    const imageCount = await images.count();
    expect(imageCount).toBeGreaterThan(0);
    
    // Test navigation
    const nav = await testNavigation(page, baseURL!);
    expect(nav.hasBackLink || nav.navLinkCount > 0).toBe(true);
    
    // Test back link
    await page.goto(url);
    await page.waitForLoadState('load', { timeout: 10000 }).catch(() => {});
    await testBackLink(page, baseURL!);
  });

  test('@ui assets index page - comprehensive', async ({ page, baseURL }) => {
    const portalPath = getPortalPath(baseURL);
    const url = baseURL! + `/assets/`;
    
    await testPageLoad(page, url, 'projects'); // Actual title is "Errl — Projects"
    
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Wait for dynamic content
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);
    
    // Verify assets grid or content exists
    const assetsGrid = page.locator('#assetsGrid');
    const assetBoxes = page.locator('#assetsGrid .box, .box');
    const assetIframes = page.locator('iframe');
    const assetLinks = page.locator('a[href*="errl-"], a.dl');
    
    const gridExists = await assetsGrid.count();
    const boxCount = await assetBoxes.count();
    const iframeCount = await assetIframes.count();
    const linkCount = await assetLinks.count();
    const totalCount = boxCount + iframeCount + linkCount;
    
    // Page should have some content
    expect(gridExists > 0 || totalCount > 0).toBe(true);
    
    // Test navigation
    const nav = await testNavigation(page, baseURL!);
    expect(nav.hasBackLink || nav.navLinkCount > 0).toBe(true);
    
    // Test back link
    await page.goto(url);
    await page.waitForLoadState('load', { timeout: 10000 }).catch(() => {});
    await testBackLink(page, baseURL!);
  });

  test('@ui events page - comprehensive', async ({ page, baseURL }) => {
    const portalPath = getPortalPath(baseURL);
    const url = baseURL! + `/events/`;
    
    await testPageLoad(page, url, 'events');
    
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Verify page content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
    
    // Test navigation
    const nav = await testNavigation(page, baseURL!);
    expect(nav.hasBackLink || nav.navLinkCount > 0).toBe(true);
    
    // Test back link
    await page.goto(url);
    await page.waitForLoadState('load', { timeout: 10000 }).catch(() => {});
    await testBackLink(page, baseURL!);
  });

  test('@ui merch page - comprehensive', async ({ page, baseURL }) => {
    const portalPath = getPortalPath(baseURL);
    const url = baseURL! + `/merch/`;
    
    await testPageLoad(page, url, 'merch');
    
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Verify page content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
    
    // Test navigation
    const nav = await testNavigation(page, baseURL!);
    expect(nav.hasBackLink || nav.navLinkCount > 0).toBe(true);
    
    // Test back link
    await page.goto(url);
    await page.waitForLoadState('load', { timeout: 10000 }).catch(() => {});
    await testBackLink(page, baseURL!);
  });

  test('@ui games page - comprehensive', async ({ page, baseURL }) => {
    const portalPath = getPortalPath(baseURL);
    const url = baseURL! + `/games/`;
    
    await testPageLoad(page, url, 'games');
    
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Verify page content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
    
    // Test navigation
    const nav = await testNavigation(page, baseURL!);
    expect(nav.hasBackLink || nav.navLinkCount > 0).toBe(true);
    
    // Test back link
    await page.goto(url);
    await page.waitForLoadState('load', { timeout: 10000 }).catch(() => {});
    await testBackLink(page, baseURL!);
  });

  test('@ui design-system page - comprehensive', async ({ page, baseURL }) => {
    const portalPath = getPortalPath(baseURL);
    const url = baseURL! + `/design-system/`;
    
    await testPageLoad(page, url, 'design system'); // Actual title is "Errl Design System - Examples"
    
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    // Design system page should definitely have design system loaded
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Verify design system documentation content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
    
    // Test navigation
    const nav = await testNavigation(page, baseURL!);
    expect(nav.hasBackLink || nav.navLinkCount > 0).toBe(true);
    
    // Test back link
    await page.goto(url);
    await page.waitForLoadState('load', { timeout: 10000 }).catch(() => {});
    await testBackLink(page, baseURL!);
  });

  test('@ui dev page - comprehensive', async ({ page, baseURL }) => {
    const portalPath = getPortalPath(baseURL);
    const url = baseURL! + `/dev/`;
    
    await testPageLoad(page, url, 'dev controls'); // Actual title is "Errl Dev Controls"
    
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Verify dev tools or content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
    
    // Test navigation
    const nav = await testNavigation(page, baseURL!);
    expect(nav.hasBackLink || nav.navLinkCount > 0).toBe(true);
    
    // Test back link
    await page.goto(url);
    await page.waitForLoadState('load', { timeout: 10000 }).catch(() => {});
    await testBackLink(page, baseURL!);
  });
});

