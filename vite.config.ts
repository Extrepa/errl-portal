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
        main: resolve(process.cwd(), 'src/index.html'),
        about: resolve(process.cwd(), 'src/about.html'),
        apps: resolve(process.cwd(), 'src/apps/index.html'),
        appsAbout: resolve(process.cwd(), 'src/apps/about.html'),
        tools: resolve(process.cwd(), 'src/apps/tools/index.html'),
        pinDesigner: resolve(process.cwd(), 'src/apps/pin-designer/index.html'),
        devPanel: resolve(process.cwd(), 'src/apps/dev/index.html'),
        atlasBuilder: resolve(process.cwd(), 'src/apps/tools/atlas-builder/index.html'),
        atlasEmbed: resolve(process.cwd(), 'src/apps/tools/atlas-builder/embed.html'),
        assetBuilder: resolve(process.cwd(), 'src/apps/tools/asset-builder/embed.html'),
        pinWidgetDesigner: resolve(process.cwd(), 'src/apps/tools/pin-widget/ErrlPin.Widget/designer.html'),
        hueExamples: resolve(process.cwd(), 'src/fx/hue-examples.html'),
      },
    },
  },
});
