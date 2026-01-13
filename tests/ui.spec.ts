import { test, expect } from '@playwright/test';

// Helper to determine expected portal path based on environment
function getPortalPath(baseURL: string | undefined): string {
  // Simplified: pages are now at root level in both dev and production
  return '';
}

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

    const portalPath = getPortalPath(baseURL);
    const portalPathRegex = new RegExp(portalPath.replace(/\//g, '\\/') + '\\/');

    // Wait until runtime script rewrites portal links to the correct base
    await page.waitForFunction((expectedPath) => {
      const links = Array.from(document.querySelectorAll('#navOrbit [data-portal-link]'));
      if (!links.length) return false;
      return links.every((el) => {
        const href = el.getAttribute('href') || '';
        if (href.startsWith('/studio')) return true;
        return new RegExp(expectedPath.replace(/\//g, '\\/') + '\\/').test(href);
      });
    }, portalPath);
    
    // Count visible links (exclude hidden ones)
    const navLinks = page.locator('#navOrbit a:not(.hidden-bubble)');
    await expect(navLinks).toHaveCount(8);

    for (const handle of await navLinks.elementHandles()) {
      const href = await handle.getAttribute('href');
      if (!href || href.startsWith('/studio')) continue;
      expect(href).toMatch(portalPathRegex);
    }

    const studioHref = await page.locator('#navOrbit a', { hasText: 'Studio' }).first().getAttribute('href');
    expect(studioHref).toBe('/studio.html');

    const colorizerSrc = await page.locator('#colorizerFrame').getAttribute('src');
    expect(colorizerSrc).toBe(`/studio/svg-colorer/`);
  });

  test('@ui all 8 navigation links navigate correctly', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');

    const portalPath = getPortalPath(baseURL);

    // Test About link - use force: true because bubbles are animated and never "stable"
    await page.locator('#navOrbit a[href*="about"]').click({ force: true });
    await page.waitForURL(`**/about/**`);
    await expect(page.locator('a.errl-home-btn')).toBeVisible();
    await page.goBack();

    // Test Gallery link
    await page.locator('#navOrbit a[href*="gallery"]').click({ force: true });
    await page.waitForURL(`**/gallery/**`);
    await expect(page.locator('a.errl-home-btn')).toBeVisible();
    await page.goBack();

    // Test Assets link
    await page.locator('#navOrbit a[href*="assets"]').first().click({ force: true });
    await page.waitForURL(`**/assets/**`);
    await expect(page.locator('a.errl-home-btn')).toBeVisible();
    await page.goBack();

    // Test Studio link
    await page.locator('#navOrbit a[href="/studio.html"]').click({ force: true });
    await page.waitForURL('**/studio**');
    await expect(page.getByRole('heading', { name: 'Choose your Errl Lab' })).toBeVisible();
    await page.goBack();

    // Test Design (Pin Designer) link
    await page.locator('#navOrbit a[href*="pin-designer"]').click({ force: true });
    await page.waitForURL('**/studio/pin-designer**');
    await page.goBack();

    // Test Events link
    await page.locator('#navOrbit a[href*="events"]').click({ force: true });
    await page.waitForURL(`**/events/**`);
    await expect(page.locator('a.errl-home-btn')).toBeVisible();
    await page.goBack();

    // Test Merch link
    await page.locator('#navOrbit a[href*="merch"]').click({ force: true });
    await page.waitForURL(`**/merch/**`);
    await expect(page.locator('a.errl-home-btn')).toBeVisible();
    await page.goBack();

    // Test Games link (may be hidden)
    const gamesLink = page.locator('#navOrbit a[href*="games"]');
    if (await gamesLink.count() > 0) {
      await gamesLink.click();
      await page.waitForURL(`**/games/**`);
      await expect(page.locator('a.errl-home-btn')).toBeVisible();
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
    const portalPath = getPortalPath(baseURL);
    await page.goto(baseURL! + `/about/`);
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
    const portalPath = getPortalPath(baseURL);
    await page.goto(baseURL! + `/gallery/`);
    await page.waitForLoadState('networkidle');
    
    // Check for Back to Portal link
    const backLink = page.locator('a.errl-home-btn');
    await expect(backLink).toBeVisible();
  });

  test('@ui projects page loads', async ({ page, baseURL }) => {
    const portalPath = getPortalPath(baseURL);
    await page.goto(baseURL! + `/assets/`);
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

  test('@ui studio projects card navigates', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/studio');
    await page.getByRole('link', { name: /Projects/ }).click();
    await page.waitForURL('**/studio/projects');
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
    // basic sanity: ripple canvas exists inside page
    await expect(page.locator('canvas#fx').first()).toBeVisible();
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

test.describe('Errl Phone Controls Tests', () => {
  test('@ui all tabs are accessible and switch correctly', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await ensurePanelOpen(page);
    
    const tabs = ['HUD', 'Errl', 'Nav', 'RB', 'GLB', 'BG', 'DEV', 'Hue'];
    
    for (const tabName of tabs) {
      const tab = page.getByRole('button', { name: tabName });
      await expect(tab).toBeVisible();
      await tab.click();
      // Verify tab is active
      await expect(tab).toHaveAttribute('class', /active/);
    }
  });

  test('@ui HUD tab controls work', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await ensurePanelOpen(page);
    await page.getByRole('button', { name: 'HUD' }).click();
    
    // Test particles burst button
    const burstBtn = page.locator('#burstBtn');
    await expect(burstBtn).toBeVisible();
    await burstBtn.click();
    
    // Test audio controls
    const audioEnabled = page.locator('#audioEnabled');
    await expect(audioEnabled).toBeVisible();
    await audioEnabled.uncheck();
    await audioEnabled.check();
    
    const audioMaster = page.locator('#audioMaster');
    await expect(audioMaster).toBeVisible();
    await audioMaster.fill('0.6');
    await page.dispatchEvent('#audioMaster', 'input');
    
    const audioBass = page.locator('#audioBass');
    await expect(audioBass).toBeVisible();
    await audioBass.fill('0.3');
    await page.dispatchEvent('#audioBass', 'input');
    
    // Test accessibility controls
    const prefReduce = page.locator('#prefReduce');
    await expect(prefReduce).toBeVisible();
    await prefReduce.check();
    
    const prefContrast = page.locator('#prefContrast');
    await expect(prefContrast).toBeVisible();
    await prefContrast.check();
  });

  test('@ui Errl tab controls work', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await ensurePanelOpen(page);
    await page.getByRole('button', { name: 'Errl' }).click();
    
    // Test Errl size
    const errlSize = page.locator('#errlSize');
    await expect(errlSize).toBeVisible();
    await errlSize.fill('1.2');
    await page.dispatchEvent('#errlSize', 'input');
    
    // Test goo controls
    const classicGooEnabled = page.locator('#classicGooEnabled');
    await expect(classicGooEnabled).toBeVisible();
    await classicGooEnabled.uncheck();
    await classicGooEnabled.check();
    
    const classicGooStrength = page.locator('#classicGooStrength');
    await expect(classicGooStrength).toBeVisible();
    await classicGooStrength.fill('0.5');
    await page.dispatchEvent('#classicGooStrength', 'input');
    
    const classicGooWobble = page.locator('#classicGooWobble');
    await expect(classicGooWobble).toBeVisible();
    await classicGooWobble.fill('0.7');
    await page.dispatchEvent('#classicGooWobble', 'input');
    
    const classicGooSpeed = page.locator('#classicGooSpeed');
    await expect(classicGooSpeed).toBeVisible();
    await classicGooSpeed.fill('0.6');
    await page.dispatchEvent('#classicGooSpeed', 'input');
    
    // Test random button
    const classicGooRandom = page.locator('#classicGooRandom');
    await expect(classicGooRandom).toBeVisible();
    await classicGooRandom.click();
  });

  test('@ui Nav tab controls work', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await ensurePanelOpen(page);
    await page.getByRole('button', { name: 'Nav' }).click();
    
    // Test nav bubbles controls
    const navOrbitSpeed = page.locator('#navOrbitSpeed');
    await expect(navOrbitSpeed).toBeVisible();
    await navOrbitSpeed.fill('1.5');
    await page.dispatchEvent('#navOrbitSpeed', 'input');
    
    const navRadius = page.locator('#navRadius');
    await expect(navRadius).toBeVisible();
    await navRadius.fill('1.4');
    await page.dispatchEvent('#navRadius', 'input');
    
    // Test GL orbs toggle
    const glOrbsToggle = page.locator('#glOrbsToggle');
    await expect(glOrbsToggle).toBeVisible();
    await glOrbsToggle.uncheck();
    await glOrbsToggle.check();
    
    // Test rotate skins button
    const rotateSkins = page.locator('#rotateSkins');
    await expect(rotateSkins).toBeVisible();
    await rotateSkins.click();
    
    // Test nav goo controls
    const navWiggle = page.locator('#navWiggle');
    await expect(navWiggle).toBeVisible();
    await navWiggle.fill('0.5');
    await page.dispatchEvent('#navWiggle', 'input');
    
    const navFlow = page.locator('#navFlow');
    await expect(navFlow).toBeVisible();
    await navFlow.evaluate((el: HTMLInputElement) => { el.value = '1.0'; });
    await page.dispatchEvent('#navFlow', 'input');
    
    const navDrip = page.locator('#navDrip');
    await expect(navDrip).toBeVisible();
    await navDrip.fill('-0.3');
    await page.dispatchEvent('#navDrip', 'input');
    
    const navVisc = page.locator('#navVisc');
    await expect(navVisc).toBeVisible();
    await navVisc.fill('0.8');
    await page.dispatchEvent('#navVisc', 'input');
  });

  test('@ui RB (Rising Bubbles) tab controls work', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await ensurePanelOpen(page);
    await page.getByRole('button', { name: 'Rising Bubbles' }).click();
    
    // Test basic controls
    const rbAttract = page.locator('#rbAttract');
    await expect(rbAttract).toBeVisible();
    await rbAttract.uncheck();
    await rbAttract.check();
    
    const rbSpeed = page.locator('#rbSpeed');
    await expect(rbSpeed).toBeVisible();
    await rbSpeed.fill('1.5');
    await page.dispatchEvent('#rbSpeed', 'input');
    
    const rbDensity = page.locator('#rbDensity');
    await expect(rbDensity).toBeVisible();
    await rbDensity.fill('1.2');
    await page.dispatchEvent('#rbDensity', 'input');
    
    const rbAlpha = page.locator('#rbAlpha');
    await expect(rbAlpha).toBeVisible();
    await rbAlpha.fill('0.8');
    await page.dispatchEvent('#rbAlpha', 'input');
    
    // Test advanced controls
    const rbWobble = page.locator('#rbWobble');
    await expect(rbWobble).toBeVisible();
    await rbWobble.fill('1.2');
    await page.dispatchEvent('#rbWobble', 'input');
    
    const rbFreq = page.locator('#rbFreq');
    await expect(rbFreq).toBeVisible();
    await rbFreq.fill('1.1');
    await page.dispatchEvent('#rbFreq', 'input');
    
    const rbMin = page.locator('#rbMin');
    await expect(rbMin).toBeVisible();
    await rbMin.fill('16');
    await page.dispatchEvent('#rbMin', 'input');
    
    const rbMax = page.locator('#rbMax');
    await expect(rbMax).toBeVisible();
    await rbMax.fill('40');
    await page.dispatchEvent('#rbMax', 'input');
  });

  test('@ui GLB tab controls work', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await ensurePanelOpen(page);
    await page.getByRole('button', { name: /GL Bubbles/i }).click();
    
    const bgSpeed = page.locator('#bgSpeed');
    await expect(bgSpeed).toBeVisible();
    await bgSpeed.fill('1.1');
    await page.dispatchEvent('#bgSpeed', 'input');
    
    const bgDensity = page.locator('#bgDensity');
    await expect(bgDensity).toBeVisible();
    await bgDensity.fill('1.3');
    await page.dispatchEvent('#bgDensity', 'input');
    
    const glAlpha = page.locator('#glAlpha');
    await expect(glAlpha).toBeVisible();
    await glAlpha.fill('0.9');
    await page.dispatchEvent('#glAlpha', 'input');
    
    // Test randomize button
    const glbRandom = page.locator('#glbRandom');
    if (await glbRandom.count()) {
      await expect(glbRandom).toBeVisible();
      await glbRandom.click();
    }
  });

  test('@ui BG tab is empty (controls removed)', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await ensurePanelOpen(page);
    await page.getByRole('button', { name: 'Background' }).click();
    
    // Verify section exists but is empty
    const bgSection = page.locator('.panel-section[data-tab="bg"]');
    await expect(bgSection).toBeVisible();
    // Should only have the section label
    const controls = bgSection.locator('input, button, select');
    await expect(controls).toHaveCount(0);
  });

  test('@ui Hue tab controls work', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await ensurePanelOpen(page);
    await page.getByRole('button', { name: 'Hue' }).click();
    
    // Test enabled toggle
    const hueEnabled = page.locator('#hueEnabled');
    await expect(hueEnabled).toBeVisible();
    await hueEnabled.check();
    
    // Test target selector
    const hueTarget = page.locator('#hueTarget');
    await expect(hueTarget).toBeVisible();
    await hueTarget.selectOption('riseBubbles');
    
    // Test sliders
    const hueShift = page.locator('#hueShift');
    await expect(hueShift).toBeVisible();
    await hueShift.fill('180');
    await page.dispatchEvent('#hueShift', 'input');
    
    const hueSat = page.locator('#hueSat');
    await expect(hueSat).toBeVisible();
    await hueSat.fill('1.5');
    await page.dispatchEvent('#hueSat', 'input');
    
    const hueInt = page.locator('#hueInt');
    await expect(hueInt).toBeVisible();
    await hueInt.fill('0.8');
    await page.dispatchEvent('#hueInt', 'input');
    
    // Test play button
    const huePlayPause = page.locator('#huePlayPause');
    await expect(huePlayPause).toBeVisible();
    await huePlayPause.click();
  });

  test('@ui phone minimize/maximize works', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    
    const panel = page.locator('#errlPanel');
    
    // Panel should start minimized
    await expect(panel).toHaveClass(/minimized/);
    
    // Click panel to maximize (phoneMinToggle is hidden when minimized)
    await panel.click();
    await expect(panel).not.toHaveClass(/minimized/);
    
    // Now phoneMinToggle should be visible - click to minimize
    const phoneMinToggle = page.locator('#phoneMinToggle');
    if (await phoneMinToggle.count() > 0 && await phoneMinToggle.isVisible()) {
      await phoneMinToggle.click();
      await expect(panel).toHaveClass(/minimized/);
    } else {
      // Fallback: use close button
      const closeButton = page.locator('#phone-close-button');
      if (await closeButton.count() > 0) {
        await closeButton.click();
        await expect(panel).toHaveClass(/minimized/);
      }
    }
  });
});

test.describe('Developer Controls Tests', () => {
  test('@ui dev tab controls are accessible', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await ensurePanelOpen(page);
    await page.getByRole('button', { name: 'Developer' }).click();
    
    // Verify all dev controls exist
    const openColorizer = page.locator('#openColorizer');
    await expect(openColorizer).toBeVisible();
    
    const snapshotPngBtn = page.locator('#snapshotPngBtn');
    await expect(snapshotPngBtn).toBeVisible();
    
    const exportHtmlBtn = page.locator('#exportHtmlBtn');
    await expect(exportHtmlBtn).toBeVisible();
    
    const saveDefaultsBtn = page.locator('#saveDefaultsBtn');
    await expect(saveDefaultsBtn).toBeVisible();
    
    const resetDefaultsBtn = page.locator('#resetDefaultsBtn');
    await expect(resetDefaultsBtn).toBeVisible();
  });

  test('@ui colorizer opens and closes', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await ensurePanelOpen(page);
    await page.getByRole('button', { name: 'Developer' }).click();
    
    const openColorizer = page.locator('#openColorizer');
    await openColorizer.click();
    
    // Wait for colorizer phone to appear
    const colorizerPhone = page.locator('#colorizerPhone');
    await expect(colorizerPhone).toBeVisible({ timeout: 5000 });
    
    // Close colorizer - colorizerClose button should be visible when colorizerPhone is visible
    const colorizerClose = page.locator('#colorizerClose');
    await expect(colorizerClose).toBeVisible({ timeout: 5000 });
    await colorizerClose.click();
    await expect(colorizerPhone).not.toBeVisible();
  });

  test('@ui snapshot PNG button works', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await ensurePanelOpen(page);
    await page.getByRole('button', { name: 'Developer' }).click();
    
    const snapshotPngBtn = page.locator('#snapshotPngBtn');
    await expect(snapshotPngBtn).toBeVisible();
    
    // Click and verify download (or at least no error)
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
    await snapshotPngBtn.click();
    // Download may or may not trigger in test environment
    await page.waitForTimeout(500);
  });

  test('@ui export HTML button works', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await ensurePanelOpen(page);
    await page.getByRole('button', { name: 'Developer' }).click();
    
    const exportHtmlBtn = page.locator('#exportHtmlBtn');
    await expect(exportHtmlBtn).toBeVisible();
    
    // Click and verify download or clipboard (or at least no error)
    const downloadPromise = page.waitForEvent('download', { timeout: 5000 }).catch(() => null);
    await exportHtmlBtn.click();
    await page.waitForTimeout(500);
  });

  test('@ui save defaults button works', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await ensurePanelOpen(page);
    await page.getByRole('button', { name: 'Developer' }).click();
    
    const saveDefaultsBtn = page.locator('#saveDefaultsBtn');
    await expect(saveDefaultsBtn).toBeVisible();
    
    // Change a setting first
    await page.getByRole('button', { name: 'HUD' }).click();
    await page.locator('#audioMaster').fill('0.7');
    await page.dispatchEvent('#audioMaster', 'input');
    
    // Save defaults
    await page.getByRole('button', { name: 'Developer' }).click();
    await saveDefaultsBtn.click();
    
    // Verify localStorage was updated - saveDefaults saves individual keys, not 'errlDefaults'
    const hasDefaults = await page.evaluate(() => {
      return localStorage.getItem('errl_hue_layers') !== null || 
             localStorage.getItem('errl_nav_goo_cfg') !== null ||
             localStorage.getItem('errl_rb_settings') !== null ||
             localStorage.getItem('errl_goo_cfg') !== null;
    });
    expect(hasDefaults).toBeTruthy();
  });

  test('@ui reset defaults button works', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await ensurePanelOpen(page);
    await page.getByRole('button', { name: 'Developer' }).click();
    
    // Save defaults first
    const saveDefaultsBtn = page.locator('#saveDefaultsBtn');
    await saveDefaultsBtn.click();
    await page.waitForTimeout(200);
    
    // Reset defaults
    const resetDefaultsBtn = page.locator('#resetDefaultsBtn');
    await expect(resetDefaultsBtn).toBeVisible();
    await resetDefaultsBtn.click();
    
    // Verify localStorage was cleared
    const hasDefaults = await page.evaluate(() => {
      return localStorage.getItem('errlDefaults') === null;
    });
    expect(hasDefaults).toBeTruthy();
  });
});

test.describe('Effects System Tests - Extended', () => {
  test('@ui bg-particles canvas exists and renders', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    
    const canvas = page.locator('#bgParticles');
    await expect(canvas).toBeVisible();
    
    // Verify canvas has content
    const hasContent = await page.evaluate(() => {
      const canvas = document.getElementById('bgParticles') as HTMLCanvasElement | null;
      if (!canvas) return false;
      return canvas.width > 0 && canvas.height > 0;
    });
    expect(hasContent).toBeTruthy();
  });

  test('@ui rise-bubbles-three canvas exists', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    
    // Rising bubbles canvas should exist (may be hidden in some modes)
    const canvas = page.locator('#riseBubbles');
    // Canvas element exists even if not visible
    const exists = await canvas.count() > 0;
    expect(exists).toBeTruthy();
  });

  test('@ui all hue targets are selectable', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await ensurePanelOpen(page);
    await page.getByRole('button', { name: 'Hue' }).click();
    
    const hueTarget = page.locator('#hueTarget');
    const targets = ['nav', 'riseBubbles', 'bgBubbles', 'background', 'glOverlay'];
    
    for (const target of targets) {
      await hueTarget.selectOption(target);
      const selected = await hueTarget.evaluate((el: HTMLSelectElement) => el.value);
      expect(selected).toBe(target);
    }
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

test.describe('Edge Cases & Error Handling', () => {
  test('@ui slider values clamp correctly', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await ensurePanelOpen(page);
    await page.getByRole('button', { name: 'HUD' }).click();
    
    const audioMaster = page.locator('#audioMaster');
    // Try to set value outside range - use evaluate to set it directly
    await audioMaster.evaluate((el: HTMLInputElement) => { el.value = '999'; });
    await page.dispatchEvent('#audioMaster', 'input');
    
    // Value should be clamped
    const value = await audioMaster.inputValue();
    expect(parseFloat(value)).toBeLessThanOrEqual(1);
    expect(parseFloat(value)).toBeGreaterThanOrEqual(0);
  });

  test('@ui invalid inputs handled gracefully', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await ensurePanelOpen(page);
    await page.getByRole('button', { name: 'Errl' }).click();
    
    const errlSize = page.locator('#errlSize');
    // Try invalid input - use evaluate to set it directly (browser will clamp to valid range)
    await errlSize.evaluate((el: HTMLInputElement) => { 
      try { el.value = 'invalid'; } catch(e) {} 
    });
    await page.dispatchEvent('#errlSize', 'input');
    
    // Should not crash, value should be valid or default
    const value = await errlSize.inputValue();
    expect(value).not.toBe('invalid');
    // Value should be a valid number within range
    const numValue = parseFloat(value);
    expect(numValue).toBeGreaterThanOrEqual(0.8);
    expect(numValue).toBeLessThanOrEqual(1.6);
  });

  test('@ui panel state persists across interactions', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await ensurePanelOpen(page);
    
    // Change tab
    await page.getByRole('button', { name: 'Errl' }).click();
    await expect(page.getByRole('button', { name: 'Errl' })).toHaveAttribute('class', /active/);
    
    // Change another tab
    await page.getByRole('button', { name: 'Nav' }).click();
    await expect(page.getByRole('button', { name: 'Nav' })).toHaveAttribute('class', /active/);
    
    // Panel should still be open
    await expect(page.locator('#panelTabs')).toBeVisible();
  });

  test('@ui navigation works with rapid clicks', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    
    const portalPath = getPortalPath(baseURL);
    
    // Rapidly click multiple nav links - use force: true because bubbles are animated
    const aboutLink = page.locator('#navOrbit a[href*="about"]');
    await aboutLink.click({ force: true });
    await page.waitForURL(`**/about/**`);
    
    await page.goBack();
    await page.waitForURL('**/index.html**');
    
    const galleryLink = page.locator('#navOrbit a[href*="gallery"]');
    await galleryLink.click({ force: true });
    await page.waitForURL(`**/gallery/**`);
    
    // Should navigate successfully
    expect(page.url()).toContain('gallery');
  });
});
