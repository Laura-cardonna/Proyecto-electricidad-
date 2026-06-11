// src/core/fields.ts
import * as THREE from "three";
import { evaluate } from "mathjs";

export type FieldKind = "electric" | "magnetic";
export type ElectricPolarity = "positive" | "negative";
export type DipoleAxis = "x" | "y" | "z";
export type DipoleSign = 1 | -1;
export type MagneticMode = "dipole" | "formula";

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
  mode?: MagneticMode;
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
  mode?: MagneticMode;
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

  const mx = axis === "x" ? sign : 0;
  const my = axis === "y" ? sign : 0;
  const mz = axis === "z" ? sign : 0;

  // CORRECCIÓN FÍSICA: Bucle interno.
  // Evitamos la singularidad en r=0 estableciendo un núcleo magnético interno.
  // Dentro de este radio, el campo empuja directamente de Sur a Norte para cerrar el lazo.
  if (r < 0.4) {
    const internalScale = strength / (0.4 ** 3);
    return createVector(mx * internalScale, my * internalScale, mz * internalScale);
  }

  const rx = relX / r;
  const ry = relY / r;
  const rz = relZ / r;
  //Producto punto 
  const mDotR = mx * rx + my * ry + mz * rz;

  const r3 = r2 * r;
  const scale = strength / r3;

  /*3 * mDotR * rx: Esta parte intenta empujar la partícula hacia afuera de los polos. El "3" es una constante matemática de la geometría en 3D.
  - mx: Esta parte intenta jalar la partícula hacia la dirección del imán.
 Al restar esas dos cosas, la fuerza no puede ir en línea recta. Se ve obligada a curvarse.
  */
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
  // Paletas de colores para diferenciar las cargas cuando se agregan dinámicamente
  const PALETAS = {
    electric: ["#ff9f68", "#ff6b6b", "#feca57", "#ff9ff3", "#ff7f50"],
    magnetic: ["#66d9ff", "#48dbfb", "#0abde3", "#54a0ff", "#00d2d3"]
  };
  
  const colorAleatorio = PALETAS[kind][Math.floor(Math.random() * PALETAS[kind].length)];

  const defaultsByKind: Record<FieldKind, Omit<FieldSource, "id">> = {
    electric: {
      kind: "electric",
      name: "Carga eléctrica",
      color: colorAleatorio, // <-- Usamos el color dinámico
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
      color: colorAleatorio, // <-- Usamos el color dinámico
      position: { x: 0, y: 0, z: 0 },
      strength: 2.5,
      enabled: true,
      polarity: "positive",
      dipoleAxis: "y",
      dipoleSign: 1,
      mode: "dipole",
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
    mode: "dipole",
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

  // MODO MAGNÉTICO
  if (source.kind === "magnetic") {
    // Si estamos en modo fórmula libre
    if (source.mode === "formula") {
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
      return { electric: createVector(0, 0, 0), magnetic: vector };
    } 
    // Si estamos en modo dipolo físico
    else {
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
  }

  // MODO ELÉCTRICO
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

  // Las cargas eléctricas y los campos magnéticos por fórmula usan distribución esférica
  if (source.kind === "electric" || (source.kind === "magnetic" && source.mode === "formula")) {
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

  // Generación exclusiva para Dipolos Físicos
  const axis = source.dipoleAxis;
  
  // REDUCCIÓN DE LÍNEAS: Solo usamos 2 ángulos polares en lugar de 5 para despejar la vista
  const polarAngles = [35, 75].map((deg) => (deg * Math.PI) / 180);
  
  // Fijo a 4 líneas por cada ángulo (total 8 líneas por polo = 16 líneas por imán)
  const azimuthalCount = 4;
  const seedRadius = 1.4;

  for (const polar of polarAngles) {
    for (let j = 0; j < azimuthalCount; j++) {
      const azimuth = (Math.PI * 2 * j) / azimuthalCount;
      const sinPolar = Math.sin(polar);
      const cosPolar = Math.cos(polar);
      let sx = 0, sy = 0, sz = 0;

      // Aplicamos dipoleSign para que nazcan desde el polo correcto
      if (axis === "y") {
        sx = sinPolar * Math.cos(azimuth) * seedRadius;
        sy = cosPolar * seedRadius * source.dipoleSign; 
        sz = sinPolar * Math.sin(azimuth) * seedRadius;
      } else if (axis === "x") {
        sx = cosPolar * seedRadius * source.dipoleSign; 
        sy = sinPolar * Math.cos(azimuth) * seedRadius;
        sz = sinPolar * Math.sin(azimuth) * seedRadius;
      } else {
        sx = sinPolar * Math.cos(azimuth) * seedRadius;
        sy = sinPolar * Math.sin(azimuth) * seedRadius;
        sz = cosPolar * seedRadius * source.dipoleSign; 
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
  steps = 800,       
  stepSize = 0.18,    
): THREE.Vector3[] => {
  const points = [seed.clone()];
  let current = seed.clone();
  const absorptionRadius = 0.5;

  for (let stepIndex = 0; stepIndex < steps; stepIndex++) {
    let fieldVector = new THREE.Vector3(0, 0, 0);

    // 1. SUPERPOSICIÓN TOTAL: Calculamos el campo sumado de toda la escena
    const combined = sampleCombinedFields(allSources, current, 0, true);

    if (source.kind === "electric") {
      fieldVector = combined.electric.clone();
      if (source.polarity === "negative") {
        fieldVector.negate();
      }
    } else {
      // 2. AHORA EL CAMPO MAGNÉTICO TAMBIÉN USA LA SUPERPOSICIÓN
      fieldVector = combined.magnetic.clone();
    }

    if (fieldVector.lengthSq() < 0.000001) break;

    const stepVector = fieldVector
      .clone()
      .normalize()
      .multiplyScalar(stepSize * direction);
    current = current.clone().add(stepVector);

    // ── PARADAS ELÉCTRICAS ──
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

    // ── PARADAS MAGNÉTICAS (Nueva lógica para múltiples imanes) ──
    if (source.kind === "magnetic") {
      const closeTolerance = stepSize * 4; 

      // Caso A: La línea da la vuelta y cierra en su propio imán
      if (stepIndex > 25 && current.distanceTo(seed) < closeTolerance) {
        points.push(seed.clone());
        return points;
      }

      // Caso B: La línea viaja y es absorbida por el polo de OTRO imán
      const absorbedByOtherMagnet = allSources.some((other) => {
        if (other.id === source.id || other.kind !== "magnetic") return false;
        return current.distanceTo(
          new THREE.Vector3(other.position.x, other.position.y, other.position.z)
        ) < 0.8; // Radio de captura del polo del otro imán
      });

      if (stepIndex > 10 && absorbedByOtherMagnet) {
        points.push(current.clone());
        return points; // Bucle cerrado exitosamente en el otro imán
      }
    }

    if (current.length() > 60) break;

    points.push(current.clone());
  }

  if (source.kind === "electric" && source.polarity === "negative") {
    points.reverse();
  }

  // Descartar líneas a medias que no lograron cerrar en ningún imán
  if (source.kind === "magnetic" && points.length >= steps) {
     return [];
  }

  return points;
};