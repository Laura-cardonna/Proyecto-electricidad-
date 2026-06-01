// src/core/engine.ts
import * as THREE from "three";
import type { FieldSample } from "./fields";

export interface PhysicsState {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
}

export type FieldSampler = (
  position: THREE.Vector3,
  time: number,
) => FieldSample;

export const getAcceleration = (
  vel: THREE.Vector3,
  electricField: THREE.Vector3,
  magneticField: THREE.Vector3,
  q: number,
  m: number,
): THREE.Vector3 => {
  const magneticForce = new THREE.Vector3().crossVectors(vel, magneticField);
  const totalForce = new THREE.Vector3()
    .addVectors(electricField, magneticForce)
    .multiplyScalar(q);
  return totalForce.divideScalar(m);
};

export const stepRK4 = (
  state: PhysicsState,
  sampleFields: FieldSampler,
  q: number,
  m: number,
  dt: number,
  time = 0,
): PhysicsState => {
  const k1p = state.velocity.clone();
  const k1Fields = sampleFields(state.position, time);
  const k1v = getAcceleration(
    state.velocity,
    k1Fields.electric,
    k1Fields.magnetic,
    q,
    m,
  );

  const v2 = state.velocity.clone().add(k1v.clone().multiplyScalar(dt / 2));
  const k2p = v2;
  const p2 = state.position.clone().add(k1p.clone().multiplyScalar(dt / 2));
  const k2Fields = sampleFields(p2, time + dt / 2);
  const k2v = getAcceleration(v2, k2Fields.electric, k2Fields.magnetic, q, m);

  const v3 = state.velocity.clone().add(k2v.clone().multiplyScalar(dt / 2));
  const k3p = v3;
  const p3 = state.position.clone().add(k2p.clone().multiplyScalar(dt / 2));
  const k3Fields = sampleFields(p3, time + dt / 2);
  const k3v = getAcceleration(v3, k3Fields.electric, k3Fields.magnetic, q, m);

  const v4 = state.velocity.clone().add(k3v.clone().multiplyScalar(dt));
  const k4p = v4;
  const p4 = state.position.clone().add(k3p.clone().multiplyScalar(dt));
  const k4Fields = sampleFields(p4, time + dt);
  const k4v = getAcceleration(v4, k4Fields.electric, k4Fields.magnetic, q, m);

  const finalVel = state.velocity.clone().add(
    k1v
      .clone()
      .add(k2v.clone().multiplyScalar(2))
      .add(k3v.clone().multiplyScalar(2))
      .add(k4v)
      .multiplyScalar(dt / 6),
  );

  const finalPos = state.position.clone().add(
    k1p
      .clone()
      .add(k2p.clone().multiplyScalar(2))
      .add(k3p.clone().multiplyScalar(2))
      .add(k4p)
      .multiplyScalar(dt / 6),
  );

  return { position: finalPos, velocity: finalVel };
};
