import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: 'src',
  resolve: {
    alias: {
      '@': resolve(process.cwd(), 'src'),
      '@assets': resolve(process.cwd(), 'src/shared/assets'),
      '@shared': resolve(process.cwd(), 'src/shared'),
      '@studio': resolve(process.cwd(), 'src/apps/studio'),
      '@legacy': resolve(process.cwd(), 'src/legacy'),
      '@errl-design-system': resolve(__dirname, '../all-components/errl-design-system/src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
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
