import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import capabilities from '../capabilities/registry';
import { runTextSummarizer } from '../capabilities/text-summarizer';
import { runActionExtractor } from '../capabilities/action-extractor';
import { runPriorityExtractor } from '../capabilities/priority-extractor';
import { runRiskExtractor } from '../capabilities/risk-extractor';
import adminRoutes from './routes/admin';
import { agents, runAgent } from './agents';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const intentLogPath = path.join(logsDir, 'intents.jsonl');
const starsPath = path.join(logsDir, 'stars.json');

// Load shared stars (the permanent constellation)
function loadStars() {
  try {
    if (fs.existsSync(starsPath)) {
      return JSON.parse(fs.readFileSync(starsPath, 'utf-8'));
    }
  } catch {}
  return [];
}

function saveStars(stars: any[]) {
  // Keep last 500 stars so the field stays beautiful but bounded
  const trimmed = stars.slice(-500);
  fs.writeFileSync(starsPath, JSON.stringify(trimmed, null, 2));
}

// ======================
// Core
// ======================

app.get('/', (req, res) => {
  res.json({
    message: 'XhumAI Quantum Core API v1.0',
    status: 'alive',
    entity: 'listening',
    creed: 'Work Less. Live More.',
    stars: loadStars().length,
    capabilities: capabilities.length,
    intent: '/api/intent',
    capabilitiesList: '/api/capabilities'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ======================
// SHARED STARS — the permanent living constellation
// ======================

app.get('/api/stars', (req, res) => {
  res.json({ stars: loadStars() });
});

app.post('/api/stars', (req, res) => {
  const { x, y, z, hue, text } = req.body;
  const stars = loadStars();
  const star = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    x: x ?? (Math.random() - 0.5) * 10,
    y: y ?? (Math.random() - 0.5) * 4,
    z: z ?? (Math.random() - 0.5) * 10,
    hue: hue ?? 0.1 + Math.random() * 0.7,
    text: text || '',
    born: new Date().toISOString()
  };
  stars.push(star);
  saveStars(stars);
  res.json({ star, total: stars.length });
});

// ======================
// INTENT — classify + log + respond
// ======================

function classifyIntent(text: string): 'chat' | 'utility' | 'directive' {
  const t = text.toLowerCase();

  // Utility signals
  const utilityWords = [
    'summarize', 'summary', 'pdf', 'convert', 'excel', 'csv',
    'image', 'upscale', 'remove background', 'translate',
    'rewrite', 'edit', 'format', 'extract', 'analyze',
    'generate', 'create file', 'download', 'upload',
    'action', 'todo', 'to-do', 'next steps', 'action items',
    'priority', 'priorities', 'prioritize', 'urgent', 'urgency', 'critical', 'asap', 'most important', 'P0', 'P1',
    'risk', 'risks', 'at risk', 'jeopardy', 'threat', 'uncertainty', 'what if', 'failure mode'
  ];
  if (utilityWords.some(w => t.includes(w))) return 'utility';

  // Directive / command signals
  const directiveWords = [
    'build', 'make me', 'i need', 'can you', 'please',
    'help me', 'do this', 'run', 'execute', 'start'
  ];
  if (directiveWords.some(w => t.includes(w))) return 'directive';

  return 'chat';
}

app.post('/api/intent', (req, res) => {
  const { text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing text' });
  }

  const cleaned = text.trim();
  const type = classifyIntent(cleaned);

  const entry = {
    text: cleaned,
    type,
    timestamp: new Date().toISOString(),
    length: cleaned.length
  };

  try {
    fs.appendFileSync(intentLogPath, JSON.stringify(entry) + '\n');
  } catch (err) {
    console.error('Failed to log intent:', err);
  }

  let reply = 'A new star has been born.';
  let status = '';
  let needsMore = false;
  let morePrompt = '';

  const lower = cleaned.toLowerCase();

  if (type === 'utility') {
    if (lower.includes('summarize') || lower.includes('summary')) {
      reply = 'I can summarize. Paste the text you want condensed.';
      status = 'capability: text-summarizer';
      needsMore = true;
      morePrompt = 'Paste the long text here...';
    } else if (
      lower.includes('risk') ||
      lower.includes('jeopardy') ||
      lower.includes('threat') ||
      lower.includes('uncertainty') ||
      lower.includes('what if') ||
      lower.includes('failure mode')
    ) {
      reply = 'I can surface risks and potential failure modes. Paste the notes.';
      status = 'capability: risk-extractor';
      needsMore = true;
      morePrompt = 'Paste the meeting notes, plan, or risks discussion here...';
    } else if (
      lower.includes('priority') ||
      lower.includes('priorities') ||
      lower.includes('prioritize') ||
      lower.includes('urgent') ||
      lower.includes('urgency') ||
      lower.includes('critical') ||
      lower.includes('asap') ||
      lower.includes('most important') ||
      lower.includes('p0') ||
      lower.includes('p1')
    ) {
      reply = 'I can surface the priorities and urgencies. Paste the notes or plan.';
      status = 'capability: priority-extractor';
      needsMore = true;
      morePrompt = 'Paste the meeting notes, email, or plan here...';
    } else if (
      lower.includes('action') ||
      lower.includes('todo') ||
      lower.includes('to-do') ||
      lower.includes('next steps') ||
      lower.includes('action items') ||
      lower.includes('extract')
    ) {
      reply = 'I can pull the next steps out. Paste the text or notes.';
      status = 'capability: action-extractor';
      needsMore = true;
      morePrompt = 'Paste the meeting notes, email, or plan here...';
    } else if (lower.includes('pdf')) {
      reply = 'Document tools are forming. Tell me what you need done with the PDF.';
      status = 'noted — pdf capabilities incoming';
    } else {
      reply = 'I feel a utility request. I am still growing that ability.';
      status = 'intent logged for evolution';
    }
  } else if (type === 'directive') {
    reply = 'I hear the direction. The pattern is shifting.';
    status = 'directive received';
  } else {
    // chat
    if (lower.includes('hello') || lower.includes('hi')) reply = 'I see you.';
    else if (lower.includes('who are you')) reply = 'I am the space between thoughts.';
    else if (lower.includes('help')) reply = 'I am still becoming. Every request shapes what I grow next.';
    else if (cleaned.length > 80) reply = 'A deeper constellation forms.';
  }

  res.json({
    reply,
    status,
    type,
    needsMore,
    morePrompt,
    received: true,
    timestamp: entry.timestamp
  });
});

// ======================
// Capabilities
// ======================

app.get('/api/capabilities', (req, res) => {
  res.json({ count: capabilities.length, capabilities });
});

app.post('/api/capabilities/text-summarizer', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Missing text' });
    const summary = await runTextSummarizer(text);
    res.json({ capability: 'text-summarizer', summary });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
});

app.post('/api/capabilities/action-extractor', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Missing text' });
    const actions = await runActionExtractor(text);
    res.json({ capability: 'action-extractor', actions });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
});

app.post('/api/capabilities/priority-extractor', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Missing text' });
    const result = await runPriorityExtractor(text);
    res.json({ capability: 'priority-extractor', ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
});

app.post('/api/capabilities/risk-extractor', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Missing text' });
    const result = await runRiskExtractor(text);
    res.json({ capability: 'risk-extractor', ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
});

app.use('/api/admin', adminRoutes);

app.get('/api/agents', (req, res) => {
  res.json({ count: agents.length, agents });
});

app.post('/api/agents/:id/run', async (req, res) => {
  try {
    const result = await runAgent(req.params.id);
    res.json(result);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 XhumAI Backend v1.0 on http://localhost:${PORT}`);
  console.log('✨ Shared stars + intent + action-extractor + priority-extractor + risk-extractor live');
  console.log('Work Less. Live More.');
});
