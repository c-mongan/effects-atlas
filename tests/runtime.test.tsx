import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Effect } from "../src/Effect";
import { detectCapability } from "../src/runtime/capabilities";

let reduced = false;
let notify: (() => void) | undefined;
beforeEach(() => {
  reduced = false;
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      get matches() {
        return reduced;
      },
      addEventListener: (_name: string, fn: () => void) => {
        notify = fn;
      },
      removeEventListener: vi.fn(),
    })),
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  notify = undefined;
});
describe("Effect safe states", () => {
  it("removes the live effect when motion preference changes after mounting", async () => {
    render(<Effect id="neon-glow" />);
    expect(await screen.findByTestId("live-effect")).toBeTruthy();
    act(() => {
      reduced = true;
      notify?.();
    });
    expect(screen.queryByTestId("live-effect")).toBeNull();
    expect(screen.getByText(/reduced motion/i)).toBeTruthy();
  });
  it("allows pause and resume without ignoring the user preference", async () => {
    render(<Effect id="neon-glow" />);
    fireEvent.click(screen.getByRole("button", { name: "Pause animation" }));
    expect(screen.queryByTestId("live-effect")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Resume animation" }));
    expect(await screen.findByTestId("live-effect")).toBeTruthy();
  });
  it("never mounts a GPU effect when fallback is forced", () => {
    render(<Effect id="particle-swarm" forceFallback />);
    expect(screen.queryByTestId("live-effect")).toBeNull();
    expect(screen.getByText(/static preview/i)).toBeTruthy();
  });
  it("starts paused when requested by the caller", () => {
    render(<Effect id="neon-glow" paused />);
    expect(screen.queryByTestId("live-effect")).toBeNull();
  });
});
describe("capability detection", () => {
  it("does not try to create a GPU device when WebGPU is absent", async () => {
    expect(await detectCapability("webgpu")).toBe(false);
  });
  it("treats a rejected adapter request as unsupported", async () => {
    Object.defineProperty(navigator, "gpu", {
      configurable: true,
      value: {
        requestAdapter: () => Promise.reject(new Error("device denied")),
      },
    });
    expect(await detectCapability("webgpu")).toBe(false);
    delete (navigator as unknown as { gpu?: unknown }).gpu;
  });
});

it("unmounts animations while the document is hidden and resumes on return", async () => {
  let visibility = "visible";
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => visibility,
  });
  render(<Effect id="neon-glow" />);
  await screen.findByTestId("live-effect");
  act(() => {
    visibility = "hidden";
    document.dispatchEvent(new Event("visibilitychange"));
  });
  expect(screen.queryByTestId("live-effect")).toBeNull();
  act(() => {
    visibility = "visible";
    document.dispatchEvent(new Event("visibilitychange"));
  });
  expect(await screen.findByTestId("live-effect")).toBeTruthy();
});
it("replaces an effect after a context-loss event", async () => {
  render(<Effect id="neon-glow" />);
  const live = await screen.findByTestId("live-effect");
  const canvas = document.createElement("canvas");
  live.append(canvas);
  act(() =>
    canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
  );
  expect(screen.queryByTestId("live-effect")).toBeNull();
  expect(screen.getByRole("status").textContent).toContain(
    "Renderer unavailable",
  );
});

it("keeps the foil card visible text in its accessible button name", async () => {
  render(<Effect id="holographic-foil" />);
  expect(
    await screen.findByRole("button", {
      name: /MATERIAL.*Chromatic.*surface.*Drag/,
    }),
  ).toBeTruthy();
});
