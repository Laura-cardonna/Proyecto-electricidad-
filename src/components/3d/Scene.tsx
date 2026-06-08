import { OrbitControls, Stars, Grid } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Particle } from "./Particle";
import { useSimulation } from "../../store/useSimulation";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Field } from "./Field";
import { AxesGuide } from "./AxesGuide";

const MIN_EXTENT = 80;
const EXTENT_MARGIN = 40;

const roundUpToStep = (value: number, step: number) =>
  Math.ceil(value / step) * step;

export const Scene = () => {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [isUserControlling, setIsUserControlling] = useState(false);
  const position = useSimulation((state) => state.position);
  const fieldSources = useSimulation((state) => state.fieldSources);
  const isFieldActive = useSimulation((state) => state.isFieldActive);
  const travelExtent = Math.max(
    Math.abs(position.x),
    Math.abs(position.y),
    Math.abs(position.z),
  );
  const visualExtent = Math.max(
    MIN_EXTENT,
    roundUpToStep(travelExtent + EXTENT_MARGIN, 20),
  );

  useFrame(() => {
    if (!controlsRef.current || isUserControlling) {
      return;
    }

    controlsRef.current.target.lerp(position, 0.04);
    controlsRef.current.update();
  });

  return (
    <>
      <color attach="background" args={["#050505"]} />
      <ambientLight intensity={1.5} />
      <pointLight position={[10, 10, 10]} intensity={2} />

      <Stars radius={100} depth={50} count={5000} factor={4} />
      <Grid
        infiniteGrid
        sectionSize={20}
        cellSize={5}
        sectionThickness={1.1}
        cellThickness={0.75}
        sectionColor="#424242"
        cellColor="#2f2f2f"
        fadeDistance={visualExtent}
        fadeStrength={1.05}
      />
      <AxesGuide length={visualExtent} />

      {fieldSources.map((source) => (
        <Field
          key={source.id}
          source={source}
          allSources={fieldSources}
          visible={isFieldActive && source.enabled}
        />
      ))}

      <Particle />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        onStart={() => setIsUserControlling(true)}
        onEnd={() => setIsUserControlling(false)}
        enableDamping
        dampingFactor={0.09}
        rotateSpeed={0.35}
        zoomSpeed={0.45}
        panSpeed={0.35}
      />
    </>
  );
};
