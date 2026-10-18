/** The UI snippet and downloaded App use this exact generator. */
export function renderExample(selection) {
  const component = selection.kind === "recipe" ? "Recipe" : "Effect";
  const settings =
    selection.settings === undefined
      ? ""
      : ` settings={${JSON.stringify(selection.settings)}}`;
  return `import { ${component} } from "effects-atlas";\nimport "effects-atlas/styles.css";\n\nexport default function App() {\n  return <${component} id=${JSON.stringify(selection.id)}${settings} />;\n}\n`;
}
