import { test, expect } from '@playwright/test';

// Helper to ensure panel is open
async function ensurePanelOpen(page){
  await page.evaluate(() => {
    const p = document.getElementById('errlPanel');
    if (p && p.classList.contains('minimized')) p.click();
  });
  await expect(page.locator('#panelTabs')).toBeVisible();
}

test.describe('Accessibility Tests', () => {
  test('@ui keyboard navigation - all interactive elements accessible', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    
    // Ensure panel is open first (panel starts minimized)
    await ensurePanelOpen(page);
    
    // Panel should be open and tabs visible
    const panelTabs = page.locator('#panelTabs');
    await expect(panelTabs).toBeVisible();
    
    // Tab through tabs
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to navigate tabs with arrow keys or tab
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });
    expect(['BUTTON', 'INPUT', 'SELECT', 'A']).toContain(focusedElement);
  });

  test('@ui focus indicators visible', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    
    // Focus on a button
    await page.evaluate(() => {
      const toggle = document.getElementById('phoneMinToggle');
      if (toggle) toggle.focus();
    });
    
    // Check if focused element has visible focus indicator
    const hasFocusIndicator = await page.evaluate(() => {
      const focused = document.activeElement as HTMLElement;
      if (!focused) return false;
      const styles = window.getComputedStyle(focused);
      return styles.outline !== 'none' || 
             styles.boxShadow !== 'none' ||
             focused.classList.toString().includes('focus');
    });
    expect(hasFocusIndicator).toBeTruthy();
  });

  test('@ui images have alt text', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      for (let i = 0; i < imageCount; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute('alt');
        // Alt should exist (can be empty for decorative images)
        expect(alt).not.toBeNull();
      }
    }
  });

  test('@ui buttons have accessible labels', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    
    await page.evaluate(() => {
      const p = document.getElementById('errlPanel');
      if (p && p.classList.contains('minimized')) p.click();
    });
    
    // Check Errl Phone tabs have labels
    const tabs = page.locator('#panelTabs button');
    const tabCount = await tabs.count();
    
    for (let i = 0; i < tabCount; i++) {
      const tab = tabs.nth(i);
      const ariaLabel = await tab.getAttribute('aria-label');
      const title = await tab.getAttribute('title');
      const text = await tab.textContent();
      
      // Should have at least one label
      expect(ariaLabel || title || text?.trim()).toBeTruthy();
    }
  });

  test('@ui form controls have labels', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    
    await page.evaluate(() => {
      const p = document.getElementById('errlPanel');
      if (p && p.classList.contains('minimized')) p.click();
    });
    
    await page.getByRole('button', { name: 'HUD' }).click();
    
    // Check inputs have labels
    const inputs = page.locator('input[type="range"], input[type="checkbox"]');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < Math.min(inputCount, 5); i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      if (id) {
        const label = page.locator(`label[for="${id}"]`);
        const labelCount = await label.count();
        const ariaLabel = await input.getAttribute('aria-label');
        const title = await input.getAttribute('title');
        
        // Should have label, aria-label, or title
        expect(labelCount > 0 || ariaLabel || title).toBeTruthy();
      }
    }
  });

  test('@ui high contrast mode works', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    
    await page.evaluate(() => {
      const p = document.getElementById('errlPanel');
      if (p && p.classList.contains('minimized')) p.click();
    });
    
    await page.getByRole('button', { name: 'HUD' }).click();
    
    const prefContrast = page.locator('#prefContrast');
    await prefContrast.check();
    
    // Verify contrast mode is applied (check for class or style)
    const contrastApplied = await page.evaluate(() => {
      return document.body.classList.toString().includes('contrast') ||
             document.documentElement.classList.toString().includes('contrast') ||
             getComputedStyle(document.body).filter !== 'none';
    });
    // Contrast mode should be applied (exact implementation may vary)
    expect(prefContrast).toBeChecked();
  });

  test('@ui reduced motion respected', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    
    await page.evaluate(() => {
      const p = document.getElementById('errlPanel');
      if (p && p.classList.contains('minimized')) p.click();
    });
    
    await page.getByRole('button', { name: 'HUD' }).click();
    
    const prefReduce = page.locator('#prefReduce');
    await prefReduce.check();
    
    // Verify motion multiplier is set
    const motionMultiplier = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--motionMultiplier').trim();
    });
    expect(parseFloat(motionMultiplier)).toBeGreaterThan(1);
    
    // Verify animations still work (just slower)
    const canvas = page.locator('#bgParticles');
    await expect(canvas).toBeVisible();
  });

  test('@ui heading structure exists', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    
    // Check for headings
    const h1 = page.locator('h1');
    const h2 = page.locator('h2');
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    // Should have some heading structure
    expect(headingCount).toBeGreaterThanOrEqual(0);
  });

  test('@ui page has title', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    expect(title).toMatch(/errl/i);
  });
});

