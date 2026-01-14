import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('@ui initial page load time', async ({ page, baseURL }) => {
    const startTime = Date.now();
    await page.goto(baseURL! + '/index.html', { waitUntil: 'domcontentloaded' });
    // Wait for essential elements instead of networkidle (may timeout)
    await page.waitForSelector('#errlPanel', { state: 'visible', timeout: 10000 }).catch(() => {});
    await page.waitForLoadState('load', { timeout: 10000 }).catch(() => {});
    const loadTime = Date.now() - startTime;
    
    // Should load within 10 seconds (more realistic for CI/CD environments)
    expect(loadTime).toBeLessThan(10000);
  });

  test('@ui time to interactive', async ({ page, baseURL }) => {
    const startTime = Date.now();
    await page.goto(baseURL! + '/index.html');
    
    // Wait for interactive elements
    await page.waitForSelector('#errlPanel', { state: 'visible' });
    await page.waitForSelector('#navOrbit', { state: 'visible' });
    
    const interactiveTime = Date.now() - startTime;
    
    // Should be interactive within 3 seconds
    expect(interactiveTime).toBeLessThan(3000);
  });

  test('@ui FPS performance check', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    
    // Measure FPS over 2 seconds
    const fps = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let frames = 0;
        let lastTime = performance.now();
        
        function countFrame() {
          frames++;
          const currentTime = performance.now();
          
          if (currentTime - lastTime >= 2000) {
            const fps = frames / 2;
            resolve(fps);
          } else {
            requestAnimationFrame(countFrame);
          }
        }
        
        requestAnimationFrame(countFrame);
      });
    });
    
    // Should maintain at least 30fps (graceful degradation acceptable)
    expect(fps).toBeGreaterThanOrEqual(30);
  });

  test('@ui performance with all effects enabled', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    
    // Open panel and enable all effects
    await page.evaluate(() => {
      const p = document.getElementById('errlPanel');
      if (p && p.classList.contains('minimized')) p.click();
    });
    
    // Enable various effects
    await page.getByRole('button', { name: 'HUD' }).click();
    await page.locator('#audioEnabled').check();
    
    await page.getByRole('button', { name: 'Errl' }).click();
    await page.locator('#classicGooEnabled').check();
    
    await page.getByRole('button', { name: 'Nav' }).click();
    await page.locator('#glOrbsToggle').check();
    
    await page.getByRole('button', { name: 'Rising Bubbles' }).click();
    await page.locator('#rbAttract').check();
    await page.locator('#rbRipples').check();
    
    await page.getByRole('button', { name: /GL Bubbles/i }).click();
    await page.locator('#bgSpeed').fill('1.5');
    await page.dispatchEvent('#bgSpeed', 'input');
    
    await page.getByRole('button', { name: 'Hue' }).click();
    await page.locator('#hueEnabled').check();
    await page.locator('#huePlayPause').click();
    
    // Wait for effects to stabilize
    await page.waitForTimeout(1000);
    
    // Check FPS is still acceptable
    const fps = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        let frames = 0;
        let lastTime = performance.now();
        
        function countFrame() {
          frames++;
          const currentTime = performance.now();
          
          if (currentTime - lastTime >= 2000) {
            const fps = frames / 2;
            resolve(fps);
          } else {
            requestAnimationFrame(countFrame);
          }
        }
        
        requestAnimationFrame(countFrame);
      });
    });
    
    // Should maintain at least 20fps with all effects (graceful degradation)
    expect(fps).toBeGreaterThanOrEqual(20);
  });

  test('@ui reduced motion improves performance', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    
    // Enable reduced motion
    await page.evaluate(() => {
      const p = document.getElementById('errlPanel');
      if (p && p.classList.contains('minimized')) p.click();
    });
    await page.getByRole('button', { name: 'HUD' }).click();
    await page.locator('#prefReduce').check();
    
    await page.waitForTimeout(500);
    
    // Verify motion multiplier is set
    const motionMultiplier = await page.evaluate(() => {
      return getComputedStyle(document.documentElement).getPropertyValue('--motionMultiplier').trim();
    });
    expect(parseFloat(motionMultiplier)).toBeGreaterThan(1);
  });

  test('@ui memory usage check', async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/index.html');
    await page.waitForLoadState('networkidle');
    
    // Get initial memory (if available)
    const initialMemory = await page.evaluate(() => {
      // @ts-ignore
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Interact with page for a bit
    await page.evaluate(() => {
      const p = document.getElementById('errlPanel');
      if (p && p.classList.contains('minimized')) p.click();
    });
    
    await page.waitForTimeout(2000);
    
    // Check memory again
    const laterMemory = await page.evaluate(() => {
      // @ts-ignore
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Memory should not grow excessively (if memory API available)
    if (initialMemory > 0 && laterMemory > 0) {
      const growth = laterMemory - initialMemory;
      // Should not grow more than 50MB in 2 seconds
      expect(growth).toBeLessThan(50 * 1024 * 1024);
    }
  });
});

