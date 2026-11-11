import express from 'express';
import { runBalanceExtractor } from '../../capabilities/balance-extractor';

/**
 * Balance route. Mount from the real server with:
 *   import balanceRoutes from './routes/balance';
 *   app.use(balanceRoutes);
 * Preview backend/server.ts is currently a placeholder; this module is the wire
 * so the capability is reachable as soon as the server body is restored.
 * Intent keywords: balance, work-life, overwork, overcommitted, too much work, no time for life, crowded, skewed, imbalance, always working, never stop, underliving.
 */
const router = express.Router();

router.post('/api/capabilities/balance-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'balance-extractor', ...(await runBalanceExtractor(text)) });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
