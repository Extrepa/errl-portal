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
    const styles = resolve(process.cwd(), 'dist/apps/landing/styles/styles.css');
    expect(existsSync(portalApp)).toBe(true);
    expect(existsSync(styles)).toBe(true);
    const js = readFileSync(portalApp, 'utf8');
    expect(js).toContain('getMinOrbitDistPx');
  });
});
