import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [capabilities, setCapabilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Summarizer test state
  const [inputText, setInputText] = useState('')
  const [summary, setSummary] = useState('')
  const [summarizing, setSummarizing] = useState(false)

  useEffect(() => {
    fetch('http://localhost:3001/api/capabilities')
      .then(res => res.json())
      .then(data => {
        setCapabilities(data.capabilities || [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const runSummarizer = async () => {
    if (!inputText.trim()) return
    setSummarizing(true)
    setSummary('')

    try {
      const res = await fetch('http://localhost:3001/api/capabilities/text-summarizer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      })
      const data = await res.json()
      if (data.summary) {
        setSummary(data.summary)
      } else {
        setSummary('Error: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      setSummary('Failed to reach backend')
    }
    setSummarizing(false)
  }

  return (
    <div className="app">
      <header>
        <h1>XhumAI</h1>
        <p>Quantum AI OS · Capability Layer</p>
      </header>

      <main>
        {loading && <p>Loading capabilities...</p>}
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}

        {!loading && !error && (
          <div className="capability-grid">
            {capabilities.map(cap => (
              <div key={cap.id} className="capability-card">
                <h3>{cap.name}</h3>
                <p>{cap.description}</p>
                <span className="category">{cap.category}</span>
              </div>
            ))}
          </div>
        )}

        {/* === First Real Capability Test === */}
        <div className="summarizer-box">
          <h2>Text Summarizer (Live Test)</h2>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste any long text here..."
            rows={6}
          />
          <button onClick={runSummarizer} disabled={summarizing}>
            {summarizing ? 'Summarizing...' : 'Run Summarizer'}
          </button>

          {summary && (
            <div className="result">
              <strong>Summary:</strong>
              <p>{summary}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App