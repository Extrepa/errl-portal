import { test, expect } from '@playwright/test';

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
});
