import { logUsage } from '../../backend/utils/logger';

/**
 * Clarity Extractor Capability
 * Surfaces vague language, undefined terms, fuzzy commitments, and places where
 * more precision would unlock progress so work stops spinning on ambiguity.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - assumption-extractor → hidden premises
 * - question-extractor   → open inquiries
 * - constraint-extractor → hard bounds
 * - clarity-extractor    → language that needs sharpening so execution can start
 */

export interface ClarityItem {
  text: string;
  issue?: 'vague' | 'undefined' | 'fuzzy-commitment' | 'missing-criteria' | 'ambiguous' | 'unknown';
  suggestion?: string;
  context?: string;
}

export interface ClarityResult {
  clarities: ClarityItem[];
}

export async function runClarityExtractor(input: string): Promise<ClarityResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract clarity issues');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const vaguePatterns = [
      /\b(somehow|somewhat|kind of|sort of|maybe|perhaps|possibly|around|about|roughly|etc\.?|and so on|whatever|stuff|things|some|various|several)\b/i,
      /\b(asap|soon|later|eventually|when we can|at some point|in the future|TBD|to be determined|TBA)\b/i,
      /\b(improve|optimize|enhance|better|more|less|faster|easier|nicer)\b/i,
      /\b(we should|we need to|it would be good|it might|could be|ought to)\b/i,
      /\b(undefined|unclear|vague|fuzzy|ambiguous|not sure|TBD|placeholder)\b/i,
    ];

    const issueFrom = (line: string): ClarityItem['issue'] => {
      if (/\b(asap|soon|later|eventually|TBD|to be determined)\b/i.test(line)) return 'fuzzy-commitment';
      if (/\b(undefined|unclear|vague|fuzzy|ambiguous|not sure|placeholder)\b/i.test(line)) return 'undefined';
      if (/\b(somehow|somewhat|kind of|sort of|maybe|perhaps|whatever|stuff|things)\b/i.test(line)) return 'vague';
      if (/\b(improve|optimize|enhance|better|more|less)\b/i.test(line) && !/\b(by|to|from|metric|kpi|number|%)\b/i.test(line)) return 'missing-criteria';
      if (/\b(we should|we need to|it would be good|it might|could be)\b/i.test(line)) return 'ambiguous';
      return 'unknown';
    };

    const clarities: ClarityItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (vaguePatterns.some(p => p.test(cleaned))) {
        if (!clarities.some(c => c.text === cleaned)) {
          const issue = issueFrom(cleaned);
          clarities.push({
            text: cleaned,
            issue,
            suggestion:
              issue === 'fuzzy-commitment'
                ? 'Replace with a concrete date or trigger'
                : issue === 'missing-criteria'
                ? 'Add a measurable success condition'
                : issue === 'vague'
                ? 'Name the specific thing or outcome'
                : 'Make the intent and owner explicit',
            context: cleaned.length > 90 ? cleaned.slice(0, 90) + '…' : cleaned,
          });
        }
      }
    }

    if (clarities.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          clarities.push({
            text: line,
            issue: 'unknown',
            context: line,
          });
        }
      }
    }
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'clarity-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { clarities };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'clarity-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
