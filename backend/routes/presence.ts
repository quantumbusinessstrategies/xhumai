import express from 'express';
import { runPresenceExtractor } from '../../capabilities/presence-extractor';

/**
 * Presence route. Mount from the real server with:
 *   import presenceRoutes from './routes/presence';
 *   app.use(presenceRoutes);
 * Preview backend/server.ts is currently a placeholder; this module is the wire
 * so the capability is reachable as soon as the server body is restored.
 * Intent keywords: presence, live more, family, friends, play, hobby,
 * unscheduled, margin, phone down, no time for.
 */
const router = express.Router();

router.post('/api/capabilities/presence-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'presence-extractor', ...(await runPresenceExtractor(text)) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
