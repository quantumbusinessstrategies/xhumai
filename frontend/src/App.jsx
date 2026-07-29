import { useState, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'
import './App.css'

// ======================================================
// Reactive Black Hole + Accretion Disk + Nebula
// ======================================================
function BlackHoleScene({ activity }) {
  const diskRef = useRef()
  const glowRef = useRef()
  const nebulaRef = useRef()

  // Activity makes the disk spin faster and glow stronger
  const spinSpeed = 0.15 + activity * 0.8
  const glowIntensity = 0.4 + activity * 1.2

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    if (diskRef.current) {
      diskRef.current.rotation.z = t * spinSpeed
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.25 + Math.sin(t * 1.5) * 0.08 + activity * 0.3
    }
    if (nebulaRef.current) {
      nebulaRef.current.rotation.y = t * 0.02
      nebulaRef.current.rotation.x = Math.sin(t * 0.1) * 0.05
    }
  })

  // Create a simple accretion disk geometry
  const diskGeometry = useMemo(() => {
    const geo = new THREE.RingGeometry(1.2, 4.2, 128)
    return geo
  }, [])

  return (
    <>
      {/* Deep space stars */}
      <Stars radius={80} depth={50} count={4000} factor={3} saturation={0} fade speed={0.4} />

      {/* Subtle ambient light */}
      <ambientLight intensity={0.08} />

      {/* Black hole core (just a dark sphere) */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[1.05, 64, 64]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Event horizon glow */}
      <mesh ref={glowRef} position={[0, 0, 0]}>
        <sphereGeometry args={[1.15, 32, 32]} />
        <meshBasicMaterial
          color="#1a0a2e"
          transparent
          opacity={0.35}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Accretion disk - tilted so we look slightly down on it */}
      <group rotation={[Math.PI / 2.6, 0.15, 0]}>
        <mesh ref={diskRef} geometry={diskGeometry}>
          <meshBasicMaterial
            color="#c9a0ff"
            transparent
            opacity={0.55}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Inner hotter ring */}
        <mesh rotation={[0, 0, 0]}>
          <ringGeometry args={[1.15, 1.9, 64]} />
          <meshBasicMaterial
            color="#ff9f43"
            transparent
            opacity={0.4 + activity * 0.3}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* Soft nebula cloud behind */}
      <mesh ref={nebulaRef} position={[0, 0, -8]} scale={[18, 12, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#2a1050"
          transparent
          opacity={0.18 + activity * 0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Second softer nebula layer */}
      <mesh position={[3, -2, -12]} scale={[22, 14, 1]} rotation={[0, 0, 0.3]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#0d1b3e"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </>
  )
}

// ======================================================
// Main Landing Page
// ======================================================
function App() {
  const [query, setQuery] = useState('')
  const [activity, setActivity] = useState(0)

  // Mouse movement increases activity slightly
  const handleMouseMove = (e) => {
    const x = e.clientX / window.innerWidth
    const y = e.clientY / window.innerHeight
    const intensity = Math.abs(x - 0.5) + Math.abs(y - 0.5)
    setActivity(prev => Math.min(1, prev * 0.92 + intensity * 0.08))
  }

  // Typing increases activity
  const handleInput = (e) => {
    setQuery(e.target.value)
    setActivity(prev => Math.min(1, prev + 0.12))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setActivity(1) // full pulse on submit
    console.log('User asked for:', query)
    // Later this routes into the capability engine
  }

  return (
    <div className="landing" onMouseMove={handleMouseMove}>
      {/* 3D Background */}
      <div className="canvas-wrap">
        <Canvas
          camera={{
            position: [0, 3.8, 9],
            fov: 42,
            near: 0.1,
            far: 200
          }}
          dpr={[1, 1.5]}
        >
          <BlackHoleScene activity={activity} />
        </Canvas>
      </div>

      {/* Text Overlay */}
      <div className="content">
        <h1 className="logo">XhumAI</h1>
        <p className="tagline">WORK LESS. LIVE MORE.</p>

        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            value={query}
            onChange={handleInput}
            placeholder="What do you need done?"
            autoFocus
          />
        </form>
      </div>
    </div>
  )
}

export default App
