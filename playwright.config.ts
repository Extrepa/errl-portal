import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  retries: 0,
  timeout: 30_000,
  use: {
    headless: true,
    // Bind to localhost to cover IPv4/IPv6 (::1) listeners
    baseURL: 'http://localhost:5173',
  },
  webServer: {
    // Use localhost host to avoid 127.0.0.1 vs ::1 mismatch on macOS
    command: 'vite --host=localhost --port=5173 --strictPort',
    port: 5173,
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
