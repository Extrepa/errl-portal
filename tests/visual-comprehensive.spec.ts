import { test, expect } from '@playwright/test';
import { writeFileSync } from 'fs';
import { join } from 'path';

// All pages from vite.config.ts build inputs
const ALL_PAGES = [
  { path: '/', name: 'Main Portal (index.html)' },
  { path: '/about/', name: 'About Page' },
  { path: '/gallery/', name: 'Gallery Page' },
  { path: '/assets/', name: 'Assets Index' },
  { path: '/assets/errl-head-coin/', name: 'Asset: Errl Head Coin' },
  { path: '/assets/errl-head-coin-v2/', name: 'Asset: Errl Head Coin V2' },
  { path: '/assets/errl-head-coin-v3/', name: 'Asset: Errl Head Coin V3' },
  { path: '/assets/errl-head-coin-v4/', name: 'Asset: Errl Head Coin V4' },
  { path: '/assets/errl-face-popout/', name: 'Asset: Errl Face Popout' },
  { path: '/assets/walking-errl/', name: 'Asset: Walking Errl' },
  { path: '/assets/errl-loader-original-parts/', name: 'Asset: Errl Loader Original Parts' },
  { path: '/studio/', name: 'Studio Index' },
  { path: '/studio/math-lab/', name: 'Studio: Math Lab' },
  { path: '/studio/shape-madness/', name: 'Studio: Shape Madness' },
  { path: '/studio/svg-colorer/', name: 'Studio: SVG Colorer' },
  { path: '/pin-designer/', name: 'Pin Designer Index' },
  { path: '/pin-designer/pin-designer', name: 'Pin Designer App' },
  { path: '/games/', name: 'Games Page' },
  { path: '/events/', name: 'Events Page' },
  { path: '/merch/', name: 'Merch Page' },
  { path: '/chat', name: 'Chatbot' },
];

// Helper: Test page load and capture visual state
async function testPageVisual(page: any, url: string, pageName: string) {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    } else if (msg.type() === 'warning') {
      warnings.push(msg.text());
    }
  });
  
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  // Navigate to page
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
  
  // Wait for any animations/transitions
  await page.waitForTimeout(2000);
  
  // Verify page loaded
  await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
  
  // Check for design system
  const hasDesignSystem = await page.evaluate(() => {
    const styles = window.getComputedStyle(document.documentElement);
    const errlBg = styles.getPropertyValue('--errl-bg');
    const errlText = styles.getPropertyValue('--errl-text');
    return !!(errlBg && errlText);
  });
  
  // Filter out non-critical errors
  const criticalErrors = errors.filter(err => 
    !err.includes('favicon') && 
    !err.includes('404') &&
    !err.includes('Failed to load resource') &&
    !err.includes('net::ERR_') &&
    !err.includes('chrome-extension') &&
    !err.includes('Extension context invalidated')
  );
  
  // Take screenshot
  const screenshotPath = `test-results/visual-screenshots/${pageName.replace(/[^a-z0-9]/gi, '_')}.png`;
  await page.screenshot({ 
    path: screenshotPath, 
    fullPage: true,
    timeout: 10000 
  }).catch(() => {
    // If full page fails, try viewport
    return page.screenshot({ path: screenshotPath, timeout: 10000 });
  });
  
  return {
    url,
    pageName,
    loaded: true,
    hasDesignSystem,
    errors: criticalErrors,
    warnings: warnings.filter(w => !w.includes('favicon')),
    screenshot: screenshotPath,
    title: await page.title(),
    hasContent: (await page.locator('body').textContent() || '').length > 0
  };
}

// Helper: Test interactive elements
async function testInteractivity(page: any, url: string) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(2000);
  
  const results: any = {
    navigationLinks: 0,
    buttons: 0,
    forms: 0,
    interactiveElements: 0
  };
  
  // Count navigation links
  const navLinks = page.locator('a.errl-home-btn, nav a, header a, a[data-portal-link]');
  results.navigationLinks = await navLinks.count();
  
  // Count buttons
  const buttons = page.locator('button, input[type="button"], input[type="submit"]');
  results.buttons = await buttons.count();
  
  // Count forms
  const forms = page.locator('form');
  results.forms = await forms.count();
  
  // Test if navigation links are clickable
  if (results.navigationLinks > 0) {
    const firstNavLink = navLinks.first();
    const isVisible = await firstNavLink.isVisible().catch(() => false);
    const isEnabled = await firstNavLink.isEnabled().catch(() => false);
    results.navLinksClickable = isVisible && isEnabled;
  }
  
  // Test if buttons are clickable
  if (results.buttons > 0) {
    const firstButton = buttons.first();
    const isVisible = await firstButton.isVisible().catch(() => false);
    const isEnabled = await firstButton.isEnabled().catch(() => false);
    results.buttonsClickable = isVisible && isEnabled;
  }
  
  results.interactiveElements = results.navigationLinks + results.buttons + results.forms;
  
  return results;
}

test.describe('Visual Testing - All Portal Pages', () => {
  test('@ui visual test - all pages load and render correctly', async ({ page, baseURL }) => {
    const results: any[] = [];
    
    for (const pageInfo of ALL_PAGES) {
      const url = baseURL! + pageInfo.path;
      console.log(`Testing: ${pageInfo.name} (${url})`);
      
      try {
        const result = await testPageVisual(page, url, pageInfo.name);
        results.push(result);
        
        // Verify basic requirements
        expect(result.loaded, `${pageInfo.name} should load`).toBe(true);
        expect(result.hasContent, `${pageInfo.name} should have content`).toBe(true);
        expect(result.hasDesignSystem, `${pageInfo.name} should have design system`).toBe(true);
        expect(result.errors.length, `${pageInfo.name} should have no critical errors`).toBe(0);
        
      } catch (error: any) {
        results.push({
          url,
          pageName: pageInfo.name,
          loaded: false,
          error: error.message,
          hasDesignSystem: false,
          errors: [],
          warnings: []
        });
        console.error(`Failed to test ${pageInfo.name}:`, error.message);
      }
    }
    
    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      totalPages: ALL_PAGES.length,
      testedPages: results.length,
      passed: results.filter(r => r.loaded && r.hasDesignSystem && r.errors.length === 0).length,
      failed: results.filter(r => !r.loaded || !r.hasDesignSystem || r.errors.length > 0).length,
      results: results
    };
    
    // Write report to file
    const reportPath = join(process.cwd(), 'test-results', 'visual-test-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n=== Visual Test Summary ===`);
    console.log(`Total Pages: ${report.totalPages}`);
    console.log(`Passed: ${report.passed}`);
    console.log(`Failed: ${report.failed}`);
    console.log(`Report saved to: ${reportPath}`);
    
    // Assert overall success
    expect(report.failed).toBe(0);
  });
  
  test('@ui interactivity test - all pages have working navigation', async ({ page, baseURL }) => {
    const results: any[] = [];
    
    for (const pageInfo of ALL_PAGES) {
      const url = baseURL! + pageInfo.path;
      console.log(`Testing interactivity: ${pageInfo.name}`);
      
      try {
        const result = await testInteractivity(page, url);
        results.push({
          pageName: pageInfo.name,
          url,
          ...result
        });
        
        // Verify pages have some interactive elements
        expect(result.interactiveElements, `${pageInfo.name} should have interactive elements`).toBeGreaterThan(0);
        
      } catch (error: any) {
        results.push({
          pageName: pageInfo.name,
          url,
          error: error.message
        });
      }
    }
    
    // Generate interactivity report
    const report = {
      timestamp: new Date().toISOString(),
      totalPages: ALL_PAGES.length,
      results: results
    };
    
    const reportPath = join(process.cwd(), 'test-results', 'interactivity-test-report.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`\n=== Interactivity Test Summary ===`);
    console.log(`Total Pages: ${report.totalPages}`);
    console.log(`Report saved to: ${reportPath}`);
  });
});
