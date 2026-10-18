import { zipSync, strToU8 } from "fflate";
import { effects, recipes } from "../src/index";
import { renderExample } from "../starter-template/code.mjs";

export interface StarterSelection {
  kind: "effect" | "recipe";
  id: string;
  settings?: { speed?: number; intensity?: number; colors?: string[] };
}

function validateSelection(selection: StarterSelection): void {
  const entries =
    selection.kind === "effect"
      ? effects
      : selection.kind === "recipe"
        ? recipes
        : [];
  if (!entries.some((entry) => entry.id === selection.id))
    throw new Error("Unknown starter example.");
  if (selection.settings !== undefined) {
    const { speed, intensity, colors } = selection.settings;
    if (
      [speed, intensity].some(
        (value) => value !== undefined && !Number.isFinite(value),
      )
    )
      throw new Error("Settings must contain finite numbers.");
    if (
      colors !== undefined &&
      (!Array.isArray(colors) ||
        colors.some((color) => !/^#[0-9a-f]{6}$/i.test(color)))
    )
      throw new Error("Colours must use six-digit hex values.");
  }
}

export function codeForExample(selection: StarterSelection): string {
  validateSelection(selection);
  return renderExample(selection);
}

export async function downloadStarter(
  selection: StarterSelection,
): Promise<void> {
  const app = codeForExample(selection);
  const base = new URL(
    `${import.meta.env.BASE_URL}starters/`,
    document.baseURI,
  );
  const [manifestResponse, packageResponse] = await Promise.all([
    fetch(new URL("template.json", base)),
    fetch(new URL("effects-atlas.tgz", base)),
  ]);
  if (!manifestResponse.ok || !packageResponse.ok)
    throw new Error("The starter could not be loaded. Please try again.");
  const manifest = (await manifestResponse.json()) as {
    files: Record<string, string>;
  };
  const files: Record<string, Uint8Array> = {};
  for (const [name, content] of Object.entries(manifest.files)) {
    if (
      name.startsWith("/") ||
      name.split("/").some((part) => part === "..") ||
      name.includes("\\")
    )
      throw new Error("Invalid starter asset path.");
    files[name] = strToU8(content);
  }
  files["App.tsx"] = strToU8(app);
  files["effects-atlas.tgz"] = new Uint8Array(
    await packageResponse.arrayBuffer(),
  );
  const archive = zipSync(files, { level: 6 });
  const url = URL.createObjectURL(
    new Blob([new Uint8Array(archive)], { type: "application/zip" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `effects-atlas-${selection.kind}-${selection.id}.zip`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
