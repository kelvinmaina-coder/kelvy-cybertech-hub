import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";

function AnimatedShield() {
  const mesh = useRef<any>(null);

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.rotation.y = state.clock.elapsedTime * 0.35;
      mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.12;
    }
  });

  return (
    <mesh ref={mesh} scale={[1.4, 1.4, 1.4]}>
      <dodecahedronGeometry args={[1.2, 0]} />
      <meshStandardMaterial metalness={0.7} roughness={0.2} color="#00bcd4" emissive="#0f172a" emissiveIntensity={0.4} />
      <Html distanceFactor={1.5} position={[0, 0, 0]}>
        <div className="text-center font-mono text-[10px] text-slate-100/90">Kelvy CyberTech AI Shield</div>
      </Html>
    </mesh>
  );
}

export default function ThreeScene() {
  return (
    <div className="h-[360px] rounded-3xl overflow-hidden border border-border/50 bg-slate-950/80 shadow-2xl shadow-slate-950/20">
      <Canvas camera={{ position: [0, 0, 6], fov: 42 }}>
        <ambientLight intensity={0.45} />
        <directionalLight position={[2, 4, 5]} intensity={1.2} />
        <AnimatedShield />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>
    </div>
  );
}
