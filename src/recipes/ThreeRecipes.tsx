import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei/core/ContactShadows.js";
import { Float } from "@react-three/drei/core/Float.js";
import { MeshTransmissionMaterial } from "@react-three/drei/core/MeshTransmissionMaterial.js";
import { MeshReflectorMaterial } from "@react-three/drei/core/MeshReflectorMaterial.js";
import {
  normalizeSettings,
  type RecipeId,
  type RecipeSettings,
} from "./catalog";
export default function ThreeRecipes({
  id,
  settings,
}: {
  id: RecipeId;
  settings?: RecipeSettings;
}) {
  const { speed, intensity, colors } = normalizeSettings(settings);
  const color = colors[0] || "#a5b4fc";
  return (
    <Canvas
      aria-hidden="true"
      dpr={[1, 1.5]}
      camera={{ position: [0, 1, 5], fov: 42 }}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={["#111326"]} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 5, 4]} intensity={4} />
      <pointLight position={[-3, 1, 2]} color="#fa7ba8" intensity={18} />
      {id === "floating-object" && (
        <ContactShadows
          position={[0, -1.05, 0]}
          scale={6}
          opacity={0.6}
          blur={2}
          far={3}
          resolution={128}
        />
      )}
      <Float
        speed={speed * 1.5}
        rotationIntensity={intensity * 0.4}
        floatIntensity={intensity * 0.5}
      >
        <mesh position={[0, 0.25, 0]}>
          <torusKnotGeometry args={[0.7, 0.22, 96, 16]} />
          {id === "glass-transmission" ? (
            <MeshTransmissionMaterial
              resolution={256}
              samples={4}
              thickness={0.6}
              roughness={0.12}
              transmission={1}
              color={color}
            />
          ) : (
            <meshStandardMaterial
              color={color}
              metalness={id === "reflective-pedestal" ? 0.85 : 0.2}
              roughness={0.25}
            />
          )}
        </mesh>
      </Float>
      {id === "glass-transmission" && (
        <mesh position={[0, 0, -1.5]}>
          <planeGeometry args={[5, 4]} />
          <meshStandardMaterial color="#c45790" />
        </mesh>
      )}
      {id === "reflective-pedestal" ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]}>
          <planeGeometry args={[8, 8]} />
          <MeshReflectorMaterial
            resolution={256}
            mirror={0.65}
            mixStrength={1.2}
            color="#23243b"
            roughness={0.2}
            metalness={0.6}
          />
        </mesh>
      ) : (
        <mesh position={[0, -1.2, 0]}>
          <cylinderGeometry args={[1.2, 1.3, 0.2, 48]} />
          <meshStandardMaterial color="#292b46" roughness={0.5} />
        </mesh>
      )}
    </Canvas>
  );
}
