// Original Effects Atlas compositions. Motion Primitives is a design reference only.
import { type ReactNode } from "react";
import { motion } from "motion/react";
export function WordReveal({
  children,
  active,
  speed,
  intensity,
}: {
  children: string;
  active: boolean;
  speed: number;
  intensity: number;
}) {
  const words = children.split(" ");
  return (
    <p className="ea-recipe-words">
      <span className="ea-recipe-sr">{children}</span>
      {words.map((word, index) => (
        <motion.span
          key={`${index}-${word}`}
          aria-hidden="true"
          style={{ display: "inline-block", marginInlineEnd: ".25em" }}
          initial={
            active
              ? { translateY: 8 * intensity, clipPath: "inset(0 0 100% 0)" }
              : false
          }
          animate={{ translateY: 0, clipPath: "inset(0 0 0% 0)" }}
          transition={{
            duration: active ? 0.35 / speed : 0,
            delay: active ? (index * 0.09) / speed : 0,
          }}
        >
          {word}
        </motion.span>
      ))}
    </p>
  );
}
export function StaggeredGroup({
  children,
  active,
  speed,
  intensity,
}: {
  children: ReactNode[];
  active: boolean;
  speed: number;
  intensity: number;
}) {
  return (
    <div className="ea-recipe-features">
      {children.map((child, index) => (
        <motion.div
          key={index}
          initial={active ? { scale: 1 - 0.08 * intensity } : false}
          animate={{ scale: 1 }}
          transition={{
            duration: active ? 0.4 / speed : 0,
            delay: active ? (index * 0.12) / speed : 0,
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
export function TransitionPanel({
  children,
  activeIndex,
  active,
  speed,
  intensity,
}: {
  children: ReactNode[];
  activeIndex: number;
  active: boolean;
  speed: number;
  intensity: number;
}) {
  return (
    <motion.div
      key={activeIndex}
      className="ea-recipe-panel"
      initial={active ? { translateX: 16 * intensity } : false}
      animate={{ translateX: 0 }}
      transition={{ duration: active ? 0.25 / speed : 0 }}
    >
      {children[activeIndex]}
    </motion.div>
  );
}
