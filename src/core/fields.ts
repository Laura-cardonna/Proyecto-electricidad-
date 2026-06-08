import * as THREE from "three";
import { evaluate } from "mathjs";

export type FieldKind = "electric" | "magnetic";
export type ElectricPolarity = "positive" | "negative";
export type DipoleAxis = "x" | "y" | "z";
export type DipoleSign = 1 | -1;

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
  polarity: ElectricPolarity;
  dipoleAxis: DipoleAxis;
  dipoleSign: DipoleSign;
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
  polarity?: ElectricPolarity;
  dipoleAxis?: DipoleAxis;
  dipoleSign?: DipoleSign;
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

const sampleDipoleField = (
  relX: number,
  relY: number,
  relZ: number,
  axis: DipoleAxis,
  sign: DipoleSign,
  strength: number,
): THREE.Vector3 => {
  const r2 = relX ** 2 + relY ** 2 + relZ ** 2;
  const r = Math.sqrt(r2);
  if (r < 0.3) return createVector(0, 0, 0);

  const mx = axis === "x" ? sign : 0;
  const my = axis === "y" ? sign : 0;
  const mz = axis === "z" ? sign : 0;

  const rx = relX / r;
  const ry = relY / r;
  const rz = relZ / r;

  const mDotR = mx * rx + my * ry + mz * rz;

  const r3 = r2 * r;
  const scale = strength / r3;

  return createVector(
    scale * (3 * mDotR * rx - mx),
    scale * (3 * mDotR * ry - my),
    scale * (3 * mDotR * rz - mz),
  );
};

export const createFieldSource = (
  kind: FieldKind,
  overrides: Partial<FieldSource> = {},
): FieldSource => {
  const defaultsByKind: Record<FieldKind, Omit<FieldSource, "id">> = {
    electric: {
      kind: "electric",
      name: "Carga eléctrica",
      color: "#ff9f68",
      position: { x: 0, y: 0, z: 0 },
      strength: 5,
      enabled: true,
      polarity: "positive",
      dipoleAxis: "y",
      dipoleSign: 1,
      components: {
        x: "x / (pow(r, 3) + 1)",
        y: "y / (pow(r, 3) + 1)",
        z: "z / (pow(r, 3) + 1)",
      },
    },
    magnetic: {
      kind: "magnetic",
      name: "Carga magnética",
      color: "#66d9ff",
      position: { x: 0, y: 0, z: 0 },
      strength: 2.5,
      enabled: true,
      polarity: "positive",
      dipoleAxis: "y",
      dipoleSign: 1,
      components: {
        x: "0",
        y: "0",
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
    strength: 50,
    name: "Carga eléctrica A",
    polarity: "positive",
  }),
  createFieldSource("magnetic", {
    position: { x: 3, y: 0, z: 0 },
    strength: 30,
    name: "Carga magnética B",
    dipoleAxis: "y",
    dipoleSign: 1,
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

  if (source.kind === "magnetic") {
    const dipoleField = sampleDipoleField(
      relativeX,
      relativeY,
      relativeZ,
      source.dipoleAxis,
      source.dipoleSign,
      source.strength,
    );
    return { electric: createVector(0, 0, 0), magnetic: dipoleField };
  }

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

  const polaritySign = source.polarity === "negative" ? -1 : 1;

  const vector = createVector(
    evaluateComponent(source.components.x, scope) * source.strength * polaritySign,
    evaluateComponent(source.components.y, scope) * source.strength * polaritySign,
    evaluateComponent(source.components.z, scope) * source.strength * polaritySign,
  );

  return { electric: vector, magnetic: createVector(0, 0, 0) };
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

export const createFieldLineSeeds = (
  source: FieldSource,
  count = 12,
): THREE.Vector3[] => {
  const seeds: THREE.Vector3[] = [];

  if (source.kind === "electric") {
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const radiusSeed = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      seeds.push(
        createVector(
          source.position.x + Math.cos(theta) * radiusSeed * 1.2,
          source.position.y + y * 1.2,
          source.position.z + Math.sin(theta) * radiusSeed * 1.2,
        ),
      );
    }
    return seeds;
  }

  const axis = source.dipoleAxis;
  const polarAngles = [20, 40, 60, 80].map((deg) => (deg * Math.PI) / 180);
  const azimuthalCount = Math.max(3, Math.round(count / polarAngles.length));
  const seedRadius = 1.4;

  for (const polar of polarAngles) {
    for (let j = 0; j < azimuthalCount; j++) {
      const azimuth = (Math.PI * 2 * j) / azimuthalCount;
      const sinPolar = Math.sin(polar);
      const cosPolar = Math.cos(polar);
      let sx = 0, sy = 0, sz = 0;

      if (axis === "y") {
        sx = sinPolar * Math.cos(azimuth) * seedRadius;
        sy = cosPolar * seedRadius;
        sz = sinPolar * Math.sin(azimuth) * seedRadius;
      } else if (axis === "x") {
        sx = cosPolar * seedRadius;
        sy = sinPolar * Math.cos(azimuth) * seedRadius;
        sz = sinPolar * Math.sin(azimuth) * seedRadius;
      } else {
        sx = sinPolar * Math.cos(azimuth) * seedRadius;
        sy = sinPolar * Math.sin(azimuth) * seedRadius;
        sz = cosPolar * seedRadius;
      }

      seeds.push(
        createVector(
          source.position.x + sx,
          source.position.y + sy,
          source.position.z + sz,
        ),
      );
    }
  }

  return seeds;
};

export const traceFieldLine = (
  source: FieldSource,
  seed: THREE.Vector3,
  direction: 1 | -1,
  allSources: FieldSource[] = [],
  steps = 220,
  stepSize = 0.20,
): THREE.Vector3[] => {
  const points = [seed.clone()];
  let current = seed.clone();
  const absorptionRadius = 0.5;

  for (let stepIndex = 0; stepIndex < steps; stepIndex++) {
    let fieldVector = new THREE.Vector3(0, 0, 0);

    if (source.kind === "electric") {
      // 1. SUPERPOSICIÓN: Usamos el campo TOTAL de la escena.
      const combined = sampleCombinedFields(allSources, current, 0, true);
      fieldVector = combined.electric.clone();

      // 2. INVERSIÓN FÍSICA PARA EL TRAZADO:
      // El campo de una carga negativa apunta hacia ella. 
      // Para poder trazar la línea hacia el infinito partiendo desde la semilla,
      // caminamos en la dirección opuesta al campo (-E).
      if (source.polarity === "negative") {
        fieldVector.negate();
      }
    } else {
      // Magnética: Solo el dipolo propio
      const sample = sampleFieldSource(source, current, 0);
      fieldVector = sample.magnetic.clone();
    }

    if (fieldVector.lengthSq() < 0.000001) break;

    const stepVector = fieldVector
      .clone()
      .normalize()
      .multiplyScalar(stepSize * direction);
    current = current.clone().add(stepVector);

    // Parada 1: Absorción por OTRA carga eléctrica
    if (source.kind === "electric") {
      const absorbed = allSources.some((other) => {
        if (other.id === source.id || other.kind !== "electric") return false;
        return current.distanceTo(
          new THREE.Vector3(other.position.x, other.position.y, other.position.z),
        ) < absorptionRadius;
      });
      if (absorbed) {
        points.push(current.clone());
        break;
      }
    }

    // Parada 2: Línea magnética cierra el lazo
    if (
      source.kind === "magnetic" &&
      stepIndex > 15 &&
      current.distanceTo(seed) < stepSize * 2.5
    ) {
      points.push(seed.clone());
      break;
    }

    // Parada 3: Se aleja demasiado
    if (current.length() > 60) break;

    points.push(current.clone());
  }

  // 3. MAGIA PARA LAS FLECHAS:
  // Si la carga es negativa, la línea se trazó de adentro hacia afuera.
  // Invertimos el arreglo de puntos para que vaya de "afuera hacia adentro".
  // Así las flechas (que se calculan como P_siguiente - P_actual) apuntarán correctamente.
  if (source.kind === "electric" && source.polarity === "negative") {
    points.reverse();
  }

  return points;
};