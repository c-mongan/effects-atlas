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

## Firefox, WebKit and native Safari checks

18 October 2026, macOS ARM64. These results extend the earlier browser scope.

| Browser or check                      | Result                                                                                                                                                                           |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Playwright Firefox 157.0              | All 120 existing browser tests passed. Nine focused checks passed after the fixes, including layout at 320px, 390px and 1440px.                                                  |
| Playwright WebKit 27.2                | 119 of 120 existing tests passed initially. The remaining failure was in the WebGPU failure injection. After correcting it, all eight affected and new regression checks passed. |
| Chromium                              | All eight affected and new regression checks passed after the fixes.                                                                                                             |
| Installed Safari 26.6.2               | Manual checks on the public site confirmed live Mesh Gradient (WebGL) and Particle Swarm (WebGPU), foil rendering, pause/resume, and the hidden-tab static preview.              |
| Types, unit tests, builds and stories | Strict types, nine unit tests, library/Storybook builds and all 84 Storybook tests passed.                                                                                       |

Visual review found that the glass panel extended about 10px beyond its stage at a 390px viewport. A layout regression test failed before the fix. The glass scene now uses a `minmax(0, 1fr)` grid column so the panel fits inside its stage. Regression checks cover 320px, 390px and desktop widths. Screenshots confirm that the right border is visible.

The WebKit failure-injection diagnostic showed zero calls to a patched GPU object's `requestAdapter`, while the live effect continued to render. Defining that patched object on `navigator.gpu` made the injection reliable: three adapter calls, the expected unavailable-renderer status, no canvas and no page errors. The original assertion timeout remains unchanged.

Run `npm run test:firefox` or `npm run test:webkit` after installing those Playwright browsers. `ATLAS_BROWSER` also selects the browser for the common test command. JSON reports retain graphics-fallback annotations. Firefox's Particle Swarm check confirmed an unavailable WebGPU API and a working static fallback in this test build; that is not proof of live WebGPU rendering in Firefox. Firefox uses a narrow viewport and touch support without Playwright's unsupported `isMobile` option.

CI now runs Firefox and WebKit as separate jobs, and Pages deployment waits for both jobs as well as the original verification job. See Actions for current full-suite results. Playwright WebKit is a separate build from installed Safari. The native Safari checks are a manual sample, not the full automated suite. Physical phones, sustained performance and manual screen-reader testing remain outside this verification.

## Gallery and 12-recipe release

The catalogue now has 28 effects and 12 recipes, with 120 isolated stories. The public gallery includes search and library-grouped filters, selected controls, three website compositions, guides, source records, static captured thumbnails, and downloadable React/Vite starters. Storybook is assembled below `/storybook/`; old root story/iframe URLs preserve query parameters and fragments.

Local verification on macOS ARM64:

- 26 unit tests and 120 Storybook tests passed; strict types and library, gallery and Storybook builds passed.
- 172 existing and new native-GPU browser cases passed. The added three-scene unavailable-WebGL check passed separately after correcting its test to locate the CSS static artwork.
- Firefox and WebKit passed the same 172 browser cases. The new unavailable-WebGL check passed separately in both engines.
- All 40 generated starters installed from the locked local tarball, compiled and built in an independent consumer, and passed Chromium browser checks. Tests included exact selected settings, CSS, pause/resume, reduced motion, control behaviour and no external runtime requests.
- The gallery acceptance suite covers page accessibility at 320px, 768px and 1440px; filter combinations; route/settings validation; clipboard failure; ZIP download/code equality; legacy redirects; paused interactive controls; offscreen cleanup and GPU fallback labels.
- The no-GPU suite passed 11 cases, with three GPU-only diagnostics skipped. Native and fallback results remain distinct.
- Installed Safari 26.6.2 rendered the new glass scene, kept tabs functional while paused, and downloaded a ZIP whose application source and required files were read back. Native Safari is a manual sample, not the full automated suite.
- Package consumer and live MCP smoke passed. The dependency audit reported zero known vulnerabilities.

Review and tests corrected invalid paragraph labelling, transient text contrast, unsupported colour controls, paused controls disappearing from the detail view, mobile recipe clipping, missing starter CSS types, attribution wording, keyboard jump focus, and hidden fallback messages. Renderers remain lazy; the static gallery starts without canvases. Captured preview images total roughly 0.4 MB.

These checks do not establish physical-phone support, sustained frame rates, battery cost or manual screen-reader certification. See the current GitHub Actions run for hosted acceptance and deployment results. The prior `98a7777` release is the rollback point for this change.
