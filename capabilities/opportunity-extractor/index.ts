import { logUsage } from '../../backend/utils/logger';

/**
 * Opportunity Extractor Capability
 * Surfaces opportunities, upside, potential wins, and leverage points from free-form notes
 * so upside is visible and nothing is left on the table.
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
 * - opportunity-extractor → what could compound / win
 */

export interface OpportunityItem {
  opportunity: string;
  potential?: 'high' | 'medium' | 'low';
  context?: string;
  nextStep?: string;
}

export interface OpportunityResult {
  opportunities: OpportunityItem[];
}

export async function runOpportunityExtractor(input: string): Promise<OpportunityResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract opportunities');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const opportunityPatterns = [
      /\b(opportunity|opportunities|upside|potential|win|wins|leverage|advantage|growth|scale|expand|breakthrough|untapped|opening|chance|could gain|might grow|room to|room for)\b/i,
      /\b(if we .{0,30}(could|can|might)|what if we|imagine if|possibility of)\b/i,
      /\b(potential|possible|likely).{0,40}(gain|win|growth|improvement|leverage|advantage)\b/i,
    ];

    const highPotential = /\b(huge|massive|significant|major|high|breakthrough|game.?changing|transformative)\b/i;
    const lowPotential = /\b(small|minor|slight|limited|modest)\b/i;

    const opportunities: OpportunityItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (opportunityPatterns.some(p => p.test(cleaned))) {
        let potential: OpportunityItem['potential'] = 'medium';
        if (highPotential.test(cleaned)) potential = 'high';
        else if (lowPotential.test(cleaned)) potential = 'low';

        if (!opportunities.some(o => o.opportunity === cleaned)) {
          opportunities.push({
            opportunity: cleaned,
            potential,
            context: cleaned.length > 90 ? cleaned.slice(0, 90) + '…' : cleaned,
          });
        }
      }
    }

    // Light fallback so sparse input still returns value
    if (opportunities.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          opportunities.push({
            opportunity: line,
            potential: 'medium',
            context: line,
          });
        }
      }
    }
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'opportunity-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { opportunities };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'opportunity-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
