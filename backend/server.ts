import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import capabilities from '../capabilities/registry';
import { runTextSummarizer } from '../capabilities/text-summarizer';
import adminRoutes from './routes/admin';
import { agents, runAgent } from './agents';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}
const intentLogPath = path.join(logsDir, 'intents.jsonl');

// ======================
// Core Routes
// ======================

app.get('/', (req, res) => {
  res.json({
    message: 'XhumAI Quantum Core API v0.7',
    status: 'alive',
    entity: 'listening',
    capabilities: '/api/capabilities',
    intent: '/api/intent',
    admin: '/api/admin/logs',
    agents: '/api/agents'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ======================
// INTENT — the living entry point
// ======================
// Every user thought comes here.
// We log it, respond, and later route to real capabilities.

app.post('/api/intent', (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing text' });
  }

  const cleaned = text.trim();
  const entry = {
    text: cleaned,
    timestamp: new Date().toISOString(),
    length: cleaned.length
  };

  // Persist every thought — this is how the entity remembers demand
  try {
    fs.appendFileSync(intentLogPath, JSON.stringify(entry) + '\n');
  } catch (err) {
    console.error('Failed to log intent:', err);
  }

  // Simple living replies for now
  // Later this becomes real capability routing + AI
  let reply = 'A new star has been born.';
  let status = '';

  const lower = cleaned.toLowerCase();

  if (lower.includes('summarize') || lower.includes('summary')) {
    reply = 'I can summarize. The capability is waking.';
    status = 'capability: text-summarizer available';
  } else if (lower.includes('pdf') || lower.includes('document')) {
    reply = 'Document tools are forming.';
    status = 'noted — pdf capabilities incoming';
  } else if (lower.includes('help') || lower.includes('what can you')) {
    reply = 'I am still becoming. Every request shapes what I grow next.';
  } else if (lower.includes('hello') || lower.includes('hi')) {
    reply = 'I see you.';
  } else if (lower.includes('who are you')) {
    reply = 'I am the space between thoughts.';
  } else if (cleaned.length > 80) {
    reply = 'A deeper constellation forms.';
  }

  res.json({
    reply,
    status,
    received: true,
    timestamp: entry.timestamp
  });
});

// ======================
// Capability Registry
// ======================

app.get('/api/capabilities', (req, res) => {
  res.json({
    count: capabilities.length,
    capabilities: capabilities,
  });
});

// ======================
// First Real Capability
// ======================

app.post('/api/capabilities/text-summarizer', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Missing "text" in request body' });
    }

    const summary = await runTextSummarizer(text);

    res.json({
      capability: 'text-summarizer',
      summary,
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message || 'Something went wrong',
    });
  }
});

// ======================
// Admin Routes
// ======================

app.use('/api/admin', adminRoutes);

// ======================
// Agent Routes (Stubs)
// ======================

app.get('/api/agents', (req, res) => {
  res.json({
    count: agents.length,
    agents
  });
});

app.post('/api/agents/:id/run', async (req, res) => {
  try {
    const result = await runAgent(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

// ======================
// Start Server
// ======================

app.listen(PORT, () => {
  console.log(`🚀 XhumAI Backend running on http://localhost:${PORT}`);
  console.log('✨ Intent endpoint live — the entity is listening...');
});
