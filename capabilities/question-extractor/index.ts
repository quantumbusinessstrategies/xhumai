import { logUsage } from '../../backend/utils/logger';

/**
 * Question Extractor Capability
 * Surfaces unanswered questions and open inquiries from free-form notes
 * so thinking can close instead of looping, and work does not pretend to be done.
 * Stub for now; later becomes real AI.
 */

export interface QuestionItem {
  question: string;
  kind?: 'open' | 'clarifying' | 'decision' | 'unknown';
  context?: string;
}

export interface QuestionResult {
  questions: QuestionItem[];
}

export async function runQuestionExtractor(input: string): Promise<QuestionResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract questions');
    }

    const chunks = input
      .split(/[\n;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 6);

    const patterns = [
      /\?\s*$/,
      /\b(what|why|how|when|where|who|which|whether)\b/i,
      /\b(open question|unresolved|unclear|not sure|need to know|tbd|unknown)\b/i,
      /\b(do we|should we|can we|is it|are we)\b/i,
    ];

    const questions: QuestionItem[] = [];

    for (const chunk of chunks) {
      const parts = chunk.includes('?')
        ? chunk.split(/(?<=\?)/).map(s => s.trim()).filter(Boolean)
        : [chunk];

      for (const line of parts) {
        const cleaned = line
          .replace(/^[-*\u2022]\s+/, '')
          .replace(/^\d+[.)]\s+/, '')
          .trim();
        if (cleaned.length < 8) continue;

        if (!patterns.some(p => p.test(cleaned))) continue;

        let kind: QuestionItem['kind'] = 'open';
        if (/\b(decide|decision|should we|go with)\b/i.test(cleaned)) kind = 'decision';
        else if (/\b(clarify|unclear|not sure|mean|define)\b/i.test(cleaned)) kind = 'clarifying';
        else if (!/\?/.test(cleaned) && !/\b(what|why|how|whether)\b/i.test(cleaned)) kind = 'unknown';

        if (!questions.some(q => q.question === cleaned)) {
          questions.push({
            question: cleaned,
            kind,
            context: cleaned.length > 90 ? cleaned.slice(0, 90) + '…' : cleaned,
          });
        }
      }
    }

    if (questions.length === 0) {
      for (const line of chunks.slice(0, 3)) {
        if (line.length < 140) {
          questions.push({ question: line, kind: 'unknown', context: line });
        }
      }
    }

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'question-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { questions };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'question-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
