import { useEffect, useRef } from "react";
import * as THREE from "three";
export function ClayEffect({ onFailure }: { onFailure: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    element.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#e9d9ca");
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 1.3, 6.5);
    camera.lookAt(0, 0.2, 0);
    const geometry = new THREE.TorusKnotGeometry(0.88, 0.3, 128, 24),
      material = new THREE.MeshStandardMaterial({
        color: "#d47760",
        roughness: 1,
        metalness: 0,
      });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.position.y = 0.25;
    scene.add(mesh);
    const planeGeometry = new THREE.PlaneGeometry(200, 200),
      planeMaterial = new THREE.MeshStandardMaterial({
        color: "#e9d9ca",
        roughness: 1,
      });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -1.25;
    plane.receiveShadow = true;
    scene.add(plane);
    scene.add(new THREE.HemisphereLight("#fff5e5", "#8b7c81", 2.3));
    const light = new THREE.DirectionalLight("#fff4df", 4);
    light.position.set(-3, 5, 4);
    light.castShadow = true;
    light.shadow.mapSize.set(1024, 1024);
    light.shadow.normalBias = 0.03;
    scene.add(light);
    const resize = () => {
      const width = element.clientWidth,
        height = element.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    const contextLost = (event: Event) => {
      event.preventDefault();
      onFailure();
    };
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    let frame = 0,
      previous = 0;
    const draw = (time: number) => {
      const dt = Math.min((time - previous) / 1000, 0.04);
      previous = time;
      mesh.rotation.y += dt * 0.3;
      mesh.rotation.z += dt * 0.07;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      geometry.dispose();
      material.dispose();
      planeGeometry.dispose();
      planeMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [onFailure]);
  return <div className="ea-fill" ref={root} />;
}
