# Boundary Extractor wiring

Capability source lives at `capabilities/boundary-extractor/index.ts` and is registered in `capabilities/registry/index.ts`.

**Urgent:** `backend/server.ts` on `preview` was accidentally overwritten with a placeholder in commit `683ccf4`. Restore it from `9c000afa3c2be9c81accbab18de1ea6a94f603be` before deploying preview, then apply the following.

## Imports (after capacity-extractor)

```ts
import { runAttentionExtractor } from '../capabilities/attention-extractor';
import { runBoundaryExtractor } from '../capabilities/boundary-extractor';
```

## Intent keywords to add to utilityWords

`attention`, `distract`, `interrupt`, `boundary`, `boundaries`, `say no`, `protect time`, `guardrail`, `no-meeting`

## Intent replies (before the utility else)

```ts
else if (lower.includes('attention') || lower.includes('distract') || lower.includes('interrupt') || lower.includes('context switch') || lower.includes('focus leak')) {
  reply = 'I can surface attention leaks vs compounding focus so living more is not eaten by noise. Paste your notes.';
  status = 'utility:attention-extractor';
}
else if (lower.includes('boundary') || lower.includes('boundaries') || lower.includes('say no') || lower.includes('protect time') || lower.includes('guardrail') || lower.includes('no-meeting')) {
  reply = 'I can surface boundaries that protect capacity so living more is not negotiated away. Paste your notes.';
  status = 'utility:boundary-extractor';
}
```

## Routes

```ts
app.post('/api/capabilities/attention-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'attention-extractor', ...(await runAttentionExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
app.post('/api/capabilities/boundary-extractor', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.status(400).json({ error: 'Missing text' });
    res.json({ capability: 'boundary-extractor', ...(await runBoundaryExtractor(text)) });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
});
```
