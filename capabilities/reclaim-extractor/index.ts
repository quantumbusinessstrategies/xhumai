import { logUsage } from '../../backend/utils/logger';

/**
 * Reclaim Extractor Capability
 * Surfaces time sinks, recoverable hours, meetings that can shrink,
 * processes that can batch or drop, and attention leaks so hours return to life.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - elimination-extractor → remove work that should not exist
 * - automation-extractor  → same outcome without ongoing time
 * - boundary-extractor    → lines that protect capacity
 * - freedom-extractor     → moves that expand optionality
 * - reclaim-extractor     → the specific hours that can come back now
 */

export interface ReclaimItem {
  item: string;
  type?: 'meeting' | 'process' | 'attention' | 'recurring' | 'batchable' | 'unknown';
  recoverable?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface ReclaimResult {
  reclaims: ReclaimItem[];
  gaps: string[];
}

export async function runReclaimExtractor(input: string): Promise<ReclaimResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract reclaim signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const reclaimPatterns = [
      /\b(time sink|hours|meeting|standup|sync|status|reporting|email|inbox|slack|context switch)\b/i,
      /\b(recover|reclaim|get back|buy back|save time|less time|shorter|batch|async)\b/i,
      /\b(every day|weekly|recurring|always|constantly|all day)\b/i,
    ];

    const meetingHints = /\b(meeting|standup|sync|call|zoom|status update)\b/i;
    const processHints = /\b(process|workflow|steps|manual|hand-off|report)\b/i;
    const attentionHints = /\b(inbox|email|slack|notification|interrupt|context switch|distraction)\b/i;
    const recurringHints = /\b(every|weekly|daily|always|recurring|habit)\b/i;
    const batchHints = /\b(batch|async|later|queue|bulk)\b/i;
    const highHints = /\b(hours|every day|all day|most of|constantly)\b/i;
    const lowHints = /\b(occasionally|sometimes|minor|quick)\b/i;
    const gapHints = /\b(no time|always busy|can't free|nothing to cut)\b/i;

    const reclaims: ReclaimItem[] = [];
    const gaps: string[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (gapHints.test(cleaned) && !gaps.includes(cleaned)) {
        gaps.push(cleaned);
      }

      if (reclaimPatterns.some(p => p.test(cleaned))) {
        let type: ReclaimItem['type'] = 'unknown';
        if (meetingHints.test(cleaned)) type = 'meeting';
        else if (processHints.test(cleaned)) type = 'process';
        else if (attentionHints.test(cleaned)) type = 'attention';
        else if (recurringHints.test(cleaned)) type = 'recurring';
        else if (batchHints.test(cleaned)) type = 'batchable';

        let recoverable: ReclaimItem['recoverable'] = 'medium';
        if (highHints.test(cleaned)) recoverable = 'high';
        else if (lowHints.test(cleaned)) recoverable = 'low';

        if (!reclaims.some(r => r.item === cleaned)) {
          reclaims.push({
            item: cleaned,
            type,
            recoverable,
            note:
              type === 'meeting'
                ? 'Meeting sink — shorten, async, or drop so the hour returns'
                : type === 'attention'
                  ? 'Attention leak — batch or fence so focus compounds'
                  : type === 'process'
                    ? 'Process drag — simplify or automate the recurring cost'
                    : type === 'recurring'
                      ? 'Recurring claim on time — reclaim by defaulting to less'
                      : 'Reclaim candidate — the hour is recoverable',
          });
        }
      }
    }

    if (reclaims.length === 0) {
      gaps.push('No explicit reclaim signals found — time sinks remain invisible');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          reclaims.push({
            item: line,
            type: 'unknown',
            recoverable: 'medium',
            note: 'Candidate for reclaim review — what hour can come back?',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'reclaim-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { reclaims, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'reclaim-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
