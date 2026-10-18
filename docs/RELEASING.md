# Release checklist

The selected public destination is `c-mongan/effects-atlas`. Check the repository and Pages settings before each release. No npm package has been published.

Before a first public release:

- Authenticate the GitHub CLI as `c-mongan` before creating the public repository. The connected GitHub tools cannot create repositories or administer Pages.
- Confirm the package name or scope is available before a separate npm release; the local name `effects-atlas` is not a reservation.
- Run `npm ci`, `npm run check`, `npm run test:stories`, `npm run test:browser`, `npm audit` and `npm run test:mcp` with the dev server running. On supported native hardware run `REQUIRE_GPU=1 npm run test:browser` too.
- Inspect desktop/mobile screenshots and reduced-motion/static states. Smoke-test real target devices and browsers; Linux CI fallbacks do not substitute for this.
- Review THIRD_PARTY_NOTICES.md and licenses, then `npm pack --dry-run` to inspect the distribution. Test the tarball in a clean consumer.
- Inspect `git ls-files` for private paths, credentials, accidental artifacts or evaluation media. Do not commit node_modules, test output or local receipts.
- Review the final diff, enable the repository's private security reporting if desired, and select the initial version/tag.
- For an approved Storybook deployment, enable **Settings → Pages → Source: GitHub Actions** and set the repository variable `ENABLE_PAGES` to `true` before the default-branch push. The verify job uploads the Pages artifact after all checks pass; the dependent deploy job publishes it. Pull requests cannot deploy.
- Verify the public repository anonymously, wait for both workflow jobs to succeed, and smoke-test the deployed Storybook at its project subpath. Do not claim a live URL before that succeeds.

The npm package is ESM and targets React 19. The CSS is exported at `effects-atlas/styles.css`. Browser engines must load packages dynamically; fallback SSR is supported. A package release should include compiled JS, types, CSS, root license, upstream notices and licenses.

The Pages workflow follows [GitHub’s custom workflow guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). The hosted site is static: MCP remains available through the local Storybook dev server only.
