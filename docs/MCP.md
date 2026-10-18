# Storybook MCP

This project uses the official Storybook 10.6.2 addon and `features.componentsManifest: true`. Start `npm run storybook` before connecting a client. The server binds to loopback, at `http://127.0.0.1:6006/mcp`.

- `.mcp.json`: project-scoped HTTP configuration for compatible clients, including Claude Code.
- `.vscode/mcp.json`: VS Code's project MCP server configuration.
- Other clients: use their supported project configuration with an HTTP/Streamable HTTP server at that URL. The official setup also offers `npx mcp-add --type http --url "http://127.0.0.1:6006/mcp" --scope project` to select a client. This command is optional; it is not run by npm install or project scripts.

Connection/trust prompts remain controlled by your client. No global config, credentials, remote proxy or public server is installed. Keep this development endpoint on loopback; shared hosting and authentication are separate work.

`docs-show` with `id: "start-here-catalogue--docs"` lists every supported effect ID and rendering engine.

Query `docs-list`, then `docs-show` with an entry such as `effects-holographic-foil`, to inspect actual props. `docs-show-story` shows a specific recipe. `get-storybook-story-instructions` provides current authoring guidance. `stories-preview` returns story links. `test-run` invokes Storybook's configured testing integration, including accessibility checks when requested. Consult the tools' input schemas instead of assuming fields.

`npm run test:mcp` uses the MCP SDK to initialize a real session, list tools, call `docs-list`, and verify `docs-show` returns the `forceFallback` prop and the catalogue exposes effect IDs. It saves evidence to ignored `artifacts/mcp-smoke.json`. To exercise MCP's test runner too, use `MCP_RUN_TESTS=1 npm run test:mcp`. The local development server must remain running for the entire check.

Static Storybook builds include manifests/documentation but do not host a live MCP process. Documentation and test tools can change while Storybook's AI features are in preview; versions are pinned to make changes reviewable.

Primary references: [official overview](https://storybook.js.org/docs/ai/mcp/overview), [manifest documentation](https://storybook.js.org/docs/ai/manifests).
