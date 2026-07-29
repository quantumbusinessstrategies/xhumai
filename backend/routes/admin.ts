import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const logPath = path.join(__dirname, '../../logs/usage.jsonl');

// GET /api/admin/logs
// Returns the last 50 usage events
router.get('/logs', (req, res) => {
  try {
    if (!fs.existsSync(logPath)) {
      return res.json({ logs: [], message: 'No logs yet' });
    }

    const content = fs.readFileSync(logPath, 'utf-8');
    const lines = content.trim().split('\n').filter(Boolean);

    // Get the last 50 entries
    const recent = lines.slice(-50).map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(Boolean).reverse(); // newest first

    res.json({
      count: recent.length,
      logs: recent
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/stats
router.get('/stats', (req, res) => {
  try {
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

    res.json({
      total: lines.length,
      success,
      failed
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
