import { useId, useState } from "react";
import { LayoutGroup, motion } from "motion/react";
import type { RecipeId, RecipeSettings } from "./catalog";
import { normalizeSettings } from "./catalog";
import { WordReveal, StaggeredGroup, TransitionPanel } from "./primitives";
export default function MotionRecipes({
  id,
  active,
  settings,
}: {
  id: RecipeId;
  active: boolean;
  settings?: RecipeSettings;
}) {
  const { speed, intensity, colors } = normalizeSettings(settings);
  const [selected, setSelected] = useState(0);
  const [saved, setSaved] = useState(false);
  const unique = useId();
  const panels = [
    "Explore the collection. Each example has clear controls.",
    "Build with care. Keep useful content available when motion stops.",
  ];
  return (
    <div
      key={active ? "animated" : "static"}
      className="ea-recipe-content"
      style={
        { "--recipe-accent": colors[0] || "#a5b4fc" } as React.CSSProperties
      }
      data-motion={active ? "enabled" : "disabled"}
    >
      {id === "scroll-reveal" && (
        <motion.article
          initial={active ? { y: 32 * intensity } : false}
          whileInView={{ y: 0 }}
          animate={!active ? { y: 0 } : undefined}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: active ? 0.6 / speed : 0 }}
        >
          <span className="ea-recipe-kicker">01 / DISCOVER</span>
          <h3>Make room for an idea.</h3>
          <p>Content remains readable when motion is off.</p>
        </motion.article>
      )}
      {id === "spring-card" && (
        <motion.button
          type="button"
          className="ea-recipe-card"
          aria-pressed={saved}
          onClick={() => setSaved((value) => !value)}
          whileHover={active ? { scale: 1 + 0.04 * intensity } : undefined}
          whileTap={active ? { scale: 0.96 } : undefined}
          animate={{ scale: 1 }}
          transition={{
            type: active ? "spring" : "tween",
            duration: active ? undefined : 0,
            stiffness: 260 * speed,
            damping: 20,
          }}
        >
          <span className="ea-recipe-kicker">YOUR COLLECTION</span>
          <strong>{saved ? "Added to collection" : "Save this idea"}</strong>
          <span>{saved ? "Select to remove" : "Select to save"}</span>
        </motion.button>
      )}
      {(id === "shared-layout-tabs" || id === "animated-panel") && (
        <div className="ea-recipe-switcher">
          <LayoutGroup id={unique}>
            <div role="tablist" aria-label="Recipe content">
              {["Explore", "Build"].map((label, index) => (
                <button
                  key={label}
                  id={`${unique}-tab-${index}`}
                  aria-controls={`${unique}-panel`}
                  type="button"
                  role="tab"
                  aria-selected={selected === index}
                  tabIndex={selected === index ? 0 : -1}
                  onClick={() => setSelected(index)}
                  onKeyDown={(event) => {
                    if (
                      ["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                        event.key,
                      )
                    ) {
                      event.preventDefault();
                      const next =
                        event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? 1
                            : 1 - selected;
                      setSelected(next);
                      document.getElementById(`${unique}-tab-${next}`)?.focus();
                    }
                  }}
                >
                  {selected === index && (
                    <motion.span
                      className="ea-recipe-tab-highlight"
                      layoutId={active ? "selection" : undefined}
                      transition={{ duration: active ? 0.25 / speed : 0 }}
                    />
                  )}
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </LayoutGroup>
          <div
            role="tabpanel"
            id={`${unique}-panel`}
            aria-labelledby={`${unique}-tab-${selected}`}
            tabIndex={0}
          >
            {id === "animated-panel" ? (
              <TransitionPanel
                activeIndex={selected}
                active={active}
                speed={speed}
                intensity={intensity}
              >
                {panels.map((text) => (
                  <p key={text}>{text}</p>
                ))}
              </TransitionPanel>
            ) : (
              <p>{panels[selected]}</p>
            )}
          </div>
        </div>
      )}
      {id === "word-reveal" && (
        <WordReveal active={active} speed={speed} intensity={intensity}>
          Small details. Clear purpose.
        </WordReveal>
      )}
      {id === "staggered-features" && (
        <StaggeredGroup active={active} speed={speed} intensity={intensity}>
          {["Readable content", "Useful controls", "Considered motion"].map(
            (text, index) => (
              <article key={text}>
                <span className="ea-recipe-kicker">0{index + 1}</span>
                <h3>{text}</h3>
                <p>Designed to work at your pace.</p>
              </article>
            ),
          )}
        </StaggeredGroup>
      )}
    </div>
  );
}
