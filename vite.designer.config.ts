import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: 'src',
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(process.cwd(), 'src'),
      '@shared': resolve(process.cwd(), 'src/shared'),
      '@designer': resolve(process.cwd(), 'src/apps/designer/src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'zustand', 'paper'],
  },
  build: {
    outDir: resolve(process.cwd(), 'dist'),
    emptyOutDir: false,
    rollupOptions: {
      input: {
        'designer.html': resolve(process.cwd(), 'src/apps/designer/index.html'),
      },
    },
  },
});
