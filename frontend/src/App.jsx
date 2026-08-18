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

function drawDiamond(ctx, s) {
  const c = s / 2
  const r = s * 0.36
  ctx.beginPath()
  ctx.moveTo(c, c - r)
  ctx.lineTo(c + r * 0.7, c)
  ctx.lineTo(c, c + r)
  ctx.lineTo(c - r * 0.7, c)
  ctx.closePath()
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.fill()
  ctx.globalCompositeOperation = 'destination-in'
  const g = ctx.createRadialGradient(c, c, r * 0.2, c, c, r * 1.15)
  g.addColorStop(0, 'rgba(0,0,0,1)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
}

function drawCross(ctx, s) {
  const c = s / 2
  const arm = s * 0.12
  const len = s * 0.38
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.fillRect(c - arm, c - len, arm * 2, len * 2)
  ctx.fillRect(c - len, c - arm, len * 2, arm * 2)
  ctx.globalCompositeOperation = 'destination-in'
  const g = ctx.createRadialGradient(c, c, s * 0.08, c, c, s * 0.45)
  g.addColorStop(0, 'rgba(0,0,0,1)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
}


function App() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('input initiates creation')
  const [responseKey, setResponseKey] = useState(0)
  const [status, setStatus] = useState('')
  const [needsMore, setNeedsMore] = useState(false)
  const [moreText, setMoreText] = useState('')
  const [morePrompt, setMorePrompt] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isActivating, setIsActivating] = useState(false)
  const [initialGlitch, setInitialGlitch] = useState(true)
  const [animMode, setAnimMode] = useState('combo') // 'glitch' | 'pixel' | 'combo'
  const [path, setPath] = useState(null) // which field last focused (ambient only)
  const [queryBuild, setQueryBuild] = useState('')

  const mountRef = useRef(null)
  const starsRef = useRef([])
  const sceneRef = useRef(null)
  const gasRef = useRef([])
  const layersRef = useRef([]) // shape point layers
  const specialsRef = useRef([]) // mini BH, wireframes, etc.
  const cameraRef = useRef(null)
  const coreRef = useRef(null)
  const warpRingsRef = useRef([])
  const horizonRef = useRef(null)
  const photonRef = useRef(null)
  const auraRef = useRef(null)
  const typingRef = useRef(0)
  const activateRef = useRef(0)
  const typingTimeout = useRef(null)

  const birthStar = (data = {}) => {
    if (!sceneRef.current) return

    // Individual stellar / planetary archetypes
    const types = [
      { id: 'pinpoint', w: 22, size: [0.02, 0.04], sat: 0.35, lit: 0.95, sparks: 12, cloud: 20, pulse: 0 },
      { id: 'main', w: 28, size: [0.05, 0.09], sat: 0.55, lit: 0.82, sparks: 40, cloud: 70, pulse: 0.15 },
      { id: 'redgiant', w: 12, size: [0.12, 0.22], sat: 0.85, lit: 0.55, sparks: 28, cloud: 90, pulse: 0.35, hueBias: 0.02 },
      { id: 'bluegiant', w: 8, size: [0.1, 0.18], sat: 0.7, lit: 0.75, sparks: 50, cloud: 80, pulse: 0.25, hueBias: 0.58 },
      { id: 'gasgiant', w: 10, size: [0.09, 0.16], sat: 0.65, lit: 0.6, sparks: 20, cloud: 110, pulse: 0.1, bands: true },
      { id: 'icegiant', w: 8, size: [0.07, 0.13], sat: 0.55, lit: 0.7, sparks: 18, cloud: 60, pulse: 0.08, hueBias: 0.52 },
      { id: 'quasar', w: 7, size: [0.04, 0.07], sat: 0.9, lit: 0.95, sparks: 80, cloud: 40, pulse: 0.9, jet: true },
      { id: 'neutron', w: 5, size: [0.025, 0.04], sat: 0.4, lit: 0.98, sparks: 60, cloud: 15, pulse: 1.2 },
    ]
    const totalW = types.reduce((s, t) => s + t.w, 0)
    let roll = Math.random() * totalW
    let type = types[0]
    for (const t of types) {
      roll -= t.w
      if (roll <= 0) { type = t; break }
    }

    const hue = data.hue ?? (type.hueBias != null
      ? (type.hueBias + (Math.random() - 0.5) * 0.08 + 1) % 1
      : Math.random())
    const finalSize = type.size[0] + Math.random() * (type.size[1] - type.size[0])

    const starGeo = new THREE.SphereGeometry(1, type.bands ? 24 : 16, type.bands ? 24 : 16)
    const starMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue, type.sat, type.lit),
      transparent: true,
      opacity: 0
    })
    const star = new THREE.Mesh(starGeo, starMat)
    star.scale.setScalar(0.02)
    star.userData.starType = type.id
    star.userData.pulse = type.pulse
    star.userData.baseHue = hue

    const x = data.x ?? (Math.random() - 0.5) * 9
    const y = data.y ?? (Math.random() - 0.5) * 3.8
    const z = data.z ?? (Math.random() - 0.5) * 9
    star.position.set(x, y, z)

    // Gas-giant band texture (canvas)
    if (type.bands) {
      const c = document.createElement('canvas')
      c.width = 64; c.height = 64
      const cx = c.getContext('2d')
      for (let row = 0; row < 64; row++) {
        const f = row / 64
        const band = Math.sin(f * Math.PI * 6 + hue * 10) * 0.5 + 0.5
        const col = new THREE.Color().setHSL(hue + band * 0.08, type.sat, type.lit * (0.75 + band * 0.25))
        cx.fillStyle = `#${col.getHexString()}`
        cx.fillRect(0, row, 64, 1)
      }
      starMat.map = new THREE.CanvasTexture(c)
      starMat.needsUpdate = true
    }

    const sparkCount = type.sparks
    const sparkGeo = new THREE.BufferGeometry()
    const sparkPos = new Float32Array(sparkCount * 3)
    const sparkVel = []
    for (let i = 0; i < sparkCount; i++) {
      sparkPos[i * 3] = 0
      sparkPos[i * 3 + 1] = 0
      sparkPos[i * 3 + 2] = 0
      const speed = (type.id === 'quasar' ? 0.12 : 0.05) + Math.random() * 0.1
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      sparkVel.push({
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.sin(phi) * Math.sin(theta) * speed,
        z: Math.cos(phi) * speed,
        drag: 0.96 + Math.random() * 0.03
      })
    }
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3))
    const sparkMat = new THREE.PointsMaterial({
      color: new THREE.Color().setHSL(hue, Math.min(1, type.sat + 0.15), Math.min(1, type.lit + 0.1)),
      size: type.id === 'pinpoint' ? 0.03 : 0.05,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    })
    const sparks = new THREE.Points(sparkGeo, sparkMat)
    star.add(sparks)

    // Quasar jets
    if (type.jet) {
      const jetGeo = new THREE.CylinderGeometry(0.01, 0.04, 0.8, 6)
      const jetMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(hue, 0.9, 0.85),
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
      const jetA = new THREE.Mesh(jetGeo, jetMat)
      const jetB = new THREE.Mesh(jetGeo, jetMat.clone())
      jetA.position.y = 0.5
      jetB.position.y = -0.5
      star.add(jetA)
      star.add(jetB)
    }

    const cloudCount = type.cloud
    const cloudGeo = new THREE.BufferGeometry()
    const cloudPos = new Float32Array(cloudCount * 3)
    const cloudVel = []
    for (let i = 0; i < cloudCount; i++) {
      cloudPos[i * 3] = 0
      cloudPos[i * 3 + 1] = 0
      cloudPos[i * 3 + 2] = 0
      const speed = 0.04 + Math.random() * 0.1
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
      color: new THREE.Color().setHSL(hue, type.sat * 0.8, type.lit * 0.9),
      size: type.id === 'redgiant' ? 0.1 : 0.06,
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
    g.addColorStop(0.15, `hsla(${hue * 360}, 80%, 75%, 0.7)`)
    g.addColorStop(0.45, `hsla(${hue * 360}, 70%, 55%, 0.2)`)
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
    const glowScale = type.id === 'redgiant' ? 0.45 : type.id === 'quasar' ? 0.35 : 0.22
    glow.scale.set(glowScale, glowScale, 1)
    star.add(glow)

    sceneRef.current.add(star)

    activateRef.current = performance.now()
    setIsActivating(true)
    setTimeout(() => setIsActivating(false), 1600)

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
      orbitSpeed: 0.0001 + Math.random() * 0.00045,
      orbitRadius,
      angle: Math.atan2(z, x),
      yBase: y,
      warping: false,
      warpT: 0,
      warpFrom: null,
      warpTo: null,
      starType: type.id,
      pulse: type.pulse,
      baseHue: hue
    })
  }

  useEffect(() => {
    const g = setTimeout(() => setInitialGlitch(false), 3200)
    // combo/pixel load-in: wait for Three scene + DOM text, then pixel-form → supernova
    if (animMode === 'pixel' || animMode === 'combo') {
      const t = setTimeout(() => {
        try {
          playPixelForm(['.logo', '.tagline', '.purpose', '.response', '.status'], 5200)
        } catch (e) {
          console.warn('load-in animation failed', e)
        }
      }, 900)
      return () => { clearTimeout(g); clearTimeout(t) }
    }
    return () => clearTimeout(g)
  }, [])

  // NOTE: removed initial black overlay — run animations over existing background
  // no black overlay — galaxy stays visible
  useEffect(() => {
    // Birth persisted stars after load-in supernova settles so they join the living field
    const t = setTimeout(() => {
      fetch(`${API}/api/stars`)
        .then(r => r.json())
        .then(data => {
          if (data.stars && Array.isArray(data.stars)) {
            data.stars.forEach((s, i) => {
              setTimeout(() => birthStar(s), i * 40)
            })
          }
        })
        .catch(() => {})
    }, 9000)
    return () => clearTimeout(t)
  }, [])

  // Pixel formation: try WebGL renderer first (faster for many particles).
  // Throttles frame rate to reduce CPU/GPU load and reduces particle size slightly.
  function playPixelForm(selectors = ['.logo'], duration = 4000, preferWebGL = true) {
    const nodes = []
    selectors.forEach(s => document.querySelectorAll(s).forEach(n => nodes.push(n)))
    if (!nodes.length) return

    const canvas = document.createElement('canvas')
    canvas.className = 'pixel-canvas'
    canvas.style.position = 'fixed'
    canvas.style.left = '0'
    canvas.style.top = '0'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    canvas.style.pointerEvents = 'none'
    canvas.style.zIndex = '9999'
    document.body.appendChild(canvas)

    const DPR = window.devicePixelRatio || 1
    canvas.width = Math.max(1, Math.floor(window.innerWidth * DPR))
    canvas.height = Math.max(1, Math.floor(window.innerHeight * DPR))
    const ctx = canvas.getContext('2d')
    ctx.scale(DPR, DPR)

    const particles = []
    const maxParticles = 1200
    const sizeFactor = 0.88 // reduce size by ~12%

    for (const el of nodes) {
      const text = el.getAttribute('data-text') || el.textContent || ''
      if (!text.trim()) continue
      const rect = el.getBoundingClientRect()
      const cs = getComputedStyle(el)
      const color = cs.color || '#ffffff'

      // downscale sampling to keep particle count reasonable
      const sampleScale = Math.max(0.25, Math.min(1, 180 / Math.max(rect.width, 120)))
      const sw = Math.max(2, Math.floor(rect.width * sampleScale))
      const sh = Math.max(2, Math.floor(rect.height * sampleScale))
      const off = document.createElement('canvas')
      off.width = sw
      off.height = sh
      const octx = off.getContext('2d')
      // draw text scaled to sample canvas
      octx.fillStyle = 'black'
      octx.fillRect(0, 0, sw, sh)
      const fontSize = Math.max(8, (parseFloat(cs.fontSize) * sampleScale))
      octx.font = `${fontSize}px ${cs.fontFamily}`
      octx.fillStyle = '#fff'
      octx.textBaseline = 'top'
      // scale text to fit width
      octx.fillText(text, 0, 0)

      const img = octx.getImageData(0, 0, sw, sh).data
      const step = Math.max(2, Math.floor(3 / sampleScale))

      for (let y = 0; y < sh; y += step) {
        for (let x = 0; x < sw; x += step) {
          const idx = (y * sw + x) * 4
          const alpha = img[idx + 3]
          if (alpha > 60) {
            const tx = Math.round(rect.left + (x / sampleScale))
            const ty = Math.round(rect.top + (y / sampleScale))
            particles.push({ tx, ty, color, size: Math.max(1, Math.round(2 / sampleScale * sizeFactor)) })
            if (particles.length >= maxParticles) break
          }
        }
        if (particles.length >= maxParticles) break
      }
      if (particles.length >= maxParticles) break
    }

    if (!particles.length) { canvas.remove(); return }

    // assign starting/random positions and timing
    for (const p of particles) {
      p.sx = Math.random() * window.innerWidth
      p.sy = Math.random() * window.innerHeight
      p.delay = Math.random() * (duration * 0.5)
      p.dur = duration - p.delay
    }

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3) }

    const FPS = 30
    const frameInterval = 1000 / FPS

    // helper stub: previously created a black overlay during suck; now disabled
    function ensureBlack() { return null }

    // WebGL renderer (preferred)
    function webglRenderer(particlesList, onComplete) {
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) return false

      // simple shaders
      const vs = `attribute vec2 a_pos; attribute float a_size; attribute vec3 a_col; uniform vec2 u_resolution; varying vec3 v_col; void main(){ vec2 zeroToOne = a_pos / u_resolution; vec2 clipSpace = zeroToOne * 2.0 - 1.0; gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1); gl_PointSize = a_size; v_col = a_col;} `
      const fs = `precision mediump float; varying vec3 v_col; void main(){ gl_FragColor = vec4(v_col, 1.0); }`

      function compileShader(type, src){ const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh); if(!gl.getShaderParameter(sh, gl.COMPILE_STATUS)){ console.warn(gl.getShaderInfoLog(sh)); return null } return sh }
      const vsh = compileShader(gl.VERTEX_SHADER, vs)
      const fsh = compileShader(gl.FRAGMENT_SHADER, fs)
      const prog = gl.createProgram()
      gl.attachShader(prog, vsh); gl.attachShader(prog, fsh); gl.linkProgram(prog)
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return false
      gl.useProgram(prog)

      const count = particlesList.length
      const stride = 6 // x,y,size,r,g,b
      const buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      const a_pos = gl.getAttribLocation(prog, 'a_pos')
      const a_size = gl.getAttribLocation(prog, 'a_size')
      const a_col = gl.getAttribLocation(prog, 'a_col')
      const u_resolution = gl.getUniformLocation(prog, 'u_resolution')

      gl.enableVertexAttribArray(a_pos)
      gl.vertexAttribPointer(a_pos, 2, gl.FLOAT, false, stride * 4, 0)
      gl.enableVertexAttribArray(a_size)
      gl.vertexAttribPointer(a_size, 1, gl.FLOAT, false, stride * 4, 2 * 4)
      gl.enableVertexAttribArray(a_col)
      gl.vertexAttribPointer(a_col, 3, gl.FLOAT, false, stride * 4, 3 * 4)

      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(0,0,0,0)

      const startTime = performance.now()
      let lastRender = 0
      function frameGL(now) {
        const tNow = now
        if (tNow - lastRender < frameInterval) { requestAnimationFrame(frameGL); return }
        lastRender = tNow

        const arr = new Float32Array(count * stride)
        let i = 0
        let remaining = 0
        // compute hole screen position
        let hx = window.innerWidth / 2
        let hy = window.innerHeight / 2
        try {
          if (coreRef.current && cameraRef.current) {
            const v = coreRef.current.position.clone()
            v.project(cameraRef.current)
            hx = (v.x * 0.5 + 0.5) * window.innerWidth
            hy = (-v.y * 0.5 + 0.5) * window.innerHeight
          }
        } catch (e) {}

        for (const p of particlesList) {
          const tt = Math.min(1, Math.max(0, (now - startTime - p.delay) / p.dur))
          let x, y
          if (!p.phase) p.phase = 'forming'
          if (p.phase === 'forming' && tt >= 1) {
            p.phase = 'sucking'
            p.phaseStart = now
            // 1.5x faster suck
            p.suckDur = (700 + Math.random() * 500) / 1.5
            p.hx = hx
            p.hy = hy
            // ensure black overlay appears during suck
            ensureBlack()
          }

          if (p.phase === 'forming') {
            const e = easeOutCubic(tt)
            x = p.sx + (p.tx - p.sx) * e
            y = p.sy + (p.ty - p.sy) * e
          } else if (p.phase === 'sucking') {
            const st = Math.min(1, (now - p.phaseStart) / p.suckDur)
            const se = Math.pow(st, 2)
            x = p.tx + (p.hx - p.tx) * se
            y = p.ty + (p.hy - p.ty) * se
          } else {
            x = p.tx; y = p.ty
          }

          const progress = (p.phase === 'forming') ? tt : (p.phase === 'sucking' ? Math.min(1, (now - p.phaseStart) / p.suckDur) : 1)
          const e = easeOutCubic(Math.min(1, progress))
          const size = Math.max(1, p.size * (0.3 + 0.7 * e)) * (window.devicePixelRatio || 1)
          const col = (() => { try { const c = document.createElement('div'); c.style.color = p.color; document.body.appendChild(c); const rgb = getComputedStyle(c).color; document.body.removeChild(c); const m = rgb.match(/(\d+),\s*(\d+),\s*(\d+)/); if(m) return [m[1]/255, m[2]/255, m[3]/255]; } catch(e){} return [1,1,1] })()
          arr[i++] = x
          arr[i++] = y
          arr[i++] = size
          arr[i++] = col[0]
          arr[i++] = col[1]
          arr[i++] = col[2]
          if (!p.phase || p.phase !== 'done') {
            if (p.phase === 'sucking' && (now - p.phaseStart) / p.suckDur >= 1) p.phase = 'done'
            else if (p.phase === 'forming' && tt < 1) remaining++
            else if (p.phase === 'sucking') remaining++
          }
        }

        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.uniform2f(u_resolution, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1))
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(gl.ARRAY_BUFFER, arr, gl.DYNAMIC_DRAW)
        gl.drawArrays(gl.POINTS, 0, count)

        if (remaining > 0) requestAnimationFrame(frameGL)
        else {
          // call onComplete to trigger supernova sequence, reusing existing black overlay
          try { if (onComplete) onComplete() } catch (e) {}
          canvas.remove()
        }
      }
      requestAnimationFrame(frameGL)
      return true
    }

    function canvas2DRenderer(particlesList, onComplete) {
      let lastRender = 0
      const start = performance.now()
      let rafId = null
      function frame(now) {
        if (now - lastRender < frameInterval) { rafId = requestAnimationFrame(frame); return }
        lastRender = now
        ctx.clearRect(0, 0, canvas.width / DPR, canvas.height / DPR)
        let remaining = 0

        // hole position
        let hx = window.innerWidth / 2
        let hy = window.innerHeight / 2
        try {
          if (coreRef.current && cameraRef.current) {
            const v = coreRef.current.position.clone()
            v.project(cameraRef.current)
            hx = (v.x * 0.5 + 0.5) * window.innerWidth
            hy = (-v.y * 0.5 + 0.5) * window.innerHeight
          }
        } catch (e) {}

        for (const p of particlesList) {
          const t = (now - start - p.delay) / p.dur
          const tt = Math.min(1, Math.max(0, t))
          if (!p.phase) p.phase = 'forming'
          if (p.phase === 'forming' && tt >= 1) {
            p.phase = 'sucking'
            p.phaseStart = now
            // 1.5x faster suck
            p.suckDur = (700 + Math.random() * 500) / 1.5
            p.hx = hx
            p.hy = hy
            ensureBlack()
          }

          let x, y
          if (p.phase === 'forming') {
            const e = easeOutCubic(tt)
            x = p.sx + (p.tx - p.sx) * e
            y = p.sy + (p.ty - p.sy) * e
          } else if (p.phase === 'sucking') {
            const st = Math.min(1, (now - p.phaseStart) / p.suckDur)
            const se = Math.pow(st, 2)
            x = p.tx + (p.hx - p.tx) * se
            y = p.ty + (p.hy - p.ty) * se
          } else { x = p.tx; y = p.ty }

          const progress = (p.phase === 'forming') ? tt : (p.phase === 'sucking' ? Math.min(1, (now - p.phaseStart) / p.suckDur) : 1)
          const e = easeOutCubic(Math.min(1, progress))
          const size = Math.max(1, p.size * (0.3 + 0.7 * e))
          ctx.fillStyle = p.color
          ctx.fillRect(Math.round(x), Math.round(y), Math.round(size), Math.round(size))

          if (p.phase === 'sucking' && (now - p.phaseStart) / p.suckDur >= 1) p.phase = 'done'
          if (p.phase !== 'done') remaining++
        }
        if (remaining > 0) rafId = requestAnimationFrame(frame)
        else { try { if (onComplete) onComplete() } catch(e){} ; canvas.remove(); cancelAnimationFrame(rafId) }
      }
      rafId = requestAnimationFrame(frame)
    }

    // compute core screen position now so supernova can use it later
    let coreScreen = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    try {
      if (coreRef.current && cameraRef.current) {
        const v = coreRef.current.position.clone()
        v.project(cameraRef.current)
        coreScreen.x = (v.x * 0.5 + 0.5) * window.innerWidth
        coreScreen.y = (-v.y * 0.5 + 0.5) * window.innerHeight
      }
    } catch (e) {}

    // choose renderer and call onComplete to run supernova sequence
    let used = false
    const onComplete = () => {
      // small buffer then run supernova sequence
      setTimeout(() => runSupernovaSequence(coreScreen.x, coreScreen.y), 120)
    }
    if (preferWebGL) used = webglRenderer(particles, onComplete)
    if (!used) canvas2DRenderer(particles, onComplete)
  }

  // Supernova visual sequence triggered when pixel formation completes
  function runSupernovaSequence(hx, hy) {
    // Run supernova over the existing scene (no black overlay)
    // immediately hide scene layers/specials/clouds by storing original opacities
    try {
      for (const layer of layersRef.current) {
        if (layer.mat) {
          layer.mat.userData = layer.mat.userData || {}
          layer.mat.userData._origOpacity = layer.mat.opacity
          layer.mat.userData._origTransparent = layer.mat.transparent
          layer.mat.transparent = true
          layer.mat.opacity = Math.max(0.15, (layer.mat.userData._origOpacity || 0.6) * 0.2)
        }
      }
      for (const g of gasRef.current) {
        if (g.material) {
          g.material.userData = g.material.userData || {}
          g.material.userData._origOpacity = g.material.opacity
          g.material.userData._origTransparent = g.material.transparent
          g.material.transparent = true
          g.material.opacity = Math.max(0.05, (g.material.userData._origOpacity || 0.08) * 0.25)
        }
      }
      for (const s of specialsRef.current) {
        if (s.mesh && s.mesh.material) {
          s.mesh.material.userData = s.mesh.material.userData || {}
          s.mesh.material.userData._origOpacity = s.mesh.material.opacity
          s.mesh.material.userData._origTransparent = s.mesh.material.transparent
          s.mesh.material.transparent = true
          s.mesh.material.opacity = 0
        }
      }
      if (horizonRef.current && horizonRef.current.material) {
        horizonRef.current.material.userData = horizonRef.current.material.userData || {}
        horizonRef.current.material.userData._origOpacity = horizonRef.current.material.opacity
        horizonRef.current.material.userData._origTransparent = horizonRef.current.material.transparent
        horizonRef.current.material.transparent = true
        horizonRef.current.material.opacity = 0
      }
      if (photonRef.current && photonRef.current.material) {
        photonRef.current.material.userData = photonRef.current.material.userData || {}
        photonRef.current.material.userData._origOpacity = photonRef.current.material.opacity
        photonRef.current.material.userData._origTransparent = photonRef.current.material.transparent
        photonRef.current.material.transparent = true
        photonRef.current.material.opacity = 0
      }
      if (auraRef.current && auraRef.current.material) {
        auraRef.current.material.userData = auraRef.current.material.userData || {}
        auraRef.current.material.userData._origOpacity = auraRef.current.material.opacity
        auraRef.current.material.userData._origTransparent = auraRef.current.material.transparent
        auraRef.current.material.transparent = true
        auraRef.current.material.opacity = 0
      }
    } catch (e) {}
    // (no black overlay to paint)

    // 2) after 0.25s show halo (0.5s)
    setTimeout(() => {
      const halo = document.createElement('div')
      halo.className = 'sn-halo'
      halo.style.left = hx + 'px'
      halo.style.top = hy + 'px'
      document.body.appendChild(halo)
      // animate in
      requestAnimationFrame(() => {
        halo.style.opacity = '1'
        halo.style.transform = 'translate(-50%, -50%) scale(1)'
        halo.style.boxShadow = '0 0 0 6px rgba(200,230,255,0.18), 0 0 28px 12px rgba(120,200,255,0.22)'
      })

      // 3) after halo in (0.5s) do instant BOOM supernova (2.5s)
      setTimeout(() => {
        // create supernova canvas
        // find black overlay and fade it to transparent over 1s so the scene shows through
        try {
          const black = document.querySelector('.sn-black-overlay')
          if (black) {
            black.style.transition = 'opacity 1000ms linear'
            black.style.opacity = '0'
          }
        } catch (e) {}

        // start fading the 3D scene back in over 1.5s
        const fadeDuration = 1500
        const fadeStart = performance.now()
        function fadeInScene(nowF) {
          const p = Math.min(1, (nowF - fadeStart) / fadeDuration)
          const eased = p // linear for now
          try {
            for (const layer of layersRef.current) {
              if (layer.mat && layer.mat.userData && typeof layer.mat.userData._origOpacity === 'number') {
                layer.mat.opacity = layer.mat.userData._origOpacity * eased
              }
            }
            for (const g of gasRef.current) {
              if (g.material && g.material.userData && typeof g.material.userData._origOpacity === 'number') {
                g.material.opacity = g.material.userData._origOpacity * eased
              }
            }
            for (const s of specialsRef.current) {
              if (s.mesh && s.mesh.material && s.mesh.material.userData && typeof s.mesh.material.userData._origOpacity === 'number') {
                s.mesh.material.opacity = s.mesh.material.userData._origOpacity * eased
              }
            }
            if (horizonRef.current && horizonRef.current.material && horizonRef.current.material.userData && typeof horizonRef.current.material.userData._origOpacity === 'number') {
              horizonRef.current.material.opacity = horizonRef.current.material.userData._origOpacity * eased
            }
            if (photonRef.current && photonRef.current.material && photonRef.current.material.userData && typeof photonRef.current.material.userData._origOpacity === 'number') {
              photonRef.current.material.opacity = photonRef.current.material.userData._origOpacity * eased
            }
            if (auraRef.current && auraRef.current.material && auraRef.current.material.userData && typeof auraRef.current.material.userData._origOpacity === 'number') {
              auraRef.current.material.opacity = auraRef.current.material.userData._origOpacity * eased
            }
          } catch (e) {}
          if (p < 1) requestAnimationFrame(fadeInScene)
          else {
            // restore transparent flags to original where stored
            try {
              for (const layer of layersRef.current) {
                if (layer.mat && layer.mat.userData && typeof layer.mat.userData._origTransparent === 'boolean') {
                  layer.mat.transparent = layer.mat.userData._origTransparent
                }
              }
              for (const g of gasRef.current) {
                if (g.material && g.material.userData && typeof g.material.userData._origTransparent === 'boolean') {
                  g.material.transparent = g.material.userData._origTransparent
                }
              }
              for (const s of specialsRef.current) {
                if (s.mesh && s.mesh.material && s.mesh.material.userData && typeof s.mesh.material.userData._origTransparent === 'boolean') {
                  s.mesh.material.transparent = s.mesh.material.userData._origTransparent
                }
              }
              if (horizonRef.current && horizonRef.current.material && horizonRef.current.material.userData && typeof horizonRef.current.material.userData._origTransparent === 'boolean') horizonRef.current.material.transparent = horizonRef.current.material.userData._origTransparent
              if (photonRef.current && photonRef.current.material && photonRef.current.material.userData && typeof photonRef.current.material.userData._origTransparent === 'boolean') photonRef.current.material.transparent = photonRef.current.material.userData._origTransparent
              if (auraRef.current && auraRef.current.material && auraRef.current.material.userData && typeof auraRef.current.material.userData._origTransparent === 'boolean') auraRef.current.material.transparent = auraRef.current.material.userData._origTransparent
            } catch (e) {}
          }
        }
        requestAnimationFrame(fadeInScene)

        const s = document.createElement('canvas')
        s.className = 'sn-canvas'
        document.body.appendChild(s)
        const DPR = window.devicePixelRatio || 1
        s.width = Math.max(1, Math.floor(window.innerWidth * DPR))
        s.height = Math.max(1, Math.floor(window.innerHeight * DPR))
        const ctx = s.getContext('2d')
        ctx.scale(DPR, DPR)

        // CHAOTIC immersive supernova
        const colors = ['#ff3b5c','#ff6b6b','#ffd93d','#ffe66d','#7ee787','#2ee6a6','#6bd3ff','#4cc9ff','#d18bff','#b388ff','#ff9fd6','#ff5ec4','#ffffff','#c8f0ff']
        const particles = []
        const count = 4200
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2
          const wave = Math.floor(Math.random() * 3)
          const speed = (wave === 0 ? 80 : wave === 1 ? 160 : 280) + Math.random() * 320
          const vx = Math.cos(angle) * speed * (0.7 + Math.random() * 0.6)
          const vy = Math.sin(angle) * speed * (0.7 + Math.random() * 0.6)
          particles.push({
            x: hx + (Math.random() - 0.5) * 40,
            y: hy + (Math.random() - 0.5) * 40,
            vx, vy,
            life: 2800 + Math.random() * 1800,
            age: 0,
            size: 1 + Math.random() * 5 + (wave === 2 ? 2 : 0),
            color: colors[Math.floor(Math.random() * colors.length)],
            spin: (Math.random() - 0.5) * 0.4
          })
        }
        // shock ring
        let ringR = 0
        let ringAlpha = 1

        const boomStart = performance.now()
        // screen shake on landing root
        try {
          const land = document.querySelector('.landing')
          if (land) {
            land.style.transition = 'transform 0.05s'
            let shakes = 0
            const shakeId = setInterval(() => {
              shakes++
              land.style.transform = `translate(${(Math.random()-0.5)*14}px,${(Math.random()-0.5)*10}px)`
              if (shakes > 18) {
                clearInterval(shakeId)
                land.style.transform = ''
              }
            }, 40)
          }
        } catch (e) {}

        function step(now) {
          const dt = now - boomStart
          ctx.clearRect(0, 0, s.width / DPR, s.height / DPR)
          // expanding shockwave rings
          ringR += 18
          ringAlpha *= 0.97
          for (let k = 0; k < 3; k++) {
            ctx.beginPath()
            ctx.arc(hx, hy, ringR * (0.6 + k * 0.35), 0, Math.PI * 2)
            ctx.strokeStyle = colors[k * 3 % colors.length]
            ctx.globalAlpha = Math.max(0, ringAlpha * (0.5 - k * 0.1))
            ctx.lineWidth = 3 - k
            ctx.stroke()
          }
          for (const p of particles) {
            const t = Math.min(1, p.age / p.life)
            p.x += p.vx * (1 / 60)
            p.y += p.vy * (1 / 60)
            p.vx *= 0.992
            p.vy *= 0.992
            p.vy += Math.sin(p.age * 0.01 + p.spin) * 0.15
            p.age += 1000 / 60
            const alpha = Math.pow(1 - t, 0.7)
            ctx.fillStyle = p.color
            ctx.globalAlpha = alpha
            const sz = p.size * (1 + (1 - t) * 0.8)
            ctx.fillRect(Math.round(p.x), Math.round(p.y), sz, sz)
          }
          ctx.globalAlpha = 1
          if (now - boomStart < 3200) requestAnimationFrame(step)
          else {
            const settleStart = performance.now()
            function settle(now2) {
              const sdt = now2 - settleStart
              const prog = Math.min(1, sdt / 2800)
              ctx.clearRect(0, 0, s.width / DPR, s.height / DPR)
              for (const p of particles) {
                p.x += p.vx * (1 / 60) * 0.15
                p.y += p.vy * (1 / 60) * 0.15
                p.vx *= 0.97
                p.vy *= 0.97
                ctx.globalAlpha = (1 - prog) * 0.75
                ctx.fillStyle = p.color
                ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
              }
              ctx.globalAlpha = 1
              if (prog < 1) requestAnimationFrame(settle)
              else {
                s.remove()
                try { halo.remove() } catch (e) {}
              }
            }
            requestAnimationFrame(settle)
          }
        }
        requestAnimationFrame(step)
      }, 500)
    }, 250)
  }

  // Restart full sequence from top (clears overlays and replays selected animation)
  function restartSequence() {
    // remove any existing overlays/canvases
    document.querySelectorAll('.pixel-canvas, .sn-canvas, .sn-black-overlay, .sn-halo').forEach(el => el.remove())

    // no black overlay

    // reset initialGlitch and re-run selected animation
    setInitialGlitch(true)
    // schedule clearing initialGlitch after 3s
    setTimeout(() => setInitialGlitch(false), 3000)

    // trigger pixel formation for pixel/combo modes
    if (animMode === 'pixel' || animMode === 'combo') {
      setTimeout(() => playPixelForm(['.logo', '.tagline', '.purpose', '.response', '.status'], 4000), 120)
    }
  }

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    let width = window.innerWidth
    let height = window.innerHeight
    const DPR = Math.min(window.devicePixelRatio, 1.75)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x000006)
    // Pastel-shifting fog (hue drifts in animate loop via fog.color)
    scene.fog = new THREE.FogExp2(0xc8b0e8, 0.0035)
    scene.fog.color.setHSL(0.72, 0.35, 0.12)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 200)
    camera.position.set(0, 0.5, 8.5)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

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
    const texDiamond = makeShapeTexture(drawDiamond)
    const texCross = makeShapeTexture(drawCross)
    const texTri = makeShapeTexture((ctx, s) => drawPolygon(ctx, s, 3))

    // Distribution of 2D shape layers (of ~11k point particles)
    // square 30%, circle 30%, hex 15%, pent 5%, star6 5%, star7 4% ≈ 89%
    // remaining ~11% reserved conceptually for specials (we spawn fewer 3D specials)
    const layerDefs = [
      { tex: texCircle, count: 3200, size: 0.018 },
      { tex: texSquare, count: 2400, size: 0.022 },
      { tex: texHex, count: 1800, size: 0.02 },
      { tex: texPent, count: 1400, size: 0.024 },
      { tex: texTri, count: 1600, size: 0.021 },
      { tex: texDiamond, count: 1500, size: 0.019 },
      { tex: texCross, count: 1200, size: 0.026 },
      { tex: texStar6, count: 1100, size: 0.028 },
      { tex: texStar7, count: 900, size: 0.032 }
    ]

    const layers = []
    // 20% less transparent than prior ~0.78 → ~0.936
    const baseOpacity = 0.94

    for (const def of layerDefs) {
      const positions = new Float32Array(def.count * 3)
      const colors = new Float32Array(def.count * 3)
      const basePositions = new Float32Array(def.count * 3)
      const hues = new Float32Array(def.count)

      let written = 0
      const target = Math.floor(def.count * 1.08) // denser spiral arms
      const ARM_COUNT = 5
      const SPIRAL = 0.58
      for (let attempt = 0; written < Math.min(target, def.count) && attempt < def.count * 4; attempt++) {
        const u = Math.random()
        // bias mass into arms + dust lanes (hyperreal disk)
        const inArm = Math.random() < 0.82
        const r = Math.pow(u, inArm ? 1.28 : 1.95) * 15.2
        if (r > 13.2 && Math.random() < 0.45) continue
        const arm = Math.floor(Math.random() * ARM_COUNT)
        const armBase = (arm / ARM_COUNT) * Math.PI * 2
        const spread = inArm ? (Math.random() - 0.5) * 0.34 : Math.random() * Math.PI * 2
        const theta = inArm ? (armBase + r * SPIRAL + spread) : spread
        const i3 = written * 3
        // thinner disk near core, thicker halo outward (real spiral galaxies)
        const diskH = (0.55 + r * 0.18) * (inArm ? 0.85 : 1.15)
        const y = (Math.random() - 0.5) * diskH

        positions[i3] = Math.cos(theta) * r
        positions[i3 + 1] = y
        positions[i3 + 2] = Math.sin(theta) * r
        basePositions[i3] = positions[i3]
        basePositions[i3 + 1] = y
        basePositions[i3 + 2] = positions[i3 + 2]

        // arm cores slightly brighter / cooler pastel
        // random pastel rainbow with slight arm bias (nebula filaments)
        hues[written] = inArm
          ? (arm * 0.14 + Math.random() * 0.55 + r * 0.008) % 1
          : Math.random()
        // Gram-style contrast: structured arms bright, inter-arm darker; pastel spectrum
        const sat = inArm ? 0.62 + Math.random() * 0.32 : 0.45 + Math.random() * 0.35
        const lit = inArm ? 0.68 + Math.random() * 0.28 : 0.38 + Math.random() * 0.28
        const c = new THREE.Color().setHSL(hues[written], sat, lit)
        colors[i3] = c.r
        colors[i3 + 1] = c.g
        colors[i3 + 2] = c.b
        written++
      }
      def.count = written

      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
      geo.setDrawRange(0, def.count)

      const mat = new THREE.PointsMaterial({
        size: def.size * (0.55 + Math.random() * 1.15),
        map: def.tex,
        vertexColors: true,
        transparent: true,
        opacity: baseOpacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
        alphaTest: 0.02
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
    for (let c = 0; c < 11; c++) {
      const gCount = 1400
      const gPos = new Float32Array(gCount * 3)
      const gCol = new Float32Array(gCount * 3)
      const baseHue = cloudHues[c]

      for (let i = 0; i < gCount; i++) {
        const i3 = i * 3
        const spread = 9 + Math.random() * 16
        gPos[i3] = (Math.random() - 0.5) * spread + (Math.random() - 0.5) * 7
        gPos[i3 + 1] = (Math.random() - 0.5) * (spread * 0.38)
        gPos[i3 + 2] = (Math.random() - 0.5) * spread + (Math.random() - 0.5) * 7
        const h = (baseHue + (Math.random() - 0.5) * 0.35 + Math.random() * 0.25 + 1) % 1
        const col = new THREE.Color().setHSL(h, 0.35 + Math.random() * 0.45, 0.62 + Math.random() * 0.28)
        gCol[i3] = col.r
        gCol[i3 + 1] = col.g
        gCol[i3 + 2] = col.b
      }

      const gGeo = new THREE.BufferGeometry()
      gGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3))
      gGeo.setAttribute('color', new THREE.BufferAttribute(gCol, 3))

      const gMat = new THREE.PointsMaterial({
        size: 0.06 + Math.random() * 0.14,
        vertexColors: true,
        transparent: true,
        opacity: 0.09 + Math.random() * 0.07,
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

    // Distant hyperreal star field (background depth)
    {
      const n = 2800
      const pos = new Float32Array(n * 3)
      const col = new Float32Array(n * 3)
      for (let i = 0; i < n; i++) {
        const i3 = i * 3
        const r = 18 + Math.random() * 40
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        pos[i3] = r * Math.sin(phi) * Math.cos(theta)
        pos[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.55
        pos[i3 + 2] = r * Math.cos(phi)
        const c = new THREE.Color().setHSL(
          Math.random(),
          0.35 + Math.random() * 0.4,
          0.65 + Math.random() * 0.3
        )
        col[i3] = c.r; col[i3 + 1] = c.g; col[i3 + 2] = c.b
      }
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
      const pts = new THREE.Points(geo, new THREE.PointsMaterial({
        size: 0.035,
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true
      }))
      scene.add(pts)
    }

    // Core black hole — 30% smaller, more orbital chaos
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 64, 64),
      new THREE.MeshBasicMaterial({ color: 0x000000 })
    )
    scene.add(core)
    coreRef.current = core

    const horizon = new THREE.Mesh(
      new THREE.RingGeometry(0.28, 0.44, 96),
      new THREE.MeshBasicMaterial({
        color: 0x7b3fd5,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
    )
    horizon.rotation.x = Math.PI / 2.05
    scene.add(horizon)
    horizonRef.current = horizon

    const photon = new THREE.Mesh(
      new THREE.RingGeometry(0.42, 0.55, 96),
      new THREE.MeshBasicMaterial({
        color: 0xb8f0ff,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      })
    )
    photon.rotation.x = Math.PI / 2.12
    scene.add(photon)
    photonRef.current = photon

    // Dense warp ring chaos around smaller core
    for (let ri = 0; ri < 8; ri++) {
      const inner = 0.26 + ri * 0.055
      const wr = new THREE.Mesh(
        new THREE.RingGeometry(inner, inner + 0.035, 80),
        new THREE.MeshBasicMaterial({
          color: new THREE.Color().setHSL(0.65 + ri * 0.06, 0.9, 0.55 + (ri % 3) * 0.08),
          transparent: true,
          opacity: 0.1 + (ri % 2) * 0.08,
          side: THREE.DoubleSide,
          blending: THREE.AdditiveBlending
        })
      )
      wr.rotation.x = Math.PI / 2 + (ri - 3.5) * 0.11
      wr.rotation.y = (ri % 3) * 0.15
      wr.rotation.z = ri * 0.55
      wr.userData = { spin: 0.006 + ri * 0.003, tilt: 0.0025 * (ri + 1), wobble: 0.4 + ri * 0.12 }
      scene.add(wr)
      if (!warpRingsRef.current) warpRingsRef.current = []
      warpRingsRef.current.push(wr)
    }

    const aura = new THREE.Mesh(
      new THREE.SphereGeometry(2.1, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x6a40a0,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
      })
    )
    scene.add(aura)
    auraRef.current = aura

    let frameId
    const clock = new THREE.Clock()
    let smoothTyping = 0

    const animate = () => {
      frameId = requestAnimationFrame(animate)
      const t = clock.getElapsedTime()
      const now = performance.now()

      // Rainbow color drift on all shape layers
      for (const layer of layersRef.current) {
        layer.pts.rotation.y = t * 0.0028
        layer.pts.rotation.z = Math.sin(t * 0.022) * 0.012
        const cols = layer.geo.attributes.color
        for (let i = 0; i < layer.count; i++) {
          layer.hues[i] = (layer.hues[i] + 0.00014) % 1 // pastel rainbow drift
          const c = new THREE.Color().setHSL(
            layer.hues[i],
            0.58 + 0.12 * Math.sin(t * 0.15 + layer.hues[i] * 6.28),
            0.52 + 0.28 * (layer.hues[i] % 0.2 > 0.1 ? 1 : 0.55)
          )
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
        // pastel fog-element color shift (Gram-style style channel drift)
        if (cloud.material && cloud.geometry?.attributes?.color) {
          const cols = cloud.geometry.attributes.color
          const n = Math.min(80, cols.count || (cols.array.length / 3))
          for (let i = 0; i < n; i++) {
            const i3 = ((i * 17) % (cols.array.length / 3)) * 3
            const h = (t * 0.02 + i * 0.07 + cloud.userData.phase) % 1
            const c = new THREE.Color().setHSL(h, 0.4, 0.7)
            cols.array[i3] += (c.r - cols.array[i3]) * 0.02
            cols.array[i3 + 1] += (c.g - cols.array[i3 + 1]) * 0.02
            cols.array[i3 + 2] += (c.b - cols.array[i3 + 2]) * 0.02
          }
          cols.needsUpdate = true
        }
      }
      // Pastel-shifting atmospheric fog
      if (scene.fog && scene.fog.color) {
        const fh = (t * 0.018) % 1
        scene.fog.color.setHSL(fh, 0.32, 0.11 + 0.04 * Math.sin(t * 0.11))
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


      // Whole-system ~5° living wobble
      if (sceneRef.current) {
        sceneRef.current.rotation.x = Math.sin(t * 0.07) * 0.045
        sceneRef.current.rotation.z = Math.cos(t * 0.055) * 0.028
      }
      // Warp ring chaos
      if (warpRingsRef.current) {
        for (const wr of warpRingsRef.current) {
          const w = wr.userData.wobble || 1
          wr.rotation.z += wr.userData.spin
          wr.rotation.x += wr.userData.tilt * Math.sin(t * 1.4 * w)
          wr.rotation.y += wr.userData.spin * 0.35 * Math.cos(t * w)
          wr.material.opacity = 0.08 + 0.14 * Math.abs(Math.sin(t * 2.6 + wr.userData.spin * 80))
        }
      }
      // Born stars pulse / type personality (glow + gentle scale)
      for (const s of starsRef.current) {
        if (!s.mesh) continue
        const age = (now - s.born) / 1000
        if (age < 1.2) {
          const k = Math.min(1, age / 1.2)
          s.mesh.scale.setScalar(0.02 + (s.finalSize - 0.02) * k)
          if (s.glow) s.glow.material.opacity = k * 0.85
          s.mesh.material.opacity = k
        } else if (s.pulse && s.glow) {
          const p = 0.55 + 0.4 * Math.sin(t * (1.5 + s.pulse * 2.5) + s.angle)
          s.glow.material.opacity = p
          if (s.starType === 'quasar' || s.starType === 'neutron') {
            const sc = s.finalSize * (1 + Math.sin(t * 4 + s.angle) * 0.06 * s.pulse)
            s.mesh.scale.setScalar(sc)
          }
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

      camera.position.x = Math.sin(t * 0.028) * 0.14
      camera.position.y = 0.5 + Math.sin(t * 0.05) * 0.08
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

  const wakeTyping = () => {
    typingRef.current = 1
    setIsTyping(true)
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      typingRef.current = 0
      setIsTyping(false)
    }, 1200)
  }

  const handleInputChange = (e) => {
    setQuery(e.target.value)
    setPath('chat')
    wakeTyping()
  }

  const handleBuildChange = (e) => {
    setQueryBuild(e.target.value)
    setPath('build')
    wakeTyping()
  }

  const birthFromInput = (text) => {
    const hue = path === 'chat' ? 0.55 + Math.random() * 0.25 : Math.random()
    const x = (Math.random() - 0.5) * 8
    const y = (Math.random() - 0.5) * 4
    const z = (Math.random() - 0.5) * 5 - 0.5
    birthStar({ x, y, z, hue })
    fetch(`${API}/api/stars`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ x, y, z, hue, text, path: path || 'build' })
    }).catch(() => {})
  }

  const submitPath = async (which, textRaw) => {
    const text = textRaw.trim()
    if (!text) return

    birthFromInput(text)
    setResponse(which === 'chat' ? 'The entity is listening…' : 'input initiates creation')
    setResponseKey(k => k + 1)
    setStatus(which === 'chat' ? 'conversing…' : 'routing…')

    const endpoint = which === 'chat' ? '/api/chat' : '/api/intent'
    try {
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, path: which })
      })
      const data = await res.json()

      if (data.reply) {
        setResponse(data.reply)
        setResponseKey(k => k + 1)
      }
      setStatus(data.status || '')
      setNeedsMore(!!data.needsMore && which === 'build')
      setMorePrompt(data.morePrompt || '')
      if (!data.needsMore) {
        if (which === 'chat') setQuery('')
        else {
          setQueryBuild('')
          setMoreText('')
        }
      }
    } catch {
      setStatus('offline core — still recorded in the field')
      if (which === 'chat') setQuery('')
      else setQueryBuild('')
    }
  }

  const handleChatSubmit = (e) => {
    e.preventDefault()
    submitPath('chat', needsMore ? moreText : query)
  }

  const handleBuildSubmit = (e) => {
    e.preventDefault()
    submitPath('build', needsMore ? moreText : queryBuild)
  }

  return (
    <div className="landing">
      <div className="canvas-wrap" ref={mountRef} />

      <div className="content">
        <h1
          className={`logo ${isActivating ? 'logo-activate' : ''} ${initialGlitch ? 'glitch' : ''}`}
          data-text="XhumAI"
        >
          XhumAI
        </h1>
        <p className={`tagline ${initialGlitch ? 'glitch' : ''}`} data-text="WORK LESS. LIVE MORE.">WORK LESS. LIVE MORE.</p>
        <p className={`purpose ${initialGlitch ? 'glitch' : ''}`} data-text="Intelligence That Evolves With You">
          Intelligence That Evolves With You
        </p>

        <div className={`dual-fields ${initialGlitch ? 'glitch' : ''}`}>
          <form onSubmit={handleChatSubmit} className="field-chat">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="communicate with me"
              className={isTyping && path === 'chat' ? 'input-awake' : ''}
            />
            <button type="submit" className="sr-only">Send</button>
          </form>

          <form onSubmit={handleBuildSubmit} className="field-build">
            <input
              type="text"
              value={queryBuild}
              onChange={handleBuildChange}
              placeholder="build your future"
              disabled={needsMore}
              className={isTyping && path === 'build' ? 'input-awake' : ''}
            />
            {needsMore && (
              <textarea
                className="more-input"
                value={moreText}
                onChange={(e) => setMoreText(e.target.value)}
                placeholder={morePrompt || 'Provide more details...'}
                rows={3}
              />
            )}
            <button type="submit" className="sr-only">Send</button>
          </form>
        </div>

        <p className={`response ${initialGlitch ? 'glitch' : ''}`} key={responseKey} data-text={response}>{response}</p>
        {status && <p className={`status ${initialGlitch ? 'glitch' : ''}`} data-text={status}>{status}</p>}
        <p className="universe-note">input initiates creation</p>
      </div>
    </div>
  )
}

export default App
