// src/components/Particle.tsx
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

  // ── Referencias mutables para evitar stale closures en useFrame ──────────
  const positionRef = useRef(new THREE.Vector3());
  const velocityRef = useRef(new THREE.Vector3());
  const isRunningRef = useRef(false);
  const isFieldActiveRef = useRef(false);
  const chargeRef = useRef(1);
  const massRef = useRef(1);
  const fieldSourcesRef = useRef(useSimulation.getState().fieldSources);

  // Suscripción directa al store — actualiza las refs en cada cambio de estado
  useEffect(() => {
    const unsub = useSimulation.subscribe((state) => {
      positionRef.current = state.position.clone();
      velocityRef.current = state.velocity.clone();
      isRunningRef.current = state.isRunning;
      isFieldActiveRef.current = state.isFieldActive;
      chargeRef.current = state.charge;
      massRef.current = state.mass;
      fieldSourcesRef.current = state.fieldSources;
    });

    // Inicializar con el estado actual
    const initial = useSimulation.getState();
    positionRef.current = initial.position.clone();
    velocityRef.current = initial.velocity.clone();
    isRunningRef.current = initial.isRunning;
    isFieldActiveRef.current = initial.isFieldActive;
    chargeRef.current = initial.charge;
    massRef.current = initial.mass;
    fieldSourcesRef.current = initial.fieldSources;

    return unsub;
  }, []);

  const { updateStep, trailVersion } = useSimulation();

  useFrame((state, delta) => {
    if (!isRunningRef.current) {
      if (meshRef.current) {
        meshRef.current.position.copy(positionRef.current);
      }
      return;
    }

    const dt = Math.min(delta, 0.016);

    const nextStep = stepRK4(
      {
        position: positionRef.current,
        velocity: velocityRef.current,
      },
      (samplePosition, time) =>
        sampleCombinedFields(
          fieldSourcesRef.current,
          samplePosition,
          time,
          isFieldActiveRef.current,
        ),
      chargeRef.current,
      massRef.current,
      dt,
      state.clock.elapsedTime,
    );

    positionRef.current = nextStep.position.clone();
    velocityRef.current = nextStep.velocity.clone();
    updateStep(nextStep.position, nextStep.velocity);

    if (meshRef.current) {
      meshRef.current.position.copy(nextStep.position);
    }
  });

  return (
    <group>
      {/* Esfera de la partícula (blanca, núcleo brillante) */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color="#ffffff" />
        <pointLight distance={15} intensity={8} color="#ff1493" />
      </mesh>

      {/* Estela Exterior (El halo rosa/resplandor ambiental) */}
      <Trail
        key={`outer-${trailVersion}`}
        target={trailTarget}
        // SE ESTÁ ENGROSANDO Drásticamente el halo exterior (de 4.5 a 12)
        width={15} 
        length={150} // Más largo para mayor presencia
        color={new THREE.Color("#ff1493")} // Rosa neón intenso
        // Se mantiene al 100% al inicio y se desvanece rápido pero sutilmente
        attenuation={(t) => Math.pow(1 - t, 3)} 
      />

      {/* Estela Interior (El núcleo de plasma blanco/luz) */}
      <Trail
        key={`inner-${trailVersion}`}
        target={trailTarget}
        // SE ESTÁ ENGROSANDO Drásticamente el núcleo central (de 1.2 a 4)
        width={10} 
        length={150} // Misma longitud masiva
        color={new THREE.Color("#ffffff")} // Blanco puro para mayor brillo
        // Se mantiene al 100% al inicio y se desvanece suavemente
        attenuation={(t) => 1 - t} 
      />
    </group>
  );
};