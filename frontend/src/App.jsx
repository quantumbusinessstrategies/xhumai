import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import './App.css'

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
  const gasRef = useRef([])

  // ========== COSMIC STAR BIRTH — stellar flash → collapse =====
  const birthStar = (data = {}) => {
    if (!sceneRef.current) return

    const hue = data.hue ?? (0.55 + Math.random() * 0.35) // cooler cosmic hues
    const finalSize = 0.028 + Math.random() * 0.035

    const geo = new THREE.SphereGeometry(1, 14, 14)
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue, 0.5, 0.85),
      transparent: true,
      opacity: 0
    })
    const star = new THREE.Mesh(geo, mat)
    star.scale.setScalar(0.008)

    // Wide random placement
    const x = data.x ?? (Math.random() - 0.5) * 16
    const y = data.y ?? (Math.random() - 0.5) * 7.5
    const z = data.z ?? (Math.random() - 0.5) * 16
    star.position.set(x, y, z)

    // Cosmic debris — thin stellar filaments, not candy bubbles
    const burstCount = 28
    const burstGeo = new THREE.BufferGeometry()
    const burstPos = new Float32Array(burstCount * 3)
    const burstVel = []
    for (let i = 0; i < burstCount; i++) {
      burstPos[i * 3] = 0
      burstPos[i * 3 + 1] = 0
      burstPos[i * 3 + 2] = 0
      // Prefer equatorial disk + some polar jets (more cosmic)
      const isJet = Math.random() < 0.18
      const speed = isJet ? 0.09 + Math.random() * 0.06 : 0.025 + Math.random() * 0.045
      const theta = Math.random() * Math.PI * 2
      const phi = isJet
        ? (Math.random() < 0.5 ? 0.15 : Math.PI - 0.15) + (Math.random() - 0.5) * 0.3
        : Math.acos(2 * Math.random() - 1) * 0.7 + Math.PI * 0.15
      burstVel.push({
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.cos(phi) * speed * (isJet ? 1.4 : 0.6),
        z: Math.sin(phi) * Math.sin(theta) * speed
      })
    }
    burstGeo.setAttribute('position', new THREE.BufferAttribute(burstPos, 3))
    const burstMat = new THREE.PointsMaterial({
      color: new THREE.Color().setHSL(hue, 0.35, 0.9),
      size: 0.035,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    })
    const burst = new THREE.Points(burstGeo, burstMat)
    star.add(burst)

    // Soft stellar glow (cool white-blue, not pink candy)
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(240,245,255,0.95)')
    g.addColorStop(0.25, 'rgba(180,200,255,0.35)')
    g.addColorStop(0.55, 'rgba(120,140,220,0.12)')
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
    glow.scale.set(0.12, 0.12, 1)
    star.add(glow)

    sceneRef.current.add(star)

    starsRef.current.push({
      mesh: star,
      glow,
      burst,
      burstVel,
      born: performance.now(),
      finalSize,
      orbitSpeed: 0.00015 + Math.random() * 0.0005,
      orbitRadius: Math.sqrt(x * x + z * z),
      angle: Math.atan2(z, x),
      yBase: y
    })
  }

  useEffect(() => {
    fetch(`${API}/api/stars`)
      .then(r => r.json())
      .then(data => {
        if (data.stars && Array.isArray(data.stars)) {
          data.stars.forEach(s => birthStar(s))
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    let width = window.innerWidth
    let height = window.innerHeight
    const DPR = Math.min(window.devicePixelRatio, 1.75)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x05021a)
    scene.fog = new THREE.FogExp2(0x05021a, 0.0105)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 200)
    camera.position.set(0, 0.5, 8.5)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(DPR)
    container.appendChild(renderer.domElement)

    // Main nebula
    const count = 12000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const u = Math.random()
      const r = Math.pow(u, 1.7) * 13
      const theta = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * (1.4 + r * 0.28)

      positions[i3] = Math.cos(theta) * r
      positions[i3 + 1] = y
      positions[i3 + 2] = Math.sin(theta) * r

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
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    })

    const nebula = new THREE.Points(geo, mat)
    scene.add(nebula)

    // Soft gas clouds
    const gasClouds = []
    for (let c = 0; c < 5; c++) {
      const gCount = 800
      const gPos = new Float32Array(gCount * 3)
      const gCol = new Float32Array(gCount * 3)
      const baseHue = Math.random()

      for (let i = 0; i < gCount; i++) {
        const i3 = i * 3
        gPos[i3] = (Math.random() - 0.5) * 22
        gPos[i3 + 1] = (Math.random() - 0.5) * 10
        gPos[i3 + 2] = (Math.random() - 0.5) * 22
        const h = (baseHue + Math.random() * 0.15) % 1
        const col = new THREE.Color().setHSL(h, 0.4, 0.55)
        gCol[i3] = col.r
        gCol[i3 + 1] = col.g
        gCol[i3 + 2] = col.b
      }

      const gGeo = new THREE.BufferGeometry()
      gGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3))
      gGeo.setAttribute('color', new THREE.BufferAttribute(gCol, 3))

      const gMat = new THREE.PointsMaterial({
        size: 0.12,
        vertexColors: true,
        transparent: true,
        opacity: 0.035 + Math.random() * 0.025,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
      })

      const cloud = new THREE.Points(gGeo, gMat)
      cloud.userData = {
        rotY: (Math.random() - 0.5) * 0.004,
        rotZ: (Math.random() - 0.5) * 0.002,
        drift: 0.002 + Math.random() * 0.003
      }
      scene.add(cloud)
      gasClouds.push(cloud)
    }
    gasRef.current = gasClouds

    // Black hole core
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 48, 48),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    )
    scene.add(core)

    const horizon = new THREE.Mesh(
      new THREE.RingGeometry(0.38, 0.55, 64),
      new THREE.MeshBasicMaterial({
        color: 0x4a2080,
        transparent: true,
        opacity: 0.32,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
    )
    horizon.rotation.x = Math.PI / 2.1
    scene.add(horizon)

    const photon = new THREE.Mesh(
      new THREE.RingGeometry(0.52, 0.61, 64),
      new THREE.MeshBasicMaterial({
        color: 0xc8d8ff,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
    )
    photon.rotation.x = Math.PI / 2.15
    scene.add(photon)

    const aura = new THREE.Mesh(
      new THREE.SphereGeometry(1.7, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x2a1050,
        transparent: true,
        opacity: 0.065,
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
      const now = performance.now()

      nebula.rotation.y = t * 0.0055
      nebula.rotation.z = Math.sin(t * 0.035) * 0.02

      for (const cloud of gasRef.current) {
        cloud.rotation.y += cloud.userData.rotY
        cloud.rotation.z += cloud.userData.rotZ
        cloud.position.x = Math.sin(t * cloud.userData.drift) * 1.2
        cloud.position.y = Math.cos(t * cloud.userData.drift * 0.7) * 0.6
      }

      const breath = 0.5 + Math.sin(t * 0.33) * 0.5
      core.scale.setScalar(0.92 + breath * 0.13)
      horizon.scale.setScalar(0.95 + breath * 0.11)
      photon.material.opacity = 0.12 + breath * 0.14
      aura.scale.setScalar(1 + breath * 0.1)
      aura.material.opacity = 0.04 + breath * 0.05

      const pos = nebula.geometry.attributes.position
      for (let i = 0; i < 350; i++) {
        const idx = (i * 37) % count
        const ix = idx * 3
        const x = pos.array[ix]
        const z = pos.array[ix + 2]
        const dist = Math.sqrt(x * x + z * z)
        if (dist < 2.5 && dist > 0.45) {
          const pull = 0.00012 * (1 / dist)
          pos.array[ix] -= x * pull
          pos.array[ix + 2] -= z * pull
        }
      }
      pos.needsUpdate = true

      // Cosmic birth lifecycle
      for (const s of starsRef.current) {
        const age = (now - s.born) / 1000

        if (age < 0.9) {
          // Flash expand — bright stellar ignition
          const p = age / 0.9
          const ease = 1 - Math.pow(1 - p, 2.5)
          const scale = 0.008 + ease * (s.finalSize * 5.5)
          s.mesh.scale.setScalar(scale)
          s.mesh.material.opacity = Math.min(1, p * 1.6)
          s.glow.material.opacity = Math.min(0.9, p * 1.4)
          s.glow.scale.setScalar(0.12 + ease * 2.4)

          if (s.burst) {
            const arr = s.burst.geometry.attributes.position.array
            for (let i = 0; i < s.burstVel.length; i++) {
              arr[i * 3] += s.burstVel[i].x
              arr[i * 3 + 1] += s.burstVel[i].y
              arr[i * 3 + 2] += s.burstVel[i].z
              s.burstVel[i].x *= 0.97
              s.burstVel[i].y *= 0.97
              s.burstVel[i].z *= 0.97
            }
            s.burst.geometry.attributes.position.needsUpdate = true
            s.burst.material.opacity = 0.75 * (1 - p * 0.7)
          }
        } else if (age < 2.8) {
          // Collapse into stable star
          const p = (age - 0.9) / 1.9
          const ease = p * p * (3 - 2 * p)
          const scale = s.finalSize * 5.5 * (1 - ease) + s.finalSize * ease
          s.mesh.scale.setScalar(scale)
          s.mesh.material.opacity = 1
          s.glow.material.opacity = 0.9 - ease * 0.35
          s.glow.scale.setScalar(2.5 - ease * 1.85)

          if (s.burst) {
            s.burst.material.opacity = Math.max(0, 0.25 * (1 - p))
          }
        } else {
          // Settled
          s.mesh.scale.setScalar(s.finalSize)
          s.mesh.material.opacity = 1
          s.glow.material.opacity = 0.5
          s.glow.scale.setScalar(0.6)
          if (s.burst && s.burst.parent) {
            s.mesh.remove(s.burst)
            s.burst.geometry.dispose()
            s.burst.material.dispose()
            s.burst = null
          }

          s.angle += s.orbitSpeed
          s.mesh.position.x = Math.cos(s.angle) * s.orbitRadius
          s.mesh.position.z = Math.sin(s.angle) * s.orbitRadius
          s.mesh.position.y = s.yBase + Math.sin(t * 0.35 + s.angle) * 0.12
        }
      }

      camera.position.x = Math.sin(t * 0.045) * 0.22
      camera.position.y = 0.5 + Math.sin(t * 0.08) * 0.12
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const text = (needsMore ? moreText : query).trim()
    if (!text) return

    const hue = 0.55 + Math.random() * 0.35
    const x = (Math.random() - 0.5) * 15
    const y = (Math.random() - 0.5) * 7
    const z = (Math.random() - 0.5) * 15
    birthStar({ x, y, z, hue })

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
        <div className="header-block">
          <h1 className="logo">XhumAI</h1>
          <p className="tagline">WORK LESS. LIVE MORE.</p>
        </div>

        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Speak into the field..."
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

        <div className="footer-block">
          <p className="response" key={responseKey}>{response}</p>
          {status && <p className="status">{status}</p>}
        </div>
      </div>
    </div>
  )
}

export default App
