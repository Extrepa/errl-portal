import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Vite multi-page build rooted at src/
export default defineConfig({
  root: 'src',
  base: '/',
  build: {
    outDir: resolve(process.cwd(), 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        portal: resolve(process.cwd(), 'src/portal/pixi-gl/index.html'),
        about: resolve(process.cwd(), 'src/about.html'),
        appsAbout: resolve(process.cwd(), 'src/apps/about.html'),
        tools: resolve(process.cwd(), 'src/apps/tools/index.html'),
        gallery: resolve(process.cwd(), 'src/apps/gallery/index.html'),
        projects: resolve(process.cwd(), 'src/apps/projects/index.html'),
        pinDesigner: resolve(process.cwd(), 'src/apps/pin-designer/index.html'),
        atlasBuilder: resolve(process.cwd(), 'src/apps/tools/atlas-builder/index.html'),
        atlasEmbed: resolve(process.cwd(), 'src/apps/tools/atlas-builder/embed.html'),
        pinWidgetDesigner: resolve(process.cwd(), 'src/apps/tools/pin-widget/ErrlPin.Widget/designer.html'),
        hueExamples: resolve(process.cwd(), 'src/fx/hue-examples.html'),
      },
    },
  },
});
