import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { renameSync, existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Plugin to rename index.html to designer.html after build
const renameDesignerHtmlPlugin = () => ({
  name: 'rename-designer-html',
  closeBundle() {
    const indexPath = resolve(process.cwd(), 'dist/src/apps/designer/index.html');
    const targetPath = resolve(process.cwd(), 'dist/designer.html');
    if (existsSync(indexPath)) {
      renameSync(indexPath, targetPath);
    }
  },
});

export default defineConfig({
  plugins: [react(), renameDesignerHtmlPlugin()],
  publicDir: 'src/apps/designer/public',
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
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
