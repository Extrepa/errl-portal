import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': '/src',
      '@/shared': path.resolve(__dirname, '../shared'),
      '@errl-design-system': path.resolve(__dirname, '../all-components/errl-design-system/src'),
    },
  },
})

