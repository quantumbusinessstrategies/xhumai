import { logUsage } from '../../backend/utils/logger';

/**
 * Leverage Extractor Capability
 * Surfaces high-leverage opportunities, systems, and compounding actions from free-form notes
 * so effort compounds and future work shrinks.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - action-extractor     → what to do next
 * - decision-extractor   → what was settled (or still open)
 * - follow-up-extractor  → who/what still needs a touch
 * - deadline-extractor   → when it must happen
 * - blocker-extractor    → what is in the way right now
 * - owner-extractor      → who owns it
 * - priority-sorter      → where attention should go
 * - risk-extractor       → what could go wrong
 * - leverage-extractor   → where small effort creates ongoing advantage
 */

export interface LeverageItem {
  opportunity: string;
  type?: 'system' | 'automation' | 'process' | 'asset' | 'relationship' | 'other';
  why?: string;
  effort?: 'low' | 'medium' | 'high';
}

export interface LeverageResult {
  leverage: LeverageItem[];
}

export async function runLeverageExtractor(input: string): Promise<LeverageResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract leverage');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const leveragePatterns = [
      /\b(automat|system|process|template|playbook|repeatable|compound|leverage|scale|once and|reusable|infrastructure|platform|pipeline|workflow|habit|routine)\b/i,
      /\b(build once|set up|create a|establish|document|standardize|codify)\b/i,
      /\b(every time|always|forever|ongoing|recurring|multiplies|pays off)\b/i,
    ];

    const systemHints = /\b(system|process|workflow|pipeline|platform|infrastructure)\b/i;
    const autoHints = /\b(automat|script|bot|agent|tool)\b/i;
    const assetHints = /\b(template|playbook|asset|library|docs)\b/i;

    const leverage: LeverageItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (leveragePatterns.some(p => p.test(cleaned))) {
        let type: LeverageItem['type'] = 'other';
        if (systemHints.test(cleaned)) type = 'system';
        else if (autoHints.test(cleaned)) type = 'automation';
        else if (assetHints.test(cleaned)) type = 'asset';
        else if (/\b(process|habit|routine)\b/i.test(cleaned)) type = 'process';

        if (!leverage.some(l => l.opportunity === cleaned)) {
          leverage.push({
            opportunity: cleaned,
            type,
            why: 'Potential compounding or reusable advantage',
            effort: cleaned.length > 80 ? 'medium' : 'low',
          });
        }
      }
    }

    // Light fallback so sparse input still returns value
    if (leverage.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          leverage.push({
            opportunity: line,
            type: 'other',
            why: 'Candidate for leverage review',
            effort: 'medium',
          });
        }
      }
    }
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'leverage-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { leverage };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'leverage-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
