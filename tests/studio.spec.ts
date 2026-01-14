import { test, expect } from '@playwright/test';

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

test.describe('Studio Hub Tests', () => {
  test('@ui studio hub loads and renders all cards', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/studio');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('heading', { name: 'Choose your Errl Lab' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Code Lab' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Psychedelic Math Lab' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Shape Madness' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Pin Designer' })).toBeVisible();
    
    // Verify design system is loaded
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
  });

  test('@ui studio hub navigation works', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/studio');
    await page.waitForLoadState('networkidle');
    
    // Test Code Lab navigation
    await page.getByRole('link', { name: /Code Lab/ }).click();
    await page.waitForURL('**/studio/code-lab');
    await expect(page.getByRole('button', { name: /Format HTML/i })).toBeVisible();
    await page.goBack();
    
    // Test Math Lab navigation
    await page.getByRole('link', { name: /Psychedelic Math Lab/ }).click();
    await page.waitForURL('**/studio/math-lab');
    const mathLabIframe = page.locator('iframe[title="Psychedelic Math Lab"]');
    await expect(mathLabIframe).toBeVisible();
    await page.goBack();
    
    // Test Shape Madness navigation
    await page.getByRole('link', { name: /Shape Madness/ }).click();
    await page.waitForURL('**/studio/shape-madness');
    const shapeIframe = page.locator('iframe[title="Shape Madness"]');
    await expect(shapeIframe).toBeVisible();
    await page.goBack();
    
    // Test Pin Designer navigation
    await page.getByRole('link', { name: /Pin Designer/ }).click();
    await page.waitForURL('**/studio/pin-designer');
    const pinFrame = page.frameLocator('iframe[title="Pin Designer"]');
    await expect(pinFrame.locator('text=Save Design')).toBeVisible();
    await page.goBack();
    
    // Test Projects navigation
    const projectsLink = page.getByRole('link', { name: /Projects/ });
    if (await projectsLink.count() > 0) {
      await projectsLink.click();
      await page.waitForURL('**/studio/projects');
      await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
      
      // Verify design system is loaded
      const hasDesignSystem = await testDesignSystem(page);
      expect(hasDesignSystem).toBe(true);
    }
  });

  test('@ui code lab page functions', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/studio/code-lab');
    await page.waitForLoadState('networkidle');
    
    // Monaco editor should be present
    const editor = page.locator('.monaco-editor, [class*="monaco"]');
    const editorExists = await editor.count() > 0 || await page.evaluate(() => {
      return document.querySelector('[class*="monaco"]') !== null;
    });
    expect(editorExists).toBeTruthy();
    
    // Format button should exist
    const formatBtn = page.getByRole('button', { name: /Format HTML/i });
    await expect(formatBtn).toBeVisible();
    
    // Verify design system is loaded
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
  });

  test('@ui math lab iframe loads', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/studio/math-lab');
    await page.waitForLoadState('networkidle');
    
    const mathLabIframe = page.locator('iframe[title="Psychedelic Math Lab"]');
    await expect(mathLabIframe).toBeVisible();
    
    // Wait for iframe to load
    await expect
      .poll(() =>
        page.frames().some((frame) =>
          /\/studio\/math-lab/.test(frame.url())
        )
      )
      .toBeTruthy();
    
    // Verify iframe content loads
    const iframeContent = page.frameLocator('iframe[title="Psychedelic Math Lab"]');
    await expect(iframeContent.locator('body')).toBeVisible({ timeout: 10000 });
    
    // Verify design system is loaded
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
  });

  test('@ui shape madness iframe loads', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/studio/shape-madness');
    await page.waitForLoadState('networkidle');
    
    const shapeIframe = page.locator('iframe[title="Shape Madness"]');
    await expect(shapeIframe).toBeVisible();
    
    // Wait for iframe to load
    await expect
      .poll(() => 
        page.frames().some((frame) => 
          /\/studio\/shape-madness/.test(frame.url())
        )
      )
      .toBeTruthy();
    
    // Verify iframe content
    const iframeContent = page.frameLocator('iframe[title="Shape Madness"]');
    await expect(iframeContent.locator('text=Shape Madness')).toBeVisible({ timeout: 10000 });
    
    // Verify design system is loaded
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
  });

  test('@ui pin designer iframe loads', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/studio/pin-designer');
    await page.waitForLoadState('networkidle');
    
    const pinFrame = page.frameLocator('iframe[title="Pin Designer"]');
    await expect(pinFrame.locator('text=Save Design')).toBeVisible({ timeout: 10000 });
    
    // Verify designer tools are accessible
    const saveButton = pinFrame.locator('text=Save Design');
    await expect(saveButton).toBeVisible();
    
    // Verify design system is loaded
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
  });

  test('@ui studio projects page loads', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/studio/projects');
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
    
    // Ripple canvas should exist
    const rippleCanvas = page.locator('canvas#fx');
    if (await rippleCanvas.count() > 0) {
      await expect(rippleCanvas.first()).toBeVisible();
    }
    
    // Verify design system is loaded
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);
  });

  test('@ui studio hub back links work', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/studio/code-lab');
    await page.waitForLoadState('networkidle');
    
    // Look for back to hub link
    const backLink = page.getByRole('link', { name: /Back to Hub|Back to Studio/i });
    if (await backLink.count() > 0) {
      await backLink.click();
      await page.waitForURL('**/studio**');
      await expect(page.getByRole('heading', { name: 'Choose your Errl Lab' })).toBeVisible();
      
      // Verify design system is loaded
      const hasDesignSystem = await testDesignSystem(page);
      expect(hasDesignSystem).toBe(true);
    }
  });
});

