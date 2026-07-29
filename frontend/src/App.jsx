import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const [activity, setActivity] = useState(0)
  const mountRef = useRef(null)
  const activityRef = useRef(0)

  // Keep a live reference so the animation loop can read current activity
  useEffect(() => {
    activityRef.current = activity
  }, [activity])

  useEffect(() => {
    if (!mountRef.current) return

    // === Scene setup ===
    const width = window.innerWidth
    const height = window.innerHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x030308)

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 200)
    camera.position.set(0, 3.6, 9)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    mountRef.current.appendChild(renderer.domElement)

    // === Stars ===
    const starGeo = new THREE.BufferGeometry()
    const starCount = 3500
    const positions = new Float32Array(starCount * 3)
    for (let i = 0; i < starCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 120
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.7 })
    )
    scene.add(stars)

    // === Black hole core ===
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(1.05, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    )
    scene.add(core)

    // === Event horizon glow ===
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(1.18, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x1a0a2e,
        transparent: true,
        opacity: 0.35,
        side: THREE.BackSide
      })
    )
    scene.add(glow)

    // === Accretion disk (tilted) ===
    const diskGroup = new THREE.Group()
    diskGroup.rotation.x = Math.PI / 2.55
    diskGroup.rotation.z = 0.18

    const disk = new THREE.Mesh(
      new THREE.RingGeometry(1.25, 4.3, 128),
      new THREE.MeshBasicMaterial({
        color: 0xc9a0ff,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
    )
    diskGroup.add(disk)

    // Inner hotter ring
    const innerRing = new THREE.Mesh(
      new THREE.RingGeometry(1.15, 1.95, 64),
      new THREE.MeshBasicMaterial({
        color: 0xff9f43,
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
    )
    diskGroup.add(innerRing)

    scene.add(diskGroup)

    // === Soft nebula planes ===
    const nebula1 = new THREE.Mesh(
      new THREE.PlaneGeometry(22, 14),
      new THREE.MeshBasicMaterial({
        color: 0x2a1050,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending
      })
    )
    nebula1.position.set(0, 0, -10)
    scene.add(nebula1)

    const nebula2 = new THREE.Mesh(
      new THREE.PlaneGeometry(28, 16),
      new THREE.MeshBasicMaterial({
        color: 0x0d1b3e,
        transparent: true,
        opacity: 0.12,
        blending: THREE.AdditiveBlending
      })
    )
    nebula2.position.set(4, -2, -14)
    nebula2.rotation.z = 0.3
    scene.add(nebula2)

    // === Animation loop ===
    let frameId
    const animate = () => {
      frameId = requestAnimationFrame(animate)

      const t = performance.now() * 0.001
      const act = activityRef.current

      // Disk spin – faster with activity
      diskGroup.rotation.z = t * (0.18 + act * 0.9)

      // Glow pulse
      glow.material.opacity = 0.28 + Math.sin(t * 1.4) * 0.07 + act * 0.25

      // Inner ring reacts more
      innerRing.material.opacity = 0.4 + act * 0.35

      // Slow nebula drift
      nebula1.rotation.z = t * 0.015
      nebula2.rotation.z = t * 0.01 + 0.3

      // Stars very slow drift
      stars.rotation.y = t * 0.008

      renderer.render(scene, camera)
    }
    animate()

    // === Resize handler ===
    const onResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', onResize)
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  // Mouse movement increases activity
  const handleMouseMove = (e) => {
    const x = e.clientX / window.innerWidth
    const y = e.clientY / window.innerHeight
    const intensity = Math.abs(x - 0.5) + Math.abs(y - 0.5)
    setActivity(prev => Math.min(1, prev * 0.92 + intensity * 0.08))
  }

  // Typing increases activity
  const handleInput = (e) => {
    setQuery(e.target.value)
    setActivity(prev => Math.min(1, prev + 0.15))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setActivity(1)
    console.log('User asked for:', query)
  }

  return (
    <div className="landing" onMouseMove={handleMouseMove}>
      {/* 3D canvas mounts here */}
      <div className="canvas-wrap" ref={mountRef} />

      {/* Text overlay */}
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
