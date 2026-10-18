import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { mkdir, writeFile } from "node:fs/promises";
const client = new Client({ name: "effects-atlas-smoke", version: "0.1.0" });
try {
  await client.connect(
    new StreamableHTTPClientTransport(
      new URL(process.env.STORYBOOK_MCP_URL ?? "http://127.0.0.1:6006/mcp"),
    ),
  );
  const { tools } = await client.listTools();
  const list = tools.find((tool) => tool.name === "docs-list");
  const show = tools.find((tool) => tool.name === "docs-show");
  if (!list || !show) throw Error("Storybook documentation tools missing");
  const docs = await client.callTool({ name: list.name, arguments: {} });
  if (docs.isError) throw Error(JSON.stringify(docs));
  const example = await client.callTool({
    name: show.name,
    arguments: { id: "effects-holographic-foil" },
  });
  if (example.isError || !JSON.stringify(example).includes("forceFallback"))
    throw Error("Component props absent from docs-show");
  const catalogue = await client.callTool({
    name: show.name,
    arguments: { id: "start-here-catalogue--docs" },
  });
  if (
    catalogue.isError ||
    !JSON.stringify(catalogue).includes("liquid-morph") ||
    !JSON.stringify(catalogue).includes("ray-marched-fractals")
  )
    throw Error("Effect IDs absent from catalogue documentation");
  let testResult;
  if (process.env.MCP_RUN_TESTS) {
    testResult = await client.callTool(
      {
        name: "test-run",
        arguments: {
          stories: [{ storyId: "effects-holographic-foil--default" }],
          a11y: true,
        },
      },
      undefined,
      { timeout: 120000 },
    );
    if (testResult.isError) throw Error(JSON.stringify(testResult));
  }
  await mkdir("artifacts", { recursive: true });
  await writeFile(
    "artifacts/mcp-smoke.json",
    JSON.stringify(
      {
        server: client.getServerVersion(),
        tools: tools.map((tool) => ({
          name: tool.name,
          inputSchema: tool.inputSchema,
        })),
        docs,
        example,
        testResult,
      },
      null,
      2,
    ),
  );
  console.log(
    JSON.stringify(
      {
        server: client.getServerVersion(),
        tools: tools.map((tool) => tool.name),
        docsList: true,
        docsShow: true,
        testRun: testResult ?? "not requested",
      },
      null,
      2,
    ),
  );
} finally {
  await client.close();
}
