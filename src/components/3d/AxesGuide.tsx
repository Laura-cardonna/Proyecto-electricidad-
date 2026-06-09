import React from "react";

interface AxesGuideProps {
  length?: number;
}

export const AxesGuide: React.FC<AxesGuideProps> = ({ length = 100 }) => {
  // Configuración visual de los ejes
  const thickness = 0.07; // Grosor del cilindro
  const fullLength = length * 2; // Cruzar el origen hacia los negativos
  const arrowRadius = thickness * 4;
  const arrowHeight = thickness * 10;

  // Colores exactos extraídos del componente HUD
  const colorX = "#d8b9ff"; // Morado pastel
  const colorY = "#a9f0ad"; // Verde pastel
  const colorZ = "#7fd9ff"; // Azul pastel

  // Configuración del material para un acabado mate y suave
  const materialConfig = {
    roughness: 0.9, // Muy rugoso para que no brille como plástico
    metalness: 0.1, // Ligeramente metálico para que capte bien las luces
  };

  return (
    <group>
      {/* ─── EJE X (MORADO) ─── */}
      <group>
        {/* Cuerpo del eje */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[thickness, thickness, fullLength, 12]} />
          <meshStandardMaterial color={colorX} {...materialConfig} />
        </mesh>
        {/* Flecha apuntando al X positivo */}
        <mesh position={[length, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[arrowRadius, arrowHeight, 12]} />
          <meshStandardMaterial color={colorX} {...materialConfig} />
        </mesh>
      </group>

      {/* ─── EJE Y (VERDE) ─── */}
      <group>
        {/* Cuerpo del eje */}
        <mesh>
          <cylinderGeometry args={[thickness, thickness, fullLength, 12]} />
          <meshStandardMaterial color={colorY} {...materialConfig} />
        </mesh>
        {/* Flecha apuntando al Y positivo */}
        <mesh position={[0, length, 0]}>
          <coneGeometry args={[arrowRadius, arrowHeight, 12]} />
          <meshStandardMaterial color={colorY} {...materialConfig} />
        </mesh>
      </group>

      {/* ─── EJE Z (AZUL) ─── */}
      <group>
        {/* Cuerpo del eje */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[thickness, thickness, fullLength, 12]} />
          <meshStandardMaterial color={colorZ} {...materialConfig} />
        </mesh>
        {/* Flecha apuntando al Z positivo */}
        <mesh position={[0, 0, length]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[arrowRadius, arrowHeight, 12]} />
          <meshStandardMaterial color={colorZ} {...materialConfig} />
        </mesh>
      </group>
    </group>
  );
};