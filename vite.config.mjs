import { defineConfig } from 'vite'

export default defineConfig({
  root: './src',
  base: '/errl-portal/',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  server: {
    open: '/portal/pixi-gl/index.html',
    fs: { strict: false }
  },
  preview: {
    open: '/portal/pixi-gl/index.html'
  }
})
