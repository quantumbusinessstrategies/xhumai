import { logUsage } from '../../backend/utils/logger';

/**
 * Energy Extractor Capability
 * Surfaces what drains energy and what restores it from free-form notes
 * so work can be redesigned toward living more, not just doing more.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - priority-sorter       → where attention should go
 * - blocker-extractor     → what is in the way
 * - leverage-extractor    → what keeps working after you stop
 * - delegation-extractor  → what should leave the founder's hands
 * - energy-extractor      → what costs life-force vs what returns it
 */

export interface EnergyItem {
  item: string;
  polarity?: 'drain' | 'restore' | 'mixed' | 'unknown';
  intensity?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface EnergyResult {
  energy: EnergyItem[];
}

export async function runEnergyExtractor(input: string): Promise<EnergyResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract energy signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const energyPatterns = [
      /\b(exhaust|exhausting|draining|drain|burnout|burned out|tired|fatigue|overwhelm|overwhelmed|heavy|dread|anxious|anxiety)\b/i,
      /\b(energiz|energised|energized|restor|restore|restored|alive|flow|focused|calm|peaceful|recharge|recharged|light)\b/i,
      /\b(costs me|takes it out of me|gives me life|fills me up|lights me up|weighs on me)\b/i,
      /\b(too much context switching|meeting load|inbox|admin grind|deep work|walk|sleep|family time)\b/i,
    ];

    const drainHints = /\b(exhaust|drain|burnout|tired|fatigue|overwhelm|dread|anxious|heavy|weighs|costs me|grind)\b/i;
    const restoreHints = /\b(energiz|restor|alive|flow|focused|calm|peaceful|recharge|lights me up|fills me|gives me life)\b/i;
    const highHints = /\b(extremely|very|deeply|constantly|always|crushing|severe)\b/i;
    const lowHints = /\b(slightly|a bit|mild|sometimes|occasionally)\b/i;

    const energy: EnergyItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;

      if (energyPatterns.some(p => p.test(cleaned))) {
        const drain = drainHints.test(cleaned);
        const restore = restoreHints.test(cleaned);
        let polarity: EnergyItem['polarity'] = 'unknown';
        if (drain && restore) polarity = 'mixed';
        else if (drain) polarity = 'drain';
        else if (restore) polarity = 'restore';

        let intensity: EnergyItem['intensity'] = 'medium';
        if (highHints.test(cleaned)) intensity = 'high';
        else if (lowHints.test(cleaned)) intensity = 'low';

        if (!energy.some(e => e.item === cleaned)) {
          energy.push({
            item: cleaned,
            polarity,
            intensity,
            note:
              polarity === 'drain'
                ? 'Candidate to reduce, redesign, or delegate'
                : polarity === 'restore'
                  ? 'Candidate to protect and schedule first'
                  : 'Energy-relevant signal',
          });
        }
      }
    }

    if (energy.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          energy.push({
            item: line,
            polarity: 'unknown',
            intensity: 'medium',
            note: 'Candidate for energy review',
          });
        }
      }
    }

    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'energy-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { energy };
  } catch (error: any) {
    const duration = Date.now() - start;

    logUsage({
      capabilityId: 'energy-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });

    throw error;
  }
}
