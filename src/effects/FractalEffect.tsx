import { useEffect, useRef } from "react";
import mandelbulbFragment from "./mandelbulb.glsl?raw";
const vertex = `#version 300 es
in vec4 position;
void main(){gl_Position=position;}`;
export function FractalEffect({ onFailure }: { onFailure: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!,
      gl = canvas.getContext("webgl2", { antialias: false });
    if (!gl) {
      onFailure();
      return;
    }
    const shaders: WebGLShader[] = [];
    let program: WebGLProgram | null = null,
      buffer: WebGLBuffer | null = null,
      frame = 0;
    const dispose = () => {
      cancelAnimationFrame(frame);
      if (buffer) gl.deleteBuffer(buffer);
      if (program) gl.deleteProgram(program);
      for (const shader of shaders) gl.deleteShader(shader);
    };
    try {
      const compile = (kind: number, source: string) => {
        const shader = gl.createShader(kind)!;
        shaders.push(shader);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
          throw Error(
            gl.getShaderInfoLog(shader) ?? "Shader compilation failed",
          );
        return shader;
      };
      program = gl.createProgram()!;
      gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, mandelbulbFragment));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw Error("Shader linking failed");
      gl.useProgram(program);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
      );
      const position = gl.getAttribLocation(program, "position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      const uniform = (name: string) => gl.getUniformLocation(program!, name);
      const u = {
        resolution: uniform("u_resolution"),
        camera: uniform("u_camPos"),
        target: uniform("u_camTarget"),
        time: uniform("u_time"),
      };
      gl.uniform3f(u.target, 0, 0, 0);
      gl.uniform1f(uniform("u_power"), 8);
      gl.uniform1f(uniform("u_max_iter"), 10);
      gl.uniform1f(uniform("u_shadow_softness"), 16);
      gl.uniform1f(uniform("u_fog_density"), 0.02);
      gl.uniform3f(uniform("u_color_a"), 1, 1, 1);
      gl.uniform3f(uniform("u_color_b"), 0, 0.33, 0.67);
      const resize = () => {
        const box = canvas.getBoundingClientRect();
        const scale = Math.min(
          1,
          Math.sqrt(300_000 / Math.max(1, box.width * box.height)),
        );
        canvas.width = Math.max(1, Math.round(box.width * scale));
        canvas.height = Math.max(1, Math.round(box.height * scale));
        gl.viewport(0, 0, canvas.width, canvas.height);
      };
      const observer = new ResizeObserver(resize);
      observer.observe(canvas);
      resize();
      const lost = (event: Event) => {
        event.preventDefault();
        onFailure();
      };
      canvas.addEventListener("webglcontextlost", lost);
      const start = performance.now();
      let last = 0;
      const draw = (time: number) => {
        if (time - last > 30) {
          last = time;
          const elapsed = (time - start) / 1000,
            yaw = 0.5 + elapsed * 0.05;
          gl.uniform2f(u.resolution, canvas.width, canvas.height);
          gl.uniform3f(
            u.camera,
            2.8 * Math.cos(yaw) * Math.cos(0.3),
            2.8 * Math.sin(0.3),
            2.8 * Math.sin(yaw) * Math.cos(0.3),
          );
          gl.uniform1f(u.time, elapsed);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
        frame = requestAnimationFrame(draw);
      };
      frame = requestAnimationFrame(draw);
      return () => {
        observer.disconnect();
        canvas.removeEventListener("webglcontextlost", lost);
        dispose();
      };
    } catch {
      dispose();
      onFailure();
    }
  }, [onFailure]);
  return <canvas className="ea-fill" ref={ref} aria-hidden="true" />;
}
