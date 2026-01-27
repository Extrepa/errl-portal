import { defineConfig } from 'vite';
import { resolve, dirname, dirname as pathDirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cpSync, existsSync, mkdirSync, rmSync, renameSync, readdirSync, statSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const portalPagesRewritePlugin = () => ({
  name: 'errl-portal-pages-rewrite',
  configureServer(server: import('vite').ViteDevServer) {
    // Rewrite root-level portal pages to source location in dev mode
    // e.g., /about/ -> /apps/static/pages/about/
    server.middlewares.use((req, res, next) => {
      if (req.url && req.method === 'GET') {
        // Rewrite root-level portal pages to source location
        // Match paths like /about/, /gallery/, /assets/errl-head-coin/, etc.
        if (req.url.match(/^\/(about|gallery|assets|games|studio|design|pin-designer|pin-designer-face-only)(\/|$)/)) {
          req.url = `/apps/static/pages${req.url}`;
        }
        // Rewrite /chat to chatbot app
        if (req.url === '/chat' || req.url.startsWith('/chat/')) {
          req.url = '/apps/chatbot/index.html';
        }
        // Rewrite /designer.html or /designer to designer app
        if (req.url === '/designer.html' || req.url === '/designer' || req.url === '/designer/') {
          req.url = '/apps/designer/index.html';
        }
      }
      next();
    });
  },
  configurePreviewServer(server: import('vite').PreviewServer) {
    // No rewrite needed in preview - pages are already built at root level
  },
});

const copyShapeMadnessContentPlugin = () => ({
  name: 'shape-madness-content-copy',
  apply: 'build',
  closeBundle() {
    const sourceDir = resolve(process.cwd(), 'src/apps/static/pages/studio/shape-madness/content');
    if (!existsSync(sourceDir)) return;

    // Copy to new root-level location: dist/studio/shape-madness/content
    const destDir = resolve(process.cwd(), 'dist/studio/shape-madness/content');
    rmSync(destDir, { recursive: true, force: true });
    mkdirSync(destDir, { recursive: true });
    cpSync(sourceDir, destDir, { recursive: true });
  },
});

const copySharedAssetsPlugin = () => ({
  name: 'shared-assets-copy',
  apply: 'build',
  closeBundle() {
    const sourceDir = resolve(process.cwd(), 'src/shared/assets');
    if (!existsSync(sourceDir)) return;

    // Copy to dist/shared/assets/ (main location for most asset references)
    const destDir = resolve(process.cwd(), 'dist/shared/assets');
    rmSync(destDir, { recursive: true, force: true });
    mkdirSync(destDir, { recursive: true });
    cpSync(sourceDir, destDir, { recursive: true });

    // Also copy legacy/gallery to dist/assets/legacy/gallery/ for gallery manifest compatibility
    // The gallery manifest uses %BASE_URL%assets/legacy/gallery/recent/...
    const legacySourceDir = resolve(process.cwd(), 'src/shared/assets/legacy');
    if (existsSync(legacySourceDir)) {
      const legacyDestDir = resolve(process.cwd(), 'dist/assets/legacy');
      rmSync(legacyDestDir, { recursive: true, force: true });
      mkdirSync(legacyDestDir, { recursive: true });
      cpSync(legacySourceDir, legacyDestDir, { recursive: true });
    }
  },
});

const copySharedStylesPlugin = () => ({
  name: 'shared-styles-copy',
  apply: 'build',
  closeBundle() {
    const sourceDir = resolve(process.cwd(), 'src/shared/styles');
    if (!existsSync(sourceDir)) return;

    const destDir = resolve(process.cwd(), 'dist/shared/styles');
    rmSync(destDir, { recursive: true, force: true });
    mkdirSync(destDir, { recursive: true });
    cpSync(sourceDir, destDir, { recursive: true });
  },
});

const copyRedirectsPlugin = () => ({
  name: 'copy-redirects',
  apply: 'build',
  closeBundle() {
    const redirectsFile = resolve(process.cwd(), 'public/_redirects');
    if (existsSync(redirectsFile)) {
      const destFile = resolve(process.cwd(), 'dist/_redirects');
      cpSync(redirectsFile, destFile);
    }
  },
});

const replaceBaseUrlPlugin = () => ({
  name: 'replace-base-url',
  apply: 'build',
  generateBundle(_options, bundle) {
    // Replace %BASE_URL% with / in all HTML files during bundle generation
    for (const fileName in bundle) {
      const chunk = bundle[fileName];
      if (chunk.type === 'asset' && fileName.endsWith('.html') && typeof chunk.source === 'string') {
        chunk.source = chunk.source.replace(/%BASE_URL%/g, '/');
      }
    }
  },
  writeBundle() {
    // Replace %BASE_URL% in all HTML files after write
    const distDir = resolve(process.cwd(), 'dist');
    const replaceInFile = (filePath: string) => {
      if (!existsSync(filePath)) return;
      const { readFileSync, writeFileSync } = require('fs');
      let content = readFileSync(filePath, 'utf-8');
      if (content.includes('%BASE_URL%')) {
        content = content.replace(/%BASE_URL%/g, '/');
        writeFileSync(filePath, content, 'utf-8');
      }
    };
    
    // Replace in all HTML files in dist recursively
    const findHtmlFiles = (dir: string) => {
      try {
        const entries = readdirSync(dir);
        for (const entry of entries) {
          const fullPath = resolve(dir, entry);
          try {
            const stats = statSync(fullPath);
            if (stats.isDirectory()) {
              findHtmlFiles(fullPath);
            } else if (entry.endsWith('.html')) {
              replaceInFile(fullPath);
            }
          } catch (e) {
            // Skip files we can't access
          }
        }
      } catch (e) {
        // Skip directories we can't access
      }
    };
    if (existsSync(distDir)) {
      findHtmlFiles(distDir);
    }
  },
});

const copyIframeHtmlFilesPlugin = () => ({
  name: 'copy-iframe-html-files',
  apply: 'build',
  // Run after reorganizeBuildOutputPlugin by using a later hook
  writeBundle() {
    const distDir = resolve(process.cwd(), 'dist');
    const srcPagesDir = resolve(process.cwd(), 'src/apps/static/pages');
    
    // Copy HTML files that are loaded in iframes to their final locations
    // These files need to be in the same directories as their index.html files
    const iframeHtmlFiles = [
      { src: resolve(srcPagesDir, 'pin-designer/pin-designer.html'), dest: resolve(distDir, 'pin-designer/pin-designer.html') },
      { src: resolve(srcPagesDir, 'pin-designer/pin-designer-face-only.html'), dest: resolve(distDir, 'pin-designer/pin-designer-face-only.html') },
    ];
    
    for (const { src, dest } of iframeHtmlFiles) {
      if (existsSync(src)) {
        const destDir = pathDirname(dest);
        if (!existsSync(destDir)) {
          mkdirSync(destDir, { recursive: true });
        }
        cpSync(src, dest);
      }
    }
  },
});

const reorganizeBuildOutputPlugin = () => ({
  name: 'reorganize-build-output',
  apply: 'build',
  closeBundle() {
    const distDir = resolve(process.cwd(), 'dist');
    const appsDir = resolve(distDir, 'apps');
    
    if (!existsSync(appsDir)) return;
    
    const moveRecursive = (source: string, dest: string) => {
      if (!existsSync(source)) return;

      const stats = statSync(source);
      if (stats.isDirectory()) {
        if (!existsSync(dest)) {
          mkdirSync(dest, { recursive: true });
        }
        const entries = readdirSync(source);
        for (const entry of entries) {
          moveRecursive(resolve(source, entry), resolve(dest, entry));
        }
        try {
          rmSync(source, { recursive: true, force: true });
        } catch (e) {
          // Ignore errors if directory not empty or already removed
        }
      } else {
        const destParent = pathDirname(dest);
        if (!existsSync(destParent)) {
          mkdirSync(destParent, { recursive: true });
        }
        if (existsSync(dest)) {
          rmSync(dest, { force: true });
        }
        renameSync(source, dest);
      }
    };

    const pagesSourceDirs = [
      resolve(appsDir, 'static/pages'),
      resolve(distDir, 'portal/pages'),
    ];

    for (const pagesSourceDir of pagesSourceDirs) {
      if (!existsSync(pagesSourceDir)) continue;
      const entries = readdirSync(pagesSourceDir);
      for (const entry of entries) {
        if (entry === 'index.html' && existsSync(resolve(distDir, 'index.html'))) {
          continue;
        }
        moveRecursive(resolve(pagesSourceDir, entry), resolve(distDir, entry));
      }
    }

    // Clean up empty directories
    try {
      rmSync(resolve(appsDir, 'static'), { recursive: true, force: true });
    } catch (e) {
      // Ignore errors
    }
    try {
      rmSync(resolve(distDir, 'portal'), { recursive: true, force: true });
    } catch (e) {
      // Ignore errors
    }
    
    // Move chat from apps/chatbot/index.html to chat/index.html
    const chatSource = resolve(appsDir, 'chatbot');
    const chatDest = resolve(distDir, 'chat');
    if (existsSync(chatSource)) {
      if (existsSync(chatDest)) {
        rmSync(chatDest, { recursive: true, force: true });
      }
      renameSync(chatSource, chatDest);
    }
    
    // Move fx from apps/landing/fx to fx
    const fxSource = resolve(appsDir, 'landing/fx');
    const fxDest = resolve(distDir, 'fx');
    if (existsSync(fxSource)) {
      if (existsSync(fxDest)) {
        rmSync(fxDest, { recursive: true, force: true });
      }
      // Use cpSync for directory, then remove source
      cpSync(fxSource, fxDest, { recursive: true });
      try {
        rmSync(resolve(appsDir, 'landing'), { recursive: true, force: true });
      } catch (e) {
        // Ignore errors
      }
    }
    
    // Clean up empty apps directory
    try {
      const appsEntries = readdirSync(appsDir);
      if (appsEntries.length === 0) {
        rmSync(appsDir, { recursive: true, force: true });
      }
    } catch (e) {
      // Ignore errors
    }
  },
});

// Vite multi-page build rooted at src/
export default defineConfig(({ command }) => ({
  root: 'src',
  plugins: [
    portalPagesRewritePlugin(), 
    copyShapeMadnessContentPlugin(),
    copySharedAssetsPlugin(), 
    copySharedStylesPlugin(), 
    copyRedirectsPlugin(), 
    replaceBaseUrlPlugin(), 
    reorganizeBuildOutputPlugin(),
    copyIframeHtmlFilesPlugin()
  ],
  // Use root base path for custom domain (errl.wtf)
  base: '/',
  server: {
    proxy: {
      '/api/component-library': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/component-library/, ''),
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@assets': resolve(__dirname, 'src/shared/assets'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@studio': resolve(__dirname, 'src/apps/studio'),
      '@legacy': resolve(__dirname, 'src/legacy'),
      '@designer': resolve(__dirname, 'src/apps/designer/src'),
      // Removed @errl-design-system alias - no longer used, external dependency not available in CI
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  build: {
    outDir: resolve(process.cwd(), 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'src/index.html'),
        // 'designer.html': resolve(process.cwd(), 'src/apps/designer/index.html'), // Built separately via vite.designer.config.ts
        // Portal pages at root level - remove portal/pages/ prefix
        'index': resolve(process.cwd(), 'src/apps/static/pages/index.html'),
        'about/index': resolve(process.cwd(), 'src/apps/static/pages/about/index.html'),
        'gallery/index': resolve(process.cwd(), 'src/apps/static/pages/gallery/index.html'),
        'assets/index': resolve(process.cwd(), 'src/apps/static/pages/assets/index.html'),
        'assets/errl-head-coin/index': resolve(process.cwd(), 'src/apps/static/pages/assets/errl-head-coin/index.html'),
        'assets/errl-head-coin-v2/index': resolve(process.cwd(), 'src/apps/static/pages/assets/errl-head-coin-v2/index.html'),
        'assets/errl-head-coin-v3/index': resolve(process.cwd(), 'src/apps/static/pages/assets/errl-head-coin-v3/index.html'),
        'assets/errl-head-coin-v4/index': resolve(process.cwd(), 'src/apps/static/pages/assets/errl-head-coin-v4/index.html'),
        'assets/errl-face-popout/index': resolve(process.cwd(), 'src/apps/static/pages/assets/errl-face-popout/index.html'),
        'assets/walking-errl/index': resolve(process.cwd(), 'src/apps/static/pages/assets/walking-errl/index.html'),
        'assets/errl-loader-original-parts/index': resolve(process.cwd(), 'src/apps/static/pages/assets/errl-loader-original-parts/index.html'),
        'design/index': resolve(process.cwd(), 'src/apps/static/pages/design/index.html'),
        'studio/index': resolve(process.cwd(), 'src/apps/static/pages/studio/index.html'),
        'studio/pin-widget/ErrlPin.Widget/designer': resolve(process.cwd(), 'src/apps/static/pages/studio/pin-widget/ErrlPin.Widget/designer.html'),
        'studio/svg-colorer/index': resolve(process.cwd(), 'src/apps/static/pages/studio/svg-colorer/index.html'),
        'studio/limewire-simulator/index': resolve(process.cwd(), 'src/apps/static/pages/studio/limewire-simulator/index.html'),
        'pin-designer/index': resolve(process.cwd(), 'src/apps/static/pages/pin-designer/index.html'),
        'pin-designer-face-only/index': resolve(process.cwd(), 'src/apps/static/pages/pin-designer-face-only/index.html'),
        'chat': resolve(process.cwd(), 'src/apps/chatbot/index.html'),
        'fx/hue-examples': resolve(process.cwd(), 'src/apps/landing/fx/hue-examples.html'),
      },
    },
  },
}));
