import { act, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Effect } from "../src/Effect";
afterEach(() => vi.unstubAllGlobals());
it("unmounts live effects outside the viewport and resumes on return", async () => {
  let update: IntersectionObserverCallback;
  const disconnect = vi.fn();
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: IntersectionObserverCallback) {
        update = callback;
      }
      observe() {}
      disconnect = disconnect;
    },
  );
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  }));
  const view = render(<Effect id="neon-glow" />);
  expect(screen.queryByTestId("live-effect")).toBeNull();
  act(() =>
    update(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    ),
  );
  await screen.findByTestId("live-effect");
  act(() =>
    update(
      [{ isIntersecting: false } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    ),
  );
  expect(screen.queryByTestId("live-effect")).toBeNull();
  act(() =>
    update(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    ),
  );
  await screen.findByTestId("live-effect");
  view.unmount();
  expect(disconnect).toHaveBeenCalledOnce();
});
