import { logUsage } from '../../backend/utils/logger';

/**
 * Spaciousness Extractor Capability
 * Surfaces points of spaciousness, open time, unfilled capacity, and room to breathe
 * so reclaimed hours can actually be inhabited rather than immediately refilled.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - margin-extractor     → buffers and slack
 * - stillness-extractor  → quiet non-doing
 * - enough-extractor     → what is already sufficient
 * - reclaim-extractor    → recoverable hours
 */

export interface SpaciousnessItem {
  item: string;
  type?: 'open-time' | 'unfilled' | 'breathing-room' | 'protected-space' | 'unknown';
  note?: string;
}

export interface SpaciousnessResult {
  spaciousness: SpaciousnessItem[];
  gaps: string[];
}

export async function runSpaciousnessExtractor(input: string): Promise<SpaciousnessResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract spaciousness signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const spacePatterns = [
      /\b(space|spacious|open time|free time|unfilled|empty|room to|breathing room|margin|buffer|slack)\b/i,
      /\b(unscheduled|protected|held|not filled|left open|white space)\b/i,
      /\b(overwhelm|packed|full|no room|no space|crammed|back to back)\b/i,
    ];

    const openHints = /\b(open|free|available|unscheduled|blank)\b/i;
    const unfilledHints = /\b(unfilled|empty|not filled|left open)\b/i;
    const breathingHints = /\b(breathing room|room to breathe|not rushed|spacious)\b/i;
    const protectedHints = /\b(protected|held|sacred|non-negotiable)\b/i;
    const gapHints = /\b(no space|no room|packed|full|crammed|always full|no margin)\b/i;

    const spaciousness: SpaciousnessItem[] = [];
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

      if (spacePatterns.some(p => p.test(cleaned))) {
        let type: SpaciousnessItem['type'] = 'unknown';
        if (protectedHints.test(cleaned)) type = 'protected-space';
        else if (breathingHints.test(cleaned)) type = 'breathing-room';
        else if (unfilledHints.test(cleaned)) type = 'unfilled';
        else if (openHints.test(cleaned)) type = 'open-time';

        if (!spaciousness.some(s => s.item === cleaned)) {
          spaciousness.push({
            item: cleaned,
            type,
            note:
              type === 'protected-space'
                ? 'Protected space — keep it held so reclaimed capacity can be inhabited rather than refilled'
                : type === 'breathing-room'
                  ? 'Breathing room — protect it so life has room to exist inside the day'
                  : type === 'unfilled'
                    ? 'Unfilled capacity — leave it open so living more has somewhere to land'
                    : type === 'open-time'
                      ? 'Open time — name it so it is not immediately consumed by the next demand'
                      : 'Spaciousness signal — surface the room so reclaimed hours stay available for living more',
          });
        }
      }
    }

    if (spaciousness.length === 0) {
      gaps.push('No explicit spaciousness signals found — capacity may still be fully allocated and living more remains residual');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          spaciousness.push({
            item: line,
            type: 'unknown',
            note: 'Candidate for spaciousness review — check whether this leaves room or consumes the last margin',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'spaciousness-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { spaciousness, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'spaciousness-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
