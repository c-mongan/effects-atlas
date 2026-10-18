# Release checklist

The public destination is `c-mongan/effects-atlas`, with delivery through `main` and GitHub Pages. The gallery is the site root; Storybook is under `storybook/`. No npm package has been published. An npm publication is a separate release action; the local package name is not a registry reservation.

## Build and check

1. Confirm the repository, branch, reviewed diff, and current Pages settings. Keep private receipts, credentials, dependencies, and test output out of Git.
2. Run `npm ci`, `npm run check`, `npm run test:stories`, `npm run test:browser`, `npm run test:no-gpu`, and `npm run test:package`. Run `npm audit --audit-level=moderate`. Run `npm run test:mcp` with the local Storybook server available.
3. Run `npm run build:site`. This builds the library, Storybook, starter assets, and gallery, then assembles `site-dist/`. The assembler places Storybook in `site-dist/storybook/` and downloadable starter assets in `site-dist/starters/`. It also supplies the legacy iframe redirect.
4. Run `npm run test:gallery` and `npm run test:starters`. Verify all 40 examples, selected settings, copied code, downloaded ZIP contents, and clean-consumer behavior. Keep catalogue-count assertions aligned when the collection changes.
5. Run the browser and gallery suites with `ATLAS_BROWSER=firefox` and `ATLAS_BROWSER=webkit`. Inspect desktop/mobile layouts and accessible static states. On supported native hardware, run `REQUIRE_GPU=1 npm run test:browser`. Record real GPU and fallback results separately.
6. Review `THIRD_PARTY_NOTICES.md`, `licenses/`, and `docs/RECIPE_SOURCES.md`. Inspect `npm pack --dry-run`. The package must include compiled JS, types, CSS, the root license, source notices, and required upstream licenses. Preserve the existing `Effect` API and CSS export alongside the new recipe exports.

Use [VERIFICATION.md](VERIFICATION.md) for recorded results. Local results do not prove that the current CI run or public deployment passed.

## Deploy and read back

Pages uses **Settings → Pages → Source: GitHub Actions** and the repository variable `ENABLE_PAGES=true`. The workflow uploads `site-dist/` on a default-branch push. Deployment depends on both the main verification job and the Firefox/WebKit matrix. Pull requests cannot deploy.

After the authorized `main` delivery, wait for all required workflow jobs and the Pages deployment. Check the public site anonymously at its project subpath. Verify gallery routes, an example with settings, a starter download, the guide, source records, compositions, `storybook/`, and legacy Storybook links. Report the deployed revision and any failed checks. Do not call the site live from a successful build or push alone.

The package is ESM and targets React 19. CSS remains available at `effects-atlas/styles.css`. Heavy renderers load lazily, and static server rendering remains supported. Static Pages hosting does not run MCP; that endpoint belongs to the local Storybook development server.
