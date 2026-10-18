import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  type ComponentProps,
} from "react";
import Particles, {
  ParticlesProvider,
  type ParticlesPluginRegistrar,
} from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import {
  normalizeSettings,
  type RecipeId,
  type RecipeSettings,
} from "./catalog";
const failures = new Set<() => void>();
const register: ParticlesPluginRegistrar = async (engine) => {
  try {
    await loadSlim(engine);
  } catch (error) {
    failures.forEach((fail) => fail());
    throw error;
  }
};
export default function ParticleRecipes({
  id,
  settings,
  onFailure,
}: {
  id: RecipeId;
  settings?: RecipeSettings;
  onFailure: () => void;
}) {
  const unique = useId().replace(/:/g, "");
  const { speed, intensity, colors } = normalizeSettings(settings);
  const loaded = useRef(false);
  const markLoaded = useCallback(() => {
    loaded.current = true;
  }, []);
  useEffect(() => {
    if (id === "confetti") return;
    loaded.current = false;
    const timeout = window.setTimeout(() => {
      if (!loaded.current) onFailure();
    }, 8000);
    return () => window.clearTimeout(timeout);
  }, [id, onFailure]);
  useEffect(() => {
    failures.add(onFailure);
    return () => {
      failures.delete(onFailure);
    };
  }, [onFailure]);
  const palette = colors.length ? colors : ["#a5b4fc", "#f9a8d4", "#67e8f9"];
  const paletteKey = palette.join(",");
  const options = useMemo<
    NonNullable<ComponentProps<typeof Particles>["options"]>
  >(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: 40,
      detectRetina: false,
      duration: id === "confetti" ? 3 : 0,
      background: { color: "#111326" },
      particles: {
        number: {
          value: Math.round((id === "ambient-particles" ? 28 : 55) * intensity),
          density: { enable: false },
        },
        color: { value: paletteKey.split(",") },
        shape: { type: id === "confetti" ? "square" : "circle" },
        opacity: { value: { min: 0.3, max: 0.8 } },
        size: {
          value:
            id === "confetti"
              ? { min: 3, max: 7 }
              : { min: 1, max: id === "ambient-particles" ? 5 : 3 },
        },
        links: {
          enable: id === "linked-particles",
          distance: 120,
          opacity: 0.25,
          color: "#a5b4fc",
        },
        move: {
          enable: true,
          speed:
            (id === "confetti" ? 8 : id === "ambient-particles" ? 0.35 : 0.7) *
            speed,
          direction: id === "confetti" ? "bottom" : "none",
          outModes: { default: id === "confetti" ? "destroy" : "out" },
        },
      },
    }),
    [id, speed, intensity, paletteKey],
  );
  // The maintained React wrapper owns and destroys its container on unmount.
  return id === "confetti" ? (
    <ConfettiCanvas
      speed={speed}
      intensity={intensity}
      colors={paletteKey}
      onFailure={onFailure}
    />
  ) : (
    <ParticlesProvider init={register}>
      <Particles
        id={`ea-particles-${unique}`}
        options={options}
        particlesLoaded={markLoaded}
      />
    </ParticlesProvider>
  );
}

function ConfettiCanvas({
  speed,
  intensity,
  colors,
  onFailure,
}: {
  speed: number;
  intensity: number;
  colors: string;
  onFailure: () => void;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const canvasId = `ea-confetti-${useId().replace(/:/g, "")}`;
  useEffect(() => {
    let disposed = false;
    let destroy: (() => void) | undefined;
    let stopTimer: ReturnType<typeof setTimeout> | undefined;
    void import("@tsparticles/confetti")
      .then(async ({ confetti }) => {
        if (disposed || !canvas.current) return;
        const launch = await confetti.create(canvas.current, {
          disableForReducedMotion: true,
          count: Math.round(70 * intensity),
          spread: 90,
          startVelocity: 30 * speed,
          ticks: 90,
          colors: colors.split(","),
          origin: { x: 0.5, y: 0.65 },
        });
        // Read the owned container without creating a second burst, even after unmount.
        const container = await launch({ count: 0 });
        destroy = () => container?.destroy();
        if (disposed) destroy();
        else stopTimer = setTimeout(destroy, 4000);
      })
      .catch(() => {
        if (!disposed) onFailure();
      });
    return () => {
      disposed = true;
      destroy?.();
      if (stopTimer) clearTimeout(stopTimer);
    };
  }, [speed, intensity, colors, onFailure]);
  return <canvas id={canvasId} ref={canvas} aria-hidden="true" />;
}
