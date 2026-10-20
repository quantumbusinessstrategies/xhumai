import { logUsage } from '../../backend/utils/logger';

/**
 * Compound Extractor Capability
 * Surfaces decisions, systems, assets, and moves that compound over time
 * so small inputs continue producing value after you stop working.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - leverage-extractor   → systems that keep working after you stop
 * - automation-extractor → same outcome without ongoing time
 * - freedom-extractor    → autonomy and optionality that expand life
 * - reclaim-extractor    → hours that can return to life
 */

export interface CompoundItem {
  item: string;
  type?: 'system' | 'asset' | 'default' | 'habit' | 'unknown';
  impact?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface CompoundResult {
  compounds: CompoundItem[];
  gaps: string[];
}

export async function runCompoundExtractor(input: string): Promise<CompoundResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract compound signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const compoundPatterns = [
      /\b(compound|compounds|compounding|scale|scales|forever|keeps working|keeps paying|asset|system that|default|habit|once and|set it and)\b/i,
      /\b(build once|write once|template once|document once|automate once)\b/i,
      /\b(work less|live more|after I stop|without me|runs itself)\b/i,
    ];

    const systemHints = /\b(system|process|workflow|pipeline)\b/i;
    const assetHints = /\b(asset|content|code|doc|template|library)\b/i;
    const defaultHints = /\b(default|standard|always|policy)\b/i;
    const habitHints = /\b(habit|ritual|routine|daily)\b/i;
    const highHints = /\b(every|always|forever|scales|compound)\b/i;
    const lowHints = /\b(sometimes|minor|one-off)\b/i;
    const gapHints = /\b(start from scratch|redo|manual every|no system|doesn't compound)\b/i;

    const compounds: CompoundItem[] = [];
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

      if (compoundPatterns.some(p => p.test(cleaned))) {
        let type: CompoundItem['type'] = 'unknown';
        if (systemHints.test(cleaned)) type = 'system';
        else if (assetHints.test(cleaned)) type = 'asset';
        else if (defaultHints.test(cleaned)) type = 'default';
        else if (habitHints.test(cleaned)) type = 'habit';

        let impact: CompoundItem['impact'] = 'medium';
        if (highHints.test(cleaned)) impact = 'high';
        else if (lowHints.test(cleaned)) impact = 'low';

        if (!compounds.some(c => c.item === cleaned)) {
          compounds.push({
            item: cleaned,
            type,
            impact,
            note:
              type === 'system'
                ? 'System candidate — encode it so it keeps producing after you stop'
                : type === 'asset'
                  ? 'Asset candidate — build once, keep receiving the return'
                  : type === 'default'
                    ? 'Default candidate — decide once so attention stops returning to it'
                    : type === 'habit'
                      ? 'Habit candidate — small repeated action that compounds into capacity'
                      : 'Compound signal — this can keep producing value without ongoing effort',
          });
        }
      }
    }

    if (compounds.length === 0) {
      gaps.push('No explicit compound signals found — work may still require ongoing attention');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          compounds.push({
            item: line,
            type: 'unknown',
            impact: 'medium',
            note: 'Candidate for compound review — can this keep producing after you stop?',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'compound-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { compounds, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'compound-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
