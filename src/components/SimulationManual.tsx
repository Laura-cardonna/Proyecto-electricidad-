import React, { useState } from 'react';

export const SimulationManual: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute bottom-4 left-4 z-50 flex flex-col-reverse items-start">
      {/* Botón para abrir/cerrar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-full font-bold shadow-lg transition-all border border-cyan-400"
      >
        {isOpen ? '✕ Cerrar Manual' : '📖 Manual de Ayuda'}
      </button>

      {/* Contenedor del manual */}
      <div
        className={`bg-gray-900 border border-gray-700 text-gray-200 rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ease-in-out mb-2 ${
          isOpen ? 'max-h-[60vh] opacity-100 p-4 w-80 overflow-y-auto' : 'max-h-0 opacity-0 w-80 p-0'
        }`}
      >
        <h3 className="text-xl font-bold text-white mb-3 border-b border-gray-700 pb-2">Guía Rápida</h3>
        
        <div className="space-y-3 text-sm">
          <div>
            <h4 className="font-bold text-pink-400">1. Cargas Eléctricas</h4>
            <p>Generan un campo radial. Atraen o repelen la partícula de forma directa. La intensidad define la fuerza del empuje.</p>
          </div>
          
          <div>
            <h4 className="font-bold text-cyan-400">2. Cargas Magnéticas (Dipolo)</h4>
            <p>Actúan como un imán. No empujan la partícula en línea recta, sino que la obligan a <strong>girar</strong> (Fuerza de Lorentz). El eje (X,Y,Z) define cómo está posicionado el imán en el espacio.</p>
          </div>

          <div>
            <h4 className="font-bold text-yellow-400">3. Lanzar la Partícula</h4>
            <p>Configura la posición inicial y, muy importante, la <strong>velocidad inicial</strong>. Si lanzas una partícula quieta dentro de un campo magnético, no le pasará nada (requiere velocidad para sentir magnetismo).</p>
          </div>

          <div className="bg-gray-800 p-2 rounded border border-gray-600">
            <h4 className="font-bold text-white">💡 Tip para la demostración:</h4>
            <p className="text-xs mt-1">Coloca una carga eléctrica y una magnética juntas. Lanza la partícula desde lejos con velocidad. ¡Verás cómo se acelera y luego empieza a girar en espiral!</p>
          </div>
        </div>
      </div>
    </div>
  );
};