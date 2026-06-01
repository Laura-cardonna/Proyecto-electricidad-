// src/components/3d/Field.tsx
import { Html, Line } from '@react-three/drei';
import { useMemo } from 'react';
import { createFieldLineSeeds, traceFieldLine, type FieldSource } from '../../core/fields';

interface FieldProps {
    source: FieldSource;
    visible?: boolean;
}

export const Field = ({ source, visible = true }: FieldProps) => {
    // Generamos los puntos de inicio (semillas) de las líneas
    const seedPoints = useMemo(() => createFieldLineSeeds(source, 10), [source]);

    // Calculamos las líneas de campo hacia adelante y hacia atrás
    const fieldLines = useMemo(() => {
        return seedPoints.map((seed) => {
            const forward = traceFieldLine(source, seed, 1);
            const backward = traceFieldLine(source, seed, -1).reverse();
            // Unimos ambos trayectos en una sola línea continua
            return backward.concat(forward.slice(1));
        });
    }, [seedPoints, source, source.components, source.strength]); // <--- Escucha cambios en fórmulas e intensidad

    const opacity = visible ? 0.65 : 0.18;

    return (
        <group position={[source.position.x, source.position.y, source.position.z]}>
            {/* Esfera representativa de la fuente */}
            <mesh>
                <sphereGeometry args={[0.22, 18, 18]} />
                <meshBasicMaterial color={source.color} transparent opacity={opacity} />
            </mesh>

            {/* Etiqueta con el nombre de la fuente (Rosa Pastel o el color de la fuente) */}
            <Html center distanceFactor={18} style={{ pointerEvents: 'none' }}>
                <div
                    style={{
                        color: source.color,
                        fontSize: '10px',
                        letterSpacing: '0.2em',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        opacity,
                        transform: 'translateY(-16px)',
                        whiteSpace: 'nowrap',
                        textShadow: '0 0 5px rgba(0,0,0,0.5)'
                    }}
                >
                    {source.name}
                </div>
            </Html>

            {/* Renderizado de las líneas de campo */}
            {fieldLines.map((points, index) => (
                <Line
                    key={`${source.id}-${index}`}
                    points={points}
                    color={source.color}
                    lineWidth={1.5}
                    transparent
                    opacity={opacity}
                />
            ))}
        </group>
    );
};