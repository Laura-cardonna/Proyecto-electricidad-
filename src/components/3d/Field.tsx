import { Html, Line } from "@react-three/drei";
import { useMemo } from "react";
import * as THREE from "three";
import {
  createFieldLineSeeds,
  traceFieldLine,
  type FieldSource,
} from "../../core/fields";

interface FieldProps {
  source: FieldSource;
  allSources: FieldSource[];
  visible?: boolean;
}

const ArrowHead = ({
  position,
  direction,
  color,
  opacity,
}: {
  position: THREE.Vector3;
  direction: THREE.Vector3;
  color: string;
  opacity: number;
}) => {
  const quaternion = useMemo(() => {
    const up = new THREE.Vector3(0, 1, 0);
    const dir = direction.clone().normalize();
    if (dir.lengthSq() < 0.0001) return new THREE.Quaternion();
    if (Math.abs(dir.dot(up)) > 0.9999) {
      return new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0),
        dir.y < 0 ? Math.PI : 0,
      );
    }
    return new THREE.Quaternion().setFromUnitVectors(up, dir);
  }, [direction]);

  return (
    <mesh position={[position.x, position.y, position.z]} quaternion={quaternion}>
      <coneGeometry args={[0.09, 0.30, 8]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
};

const getArrowsForLine = (
  points: THREE.Vector3[],
  arrowEveryN: number,
): { position: THREE.Vector3; direction: THREE.Vector3 }[] => {
  const arrows: { position: THREE.Vector3; direction: THREE.Vector3 }[] = [];
  if (points.length < 3) return arrows;

  for (let i = arrowEveryN; i < points.length - 1; i += arrowEveryN) {
    const prev = points[i - 1];
    const next = points[Math.min(i + 1, points.length - 1)];
    const dir = next.clone().sub(prev);
    if (dir.lengthSq() < 0.0001) continue;
    arrows.push({ position: points[i].clone(), direction: dir });
  }
  return arrows;
};

export const Field = ({ source, allSources, visible = true }: FieldProps) => {

  const seedPoints = useMemo(() => {
    if (source.kind === "electric" && source.polarity === "negative") {
      const count = 14;
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      const seeds: THREE.Vector3[] = [];
      for (let i = 0; i < count; i++) {
        const y = 1 - (i / (count - 1)) * 2;
        const r = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = goldenAngle * i;
        seeds.push(
          new THREE.Vector3(
            source.position.x + Math.cos(theta) * r * 1.2,
            source.position.y + y * 1.2,
            source.position.z + Math.sin(theta) * r * 1.2,
          ),
        );
      }
      return seeds;
    }
    return createFieldLineSeeds(source, source.kind === "electric" ? 14 : 12);
  }, [source]);

  const fieldLines = useMemo(() => {
    return seedPoints.map((seed) =>
      traceFieldLine(source, seed, 1, allSources),
    );
  }, [seedPoints, source, allSources]);

  const opacity = visible ? 0.78 : 0.15;

  const sphereColor =
    source.kind === "electric"
      ? source.polarity === "positive" ? "#ff5555" : "#5588ff"
      : source.color;

  const signLabel =
    source.kind === "electric"
      ? source.polarity === "positive" ? "+" : "−"
      : source.dipoleSign === 1
        ? `N / ${source.dipoleAxis.toUpperCase()}`
        : `S / ${source.dipoleAxis.toUpperCase()}`;

  return (
    <group>
      <mesh position={[source.position.x, source.position.y, source.position.z]}>
        <sphereGeometry args={[0.30, 20, 20]} />
        <meshBasicMaterial color={sphereColor} transparent opacity={Math.min(opacity + 0.1, 1)} />
      </mesh>

      <group position={[source.position.x, source.position.y, source.position.z]}>
        <Html center distanceFactor={18} style={{ pointerEvents: "none" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", transform: "translateY(-24px)" }}>
            <div style={{ color: sphereColor, fontSize: "15px", fontWeight: "900", textShadow: "0 0 8px rgba(0,0,0,0.9)" }}>
              {signLabel}
            </div>
            <div style={{ color: source.color, fontSize: "9px", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: "bold", opacity: 0.85, whiteSpace: "nowrap", textShadow: "0 0 5px rgba(0,0,0,0.7)" }}>
              {source.name}
            </div>
          </div>
        </Html>
      </group>

      {fieldLines.map((points, index) => {
        if (points.length < 2) return null;
        const arrowEvery = source.kind === "magnetic" ? 6 : 8;
        const arrows = getArrowsForLine(points, arrowEvery);

        return (
          <group key={`${source.id}-line-${index}`}>
            <Line
              points={points}
              color={source.color}
              lineWidth={1.6}
              transparent
              opacity={opacity}
            />
            {arrows.map((arrow, ai) => (
              <ArrowHead
                key={`${source.id}-arrow-${index}-${ai}`}
                position={arrow.position}
                direction={arrow.direction}
                color={source.color}
                opacity={opacity}
              />
            ))}
          </group>
        );
      })}
    </group>
  );
};