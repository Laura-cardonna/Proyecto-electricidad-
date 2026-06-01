import { Html, Line } from "@react-three/drei";
import type { CSSProperties } from "react";

const AXIS_TICK_STEP = 10;

const axisLabelStyle: CSSProperties = {
  pointerEvents: "none",
  userSelect: "none",
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.3em",
  textTransform: "uppercase",
  textShadow: "0 0 6px rgba(0,0,0,0.7)",
};

const tickMarks = Array.from(
  { length: 8 },
  (_, index) => (index + 1) * AXIS_TICK_STEP,
);

interface AxesGuideProps {
  length: number;
}

export const AxesGuide = ({ length }: AxesGuideProps) => {
  const tickCount = Math.max(1, Math.floor(length / AXIS_TICK_STEP));
  const activeTicks = tickMarks.slice(0, tickCount);

  return (
    <group>
      <Line
        points={[
          [-length, 0, 0],
          [length, 0, 0],
        ]}
        color="#c8a2ff"
        lineWidth={1.5}
        transparent
        opacity={0.58}
      />
      <Line
        points={[
          [0, -length, 0],
          [0, length, 0],
        ]}
        color="#7ee081"
        lineWidth={1.5}
        transparent
        opacity={0.62}
      />
      <Line
        points={[
          [0, 0, -length],
          [0, 0, length],
        ]}
        color="#7fd9ff"
        lineWidth={1.5}
        transparent
        opacity={0.62}
      />

      {activeTicks.map((distance) => (
        <group key={`x-tick-${distance}`}>
          <Line
            points={[
              [distance, -0.35, 0],
              [distance, 0.35, 0],
            ]}
            color="#ff6b6b"
            lineWidth={1}
            transparent
            opacity={0.28}
          />
          <Line
            points={[
              [-distance, -0.35, 0],
              [-distance, 0.35, 0],
            ]}
            color="#c8a2ff"
            lineWidth={1}
            transparent
            opacity={0.18}
          />
          <Line
            points={[
              [0.35, distance, 0],
              [-0.35, distance, 0],
            ]}
            color="#7ee081"
            lineWidth={1}
            transparent
            opacity={0.18}
          />
          <Line
            points={[
              [0.35, -distance, 0],
              [-0.35, -distance, 0],
            ]}
            color="#7ee081"
            lineWidth={1}
            transparent
            opacity={0.18}
          />
          <Line
            points={[
              [0, -0.35, distance],
              [0, 0.35, distance],
            ]}
            color="#7fd9ff"
            lineWidth={1}
            transparent
            opacity={0.18}
          />
          <Line
            points={[
              [0, -0.35, -distance],
              [0, 0.35, -distance],
            ]}
            color="#7fd9ff"
            lineWidth={1}
            transparent
            opacity={0.18}
          />
        </group>
      ))}

      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshBasicMaterial color="#f5f5f5" transparent opacity={0.8} />
      </mesh>

      <Html center distanceFactor={18} position={[length + 0.5, 0, 0]}>
        <div style={{ ...axisLabelStyle, color: "#d8b9ff" }}>X</div>
      </Html>
      <Html center distanceFactor={18} position={[0, length + 0.5, 0]}>
        <div style={{ ...axisLabelStyle, color: "#a9f0ad" }}>Y</div>
      </Html>
      <Html center distanceFactor={18} position={[0, 0, length + 0.5]}>
        <div style={{ ...axisLabelStyle, color: "#7fd9ff" }}>Z</div>
      </Html>
    </group>
  );
};
