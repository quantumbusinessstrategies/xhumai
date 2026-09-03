# Merge blocked until App.jsx is full

`preview` had a TEMPORARY STUB App.jsx (343 bytes). Merging that to `main` would blank xhumai.com.

**main already has the live lander** (dual inputs, soft orbs, Hubble spiral).

To finish merge:
1. On preview, restore App.jsx from main:
```bash
git checkout main -- frontend/src/App.jsx frontend/src/App.css
git add frontend/src/App.jsx frontend/src/App.css
git commit -m "preview: restore full lander from main"
git push origin preview
```
2. Then merge PR #3.

App.css on preview was restored from main in a prior commit.
