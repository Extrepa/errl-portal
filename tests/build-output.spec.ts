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
});
