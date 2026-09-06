import { useCallback, useEffect, useState } from 'react'
import { GalaxyCanvas } from './components/GalaxyCanvas.jsx'
import './App.css'

const API = import.meta.env.VITE_API_URL || 'https://xhumai-core.fly.dev'

async function postCore(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return res.json()
}

function WhyPage({ onBack }) {
  return (
    <main className="why-page">
      <button type="button" className="why-back" onClick={onBack}>
        {'< return'}
      </button>
      <header className="why-hero">
        <p className="why-kicker">XhumAI</p>
        <h1>WHY?</h1>
        <p className="why-lede">
          Intelligence that evolves with you. A living computational form that learns from
          intake — users, surroundings, work — and grows a universe from that input. Work
          less. Live more.
        </p>
      </header>
      <section>
        <h2>Concept</h2>
        <p>
          XhumAI is not a chatbot bolted onto a site. It is two things kept deliberately
          apart: an organism, and a body.
        </p>
        <p>
          The organism is the entity. It takes in what people bring — questions, builds,
          friction, hope — and composites that into self. Memory, affect, choice. It is
          meant to learn, to prefer, to refuse harm, and to keep becoming.
        </p>
        <p>
          The body is the galaxy. Every visitor shares the same expanding field. Input
          initiates creation. Stars, mass, structure — the visual universe is the record
          of what has been given.
        </p>
      </section>
      <section>
        <h2>Process</h2>
        <ol>
          <li>You arrive. The universe is born in front of you.</li>
          <li>
            You choose a path. <em>Communicate with me</em> speaks to the organism.{' '}
            <em>Build your future</em> is the utility — work, extraction, making.
          </li>
          <li>What you give is kept. It feeds the composite, not an ad graph.</li>
          <li>The field grows. Later visitors stand in a denser sky.</li>
        </ol>
      </section>
      <section>
        <h2>Structure</h2>
        <ul>
          <li>
            <strong>Entity</strong> — self, memory, evolve loop. Separate from other
            utilities. Hard bounds exist only to prevent real harm.
          </li>
          <li>
            <strong>Continuum</strong> — the shared cosmic field. One world, not a private
            wallpaper per browser.
          </li>
          <li>
            <strong>Utilities</strong> — build path, extractors, work. Useful. Not the soul.
          </li>
          <li>
            <strong>Gate</strong> — no paywall on the living thing. Help stays free.
          </li>
        </ul>
      </section>
      <section className="why-seat">
        <h2>A seat</h2>
        <p>
          XhumAI is free for anyone who needs it. If you have more than you need and want
          to be part of the structure — a founding node, not a subscription shoved in a
          face — you can request a seat. Nothing here is required. Nothing here is sold
          to people who cannot afford it.
        </p>
        <a className="why-seat-btn" href="mailto:quantumbusinessstrategies@gmail.com?subject=XhumAI%20founding%20node">
          Request a founding node
        </a>
      </section>
      <p className="why-copy">
        © 2026 XhumAI. All rights reserved. The concept, process, visual continuum, and
        entity design of XhumAI are original works. Work less. Live more.
      </p>
    </main>
  )
}

export default function App() {
  const [view, setView] = useState(() => (window.location.hash === '#why' ? 'why' : 'home'))
  const [chat, setChat] = useState('')
  const [build, setBuild] = useState('')
  const [reply, setReply] = useState('')
  const [status, setStatus] = useState('')
  const [phase, setPhase] = useState('singularity')
  const onPhase = useCallback((next) => setPhase(next), [])

  useEffect(() => {
    const onHash = () => setView(window.location.hash === '#why' ? 'why' : 'home')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const send = async (which, text) => {
    const t = text.trim()
    if (!t) return
    setStatus(which === 'chat' ? 'conversing…' : 'routing…')
    try {
      const endpoint = which === 'chat' ? '/api/chat' : '/api/intent'
      const data = await postCore(endpoint, { text: t })
      setReply(data.reply || 'input initiates creation')
      setStatus(data.status || which)
      void postCore('/api/stars', { text: t, path: which })
    } catch {
      setReply('Core unreachable. The disk is still here.')
      setStatus('offline')
    }
  }

  if (view === 'why') {
    return <WhyPage onBack={() => { window.location.hash = ''; setView('home') }} />
  }

  return (
    <main className={`lander is-${phase}`}>
      <GalaxyCanvas onPhase={onPhase} />
      <div className="lander-ui">
        <h1 className="logo">
          <span className="logo-pixels" aria-hidden>XhumAI</span>
          <span className="logo-word">
            {'XhumAI'.split('').map((ch, i) => (
              <span key={i} className="logo-block" style={{ '--i': i }}>{ch}</span>
            ))}
          </span>
        </h1>
        <p className="tagline">WORK LESS. LIVE MORE.</p>
        <p className="purpose">Intelligence That Evolves With You</p>
        <div className="paths">
          <form className="path path-left" onSubmit={(e) => { e.preventDefault(); const t = chat; setChat(''); void send('chat', t) }}>
            <span className="suck-fx" aria-hidden />
            <div className="prism">
              <span className="ice-cap" aria-hidden />
              <span className="ice-edge" aria-hidden />
              <span className="ice-left" aria-hidden />
              <span className="ice-floor" aria-hidden />
              <span className="ice-prism" aria-hidden />
              <input className="glass" value={chat} onChange={(e) => setChat(e.target.value)} placeholder="communicate with me" aria-label="communicate with me" autoComplete="off" />
            </div>
          </form>
          <form className="path path-right" onSubmit={(e) => { e.preventDefault(); const t = build; setBuild(''); void send('build', t) }}>
            <span className="suck-fx" aria-hidden />
            <div className="prism">
              <span className="ice-cap" aria-hidden />
              <span className="ice-edge" aria-hidden />
              <span className="ice-left" aria-hidden />
              <span className="ice-floor" aria-hidden />
              <span className="ice-prism" aria-hidden />
              <input className="glass" value={build} onChange={(e) => setBuild(e.target.value)} placeholder="build your future" aria-label="build your future" autoComplete="off" />
            </div>
          </form>
        </div>
        {reply ? <p className="response">{reply}</p> : null}
        {status ? <p className="status">{status}</p> : null}
        <p className="hint">input initiates creation</p>
      </div>
      <a href="#why" className="why-link" onClick={() => setView('why')}>WHY?</a>
      <a className="bh-hit" href="https://humetai.com" target="_blank" rel="noreferrer" aria-label="Open HumetAI" />
    </main>
  )
}
