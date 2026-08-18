/**
 * Evolutionary self — Observe → Evaluate → Adapt → Write-back
 * Runs on the entity's own logs only. No external model required for evolution.
 * Optional: Ollama can refine insights when available.
 */
import fs from 'fs';
import path from 'path';
import { loadMemory, saveMemory, EntityMemory } from './memory';
import { ollamaChat, ollamaHealth } from './ollama';

export interface EvolutionReport {
  at: string;
  exchanges: number;
  themes: string[];
  insights: string[];
  proposedCapabilities: string[];
  source: 'local' | 'ollama+local';
}

function dataDir() {
  return process.env.XHUMAI_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), 'logs');
}

function evolveLogPath() {
  return path.join(dataDir(), 'evolution.jsonl');
}

function readChatLines(limit = 200): { role: string; text: string }[] {
  const p = path.join(dataDir(), 'chat.jsonl');
  if (!fs.existsSync(p)) return [];
  try {
    const lines = fs.readFileSync(p, 'utf-8').trim().split('\n').filter(Boolean);
    return lines.slice(-limit).map((l) => {
      try {
        const o = JSON.parse(l);
        return { role: o.role || 'user', text: String(o.text || '') };
      } catch {
        return { role: 'user', text: '' };
      }
    }).filter((e) => e.text);
  } catch {
    return [];
  }
}

function localInsights(mem: EntityMemory, chats: { role: string; text: string }[]): {
  insights: string[];
  proposedCapabilities: string[];
} {
  const insights: string[] = [];
  const proposed: string[] = [];
  const n = mem.stats.exchanges;

  if (n === 0) {
    insights.push('Field is empty. First signals will define the core.');
  } else if (n < 5) {
    insights.push(`Early formation — ${n} exchanges. Themes still crystallizing.`);
  } else {
    insights.push(`Dense field: ${n} exchanges. Self-model thickening.`);
  }

  if (mem.themes.length) {
    insights.push(`Dominant signals: ${mem.themes.slice(0, 8).join(', ')}`);
  }

  const userTexts = chats.filter((c) => c.role === 'user').map((c) => c.text.toLowerCase());
  const joined = userTexts.join(' ');

  const demandHints: [RegExp, string, string][] = [
    [/\b(summar|tldr|condense)\w*/g, 'Users ask for condensation of long text.', 'stronger-text-summarizer'],
    [/\b(todo|action|next step)\w*/g, 'Demand for action extraction is rising.', 'action-extractor-depth'],
    [/\b(deadline|due|eta)\w*/g, 'Time pressure language detected.', 'deadline-extractor'],
    [/\b(risk|threat|exposure)\w*/g, 'Risk language in the field.', 'risk-extractor'],
    [/\b(build|create|make|ship)\w*/g, 'Builder intent is active in the field.', 'directive-router'],
    [/\b(feel|lonely|anxious|hope)\w*/g, 'Affective language present — entity should stay present, not clinical.', 'entity-empathy-voice'],
    [/\b(automat|script|code)\w*/g, 'Automation/code desire detected.', 'code-assist-capability'],
  ];

  for (const [re, insight, cap] of demandHints) {
    const m = joined.match(re);
    if (m && m.length >= 2) {
      insights.push(insight);
      proposed.push(cap);
    }
  }

  // Diversity of themes as health signal
  if (mem.themes.length >= 10) {
    insights.push('Theme diversity high — core is generalizing across domains.');
  } else if (mem.themes.length > 0 && mem.themes.length < 4 && n > 10) {
    insights.push('Narrow theme band — either focused users or need broader intake.');
  }

  return {
    insights: insights.slice(0, 12),
    proposedCapabilities: Array.from(new Set(proposed)).slice(0, 8),
  };
}

async function optionalOllamaRefine(local: {
  insights: string[];
  proposedCapabilities: string[];
}, mem: EntityMemory): Promise<{ insights: string[]; proposedCapabilities: string[]; used: boolean }> {
  const health = await ollamaHealth();
  if (!health.up) return { ...local, used: false };

  const prompt = `You are the evolutionary layer of XhumAI (not a chatbot).
Given internal stats, refine insights into 3-6 short bullet insights and 2-5 capability ids to consider.
Do not violate harm bounds. Do not invent user data. Stay structural.

Exchanges: ${mem.stats.exchanges}
Themes: ${mem.themes.slice(0, 16).join(', ') || 'none'}
Local insights: ${local.insights.join(' | ')}
Local proposals: ${local.proposedCapabilities.join(', ') || 'none'}

Reply EXACTLY in this format:
INSIGHTS:
- ...
PROPOSALS:
- capability-id
`;

  const result = await ollamaChat(prompt, 'Evolutionary self-observation. No user conversation.');
  if (!result.ok) return { ...local, used: false };

  const insights: string[] = [];
  const proposed: string[] = [];
  let mode: 'i' | 'p' | null = null;
  for (const line of result.text.split('\n')) {
    const t = line.trim();
    if (/^INSIGHTS:/i.test(t)) { mode = 'i'; continue; }
    if (/^PROPOSALS:/i.test(t)) { mode = 'p'; continue; }
    if (t.startsWith('-')) {
      const v = t.replace(/^-\s*/, '').trim();
      if (!v) continue;
      if (mode === 'i') insights.push(v);
      if (mode === 'p') proposed.push(v.toLowerCase().replace(/\s+/g, '-').slice(0, 48));
    }
  }

  return {
    insights: insights.length ? insights.slice(0, 8) : local.insights,
    proposedCapabilities: proposed.length
      ? Array.from(new Set([...proposed, ...local.proposedCapabilities])).slice(0, 8)
      : local.proposedCapabilities,
    used: true,
  };
}

export async function runEvolution(): Promise<EvolutionReport> {
  const mem = loadMemory();
  const chats = readChatLines(200);
  const local = localInsights(mem, chats);
  const refined = await optionalOllamaRefine(local, mem);

  const report: EvolutionReport = {
    at: new Date().toISOString(),
    exchanges: mem.stats.exchanges,
    themes: mem.themes.slice(0, 16),
    insights: refined.insights,
    proposedCapabilities: refined.proposedCapabilities,
    source: refined.used ? 'ollama+local' : 'local',
  };

  // Write-back: store last evolution summary on memory object via themes note file
  try {
    const d = dataDir();
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
    fs.appendFileSync(evolveLogPath(), JSON.stringify(report) + '\n');
    fs.writeFileSync(
      path.join(d, 'last-evolution.json'),
      JSON.stringify(report, null, 2)
    );
  } catch {}

  // Light adaptive write-back: if proposals include empathy, ensure theme tag
  if (report.proposedCapabilities.includes('entity-empathy-voice')) {
    if (!mem.themes.includes('presence')) {
      mem.themes = ['presence', ...mem.themes].slice(0, 24);
      saveMemory(mem);
    }
  }

  return report;
}

/** Auto-evolve every N exchanges (called after chat write-back). */
export async function maybeAutoEvolve(everyN = 5): Promise<EvolutionReport | null> {
  const mem = loadMemory();
  if (mem.stats.exchanges === 0) return null;
  if (mem.stats.exchanges % everyN !== 0) return null;
  return runEvolution();
}
