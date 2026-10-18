# Effects Atlas starter

Use Node.js 22.12 or later.

1. Run `npm ci` to install the locked dependencies.
2. Run `npm run dev` to open the Vite development server.
3. Run `npm run build` to check TypeScript and create `dist/`.
4. Run `npm run preview` to check the production build.

`App.tsx` contains the selected example and its settings. Import reusable components and `effects-atlas/styles.css` from the bundled package. The package is included as `effects-atlas.tgz`, so this starter does not depend on a registry release of Effects Atlas. npm must access its registry during installation for the other dependencies. The running example uses local assets.

Use the effect or recipe controls to pause motion. The components also respect the system reduced-motion preference. Some effects require a supported graphics API. If that API is absent, the component shows a static preview.

Keep `LICENSE`, `THIRD_PARTY_NOTICES.md`, and the `licenses/` directory when you reuse or distribute this code. These files identify the licences for Effects Atlas and its adapted sources. Installed dependencies include their own licence files.
