// src/components/ui/Sidebar.tsx
import { useSimulation } from "../../store/useSimulation";
import * as THREE from "three";

export const Sidebar = () => {
  const {
    initialPosition,
    initialVelocity,
    charge,
    mass,
    fieldSources,
    isFieldActive,
    toggleField,
    isRunning,
    startSimulation,
    toggleSimulation,
    reset,
    setInitialPosition,
    setInitialVelocity,
    setCharge,
    setMass,
    addFieldSource,
    updateFieldSource,
    removeFieldSource,
    toggleFieldSource,
  } = useSimulation();

  const updateVectorComponent = (
    current: THREE.Vector3,
    component: "x" | "y" | "z",
    value: string,
    setter: (vector: THREE.Vector3) => void,
  ) => {
    const parsedValue = Number(value);
    const nextVector = current.clone();
    nextVector[component] = Number.isFinite(parsedValue) ? parsedValue : 0;
    setter(nextVector);
  };

  return (
    <div className="absolute top-5 right-5 z-20 w-[26rem] max-h-[calc(100vh-2.5rem)] overflow-y-auto p-6 bg-white/10 backdrop-blur-md border border-pink-200/30 rounded-2xl shadow-2xl">
      <h1 className="text-pink-300 font-bold text-xl mb-2 tracking-wider">
        MISION CONTROL
      </h1>
      <p className="text-xs text-white/60 mb-5">
        Configura la partícula, define varias fuentes de campo y luego activa la
        distribución.
      </p>

      <div className="space-y-4 mb-6">
        <button
          onClick={startSimulation}
          disabled={isRunning}
          className={`w-full py-3 rounded-xl font-bold transition-all ${
            isRunning
              ? "bg-gray-600"
              : "bg-pink-400 hover:bg-pink-300 text-white shadow-[0_0_15px_rgba(244,143,177,0.5)]"
          }`}
        >
          {isRunning ? "EN VUELO..." : "LANZAR PARTÍCULA"}
        </button>

        <button
          onClick={toggleSimulation}
          className={`w-full py-3 rounded-xl font-bold border-2 transition-all ${
            isRunning
              ? "border-amber-300 text-amber-200 bg-amber-300/10 hover:bg-amber-300/20"
              : "border-emerald-300/40 text-emerald-100 bg-emerald-300/5 hover:bg-emerald-300/10"
          }`}
        >
          {isRunning ? "PAUSAR MOVIMIENTO" : "CONTINUAR MOVIMIENTO"}
        </button>

        <button
          onClick={toggleField}
          className={`w-full py-3 rounded-xl font-bold border-2 transition-all ${
            isFieldActive
              ? "border-pink-300 text-pink-300 bg-pink-300/10"
              : "border-white/50 text-white hover:border-pink-200"
          }`}
        >
          {isFieldActive ? "CAMPO: ACTIVADO" : "ENCENDER CAMPO"}
        </button>

        <button
          onClick={reset}
          className="w-full py-2 text-sm text-gray-400 hover:text-white underline"
        >
          RESETEAR SISTEMA
        </button>
      </div>

      <section className="space-y-4 mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-100/80">
          Lanzamiento
        </h2>
        <label className="block text-xs text-white/70 space-y-1">
          <span>Posición inicial</span>
          <div className="grid grid-cols-3 gap-2">
            {(["x", "y", "z"] as const).map((component) => (
              <input
                key={`position-${component}`}
                type="number"
                step="0.5"
                disabled={isRunning}
                value={initialPosition[component]}
                onChange={(event) =>
                  updateVectorComponent(
                    initialPosition,
                    component,
                    event.target.value,
                    setInitialPosition,
                  )
                }
                className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white disabled:opacity-50"
              />
            ))}
          </div>
        </label>

        <label className="block text-xs text-white/70 space-y-1">
          <span>Velocidad inicial</span>
          <div className="grid grid-cols-3 gap-2">
            {(["x", "y", "z"] as const).map((component) => (
              <input
                key={`velocity-${component}`}
                type="number"
                step="0.5"
                disabled={isRunning}
                value={initialVelocity[component]}
                onChange={(event) =>
                  updateVectorComponent(
                    initialVelocity,
                    component,
                    event.target.value,
                    setInitialVelocity,
                  )
                }
                className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white disabled:opacity-50"
              />
            ))}
          </div>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-xs text-white/70 space-y-1">
            <span>Carga (+ / -)</span>
            <input
              type="number"
              step="0.1"
              disabled={isRunning}
              value={charge}
              inputMode="decimal"
              onChange={(event) => setCharge(Number(event.target.value))}
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white disabled:opacity-50"
            />
          </label>

          <label className="block text-xs text-white/70 space-y-1">
            <span>Masa</span>
            <input
              type="number"
              step="0.1"
              min="0.1"
              disabled={isRunning}
              value={mass}
              onChange={(event) =>
                setMass(Math.max(Number(event.target.value), 0.1))
              }
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white disabled:opacity-50"
            />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-100/80">
            Fuentes de campo
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => addFieldSource("electric")}
              className="text-[10px] px-3 py-1 rounded-full border border-orange-200/30 text-orange-100 hover:bg-orange-200/10"
            >
              +E
            </button>
            <button
              onClick={() => addFieldSource("magnetic")}
              className="text-[10px] px-3 py-1 rounded-full border border-cyan-200/30 text-cyan-100 hover:bg-cyan-200/10"
            >
              +B
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {fieldSources.map((source) => (
            <div
              key={source.id}
              className="rounded-2xl border border-white/10 bg-black/20 p-3 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <input
                    type="text"
                    value={source.name}
                    onChange={(event) =>
                      updateFieldSource(source.id, { name: event.target.value })
                    }
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white font-medium"
                  />
                  <div className="grid grid-cols-2 gap-2 text-[10px] uppercase tracking-[0.2em] text-white/60">
                    <span
                      className={
                        source.kind === "electric"
                          ? "text-orange-200"
                          : "text-cyan-200"
                      }
                    >
                      {source.kind}
                    </span>
                    <button
                      onClick={() => toggleFieldSource(source.id)}
                      className={`rounded-full border px-2 py-1 ${
                        source.enabled
                          ? "border-emerald-300/40 text-emerald-100"
                          : "border-white/10 text-white/50"
                      }`}
                    >
                      {source.enabled ? "Visible" : "Oculto"}
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeFieldSource(source.id)}
                  className="text-xs px-3 py-2 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/30"
                >
                  Quitar
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs text-white/70">
                {(["x", "y", "z"] as const).map((component) => (
                  <label
                    key={`${source.id}-${component}`}
                    className="space-y-1"
                  >
                    <span>{component.toUpperCase()}</span>
                    <input
                      type="number"
                      step="0.25"
                      value={source.position[component]}
                      onChange={(event) =>
                        updateFieldSource(source.id, {
                          position: {
                            ...source.position,
                            [component]: Number(event.target.value),
                          },
                        })
                      }
                      className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white"
                    />
                  </label>
                ))}
              </div>

              <label className="block text-xs text-white/70 space-y-1">
                <span>Intensidad</span>
                <input
                  type="number"
                  step="0.1"
                  value={source.strength}
                  onChange={(event) =>
                    updateFieldSource(source.id, {
                      strength: Number(event.target.value),
                    })
                  }
                  className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white"
                />
              </label>

              <div className="grid grid-cols-3 gap-2 text-[11px] text-white/60">
                {(["x", "y", "z"] as const).map((component) => (
                  <label
                    key={`${source.id}-formula-${component}`}
                    className="space-y-1"
                  >
                    <span>{component.toUpperCase()}</span>
                    <input
                      type="text"
                      value={source.components[component]}
                      onChange={(event) =>
                        updateFieldSource(source.id, {
                          components: {
                            ...source.components,
                            [component]: event.target.value,
                          },
                        })
                      }
                      className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white font-mono text-[11px]"
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8 text-[10px] text-pink-200/50 uppercase tracking-widest text-center">
        Particle Physics Simulation v2.0
      </div>
    </div>
  );
};
