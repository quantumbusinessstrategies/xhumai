import { logUsage } from '../../backend/utils/logger';

/**
 * Assumption Extractor Capability
 * Surfaces implicit assumptions, premises, and taken-for-granted claims from free-form notes
 * so they become visible and testable — reducing expensive surprises later.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - action-extractor       → what to do next
 * - decision-extractor     → what was settled (or still open)
 * - follow-up-extractor    → who/what still needs a touch
 * - deadline-extractor     → when it must happen
 * - blocker-extractor      → what is in the way right now
 * - owner-extractor        → who owns it
 * - priority-sorter        → where attention should go
 * - risk-extractor         → what could go wrong so we see it early
 * - opportunity-extractor  → what could go right so we capture it early
 * - assumption-extractor   → what we are taking for granted so we can test it
 */

export interface AssumptionItem {
  assumption: string;
  confidence?: 'high' | 'medium' | 'low';
  context?: string;
  testIdea?: string;
}

export interface AssumptionResult {
  assumptions: AssumptionItem[];
}

export async function runAssumptionExtractor(input: string): Promise<AssumptionResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract assumptions');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const assumptionPatterns = [
      /\b(assume|assumes|assuming|assumption|assumptions|premise|premises|take for granted|taken for granted|implicit|unspoken|given that|suppose|supposing|believe that|we think|it is clear that|obviously|of course|everyone knows)\b/i,
      /\b(if we .{0,40}(then|will)|must be|has to be|will always|never fails|no need to)\b/i,
      /\b(we (can|will|should) (rely|count|depend) on|without (checking|validating|testing))\b/i,
    ];

    const highConfidence = /\b(obviously|of course|clearly|certainly|definitely|must|always|never)\b/i;
    const lowConfidence = /\b(maybe|perhaps|possibly|might|could|uncertain|unclear)\b/i;

    const assumptions: AssumptionItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (assumptionPatterns.some(p => p.test(cleaned))) {
        let confidence: AssumptionItem['confidence'] = 'medium';
        if (highConfidence.test(cleaned)) confidence = 'high';
        else if (lowConfidence.test(cleaned)) confidence = 'low';

        if (!assumptions.some(a => a.assumption === cleaned)) {
          assumptions.push({
            assumption: cleaned,
            confidence,
            context: cleaned.length > 90 ? cleaned.slice(0, 90) + '…' : cleaned,
          });
        }
      }
    }

    // Light fallback so sparse input still returns value
    if (assumptions.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          assumptions.push({
            assumption: line,
            confidence: 'medium',
            context: line,
          });
        }
      }
    }
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'assumption-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { assumptions };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'assumption-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
