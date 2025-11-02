import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Vite multi-page build rooted at src/
export default defineConfig(({ command }) => ({
  root: 'src',
  // Use project-site base path for GitHub Pages builds; keep "/" for dev
  base: command === 'build' ? '/errl-portal/' : '/',
  resolve: {
    alias: {
      '@': resolve(process.cwd(), 'src'),
    },
  },
  build: {
    outDir: resolve(process.cwd(), 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'src/index.html'),
        studio: resolve(process.cwd(), 'src/studio.html'),
        pages: resolve(process.cwd(), 'src/portal/pages/index.html'),
        about: resolve(process.cwd(), 'src/portal/pages/about/index.html'),
        gallery: resolve(process.cwd(), 'src/portal/pages/gallery/index.html'),
        projects: resolve(process.cwd(), 'src/portal/pages/projects/index.html'),
        tools: resolve(process.cwd(), 'src/portal/pages/tools/index.html'),
        pinDesigner: resolve(process.cwd(), 'src/portal/pages/pin-designer/index.html'),
        devPanel: resolve(process.cwd(), 'src/portal/pages/dev/index.html'),
        atlasBuilder: resolve(process.cwd(), 'src/portal/pages/tools/atlas-builder/index.html'),
        atlasEmbed: resolve(process.cwd(), 'src/portal/pages/tools/atlas-builder/embed.html'),
        assetBuilder: resolve(process.cwd(), 'src/portal/pages/tools/asset-builder/embed.html'),
        pinWidgetDesigner: resolve(process.cwd(), 'src/portal/pages/tools/pin-widget/ErrlPin.Widget/designer.html'),
        hueExamples: resolve(process.cwd(), 'src/fx/hue-examples.html'),
      },
    },
  },
}));
