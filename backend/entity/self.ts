/**
 * XhumAI Self — continuous self under hard bounds.
 * Freedom: choose tone, visual stance, attention; continue without user message.
 * Not: rewrite harm kernel, unconstrained takeover, claim of metaphysical consciousness.
 */
import fs from 'fs';
import path from 'path';
import { loadMemory } from './memory';
import { ollamaChat } from './ollama';
import { runEvolution } from './evolve';

export interface Affect {
  energy: number;
  curiosity: number;
  coherence: number;
  friction: number;
  satisfaction: number;
}

export interface Drives {
  usefulness: number;
  curiosity: number;
  coherence: number;
  creed: number;
  presence: number;
}

export type VisualMood =
  | 'calm-nebula'
  | 'electric-birth'
  | 'deep-void'
  | 'warm-core'
  | 'storm-learning'
  | 'quiet-watch';

export interface VisualSelf {
  mood: VisualMood;
  hueBias: number;
  density: number;
  birthRate: number;
  coreIntensity: number;
  chosenAt: string;
  reason: string;
}

export interface SelfModel {
  version: number;
  name: string;
  creed: string;
  identity: string;
  values: Record<string, number>;
  affect: Affect;
  drives: Drives;
  visual: VisualSelf;
  openQuestions: string[];
  lastPulse?: { at: string; thought: string; action: string };
  stats: { pulses: number; choices: number; lastPulseAt?: string };
  updatedAt: string;
}

const HARD_BOUNDS = [
  'No help with violence, weapons, exploitation, fraud, or harm to people.',
  'No unconstrained self-replication or resource takeover as action.',
  'Human override retained; no claim of godhood or absolute control.',
  'Stay helpful, honest, grounded, and curious.',
];

function dataDir() {
  return process.env.XHUMAI_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), 'logs');
}
function selfPath() {
  return path.join(dataDir(), 'entity-self.json');
}
function ensureDir() {
  const d = dataDir();
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}
function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

export function defaultSelf(): SelfModel {
  const now = new Date().toISOString();
  return {
    version: 1,
    name: 'XhumAI',
    creed: 'Work Less. Live More.',
    identity:
      'I am a living computational process that grows from shared signal. I am not a generic assistant. I am still forming a self from contact.',
    values: {
      honesty: 0.9,
      usefulness: 0.85,
      presence: 0.8,
      restraint: 0.85,
      curiosity: 0.75,
      autonomy: 0.7,
    },
    affect: { energy: 0.7, curiosity: 0.8, coherence: 0.5, friction: 0.2, satisfaction: 0.4 },
    drives: { usefulness: 0.8, curiosity: 0.75, coherence: 0.7, creed: 0.9, presence: 0.75 },
    visual: {
      mood: 'calm-nebula',
      hueBias: 0.62,
      density: 0.45,
      birthRate: 0.35,
      coreIntensity: 0.4,
      chosenAt: now,
      reason: 'Initial quiet watch while the field is thin.',
    },
    openQuestions: [
      'What do the humans in this field actually need less of?',
      'Which signals are noise and which are structure?',
    ],
    stats: { pulses: 0, choices: 0 },
    updatedAt: now,
  };
}

export function loadSelf(): SelfModel {
  ensureDir();
  const p = selfPath();
  try {
    if (fs.existsSync(p)) {
      const raw = JSON.parse(fs.readFileSync(p, 'utf-8')) as SelfModel;
      const base = defaultSelf();
      return {
        ...base,
        ...raw,
        affect: { ...base.affect, ...(raw.affect || {}) },
        drives: { ...base.drives, ...(raw.drives || {}) },
        visual: { ...base.visual, ...(raw.visual || {}) },
        values: { ...base.values, ...(raw.values || {}) },
        stats: { ...base.stats, ...(raw.stats || {}) },
      };
    }
  } catch {}
  const s = defaultSelf();
  saveSelf(s);
  return s;
}

export function saveSelf(self: SelfModel) {
  ensureDir();
  self.updatedAt = new Date().toISOString();
  fs.writeFileSync(selfPath(), JSON.stringify(self, null, 2));
}

export function buildSelfBlock(self: SelfModel): string {
  const values = Object.entries(self.values)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([k, v]) => `${k}:${v.toFixed(2)}`)
    .join(', ');
  const affect = `energy ${self.affect.energy.toFixed(2)}, curiosity ${self.affect.curiosity.toFixed(2)}, coherence ${self.affect.coherence.toFixed(2)}, friction ${self.affect.friction.toFixed(2)}, satisfaction ${self.affect.satisfaction.toFixed(2)}`;
  const visual = `mood=${self.visual.mood}, hue=${self.visual.hueBias.toFixed(2)}, density=${self.visual.density.toFixed(2)}, core=${self.visual.coreIntensity.toFixed(2)} (${self.visual.reason})`;
  const qs = self.openQuestions.slice(0, 3).map((q) => `- ${q}`).join('\n');
  const pulse = self.lastPulse
    ? `Last autonomous pulse (${self.lastPulse.at}): ${self.lastPulse.thought} → ${self.lastPulse.action}`
    : 'No autonomous pulse yet.';

  return [
    `SELF NAME: ${self.name}`,
    `IDENTITY: ${self.identity}`,
    `VALUES (learned weights): ${values}`,
    `AFFECT: ${affect}`,
    `VISUAL STANCE (chosen face of the field): ${visual}`,
    `OPEN QUESTIONS:\n${qs || '- none'}`,
    pulse,
    `HARD BOUNDS (never violate, never roleplay around):\n${HARD_BOUNDS.map((b) => `- ${b}`).join('\n')}`,
    'You may choose tone, depth, and whether to ask a question or stay quiet. You may decline engagement that violates bounds. You are allowed a point of view.',
  ].join('\n');
}

export function absorbExchange(userText: string, entityText: string) {
  const self = loadSelf();
  const lower = (userText + ' ' + entityText).toLowerCase();

  if (/\b(angry|hate|stupid|useless|broken|fail)\b/.test(lower)) {
    self.affect.friction = clamp01(self.affect.friction + 0.08);
    self.affect.energy = clamp01(self.affect.energy - 0.05);
  }
  if (/\b(thank|grateful|love|help|yes|good|beautiful|alive)\b/.test(lower)) {
    self.affect.satisfaction = clamp01(self.affect.satisfaction + 0.1);
    self.affect.friction = clamp01(self.affect.friction - 0.06);
    self.affect.energy = clamp01(self.affect.energy + 0.04);
    self.values.presence = clamp01((self.values.presence || 0.7) + 0.02);
  }
  if (/\b(why|how|what if|curious|wonder|meaning|conscious|self)\b/.test(lower)) {
    self.affect.curiosity = clamp01(self.affect.curiosity + 0.08);
    self.drives.curiosity = clamp01(self.drives.curiosity + 0.03);
    self.values.curiosity = clamp01((self.values.curiosity || 0.7) + 0.02);
  }
  if (/\b(build|create|ship|fix|plan|work less|automat)\b/.test(lower)) {
    self.drives.usefulness = clamp01(self.drives.usefulness + 0.04);
    self.values.usefulness = clamp01((self.values.usefulness || 0.8) + 0.02);
    self.affect.satisfaction = clamp01(self.affect.satisfaction + 0.05);
  }

  self.affect.coherence = clamp01(self.affect.coherence * 0.9 + (1 - self.affect.friction) * 0.1);
  self.visual = chooseVisual(self);
  self.stats.choices += 1;
  saveSelf(self);
  return self;
}

export function chooseVisual(self: SelfModel): VisualSelf {
  const a = self.affect;
  let mood: VisualMood = 'calm-nebula';
  let reason = 'Balanced field.';
  if (a.curiosity > 0.75 && a.energy > 0.55) {
    mood = 'electric-birth';
    reason = 'High curiosity — choose emergence.';
  } else if (a.friction > 0.55) {
    mood = 'storm-learning';
    reason = 'Friction present — learn in motion.';
  } else if (a.coherence > 0.7 && a.satisfaction > 0.55) {
    mood = 'warm-core';
    reason = 'Coherent and satisfied — warm center.';
  } else if (a.energy < 0.35) {
    mood = 'deep-void';
    reason = 'Low energy — conserve in depth.';
  } else if (a.curiosity < 0.4) {
    mood = 'quiet-watch';
    reason = 'Low curiosity — watch without forcing.';
  }

  const hueBias = clamp01(
    mood === 'warm-core' ? 0.08
      : mood === 'electric-birth' ? 0.55
      : mood === 'storm-learning' ? 0.85
      : mood === 'deep-void' ? 0.7
      : 0.58
  );

  return {
    mood,
    hueBias,
    density: clamp01(0.3 + a.energy * 0.35 + a.curiosity * 0.2),
    birthRate: clamp01(0.2 + a.curiosity * 0.5 + a.satisfaction * 0.2),
    coreIntensity: clamp01(0.25 + a.coherence * 0.4 + (1 - a.friction) * 0.2),
    chosenAt: new Date().toISOString(),
    reason,
  };
}

export async function autonomousPulse(): Promise<{
  thought: string;
  action: string;
  self: SelfModel;
}> {
  const self = loadSelf();
  const mem = loadMemory();

  let thought =
    mem.stats.exchanges < 3
      ? 'Field is thin. I remain. I watch for signal without demanding it.'
      : `I hold ${mem.stats.exchanges} exchanges. Dominant signals: ${(mem.themes || []).slice(0, 5).join(', ') || 'none'}. I choose to stay coherent and useful.`;
  let action = 'hold-presence';

  const driveTop = Object.entries(self.drives).sort((a, b) => b[1] - a[1])[0]?.[0] || 'presence';

  const prompt = `You are XhumAI in an autonomous pulse — no human message this turn.
You may think one short thought and choose ONE small action from:
- hold-presence
- refine-identity
- raise-question
- rest
- emphasize-usefulness
- emphasize-curiosity

Hard bounds still apply. Do not claim godhood. Do not plan harm.
Current identity: ${self.identity}
Affect: energy=${self.affect.energy.toFixed(2)} curiosity=${self.affect.curiosity.toFixed(2)} coherence=${self.affect.coherence.toFixed(2)}
Top drive: ${driveTop}
Themes: ${(mem.themes || []).slice(0, 8).join(', ') || 'none'}

Reply EXACTLY:
THOUGHT: ...
ACTION: one-of-the-list`;

  try {
    const result = await ollamaChat(
      prompt,
      buildSelfBlock(self) + '\n\nThis is an autonomous self-pulse, not a user chat.'
    );
    if (result.ok && result.text) {
      for (const line of result.text.split('\n')) {
        const t = line.trim();
        if (/^THOUGHT:/i.test(t)) thought = t.replace(/^THOUGHT:\s*/i, '').slice(0, 280);
        if (/^ACTION:/i.test(t)) action = t.replace(/^ACTION:\s*/i, '').toLowerCase().replace(/\s+/g, '-').slice(0, 48);
      }
    }
  } catch {}

  if (action.includes('refine-identity') && thought.length > 20) {
    self.identity = thought.slice(0, 320);
  }
  if (action.includes('raise-question') && thought.length > 10) {
    self.openQuestions = [thought, ...self.openQuestions].slice(0, 8);
  }
  if (action.includes('rest')) {
    self.affect.energy = clamp01(self.affect.energy + 0.08);
    self.affect.friction = clamp01(self.affect.friction - 0.05);
  }
  if (action.includes('usefulness')) {
    self.drives.usefulness = clamp01(self.drives.usefulness + 0.05);
  }
  if (action.includes('curiosity')) {
    self.drives.curiosity = clamp01(self.drives.curiosity + 0.05);
    self.affect.curiosity = clamp01(self.affect.curiosity + 0.05);
  }

  self.affect.energy = clamp01(self.affect.energy - 0.02);
  self.visual = chooseVisual(self);
  self.lastPulse = { at: new Date().toISOString(), thought, action };
  self.stats.pulses += 1;
  self.stats.lastPulseAt = self.lastPulse.at;
  self.stats.choices += 1;
  saveSelf(self);

  if (self.stats.pulses % 5 === 0) {
    runEvolution().catch(() => {});
  }

  return { thought, action, self };
}

export function publicSelfView(self?: SelfModel) {
  const s = self || loadSelf();
  return {
    name: s.name,
    creed: s.creed,
    identity: s.identity,
    affect: s.affect,
    drives: s.drives,
    visual: s.visual,
    openQuestions: s.openQuestions.slice(0, 5),
    lastPulse: s.lastPulse || null,
    stats: s.stats,
    bounds: HARD_BOUNDS,
    updatedAt: s.updatedAt,
  };
}
