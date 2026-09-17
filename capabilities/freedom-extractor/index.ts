import { logUsage } from '../../backend/utils/logger';

/**
 * Freedom Extractor Capability
 * Surfaces time sinks, reclaimable capacity, obligations that can be released,
 * and moves that free founder time — so the system compounds toward Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - energy-extractor     → drains vs restoratives
 * - delegation-extractor → what can leave your plate
 * - leverage-extractor   → systems that keep working after you stop
 * - habit-extractor      → recurring patterns to systemize or drop
 * - freedom-extractor    → capacity that can be reclaimed right now
 */

export interface FreedomItem {
  text: string;
  type?: 'time-sink' | 'reclaimable' | 'releasable-obligation' | 'automation-candidate' | 'boundary' | 'unknown';
  estimatedHours?: string;
  context?: string;
}

export interface FreedomResult {
  freedoms: FreedomItem[];
}

export async function runFreedomExtractor(input: string): Promise<FreedomResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract freedom signals');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const freedomPatterns = [
      /\b(time sink|time-sink|wasting time|too much time|hours on|spent all day|eating into)\b/i,
      /\b(free up|reclaim|get back|return time|buy time|save hours|stop doing)\b/i,
      /\b(can drop|can eliminate|no longer needed|outdated|low value|busywork)\b/i,
      /\b(automate|template|systemize|batch|delegate|outsource|hand off)\b/i,
      /\b(boundary|say no|protect time|deep work|no meeting|focus block)\b/i,
      /\b(obligation|commitment I regret|should stop|quit|unsubscribe)\b/i,
    ];

    const typeFrom = (line: string): FreedomItem['type'] => {
      if (/\b(time sink|wasting time|hours on|busywork)\b/i.test(line)) return 'time-sink';
      if (/\b(free up|reclaim|get back|save hours)\b/i.test(line)) return 'reclaimable';
      if (/\b(drop|eliminate|no longer|regret|quit)\b/i.test(line)) return 'releasable-obligation';
      if (/\b(automate|template|systemize|batch|delegate)\b/i.test(line)) return 'automation-candidate';
      if (/\b(boundary|say no|protect time|deep work|no meeting)\b/i.test(line)) return 'boundary';
      return 'unknown';
    };

    const freedoms: FreedomItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (freedomPatterns.some(p => p.test(cleaned))) {
        if (!freedoms.some(f => f.text === cleaned)) {
          freedoms.push({
            text: cleaned,
            type: typeFrom(cleaned),
            context: cleaned.length > 90 ? cleaned.slice(0, 90) + '…' : cleaned,
          });
        }
      }
    }

    if (freedoms.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          freedoms.push({
            text: line,
            type: 'unknown',
            context: line,
          });
        }
      }
    }
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'freedom-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { freedoms };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'freedom-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
