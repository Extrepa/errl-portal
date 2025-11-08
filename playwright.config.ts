import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  retries: 0,
  timeout: 30_000,
  use: {
    headless: true,
    baseURL: 'http://127.0.0.1:5173',
  },
  webServer: {
    command: 'vite --host=127.0.0.1 --port=5173 --strictPort',
    port: 5173,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
