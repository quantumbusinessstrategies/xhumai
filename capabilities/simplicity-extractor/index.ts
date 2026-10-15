import { logUsage } from '../../backend/utils/logger';

/**
 * Simplicity Extractor Capability
 * Surfaces opportunities to simplify processes, reduce complexity,
 * eliminate unnecessary steps, and streamline work so that work decreases
 * permanently and capacity returns to living more.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - leverage-extractor   → systems that compound
 * - freedom-extractor    → expand optionality
 * - boundary-extractor   → protect capacity
 * - simplicity-extractor → reduce the surface area of work itself
 */

export interface SimplicityItem {
  item: string;
  type?: 'process' | 'step' | 'tool' | 'rule' | 'unknown';
  impact?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface SimplicityResult {
  simplifications: SimplicityItem[];
}

export async function runSimplicityExtractor(input: string): Promise<SimplicityResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract simplicity signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const simplicityPatterns = [
      /\b(simplify|simpler|simple|streamline|reduce complexity|cut steps|eliminate|drop the process|less process)\b/i,
      /\b(unnecessary|redundant|overcomplicated|too many|manual|hand-off|handoff|friction)\b/i,
      /\b(automate this|template|checklist|standard|default|one-click)\b/i,
      /\b(work less|less work|fewer meetings|shorter|lighter)\b/i,
    ];

    const processHints = /\b(process|workflow|procedure|approval|meeting|report)\b/i;
    const stepHints = /\b(step|steps|task|tasks|manual)\b/i;
    const toolHints = /\b(tool|app|software|system|spreadsheet)\b/i;
    const ruleHints = /\b(rule|policy|requirement|must|always)\b/i;
    const highHints = /\b(always|every|constantly|hours|week)\b/i;
    const lowHints = /\b(sometimes|occasional|minor)\b/i;

    const simplifications: SimplicityItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (simplicityPatterns.some(p => p.test(cleaned))) {
        let type: SimplicityItem['type'] = 'unknown';
        if (processHints.test(cleaned)) type = 'process';
        else if (stepHints.test(cleaned)) type = 'step';
        else if (toolHints.test(cleaned)) type = 'tool';
        else if (ruleHints.test(cleaned)) type = 'rule';

        let impact: SimplicityItem['impact'] = 'medium';
        if (highHints.test(cleaned)) impact = 'high';
        else if (lowHints.test(cleaned)) impact = 'low';

        if (!simplifications.some(s => s.item === cleaned)) {
          simplifications.push({
            item: cleaned,
            type,
            impact,
            note:
              type === 'process'
                ? 'Candidate to streamline or eliminate so work does not regenerate'
                : type === 'step'
                  ? 'Candidate step to remove or automate'
                  : type === 'rule'
                    ? 'Candidate rule to relax or default-away'
                    : 'Simplicity signal — reduce surface area of work',
          });
        }
      }
    }

    if (simplifications.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          simplifications.push({
            item: line,
            type: 'unknown',
            impact: 'medium',
            note: 'Candidate for simplicity review',
          });
        }
      }
    }

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'simplicity-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { simplifications };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'simplicity-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
