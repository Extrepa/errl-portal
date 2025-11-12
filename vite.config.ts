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
  const hasFileExtension = /\.[a-zA-Z0-9]+($|[?#])/.test(url);
  return !hasFileExtension;
}

const copyShapeMadnessContentPlugin = () => ({
  name: 'shape-madness-content-copy',
  apply: 'build',
  closeBundle() {
    const sourceDir = resolve(process.cwd(), 'src/legacy/portal/pages/studio/shape-madness/content');
    if (!existsSync(sourceDir)) return;

    const destDir = resolve(process.cwd(), 'dist/legacy/portal/pages/studio/shape-madness/content');
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
      '@assets': resolve(__dirname, 'src/assets'),
      '@portal': resolve(__dirname, 'src/portal'),
      '@studio': resolve(__dirname, 'src/studio'),
      '@legacy': resolve(__dirname, 'src/legacy'),
    },
  },
  build: {
    outDir: resolve(process.cwd(), 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'src/index.html'),
        studioPage: resolve(process.cwd(), 'src/studio.html'),
        'portal/pages/index': resolve(process.cwd(), 'src/legacy/portal/pages/index.html'),
        'portal/pages/about/index': resolve(process.cwd(), 'src/legacy/portal/pages/about/index.html'),
        'portal/pages/gallery/index': resolve(process.cwd(), 'src/legacy/portal/pages/gallery/index.html'),
        'portal/pages/assets/index': resolve(process.cwd(), 'src/legacy/portal/pages/assets/index.html'),
        'portal/pages/studio/index': resolve(process.cwd(), 'src/legacy/portal/pages/studio/index.html'),
        'portal/pages/studio/math-lab/index': resolve(process.cwd(), 'src/legacy/portal/pages/studio/math-lab/index.html'),
        'portal/pages/studio/shape-madness/index': resolve(process.cwd(), 'src/legacy/portal/pages/studio/shape-madness/index.html'),
        'portal/pages/pin-designer/index': resolve(process.cwd(), 'src/legacy/portal/pages/pin-designer/index.html'),
        'portal/pages/dev/index': resolve(process.cwd(), 'src/legacy/portal/pages/dev/index.html'),
        'portal/pages/studio/pin-widget/ErrlPin.Widget/designer': resolve(process.cwd(), 'src/legacy/portal/pages/studio/pin-widget/ErrlPin.Widget/designer.html'),
        'portal/pages/studio/svg-colorer/index': resolve(process.cwd(), 'src/legacy/portal/pages/studio/svg-colorer/index.html'),
        'portal/pages/games/index': resolve(process.cwd(), 'src/legacy/portal/pages/games/index.html'),
        'portal/pages/events/index': resolve(process.cwd(), 'src/legacy/portal/pages/events/index.html'),
        'portal/pages/merch/index': resolve(process.cwd(), 'src/legacy/portal/pages/merch/index.html'),
        hueExamples: resolve(process.cwd(), 'src/fx/hue-examples.html'),
      },
    },
  },
}));
