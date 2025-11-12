#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceFile = path.join(__dirname, '../src/portal/pages/tools/shape-madness/content/html_css_sheets.html');
const outputDir = path.join(__dirname, '../src/portal/pages/tools/shape-madness/content/css-examples');

// Read the source file
const html = fs.readFileSync(sourceFile, 'utf-8');

// Extract all examples
const examples = [];
const articleRegex = /<article class="card">([\s\S]*?)<\/article>/g;
let match;

while ((match = articleRegex.exec(html)) !== null) {
  const articleContent = match[1];
  
  // Extract title
  const titleMatch = articleContent.match(/<h2>(\d+\)\s*[^<]+)<\/h2>/);
  if (!titleMatch) continue;
  const title = titleMatch[1].trim();
  const num = title.match(/^(\d+)\)/)?.[1] || '0';
  
  // Extract label
  const labelMatch = articleContent.match(/<small class="label">([^<]+)<\/small>/);
  const label = labelMatch ? labelMatch[1].trim() : '';
  
  // Extract preview HTML
  const previewMatch = articleContent.match(/<div class="preview example-(\d+)">([\s\S]*?)<\/div>/);
  if (!previewMatch) continue;
  const exampleNum = previewMatch[1];
  const previewHTML = previewMatch[2];
  
  // Extract code
  const codeMatch = articleContent.match(/<div class="code">([\s\S]*?)<\/div>/);
  const code = codeMatch ? codeMatch[1].trim() : '';
  
  // Extract tips
  const tipsMatch = articleContent.match(/<div class="tips">([\s\S]*?)<\/div>/);
  const tips = tipsMatch ? tipsMatch[1].trim() : '';
  
  examples.push({
    num: parseInt(num),
    exampleNum,
    title: title.replace(/^\d+\)\s*/, ''),
    label,
    previewHTML,
    code,
    tips
  });
}

// Sort by number
examples.sort((a, b) => a.num - b.num);

// Create output directory
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Get all CSS from the source file (styles in <style> and <script>)
const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
const baseStyles = styleMatch ? styleMatch[1] : '';

const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const scripts = scriptMatch ? scriptMatch[1] : '';

// Extract example-specific CSS from script
const cssFromScript = scripts.match(/const css = `([\s\S]*?)`/)?.[1] || '';

// Generate individual HTML files
const allFiles = [];

examples.forEach(example => {
  const filename = `example-${example.exampleNum.padStart(2, '0')}-${example.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.html`;
  const filepath = path.join(outputDir, filename);
  
  // Find example-specific CSS
  const exampleCSSRegex = new RegExp(`\\.example-${example.exampleNum}[\\s\\S]*?(?=\\.example-|$)`);
  const exampleCSS = cssFromScript.match(exampleCSSRegex)?.[0] || '';
  
  const previewContent = example.previewHTML;
  const exampleTitle = example.title.replace(/"/g, '&quot;');
  
  const standaloneHTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${exampleTitle} — CSS Example</title>
  <style>
    :root{
      --bg:#0f1220;
      --card:#151a2e;
      --ink:#e6e7ef;
      --muted:#a7acc9;
      --accent:#7cf0ff;
      --accent2:#ffd36a;
      --code-bg:#0d0f1a;
      --border:#232845;
    }
    *{box-sizing:border-box;margin:0;padding:0}
    html,body{height:100%;margin:0;font:14px/1.4 system-ui;color:var(--ink);background:var(--bg)}
    body{display:grid;place-items:center;padding:2rem}
    .container{max-width:600px;width:100%}
    .preview{
      padding:2rem;
      background:radial-gradient(1200px 300px at 20% 0%, rgba(124,240,255,.12), transparent 55%);
      border:1px solid var(--border);
      border-radius:16px;
      min-height:200px;
      display:flex;
      align-items:center;
      justify-content:center;
    }
    ${baseStyles}
    ${exampleCSS}
    .u-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center;justify-content:center}
    .u-col{display:grid;gap:8px}
    .u-center{text-align:center}
  </style>
</head>
<body>
  <div class="container">
    <div class="preview example-${example.exampleNum}">
      ${previewContent}
    </div>
  </div>
</body>
</html>`;
  
  fs.writeFileSync(filepath, standaloneHTML);
  allFiles.push({
    name: example.title,
    path: `css-examples/${filename}`,
    label: example.label,
    num: example.num
  });
  
  console.log(`Created: ${filename}`);
});

// Write manifest
const manifest = {
  files: allFiles,
  total: allFiles.length
};

fs.writeFileSync(
  path.join(outputDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2)
);

console.log(`\nExtracted ${allFiles.length} examples to ${outputDir}`);
console.log(`Manifest saved to ${path.join(outputDir, 'manifest.json')}`);

