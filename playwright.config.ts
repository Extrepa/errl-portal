import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  retries: 0,
  timeout: 30_000,
  use: {
    headless: false, // Use headed mode for visibility
    // Bind to localhost to cover IPv4/IPv6 (::1) listeners
    baseURL: 'http://127.0.0.1:5173',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    launchOptions: {
      args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']
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
