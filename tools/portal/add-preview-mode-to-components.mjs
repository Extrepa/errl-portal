#!/usr/bin/env node
/**
 * Add Preview Mode Support to All Components
 * 
 * Adds the preview-mode.js script to all component index.html files.
 * Run: node tools/portal/add-preview-mode-to-components.mjs
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const COMPONENTS_DIR = join(ROOT, 'packages/component-rips');
const PREVIEW_SCRIPT = '<script src="../../_shared/preview-mode.js"></script>';

async function processComponent(slug) {
  const indexPath = join(COMPONENTS_DIR, slug, 'index.html');
  try {
    const content = await readFile(indexPath, 'utf-8');
    
    // Check if already has preview-mode script
    if (content.includes('preview-mode.js')) {
      console.log(`✓ ${slug} - already has preview-mode`);
      return false;
    }
    
    // Find the script tag position
    const scriptMatch = content.match(/<script[^>]*src=["'][^"']*script\.js["'][^>]*><\/script>/);
    if (!scriptMatch) {
      console.warn(`⚠️  ${slug} - no script.js found, skipping`);
      return false;
    }
    
    // Insert preview-mode script before the main script
    const newContent = content.replace(
      scriptMatch[0],
      `${PREVIEW_SCRIPT}\n    ${scriptMatch[0]}`
    );
    
    await writeFile(indexPath, newContent, 'utf-8');
    console.log(`✓ ${slug} - added preview-mode`);
    return true;
  } catch (e) {
    console.error(`✗ ${slug} - failed: ${e.message}`);
    return false;
  }
}

async function main() {
  console.log('🔧 Adding Preview Mode Support to Components\n');
  
  const entries = await readdir(COMPONENTS_DIR, { withFileTypes: true });
  const components = entries
    .filter(e => e.isDirectory() && !e.name.startsWith('_'))
    .map(e => e.name);
  
  let updated = 0;
  for (const slug of components) {
    if (await processComponent(slug)) {
      updated++;
    }
  }
  
  console.log(`\n✅ Complete: ${updated} components updated`);
  console.log('\n💡 Components will now hide controls when loaded with ?preview=1 parameter');
}

main().catch(console.error);

