import { logUsage } from '../../backend/utils/logger';

/**
 * Risk Extractor Capability
 * Surfaces risks, threats, exposure points, and potential downsides from free-form notes
 * so downside is visible and nothing blindsides the work.
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
 * - risk-extractor       → what could go wrong so we see it early
 */

export interface RiskItem {
  risk: string;
  severity?: 'high' | 'medium' | 'low';
  context?: string;
  mitigation?: string;
}

export interface RiskResult {
  risks: RiskItem[];
}

export async function runRiskExtractor(input: string): Promise<RiskResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract risks');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const riskPatterns = [
      /\b(risk|risks|threat|threats|exposure|vulnerable|downside|could fail|might break|concern|concerns|worry|worried|hazard|liability|uncertainty)\b/i,
      /\b(if .+ (fails|breaks|delays|slips|misses)|what if|in case of|worst case)\b/i,
      /\b(potential|possible|likely).{0,40}(problem|issue|delay|loss|impact)\b/i,
    ];

    const highSeverity = /\b(critical|high|severe|major|catastrophic|urgent|immediate)\b/i;
    const lowSeverity = /\b(low|minor|small|slight|unlikely)\b/i;

    const risks: RiskItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (riskPatterns.some(p => p.test(cleaned))) {
        let severity: RiskItem['severity'] = 'medium';
        if (highSeverity.test(cleaned)) severity = 'high';
        else if (lowSeverity.test(cleaned)) severity = 'low';

        if (!risks.some(r => r.risk === cleaned)) {
          risks.push({
            risk: cleaned,
            severity,
            context: cleaned.length > 90 ? cleaned.slice(0, 90) + '…' : cleaned,
          });
        }
      }
    }

    // Light fallback so sparse input still returns value
    if (risks.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          risks.push({
            risk: line,
            severity: 'medium',
            context: line,
          });
        }
      }
    }
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'risk-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { risks };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'risk-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
