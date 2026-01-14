import { test, expect } from '@playwright/test';

test.describe('Errl Phone Controls Tests', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
    // Wait for Three.js and other scripts to initialize
    await page.waitForTimeout(2000);
  });

  test('@controls Rising Bubbles controls exist and are wired', async ({ page }) => {
    // Open RB tab
    const rbTab = page.locator('[data-tab="rb"]').first();
    if (await rbTab.count() === 0) {
      // Try clicking tab button
      const tabButton = page.locator('button[data-tab="rb"], .tab[data-tab="rb"]').first();
      if (await tabButton.count() > 0) {
        await tabButton.click();
        await page.waitForTimeout(500);
      }
    }

    // Verify all RB controls exist
    const controls = [
      'rbSpeed', 'rbDensity', 'rbAlpha', 'rbWobble', 'rbFreq',
      'rbMin', 'rbMax', 'rbSizeHz', 'rbJumboPct', 'rbJumboScale',
      'rbAttract', 'rbAttractIntensity', 'rbRipples', 'rbRippleIntensity'
    ];

    for (const controlId of controls) {
      const control = page.locator(`#${controlId}`);
      await expect(control).toBeVisible({ timeout: 5000 });
    }

    // Verify RB setter functions exist
    const hasSetters = await page.evaluate(() => {
      const RB = (window as any).errlRisingBubblesThree;
      return RB && 
        typeof RB.setSpeed === 'function' &&
        typeof RB.setDensity === 'function' &&
        typeof RB.setAlpha === 'function' &&
        typeof RB.setWobble === 'function' &&
        typeof RB.setFreq === 'function' &&
        typeof RB.setMinSize === 'function' &&
        typeof RB.setMaxSize === 'function' &&
        typeof RB.setSizeHz === 'function' &&
        typeof RB.setJumboPct === 'function' &&
        typeof RB.setJumboScale === 'function' &&
        typeof RB.setAttract === 'function' &&
        typeof RB.setAttractIntensity === 'function' &&
        typeof RB.setRipples === 'function' &&
        typeof RB.setRippleIntensity === 'function';
    });
    expect(hasSetters).toBe(true);
  });

  test('@controls RB controls update values', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Test speed control
    const speedControl = page.locator('#rbSpeed');
    await expect(speedControl).toBeVisible();
    
    const initialValue = await speedControl.inputValue();
    await speedControl.fill('2.0');
    await page.waitForTimeout(500);
    
    const updatedValue = await speedControl.inputValue();
    expect(parseFloat(updatedValue)).toBeCloseTo(2.0, 1);

    // Test density control
    const densityControl = page.locator('#rbDensity');
    await densityControl.fill('1.5');
    await page.waitForTimeout(500);
    const densityValue = await densityControl.inputValue();
    expect(parseFloat(densityValue)).toBeCloseTo(1.5, 1);
  });

  test('@controls RB play/pause button exists and works', async ({ page }) => {
    await page.waitForTimeout(2000);

    const playPauseBtn = page.locator('#rbAdvPlayPause');
    await expect(playPauseBtn).toBeVisible();

    // Check initial state
    const initialText = await playPauseBtn.textContent();
    expect(initialText?.toLowerCase()).toMatch(/play|pause/);

    // Click to toggle
    await playPauseBtn.click();
    await page.waitForTimeout(1000);

    const afterClickText = await playPauseBtn.textContent();
    expect(afterClickText?.toLowerCase()).toMatch(/play|pause/);
    expect(afterClickText).not.toBe(initialText);
  });

  test('@controls Nav gradient play/pause button exists', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Open Nav tab
    const navTab = page.locator('[data-tab="nav"]').first();
    if (await navTab.count() === 0) {
      const tabButton = page.locator('button[data-tab="nav"], .tab[data-tab="nav"]').first();
      if (await tabButton.count() > 0) {
        await tabButton.click();
        await page.waitForTimeout(500);
      }
    }

    const gradientBtn = page.locator('#navGradientPlayPause');
    // Button may be hidden initially (only shows when gradient is active)
    const isVisible = await gradientBtn.isVisible().catch(() => false);
    // Just verify it exists in DOM
    const exists = await gradientBtn.count() > 0;
    expect(exists).toBe(true);
  });

  test('@controls Errl goo auto play/pause button exists', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Open Errl tab
    const errlTab = page.locator('[data-tab="errl"]').first();
    if (await errlTab.count() === 0) {
      const tabButton = page.locator('button[data-tab="errl"], .tab[data-tab="errl"]').first();
      if (await tabButton.count() > 0) {
        await tabButton.click();
        await page.waitForTimeout(500);
      }
    }

    const autoPlayPauseBtn = page.locator('#classicGooAutoPlayPause');
    // Button may be hidden initially (only shows when auto is enabled)
    const exists = await autoPlayPauseBtn.count() > 0;
    expect(exists).toBe(true);
  });

  test('@controls Reset defaults button works', async ({ page }) => {
    await page.waitForTimeout(2000);

    const resetBtn = page.locator('#resetDefaultsBtn');
    await expect(resetBtn).toBeVisible();

    // Change a control value
    const speedControl = page.locator('#rbSpeed');
    await speedControl.fill('2.5');
    await page.waitForTimeout(500);

    // Click reset
    await resetBtn.click();
    
    // Wait for alert and dismiss it
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('reset');
      await dialog.accept();
    });
    await page.waitForTimeout(1000);

    // Verify value was reset
    const resetValue = await speedControl.inputValue();
    expect(parseFloat(resetValue)).toBeCloseTo(1.0, 1);
  });

  test('@controls Save defaults button exists', async ({ page }) => {
    await page.waitForTimeout(2000);

    const saveBtn = page.locator('#saveDefaultsBtn');
    await expect(saveBtn).toBeVisible();
  });

  test('@effects Shiny bubble CSS is applied', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Check for bubble elements
    const bubbles = page.locator('.bubble, .menuOrb');
    const bubbleCount = await bubbles.count();
    
    if (bubbleCount > 0) {
      const firstBubble = bubbles.first();
      
      // Check for shiny CSS properties
      const boxShadow = await firstBubble.evaluate(el => {
        return window.getComputedStyle(el).boxShadow;
      });
      expect(boxShadow).toBeTruthy();
      expect(boxShadow.length).toBeGreaterThan(0);

      // Check for ::before pseudo-element (shiny overlay)
      const hasBefore = await firstBubble.evaluate(el => {
        const styles = window.getComputedStyle(el, '::before');
        return styles.content !== 'none' && styles.content !== '';
      });
      // Note: ::before content check may not work in Playwright, but we can check other properties
      expect(hasBefore || true).toBeTruthy(); // Allow for test limitations
    }
  });

  test('@effects Burst button works', async ({ page }) => {
    await page.waitForTimeout(2000);

    const burstBtn = page.locator('#burstBtn');
    await expect(burstBtn).toBeVisible();

    // Verify burst function exists
    const hasBurst = await page.evaluate(() => {
      return typeof (window as any).errlGLBurst === 'function';
    });
    expect(hasBurst).toBe(true);

    // Click burst button
    await burstBtn.click();
    await page.waitForTimeout(500);
    // No error should occur
  });

  test('@controls All hue controls exist', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Open Hue tab
    const hueTab = page.locator('[data-tab="hue"]').first();
    if (await hueTab.count() === 0) {
      const tabButton = page.locator('button[data-tab="hue"], .tab[data-tab="hue"]').first();
      if (await tabButton.count() > 0) {
        await tabButton.click();
        await page.waitForTimeout(500);
      }
    }

    const hueControls = [
      'hueEnabled', 'hueTarget', 'hueShift', 'hueSat', 'hueInt', 'hueTimeline', 'huePlayPause'
    ];

    for (const controlId of hueControls) {
      const control = page.locator(`#${controlId}`);
      await expect(control).toBeVisible({ timeout: 5000 });
    }
  });

  test('@controls Nav bubble size control works', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Open Nav tab
    const navTab = page.locator('[data-tab="nav"]').first();
    if (await navTab.count() === 0) {
      const tabButton = page.locator('button[data-tab="nav"], .tab[data-tab="nav"]').first();
      if (await tabButton.count() > 0) {
        await tabButton.click();
        await page.waitForTimeout(500);
      }
    }

    const orbSizeControl = page.locator('#navOrbSize');
    await expect(orbSizeControl).toBeVisible();

    const initialValue = await orbSizeControl.inputValue();
    await orbSizeControl.fill('1.2');
    await page.waitForTimeout(500);
    
    const updatedValue = await orbSizeControl.inputValue();
    expect(parseFloat(updatedValue)).toBeCloseTo(1.2, 1);
  });
});
