import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createServer } from "node:http";
import {
  readFile,
  writeFile,
  mkdir,
  mkdtemp,
  cp,
  readdir,
} from "node:fs/promises";
import { join, resolve, extname, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import { zipSync, unzipSync, strToU8, strFromU8 } from "fflate";
import { renderExample } from "../starter-template/code.mjs";

const root = resolve(import.meta.dirname, "..");
const exec = promisify(execFile);
const assets = join(root, ".generated/starters");
const manifest = JSON.parse(
  await readFile(join(assets, "template.json"), "utf8"),
);
await mkdir(join(root, ".generated/consumers"), { recursive: true });
const consumer = await mkdtemp(join(root, ".generated/consumers/starter-"));
const report = {
  consumer,
  checkedAt: new Date().toISOString(),
  cases: [],
  errors: [],
};
const command = (args) =>
  exec("npm", args, { cwd: consumer, maxBuffer: 6_000_000 });
for (const [name, content] of Object.entries(manifest.files)) {
  await mkdir(resolve(consumer, name, ".."), { recursive: true });
  await writeFile(join(consumer, name), content);
}
await cp(
  join(assets, "effects-atlas.tgz"),
  join(consumer, "effects-atlas.tgz"),
);
await command(["ci", "--no-fund", "--no-audit"]);
const { effects, recipes } = await import(
  pathToFileURL(join(consumer, "node_modules/effects-atlas/dist/index.js")).href
);
assert.equal(effects.length, 28, "Expected 28 effects");
assert.equal(recipes.length, 12, "Expected 12 recipes");
const examples = [
  ...effects.map((entry) => ({ ...entry, kind: "effect" })),
  ...recipes.map((entry) => ({ ...entry, kind: "recipe" })),
];
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".json": "application/json",
};
const dist = join(consumer, "dist");
const server = createServer(async (req, res) => {
  try {
    const name = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    const path = resolve(dist, `.${name === "/" ? "/index.html" : name}`);
    if (!path.startsWith(dist + sep)) {
      res.writeHead(403).end();
      return;
    }
    const content = await readFile(path);
    res.writeHead(200, {
      "Content-Type": mime[extname(path)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(content);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({ channel: "chromium" });
  for (const entry of examples) {
    const selection = {
      kind: entry.kind,
      id: entry.id,
      settings: {
        speed: 0.7,
        intensity: 0.6,
        colors: ["#39d9c8", "#a47cff", "#f6bf67"],
      },
    };
    const app = renderExample(selection);
    assert(
      app.includes(JSON.stringify(selection.settings)),
      "Code must preserve the exact selected settings",
    );
    // Exercise the same ZIP format used by the gallery before extracting App.tsx.
    const archiveFiles = Object.fromEntries(
      Object.entries(manifest.files).map(([name, content]) => [
        name,
        strToU8(content),
      ]),
    );
    archiveFiles["App.tsx"] = strToU8(app);
    archiveFiles["effects-atlas.tgz"] = new Uint8Array(
      await readFile(join(assets, "effects-atlas.tgz")),
    );
    const archive = unzipSync(zipSync(archiveFiles));
    assert.deepEqual(
      archive["effects-atlas.tgz"],
      archiveFiles["effects-atlas.tgz"],
      "ZIP must preserve the bundled package",
    );
    assert.equal(
      strFromU8(archive["App.tsx"]),
      app,
      "ZIP App must equal the displayed code",
    );
    for (const name of [
      "LICENSE",
      "THIRD_PARTY_NOTICES.md",
      "package-lock.json",
      "effects-atlas.tgz",
      ...(await readdir(join(root, "licenses")).then((names) =>
        names.map((name) => `licenses/${name}`),
      )),
    ])
      assert(archive[name], `ZIP lacks ${name}`);
    await writeFile(join(consumer, "App.tsx"), strFromU8(archive["App.tsx"]));
    await command(["run", "build"]);
    const page = await browser.newPage({ reducedMotion: "no-preference" });
    const errors = [],
      remote = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => {
      if (!request.url().startsWith(origin) && /^https?:/.test(request.url()))
        remote.push(request.url());
    });
    try {
      await page.goto(origin, { waitUntil: "networkidle" });
      const host = page.locator(`[data-${entry.kind}="${entry.id}"]`).first();
      await host.waitFor();
      assert(
        (await host.innerText()).includes(entry.name),
        `Missing heading for ${entry.id}`,
      );
      const cssLoaded = await page.locator("link[rel=stylesheet]").count();
      assert(cssLoaded > 0, "Production CSS was not linked");
      assert(
        await host.evaluate((node) =>
          getComputedStyle(node).fontFamily.includes("system"),
        ),
        "Expected component CSS",
      );
      if (entry.id === "neon-glow")
        assert.equal(
          await host.evaluate((node) =>
            node.style.getPropertyValue("--ea-neon-intensity"),
          ),
          "0.6",
        );
      if (entry.kind === "recipe" && entry.renderer === "motion") {
        assert.equal(
          await host
            .locator(".ea-recipe-content")
            .evaluate((node) => node.style.getPropertyValue("--recipe-accent")),
          selection.settings.colors[0],
        );
      }
      const capability = await page.evaluate(async (renderer) => {
        if (renderer === "webgpu") {
          try {
            return !!(navigator.gpu && (await navigator.gpu.requestAdapter()));
          } catch {
            return false;
          }
        }
        if (["paper", "three", "fractal"].includes(renderer)) {
          const gl = document.createElement("canvas").getContext("webgl2");
          if (!gl) return false;
          gl.getExtension("WEBGL_lose_context")?.loseContext();
        }
        return true;
      }, entry.renderer);
      await page.waitForFunction(() => {
        const status =
          document.querySelector(".ea-toolbar [role=status]")?.textContent ??
          "";
        return (
          status.includes("Animation active") ||
          status.includes("GPU unavailable") ||
          status.includes("Renderer unavailable")
        );
      });
      const initialStatus = await host
        .locator(".ea-toolbar [role=status]")
        .innerText();
      assert(
        !initialStatus.includes("Renderer unavailable"),
        `${entry.id}: renderer failed after capability detection`,
      );
      if (initialStatus.includes("GPU unavailable")) {
        assert.equal(
          capability,
          false,
          `${entry.id}: GPU fallback despite supported graphics API`,
        );
        assert.equal(await host.getAttribute("data-active"), "false");
      } else {
        assert.equal(
          capability,
          true,
          `${entry.id}: active without its required graphics API`,
        );
        if (
          ["paper", "three", "fractal", "webgpu", "particles"].includes(
            entry.renderer,
          ) &&
          entry.id !== "confetti"
        )
          await host.locator("canvas").first().waitFor();
      }
      if (process.env.REQUIRE_GPU)
        assert.equal(
          capability,
          true,
          "REQUIRE_GPU demands native graphics support",
        );
      if (entry.id === "confetti") {
        assert.equal(
          await host.locator("canvas").count(),
          0,
          "Confetti must wait for Celebrate",
        );
        await host
          .getByRole("button", { name: "Celebrate", exact: true })
          .click();
        await host.locator("canvas").waitFor();
        assert(
          (
            await host.locator(".ea-recipe-celebrate [role=status]").innerText()
          ).includes("Success!"),
        );
      }
      if (entry.id === "spring-card") {
        const save = host.getByRole("button", { name: /save this idea/i });
        await save.click();
        assert.equal(
          await host
            .getByRole("button", { name: /added to collection/i })
            .getAttribute("aria-pressed"),
          "true",
        );
      }
      if (["shared-layout-tabs", "animated-panel"].includes(entry.id)) {
        const build = host.getByRole("tab", { name: "Build" });
        await build.click();
        assert.equal(await build.getAttribute("aria-selected"), "true");
        await page.waitForFunction(() =>
          document
            .querySelector('[role="tabpanel"]')
            ?.textContent?.includes("Build with care"),
        );
      }
      assert(
        !(await host.locator(".ea-toolbar [role=status]").innerText()).includes(
          "Renderer unavailable",
        ),
        `${entry.id}: live renderer failed before pause`,
      );
      const pause = host
        .getByRole("button", { name: /pause animation/i })
        .first();
      await pause.click();
      assert.equal(
        await host
          .getByRole("button", { name: /resume animation/i })
          .first()
          .getAttribute("aria-pressed"),
        "true",
      );
      await host
        .getByRole("button", { name: /resume animation/i })
        .first()
        .click();
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.waitForFunction(() =>
        [...document.querySelectorAll("[data-active]")].every(
          (node) => node.getAttribute("data-active") === "false",
        ),
      );
      if (entry.id === "confetti") {
        for (const mode of ["paused", "reduced"]) {
          await page.emulateMedia({
            reducedMotion: mode === "reduced" ? "reduce" : "no-preference",
          });
          await page.reload({ waitUntil: "networkidle" });
          if (mode === "paused")
            await host
              .getByRole("button", { name: "Pause animation", exact: true })
              .click();
          assert(
            (
              await host
                .locator(".ea-recipe-celebrate [role=status]")
                .innerText()
            ).includes("Mark a milestone"),
          );
          await host
            .getByRole("button", { name: "Celebrate", exact: true })
            .click();
          assert(
            (
              await host
                .locator(".ea-recipe-celebrate [role=status]")
                .innerText()
            ).includes("Success!"),
            `${mode}: success feedback is required`,
          );
          assert.equal(
            await host.getAttribute("data-active"),
            "false",
            `${mode}: motion must stay off`,
          );
          assert.equal(
            await host.locator("canvas").count(),
            0,
            `${mode}: no confetti canvas`,
          );
        }
      }
      assert(
        !(await host.locator(".ea-toolbar [role=status]").innerText()).includes(
          "Renderer unavailable",
        ),
        "Renderer must not fail silently",
      );
      assert.deepEqual(errors, [], "Browser page errors");
      assert.deepEqual(remote, [], "Starter fetched a remote runtime asset");
      report.cases.push({
        kind: entry.kind,
        id: entry.id,
        settings: selection.settings,
        graphics: { supported: capability, initialStatus },
        checks: [
          "ZIP licences",
          "locked npm ci",
          "TypeScript",
          "Vite production build",
          "heading",
          "CSS",
          "pause/resume",
          "renderer failure rejected; unsupported API fallback checked",
          ...(entry.id === "confetti"
            ? [
                "Celebrate trigger",
                "paused success feedback",
                "reduced-motion success feedback",
              ]
            : []),
          "reduced motion",
          "no page errors",
          "no remote runtime assets",
        ],
      });
      console.log(
        `Verified ${report.cases.length}/${examples.length}: ${entry.kind}/${entry.id}`,
      );
    } finally {
      await page.close();
    }
  }
} catch (error) {
  report.errors.push(error.stack ?? String(error));
  throw error;
} finally {
  await browser?.close();
  await new Promise((done) => server.close(done));
  await mkdir(join(root, "artifacts"), { recursive: true });
  await writeFile(
    join(root, "artifacts/starter-results.json"),
    JSON.stringify(report, null, 2) + "\n",
  );
}
console.log(
  `All ${report.cases.length} starters passed. Consumer retained at ${consumer}`,
);
