import fs from 'fs';
import path from 'path';

function getLogPath() {
  const dataDir = process.env.XHUMAI_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), 'logs');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  return path.join(dataDir, 'usage.jsonl');
}

/**
 * Logs every capability use.
 * Foundation for self-improvement — agents read this file.
 */
export function logUsage(event: {
  capabilityId: string;
  success: boolean;
  durationMs?: number;
  error?: string;
  inputSize?: number;
  userId?: string;
}) {
  const entry = {
    ...event,
    timestamp: new Date().toISOString(),
  };

  try {
    fs.appendFileSync(getLogPath(), JSON.stringify(entry) + '\n');
    console.log(`[USAGE] ${event.capabilityId} | success: ${event.success}`);
  } catch (err) {
    console.error('Failed to write usage log:', err);
  }
}

export function readUsageLog(limit = 500): any[] {
  const logPath = getLogPath();
  try {
    if (!fs.existsSync(logPath)) return [];
    const lines = fs.readFileSync(logPath, 'utf-8').trim().split('\n').filter(Boolean);
    return lines.slice(-limit).map(line => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean);
  } catch {
    return [];
  }
}
