import { useEffect, useState } from "react";
import { useSimulation } from "../../store/useSimulation";
import * as THREE from "three";
import type { DipoleAxis } from "../../core/fields";

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
  const [chargeInput, setChargeInput] = useState(String(charge));

  useEffect(() => {
    setChargeInput(String(charge));
  }, [charge]);

  // FIX: Manejo permisivo para permitir el signo negativo "-" en inputs controlados
  const handleVectorChange = (
    current: THREE.Vector3,
    component: "x" | "y" | "z",
    value: string,
    setter: (vector: THREE.Vector3) => void,
  ) => {
    const nextVector = current.clone();
    // Si el usuario borra o pone un menos, no forzamos el 0 inmediatamente
    const parsed = parseFloat(value);
    nextVector[component] = isNaN(parsed) ? 0 : parsed;
    setter(nextVector);
  };

  return (
    <div className="absolute top-5 right-5 z-20 w-[26rem] max-h-[calc(100vh-2.5rem)] overflow-y-auto p-6 bg-white/10 backdrop-blur-md border border-pink-200/30 rounded-2xl shadow-2xl">
      <h1 className="text-pink-300 font-bold text-xl mb-2 tracking-wider">
        MISION CONTROL
      </h1>
      <p className="text-xs text-white/60 mb-5">
        Configura la partícula, define varias cargas y luego activa la
        distribución.
      </p>

      {/* ── Botones de control ── */}
      <div className="space-y-4 mb-6">
        <button
          onClick={startSimulation}
          disabled={isRunning}
          className={`w-full py-3 rounded-xl font-bold transition-all ${
            isRunning
              ? "bg-gray-600 text-white/60"
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

      {/* ── Lanzamiento ── */}
      <section className="space-y-4 mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-100/80">
          Lanzamiento
        </h2>

        <label className="block text-xs text-white/70 space-y-1">
          <span>Posición inicial</span>
          <div className="grid grid-cols-3 gap-2">
            {(["x", "y", "z"] as const).map((component) => (
              <input
                key={`pos-${component}`}
                type="number"
                step="0.5"
                disabled={isRunning}
                defaultValue={initialPosition[component]}
                onBlur={(e) =>
                  handleVectorChange(
                    initialPosition,
                    component,
                    e.target.value,
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
                key={`vel-${component}`}
                type="number"
                step="0.5"
                disabled={isRunning}
                defaultValue={initialVelocity[component]}
                onBlur={(e) =>
                  handleVectorChange(
                    initialVelocity,
                    component,
                    e.target.value,
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
            <span>Carga q (+ / −)</span>
            <input
              type="text"
              inputMode="decimal"
              step="0.1"
              disabled={isRunning}
              value={chargeInput}
              onChange={(e) => setChargeInput(e.target.value)}
              onBlur={() => {
                const parsed = Number(chargeInput);
                if (!Number.isNaN(parsed)) {
                  setCharge(parsed);
                } else {
                  setChargeInput(String(charge));
                }
              }}
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white disabled:opacity-50"
            />
          </label>
          <label className="block text-xs text-white/70 space-y-1">
            <span>Masa m</span>
            <input
              type="number"
              step="0.1"
              min="0.1"
              disabled={isRunning}
              value={mass}
              onChange={(e) => setMass(Math.max(Number(e.target.value), 0.1))}
              className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white disabled:opacity-50"
            />
          </label>
        </div>
      </section>

      {/* ── Cargas de campo ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-pink-100/80">
            Cargas de campo
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => addFieldSource("electric")}
              className="text-[10px] px-3 py-1 rounded-full border border-orange-200/30 text-orange-100 hover:bg-orange-200/10"
            >
              + Eléctrica
            </button>
            <button
              onClick={() => addFieldSource("magnetic")}
              className="text-[10px] px-3 py-1 rounded-full border border-cyan-200/30 text-cyan-100 hover:bg-cyan-200/10"
            >
              + Magnética
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {fieldSources.map((source) => (
            <div
              key={source.id}
              className={`rounded-2xl border bg-black/20 p-3 space-y-3 ${
                source.kind === "electric"
                  ? "border-orange-200/20"
                  : "border-cyan-200/20"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <input
                    type="text"
                    value={source.name}
                    onChange={(e) =>
                      updateFieldSource(source.id, { name: e.target.value })
                    }
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white font-medium"
                  />
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] uppercase tracking-[0.2em] font-bold ${
                        source.kind === "electric"
                          ? "text-orange-300"
                          : "text-cyan-300"
                      }`}
                    >
                      {source.kind === "electric" ? "Eléctrica" : "Magnética"}
                    </span>
                    <button
                      onClick={() => toggleFieldSource(source.id)}
                      className={`ml-auto text-[10px] rounded-full border px-2 py-1 ${
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

              {/* ── Controles ELÉCTRICA ── */}
              {source.kind === "electric" && (
                <div className="space-y-1">
                  <span className="text-[10px] text-white/60 uppercase tracking-widest">
                    Signo de la carga
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() =>
                        updateFieldSource(source.id, { polarity: "positive" })
                      }
                      className={`py-2 rounded-xl font-bold text-sm border-2 transition-all ${
                        source.polarity === "positive"
                          ? "border-red-400 bg-red-400/20 text-red-200"
                          : "border-white/10 text-white/40 hover:border-white/30"
                      }`}
                    >
                      + Positiva
                    </button>
                    <button
                      onClick={() =>
                        updateFieldSource(source.id, { polarity: "negative" })
                      }
                      className={`py-2 rounded-xl font-bold text-sm border-2 transition-all ${
                        source.polarity === "negative"
                          ? "border-blue-400 bg-blue-400/20 text-blue-200"
                          : "border-white/10 text-white/40 hover:border-white/30"
                      }`}
                    >
                      − Negativa
                    </button>
                  </div>
                </div>
              )}

              {/* ── Controles MAGNÉTICA ── */}
              {source.kind === "magnetic" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-white/60 uppercase tracking-widest">
                      Eje del dipolo (Geometría)
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {(["x", "y", "z"] as const).map((ax) => (
                        <button
                          key={ax}
                          onClick={() =>
                            updateFieldSource(source.id, {
                              dipoleAxis: ax as DipoleAxis,
                            })
                          }
                          className={`py-2 rounded-xl font-bold text-sm border-2 transition-all ${
                            source.dipoleAxis === ax
                              ? "border-cyan-400 bg-cyan-400/20 text-cyan-200"
                              : "border-white/10 text-white/40 hover:border-white/30"
                          }`}
                        >
                          {ax.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-white/60 uppercase tracking-widest">
                      Orientación Polo Norte
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() =>
                          updateFieldSource(source.id, { dipoleSign: 1 })
                        }
                        className={`py-2 rounded-xl font-bold text-sm border-2 transition-all ${
                          source.dipoleSign === 1
                            ? "border-cyan-400 bg-cyan-400/20 text-cyan-200"
                            : "border-white/10 text-white/40 hover:border-white/30"
                        }`}
                      >
                        +{source.dipoleAxis.toUpperCase()} (Norte)
                      </button>
                      <button
                        onClick={() =>
                          updateFieldSource(source.id, { dipoleSign: -1 })
                        }
                        className={`py-2 rounded-xl font-bold text-sm border-2 transition-all ${
                          source.dipoleSign === -1
                            ? "border-purple-400 bg-purple-400/20 text-purple-200"
                            : "border-white/10 text-white/40 hover:border-white/30"
                        }`}
                      >
                        −{source.dipoleAxis.toUpperCase()} (Sur)
                      </button>
                    </div>
                  </div>

                  {/* ── RESTAURADO: Fórmulas Analíticas ── */}
                  <div className="space-y-1 pt-2 border-t border-white/10">
                    <span className="text-[10px] text-cyan-200/60 uppercase tracking-widest">
                      Fórmulas Analíticas (x, y, z)
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {(["x", "y", "z"] as const).map((comp) => (
                        <input
                          key={`formula-${comp}`}
                          type="text"
                          value={source.components[comp]}
                          onChange={(e) =>
                            updateFieldSource(source.id, {
                              components: {
                                ...source.components,
                                [comp]: e.target.value,
                              },
                            })
                          }
                          className="w-full rounded-lg bg-black/30 border border-white/10 px-2 py-2 text-white text-[11px] font-mono focus:border-cyan-400/50 outline-none"
                          placeholder={comp}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Posición general (Aplica onBlur para negativos) */}
              <div className="grid grid-cols-3 gap-2 text-xs text-white/70">
                {(["x", "y", "z"] as const).map((component) => (
                  <label
                    key={`source-${source.id}-${component}`}
                    className="space-y-1"
                  >
                    <span>{component.toUpperCase()}</span>
                    <input
                      type="number"
                      step="0.25"
                      defaultValue={source.position[component]}
                      onBlur={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          updateFieldSource(source.id, {
                            position: { ...source.position, [component]: val },
                          });
                        }
                      }}
                      className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white"
                    />
                  </label>
                ))}
              </div>

              {/* Intensidad */}
              <label className="block text-xs text-white/70 space-y-1">
                <span>Intensidad</span>
                <input
                  type="number"
                  step="1"
                  defaultValue={source.strength}
                  onBlur={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val))
                      updateFieldSource(source.id, { strength: val });
                  }}
                  className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-white"
                />
              </label>
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
