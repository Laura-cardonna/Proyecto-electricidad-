import { OrbitControls, Stars, Grid } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Particle } from "./Particle";
import { useSimulation } from "../../store/useSimulation";
import * as THREE from "three";
import { Field } from "./Field";

export const Scene = () => {
  const position = useSimulation((state) => state.position);
  const fieldSources = useSimulation((state) => state.fieldSources);
  const isFieldActive = useSimulation((state) => state.isFieldActive);

  useFrame((state) => {
    const offset = new THREE.Vector3(10, 10, 10);
    const targetPosition = position.clone().add(offset);

    state.camera.position.lerp(targetPosition, 0.1);
    state.camera.lookAt(position);
  });

  return (
    <>
      <color attach="background" args={["#050505"]} />
      <ambientLight intensity={1.5} />
      <pointLight position={[10, 10, 10]} intensity={2} />

      <Stars radius={100} depth={50} count={5000} factor={4} />
      <Grid infiniteGrid sectionColor="#303030" cellColor="#202020" />

      {fieldSources.map((source) => (
        <Field
          key={source.id}
          source={source}
          visible={isFieldActive && source.enabled}
        />
      ))}

      <Particle />

      <OrbitControls makeDefault />
    </>
  );
};
