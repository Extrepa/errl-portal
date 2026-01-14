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

test.describe('Studio Pages - Comprehensive', () => {
  test('@ui studio hub - comprehensive', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/studio');
    await page.waitForLoadState('networkidle');
    
    // Test console errors
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    // Test design system
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Verify main heading
    await expect(page.getByRole('heading', { name: 'Choose your Errl Lab' })).toBeVisible();
    
    // Verify all lab cards are present
    await expect(page.getByRole('heading', { name: 'Code Lab' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Psychedelic Math Lab' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Shape Madness' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pin Designer' })).toBeVisible();
    
    // Test navigation links
    const codeLabLink = page.getByRole('link', { name: /Code Lab/ });
    await expect(codeLabLink).toBeVisible();
    
    const mathLabLink = page.getByRole('link', { name: /Psychedelic Math Lab/ });
    await expect(mathLabLink).toBeVisible();
    
    const shapeMadnessLink = page.getByRole('link', { name: /Shape Madness/ });
    await expect(shapeMadnessLink).toBeVisible();
    
    const pinDesignerLink = page.getByRole('link', { name: /Pin Designer/ });
    await expect(pinDesignerLink).toBeVisible();
  });

  test('@ui studio code-lab - comprehensive', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/studio/code-lab');
    await page.waitForLoadState('networkidle');
    
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Verify code editor or format button
    const formatButton = page.getByRole('button', { name: /Format HTML/i });
    await expect(formatButton).toBeVisible();
    
    // Verify page content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });

  test('@ui studio math-lab - comprehensive', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/studio/math-lab');
    await page.waitForLoadState('networkidle');
    
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Verify iframe loads
    const mathLabIframe = page.locator('iframe[title="Psychedelic Math Lab"]');
    await expect(mathLabIframe).toBeVisible({ timeout: 10000 });
    
    // Verify iframe has content
    const iframeSrc = await mathLabIframe.getAttribute('src');
    expect(iframeSrc).toMatch(/math-lab/);
    
    // Wait for iframe to load
    await expect.poll(() =>
      page.frames().some((frame) =>
        /\/(legacy\/)?portal\/pages\/studio\/math-lab/.test(frame.url())
      )
    ).toBeTruthy();
  });

  test('@ui studio shape-madness - comprehensive', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/studio/shape-madness');
    await page.waitForLoadState('networkidle');
    
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Verify iframe loads
    const shapeIframe = page.locator('iframe[title="Shape Madness"]');
    await expect(shapeIframe).toBeVisible({ timeout: 10000 });
    
    // Verify iframe has content
    const iframeSrc = await shapeIframe.getAttribute('src');
    expect(iframeSrc).toMatch(/shape-madness/);
    
    // Wait for iframe to load
    await expect.poll(() => 
      page.frames().some((frame) => 
        /\/(legacy\/)?portal\/pages\/studio\/shape-madness/.test(frame.url())
      )
    ).toBeTruthy();
    
    // Verify iframe content
    const shapeFrame = page.frameLocator('iframe[title="Shape Madness"]');
    await expect(shapeFrame.locator('text=Shape Madness')).toBeVisible({ timeout: 10000 });
  });

  test('@ui studio pin-designer - comprehensive', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/studio/pin-designer');
    await page.waitForLoadState('networkidle');
    
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Verify iframe loads
    const pinFrame = page.frameLocator('iframe[title="Pin Designer"]');
    await expect(pinFrame.locator('text=Save Design')).toBeVisible({ timeout: 10000 });
  });

  test('@ui studio projects - comprehensive', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/studio/projects');
    await page.waitForLoadState('networkidle');
    
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Verify projects page content
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
    
    // Verify canvas exists
    await expect(page.locator('canvas#fx').first()).toBeVisible();
  });

  test('@ui studio svg-colorer - comprehensive', async ({ page, baseURL }) => {
    const portalPath = getPortalPath(baseURL);
    const url = baseURL! + `/studio/svg-colorer/`;
    
    await testPageLoad(page, url, 'color customizer'); // Actual title is "Errl — Color Customizer v2.6"
    
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Verify SVG colorer functionality
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
    
    // Check for SVG or canvas elements
    const svg = page.locator('svg');
    const canvas = page.locator('canvas');
    const svgCount = await svg.count();
    const canvasCount = await canvas.count();
    expect(svgCount > 0 || canvasCount > 0).toBe(true);
  });

  test('@ui legacy studio index - comprehensive', async ({ page, baseURL }) => {
    const portalPath = getPortalPath(baseURL);
    const url = baseURL! + `/studio/`;
    
    await testPageLoad(page, url, 'studio hub'); // Actual title is "Errl Studio Hub"
    
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Verify page content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });

  test('@ui legacy math-lab page - comprehensive', async ({ page, baseURL }) => {
    const portalPath = getPortalPath(baseURL);
    const url = baseURL! + `/studio/math-lab/`;
    
    await testPageLoad(page, url, 'math lab'); // Actual title is "Psychedelic Math Lab — 100 Toys | Errl"
    
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Verify page content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });

  test('@ui legacy shape-madness page - comprehensive', async ({ page, baseURL }) => {
    const portalPath = getPortalPath(baseURL);
    const url = baseURL! + `/studio/shape-madness/`;
    
    await testPageLoad(page, url, 'shape madness'); // Actual title is "Shape Madness — All Effects | Errl"
    
    const errors = await testConsoleErrors(page);
    expect(errors.length).toBe(0);
    
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
    
    // Verify page content
    const bodyText = await page.locator('body').textContent();
    expect(bodyText?.length).toBeGreaterThan(0);
  });
});

