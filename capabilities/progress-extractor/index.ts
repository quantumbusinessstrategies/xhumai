import { logUsage } from '../../backend/utils/logger';

/**
 * Progress Extractor Capability
 * Surfaces progress signals, milestones, momentum, and stalled work from free-form notes
 * so movement becomes visible and effort is not spent on invisible plateaus.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - metric-extractor      → how we will know it worked
 * - deadline-extractor    → when it must happen
 * - blocker-extractor     → what is in the way right now
 * - action-extractor      → what to do next
 * - progress-extractor    → whether we are actually moving and where momentum lives
 */

export interface ProgressItem {
  signal: string;
  kind?: 'milestone' | 'momentum' | 'stalled' | 'completed' | 'unknown';
  context?: string;
}

export interface ProgressResult {
  progress: ProgressItem[];
}

export async function runProgressExtractor(input: string): Promise<ProgressResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract progress signals');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const patterns = [
      /\b(progress|milestone|milestones|shipped|launched|completed|done|finished|moved|moving|momentum|velocity|stalled|stuck|plateau|no movement|still waiting)\b/i,
      /\b(we (shipped|launched|finished|completed|closed|hit)|made (progress|headway)|on track|ahead of|behind)\b/i,
      /\b(percent complete|% complete|almost done|halfway|next milestone)\b/i,
    ];

    const progress: ProgressItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (patterns.some(p => p.test(cleaned))) {
        let kind: ProgressItem['kind'] = 'momentum';
        if (/\b(milestone|shipped|launched|completed|done|finished|closed)\b/i.test(cleaned)) kind = 'milestone';
        else if (/\b(stalled|stuck|plateau|no movement|still waiting|blocked)\b/i.test(cleaned)) kind = 'stalled';
        else if (/\b(completed|done|finished)\b/i.test(cleaned)) kind = 'completed';

        if (!progress.some(p => p.signal === cleaned)) {
          progress.push({
            signal: cleaned,
            kind,
            context: cleaned.length > 90 ? cleaned.slice(0, 90) + '…' : cleaned,
          });
        }
      }
    }

    if (progress.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          progress.push({
            signal: line,
            kind: 'unknown',
            context: line,
          });
        }
      }
    }
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'progress-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { progress };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'progress-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
