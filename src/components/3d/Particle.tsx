import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useSimulation } from "../../store/useSimulation";
import { stepRK4 } from "../../core/engine";
import { sampleCombinedFields } from "../../core/fields";
import { Trail } from "@react-three/drei";

export const Particle = () => {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const trailTarget = meshRef as unknown as React.RefObject<THREE.Object3D>;
  const {
    position,
    velocity,
    charge,
    mass,
    fieldSources,
    isFieldActive,
    isRunning,
    updateStep,
  } = useSimulation();

  useEffect(() => {
    meshRef.current?.position.copy(position);
  }, [position]);

// Modifica el useFrame en Particle.tsx
useFrame((state, delta) => {
  if (!isRunning) {
    // Si no está corriendo, forzamos la posición inicial visualmente
    if (meshRef.current) {
      meshRef.current.position.copy(position);
    }
    return;
  }

  const dt = Math.min(delta, 0.01);
  const nextStep = stepRK4(
    { position, velocity },
    (samplePosition, time) => sampleCombinedFields(fieldSources, samplePosition, time, isFieldActive),
    charge,
    mass,
    dt,
    state.clock.elapsedTime
  );

  updateStep(nextStep.position, nextStep.velocity);

  if (meshRef.current) {
    meshRef.current.position.copy(nextStep.position);
  }
});

  return (
    <group>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color="#F48FB1" />
        <pointLight distance={10} intensity={5} color="#F48FB1" />
      </mesh>

      <Trail
        target={trailTarget}
        width={1.5}
        length={50}
        color={new THREE.Color("#F48FB1")}
        attenuation={(t) => t * t}
      />
    </group>
  );
};
