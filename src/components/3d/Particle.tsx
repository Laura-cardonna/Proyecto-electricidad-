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
  // useFrame captura el closure una sola vez; si leemos del store directamente
  // siempre veremos los valores del primer render. Con refs, siempre tenemos
  // el valor más reciente sin re-suscribir el loop de animación.
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

  // Sincronizar posición visual cuando la simulación no está corriendo
  // (reset, cambio de posición inicial, etc.)
  const { updateStep, trailVersion } = useSimulation();

  useFrame((state, delta) => {
    if (!isRunningRef.current) {
      if (meshRef.current) {
        meshRef.current.position.copy(positionRef.current);
      }
      return;
    }

    // dt acotado para evitar explosiones numéricas en frames lentos
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

    // Actualizamos refs inmediatamente para el próximo frame
    positionRef.current = nextStep.position.clone();
    velocityRef.current = nextStep.velocity.clone();

    // Actualizamos el store (para HUD, trail key, etc.)
    updateStep(nextStep.position, nextStep.velocity);

    // Actualizamos la malla 3D directamente — más rápido que esperar re-render
    if (meshRef.current) {
      meshRef.current.position.copy(nextStep.position);
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial color="#F48FB1" />
        <pointLight distance={10} intensity={5} color="#F48FB1" />
      </mesh>

      <Trail
        key={`outer-${trailVersion}`}
        target={trailTarget}
        width={3}
        length={80}
        color={new THREE.Color("#ff9f68")}
        attenuation={(t) => (1 - t) * (1 - t)}
      />

      <Trail
        key={`inner-${trailVersion}`}
        target={trailTarget}
        width={1.6}
        length={60}
        color={new THREE.Color("#F48FB1")}
        attenuation={(t) => 1 - t}
      />
    </group>
  );
};
