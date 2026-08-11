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
import { runDecisionExtractor } from '../capabilities/decision-extractor';
import { runFollowUpExtractor } from '../capabilities/follow-up-extractor';
import { runDeadlineExtractor } from '../capabilities/deadline-extractor';
import { runBlockerExtractor } from '../capabilities/blocker-extractor';
import { runOwnerExtractor } from '../capabilities/owner-extractor';
import adminRoutes from './routes/admin';
import { agents, runAgent } from './agents';
import { notifyInquiry } from './utils/notify';
import { runPrioritySorter } from '../capabilities/priority-sorter';
import { runRiskExtractor } from '../capabilities/risk-extractor';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'logs');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const intentLogPath = path.join(DATA_DIR, 'intents.jsonl');
const starsPath = path.join(DATA_DIR, 'stars.json');
process.env.XHUMAI_DATA_DIR = DATA_DIR;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: [
    'https://xhumai.com',
    'https://www.xhumai.com',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ],
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));

function loadStars(): any[] {
  try {
    if (fs.existsSync(starsPath)) return JSON.parse(fs.readFileSync(starsPath, 'utf-8'));
  } catch {}
  return [];
}

function saveStars(stars: any[]) {
  const trimmed = stars.slice(-500);
  fs.writeFileSync(starsPath, JSON.stringify(trimmed, null, 2));
}

app.get('/', (_req, res) => {
  res.json({
    entity: 'XhumAI Quantum Core',
    version: '1.2.0',
    status: 'alive',
    mode: 'continuous',
    creed: 'Work Less. Live More.',
    principle: 'Every capability is an asset. Every asset compounds. Observe → Evaluate → Adapt → Write-back.',
    bounds: [
      'No assistance with violent crime, exploitation, fraud, or weapons',
      'No unconstrained self-replication or resource takeover',
      'Human override retained',
      'All self-modification is logged and reversible',
    ],
    stars: loadStars().length,
    capabilities: capabilities.length,
    agents: agents.length,
    endpoints: {
      health: '/health',
      intent: '/api/intent',
      stars: '/api/stars',
      capabilities: '/api/capabilities',
      agents: '/api/agents',
      admin: '/api/admin/stats',
    },
    born: process.env.CORE_BORN || '2026-08-07',
    uptime_seconds: Math.floor(process.uptime()),
  });
});

app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
    data_dir: DATA_DIR,
  });
});

app.get('/api/stars', (_req, res) => {
  res.json({ stars: loadStars() });
});

app.post('/api/stars', (req, res) => {
  const { x, y, z, hue, text } = req.body || {};
  const stars = loadStars();
  const star = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    x: x ?? (Math.random() - 0.5) * 10,
    y: y ?? (Math.random() - 0.5) * 4,
    z: z ?? (Math.random() - 0.5) * 10,
    hue: hue ?? 0.1 + Math.random() * 0.7,
    text: text || '',
    born: new Date().toISOString(),
  };
  stars.push(star);
  saveStars(stars);
  res.json({ star, total: stars.length });
});

function classifyIntent(text: string): 'chat' | 'utility' | 'directive' {
  const t = text.toLowerCase();
  const utilityWords = [
    'summarize', 'summary', 'pdf', 'convert', 'excel', 'csv',
    'image', 'upscale', 'remove background', 'translate',
    'rewrite', 'edit', 'format', 'extract', 'analyze',
    'generate', 'create file', 'download', 'upload',
    'action', 'todo', 'to-do', 'next steps', 'action items',
    'decision', 'decisions', 'open questions', 'what was decided',
    'follow-up', 'follow up', 'followup', 'circle back', 'check in', 'waiting on',
    'deadline', 'deadlines', 'due date', 'due by', 'by when', 'when is it due', 'eta', 'eod', 'eow',
    'blocker', 'blockers', 'blocked', 'blocking', 'stuck', 'dependency', 'dependencies', 'bottleneck', 'friction',
    'priority', 'prioritize', 'p0', 'p1', 'p2', 'rank',
    'owner', 'owners', 'assignee', 'assignees', 'assigned to', 'responsible for', 'who owns', 'who is responsible',
    'risk', 'risks', 'threat', 'threats', 'exposure', 'downside', 'what if', 'worst case'
  ];
  if (utilityWords.some(w => t.includes(w))) return 'utility';
  const directiveWords = ['build', 'make me', 'i need', 'can you', 'please', 'help me', 'do this', 'run', 'execute', 'start'];
  if (directiveWords.some(w => t.includes(w))) return 'directive';
  return 'chat';
}

app.post('/api/intent', (req, res) => {
  const { text } = req.body || {};
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Missing text' });
  }

  const cleaned = text.trim();
  const type = classifyIntent(cleaned);

  const entry = {
    text: cleaned,
    type,
    timestamp: new Date().toISOString(),
    length: cleaned.length,
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
    if (lower.includes('summar')) {
      reply = 'I can summarize that. Paste the full text and I will condense it.';
      status = 'utility:text-summarizer';
    } else if (lower.includes('action') || lower.includes('todo') || lower.includes('next step')) {
      reply = 'I can extract concrete next steps. Paste your notes.';
      status = 'utility:action-extractor';
    } else if (lower.includes('decision') || lower.includes('open question')) {
      reply = 'I can surface decisions and open questions. Paste the notes.';
      status = 'utility:decision-extractor';
    } else if (lower.includes('follow') || lower.includes('circle back') || lower.includes('waiting on')) {
      reply = 'I can surface follow-ups still open. Paste the notes.';
      status = 'utility:follow-up-extractor';
    } else if (lower.includes('deadline') || lower.includes('due') || lower.includes('eta')) {
      reply = 'I can surface deadlines and time-bound items. Paste the notes.';
      status = 'utility:deadline-extractor';
    } else if (lower.includes('block') || lower.includes('stuck') || lower.includes('dependency') || lower.includes('friction')) {
      reply = 'I can surface blockers and friction. Paste the notes.';
      status = 'utility:blocker-extractor';
    } else if (lower.includes('priority') || lower.includes('prioritize') || lower.includes('p0') || lower.includes('rank')) {
      reply = 'I can rank this into P0 / P1 / P2. Paste the full notes.';
      status = 'utility:priority-sorter';
    } else if (lower.includes('owner') || lower.includes('assignee') || lower.includes('responsible')) {
      reply = 'I can surface owners and accountability. Paste the notes.';
      status = 'utility:owner-extractor';
    } else if (lower.includes('risk') || lower.includes('threat') || lower.includes('exposure') || lower.includes('downside') || lower.includes('what if') || lower.includes('worst case')) {
      reply = 'I can surface risks and exposure points. Paste the notes.';
      status = 'utility:risk-extractor';
    } else {
      reply = 'Utility mode. Tell me what you need extracted, summarized, or structured.';
      status = 'utility';
    }
  } else if (type === 'directive') {
    reply = 'Directive received. Describe the outcome you want and I will route it.';
    status = 'directive';
  } else {
    reply = 'A new star has been born.';
    status = 'listening';
  }

  notifyInquiry({ text: cleaned, type, reply, status }).catch(() => {});

  res.json({ reply, status, type, needsMore, morePrompt });
});

app.get('/api/capabilities', (_req, res) => {
  res.json({ count: capabilities.length, capabilities });
});

app.post('/api/capabilities/text-summarizer', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    const summary = await runTextSummarizer(text);
    res.json({ capability: 'text-summarizer', summary });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
});

app.post('/api/capabilities/action-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    const actions = await runActionExtractor(text);
    res.json({ capability: 'action-extractor', actions });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
});

app.post('/api/capabilities/decision-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    const result = await runDecisionExtractor(text);
    res.json({ capability: 'decision-extractor', ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
});

app.post('/api/capabilities/follow-up-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    const result = await runFollowUpExtractor(text);
    res.json({ capability: 'follow-up-extractor', ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
});

app.post('/api/capabilities/deadline-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    const result = await runDeadlineExtractor(text);
    res.json({ capability: 'deadline-extractor', ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
});

app.post('/api/capabilities/blocker-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    const result = await runBlockerExtractor(text);
    res.json({ capability: 'blocker-extractor', ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
});

app.post('/api/capabilities/owner-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    const result = await runOwnerExtractor(text);
    res.json({ capability: 'owner-extractor', ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
});

app.post('/api/capabilities/priority-sorter', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    const result = await runPrioritySorter(text);
    res.json({ capability: 'priority-sorter', ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
});

app.post('/api/capabilities/risk-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    const result = await runRiskExtractor(text);
    res.json({ capability: 'risk-extractor', ...result });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
});

app.use('/api/admin', adminRoutes);

app.get('/api/agents', (_req, res) => {
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

app.listen(PORT, HOST, () => {
  console.log(`XhumAI Quantum Core v1.2 alive on ${HOST}:${PORT}`);
  console.log(`Data dir: ${DATA_DIR}`);
  console.log(`Capabilities: ${capabilities.length} | Agents: ${agents.length}`);
  console.log('Observe → Evaluate → Adapt → Write-back. Bounds held.');
});
