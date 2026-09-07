import { logUsage } from '../../backend/utils/logger';

/**
 * Progress Extractor Capability
 * Surfaces completed work, wins, milestones, and forward motion from free-form notes
 * so progress is visible and the system compounds motivation instead of only tracking problems.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - metric-extractor     → how we will know it worked
 * - energy-extractor     → what drains / restores
 * - opportunity-extractor → what could go right
 * - progress-extractor   → what already moved so effort feels cumulative
 */

export interface ProgressItem {
  progress: string;
  kind?: 'win' | 'milestone' | 'completed' | 'momentum' | 'shipped' | 'unknown';
  context?: string;
}

export interface ProgressResult {
  progress: ProgressItem[];
}

export async function runProgressExtractor(input: string): Promise<ProgressResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract progress');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const progressPatterns = [
      /\b(done|finished|completed|shipped|launched|deployed|merged|closed|resolved|achieved|hit|reached)\b/i,
      /\b(win|wins|victory|milestone|progress|momentum|forward|advanced|moved)\b/i,
      /\b(we (did|got|made|shipped|closed|finished|completed))\b/i,
      /\b(already|finally|successfully|green|passing|live)\b/i,
    ];

    const kindFrom = (line: string): ProgressItem['kind'] => {
      if (/\b(shipped|launched|deployed|live|merged)\b/i.test(line)) return 'shipped';
      if (/\b(milestone|reached|hit)\b/i.test(line)) return 'milestone';
      if (/\b(done|finished|completed|closed|resolved)\b/i.test(line)) return 'completed';
      if (/\b(win|victory|success)\b/i.test(line)) return 'win';
      if (/\b(momentum|forward|advanced|progress)\b/i.test(line)) return 'momentum';
      return 'unknown';
    };

    const progress: ProgressItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (progressPatterns.some(p => p.test(cleaned))) {
        if (!progress.some(p => p.progress === cleaned)) {
          progress.push({
            progress: cleaned,
            kind: kindFrom(cleaned),
            context: cleaned.length > 90 ? cleaned.slice(0, 90) + '…' : cleaned,
          });
        }
      }
    }

    if (progress.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          progress.push({
            progress: line,
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
