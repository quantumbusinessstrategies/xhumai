import fs from 'fs';
import path from 'path';

const logDir = path.join(__dirname, '../../logs');
const logPath = path.join(logDir, 'usage.jsonl');

// Make sure the logs folder exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

/**
 * Logs every time a capability is used.
 * This is the foundation for self-improvement.
 * Later agents will read this file and learn.
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
    fs.appendFileSync(logPath, JSON.stringify(entry) + '\n');
    console.log(`[USAGE] ${event.capabilityId} | success: ${event.success}`);
  } catch (err) {
    console.error('Failed to write usage log:', err);
  }
}
