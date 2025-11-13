#!/usr/bin/env node
/**
 * Framer Component Browser Extractor
 * 
 * Uses Playwright to load Framer export HTML and extract actual running code
 * by intercepting network requests and extracting component code from the browser runtime.
 */

import { chromium } from "playwright";
import { promises as fs } from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "../..");

async function extractWithBrowser(sourcePath, targetSlug) {
  const absoluteSource = path.resolve(projectRoot, sourcePath);
  const outputDir = path.join(projectRoot, "packages", "component-rips", targetSlug);

  console.log(`🌐 Loading Framer component in browser: ${sourcePath}...`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Intercept and collect all script responses
  const scripts = new Map();
  
  page.on("response", async (response) => {
    const url = response.url();
    if (url.includes("framerusercontent.com") && url.includes(".mjs")) {
      try {
        const content = await response.text();
        scripts.set(url, content);
        console.log(`  📦 Captured: ${url.split("/").pop()} (${content.length} bytes)`);
      } catch (err) {
        // Some responses might not be text
      }
    }
  });

  // Load the HTML file
  const fileUrl = `file://${absoluteSource}`;
  await page.goto(fileUrl, { waitUntil: "networkidle", timeout: 30000 });

  // Wait a bit for scripts to load
  await page.waitForTimeout(2000);

  // Try to extract component code from the page
  const extractedCode = await page.evaluate(() => {
    const results = {
      canvasCode: null,
      componentCode: null,
      styles: [],
    };

    // Look for canvas elements and their associated code
    const canvas = document.querySelector("canvas");
    if (canvas) {
      // Try to find any global variables or functions that might be component code
      const globals = Object.keys(window).filter(key => 
        !key.startsWith("_") && 
        typeof window[key] === "function" &&
        key.length > 3
      );
      results.canvasCode = `// Found canvas element\n// Global functions: ${globals.join(", ")}`;
    }

    // Extract inline styles
    document.querySelectorAll("style").forEach(style => {
      if (style.textContent) {
        results.styles.push(style.textContent);
      }
    });

    // Try to find React component code in window
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      results.componentCode = "// React component detected";
    }

    return results;
  });

  await browser.close();

  // Save all captured scripts for analysis
  const scriptsDir = path.join(outputDir, "_extracted-scripts");
  await fs.mkdir(scriptsDir, { recursive: true });
  
  for (const [scriptUrl, content] of scripts.entries()) {
    const filename = scriptUrl.split("/").pop().replace(/[^a-zA-Z0-9._-]/g, "_");
    await fs.writeFile(path.join(scriptsDir, filename), content, "utf8");
  }
  console.log(`  💾 Saved ${scripts.size} scripts to _extracted-scripts/`);

  // Analyze captured scripts for component code
  let componentCode = null;
  let hasReact = false;
  const componentChunks = [];

  // Look for component-specific chunk files (usually have hash-like names)
  for (const [scriptUrl, content] of scripts.entries()) {
    const filename = scriptUrl.split("/").pop();
    
    // Component chunks often have hash-like names
    if (filename.match(/^[A-Z0-9]{20,}\.[A-Z0-9]{8,}\.mjs$/)) {
      componentChunks.push({ url: scriptUrl, filename, content });
    }
    
    // Look for React components
    if (content.includes("React") || content.includes("createElement")) {
      hasReact = true;
    }
    
    // Look for canvas/WebGL code patterns
    if (content.includes("getContext") && content.includes("canvas") && content.length < 100000) {
      // Try to extract canvas initialization
      const canvasPatterns = [
        /(?:const|let|var)\s+\w+\s*=\s*[^;]*getContext\([^)]*\)[^;]*;[\s\S]{200,10000}/,
        /function\s+\w+\([^)]*\)\s*\{[\s\S]*?getContext[\s\S]{200,10000}?\}/,
      ];
      
      for (const pattern of canvasPatterns) {
        const match = content.match(pattern);
        if (match && match[0].length > 500) {
          componentCode = `// Canvas code from ${filename}\n${match[0]}`;
          console.log(`  ✅ Found canvas code in ${filename}`);
          break;
        }
      }
    }
    
    // Look for component names in the code (e.g., "ParticleEngine")
    if (content.includes("ParticleEngine") || content.includes("particle") || content.includes("shape")) {
      // Try to extract relevant sections
      const lines = content.split("\n");
      const relevantLines = [];
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/(?:particle|shape|canvas|getContext)/i)) {
          // Get context around this line
          const start = Math.max(0, i - 10);
          const end = Math.min(lines.length, i + 50);
          relevantLines.push(...lines.slice(start, end));
        }
      }
      if (relevantLines.length > 100) {
        componentCode = `// Component-related code from ${filename}\n${relevantLines.join("\n")}`;
        console.log(`  ✅ Found component-related code in ${filename}`);
      }
    }
  }

  // If we found component chunks, prioritize them
  if (componentChunks.length > 0 && !componentCode) {
    const largestChunk = componentChunks.reduce((a, b) => 
      a.content.length > b.content.length ? a : b
    );
    // Extract a readable portion
    const lines = largestChunk.content.split("\n");
    const sample = lines.slice(0, Math.min(200, lines.length)).join("\n");
    componentCode = `// Component chunk: ${largestChunk.filename}\n// Full file saved in _extracted-scripts/\n\n${sample}`;
    console.log(`  📝 Using component chunk: ${largestChunk.filename}`);
  }

  // If we found code, use it; otherwise create a better extraction
  if (!componentCode && scripts.size > 0) {
    // Use the largest script as it likely contains the main component
    let largestScript = null;
    let largestSize = 0;
    for (const [url, content] of scripts.entries()) {
      if (content.length > largestSize) {
        largestSize = content.length;
        largestScript = { url, content };
      }
    }
    
    if (largestScript) {
      console.log(`  📝 Using largest script: ${largestScript.url.split("/").pop()} (${largestSize} bytes)`);
      // Extract a relevant portion
      const lines = largestScript.content.split("\n");
      const relevantLines = lines.slice(0, Math.min(500, lines.length)).join("\n");
      componentCode = `// Extracted from Framer script\n// Source: ${largestScript.url}\n\n${relevantLines}`;
    }
  }

  // Create the normalized component
  await fs.mkdir(outputDir, { recursive: true });

  const hasCanvas = extractedCode.canvasCode !== null;
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
      <p class="hint">Component extracted from Framer export using browser automation.</p>
      ${componentCode ? '<p class="note">✅ Code extracted from Framer scripts.</p>' : '<p class="note">⚠️ Code extraction limited - may need manual refinement.</p>'}
    </div>
    <script src="../../_shared/preview-mode.js"></script>
    <script type="module" src="./script.js"></script>
  </body>
</html>`;

  const cssContent = extractedCode.styles.length > 0
    ? extractedCode.styles.join("\n\n")
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
// Browser-based extraction attempted but code structure is complex
// Manual extraction from Framer project may be needed for full functionality

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
  // Placeholder - extracted code would go here
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
    description: `Component extracted from Framer export using browser automation. ${componentCode ? "Code extracted from Framer scripts." : "Code extraction limited - may need manual refinement."}`,
    source: path.relative(projectRoot, absoluteSource),
    convertedAt: new Date().toISOString(),
    tags: hasCanvas ? ["module", "canvas", "framer-export", "browser-extracted"] : ["component", "framer-export", "browser-extracted"],
    safety: {
      audio: false,
      video: false,
      camera: false,
      notes: componentCode ? "Code extracted via browser automation. Review for dependencies." : "Browser extraction attempted but code structure is complex."
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
  console.log(`   Scripts captured: ${scripts.size} (saved to _extracted-scripts/)`);
  console.log(`   Component chunks found: ${componentChunks.length}`);
  if (componentCode) {
    console.log(`   Code extracted: ${componentCode.length} characters`);
    console.log(`   💡 Review _extracted-scripts/ for full source code`);
  } else {
    console.log(`   ⚠️  Component code not directly extractable`);
    console.log(`   💡 Check _extracted-scripts/ for component chunks`);
  }
}

async function main() {
  const [sourcePath, targetSlug] = process.argv.slice(2);

  if (!sourcePath || !targetSlug) {
    console.error("Usage: extract-framer-browser.mjs <source-html> <target-slug>");
    console.error("\nExample:");
    console.error("  extract-framer-browser.mjs archive/component-rips-20251112/Component_Rips/Modules/ParticleShapes_Module.html particle-shapes-module");
    process.exit(1);
  }

  try {
    await extractWithBrowser(sourcePath, targetSlug);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

main();

