import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  root: 'src',
  resolve: {
    alias: {
      '@': resolve(process.cwd(), 'src')
    }
  },
  build: {
    outDir: resolve(process.cwd(), 'dist-mini'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        studio: resolve(process.cwd(), 'src/studio.html'),
      }
    }
  }
});
