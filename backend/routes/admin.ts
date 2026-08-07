import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

function getLogPath() {
  const dataDir = process.env.XHUMAI_DATA_DIR || process.env.DATA_DIR || path.join(process.cwd(), 'logs');
  return path.join(dataDir, 'usage.jsonl');
}

router.get('/logs', (req, res) => {
  try {
    const logPath = getLogPath();
    if (!fs.existsSync(logPath)) {
      return res.json({ logs: [], message: 'No logs yet' });
    }
    const content = fs.readFileSync(logPath, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    const recent = lines.slice(-50).map(line => {
      try { return JSON.parse(line); } catch { return null; }
    }).filter(Boolean).reverse();
    res.json({ count: recent.length, logs: recent });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stats', (req, res) => {
  try {
    const logPath = getLogPath();
    if (!fs.existsSync(logPath)) {
      return res.json({ total: 0, success: 0, failed: 0 });
    }
    const content = fs.readFileSync(logPath, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);
    let success = 0;
    let failed = 0;
    lines.forEach(line => {
      try {
        const entry = JSON.parse(line);
        if (entry.success) success++;
        else failed++;
      } catch {}
    });
    res.json({ total: lines.length, success, failed });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
