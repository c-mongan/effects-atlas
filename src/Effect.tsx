import {
  Component,
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { getEffect, type EffectId } from "./catalog";
import { detectCapability, type Capability } from "./runtime/capabilities";
import { usePageVisible, useReducedMotion } from "./runtime/useMotion";
import { StaticPreview } from "./effects/StaticPreview";
const LiveEffect = lazy(() => import("./effects/LiveEffect"));
export interface EffectProps {
  /** One of the 28 curated effect identifiers. */
  id: EffectId;
  /** Keep the effect static. The in-component button controls additional local pause state. */
  paused?: boolean;
  /** Render the static preview without probing or mounting a GPU renderer. */
  forceFallback?: boolean;
  className?: string;
  style?: CSSProperties;
}
class RenderBoundary extends Component<
  { children: ReactNode; onFailure: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFailure();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}
/** A labelled visual effect with shared motion policy and a GPU-independent preview. */
export function Effect({
  id,
  paused = false,
  forceFallback = false,
  className = "",
  style,
}: EffectProps) {
  const definition = getEffect(id),
    reduced = useReducedMotion(),
    visible = usePageVisible();
  const [localPause, setLocalPause] = useState(false),
    [failed, setFailed] = useState(false);
  const [capability, setCapability] = useState<{
    kind: Capability;
    ready: boolean;
  } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const fail = useCallback(() => setFailed(true), []);
  const kind: Capability =
    definition.renderer === "webgpu"
      ? "webgpu"
      : ["paper", "three", "fractal"].includes(definition.renderer)
        ? "webgl2"
        : "none";
  const motionAllowed = !paused && !localPause && !reduced && visible;
  useEffect(() => {
    setFailed(false);
  }, [id]);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const lost = (event: Event) => {
      event.preventDefault();
      fail();
    };
    stage.addEventListener("webglcontextlost", lost, true);
    return () => stage.removeEventListener("webglcontextlost", lost, true);
  }, [fail]);
  useEffect(() => {
    if (!motionAllowed || forceFallback || kind === "none") return;
    let alive = true;
    void detectCapability(kind).then((ready) => {
      if (alive) setCapability({ kind, ready });
    });
    return () => {
      alive = false;
    };
  }, [kind, motionAllowed, forceFallback]);
  const supported =
    kind === "none" || (capability?.kind === kind && capability.ready);
  const active = motionAllowed && !forceFallback && !failed && supported;
  const reason = forceFallback
    ? "Static preview requested"
    : reduced
      ? "Reduced motion: static preview"
      : paused || localPause
        ? "Animation paused: static preview"
        : !visible
          ? "Page hidden: static preview"
          : failed
            ? "Renderer unavailable: static preview"
            : !supported
              ? capability?.kind === kind
                ? "GPU unavailable: static preview"
                : "Checking graphics: static preview"
              : "";
  return (
    <section
      className={`ea-effect ${className}`}
      style={style}
      aria-labelledby={titleId}
      data-effect={id}
      data-active={active ? "true" : "false"}
    >
      <header className="ea-heading">
        <div>
          <p className="ea-eyebrow">EFFECTS ATLAS / {definition.renderer}</p>
          <h2 id={titleId}>{definition.name}</h2>
        </div>
        <span className="ea-license">{definition.license}</span>
      </header>
      <p className="ea-description">{definition.description}</p>
      <div
        ref={stageRef}
        className="ea-stage"
        data-testid="effect-stage"
        onContextMenu={
          id === "ink-flow" ? (event) => event.preventDefault() : undefined
        }
      >
        <StaticPreview id={id} />
        {active && (
          <RenderBoundary key={id} onFailure={fail}>
            <Suspense fallback={null}>
              <div className="ea-live" data-testid="live-effect">
                <LiveEffect id={id} onFailure={fail} />
              </div>
            </Suspense>
          </RenderBoundary>
        )}
      </div>
      <div className="ea-toolbar">
        <span role="status" aria-live="polite">
          {reason || "Animation active"}
        </span>
        <button
          type="button"
          onClick={() => setLocalPause((value) => !value)}
          disabled={paused || reduced || forceFallback}
          aria-pressed={localPause || paused || reduced}
        >
          {localPause ? "Resume animation" : "Pause animation"}
        </button>
      </div>
      <p className="ea-source">{definition.source}</p>
    </section>
  );
}
