#!/usr/bin/env node
/**
 * Framer Component Extractor
 * 
 * Extracts actual component code from Framer export HTML files by:
 * 1. Parsing the HTML to find external script URLs
 * 2. Fetching those scripts
 * 3. Extracting component code
 * 4. Creating a standalone normalized component
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import url from "node:url";
import { JSDOM } from "jsdom";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../..");

async function fetchScript(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Failed to fetch ${url}: ${response.statusText}`);
      return null;
    }
    return await response.text();
  } catch (err) {
    console.warn(`Error fetching ${url}:`, err.message);
    return null;
  }
}

function extractComponentCode(scriptContent, componentName) {
  // Try to find React component definitions
  // Look for function/const declarations that might be components
  const patterns = [
    // React function components
    /(?:function|const|export\s+(?:function|const))\s+(\w+)\s*[=\(].*?=>\s*\{[\s\S]*?\}/g,
    // Component-like patterns
    /(?:function|const)\s+(\w*[Cc]omponent\w*)\s*[=\(][\s\S]*?\{[\s\S]*?\}/g,
    // Canvas/WebGL code
    /(?:const|let|var)\s+\w+\s*=\s*document\.(?:getElementById|querySelector)[\s\S]*?requestAnimationFrame[\s\S]*?\}/g,
  ];

  const extracted = [];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(scriptContent)) !== null) {
      extracted.push(match[0]);
    }
  }

  return extracted.join("\n\n");
}

async function extractFramerComponent(sourcePath, targetSlug) {
  const absoluteSource = path.resolve(projectRoot, sourcePath);
  const outputDir = path.join(projectRoot, "packages", "component-rips", targetSlug);

  console.log(`📦 Extracting Framer component from ${sourcePath}...`);

  const html = await fs.readFile(absoluteSource, "utf8");
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Find all script URLs
  const scriptUrls = [];
  const scripts = document.querySelectorAll('script[src], link[rel="modulepreload"]');
  
  for (const script of scripts) {
    const src = script.src || script.href;
    if (src && src.includes("framerusercontent.com")) {
      scriptUrls.push(src);
    }
  }

  console.log(`Found ${scriptUrls.length} external scripts`);

  // Fetch the main script (usually script_main)
  const mainScriptUrl = scriptUrls.find(url => url.includes("script_main"));
  let componentCode = null;

  if (mainScriptUrl) {
    console.log(`Fetching main script: ${mainScriptUrl}`);
    const scriptContent = await fetchScript(mainScriptUrl);
    if (scriptContent) {
      componentCode = extractComponentCode(scriptContent, targetSlug);
      console.log(`Extracted ${componentCode.length} characters of code`);
    }
  }

  // Extract canvas element if present
  const canvas = document.querySelector("canvas");
  const hasCanvas = !!canvas;

  // Extract inline styles
  const styles = [];
  const styleElements = document.querySelectorAll("style");
  for (const style of styleElements) {
    if (style.textContent) {
      styles.push(style.textContent);
    }
  }

  // Create normalized component structure
  await fs.mkdir(outputDir, { recursive: true });

  const htmlContent = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${targetSlug.replace(/-/g, " ").replace(/\\b\\w/g, c => c.toUpperCase())} — ${hasCanvas ? "Module" : "Component"}</title>
    <link rel="stylesheet" href="./styles.css">
  </head>
  <body>
    ${hasCanvas ? '<canvas id="c"></canvas>' : '<div id="component-root"></div>'}
    <div class="controls" id="controls">
      <p class="hint">Component extracted from Framer export.</p>
      ${componentCode ? '<p class="note">✅ Full code extracted from Framer scripts.</p>' : '<p class="note">⚠️ Could not extract full code. Using simplified version.</p>'}
    </div>
    <script src="../../_shared/preview-mode.js"></script>
    <script type="module" src="./script.js"></script>
  </body>
</html>`;

  const cssContent = styles.length > 0 
    ? styles.join("\n\n") 
    : `:root {
  --ui-bg: rgba(0, 0, 0, 0.8);
  --ui-border: rgba(255, 255, 255, 0.13);
  --ui-text: #fff;
}

html, body {
  height: 100%;
  margin: 0;
  background: #000;
  color: #fff;
  font-family: ui-sans-serif;
  overflow: hidden;
}

${hasCanvas ? `canvas {
  position: fixed;
  inset: 0;
  background: #000;
}` : `#component-root {
  position: fixed;
  inset: 0;
}`}

.controls {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: var(--ui-bg);
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--ui-border);
  border-radius: 10px;
  pointer-events: none;
  z-index: 10;
}

.hint, .note {
  margin: 0.25rem 0;
  font-size: 12px;
  color: var(--ui-text);
}

.note {
  color: rgba(255, 200, 100, 0.8);
  font-size: 10px;
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}`;

  const jsContent = componentCode || `// Framer component code extraction
// Original code was in external scripts that couldn't be fully extracted
// This is a placeholder - manual extraction may be needed

const c = document.getElementById("${hasCanvas ? "c" : "component-root"}");
${hasCanvas ? `const g = c.getContext("2d");

function fit() {
  c.width = innerWidth;
  c.height = innerHeight;
}
fit();
addEventListener("resize", fit);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let animationId = null;

function loop(t) {
  if (prefersReducedMotion) {
    g.fillStyle = "#000";
    g.fillRect(0, 0, c.width, c.height);
    return;
  }
  animationId = requestAnimationFrame(loop);
  // Placeholder animation
  g.fillStyle = "rgba(0,0,0,0.1)";
  g.fillRect(0, 0, c.width, c.height);
}

if (!prefersReducedMotion) {
  loop(0);
}` : `// Component initialization
console.log("Component root:", c);`}`;

  const meta = {
    name: targetSlug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
    slug: targetSlug,
    category: hasCanvas ? "module" : "component",
    status: componentCode ? "extracted" : "simplified",
    description: `Component extracted from Framer export. ${componentCode ? "Full code extracted from Framer scripts." : "Simplified recreation - original code requires manual extraction."}`,
    source: path.relative(projectRoot, absoluteSource),
    convertedAt: new Date().toISOString(),
    tags: hasCanvas ? ["module", "canvas", "framer-export"] : ["component", "framer-export"],
    safety: {
      audio: false,
      video: false,
      camera: false,
      notes: componentCode ? "Code extracted from Framer export. Review for any external dependencies." : "Simplified recreation. Original Framer export requires manual extraction."
    },
    controls: []
  };

  await Promise.all([
    fs.writeFile(path.join(outputDir, "index.html"), htmlContent, "utf8"),
    fs.writeFile(path.join(outputDir, "styles.css"), cssContent, "utf8"),
    fs.writeFile(path.join(outputDir, "script.js"), jsContent, "utf8"),
    fs.writeFile(path.join(outputDir, "meta.json"), JSON.stringify(meta, null, 2) + "\n", "utf8"),
  ]);

  console.log(`✅ Component extracted to ${outputDir}`);
  if (componentCode) {
    console.log(`   Full code extracted: ${componentCode.length} characters`);
  } else {
    console.log(`   ⚠️  Could not extract full code - using simplified version`);
  }
}

async function main() {
  const [sourcePath, targetSlug] = process.argv.slice(2);

  if (!sourcePath || !targetSlug) {
    console.error("Usage: extract-framer-component.mjs <source-html> <target-slug>");
    console.error("\nExample:");
    console.error("  extract-framer-component.mjs archive/component-rips-20251112/Component_Rips/Modules/ParticleShapes_Module.html particle-shapes-module");
    process.exit(1);
  }

  try {
    await extractFramerComponent(sourcePath, targetSlug);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

main();

