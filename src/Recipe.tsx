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
import {
  getRecipe,
  type RecipeId,
  type RecipeSettings,
} from "./recipes/catalog";
import { StaticRecipe } from "./recipes/StaticRecipe";
import { usePageVisible, useReducedMotion } from "./runtime/useMotion";
import { detectCapability } from "./runtime/capabilities";
import "./recipes/styles.css";
const MotionRecipes = lazy(() => import("./recipes/MotionRecipes"));
const ParticleRecipes = lazy(() => import("./recipes/ParticleRecipes"));
const ThreeRecipes = lazy(() => import("./recipes/ThreeRecipes"));
export type { RecipeId, RecipeSettings } from "./recipes/catalog";
export { recipes } from "./recipes/catalog";
export interface RecipeProps {
  id: RecipeId;
  paused?: boolean;
  forceFallback?: boolean;
  settings?: RecipeSettings;
  className?: string;
  style?: CSSProperties;
}
class RecipeBoundary extends Component<
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
export function Recipe({
  id,
  paused = false,
  forceFallback = false,
  settings,
  className = "",
  style,
}: RecipeProps) {
  const definition = getRecipe(id),
    reduced = useReducedMotion(),
    visible = usePageVisible(),
    title = useId();
  const [localPause, setLocalPause] = useState(false),
    [inView, setInView] = useState(false),
    [supported, setSupported] = useState<boolean | null>(null),
    [failed, setFailed] = useState(false),
    [burst, setBurst] = useState(0),
    [celebrated, setCelebrated] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const fail = useCallback(() => setFailed(true), []);
  const permitted =
    !paused &&
    !localPause &&
    !reduced &&
    visible &&
    inView &&
    !forceFallback &&
    !failed;
  useEffect(() => {
    setFailed(false);
    setSupported(null);
    setBurst(0);
    setCelebrated(false);
  }, [id]);
  useEffect(() => {
    if (!permitted) setBurst(0);
  }, [permitted]);
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.01 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!permitted || definition.renderer !== "three") return;
    let alive = true;
    void detectCapability("webgl2").then((value) => {
      if (alive) setSupported(value);
    });
    return () => {
      alive = false;
    };
  }, [permitted, definition.renderer]);
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const lost = (event: Event) => {
      event.preventDefault();
      fail();
    };
    element.addEventListener("webglcontextlost", lost, true);
    return () => element.removeEventListener("webglcontextlost", lost, true);
  }, [fail]);
  const active =
    permitted && (definition.renderer !== "three" || supported === true);
  const reason = forceFallback
    ? "Static preview requested"
    : reduced
      ? "Reduced motion enabled"
      : paused || localPause
        ? "Animation paused"
        : !visible
          ? "Page hidden"
          : !inView
            ? "Outside viewport"
            : failed
              ? "Renderer unavailable"
              : definition.renderer === "three" && supported !== true
                ? supported === false
                  ? "GPU unavailable"
                  : "Checking graphics"
                : "Animation active";
  return (
    <section
      className={`ea-effect ea-recipe ${className}`}
      style={style}
      aria-labelledby={title}
      data-recipe={id}
      data-active={active}
    >
      <header className="ea-heading">
        <div>
          <p className="ea-eyebrow">EFFECTS ATLAS / {definition.renderer}</p>
          <h2 id={title}>{definition.name}</h2>
        </div>
        <span className="ea-license">{definition.license}</span>
      </header>
      <p className="ea-description">{definition.description}</p>
      <div
        ref={stage}
        className="ea-stage ea-recipe-stage"
        data-testid="recipe-stage"
      >
        {(definition.renderer !== "motion" || failed) && (
          <StaticRecipe id={id} />
        )}
        <RecipeBoundary key={id} onFailure={fail}>
          <Suspense fallback={<StaticRecipe id={id} />}>
            {definition.renderer === "motion" ? (
              <MotionRecipes id={id} active={active} settings={settings} />
            ) : active && (id !== "confetti" || burst > 0) ? (
              <div className="ea-recipe-live" data-testid="recipe-live">
                {definition.renderer === "particles" ? (
                  <ParticleRecipes
                    key={id === "confetti" ? burst : id}
                    id={id}
                    settings={settings}
                    onFailure={fail}
                  />
                ) : (
                  <ThreeRecipes id={id} settings={settings} />
                )}
              </div>
            ) : null}
          </Suspense>
        </RecipeBoundary>
        {id === "confetti" && (
          <div className="ea-recipe-celebrate">
            <button
              type="button"
              onClick={() => {
                setCelebrated(true);
                if (active) setBurst((value) => value + 1);
              }}
            >
              Celebrate
            </button>
            <span role="status">
              {celebrated
                ? "Success! Your milestone is complete."
                : "Mark a milestone."}
            </span>
          </div>
        )}
      </div>
      <div className="ea-toolbar">
        <span role="status">{reason}</span>
        <button
          type="button"
          disabled={paused || reduced || forceFallback}
          aria-pressed={localPause || paused || reduced || forceFallback}
          onClick={() => setLocalPause((value) => !value)}
        >
          {localPause ? "Resume animation" : "Pause animation"}
        </button>
      </div>
      <p className="ea-source">
        <a href={definition.sourceUrl} target="_blank" rel="noreferrer">
          {definition.source}
        </a>
      </p>
    </section>
  );
}
