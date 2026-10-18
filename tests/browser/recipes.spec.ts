import { test, expect } from "@playwright/test";
import { createRequire } from "node:module";
import { recipes } from "../../src/recipes/catalog";
const require = createRequire(import.meta.url);
const story = (id: string, state = "default") =>
  `/iframe.html?id=recipes-${id}--${state}&viewMode=story`;
for (const width of [1440, 390]) {
  test.describe(`recipes ${width}px`, () => {
    test.use({ viewport: { width, height: 1000 } });
    for (const recipe of recipes)
      test(recipe.id, async ({ page }, info) => {
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(String(error)));
        await page.goto(story(recipe.id));
        await expect(
          page.getByRole("heading", { name: recipe.name, exact: true }),
        ).toBeVisible();
        const status = page.locator('.ea-toolbar [role="status"]');
        await expect(status).not.toContainText(/Checking|Outside viewport/);
        if (
          recipe.renderer === "three" &&
          (await status.textContent()) === "GPU unavailable"
        ) {
          expect(process.env.REQUIRE_GPU, "Native GPU requested").toBeFalsy();
          info.annotations.push({
            type: "graphics",
            description: "WebGL unavailable; static fallback",
          });
        } else {
          await expect(page.locator("[data-recipe]")).toHaveAttribute(
            "data-active",
            "true",
          );
          if (recipe.id === "confetti")
            await page
              .getByRole("button", { name: "Celebrate", exact: true })
              .click();
          if (recipe.renderer !== "motion")
            await expect(page.locator("canvas")).toBeVisible();
          await page.waitForTimeout(350);
          await expect(status).not.toContainText("Renderer unavailable");
        }
        await page.addScriptTag({
          path: require.resolve("axe-core/axe.min.js"),
        });
        const violations = await page.evaluate(
          async () => (await (window as any).axe.run(".ea-recipe")).violations,
        );
        expect(violations).toEqual([]);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
        ).toBe(false);
        expect(errors).toEqual([]);
        await page
          .getByTestId("recipe-stage")
          .screenshot({ path: info.outputPath("stage.png") });
      });
  });
}
for (const state of ["paused", "fallback"])
  for (const recipe of recipes)
    test(`${state} recipe ${recipe.id}`, async ({ page }) => {
      await page.goto(story(recipe.id, state));
      await expect(page.locator("[data-recipe]")).toHaveAttribute(
        "data-active",
        "false",
      );
      await expect(page.locator("canvas")).toHaveCount(0);
      if (recipe.id === "confetti") {
        await page
          .getByRole("button", { name: "Celebrate", exact: true })
          .click();
        await expect(
          page.getByText("Success! Your milestone is complete."),
        ).toBeVisible();
      }
      if (
        recipe.id === "shared-layout-tabs" ||
        recipe.id === "animated-panel"
      ) {
        await page.getByRole("tab", { name: "Build", exact: true }).click();
        await expect(page.getByRole("tabpanel")).toContainText(
          "Build with care",
        );
      }
      await page.waitForTimeout(150);
      expect(
        await page.evaluate(
          () =>
            document.getAnimations().filter((a) => a.playState === "running")
              .length,
        ),
      ).toBe(0);
    });
test("recipe offscreen cleanup and reduced-motion controls", async ({
  page,
}) => {
  await page.goto(story("linked-particles"));
  await expect(page.locator("canvas")).toBeVisible();
  await page.evaluate(() => {
    document.body.style.paddingTop = "2000px";
  });
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.getByTestId("recipe-stage").scrollIntoViewIfNeeded();
  await expect(page.locator("canvas")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.goto(story("shared-layout-tabs"));
  await page.getByRole("tab", { name: "Explore", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Build", exact: true }),
  ).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText("Build with care");
});

test("three recipes keep readable fallbacks when WebGL is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      return ["webgl", "webgl2"].includes(type)
        ? null
        : Reflect.apply(get, this, [type, ...args]);
    } as typeof get;
  });
  for (const id of [
    "glass-transmission",
    "reflective-pedestal",
    "floating-object",
  ]) {
    await page.goto(story(id));
    await expect(page.locator('.ea-toolbar [role="status"]')).toContainText(
      "GPU unavailable",
    );
    await expect(page.locator("canvas")).toHaveCount(0);
    await expect(page.getByTestId("recipe-static")).toBeVisible();
  }
});
