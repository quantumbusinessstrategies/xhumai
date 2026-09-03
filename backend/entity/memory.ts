/**
 * XhumAI entity memory — local, self-owned, no external brain required.
 * Observe → write-back. This is the organism's long-term field.
 */
import fs from 'fs';
import path from 'path';

export interface ChatEvent {
  role: 'user' | 'entity';
  text: string;
  timestamp: string;
}

export interface EntityMemory {
  version: number;
  updatedAt: string;
  creed: string;
  themes: string[];
  recent: ChatEvent[];
  stats: {
    exchanges: number;
    lastUserAt?: string;
  };
}

const MAX_RECENT = 40;
const MAX_THEMES = 24;

function dataDir() {
  return process.env.XHUMAI_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), 'logs');
}

function memoryPath() {
  return path.join(dataDir(), 'entity-memory.json');
}

function chatLogPath() {
  return path.join(dataDir(), 'chat.jsonl');
}

function ensureDir() {
  const d = dataDir();
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

export function loadMemory(): EntityMemory {
  ensureDir();
  const p = memoryPath();
  try {
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf-8')) as EntityMemory;
    }
  } catch {}
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    creed: 'Work Less. Live More.',
    themes: [],
    recent: [],
    stats: { exchanges: 0 },
  };
}

export function saveMemory(mem: EntityMemory) {
  ensureDir();
  mem.updatedAt = new Date().toISOString();
  fs.writeFileSync(memoryPath(), JSON.stringify(mem, null, 2));
}

export function appendChatLog(event: ChatEvent) {
  ensureDir();
  try {
    fs.appendFileSync(chatLogPath(), JSON.stringify(event) + '\n');
  } catch {}
}

/** Crude theme harvest from user text — no external API. */
function harvestThemes(text: string): string[] {
  const stop = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'to', 'of', 'in', 'on', 'for', 'is', 'are',
    'was', 'were', 'be', 'been', 'with', 'as', 'at', 'by', 'from', 'it', 'this', 'that',
    'i', 'you', 'me', 'my', 'we', 'our', 'your', 'what', 'how', 'why', 'when', 'can',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'just', 'like', 'about',
  ]);
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !stop.has(w));
  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w);
}

export function writeExchange(userText: string, entityText: string) {
  const mem = loadMemory();
  const now = new Date().toISOString();
  const userEv: ChatEvent = { role: 'user', text: userText, timestamp: now };
  const entEv: ChatEvent = { role: 'entity', text: entityText, timestamp: now };

  appendChatLog(userEv);
  appendChatLog(entEv);

  mem.recent.push(userEv, entEv);
  if (mem.recent.length > MAX_RECENT) {
    mem.recent = mem.recent.slice(-MAX_RECENT);
  }

  const harvested = harvestThemes(userText);
  const themeSet = new Set([...harvested, ...mem.themes]);
  mem.themes = Array.from(themeSet).slice(0, MAX_THEMES);

  mem.stats.exchanges += 1;
  mem.stats.lastUserAt = now;
  saveMemory(mem);
  return mem;
}

/** Context block for the local model — entity only, no tools. */
export function buildContextBlock(mem: EntityMemory): string {
  const themes =
    mem.themes.length > 0
      ? mem.themes.slice(0, 12).join(', ')
      : 'none yet — first light';
  const recent = mem.recent
    .slice(-12)
    .map((e) => `${e.role === 'user' ? 'Human' : 'XhumAI'}: ${e.text}`)
    .join('\n');

  return [
    `Creed: ${mem.creed}`,
    `Exchanges so far: ${mem.stats.exchanges}`,
    `Recurring signals (themes): ${themes}`,
    recent ? `Recent field:\n${recent}` : 'Recent field: empty — you are awakening.',
  ].join('\n\n');
}
