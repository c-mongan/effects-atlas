# Third-party notices

Effects Atlas original code and artwork: MIT, Copyright (c) 2026 Effects Atlas contributors. The root license does not replace third-party licenses.

## Runtime dependencies

- **Paper Shaders / @paper-design/shaders 0.0.81**, Paper Design: Apache-2.0. [Source](https://github.com/paper-design/shaders), evaluated commit `43cd68db79fa0b1759f72ffc941b3238e2a3954c`. The core is an external npm dependency. Seven selected React adapters and required helpers are vendored under `src/vendor/paper/` with an instance-local async-failure fix, initialization cancellation and image URL cleanup. See that directory’s README for exact source and modifications. Local license and notice copies: `licenses/paper-shaders.txt`, `licenses/paper-shaders-NOTICE.txt`. Used for morph, metaballs, dithering, halftone, print, gradient, metal and light rays. Original input SVGs are authored here. The risograph entry is an interpretation, not the old Codrops demo or its models.
- **shaders 4.0.4**, Copyright Shader Effects Inc.: MIT. [Source](https://github.com/shader-effects-inc/shaders). This published package is newer than the evaluated workspace packages at `81fd4ece5d493ca6c424a2af41f0e2c361ec8258`; it is retested in this repository. License: `licenses/shaders.txt`. WebGPU components use `shaders/react`; `disableTelemetry` is always supplied.
- **Sprite Lite 0.1.1**, Copyright (c) 2026 sprite-lite contributors: MIT. [Source](https://github.com/marcsist/sprite-lite), evaluated commit `a16f387da0fb2655b99255210eaa2745833f8acb`. License: `licenses/sprite-lite.txt`.
- **Three.js 0.183.2**, Copyright (c) 2010–2026 three.js authors: MIT. [Source](https://github.com/mrdoob/three.js). License: `licenses/three.txt`. Clay composition is original and uses no third-party models.
- React/React DOM: MIT. Storybook and test/build dependencies retain their package licenses. `package-lock.json` records exact resolved dependencies.

## Adapted code and design references

- `src/effects/mandelbulb.glsl`: adapted from [matt-k-wong/WebGL-Mandelbulb](https://github.com/matt-k-wong/WebGL-Mandelbulb), commit `eb93f9aa7917190279d06348088e1e3e2d6e2f51`, MIT, Copyright (c) 2026. Full notice: `licenses/mandelbulb.txt`. Changes: epsilon guards for radius/derivative/normal, nonnegative gamma input. Original WebGL host replaced with a bounded React renderer, cleanup, resize and context-loss handling. Original controls and screenshot are not redistributed.
- Holographic card pointer/foil interaction: adapted from [UI FX Kit](https://github.com/pptt3300/ui-fx-kit), commit `7d40d1da2329af30fb4a280c543ec8a7146600af`, MIT, Copyright (c) 2026 Patricia Zhang. Full notice: `licenses/ui-fx-kit.txt`. Atlas supplies a compact pointer-event implementation with touch and keyboard input; it does not vendor the original hooks, registry or MCP generator.
- Perspective CSS grid: adapted from [Magic UI RetroGrid](https://github.com/magicuidesign/magicui), commit `efe76fc5755eca1142dd4f74c1d6f0ace2887e3c`, MIT, Copyright (c) Magic UI. Full notice: `licenses/magicui.txt`. Uses self-contained CSS dimensions/animation instead of Tailwind utilities or a WebGL renderer.
- Bauhaus composition: original SVG, inspired by [Bauhaus UI Library](https://github.com/xhu96/bauhaus-ui-library), evaluated commit `073de432fc4a66a4425d018eed95776e75a5cc7e`. No library code is copied.

All static fallback artwork, ASCII composition, typography, neon, glass, paper-cutout, clay composition and supplied SVG images are original to this repository. There are no external photographs, fonts, models or CDN demo assets. Optional design skills are linked in documentation and are not vendored or relicensed.
