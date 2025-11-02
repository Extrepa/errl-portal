import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  retries: 0,
  timeout: 30_000,
  use: {
    headless: true,
    baseURL: 'http://localhost:5173',
  },
  webServer: {
    command: 'vite --port=5173 --strictPort',
    port: 5173,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
