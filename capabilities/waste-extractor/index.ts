import { logUsage } from '../../backend/utils/logger';

/**
 * Waste Extractor Capability
 * Surfaces repetitive, low-value, eliminable, or automatable work from free-form notes
 * so effort can be cut and living more becomes the default.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - leverage-extractor   → where small effort creates ongoing advantage
 * - energy-extractor     → drains vs restoratives
 * - delegation-extractor → what can leave the founder
 * - action-extractor     → what to do next
 * - clarity-extractor    → what is still fuzzy
 */

export interface WasteItem {
  item: string;
  type?: 'repetitive' | 'low-value' | 'manual' | 'meeting' | 'rework' | 'noise' | 'other';
  reason?: string;
  recommendation?: 'eliminate' | 'automate' | 'delegate' | 'batch' | 'review';
}

export interface WasteResult {
  waste: WasteItem[];
}

export async function runWasteExtractor(input: string): Promise<WasteResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract waste');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const wastePatterns = [
      /\b(every day|every week|always|again|re-?do|re-?write|manual|copy.?paste|status update|check.?in|meeting about|sync|follow.?up on the follow.?up)\b/i,
      /\b(busy.?work|admin|paperwork|reporting for the sake|low.?value|waste of time|time.?sink|drain)\b/i,
      /\b(should stop|can stop|no longer need|redundant|duplicate|rework|fix)\b/i,
    ];

    const repetitiveHints = /\b(every|always|again|repeat|recurring|daily|weekly)\b/i;
    const manualHints = /\b(manual|by hand|copy.?paste|spreadsheet dance)\b/i;
    const meetingHints = /\b(meeting|sync|stand.?up|check.?in|status)\b/i;
    const reworkHints = /\b(re-?do|re-?write|rework|fix|duplicate)\b/i;

    const waste: WasteItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (wastePatterns.some(p => p.test(cleaned))) {
        let type: WasteItem['type'] = 'other';
        let recommendation: WasteItem['recommendation'] = 'review';

        if (repetitiveHints.test(cleaned)) {
          type = 'repetitive';
          recommendation = 'automate';
        } else if (manualHints.test(cleaned)) {
          type = 'manual';
          recommendation = 'automate';
        } else if (meetingHints.test(cleaned)) {
          type = 'meeting';
          recommendation = 'eliminate';
        } else if (reworkHints.test(cleaned)) {
          type = 'rework';
          recommendation = 'eliminate';
        } else if (/\b(low.?value|busy.?work|admin)\b/i.test(cleaned)) {
          type = 'low-value';
          recommendation = 'eliminate';
        }

        if (!waste.some(w => w.item === cleaned)) {
          waste.push({
            item: cleaned,
            type,
            reason: 'Candidate for reduction so work can shrink',
            recommendation,
          });
        }
      }
    }

    // Light fallback so sparse input still returns value
    if (waste.length === 0) {
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          waste.push({
            item: line,
            type: 'other',
            reason: 'Candidate for waste review',
            recommendation: 'review',
          });
        }
      }
    }
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'waste-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { waste };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'waste-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
