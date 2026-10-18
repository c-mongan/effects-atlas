# Effects Atlas

Approved direction: the user requested a single open-source-ready React/Storybook repository using the best evaluated examples, fixing the observed issues and including MCP setup. Build locally; publishing is outside this preparation step.

Provide 28 named effects (the original 20 plus eight tested additions), source/license metadata, self-contained stories and a typed reusable Effect component. Use Paper Shaders 0.0.81, Sprite Lite 0.1.1, selected adaptations with preserved MIT notices, and optional WebGPU examples from the published Shaders package. Its published package differs from the evaluated workspace snapshot and must be retested. Avoid importing the broken example registries or MCP bundle generator.

Public API: Effect({ id, paused?, forceFallback?, className?, style? }). A bounded effect host detects GPU capability, honors reduced motion and page visibility, freezes CSS/Paper time or replaces uncontrolled simulations with an attractive static preview. Paused/reduced states must have no changing frames. GPU failures show the same preview plus a readable explanation. Pointer effects support touch and keyboard. No remote images, fonts or credentials. Fractal shader guards radius/derivative divisions; no upstream control panels.

Storybook 10.6.2 / React Vite, autodocs and components manifest; official addon-mcp on loopback /mcp. Each effect has Default, Paused and Fallback stories. A docs story explains sources, motion behavior and rendering requirements. MCP configs support project-scoped clients without changing global configuration. Verify initialize, tools/list, docs-list and docs-show against the actual server.

Acceptance: clean npm ci; strict typecheck; unit tests for host behavior; production library and Storybook builds; Chromium checks every story at desktop/mobile with no uncaught errors, reduced-motion/pause frame stability, no-GPU fallback, pointer/touch/keyboard behavior; MCP live smoke; package tarball imports in a clean consumer; licenses and release docs. CI runs the repeatable checks. Source audit, screenshots and exact limits are delivered. MIT for original work, upstream notices retained.
