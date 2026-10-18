import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, writeFile, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
const exec = promisify(execFile),
  root = resolve(".");
const consumer = await mkdtemp(join(tmpdir(), "effects-atlas-consumer-"));
const metadata = JSON.parse(await readFile("package.json", "utf8"));
await exec("npm", ["run", "build"], { cwd: root, maxBuffer: 4_000_000 });
const packed = await exec(
  "npm",
  ["pack", "--ignore-scripts", "--json", "--pack-destination", consumer],
  { cwd: root, maxBuffer: 4_000_000 },
);
const result = JSON.parse(packed.stdout);
const filename = result[0].filename;
const command = async (args) => {
  const { stdout, stderr } = await exec("npm", args, {
    cwd: consumer,
    maxBuffer: 4_000_000,
  });
  if (stderr) process.stderr.write(stderr);
  return stdout;
};
await writeFile(
  join(consumer, "package.json"),
  JSON.stringify({ private: true, type: "module" }),
);
await command([
  "install",
  "--no-fund",
  "--no-audit",
  join(consumer, filename),
  `react@${metadata.devDependencies.react}`,
  `react-dom@${metadata.devDependencies["react-dom"]}`,
  `vite@${metadata.devDependencies.vite}`,
  `typescript@${metadata.devDependencies.typescript}`,
  `@types/react@${metadata.devDependencies["@types/react"]}`,
  `@types/react-dom@${metadata.devDependencies["@types/react-dom"]}`,
]);
const ssr = `import React from 'react';import {renderToString} from 'react-dom/server';import {Effect} from 'effects-atlas';const html=renderToString(React.createElement(Effect,{id:'neon-glow'}));if(!html.includes('Neon glow')||html.includes('<canvas'))throw Error('SSR must render a named static preview');console.log('SSR static preview verified');`;
await writeFile(join(consumer, "ssr.mjs"), ssr);
await exec("node", ["ssr.mjs"], { cwd: consumer });
await writeFile(
  join(consumer, "index.html"),
  '<div id="root"></div><script type="module" src="/main.tsx"></script>',
);
await writeFile(
  join(consumer, "main.tsx"),
  `import React from 'react';import {createRoot} from 'react-dom/client';import {Effect,effects,type EffectProps} from 'effects-atlas';import 'effects-atlas/styles.css';const props:EffectProps={id:'metaballs'};createRoot(document.getElementById('root')!).render(<><Effect {...props}/>{effects.map(effect=><Effect key={effect.id} id={effect.id} paused/>)}</>);`,
);
await writeFile(
  join(consumer, "tsconfig.json"),
  JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      lib: ["ES2022", "DOM"],
      module: "ESNext",
      moduleResolution: "Bundler",
      jsx: "react-jsx",
      strict: true,
      noEmit: true,
      skipLibCheck: true,
    },
    include: ["main.tsx"],
  }),
);
await exec(join(consumer, "node_modules/.bin/tsc"), ["--noEmit"], {
  cwd: consumer,
});
await command(["exec", "--", "vite", "build"]);
await mkdir("artifacts", { recursive: true });
await writeFile(
  "artifacts/package-smoke.json",
  JSON.stringify(
    {
      package: filename,
      consumer,
      checks: [
        "npm tarball installed in an independent consumer",
        "public TypeScript API compiled",
        "SSR static preview rendered",
        "Vite consumer production build with exported CSS",
      ],
      files: result[0].files.map((file) => file.path),
    },
    null,
    2,
  ),
);
console.log("Package consumer verified:", consumer);
