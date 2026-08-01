import { logUsage } from '../../backend/utils/logger';

/**
 * Action Extractor Capability
 * Pulls concrete next steps out of free-form text so the user can stop
 * re-reading and start executing. Stub for now; later becomes real AI.
 */

export async function runActionExtractor(input: string): Promise<string[]> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 15) {
      throw new Error('Text is too short to extract actions');
    }

    // --- STUB LOGIC (replace with real model later) ---
    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const actionPatterns = [
      /\b(need to|should|must|have to|todo|to-do|action|next|follow up|schedule|send|call|write|build|fix|review|update|create|finish)\b/i,
      /^[-*\u2022]\s+/,
      /^\d+[.)]\s+/,
    ];

    const actions: string[] = [];
    for (const line of lines) {
      if (actionPatterns.some(p => p.test(line))) {
        const cleaned = line.replace(/^[-*\u2022]\s+/, '').replace(/^\d+[.)]\s+/, '').trim();
        if (cleaned.length > 5 && !actions.includes(cleaned)) {
          actions.push(cleaned);
        }
      }
    }

    // Fallback: treat short imperative sentences as actions
    if (actions.length === 0) {
      for (const line of lines.slice(0, 5)) {
        if (line.length < 120) actions.push(line);
      }
    }
    // ------------------------------------------------

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'action-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return actions;
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'action-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
