import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const mountRef = useRef(null)
  const activityRef = useRef(0)

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    let width = window.innerWidth
    let height = window.innerHeight
    const DPR = Math.min(window.devicePixelRatio, 1.8)

    // Scene
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x01010a)

    // Closer, more immersive camera
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 300)
    camera.position.set(0, 1.8, 7.2)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
    renderer.setSize(width, height)
    renderer.setPixelRatio(DPR)
    container.appendChild(renderer.domElement)

    // ========== GALAXY ==========
    const galaxyCount = 16000
    const gPos = new Float32Array(galaxyCount * 3)
    const gCol = new Float32Array(galaxyCount * 3)

    for (let i = 0; i < galaxyCount; i++) {
      const i3 = i * 3
      const r = Math.pow(Math.random(), 0.5) * 11
      const a = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * (1.6 + r * 0.12)

      gPos[i3]     = Math.cos(a) * r
      gPos[i3 + 1] = y
      gPos[i3 + 2] = Math.sin(a) * r

      const t = r / 11
      const c = new THREE.Color().setHSL(0.72 - t * 0.28, 0.9, 0.42 + Math.random() * 0.3)
      gCol[i3] = c.r; gCol[i3 + 1] = c.g; gCol[i3 + 2] = c.b
    }

    const galaxyGeo = new THREE.BufferGeometry()
    galaxyGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3))
    galaxyGeo.setAttribute('color', new THREE.BufferAttribute(gCol, 3))

    const galaxy = new THREE.Points(
      galaxyGeo,
      new THREE.PointsMaterial({
        size: 0.04,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
      })
    )
    galaxy.rotation.x = 0.38
    scene.add(galaxy)

    // ========== ACCRETION DISK ==========
    const diskCount = 7500
    const dPos = new Float32Array(diskCount * 3)
    const dCol = new Float32Array(diskCount * 3)

    for (let i = 0; i < diskCount; i++) {
      const i3 = i * 3
      const r = 1.35 + Math.random() * 4.2
      const a = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * 0.22

      dPos[i3]     = Math.cos(a) * r
      dPos[i3 + 1] = y
      dPos[i3 + 2] = Math.sin(a) * r

      const heat = 1 - (r - 1.35) / 4.2
      const c = new THREE.Color().setHSL(0.07 + heat * 0.15, 1, 0.5 + heat * 0.25)
      dCol[i3] = c.r; dCol[i3 + 1] = c.g; dCol[i3 + 2] = c.b
    }

    const diskGeo = new THREE.BufferGeometry()
    diskGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3))
    diskGeo.setAttribute('color', new THREE.BufferAttribute(dCol, 3))

    const disk = new THREE.Points(
      diskGeo,
      new THREE.PointsMaterial({
        size: 0.032,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    )
    disk.rotation.x = Math.PI / 2.35
    disk.rotation.z = 0.15
    scene.add(disk)

    // ========== BLACK HOLE ==========
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(1.08, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    )
    scene.add(core)

    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(1.32, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x3a1060,
        transparent: true,
        opacity: 0.45,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
      })
    )
    scene.add(glow)

    // ========== ORBITING ENERGY ==========
    const orbits = []
    const oGeo = new THREE.SphereGeometry(0.09, 14, 14)

    for (let i = 0; i < 10; i++) {
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(0.6 + Math.random() * 0.25, 0.95, 0.65),
        transparent: true,
        opacity: 0.95
      })
      const mesh = new THREE.Mesh(oGeo, mat)
      scene.add(mesh)
      orbits.push({
        mesh,
        angle: (i / 10) * Math.PI * 2,
        speed: 0.012 + Math.random() * 0.018,
        radius: 2.8 + Math.random() * 3.2,
        yAmp: 0.5 + Math.random() * 1.4,
        phase: Math.random() * Math.PI * 2
      })
    }

    // ========== ANIMATION LOOP (always running) ==========
    let frameId
    const clock = new THREE.Clock()

    function animate() {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      const act = activityRef.current

      // Always spinning — activity just makes it faster
      galaxy.rotation.y = t * 0.018
      galaxy.rotation.z = Math.sin(t * 0.12) * 0.04

      disk.rotation.z = t * (0.35 + act * 1.8)

      glow.material.opacity = 0.35 + Math.sin(t * 2.1) * 0.12 + act * 0.35

      for (const o of orbits) {
        o.angle += o.speed * (1 + act * 3)
        const x = Math.cos(o.angle) * o.radius
        const z = Math.sin(o.angle) * o.radius
        const y = Math.sin(o.angle * 1.5 + o.phase) * o.yAmp
        o.mesh.position.set(x, y, z)
      }

      // Camera slight breathe
      camera.position.y = 1.8 + Math.sin(t * 0.3) * 0.12
      camera.lookAt(0, 0, 0)

      // Decay activity
      activityRef.current *= 0.97

      renderer.render(scene, camera)
    }
    animate()

    // Resize
    const onResize = () => {
      width = window.innerWidth
      height = window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', onResize)
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  // Strong activity on mouse move
  const handleMouseMove = (e) => {
    const speed = Math.abs(e.movementX) + Math.abs(e.movementY)
    if (speed > 1) {
      activityRef.current = Math.min(1, activityRef.current + speed * 0.008)
    }
  }

  // Strong activity on typing
  const handleInput = (e) => {
    setQuery(e.target.value)
    activityRef.current = Math.min(1, activityRef.current + 0.35)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    activityRef.current = 1
    console.log('User asked for:', query)
  }

  return (
    <div className="landing" onMouseMove={handleMouseMove}>
      {/* Canvas has NO pointer events so input works */}
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
