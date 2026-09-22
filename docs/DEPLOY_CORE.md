# Always-on Quantum Core

Live lander: https://xhumai.com  
Core target already baked into the frontend:

```
https://xhumai-core.fly.dev
```

GitHub Pages cannot run Node. The core must live on its own host.

## Fastest path (Fly — already in the repo)

You already have `fly.toml` + `Dockerfile`. This is the shortest always-on launch.

### 1. Install Fly CLI (once)

https://fly.io/docs/hands-on/install-flyctl/

Windows PowerShell installer:

```cmd
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

Close and reopen CMD so `fly` is on PATH.

### 2. Login + deploy from the repo root

```cmd
cd /d C:\Users\Zachary McFarland\Documents\GitHub\xhumai
git pull origin main
fly auth login
fly apps create xhumai-core
fly volumes create xhumai_data --size 1 --region iad
fly deploy
```

If the app name is taken:

```cmd
fly apps create xhumai-core-gj
```

Then change `app = "..."` in `fly.toml` to match and run `fly deploy` again.

If volume already exists, skip the volume command.

### 3. Prove it is alive (any browser or CMD)

```cmd
curl https://xhumai-core.fly.dev/health
curl https://xhumai-core.fly.dev/
```

You want JSON: `status: healthy` and `entity: XhumAI Quantum Core`.

### 4. Optional custom API domain

Porkbun DNS for `api.xhumai.com`:

| Type | Host | Answer |
|------|------|--------|
| CNAME | api | xhumai-core.fly.dev |

Then:

```cmd
fly certs add api.xhumai.com
```

### 5. Keep the lander pointed at the core

`frontend/src/App.jsx` already uses:

```js
const API = import.meta.env.VITE_API_URL || 'https://xhumai-core.fly.dev'
```

After the core health-checks, open https://xhumai.com and submit text.
Stars + intent should hit the public core, not your PC.

## Email (optional, after core is up)

```cmd
fly secrets set RESEND_API_KEY=re_xxxxx INQUIRE_EMAIL=0.x.hum.ai.0@gmail.com
fly deploy
```

Without secrets, inquiries still write to `/data` on the Fly volume.

## Own-box later

Same Docker image. Run it on any VPS you control. Point `api.xhumai.com` there.
Fly is only the first always-on host so the live site stops depending on your laptop.
