import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Recipe } from "../src/Recipe";
import { recipes, normalizeSettings } from "../src/recipes/catalog";
let reduced = false;
let notify: (() => void) | undefined;
let observe: ((entries: { isIntersecting: boolean }[]) => void) | undefined;
beforeEach(() => {
  reduced = false;
  vi.stubGlobal("matchMedia", () => ({
    get matches() {
      return reduced;
    },
    addEventListener: (_: string, fn: () => void) => {
      notify = fn;
    },
    removeEventListener: vi.fn(),
  }));
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: typeof observe) {
        observe = callback;
      }
      observe() {
        observe?.([{ isIntersecting: true }]);
      }
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  notify = undefined;
  observe = undefined;
});
it("has twelve unique recipes and clamps unsafe settings", () => {
  expect(new Set(recipes.map((item) => item.id)).size).toBe(12);
  expect(
    normalizeSettings({
      speed: Infinity,
      intensity: 40,
      colors: ["url(x)", "#ffffff"],
    }),
  ).toEqual({ speed: 1, intensity: 2, colors: ["#ffffff"] });
});
it("keeps spring card action usable when paused", async () => {
  render(<Recipe id="spring-card" paused />);
  const button = await screen.findByRole("button", { name: /save this idea/i });
  fireEvent.click(button);
  expect(
    screen
      .getByRole("button", { name: /added to collection/i })
      .getAttribute("aria-pressed"),
  ).toBe("true");
  expect(document.querySelector('[data-motion="disabled"]')).toBeTruthy();
});
it("keeps tab keyboard controls usable in forced fallback", async () => {
  render(<Recipe id="shared-layout-tabs" forceFallback />);
  const tab = await screen.findByRole("tab", { name: "Explore" });
  fireEvent.keyDown(tab, { key: "ArrowRight" });
  expect(
    screen.getByRole("tab", { name: "Build" }).getAttribute("aria-selected"),
  ).toBe("true");
  expect(screen.getByRole("tabpanel").textContent).toContain("Build with care");
});
it("disables motion live when the preference changes", async () => {
  render(<Recipe id="word-reveal" />);
  await waitFor(() =>
    expect(document.querySelector('[data-motion="enabled"]')).toBeTruthy(),
  );
  act(() => {
    reduced = true;
    notify?.();
  });
  expect(document.querySelector('[data-motion="disabled"]')).toBeTruthy();
  expect(screen.getByText("Small details. Clear purpose.")).toBeTruthy();
});
it.each([
  "glass-transmission",
  "reflective-pedestal",
  "floating-object",
  "linked-particles",
  "ambient-particles",
  "confetti",
] as const)("does not mount decorative renderer for %s in fallback", (id) => {
  render(<Recipe id={id} forceFallback />);
  expect(screen.getByTestId("recipe-static")).toBeTruthy();
  expect(screen.queryByTestId("recipe-live")).toBeNull();
});
it("stops animation when the stage leaves the viewport", async () => {
  render(<Recipe id="spring-card" />);
  await waitFor(() =>
    expect(document.querySelector('[data-motion="enabled"]')).toBeTruthy(),
  );
  act(() => observe?.([{ isIntersecting: false }]));
  expect(document.querySelector('[data-motion="disabled"]')).toBeTruthy();
  expect(screen.getByRole("status").textContent).toBe("Outside viewport");
});

it("keeps confetti feedback usable without mounting particles when paused", () => {
  render(<Recipe id="confetti" paused />);
  fireEvent.click(screen.getByRole("button", { name: "Celebrate" }));
  expect(screen.getByText("Success! Your milestone is complete.")).toBeTruthy();
  expect(screen.queryByTestId("recipe-live")).toBeNull();
});

it("exposes word reveal as complete text with only decorative words hidden", async () => {
  render(<Recipe id="word-reveal" paused />);
  const accessibleText = await screen.findByText(
    "Small details. Clear purpose.",
  );
  expect(accessibleText.getAttribute("aria-hidden")).toBeNull();
  const paragraph = accessibleText.closest("p")!;
  expect(paragraph.hasAttribute("aria-label")).toBe(false);
  expect(paragraph.querySelectorAll('[aria-hidden="true"]').length).toBe(4);
  expect(
    paragraph.querySelectorAll('[aria-hidden="true"]')[0].textContent,
  ).toBe("Small");
  expect(
    paragraph.querySelector('[aria-hidden="true"]')?.getAttribute("style"),
  ).not.toContain("opacity");
  expect(document.querySelector('[data-motion="disabled"]')).toBeTruthy();
});
it.each(["scroll-reveal", "staggered-features", "animated-panel"] as const)(
  "keeps %s text opaque in the static state",
  async (id) => {
    render(<Recipe id={id} paused />);
    await waitFor(() =>
      expect(document.querySelector('[data-motion="disabled"]')).toBeTruthy(),
    );
    const content = document.querySelector('[data-motion="disabled"]')!;
    for (const element of content.querySelectorAll<HTMLElement>("*")) {
      expect(
        element.style.opacity === "" || element.style.opacity === "1",
      ).toBe(true);
    }
  },
);
