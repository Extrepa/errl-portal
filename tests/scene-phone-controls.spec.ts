import { test, expect } from '@playwright/test';
import { gotoPortalLanding, ensurePhonePanelOpen, openPhoneTab } from './helpers/test-helpers';

test.describe('Scene nav render mode (Phase 1)', () => {
  test('@controls dom mode: Nav DOM controls enabled, metaball notice hidden', async ({ page, baseURL }) => {
    await gotoPortalLanding(page, baseURL!);
    await ensurePhonePanelOpen(page);
    await openPhoneTab(page, 'nav');

    const state = await page.evaluate(() => ({
      mode: document.body.classList.contains('errl-nav-mode-metaball') ? 'metaball' : 'dom',
      noticeHidden: document.getElementById('navMetaballNotice')?.hidden ?? true,
      orbitDisabled: (document.getElementById('navOrbitSpeed') as HTMLInputElement | null)?.disabled ?? false,
    }));

    expect(state.mode).toBe('dom');
    expect(state.noticeHidden).toBe(true);
    expect(state.orbitDisabled).toBe(false);
  });

  test('@controls metaball mode: DOM nav controls disabled and notice visible', async ({ page, baseURL }) => {
    await page.goto(`${baseURL!}/?dev=1&skipIntro=1&scene3d=1`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
    await ensurePhonePanelOpen(page);
    await openPhoneTab(page, 'nav');

    const state = await page.evaluate(() => ({
      metaballClass: document.body.classList.contains('errl-nav-mode-metaball'),
      noticeHidden: document.getElementById('navMetaballNotice')?.hidden ?? true,
      domWrapOpacity: document.getElementById('navDomControls')
        ? getComputedStyle(document.getElementById('navDomControls')!).opacity
        : '1',
    }));

    expect(state.metaballClass).toBe(true);
    expect(state.noticeHidden).toBe(false);
    expect(parseFloat(state.domWrapOpacity)).toBeLessThan(1);
  });

  test('@controls nav skin target lists only four destinations', async ({ page, baseURL }) => {
    await gotoPortalLanding(page, baseURL!);
    await ensurePhonePanelOpen(page);
    await openPhoneTab(page, 'nav');

    const values = await page.locator('#navSkinTarget option').evaluateAll((opts) =>
      opts.map((o) => (o as HTMLOptionElement).value).filter((v) => v !== '__all__'),
    );
    expect(values.sort()).toEqual(['about', 'forum', 'gallery', 'studio']);
  });
});

test.describe('Scene tab (Phase 2–3)', () => {
  test('@controls scene tab exposes errlSceneControls and updates glow', async ({ page, baseURL }) => {
    await page.goto(`${baseURL!}/?dev=1&skipIntro=1&scene3d=1`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
    await ensurePhonePanelOpen(page);
    await openPhoneTab(page, 'scene');

    const before = await page.evaluate(() => window.errlSceneControls?.getMetaball().glow ?? -1);
    expect(before).toBeGreaterThanOrEqual(0);

    await page.locator('#sceneMetaballGlow').evaluate((el) => {
      const input = el as HTMLInputElement;
      input.value = '1.55';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    const after = await page.evaluate(() => window.errlSceneControls?.getMetaball().glow ?? -1);
    expect(after).toBeCloseTo(1.55, 2);
  });

  test('@controls atmospheric preset updates scene bundle', async ({ page, baseURL }) => {
    page.on('dialog', (d) => d.accept());
    await gotoPortalLanding(page, baseURL!);
    await ensurePhonePanelOpen(page);
    await openPhoneTab(page, 'scene');

    await page.locator('#scenePresetAtmospheric').click();

    const preset = await page.evaluate(() => ({
      id: window.errlSceneControls?.getSceneSettings().preset,
      glow: window.errlSceneControls?.getMetaball().glow,
      mode: window.errlSceneControls?.getNavRenderMode(),
    }));

    expect(preset.id).toBe('atmospheric');
    expect(preset.glow).toBeCloseTo(0.65, 2);
    expect(preset.mode).toBe('dom');
  });

  test('@controls scroll wheel shifts nav scroll bus on landing', async ({ page, baseURL }) => {
    await gotoPortalLanding(page, baseURL!);
    await page.waitForTimeout(300);

    const before = await page.evaluate(() => window.errlSceneScroll?.getState().progress ?? 0);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(400);
    const after = await page.evaluate(() => window.errlSceneScroll?.getState().progress ?? 0);

    expect(after).not.toBe(before);
  });

  test('@controls scenePreset URL hydrates on load', async ({ page, baseURL }) => {
    await page.goto(`${baseURL!}/?dev=1&skipIntro=1&scenePreset=atmospheric`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});

    const preset = await page.evaluate(() => window.errlSceneControls?.getSceneSettings().preset);
    expect(preset).toBe('atmospheric');
  });
});
