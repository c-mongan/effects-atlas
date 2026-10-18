import { defineConfig } from "@playwright/test";
const browserName = process.env.ATLAS_BROWSER ?? "chromium";
if (!["chromium", "firefox", "webkit"].includes(browserName))
  throw Error("Unsupported ATLAS_BROWSER");
export default defineConfig({
  testDir: "tests/gallery",
  timeout: 45_000,
  expect: { timeout: 15_000 },
  workers: 1,
  reporter: [
    ["list"],
    ["json", { outputFile: `artifacts/gallery-${browserName}.json` }],
  ],
  use: {
    baseURL: "http://127.0.0.1:6008",
    browserName: browserName as "chromium" | "firefox" | "webkit",
    ...(browserName === "chromium" ? { channel: "chromium" } : {}),
    viewport: { width: 1440, height: 1000 },
  },
  webServer: {
    command: "node scripts/serve-gallery.mjs",
    url: "http://127.0.0.1:6008",
    reuseExistingServer: !process.env.CI,
  },
  outputDir: "artifacts/gallery-results",
});
