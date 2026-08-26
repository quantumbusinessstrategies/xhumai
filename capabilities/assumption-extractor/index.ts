import { logUsage } from '../../backend/utils/logger';

/**
 * Assumption Extractor Capability
 * Surfaces implicit assumptions, premises, and taken-for-granted beliefs from free-form notes
 * so they can be validated or challenged and nothing rests on invisible foundations.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - action-extractor      → what to do next
 * - decision-extractor    → what was settled (or still open)
 * - follow-up-extractor   → who/what still needs a touch
 * - deadline-extractor    → when it must happen
 * - blocker-extractor     → what is in the way right now
 * - owner-extractor       → who owns it
 * - priority-sorter       → where attention should go
 * - risk-extractor        → what could go wrong so we see it early
 * - opportunity-extractor → what could go right so we capture it early
 * - insight-extractor     → what we learned / what stands out
 * - assumption-extractor  → what we are taking for granted so foundations stay solid
 */

export interface AssumptionItem {
  assumption: string;
  confidence?: 'high' | 'medium' | 'low';
  context?: string;
  challenge?: string;
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
      /\b(assum(e|es|ed|ing|ption|ptions)|premise|premises|given that|taking for granted|we (believe|expect|presume)|it is (assumed|understood)|obviously|clearly|of course|must be|has to be)\b/i,
      /\b(if we (assume|presume)|based on the (assumption|idea) that|underlying (belief|premise))\b/i,
      /\b(we (are|were) (assuming|presuming)|the (assumption|premise) (is|was|that))\b/i,
    ];

    const highConfidence = /\b(certain|sure|definite|obvious|clear|known|proven)\b/i;
    const lowConfidence = /\b(maybe|perhaps|possibly|might|could|uncertain|tentative)\b/i;

    const assumptions: AssumptionItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/u, '')
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
