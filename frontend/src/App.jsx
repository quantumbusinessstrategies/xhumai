import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import './App.css'

// For local backend testing. On quantimeta.com this will later point to the real API.
const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function App() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('Every thought becomes a star')
  const [responseKey, setResponseKey] = useState(0)
  const [status, setStatus] = useState('')
  const [needsMore, setNeedsMore] = useState(false)
  const [moreText, setMoreText] = useState('')
  const [morePrompt, setMorePrompt] = useState('')

  const mountRef = useRef(null)
  const starsRef = useRef([])
  const sceneRef = useRef(null)
  const nebulaRef = useRef(null)

  // ========== BIRTH STAR (local visual + optional persist) ==========
  const birthStar = (data = {}) => {
    if (!sceneRef.current) return

    const hue = data.hue ?? (0.05 + Math.random() * 0.75)
    const geo = new THREE.SphereGeometry(0.035 + Math.random() * 0.045, 10, 10)
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue, 0.6, 0.78),
      transparent: true,
      opacity: 0
    })
    const star = new THREE.Mesh(geo, mat)

    const x = data.x ?? (Math.random() - 0.5) * 11
    const y = data.y ?? (Math.random() - 0.5) * 4.2
    const z = data.z ?? (Math.random() - 0.5) * 11
    star.position.set(x, y, z)

    // soft glow
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,255,255,0.9)')
    g.addColorStop(0.3, 'rgba(255,200,230,0.4)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 64)

    const glow = new THREE.Sprite(new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(canvas),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    }))
    glow.scale.set(0.55, 0.55, 1)
    star.add(glow)

    sceneRef.current.add(star)
    starsRef.current.push({
      mesh: star,
      glow,
      born: performance.now(),
      // simple orbital params for living motion
      orbitSpeed: 0.0003 + Math.random() * 0.0008,
      orbitRadius: Math.sqrt(x * x + z * z),
      angle: Math.atan2(z, x),
      yBase: y
    })
  }

  // Load shared stars from backend on mount
  useEffect(() => {
    fetch(`${API}/api/stars`)
      .then(r => r.json())
      .then(data => {
        if (data.stars && Array.isArray(data.stars)) {
          data.stars.forEach(s => birthStar(s))
        }
      })
      .catch(() => {}) // backend may not be reachable from GitHub Pages yet
  }, [])

  // ========== SCENE ==========
  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    let width = window.innerWidth
    let height = window.innerHeight
    const DPR = Math.min(window.devicePixelRatio, 1.75)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x05021a)
    scene.fog = new THREE.FogExp2(0x05021a, 0.011)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 200)
    camera.position.set(0, 0.55, 8.6)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(DPR)
    container.appendChild(renderer.domElement)

    // ===== DENSE CORE + OUTER FIELD =====
    // More particles near center for gravitational density feel
    const count = 12000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Bias toward center: power distribution
      const u = Math.random()
      const r = Math.pow(u, 1.7) * 13   // denser near 0

      const theta = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * (1.4 + r * 0.28)

      positions[i3] = Math.cos(theta) * r
      positions[i3 + 1] = y
      positions[i3 + 2] = Math.sin(theta) * r

      // Brighter warm pastel spectrum
      const t = (r / 13 + Math.random() * 0.35) % 1
      let hue
      if (t < 0.22) hue = 0.88 + t * 0.35
      else if (t < 0.42) hue = 0.1 + (t - 0.22) * 0.55
      else if (t < 0.62) hue = 0.48 + (t - 0.42) * 0.35
      else if (t < 0.82) hue = 0.65 + (t - 0.62) * 0.3
      else hue = 0.78 + (t - 0.82) * 0.28

      const sat = 0.45 + Math.random() * 0.35
      const light = 0.55 + Math.random() * 0.3

      const c = new THREE.Color().setHSL(hue, sat, light)
      colors[i3] = c.r
      colors[i3 + 1] = c.g
      colors[i3 + 2] = c.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.PointsMaterial({
      size: 0.048,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    })

    const nebula = new THREE.Points(geo, mat)
    scene.add(nebula)
    nebulaRef.current = nebula

    // Smaller, denser black hole core (~1/4 previous visual weight)
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    )
    scene.add(core)

    // Event horizon soft ring (lensing suggestion)
    const horizon = new THREE.Mesh(
      new THREE.RingGeometry(0.42, 0.62, 64),
      new THREE.MeshBasicMaterial({
        color: 0x4a2080,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
    )
    horizon.rotation.x = Math.PI / 2.1
    scene.add(horizon)

    // Photon ring suggestion (thin bright ring)
    const photon = new THREE.Mesh(
      new THREE.RingGeometry(0.58, 0.68, 64),
      new THREE.MeshBasicMaterial({
        color: 0xffc8e8,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
    )
    photon.rotation.x = Math.PI / 2.15
    scene.add(photon)

    // Soft outer aura
    const aura = new THREE.Mesh(
      new THREE.SphereGeometry(1.9, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x2a1050,
        transparent: true,
        opacity: 0.07,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
      })
    )
    scene.add(aura)

    let frameId
    const clock = new THREE.Clock()

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      // Slow living rotation
      nebula.rotation.y = t * 0.0055
      nebula.rotation.z = Math.sin(t * 0.035) * 0.02

      // Stronger breathing
      const breath = 0.5 + Math.sin(t * 0.33) * 0.5
      core.scale.setScalar(0.92 + breath * 0.14)
      horizon.scale.setScalar(0.95 + breath * 0.12)
      photon.material.opacity = 0.15 + breath * 0.18
      aura.scale.setScalar(1 + breath * 0.11)
      aura.material.opacity = 0.04 + breath * 0.06

      // Subtle gravitational warping feel: pull near-center particles slightly
      // (lightweight approximation — full lensing shader later)
      const pos = nebula.geometry.attributes.position
      for (let i = 0; i < 400; i++) { // only a subset for performance
        const idx = (i * 31) % count
        const ix = idx * 3
        const x = pos.array[ix]
        const z = pos.array[ix + 2]
        const dist = Math.sqrt(x * x + z * z)
        if (dist < 2.8 && dist > 0.5) {
          const pull = 0.00015 * (1 / dist)
          pos.array[ix] -= x * pull
          pos.array[ix + 2] -= z * pull
        }
      }
      pos.needsUpdate = true

      // Born stars: fade in + gentle orbital drift
      const now = performance.now()
      for (const s of starsRef.current) {
        const age = (now - s.born) / 1000
        if (age < 2.8) {
          const fade = Math.min(1, age / 2.8)
          s.mesh.material.opacity = fade
          s.glow.material.opacity = fade * 0.7
        }

        // slow orbital motion around the core
        s.angle += s.orbitSpeed
        s.mesh.position.x = Math.cos(s.angle) * s.orbitRadius
        s.mesh.position.z = Math.sin(s.angle) * s.orbitRadius
        s.mesh.position.y = s.yBase + Math.sin(t * 0.4 + s.angle) * 0.15
      }

      // Camera gentle breathe
      camera.position.x = Math.sin(t * 0.045) * 0.25
      camera.position.y = 0.55 + Math.sin(t * 0.08) * 0.14
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

  // ========== SUBMIT ==========
  const handleSubmit = async (e) => {
    e.preventDefault()
    const text = (needsMore ? moreText : query).trim()
    if (!text) return

    // Visual star immediately
    const hue = 0.05 + Math.random() * 0.75
    const x = (Math.random() - 0.5) * 10
    const y = (Math.random() - 0.5) * 3.8
    const z = (Math.random() - 0.5) * 10
    birthStar({ x, y, z, hue })

    // Persist star to shared constellation
    fetch(`${API}/api/stars`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x, y, z, hue, text })
    }).catch(() => {})

    setResponse('A new star has been born.')
    setResponseKey(k => k + 1)
    setStatus('listening...')

    try {
      const res = await fetch(`${API}/api/intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })
      const data = await res.json()

      if (data.reply) {
        setResponse(data.reply)
        setResponseKey(k => k + 1)
      }
      setStatus(data.status || '')
      setNeedsMore(!!data.needsMore)
      setMorePrompt(data.morePrompt || '')
      if (!data.needsMore) {
        setQuery('')
        setMoreText('')
      }
    } catch {
      setStatus('')
      setQuery('')
    }
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
            disabled={needsMore}
          />

          {needsMore && (
            <textarea
              className="more-input"
              value={moreText}
              onChange={(e) => setMoreText(e.target.value)}
              placeholder={morePrompt || 'Provide more details...'}
              rows={4}
              autoFocus
            />
          )}

          <button type="submit" className="sr-only">Send</button>
        </form>

        <p className="response" key={responseKey}>{response}</p>
        {status && <p className="status">{status}</p>}
      </div>
    </div>
  )
}

export default App
