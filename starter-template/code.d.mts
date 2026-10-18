export function renderExample(selection: {
  kind: "effect" | "recipe";
  id: string;
  settings?: { speed?: number; intensity?: number; colors?: string[] };
}): string;
