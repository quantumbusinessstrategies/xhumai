import { logUsage } from '../../backend/utils/logger';

/**
 * Capacity Extractor Capability
 * Surfaces bandwidth, overcommitment, load signals, and available capacity
 * from free-form notes so work is sized to the human and living more remains possible.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - energy-extractor     → what drains vs restores life-force
 * - reclaim-extractor    → time sinks that can be recovered
 * - rhythm-extractor     → natural vs forced pace
 * - boundary-extractor   → lines that protect capacity
 * - capacity-extractor   → real available bandwidth vs current load
 */

export interface CapacityItem {
  item: string;
  signal?: 'overloaded' | 'available' | 'stretched' | 'protected' | 'unknown';
  intensity?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface CapacityResult {
  capacities: CapacityItem[];
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
      /\b(capacity|bandwidth|bandwidth left|room for|no room|overloaded|overcommitted|overbooked|stretched|thin|maxed|full plate|too much on|can't take|available|headroom|spare capacity|open slot)\b/i,
      /\b(already full|at capacity|beyond capacity|under capacity|spare time|free slot|protect time|guard time)\b/i,
      /\b(too many commitments|said yes to|can't say no|plate is full|running on empty)\b/i,
    ];

    const overloadedHints = /\b(overloaded|overcommitted|overbooked|stretched|thin|maxed|full plate|too much|no room|beyond capacity|running on empty)\b/i;
    const availableHints = /\b(available|headroom|spare|room for|open slot|under capacity|free slot|bandwidth left)\b/i;
    const protectedHints = /\b(protect|guard|block|hold|reserved|sacred|non.?negotiable time)\b/i;
    const highHints = /\b(extremely|very|completely|totally|severely|critically)\b/i;
    const lowHints = /\b(slightly|a bit|mild|somewhat)\b/i;

    const capacities: CapacityItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (capacityPatterns.some(p => p.test(cleaned))) {
        let signal: CapacityItem['signal'] = 'unknown';
        if (overloadedHints.test(cleaned)) signal = 'overloaded';
        else if (availableHints.test(cleaned)) signal = 'available';
        else if (protectedHints.test(cleaned)) signal = 'protected';
        else if (/\bstretched\b/i.test(cleaned)) signal = 'stretched';

        let intensity: CapacityItem['intensity'] = 'medium';
        if (highHints.test(cleaned)) intensity = 'high';
        else if (lowHints.test(cleaned)) intensity = 'low';

        if (!capacities.some(c => c.item === cleaned)) {
          capacities.push({
            item: cleaned,
            signal,
            intensity,
            note:
              signal === 'overloaded'
                ? 'Candidate to refuse, defer, or shed load so living more stays possible'
                : signal === 'available'
                  ? 'Candidate headroom — protect or allocate deliberately'
                  : signal === 'protected'
                    ? 'Capacity already guarded — reinforce the boundary'
                    : signal === 'stretched'
                      ? 'Near the edge — watch for tipping into overload'
                      : 'Capacity-relevant signal',
          });
        }
      }
    }

    if (capacities.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          capacities.push({
            item: line,
            signal: 'unknown',
            intensity: 'medium',
            note: 'Candidate for capacity review',
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

    return { capacities };
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
