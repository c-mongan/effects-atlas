import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/browser",
  timeout: 45_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:6007",
    headless: true,
    channel: "chromium",
    viewport: { width: 1440, height: 1000 },
  },
  webServer: {
    command: "node scripts/serve-storybook.mjs",
    url: "http://127.0.0.1:6007",
    reuseExistingServer: !process.env.CI,
  },
  outputDir: "test-results",
});
