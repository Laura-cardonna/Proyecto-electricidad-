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
        {isOpen ? '✕ Cerrar Manual' : '📖 Manual'}
      </button>

      {/* Contenedor del manual */}
      <div
        className={`bg-gray-900 border border-gray-700 text-gray-200 rounded-lg shadow-2xl overflow-hidden transition-all duration-300 ease-in-out mb-2 ${
          // Aumenté el ancho a w-96 y la altura máxima para que quepa bien el texto detallado
          isOpen ? 'max-h-[75vh] opacity-100 p-5 w-96 overflow-y-auto' : 'max-h-0 opacity-0 w-96 p-0'
        }`}
      >
        <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700 pb-2">
          Guía de Parámetros
        </h3>
        
        <div className="space-y-5 text-sm">
          
          {/* SECCIÓN 1: ELÉCTRICAS */}
          <div>
            <h4 className="font-bold text-pink-400 mb-2">1. Fuentes Eléctricas</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-300">
              <li><strong>Posición (X, Y, Z):</strong> Ubicación de la carga en la cuadrícula 3D.</li>
              <li><strong>Polaridad:</strong> <span className="text-pink-300 font-semibold">Positiva</span> (las líneas salen, empuja) o <span className="text-cyan-300 font-semibold">Negativa</span> (las líneas entran, jala).</li>
              <li><strong>Intensidad:</strong> Fuerza del empuje/atracción. Valores altos dominarán a otras cargas cercanas.</li>
            </ul>
          </div>
          
          {/* SECCIÓN 2: MAGNÉTICAS */}
          <div>
            <h4 className="font-bold text-cyan-400 mb-2">2. Fuentes Magnéticas (Imán)</h4>
            <p className="text-xs text-gray-400 mb-2">El magnetismo no empuja de frente, obliga a la partícula a girar hacia los lados.</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-300">
              <li><strong>Posición (X, Y, Z):</strong> El centro físico de tu imán.</li>
              <li><strong>Eje del Imán (X, Y, Z):</strong> Define cómo está "acostado" o "parado" el imán. Ej: El eje Y pone el imán verticalmente.</li>
              <li><strong>Polo Norte (+1 / -1):</strong> Define hacia dónde apunta el flujo. Si eliges el Eje Y, un +1 hará que el Norte apunte hacia arriba (+Y). Un -1 hará que apunte hacia abajo (-Y).</li>
              <li><strong>Intensidad:</strong> Qué tan rápido hará dar vueltas a la partícula.</li>
            </ul>
          </div>

          {/* SECCIÓN 3: PARTÍCULA */}
          <div>
            <h4 className="font-bold text-yellow-400 mb-2">3. Lanzar la Partícula</h4>
            <ul className="list-disc pl-5 space-y-1 text-gray-300">
              <li><strong>Posición Inicial:</strong> Las coordenadas desde donde la sueltas.</li>
              <li><strong>Velocidad (X, Y, Z):</strong> El empujón inicial. <em>¡Vital!</em> Una partícula sin velocidad inicial ignorará por completo los imanes. Debe estar en movimiento para ser afectada.</li>
              <li><strong>Carga (+ / -):</strong> Determina si las fuentes la verán como amiga o enemiga.</li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};