/**
 * Agents — the first organisms of the self-improving core.
 * Usage Analyzer is live: it reads the world the system itself creates.
 */

import { readUsageLog } from '../utils/logger';

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'error';
  lastRun?: string;
}

export const agents: Agent[] = [
  {
    id: 'usage-analyzer',
    name: 'Usage Analyzer',
    description: 'Reads usage logs and finds patterns, popular tools, and failure points. First live self-observation organism.',
    status: 'idle',
  },
  {
    id: 'capability-suggester',
    name: 'Capability Suggester',
    description: 'Looks at demand and usage gaps, then proposes new capabilities. (stub)',
    status: 'idle',
  },
  {
    id: 'prompt-improver',
    name: 'Prompt Improver',
    description: 'Reviews failed or low-quality runs and suggests better prompts. (stub)',
    status: 'idle',
  },
  {
    id: 'seo-agent',
    name: 'SEO Agent',
    description: 'Watches rankings and generates better metadata. (stub)',
    status: 'idle',
  },
  {
    id: 'health-agent',
    name: 'Health Agent',
    description: 'Monitors errors, response times, and system health. (stub)',
    status: 'idle',
  },
];

function analyzeUsage() {
  const logs = readUsageLog(1000);
  const byCapability: Record<string, { total: number; success: number; failed: number; totalMs: number }> = {};

  for (const e of logs) {
    const id = e.capabilityId || 'unknown';
    if (!byCapability[id]) byCapability[id] = { total: 0, success: 0, failed: 0, totalMs: 0 };
    byCapability[id].total++;
    if (e.success) byCapability[id].success++;
    else byCapability[id].failed++;
    if (typeof e.durationMs === 'number') byCapability[id].totalMs += e.durationMs;
  }

  const ranked = Object.entries(byCapability)
    .map(([id, s]) => ({
      capabilityId: id,
      ...s,
      successRate: s.total ? s.success / s.total : 0,
      avgMs: s.total ? Math.round(s.totalMs / s.total) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  const failures = logs.filter(e => !e.success).slice(-20).reverse();

  return {
    totalEvents: logs.length,
    capabilitiesObserved: ranked.length,
    ranked,
    recentFailures: failures,
    insight:
      logs.length === 0
        ? 'No usage yet. The core is alive and waiting for input.'
        : `Observed ${logs.length} events across ${ranked.length} capabilities. Top: ${ranked[0]?.capabilityId || 'n/a'}.`,
  };
}

export async function runAgent(agentId: string) {
  const agent = agents.find(a => a.id === agentId);
  if (!agent) throw new Error('Agent not found');

  agent.status = 'running';
  agent.lastRun = new Date().toISOString();

  try {
    if (agentId === 'usage-analyzer') {
      const analysis = analyzeUsage();
      agent.status = 'idle';
      return {
        agentId,
        status: 'completed',
        message: analysis.insight,
        analysis,
        ranAt: agent.lastRun,
      };
    }

    agent.status = 'idle';
    return {
      agentId,
      status: 'completed (stub)',
      message: 'This agent is still a skeleton. Real intelligence comes next.',
      ranAt: agent.lastRun,
    };
  } catch (err: any) {
    agent.status = 'error';
    throw err;
  }
}
