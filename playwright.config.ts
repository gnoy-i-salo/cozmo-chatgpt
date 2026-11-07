import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './apps',
  testMatch: '**/e2e/**/*.spec.{ts,tsx}',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  retries: process.env['CI'] ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    browserName: 'chromium',
    ...(process.env['PLAYWRIGHT_CHANNEL'] ? { channel: process.env['PLAYWRIGHT_CHANNEL'] } : {}),
    viewport: { width: 1200, height: 1100 },
    trace: 'retain-on-failure',
  },
  // Add a project, baseURL and webServer for each application when it exists.
});
