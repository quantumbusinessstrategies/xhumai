import { logUsage } from '../../backend/utils/logger';

/**
 * Presence Extractor Capability
 * Surfaces the life the creed is for: people, play, body, place,
 * and unstructured time. Work extractors reclaim hours; this one
 * names where those hours should land so "live more" is not a slogan.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - reclaim-extractor   → hours that can come back
 * - freedom-extractor   → autonomy and optionality
 * - rhythm-extractor    → when to push and when to stop
 * - energy-extractor    → what restores life-force
 * - boundary-extractor  → lines that protect capacity
 * - presence-extractor  → the destination of the capacity that returns
 */

export interface PresenceItem {
  item: string;
  domain?: 'people' | 'play' | 'body' | 'place' | 'unstructured' | 'missing' | 'unknown';
  signal?: 'present' | 'starved' | 'displaced' | 'unknown';
  note?: string;
}

export interface PresenceResult {
  presences: PresenceItem[];
}

export async function runPresenceExtractor(input: string): Promise<PresenceResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract presence signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const presencePatterns = [
      /\b(family|partner|kids|friend|friends|dinner|call (mom|dad)|people I love)\b/i,
      /\b(play|hobby|music|read|walk|sport|game|create for fun|no agenda)\b/i,
      /\b(sleep|workout|run|gym|body|health|outside|sun|meal)\b/i,
      /\b(home|place|travel|weekend|evening|unscheduled|margin|blank space)\b/i,
      /\b(haven't seen|no time for|skipped|missed|haven't called|too busy to)\b/i,
      /\b(live more|presence|be here|actually off|phone down|not working)\b/i,
    ];

    const peopleHints = /\b(family|partner|kids|friend|dinner|call|people)\b/i;
    const playHints = /\b(play|hobby|music|read|game|fun|no agenda)\b/i;
    const bodyHints = /\b(sleep|workout|run|gym|body|health|walk|meal)\b/i;
    const placeHints = /\b(home|place|travel|outside|weekend|evening)\b/i;
    const openHints = /\b(unscheduled|margin|blank|free evening|nothing planned|actually off)\b/i;
    const starvedHints = /\b(haven't|no time|skipped|missed|too busy|never|haven't seen)\b/i;
    const displacedHints = /\b(instead of|after work|if I finish|once this ships|later)\b/i;

    const presences: PresenceItem[] = [];

    for (const line of lines) {
      const cleaned = line
        .replace(/^[-*\u2022]\s+/, '')
        .replace(/^\d+[.)]\s+/, '')
        .trim();
      if (cleaned.length < 10) continue;
      if (!presencePatterns.some(p => p.test(cleaned))) continue;

      let domain: PresenceItem['domain'] = 'unknown';
      if (peopleHints.test(cleaned)) domain = 'people';
      else if (playHints.test(cleaned)) domain = 'play';
      else if (bodyHints.test(cleaned)) domain = 'body';
      else if (openHints.test(cleaned)) domain = 'unstructured';
      else if (placeHints.test(cleaned)) domain = 'place';

      let signal: PresenceItem['signal'] = 'present';
      if (starvedHints.test(cleaned)) signal = 'starved';
      else if (displacedHints.test(cleaned)) signal = 'displaced';
      if (signal === 'starved') domain = domain === 'unknown' ? 'missing' : domain;

      if (!presences.some(p => p.item === cleaned)) {
        presences.push({
          item: cleaned,
          domain,
          signal,
          note:
            signal === 'starved'
              ? 'Life the creed names, currently displaced by work — protect a real block'
              : signal === 'displaced'
                ? 'Conditional on finishing work — schedule it before the work expands'
                : domain === 'unstructured'
                  ? 'Unscheduled margin — defend it; this is living more, not leftover'
                  : 'Presence signal — give reclaimed hours a destination here',
        });
      }
    }

    if (presences.length === 0) {
      for (const line of lines.slice(0, 3)) {
        if (line.length < 140) {
          presences.push({
            item: line,
            domain: 'unknown',
            signal: 'unknown',
            note: 'Candidate for presence review — ask what living more looks like here',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'presence-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { presences };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'presence-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
