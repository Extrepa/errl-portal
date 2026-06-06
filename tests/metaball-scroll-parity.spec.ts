import { test, expect } from '@playwright/test';
import { gotoPortalLanding } from './helpers/test-helpers';

test.describe('Metaball scroll parity', () => {
  test('@controls metaball nav links shift on wheel scroll', async ({ page, baseURL }) => {
    await page.goto(`${baseURL!}/?dev=1&skipIntro=1&scrollNav=1`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
    await page.waitForFunction(
      () => document.body.classList.contains('errl-layout-ready'),
      undefined,
      { timeout: 15000 },
    );

    const before = await page.evaluate(() => {
      const link = document.querySelector('.errl-metaball-link') as HTMLElement | null;
      if (!link) return null;
      const r = link.getBoundingClientRect();
      return { x: r.left, y: r.top };
    });
    expect(before).not.toBeNull();

    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(500);

    const after = await page.evaluate(() => {
      const link = document.querySelector('.errl-metaball-link') as HTMLElement | null;
      if (!link) return null;
      const r = link.getBoundingClientRect();
      return { x: r.left, y: r.top };
    });
    expect(after).not.toBeNull();

    const dx = Math.abs((after!.x ?? 0) - (before!.x ?? 0));
    const dy = Math.abs((after!.y ?? 0) - (before!.y ?? 0));
    expect(dx + dy).toBeGreaterThan(4);
  });
});
