// src/store/useSimulation.ts
import { create } from "zustand";
import * as THREE from "three";
import {
  createDefaultFieldSources,
  createFieldSource,
  type FieldSource,
  type FieldSourcePatch,
  updateFieldSource,
} from "../core/fields";

interface SimulationState {
  initialPosition: THREE.Vector3;
  initialVelocity: THREE.Vector3;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  charge: number;
  mass: number;
  isRunning: boolean;
  isFieldActive: boolean;
  fieldSources: FieldSource[];

  startSimulation: () => void;
  toggleField: () => void;
  updateStep: (pos: THREE.Vector3, vel: THREE.Vector3) => void;
  setInitialPosition: (position: THREE.Vector3) => void;
  setInitialVelocity: (velocity: THREE.Vector3) => void;
  setCharge: (charge: number) => void;
  setMass: (mass: number) => void;
  addFieldSource: (kind?: FieldSource["kind"]) => void;
  updateFieldSource: (id: string, patch: FieldSourcePatch) => void;
  removeFieldSource: (id: string) => void;
  toggleFieldSource: (id: string) => void;
  reset: () => void;
}

const initialPosition = new THREE.Vector3(-10, 0, 0);
const initialVelocity = new THREE.Vector3(15, 5, 0);

export const useSimulation = create<SimulationState>((set) => ({
  initialPosition: initialPosition.clone(),
  initialVelocity: initialVelocity.clone(),
  position: initialPosition.clone(),
  velocity: initialVelocity.clone(),
  charge: 1,
  mass: 1,
  isRunning: false,
  isFieldActive: false,
  fieldSources: createDefaultFieldSources(),

  startSimulation: () =>
    set((state) => ({
      isRunning: true,
      position: state.initialPosition.clone(),
      velocity: state.initialVelocity.clone(),
    })),
  toggleField: () => set((state) => ({ isFieldActive: !state.isFieldActive })),

  updateStep: (newPos, newVel) =>
    set({
      position: newPos.clone(),
      velocity: newVel.clone(),
    }),

  setInitialPosition: (position) =>
    set({
      initialPosition: position.clone(),
      position: position.clone(),
    }),

  setInitialVelocity: (velocity) =>
    set({
      initialVelocity: velocity.clone(),
      velocity: velocity.clone(),
    }),

  setCharge: (charge) => set({ charge }),

  setMass: (mass) => set({ mass }),

  addFieldSource: (kind = "electric") =>
    set((state) => ({
      fieldSources: [...state.fieldSources, createFieldSource(kind)],
    })),

  updateFieldSource: (id, patch) =>
    set((state) => ({
      fieldSources: state.fieldSources.map((source) =>
        source.id === id ? updateFieldSource(source, patch) : source,
      ),
    })),

  removeFieldSource: (id) =>
    set((state) => ({
      fieldSources: state.fieldSources.filter((source) => source.id !== id),
    })),

  toggleFieldSource: (id) =>
    set((state) => ({
      fieldSources: state.fieldSources.map((source) =>
        source.id === id ? { ...source, enabled: !source.enabled } : source,
      ),
    })),

// En useSimulation.ts
reset: () => set((state) => {
  // 1. Detenemos cualquier cálculo antes de mover la posición
  return {
    isRunning: false,
    isFieldActive: false,
    position: state.initialPosition.clone(),
    velocity: state.initialVelocity.clone(),
  };
}),
}));
