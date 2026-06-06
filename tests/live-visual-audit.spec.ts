import { test, expect, type Page } from '@playwright/test';
import { gotoPortalLanding, ensurePhonePanelOpen } from './helpers/test-helpers';

const VIEWPORTS = [
  { name: 'iphone-se', width: 375, height: 812 },
  { name: 'iphone-14', width: 390, height: 844 },
  { name: 'pixel-7', width: 411, height: 731 },
  { name: 'ipad', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
] as const;

async function assertBubblesOutsideErrlCore(page: Page) {
  const result = await page.evaluate(() => {
    const errl = document.getElementById('errl');
    if (!errl) return { ok: false, reason: 'no-errl', count: 0, inside: 0 };
    const er = errl.getBoundingClientRect();
    const coreL = er.left + er.width * 0.2;
    const coreR = er.right - er.width * 0.2;
    const coreT = er.top + er.height * 0.2;
    const coreB = er.bottom - er.height * 0.2;
    const bubbles = Array.from(
      document.querySelectorAll('#navOrbit .bubble, #navOrbitBehind .bubble'),
    );
    const inside = bubbles.filter((b) => {
      const br = b.getBoundingClientRect();
      const cx = br.left + br.width / 2;
      const cy = br.top + br.height / 2;
      return cx >= coreL && cx <= coreR && cy >= coreT && cy <= coreB;
    }).length;
    const labels = bubbles.map((b) => (b.querySelector('.label')?.textContent || '').trim()).filter(Boolean);
    return { ok: inside === 0 && bubbles.length === 4, count: bubbles.length, inside, labels };
  });
  expect(result.count).toBe(4);
  expect(result.inside).toBe(0);
  expect(result.labels).toEqual(expect.arrayContaining(['Forum', 'About', 'Gallery', 'Studio']));
}

test.describe('Live visual audit routes', () => {
  for (const vp of VIEWPORTS) {
    test(`@ui DOM nav bubbles outside Errl core (${vp.name})`, async ({ page, baseURL }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await gotoPortalLanding(page, baseURL!);
      await page.waitForTimeout(1000);
      await assertBubblesOutsideErrlCore(page);
    });
  }

  test('@ui intro enter reveals bubbles outside errl core', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseURL!}/`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      sessionStorage.removeItem('errl_entered_v1');
      localStorage.setItem('errl_dev_unlock_v1', 'true');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    const enter = page.locator('.errl-arrival__enter');
    await enter.waitFor({ state: 'visible', timeout: 12000 });
    await enter.click();
    await page.waitForFunction(
      () => document.body.classList.contains('errl-scene-main'),
      undefined,
      { timeout: 12000 },
    );
    await page.waitForTimeout(1800);
    await assertBubblesOutsideErrlCore(page);
  });

  test('@ui scene3d mobile shows four 3d nav labels', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 390, height: 844 });
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

  test('@ui boot shell hides phone panel before unlock', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseURL!}/?skipIntro=1`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.removeItem('errl_dev_unlock_v1');
      localStorage.removeItem('errl_phone_cta_dismissed_v1');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });

    const boot = await page.evaluate(() => ({
      bootReady: document.body.classList.contains('errl-boot-ready'),
      phoneHidden: document.body.classList.contains('errl-phone-hidden'),
      panelDisplay: document.getElementById('errlPanel')
        ? getComputedStyle(document.getElementById('errlPanel')!).display
        : 'missing',
    }));
    expect(boot.bootReady).toBe(true);
    expect(boot.phoneHidden).toBe(true);
    expect(boot.panelDisplay).toBe('none');
    await expect(page.locator('#errlPanel')).toBeHidden();
  });

  test('@ui boot shell hides legacy DOM nav in scene3d on load', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseURL!}/?skipIntro=1&scene3d=1`, { waitUntil: 'domcontentloaded' });

    const nav = await page.evaluate(() => {
      const bubble = document.querySelector('#navOrbit .bubble') as HTMLElement | null;
      return {
        metaballClass: document.body.classList.contains('errl-nav-mode-metaball'),
        bubbleVisibility: bubble ? getComputedStyle(bubble).visibility : 'missing',
        bubbleOpacity: bubble ? getComputedStyle(bubble).opacity : 'missing',
      };
    });
    expect(nav.metaballClass).toBe(true);
    expect(nav.bubbleVisibility).toBe('hidden');
    expect(parseFloat(String(nav.bubbleOpacity))).toBe(0);
  });

  test('@ui phone unlock hint visible before unlock', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 390, height: 844 });
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
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseURL!}/about/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);

    const hero = page.locator('.about-hero-title');
    await expect(hero).toBeVisible();
    const box = await hero.boundingBox();
    expect(box).toBeTruthy();
    expect(box!.y).toBeLessThan(600);
  });

  test('@ui gallery coming soon fills viewport without extra scroll', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseURL!}/gallery/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);
    const metrics = await page.evaluate(() => ({
      scrollHeight: document.documentElement.scrollHeight,
      innerHeight: window.innerHeight,
    }));
    expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.innerHeight + 80);
    await expect(page.locator('.coming-soon')).toBeVisible();
  });

  test('@ui dev mode skips phone unlock hint', async ({ page, baseURL }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await gotoPortalLanding(page, baseURL!);
    await page.waitForTimeout(500);
    await expect(page.locator('#errlPhoneCtaHint')).toBeHidden();
    await ensurePhonePanelOpen(page);
    await expect(page.locator('#errlPanel')).toBeVisible();
  });
});
