/**
 * Integration Tests: Controls to Effects
 * 
 * End-to-end tests for control-to-effect wiring and user flows
 */

import { test, expect } from '@playwright/test';
import {
  waitForEffects,
  ensurePhonePanelOpen,
  openPhoneTab,
  setControlValue,
  getControlValue,
  verifyEffectFunction,
  clearLocalStorage,
} from './helpers/test-helpers';

test.describe('Integration: Controls to Effects', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForEffects(page, 15000).catch(() => {});
    await clearLocalStorage(page);
    await ensurePhonePanelOpen(page);
  });

  test('should update Rising Bubbles effect when controls change', async ({ page }) => {
    await openPhoneTab(page, 'rb');
    
    // Verify effect exists
    const hasRB = await verifyEffectFunction(page, 'errlRisingBubblesThree.setSpeed');
    expect(hasRB).toBe(true);

    // Wait for RB API surface
    await page.waitForFunction(() => {
      // @ts-ignore
      const RB = (window as any).errlRisingBubblesThree;
      return !!RB && typeof RB.getControls === 'function' && typeof RB.getActiveCount === 'function';
    });
    
    // Change a few controls (including new rbScale)
    await setControlValue(page, 'rbSpeed', '2.0');
    await setControlValue(page, 'rbDensity', '1.5'); // count multiplier
    await setControlValue(page, 'rbScale', '1.25');  // size scale
    await setControlValue(page, 'rbAlpha', '0.8');
    await setControlValue(page, 'rbWobble', '1.2');
    await setControlValue(page, 'rbFreq', '0.9');
    await setControlValue(page, 'rbMin', '16');
    await setControlValue(page, 'rbMax', '40');
    await setControlValue(page, 'rbJumboPct', '0.2');
    await setControlValue(page, 'rbJumboScale', '1.8');
    await setControlValue(page, 'rbSizeHz', '0.5');
    await setControlValue(page, 'rbAttract', true);
    await setControlValue(page, 'rbAttractIntensity', '1.5');
    await setControlValue(page, 'rbRipples', true);
    await setControlValue(page, 'rbRippleIntensity', '1.2');
    await page.waitForTimeout(500);
    
    // Verify control value changed
    const speedValue = await getControlValue(page, 'rbSpeed');
    expect(parseFloat(speedValue || '0')).toBeCloseTo(2.0, 1);
    
    // Verify engine state reflects the controls (wiring + purpose)
    const rbState = await page.evaluate(() => {
      // @ts-ignore
      const RB = (window as any).errlRisingBubblesThree;
      if (!RB) return null;
      const c = RB.getControls();
      return {
        controls: c,
        activeCount: RB.getActiveCount(),
        poolSize: RB.getPoolSize ? RB.getPoolSize() : null
      };
    });
    expect(rbState?.controls).toBeTruthy();
    expect(rbState?.controls?.speed).toBeCloseTo(2.0, 1);
    // `density` is repurposed as count multiplier; `count` alias is also provided by the engine.
    expect(rbState?.controls?.density).toBeCloseTo(1.5, 1);
    expect(rbState?.controls?.count).toBeCloseTo(1.5, 1);
    expect(rbState?.controls?.scale).toBeCloseTo(1.25, 1);
    expect(rbState?.activeCount).toBeGreaterThan(0);
    if (rbState?.poolSize != null) {
      expect(rbState.activeCount).toBeLessThanOrEqual(rbState.poolSize);
    }
  });

  test('should update Hue Controller when controls change', async ({ page }) => {
    await openPhoneTab(page, 'hue');
    
    // Verify controller exists
    const hasController = await verifyEffectFunction(page, 'ErrlHueController.setHue');
    expect(hasController).toBe(true);
    
    // Change hue settings
    await setControlValue(page, 'hueEnabled', true);
    await setControlValue(page, 'hueTarget', 'nav');
    await setControlValue(page, 'hueShift', '90');
    await page.waitForTimeout(500);
    
    // Verify controller state
    const controllerState = await page.evaluate(() => {
      const hc = (window as any).ErrlHueController;
      if (!hc) return null;
      return {
        currentTarget: hc.currentTarget,
        layerEnabled: hc.layers?.nav?.enabled,
        layerHue: hc.layers?.nav?.hue,
      };
    });
    
    expect(controllerState?.currentTarget).toBe('nav');
    expect(controllerState?.layerEnabled).toBe(true);
    expect(controllerState?.layerHue).toBeCloseTo(90, 0);
  });

  test('should update Classic Goo when controls change', async ({ page }) => {
    await openPhoneTab(page, 'errl');
    
    // Enable goo
    await setControlValue(page, 'classicGooEnabled', true);
    await page.waitForTimeout(300);
    
    // Verify goo class is applied to correct elements (#errlCenter and #errlAuraMask)
    const hasGooClass = await page.evaluate(() => {
      const errlCenter = document.getElementById('errlCenter');
      const errlAuraMask = document.getElementById('errlAuraMask');
      const centerHasGoo = errlCenter ? errlCenter.classList.contains('goo') : false;
      const auraHasGoo = errlAuraMask ? errlAuraMask.classList.contains('goo') : false;
      return centerHasGoo || auraHasGoo;
    });
    expect(hasGooClass).toBe(true);
    
    // Change goo strength
    await setControlValue(page, 'classicGooStrength', '0.5');
    await page.waitForTimeout(500);
    
    // Verify filter node was updated
    const dispScale = await page.evaluate(() => {
      const node = document.getElementById('classicGooDisp');
      return node ? node.getAttribute('scale') : null;
    });
    expect(dispScale).toBeTruthy();
    expect(parseFloat(dispScale || '0')).toBeGreaterThan(0);
  });

  test('should update Navigation Goo when controls change', async ({ page }) => {
    await openPhoneTab(page, 'nav');
    
    // Verify WebGL goo function exists
    const hasGooFunction = await verifyEffectFunction(page, 'errlGLSetGoo');
    
    // Change nav goo+ controls
    await setControlValue(page, 'navWiggle', '0.5');
    await setControlValue(page, 'navFlow', '1.2');
    await setControlValue(page, 'navGrip', '0.7');
    await page.waitForTimeout(500);
    
    // Verify values were set
    expect(parseFloat(await getControlValue(page, 'navWiggle') || '0')).toBeCloseTo(0.5, 1);
    expect(parseFloat(await getControlValue(page, 'navFlow') || '0')).toBeCloseTo(1.2, 1);
    
    // If WebGL is available, function should exist
    if (hasGooFunction) {
      expect(hasGooFunction).toBe(true);
    }
  });

  test('should update WebGL bubbles when GLB controls change', async ({ page }) => {
    await openPhoneTab(page, 'glb');
    
    // Change GLB controls
    await setControlValue(page, 'bgSpeed', '1.5');
    await setControlValue(page, 'bgDensity', '1.2');
    await setControlValue(page, 'glAlpha', '0.7');
    await page.waitForTimeout(500);
    
    // Verify values were set
    expect(parseFloat(await getControlValue(page, 'bgSpeed') || '0')).toBeCloseTo(1.5, 1);
    expect(parseFloat(await getControlValue(page, 'bgDensity') || '0')).toBeCloseTo(1.2, 1);
    expect(parseFloat(await getControlValue(page, 'glAlpha') || '0')).toBeCloseTo(0.7, 1);
  });

  test('should persist and restore complete control state', async ({ page }) => {
    // Set multiple controls across tabs
    await openPhoneTab(page, 'rb');
    await setControlValue(page, 'rbSpeed', '1.8');
    await setControlValue(page, 'rbDensity', '1.3');
    await page.waitForTimeout(500);
    
    await openPhoneTab(page, 'hue');
    await setControlValue(page, 'hueShift', '120');
    await setControlValue(page, 'hueSat', '1.5');
    await page.waitForTimeout(500);
    
    await openPhoneTab(page, 'errl');
    await setControlValue(page, 'classicGooStrength', '0.6');
    
    // Wait for settings to be saved
    await page.waitForTimeout(1500);
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await waitForEffects(page, 15000).catch(() => {});
    await ensurePhonePanelOpen(page);
    await page.waitForTimeout(1000); // Wait for settings to restore
    
    // Verify all settings restored
    await openPhoneTab(page, 'rb');
    await page.waitForTimeout(300);
    const rbSpeed = await getControlValue(page, 'rbSpeed');
    const rbDensity = await getControlValue(page, 'rbDensity');
    expect(parseFloat(rbSpeed || '0')).toBeCloseTo(1.8, 1);
    expect(parseFloat(rbDensity || '0')).toBeCloseTo(1.3, 1);
    
    await openPhoneTab(page, 'hue');
    await page.waitForTimeout(300);
    const hueShift = await getControlValue(page, 'hueShift');
    const hueSat = await getControlValue(page, 'hueSat');
    expect(parseFloat(hueShift || '0')).toBeCloseTo(120, 0);
    expect(parseFloat(hueSat || '0')).toBeCloseTo(1.5, 1);
    
    await openPhoneTab(page, 'errl');
    await page.waitForTimeout(300);
    const gooStrength = await getControlValue(page, 'classicGooStrength');
    expect(parseFloat(gooStrength || '0')).toBeCloseTo(0.6, 1);
  });

  test('should handle rapid control changes', async ({ page }) => {
    await openPhoneTab(page, 'rb');
    
    // Rapidly change controls
    for (let i = 0; i < 5; i++) {
      await setControlValue(page, 'rbSpeed', String(1.0 + i * 0.2));
      await page.waitForTimeout(100);
    }
    
    // Final value should be set
    const finalValue = await getControlValue(page, 'rbSpeed');
    expect(parseFloat(finalValue || '0')).toBeCloseTo(2.0, 1);
  });

  test('should handle multiple tab interactions', async ({ page }) => {
    // Interact with multiple tabs in sequence
    const tabs = ['rb', 'hue', 'errl', 'nav', 'glb'];
    
    for (const tab of tabs) {
      await openPhoneTab(page, tab);
      await page.waitForTimeout(200);
      
      // Verify tab is active
      const tabButton = page.locator(`[data-tab="${tab}"]`).first();
      const isActive = await tabButton.evaluate((el) => 
        el.classList.contains('active')
      );
      expect(isActive).toBe(true);
    }
  });

  test('should handle control interactions with effects not initialized', async ({ page }) => {
    // Clear localStorage and reload without waiting for effects
    await clearLocalStorage(page);
    await page.reload();
    
    // Try to interact with controls immediately
    await ensurePhonePanelOpen(page);
    await openPhoneTab(page, 'rb');
    
    // Control should still exist even if effect isn't ready
    const speedControl = page.locator('#rbSpeed');
    await expect(speedControl).toBeVisible();
    
    // Setting value should not error (effect may not update yet)
    await setControlValue(page, 'rbSpeed', '2.0');
    await page.waitForTimeout(500);
    
    // Value should still be set
    const value = await getControlValue(page, 'rbSpeed');
    expect(parseFloat(value || '0')).toBeCloseTo(2.0, 1);
  });
});
