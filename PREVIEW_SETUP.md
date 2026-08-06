# Preview branch is ready

## Structure

- `main` = LIVE (GitHub Pages → quantimeta.com). Do not push here without explicit OK.
- `preview` = WORK. All development lands here first.

## Prove golden lander on preview (one-time)

`main` still has a bad App.jsx placeholder. Restore golden **on preview only**:

```bash
git fetch origin
git checkout preview
git pull origin preview
git checkout 8d8b2bb -- frontend/src/App.jsx
git add frontend/src/App.jsx
git commit -m "preview: restore golden App.jsx from 8d8b2bb"
git push origin preview
```

## Local VS Code preview

```bash
git checkout preview
git pull
cd frontend
npm install
npm run dev
```

Open the Local URL (usually http://localhost:5173).

## Go live later

When preview looks right → Pull Request `preview` → `main` → merge.

Assistants must push to **preview** only unless you say otherwise.
