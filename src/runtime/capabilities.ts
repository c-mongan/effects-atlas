export type Capability = "none" | "webgl2" | "webgpu";
/** Probe only the required API, and release the temporary WebGL context. */
export async function detectCapability(kind: Capability): Promise<boolean> {
  if (kind === "none") return true;
  try {
    if (kind === "webgpu") {
      const gpu = (
        navigator as Navigator & {
          gpu?: { requestAdapter: () => Promise<unknown> };
        }
      ).gpu;
      return !!(gpu && (await gpu.requestAdapter()));
    }
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}
