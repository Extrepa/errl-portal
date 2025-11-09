import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Vite multi-page build rooted at src/
export default defineConfig(({ command }) => ({
  root: 'src',
  // Use project-site base path for GitHub Pages builds; keep "/" for dev
  base: command === 'build' ? '/errl-portal/' : '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: resolve(process.cwd(), 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'src/index.html'),
        studioPage: resolve(process.cwd(), 'src/studio.html'),
        pages: resolve(process.cwd(), 'src/portal/pages/index.html'),
        about: resolve(process.cwd(), 'src/portal/pages/about/index.html'),
        gallery: resolve(process.cwd(), 'src/portal/pages/gallery/index.html'),
        projects: resolve(process.cwd(), 'src/portal/pages/projects/index.html'),
        studio: resolve(process.cwd(), 'src/portal/pages/studio/index.html'),
        mathLab: resolve(process.cwd(), 'src/portal/pages/studio/math-lab/index.html'),
        shapeMadness: resolve(process.cwd(), 'src/portal/pages/studio/shape-madness/index.html'),
        pinDesigner: resolve(process.cwd(), 'src/portal/pages/pin-designer/index.html'),
        devPanel: resolve(process.cwd(), 'src/portal/pages/dev/index.html'),
        pinWidgetDesigner: resolve(process.cwd(), 'src/portal/pages/studio/pin-widget/ErrlPin.Widget/designer.html'),
        svgColorer: resolve(process.cwd(), 'src/portal/pages/studio/svg-colorer/index.html'),
        games: resolve(process.cwd(), 'src/portal/pages/games/index.html'),
        events: resolve(process.cwd(), 'src/portal/pages/events/index.html'),
        merch: resolve(process.cwd(), 'src/portal/pages/merch/index.html'),
        hueExamples: resolve(process.cwd(), 'src/fx/hue-examples.html'),
      },
    },
  },
}));
