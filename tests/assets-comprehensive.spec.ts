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
  await expect(page.locator('body')).toBeVisible();
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
  await page.waitForTimeout(1000);
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
    const styles = window.getComputedStyle(document.documentElement);
    const errlBg = styles.getPropertyValue('--errl-bg');
    const errlText = styles.getPropertyValue('--errl-text');
    return !!(errlBg && errlText);
  });
  return hasDesignSystem;
}

test.describe('Asset Pages - Comprehensive', () => {
  test('@ui errl-head-coin page - comprehensive', async ({ page, baseURL }) => {
    const portalPath = getPortalPath(baseURL);
    const url = baseURL! + `/assets/errl-head-coin/`;
    
    await testPageLoad(page, url);
    
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Verify canvas or SVG exists
    const canvas = page.locator('canvas');
    const svg = page.locator('svg');
    const canvasCount = await canvas.count();
    const svgCount = await svg.count();
    expect(canvasCount > 0 || svgCount > 0).toBe(true);
    
    // Verify page content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });

  test('@ui errl-head-coin-v2 page - comprehensive', async ({ page, baseURL }) => {
    const portalPath = getPortalPath(baseURL);
    const url = baseURL! + `/assets/errl-head-coin-v2/`;
    
    await testPageLoad(page, url);
    
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Verify canvas or SVG
    const canvas = page.locator('canvas');
    const svg = page.locator('svg');
    const canvasCount = await canvas.count();
    const svgCount = await svg.count();
    expect(canvasCount > 0 || svgCount > 0).toBe(true);
    
    // Verify URL contains v2
    expect(page.url()).toContain('errl-head-coin-v2');
  });

  test('@ui errl-head-coin-v3 page - comprehensive', async ({ page, baseURL }) => {
    const portalPath = getPortalPath(baseURL);
    const url = baseURL! + `/assets/errl-head-coin-v3/`;
    
    await testPageLoad(page, url);
    
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Verify canvas or SVG
    const canvas = page.locator('canvas');
    const svg = page.locator('svg');
    const canvasCount = await canvas.count();
    const svgCount = await svg.count();
    expect(canvasCount > 0 || svgCount > 0).toBe(true);
    
    expect(page.url()).toContain('errl-head-coin-v3');
  });

  test('@ui errl-head-coin-v4 page - comprehensive', async ({ page, baseURL }) => {
    const portalPath = getPortalPath(baseURL);
    const url = baseURL! + `/assets/errl-head-coin-v4/`;
    
    await testPageLoad(page, url);
    
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Verify canvas or SVG
    const canvas = page.locator('canvas');
    const svg = page.locator('svg');
    const canvasCount = await canvas.count();
    const svgCount = await svg.count();
    expect(canvasCount > 0 || svgCount > 0).toBe(true);
    
    expect(page.url()).toContain('errl-head-coin-v4');
  });

  test('@ui errl-face-popout page - comprehensive', async ({ page, baseURL }) => {
    const portalPath = getPortalPath(baseURL);
    const url = baseURL! + `/assets/errl-face-popout/`;
    
    await testPageLoad(page, url);
    
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Verify canvas or SVG
    const canvas = page.locator('canvas');
    const svg = page.locator('svg');
    const canvasCount = await canvas.count();
    const svgCount = await svg.count();
    expect(canvasCount > 0 || svgCount > 0).toBe(true);
    
    expect(page.url()).toContain('errl-face-popout');
  });

  test('@ui walking-errl page - comprehensive', async ({ page, baseURL }) => {
    const portalPath = getPortalPath(baseURL);
    const url = baseURL! + `/assets/walking-errl/`;
    
    await testPageLoad(page, url);
    
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Verify canvas or SVG
    const canvas = page.locator('canvas');
    const svg = page.locator('svg');
    const canvasCount = await canvas.count();
    const svgCount = await svg.count();
    expect(canvasCount > 0 || svgCount > 0).toBe(true);
    
    expect(page.url()).toContain('walking-errl');
  });

  test('@ui errl-loader-original-parts page - comprehensive', async ({ page, baseURL }) => {
    const portalPath = getPortalPath(baseURL);
    const url = baseURL! + `/assets/errl-loader-original-parts/`;
    
    await testPageLoad(page, url);
    
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Verify canvas or SVG
    const canvas = page.locator('canvas');
    const svg = page.locator('svg');
    const canvasCount = await canvas.count();
    const svgCount = await svg.count();
    expect(canvasCount > 0 || svgCount > 0).toBe(true);
    
    expect(page.url()).toContain('errl-loader-original-parts');
  });
});

