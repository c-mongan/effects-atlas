import { test, expect } from "@playwright/test";
import { examples } from "../../src/discovery";
for (const example of examples)
  test(`gallery renders ${example.id}`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(String(error)));
    await page.goto(`/#/example/${example.id}`);
    await expect(
      page.getByRole("heading", { name: example.name, exact: true, level: 1 }),
    ).toBeVisible();
    const host = page.locator(".preview .ea-effect");
    await expect(host).toBeVisible();
    await expect(page.locator(".ea-stage")).toHaveCSS("position", "relative");
    const status = host.locator('.ea-toolbar [role="status"]');
    await expect(status).not.toContainText(/Checking|Outside viewport/);
    if ((await status.textContent())?.includes("GPU unavailable")) {
      info.annotations.push({
        type: "graphics",
        description: "GPU unavailable; labelled fallback verified",
      });
      await expect(status).toBeVisible();
      await expect(page.locator("canvas")).toHaveCount(0);
      return;
    }
    await expect(host).toHaveAttribute("data-active", "true");
    if (example.id === "confetti")
      await page
        .getByRole("button", { name: "Celebrate", exact: true })
        .click();
    if (
      ["webgpu", "paper", "fractal", "three", "particles"].includes(
        example.renderer,
      )
    ) {
      const canvas = page.locator(".preview canvas").first();
      await expect(canvas).toBeVisible();
      expect(
        await canvas.evaluate((el) => el.getBoundingClientRect().height),
      ).toBeGreaterThan(100);
    }
    if (example.kind === "effect")
      await expect(page.getByTestId("live-effect")).toHaveCSS(
        "position",
        "absolute",
      );
    if (example.id === "neon-glow")
      expect(
        await page
          .locator(".ea-neon")
          .evaluate((e) => getComputedStyle(e).textShadow),
      ).not.toBe("none");
    await page.waitForTimeout(example.renderer === "webgpu" ? 2200 : 300);
    await expect(host).toHaveAttribute("data-active", "true");
    expect(errors).toEqual([]);
  });
test("gallery WebGPU stays ready beyond the startup deadline", async ({
  page,
}, info) => {
  await page.goto("/#/example/particle-swarm");
  const status = page.locator('.ea-toolbar [role="status"]');
  await expect(status).not.toContainText(/Checking|Outside viewport/);
  if ((await status.textContent())?.includes("GPU unavailable")) {
    info.annotations.push({
      type: "graphics",
      description: "WebGPU unavailable; fallback",
    });
    await expect(status).toBeVisible();
    return;
  }
  await expect(page.locator("canvas")).toBeVisible();
  await page.waitForTimeout(16000);
  await expect(page.locator(".ea-effect")).toHaveAttribute(
    "data-active",
    "true",
  );
  await expect(page.locator("canvas")).toBeVisible();
});
