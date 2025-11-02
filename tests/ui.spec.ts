import { test, expect } from '@playwright/test';

// Helper in page to collect duplicate IDs
async function getDuplicateIds(page) {
  return await page.evaluate(() => {
    const ids = Array.from(document.querySelectorAll('[id]')).map(e => e.id);
    const seen = new Set();
    const dups = new Set();
    for (const id of ids) {
      if (seen.has(id)) dups.add(id); else seen.add(id);
    }
    return Array.from(dups);
  });
}

async function ensurePanelOpen(page){
  await page.evaluate(() => {
    const p = document.getElementById('errlPanel');
    if (p && p.classList.contains('minimized')) p.click();
  });
  await expect(page.locator('#panelTabs')).toBeVisible();
}

test('@ui loads portal without duplicate ids', async ({ page, baseURL }) => {
  await page.goto(baseURL! + '/index.html');
  await ensurePanelOpen(page);
  const dups = await getDuplicateIds(page);
  expect(dups, 'duplicate element IDs found on the page').toEqual([]);
});

test('@ui hue target wiring updates and dispatches', async ({ page, baseURL }) => {
  await page.goto(baseURL! + '/index.html');
  await ensurePanelOpen(page);
  await page.getByRole('button', { name: 'Hue' }).click();
  await expect(page.locator('#hueTarget')).toBeVisible();

  // Select Navigation target
  await page.selectOption('#hueTarget', 'nav');
  await page.check('#hueEnabled');

  // Listen for one update event
  const gotEvent = page.evaluate(() => new Promise<boolean>((resolve) => {
    const handler = (e) => {
      try { resolve(!!e.detail && e.detail.layer === 'nav'); } catch { resolve(false); }
      document.removeEventListener('hueUpdate', handler);
    };
    document.addEventListener('hueUpdate', handler, { once: true });
  }));

  // Change hue slider
  await page.fill('#hueShift', '180');
  await page.dispatchEvent('#hueShift', 'input');

  await expect(gotEvent).resolves.toBeTruthy();

  // Verify controller state reflects target
  const state = await page.evaluate(() => {
    // @ts-ignore
    const hc = (window as any).ErrlHueController;
    return hc ? { target: hc.currentTarget, st: hc.layers['nav'] } : null;
  });
  expect(state?.target).toBe('nav');
  expect(state?.st?.enabled).toBe(true);
});

test('@ui overlay sliders enable GL and update values', async ({ page, baseURL }) => {
  await page.goto(baseURL! + '/index.html');
  await ensurePanelOpen(page);
  await page.getByRole('button', { name: 'Background' }).click();
  await expect(page.locator('#glAlpha')).toBeVisible();

  // Move sliders
  await page.fill('#glAlpha', '0.33');
  await page.dispatchEvent('#glAlpha', 'input');
  await page.fill('#glDX', '40');
  await page.dispatchEvent('#glDX', 'input');
  await page.fill('#glDY', '28');
  await page.dispatchEvent('#glDY', 'input');

  // Read overlay via exposed getter
  const overlay = await page.evaluate(() => {
    // @ts-ignore
    const g = (window as any).errlGLGetOverlay; return g ? g() : null;
  });
  expect(overlay).toBeTruthy();
  expect(Math.abs(overlay.alpha - 0.33)).toBeLessThan(0.02);
  expect(overlay.dx).toBeGreaterThanOrEqual(40);
  expect(overlay.dy).toBeGreaterThanOrEqual(28);
});
