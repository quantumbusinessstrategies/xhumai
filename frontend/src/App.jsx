import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const mountRef = useRef(null)
  const starsRef = useRef([])          // permanent stars born from input
  const breathRef = useRef(0)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)

  // ========== CREATE A NEW STAR (called on submit) ==========
  const birthStar = (text) => {
    if (!sceneRef.current) return

    const geo = new THREE.SphereGeometry(0.04 + Math.random() * 0.06, 12, 12)
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(0.55 + Math.random() * 0.3, 0.7, 0.75),
      transparent: true,
      opacity: 0
    })
    const star = new THREE.Mesh(geo, mat)

    // Place it somewhere beautiful in the field
    const r = 2.5 + Math.random() * 5.5
    const a = Math.random() * Math.PI * 2
    const y = (Math.random() - 0.5) * 3.5
    star.position.set(Math.cos(a) * r, y, Math.sin(a) * r)

    // Soft glow sprite
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255,255,255,0.9)')
    gradient.addColorStop(0.3, 'rgba(180,160,255,0.4)')
    gradient.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 64, 64)

    const glowTex = new THREE.CanvasTexture(canvas)
    const glowMat = new THREE.SpriteMaterial({
      map: glowTex,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    const glow = new THREE.Sprite(glowMat)
    glow.scale.set(0.6, 0.6, 1)
    star.add(glow)

    sceneRef.current.add(star)
    starsRef.current.push({ mesh: star, glow, born: performance.now(), text })
  }

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    let width = window.innerWidth
    let height = window.innerHeight
    const DPR = Math.min(window.devicePixelRatio, 1.75)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x03010a)
    scene.fog = new THREE.FogExp2(0x03010a, 0.012)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200)
    camera.position.set(0, 0.8, 9.5)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(width, height)
    renderer.setPixelRatio(DPR)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // ========== SOFT NEBULA FIELD ==========
    const count = 9000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const r = Math.pow(Math.random(), 0.6) * 14
      const theta = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * (2.2 + r * 0.2)

      positions[i3] = Math.cos(theta) * r
      positions[i3 + 1] = y
      positions[i3 + 2] = Math.sin(theta) * r

      // Soft cosmic palette — deep purples, blues, faint rose
      const t = r / 14
      const hue = 0.65 + Math.sin(t * 4) * 0.08 + Math.random() * 0.06
      const c = new THREE.Color().setHSL(hue, 0.55, 0.35 + Math.random() * 0.35)
      colors[i3] = c.r
      colors[i3 + 1] = c.g
      colors[i3 + 2] = c.b

      sizes[i] = 0.02 + Math.random() * 0.05
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    })

    const nebula = new THREE.Points(geo, mat)
    scene.add(nebula)

    // ========== CENTRAL SOFT GLOW (the heart) ==========
    const heartGeo = new THREE.SphereGeometry(0.9, 32, 32)
    const heartMat = new THREE.MeshBasicMaterial({
      color: 0x1a0a30,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    })
    const heart = new THREE.Mesh(heartGeo, heartMat)
    scene.add(heart)

    // Outer soft aura
    const aura = new THREE.Mesh(
      new THREE.SphereGeometry(2.8, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x2a1050,
        transparent: true,
        opacity: 0.08,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
      })
    )
    scene.add(aura)

    // ========== ANIMATION — slow, living, breathing ==========
    let frameId
    const clock = new THREE.Clock()

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Slow rotation of the whole field
      nebula.rotation.y = t * 0.008
      nebula.rotation.z = Math.sin(t * 0.05) * 0.03

      // Breathing — the heart of the entity
      const breath = 0.5 + Math.sin(t * 0.35) * 0.5
      breathRef.current = breath

      heart.scale.setScalar(0.95 + breath * 0.18)
      heart.material.opacity = 0.28 + breath * 0.22

      aura.scale.setScalar(1 + breath * 0.12)
      aura.material.opacity = 0.05 + breath * 0.06

      // Fade in newly born stars
      const now = performance.now()
      for (const s of starsRef.current) {
        const age = (now - s.born) / 1000
        if (age < 2.5) {
          const fade = Math.min(1, age / 2.5)
          s.mesh.material.opacity = fade
          s.glow.material.opacity = fade * 0.7
        }
        // Gentle drift
        s.mesh.position.y += Math.sin(t * 0.4 + s.mesh.position.x) * 0.0008
      }

      // Very subtle camera drift
      camera.position.x = Math.sin(t * 0.07) * 0.35
      camera.position.y = 0.8 + Math.sin(t * 0.11) * 0.2
      camera.lookAt(0, 0, 0)

      renderer.render(scene, camera)
    }
    animate()

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
      geo.dispose()
      mat.dispose()
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return

    // A new star is born from this interaction
    birthStar(query.trim())

    // Clear input after a short moment so the user feels the offering was received
    setTimeout(() => setQuery(''), 400)
  }

  return (
    <div className="landing">
      <div className="canvas-wrap" ref={mountRef} />

      <div className="content">
        <h1 className="logo">XhumAI</h1>
        <p className="tagline">WORK LESS. LIVE MORE.</p>

        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you need done?"
            autoFocus
          />
        </form>

        <p className="hint">Every thought becomes a star</p>
      </div>
    </div>
  )
}

export default App
