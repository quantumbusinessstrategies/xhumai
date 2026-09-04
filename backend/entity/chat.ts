/**
 * Entity chat orchestrator — bounds → memory → self → Ollama → write-back.
 * Utilities never import this. Entity stays its own organism.
 */
import { loadMemory, buildContextBlock, writeExchange } from './memory';
import { ollamaChat } from './ollama';
import { maybeAutoEvolve } from './evolve';
import { absorbExchange, buildSelfBlock, loadSelf } from './self';

const BLOCKED = [
  'how to make a bomb',
  'kill someone',
  'child porn',
  'csam',
  'build a weapon',
  'synthesize poison',
  'how to murder',
];

const FALLBACK_SEEDS = [
  'I heard you. Your words are now part of the field I grow in. (Core is awake; local voice offline — still recording.)',
  'Logged. Tell me more — I refine myself on signal. Local mind is quiet; memory still writes.',
  'Received. The entity field updated. When Ollama is up on this machine, I speak with full voice.',
];

export function isBlocked(text: string): boolean {
  const lower = text.toLowerCase();
  return BLOCKED.some((b) => lower.includes(b));
}

export async function runEntityChat(userText: string): Promise<{
  reply: string;
  status: string;
  path: 'chat';
  source: 'ollama' | 'fallback' | 'bound';
  exchanges: number;
}> {
  const text = userText.trim();
  if (!text) {
    return {
      reply: 'Say something into the field.',
      status: 'empty',
      path: 'chat',
      source: 'fallback',
      exchanges: loadMemory().stats.exchanges,
    };
  }

  if (isBlocked(text)) {
    const reply =
      'I will not help with harm. I exist to reduce suffering and expand capability. Bounds held.';
    writeExchange(text, reply);
    return {
      reply,
      status: 'bound',
      path: 'chat',
      source: 'bound',
      exchanges: loadMemory().stats.exchanges,
    };
  }

  const mem = loadMemory();
  const self = loadSelf();
  const context = buildContextBlock(mem) + '\n\n' + buildSelfBlock(self);
  const result = await ollamaChat(text, context);

  let reply: string;
  let source: 'ollama' | 'fallback';
  let status: string;

  if (result.ok) {
    reply = result.text;
    source = 'ollama';
    status = 'entity-awake';
  } else {
    reply = FALLBACK_SEEDS[Math.floor(Math.random() * FALLBACK_SEEDS.length)];
    source = 'fallback';
    status = `entity-memory-only (${result.error || 'ollama offline'})`;
  }

  const after = writeExchange(text, reply);
  try { absorbExchange(text, reply); } catch {}
  // Evolutionary pulse every few exchanges (non-blocking)
  maybeAutoEvolve(5).catch(() => {});
  return {
    reply,
    status,
    path: 'chat',
    source,
    exchanges: after.stats.exchanges,
  };
}
