/**
 * Test Helper Functions
 * Reusable utilities for Playwright tests
 */

import { Page, expect } from '@playwright/test';

/**
 * Wait for all effects to initialize
 */
export async function waitForEffects(page: Page, timeout = 10000): Promise<void> {
  await page.waitForFunction(
    () => {
      const hasRisingBubbles = typeof (window as any).errlRisingBubblesThree !== 'undefined';
      const hasHueController = typeof (window as any).ErrlHueController !== 'undefined';
      const hasWebGL = typeof (window as any).__ErrlWebGL !== 'undefined';
      return hasRisingBubbles && hasHueController && hasWebGL;
    },
    { timeout }
  );
}

/**
 * Wait for a specific effect to initialize
 */
export async function waitForEffect(page: Page, effectName: string, timeout = 5000): Promise<void> {
  const effectMap: Record<string, string> = {
    risingBubbles: 'errlRisingBubblesThree',
    hueController: 'ErrlHueController',
    webgl: '__ErrlWebGL',
    errlBG: 'ErrlBG',
  };

  const windowProp = effectMap[effectName] || effectName;
  await page.waitForFunction(
    (prop) => typeof (window as any)[prop] !== 'undefined',
    windowProp,
    { timeout }
  );
}

/**
 * Get control value safely
 */
export async function getControlValue(page: Page, controlId: string): Promise<string | null> {
  const control = page.locator(`#${controlId}`);
  const count = await control.count();
  if (count === 0) return null;

  const tagName = await control.evaluate((el) => (el as HTMLElement).tagName.toLowerCase());
  
  if (tagName === 'input') {
    const type = await control.getAttribute('type');
    if (type === 'checkbox') {
      return (await control.isChecked()) ? 'true' : 'false';
    }
    return await control.inputValue();
  } else if (tagName === 'select') {
    return await control.evaluate((el) => (el as HTMLSelectElement).value);
  }
  
  return await control.textContent();
}

/**
 * Set control value and wait for update
 */
export async function setControlValue(
  page: Page,
  controlId: string,
  value: string | number | boolean,
  waitTime = 500
): Promise<void> {
  const control = page.locator(`#${controlId}`);
  await expect(control).toBeVisible();

  const tagName = await control.evaluate((el) => (el as HTMLElement).tagName.toLowerCase());
  
  if (tagName === 'input') {
    const type = await control.getAttribute('type');
    if (type === 'checkbox') {
      const checked = typeof value === 'boolean' ? value : value === 'true';
      await control.setChecked(checked);
    } else {
      await control.fill(String(value));
      // Trigger input event
      await control.dispatchEvent('input');
    }
  } else if (tagName === 'select') {
    await control.selectOption(String(value));
    await control.dispatchEvent('change');
  }
  
  await page.waitForTimeout(waitTime);
}

/**
 * Verify effect function exists
 */
export async function verifyEffectFunction(
  page: Page,
  functionPath: string
): Promise<boolean> {
  return await page.evaluate((path) => {
    const parts = path.split('.');
    let obj: any = window;
    for (const part of parts) {
      if (obj && typeof obj === 'object' && part in obj) {
        obj = obj[part];
      } else {
        return false;
      }
    }
    return typeof obj === 'function';
  }, functionPath);
}

/**
 * Clear localStorage for clean tests
 */
export async function clearLocalStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
  });
}

/**
 * Get current settings bundle from localStorage
 */
export async function getSettingsBundle(page: Page, key = 'errl_portal_settings_v1'): Promise<any> {
  return await page.evaluate((storageKey) => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, key);
}

/**
 * Set settings bundle in localStorage
 */
export async function setSettingsBundle(page: Page, bundle: any, key = 'errl_portal_settings_v1'): Promise<void> {
  await page.evaluate(
    ({ storageKey, data }) => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (e) {
        console.error('Failed to set settings:', e);
      }
    },
    { storageKey: key, data: bundle }
  );
}

/**
 * Open phone panel tab
 */
export async function openPhoneTab(page: Page, tabName: string): Promise<void> {
  const tabButton = page.locator(`[data-tab="${tabName}"]`).first();
  await expect(tabButton).toBeVisible();
  await tabButton.click();
  await page.waitForTimeout(300);
  
  // Verify tab content is visible
  const tabContent = page.locator(`.panel-section[data-tab="${tabName}"]`).first();
  await expect(tabContent).toBeVisible();
}

/**
 * Ensure phone panel is open
 */
export async function ensurePhonePanelOpen(page: Page): Promise<void> {
  const panel = page.locator('#errlPanel');
  const isMinimized = await panel.evaluate((el) => 
    el.classList.contains('minimized')
  );
  
  if (isMinimized) {
    await panel.click();
    await page.waitForTimeout(300);
  }
}

/**
 * Wait for canvas to have content
 */
export async function waitForCanvasContent(
  page: Page,
  canvasId: string,
  timeout = 5000
): Promise<void> {
  await page.waitForFunction(
    (id) => {
      const canvas = document.getElementById(id) as HTMLCanvasElement | null;
      if (!canvas) return false;
      return canvas.width > 0 && canvas.height > 0;
    },
    canvasId,
    { timeout }
  );
}

/**
 * Get SVG filter node attribute
 */
export async function getFilterNodeAttribute(
  page: Page,
  nodeId: string,
  attribute: string
): Promise<string | null> {
  return await page.evaluate(
    ({ id, attr }) => {
      const node = document.getElementById(id);
      return node ? node.getAttribute(attr) : null;
    },
    { id: nodeId, attr: attribute }
  );
}

/**
 * Verify control is wired to effect
 */
export async function verifyControlWiring(
  page: Page,
  controlId: string,
  effectFunction: string
): Promise<boolean> {
  // Check if control exists
  const control = page.locator(`#${controlId}`);
  const exists = await control.count() > 0;
  if (!exists) return false;

  // Check if effect function exists
  const hasFunction = await verifyEffectFunction(page, effectFunction);
  return hasFunction;
}
