import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import capabilities from '../capabilities/registry';
import { runTextSummarizer } from '../capabilities/text-summarizer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));

// ======================
// Core Routes
// ======================

app.get('/', (req, res) => {
  res.json({
    message: 'XhumAI Quantum Core API v0.2',
    status: 'alive',
    capabilities: '/api/capabilities',
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
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
// Start Server
// ======================

app.listen(PORT, () => {
  console.log(`🚀 XhumAI Backend running on http://localhost:${PORT}`);
  console.log('✨ Ready for capability modules + self-improvement hooks...');
});