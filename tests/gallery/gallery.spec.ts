import { test, expect } from "@playwright/test";
test("gallery is static on arrival and filters all 40 examples", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".example-card")).toHaveCount(40);
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator('[data-preview-active="true"]')).toHaveCount(0);
  await page.getByRole("searchbox").fill("mesh");
  await expect(page.locator(".example-card")).toHaveCount(1);
  await page.getByRole("searchbox").fill("no-such-effect");
  await expect(
    page.getByText("No examples match these filters."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear all filters" }).click();
  await page.getByLabel("Engine", { exact: true }).selectOption("motion");
  await expect(page.locator(".example-card")).toHaveCount(6);
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await expect(page.locator(".example-card")).toHaveCount(40);
});
test("one gallery preview is mounted and leaving pauses it", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Play Liquid morph", exact: true })
    .click();
  await expect(page.locator('[data-preview-active="true"]')).toHaveCount(1);
  await page
    .getByRole("button", { name: "Play ASCII art", exact: true })
    .click();
  await expect(page.locator('[data-preview-active="true"]')).toHaveCount(1);
  await page.getByRole("heading", { name: "The collection" }).hover();
  await expect(page.locator('[data-preview-active="true"]')).toHaveCount(0);
});
test("detail validates hash settings and preserves valid controls", async ({
  page,
}) => {
  await page.goto(
    "/#/example/mesh-gradient?speed=1.5&intensity=999&colors=%23ff0000,%2300ff00",
  );
  await expect(page.getByRole("slider", { name: /Speed/ })).toHaveValue("1.5");
  await expect(page.getByRole("slider", { name: /Intensity/ })).toHaveCount(0);
  await expect(page.getByLabel("Color 1", { exact: true })).toHaveValue(
    "#ff0000",
  );
  await page.getByRole("button", { name: "Reset settings" }).click();
  await expect(page).toHaveURL(/#\/example\/mesh-gradient$/);
  await page.goto("/#/example/mesh-gradient?speed=NaN&colors=not-a-color");
  await expect(page.getByRole("slider", { name: /Speed/ })).toHaveValue("1");
  await expect(page.getByLabel("Color 1", { exact: true })).toHaveValue(
    "#5248c8",
  );
});
test("clipboard failure offers selectable code", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("denied")) },
      configurable: true,
    }),
  );
  await page.goto("/#/example/neon-glow");
  await page.getByRole("button", { name: "Copy code" }).click();
  await expect(
    page.getByRole("textbox", { name: "Code to copy manually" }),
  ).toBeVisible();
});
test("guide sources and composition anchors remain within the site", async ({
  page,
}) => {
  await page.goto("/#/guide");
  await expect(
    page.getByRole("heading", { name: "Keep it accessible" }),
  ).toBeVisible();
  await page.goto("/#/sources");
  await expect(page.getByRole("link", { name: "React Bits ↗" })).toBeVisible();
  for (const id of ["product-hero", "portfolio-card", "feature-section"]) {
    await page.goto(`/#/compositions/${id}`);
    await expect(page.locator(".composition h1")).toBeVisible();
    await page.getByRole("link", { name: "See how it works →" }).click();
    await expect(page).toHaveURL(new RegExp(`#/compositions/${id}$`));
    await expect(page.locator("#composition-details")).toBeFocused();
  }
});
test("phone layout stays in the viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const route of [
    "#/",
    "#/example/mesh-gradient",
    "#/guide",
    "#/compositions/product-hero",
    "#/compositions/portfolio-card",
    "#/compositions/feature-section",
  ]) {
    await page.goto(`/${route}`);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});
test("old story links redirect to Storybook", async ({ page }) => {
  await page.goto("/?path=/story/effects-neon-glow--default");
  await expect(page).toHaveURL(/\/storybook\/\?path=/);
});
test("unknown route gives a recovery link", async ({ page }) => {
  await page.goto("/#/example/not-an-example");
  await expect(
    page.getByRole("heading", { name: "That example is not here." }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Back to the collection →", exact: true })
    .click();
  await expect(page.locator(".example-card")).toHaveCount(40);
});
test("keyboard activation and offscreen removal keep the preview budget", async ({
  page,
}) => {
  await page.goto("/");
  const play = page.getByRole("button", {
    name: "Play ASCII art",
    exact: true,
  });
  await play.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator('[data-preview-active="true"]')).toHaveCount(1);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(page.locator('[data-preview-active="true"]')).toHaveCount(0);
  await expect(page.locator('[data-testid="live-effect"]')).toHaveCount(0);
});

test("palette controls match renderer slots and fill partial overrides", async ({
  page,
}) => {
  await page.goto("/#/example/mesh-gradient?colors=%23ff0000");
  await expect(page.locator('input[type="color"]')).toHaveCount(4);
  await expect(page.getByLabel("Color 1", { exact: true })).toHaveValue(
    "#ff0000",
  );
  await expect(page.getByLabel("Color 2", { exact: true })).toHaveValue(
    "#b58cf1",
  );
  await expect(page.getByLabel("Color 4", { exact: true })).toHaveValue(
    "#a4d9d5",
  );
  await page.goto("/#/example/metaballs?colors=%23ff0000,%2300ff00");
  await expect(page.locator('input[type="color"]')).toHaveCount(1);
  await expect(page.getByLabel("Color 1", { exact: true })).toHaveValue(
    "#302b65",
  );
  await page.goto("/#/example/dithering");
  await expect(page.locator('input[type="color"]')).toHaveCount(1);
  await expect(page.getByLabel("Color 1", { exact: true })).toHaveValue(
    "#aaa5ec",
  );
});
test("paused detail keeps recipe controls usable", async ({ page }) => {
  await page.goto("/#/example/shared-layout-tabs");
  await page.getByRole("tab", { name: "Build", exact: true }).waitFor();
  await page
    .getByRole("button", { name: "Pause preview", exact: true })
    .click();
  await page.getByRole("tab", { name: "Build", exact: true }).click();
  await expect(
    page.getByRole("tab", { name: "Build", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.locator('.ea-recipe-switcher [role="tabpanel"]'),
  ).toContainText("Build with care");
  await expect(
    page.locator('[data-recipe="shared-layout-tabs"]'),
  ).toHaveAttribute("data-active", "false");
});
test("mobile recipe content fits its detail stage", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#/example/staggered-features");
  const items = page.locator(".detail-stage .ea-recipe-features article");
  await expect(items).toHaveCount(3);
  const bounds = await items.evaluateAll((nodes) =>
    nodes.map((node) => {
      const item = node.getBoundingClientRect();
      const stage = node.closest(".preview")!.getBoundingClientRect();
      return (
        item.left >= stage.left &&
        item.right <= stage.right &&
        item.top >= stage.top &&
        item.bottom <= stage.bottom
      );
    }),
  );
  expect(bounds).toEqual([true, true, true]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("legacy redirect keeps story args and fragment", async ({ page }) => {
  await page.goto(
    "/?path=/story/effects-neon-glow--default&args=paused:true&viewMode=story#details",
  );
  await expect(page).toHaveURL(
    /\/storybook\/\?path=\/story\/effects-neon-glow--default&args=paused:true&viewMode=story#details$/,
  );
});

test("source filters group a library and combine with engine", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByLabel("Source", { exact: true })
    .selectOption("Paper Shaders");
  await expect(page.locator(".example-card")).toHaveCount(8);
  await page.getByLabel("Engine", { exact: true }).selectOption("webgpu");
  await expect(
    page.getByText("No examples match these filters."),
  ).toBeVisible();
});
