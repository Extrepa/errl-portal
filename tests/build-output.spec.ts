import { test, expect } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

test.describe('build output', () => {
  test('dist includes metaball lab page', async () => {
    const labPath = resolve(process.cwd(), 'dist/fx/metaball-lab/index.html');
    expect(existsSync(labPath)).toBe(true);
    const html = readFileSync(labPath, 'utf8');
    expect(html).toContain('Metaball Lab');
    expect(html).toContain('metaball-lab-root');
  });

  test('dist includes runtime landing scripts and styles', async () => {
    const portalApp = resolve(process.cwd(), 'dist/apps/landing/scripts/portal-app.js');
    const bootShell = resolve(process.cwd(), 'dist/apps/landing/scripts/boot-shell.js');
    const styles = resolve(process.cwd(), 'dist/apps/landing/styles/styles.css');
    expect(existsSync(portalApp)).toBe(true);
    expect(existsSync(bootShell)).toBe(true);
    expect(existsSync(styles)).toBe(true);
    const js = readFileSync(portalApp, 'utf8');
    expect(js).toContain('getMinOrbitDistPx');
  });

  test('dist includes games hub with liquid light link', async () => {
    const gamesHtml = resolve(process.cwd(), 'dist/games/index.html');
    expect(existsSync(gamesHtml)).toBe(true);
    const html = readFileSync(gamesHtml, 'utf8');
    expect(html).toContain('Liquid Light');
    expect(html).toContain('/games/liquid-light/');
  });

  test('dist includes Unity liquid light WebGL build when sibling deploy exists', async () => {
    const liquidLightIndex = resolve(process.cwd(), 'dist/games/liquid-light/index.html');
    const siblingDeploy = resolve(process.cwd(), '../errl-liquid-light/deploy/web/index.html');
    if (!existsSync(siblingDeploy)) {
      test.skip(true, 'errl-liquid-light deploy/web not built');
      return;
    }
    expect(existsSync(liquidLightIndex)).toBe(true);
    const html = readFileSync(liquidLightIndex, 'utf8');
    expect(html).toContain('Errl Liquid Light');
  });
});
