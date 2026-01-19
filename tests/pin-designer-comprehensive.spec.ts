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

test.describe('Pin Designer Pages - Comprehensive', () => {
  test('@ui pin-designer index page - comprehensive', async ({ page, baseURL }) => {
    const portalPath = getPortalPath(baseURL);
    const url = baseURL! + `/pin-designer/`;
    
    await testPageLoad(page, url, 'pin');
    
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Verify page content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
    
    // Check for iframe or designer content
    const iframe = page.locator('iframe');
    const canvas = page.locator('canvas');
    const svg = page.locator('svg');
    const iframeCount = await iframe.count();
    const canvasCount = await canvas.count();
    const svgCount = await svg.count();
    expect(iframeCount > 0 || canvasCount > 0 || svgCount > 0).toBe(true);
  });

  test('@ui pin-designer alternate page - comprehensive', async ({ page, baseURL }) => {
    const portalPath = getPortalPath(baseURL);
    // Pin designer is at /pin-designer/ (loads index.html with iframe)
    const url = baseURL! + `${portalPath}/pin-designer/`;
    
    await testPageLoad(page, url, 'pin');
    
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Verify page content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });

  test('@ui pin-widget designer page - comprehensive', async ({ page, baseURL }) => {
    const portalPath = getPortalPath(baseURL);
    const url = baseURL! + `/studio/pin-widget/ErrlPin.Widget/designer.html`;
    
    await testPageLoad(page, url, 'widget'); // Actual title is "Errl Widget — v2.2..."
    
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Verify designer content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
    
    // Check for SVG or canvas elements
    const svg = page.locator('svg');
    const canvas = page.locator('canvas');
    const svgCount = await svg.count();
    const canvasCount = await canvas.count();
    expect(svgCount > 0 || canvasCount > 0).toBe(true);
  });
});

