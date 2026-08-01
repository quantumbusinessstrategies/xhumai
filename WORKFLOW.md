# XhumAI branch workflow

## Branches

| Branch | Purpose |
|--------|---------|
| `main` | **LIVE** — quantimeta.com / GitHub Pages. Do not push here unless explicitly approved. |
| `preview` | **WORK** — all development, experiments, and fixes land here first. |

## Daily flow

1. Work on `preview` only.
2. Preview locally in VS Code:
   ```bash
   git checkout preview
   git pull
   cd frontend
   npm install
   npm run dev
   ```
   Open the Local URL (usually http://localhost:5173).
3. When it looks right, open a Pull Request: `preview` → `main`.
4. Merge only when ready for live. Pages rebuilds from `main`.

## Rules for assistants / automation

- Default push target: **`preview`**
- Never push to `main` unless the human explicitly says to merge/go live.
- Visual lander baseline: golden commit `8d8b2bb` (mixed shapes, warp, no size-variance shader).

## First proof on preview

Restored `frontend/src/App.jsx` from golden `8d8b2bb` on `preview` so local `npm run dev` proves the good lander without touching live.
