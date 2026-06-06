"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";

function Particles({ animate }: { animate: boolean }) {
  const count = 300;
  const mesh = useRef<THREE.Points>(null!);

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
      vel[i * 3] = (Math.random() - 0.5) * 0.005;
      vel[i * 3 + 1] = (Math.random() - 0.5) * 0.005;
      vel[i * 3 + 2] = (Math.random() - 0.5) * 0.005;
    }
    return [pos, vel];
  }, []);

  useFrame(() => {
    if (!mesh.current || !animate) return;
    const pos = mesh.current.geometry.attributes.position;
    for (let i = 0; i < count; i++) {
      pos.array[i * 3] += velocities[i * 3];
      pos.array[i * 3 + 1] += velocities[i * 3 + 1];
      pos.array[i * 3 + 2] += velocities[i * 3 + 2];

      // Bounce back at boundaries
      for (let j = 0; j < 3; j++) {
        if (Math.abs(pos.array[i * 3 + j]) > 10) {
          velocities[i * 3 + j] *= -1;
        }
      }
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#00fff9"
        transparent
        opacity={0.85}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function GlowOrbs({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    if (!group.current || !animate) return;
    const t = clock.getElapsedTime();
    group.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh;
      mesh.position.x = Math.sin(t * 0.3 + i * 2) * 5;
      mesh.position.y = Math.cos(t * 0.2 + i * 1.5) * 3;
      mesh.position.z = Math.sin(t * 0.15 + i) * 4;
    });
  });

  return (
    <group ref={group}>
      {[
        { color: "#00fff9", pos: [3, 2, -5] as [number, number, number] },
        { color: "#b026ff", pos: [-4, -1, -3] as [number, number, number] },
        { color: "#ff00ff", pos: [0, 3, -7] as [number, number, number] },
      ].map((orb, i) => (
        <mesh key={i} position={orb.pos}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshBasicMaterial
            color={orb.color}
            transparent
            opacity={0.25}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function ParticleField() {
  const reducedMotion = useReducedMotion();
  const [inView, setInView] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "100px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Skip the whole Canvas on reduced-motion (saves the WebGL context + battery)
  if (reducedMotion) {
    return (
      <div
        ref={wrapperRef}
        className="absolute inset-0 z-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,255,249,0.12) 0%, transparent 60%)",
        }}
      />
    );
  }

  return (
    <div
      ref={wrapperRef}
      className="absolute inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
      >
        <Particles animate={inView} />
        <GlowOrbs animate={inView} />
      </Canvas>
    </div>
  );
}
