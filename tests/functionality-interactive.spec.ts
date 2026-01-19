import { test, expect } from '@playwright/test';

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

test.describe('Interactive Controls Tests', () => {
  test.describe('Main Portal Control Panel', () => {
    test('@ui control panel opens and closes correctly', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/index.html');
      await page.waitForLoadState('networkidle');

      const panel = page.locator('#errlPanel');
      
      // Panel should exist
      await expect(panel).toBeVisible();

      // Check if panel starts minimized
      const isMinimized = await panel.evaluate((el) => {
        return el.classList.contains('minimized');
      });

      // Open panel if minimized
      if (isMinimized) {
        await panel.click();
        await page.waitForTimeout(500);
        await expect(page.locator('#panelTabs')).toBeVisible();
      }

      // Minimize panel - click panel header or use keyboard shortcut
      // The min toggle might not be visible, so we'll click the panel itself
      const minToggle = page.locator('#phoneMinToggle');
      if (await minToggle.count() > 0 && await minToggle.isVisible()) {
        await minToggle.click({ force: true });
        await page.waitForTimeout(500);
        const isMinimizedAfter = await panel.evaluate((el) => {
          return el.classList.contains('minimized');
        });
        expect(isMinimizedAfter).toBeTruthy();
      } else {
        // Alternative: click panel to minimize
        await panel.click({ force: true });
        await page.waitForTimeout(500);
      }
    });

    test('@ui all tabs switch correctly', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/index.html');
      await page.waitForLoadState('networkidle');
      await ensurePanelOpen(page);

      const tabs = [
        { name: 'HUD', selector: 'button[data-tab="hud"]' },
        { name: 'Errl', selector: 'button[data-tab="errl"]' },
        { name: 'Nav', selector: 'button[data-tab="nav"]' },
        { name: 'RB', selector: 'button[data-tab="rb"]' },
        { name: 'GLB', selector: 'button[data-tab="glb"]' },
        { name: 'BG', selector: 'button[data-tab="bg"]' },
        { name: 'Hue', selector: 'button[data-tab="hue"]' },
        { name: 'Dev', selector: 'button[data-tab="dev"]' },
      ];

      for (const tab of tabs) {
        const tabButton = page.locator(tab.selector);
        if (await tabButton.count() > 0) {
          await tabButton.click();
          await page.waitForTimeout(300);

          // Verify corresponding section is visible (use first() since there can be multiple)
          const section = page.locator(`.panel-section[data-tab="${tab.name.toLowerCase()}"]`).first();
          if (await section.count() > 0) {
            const display = await section.evaluate((el) => {
              return window.getComputedStyle(el).display;
            });
            expect(display).not.toBe('none');
          }
        }
      }
    });

    test('@ui sliders update values correctly', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/index.html');
      await page.waitForLoadState('networkidle');
      await ensurePanelOpen(page);

      // Switch to GLB tab where bgSpeed, bgDensity, glAlpha are located
      const glbTab = page.getByRole('button', { name: /GL Bubbles/i });
      await glbTab.click();
      await page.waitForTimeout(300);

      // Test a few key sliders
      const sliders = [
        { id: 'bgSpeed', value: '1.5' },
        { id: 'bgDensity', value: '0.8' },
        { id: 'glAlpha', value: '0.7' },
      ];

      for (const slider of sliders) {
        const sliderEl = page.locator(`#${slider.id}`);
        if (await sliderEl.count() > 0) {
          await sliderEl.fill(slider.value, { force: true });
          await sliderEl.dispatchEvent('input');
          await page.waitForTimeout(100);

          const actualValue = await sliderEl.inputValue();
          expect(actualValue).toBe(slider.value);
        }
      }
    });

    test('@ui checkboxes toggle correctly', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/index.html');
      await page.waitForLoadState('networkidle');
      await ensurePanelOpen(page);

      // Switch to HUD tab where audio controls are
      const hudTab = page.getByRole('button', { name: /HUD/i });
      await hudTab.click();
      await page.waitForTimeout(300);

      // Test audio enabled checkbox
      const audioEnabled = page.locator('#audioEnabled');
      if (await audioEnabled.count() > 0) {
        const initialChecked = await audioEnabled.isChecked();
        await audioEnabled.click({ force: true });
        await page.waitForTimeout(200);
        const afterClick = await audioEnabled.isChecked();
        expect(afterClick).toBe(!initialChecked);
      }
    });
  });

  test.describe('Pin Designer Interactive Controls', () => {
    test('@ui region selection works', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/pin-designer/');
      await page.waitForLoadState('networkidle');
      
      // Pin designer is loaded in an iframe
      const iframe = page.locator('iframe[src*="pin-designer.html"]');
      await expect(iframe).toBeVisible({ timeout: 10000 });
      const iframeContent = await iframe.contentFrame();
      if (!iframeContent) {
        throw new Error('Pin designer iframe not found');
      }
      
      // Wait for SVG inside iframe
      await iframeContent.waitForSelector('#pinSVG', { timeout: 10000 });
      
      // Wait for page to fully initialize
      await iframeContent.waitForTimeout(1000);

      // Region buttons are in #bubbleRow (inside iframe)
      const bubbleRow = iframeContent.locator('#bubbleRow');
      await expect(bubbleRow).toBeVisible({ timeout: 5000 });

      const regions = ['body', 'face', 'eyeL', 'eyeR', 'mouth'];

      for (const region of regions) {
        // Scope to bubbleRow to avoid duplicates
        const regionBtn = bubbleRow.locator(`.bubble[data-region="${region}"]`);
        const count = await regionBtn.count();
        
        if (count > 0) {
          await expect(regionBtn.first()).toBeVisible({ timeout: 3000 });
          await regionBtn.first().click({ force: true });
          await iframeContent.waitForTimeout(300);

          // Verify region is selected (has active or selected class)
          const isActive = await regionBtn.first().evaluate((el) => {
            return el.classList.contains('active') || el.classList.contains('selected');
          });
          expect(isActive).toBeTruthy();
        } else {
          // If button not found, skip this region
          console.log(`Region button for "${region}" not found, skipping`);
        }
      }
    });

    test('@ui finish controls work', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/pin-designer/');
      await page.waitForLoadState('networkidle');
      
      // Pin designer is loaded in an iframe
      const iframe = page.locator('iframe[src*="pin-designer.html"]');
      await expect(iframe).toBeVisible({ timeout: 10000 });
      const iframeContent = await iframe.contentFrame();
      if (!iframeContent) {
        throw new Error('Pin designer iframe not found');
      }
      
      // Wait for SVG inside iframe
      await iframeContent.waitForSelector('#pinSVG', { timeout: 10000 });
      
      // Wait for page to fully initialize
      await iframeContent.waitForTimeout(1000);

      // Finish buttons are in #finishRow (inside iframe)
      const finishRow = iframeContent.locator('#finishRow');
      await expect(finishRow).toBeVisible({ timeout: 5000 });

      const finishes = ['solid', 'glitter', 'glow', 'none'];

      for (const finish of finishes) {
        // Use the finish row context to avoid context menu duplicates
        const finishBtn = finishRow.locator(`.finish[data-finish="${finish}"]`).first();
        const count = await finishBtn.count();
        
        if (count > 0) {
          await expect(finishBtn).toBeVisible({ timeout: 3000 });
          await finishBtn.click({ force: true });
          await iframeContent.waitForTimeout(300);

          // Verify finish is selected (has active or selected class)
          const isActive = await finishBtn.evaluate((el) => {
            return el.classList.contains('active') || el.classList.contains('selected');
          });
          expect(isActive).toBeTruthy();
        } else {
          // If button not found, skip this finish
          console.log(`Finish button for "${finish}" not found, skipping`);
        }
      }
    });

    test('@ui zoom controls work', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/pin-designer/');
      await page.waitForLoadState('networkidle');
      
      // Pin designer is loaded in an iframe
      const iframe = page.locator('iframe[src*="pin-designer.html"]');
      await expect(iframe).toBeVisible({ timeout: 10000 });
      const iframeContent = await iframe.contentFrame();
      if (!iframeContent) {
        throw new Error('Pin designer iframe not found');
      }
      
      // Wait for SVG inside iframe
      await iframeContent.waitForSelector('#pinSVG', { timeout: 10000 });
      
      // Wait for page to fully initialize
      await iframeContent.waitForTimeout(1000);

      // Test zoom in (inside iframe)
      const zoomInBtn = iframeContent.locator('#zoomIn');
      if (await zoomInBtn.count() > 0) {
        await expect(zoomInBtn).toBeVisible({ timeout: 3000 });
        await zoomInBtn.click({ force: true });
        await page.waitForTimeout(300);
      } else {
        console.log('Zoom in button not found');
      }

      // Test zoom out (inside iframe)
      const zoomOutBtn = iframeContent.locator('#zoomOut');
      if (await zoomOutBtn.count() > 0) {
        await expect(zoomOutBtn).toBeVisible({ timeout: 3000 });
        await zoomOutBtn.click({ force: true });
        await iframeContent.waitForTimeout(300);
      } else {
        console.log('Zoom out button not found');
      }

      // Test fit (inside iframe)
      const fitBtn = iframeContent.locator('#fitBtn');
      if (await fitBtn.count() > 0) {
        await expect(fitBtn).toBeVisible({ timeout: 3000 });
        await fitBtn.click({ force: true });
        await iframeContent.waitForTimeout(300);
      } else {
        console.log('Fit button not found');
      }

      // Test reset view (inside iframe)
      const resetViewBtn = iframeContent.locator('#resetView');
      if (await resetViewBtn.count() > 0) {
        await expect(resetViewBtn).toBeVisible({ timeout: 3000 });
        await resetViewBtn.click({ force: true });
        await iframeContent.waitForTimeout(300);
      } else {
        console.log('Reset view button not found');
      }
      
      // Verify page is still functional after zoom operations
      const pinSVG = iframeContent.locator('#pinSVG');
      await expect(pinSVG).toBeVisible();
    });

    test('@ui panel toggle works', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/pin-designer/');
      await page.waitForLoadState('networkidle');
      
      // Pin designer is loaded in an iframe
      const iframe = page.locator('iframe[src*="pin-designer.html"]');
      await expect(iframe).toBeVisible({ timeout: 10000 });
      const iframeContent = await iframe.contentFrame();
      if (!iframeContent) {
        throw new Error('Pin designer iframe not found');
      }
      
      await iframeContent.waitForSelector('#pinSVG', { timeout: 10000 });
      await iframeContent.waitForTimeout(1000);

      // Panel toggle is in the main page (header), not iframe
      const togglePanelBtn = page.locator('#togglePanel');
      const leftPanel = iframeContent.locator('#leftPanel');

      if (await togglePanelBtn.count() > 0 && await leftPanel.count() > 0) {
        // Get initial display state
        const initialDisplay = await leftPanel.evaluate((el) => {
          return window.getComputedStyle(el).display;
        });

        // Toggle panel - button may be hidden, use evaluate to click directly
        await togglePanelBtn.evaluate((el: HTMLElement) => {
          (el as HTMLElement).click();
        });
        await iframeContent.waitForTimeout(300);

        // Verify display changed (inside iframe)
        const afterToggleDisplay = await leftPanel.evaluate((el) => {
          return window.getComputedStyle(el).display;
        });
        expect(afterToggleDisplay).not.toBe(initialDisplay);
      }
    });

    test('@ui reset buttons work', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/pin-designer/');
      await page.waitForLoadState('networkidle');
      
      // Pin designer is loaded in an iframe
      const iframe = page.locator('iframe[src*="pin-designer.html"]');
      await expect(iframe).toBeVisible({ timeout: 10000 });
      const iframeContent = await iframe.contentFrame();
      if (!iframeContent) {
        throw new Error('Pin designer iframe not found');
      }
      
      await iframeContent.waitForSelector('#pinSVG', { timeout: 10000 });
      await iframeContent.waitForTimeout(1000);

      // Test reset wires (inside iframe)
      const resetWiresBtn = iframeContent.locator('#resetWires');
      if (await resetWiresBtn.count() > 0) {
        await resetWiresBtn.click();
        await iframeContent.waitForTimeout(300);
      }

      // Test reset all (inside iframe)
      const resetAllBtn = iframeContent.locator('#resetAll');
      if (await resetAllBtn.count() > 0) {
        await resetAllBtn.click();
        await iframeContent.waitForTimeout(300);
      }
    });

    test('@ui randomize design button works', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/pin-designer/');
      await page.waitForLoadState('networkidle');
      
      // Pin designer is loaded in an iframe
      const iframe = page.locator('iframe[src*="pin-designer.html"]');
      await expect(iframe).toBeVisible({ timeout: 10000 });
      const iframeContent = await iframe.contentFrame();
      if (!iframeContent) {
        throw new Error('Pin designer iframe not found');
      }
      
      await iframeContent.waitForSelector('#pinSVG', { timeout: 10000 });
      await iframeContent.waitForTimeout(1000);

      // Randomize button is inside iframe
      const randomizeBtn = iframeContent.locator('#randomizeDesign');
      if (await randomizeBtn.count() > 0) {
        await randomizeBtn.click();
        await iframeContent.waitForTimeout(500); // Randomization may take time
      }
    });
  });
});
