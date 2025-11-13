#!/usr/bin/env node
import { promises as fs } from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../..");
const packagesDir = path.join(projectRoot, "packages", "component-rips");
const docsCatalogDir = path.join(projectRoot, "docs", "catalog", "component-rips");
const manifestPath = path.join(docsCatalogDir, "manifest.json");

async function readMeta(dir) {
  const metaPath = path.join(packagesDir, dir, "meta.json");
  try {
    const raw = await fs.readFile(metaPath, "utf8");
    const meta = JSON.parse(raw);
    const relativePreview = path
      .relative(docsCatalogDir, path.join(packagesDir, dir, "index.html"))
      .split(path.sep)
      .join("/");

    return {
      slug: dir,
      ...meta,
      preview: {
        index: relativePreview,
      },
    };
  } catch (error) {
    console.warn(`Skipping ${dir}: ${error.message}`);
    return null;
  }
}

async function generate() {
  const entries = await fs.readdir(packagesDir, { withFileTypes: true });
  const packages = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const meta = await readMeta(entry.name);
      if (meta) packages.push(meta);
    }
  }
  packages.sort((a, b) => a.name.localeCompare(b.name));

  const categories = packages.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item.slug);
    return acc;
  }, {});

  const manifest = {
    generatedAt: new Date().toISOString(),
    packages,
    categories,
  };

  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  console.log(`Manifest written to ${manifestPath}`);
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});

