import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
export default defineConfig({
  test: {
    projects: [
      {
        plugins: [react()],
        test: {
          name: "unit",
          include: ["tests/**/*.test.ts?(x)"],
          environment: "jsdom",
          environmentOptions: { jsdom: { pretendToBeVisual: true } },
          setupFiles: ["tests/setup.ts"],
        },
      },
      {
        plugins: [storybookTest({ configDir: ".storybook" })],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({ launchOptions: { channel: "chromium" } }),
            instances: [{ browser: "chromium" }],
          },
        },
      },
    ],
  },
});
