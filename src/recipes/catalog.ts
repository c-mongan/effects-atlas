export type RecipeId =
  | "scroll-reveal"
  | "spring-card"
  | "shared-layout-tabs"
  | "word-reveal"
  | "staggered-features"
  | "animated-panel"
  | "linked-particles"
  | "ambient-particles"
  | "confetti"
  | "glass-transmission"
  | "reflective-pedestal"
  | "floating-object";
export interface RecipeSettings {
  speed?: number;
  intensity?: number;
  colors?: string[];
}
export interface RecipeDefinition {
  id: RecipeId;
  name: string;
  description: string;
  renderer: "motion" | "particles" | "three";
  source: string;
  license: string;
  category: string;
  useCases: string[];
  sourceUrl: string;
  controls: ("speed" | "intensity" | "color")[];
  guidance: { use: string; avoid: string };
}
const entries: [
  RecipeId,
  string,
  string,
  RecipeDefinition["renderer"],
  string,
][] = [
  [
    "scroll-reveal",
    "Scroll reveal",
    "Content enters as it reaches the viewport.",
    "motion",
    "Content",
  ],
  [
    "spring-card",
    "Spring card",
    "A responsive card with a spring interaction.",
    "motion",
    "Interaction",
  ],
  [
    "shared-layout-tabs",
    "Shared layout tabs",
    "A shared highlight follows the selected tab.",
    "motion",
    "Navigation",
  ],
  [
    "word-reveal",
    "Word reveal",
    "A sentence appears one word at a time.",
    "motion",
    "Typography",
  ],
  [
    "staggered-features",
    "Staggered features",
    "A short feature list enters in sequence.",
    "motion",
    "Content",
  ],
  [
    "animated-panel",
    "Animated panel",
    "Switch between two panels with a short transition.",
    "motion",
    "Navigation",
  ],
  [
    "linked-particles",
    "Linked particles",
    "A bounded field of connected particles.",
    "particles",
    "Background",
  ],
  [
    "ambient-particles",
    "Ambient particles",
    "Soft points drift through a quiet background.",
    "particles",
    "Background",
  ],
  [
    "confetti",
    "Confetti",
    "A short, bounded celebration burst.",
    "particles",
    "Feedback",
  ],
  [
    "glass-transmission",
    "Glass transmission",
    "Procedural glass refracts a local color backdrop.",
    "three",
    "Material",
  ],
  [
    "reflective-pedestal",
    "Reflective pedestal",
    "A metallic object sits above a reflective surface.",
    "three",
    "Product",
  ],
  [
    "floating-object",
    "Floating object",
    "A geometric object floats in a lit scene.",
    "three",
    "Product",
  ],
];
export const recipes: readonly RecipeDefinition[] = entries.map(
  ([id, name, description, renderer, category], index) => ({
    id,
    name,
    description,
    renderer,
    category,
    source:
      index >= 3 && index <= 5
        ? "Effects Atlas · Motion Primitives design reference"
        : renderer === "motion"
          ? "Effects Atlas · original Motion composition"
          : renderer === "particles"
            ? "Effects Atlas · original tsParticles composition"
            : "Effects Atlas · original Drei composition",
    license: "MIT",
    sourceUrl:
      index >= 3 && index <= 5
        ? "https://github.com/ibelick/motion-primitives/tree/120f64f6ca60348e251f929e9c81f11ccbe45eda/components/core"
        : renderer === "motion"
          ? "https://motion.dev/"
          : renderer === "particles"
            ? "https://particles.js.org/"
            : "https://github.com/pmndrs/drei",
    useCases: [
      category === "Background"
        ? "Decorative section background"
        : category === "Navigation"
          ? "Small content switcher"
          : "Focused page section",
    ],
    controls:
      id === "shared-layout-tabs"
        ? ["speed", "color"]
        : ["speed", "intensity", "color"],
    guidance: {
      use: "Use for one focused section. Keep text and controls readable.",
      avoid:
        "Avoid repeated motion across a whole page. Keep essential information outside decorative scenes.",
    },
  }),
);
export function getRecipe(id: RecipeId) {
  const recipe = recipes.find((item) => item.id === id);
  if (!recipe) throw new Error(`Unknown recipe: ${id}`);
  return recipe;
}
export function normalizeSettings(settings: RecipeSettings = {}) {
  const clamp = (value: number | undefined) =>
    typeof value === "number" && Number.isFinite(value)
      ? Math.min(2, Math.max(0.25, value))
      : 1;
  return {
    speed: clamp(settings.speed),
    intensity: clamp(settings.intensity),
    colors:
      settings.colors
        ?.filter((color) => /^#[0-9a-f]{6}$/i.test(color))
        .slice(0, 4) || [],
  };
}
