import { logUsage } from '../../backend/utils/logger';

/**
 * Text Summarizer Capability
 * This is the first real capability.
 * Right now it is a smart stub.
 * Later we will plug in real AI (OpenAI, Grok, Claude, etc.)
 */

export async function runTextSummarizer(input: string): Promise<string> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to summarize');
    }

    // --- STUB LOGIC (will be replaced by real AI) ---
    const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const summary = sentences.slice(0, Math.min(3, sentences.length)).join('. ') + '.';
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'text-summarizer',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return summary;
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'text-summarizer',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}