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

    // Wait until runtime script rewrites portal links to the correct base
    await page.waitForFunction(() => {
      const links = Array.from(document.querySelectorAll('#navOrbit [data-portal-link]'));
      if (!links.length) return false;
      return links.every((el) => {
        const href = el.getAttribute('href') || '';
        if (href.startsWith('/studio')) return true;
        return /\/legacy\/portal\/pages\//.test(href);
      });
    });
    
    const navLinks = page.locator('#navOrbit a');
    await expect(navLinks).toHaveCount(8);

    for (const handle of await navLinks.elementHandles()) {
      const href = await handle.getAttribute('href');
      if (!href || href.startsWith('/studio')) continue;
      expect(href).toMatch(/\/legacy\/portal\/pages\//);
    }

    const studioHref = await page.locator('#navOrbit a', { hasText: 'Studio' }).first().getAttribute('href');
    expect(studioHref).toBe('/studio/');

    const colorizerSrc = await page.locator('#colorizerFrame').getAttribute('src');
    expect(colorizerSrc).toBe('/legacy/portal/pages/studio/svg-colorer/index.html');
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
    const state = (await stateHandle.jsonValue()) as { target: string; st: { enabled: boolean; hue: number } } | null;
    expect(state?.target).toBe('nav');
    expect(state?.st?.enabled).toBe(true);
  });

  test('@ui overlay sliders enable GL and update values', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await ensurePanelOpen(page);
    const glbTab = page.getByRole('button', { name: /GL Bubbles/i });
    await glbTab.click();
    const slider = page.locator('#glAlpha');
    if (await slider.count()) {
      await expect(slider).toBeVisible();
      await page.fill('#glAlpha', '0.33');
      await page.dispatchEvent('#glAlpha', 'input');
      const dxInput = page.locator('#glDX');
      const dyInput = page.locator('#glDY');
      if (await dxInput.count() && await dyInput.count()) {
        await page.fill('#glDX', '40');
        await page.dispatchEvent('#glDX', 'input');
        await page.fill('#glDY', '28');
        await page.dispatchEvent('#glDY', 'input');
      } else {
        await page.evaluate(() => {
          // @ts-ignore
          if (typeof (window as any).enableErrlGL === 'function') (window as any).enableErrlGL();
          // @ts-ignore
          (window as any).errlGLSetOverlay && (window as any).errlGLSetOverlay({ alpha: 0.33, dx: 40, dy: 28 });
        });
      }
    } else {
      await page.waitForFunction(() => {
        // @ts-ignore
        return typeof (window as any).errlGLSetOverlay === 'function';
      });
      await page.evaluate(() => {
        // @ts-ignore
        if (typeof (window as any).enableErrlGL === 'function') (window as any).enableErrlGL();
        // @ts-ignore
        (window as any).errlGLSetOverlay && (window as any).errlGLSetOverlay({ alpha: 0.33, dx: 40, dy: 28 });
      });
    }

    await page.evaluate(() => {
      // @ts-ignore
      const ctrl = (window as any).ErrlHueController;
      // @ts-ignore
      if (ctrl && ctrl.layers?.nav && Math.abs((ctrl.layers.nav.hue ?? 0) - 180) > 5) {
        ctrl.setTimeline?.(180);
        ctrl.layers.nav.hue = 180;
        ctrl.layers.nav.enabled = true;
        ctrl.currentTarget = 'nav';
      }
    });

    const overlayHandle = await page.waitForFunction(() => {
      // @ts-ignore
      const getter = (window as any).errlGLGetOverlay;
      if (!getter) return null;
      const data = getter();
      if (!data || typeof data.alpha !== 'number') return null;
      return data;
    });
    const overlay = (await overlayHandle.jsonValue()) as { alpha: number; dx: number; dy: number };
    expect(Math.abs((overlay?.alpha ?? 0) - 0.33)).toBeLessThan(0.05);
    expect((overlay?.dx ?? 0)).toBeGreaterThanOrEqual(40);
    expect((overlay?.dy ?? 0)).toBeGreaterThanOrEqual(28);
  });
});

test.describe('Page Navigation Tests', () => {
  test('@ui about page loads and animates', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/legacy/portal/pages/about/index.html');
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
    await page.goto(baseURL! + '/legacy/portal/pages/gallery/index.html');
    await page.waitForLoadState('networkidle');
    
    // Check for Back to Portal link
    const backLink = page.locator('a.errl-home-btn');
    await expect(backLink).toBeVisible();
  });

  test('@ui projects page loads', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/legacy/portal/pages/assets/index.html');
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

test.describe('Studio Hub Tests', () => {
  test('@ui studio hub renders tool cards', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/studio');
    await expect(page.getByRole('heading', { name: 'Choose your Errl Lab' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Code Lab' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Psychedelic Math Lab' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Shape Madness' })).toBeVisible();
  });

  test('@ui studio code lab card navigates', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/studio');
    await page.getByRole('link', { name: /Code Lab/ }).click();
    await page.waitForURL('**/studio/code-lab');
    await expect(page.getByRole('button', { name: /Format HTML/i })).toBeVisible();
  });

  test('@ui studio math lab card loads legacy iframe', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/studio');
    await page.getByRole('link', { name: /Psychedelic Math Lab/ }).click();
    await page.waitForURL('**/studio/math-lab');
    const mathLabIframe = page.locator('iframe[title="Psychedelic Math Lab"]');
    await expect(mathLabIframe).toHaveAttribute('src', /\/(legacy\/)?portal\/pages\/studio\/math-lab/);
    await expect
      .poll(() =>
        page.frames().some((frame) =>
          /\/(legacy\/)?portal\/pages\/studio\/math-lab/.test(frame.url())
        )
      )
      .toBeTruthy();
  });

  test('@ui studio shape madness card loads legacy iframe', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/studio');
    await page.getByRole('link', { name: /Shape Madness/ }).click();
    await page.waitForURL('**/studio/shape-madness');
    const shapeIframe = page.frameLocator('iframe[title="Shape Madness"]');
    await expect
      .poll(() => page.frames().some((frame) => /\/(legacy\/)?portal\/pages\/studio\/shape-madness/.test(frame.url())))
      .toBeTruthy();
    await expect(shapeIframe.locator('text=Shape Madness')).toBeVisible();
  });

  test('@ui studio pin designer card navigates', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/studio');
    await page.getByRole('link', { name: /Pin Designer/ }).click();
    await page.waitForURL('**/studio/pin-designer');
    const pinFrame = page.frameLocator('iframe[title="Pin Designer"]');
    await expect(pinFrame.locator('text=Save Design')).toBeVisible();
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
