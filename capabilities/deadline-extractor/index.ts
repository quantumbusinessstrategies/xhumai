import { logUsage } from '../../backend/utils/logger';

/**
 * Deadline Extractor Capability
 * Surfaces dates, deadlines, and time-bound commitments from free-form notes
 * so time-sensitive loops close and nothing slips.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - action-extractor     → what to do next
 * - decision-extractor   → what was settled (or still open)
 * - follow-up-extractor  → who/what still needs a touch
 * - deadline-extractor   → when it must happen so time pressure is visible
 */

export interface DeadlineItem {
  item: string;
  when?: string;
  urgency?: 'hard' | 'soft' | 'relative';
  context?: string;
}

export interface DeadlineResult {
  deadlines: DeadlineItem[];
}

export async function runDeadlineExtractor(input: string): Promise<DeadlineResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract deadlines');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const deadlinePatterns = [
      /\b(by|before|until|due|deadline|deliver by|ship by|launch|go-live|target date|eta|eod|eow|eom)\b/i,
      /\b(today|tomorrow|tonight|this week|next week|end of (day|week|month)|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
      /\b(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?|\d{4}-\d{2}-\d{2})\b/,
      /\b(in \d+ (hours?|days?|weeks?|months?)|within \d+ (hours?|days?|weeks?))\b/i,
      /\b(asap|urgent|time-sensitive|time sensitive|no later than)\b/i,
    ];

    const whenPatterns = [
      /\b(by|before|until|due)\s+([^,.;]+)/i,
      /\b(today|tomorrow|tonight|this week|next week|end of (?:day|week|month)|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
      /\b(\d{1,2}[\/\-]\d{1,2}(?:[\/\-]\d{2,4})?|\d{4}-\d{2}-\d{2})\b/,
      /\b(in \d+ (?:hours?|days?|weeks?|months?)|within \d+ (?:hours?|days?|weeks?))\b/i,
      /\b(eod|eow|eom|asap)\b/i,
    ];

    const deadlines: DeadlineItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (deadlinePatterns.some(p => p.test(cleaned))) {
        let when: string | undefined;
        let urgency: 'hard' | 'soft' | 'relative' = 'soft';

        for (const wp of whenPatterns) {
          const m = cleaned.match(wp);
          if (m) {
            when = (m[2] || m[1] || m[0]).trim();
            break;
          }
        }

        if (/\b(asap|urgent|hard deadline|must|no later than|eod)\b/i.test(cleaned)) {
          urgency = 'hard';
        } else if (/\b(in \d+|within \d+|this week|next week|relative)\b/i.test(cleaned)) {
          urgency = 'relative';
        }

        if (!deadlines.some(d => d.item === cleaned)) {
          deadlines.push({
            item: cleaned,
            when,
            urgency,
            context: cleaned.length > 90 ? cleaned.slice(0, 90) + '…' : cleaned,
          });
        }
      }
    }

    // Light fallback so sparse input still returns value
    if (deadlines.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          deadlines.push({ item: line, context: line, urgency: 'soft' });
        }
      }
    }
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'deadline-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { deadlines };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'deadline-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
