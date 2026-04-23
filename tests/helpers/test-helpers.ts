/**
 * Test Helper Functions
 * Reusable utilities for Playwright tests
 */

import { Page, expect } from '@playwright/test';

/** Use instead of `page.waitForTimeout` (deprecated in Playwright). */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
  return page.evaluate(
    (id) => {
      const el = document.getElementById(String(id)) as HTMLInputElement | HTMLSelectElement | null;
      if (!el) return null;
      const t = (el as HTMLElement).tagName.toLowerCase();
      if (t === 'input') {
        const i = el as HTMLInputElement;
        if (i.type === 'checkbox') return i.checked ? 'true' : 'false';
        return i.value;
      }
      if (t === 'select') return (el as HTMLSelectElement).value;
      return (el as HTMLElement).textContent;
    },
    controlId
  );
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
  const str = String(value);
  // Use a single in-page read/write. Locator + evaluate on animated panels can hit Playwright
  // “stable” timeouts; getElementById is synchronous in the same tick as the handler.
  const ok = await page.evaluate(
    ({ id, val, boolish }) => {
      const el = document.getElementById(String(id)) as HTMLInputElement | HTMLSelectElement | null;
      if (!el) return false;
      (el as HTMLElement).scrollIntoView({ block: 'center', inline: 'nearest' });
      const t = (el as HTMLElement).tagName.toLowerCase();
      if (t === 'input') {
        const i = el as HTMLInputElement;
        if (i.type === 'checkbox') {
          const c = boolish;
          i.checked = c;
          i.dispatchEvent(new Event('input', { bubbles: true }));
          i.dispatchEvent(new Event('change', { bubbles: true }));
        } else if (i.type === 'range') {
          i.value = val;
          i.dispatchEvent(new Event('input', { bubbles: true }));
        } else {
          i.value = val;
          i.dispatchEvent(new Event('input', { bubbles: true }));
        }
      } else if (t === 'select') {
        (el as HTMLSelectElement).value = val;
        el.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        return false;
      }
      return true;
    },
    {
      id: controlId,
      val: str,
      boolish: typeof value === 'boolean' ? value : str === 'true' || str === 'on',
    }
  );
  if (!ok) {
    throw new Error(`setControlValue: #${controlId} not found`);
  }
  await sleep(waitTime);
}

/**
 * Get Pin Designer iframe content frame
 * Pin Designer is loaded in an iframe at /pin-designer/
 */
export async function getPinDesignerFrame(page: Page, baseURL?: string): Promise<import('@playwright/test').Frame> {
  if (!page.url().includes('pin-designer')) {
    await page.goto((baseURL || '') + '/pin-designer/');
    await page.waitForLoadState('networkidle');
  }
  
  const iframe = page.locator('iframe[src*="pin-designer.html"]');
  await expect(iframe).toBeVisible({ timeout: 10000 });
  const iframeContent = await iframe.contentFrame();
  if (!iframeContent) {
    throw new Error('Pin designer iframe not found');
  }
  
  // Wait for SVG inside iframe
  await iframeContent.waitForSelector('#pinSVG', { timeout: 10000 });
  await sleep(1000); // Wait for initialization

  return iframeContent;
}

/**
 * Verify effect function exists
 */
export async function verifyEffectFunction(
  page: Page,
  functionPath: string
): Promise<boolean> {
  const [ok] = await verifyEffectFunctionPaths(page, [functionPath]);
  return ok;
}

/** Batched: one page.evaluate to avoid stalling a busy main thread (RB / Three) with many round-trips. */
export async function verifyEffectFunctionPaths(
  page: Page,
  paths: string[]
): Promise<boolean[]> {
  return page.evaluate(
    (pathList) => {
      return pathList.map((functionPath) => {
        const parts = functionPath.split('.');
        let obj: any = window;
        for (const part of parts) {
          if (obj && typeof obj === 'object' && part in obj) {
            obj = obj[part];
          } else {
            return false;
          }
        }
        return typeof obj === 'function';
      });
    },
    paths
  );
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
  const tabButton = page
    .locator(`#errlPanel .panel-tabs [data-tab="${tabName}"]`)
    .first();
  await expect(tabButton).toBeAttached();
  await tabButton.click({ force: true, timeout: 10_000 });
  await sleep(200);

  const tabContent = page
    .locator(`#errlPanel .panel-content-wrapper .panel-section[data-tab="${tabName}"]`)
    .first();
  await expect(tabContent).toBeAttached();
}

/**
 * Ensure phone panel is open
 */
export async function ensurePhonePanelOpen(page: Page): Promise<void> {
  const panel = page.locator('#errlPanel');
  const isMinimized = await panel.evaluate((el) => el.classList.contains('minimized'));
  if (!isMinimized) return;
  // Do not use a real “bubble click” to restore: `restorePanel()` defers `activateTab('hud')` in a
  // setTimeout(0) and that can run after a test’s `openPhoneTab('rb')`, clobbering the active tab.
  // Synchronously un-minimize and run the same display/tab toggling the app uses (HUD default).
  await page.evaluate(() => {
    const p = document.getElementById('errlPanel');
    if (!p) return;
    p.classList.remove('minimized');
    p.setAttribute('aria-expanded', 'true');
    const headerEl = p.querySelector<HTMLElement>('.panel-header');
    const tabsEl = p.querySelector<HTMLElement>('.panel-tabs');
    if (headerEl) headerEl.style.display = '';
    if (tabsEl) tabsEl.style.display = '';
    const key = 'hud';
    p.querySelectorAll<HTMLButtonElement>('.panel-tabs .tab').forEach((btn) => {
      const on = btn.getAttribute('data-tab') === key;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    p.querySelectorAll<HTMLElement>('.panel-section').forEach((sec) => {
      const on = sec.getAttribute('data-tab') === key;
      sec.style.display = on ? 'block' : 'none';
    });
  });
  await sleep(100);
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
