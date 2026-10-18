import { defineConfig } from "@playwright/test";
const browserName = process.env.ATLAS_BROWSER ?? "chromium";
if (!["chromium", "firefox", "webkit"].includes(browserName)) {
  throw new Error(`Unsupported ATLAS_BROWSER: ${browserName}`);
}
export default defineConfig({
  testDir: "tests/browser",
  timeout: 45_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [
    ["list"],
    ["html", { open: "never" }],
    ["json", { outputFile: `artifacts/${browserName}-results.json` }],
  ],
  use: {
    baseURL: "http://127.0.0.1:6007",
    headless: true,
    browserName: browserName as "chromium" | "firefox" | "webkit",
    ...(browserName === "chromium" ? { channel: "chromium" } : {}),
    viewport: { width: 1440, height: 1000 },
  },
  webServer: {
    command: "node scripts/serve-storybook.mjs",
    url: "http://127.0.0.1:6007",
    reuseExistingServer: !process.env.CI,
  },
  outputDir: "test-results",
});
