#!/usr/bin/env node
/**
 * Add displayMode field to all component meta.json files
 * Based on category: backgrounds/cursors -> full-window, text/modules -> playground, buttons -> small-playground
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '../..');
const COMPONENTS_DIR = join(ROOT, 'packages/component-rips');

function getDisplayMode(category) {
  if (category === 'background') return 'full-window';
  if (category === 'cursor') return 'full-window';
  if (category === 'text') return 'playground';
  if (category === 'module') return 'playground';
  if (category === 'button') return 'small-playground';
  if (category === 'prop') return 'playground';
  return 'playground'; // default
}

async function updateComponentMeta(slug) {
  const metaPath = join(COMPONENTS_DIR, slug, 'meta.json');
  try {
    const content = await readFile(metaPath, 'utf-8');
    const meta = JSON.parse(content);
    
    // Skip if already has displayMode
    if (meta.displayMode) {
      return { slug, skipped: true };
    }
    
    const displayMode = getDisplayMode(meta.category);
    meta.displayMode = displayMode;
    meta.playgroundSize = {
      width: 'auto',
      height: 'auto'
    };
    
    const updated = JSON.stringify(meta, null, 2) + '\n';
    await writeFile(metaPath, updated, 'utf-8');
    
    return { slug, displayMode, updated: true };
  } catch (error) {
    return { slug, error: error.message };
  }
}

async function main() {
  const entries = await readdir(COMPONENTS_DIR, { withFileTypes: true });
  const components = entries
    .filter(e => e.isDirectory() && !e.name.startsWith('_'))
    .map(e => e.name);
  
  console.log(`Found ${components.length} components to update\n`);
  
  const results = [];
  for (const slug of components) {
    const result = await updateComponentMeta(slug);
    results.push(result);
    if (result.updated) {
      console.log(`✓ ${slug}: ${result.displayMode}`);
    } else if (result.skipped) {
      console.log(`- ${slug}: already has displayMode`);
    } else {
      console.log(`✗ ${slug}: ${result.error}`);
    }
  }
  
  const updated = results.filter(r => r.updated).length;
  const skipped = results.filter(r => r.skipped).length;
  const errors = results.filter(r => r.error).length;
  
  console.log(`\nSummary: ${updated} updated, ${skipped} skipped, ${errors} errors`);
}

main().catch(console.error);

