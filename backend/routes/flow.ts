import express from 'express';
import { runFlowExtractor } from '../../capabilities/flow-extractor';

/**
 * Flow route. Mount from the real server with:
 *   import flowRoutes from './routes/flow';
 *   app.use(flowRoutes);
 * Preview backend/server.ts is currently a placeholder; this module is the wire
 * so the capability is reachable as soon as the server body is restored.
 * Intent keywords: flow, in the zone, lost track of time, absorbed, immersed, effortless, deep focus, time disappeared, when I, while doing.
 */
const router = express.Router();

router.post('/api/capabilities/flow-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'flow-extractor', ...(await runFlowExtractor(text)) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
