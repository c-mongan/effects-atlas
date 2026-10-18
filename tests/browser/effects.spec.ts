import { PNG } from "pngjs";
import { createRequire } from "node:module";
import { test, expect, type Page } from "@playwright/test";
import { effects } from "../../src/catalog";
const require = createRequire(import.meta.url);
const slug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const url = (name: string, state = "default") =>
  `/iframe.html?id=effects-${slug(name)}--${state}&viewMode=story`;
async function requireWebGL(page: Page) {
  const supported = await page.evaluate(() => {
    const gl = document.createElement("canvas").getContext("webgl2");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!gl;
  });
  if (process.env.REQUIRE_GPU)
    expect(supported, "Native WebGL2 is required").toBe(true);
  test.skip(
    !supported,
    "WebGL2 unavailable; GPU-specific diagnostic skipped, fallback cases still run",
  );
}
test.beforeEach(async ({ page }) => {
  if (!process.env.ATLAS_NO_GPU) return;
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "gpu", {
      value: undefined,
      configurable: true,
    });
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
});
for (const mobile of [false, true]) {
  test.describe(mobile ? "mobile" : "desktop", () => {
    test.use({
      viewport: mobile
        ? { width: 390, height: 844 }
        : { width: 1440, height: 1000 },
      hasTouch: mobile,
      // Firefox supports narrow viewports and touch, but not isMobile emulation.
      isMobile: mobile && process.env.ATLAS_BROWSER !== "firefox",
    });
    for (const effect of effects) {
      test(effect.name, async ({ page }, testInfo) => {
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(String(error)));
        await page.goto(url(effect.name));
        await expect(
          page.getByRole("heading", { name: effect.name, exact: true }),
        ).toBeVisible();
        if (
          !process.env.REQUIRE_GPU &&
          ["webgpu", "paper", "three", "fractal"].includes(effect.renderer)
        ) {
          await expect(page.getByRole("status")).not.toContainText("Checking");
          if (
            (await page.getByRole("status").textContent())?.includes(
              "GPU unavailable",
            )
          ) {
            await expect(page.locator("[data-effect]")).toHaveAttribute(
              "data-active",
              "false",
            );
            expect(errors).toEqual([]);
            testInfo.annotations.push({
              type: "graphics",
              description: "GPU unavailable; static fallback verified",
            });
            return;
          }
        }
        await expect(page.locator("[data-effect]")).toHaveAttribute(
          "data-active",
          "true",
        );
        await expect(page.getByTestId("live-effect")).toBeVisible();
        if (["paper", "three", "fractal", "webgpu"].includes(effect.renderer)) {
          await expect(
            page.getByTestId("live-effect").locator("canvas"),
          ).toBeVisible();
          await page.waitForTimeout(effect.renderer === "webgpu" ? 2200 : 500);
          await expect(page.locator("[data-effect]")).toHaveAttribute(
            "data-active",
            "true",
          );
          expect(
            await page
              .locator("canvas")
              .first()
              .evaluate((element) => {
                const canvas = element as HTMLCanvasElement;
                return (
                  canvas.width > 0 &&
                  canvas.height > 0 &&
                  canvas.clientWidth > 0 &&
                  canvas.clientHeight > 0
                );
              }),
          ).toBe(true);
        }
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth > innerWidth,
          ),
        ).toBe(false);
        await page
          .getByTestId("effect-stage")
          .screenshot({ path: testInfo.outputPath("stage.png") });
        await page.addScriptTag({
          path: require.resolve("axe-core/axe.min.js"),
        });
        const violations = await page.evaluate(async () => {
          const axe = (
            window as unknown as {
              axe: {
                run: (selector: string) => Promise<{ violations: unknown[] }>;
              };
            }
          ).axe;
          return (await axe.run(".ea-effect")).violations;
        });
        expect(violations).toEqual([]);
        expect(errors).toEqual([]);
      });
    }
  });
}
for (const state of ["paused", "fallback"])
  for (const effect of effects) {
    test(`${state}: ${effect.name}`, async ({ page }) => {
      await page.goto(url(effect.name, state));
      await expect(page.locator("[data-effect]")).toHaveAttribute(
        "data-active",
        "false",
      );
      await expect(page.getByRole("status")).toContainText(/static preview/i);
      expect(await page.locator("canvas").count()).toBe(0);
      const stage = page.getByTestId("effect-stage");
      await page.waitForTimeout(200);
      expect(await page.evaluate(() => document.getAnimations().length)).toBe(
        0,
      );
      const markup = await stage.innerHTML();
      const before = await stage.screenshot();
      await page.waitForTimeout(100);
      const first = PNG.sync.read(before),
        second = PNG.sync.read(await stage.screenshot());
      expect([second.width, second.height]).toEqual([
        first.width,
        first.height,
      ]);
      let changed = 0;
      for (let i = 0; i < first.data.length; i += 4) {
        if (
          Math.max(
            Math.abs(first.data[i] - second.data[i]),
            Math.abs(first.data[i + 1] - second.data[i + 1]),
            Math.abs(first.data[i + 2] - second.data[i + 2]),
          ) > 8
        )
          changed++;
      }
      expect(
        changed / (first.width * first.height),
        "Static preview must remain visually stable",
      ).toBeLessThan(0.005);
      expect(await stage.innerHTML()).toBe(markup);
    });
  }
test("motion preference changes and pause unmount live GPU renderers", async ({
  page,
}) => {
  await page.goto(url("Metaballs"));
  await requireWebGL(page);
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByRole("button", { name: "Pause animation" }).click();
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.getByRole("button", { name: "Resume animation" }).click();
  await expect(page.locator("canvas")).toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.getByRole("status")).toContainText("Reduced motion");
});
test("GPU absence has readable static previews without page errors", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "gpu", { value: undefined });
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
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  for (const name of [
    "Metaballs",
    "Particle swarm",
    "Clay 3D",
    "Ray-marched fractals",
  ]) {
    await page.goto(url(name));
    await expect(page.getByRole("status")).toContainText("GPU unavailable");
    expect(await page.locator('[data-testid="live-effect"]').count()).toBe(0);
  }
  expect(errors).toEqual([]);
});
test("foil responds to keyboard and touch", async ({ page }) => {
  await page.goto(url("Holographic foil"));
  const card = page.getByRole("button", { name: /Chromatic.*surface/ });
  await card.focus();
  const before = await card.getAttribute("style");
  await card.press("ArrowRight");
  expect(await card.getAttribute("style")).not.toBe(before);
  await page.dispatchEvent(".ea-foil-card", "pointerdown", {
    pointerType: "touch",
    clientX: 700,
    clientY: 350,
  });
  expect(await card.getAttribute("style")).not.toBe(before);
});

test("fractal distance and normal stay finite at the origin and near zero", async ({
  page,
}) => {
  const { readFile } = await import("node:fs/promises");
  const fragment = await readFile(
    new URL("../../src/effects/mandelbulb.glsl", import.meta.url),
    "utf8",
  );
  await page.goto(url("Neon glow", "fallback"));
  await requireWebGL(page);
  const pixel = await page.evaluate((source) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const gl = canvas.getContext("webgl2")!;
    const program = gl.createProgram()!;
    const vertex =
      "#version 300 es\nvoid main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.0-1.0,0,1);}";
    const body = `void main(){vec2 a=mandelbulb_de(vec3(0.0));vec2 b=mandelbulb_de(vec3(1e-20));vec3 n=calc_normal(vec3(0.0));bool bad=any(isnan(a))||any(isinf(a))||any(isnan(b))||any(isinf(b))||any(isnan(n))||any(isinf(n));outColor=bad?vec4(1,0,1,1):vec4(0,1,0,1);}`;
    for (const [kind, text] of [
      [gl.VERTEX_SHADER, vertex],
      [
        gl.FRAGMENT_SHADER,
        source.slice(0, source.indexOf("void main()")) + body,
      ],
    ] as const) {
      const shader = gl.createShader(kind)!;
      gl.shaderSource(shader, text);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw Error(gl.getShaderInfoLog(shader) ?? "compile");
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw Error("link");
    gl.useProgram(program);
    gl.uniform1f(gl.getUniformLocation(program, "u_power"), 8);
    gl.uniform1f(gl.getUniformLocation(program, "u_max_iter"), 10);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    const pixels = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return [...pixels];
  }, fragment);
  expect(pixel).toEqual([0, 255, 0, 255]);
});

test("a lost WebGL context switches to a static preview", async ({ page }) => {
  await page.goto(url("Metaballs"));
  await requireWebGL(page);
  await expect(page.locator("canvas")).toBeVisible();
  await page.locator("canvas").evaluate((element) => {
    const canvas = element as HTMLCanvasElement;
    canvas
      .getContext("webgl2")
      ?.getExtension("WEBGL_lose_context")
      ?.loseContext();
  });
  await expect(page.getByRole("status")).toContainText("Renderer unavailable");
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("WebGPU initialization failure after a successful probe has a fallback", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const gpu = (
      navigator as unknown as {
        gpu?: { requestAdapter: (...args: unknown[]) => Promise<unknown> };
      }
    ).gpu;
    if (!gpu) return;
    // Keep the patched GPU object stable across WebKit navigator accesses.
    Object.defineProperty(navigator, "gpu", { value: gpu, configurable: true });
    const original = gpu.requestAdapter.bind(gpu);
    let requests = 0;
    gpu.requestAdapter = (...args: unknown[]) =>
      ++requests === 1 ? original(...args) : Promise.resolve(null);
  });
  await page.goto(url("Particle swarm"));
  await expect(page.getByRole("status")).toContainText(
    /Renderer unavailable|GPU unavailable/,
  );
  await expect(page.getByTestId("live-effect")).toHaveCount(0);
});

test("Paper initialization failure after a successful probe has a fallback", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    let requests = 0;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type === "webgl2" && ++requests > 1) return null;
      return Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await page.goto(url("Metaballs"));
  await expect(page.getByRole("status")).toContainText(
    /Renderer unavailable|GPU unavailable/,
  );
  await expect(page.getByTestId("live-effect")).toHaveCount(0);
  expect(errors).toEqual([]);
});
