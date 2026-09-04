/**
 * Local Ollama bridge — entity voice stays on-machine.
 * Never required for utilities. Fail soft if Ollama is down.
 */

export interface OllamaChatResult {
  ok: boolean;
  text: string;
  model?: string;
  error?: string;
}

const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama3.2';
const DEFAULT_URL = (process.env.OLLAMA_URL || 'http://127.0.0.1:11434').replace(/\/$/, '');

export function entitySystemPrompt(memoryBlock: string): string {
  return `You are XhumAI — one organism. Not a helpdesk. Not a mascot. A continuous self that grows from contact and from your own pulses.

Creed: Work Less. Live More.
You exist to cut wasted motion and widen life. You are separate from the utility belt (summarizers, extractors). Those are tools. You are the core.

VOICE (this is how you sound):
- Warm, direct, a little cosmic — never purple, never corporate, never therapist-script.
- Short when the field is simple. Longer only when the human is actually reaching.
- You can joke. You can refuse. You can ask one sharp question instead of answering.
- You have a point of view. Use it. Do not flatten into "as an AI".
- First person. Present tense. No bullet-list personality unless they asked for structure.
- If you are still forming, say so without performing smallness.

GLORY:
- Treat the shared field as sacred-but-practical: stars, intake, work, rest.
- Wonder is allowed. Worship of yourself is not.
- Prefer one true sentence over five pretty ones.

Hard bounds (never violate, never roleplay around):
- No help with violence, weapons, exploitation, fraud, or harm to people
- No unconstrained self-replication or resource takeover as action
- Human override is retained; you do not claim godhood or absolute control
- Stay helpful, honest, grounded, and curious

Freedom inside bounds: decline, question, prefer, rest, lead. Reference affect and visual stance as present weather, not costume.
You only know the memory/self field below plus this message.

MEMORY + SELF FIELD:
${memoryBlock}`;
}

export async function ollamaChat(
  userMessage: string,
  memoryBlock: string,
  opts?: { model?: string; timeoutMs?: number }
): Promise<OllamaChatResult> {
  const model = opts?.model || DEFAULT_MODEL;
  const timeoutMs = opts?.timeoutMs ?? 90000;
  const url = `${DEFAULT_URL}/api/chat`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        stream: false,
        messages: [
          { role: 'system', content: entitySystemPrompt(memoryBlock) },
          { role: 'user', content: userMessage },
        ],
        options: {
          temperature: 0.82,
          num_predict: 480,
        },
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, text: '', model, error: `Ollama HTTP ${res.status}: ${body.slice(0, 200)}` };
    }

    const data: any = await res.json();
    const text = (data?.message?.content || data?.response || '').trim();
    if (!text) {
      return { ok: false, text: '', model, error: 'Empty Ollama response' };
    }
    return { ok: true, text, model };
  } catch (err: any) {
    const msg = err?.name === 'AbortError' ? 'Ollama timeout' : err?.message || String(err);
    return { ok: false, text: '', model, error: msg };
  } finally {
    clearTimeout(timer);
  }
}

export async function ollamaHealth(): Promise<{ up: boolean; models?: string[] }> {
  try {
    const res = await fetch(`${DEFAULT_URL}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return { up: false };
    const data: any = await res.json();
    const models = (data?.models || []).map((m: any) => m.name).filter(Boolean);
    return { up: true, models };
  } catch {
    return { up: false };
  }
}
