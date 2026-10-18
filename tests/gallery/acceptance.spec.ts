import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { unzipSync, strFromU8 } from "fflate";
const require = createRequire(import.meta.url);
for (const width of [320, 768, 1440])
  test(`gallery and compositions accessible at ${width}`, async ({
    page,
  }, info) => {
    await page.setViewportSize({ width, height: 1000 });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    for (const route of [
      "#/",
      "#/guide",
      "#/sources",
      "#/compositions/product-hero",
      "#/compositions/portfolio-card",
      "#/compositions/feature-section",
    ]) {
      await page.goto("/" + route);
      await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
      const violations = await page.evaluate(
        async () => (await (window as any).axe.run(document.body)).violations,
      );
      expect(violations, route).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        route,
      ).toBe(false);
      await page.screenshot({
        path: info.outputPath(route.replace(/[^a-z0-9]/gi, "-") + ".png"),
        fullPage: true,
      });
    }
    expect(errors).toEqual([]);
  });
test("downloaded starter preserves controls and includes installable files", async ({
  page,
}) => {
  await page.goto("/#/example/mesh-gradient?speed=0.7&colors=%2339d9c8");
  const code = await page.locator("pre code").textContent();
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download starter ↓", exact: true })
    .click();
  const download = await pending;
  const path = await download.path();
  expect(path).toBeTruthy();
  const files = unzipSync(await readFile(path!));
  expect(strFromU8(files["App.tsx"])).toBe(code);
  expect(strFromU8(files["App.tsx"])).toContain('"speed":0.7');
  for (const file of [
    "package.json",
    "package-lock.json",
    "effects-atlas.tgz",
    "LICENSE",
    "THIRD_PARTY_NOTICES.md",
    "licenses/motion.txt",
  ])
    expect(files[file], file).toBeTruthy();
  expect(
    JSON.parse(strFromU8(files["tsconfig.json"])).compilerOptions.types,
  ).toContain("vite/client");
});
test("legacy iframe and all parameters reach Storybook", async ({ page }) => {
  await page.goto("/iframe.html?id=effects-neon-glow--paused&viewMode=story");
  await expect(page).toHaveURL(
    /\/storybook\/iframe.html\?id=effects-neon-glow--paused&viewMode=story/,
  );
  await expect(
    page.getByRole("heading", { name: "Neon glow", exact: true }),
  ).toBeVisible();
});
test("detail respects reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#/example/particle-swarm");
  await expect(page.locator(".ea-effect")).toHaveAttribute(
    "data-active",
    "false",
  );
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("gallery explains unavailable GPU previews", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "gpu", {
      value: undefined,
      configurable: true,
    }),
  );
  await page.goto("/#/example/particle-swarm");
  await expect(
    page.getByText("GPU unavailable: static preview", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
});
