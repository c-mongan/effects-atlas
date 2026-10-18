import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  readFile,
  writeFile,
  mkdir,
  readdir,
  rename,
  mkdtemp,
  cp,
  rm,
} from "node:fs/promises";
import { resolve, join } from "node:path";
const exec = promisify(execFile);
const root = resolve(import.meta.dirname, "..");
const output = join(root, ".generated/starters");
const metadata = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
await mkdir(output, { recursive: true });
// A same-filesystem temporary directory keeps generated dependency work on the workspace drive.
const staging = await mkdtemp(join(output, ".build-"));
try {
  const packed = await exec(
    "npm",
    ["pack", "--ignore-scripts", "--json", "--pack-destination", staging],
    { cwd: root, maxBuffer: 4_000_000 },
  );
  const pack = JSON.parse(packed.stdout)[0];
  for (const required of [
    "dist/index.js",
    "dist/styles.css",
    "LICENSE",
    "THIRD_PARTY_NOTICES.md",
  ]) {
    if (!pack.files.some((file) => file.path === required))
      throw new Error(`Package lacks ${required}; run npm run build first.`);
  }
  await rename(
    join(staging, pack.filename),
    join(staging, "effects-atlas.tgz"),
  );
  const dependency = (name) => {
    const version = metadata.devDependencies[name];
    if (!/^\d+\.\d+\.\d+(?:-[\w.-]+)?$/.test(version ?? ""))
      throw new Error(`A pinned version is required for ${name}`);
    return version;
  };
  const pkg = {
    name: "effects-atlas-starter",
    version: "1.0.0",
    private: true,
    type: "module",
    engines: metadata.engines,
    scripts: {
      dev: "vite --host 127.0.0.1",
      build: "tsc --noEmit && vite build --base=./",
      preview: "vite preview --host 127.0.0.1",
    },
    dependencies: {
      "effects-atlas": "file:./effects-atlas.tgz",
      react: dependency("react"),
      "react-dom": dependency("react-dom"),
    },
    devDependencies: Object.fromEntries(
      ["vite", "typescript", "@types/react", "@types/react-dom"].map((name) => [
        name,
        dependency(name),
      ]),
    ),
  };
  await writeFile(
    join(staging, "package.json"),
    JSON.stringify(pkg, null, 2) + "\n",
  );
  await exec(
    "npm",
    [
      "install",
      "--package-lock-only",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
    ],
    { cwd: staging, maxBuffer: 4_000_000 },
  );
  const files = {};
  for (const name of ["main.tsx", "styles.css", "index.html", "README.md"])
    files[name] = await readFile(join(root, "starter-template", name), "utf8");
  for (const name of ["package.json", "package-lock.json"])
    files[name] = await readFile(join(staging, name), "utf8");
  for (const name of ["LICENSE", "THIRD_PARTY_NOTICES.md"])
    files[name] = await readFile(join(root, name), "utf8");
  for (const name of await readdir(join(root, "licenses")))
    files[`licenses/${name}`] = await readFile(
      join(root, "licenses", name),
      "utf8",
    );
  files["docs/RECIPE_SOURCES.md"] = await readFile(
    join(root, "docs/RECIPE_SOURCES.md"),
    "utf8",
  );
  files["tsconfig.json"] =
    JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          lib: ["ES2022", "DOM", "DOM.Iterable"],
          module: "ESNext",
          moduleResolution: "Bundler",
          jsx: "react-jsx",
          types: ["vite/client"],
          strict: true,
          noEmit: true,
          skipLibCheck: true,
        },
        include: ["*.tsx"],
      },
      null,
      2,
    ) + "\n";
  await cp(
    join(staging, "effects-atlas.tgz"),
    join(output, "effects-atlas.tgz"),
  );
  await writeFile(
    join(output, "template.json"),
    JSON.stringify(
      { version: 1, packageVersion: metadata.version, files },
      null,
      2,
    ) + "\n",
  );
  console.log(`Starter assets written to ${output}`);
} finally {
  await rm(staging, { recursive: true, force: true });
}
