// src/App.tsx
import { Canvas } from "@react-three/fiber";
import { Scene } from "./components/3d/Scene";
import { Sidebar } from "./components/ui/Sidebar";

function App() {
  return (
    <div className="h-screen w-screen bg-black relative overflow-hidden">
      <Sidebar />
      <Canvas camera={{ position: [20, 20, 20], fov: 50 }}>
        <Scene />
      </Canvas>
    </div>
  );
}

export default App;
