import { logUsage } from '../../backend/utils/logger';

/**
 * Season Extractor Capability
 * Surfaces what belongs to this chapter of life versus what can wait
 * years. Work extractors reclaim hours; this one stops those hours
 * from being spent on a future season while the current one passes.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - enough-extractor    → when a piece of work is done
 * - release-extractor   → what can be put down
 * - presence-extractor  → where reclaimed hours should land
 * - decline-extractor   → incoming requests that do not belong now
 * - season-extractor    → the chapter that is actually happening
 */

export interface SeasonItem {
  item: string;
  timing?: 'now' | 'later' | 'deferred-life' | 'unknown';
  horizon?: 'this-season' | 'next-season' | 'someday' | 'unknown';
  note?: string;
}

export interface SeasonResult {
  seasons: SeasonItem[];
}

export async function runSeasonExtractor(input: string): Promise<SeasonResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract season signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const seasonPatterns = [
      /\b(this season|this chapter|this year|right now|while they are|while the kids|while we can)\b/i,
      /\b(later|someday|next year|after we ship|once this is done|when things calm down|eventually)\b/i,
      /\b(can't miss|won't get back|fleeting|window|only chance|they grow up|aging parents)\b/i,
      /\b(defer|postpone|put off|not this quarter|backlog|parking lot|nice to have)\b/i,
      /\b(live more|be here|present for|show up for|don't wait)\b/i,
    ];

    const nowHints = /\b(this season|this chapter|right now|while they|while we can|can't miss|won't get back|fleeting|only chance|show up|be here)\b/i;
    const laterHints = /\b(later|someday|next year|after we ship|once this is done|when things calm|eventually|not this quarter|parking lot|nice to have|postpone|defer)\b/i;
    const lifeDeferred = /\b(after we ship|once this is done|when things calm|when I have time|after the launch)\b/i;

    const seasons: SeasonItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;
      if (!seasonPatterns.some(p => p.test(cleaned))) continue;

      const now = nowHints.test(cleaned);
      const later = laterHints.test(cleaned);
      let timing: SeasonItem['timing'] = 'unknown';
      if (lifeDeferred.test(cleaned) && now) timing = 'deferred-life';
      else if (lifeDeferred.test(cleaned)) timing = 'deferred-life';
      else if (now && !later) timing = 'now';
      else if (later && !now) timing = 'later';
      else if (now && later) timing = 'deferred-life';

      let horizon: SeasonItem['horizon'] = 'unknown';
      if (/\b(this season|this chapter|this year|right now|while)\b/i.test(cleaned)) horizon = 'this-season';
      else if (/\b(next year|next season|after we ship|once this)\b/i.test(cleaned)) horizon = 'next-season';
      else if (/\b(someday|eventually|parking lot|nice to have)\b/i.test(cleaned)) horizon = 'someday';

      if (!seasons.some(s => s.item === cleaned)) {
        seasons.push({
          item: cleaned,
          timing,
          horizon,
          note:
            timing === 'deferred-life'
              ? 'Life is conditional on work finishing — invert it; the season will not wait'
              : timing === 'now'
                ? 'Belongs to this chapter — protect it before the backlog expands'
                : timing === 'later'
                  ? 'Can wait — do not spend this season on it'
                  : 'Season signal — ask whether this belongs to the chapter that is actually happening',
        });
      }
    }

    if (seasons.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          seasons.push({
            item: line,
            timing: 'unknown',
            horizon: 'unknown',
            note: 'Candidate for season review — now, next chapter, or someday',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'season-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { seasons };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'season-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
