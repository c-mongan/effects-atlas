# Local release verification

18 October 2026. The table below records the source snapshot verification supplied with the archive. The MacBook Air publication checks are recorded separately below. Hosted results are available in the repository Actions tab.

| Check                                 | Result                                                                                                               |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Fresh `npm ci`                        | Passed                                                                                                               |
| Strict TypeScript                     | Passed                                                                                                               |
| Host behavior unit tests              | 9 passed                                                                                                             |
| Library build                         | Passed; ESM, declarations and CSS                                                                                    |
| Production Storybook build            | Passed; 84 stories plus documentation                                                                                |
| Storybook/Vitest browser tests        | 84 passed                                                                                                            |
| Native Chromium suite                 | 119 passed                                                                                                           |
| Explicitly unavailable GPU APIs       | 11 passed; 3 GPU-only diagnostics correctly skipped                                                                  |
| MCP protocol, tool discovery and docs | Passed; 8 tools, component props and supported ID catalogue                                                          |
| MCP accessibility-enabled test call   | Holographic foil story passed                                                                                        |
| Independent npm tarball consumer      | Installed; public types (including catalogue mapping and CSS import), SSR preview and production build passed        |
| Consumer browser                      | 29 effects mounted from the installed package, CSS loaded and live Metaballs canvas rendered without page exceptions |
| npm audit                             | 0 known vulnerabilities at verification time                                                                         |
| Independent source review             | Passed after the three reported findings were fixed                                                                  |

Browser: full Chromium 156.0.8078.4, Playwright 1.64.1, Node 22.23.2, macOS x64. WebGL used ANGLE Metal on Intel Iris Plus Graphics 655; a WebGPU adapter was verified in the secure localhost context. Mobile means 390×844 viewport/touch emulation, not a physical phone.

The 119 browser cases comprise 56 desktop/mobile defaults (including axe checks and canvas dimensions), 56 Paused/Fallback cases, and seven interaction/failure/numeric checks. Static states assert no canvases or running animations, unchanged SVG markup and a small pixel tolerance for GPU rasterization. The fractal test executes the actual GLSL distance/normal functions at and near the origin. Later allocation failures are injected after a successful capability probe for both Paper and WebGPU.

The review fixes cover scoped asynchronous Paper failure handling, catalogue ID typing and correct unavailable-GPU test behavior. Accessibility checks also caught and fixed foil label/name mismatch and mobile glass contrast. Selected Paper adapters preserve source/version, Apache-2.0 license/notice and explicit modification notices.

[Desktop overview](screenshots/overview-desktop.jpg), [mobile overview](screenshots/overview-mobile.jpg), [Storybook interface](screenshots/storybook.png).

Raw logs, MCP responses, package checks and Playwright reports are stored in ignored local artifact directories or uploaded by CI. Those can contain machine-specific paths, so they are not committed as public source. The shipped tests/scripts reproduce the checks. The clean consumer is built from the packed distribution, not source aliases.

Remaining limits: physical devices, Safari/Firefox, sustained frame rate/battery cost, manual screen-reader testing and hosted CI remain unverified. See EVALUATION.md and RELEASING.md before publication.

## MacBook Air publication checks

Fresh checks on 18 October 2026 used Node 22.23.0 and Chromium 156 on macOS ARM64.

- Clean dependency install and strict TypeScript passed; 9 unit tests passed.
- Library and production Storybook builds passed; 84 Storybook tests passed.
- `REQUIRE_GPU=1 npm run test:browser`: 119 passed, including desktop and mobile viewport checks, pause, reduced motion, context loss and late renderer failure.
- Independent tarball installation, public types, SSR and consumer production build passed.
- Live MCP handshake, documentation queries and accessibility-enabled foil test passed.
- `npm audit`: zero known vulnerabilities at the time of the check.
- Manual browser checks confirmed foil pause/resume and found a catalogue table rendered as plain text. The table now uses HTML. Its regression test failed against the old static build and passed after the rebuild.
- Forced no-GPU checks: 11 passed; 3 GPU-only diagnostics skipped as expected.
- The staged publication files passed a Gitleaks scan with no findings.
- Publication preparation excludes the machine handoff and generated graph. Pages deployment requires the repository variable `ENABLE_PAGES=true`.

These checks do not establish physical-phone, Safari/Firefox, battery or sustained frame-rate support. The older snapshot results above remain separate from this run.
