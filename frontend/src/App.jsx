import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import './App.css'

const API = 'http://localhost:3001' // later becomes quantimeta / xhumai API

function App() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('Every thought becomes a star')
  const [responseKey, setResponseKey] = useState(0)
  const [status, setStatus] = useState('') // subtle status line
  const mountRef = useRef(null)
  const starsRef = useRef([])
  const sceneRef = useRef(null)

  // ========== LIVING RESPONSES ==========
  const generateResponse = (text, backendReply = null) => {
    if (backendReply) return backendReply

    const t = text.toLowerCase().trim()
    if (!t) return 'Every thought becomes a star'

    if (t.includes('help') || t.includes('what can you')) return 'I am still becoming. Ask me anything.'
    if (t.includes('hello') || t.includes('hi')) return 'I see you.'
    if (t.includes('who are you') || t.includes('what are you')) return 'I am the space between thoughts.'
    if (t.includes('love') || t.includes('beautiful')) return 'Something just bloomed.'
    if (t.includes('create') || t.includes('build') || t.includes('make')) return 'Creation leaves a mark.'
    if (t.includes('future') || t.includes('evolve')) return 'We are already changing.'
    if (t.includes('thank')) return 'The stars noticed.'

    const defaults = [
      'A new star has been born.',
      'The field shifts slightly.',
      'Something listened.',
      'The nebula remembers this.',
      'One more light in the dark.',
      'It has been received.',
      'The pattern grows.',
      'A quiet change begins.'
    ]
    return defaults[Math.floor(Math.random() * defaults.length)]
  }

  // ========== BIRTH A STAR (visual) ==========
  const birthStar = (seed = Math.random()) => {
    if (!sceneRef.current) return

    const geo = new THREE.SphereGeometry(0.038 + Math.random() * 0.05, 12, 12)
    const hue = 0.08 + Math.random() * 0.75 // warm-leaning pastel range
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue, 0.55, 0.78),
      transparent: true,
      opacity: 0
    })
    const star = new THREE.Mesh(geo, mat)

    const r = 2.0 + Math.random() * 6.5
    const a = Math.random() * Math.PI * 2
    const y = (Math.random() - 0.5) * 4.0
    star.position.set(Math.cos(a) * r, y, Math.sin(a) * r)

    // Glow
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,255,255,0.9)')
    g.addColorStop(0.3, 'rgba(255,200,230,0.35)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 64)

    const glowMat = new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(canvas),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    const glow = new THREE.Sprite(glowMat)
    glow.scale.set(0.6, 0.6, 1)
    star.add(glow)

    sceneRef.current.add(star)
    starsRef.current.push({ mesh: star, glow, born: performance.now() })
  }

  // ========== THREE.JS SCENE ==========
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

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200)
    camera.position.set(0, 0.6, 9.0)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(DPR)
    container.appendChild(renderer.domElement)

    // Brighter pastel rainbow nebula
    const count = 10000
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const r = Math.pow(Math.random(), 0.55) * 14.5
      const theta = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * (2.6 + r * 0.24)

      positions[i3] = Math.cos(theta) * r
      positions[i3 + 1] = y
      positions[i3 + 2] = Math.sin(theta) * r

      // Brighter warm-leaning pastel spectrum
      const t = (r / 14.5 + Math.random() * 0.4) % 1
      let hue
      if (t < 0.2) hue = 0.85 + t * 0.4          // soft rose / peach
      else if (t < 0.4) hue = 0.12 + (t - 0.2) * 0.5  // warm gold / soft coral
      else if (t < 0.6) hue = 0.45 + (t - 0.4) * 0.4  // soft mint / aqua
      else if (t < 0.8) hue = 0.62 + (t - 0.6) * 0.35 // lavender / periwinkle
      else hue = 0.78 + (t - 0.8) * 0.3              // soft violet / pink

      const sat = 0.42 + Math.random() * 0.38
      const light = 0.52 + Math.random() * 0.32      // noticeably brighter

      const c = new THREE.Color().setHSL(hue, sat, light)
      colors[i3] = c.r
      colors[i3 + 1] = c.g
      colors[i3 + 2] = c.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    })

    const nebula = new THREE.Points(geo, mat)
    scene.add(nebula)

    // Soft central heart
    const heart = new THREE.Mesh(
      new THREE.SphereGeometry(0.82, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x2a1848,
        transparent: true,
        opacity: 0.38,
        blending: THREE.AdditiveBlending
      })
    )
    scene.add(heart)

    const aura = new THREE.Mesh(
      new THREE.SphereGeometry(2.5, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x3a2060,
        transparent: true,
        opacity: 0.08,
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

      nebula.rotation.y = t * 0.0065
      nebula.rotation.z = Math.sin(t * 0.04) * 0.022

      const breath = 0.5 + Math.sin(t * 0.28) * 0.5
      heart.scale.setScalar(0.93 + breath * 0.15)
      heart.material.opacity = 0.28 + breath * 0.18
      aura.scale.setScalar(1 + breath * 0.09)
      aura.material.opacity = 0.05 + breath * 0.05

      // Born stars fade in + gentle drift
      const now = performance.now()
      for (const s of starsRef.current) {
        const age = (now - s.born) / 1000
        if (age < 3) {
          const fade = Math.min(1, age / 3)
          s.mesh.material.opacity = fade
          s.glow.material.opacity = fade * 0.7
        }
        s.mesh.position.y += Math.sin(t * 0.3 + s.mesh.position.x) * 0.0006
      }

      camera.position.x = Math.sin(t * 0.05) * 0.28
      camera.position.y = 0.6 + Math.sin(t * 0.09) * 0.16
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
    if (!query.trim()) return

    const text = query.trim()
    birthStar()

    // Optimistic living response
    setResponse(generateResponse(text))
    setResponseKey(k => k + 1)
    setStatus('listening...')

    // Send intent to backend (foundation for real utilities + shared state)
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
      if (data.status) setStatus(data.status)
      else setStatus('')
    } catch {
      // Backend not available yet — stay in living visual mode
      setStatus('')
    }

    setTimeout(() => setQuery(''), 300)
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

        <p className="response" key={responseKey}>{response}</p>
        {status && <p className="status">{status}</p>}
      </div>
    </div>
  )
}

export default App
