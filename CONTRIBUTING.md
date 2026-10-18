# Contributing

Use Node 22.12+ and `npm ci`. Run `npm run dev:gallery` for the gallery or `npm run storybook` for component development. The collection has 40 examples: 28 effects and 12 recipes. Keep changes focused. Include source and license records, plus screenshots when appearance changes.

## Add or change an example

1. For an effect, update `src/catalog.ts`, its renderer in `src/effects/`, and its original static preview. For a recipe, update `src/recipes/catalog.ts`, the relevant lazy renderer group in `src/recipes/`, and `src/recipes/StaticRecipe.tsx`. Keep heavy runtime imports out of metadata.
2. Add Default, Paused, and Fallback stories in `src/stories/`. Preserve reduced-motion, page visibility, offscreen cleanup, and capability checks. Decorative renderers must unmount when stopped. Interactive content must remain usable without animation. Keep text readable throughout transitions.
3. Check `src/discovery.ts` for category, use cases, source links, supported controls, and guidance. Recipe metadata enters discovery through its catalogue. Check `src/settings.ts` and recipe settings normalization. Expose only controls that change the renderer. Gallery defaults, previews, URL settings, copied code, and downloads must agree.
4. Preserve source and license notices. Record recipe provenance in `docs/RECIPE_SOURCES.md` and applicable files in `licenses/`. Distinguish original work, adapted code, dependencies, and design references. Do not copy an upstream demo registry or add remote assets, fonts, or telemetry.
5. Check `starter-template/`, `site/starter.ts`, and the starter build/test scripts when exported settings or APIs change. Preserve the existing `Effect` API and `effects-atlas/styles.css` export. `Recipe` and its metadata are additional exports.

The 28-effect, 12-recipe, and 40-example assertions in starter and gallery tests are deliberate catalogue checks. When adding an example, update those expectations and their coverage together. Do not remove assertions to make an incomplete addition pass.

## Verify the change

Run `npm run check`, `npm run test:stories`, `npm run test:browser`, and `npm run test:package`. Build the complete site with `npm run build:site`, then run `npm run test:gallery` and `npm run test:starters`. The starter check installs the packed library in a clean consumer and checks all examples; it needs network access for dependencies.

Test mobile layouts, keyboard controls, reduced motion, pause, fallback, and the real interaction. Use `ATLAS_BROWSER=firefox` or `ATLAS_BROWSER=webkit` with `test:browser` and `test:gallery` for cross-browser checks. Report native GPU rendering separately from static fallback. On supported hardware, use `REQUIRE_GPU=1 npm run test:browser`. Keep local screenshots and reports in ignored output folders.

Run `npm run test:mcp` with Storybook running when documentation or MCP behavior changes. See [MCP setup](docs/MCP.md) and [release checks](docs/RELEASING.md). Record actual results and unresolved limits; a build alone does not prove browser behavior.

Be respectful and specific in reviews. Do not publish private data, credentials, or exploit details in public issues.
