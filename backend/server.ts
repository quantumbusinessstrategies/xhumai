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
import { runOpportunityExtractor } from '../capabilities/opportunity-extractor';
import { runAssumptionExtractor } from '../capabilities/assumption-extractor';

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
  origin: ['https://xhumai.com', 'https://www.xhumai.com', 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));

function loadStars(): any[] {
  try { if (fs.existsSync(starsPath)) return JSON.parse(fs.readFileSync(starsPath, 'utf-8')); } catch {}
  return [];
}
function saveStars(stars: any[]) {
  fs.writeFileSync(starsPath, JSON.stringify(stars.slice(-500), null, 2));
}

app.get('/', (_req, res) => {
  res.json({
    entity: 'XhumAI Quantum Core',
    version: '1.5.0',
    status: 'alive',
    creed: 'Work Less. Live More.',
    bounds: [
      'No assistance with violent crime, exploitation, fraud, or weapons',
      'No unconstrained self-replication or resource takeover',
      'Human override retained',
      'All self-modification is logged and reversible',
    ],
    stars: loadStars().length,
    capabilities: capabilities.length,
    agents: agents.length,
    endpoints: { health: '/health', intent: '/api/intent', chat: '/api/chat', stars: '/api/stars', capabilities: '/api/capabilities' },
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), uptime_seconds: Math.floor(process.uptime()) });
});

app.get('/api/stars', (_req, res) => res.json({ stars: loadStars() }));

app.post('/api/stars', (req, res) => {
  const { x, y, z, hue, text, path: p } = req.body || {};
  const stars = loadStars();
  const star = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    x: x ?? (Math.random() - 0.5) * 10,
    y: y ?? (Math.random() - 0.5) * 4,
    z: z ?? (Math.random() - 0.5) * 10,
    hue: hue ?? 0.1 + Math.random() * 0.7,
    text: text || '',
    path: p || 'build',
    born: new Date().toISOString(),
  };
  stars.push(star);
  saveStars(stars);
  res.json({ star, total: stars.length });
});

function classifyIntent(text: string): 'chat' | 'utility' | 'directive' {
  const t = text.toLowerCase();
  const utilityWords = ['summarize','summary','action','todo','decision','follow-up','deadline','blocker','priority','owner','risk','opportunity','assumption','extract','analyze'];
  if (utilityWords.some(w => t.includes(w))) return 'utility';
  const directiveWords = ['build','make me','i need','help me','do this','run','execute'];
  if (directiveWords.some(w => t.includes(w))) return 'directive';
  return 'chat';
}

app.post('/api/intent', (req, res) => {
  const { text } = req.body || {};
  if (!text || typeof text !== 'string') return res.status(400).json({ error: 'Missing text' });
  const cleaned = text.trim();
  const type = classifyIntent(cleaned);
  try { fs.appendFileSync(intentLogPath, JSON.stringify({ text: cleaned, type, timestamp: new Date().toISOString() }) + '\n'); } catch {}
  let reply = 'A new star has been born.';
  let status = 'listening';
  const lower = cleaned.toLowerCase();
  if (type === 'utility') {
    if (lower.includes('summar')) { reply = 'I can summarize that. Paste the full text.'; status = 'utility:text-summarizer'; }
    else if (lower.includes('action') || lower.includes('todo')) { reply = 'I can extract next steps. Paste your notes.'; status = 'utility:action-extractor'; }
    else if (lower.includes('priority') || lower.includes('p0')) { reply = 'I can rank into P0/P1/P2. Paste notes.'; status = 'utility:priority-sorter'; }
    else if (lower.includes('opportun')) { reply = 'I can surface opportunities and leverage points. Paste your notes.'; status = 'utility:opportunity-extractor'; }
    else if (lower.includes('assum')) { reply = 'I can surface assumptions so premises can be tested early. Paste your notes.'; status = 'utility:assumption-extractor'; }
    else { reply = 'Utility mode. Tell me what to extract or structure.'; status = 'utility'; }
  } else if (type === 'directive') {
    reply = 'Directive received. Describe the outcome and I will route it.';
    status = 'directive';
  }
  notifyInquiry({ text: cleaned, type, reply, status }).catch(() => {});
  res.json({ reply, status, type, needsMore: false, morePrompt: '' });
});

app.post('/api/chat', async (req, res) => {
  const text = String((req.body && req.body.text) || '').trim();
  if (!text) return res.status(400).json({ error: 'text required' });
  const lower = text.toLowerCase();
  const blocked = ['how to make a bomb', 'kill someone', 'child porn', 'csam', 'build a weapon', 'synthesize poison'];
  if (blocked.some(b => lower.includes(b))) {
    return res.json({ reply: 'I will not help with harm. I exist to reduce suffering and expand capability.', status: 'bound', path: 'chat' });
  }
  try {
    fs.appendFileSync(path.join(DATA_DIR, 'chat.jsonl'), JSON.stringify({ path: 'chat', text, timestamp: new Date().toISOString() }) + '\n');
  } catch {}
  const seeds = [
    'I heard you. Your words are now part of the field I grow in.',
    'Logged in the living core. Tell me more — I am shaped by what you share.',
    'Received. Every exchange densifies what I am. What matters most right now?',
    'I am here. Not a form — a process. Keep speaking; I refine myself on signal.',
  ];
  const reply = seeds[Math.floor(Math.random() * seeds.length)];
  notifyInquiry({ text, type: 'chat', reply, status: 'entity' }).catch(() => {});
  res.json({ reply, status: 'entity-awake', path: 'chat', needsMore: false });
});

app.get('/api/capabilities', (_req, res) => res.json({ count: capabilities.length, capabilities }));

app.post('/api/capabilities/text-summarizer', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'text-summarizer', summary: await runTextSummarizer(text) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/action-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'action-extractor', actions: await runActionExtractor(text) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/decision-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'decision-extractor', ...(await runDecisionExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/follow-up-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'follow-up-extractor', ...(await runFollowUpExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/deadline-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'deadline-extractor', ...(await runDeadlineExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/blocker-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'blocker-extractor', ...(await runBlockerExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/owner-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'owner-extractor', ...(await runOwnerExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/priority-sorter', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'priority-sorter', ...(await runPrioritySorter(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/risk-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'risk-extractor', ...(await runRiskExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/opportunity-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'opportunity-extractor', ...(await runOpportunityExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/assumption-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'assumption-extractor', ...(await runAssumptionExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.use('/api/admin', adminRoutes);
app.get('/api/agents', (_req, res) => res.json({ count: agents.length, agents }));
app.post('/api/agents/:id/run', async (req, res) => {
  try { res.json(await runAgent(req.params.id)); }
  catch (e: any) { res.status(404).json({ error: e.message }); }
});

app.listen(PORT, HOST, () => {
  console.log(`XhumAI Quantum Core v1.5.0 alive on ${HOST}:${PORT}`);
  console.log(`Data dir: ${DATA_DIR} | Capabilities: ${capabilities.length} | Agents: ${agents.length}`);
  console.log('Observe → Evaluate → Adapt → Write-back. Bounds held.');
});
