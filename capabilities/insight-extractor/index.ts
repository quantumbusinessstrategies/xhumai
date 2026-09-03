import { logUsage } from '../../backend/utils/logger';

/**
 * Insight Extractor Capability
 * Surfaces key insights, patterns, and non-obvious takeaways from free-form notes
 * so understanding compounds and nothing valuable is missed.
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
 * - insight-extractor     → what we learned / what stands out so understanding compounds
 */

export interface InsightItem {
  insight: string;
  strength?: 'high' | 'medium' | 'low';
  context?: string;
  theme?: string;
}

export interface InsightResult {
  insights: InsightItem[];
}

export async function runInsightExtractor(input: string): Promise<InsightResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract insights');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const insightPatterns = [
      /\b(insight|insights|realize[d]?|realization|pattern|patterns|takeaway|takeaways|lesson|lessons|notice[d]?|observation|key point|notable|interesting|surprising|non-obvious)\b/i,
      /\b(what (stands out|we learned|this means|matters)|the (real|underlying|core) (issue|signal|theme))\b/i,
      /\b(it (turns out|seems|appears) that|in other words|the pattern is)\b/i,
      /\b(aha|key insight|big picture|connecting the dots)\b/i,
    ];

    const highStrength = /\b(key|critical|major|important|significant|core|fundamental|striking)\b/i;
    const lowStrength = /\b(minor|small|slight|possible|maybe)\b/i;

    const insights: InsightItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (insightPatterns.some(p => p.test(cleaned))) {
        let strength: InsightItem['strength'] = 'medium';
        if (highStrength.test(cleaned)) strength = 'high';
        else if (lowStrength.test(cleaned)) strength = 'low';

        if (!insights.some(i => i.insight === cleaned)) {
          insights.push({
            insight: cleaned,
            strength,
            context: cleaned.length > 90 ? cleaned.slice(0, 90) + '…' : cleaned,
          });
        }
      }
    }

    // Light fallback so sparse input still returns value
    if (insights.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          insights.push({
            insight: line,
            strength: 'medium',
            context: line,
          });
        }
      }
    }
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'insight-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { insights };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'insight-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
