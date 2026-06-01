import { useSimulation } from "../../store/useSimulation";

const formatValue = (value: number) => value.toFixed(2);

export const HUD = () => {
  const position = useSimulation((state) => state.position);

  return (
    <div className="absolute top-5 left-5 z-20 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md shadow-2xl pointer-events-none min-w-[12rem]">
      <div className="text-[10px] uppercase tracking-[0.3em] text-white/45 mb-2">
        Posición actual
      </div>
      <div className="space-y-1 text-sm font-mono text-white/90">
        <div>
          X: <span className="text-[#d8b9ff]">{formatValue(position.x)}</span>
        </div>
        <div>
          Y: <span className="text-[#a9f0ad]">{formatValue(position.y)}</span>
        </div>
        <div>
          Z: <span className="text-[#7fd9ff]">{formatValue(position.z)}</span>
        </div>
      </div>
    </div>
  );
};
