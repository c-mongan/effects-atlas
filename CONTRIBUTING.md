# Contributing

Use Node 22.12+ and `npm ci`. Open Storybook with `npm run storybook`. Keep a change focused and include a description, source/license provenance and screenshots for changed visual behavior.

Add an entry to `src/catalog.ts`, a renderer recipe under `src/effects/`, and Default/Paused/Fallback stories. New rendering engines must use the shared motion/capability boundary. Do not add global event handlers without cleanup, unbounded pixel ratios, unexpected network requests, unlicensed assets or copied demo registries. GPU examples need a useful static preview. Interactive examples need pointer/touch and keyboard alternatives.

Run the commands in the README before sending a change. Add a regression test for a meaningful bug; avoid tests that merely duplicate constants. Browser tests store screenshots in ignored `test-results/`; attach selected images to your review. Preserve third-party notices. Report native hardware rendering and fallback-only results separately.

Be respectful, specific and constructive in issues and reviews. Do not publish private data or security exploit details in a public issue.
