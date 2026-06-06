import { test, expect } from '@playwright/test';
import { gotoPortalLanding } from './helpers/test-helpers';

const VIEWPORTS = [
  { name: 'desktop', size: { width: 1440, height: 900 } },
  { name: 'mobile', size: { width: 390, height: 844 } },
];

async function disableMotion(page: any) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        caret-color: transparent !important;
      }
    `,
  });
}

async function freezeLandingNav(page: any) {
  await page.evaluate(() => {
    const speed = document.getElementById('navOrbitSpeed') as HTMLInputElement | null;
    if (speed) {
      speed.value = '0';
      speed.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });
}

test.describe('Visual regression - portal', () => {
  for (const vp of VIEWPORTS) {
    test(`portal home (${vp.name})`, async ({ page }) => {
      await page.setViewportSize(vp.size);
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('load').catch(() => {});
      await disableMotion(page);
      await page.waitForTimeout(500);
      await expect(page).toHaveScreenshot(`portal-home-${vp.name}.png`, {
        fullPage: true,
      });
    });

    test(`portal customizer (${vp.name})`, async ({ page }) => {
      await page.setViewportSize(vp.size);
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('load').catch(() => {});
      await disableMotion(page);

      const openBtn = page.locator('#openColorizer');
      await openBtn.waitFor({ state: 'visible' });
      await openBtn.click();

      const panel = page.locator('#colorizerPhone');
      await panel.waitFor({ state: 'visible' });

      const frame = page.frameLocator('#colorizerFrame');
      await frame.locator('#errlSVG').waitFor({ state: 'visible' });
      await frame.locator('body').evaluate((body) => {
        const style = document.createElement('style');
        style.textContent = `
          *, *::before, *::after {
            animation: none !important;
            transition: none !important;
            caret-color: transparent !important;
          }
        `;
        body.appendChild(style);
      });

      await page.waitForTimeout(500);
      await expect(panel).toHaveScreenshot(`portal-customizer-${vp.name}.png`, {
        animations: 'disabled',
      });
    });
  }

  test('landing main nav mobile (skip intro)', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoPortalLanding(page, baseURL!);
    await disableMotion(page);
    await freezeLandingNav(page);
    await page.waitForTimeout(1200);
    await expect(page).toHaveScreenshot('landing-main-nav-mobile.png', {
      fullPage: false,
      animations: 'disabled',
      maxDiffPixelRatio: 0.06,
      timeout: 20000,
    });
  });

  test('scene3d nav mobile', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseURL!}/?dev=1&skipIntro=1&scene3d=1`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load').catch(() => {});
    await page.waitForFunction(
      () => document.querySelectorAll('.errl-scene-3d-label .label').length >= 4,
      undefined,
      { timeout: 15000 },
    );
    await disableMotion(page);
    await page.waitForTimeout(800);
    await expect(page).toHaveScreenshot('landing-scene3d-nav-mobile.png', {
      fullPage: false,
      animations: 'disabled',
      maxDiffPixelRatio: 0.08,
      timeout: 20000,
    });
  });

  test('metaball lab page', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/fx/metaball-lab/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load').catch(() => {});
    await disableMotion(page);
    await page.waitForTimeout(800);
    await expect(page).toHaveScreenshot('metaball-lab-mobile.png', {
      fullPage: false,
      animations: 'disabled',
    });
  });
});
