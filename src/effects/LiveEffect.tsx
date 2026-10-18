import type { EffectSettings } from "../settings";
import { lazy, Suspense } from "react";
import { ThinkingSprite } from "sprite-lite";
import { getEffect, type EffectId } from "../catalog";
import { DomEffect } from "./DomEffect";
const Paper = lazy(() =>
  import("./PaperEffect").then((module) => ({ default: module.PaperEffect })),
);
const Gpu = lazy(() =>
  import("./GpuEffect").then((module) => ({ default: module.GpuEffect })),
);
const Clay = lazy(() =>
  import("./ClayEffect").then((module) => ({ default: module.ClayEffect })),
);
const Fractal = lazy(() =>
  import("./FractalEffect").then((module) => ({
    default: module.FractalEffect,
  })),
);
export default function LiveEffect({
  id,
  onFailure,
  settings,
}: {
  id: EffectId;
  settings?: EffectSettings;
  onFailure: () => void;
}) {
  const renderer = getEffect(id).renderer;
  return (
    <Suspense fallback={null}>
      {renderer === "dom" ? (
        <DomEffect id={id} />
      ) : renderer === "paper" ? (
        <Paper id={id} onFailure={onFailure} settings={settings} />
      ) : renderer === "webgpu" ? (
        <Gpu id={id} onFailure={onFailure} />
      ) : renderer === "three" ? (
        <Clay onFailure={onFailure} />
      ) : renderer === "fractal" ? (
        <Fractal onFailure={onFailure} />
      ) : (
        <div className="ea-center ea-pixels">
          <ThinkingSprite variant="DNA" size={160} color="#edaa7d" />
          <ThinkingSprite variant="EKG" size={160} color="#93c7ba" />
        </div>
      )}
    </Suspense>
  );
}
