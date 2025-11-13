#!/usr/bin/env node
/**
 * Generate Thumbnails for Component Rips
 * 
 * Uses Playwright to capture screenshots of each component.
 * Run: npm run thumbnails:generate
 */

import { chromium } from 'playwright';
import { readdir, readFile, writeFile, mkdir, stat, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '../..');
const COMPONENTS_DIR = join(ROOT, 'packages/component-rips');
const THUMBNAILS_DIR = join(ROOT, 'packages/component-rips/_thumbnails');

async function getComponents() {
  const components = [];
  try {
    const entries = await readdir(COMPONENTS_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('_')) {
        const metaPath = join(COMPONENTS_DIR, entry.name, 'meta.json');
        try {
          const meta = JSON.parse(await readFile(metaPath, 'utf-8'));
          components.push({
            slug: entry.name,
            name: meta.name,
            category: meta.category,
            status: meta.status,
            indexPath: join(COMPONENTS_DIR, entry.name, 'index.html')
          });
        } catch (e) {
          console.warn(`⚠️  Skipping ${entry.name}: no meta.json`);
        }
      }
    }
  } catch (e) {
    console.error('Failed to read components directory:', e);
  }
  return components;
}

async function generateThumbnail(browser, component, baseUrl, force = false) {
  const { slug, name, indexPath } = component;
  const thumbnailPath = join(THUMBNAILS_DIR, `${slug}.png`);
  
  // Check if thumbnail already exists and is recent (skip if force is true)
  if (!force) {
    try {
      const stats = await stat(thumbnailPath);
      const metaStats = await stat(join(COMPONENTS_DIR, slug, 'index.html'));
      if (stats.mtime > metaStats.mtime) {
        console.log(`✓ ${slug} - thumbnail up to date`);
        return true;
      }
    } catch (e) {
      // Thumbnail doesn't exist, generate it
    }
  }

  const page = await browser.newPage({
    viewport: { width: 640, height: 480 }
  });

  try {
    // Construct URL - prefer http:// for better compatibility
    let url;
    const previewSuffix = '?preview=1';
    if (baseUrl) {
      url = `${baseUrl}/packages/component-rips/${slug}/index.html${previewSuffix}`;
    } else {
      // Try file:// but it may not work in all browsers
      url = `file://${indexPath}${previewSuffix}`;
    }

    console.log(`📸 Generating thumbnail for ${slug}...`);
    
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 15000 
    });

    // Hide control overlays that can cover the main visual
    await page.addStyleTag({
      content: `
        .controls,
        #controls,
        [class*="control-panel"],
        [class*="controls-panel"],
        [class*="control-overlay"],
        .ui-controls,
        .ui-panel {
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `
    });

    // Wait a bit for animations to start
    await page.waitForTimeout(1000);

    // Take screenshot
    await page.screenshot({
      path: thumbnailPath,
      fullPage: false,
      type: 'png'
    });

    console.log(`✓ ${slug} - thumbnail generated`);
    return true;
  } catch (error) {
    console.error(`✗ ${slug} - failed: ${error.message}`);
    return false;
  } finally {
    await page.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const baseUrl = args.find(arg => arg.startsWith('--url='))?.split('=')[1];
  const force = args.includes('--force');

  console.log('🎨 Component Thumbnail Generator\n');
  
  if (!baseUrl) {
    console.log('💡 Tip: For better results, use a local HTTP server:');
    console.log('   npm run thumbnails:generate -- --url=http://localhost:8000\n');
  }

  // Ensure thumbnails directory exists
  try {
    await mkdir(THUMBNAILS_DIR, { recursive: true });
  } catch (e) {
    // Directory might already exist
  }

  const components = await getComponents();
  console.log(`Found ${components.length} components\n`);

  if (components.length === 0) {
    console.log('No components found. Exiting.');
    return;
  }

  const browser = await chromium.launch({
    headless: true
  });

  let success = 0;
  let failed = 0;

  for (const component of components) {
    // Always call generateThumbnail - it handles staleness checking internally
    // The function will skip if thumbnail is up-to-date (unless --force is used)
    const result = await generateThumbnail(browser, component, baseUrl, force);
    if (result) {
      success++;
    } else {
      failed++;
    }
  }

  await browser.close();

  console.log(`\n✅ Complete: ${success} succeeded, ${failed} failed`);
  console.log(`\nThumbnails saved to: ${THUMBNAILS_DIR}`);
  
  if (failed > 0) {
    console.log('\n💡 Tip: For components that failed, you can:');
    console.log('   1. Start a local server: cd docs/catalog/component-rips && python3 -m http.server 8000');
    console.log('   2. Re-run with: npm run thumbnails:generate -- --url=http://localhost:8000');
    console.log('   3. Or take a screenshot manually and save as: packages/component-rips/_thumbnails/{slug}.png');
  }
  
  if (!baseUrl && failed > 0) {
    console.log('\n💡 Tip: Using a local HTTP server often works better than file:// protocol.');
    console.log('   Try: npm run thumbnails:generate -- --url=http://localhost:8000');
  }
}

main().catch(console.error);
