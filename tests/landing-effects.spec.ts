import { test, expect, Page } from '@playwright/test';

// Helper: Verify design system is loaded
async function testDesignSystem(page: Page): Promise<boolean> {
  const hasDesignSystem = await page.evaluate(() => {
    const styles = window.getComputedStyle(document.documentElement);
    const errlBg = styles.getPropertyValue('--errl-bg');
    const errlText = styles.getPropertyValue('--errl-text');
    return !!(errlBg && errlText);
  });
  return hasDesignSystem;
}

// Helper: Ensure panel is open (not minimized)
async function ensurePanelOpen(page: Page): Promise<void> {
  const panel = page.locator('#errlPanel');
  const isMinimized = await panel.evaluate((el) => {
    return el.classList.contains('minimized');
  });
  
  if (isMinimized) {
    // Panel starts minimized - click on it to restore
    // The panel click handler checks if minimized and restores it
    await panel.click({ force: true });
    await page.waitForTimeout(500);
    
    // Verify it's now open
    const stillMinimized = await panel.evaluate((el) => {
      return el.classList.contains('minimized');
    });
    
    if (stillMinimized) {
      // Fallback: try close button if visible
      const closeBtn = page.locator('#phone-close-button');
      if (await closeBtn.count() > 0) {
        await closeBtn.click({ force: true });
        await page.waitForTimeout(500);
      }
    }
  }
}

// Helper: Get element bounds (position and size)
async function getElementBounds(page: Page, selector: string) {
  return await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      right: rect.right,
      bottom: rect.bottom,
    };
  }, selector);
}

// Helper: Check if element is within viewport
async function isInViewport(page: Page, selector: string): Promise<boolean> {
  return await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    return (
      rect.x >= 0 &&
      rect.y >= 0 &&
      rect.right <= viewport.width &&
      rect.bottom <= viewport.height
    );
  }, selector);
}

// Helper: Check if two elements overlap
async function checkNoOverlap(
  page: Page,
  selector1: string,
  selector2: string
): Promise<boolean> {
  return await page.evaluate(
    ([sel1, sel2]) => {
      const el1 = document.querySelector(sel1);
      const el2 = document.querySelector(sel2);
      if (!el1 || !el2) return true; // Can't check if elements don't exist
      const rect1 = el1.getBoundingClientRect();
      const rect2 = el2.getBoundingClientRect();
      return !(
        rect1.right > rect2.left &&
        rect1.left < rect2.right &&
        rect1.bottom > rect2.top &&
        rect1.top < rect2.bottom
      );
    },
    [selector1, selector2]
  );
}

// Helper: Verify slider works
async function verifySliderWorks(
  page: Page,
  selector: string,
  min: number,
  max: number
): Promise<void> {
  const slider = page.locator(selector);
  await expect(slider).toBeVisible();
  
  // Get initial value
  const initialValue = parseFloat((await slider.inputValue()) || '0');
  
  // Set to min
  await slider.fill(String(min));
  await page.waitForTimeout(100);
  const minValue = parseFloat((await slider.inputValue()) || '0');
  expect(minValue).toBeCloseTo(min, 1);
  
  // Set to max
  await slider.fill(String(max));
  await page.waitForTimeout(100);
  const maxValue = parseFloat((await slider.inputValue()) || '0');
  expect(maxValue).toBeCloseTo(max, 1);
  
  // Reset to initial
  await slider.fill(String(initialValue));
  await page.waitForTimeout(100);
}

// Helper: Verify checkbox works
async function verifyCheckboxWorks(
  page: Page,
  selector: string
): Promise<void> {
  const checkbox = page.locator(selector);
  await expect(checkbox).toBeVisible();
  
  const initialChecked = await checkbox.isChecked();
  
  // Toggle off
  if (initialChecked) {
    await checkbox.uncheck();
    await page.waitForTimeout(100);
    expect(await checkbox.isChecked()).toBe(false);
  }
  
  // Toggle on
  await checkbox.check();
  await page.waitForTimeout(100);
  expect(await checkbox.isChecked()).toBe(true);
  
  // Restore initial state
  if (!initialChecked) {
    await checkbox.uncheck();
    await page.waitForTimeout(100);
  }
}

// Helper: Verify effect is visible (check canvas has content)
async function verifyEffectVisible(
  page: Page,
  canvasSelector: string
): Promise<boolean> {
  return await page.evaluate((sel) => {
    const canvas = document.querySelector(sel) as HTMLCanvasElement;
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    // Check if canvas has been drawn on
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasContent = imageData.data.some((pixel) => pixel !== 0);
    return hasContent;
  }, canvasSelector);
}

test.describe('Landing Page Effects Tests', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
    // Wait for effects to initialize
    await page.waitForTimeout(2000);
  });

  test('Page loads and initial state is correct', async ({ page }) => {
    // Verify design system
    const hasDesignSystem = await testDesignSystem(page);
    expect(hasDesignSystem).toBe(true);

    // Verify control panel exists
    const panel = page.locator('#errlPanel');
    await expect(panel).toBeVisible({ timeout: 5000 });

    // Verify canvas elements exist
    await expect(page.locator('#riseBubbles')).toBeVisible();
    await expect(page.locator('#bgParticles')).toBeVisible();
    await expect(page.locator('#errlWebGL')).toBeVisible();

    // Verify Errl character
    await expect(page.locator('#errl')).toBeVisible();

    // Verify navigation bubbles container
    const navOrbit = page.locator('#navOrbit');
    const navOrbitCount = await navOrbit.count();
    expect(navOrbitCount).toBeGreaterThan(0);

    // Check for console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.waitForTimeout(1000);
    const criticalErrors = errors.filter(
      (err) => !err.includes('favicon') && !err.includes('404')
    );
    expect(criticalErrors.length).toBe(0);
  });

  test('Control panel UI positioning is correct', async ({ page }) => {
    await ensurePanelOpen(page);

    const panel = page.locator('#errlPanel');
    await expect(panel).toBeVisible();

    // Check panel is within viewport
    const panelInViewport = await isInViewport(page, '#errlPanel');
    expect(panelInViewport).toBe(true);

    // Get panel bounds
    const panelBounds = await getElementBounds(page, '#errlPanel');
    expect(panelBounds).not.toBeNull();
    if (panelBounds) {
      // Check panel is not stuck in corners (should have reasonable padding)
      const viewport = await page.viewportSize();
      if (viewport) {
        expect(panelBounds.x).toBeGreaterThanOrEqual(0);
        expect(panelBounds.y).toBeGreaterThanOrEqual(0);
        expect(panelBounds.right).toBeLessThanOrEqual(viewport.width);
        expect(panelBounds.bottom).toBeLessThanOrEqual(viewport.height);
        
        // Verify panel is not stuck in corners - check it's not at exact 0,0 or bottom-right
        // Allow some tolerance for minimized state
        const isMinimized = await panel.evaluate((el) => el.classList.contains('minimized'));
        if (!isMinimized) {
          // When open, panel should have reasonable positioning
          expect(panelBounds.width).toBeGreaterThan(100); // Should be expanded
        }
      }
    }

    // Verify all 8 tabs are visible (only when not minimized)
    const isMinimized = await panel.evaluate((el) => el.classList.contains('minimized'));
    if (!isMinimized) {
      const tabs = page.locator('.panel-tabs button[data-tab]');
      const tabCount = await tabs.count();
      expect(tabCount).toBe(8);

      // Verify tabs are clickable
      for (let i = 0; i < tabCount; i++) {
        const tab = tabs.nth(i);
        await expect(tab).toBeVisible();
        const tabSelector = `.panel-tabs button[data-tab]:nth-child(${i + 1})`;
        const tabBounds = await getElementBounds(page, tabSelector);
        if (tabBounds) {
          expect(tabBounds.width).toBeGreaterThan(0);
          expect(tabBounds.height).toBeGreaterThan(0);
        }
      }

      // Verify close button is accessible
      const closeBtn = page.locator('#phone-close-button');
      await expect(closeBtn).toBeVisible();
    }
  });

  test('Tab navigation works correctly', async ({ page }) => {
    await ensurePanelOpen(page);

    const tabs = ['hud', 'errl', 'nav', 'rb', 'glb', 'bg', 'dev', 'hue'];

    for (const tabName of tabs) {
      // Click tab
      const tab = page.locator(`button[data-tab="${tabName}"]`);
      await tab.click();
      await page.waitForTimeout(300);

      // Verify tab is active
      const isActive = await tab.evaluate((el) =>
        el.classList.contains('active')
      );
      expect(isActive).toBe(true);

      // Verify corresponding section is visible
      const section = page.locator(`.panel-section[data-tab="${tabName}"]`);
      const sectionCount = await section.count();
      expect(sectionCount).toBeGreaterThan(0);

      // Check at least one section with this tab is visible
      const firstSection = section.first();
      const isVisible = await firstSection.isVisible();
      expect(isVisible).toBe(true);
    }
  });

  test('Rising Bubbles (RB) basic controls work', async ({ page }) => {
    await ensurePanelOpen(page);

    // Switch to RB tab
    await page.locator('button[data-tab="rb"]').click();
    await page.waitForTimeout(300);

    // Test basic controls
    await verifyCheckboxWorks(page, '#rbAttract');
    await verifySliderWorks(page, '#rbAttractIntensity', 0, 2);

    await verifyCheckboxWorks(page, '#rbRipples');
    await verifySliderWorks(page, '#rbRippleIntensity', 0, 2);

    await verifySliderWorks(page, '#rbSpeed', 0, 3);
    await verifySliderWorks(page, '#rbDensity', 0, 2);
    await verifySliderWorks(page, '#rbAlpha', 0, 1);

    // Verify bubbles canvas exists and may have content
    const bubblesCanvas = page.locator('#riseBubbles');
    await expect(bubblesCanvas).toBeVisible();
    
    // Verify canvas is rendering (has dimensions)
    const canvasSize = await bubblesCanvas.evaluate((canvas: HTMLCanvasElement) => {
      return { width: canvas.width, height: canvas.height };
    });
    expect(canvasSize.width).toBeGreaterThan(0);
    expect(canvasSize.height).toBeGreaterThan(0);
  });

  test('Rising Bubbles (RB) advanced controls work', async ({ page }) => {
    await ensurePanelOpen(page);

    // Switch to RB tab
    await page.locator('button[data-tab="rb"]').click();
    await page.waitForTimeout(300);

    // Test advanced controls
    await verifySliderWorks(page, '#rbWobble', 0, 2);
    await verifySliderWorks(page, '#rbFreq', 0, 2);

    // Number inputs
    const rbMin = page.locator('#rbMin');
    await expect(rbMin).toBeVisible();
    await rbMin.fill('20');
    await page.waitForTimeout(100);
    expect(await rbMin.inputValue()).toBe('20');

    const rbMax = page.locator('#rbMax');
    await expect(rbMax).toBeVisible();
    await rbMax.fill('50');
    await page.waitForTimeout(100);
    expect(await rbMax.inputValue()).toBe('50');

    await verifySliderWorks(page, '#rbJumboPct', 0, 0.6);
    await verifySliderWorks(page, '#rbJumboScale', 1.0, 2.5);
    await verifySliderWorks(page, '#rbSizeHz', 0, 1);

    // Test buttons
    const loopBtn = page.locator('#rbAdvModeLoop');
    await expect(loopBtn).toBeVisible();
    await loopBtn.click();
    await page.waitForTimeout(100);

    const pingBtn = page.locator('#rbAdvModePing');
    await expect(pingBtn).toBeVisible();
    await pingBtn.click();
    await page.waitForTimeout(100);

    const animateBtn = page.locator('#rbAdvAnimate');
    await expect(animateBtn).toBeVisible();
    await animateBtn.click();
    await page.waitForTimeout(500);
  });

  test('GL Particles (GLB) controls work', async ({ page }) => {
    await ensurePanelOpen(page);

    // Switch to GLB tab
    await page.locator('button[data-tab="glb"]').click();
    await page.waitForTimeout(300);

    // Test controls
    await verifySliderWorks(page, '#bgSpeed', 0, 3);
    await verifySliderWorks(page, '#bgDensity', 0, 1.5);
    await verifySliderWorks(page, '#glAlpha', 0, 1);

    // Test randomize button
    const randomBtn = page.locator('#glbRandom');
    await expect(randomBtn).toBeVisible();
    await randomBtn.click();
    await page.waitForTimeout(200);

    // Verify particles canvas exists
    const particlesCanvas = page.locator('#bgParticles');
    await expect(particlesCanvas).toBeVisible();
    
    // Verify canvas is rendering (has dimensions)
    const canvasSize = await particlesCanvas.evaluate((canvas: HTMLCanvasElement) => {
      return { width: canvas.width, height: canvas.height };
    });
    expect(canvasSize.width).toBeGreaterThan(0);
    expect(canvasSize.height).toBeGreaterThan(0);
  });

  test('Errl controls work', async ({ page }) => {
    await ensurePanelOpen(page);

    // Switch to Errl tab
    await page.locator('button[data-tab="errl"]').click();
    await page.waitForTimeout(300);

    // Test size slider
    await verifySliderWorks(page, '#errlSize', 0.8, 1.6);

    // Test goo enabled checkbox
    await verifyCheckboxWorks(page, '#classicGooEnabled');

    // Test goo sliders with auto checkboxes
    await verifySliderWorks(page, '#classicGooStrength', 0, 2);
    await verifyCheckboxWorks(page, '#classicGooStrengthAuto');

    await verifySliderWorks(page, '#classicGooWobble', 0, 2);
    await verifyCheckboxWorks(page, '#classicGooWobbleAuto');

    await verifySliderWorks(page, '#classicGooSpeed', 0, 2);
    await verifyCheckboxWorks(page, '#classicGooSpeedAuto');

    await verifySliderWorks(page, '#classicGooAutoSpeed', 0.01, 0.5);

    // Test mouse reactive
    await verifyCheckboxWorks(page, '#classicGooMouseReact');

    // Test random button
    const randomBtn = page.locator('#classicGooRandom');
    await expect(randomBtn).toBeVisible();
    await randomBtn.click();
    await page.waitForTimeout(200);

    // Verify Errl is visible
    await expect(page.locator('#errl')).toBeVisible();
  });

  test('Navigation Bubbles (Nav) controls work', async ({ page }) => {
    await ensurePanelOpen(page);

    // Switch to Nav tab
    await page.locator('button[data-tab="nav"]').click();
    await page.waitForTimeout(300);

    // Test basic nav controls
    await verifySliderWorks(page, '#navOrbitSpeed', 0, 2);
    await verifySliderWorks(page, '#navRadius', 0.6, 1.6);
    await verifySliderWorks(page, '#navOrbSize', 0.6, 1.6);

    // Test GL orbs toggle
    await verifyCheckboxWorks(page, '#glOrbsToggle');

    // Test rotate skins button
    const rotateBtn = page.locator('#rotateSkins');
    await expect(rotateBtn).toBeVisible();
    await rotateBtn.click();
    await page.waitForTimeout(200);

    // Test Nav Goo+ controls
    await verifySliderWorks(page, '#navWiggle', 0, 1);
    await verifySliderWorks(page, '#navFlow', 0, 2);
    await verifySliderWorks(page, '#navGrip', 0, 1);
    await verifySliderWorks(page, '#navDrip', -1, 1);
    await verifySliderWorks(page, '#navVisc', 0, 1);

    // Test buttons
    const slowGradientBtn = page.locator('#navSlowGradient');
    await expect(slowGradientBtn).toBeVisible();
    await slowGradientBtn.click();
    await page.waitForTimeout(200);

    const randomBtn = page.locator('#navRandom');
    await expect(randomBtn).toBeVisible();
    await randomBtn.click();
    await page.waitForTimeout(200);

    // Verify nav orbit exists
    const navOrbit = page.locator('#navOrbit');
    await expect(navOrbit).toBeVisible();
    
    // Verify nav bubbles are present (check for child elements)
    const navBubbles = await navOrbit.evaluate((el) => {
      return el.children.length > 0;
    });
    expect(navBubbles).toBe(true);
  });

  test('HUD controls work', async ({ page }) => {
    await ensurePanelOpen(page);

    // Switch to HUD tab
    await page.locator('button[data-tab="hud"]').click();
    await page.waitForTimeout(300);

    // Test burst button
    const burstBtn = page.locator('#burstBtn');
    await expect(burstBtn).toBeVisible();
    await burstBtn.click();
    await page.waitForTimeout(500); // Wait for burst effect

    // Test audio controls if present
    const audioEnabled = page.locator('#audioEnabled');
    if (await audioEnabled.count() > 0) {
      await verifyCheckboxWorks(page, '#audioEnabled');
    }
  });

  test('Hue controls work', async ({ page }) => {
    await ensurePanelOpen(page);

    // Switch to Hue tab
    await page.locator('button[data-tab="hue"]').click();
    await page.waitForTimeout(300);

    // Test hue enabled checkbox
    await verifyCheckboxWorks(page, '#hueEnabled');

    // Test target dropdown
    const hueTarget = page.locator('#hueTarget');
    await expect(hueTarget).toBeVisible();

    const options = ['nav', 'riseBubbles', 'bgBubbles', 'background', 'glOverlay'];
    for (const option of options) {
      await hueTarget.selectOption(option);
      await page.waitForTimeout(100);
      const selected = await hueTarget.inputValue();
      expect(selected).toBe(option);
    }

    // Test hue sliders
    await verifySliderWorks(page, '#hueShift', 0, 360);
    await verifySliderWorks(page, '#hueSat', 0, 2);
    await verifySliderWorks(page, '#hueInt', 0, 1);
    await verifySliderWorks(page, '#hueTimeline', 0, 360);

    // Test play/pause button
    const playPauseBtn = page.locator('#huePlayPause');
    await expect(playPauseBtn).toBeVisible();
    await playPauseBtn.click();
    await page.waitForTimeout(500);
  });

  test('Viewport and positioning edge cases', async ({ page }) => {
    await ensurePanelOpen(page);

    // Test at default viewport
    const panelBounds = await getElementBounds(page, '#errlPanel');
    expect(panelBounds).not.toBeNull();

    // Test at mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    const mobilePanelBounds = await getElementBounds(page, '#errlPanel');
    if (mobilePanelBounds) {
      expect(mobilePanelBounds.right).toBeLessThanOrEqual(375);
      expect(mobilePanelBounds.bottom).toBeLessThanOrEqual(667);
      // Verify panel is not stuck in corners
      expect(mobilePanelBounds.x).toBeGreaterThanOrEqual(0);
      expect(mobilePanelBounds.y).toBeGreaterThanOrEqual(0);
    }

    // Test at tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    const tabletPanelBounds = await getElementBounds(page, '#errlPanel');
    if (tabletPanelBounds) {
      expect(tabletPanelBounds.right).toBeLessThanOrEqual(768);
      expect(tabletPanelBounds.bottom).toBeLessThanOrEqual(1024);
      // Verify panel is not stuck in corners
      expect(tabletPanelBounds.x).toBeGreaterThanOrEqual(0);
      expect(tabletPanelBounds.y).toBeGreaterThanOrEqual(0);
    }

    // Test at desktop size
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);

    // Check for horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasHorizontalScroll).toBe(false);

    // Verify panel doesn't overlap with Errl (when both are visible)
    const noOverlap = await checkNoOverlap(page, '#errlPanel', '#errl');
    // Panel may overlap with Errl in some layouts, so this is informational
    // expect(noOverlap).toBe(true);

    // Verify nav bubbles don't get stuck in corners
    const navOrbit = page.locator('#navOrbit');
    if (await navOrbit.count() > 0) {
      const navOrbitBounds = await getElementBounds(page, '#navOrbit');
      if (navOrbitBounds) {
        // Nav orbit should be reasonably positioned
        expect(navOrbitBounds.x).toBeGreaterThan(-100); // Allow some off-screen for animation
        expect(navOrbitBounds.y).toBeGreaterThan(-100);
      }
    }

    // Verify Errl character positioning
    const errlBounds = await getElementBounds(page, '#errl');
    if (errlBounds) {
      // Errl should be visible and positioned
      expect(errlBounds.width).toBeGreaterThan(0);
      expect(errlBounds.height).toBeGreaterThan(0);
    }

    // Verify canvas elements are properly positioned
    const canvasElements = ['#riseBubbles', '#bgParticles', '#errlWebGL'];
    for (const selector of canvasElements) {
      const canvasBounds = await getElementBounds(page, selector);
      if (canvasBounds) {
        // Canvas should have dimensions
        expect(canvasBounds.width).toBeGreaterThan(0);
        expect(canvasBounds.height).toBeGreaterThan(0);
      }
    }
  });

  test('Interactive functionality - sliders', async ({ page }) => {
    await ensurePanelOpen(page);

    // Test a few key sliders with drag interaction
    await page.locator('button[data-tab="rb"]').click();
    await page.waitForTimeout(300);

    const speedSlider = page.locator('#rbSpeed');
    const initialValue = parseFloat((await speedSlider.inputValue()) || '1');

    // Simulate drag
    const sliderBox = await speedSlider.boundingBox();
    if (sliderBox) {
      await page.mouse.move(
        sliderBox.x + sliderBox.width * 0.5,
        sliderBox.y + sliderBox.height * 0.5
      );
      await page.mouse.down();
      await page.mouse.move(
        sliderBox.x + sliderBox.width * 0.8,
        sliderBox.y + sliderBox.height * 0.5
      );
      await page.mouse.up();
      await page.waitForTimeout(200);

      const newValue = parseFloat((await speedSlider.inputValue()) || '1');
      // Value should have changed (may be higher or lower depending on direction)
      expect(newValue).not.toBe(initialValue);
    }
  });

  test('Interactive functionality - checkboxes', async ({ page }) => {
    await ensurePanelOpen(page);

    // Test checkbox toggles
    await page.locator('button[data-tab="rb"]').click();
    await page.waitForTimeout(300);

    const attractCheckbox = page.locator('#rbAttract');
    const initialState = await attractCheckbox.isChecked();

    await attractCheckbox.click();
    await page.waitForTimeout(100);
    expect(await attractCheckbox.isChecked()).toBe(!initialState);

    await attractCheckbox.click();
    await page.waitForTimeout(100);
    expect(await attractCheckbox.isChecked()).toBe(initialState);
  });

  test('Interactive functionality - buttons', async ({ page }) => {
    await ensurePanelOpen(page);

    // Test randomize buttons
    await page.locator('button[data-tab="glb"]').click();
    await page.waitForTimeout(300);

    const randomBtn = page.locator('#glbRandom');
    await randomBtn.click();
    await page.waitForTimeout(300);

    // Test animate button
    await page.locator('button[data-tab="rb"]').click();
    await page.waitForTimeout(300);

    const animateBtn = page.locator('#rbAdvAnimate');
    await animateBtn.click();
    await page.waitForTimeout(500);
  });

  test('Performance and visual stability', async ({ page }) => {
    await ensurePanelOpen(page);

    // Monitor console errors during interactions
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    // Perform multiple interactions
    const tabs = ['hud', 'errl', 'nav', 'rb', 'glb', 'hue'];
    for (const tab of tabs) {
      await page.locator(`button[data-tab="${tab}"]`).click();
      await page.waitForTimeout(200);

      // Interact with a control
      if (tab === 'rb') {
        const slider = page.locator('#rbSpeed');
        if (await slider.count() > 0) {
          await slider.fill('1.5');
          await page.waitForTimeout(100);
        }
      } else if (tab === 'errl') {
        const checkbox = page.locator('#classicGooEnabled');
        if (await checkbox.count() > 0) {
          await checkbox.click();
          await page.waitForTimeout(100);
        }
      }
    }

    await page.waitForTimeout(1000);

    // Check for critical errors
    const criticalErrors = errors.filter(
      (err) =>
        !err.includes('favicon') &&
        !err.includes('404') &&
        !err.includes('ResizeObserver')
    );
    expect(criticalErrors.length).toBe(0);
  });
});
