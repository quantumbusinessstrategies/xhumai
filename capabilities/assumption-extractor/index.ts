import { logUsage } from '../../backend/utils/logger';

/**
 * Assumption Extractor Capability
 * Surfaces unspoken assumptions, premises, and taken-for-granted beliefs from free-form notes
 * so decisions rest on clearer ground and hidden premises become visible.
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
 * - risk-extractor        → what could go wrong
 * - opportunity-extractor → what could go right
 * - assumption-extractor  → what we are taking for granted
 */

export interface AssumptionItem {
  assumption: string;
  strength?: 'strong' | 'moderate' | 'weak';
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
      /\b(assume|assuming|assumption|assumptions|presume|presuming|presumption|take for granted|taken for granted|implicit|implicitly|given that|of course|obviously|clearly|naturally|we all know|everyone knows)\b/i,
      /\b(must be|has to be|is bound to|will always|never fails|without question)\b/i,
      /\b(if we .{0,40}then|since .{0,30}we|because .{0,30}will)\b/i,
      /\b(premise|premises|belief|beliefs|expect|expected|expectation)\b/i,
    ];

    const strongCue = /\b(always|never|must|certain|definitely|obviously|clearly|without doubt)\b/i;
    const weakCue = /\b(maybe|perhaps|might|possibly|seems|appears|could)\b/i;

    const assumptions: AssumptionItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (assumptionPatterns.some(p => p.test(cleaned))) {
        let strength: AssumptionItem['strength'] = 'moderate';
        if (strongCue.test(cleaned)) strength = 'strong';
        else if (weakCue.test(cleaned)) strength = 'weak';

        if (!assumptions.some(a => a.assumption === cleaned)) {
          assumptions.push({
            assumption: cleaned,
            strength,
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
            strength: 'moderate',
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
