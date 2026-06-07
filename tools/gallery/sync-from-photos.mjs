#!/usr/bin/env node
/**
 * Copy curated gallery images from the Errl photos folder and regenerate manifest.json.
 *
 * Usage:
 *   node tools/gallery/sync-from-photos.mjs
 *   node tools/gallery/sync-from-photos.mjs --source "/path/to/Errl"
 *   node tools/gallery/sync-from-photos.mjs --dry-run
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../..');
const DEFAULT_SOURCE = '/Users/extrepa/Errl/Photos/Projects/Errl';
const GALLERY_ASSETS = join(REPO_ROOT, 'src/shared/assets/legacy/gallery');
const MANIFEST_PATH = join(REPO_ROOT, 'src/apps/static/pages/gallery/manifest.json');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const sourceArg = args.find((a) => a.startsWith('--source='));
const SOURCE = sourceArg ? sourceArg.split('=').slice(1).join('=') : DEFAULT_SOURCE;
const PREVIEWS_DIR = join(SOURCE, 'previews');

const IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

function shouldExclude(filename) {
  const n = filename;
  if (/^ErrlPamphlet/i.test(n)) return 'pamphlet';
  if (/^WizardPins_/i.test(n)) return 'wizard-pins';
  if (/^Errl_Icon_/i.test(n)) return 'icons';
  if (/^Errl_Pin_/i.test(n)) return 'pins';
  if (/^ErrlPin/i.test(n)) return 'pins';
  if (/^ErrlPins/i.test(n)) return 'pins';
  if (/^Errl-Raw-Pin/i.test(n)) return 'pins';
  if (/^ErrlStickerSheet/i.test(n)) return 'pins';
  if (/^YouFoundErrlSticker/i.test(n)) return 'pins';
  if (/^Backstamp_/i.test(n)) return 'pins';
  if (/^errl-\d+\.png$/i.test(n)) return 'legacy-numbered';
  if (/^errl-[a-z].*-[a-f0-9]{6,}\.png$/i.test(n)) return 'legacy-hash-assets';
  if (/Selenius/i.test(n)) return 'selenius';
  if (/128x32|Walking128x32|6_FrameWalking|ErrlJump|Errl_Jumping|Errl_Nano_|ErrlNano_|Errl_Sprite|Errl_32x32/i.test(n)) {
    return 'sprites';
  }
  if (/^Errl_OpenArt_.*\.png$/i.test(n)) return 'openart-png-duplicate';
  if (/^ErrlFieldGuide/i.test(n)) return 'field-guide';
  return null;
}

function humanTitle(filename) {
  const base = filename.replace(/\.[^.]+$/, '');
  return base.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
}

function albumFor(filename) {
  if (/^Errl_OpenArt_2025Oct_JPEG_\d+\.jpg$/i.test(filename)) {
    return 'open-art-2025-oct';
  }
  if (/^Errl_Lizard_Cups_/i.test(filename)) return 'lizard-cups';
  if (/^ErrlLizard_/i.test(filename)) return 'lizard-codex';
  if (/^ErrlLizarf_/i.test(filename)) return 'lizard-codex';
  if (/^Errl_Lizard_/i.test(filename)) return 'lizard-codex';
  if (/^Errl_MushroomForest_/i.test(filename)) return 'mushroom-forest';
  if (/^Extrepa_Errl/i.test(filename)) return 'extrepa-logos';
  if (/^Errl's_World_/i.test(filename)) return 'errls-world';
  if (/^Errl_3DRender_/i.test(filename) || /^3D Errl/i.test(filename)) return 'renders-3d';
  if (
    /^Errl[ _]Stonehendge/i.test(filename) ||
    /^Errl_Totem_/i.test(filename) ||
    /^Errl Face For/i.test(filename) ||
    /^Errl_Birthday/i.test(filename) ||
    /^ErrlCompilation/i.test(filename) ||
    /^Errl_Portal_ByeColor/i.test(filename) ||
    /^Errl Poster/i.test(filename) ||
    /^NomadPoster/i.test(filename) ||
    /^Errl_Front_ForTheNomads/i.test(filename) ||
    /^Errl_DJMayday/i.test(filename)
  ) {
    return 'errl-one-offs';
  }
  return null;
}

/** Prefer previews/ when it is meaningfully larger (usually higher resolution). */
function resolveBestSource(name, mainFull) {
  const previewFull = join(PREVIEWS_DIR, name);
  if (!existsSync(previewFull)) {
    return { full: mainFull, fromPreview: false };
  }

  const mainSize = statSync(mainFull).size;
  const previewSize = statSync(previewFull).size;

  if (previewSize > mainSize * 1.08) {
    return { full: previewFull, fromPreview: true };
  }

  return { full: mainFull, fromPreview: false };
}

function pickFilesFromDir(dir) {
  const chosen = [];
  const skipped = { excluded: 0, unclassified: 0, duplicate: 0 };
  let previewUpgrades = 0;

  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (!statSync(full).isFile()) continue;
    const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
    if (!IMAGE_EXT.has(ext)) continue;

    const reason = shouldExclude(name);
    if (reason) {
      skipped.excluded += 1;
      continue;
    }

    const album = albumFor(name);
    if (!album) {
      skipped.unclassified += 1;
      continue;
    }

    const { full: bestFull, fromPreview } = resolveBestSource(name, full);
    if (fromPreview) previewUpgrades += 1;

    chosen.push({ name, album, full: bestFull, fromPreview });
  }

  const byKey = new Map();
  for (const file of chosen) {
    const key = `${file.album}::${file.name.replace(/\.[^.]+$/, '')}`;
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    const prev = byKey.get(key);
    if (!prev) {
      byKey.set(key, file);
      continue;
    }
    const prevExt = prev.name.slice(prev.name.lastIndexOf('.')).toLowerCase();
    if (prevExt === '.png' && ext === '.jpg') byKey.set(key, file);
    else skipped.duplicate += 1;
  }

  return { files: [...byKey.values()], skipped, previewUpgrades };
}

const ALBUM_META = {
  'open-art-2025-oct': {
    title: 'OpenArt — October 2025',
    sort: (a, b) => {
      const na = parseInt(a.name.match(/JPEG_(\d+)\./i)?.[1] ?? '0', 10);
      const nb = parseInt(b.name.match(/JPEG_(\d+)\./i)?.[1] ?? '0', 10);
      return na - nb;
    },
  },
  'lizard-codex': { title: 'Lizard Codex', sort: (a, b) => a.name.localeCompare(b.name) },
  'lizard-cups': { title: 'Lizard Cups', sort: (a, b) => a.name.localeCompare(b.name) },
  'mushroom-forest': { title: 'Mushroom Forest', sort: (a, b) => a.name.localeCompare(b.name) },
  'extrepa-logos': { title: 'Extrepa Logos', sort: (a, b) => a.name.localeCompare(b.name) },
  'errls-world': { title: "Errl's World", sort: (a, b) => a.name.localeCompare(b.name) },
  'renders-3d': { title: '3D Renders', sort: (a, b) => a.name.localeCompare(b.name) },
  'errl-one-offs': { title: 'Errl One-Offs', sort: (a, b) => a.name.localeCompare(b.name) },
};

function buildManifest(groups) {
  const albums = Object.entries(groups)
    .sort(([a], [b]) => {
      const order = Object.keys(ALBUM_META);
      return order.indexOf(a) - order.indexOf(b);
    })
    .map(([id, files]) => {
      const meta = ALBUM_META[id];
      const sorted = [...files].sort(meta.sort);
      const cover = sorted[0]?.name ?? '';
      return {
        id,
        title: meta.title,
        cover: `%BASE_URL%assets/legacy/gallery/${id}/${cover}`,
        items: sorted.map((f) => ({
          src: `%BASE_URL%assets/legacy/gallery/${id}/${f.name}`,
          title: humanTitle(f.name),
        })),
      };
    });

  return {
    default: 'open-art-2025-oct',
    albums,
    _generated: new Date().toISOString(),
    _source: SOURCE,
  };
}

function main() {
  if (!existsSync(SOURCE)) {
    console.error(`Source not found: ${SOURCE}`);
    process.exit(1);
  }

  const { files, skipped, previewUpgrades } = pickFilesFromDir(SOURCE);
  const groups = {};
  for (const f of files) {
    groups[f.album] ??= [];
    groups[f.album].push(f);
  }

  console.log(`Source: ${SOURCE}`);
  console.log(`Selected: ${files.length} files across ${Object.keys(groups).length} albums`);
  for (const [id, list] of Object.entries(groups)) {
    console.log(`  ${id}: ${list.length}`);
  }
  console.log(`Skipped: ${skipped.excluded} excluded, ${skipped.unclassified} unclassified, ${skipped.duplicate} format dupes`);
  console.log(`Preview upgrades: ${previewUpgrades} files copied from previews/ (higher quality than main)`);

  const manifest = buildManifest(groups);

  if (dryRun) {
    console.log('\nDry run — manifest preview:', JSON.stringify({ default: manifest.default, albumIds: manifest.albums.map((a) => a.id) }));
    return;
  }

  if (existsSync(GALLERY_ASSETS)) {
    rmSync(GALLERY_ASSETS, { recursive: true, force: true });
  }
  mkdirSync(GALLERY_ASSETS, { recursive: true });

  for (const f of files) {
    const destDir = join(GALLERY_ASSETS, f.album);
    mkdirSync(destDir, { recursive: true });
    cpSync(f.full, join(destDir, f.name));
  }

  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`\nWrote ${MANIFEST_PATH}`);
  console.log(`Copied assets to ${GALLERY_ASSETS}`);
}

main();
