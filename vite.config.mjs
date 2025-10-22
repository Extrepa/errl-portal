import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  server: {
    open: '/src/portal/pixi-gl/index.html',
    fs: { strict: false }
  },
  preview: {
    open: '/src/portal/pixi-gl/index.html'
  }
})
