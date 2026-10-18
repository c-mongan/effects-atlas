# Evaluation and implementation decisions

## Selection

This repository follows a separate source/build/browser evaluation of the twenty requested visual styles and eight additions. That phase captured 372 desktop/mobile cases across shortlisted components and demos; successful captures were kept separate from runtime errors and visual defects. Those private local evaluation artifacts are not redistributed here. The screenshots in this repository are newly captured from this Storybook.

The strongest reusable foundation was Paper Shaders. WebGPU examples use the published `shaders` package (4.0.4), rather than unpublished workspace package names or local symlinks. This version differs from the evaluated source snapshot and is independently retested here. Core npm dependencies remain external in the library build and are pinned by the lockfile. Seven selected Paper React adapters and helpers are vendored with preserved Apache-2.0 notices to fix scoped asynchronous failures without consumer bundler aliases.

## Issues addressed here

- Missing WebGL/WebGPU: probe the needed API before mounting and display static SVG art plus an explicit status. WebGPU's `onUnavailable` and a startup deadline handle later initialization failures. WebGL context loss is caught at the host boundary. A patched, vendored Paper mount catches initialization/uniform/image rejections per instance and invalidates stale initialization; Liquid Metal preprocessing catches failure and revokes object URLs.
- Motion: current and changed reduced-motion preferences, caller/local pause and hidden documents prevent live renderers from mounting. Returning to the page restarts eligible animation. Static previews replace simulations; they are not frozen last frames.
- Stale Glintkit story props and use-shader-fx shared runtime exceptions: those demo registries are excluded. The selected styles use working dependencies or small self-contained compositions instead.
- UI FX MCP missing dependency files: no bundle generator is copied. Installable dependencies come from npm and the shared host API is exposed through official Storybook manifests/MCP.
- Global demo/confetti bleed: each story mounts exactly one effect with scoped styles and cleanup.
- Mandelbulb origin singularity: guard radius, derivative and normal divisions and clamp gamma input. React host removes the control panel, bounds pixel count, handles resize/context loss and cleans up resources. A browser shader test checks finite values at/near zero.
- Mobile controls: the fractal and print entries use full-stage renderers instead of embedding desktop control panels. Foil supports pointer/touch/keyboard; Ink Flow has a keyboard demonstration button.
- Packaging: the distribution includes exported CSS types so strict TypeScript consumers can import the stylesheet. A clean external consumer exercises the tarball rather than source aliases.
- Dependency audit: Vite and MCP SDK were upgraded from the initial setup after npm advisories. The final audit result is recorded with the acceptance evidence; no audit bypass is configured.

## Scope and limits

Automated Chromium checks cover the 28 Default stories on desktop (1440×1000) and mobile (390×844), all Paused/Fallback stories, frame stability (no running animations, unchanged SVG markup, and less than 0.5% of pixels differing by more than eight channel levels, allowing rasterization noise), preference changes, capability failure, interaction, dimensions/overflow, page exceptions and axe checks on animated defaults. GPU-required checks are run separately from software/unsupported fallback paths. GPU-only numeric/context-loss diagnostics skip only when their API is unavailable and REQUIRE_GPU is unset; the fallback tests still run. Storybook's Vitest checks exercise all 84 stories. The MCP smoke performs real protocol and documentation calls; an optional mode runs an accessibility-enabled story test through MCP too. The package smoke creates an independent npm consumer for types, SSR and a production Vite build.

There is no hosted-service or cross-browser certification. Mobile is emulated on a Mac; physical phones, Safari/Firefox, battery use and sustained frame-rate budgets remain unverified. GPU availability varies by platform, secure context, adapter and driver. Static previews are authored illustrations. The clay renderer caps pixel ratio; Paper and fractal recipes cap pixel counts, but WebGPU performance has not been benchmarked. Automated accessibility checks are not a manual screen-reader audit. Several shaders are image treatments, so changed input assets can change their visual quality.

The eight advanced additions are intentionally optional at runtime through lazy loading, but their package dependencies are installed by npm. No public npm package name is reserved. GitHub CI repeats the checks on pushes and pull requests; see the repository Actions tab for current results.
