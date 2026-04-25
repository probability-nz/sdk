import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  use: {
    baseURL: "https://localhost:3020",
    ignoreHTTPSErrors: true,
    headless: true,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "pnpm dev",
    url: "https://localhost:3020",
    ignoreHTTPSErrors: true,
    reuseExistingServer: process.env.CI === undefined,
  },
});
