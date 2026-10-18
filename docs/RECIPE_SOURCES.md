# Recipe sources

All 12 recipes are original Effects Atlas compositions under the repository MIT license. Runtime dependencies retain their own licenses. No remote models, fonts, images, environments, or telemetry are used.

| Recipes                                                  | Runtime                                    | Source / reference                                                  |
| -------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------- |
| Scroll reveal, spring card, shared layout tabs           | Motion                                     | https://motion.dev/                                                 |
| Word reveal, staggered features, animated panel          | Motion                                     | Motion Primitives design references listed below                    |
| Linked particles, ambient particles                      | tsParticles React provider + slim engine   | https://github.com/tsparticles/tsparticles/tree/main/wrappers/react |
| Confetti                                                 | tsParticles confetti, bounded local canvas | https://github.com/tsparticles/tsparticles                          |
| Glass transmission, reflective pedestal, floating object | React Three Fiber + Drei                   | https://github.com/pmndrs/drei                                      |

## Motion Primitives reference boundary

Reference revision: `120f64f6ca60348e251f929e9c81f11ccbe45eda` of `ibelick/motion-primitives`, inspected on 2026-10-18.

The inspected reference files were `components/core/text-effect.tsx`, `components/core/animated-group.tsx`, and `components/core/transition-panel.tsx`. The corresponding recipe concepts are word reveal, staggered features, and animated panel. The source README declares MIT, but the linked `LICENSE.md` is absent from this revision. GitHub history queries for `LICENSE` and `LICENSE.md` returned no commits. See `licenses/motion-primitives-reference.txt`.

The local components are original implementations, not adapted upstream code. They use per-item transitions instead of the upstream variants/container machinery. The panel mounts only the selected content and uses a short horizontal entry transition. There are no copied upstream utility functions, presets, interfaces, Tailwind class lists, or component bodies. The library remains a clear design reference, not a claim that its source is vendored.

## Runtime policy

Motion recipes keep their content and interactions available in paused, reduced-motion, and fallback states. Decorative renderers unmount when paused, hidden, outside the viewport, or forced to fallback. WebGL2 is checked before Three.js mounts. The particle wrapper destroys containers on unmount. Confetti owns a bounded canvas and destroys its container, including completion after unmount. All scenes use procedural geometry and local lighting.

Speed and intensity are clamped to 0.25–2. Invalid numeric values use 1. Color values accept bounded hex colors only. No settings are used as URLs.
