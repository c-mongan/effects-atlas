# Storybook MCP

This project uses the official Storybook 10.6.2 addon and `features.componentsManifest: true`. Start `npm run storybook` before connecting. The server binds to loopback at `http://127.0.0.1:6006/mcp`.

- `.mcp.json` contains project-scoped HTTP configuration for compatible clients, including Claude Code.
- `.vscode/mcp.json` contains the VS Code project configuration.
- Other clients can use an HTTP/Streamable HTTP connection to that URL. The optional official setup command is `npx mcp-add --type http --url "http://127.0.0.1:6006/mcp" --scope project`. Project scripts do not run it.

Trust prompts remain under client control. No global configuration, credentials, remote proxy, or public MCP server is installed. Keep this development endpoint on loopback.

## Inspect examples

The library has 28 effects and 12 recipes, with Default, Paused, and Fallback stories for each. Start with `docs-list` to obtain current IDs. The existing `start-here-catalogue--docs` page lists effect IDs and rendering engines. Recipe stories appear under `Recipes`; inspect their entries rather than assuming the effect catalogue includes them.

Use `docs-show` with a returned ID, such as `effects-holographic-foil`, to inspect props and documentation. Use `docs-show-story` for a specific story and `get-storybook-story-instructions` for authoring guidance. `stories-preview` returns story links. `test-run` invokes the configured testing integration, including accessibility checks when requested. Read tool schemas before supplying arguments.

Keep source/license metadata and static states visible in story documentation. Recipe provenance is recorded in `docs/RECIPE_SOURCES.md`. Existing `Effect` props remain supported; `Recipe` supplies the additional recipe interface and settings.

## Verify the connection

`npm run test:mcp` opens a real MCP SDK session, lists tools, calls `docs-list`, and checks that `docs-show` returns the `forceFallback` prop and selected effect catalogue IDs. It saves ignored evidence to `artifacts/mcp-smoke.json`. It does not validate every recipe, gallery route, or starter download.

Use `MCP_RUN_TESTS=1 npm run test:mcp` to exercise the MCP test runner as well. Keep the development server running for the whole check. Use `npm run test:stories`, `npm run test:gallery`, and `npm run test:starters` for their separate coverage.

`npm run build:site` assembles the public gallery at the root and static Storybook under `storybook/`. Static Storybook contains documentation and manifests, but no live MCP process. Pinned versions make changes to Storybook's preview AI features reviewable.

Primary references: [official overview](https://storybook.js.org/docs/ai/mcp/overview), [manifest documentation](https://storybook.js.org/docs/ai/manifests).
