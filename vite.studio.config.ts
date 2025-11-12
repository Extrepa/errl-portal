import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({
  root: 'src',
  resolve: {
    alias: {
      '@': resolve(process.cwd(), 'src'),
      '@assets': resolve(process.cwd(), 'src/assets'),
      '@portal': resolve(process.cwd(), 'src/portal'),
      '@studio': resolve(process.cwd(), 'src/studio'),
      '@legacy': resolve(process.cwd(), 'src/legacy')
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
