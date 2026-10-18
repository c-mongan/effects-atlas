# Effects Atlas Implementation Plan

Goal: deliver the approved repository locally, ready for public review.
Architecture: a typed registry and shared effect host wrap isolated renderer modules; a Storybook story family exposes each effect and its safe states. Runtime dependencies use published packages pinned in the lockfile.
Tech stack: React 19, TypeScript, Vite, Storybook 10.6.2, Vitest, Playwright.
Spec: ../specs/2026-10-18-effects-atlas.md

1. [x] Scaffold npm package, strict types, Storybook/MCP and test configs. Write failing tests for missing registry, motion preference changes and unavailable GPU. Verify failures before implementing host.
2. [x] Implement host, registry, CSS/SVG/Paper/Three/WebGPU renderers. Copy only required licensed shader code, guard fractal singularities. Run typecheck and host tests.
3. [x] Add 84 stories (28 × default/paused/fallback), autodocs, portable fallback artwork and attribution. Build library/Storybook, fix integration errors.
4. [x] Browser-check all default stories at desktop/mobile and safe-state stories. Test reduced motion, pause, no-GPU, touch and keyboard; save screenshots. Live MCP protocol/docs smoke.
5. [x] Add licenses/notices, README, contribution/security/release docs, CI and project MCP configs. Verify npm tarball in a separate consumer, npm audit, public-file scan, independent whole-branch review, final green checks and local commit/archive.

Review focus: preference changes after mount, GPU adapter/device failure, zero-size canvases/resizing, animation work surviving pause/unmount, npm consumers missing styles/assets. Each is covered by host/browser/consumer checks.

Execution: inline, following the user's explicit go-ahead. Existing evaluation is source evidence, not a clean build. Final reviewer checks actual code and release surface. No publication or global MCP configuration changes.
