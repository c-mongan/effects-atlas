import { useCallback, useEffect, useRef } from "react";
import {
  Shader,
  Boids,
  ContourLines,
  MeshGradient,
  Watercolor,
  InkFlow,
  CRTScreen,
  VHS,
  ReactionDiffusion,
  FlowField,
} from "shaders/react";
import type { EffectId } from "../catalog";
/** Published Shaders API; telemetry is disabled for every mount. */
export function GpuEffect({
  id,
  onFailure,
}: {
  id: EffectId;
  onFailure: () => void;
}) {
  const root = useRef<HTMLDivElement>(null),
    ready = useRef(false),
    animation = useRef(0);
  const stroke = useCallback(() => {
    cancelAnimationFrame(animation.current);
    let step = 0;
    const paint = () => {
      const canvas = root.current?.querySelector("canvas");
      if (!canvas) return;
      const box = canvas.getBoundingClientRect();
      canvas.dispatchEvent(
        new MouseEvent("mousemove", {
          clientX: box.left + box.width * (0.18 + step * 0.016),
          clientY: box.top + box.height * (0.5 + Math.sin(step * 0.22) * 0.2),
          bubbles: true,
        }),
      );
      if (step++ < 38) animation.current = requestAnimationFrame(paint);
    };
    paint();
  }, []);
  useEffect(() => {
    ready.current = false;
    const timeout = window.setTimeout(() => {
      if (!ready.current) onFailure();
    }, 15_000);
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(animation.current);
    };
  }, [id, onFailure]);
  let layer;
  switch (id) {
    case "particle-swarm":
      layer = <Boids count={700} />;
      break;
    case "topographic-lines":
      layer = (
        <ContourLines>
          <MeshGradient />
        </ContourLines>
      );
      break;
    case "watercolor":
      layer = (
        <Watercolor>
          <MeshGradient />
        </Watercolor>
      );
      break;
    case "ink-flow":
      layer = <InkFlow />;
      break;
    case "crt-screen":
      layer = (
        <CRTScreen>
          <MeshGradient />
        </CRTScreen>
      );
      break;
    case "vhs":
      layer = (
        <VHS>
          <MeshGradient />
        </VHS>
      );
      break;
    case "reaction-diffusion":
      layer = <ReactionDiffusion />;
      break;
    case "flow-fields":
      layer = (
        <FlowField speed={0.4} evolutionSpeed={0.4}>
          <MeshGradient />
        </FlowField>
      );
      break;
  }
  return (
    <div
      className="ea-gpu"
      ref={root}
      onPointerMove={(event) => {
        if (event.pointerType === "touch")
          root.current?.querySelector("canvas")?.dispatchEvent(
            new MouseEvent("mousemove", {
              clientX: event.clientX,
              clientY: event.clientY,
              bubbles: true,
            }),
          );
      }}
    >
      <Shader
        className="ea-fill"
        disableTelemetry
        onUnavailable={onFailure}
        onReady={() => {
          ready.current = true;
          if (id === "ink-flow") stroke();
        }}
      >
        {layer}
      </Shader>
      {id === "ink-flow" && (
        <button className="ea-ink-button" type="button" onClick={stroke}>
          Add ink stroke
        </button>
      )}
    </div>
  );
}
