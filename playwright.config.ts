import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  retries: 1,
  timeout: 30_000,
  workers: 1, // Use single worker to avoid Chromium crashes
  use: {
    headless: true, // Use headless mode for stability
    // Bind to localhost to cover IPv4/IPv6 (::1) listeners
    baseURL: 'http://127.0.0.1:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    launchOptions: {
      args: [
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-dev-shm-usage', // Overcome limited resource problems
        '--no-sandbox' // Bypass OS security model for stability
      ]
    }
  },
  webServer: {
    // Use 127.0.0.1 to avoid IPv6 permission issues
    command: 'vite --host=127.0.0.1 --port=5173 --strictPort',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
  outputDir: 'test-results',
});
