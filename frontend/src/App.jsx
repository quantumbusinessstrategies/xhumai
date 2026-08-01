import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import './App.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// GOLDEN BASELINE 8d8b2bb — full file pushed next if this is truncated
export default function App() {
  return (
    <div className="landing">
      <div className="content">
        <h1 className="logo">XhumAI</h1>
        <p className="tagline">WORK LESS. LIVE MORE.</p>
        <p className="purpose">Intelligence that evolves with you</p>
        <p className="response">Every thought becomes a star</p>
        <p style={{color:'#f66',marginTop:'2rem'}}>INCOMPLETE — run: git checkout 8d8b2bb -- frontend/src/App.jsx</p>
      </div>
    </div>
  )
}
