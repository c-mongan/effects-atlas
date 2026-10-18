import { effects } from "./catalog";
import { recipes } from "./recipes/catalog";
export type ExampleControl = "speed" | "intensity" | "color";
export interface ExampleDefinition {
  kind: "effect" | "recipe";
  id: string;
  name: string;
  renderer: string;
  source: string;
  license: string;
  description: string;
  category: string;
  useCases: string[];
  sourceUrl: string;
  controls: ExampleControl[];
  defaultColors: string[];
  guidance: { use: string; avoid: string };
}
const groups: Record<string, [string, string[], string, string]> = {
  "liquid-morph": [
    "Organic",
    ["Hero", "Background"],
    "Give a quiet product hero a soft focal point.",
    "Avoid placing small text over the moving edge.",
  ],
  "ascii-art": [
    "Typography",
    ["Hero", "Editorial"],
    "Introduce a creative or technical project with a character study.",
    "Avoid using the artwork as the only readable heading.",
  ],
  "holographic-foil": [
    "Surface",
    ["Card", "Portfolio"],
    "Highlight one collectible or portfolio card.",
    "Avoid requiring pointer movement to reveal content.",
  ],
  "bauhaus-shapes": [
    "Geometric",
    ["Editorial", "Hero"],
    "Add geometric rhythm to an editorial introduction.",
    "Avoid combining it with other busy patterns.",
  ],
  "neon-glow": [
    "Typography",
    ["Hero", "Editorial"],
    "Add a luminous title to an evening or music project.",
    "Avoid intense glow around long body text.",
  ],
  dithering: [
    "Texture",
    ["Background", "Editorial"],
    "Give a large image or backdrop a limited-color texture.",
    "Avoid detailed charts and small text.",
  ],
  "clay-3d": [
    "3D",
    ["Hero", "Portfolio"],
    "Use a sculptural object beside a short introduction.",
    "Avoid relying on depth cues to explain essential content.",
  ],
  "halftone-dots": [
    "Texture",
    ["Editorial", "Card"],
    "Use a print texture for art and editorial covers.",
    "Avoid shrinking detailed source images too far.",
  ],
  "kinetic-typography": [
    "Typography",
    ["Hero", "Editorial"],
    "Emphasize a short headline with restrained movement.",
    "Avoid moving paragraphs or essential instructions.",
  ],
  "pixel-art": [
    "Geometric",
    ["Card", "Portfolio"],
    "Add a small playful accent to a project.",
    "Avoid enlarging pixel artwork until it competes with content.",
  ],
  "particle-swarm": [
    "Particles",
    ["Hero", "Background"],
    "Use a flock as a decorative full-width accent.",
    "Avoid mounting many simulations on a page.",
  ],
  "risograph-print": [
    "Texture",
    ["Editorial", "Card"],
    "Give covers a layered print appearance.",
    "Avoid expecting exact photographic color.",
  ],
  "glitch-effect": [
    "Typography",
    ["Hero", "Editorial"],
    "Use brief visual distortion for a creative title.",
    "Avoid applying distortion to navigation or form labels.",
  ],
  "topographic-lines": [
    "Geometric",
    ["Background", "Hero"],
    "Add landscape-like contours behind a clear content panel.",
    "Avoid treating these decorative lines as real map data.",
  ],
  glassmorphism: [
    "Surface",
    ["Card", "Feature"],
    "Use a translucent surface against a colorful backdrop.",
    "Avoid low-contrast text and stacked translucent layers.",
  ],
  "paper-cutout": [
    "Geometric",
    ["Hero", "Editorial"],
    "Use layered landscapes for a calm introduction.",
    "Avoid adding competing shadows to nearby content.",
  ],
  "vaporwave-grid": [
    "Geometric",
    ["Hero", "Background"],
    "Create a retro stage for a short heading.",
    "Avoid using perspective lines as a functional data grid.",
  ],
  "flow-fields": [
    "Particles",
    ["Background", "Hero"],
    "Use flowing trails to suggest direction and movement.",
    "Avoid placing body text directly over dense trails.",
  ],
  metaballs: [
    "Organic",
    ["Hero", "Background"],
    "Use merging shapes as a bold isolated accent.",
    "Avoid dark text on the moving dark shapes.",
  ],
  "ray-marched-fractals": [
    "3D",
    ["Hero", "Portfolio"],
    "Show a mathematical form in a dedicated visual stage.",
    "Avoid many simultaneous fractal renderers.",
  ],
  "mesh-gradient": [
    "Organic",
    ["Hero", "Background"],
    "Set a soft atmosphere behind a product introduction.",
    "Avoid assuming every point in the gradient has enough contrast.",
  ],
  "liquid-metal": [
    "Surface",
    ["Hero", "Portfolio"],
    "Give one original shape a polished material finish.",
    "Avoid reflective details behind small labels.",
  ],
  watercolor: [
    "Texture",
    ["Editorial", "Background"],
    "Add pigment-like color to an art-led page.",
    "Avoid using color alone to communicate status.",
  ],
  "ink-flow": [
    "Organic",
    ["Hero", "Portfolio"],
    "Offer an optional interactive painting surface.",
    "Avoid making drawing a required navigation step.",
  ],
  "crt-screen": [
    "Texture",
    ["Editorial", "Hero"],
    "Use scanline texture for a retro media scene.",
    "Avoid scanlines over reading or input areas.",
  ],
  vhs: [
    "Texture",
    ["Editorial", "Hero"],
    "Frame a short media introduction with analog texture.",
    "Avoid continuous distortion around essential content.",
  ],
  "reaction-diffusion": [
    "Organic",
    ["Background", "Portfolio"],
    "Show a developing pattern in its own stage.",
    "Avoid using pattern changes as a progress indicator.",
  ],
  "light-shafts": [
    "Light",
    ["Hero", "Background"],
    "Add directional light around a stable content area.",
    "Avoid bright rays behind pale text.",
  ],
};
const controlMap: Record<string, ExampleControl[]> = {
  "mesh-gradient": ["speed", "color"],
  "liquid-morph": ["speed", "color"],
  metaballs: ["speed", "color"],
  dithering: ["speed", "color"],
  "light-shafts": ["speed"],
  "neon-glow": ["intensity"],
};
const effectColors: Record<string, string[]> = {
  "liquid-morph": ["#f17a91", "#b38be5", "#efb17e"],
  metaballs: ["#302b65"],
  dithering: ["#aaa5ec"],
  "mesh-gradient": ["#5248c8", "#b58cf1", "#ed9d84", "#a4d9d5"],
};
function sourceUrl(id: string, renderer: string) {
  if (renderer === "paper") return "https://github.com/paper-design/shaders";
  if (renderer === "webgpu")
    return "https://github.com/shader-effects-inc/shaders";
  if (renderer === "three") return "https://github.com/mrdoob/three.js";
  if (renderer === "fractal")
    return "https://github.com/matt-k-wong/WebGL-Mandelbulb";
  if (renderer === "sprite") return "https://github.com/marcsist/sprite-lite";
  if (id === "holographic-foil") return "https://github.com/pptt3300/ui-fx-kit";
  if (id === "vaporwave-grid")
    return "https://github.com/magicuidesign/magicui";
  if (id === "bauhaus-shapes")
    return "https://github.com/xhu96/bauhaus-ui-library";
  return "https://github.com/c-mongan/effects-atlas";
}
export const examples: ExampleDefinition[] = [
  ...effects.map((effect) => {
    const [category, useCases, use, avoid] = groups[effect.id];
    return {
      ...effect,
      kind: "effect" as const,
      category,
      useCases,
      sourceUrl: sourceUrl(effect.id, effect.renderer),
      controls: controlMap[effect.id] || [],
      defaultColors: effectColors[effect.id] || [],
      guidance: { use, avoid },
    };
  }),
  ...recipes.map((recipe) => ({
    ...recipe,
    kind: "recipe" as const,
    defaultColors: recipe.controls.includes("color")
      ? recipe.renderer === "particles"
        ? ["#a5b4fc", "#f9a8d4", "#67e8f9"]
        : ["#a5b4fc"]
      : [],
  })),
];
export const getExample = (id: string) =>
  examples.find((example) => example.id === id);
