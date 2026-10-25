import { logUsage } from '../../backend/utils/logger';

/**
 * Capacity Extractor Capability
 * Surfaces current load, sustainable capacity, headroom, and overdraw signals
 * so work is sized to available energy and life is not borrowed against.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - energy-extractor     → what drains vs restores
 * - boundary-extractor   → lines that protect capacity
 * - reclaim-extractor    → hours that can return
 * - rhythm-extractor     → natural windows that make capacity usable
 * - capacity-extractor   → the actual size of the container so work fits inside it
 */

export interface CapacityItem {
  item: string;
  type?: 'load' | 'capacity' | 'headroom' | 'overdraw' | 'unknown';
  intensity?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface CapacityResult {
  capacities: CapacityItem[];
  gaps: string[];
}

export async function runCapacityExtractor(input: string): Promise<CapacityResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract capacity signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const capacityPatterns = [
      /\b(capacity|load|bandwidth|headroom|overdrawn|overwhelmed|sustainable|full|maxed|room|space|energy left|too much)\b/i,
      /\b(can handle|can't handle|at limit|beyond|stretch|spare|available|busy|overloaded)\b/i,
    ];

    const loadHints = /\b(load|full|busy|overloaded|maxed|too much|at capacity|stretched)\b/i;
    const capacityHints = /\b(capacity|can handle|sustainable|bandwidth|available|room for)\b/i;
    const headroomHints = /\b(headroom|spare|space|room|left|available|buffer)\b/i;
    const overdrawHints = /\b(overdrawn|borrowed|beyond|can't sustain|burning|draining life)\b/i;
    const highHints = /\b(maxed|overwhelmed|completely|all day|every hour|critical)\b/i;
    const lowHints = /\b(some|a little|minor|light)\b/i;
    const gapHints = /\b(no capacity|always full|nothing left|no room|maxed out)\b/i;

    const capacities: CapacityItem[] = [];
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

      if (capacityPatterns.some(p => p.test(cleaned))) {
        let type: CapacityItem['type'] = 'unknown';
        if (loadHints.test(cleaned)) type = 'load';
        else if (capacityHints.test(cleaned)) type = 'capacity';
        else if (headroomHints.test(cleaned)) type = 'headroom';
        else if (overdrawHints.test(cleaned)) type = 'overdraw';

        let intensity: CapacityItem['intensity'] = 'medium';
        if (highHints.test(cleaned)) intensity = 'high';
        else if (lowHints.test(cleaned)) intensity = 'low';

        if (!capacities.some(c => c.item === cleaned)) {
          capacities.push({
            item: cleaned,
            type,
            intensity,
            note:
              type === 'load'
                ? 'Current load — size work to what is actually sustainable'
                : type === 'capacity'
                  ? 'Available capacity — the real container for new work'
                  : type === 'headroom'
                    ? 'Headroom — buffer that protects living more'
                    : type === 'overdraw'
                      ? 'Overdraw signal — life is being borrowed against; reclaim or boundary needed'
                      : 'Capacity signal — check whether work fits the container',
          });
        }
      }
    }

    if (capacities.length === 0) {
      gaps.push('No explicit capacity signals found — load vs headroom remains invisible');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          capacities.push({
            item: line,
            type: 'unknown',
            intensity: 'medium',
            note: 'Candidate for capacity review — does this fit sustainable load?',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'capacity-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { capacities, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'capacity-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
