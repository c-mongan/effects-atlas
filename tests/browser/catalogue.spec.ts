import { test, expect } from "@playwright/test";

test("catalogue renders an accessible table with effect IDs", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=start-here-catalogue--docs&viewMode=docs");
  const table = page.getByRole("table");
  await expect(table).toBeVisible();
  await expect(table.getByRole("columnheader")).toHaveText([
    "ID",
    "Effect",
    "Engine",
    "License",
  ]);
  await expect(table.getByRole("row")).toHaveCount(29);
  await expect(
    table.getByRole("cell", { name: "liquid-morph", exact: true }),
  ).toBeVisible();
  await expect(
    table.getByRole("cell", { name: "ray-marched-fractals", exact: true }),
  ).toBeVisible();
});
