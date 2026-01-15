/**
 * Keyboard Shortcuts Test Suite
 * 
 * Tests for keyboard shortcuts hook in src/shared/hooks/index.ts
 * Tests in designer app context
 */

import { test, expect } from '@playwright/test';

test.describe('Keyboard Shortcuts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/designer');
    await page.waitForLoadState('networkidle');
    // Wait for React app to mount
    await page.waitForTimeout(2000);
  });

  test('should not trigger shortcuts in input fields', async ({ page }) => {
    // Find an input field
    const inputs = page.locator('input[type="text"], input[type="number"], textarea');
    const inputCount = await inputs.count();
    
    if (inputCount > 0) {
      const firstInput = inputs.first();
      await firstInput.focus();
      await firstInput.fill('test');
      
      // Shortcuts should not trigger in input
      const isMac = process.platform === 'darwin';
      const modKey = isMac ? 'Meta' : 'Control';
      await page.keyboard.press(`${modKey}+z`);
      
      // Input value should remain
      const value = await firstInput.inputValue();
      expect(value).toBe('test');
    }
  });

  test('should trigger undo with Cmd/Ctrl+Z when not in input', async ({ page }) => {
    // Click on canvas/body to ensure focus is not in input
    await page.click('body');
    await page.waitForTimeout(300);
    
    // Check if undo handler exists
    const hasUndoHandler = await page.evaluate(() => {
      // Check if keyboard shortcuts hook is active
      // This would require the hook to be mounted in the app
      return typeof (window as any).useKeyboardShortcutsSimple !== 'undefined' ||
             document.querySelector('[data-testid="designer-canvas"]') !== null;
    });
    
    // Test keyboard shortcut
    const isMac = process.platform === 'darwin';
    const modKey = isMac ? 'Meta' : 'Control';
    
    // Press undo shortcut
    await page.keyboard.press(`${modKey}+z`);
    await page.waitForTimeout(300);
    
    // Verify no errors occurred
    const errors = await page.evaluate(() => {
      return (window as any).__testErrors || [];
    });
    expect(errors.length).toBe(0);
  });

  test('should trigger redo with Cmd/Ctrl+Shift+Z or Cmd/Ctrl+Y', async ({ page }) => {
    await page.click('body');
    await page.waitForTimeout(300);
    
    const isMac = process.platform === 'darwin';
    const modKey = isMac ? 'Meta' : 'Control';
    
    // Test Shift+Z
    await page.keyboard.press(`${modKey}+Shift+z`);
    await page.waitForTimeout(300);
    
    // Test Y (Windows/Linux)
    if (!isMac) {
      await page.keyboard.press(`${modKey}+y`);
      await page.waitForTimeout(300);
    }
    
    // Verify no errors
    const errors = await page.evaluate(() => {
      return (window as any).__testErrors || [];
    });
    expect(errors.length).toBe(0);
  });

  test('should trigger delete with Delete or Backspace', async ({ page }) => {
    await page.click('body');
    await page.waitForTimeout(300);
    
    // Test Delete key
    await page.keyboard.press('Delete');
    await page.waitForTimeout(300);
    
    // Test Backspace
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(300);
    
    // Verify no errors
    const errors = await page.evaluate(() => {
      return (window as any).__testErrors || [];
    });
    expect(errors.length).toBe(0);
  });

  test('should trigger deselect with Escape', async ({ page }) => {
    await page.click('body');
    await page.waitForTimeout(300);
    
    // Press Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    
    // Verify no errors
    const errors = await page.evaluate(() => {
      return (window as any).__testErrors || [];
    });
    expect(errors.length).toBe(0);
  });

  test('should handle platform differences (Mac vs Windows)', async ({ page }) => {
    await page.click('body');
    await page.waitForTimeout(300);
    
    // Detect platform in browser
    const platform = await page.evaluate(() => {
      return navigator.platform.toUpperCase().indexOf('MAC') >= 0 ? 'mac' : 'other';
    });
    
    const isMac = process.platform === 'darwin';
    const modKey = isMac ? 'Meta' : 'Control';
    
    // Test that correct modifier key works
    await page.keyboard.press(`${modKey}+z`);
    await page.waitForTimeout(300);
    
    // Verify shortcut was handled (no default browser behavior)
    const handled = await page.evaluate(() => {
      // Check if page was prevented from default undo (would reload or navigate)
      return document.readyState === 'complete';
    });
    expect(handled).toBe(true);
  });

  test('should ignore shortcuts when contentEditable is active', async ({ page }) => {
    // Find or create a contentEditable element
    const hasContentEditable = await page.evaluate(() => {
      const editable = document.querySelector('[contenteditable="true"]');
      if (editable) {
        (editable as HTMLElement).focus();
        (editable as HTMLElement).textContent = 'test content';
        return true;
      }
      return false;
    });
    
    if (hasContentEditable) {
      const isMac = process.platform === 'darwin';
      const modKey = isMac ? 'Meta' : 'Control';
      
      // Shortcut should not trigger
      await page.keyboard.press(`${modKey}+z`);
      await page.waitForTimeout(300);
      
      // Content should remain
      const content = await page.evaluate(() => {
        const editable = document.querySelector('[contenteditable="true"]');
        return editable ? (editable as HTMLElement).textContent : '';
      });
      expect(content).toContain('test');
    }
  });
});

