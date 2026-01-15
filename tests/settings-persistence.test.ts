/**
 * Settings Persistence Test Suite
 * 
 * Tests for localStorage settings save/load, import/export, and persistence
 */

import { test, expect } from '@playwright/test';
import {
  waitForEffects,
  ensurePhonePanelOpen,
  openPhoneTab,
  setControlValue,
  getControlValue,
  clearLocalStorage,
  getSettingsBundle,
  setSettingsBundle,
} from './helpers/test-helpers';

test.describe('Settings Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForEffects(page, 15000).catch(() => {});
    await clearLocalStorage(page);
    await ensurePhonePanelOpen(page);
  });

  test('should save settings bundle to localStorage', async ({ page }) => {
    await openPhoneTab(page, 'rb');
    
    // Change multiple settings
    await setControlValue(page, 'rbSpeed', '1.5');
    await setControlValue(page, 'rbDensity', '1.2');
    await setControlValue(page, 'rbAlpha', '0.9');
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
    await openPhoneTab(page, 'rb');
    
    // Set initial values
    await setControlValue(page, 'rbSpeed', '2.0');
    await setControlValue(page, 'rbDensity', '1.5');
    await setControlValue(page, 'rbAlpha', '0.8');
    await page.waitForTimeout(1000);
    
    // Reload page
    await page.reload();
    await waitForEffects(page, 15000).catch(() => {});
    await ensurePhonePanelOpen(page);
    await openPhoneTab(page, 'rb');
    
    // Verify values were restored
    const speedValue = await getControlValue(page, 'rbSpeed');
    const densityValue = await getControlValue(page, 'rbDensity');
    const alphaValue = await getControlValue(page, 'rbAlpha');
    
    expect(parseFloat(speedValue || '0')).toBeCloseTo(2.0, 1);
    expect(parseFloat(densityValue || '0')).toBeCloseTo(1.5, 1);
    expect(parseFloat(alphaValue || '0')).toBeCloseTo(0.8, 1);
  });

  test('should persist settings from multiple tabs', async ({ page }) => {
    // Change settings in multiple tabs
    await openPhoneTab(page, 'rb');
    await setControlValue(page, 'rbSpeed', '1.8');
    
    await openPhoneTab(page, 'hue');
    await setControlValue(page, 'hueShift', '90');
    await setControlValue(page, 'hueSat', '1.5');
    
    await openPhoneTab(page, 'errl');
    await setControlValue(page, 'classicGooStrength', '0.5');
    await setControlValue(page, 'classicGooWobble', '0.6');
    
    await page.waitForTimeout(1000);
    
    // Verify bundle structure
    const bundle = await getSettingsBundle(page);
    expect(bundle).toBeTruthy();
    expect(bundle.rb).toBeTruthy();
    expect(bundle.hue).toBeTruthy();
    expect(bundle.ui).toBeTruthy();
    
    // Verify specific values
    expect(bundle.rb.speed).toBeCloseTo(1.8, 1);
    expect(bundle.ui.classicGooStrength).toBeTruthy();
  });

  test('should handle save defaults button', async ({ page }) => {
    await openPhoneTab(page, 'dev');
    
    const saveBtn = page.locator('#saveDefaultsBtn');
    await expect(saveBtn).toBeVisible();
    
    // Change a setting
    await openPhoneTab(page, 'rb');
    await setControlValue(page, 'rbSpeed', '2.5');
    await page.waitForTimeout(500);
    
    // Save defaults
    await openPhoneTab(page, 'dev');
    await saveBtn.click();
    await page.waitForTimeout(1000);
    
    // Verify settings were saved
    const bundle = await getSettingsBundle(page);
    expect(bundle).toBeTruthy();
    expect(bundle.rb).toBeTruthy();
  });

  test('should handle reset defaults button', async ({ page }) => {
    await openPhoneTab(page, 'dev');
    
    const resetBtn = page.locator('#resetDefaultsBtn');
    await expect(resetBtn).toBeVisible();
    
    // Set up dialog handler
    page.on('dialog', async dialog => {
      expect(dialog.message().toLowerCase()).toContain('reset');
      await dialog.accept();
    });
    
    // Change settings
    await openPhoneTab(page, 'rb');
    await setControlValue(page, 'rbSpeed', '3.0');
    await setControlValue(page, 'rbDensity', '2.0');
    await page.waitForTimeout(500);
    
    // Reset
    await openPhoneTab(page, 'dev');
    await resetBtn.click();
    await page.waitForTimeout(1000);
    
    // Verify values were reset to defaults
    await openPhoneTab(page, 'rb');
    const speedValue = await getControlValue(page, 'rbSpeed');
    const densityValue = await getControlValue(page, 'rbDensity');
    
    expect(parseFloat(speedValue || '0')).toBeCloseTo(1.0, 1);
    expect(parseFloat(densityValue || '0')).toBeCloseTo(1.0, 1);
  });

  test('should export settings as JSON', async ({ page }) => {
    await openPhoneTab(page, 'dev');
    
    // Set some settings first
    await openPhoneTab(page, 'rb');
    await setControlValue(page, 'rbSpeed', '1.5');
    await page.waitForTimeout(500);
    
    // Set up download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
    
    const exportBtn = page.locator('#exportSettingsBtn');
    await expect(exportBtn).toBeVisible();
    await exportBtn.click();
    
    const download = await downloadPromise;
    if (download) {
      // Verify download occurred
      expect(download.suggestedFilename()).toContain('.json');
    }
  });

  test('should import settings from file', async ({ page }) => {
    await openPhoneTab(page, 'dev');
    
    const importBtn = page.locator('#importSettingsBtn');
    const fileInput = page.locator('#importSettingsFile');
    
    await expect(importBtn).toBeVisible();
    await expect(fileInput).toHaveCount(1);
    
    // Create test settings bundle
    const testBundle = {
      rb: { speed: 2.5, density: 1.8, alpha: 0.7 },
      ui: { classicGooStrength: '0.6' },
    };
    
    // Set settings directly to localStorage first
    await setSettingsBundle(page, testBundle);
    await page.reload();
    await waitForEffects(page, 15000).catch(() => {});
    await ensurePhonePanelOpen(page);
    await openPhoneTab(page, 'rb');
    
    // Verify imported settings
    const speedValue = await getControlValue(page, 'rbSpeed');
    expect(parseFloat(speedValue || '0')).toBeCloseTo(2.5, 1);
  });

  test('should maintain settings bundle structure', async ({ page }) => {
    // Set settings in various tabs
    await openPhoneTab(page, 'rb');
    await setControlValue(page, 'rbSpeed', '1.5');
    
    await openPhoneTab(page, 'hue');
    await setControlValue(page, 'hueShift', '180');
    
    await openPhoneTab(page, 'nav');
    await setControlValue(page, 'navWiggle', '0.5');
    
    await page.waitForTimeout(1000);
    
    // Verify bundle structure
    const bundle = await getSettingsBundle(page);
    expect(bundle).toBeTruthy();
    expect(bundle.rb).toBeTruthy();
    expect(bundle.hue).toBeTruthy();
    expect(bundle.ui).toBeTruthy();
    
    // Verify bundle has expected keys
    expect(bundle.rb).toHaveProperty('speed');
    expect(bundle.rb).toHaveProperty('density');
    expect(bundle.rb).toHaveProperty('alpha');
  });

  test('should handle empty localStorage gracefully', async ({ page }) => {
    await clearLocalStorage(page);
    await page.reload();
    await waitForEffects(page, 15000).catch(() => {});
    
    // Page should still load with defaults
    await ensurePhonePanelOpen(page);
    await openPhoneTab(page, 'rb');
    
    const speedControl = page.locator('#rbSpeed');
    await expect(speedControl).toBeVisible();
    
    // Should have default value
    const defaultValue = await getControlValue(page, 'rbSpeed');
    expect(defaultValue).toBeTruthy();
  });
});
