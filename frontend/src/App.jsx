import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const mountRef = useRef(null)
  const activityRef = useRef(0)
  const targetActivity = useRef(0)

  useEffect(() => {
    if (!mountRef.current) return

    const width = window.innerWidth
    const height = window.innerHeight
    const DPR = Math.min(window.devicePixelRatio, 1.75)

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x02020a)

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 500)
    camera.position.set(0, 2.8, 11)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(DPR)
    mountRef.current.appendChild(renderer.domElement)

    // ========== GALAXY / NEBULA PARTICLES ==========
    const galaxyCount = 14000
    const galaxyPos = new Float32Array(galaxyCount * 3)
    const galaxyCol = new Float32Array(galaxyCount * 3)
    const galaxySize = new Float32Array(galaxyCount)

    for (let i = 0; i < galaxyCount; i++) {
      const i3 = i * 3
      const r = Math.pow(Math.random(), 0.55) * 9.5
      const a = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * (1.8 + r * 0.15)

      galaxyPos[i3] = Math.cos(a) * r
      galaxyPos[i3 + 1] = y
      galaxyPos[i3 + 2] = Math.sin(a) * r

      // Color shifts from purple/blue core to cyan outer
      const t = r / 9.5
      const hue = 0.72 - t * 0.25
      const c = new THREE.Color().setHSL(hue, 0.85, 0.45 + Math.random() * 0.25)
      galaxyCol[i3] = c.r
      galaxyCol[i3 + 1] = c.g
      galaxyCol[i3 + 2] = c.b

      galaxySize[i] = 0.015 + Math.random() * 0.04
    }

    const galaxyGeo = new THREE.BufferGeometry()
    galaxyGeo.setAttribute('position', new THREE.BufferAttribute(galaxyPos, 3))
    galaxyGeo.setAttribute('color', new THREE.BufferAttribute(galaxyCol, 3))

    const galaxyMat = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    })

    const galaxy = new THREE.Points(galaxyGeo, galaxyMat)
    galaxy.rotation.x = 0.35
    scene.add(galaxy)

    // ========== ACCRETION DISK (dense particle ring) ==========
    const diskCount = 6000
    const diskPos = new Float32Array(diskCount * 3)
    const diskCol = new Float32Array(diskCount * 3)

    for (let i = 0; i < diskCount; i++) {
      const i3 = i * 3
      const r = 1.4 + Math.random() * 3.8
      const a = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * 0.18

      diskPos[i3] = Math.cos(a) * r
      diskPos[i3 + 1] = y
      diskPos[i3 + 2] = Math.sin(a) * r

      // Hotter closer to center
      const heat = 1 - (r - 1.4) / 3.8
      const c = new THREE.Color().setHSL(0.08 + heat * 0.12, 0.95, 0.55 + heat * 0.2)
      diskCol[i3] = c.r
      diskCol[i3 + 1] = c.g
      diskCol[i3 + 2] = c.b
    }

    const diskGeo = new THREE.BufferGeometry()
    diskGeo.setAttribute('position', new THREE.BufferAttribute(diskPos, 3))
    diskGeo.setAttribute('color', new THREE.BufferAttribute(diskCol, 3))

    const diskMat = new THREE.PointsMaterial({
      size: 0.028,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })

    const disk = new THREE.Points(diskGeo, diskMat)
    disk.rotation.x = Math.PI / 2.4
    disk.rotation.z = 0.12
    scene.add(disk)

    // ========== BLACK HOLE CORE ==========
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(1.05, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    )
    scene.add(core)

    // Soft event horizon glow
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(1.25, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x2a0a4a,
        transparent: true,
        opacity: 0.4,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
      })
    )
    scene.add(glow)

    // ========== ORBITING ENERGY PARTICLES ==========
    const orbitCount = 8
    const orbits = []
    const orbitGeo = new THREE.SphereGeometry(0.07, 12, 12)

    for (let i = 0; i < orbitCount; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.65 + Math.random() * 0.2, 0.9, 0.6),
        transparent: true,
        opacity: 0.9
      })
      const mesh = new THREE.Mesh(orbitGeo, mat)
      scene.add(mesh)

      orbits.push({
        mesh,
        angle: (i / orbitCount) * Math.PI * 2,
        speed: 0.008 + Math.random() * 0.012,
        radius: 3.2 + Math.random() * 2.5,
        yAmp: 0.6 + Math.random() * 1.2,
        phase: Math.random() * Math.PI * 2
      })
    }

    // ========== ANIMATION ==========
    let frameId
    const clock = new THREE.Clock()

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Smooth activity toward target
      activityRef.current += (targetActivity.current - activityRef.current) * 0.06
      const act = activityRef.current

      // Galaxy slow spin
      galaxy.rotation.y = t * 0.012
      galaxy.rotation.z = Math.sin(t * 0.08) * 0.03

      // Disk spins faster with activity
      disk.rotation.z = t * (0.22 + act * 1.1)

      // Glow pulse
      glow.material.opacity = 0.32 + Math.sin(t * 1.6) * 0.08 + act * 0.28

      // Orbiting particles
      for (const o of orbits) {
        o.angle += o.speed * (1 + act * 2.5)
        const x = Math.cos(o.angle) * o.radius
        const z = Math.sin(o.angle) * o.radius
        const y = Math.sin(o.angle * 1.4 + o.phase) * o.yAmp
        o.mesh.position.set(x, y, z)
        o.mesh.material.opacity = 0.7 + act * 0.3
      }

      // Gentle camera breathe
      camera.position.y = 2.8 + Math.sin(t * 0.25) * 0.15
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)

      // Decay activity slowly
      targetActivity.current *= 0.985
    }
    animate()

    // Resize
    const onResize = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', onResize)
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement)
      }
      renderer.dispose()
      galaxyGeo.dispose()
      diskGeo.dispose()
      galaxyMat.dispose()
      diskMat.dispose()
    }
  }, [])

  // Mouse movement adds activity
  const handleMouseMove = (e) => {
    const dx = Math.abs(e.movementX) + Math.abs(e.movementY)
    if (dx > 2) {
      targetActivity.current = Math.min(1, targetActivity.current + dx * 0.004)
    }
  }

  // Typing adds strong activity
  const handleInput = (e) => {
    setQuery(e.target.value)
    targetActivity.current = Math.min(1, targetActivity.current + 0.18)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    targetActivity.current = 1
    console.log('User asked for:', query)
    // Future: route into capability engine
  }

  return (
    <div className="landing" onMouseMove={handleMouseMove}>
      <div className="canvas-wrap" ref={mountRef} />

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
