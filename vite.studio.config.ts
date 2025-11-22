import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  root: 'src',
  resolve: {
    alias: {
      '@': resolve(process.cwd(), 'src'),
      '@assets': resolve(process.cwd(), 'src/shared/assets'),
      '@shared': resolve(process.cwd(), 'src/shared'),
      '@studio': resolve(process.cwd(), 'src/apps/studio'),
      '@legacy': resolve(process.cwd(), 'src/legacy')
    }
  },
  build: {
    outDir: resolve(process.cwd(), 'dist-mini'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        studio: resolve(process.cwd(), 'src/apps/studio/index.html'),
      }
    }
  }
});
