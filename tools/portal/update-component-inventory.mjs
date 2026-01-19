#!/usr/bin/env node
/**
 * Update Component Inventory Registry
 *
 * Scans all component locations and generates/updates the unified inventory.
 * Run: node tools/portal/update-component-inventory.mjs
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');

async function scanDirectory(dir, extensions = ['.html', '.js', '.tsx']) {
  const items = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        items.push(...await scanDirectory(fullPath, extensions));
      } else if (extensions.some(ext => entry.name.endsWith(ext))) {
        const stats = await stat(fullPath);
        items.push({
          name: entry.name,
          path: fullPath.replace(ROOT + '/', ''),
          size: stats.size,
          modified: stats.mtime
        });
      }
    }
  } catch (e) {
    // Directory doesn't exist or can't be read
  }
  return items;
}

async function getNormalizedComponents() {
  const dir = join(ROOT, 'packages/component-rips');
  const dirs = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const metaPath = join(dir, entry.name, 'meta.json');
        try {
          const meta = JSON.parse(await readFile(metaPath, 'utf-8'));
          dirs.push({
            slug: entry.name,
            name: meta.name,
            category: meta.category,
            status: meta.status,
            path: `packages/component-rips/${entry.name}`
          });
        } catch (e) {
          // No meta.json or invalid
        }
      }
    }
  } catch (e) {
    // Directory doesn't exist
  }
  return dirs;
}

async function getRawComponentRips() {
  const dir = join(ROOT, 'archive/component-rips-20251112/Component_Rips');
  const files = await scanDirectory(dir, ['.html']);
  return files.map(f => ({
    name: f.name,
    path: f.path,
    category: f.path.split('/')[3] || 'unknown'
  }));
}

async function getProjectsComponents() {
  const dir = join(ROOT, 'public/apps/projects');
  const dirs = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('_')) {
        dirs.push({
          name: entry.name,
          path: `public/apps/projects/${entry.name}`
        });
      }
    }
  } catch (e) {
    // Directory doesn't exist
  }
  return dirs;
}

async function getComponentLibrary() {
  const dir = join(ROOT, 'src/components/component-library/Errl_Component_Catalog/components');
  const dirs = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        dirs.push({
          name: entry.name,
          path: `src/components/component-library/Errl_Component_Catalog/components/${entry.name}`
        });
      }
    }
  } catch (e) {
    // Directory doesn't exist
  }
  return dirs;
}

async function main() {
  console.log('🔍 Scanning component locations...\n');

  const normalized = await getNormalizedComponents();
  const raw = await getRawComponentRips();
  const projects = await getProjectsComponents();
  const library = await getComponentLibrary();

  console.log('📊 Component Inventory Summary:\n');
  console.log(`  Normalized Component Rips: ${normalized.length}`);
  console.log(`  Raw Component Rips: ${raw.length}`);
  console.log(`  Projects Components: ${projects.length}`);
  console.log(`  Component Library: ${library.length}`);
  console.log(`  Math Lab Effects: 100 (embedded)`);
  console.log(`  ──────────────────────────────`);
  console.log(`  Total: ${normalized.length + raw.length + projects.length + library.length + 100}\n`);

  // Group normalized by category
  const byCategory = {};
  normalized.forEach(c => {
    if (!byCategory[c.category]) byCategory[c.category] = [];
    byCategory[c.category].push(c);
  });

  console.log('📦 Normalized Components by Category:');
  Object.entries(byCategory).forEach(([cat, items]) => {
    console.log(`  ${cat}: ${items.length}`);
  });

  // Count raw by category
  const rawByCategory = {};
  raw.forEach(c => {
    if (!rawByCategory[c.category]) rawByCategory[c.category] = [];
    rawByCategory[c.category].push(c);
  });

  console.log('\n📁 Raw Component Rips by Category:');
  Object.entries(rawByCategory).forEach(([cat, items]) => {
    console.log(`  ${cat}: ${items.length}`);
  });

  console.log('\n✅ Inventory scan complete!');
  console.log('   Update docs/catalog/component-inventory.md manually with any changes.');
}

main().catch(console.error);

