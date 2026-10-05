import express from 'express';
import { runEnoughExtractor } from '../../capabilities/enough-extractor';

/**
 * Enough route. Mount from the real server with:
 *   import enoughRoutes from './routes/enough';
 *   app.use(enoughRoutes);
 * Preview backend/server.ts is currently a placeholder; this module is the wire
 * so the capability is reachable as soon as the server body is restored.
 * Intent keywords: enough, good enough, done for today, stop, finish line,
 * diminishing, time box, sign off, shutdown.
 */
const router = express.Router();

router.post('/api/capabilities/enough-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'enough-extractor', ...(await runEnoughExtractor(text)) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
