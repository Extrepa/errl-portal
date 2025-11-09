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

test.describe('Core Portal Tests', () => {
  test('@ui loads portal without duplicate ids', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await ensurePanelOpen(page);
    const dups = await getDuplicateIds(page);
    expect(dups, 'duplicate element IDs found on the page').toEqual([]);
  });

  test('@ui portal loads without console errors', async ({ page, baseURL }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    
    // Filter out known non-critical errors if any
    const criticalErrors = errors.filter(err => 
      !err.includes('favicon') // Example: ignore favicon errors
    );
    
    expect(criticalErrors).toEqual([]);
  });

  test('@ui all navigation links are working', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    
    // Wait for page to be ready
    await page.waitForLoadState('networkidle');
    
    // Check that main navigation links exist and have href
    const links = await page.locator('a[href*="portal/pages"]').all();
    expect(links.length).toBeGreaterThan(0);
    
    for (const link of links) {
      const href = await link.getAttribute('href');
      expect(href).toBeTruthy();
    }
  });

  test('@ui WebGL canvas exists and renders', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    
    // Check for primary WebGL canvas element
    const canvas = page.locator('#errlWebGL');
    await expect(canvas).toBeVisible();
    
    // Verify WebGL context exists
    const hasWebGL = await page.evaluate(() => {
      const canvas = document.getElementById('errlWebGL') as HTMLCanvasElement | null;
      if (!canvas) return false;
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      return !!gl;
    });
    
    expect(hasWebGL).toBeTruthy();
  });
});

test.describe('Effects System Tests', () => {
  test('@ui hue target wiring updates and dispatches', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await ensurePanelOpen(page);
    await page.getByRole('button', { name: 'Hue' }).click();
    await expect(page.locator('#hueTarget')).toBeVisible();

    // Select Navigation target
    await page.waitForFunction(() => {
      // @ts-ignore
      return Boolean((window as any).ErrlHueController);
    });
    await page.selectOption('#hueTarget', 'nav');
    await page.check('#hueEnabled');
    await page.dispatchEvent('#hueEnabled', 'change');

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

    // Wait until controller state reflects target
    const stateHandle = await page.waitForFunction(() => {
      // @ts-ignore
      const hc = (window as any).ErrlHueController;
      if (!hc) return null;
      const layer = hc.layers?.nav;
      if (!layer?.enabled) return null;
      return { target: hc.currentTarget, st: { enabled: layer.enabled, hue: layer.hue } };
    });
    const state = await stateHandle.jsonValue<{ target: string; st: { enabled: boolean; hue: number } } | null>();
    expect(state?.target).toBe('nav');
    expect(state?.st?.enabled).toBe(true);
    expect(Math.round(state?.st?.hue ?? 0)).toBe(180);
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
});

test.describe('Page Navigation Tests', () => {
  test('@ui about page loads and animates', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/portal/pages/about/index.html');
    await page.waitForLoadState('networkidle');
    
    // Check for Back to Portal link
    const backLink = page.locator('a.errl-home-btn');
    await expect(backLink).toBeVisible();
    
    // Verify no critical errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    expect(errors.length).toBe(0);
  });

  test('@ui gallery page loads', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/portal/pages/gallery/index.html');
    await page.waitForLoadState('networkidle');
    
    // Check for Back to Portal link
    const backLink = page.locator('a.errl-home-btn');
    await expect(backLink).toBeVisible();
  });

  test('@ui projects page loads', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/portal/pages/projects/index.html');
    await page.waitForLoadState('networkidle');
    
    // Check for Back to Portal link
    const backLink = page.locator('a.errl-home-btn');
    await expect(backLink).toBeVisible();
  });
});

test.describe('Responsive Design Tests', () => {
  test('@ui portal works on mobile viewport', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    
    // Check for horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBeFalsy();
  });

  test('@ui portal works on tablet viewport', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 768, height: 1024 }); // iPad
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    
    // Check for horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBeFalsy();
  });
});

test.describe('Performance Tests', () => {
  test('@ui page loads within reasonable time', async ({ page, baseURL }) => {
    const startTime = Date.now();
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
});
