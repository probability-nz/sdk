import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: {
    headless: true,
    browserName: 'chromium',
  },
  webServer: {
    command: 'pnpm --filter simple-plugin dev --port 5199',
    port: 5199,
    reuseExistingServer: true,
    timeout: 15_000,
  },
});
