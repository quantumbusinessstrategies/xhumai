# Continuum lander (2026-09-06)

Live frontend is `App.jsx` + `components/GalaxyCanvas.jsx`.
Do not restore `App.jsx` from `lander.pack.b64.*` or `App.jsx.part*`.
Those packs are the previous lander. `scripts/restore-app.mjs` now
skips when GalaxyCanvas is present.

Wiring (frontend → Fly core `https://xhumai-core.fly.dev`):
- communicate with me → POST `/api/chat` (entity)
- build your future → POST `/api/intent` (utilities / extractors)
- both also POST `/api/stars` (shared continuum)

Backend is untouched. Do not overwrite `backend/`.
