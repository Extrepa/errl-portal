import { test, expect } from '@playwright/test';

test.describe('Effects Systems Tests', () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
  });

  test('@ui bg-particles canvas initializes and renders', async ({ page }) => {
    const canvas = page.locator('#bgParticles');
    await expect(canvas).toBeVisible();
    
    // Verify canvas has content
    const hasContent = await page.evaluate(() => {
      const canvas = document.getElementById('bgParticles') as HTMLCanvasElement | null;
      if (!canvas) return false;
      return canvas.width > 0 && canvas.height > 0;
    });
    expect(hasContent).toBeTruthy();
    
    // Verify particles are animating (canvas content changes)
    const initialData = await canvas.screenshot();
    await page.waitForTimeout(100);
    const laterData = await canvas.screenshot();
    // Canvas should have changed (particles moving)
    expect(initialData).not.toEqual(laterData);
  });

  test('@ui bg-particles responds to burst button', async ({ page }) => {
    // Open panel and click burst
    await page.evaluate(() => {
      const p = document.getElementById('errlPanel');
      if (p && p.classList.contains('minimized')) p.click();
    });
    await page.getByRole('button', { name: 'HUD' }).click();
    
    const burstBtn = page.locator('#burstBtn');
    await expect(burstBtn).toBeVisible();
    
    // Get initial particle state
    const canvas = page.locator('#bgParticles');
    const beforeBurst = await canvas.screenshot();
    
    // Click burst
    await burstBtn.click();
    await page.waitForTimeout(200);
    
    // Canvas should show burst effect
    const afterBurst = await canvas.screenshot();
    expect(beforeBurst).not.toEqual(afterBurst);
  });

  test('@ui rise-bubbles-three canvas exists and initializes', async ({ page }) => {
    const canvas = page.locator('#riseBubbles');
    const exists = await canvas.count() > 0;
    expect(exists).toBeTruthy();
    
    // Verify canvas dimensions
    const hasDimensions = await page.evaluate(() => {
      const canvas = document.getElementById('riseBubbles') as HTMLCanvasElement | null;
      if (!canvas) return false;
      return canvas.width > 0 && canvas.height > 0;
    });
    expect(hasDimensions).toBeTruthy();
  });

  test('@ui WebGL canvas initializes correctly', async ({ page }) => {
    const canvas = page.locator('#errlWebGL');
    await expect(canvas).toBeVisible();
    
    // Verify WebGL context
    const hasWebGL = await page.evaluate(() => {
      const canvas = document.getElementById('errlWebGL') as HTMLCanvasElement | null;
      if (!canvas) return false;
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      return !!gl;
    });
    expect(hasWebGL).toBeTruthy();
  });

  test('@ui hue controller initializes and works', async ({ page }) => {
    await page.waitForFunction(() => {
      // @ts-ignore
      return Boolean((window as any).ErrlHueController);
    });
    
    // Verify controller has expected structure
    const controllerExists = await page.evaluate(() => {
      // @ts-ignore
      const hc = (window as any).ErrlHueController;
      return !!hc && typeof hc.setTarget === 'function' && hc.layers !== undefined;
    });
    expect(controllerExists).toBeTruthy();
  });

  test('@ui hue system applies to all targets', async ({ page }) => {
    await page.evaluate(() => {
      const p = document.getElementById('errlPanel');
      if (p && p.classList.contains('minimized')) p.click();
    });
    await page.getByRole('button', { name: 'Hue' }).click();
    
    const hueTarget = page.locator('#hueTarget');
    const hueEnabled = page.locator('#hueEnabled');
    const hueShift = page.locator('#hueShift');
    
    const targets = ['nav', 'riseBubbles', 'bgBubbles', 'background', 'glOverlay'];
    
    for (const target of targets) {
      await hueTarget.selectOption(target);
      await hueEnabled.check();
      await hueShift.fill('180');
      await page.dispatchEvent('#hueShift', 'input');
      
      // Verify target is set
      const selected = await hueTarget.evaluate((el: HTMLSelectElement) => el.value);
      expect(selected).toBe(target);
      
      // Verify controller state
      const state = await page.evaluate((t) => {
        // @ts-ignore
        const hc = (window as any).ErrlHueController;
        if (!hc) return null;
        return {
          currentTarget: hc.currentTarget,
          layerEnabled: hc.layers?.[t]?.enabled
        };
      }, target);
      
      expect(state?.currentTarget).toBe(target);
    }
  });

  test('@ui hue animation works', async ({ page }) => {
    await page.evaluate(() => {
      const p = document.getElementById('errlPanel');
      if (p && p.classList.contains('minimized')) p.click();
    });
    await page.getByRole('button', { name: 'Hue' }).click();
    
    const huePlayPause = page.locator('#huePlayPause');
    await expect(huePlayPause).toBeVisible();
    
    // Start animation
    await huePlayPause.click();
    
    // Wait a bit and check timeline changed
    await page.waitForTimeout(500);
    
    const timelineValue = await page.evaluate(() => {
      // @ts-ignore
      const hc = (window as any).ErrlHueController;
      if (!hc || !hc.master) return null;
      return hc.master.playing;
    });
    
    // Animation should be playing
    expect(timelineValue).toBeTruthy();
  });

  test('@ui FX core registry initializes', async ({ page }) => {
    const fxRegistryExists = await page.evaluate(() => {
      // @ts-ignore
      return Boolean((window as any).ErrlFX && (window as any).ErrlFX._registry);
    });
    expect(fxRegistryExists).toBeTruthy();
  });

  test('@ui effects respect reduced motion', async ({ page }) => {
    // Enable reduced motion
    await page.evaluate(() => {
      const p = document.getElementById('errlPanel');
      if (p && p.classList.contains('minimized')) p.click();
    });
    await page.getByRole('button', { name: 'HUD' }).click();
    
    const prefReduce = page.locator('#prefReduce');
    await prefReduce.check();
    
    // Verify motion multiplier is set
    const motionMultiplier = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--motionMultiplier').trim();
    });
    expect(motionMultiplier).toBeTruthy();
    expect(parseFloat(motionMultiplier)).toBeGreaterThan(1);
  });
});

