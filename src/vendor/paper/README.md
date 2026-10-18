# Selected Paper Shaders React adapters

Source: https://github.com/paper-design/shaders/tree/43cd68db79fa0b1759f72ffc941b3238e2a3954c/packages/shaders-react/src
Version: 0.0.81. License: Apache-2.0; full text in `licenses/paper-shaders.txt`. All upstream copyright/license notices remain in force. These selected source adapters are redistributed; the core GLSL/renderer remains a pinned external `@paper-design/shaders` dependency.

Only seven shader adapters and their required helpers are copied. Changes:

- `shader-mount.tsx`: catch asynchronous initialization/image/uniform failures and report through the instance-local `PaperFailureContext`; invalidate pending initialization on cleanup. No global error listener or promise interception.
- `shaders/liquid-metal.tsx`: catch image preprocessing failures and revoke generated image URLs on cleanup.
- File headers identify provenance; formatting follows this repository.

Why: the upstream React mount starts async initialization without handling rejection. A context can be available during the capability probe but denied at the later renderer allocation. A React error boundary cannot catch that promise rejection. Vendoring this narrow adapter set fixes that failure for npm consumers too, without relying on a bundler alias or an install-time dependency patch.

When updating: compare these files against the pinned upstream source, preserve the failure/cancellation behavior, review all licenses/notices and rerun the late-allocation regression, default visual tests and clean package-consumer test. Do not replace this directory with an entire demo registry.
