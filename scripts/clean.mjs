import { rm } from "node:fs/promises";
// Delete only this package's generated library output before emitting declarations.
await rm(new URL("../dist/", import.meta.url), {
  recursive: true,
  force: true,
});
