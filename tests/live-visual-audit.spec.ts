import { test, expect } from '@playwright/test';
import { gotoPortalLanding, ensurePhonePanelOpen } from './helpers/test-helpers';

const MOBILE = { width: 390, height: 844 };

test.describe('Live visual audit routes', () => {
  test('@ui landing mobile shows four labeled nav bubbles', async ({ page, baseURL }) => {
    await page.setViewportSize(MOBILE);
    await gotoPortalLanding(page, baseURL!);
    await page.waitForTimeout(800);

    const labels = await page.evaluate(() =>
      Array.from(document.querySelectorAll('#navOrbit .bubble .label')).map((el) =>
        (el.textContent || '').trim(),
      ),
    );
    expect(labels.length).toBe(4);
    expect(labels).toEqual(expect.arrayContaining(['Forum', 'About', 'Gallery', 'Studio']));
  });

  test('@ui scene3d mobile shows four 3d nav labels', async ({ page, baseURL }) => {
    await page.setViewportSize(MOBILE);
    await page.goto(`${baseURL!}/?dev=1&skipIntro=1&scene3d=1`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load').catch(() => {});
    await page.waitForFunction(
      () => document.querySelectorAll('.errl-scene-3d-label .label').length >= 4,
      undefined,
      { timeout: 15000 },
    );

    const labels = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.errl-scene-3d-label .label')).map((el) =>
        (el.textContent || '').trim(),
      ),
    );
    expect(labels.length).toBe(4);
    expect(labels).toEqual(expect.arrayContaining(['Forum', 'About', 'Gallery', 'Studio']));
  });

  test('@ui metaball lab page loads isolated shell', async ({ page, baseURL }) => {
    await page.goto(`${baseURL!}/fx/metaball-lab/`, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Metaball Lab/i);
    await expect(page.locator('#metaball-lab-root')).toBeAttached();
    await expect(page.locator('#errl-scene-root')).toHaveCount(0);
  });

  test('@ui phone unlock hint visible before unlock', async ({ page, baseURL }) => {
    await page.setViewportSize(MOBILE);
    await page.goto(`${baseURL!}/?skipIntro=1`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.removeItem('errl_dev_unlock_v1');
      localStorage.removeItem('errl_phone_cta_dismissed_v1');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    const hint = page.locator('#errlPhoneCtaHint');
    await expect(hint).toBeVisible();
    await expect(hint).toContainText(/Long-press/i);
  });

  test('@ui about hero visible on mobile without scroll', async ({ page, baseURL }) => {
    await page.setViewportSize(MOBILE);
    await page.goto(`${baseURL!}/about/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);

    const hero = page.locator('.about-hero-title');
    await expect(hero).toBeVisible();
    const box = await hero.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.y).toBeLessThan(600);
  });

  test('@ui dev mode skips phone unlock hint', async ({ page, baseURL }) => {
    await page.setViewportSize(MOBILE);
    await gotoPortalLanding(page, baseURL!);
    await page.waitForTimeout(500);
    await expect(page.locator('#errlPhoneCtaHint')).toBeHidden();
    await ensurePhonePanelOpen(page);
    await expect(page.locator('#errlPanel')).toBeVisible();
  });
});
