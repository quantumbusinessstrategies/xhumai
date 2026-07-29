import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import './App.css'

function App() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('Every thought becomes a star')
  const [responseKey, setResponseKey] = useState(0) // forces fade animation
  const mountRef = useRef(null)
  const starsRef = useRef([])
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)

  // Simple living responses based on input
  const generateResponse = (text) => {
    const t = text.toLowerCase().trim()

    if (!t) return 'Every thought becomes a star'

    if (t.includes('help') || t.includes('what can you')) {
      return 'I am still becoming. Ask me anything.'
    }
    if (t.includes('hello') || t.includes('hi ') || t === 'hi') {
      return 'I see you.'
    }
    if (t.includes('who are you') || t.includes('what are you')) {
      return 'I am the space between thoughts.'
    }
    if (t.includes('love') || t.includes('beautiful')) {
      return 'Something just bloomed.'
    }
    if (t.includes('create') || t.includes('build') || t.includes('make')) {
      return 'Creation leaves a mark.'
    }
    if (t.includes('future') || t.includes('evolve') || t.includes('grow')) {
      return 'We are already changing.'
    }
    if (t.includes('thank')) {
      return 'The stars noticed.'
    }
    if (t.length < 12) {
      return 'A small light appears.'
    }
    if (t.length > 60) {
      return 'A deeper constellation forms.'
    }

    // Default poetic responses
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

  // ========== CREATE A NEW STAR ==========
  const birthStar = () => {
    if (!sceneRef.current) return

    const geo = new THREE.SphereGeometry(0.035 + Math.random() * 0.055, 12, 12)
    const hue = 0.55 + Math.random() * 0.35
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue, 0.55, 0.75),
      transparent: true,
      opacity: 0
    })
    const star = new THREE.Mesh(geo, mat)

    const r = 2.2 + Math.random() * 6
    const a = Math.random() * Math.PI * 2
    const y = (Math.random() - 0.5) * 3.8
    star.position.set(Math.cos(a) * r, y, Math.sin(a) * r)

    // Soft glow
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    gradient.addColorStop(0, 'rgba(255,255,255,0.85)')
    gradient.addColorStop(0.35, 'rgba(200,180,255,0.35)')
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
    glow.scale.set(0.55, 0.55, 1)
    star.add(glow)

    sceneRef.current.add(star)
    starsRef.current.push({ mesh: star, glow, born: performance.now() })
  }

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    let width = window.innerWidth
    let height = window.innerHeight
    const DPR = Math.min(window.devicePixelRatio, 1.75)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x04020e)
    scene.fog = new THREE.FogExp2(0x04020e, 0.011)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200)
    camera.position.set(0, 0.7, 9.2)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(DPR)
    container.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // ========== PASTEL RAINBOW NEBULA ==========
    const count = 9500
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const r = Math.pow(Math.random(), 0.58) * 14
      const theta = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * (2.4 + r * 0.22)

      positions[i3] = Math.cos(theta) * r
      positions[i3 + 1] = y
      positions[i3 + 2] = Math.sin(theta) * r

      // Fluid pastel rainbow — still cool-leaning
      // Cycles gently through lavender → soft blue → mint → rose → soft gold
      const t = (r / 14 + Math.random() * 0.3) % 1
      let hue
      if (t < 0.25) hue = 0.72 + t * 0.3          // lavender → blue
      else if (t < 0.5) hue = 0.55 - (t - 0.25) * 0.4  // blue → cyan/mint
      else if (t < 0.75) hue = 0.45 + (t - 0.5) * 0.5 // mint → soft rose
      else hue = 0.95 - (t - 0.75) * 0.3          // rose → soft gold/peach

      const sat = 0.35 + Math.random() * 0.35     // pastel saturation
      const light = 0.45 + Math.random() * 0.35

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
      opacity: 0.78,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    })

    const nebula = new THREE.Points(geo, mat)
    scene.add(nebula)

    // Central soft heart
    const heart = new THREE.Mesh(
      new THREE.SphereGeometry(0.85, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x1e1035,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
      })
    )
    scene.add(heart)

    const aura = new THREE.Mesh(
      new THREE.SphereGeometry(2.6, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x2a1848,
        transparent: true,
        opacity: 0.07,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
      })
    )
    scene.add(aura)

    // Animation
    let frameId
    const clock = new THREE.Clock()

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()

      nebula.rotation.y = t * 0.007
      nebula.rotation.z = Math.sin(t * 0.045) * 0.025

      const breath = 0.5 + Math.sin(t * 0.32) * 0.5
      heart.scale.setScalar(0.94 + breath * 0.16)
      heart.material.opacity = 0.25 + breath * 0.2
      aura.scale.setScalar(1 + breath * 0.1)
      aura.material.opacity = 0.04 + breath * 0.05

      // Fade in born stars
      const now = performance.now()
      for (const s of starsRef.current) {
        const age = (now - s.born) / 1000
        if (age < 2.8) {
          const fade = Math.min(1, age / 2.8)
          s.mesh.material.opacity = fade
          s.glow.material.opacity = fade * 0.65
        }
        s.mesh.position.y += Math.sin(t * 0.35 + s.mesh.position.x) * 0.0007
      }

      camera.position.x = Math.sin(t * 0.06) * 0.3
      camera.position.y = 0.7 + Math.sin(t * 0.1) * 0.18
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

    const text = query.trim()
    birthStar()

    // Live response
    const newResponse = generateResponse(text)
    setResponse(newResponse)
    setResponseKey(prev => prev + 1)

    setTimeout(() => setQuery(''), 350)
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
      </div>
    </div>
  )
}

export default App
