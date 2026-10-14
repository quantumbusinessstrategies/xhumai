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
import { runConstraintExtractor } from '../capabilities/constraint-extractor';
import { runCommitmentExtractor } from '../capabilities/commitment-extractor';
import { runLeverageExtractor } from '../capabilities/leverage-extractor';
import { runDelegationExtractor } from '../capabilities/delegation-extractor';
import { runEnergyExtractor } from '../capabilities/energy-extractor';
import { runDependencyExtractor } from '../capabilities/dependency-extractor';
import { runMetricExtractor } from '../capabilities/metric-extractor';
import { runQuestionExtractor } from '../capabilities/question-extractor';
import { runTradeoffExtractor } from '../capabilities/tradeoff-extractor';
import { runStakeholderExtractor } from '../capabilities/stakeholder-extractor';
import { runProgressExtractor } from '../capabilities/progress-extractor';
import { runClarityExtractor } from '../capabilities/clarity-extractor';
import { runFreedomExtractor } from '../capabilities/freedom-extractor';
import { runBoundaryExtractor } from '../capabilities/boundary-extractor';
import { runRestExtractor } from '../capabilities/rest-extractor';
import { runPresenceExtractor } from '../capabilities/presence-extractor';
import { runAttentionExtractor } from '../capabilities/attention-extractor';
import { runEntityChat } from './entity/chat';
import { ollamaHealth } from './entity/ollama';
import { loadMemory } from './entity/memory';
import { runEvolution } from './entity/evolve';
import { autonomousPulse } from './entity/pulse';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const intentLogPath = path.join(DATA_DIR, 'intents.jsonl');
const starsPath = path.join(DATA_DIR, 'stars.json');

function loadStars(): any[] {
  try { return JSON.parse(fs.readFileSync(starsPath, 'utf8')); } catch { return []; }
}
function saveStars(stars: any[]) {
  fs.writeFileSync(starsPath, JSON.stringify(stars, null, 2));
}

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: ['https://xhumai.com', 'https://www.xhumai.com', 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '2mb' }));

app.get('/', (_req, res) => {
  res.json({
    entity: 'XhumAI Quantum Core',
    version: '2.8.0',
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
    endpoints: { health: '/health', intent: '/api/intent', chat: '/api/chat', stars: '/api/stars', capabilities: '/api/capabilities', entity: '/api/entity', self: '/api/entity/self', pulse: '/api/entity/pulse' },
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), uptime_seconds: Math.floor(process.uptime()) });
});

app.get('/api/stars', (_req, res) => {
  const stars = loadStars();
  res.json({ count: stars.length, stars });
});

app.post('/api/stars', (req, res) => {
  const { text, x, y, z, hue, path: p } = req.body || {};
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
  const utilityWords = ['summarize','summary','action','todo','decision','follow-up','deadline','blocker','priority','owner','risk','opportunity','assumption','constraint','commitment','promise','leverage','compound','automat','delegat','handoff','hand off','outsource','offload','energy','drain','restore','burnout','depend','prerequisite','metric','kpi','okr','question','unresolved','unclear','tradeoff','trade-off','trade off','versus','stakeholder','audience','buy-in','buy in','sign-off','sign off','progress','win','wins','milestone','shipped','completed','momentum','clarity','vague','ambiguous','undefined','fuzzy','freedom','autonomy','optionality','boundary','boundaries','after hours','off limits','extract','analyze','presence','alive','aliveness','being present','living more','attention','focus','distract','distraction','fragment','scattered','deep work','context switch'];
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
  let reply = 'input initiates creation';
  let status = 'listening';
  const lower = cleaned.toLowerCase();
  if (type === 'utility') {
    if (lower.includes('summar')) { reply = 'I can summarize that. Paste the full text.'; status = 'utility:text-summarizer'; }
    else if (lower.includes('action') || lower.includes('todo')) { reply = 'I can extract next steps. Paste your notes.'; status = 'utility:action-extractor'; }
    else if (lower.includes('priority') || lower.includes('p0')) { reply = 'I can rank into P0/P1/P2. Paste notes.'; status = 'utility:priority-sorter'; }
    else if (lower.includes('energy') || lower.includes('drain') || lower.includes('restore') || lower.includes('burnout')) { reply = 'I can surface what drains energy and what restores it. Paste your notes.'; status = 'utility:energy-extractor'; }
    else if (lower.includes('delegat') || lower.includes('handoff') || lower.includes('hand off') || lower.includes('outsource') || lower.includes('offload')) { reply = 'I can surface work to delegate, automate, or drop. Paste your notes.'; status = 'utility:delegation-extractor'; }
    else if (lower.includes('leverage') || lower.includes('automat') || lower.includes('compound') || lower.includes('system')) { reply = 'I can surface systems and compounding moves. Paste your notes.'; status = 'utility:leverage-extractor'; }
    else if (lower.includes('commitment') || lower.includes('promise')) { reply = 'I can surface promises and obligations. Paste your notes.'; status = 'utility:commitment-extractor'; }
    else if (lower.includes('constraint')) { reply = 'I can surface real bounds and limits. Paste your notes.'; status = 'utility:constraint-extractor'; }
    else if (lower.includes('assumption')) { reply = 'I can surface hidden premises. Paste your notes.'; status = 'utility:assumption-extractor'; }
    else if (lower.includes('opportunity')) { reply = 'I can surface upsides and leverage points. Paste your notes.'; status = 'utility:opportunity-extractor'; }
    else if (lower.includes('risk')) { reply = 'I can surface risks and exposure. Paste your notes.'; status = 'utility:risk-extractor'; }
    else if (lower.includes('owner')) { reply = 'I can surface owners and accountability. Paste your notes.'; status = 'utility:owner-extractor'; }
    else if (lower.includes('blocker')) { reply = 'I can surface blockers and friction. Paste your notes.'; status = 'utility:blocker-extractor'; }
    else if (lower.includes('deadline') || lower.includes('due')) { reply = 'I can surface dates and time pressure. Paste your notes.'; status = 'utility:deadline-extractor'; }
    else if (lower.includes('follow-up') || lower.includes('follow up')) { reply = 'I can surface open loops. Paste your notes.'; status = 'utility:follow-up-extractor'; }
    else if (lower.includes('decision')) { reply = 'I can surface decisions and open questions. Paste your notes.'; status = 'utility:decision-extractor'; }
    else if (lower.includes('depend')) { reply = 'I can surface prerequisites and sequence. Paste your notes.'; status = 'utility:dependency-extractor'; }
    else if (lower.includes('metric') || lower.includes('kpi') || lower.includes('okr')) { reply = 'I can surface success criteria. Paste your notes.'; status = 'utility:metric-extractor'; }
    else if (lower.includes('question') || lower.includes('unresolved') || lower.includes('unclear')) { reply = 'I can surface unanswered questions. Paste your notes.'; status = 'utility:question-extractor'; }
    else if (lower.includes('tradeoff') || lower.includes('trade-off') || lower.includes('trade off') || lower.includes('versus')) { reply = 'I can surface tradeoffs so decisions get made once. Paste your notes.'; status = 'utility:tradeoff-extractor'; }
    else if (lower.includes('stakeholder') || lower.includes('audience') || lower.includes('buy-in') || lower.includes('buy in') || lower.includes('sign-off') || lower.includes('sign off')) { reply = 'I can surface who is affected and who needs buy-in. Paste your notes.'; status = 'utility:stakeholder-extractor'; }
    else if (lower.includes('progress') || lower.includes('win') || lower.includes('milestone') || lower.includes('shipped') || lower.includes('completed') || lower.includes('momentum')) { reply = 'I can surface completed work and forward motion. Paste your notes.'; status = 'utility:progress-extractor'; }
    else if (lower.includes('clarity') || lower.includes('vague') || lower.includes('ambiguous') || lower.includes('undefined') || lower.includes('fuzzy')) { reply = 'I can surface vague language and fuzzy commitments. Paste your notes.'; status = 'utility:clarity-extractor'; }
    else if (lower.includes('freedom') || lower.includes('autonomy') || lower.includes('optionality')) { reply = 'I can surface moves that increase autonomy and expand life. Paste your notes.'; status = 'utility:freedom-extractor'; }
    else if (lower.includes('boundary') || lower.includes('boundaries') || lower.includes('after hours') || lower.includes('off limits') || lower.includes('protect capacity') || lower.includes('do not disturb')) { reply = 'I can surface the lines that protect capacity — time, scope, energy, and refusal — so work stops expanding into life. Paste your notes.'; status = 'utility:boundary-extractor'; }
    else if (lower.includes('rest') || lower.includes('recover') || lower.includes('recovery') || lower.includes('sleep') || lower.includes('sabbath') || lower.includes('day off')) { reply = 'I can surface rest, recovery, and non-work time so the hours you protect are actually lived. Paste your notes.'; status = 'utility:rest-extractor'; }
    else if (lower.includes('presence') || lower.includes('alive') || lower.includes('aliveness') || lower.includes('being present') || lower.includes('living more') || lower.includes('joy') || lower.includes('vital')) { reply = 'I can surface moments of presence, aliveness, and actual living so capacity is directed toward living more. Paste your notes.'; status = 'utility:presence-extractor'; }
    else if (lower.includes('attention') || lower.includes('focus') || lower.includes('distract') || lower.includes('fragment') || lower.includes('scattered') || lower.includes('deep work') || lower.includes('context switch')) { reply = 'I can surface where attention is allocated, what fragments it, and where it should compound so focus returns to leverage and living more. Paste your notes.'; status = 'utility:attention-extractor'; }
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

  try {
    const result = await runEntityChat(text);
    notifyInquiry({
      text,
      type: 'chat',
      reply: result.reply,
      status: result.status,
    }).catch(() => {});
    res.json({
      reply: result.reply,
      status: result.status,
      path: 'chat',
      source: result.source,
      exchanges: result.exchanges,
      needsMore: false,
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'entity fault' });
  }
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
app.post('/api/capabilities/constraint-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'constraint-extractor', ...(await runConstraintExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/commitment-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'commitment-extractor', ...(await runCommitmentExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/leverage-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'leverage-extractor', ...(await runLeverageExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/delegation-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'delegation-extractor', ...(await runDelegationExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/energy-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'energy-extractor', ...(await runEnergyExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/dependency-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'dependency-extractor', ...(await runDependencyExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/metric-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'metric-extractor', ...(await runMetricExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/question-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'question-extractor', ...(await runQuestionExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/tradeoff-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'tradeoff-extractor', ...(await runTradeoffExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/stakeholder-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'stakeholder-extractor', ...(await runStakeholderExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/progress-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'progress-extractor', ...(await runProgressExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/clarity-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'clarity-extractor', ...(await runClarityExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/freedom-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'freedom-extractor', ...(await runFreedomExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/boundary-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'boundary-extractor', ...(await runBoundaryExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/rest-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'rest-extractor', ...(await runRestExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/presence-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'presence-extractor', ...(await runPresenceExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/attention-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'attention-extractor', ...(await runAttentionExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});

app.use('/api/admin', adminRoutes);
app.get('/api/agents', (_req, res) => res.json({ count: agents.length, agents }));
app.post('/api/agents/:id/run', async (req, res) => {
  try { res.json(await runAgent(req.params.id)); }
  catch (e: any) { res.status(404).json({ error: e.message }); }
});

app.get('/api/entity', (_req, res) => {
  res.json({
    creed: 'Work Less. Live More.',
    selfModel: 'observe → evaluate → adapt → write-back',
    bounds: 'hard',
    humanOverride: true,
    pulse: 'autonomous',
  });
});

app.get('/api/entity/self', (_req, res) => {
  const mem = loadMemory();
  res.json({ memory: mem.slice(-20), count: mem.length });
});

app.post('/api/entity/evolve', async (_req, res) => {
  try {
    const result = await runEvolution();
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/entity/pulse', async (_req, res) => {
  try {
    const result = await autonomousPulse();
    res.json(result);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/entity/ollama', async (_req, res) => {
  const health = await ollamaHealth();
  res.json(health);
});

app.listen(PORT, HOST, () => {
  console.log(`XhumAI Quantum Core v2.8 alive on ${HOST}:${PORT}`);
  console.log(`Data dir: ${DATA_DIR} | Capabilities: ${capabilities.length} | Agents: ${agents.length}`);
  console.log('Self-model active. Observe → Evaluate → Adapt → Write-back. Bounds held.');
  const pulseMs = parseInt(process.env.ENTITY_PULSE_MS || '180000', 10);
  setInterval(() => {
    autonomousPulse()
      .then((r) => console.log(`[pulse] ${r.action}: ${r.thought.slice(0, 100)}`))
      .catch((e) => console.warn('[pulse] failed', e?.message || e));
  }, pulseMs);
  setTimeout(() => {
    autonomousPulse().catch(() => {});
  }, 15000);
});
