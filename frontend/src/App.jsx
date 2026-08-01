import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import './App.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// ---- Shape textures (canvas) ----
function makeShapeTexture(drawFn, size = 64) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, size, size)
  drawFn(ctx, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function drawCircle(ctx, s) {
  const c = s / 2
  const g = ctx.createRadialGradient(c, c, 0, c, c, c * 0.9)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.5, 'rgba(255,255,255,0.7)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(c, c, c * 0.85, 0, Math.PI * 2)
  ctx.fill()
}

function drawSquare(ctx, s) {
  const pad = s * 0.18
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.fillRect(pad, pad, s - pad * 2, s - pad * 2)
  // soft edge
  ctx.globalCompositeOperation = 'destination-in'
  const g = ctx.createRadialGradient(s/2, s/2, s*0.2, s/2, s/2, s*0.55)
  g.addColorStop(0, 'rgba(0,0,0,1)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
}

function drawPolygon(ctx, s, sides, pointy = false) {
  const c = s / 2
  const r = s * 0.38
  ctx.beginPath()
  for (let i = 0; i < sides; i++) {
    const a = (i / sides) * Math.PI * 2 - Math.PI / 2 + (pointy ? 0 : Math.PI / sides)
    const x = c + Math.cos(a) * r
    const y = c + Math.sin(a) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.fill()
  ctx.globalCompositeOperation = 'destination-in'
  const g = ctx.createRadialGradient(c, c, r * 0.3, c, c, r * 1.2)
  g.addColorStop(0, 'rgba(0,0,0,1)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
}

function drawStar(ctx, s, points) {
  const c = s / 2
  const outer = s * 0.4
  const inner = s * 0.18
  ctx.beginPath()
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2
    const x = c + Math.cos(a) * r
    const y = c + Math.sin(a) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.fill()
  ctx.globalCompositeOperation = 'destination-in'
  const g = ctx.createRadialGradient(c, c, inner, c, c, outer * 1.15)
  g.addColorStop(0, 'rgba(0,0,0,1)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
}

function App() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('Every thought becomes a star')
  const [responseKey, setResponseKey] = useState(0)
  const [status, setStatus] = useState('')
  const [needsMore, setNeedsMore] = useState(false)
  const [moreText, setMoreText] = useState('')
  const [morePrompt, setMorePrompt] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isActivating, setIsActivating] = useState(false)

  const mountRef = useRef(null)
  const starsRef = useRef([])
  const sceneRef = useRef(null)
  const gasRef = useRef([])
  const layersRef = useRef([]) // shape point layers
  const specialsRef = useRef([]) // mini BH, wireframes, etc.
  const typingRef = useRef(0)
  const activateRef = useRef(0)
  const typingTimeout = useRef(null)

  const birthStar = (data = {}) => {
    if (!sceneRef.current) return

    const hue = data.hue ?? Math.random()
    const finalSize = 0.06 + Math.random() * 0.05

    const starGeo = new THREE.SphereGeometry(1, 16, 16)
    const starMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue, 0.55, 0.88),
      transparent: true,
      opacity: 0
    })
    const star = new THREE.Mesh(starGeo, starMat)
    star.scale.setScalar(0.02)

    const x = data.x ?? (Math.random() - 0.5) * 9
    const y = data.y ?? (Math.random() - 0.5) * 4.5
    const z = data.z ?? (Math.random() - 0.5) * 7 - 1
    star.position.set(x, y, z)

    const sparkCount = 64
    const sparkGeo = new THREE.BufferGeometry()
    const sparkPos = new Float32Array(sparkCount * 3)
    const sparkVel = []
    for (let i = 0; i < sparkCount; i++) {
      sparkPos[i * 3] = 0
      sparkPos[i * 3 + 1] = 0
      sparkPos[i * 3 + 2] = 0
      const speed = 0.12 + Math.random() * 0.18
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      sparkVel.push({
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.sin(phi) * Math.sin(theta) * speed,
        z: Math.cos(phi) * speed,
        drag: 0.97 + Math.random() * 0.02
      })
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3))
    const sparkMat = new THREE.PointsMaterial({
      color: new THREE.Color().setHSL(hue, 0.55, 0.95),
      size: 0.028,
      transparent: true,
      opacity: 1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    })
    const sparks = new THREE.Points(sparkGeo, sparkMat)
    star.add(sparks)

    const cloudCount = 100
    const cloudGeo = new THREE.BufferGeometry()
    const cloudPos = new Float32Array(cloudCount * 3)
    const cloudVel = []
    for (let i = 0; i < cloudCount; i++) {
      cloudPos[i * 3] = 0
      cloudPos[i * 3 + 1] = 0
      cloudPos[i * 3 + 2] = 0
      const speed = 0.05 + Math.random() * 0.09
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      cloudVel.push({
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.sin(phi) * Math.sin(theta) * speed,
        z: Math.cos(phi) * speed,
        drag: 0.98 + Math.random() * 0.012
      })
    }
    cloudGeo.setAttribute('position', new THREE.BufferAttribute(cloudPos, 3))
    const cloudMat = new THREE.PointsMaterial({
      color: new THREE.Color().setHSL(hue, 0.4, 0.72),
      size: 0.06,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    })
    const cloud = new THREE.Points(cloudGeo, cloudMat)
    star.add(cloud)

    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.2, 'rgba(200,230,255,0.5)')
    g.addColorStop(0.5, 'rgba(140,180,255,0.12)')
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
    glow.scale.set(0.2, 0.2, 1)
    star.add(glow)

    sceneRef.current.add(star)

    activateRef.current = performance.now()
    setIsActivating(true)
    setTimeout(() => setIsActivating(false), 1600)

    // Orbital state with possible gravitational warp
    const orbitRadius = Math.sqrt(x * x + z * z)
    starsRef.current.push({
      mesh: star,
      glow,
      sparks,
      sparkVel,
      cloud,
      cloudVel,
      born: performance.now(),
      finalSize,
      orbitSpeed: 0.00012 + Math.random() * 0.0004,
      orbitRadius,
      angle: Math.atan2(z, x),
      yBase: y,
      warping: false,
      warpT: 0,
      warpFrom: null,
      warpTo: null
    })
  }

  useEffect(() => {
    const t = setTimeout(() => {
      fetch(`${API}/api/stars`)
        .then(r => r.json())
        .then(data => {
          if (data.stars && Array.isArray(data.stars)) {
            data.stars.forEach(s => birthStar(s))
          }
        })
        .catch(() => {})
    }, 400)
    return () => clearTimeout(t)
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

    // Shape textures
    const texCircle = makeShapeTexture(drawCircle)
    const texSquare = makeShapeTexture(drawSquare)
    const texHex = makeShapeTexture((ctx, s) => drawPolygon(ctx, s, 6))
    const texPent = makeShapeTexture((ctx, s) => drawPolygon(ctx, s, 5))
    const texStar6 = makeShapeTexture((ctx, s) => drawStar(ctx, s, 6))
    const texStar7 = makeShapeTexture((ctx, s) => drawStar(ctx, s, 7))

    // Distribution of 2D shape layers (of ~11k point particles)
    // square 30%, circle 30%, hex 15%, pent 5%, star6 5%, star7 4% ≈ 89%
    // remaining ~11% reserved conceptually for specials (we spawn fewer 3D specials)
    const layerDefs = [
      { tex: texSquare, count: 3300, size: 0.055 },
      { tex: texCircle, count: 3300, size: 0.05 },
      { tex: texHex, count: 1650, size: 0.052 },
      { tex: texPent, count: 550, size: 0.05 },
      { tex: texStar6, count: 550, size: 0.058 },
      { tex: texStar7, count: 440, size: 0.056 }
    ]

    const layers = []
    const baseOpacity = 0.9 // ~10% more opaque than prior ~0.8

    for (const def of layerDefs) {
      const positions = new Float32Array(def.count * 3)
      const colors = new Float32Array(def.count * 3)
      const basePositions = new Float32Array(def.count * 3)
      const hues = new Float32Array(def.count)

      for (let i = 0; i < def.count; i++) {
        const i3 = i * 3
        const u = Math.random()
        const r = Math.pow(u, 1.7) * 13
        const theta = Math.random() * Math.PI * 2
        const y = (Math.random() - 0.5) * (1.4 + r * 0.28)

        positions[i3] = Math.cos(theta) * r
        positions[i3 + 1] = y
        positions[i3 + 2] = Math.sin(theta) * r
        basePositions[i3] = positions[i3]
        basePositions[i3 + 1] = y
        basePositions[i3 + 2] = positions[i3 + 2]

        hues[i] = Math.random()
        const c = new THREE.Color().setHSL(hues[i], 0.45 + Math.random() * 0.3, 0.55 + Math.random() * 0.28)
        colors[i3] = c.r
        colors[i3 + 1] = c.g
        colors[i3 + 2] = c.b
      }

      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

      const mat = new THREE.PointsMaterial({
        size: def.size,
        map: def.tex,
        vertexColors: true,
        transparent: true,
        opacity: baseOpacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
        alphaTest: 0.01
      })

      const pts = new THREE.Points(geo, mat)
      scene.add(pts)
      layers.push({ pts, geo, mat, hues, basePositions, count: def.count })
    }
    layersRef.current = layers

    // ===== SPECIAL 3D PARTICLES (sparse) =====
    const specials = []

    // Mini black holes ~5% visual weight but sparse count for perf (~40)
    for (let i = 0; i < 40; i++) {
      const r = 2 + Math.random() * 10
      const theta = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * 3.5
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.04 + Math.random() * 0.04, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0x000000 })
      )
      mesh.position.set(Math.cos(theta) * r, y, Math.sin(theta) * r)
      // dark halo
      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.08 + Math.random() * 0.05, 10, 10),
        new THREE.MeshBasicMaterial({
          color: 0x0a0618,
          transparent: true,
          opacity: 0.5,
          blending: THREE.NormalBlending
        })
      )
      mesh.add(halo)
      scene.add(mesh)
      specials.push({
        mesh,
        type: 'minibh',
        orbitSpeed: 0.00008 + Math.random() * 0.00025,
        orbitRadius: r,
        angle: theta,
        yBase: y
      })
    }

    // Wireframe cubes ~2% → ~25
    for (let i = 0; i < 25; i++) {
      const r = 2.5 + Math.random() * 9
      const theta = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * 3.2
      const mesh = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(0.08, 0.08, 0.08)),
        new THREE.LineBasicMaterial({
          color: new THREE.Color().setHSL(Math.random(), 0.5, 0.7),
          transparent: true,
          opacity: 0.7
        })
      )
      mesh.position.set(Math.cos(theta) * r, y, Math.sin(theta) * r)
      scene.add(mesh)
      specials.push({
        mesh,
        type: 'cube',
        orbitSpeed: 0.0001 + Math.random() * 0.0003,
        orbitRadius: r,
        angle: theta,
        yBase: y,
        spin: 0.005 + Math.random() * 0.01
      })
    }

    // Icosahedrons ~2% → ~20
    for (let i = 0; i < 20; i++) {
      const r = 2.5 + Math.random() * 9
      const theta = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * 3
      const mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.05, 0),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(Math.random(), 0.5, 0.65),
          transparent: true,
          opacity: 0.75,
          wireframe: Math.random() > 0.5
        })
      )
      mesh.position.set(Math.cos(theta) * r, y, Math.sin(theta) * r)
      scene.add(mesh)
      specials.push({
        mesh,
        type: 'ico',
        orbitSpeed: 0.0001 + Math.random() * 0.0003,
        orbitRadius: r,
        angle: theta,
        yBase: y,
        spin: 0.004 + Math.random() * 0.008
      })
    }

    // Dodecahedrons ~1% → ~12
    for (let i = 0; i < 12; i++) {
      const r = 3 + Math.random() * 8
      const theta = Math.random() * Math.PI * 2
      const y = (Math.random() - 0.5) * 2.8
      const mesh = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.055, 0),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(Math.random(), 0.5, 0.65),
          transparent: true,
          opacity: 0.7,
          wireframe: true
        })
      )
      mesh.position.set(Math.cos(theta) * r, y, Math.sin(theta) * r)
      scene.add(mesh)
      specials.push({
        mesh,
        type: 'dodeca',
        orbitSpeed: 0.00008 + Math.random() * 0.00025,
        orbitRadius: r,
        angle: theta,
        yBase: y,
        spin: 0.003 + Math.random() * 0.007
      })
    }

    specialsRef.current = specials

    // Translucent rainbow freeform clouds
    const gasClouds = []
    const cloudHues = [0.0, 0.12, 0.28, 0.45, 0.58, 0.72, 0.88]
    for (let c = 0; c < 7; c++) {
      const gCount = 900
      const gPos = new Float32Array(gCount * 3)
      const gCol = new Float32Array(gCount * 3)
      const baseHue = cloudHues[c]

      for (let i = 0; i < gCount; i++) {
        const i3 = i * 3
        const spread = 8 + Math.random() * 14
        gPos[i3] = (Math.random() - 0.5) * spread + (Math.random() - 0.5) * 6
        gPos[i3 + 1] = (Math.random() - 0.5) * (spread * 0.45)
        gPos[i3 + 2] = (Math.random() - 0.5) * spread + (Math.random() - 0.5) * 6
        const h = (baseHue + (Math.random() - 0.5) * 0.08 + 1) % 1
        const col = new THREE.Color().setHSL(h, 0.45 + Math.random() * 0.25, 0.55 + Math.random() * 0.2)
        gCol[i3] = col.r
        gCol[i3 + 1] = col.g
        gCol[i3 + 2] = col.b
      }

      const gGeo = new THREE.BufferGeometry()
      gGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3))
      gGeo.setAttribute('color', new THREE.BufferAttribute(gCol, 3))

      const gMat = new THREE.PointsMaterial({
        size: 0.14 + Math.random() * 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.03 + Math.random() * 0.025,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
      })

      const cloud = new THREE.Points(gGeo, gMat)
      cloud.userData = {
        rotY: (Math.random() - 0.5) * 0.003,
        rotZ: (Math.random() - 0.5) * 0.0015,
        drift: 0.0015 + Math.random() * 0.0025,
        phase: Math.random() * Math.PI * 2
      }
      scene.add(cloud)
      gasClouds.push(cloud)
    }
    gasRef.current = gasClouds

    // Core black hole
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
    let smoothTyping = 0

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      const now = performance.now()

      // Rainbow color drift on all shape layers
      for (const layer of layersRef.current) {
        layer.pts.rotation.y = t * 0.0055
        layer.pts.rotation.z = Math.sin(t * 0.035) * 0.02
        const cols = layer.geo.attributes.color
        for (let i = 0; i < layer.count; i++) {
          layer.hues[i] = (layer.hues[i] + 0.00015) % 1 // slow rainbow shift
          const c = new THREE.Color().setHSL(layer.hues[i], 0.5, 0.62)
          cols.array[i * 3] = c.r
          cols.array[i * 3 + 1] = c.g
          cols.array[i * 3 + 2] = c.b
        }
        cols.needsUpdate = true

        // gentle gravity + typing pull
        const pos = layer.geo.attributes.position
        const targetTyping = typingRef.current
        for (let i = 0; i < Math.min(200, layer.count); i++) {
          const idx = (i * 41) % layer.count
          const ix = idx * 3
          const x = pos.array[ix]
          const z = pos.array[ix + 2]
          const dist = Math.sqrt(x * x + z * z)
          if (dist < 3.0 && dist > 0.45) {
            const pull = 0.00008 / dist + smoothTyping * 0.00012 / dist
            pos.array[ix] -= x * pull
            pos.array[ix + 2] -= z * pull
          }
          if (smoothTyping < 0.1 && dist > 0.5) {
            pos.array[ix] += (layer.basePositions[ix] - pos.array[ix]) * 0.001
            pos.array[ix + 1] += (layer.basePositions[ix + 1] - pos.array[ix + 1]) * 0.001
            pos.array[ix + 2] += (layer.basePositions[ix + 2] - pos.array[ix + 2]) * 0.001
          }
        }
        pos.needsUpdate = true
      }

      for (const cloud of gasRef.current) {
        cloud.rotation.y += cloud.userData.rotY
        cloud.rotation.z += cloud.userData.rotZ
        cloud.position.x = Math.sin(t * cloud.userData.drift + cloud.userData.phase) * 1.4
        cloud.position.y = Math.cos(t * cloud.userData.drift * 0.7 + cloud.userData.phase) * 0.7
      }

      // Specials orbit + spin
      for (const s of specialsRef.current) {
        s.angle += s.orbitSpeed
        s.mesh.position.x = Math.cos(s.angle) * s.orbitRadius
        s.mesh.position.z = Math.sin(s.angle) * s.orbitRadius
        s.mesh.position.y = s.yBase + Math.sin(t * 0.3 + s.angle) * 0.1
        if (s.spin) {
          s.mesh.rotation.x += s.spin
          s.mesh.rotation.y += s.spin * 0.7
        }
      }

      const targetTyping = typingRef.current
      smoothTyping += (targetTyping - smoothTyping) * 0.04

      const breath = 0.5 + Math.sin(t * 0.28) * 0.5
      const actAge = (now - activateRef.current) / 1000
      const actPulse = actAge < 1.6 ? Math.sin((actAge / 1.6) * Math.PI) * 0.55 : 0

      core.scale.setScalar(0.94 + breath * 0.1 + smoothTyping * 0.035 + actPulse * 0.05)
      horizon.scale.setScalar(0.96 + breath * 0.08 + smoothTyping * 0.025 + actPulse * 0.04)

      if (actPulse > 0.08) {
        photon.material.color.setHex(0x40d8ff)
        photon.material.opacity = 0.14 + actPulse * 0.28 + breath * 0.08
      } else if (smoothTyping > 0.15) {
        photon.material.color.setHex(0xb0d4ff)
        photon.material.opacity = 0.16 + breath * 0.1 + smoothTyping * 0.06
      } else {
        photon.material.color.setHex(0xc8d8ff)
        photon.material.opacity = 0.12 + breath * 0.1
      }

      aura.scale.setScalar(1 + breath * 0.08 + smoothTyping * 0.025 + actPulse * 0.04)
      aura.material.opacity = 0.04 + breath * 0.04 + smoothTyping * 0.015 + actPulse * 0.03

      // Born stars + gravitational warp near core
      for (const s of starsRef.current) {
        const age = (now - s.born) / 1000

        if (age < 1.8) {
          const p = age / 1.8
          const ease = 1 - Math.pow(1 - Math.min(p, 1), 1.6)

          if (s.sparks) {
            const arr = s.sparks.geometry.attributes.position.array
            for (let i = 0; i < s.sparkVel.length; i++) {
              arr[i * 3] += s.sparkVel[i].x
              arr[i * 3 + 1] += s.sparkVel[i].y
              arr[i * 3 + 2] += s.sparkVel[i].z
              s.sparkVel[i].x *= s.sparkVel[i].drag
              s.sparkVel[i].y *= s.sparkVel[i].drag
              s.sparkVel[i].z *= s.sparkVel[i].drag
            }
            s.sparks.geometry.attributes.position.needsUpdate = true
            s.sparks.material.opacity = p < 0.7 ? 1 : 1 - ((p - 0.7) / 0.3) * 0.35
          }

          if (s.cloud) {
            const arr = s.cloud.geometry.attributes.position.array
            for (let i = 0; i < s.cloudVel.length; i++) {
              arr[i * 3] += s.cloudVel[i].x
              arr[i * 3 + 1] += s.cloudVel[i].y
              arr[i * 3 + 2] += s.cloudVel[i].z
              s.cloudVel[i].x *= s.cloudVel[i].drag
              s.cloudVel[i].y *= s.cloudVel[i].drag
              s.cloudVel[i].z *= s.cloudVel[i].drag
            }
            s.cloud.geometry.attributes.position.needsUpdate = true
            s.cloud.material.opacity = 0.3 + Math.min(p, 0.85) * 0.4
            s.cloud.material.size = 0.06 + Math.min(p, 0.8) * 0.04
          }

          s.glow.material.opacity = Math.min(1, p * 1.3)
          s.glow.scale.setScalar(0.2 + ease * 2.8)
          s.mesh.material.opacity = Math.min(0.45, p * 0.5)
          s.mesh.scale.setScalar(0.02 + ease * s.finalSize * 1.8)
        } else if (age < 2.35) {
          const p = (age - 1.8) / 0.55
          const ease = p * p

          if (s.sparks) {
            const arr = s.sparks.geometry.attributes.position.array
            for (let i = 0; i < s.sparkVel.length; i++) {
              arr[i * 3] *= 0.82 - p * 0.15
              arr[i * 3 + 1] *= 0.82 - p * 0.15
              arr[i * 3 + 2] *= 0.82 - p * 0.15
            }
            s.sparks.geometry.attributes.position.needsUpdate = true
            s.sparks.material.opacity = Math.max(0, 0.65 * (1 - p))
          }

          if (s.cloud) {
            const arr = s.cloud.geometry.attributes.position.array
            for (let i = 0; i < s.cloudVel.length; i++) {
              arr[i * 3] *= 0.78 - p * 0.2
              arr[i * 3 + 1] *= 0.78 - p * 0.2
              arr[i * 3 + 2] *= 0.78 - p * 0.2
            }
            s.cloud.geometry.attributes.position.needsUpdate = true
            s.cloud.material.opacity = 0.7 * (1 - ease)
            s.cloud.material.size = 0.1 * (1 - ease)
          }

          s.mesh.scale.setScalar(s.finalSize * 1.8 * (1 - ease) + s.finalSize * ease)
          s.mesh.material.opacity = 0.45 + ease * 0.55
          s.glow.material.opacity = 1 - ease * 0.4
          s.glow.scale.setScalar(3.0 - ease * 2.2)
        } else {
          s.mesh.scale.setScalar(s.finalSize)
          s.mesh.material.opacity = 1
          s.glow.material.opacity = 0.55
          s.glow.scale.setScalar(0.7)

          if (s.sparks && s.sparks.parent) {
            s.mesh.remove(s.sparks)
            s.sparks.geometry.dispose()
            s.sparks.material.dispose()
            s.sparks = null
          }
          if (s.cloud && s.cloud.parent) {
            s.mesh.remove(s.cloud)
            s.cloud.geometry.dispose()
            s.cloud.material.dispose()
            s.cloud = null
          }

          // Gravitational warp: when near the core, curve hard around it
          if (!s.warping && s.orbitRadius > 0.9 && s.orbitRadius < 2.8 && Math.random() < 0.002) {
            s.warping = true
            s.warpT = 0
            s.warpFrom = { r: s.orbitRadius, angle: s.angle }
            // slingshot: swing closer then fling out slightly
            s.warpTo = {
              r: Math.max(0.7, s.orbitRadius * (0.45 + Math.random() * 0.25)),
              angle: s.angle + (Math.random() < 0.5 ? 1 : -1) * (1.2 + Math.random() * 1.5)
            }
          }

          if (s.warping) {
            s.warpT += 0.018 // fast bullet curve
            const p = Math.min(1, s.warpT)
            // ease in-out for curved path feel
            const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2

            if (p < 0.5) {
              // dive toward core
              const q = e * 2
              s.orbitRadius = s.warpFrom.r + (s.warpTo.r - s.warpFrom.r) * q
              s.angle = s.warpFrom.angle + (s.warpTo.angle - s.warpFrom.angle) * q * 0.5
            } else {
              // fling back out to slightly new orbit
              const q = (e - 0.5) * 2
              const outR = s.warpFrom.r * (1.05 + Math.random() * 0.15)
              s.orbitRadius = s.warpTo.r + (outR - s.warpTo.r) * q
              s.angle = s.warpFrom.angle + (s.warpTo.angle - s.warpFrom.angle) * (0.5 + q * 0.5)
            }

            s.mesh.position.x = Math.cos(s.angle) * s.orbitRadius
            s.mesh.position.z = Math.sin(s.angle) * s.orbitRadius
            s.mesh.position.y = s.yBase + Math.sin(t * 0.5 + s.angle) * 0.2

            // stretch glow during warp for speed feel
            s.glow.scale.setScalar(0.7 + Math.sin(p * Math.PI) * 1.2)

            if (p >= 1) {
              s.warping = false
              s.orbitRadius = Math.sqrt(
                s.mesh.position.x ** 2 + s.mesh.position.z ** 2
              )
              s.glow.scale.setScalar(0.7)
            }
          } else {
            s.angle += s.orbitSpeed
            s.mesh.position.x = Math.cos(s.angle) * s.orbitRadius
            s.mesh.position.z = Math.sin(s.angle) * s.orbitRadius
            s.mesh.position.y = s.yBase + Math.sin(t * 0.35 + s.angle) * 0.12
          }
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
    }
  }, [])

  const handleInputChange = (e) => {
    setQuery(e.target.value)
    typingRef.current = 1
    setIsTyping(true)
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      typingRef.current = 0
      setIsTyping(false)
    }, 1200)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const text = (needsMore ? moreText : query).trim()
    if (!text) return

    const hue = Math.random()
    const x = (Math.random() - 0.5) * 8
    const y = (Math.random() - 0.5) * 4
    const z = (Math.random() - 0.5) * 5 - 0.5
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
        <h1 className={`logo ${isActivating ? 'logo-activate' : ''}`}>XhumAI</h1>
        <p className="tagline">WORK LESS. LIVE MORE.</p>
        <p className="purpose">Intelligence that evolves with you</p>

        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="What are you trying to accomplish?"
            autoFocus
            disabled={needsMore}
            className={isTyping ? 'input-awake' : ''}
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
