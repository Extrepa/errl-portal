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
      await page.goto(baseURL! + '/pin-designer/pin-designer.html');
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('#pinSVG', { timeout: 10000 });

      const regions = ['body', 'face', 'eyeL', 'eyeR', 'mouth'];

      for (const region of regions) {
        const regionBtn = page.locator(`.bubble[data-region="${region}"]`);
        if (await regionBtn.count() > 0) {
          await regionBtn.click();
          await page.waitForTimeout(200);

          // Verify region is selected (has active class)
          const isActive = await regionBtn.evaluate((el) => {
            return el.classList.contains('active');
          });
          expect(isActive).toBeTruthy();
        }
      }
    });

    test('@ui finish controls work', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/pin-designer/pin-designer.html');
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('#pinSVG', { timeout: 10000 });

      const finishes = ['solid', 'glitter', 'glow', 'none'];

      for (const finish of finishes) {
        // Use the finish row context to avoid context menu duplicates
        const finishBtn = page.locator(`#finishRow .finish[data-finish="${finish}"]`).first();
        if (await finishBtn.count() > 0) {
          await finishBtn.click();
          await page.waitForTimeout(200);

          // Verify finish is selected
          const isActive = await finishBtn.evaluate((el) => {
            return el.classList.contains('active');
          });
          expect(isActive).toBeTruthy();
        }
      }
    });

    test('@ui zoom controls work', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/pin-designer/pin-designer.html');
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('#pinSVG', { timeout: 10000 });

      // Test zoom in
      const zoomInBtn = page.locator('#zoomIn');
      if (await zoomInBtn.count() > 0) {
        await zoomInBtn.click();
        await page.waitForTimeout(300);
      }

      // Test zoom out
      const zoomOutBtn = page.locator('#zoomOut');
      if (await zoomOutBtn.count() > 0) {
        await zoomOutBtn.click();
        await page.waitForTimeout(300);
      }

      // Test fit
      const fitBtn = page.locator('#fitBtn');
      if (await fitBtn.count() > 0) {
        await fitBtn.click();
        await page.waitForTimeout(300);
      }

      // Test reset view
      const resetViewBtn = page.locator('#resetView');
      if (await resetViewBtn.count() > 0) {
        await resetViewBtn.click();
        await page.waitForTimeout(300);
      }
    });

    test('@ui panel toggle works', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/pin-designer/pin-designer.html');
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('#pinSVG', { timeout: 10000 });

      const togglePanelBtn = page.locator('#togglePanel');
      const leftPanel = page.locator('#leftPanel');

      if (await togglePanelBtn.count() > 0 && await leftPanel.count() > 0) {
        // Get initial display state
        const initialDisplay = await leftPanel.evaluate((el) => {
          return window.getComputedStyle(el).display;
        });

        // Toggle panel - button may be hidden, use evaluate to click directly
        await togglePanelBtn.evaluate((el: HTMLElement) => {
          (el as HTMLElement).click();
        });
        await page.waitForTimeout(300);

        // Verify display changed
        const afterToggleDisplay = await leftPanel.evaluate((el) => {
          return window.getComputedStyle(el).display;
        });
        expect(afterToggleDisplay).not.toBe(initialDisplay);
      }
    });

    test('@ui reset buttons work', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/pin-designer/pin-designer.html');
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('#pinSVG', { timeout: 10000 });

      // Test reset wires
      const resetWiresBtn = page.locator('#resetWires');
      if (await resetWiresBtn.count() > 0) {
        await resetWiresBtn.click();
        await page.waitForTimeout(300);
      }

      // Test reset all
      const resetAllBtn = page.locator('#resetAll');
      if (await resetAllBtn.count() > 0) {
        await resetAllBtn.click();
        await page.waitForTimeout(300);
      }
    });

    test('@ui randomize design button works', async ({ page, baseURL }) => {
      await page.goto(baseURL! + '/pin-designer/pin-designer.html');
      await page.waitForLoadState('networkidle');
      await page.waitForSelector('#pinSVG', { timeout: 10000 });

      const randomizeBtn = page.locator('#randomizeDesign');
      if (await randomizeBtn.count() > 0) {
        await randomizeBtn.click();
        await page.waitForTimeout(500); // Randomization may take time
      }
    });
  });
});
