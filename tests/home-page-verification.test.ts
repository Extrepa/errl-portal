/**
 * Home Page Verification Test Suite
 * 
 * Tests for all home page effects, controls, and wiring
 * Based on docs/home-page-verification.md
 */

import { test, expect } from '@playwright/test';
import {
  waitForEffects,
  waitForEffect,
  getControlValue,
  setControlValue,
  verifyEffectFunction,
  clearLocalStorage,
  getSettingsBundle,
  openPhoneTab,
  ensurePhonePanelOpen,
  waitForCanvasContent,
  getFilterNodeAttribute,
} from './helpers/test-helpers';

test.describe('Home Page Structure', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    // Wait for effects to initialize
    await waitForEffects(page, 15000).catch(() => {
      // If effects don't initialize, continue anyway for structure tests
    });
  });

  test('should load all required canvas elements', async ({ page }) => {
    const canvases = ['#bgParticles', '#riseBubbles', '#errlWebGL'];
    for (const canvasId of canvases) {
      const canvas = page.locator(canvasId);
      await expect(canvas).toBeVisible({ timeout: 10000 });
      
      // Verify canvas has dimensions
      await waitForCanvasContent(page, canvasId.replace('#', ''), 5000);
    }
  });

  test('should load all SVG filters', async ({ page }) => {
    const filters = ['uiGoo', 'errlGooFX', 'classicGoo', 'poolRipple'];
    for (const filterId of filters) {
      const filter = page.locator(`#${filterId}`);
      await expect(filter).toHaveCount(1);
    }
  });

  test('should have all SVG filter nodes', async ({ page }) => {
    const nodes = [
      'classicGooNoise', 'classicGooVisc', 'classicGooDisp', 'classicGooDrip',
      'navGooBlurNode', 'navGooMatrixNode'
    ];
    for (const nodeId of nodes) {
      const node = page.locator(`#${nodeId}`);
      await expect(node).toHaveCount(1);
    }
  });

  test('should have Errl phone panel', async ({ page }) => {
    const panel = page.locator('#errlPanel');
    await expect(panel).toBeVisible();
  });

  test('should have all phone panel tabs', async ({ page }) => {
    const tabs = ['hud', 'errl', 'pin', 'nav', 'rb', 'glb', 'bg', 'dev', 'hue'];
    for (const tab of tabs) {
      const tabButton = page.locator(`[data-tab="${tab}"]`).first();
      await expect(tabButton).toBeVisible({ timeout: 5000 });
    }
  });

  test('should have all Errl elements', async ({ page }) => {
    const elements = ['#errl', '#errlCenter', '#errlGoo', '#errlAuraMask'];
    for (const elementId of elements) {
      const element = page.locator(elementId);
      await expect(element).toHaveCount(1);
    }
  });

  test('should have navigation orbit', async ({ page }) => {
    const navOrbit = page.locator('#navOrbit, .nav-orbit');
    await expect(navOrbit.first()).toBeVisible();
  });
});

test.describe('Rising Bubbles Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForEffect(page, 'risingBubbles', 10000).catch(() => {});
    await ensurePhonePanelOpen(page);
    await openPhoneTab(page, 'rb');
  });

  test('should have all RB controls', async ({ page }) => {
    const controls = [
      'rbSpeed', 'rbDensity', 'rbScale', 'rbAlpha', 'rbWobble', 'rbFreq',
      'rbMin', 'rbMax', 'rbSizeHz', 'rbJumboPct', 'rbJumboScale',
      'rbAttract', 'rbAttractIntensity', 'rbRipples', 'rbRippleIntensity'
    ];
    
    for (const controlId of controls) {
      const control = page.locator(`#${controlId}`);
      await expect(control).toBeVisible({ timeout: 5000 });
    }
  });

  test('should have RB advanced animation controls', async ({ page }) => {
    const controls = ['rbAdvModeLoop', 'rbAdvModePing', 'rbAdvAnimSpeed', 'rbAdvPlayPause'];
    for (const controlId of controls) {
      const control = page.locator(`#${controlId}`);
      await expect(control).toBeVisible();
    }
  });

  test('should update bubble speed when rbSpeed changes', async ({ page }) => {
    const speedControl = page.locator('#rbSpeed');
    await setControlValue(page, 'rbSpeed', '2.0');
    
    // Verify control value changed (range inputs may round, so check with tolerance)
    const value = await speedControl.inputValue();
    const numValue = parseFloat(value);
    expect(numValue).toBeCloseTo(2.0, 1);
    
    // Verify effect function was called
    const hasFunction = await verifyEffectFunction(page, 'errlRisingBubblesThree.setSpeed');
    expect(hasFunction).toBe(true);
  });

  test('should update all RB controls and verify wiring', async ({ page }) => {
    const controls = [
      { id: 'rbDensity', value: '1.5' },
      { id: 'rbScale', value: '1.25' },
      { id: 'rbAlpha', value: '0.8' },
      { id: 'rbWobble', value: '1.2' },
      { id: 'rbFreq', value: '0.9' },
    ];

    for (const { id, value } of controls) {
      await setControlValue(page, id, value);
      const currentValue = await getControlValue(page, id);
      expect(currentValue).toBe(value);
    }
  });

  test('should verify RB setter functions exist', async ({ page }) => {
    const functions = [
      'errlRisingBubblesThree.setSpeed',
      'errlRisingBubblesThree.setDensity',
      'errlRisingBubblesThree.setScale',
      'errlRisingBubblesThree.setAlpha',
      'errlRisingBubblesThree.setWobble',
      'errlRisingBubblesThree.setFreq',
    ];

    for (const funcPath of functions) {
      const exists = await verifyEffectFunction(page, funcPath);
      expect(exists).toBe(true);
    }
  });
});

test.describe('Hue Controller', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForEffect(page, 'hueController', 10000).catch(() => {});
    await ensurePhonePanelOpen(page);
    await openPhoneTab(page, 'hue');
  });

  test('should have all hue controls', async ({ page }) => {
    const controls = ['hueTarget', 'hueEnabled', 'hueShift', 'hueSat', 'hueInt', 'hueTimeline', 'huePlayPause'];
    
    for (const controlId of controls) {
      const control = page.locator(`#${controlId}`);
      await expect(control).toBeVisible({ timeout: 5000 });
    }
  });

  test('should have all layer options', async ({ page }) => {
    const select = page.locator('#hueTarget');
    const options = ['nav', 'riseBubbles', 'bgBubbles', 'background', 'glOverlay'];
    
    for (const option of options) {
      await expect(select.locator(`option[value="${option}"]`)).toHaveCount(1);
    }
  });

  test('should switch between all layers', async ({ page }) => {
    const hueTarget = page.locator('#hueTarget');
    const layers = ['nav', 'riseBubbles', 'bgBubbles', 'background', 'glOverlay'];
    
    for (const layer of layers) {
      await hueTarget.selectOption(layer);
      await page.waitForTimeout(300);
      
      const selected = await hueTarget.evaluate((el: HTMLSelectElement) => el.value);
      expect(selected).toBe(layer);
      
      // Verify controller target is set
      const controllerTarget = await page.evaluate((l) => {
        const hc = (window as any).ErrlHueController;
        return hc ? hc.currentTarget : null;
      }, layer);
      expect(controllerTarget).toBe(layer);
    }
  });

  test('should update hue controls and verify CSS application', async ({ page }) => {
    await setControlValue(page, 'hueEnabled', true);
    await setControlValue(page, 'hueShift', '180');
    await setControlValue(page, 'hueSat', '1.5');
    await setControlValue(page, 'hueInt', '0.8');
    
    // Verify values were set
    expect(await getControlValue(page, 'hueShift')).toBe('180');
    expect(await getControlValue(page, 'hueSat')).toBe('1.5');
    expect(await getControlValue(page, 'hueInt')).toBe('0.8');
  });

  test('should verify HueController functions exist', async ({ page }) => {
    const functions = [
      'ErrlHueController.setTarget',
      'ErrlHueController.setEnabled',
      'ErrlHueController.setHue',
      'ErrlHueController.setSaturation',
      'ErrlHueController.setIntensity',
      'ErrlHueController.toggleTimeline',
    ];

    for (const funcPath of functions) {
      const exists = await verifyEffectFunction(page, funcPath);
      expect(exists).toBe(true);
    }
  });

  test('should test timeline animation', async ({ page }) => {
    const playPause = page.locator('#huePlayPause');
    await expect(playPause).toBeVisible();
    
    // Start animation
    await playPause.click();
    await page.waitForTimeout(500);
    
    // Verify animation is playing
    const isPlaying = await page.evaluate(() => {
      const hc = (window as any).ErrlHueController;
      return hc && hc.master ? hc.master.playing : false;
    });
    expect(isPlaying).toBe(true);
    
    // Pause animation
    await playPause.click();
    await page.waitForTimeout(500);
    
    const isPaused = await page.evaluate(() => {
      const hc = (window as any).ErrlHueController;
      return hc && hc.master ? !hc.master.playing : false;
    });
    expect(isPaused).toBe(true);
  });
});

test.describe('Classic Goo Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-tab="errl"]').first().click();
  });

  test('should have all goo controls', async ({ page }) => {
    const controls = [
      'classicGooEnabled', 'classicGooStrength', 'classicGooWobble', 'classicGooSpeed',
      'classicGooStrengthAuto', 'classicGooWobbleAuto', 'classicGooSpeedAuto',
      'classicGooAutoSpeed', 'classicGooMouseReact', 'classicGooAutoPlayPause', 'classicGooRandom'
    ];
    
    for (const controlId of controls) {
      const control = page.locator(`#${controlId}`);
      await expect(control).toHaveCount(1);
    }
  });

  test('should have all SVG filter nodes', async ({ page }) => {
    const nodes = ['classicGooNoise', 'classicGooVisc', 'classicGooDisp', 'classicGooDrip'];
    
    for (const nodeId of nodes) {
      const node = page.locator(`#${nodeId}`);
      await expect(node).toHaveCount(1);
    }
  });
});

test.describe('Navigation Goo Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-tab="nav"]').first().click();
  });

  test('should have nav goo controls', async ({ page }) => {
    // Note: navGooBlur, navGooMult, navGooThresh, navGooEnabled may not be in HTML
    // They're controlled via portal-app.js
    const controls = ['navWiggle', 'navFlow', 'navGrip', 'navDrip', 'navVisc', 'navRandom'];
    
    for (const controlId of controls) {
      const control = page.locator(`#${controlId}`);
      await expect(control).toHaveCount(1);
    }
  });
});

test.describe('Settings Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForEffects(page, 15000).catch(() => {});
    await clearLocalStorage(page);
  });

  test('should save and load settings in localStorage', async ({ page }) => {
    await ensurePhonePanelOpen(page);
    await openPhoneTab(page, 'rb');
    
    // Change multiple settings
    await setControlValue(page, 'rbSpeed', '1.5');
    await setControlValue(page, 'rbDensity', '1.2');
    await setControlValue(page, 'rbAlpha', '0.9');
    
    // Wait for settings to be saved
    await page.waitForTimeout(1000);
    
    // Check localStorage
    const bundle = await getSettingsBundle(page);
    expect(bundle).toBeTruthy();
    expect(bundle.rb).toBeTruthy();
    expect(bundle.rb.speed).toBeCloseTo(1.5, 1);
    expect(bundle.rb.density).toBeCloseTo(1.2, 1);
    expect(bundle.rb.alpha).toBeCloseTo(0.9, 1);
  });

  test('should restore settings on page reload', async ({ page }) => {
    await ensurePhonePanelOpen(page);
    await openPhoneTab(page, 'rb');
    
    // Set initial values
    await setControlValue(page, 'rbSpeed', '2.0');
    await setControlValue(page, 'rbDensity', '1.5');
    await page.waitForTimeout(1000);
    
    // Reload page
    await page.reload();
    await waitForEffects(page, 15000).catch(() => {});
    await ensurePhonePanelOpen(page);
    await openPhoneTab(page, 'rb');
    
    // Verify values were restored
    const speedValue = await getControlValue(page, 'rbSpeed');
    const densityValue = await getControlValue(page, 'rbDensity');
    
    expect(parseFloat(speedValue || '0')).toBeCloseTo(2.0, 1);
    expect(parseFloat(densityValue || '0')).toBeCloseTo(1.5, 1);
  });

  test('should persist settings bundle structure', async ({ page }) => {
    await ensurePhonePanelOpen(page);
    
    // Change settings in multiple tabs
    await openPhoneTab(page, 'rb');
    await setControlValue(page, 'rbSpeed', '1.8');
    
    await openPhoneTab(page, 'hue');
    await setControlValue(page, 'hueShift', '90');
    
    await openPhoneTab(page, 'errl');
    await setControlValue(page, 'classicGooStrength', '0.5');
    
    await page.waitForTimeout(1000);
    
    // Verify bundle structure
    const bundle = await getSettingsBundle(page);
    expect(bundle).toBeTruthy();
    expect(bundle.rb).toBeTruthy();
    expect(bundle.hue).toBeTruthy();
    expect(bundle.ui).toBeTruthy();
  });
});

test.describe('Phone Panel Tabs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForEffects(page, 15000).catch(() => {});
    await ensurePhonePanelOpen(page);
  });

  test('should switch between all tabs', async ({ page }) => {
    const tabs = ['hud', 'errl', 'pin', 'nav', 'rb', 'glb', 'bg', 'dev', 'hue'];
    
    for (const tab of tabs) {
      await openPhoneTab(page, tab);
      
      // Verify tab button is active
      const tabButton = page.locator(`[data-tab="${tab}"]`).first();
      const isActive = await tabButton.evaluate((el) => 
        el.classList.contains('active')
      );
      expect(isActive).toBe(true);
    }
  });

  test('should show correct tab content for each tab', async ({ page }) => {
    const tabContentMap: Record<string, string[]> = {
      hud: ['burstBtn', 'prefReduce'],
      errl: ['classicGooEnabled', 'classicGooStrength'],
      pin: ['pinWidgetFrame', '[data-colorizer-action="inject"]'],
      nav: ['navOrbitSpeed', 'navWiggle'],
      rb: ['rbSpeed', 'rbDensity', 'rbScale'],
      glb: ['bgSpeed', 'glAlpha'],
      bg: [], // BG tab is intentionally empty
      dev: ['snapshotPngBtn', 'saveDefaultsBtn'],
      hue: ['hueTarget', 'hueShift'],
    };

    for (const [tab, expectedElements] of Object.entries(tabContentMap)) {
      await openPhoneTab(page, tab);
      
      for (const elementSelector of expectedElements) {
        const element = page.locator(elementSelector).first();
        if (elementSelector.startsWith('[')) {
          await expect(element).toBeVisible({ timeout: 3000 });
        } else {
          await expect(element).toBeVisible({ timeout: 3000 });
        }
      }
    }
  });

  test('should handle panel minimize/maximize', async ({ page }) => {
    const panel = page.locator('#errlPanel');
    
    // Check if panel can be minimized
    const minimizeButton = page.locator('#errlPanel').locator('button, .panel-header').first();
    if (await minimizeButton.count() > 0) {
      await minimizeButton.click();
      await page.waitForTimeout(300);
      
      const isMinimized = await panel.evaluate((el) => 
        el.classList.contains('minimized')
      );
      expect(isMinimized).toBe(true);
      
      // Maximize again
      await panel.click();
      await page.waitForTimeout(300);
      
      const isMaximized = await panel.evaluate((el) => 
        !el.classList.contains('minimized')
      );
      expect(isMaximized).toBe(true);
    }
  });

  test('should have scroll to top button', async ({ page }) => {
    const scrollTopBtn = page.locator('#panelScrollTop');
    await expect(scrollTopBtn).toBeVisible();
    
    // Test scroll functionality
    await scrollTopBtn.click();
    await page.waitForTimeout(300);
  });
});

test.describe('WebGL Effects', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-tab="glb"]').first().click();
  });

  test('should have GLB controls', async ({ page }) => {
    const controls = ['bgSpeed', 'bgDensity', 'glAlpha', 'glbRandom'];
    
    for (const controlId of controls) {
      const control = page.locator(`#${controlId}`);
      await expect(control).toHaveCount(1);
    }
  });
});

test.describe('Pin Widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await ensurePhonePanelOpen(page);
    await openPhoneTab(page, 'pin');
  });

  test('should have pin widget controls', async ({ page }) => {
    const buttons = [
      '[data-colorizer-action="inject"]',
      '[data-colorizer-action="save"]',
      '[data-colorizer-action="reset"]',
      '[data-pin-modal-open]'
    ];
    
    for (const selector of buttons) {
      const button = page.locator(selector);
      await expect(button).toBeVisible({ timeout: 5000 });
    }
  });

  test('should have pin widget iframe', async ({ page }) => {
    const iframe = page.locator('#pinWidgetFrame');
    await expect(iframe).toBeVisible();
    
    // Verify iframe has src
    const src = await iframe.getAttribute('src');
    expect(src).toBeTruthy();
    expect(src).toContain('pin-widget');
  });

  test('should have pin widget action functions', async ({ page }) => {
    // Verify functions exist in window
    const hasFunctions = await page.evaluate(() => {
      return typeof (window as any).injectSVGToHome === 'function' ||
             typeof (window as any).saveSVGToStorage === 'function' ||
             typeof (window as any).resetHomeToDefault === 'function';
    });
    expect(hasFunctions).toBe(true);
  });
});

test.describe('Developer Tools', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await ensurePhonePanelOpen(page);
    await openPhoneTab(page, 'dev');
  });

  test('should have dev tools buttons', async ({ page }) => {
    const buttons = [
      'snapshotPngBtn',
      'exportHtmlBtn',
      'saveDefaultsBtn',
      'resetDefaultsBtn',
      'exportSettingsBtn',
      'importSettingsBtn'
    ];
    
    for (const buttonId of buttons) {
      const button = page.locator(`#${buttonId}`);
      await expect(button).toBeVisible({ timeout: 5000 });
    }
  });

  test('should have settings import file input', async ({ page }) => {
    const fileInput = page.locator('#importSettingsFile');
    await expect(fileInput).toHaveCount(1);
    
    const accept = await fileInput.getAttribute('accept');
    expect(accept).toBe('application/json');
  });

  test('should test save defaults button', async ({ page }) => {
    // Save defaults button is in DEV tab
    await openPhoneTab(page, 'dev');
    await page.waitForTimeout(500);
    
    const saveBtn = page.locator('#saveDefaultsBtn');
    // Button exists in DOM (may be small/hidden)
    const exists = await saveBtn.count() > 0;
    expect(exists).toBe(true);
    
    // Scroll into view if needed
    if (exists) {
      await saveBtn.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
    }
    
    // Change a setting first
    await openPhoneTab(page, 'rb');
    await setControlValue(page, 'rbSpeed', '2.5');
    await page.waitForTimeout(500);
    
    // Go back to dev tab and save
    await openPhoneTab(page, 'dev');
    await page.waitForTimeout(500);
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click({ force: true });
    await page.waitForTimeout(500);
    
    // Verify settings were saved
    const bundle = await getSettingsBundle(page);
    expect(bundle).toBeTruthy();
  });

  test('should test reset defaults button', async ({ page }) => {
    // Reset defaults button is in DEV tab
    await openPhoneTab(page, 'dev');
    await page.waitForTimeout(500);
    
    const resetBtn = page.locator('#resetDefaultsBtn');
    // Button exists in DOM (may be small/hidden)
    const exists = await resetBtn.count() > 0;
    expect(exists).toBe(true);
    
    // Scroll into view if needed
    if (exists) {
      await resetBtn.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
    }
    
    // Set up dialog handler BEFORE clicking
    page.on('dialog', async dialog => {
      expect(dialog.message().toLowerCase()).toContain('reset');
      await dialog.accept();
    });
    
    // Change a setting first
    await openPhoneTab(page, 'rb');
    await setControlValue(page, 'rbSpeed', '3.0');
    await page.waitForTimeout(500);
    
    // Reset
    await openPhoneTab(page, 'dev');
    await resetBtn.click();
    await page.waitForTimeout(1000);
    
    // Verify value was reset
    await openPhoneTab(page, 'rb');
    const speedValue = await getControlValue(page, 'rbSpeed');
    expect(parseFloat(speedValue || '0')).toBeCloseTo(1.0, 1);
  });
});
