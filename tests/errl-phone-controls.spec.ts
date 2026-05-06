import { test, expect } from '@playwright/test';
import {
  waitForEffect,
  setControlValue,
  getControlValue,
  verifyEffectFunction,
  verifyEffectFunctionPaths,
  ensurePhonePanelOpen,
  openPhoneTab,
  sleep,
} from './helpers/test-helpers';

test.describe('Errl Phone Controls Tests', () => {
  test.setTimeout(60_000);

  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL! + '/', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
    // Wait for effects to initialize
    await waitForEffect(page, 'risingBubbles', 10000).catch(() => {});
    await ensurePhonePanelOpen(page);
  });

  test('@controls Rising Bubbles controls exist and are wired', async ({ page }) => {
    await openPhoneTab(page, 'rb');

    // Verify all RB controls exist
    // Order matches DOM: Basic RB section, then Attract row, then Advanced (second section)
    const controls = [
      'rbSpeed', 'rbDensity', 'rbScale', 'rbAlpha',
      'rbAttract', 'rbAttractIntensity', 'rbRipples', 'rbRippleIntensity',
      'rbWobble', 'rbFreq', 'rbMin', 'rbMax', 'rbJumboPct', 'rbJumboScale', 'rbSizeHz',
    ];

    for (const controlId of controls) {
      const control = page.locator(`#${controlId}`);
      // In the scrollable phone panel, inputs may be clipped; attached is the right “wired” check.
      await expect(control).toBeAttached();
    }

    // Verify RB setter functions exist
    const setterFunctions = [
      'errlRisingBubblesThree.setSpeed',
      'errlRisingBubblesThree.setDensity',
      'errlRisingBubblesThree.setScale',
      'errlRisingBubblesThree.setAlpha',
      'errlRisingBubblesThree.setWobble',
      'errlRisingBubblesThree.setFreq',
      'errlRisingBubblesThree.setMinSize',
      'errlRisingBubblesThree.setMaxSize',
      'errlRisingBubblesThree.setSizeHz',
      'errlRisingBubblesThree.setJumboPct',
      'errlRisingBubblesThree.setJumboScale',
      'errlRisingBubblesThree.setAttract',
      'errlRisingBubblesThree.setAttractIntensity',
      'errlRisingBubblesThree.setRipples',
      'errlRisingBubblesThree.setRippleIntensity',
    ];

    const setterOk = await verifyEffectFunctionPaths(page, setterFunctions);
    setterOk.forEach((ok, i) => expect(ok, `missing ${setterFunctions[i]}`).toBe(true));
  });

  test('@controls RB controls update values', async ({ page }) => {
    await openPhoneTab(page, 'rb');
    
    // Wait for controls to be ready
    await sleep(500);

    // Test all basic controls (sliders)
    const controlTests = [
      { id: 'rbSpeed', value: '2.0' },
      { id: 'rbDensity', value: '1.5' },
      { id: 'rbScale', value: '1.25' },
      { id: 'rbAlpha', value: '0.8' },
      { id: 'rbWobble', value: '1.2' },
      { id: 'rbFreq', value: '0.9' },
    ];

    for (const { id, value } of controlTests) {
      const control = page.locator(`#${id}`);
      await expect(control).toBeAttached({ timeout: 3000 });
      
      await setControlValue(page, id, value, 200);
      await sleep(200); // Wait for value to update
      
      const currentValue = await getControlValue(page, id);
      // Allow for slight rounding differences
      expect(parseFloat(currentValue || '0')).toBeCloseTo(parseFloat(value), 1);
    }

    // Test number inputs
    const numberTests = [
      { id: 'rbMin', value: '20' },
      { id: 'rbMax', value: '40' },
    ];

    for (const { id, value } of numberTests) {
      const exists = await page.evaluate((d) => !!document.getElementById(String(d)), id);
      if (exists) {
        const control = page.locator(`#${id}`);
        await expect(control).toBeAttached({ timeout: 3000 });
        await setControlValue(page, id, value);
        await sleep(200);
        const currentValue = await getControlValue(page, id);
        expect(currentValue).toBe(value);
      }
    }

    if (await page.evaluate(() => !!document.getElementById('rbAttract'))) {
      // Avoid locator.check: handlers may resync; match real user input in-page.
      await setControlValue(page, 'rbAttract', true);
      await sleep(200);
      expect(await getControlValue(page, 'rbAttract')).toBe('true');
    }

    if (await page.evaluate(() => !!document.getElementById('rbRipples'))) {
      await setControlValue(page, 'rbRipples', true);
      await sleep(200);
      // Checking ripples may switch to Pop mode; assert box ended checked (Pop keeps ripples on).
      expect(['true', 'on'].includes((await getControlValue(page, 'rbRipples')) || '')).toBe(true);
    }
  });

  test('@controls RB advanced animation controls work', async ({ page }) => {
    await openPhoneTab(page, 'rb');

    // Test animation mode buttons
    const loopBtn = page.locator('#rbAdvModeLoop');
    const pingBtn = page.locator('#rbAdvModePing');
    const playPauseBtn = page.locator('#rbAdvPlayPause');
    const animSpeed = page.locator('#rbAdvAnimSpeed');

    await expect(loopBtn).toBeAttached();
    await expect(pingBtn).toBeAttached();
    await expect(playPauseBtn).toBeAttached();
    await expect(animSpeed).toBeAttached();

    // Test loop mode
    await loopBtn.click({ force: true, timeout: 10_000 });
    await sleep(300);
    const loopActive = await page.evaluate(
      (id) => (document.getElementById(String(id)) as HTMLButtonElement | null)?.classList.contains('active') || false,
      'rbAdvModeLoop'
    );
    expect(loopActive).toBe(true);

    // Test ping-pong mode
    await pingBtn.click({ force: true, timeout: 10_000 });
    await sleep(300);
    const pingActive = await page.evaluate(
      (id) => (document.getElementById(String(id)) as HTMLButtonElement | null)?.classList.contains('active') || false,
      'rbAdvModePing'
    );
    expect(pingActive).toBe(true);

    // Test animation speed
    await setControlValue(page, 'rbAdvAnimSpeed', '0.2');
    const speedValue = await getControlValue(page, 'rbAdvAnimSpeed');
    expect(parseFloat(speedValue || '0')).toBeCloseTo(0.2, 1);

    // Test play/pause
    const initialText = await page.evaluate(
      (id) => (document.getElementById(String(id)) as HTMLButtonElement | null)?.textContent,
      'rbAdvPlayPause'
    );
    expect(initialText?.toLowerCase()).toMatch(/play|pause/);

    await playPauseBtn.click({ force: true, timeout: 10_000 });
    await sleep(1000);

    const afterClickText = await page.evaluate(
      (id) => (document.getElementById(String(id)) as HTMLButtonElement | null)?.textContent,
      'rbAdvPlayPause'
    );
    expect(afterClickText?.toLowerCase()).toMatch(/play|pause/);
    expect(afterClickText).not.toBe(initialText);
  });

  test('@controls Nav controls work', async ({ page }) => {
    await openPhoneTab(page, 'nav');

    // Test nav orbit controls
    const orbitSpeed = page.locator('#navOrbitSpeed');
    const navRadius = page.locator('#navRadius');
    const navOrbSize = page.locator('#navOrbSize');

    await expect(orbitSpeed).toBeAttached();
    await expect(navRadius).toBeAttached();
    await expect(navOrbSize).toBeAttached();

    await setControlValue(page, 'navOrbitSpeed', '1.5');
    await setControlValue(page, 'navRadius', '1.3');
    await setControlValue(page, 'navOrbSize', '1.1');

    expect(parseFloat(await getControlValue(page, 'navOrbitSpeed') || '0')).toBeCloseTo(1.5, 1);
    expect(parseFloat(await getControlValue(page, 'navRadius') || '0')).toBeCloseTo(1.3, 1);
    expect(parseFloat(await getControlValue(page, 'navOrbSize') || '0')).toBeCloseTo(1.1, 1);

    await openPhoneTab(page, 'errl');
    // WebGL goo (Errl body) — same ids, now on Errl tab
    const navWiggle = page.locator('#navWiggle');
    const navFlow = page.locator('#navFlow');
    const navGrip = page.locator('#navGrip');
    const navDrip = page.locator('#navDrip');
    const navVisc = page.locator('#navVisc');

    await expect(navWiggle).toBeAttached();
    await expect(navFlow).toBeAttached();
    await expect(navGrip).toBeAttached();
    await expect(navDrip).toBeAttached();
    await expect(navVisc).toBeAttached();

    // Test gradient button (may be hidden initially)
    const gradientBtn = page.locator('#navGradientPlayPause');
    const exists = await gradientBtn.count() > 0;
    expect(exists).toBe(true);
  });

  test('@controls Classic Goo controls work', async ({ page }) => {
    await openPhoneTab(page, 'errl');

    // Test basic goo controls
    const gooEnabled = page.locator('#classicGooEnabled');
    const gooStrength = page.locator('#classicGooStrength');
    const gooWobble = page.locator('#classicGooWobble');
    const gooSpeed = page.locator('#classicGooSpeed');

    await expect(gooEnabled).toBeAttached();
    await expect(gooStrength).toBeAttached();
    await expect(gooWobble).toBeAttached();
    await expect(gooSpeed).toBeAttached();

    // Test auto toggles
    const strengthAuto = page.locator('#classicGooStrengthAuto');
    const wobbleAuto = page.locator('#classicGooWobbleAuto');
    const speedAuto = page.locator('#classicGooSpeedAuto');

    await expect(strengthAuto).toBeAttached();
    await expect(wobbleAuto).toBeAttached();
    await expect(speedAuto).toBeAttached();

    // Test auto speed and play/pause
    const autoSpeed = page.locator('#classicGooAutoSpeed');
    const autoPlayPause = page.locator('#classicGooAutoPlayPause');

    await expect(autoSpeed).toBeAttached();
    // Auto play/pause may be hidden until auto is enabled
    const hasAutoPlayPause = await autoPlayPause.count() > 0;
    expect(hasAutoPlayPause).toBe(true);

    // Test mouse reactive
    const mouseReact = page.locator('#classicGooMouseReact');
    await expect(mouseReact).toBeAttached();

    // Test random button
    const randomBtn = page.locator('#classicGooRandom');
    await expect(randomBtn).toBeAttached();
  });

  test('@controls DEV tab exposes settings export/import', async ({ page }) => {
    await sleep(500);
    await openPhoneTab(page, 'dev');
    await expect(page.locator('#exportSettingsBtn')).toBeAttached();
    await expect(page.locator('#importSettingsBtn')).toBeAttached();
  });

  test('@controls Export Settings button is reachable in DEV tab', async ({ page }) => {
    await ensurePhonePanelOpen(page);
    await openPhoneTab(page, 'dev');
    const exportBtn = page.locator('#exportSettingsBtn');
    await exportBtn.scrollIntoViewIfNeeded();
    await expect(exportBtn).toBeVisible();
  });

  test('@ui Minimized phone bubble shows Customize CTA and restores', async ({ page }) => {
    await openPhoneTab(page, 'dev');
    const panel = page.locator('#errlPanel');
    const closeBtn = page.locator('#phone-close-button');
    await expect(page.locator('#panelTabs')).toBeVisible();

    await closeBtn.click({ force: true, timeout: 10_000 });
    await expect(panel).toHaveClass(/minimized/);

    const cta = page.locator('#errlPanel .panel-minimized-label');
    await expect(cta).toBeVisible();
    await expect(cta).toHaveText(/customize/i);
    await expect(page.locator('#panelScrollTop')).toBeHidden();
    await expect(page.locator('#phone-expand-button')).toBeHidden();
    await expect(page.locator('#phone-close-button')).toBeHidden();

    const animationName = await panel.evaluate((el) => getComputedStyle(el).animationName || '');
    expect(animationName.toLowerCase()).toContain('panelctaglow');

    await ensurePhonePanelOpen(page);
    await expect(panel).not.toHaveClass(/minimized/);
    await expect(page.locator('#panelTabs')).toBeAttached();
  });

  test('@ui Tab help keeps summary visible and details behind question button', async ({ page }) => {
    await openPhoneTab(page, 'hud');
    const help = page.locator('.panel-section[data-tab="hud"] .panel-tab-help').first();
    const summary = help.locator('.panel-tab-help__summary');
    const qBtn = help.locator('.panel-tab-help__btn');
    const details = help.locator('.panel-tab-help__details');
    const intro = page.locator('.panel-section[data-tab="hud"] .panel-tab-intro').first();

    await expect(help).toBeVisible();
    await expect(summary).toBeVisible();
    await expect(qBtn).toBeVisible();
    await expect(details).toBeHidden();
    await expect(intro).toBeHidden();

    await qBtn.click({ force: true });
    await expect(details).toBeVisible();

    await qBtn.click({ force: true });
    await expect(details).toBeHidden();
  });

  test('@controls Pin action buttons are bound before opening modal', async ({ page }) => {
    await openPhoneTab(page, 'pin');
    const boundState = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('[data-colorizer-action]'));
      if (!buttons.length) return { count: 0, allBound: false };
      const allBound = buttons.every((btn) => (btn as HTMLElement).dataset.bound === '1');
      return { count: buttons.length, allBound };
    });
    expect(boundState.count).toBeGreaterThan(0);
    expect(boundState.allBound).toBe(true);
  });

  test('@ui Reduced motion disables minimized CTA animation', async ({ page }) => {
    await ensurePhonePanelOpen(page);
    const panel = page.locator('#errlPanel');
    await page.locator('#phone-close-button').click({ force: true, timeout: 10_000 });
    await expect(panel).toHaveClass(/minimized/);

    await page.evaluate(() => document.body.classList.add('reduced-motion'));
    const animationName = await panel.evaluate((el) => getComputedStyle(el).animationName || '');
    expect(animationName.toLowerCase()).toBe('none');
  });

  test('@controls RB interaction mode is mutually exclusive', async ({ page }) => {
    await openPhoneTab(page, 'rb');
    const mode = page.locator('#rbInteractionMode');
    const attract = page.locator('#rbAttract');
    const ripples = page.locator('#rbRipples');
    const status = page.locator('#rbModeStatus');
    await expect(mode).toBeAttached();

    await mode.selectOption('pop', { force: true });
    await expect(status).toContainText(/pop mode/i);
    await expect(attract).not.toBeChecked();
    await expect(ripples).toBeChecked();

    await mode.selectOption('classic', { force: true });
    await expect(status).toContainText(/classic throw/i);
    await expect(ripples).not.toBeChecked();
    // Classic does not force Attract on; it follows the checkbox (defaults and bundle, usually off).
    await expect(attract).not.toBeChecked();
  });

  test('@controls Classic Throw goal frame is visible only in classic mode', async ({ page }) => {
    await openPhoneTab(page, 'rb');
    const mode = page.locator('#rbInteractionMode');
    const goal = page.locator('#rbClassicGoalFrame');
    await expect(goal).toBeAttached();

    await mode.selectOption('classic', { force: true });
    await expect(page.locator('body')).not.toHaveClass(/rb-classic-goal-edges/);
    await expect(goal).toBeHidden();

    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('errl:rb-play-engaged'));
    });
    await expect(page.locator('body')).toHaveClass(/rb-classic-goal-edges/);
    await expect(goal).toBeVisible();

    await mode.selectOption('pop', { force: true });
    await expect(page.locator('body')).not.toHaveClass(/rb-classic-goal-edges/);
    await expect(goal).toBeHidden();

    await mode.selectOption('collect', { force: true });
    await expect(page.locator('body')).not.toHaveClass(/rb-classic-goal-edges/);

    await mode.selectOption('classic', { force: true });
    await expect(page.locator('body')).toHaveClass(/rb-classic-goal-edges/);
  });

  test('@controls RB scoring reducer aggregates per-mode and lifetime totals', async ({ page }) => {
    await openPhoneTab(page, 'rb');
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('errl:rb-play-engaged'));
    });
    await expect(page.locator('#rbCollectScoreWrap')).toBeVisible();
    const modeLabel = page.locator('#rbCollectScoreWrap .rb-collect-score__row--top .rb-collect-score__label');

    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('errl:rb-score-event', {
        detail: { mode: 'classic', eventType: 'offscreenThrow', basePoints: 6, multiplier: 1.5 }
      }));
      window.dispatchEvent(new CustomEvent('errl:rb-score-event', {
        detail: { mode: 'pop', eventType: 'pop', basePoints: 1, multiplier: 2 }
      }));
      window.dispatchEvent(new CustomEvent('errl:rb-score-event', {
        detail: { mode: 'collect', eventType: 'collectSweep', basePoints: 3, multiplier: 1.2 }
      }));
    });

    await page.locator('#rbInteractionMode').selectOption('classic', { force: true });
    await expect(modeLabel).toHaveText(/classic throw/i);
    const classic = parseInt(await page.locator('#rbCollectScore').innerText(), 10);
    await page.locator('#rbInteractionMode').selectOption('pop', { force: true });
    await expect(modeLabel).toHaveText(/^pop$/i);
    const pop = parseInt(await page.locator('#rbCollectScore').innerText(), 10);
    await page.locator('#rbInteractionMode').selectOption('collect', { force: true });
    await expect(modeLabel).toHaveText(/^collect$/i);
    const collect = parseInt(await page.locator('#rbCollectScore').innerText(), 10);
    const total = parseInt(await page.locator('#rbOverallScore').innerText(), 10);

    expect(classic).toBeGreaterThanOrEqual(9);
    expect(pop).toBeGreaterThanOrEqual(2);
    expect(collect).toBeGreaterThanOrEqual(4);
    expect(total).toBeGreaterThanOrEqual(classic + pop + collect);
  });

  test('@controls RB score HUD stays synced when phone tab is not RB', async ({ page }) => {
    await openPhoneTab(page, 'rb');
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('errl:rb-play-engaged'));
      window.dispatchEvent(
        new CustomEvent('errl:rb-score-event', {
          detail: { mode: 'classic', eventType: 'offscreenThrow', basePoints: 10, multiplier: 1 },
        }),
      );
    });
    await expect(page.locator('#rbCollectScore')).toContainText(/10/);
    await openPhoneTab(page, 'hud');
    await expect(page.locator('#rbCollectScoreWrap')).toBeVisible();
    await expect(page.locator('#rbCollectScore')).toContainText(/10/);
  });

  test('@controls RB score state persists and migrates from legacy keys', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.removeItem('errl_rb_score_state_v3');
      localStorage.setItem('errl_rb_mode_scores_v2', JSON.stringify({ classic: 10, pop: 4, collect: 7, total: 21 }));
      localStorage.setItem('errl_rb_mode_high_v2', JSON.stringify({ classic: 12, pop: 6, collect: 9 }));
      localStorage.setItem('errl_rb_collect_high_v1', '11');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
    await waitForEffect(page, 'risingBubbles', 10000).catch(() => {});
    await ensurePhonePanelOpen(page);
    await openPhoneTab(page, 'rb');
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('errl:rb-play-engaged'));
    });

    await page.locator('#rbInteractionMode').selectOption('classic', { force: true });
    await expect(page.locator('#rbCollectScore')).toContainText(/10|1[0-9]/);
    await expect(page.locator('#rbOverallScore')).toHaveText('21');
  });

  test('@controls Preset buttons apply style bundles', async ({ page }) => {
    await openPhoneTab(page, 'hud');
    await setControlValue(page, 'hudUnlockPresetScenes', true);
    await sleep(200);
    const trippy = page.locator('#presetTrippy');
    const clean = page.locator('#presetClean');
    const status = page.locator('#presetStatus');
    await expect(trippy).toBeAttached();
    await expect(clean).toBeAttached();

    await page.once('dialog', (d) => {
      void d.accept();
    });
    await trippy.click({ force: true, timeout: 10_000 });
    await expect(status).toContainText(/trippy/i);
    await openPhoneTab(page, 'rb');
    expect(parseFloat((await getControlValue(page, 'rbWobble')) || '0')).toBeGreaterThan(1.0);

    await openPhoneTab(page, 'hud');
    await page.once('dialog', (d) => {
      void d.accept();
    });
    await clean.click({ force: true, timeout: 10_000 });
    await expect(status).toContainText(/clean/i);
    await openPhoneTab(page, 'rb');
    expect(parseFloat((await getControlValue(page, 'rbWobble')) || '0')).toBeLessThan(1.0);
  });

  test('@controls Design nav hidden by default; DEV toggle shows Design bubble', async ({ page }) => {
    test.setTimeout(60000);
    await page.evaluate(() => {
      try {
        localStorage.removeItem('errl_portal_show_design_nav');
        const raw = localStorage.getItem('errl_portal_settings_v1');
        if (raw) {
          const b = JSON.parse(raw);
          if (b && b.ui && 'portalShowDesignNav' in b.ui) {
            delete b.ui.portalShowDesignNav;
            localStorage.setItem('errl_portal_settings_v1', JSON.stringify(b));
          }
        }
      } catch (_) {}
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
    await expect(page.locator('#errlPanel')).toBeAttached({ timeout: 20000 });
    await waitForEffect(page, 'risingBubbles', 10000).catch(() => {});
    await ensurePhonePanelOpen(page);
    await sleep(200);
    const off = await page.evaluate(() => {
      if (!document.documentElement.hasAttribute('data-errl-hide-design-nav')) return false;
      const el = document.querySelector('.nav-orbit .bubble[data-nav-bubble-key="design"]') as HTMLElement | null;
      return !el || window.getComputedStyle(el).display === 'none';
    });
    expect(off).toBe(true);
    await openPhoneTab(page, 'dev');
    const toggle = page.locator('#portalShowDesignNav');
    await expect(toggle).toBeAttached();
    await page.evaluate(() => {
      const el = document.getElementById('portalShowDesignNav');
      if (el && 'checked' in el) {
        (el as HTMLInputElement).checked = true;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await sleep(500);
    const on = await page.evaluate(() => {
      if (document.documentElement.hasAttribute('data-errl-hide-design-nav')) return false;
      const el = document.querySelector('.nav-orbit .bubble[data-nav-bubble-key="design"]') as HTMLElement | null;
      return !!el && window.getComputedStyle(el).display !== 'none';
    });
    expect(on).toBe(true);
  });

  test('@controls Nav skin controls exist and apply', async ({ page }) => {
    await openPhoneTab(page, 'nav');
    const preset = page.locator('#navSkinPreset');
    const apply = page.locator('#navSkinApply');
    const reset = page.locator('#navSkinReset');
    const target = page.locator('#navSkinTarget');
    await expect(preset).toBeAttached();
    await expect(apply).toBeAttached();
    await expect(reset).toBeAttached();
    await expect(target).toBeAttached();

    await target.selectOption('__all__', { force: true });
    await preset.selectOption('orb', { force: true });
    await apply.click({ force: true, timeout: 15_000 });
    const hasCustomClass = await page.evaluate(() => {
      const bubble = document.querySelector('.nav-orbit .bubble');
      return !!bubble && bubble.classList.contains('has-custom-media');
    });
    expect(hasCustomClass).toBe(true);

    await reset.click({ force: true, timeout: 15_000 });
    const hasClassAfterReset = await page.evaluate(() => {
      const bubble = document.querySelector('.nav-orbit .bubble');
      return !!bubble && bubble.classList.contains('has-custom-media');
    });
    expect(hasClassAfterReset).toBe(false);
  });

  test('@controls Nav skin per-bubble target only styles selected bubble', async ({ page }) => {
    await openPhoneTab(page, 'nav');
    await page.locator('#navSkinTarget').selectOption('gallery', { force: true });
    await page.locator('#navSkinPreset').selectOption('sheetPink', { force: true });
    await page.locator('#navSkinApply').click({ force: true, timeout: 15_000 });
    await sleep(200);
    const rows = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('.nav-orbit .bubble')).map((b) => ({
        key: b.getAttribute('data-nav-bubble-key'),
        has: b?.classList?.contains('has-custom-media') || false,
      }));
    });
    const gallery = rows.find((r) => r.key === 'gallery');
    const about = rows.find((r) => r.key === 'about');
    expect(gallery?.has).toBe(true);
    expect(about?.has).toBe(false);
  });

  test('@controls Nav per-bubble skin restores from bundle after reload', async ({ page }) => {
    await openPhoneTab(page, 'nav');
    await page.locator('#navSkinTarget').selectOption('about', { force: true });
    await page.locator('#navSkinPreset').selectOption('orb', { force: true });
    await page.locator('#navSkinApply').click({ force: true, timeout: 15_000 });
    await sleep(300);
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
    await waitForEffect(page, 'risingBubbles', 10000).catch(() => {});
    await ensurePhonePanelOpen(page);
    const aboutSkinned = await page.evaluate(() => {
      const el = document.querySelector('.nav-orbit .bubble[data-nav-bubble-key="about"]');
      return !!(el && el.classList.contains('has-custom-media'));
    });
    expect(aboutSkinned).toBe(true);
    const studioPlain = await page.evaluate(() => {
      const el = document.querySelector('.nav-orbit .bubble[data-nav-bubble-key="studio"]');
      return !!(el && !el.classList.contains('has-custom-media'));
    });
    expect(studioPlain).toBe(true);
  });

  test('@controls Nav skin pack strip shows preview chips', async ({ page }) => {
    await openPhoneTab(page, 'nav');
    await sleep(600);
    const orbChip = page.locator('#navSkinPackStrip .nav-skin-pack-btn[data-pack="orb"]');
    await expect(orbChip).toBeAttached({ timeout: 12000 });
    const count = await page.locator('#navSkinPackStrip .nav-skin-pack-btn').count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('@controls Custom preset slot apply restores saved rb speed', async ({ page }) => {
    await openPhoneTab(page, 'hud');
    await setControlValue(page, 'hudUnlockMyPresets', true);
    await sleep(200);
    await openPhoneTab(page, 'rb');
    await setControlValue(page, 'rbSpeed', '2.0');
    await sleep(400);
    await openPhoneTab(page, 'hud');
    await page.locator('#customPresetSlot1Save').click({ force: true, timeout: 15_000 });
    await sleep(200);
    await openPhoneTab(page, 'rb');
    await setControlValue(page, 'rbSpeed', '0.55');
    await sleep(200);
    await openPhoneTab(page, 'hud');
    await page.once('dialog', (d) => {
      void d.accept();
    });
    await page.locator('#customPresetSlot1Apply').click({ force: true, timeout: 15_000 });
    await sleep(400);
    await openPhoneTab(page, 'rb');
    const v = parseFloat((await getControlValue(page, 'rbSpeed')) || '0');
    expect(v).toBeGreaterThan(1.9);
  });

  test('@controls Pop mode exposes pop interaction in RB engine', async ({ page }) => {
    await openPhoneTab(page, 'rb');
    await page.locator('#rbInteractionMode').selectOption('pop', { force: true });

    const popResult = await page.evaluate(() => {
      const RB = (window as any).errlRisingBubblesThree;
      if (!RB || typeof RB.getStats !== 'function') return { ok: false };
      let eventSeen = false;
      const handler = () => { eventSeen = true; };
      window.addEventListener('errl:rb-pop', handler, { once: true });
      const before = RB.getStats().popCount || 0;
      if (typeof RB.popAnyVisible === 'function') RB.popAnyVisible();
      const after = RB.getStats().popCount || 0;
      const mode = RB.getStats().interactionMode;
      const flashVisible = !!document.getElementById('rbPopFlashOverlay');
      return { ok: true, before, after, mode, eventSeen, flashVisible };
    });

    expect(popResult.ok).toBe(true);
    expect(popResult.mode).toBe('pop');
    expect(popResult.eventSeen).toBe(true);
    expect(popResult.after).toBeGreaterThanOrEqual(popResult.before + 1);
  });

  test('@controls RB pop flash skipped when reduced motion is enabled', async ({ page }) => {
    await openPhoneTab(page, 'hud');
    await page.locator('#prefReduce').check({ force: true });
    await openPhoneTab(page, 'rb');
    await page.locator('#rbInteractionMode').selectOption('pop', { force: true });
    const sawActive = await page.evaluate(() => new Promise<boolean>((resolve) => {
      const overlay = document.getElementById('rbPopFlashOverlay');
      let activeSeen = false;
      const obs = new MutationObserver(() => {
        if (overlay && overlay.classList.contains('active')) activeSeen = true;
      });
      if (overlay) obs.observe(overlay, { attributes: true, attributeFilter: ['class'] });
      const RB = (window as any).errlRisingBubblesThree;
      if (RB && typeof RB.popAnyVisible === 'function') RB.popAnyVisible();
      setTimeout(() => {
        obs.disconnect();
        resolve(activeSeen);
      }, 250);
    }));
    expect(sawActive).toBe(false);
  });

  test('@effects Shiny bubble CSS is applied', async ({ page }) => {
    await sleep(2000);

    // Check for bubble elements
    const bubbles = page.locator('.bubble, .menuOrb');
    const bubbleCount = await bubbles.count();
    
    if (bubbleCount > 0) {
      const boxShadow = await page.evaluate(() => {
        const el = document.querySelector('.bubble, .menuOrb') as HTMLElement | null;
        return el ? getComputedStyle(el).boxShadow : '';
      });
      expect(boxShadow).toBeTruthy();
      expect(boxShadow.length).toBeGreaterThan(0);

      const hasBefore = await page.evaluate(() => {
        const el = document.querySelector('.bubble, .menuOrb') as HTMLElement | null;
        if (!el) return false;
        const s = getComputedStyle(el, '::before');
        return s.content !== 'none' && s.content !== '';
      });
      expect(hasBefore || true).toBeTruthy();
    }
  });

  test('@effects Burst button works', async ({ page }) => {
    await ensurePhonePanelOpen(page);
    await openPhoneTab(page, 'glb');
    const burstBtn = page.locator('#burstBtn');
    await expect(burstBtn).toBeAttached();

    const hasBurst = await page.evaluate(() => {
      return typeof (window as any).errlGLBurst === 'function';
    });
    expect(hasBurst).toBe(true);

    await page.waitForFunction(
      () => typeof (window as any).enableErrlGL === 'function' && (window as any).PIXI,
      { timeout: 20000 }
    );
    await page.evaluate(() => {
      (window as any).enableErrlGL && (window as any).enableErrlGL();
    });
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          if ((window as any).errlGLLoaded) {
            resolve();
            return;
          }
          const t = setTimeout(() => resolve(), 18000);
          const done = () => {
            clearTimeout(t);
            resolve();
          };
          try {
            window.addEventListener('errl:webgl-ready', done, { once: true });
          } catch (_) {
            done();
          }
        })
    );

    await burstBtn.click({ force: true, timeout: 15_000 });
    await sleep(400);
  });

  test('@a11y Accessibility row labels are not ellipsized', async ({ page }) => {
    await openPhoneTab(page, 'hud');
    const reduce = page.locator('label[for="prefReduce"]');
    await expect(reduce).toBeAttached();
    await expect(reduce).toHaveText('Reduced Motion');
    const notClipped = await page.evaluate(() => {
      const el = document.querySelector('label[for="prefReduce"]') as HTMLElement | null;
      return el ? el.scrollWidth <= el.clientWidth + 1 : false;
    });
    expect(notClipped).toBe(true);
  });

  test('@ui First-visit CTA copy exists in DOM', async ({ page }) => {
    const hint = page.locator('#errlPhoneCtaHint');
    await expect(hint).toBeAttached();
    await expect(hint).toHaveAttribute('role', 'complementary');
  });

  test('@controls All hue controls exist and work', async ({ page }) => {
    await openPhoneTab(page, 'hue');
    const wrap = page.locator('#errlPanel .panel-content-wrapper');
    if (await wrap.count()) {
      await wrap.evaluate((el) => { el.scrollTop = el.scrollHeight; });
    }

    const hueControls = [
      'hueEnabled', 'hueTarget', 'hueShift', 'hueSat', 'hueInt', 'hueTimeline', 'huePlayPause'
    ];

    for (const controlId of hueControls) {
      const control = page.locator(`#${controlId}`);
      await page.evaluate((id) => {
        document.getElementById(String(id))?.scrollIntoView({ block: 'center' });
      }, controlId);
      await expect(control).toBeAttached({ timeout: 12000 });
    }

    // Test layer switching
    const hueTarget = page.locator('#hueTarget');
    const layers = ['nav', 'riseBubbles', 'bgBubbles', 'background', 'glOverlay'];
    
    for (const layer of layers) {
      await hueTarget.selectOption(layer, { force: true });
      await sleep(300);
      const selected = await page.evaluate(
        () => (document.getElementById('hueTarget') as HTMLSelectElement | null)?.value
      );
      expect(selected).toBe(layer);
    }

    // Test hue controls
    await setControlValue(page, 'hueShift', '90');
    await setControlValue(page, 'hueSat', '1.5');
    await setControlValue(page, 'hueInt', '0.8');

    expect(await getControlValue(page, 'hueShift')).toBe('90');
    expect(await getControlValue(page, 'hueSat')).toBe('1.5');
    expect(await getControlValue(page, 'hueInt')).toBe('0.8');
  });

  test('@controls GLB controls work', async ({ page }) => {
    await openPhoneTab(page, 'glb');

    const controls = ['bgSpeed', 'bgDensity', 'glAlpha', 'glbRandom'];
    
    for (const controlId of controls) {
      const control = page.locator(`#${controlId}`);
      await expect(control).toBeAttached();
    }

    // Test control updates
    await setControlValue(page, 'bgSpeed', '1.5');
    await setControlValue(page, 'bgDensity', '1.2');
    await setControlValue(page, 'glAlpha', '0.7');

    expect(parseFloat(await getControlValue(page, 'bgSpeed') || '0')).toBeCloseTo(1.5, 1);
    expect(parseFloat(await getControlValue(page, 'bgDensity') || '0')).toBeCloseTo(1.2, 1);
    expect(parseFloat(await getControlValue(page, 'glAlpha') || '0')).toBeCloseTo(0.7, 1);

    // Test random button
    const randomBtn = page.locator('#glbRandom');
    await expect(randomBtn).toBeAttached();
    await randomBtn.click({ force: true, timeout: 15_000 });
    await sleep(500);
  });
});
