import { test, expect } from "@playwright/test";

for (const width of [320, 390, 1440]) {
  test(`glass panel stays inside its stage at ${width}px`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(
      "/iframe.html?id=effects-glassmorphism--default&viewMode=story",
    );
    const panelLocator = page.locator(".ea-glass-panel");
    await expect(panelLocator).toBeVisible();
    const stage = await page.getByTestId("effect-stage").boundingBox();
    const panel = await panelLocator.boundingBox();
    expect(stage).not.toBeNull();
    expect(panel).not.toBeNull();
    expect(panel!.x).toBeGreaterThanOrEqual(stage!.x);
    expect(panel!.x + panel!.width).toBeLessThanOrEqual(
      stage!.x + stage!.width,
    );
    await page
      .getByTestId("effect-stage")
      .screenshot({ path: testInfo.outputPath("glass-stage.png") });
  });
}
