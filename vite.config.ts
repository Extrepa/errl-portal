import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

const studioRewritePlugin = () => ({
  name: 'errl-studio-rewrite',
  configureServer(server: import('vite').ViteDevServer) {
    server.middlewares.use((req, _res, next) => {
      if (req.url && req.method === 'GET' && shouldRewriteStudio(req.url)) {
        req.url = '/studio.html';
      }
      next();
    });
  },
  configurePreviewServer(server: import('vite').PreviewServer) {
    server.middlewares.use((req, _res, next) => {
      if (req.url && req.method === 'GET' && shouldRewriteStudio(req.url)) {
        req.url = '/studio.html';
      }
      next();
    });
  },
});

function shouldRewriteStudio(url: string) {
  if (!url.startsWith('/studio')) return false;
  // Don't rewrite if it's a file with extension (like .js, .css, .png, etc.)
  const hasFileExtension = /\.[a-zA-Z0-9]+($|[?#])/.test(url);
  // Don't rewrite if it's already studio.html
  if (url === '/studio.html' || url.startsWith('/studio.html/')) return false;
  return !hasFileExtension;
}

const copyShapeMadnessContentPlugin = () => ({
  name: 'shape-madness-content-copy',
  apply: 'build',
  closeBundle() {
    const sourceDir = resolve(process.cwd(), 'src/apps/static/pages/studio/shape-madness/content');
    if (!existsSync(sourceDir)) return;

    const destDir = resolve(process.cwd(), 'dist/apps/static/pages/studio/shape-madness/content');
    rmSync(destDir, { recursive: true, force: true });
    mkdirSync(destDir, { recursive: true });
    cpSync(sourceDir, destDir, { recursive: true });
  },
});

// Vite multi-page build rooted at src/
export default defineConfig(({ command }) => ({
  root: 'src',
  plugins: [studioRewritePlugin(), copyShapeMadnessContentPlugin()],
  // Use project-site base path for GitHub Pages builds; keep "/" for dev
  base: command === 'build' ? '/errl-portal/' : '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@assets': resolve(__dirname, 'src/shared/assets'),
      '@shared': resolve(__dirname, 'src/shared'),
      '@studio': resolve(__dirname, 'src/apps/studio'),
      '@legacy': resolve(__dirname, 'src/legacy'),
    },
  },
  build: {
    outDir: resolve(process.cwd(), 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'src/index.html'),
        'studio.html': resolve(process.cwd(), 'src/apps/studio/index.html'),
        'portal/pages/index': resolve(process.cwd(), 'src/apps/static/pages/index.html'),
        'portal/pages/about/index': resolve(process.cwd(), 'src/apps/static/pages/about/index.html'),
        'portal/pages/gallery/index': resolve(process.cwd(), 'src/apps/static/pages/gallery/index.html'),
        'portal/pages/assets/index': resolve(process.cwd(), 'src/apps/static/pages/assets/index.html'),
        'portal/pages/assets/errl-head-coin/index': resolve(process.cwd(), 'src/apps/static/pages/assets/errl-head-coin/index.html'),
        'portal/pages/assets/errl-head-coin-v2/index': resolve(process.cwd(), 'src/apps/static/pages/assets/errl-head-coin-v2/index.html'),
        'portal/pages/assets/errl-head-coin-v3/index': resolve(process.cwd(), 'src/apps/static/pages/assets/errl-head-coin-v3/index.html'),
        'portal/pages/assets/errl-head-coin-v4/index': resolve(process.cwd(), 'src/apps/static/pages/assets/errl-head-coin-v4/index.html'),
        'portal/pages/assets/errl-face-popout/index': resolve(process.cwd(), 'src/apps/static/pages/assets/errl-face-popout/index.html'),
        'portal/pages/assets/walking-errl/index': resolve(process.cwd(), 'src/apps/static/pages/assets/walking-errl/index.html'),
        'portal/pages/assets/errl-loader-original-parts/index': resolve(process.cwd(), 'src/apps/static/pages/assets/errl-loader-original-parts/index.html'),
        'portal/pages/studio/index': resolve(process.cwd(), 'src/apps/static/pages/studio/index.html'),
        'portal/pages/studio/math-lab/index': resolve(process.cwd(), 'src/apps/static/pages/studio/math-lab/index.html'),
        'portal/pages/studio/shape-madness/index': resolve(process.cwd(), 'src/apps/static/pages/studio/shape-madness/index.html'),
        'portal/pages/pin-designer/index': resolve(process.cwd(), 'src/apps/static/pages/pin-designer/index.html'),
        'portal/pages/pin-designer/pin-designer': resolve(process.cwd(), 'src/apps/static/pages/pin-designer/pin-designer.html'),
        'portal/pages/studio/pin-widget/ErrlPin.Widget/designer': resolve(process.cwd(), 'src/apps/static/pages/studio/pin-widget/ErrlPin.Widget/designer.html'),
        'portal/pages/studio/svg-colorer/index': resolve(process.cwd(), 'src/apps/static/pages/studio/svg-colorer/index.html'),
        'portal/pages/games/index': resolve(process.cwd(), 'src/apps/static/pages/games/index.html'),
        'portal/pages/events/index': resolve(process.cwd(), 'src/apps/static/pages/events/index.html'),
        'portal/pages/merch/index': resolve(process.cwd(), 'src/apps/static/pages/merch/index.html'),
        'fx/hue-examples': resolve(process.cwd(), 'src/apps/landing/fx/hue-examples.html'),
      },
    },
  },
}));
