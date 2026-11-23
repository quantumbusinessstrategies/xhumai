import { logUsage } from '../../backend/utils/logger';

/**
 * Permission Extractor Capability
 * Surfaces explicit and implicit permissions to stop, rest, say no, live more, and drop unnecessary striving
 * so capacity returns without guilt or internal resistance.
 * Directly serves the creed: Work Less. Live More.
 * Stub for now; later becomes real AI.
 *
 * Complements:
 * - release-extractor     → what can be let go
 * - enough-extractor      → what is already sufficient
 * - boundary-extractor    → external limits
 * - sovereignty-extractor → reclaiming agency
 * - rest-extractor        → protected non-work time
 */

export interface PermissionItem {
  item: string;
  type?: 'stop' | 'rest' | 'refuse' | 'live' | 'unknown';
  urgency?: 'now' | 'soon' | 'consider';
  note?: string;
}

export interface PermissionResult {
  permissions: PermissionItem[];
  gaps: string[];
}

export async function runPermissionExtractor(input: string): Promise<PermissionResult> {
  const start = Date.now();

  try {
    if (!input || input.trim().length < 20) {
      throw new Error('Text is too short to extract permission signals');
    }

    const lines = input
      .split(/[\n.!?;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 8);

    const permissionPatterns = [
      /\b(permission|allow|allowed|okay to|ok to|can stop|can rest|can say no|allowed to live|don't have to|don't need to|it's okay)\b/i,
      /\b(guilt|guilt-free|without guilt|deserve|deserve to|permission to)\b/i,
    ];

    const stopHints = /\b(stop|quit|pause|halt|no more|enough work|done working)\b/i;
    const restHints = /\b(rest|recover|sleep|nap|relax|unscheduled|nothing)\b/i;
    const refuseHints = /\b(say no|refuse|decline|not do|don't have to|boundary)\b/i;
    const liveHints = /\b(live|living|enjoy|play|be present|life|leisure|delight)\b/i;
    const nowHints = /\b(now|immediately|today|right now|permission now)\b/i;
    const soonHints = /\b(soon|next|planning|want to)\b/i;
    const gapHints = /\b(guilt|should|must|have to|can't stop|not allowed|don't deserve)\b/i;

    const permissions: PermissionItem[] = [];
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

      if (permissionPatterns.some(p => p.test(cleaned))) {
        let type: PermissionItem['type'] = 'unknown';
        if (stopHints.test(cleaned)) type = 'stop';
        else if (restHints.test(cleaned)) type = 'rest';
        else if (refuseHints.test(cleaned)) type = 'refuse';
        else if (liveHints.test(cleaned)) type = 'live';

        let urgency: PermissionItem['urgency'] = 'consider';
        if (nowHints.test(cleaned)) urgency = 'now';
        else if (soonHints.test(cleaned)) urgency = 'soon';

        if (!permissions.some(p => p.item === cleaned)) {
          permissions.push({
            item: cleaned,
            type,
            urgency,
            note:
              type === 'stop'
                ? 'Permission to stop — name it so striving can end and capacity returns to living'
                : type === 'rest'
                  ? 'Permission to rest — surface it so recovery is allowed instead of residual'
                  : type === 'refuse'
                    ? 'Permission to refuse — making the no visible returns the yes to life'
                    : type === 'live'
                      ? 'Permission to live more — unlocks the internal yes that makes reclaimed hours livable'
                      : 'Permission candidate — surface the allowance so internal resistance stops consuming capacity',
          });
        }
      }
    }

    if (permissions.length === 0) {
      gaps.push('No explicit permission signals found — internal no may still block living more even after capacity is reclaimed');
      for (const line of lines.slice(0, 2)) {
        if (line.length < 140) {
          permissions.push({
            item: line,
            type: 'unknown',
            urgency: 'consider',
            note: 'Candidate for permission — ask if this needs an explicit yes to stop or to live',
          });
        }
      }
    }

    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'permission-extractor',
      success: true,
      durationMs: duration,
      inputSize: input.length,
    });

    return { permissions, gaps };
  } catch (error: any) {
    const duration = Date.now() - start;
    logUsage({
      capabilityId: 'permission-extractor',
      success: false,
      durationMs: duration,
      error: error.message,
      inputSize: input?.length || 0,
    });
    throw error;
  }
}
