import { Canvas } from "@react-three/fiber"
import { ShaderPlane, EnergyRing } from "./ui/background-paper-shaders"

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 opacity-30">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <ShaderPlane position={[0, 0, 0]} color1="#0ea5e9" color2="#1e293b" />
        <EnergyRing radius={1.5} position={[0, 0, -1]} />
      </Canvas>
    </div>
  )
}
