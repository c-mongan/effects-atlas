import { cp, mkdir, writeFile, access } from "node:fs/promises";
import { join, resolve } from "node:path";
const root = resolve(import.meta.dirname, "..");
const output = join(root, "site-dist");
// Vite has already built the gallery into site-dist. Fail if any required input is absent.
for (const path of [
  "site-dist/index.html",
  "storybook-static/index.html",
  ".generated/starters/template.json",
  ".generated/starters/effects-atlas.tgz",
])
  await access(join(root, path));
await mkdir(output, { recursive: true });
await cp(join(root, "storybook-static"), join(output, "storybook"), {
  recursive: true,
});
await cp(join(root, ".generated/starters"), join(output, "starters"), {
  recursive: true,
  filter: (path) => !path.split("/").some((part) => part.startsWith(".build-")),
});
await writeFile(
  join(output, "iframe.html"),
  '<!doctype html><html lang="en"><meta charset="utf-8"><title>Opening Storybook</title><script>location.replace("./storybook/iframe.html" + location.search + location.hash)</script><p><a href="./storybook/">Open Storybook</a></p></html>\n',
);
console.log(`Gallery, starter assets and Storybook assembled in ${output}`);
