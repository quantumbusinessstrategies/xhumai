import express from 'express';
import { runDelightExtractor } from '../../capabilities/delight-extractor';

/**
 * Delight route. Mount from the real server with:
 *   import delightRoutes from './routes/delight';
 *   app.use(delightRoutes);
 * Preview backend/server.ts is currently a placeholder; this module is the wire
 * so the capability is reachable as soon as the server body is restored.
 * Intent keywords: delight, joy, pleasure, enjoy, happy, fun, love doing, makes me smile, simple pleasure, looking forward.
 */
const router = express.Router();

router.post('/api/capabilities/delight-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'delight-extractor', ...(await runDelightExtractor(text)) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
