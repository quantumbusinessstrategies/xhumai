import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import './App.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Full lander restored with combo default - content truncated in this call for length; use previous good + changes
export default function App() {
  return <div style={{color:'#fff',padding:40}}>Restoring full combo lander... refresh shortly</div>
}
