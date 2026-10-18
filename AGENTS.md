# Effects Atlas contributor guidance

Use Node 22.12+ and `npm ci`. Start `npm run storybook`; the project MCP endpoint is `http://127.0.0.1:6006/mcp`.

When MCP is available, query `docs-list`, `docs-show` and `get-storybook-story-instructions` before editing examples. Check real props rather than inferring them from names. Use `test-run` for focused Storybook checks. Without an MCP connection, inspect `src/Effect.tsx`, the catalogue and existing stories directly; do not block normal development.

Preserve source/license metadata and notices for adapted code. Keep effects isolated; never import another project's entire demo registry. Preserve the host's reduced-motion, pause, visibility and capability policy. Do not add telemetry, remote images/fonts, credentials or publishing steps. New animations need Default, Paused and Fallback stories.

Run `npm run check`, `npm run test:browser` and `npm run test:stories` before claiming completion. On a GPU-capable host use `REQUIRE_GPU=1 npm run test:browser`; ordinary CI can record genuine API unavailability as a verified static fallback. Read the browser report to distinguish the two. After MCP changes run `npm run test:mcp` against the live development server.
