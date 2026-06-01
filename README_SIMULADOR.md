# Particle Simulator

Este proyecto es una simulación 3D de una partícula cargada que se mueve bajo la acción de campos eléctricos y magnéticos configurables. La simulación usa React, TypeScript, Three.js y Zustand para combinar interfaz, renderizado 3D y lógica física.

## Estructura funcional

### `src/App.tsx`

Es el punto de composición principal de la aplicación. Monta la interfaz general, coloca el panel lateral de control y carga el `Canvas` 3D donde vive la escena de simulación.

### `src/main.tsx`

Es el arranque de React. Conecta la aplicación al nodo raíz del HTML e importa los estilos globales.

## Lógica central de la simulación

### `src/core/engine.ts`

Contiene el motor físico de la partícula.

- `PhysicsState`: define el estado dinámico de la partícula, con posición y velocidad.
- `FieldSampler`: describe la función que devuelve el campo eléctrico y magnético en una posición y tiempo dados.
- `getAcceleration(...)`: calcula la aceleración a partir de la fuerza de Lorentz simplificada, usando $q(E + v \times B) / m$.
- `stepRK4(...)`: integra el movimiento con Runge-Kutta de orden 4, que mejora la estabilidad y precisión frente a un avance lineal simple.

Este archivo es uno de los más importantes porque determina cómo responde la partícula al campo en cada frame.

### `src/core/fields.ts`

Define, construye y evalúa los campos eléctricos y magnéticos.

- `FieldKind`: distingue entre campo eléctrico y magnético.
- `FieldSource`: modela una fuente de campo, con nombre, color, posición, intensidad, estado de activación y fórmulas por componente.
- `FieldComponents`: guarda las expresiones matemáticas de `x`, `y` y `z`.
- `createFieldSource(...)`: crea una fuente con valores por defecto según su tipo.
- `createDefaultFieldSources()`: genera las fuentes iniciales que aparecen al abrir la simulación.
- `sampleFieldSource(...)`: evalúa la fórmula de una fuente en una posición concreta usando `mathjs`.
- `sampleCombinedFields(...)`: suma todas las fuentes activas para obtener el campo total que recibe la partícula.
- `updateFieldSource(...)`: aplica cambios parciales sobre una fuente existente.
- `createFieldLineSeeds(...)` y `traceFieldLine(...)`: construyen las líneas visuales del campo para representarlo en 3D.

Este archivo concentra la definición matemática del sistema y también la forma en que se dibujan las líneas de campo.

### `src/store/useSimulation.ts`

Gestiona el estado global de la simulación con Zustand.

- Guarda posición inicial, velocidad inicial, posición actual, velocidad, carga y masa.
- Controla si la simulación está corriendo y si los campos están visibles/activos.
- Mantiene la lista de fuentes de campo.
- Expone acciones como iniciar, reiniciar, cambiar la carga, cambiar la masa, agregar o quitar fuentes y activar o desactivar cada fuente.

Es el puente entre la interfaz y la física: la UI modifica este estado y la escena lo consume para actualizar el comportamiento de la partícula.

## Renderizado 3D

### `src/components/3d/Scene.tsx`

Define la escena tridimensional completa.

- Ajusta el fondo, la luz ambiental, la luz puntual, la rejilla y las estrellas decorativas.
- Dibuja todas las fuentes de campo activas mediante `Field`.
- Renderiza la partícula con `Particle`.
- Usa `OrbitControls` para permitir rotar y mover la cámara.
- Sigue la partícula con la cámara para mantenerla siempre visible.

### `src/components/3d/Particle.tsx`

Representa visualmente la partícula cargada.

- Crea la esfera visible de la partícula.
- Añade una estela con `Trail` para mostrar su trayectoria.
- En cada frame, si la simulación está activa, llama a `stepRK4(...)` para calcular la nueva posición y velocidad.
- Toma los campos combinados desde `sampleCombinedFields(...)`, así que la partícula responde al conjunto de fuentes activas y no a una sola fuente.

Este archivo es el punto donde la física y la visualización se conectan de forma directa.

### `src/components/3d/Field.tsx`

Renderiza cada fuente de campo como un objeto 3D con su etiqueta y sus líneas de flujo.

- Genera semillas de líneas alrededor de la fuente.
- Calcula trayectorias hacia adelante y hacia atrás para construir líneas continuas.
- Muestra una esfera pequeña y un texto con el nombre de la fuente.
- Ajusta la opacidad según si la fuente está visible o no.

Sirve para visualizar la estructura espacial de cada campo y facilitar la interpretación de la simulación.

### `src/components/3d/AxesGuide.tsx`

Aporta una referencia visual de los ejes del espacio dentro de la escena.

- Dibuja los ejes X, Y y Z con líneas de colores suaves.
- Marca el origen con un pequeño punto central.
- Añade etiquetas discretas para identificar cada eje sin ensuciar la vista.

Este componente ayuda a entender mejor si la partícula se desplaza en horizontal, vertical o profundidad.

## Panel de control

### `src/components/ui/Sidebar.tsx`

Es el panel principal de interacción del usuario.

- Permite lanzar la simulación y reiniciarla.
- Activa o desactiva la visualización de los campos.
- Edita la posición inicial, la velocidad inicial, la carga y la masa de la partícula.
- Agrega, elimina y modifica fuentes de campo eléctricas o magnéticas.
- También deja editar la posición, la intensidad y las fórmulas de cada componente del campo.

### `src/components/ui/HUD.tsx`

Archivo presente pero sin implementación visible en esta versión.

## Archivos auxiliares

### `src/core/constants.ts`

Archivo vacío en esta versión.

### `src/index.css`

Contiene los estilos globales de la aplicación.

### `src/assets/`

Carpeta de recursos estáticos. No contiene la lógica principal de la simulación.

## Resumen rápido

- `engine.ts` calcula el movimiento de la partícula.
- `fields.ts` define y evalúa los campos.
- `useSimulation.ts` centraliza el estado.
- `Particle.tsx` anima la partícula.
- `Field.tsx` dibuja las fuentes de campo.
- `AxesGuide.tsx` muestra los ejes de referencia.
- `Scene.tsx` arma el mundo 3D.
- `Sidebar.tsx` permite configurar la simulación.

Si quieres, también puedo convertir este contenido en un README más corto y listo para pegar en el archivo principal del proyecto.
