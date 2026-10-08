import express from 'express';
import { runSeasonExtractor } from '../../capabilities/season-extractor';

/**
 * Season route. Mount from the real server with:
 *   import seasonRoutes from './routes/season';
 *   app.use(seasonRoutes);
 * Preview backend/server.ts is currently a placeholder; this module is the wire
 * so the capability is reachable as soon as the server body is restored.
 * Intent keywords: this season, this chapter, someday, after we ship,
 * while they are young, won't get back, when things calm down.
 */
const router = express.Router();

router.post('/api/capabilities/season-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'season-extractor', ...(await runSeasonExtractor(text)) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
