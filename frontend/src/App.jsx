import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [capabilities, setCapabilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Summarizer
  const [inputText, setInputText] = useState('')
  const [summary, setSummary] = useState('')
  const [summarizing, setSummarizing] = useState(false)

  // Admin
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState(null)
  const [agents, setAgents] = useState([])

  useEffect(() => {
    // Load capabilities
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

    // Load admin data
    loadAdmin()
  }, [])

  const loadAdmin = () => {
    fetch('http://localhost:3001/api/admin/logs')
      .then(res => res.json())
      .then(data => setLogs(data.logs || []))
      .catch(() => {})

    fetch('http://localhost:3001/api/admin/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {})

    fetch('http://localhost:3001/api/agents')
      .then(res => res.json())
      .then(data => setAgents(data.agents || []))
      .catch(() => {})
  }

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
      // Refresh logs after run
      loadAdmin()
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

        {/* Summarizer */}
        <div className="summarizer-box">
          <h2>Text Summarizer (Live)</h2>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste any long text here..."
            rows={5}
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

        {/* Admin Section */}
        <div className="admin-section">
          <h2>Admin · Usage & Agents</h2>

          {stats && (
            <div className="stats">
              <div className="stat-card">Total Runs: <strong>{stats.total}</strong></div>
              <div className="stat-card">Success: <strong>{stats.success}</strong></div>
              <div className="stat-card">Failed: <strong>{stats.failed}</strong></div>
            </div>
          )}

          <h3>Recent Usage Logs</h3>
          <div className="logs">
            {logs.length === 0 && <p>No usage yet. Run the summarizer a few times.</p>}
            {logs.map((log, i) => (
              <div key={i} className="log-entry">
                <span className={log.success ? 'ok' : 'fail'}>
                  {log.success ? '✓' : '✗'}
                </span>
                <span className="cap">{log.capabilityId}</span>
                <span className="time">{new Date(log.timestamp).toLocaleTimeString()}</span>
                {log.durationMs && <span className="ms">{log.durationMs}ms</span>}
              </div>
            ))}
          </div>

          <h3>Agent Stubs</h3>
          <div className="agents">
            {agents.map(agent => (
              <div key={agent.id} className="agent-card">
                <strong>{agent.name}</strong>
                <p>{agent.description}</p>
                <span className="status">{agent.status}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
