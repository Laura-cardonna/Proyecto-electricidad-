import * as THREE from "three";
import { evaluate } from "mathjs";

export type FieldKind = "electric" | "magnetic";

export interface FieldComponents {
  x: string;
  y: string;
  z: string;
}

export interface FieldSource {
  id: string;
  kind: FieldKind;
  name: string;
  color: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  strength: number;
  enabled: boolean;
  components: FieldComponents;
}

export interface FieldSample {
  electric: THREE.Vector3;
  magnetic: THREE.Vector3;
}

export interface FieldSourcePatch {
  kind?: FieldKind;
  name?: string;
  color?: string;
  position?: Partial<FieldSource["position"]>;
  strength?: number;
  enabled?: boolean;
  components?: Partial<FieldComponents>;
}

const createFieldId = (kind: FieldKind) =>
  `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const createVector = (x: number, y: number, z: number) =>
  new THREE.Vector3(x, y, z);

const evaluateComponent = (
  expression: string,
  scope: Record<string, number>,
): number => {
  try {
    const value = evaluate(expression, scope);
    return typeof value === "number" && Number.isFinite(value)
      ? value
      : Number(value) || 0;
  } catch {
    return 0;
  }
};

export const createFieldSource = (
  kind: FieldKind,
  overrides: Partial<FieldSource> = {},
): FieldSource => {
  const defaultsByKind: Record<FieldKind, Omit<FieldSource, "id">> = {
    electric: {
      kind: "electric",
      name: "Campo eléctrico radial",
      color: "#ff9f68",
      position: { x: 0, y: 0, z: 0 },
      strength: 5,
      enabled: true,
      components: {
        x: "x / (pow(r, 3) + 1)",
        y: "y / (pow(r, 3) + 1)",
        z: "z / (pow(r, 3) + 1)",
      },
    },
    magnetic: {
      kind: "magnetic",
      name: "Campo magnético circular",
      color: "#66d9ff",
      position: { x: 0, y: 0, z: 0 },
      strength: 2.5,
      enabled: true,
      components: {
        x: "-y / (r + 1)",
        y: "x / (r + 1)",
        z: "0",
      },
    },
  };

  return {
    ...defaultsByKind[kind],
    ...overrides,
    id: overrides.id ?? createFieldId(kind),
    position: {
      ...defaultsByKind[kind].position,
      ...overrides.position,
    },
    components: {
      ...defaultsByKind[kind].components,
      ...overrides.components,
    },
  };
};

export const createDefaultFieldSources = () => [
  createFieldSource("electric", {
    position: { x: -3, y: 0, z: 0 },
    strength: 6,
    name: "Fuente eléctrica A",
  }),
  createFieldSource("magnetic", {
    position: { x: 3, y: 0, z: 0 },
    strength: 2.2,
    name: "Fuente magnética B",
  }),
];

export const sampleFieldSource = (
  source: FieldSource,
  position: THREE.Vector3,
  time = 0,
): FieldSample => {
  const relativeX = position.x - source.position.x;
  const relativeY = position.y - source.position.y;
  const relativeZ = position.z - source.position.z;
  const radius = Math.max(
    Math.sqrt(relativeX ** 2 + relativeY ** 2 + relativeZ ** 2),
    0.0001,
  );
  const scope = {
    x: relativeX,
    y: relativeY,
    z: relativeZ,
    r: radius,
    t: time,
    strength: source.strength,
    pi: Math.PI,
    e: Math.E,
  };

  const vector = createVector(
    evaluateComponent(source.components.x, scope) * source.strength,
    evaluateComponent(source.components.y, scope) * source.strength,
    evaluateComponent(source.components.z, scope) * source.strength,
  );

  return source.kind === "electric"
    ? { electric: vector, magnetic: createVector(0, 0, 0) }
    : { electric: createVector(0, 0, 0), magnetic: vector };
};

export const sampleCombinedFields = (
  sources: FieldSource[],
  position: THREE.Vector3,
  time = 0,
  active = true,
): FieldSample => {
  if (!active) {
    return {
      electric: createVector(0, 0, 0),
      magnetic: createVector(0, 0, 0),
    };
  }

  return sources
    .filter((source) => source.enabled)
    .reduce<FieldSample>(
      (accumulator, source) => {
        const sample = sampleFieldSource(source, position, time);
        accumulator.electric.add(sample.electric);
        accumulator.magnetic.add(sample.magnetic);
        return accumulator;
      },
      {
        electric: createVector(0, 0, 0),
        magnetic: createVector(0, 0, 0),
      },
    );
};

export const updateFieldSource = (
  source: FieldSource,
  patch: FieldSourcePatch,
): FieldSource => ({
  ...source,
  ...patch,
  position: {
    ...source.position,
    ...patch.position,
  },
  components: {
    ...source.components,
    ...patch.components,
  },
});

export const createFieldLineSeeds = (source: FieldSource, count = 8) => {
  const seeds: THREE.Vector3[] = [];
  const baseRadius = source.kind === "electric" ? 1.2 : 1.5;

  for (let index = 0; index < count; index += 1) {
    const angle = (Math.PI * 2 * index) / count;
    const height = Math.sin(angle * 2) * 0.2;
    seeds.push(
      createVector(
        source.position.x + Math.cos(angle) * baseRadius,
        source.position.y + Math.sin(angle) * baseRadius,
        source.position.z + height,
      ),
    );
  }

  return seeds;
};

export const traceFieldLine = (
  source: FieldSource,
  seed: THREE.Vector3,
  direction: 1 | -1,
  steps = 18,
  stepSize = 0.45,
) => {
  const points = [seed.clone()];
  let current = seed.clone();

  for (let stepIndex = 0; stepIndex < steps; stepIndex += 1) {
    const sample = sampleFieldSource(source, current, 0);
    const fieldVector =
      source.kind === "electric" ? sample.electric : sample.magnetic;

    if (fieldVector.lengthSq() < 0.000001) {
      break;
    }

    const stepVector = fieldVector
      .clone()
      .normalize()
      .multiplyScalar(stepSize * direction);
    current = current.clone().add(stepVector);
    points.push(current.clone());
  }

  return points;
};
