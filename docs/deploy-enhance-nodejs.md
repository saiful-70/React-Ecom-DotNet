# Deploying to Enhance (Node.js) — bdbazaronline.com

How to host this Next.js 15 app on the **Enhance** control panel (hosting.com reseller, LiteSpeed webserver, the panel used by `bdbazaronline.com`).

> **Not cPanel.** Enhance has its own Node.js model — no Phusion Passenger, no "Setup Node.js App" screen. Ignore cPanel-specific guides.

---

## ⚠️ Read this first

### 1. WordPress is on the primary domain

`bdbazaronline.com` currently serves **WordPress** on LiteSpeed. The Node.js proxy with **Path = `/`** forwards the **entire primary domain** to your Next.js app — i.e. it takes the site over from WordPress.

| Goal | What to do |
|------|-----------|
| Next.js **replaces** WordPress on the main domain | Deploy with Path `/` (proxy the whole site). WordPress files stay on disk but are no longer served. |
| WordPress **stays**, Next.js on a subdomain | In Enhance, add a new website (e.g. `shop.bdbazaronline.com`), then run the Node app there with Path `/`. |

Sub-path hosting (e.g. `/shop`) is **not recommended** — Next.js asset base paths and routing break. Use a full domain or subdomain.

### 2. Do NOT upload a Windows-built app

The server is **Linux** (`/var/www/...`). If you run `npm run build` / `npm install` on Windows and upload the resulting `node_modules`, the app **crashes on start with a 500/502** — Next.js's native SWC binary is platform-specific (`@next/swc-win32-x64-msvc` won't load on Linux). Symptom: the launcher log shows "Starting app..." but the app never prints `▲ Next.js ... Ready`.

**The fix is to build on the Linux server** (or in a Linux container). That's the primary path below.

---

## Prerequisites

- Node.js available (confirmed: **Advanced → Node.js** shows the "Deploy app" screen).
- **SSH access** to the server — see [Connecting via SSH](#connecting-via-ssh) below.
- Correct **`.env.production`** committed/uploaded with production values:
  ```
  API_BASE_URL=https://admin.bdbazaronline.com/...
  API_BASE_URL_V1=https://admin.bdbazaronline.com/...
  NEXT_PUBLIC_SITE_URL=https://bdbazaronline.com
  ```
- `next.config.js` already sets `output: "standalone"`. Keep it.

---

## Connecting via SSH

The primary deploy path builds on the Linux server, so you need shell access first.

### 1. Enable SSH in Enhance

Website `bdbazaronline.com` → **Advanced / Access → SSH Access → Enable SSH**. Then open **Manage SSH Keys**. This screen also shows your **username, server host, and port** — those values are authoritative.

### 2. Generate a key on Windows (PowerShell)

Skip if you already have `~/.ssh/id_ed25519.pub`.

```powershell
ssh-keygen -t ed25519 -C "saiful-bdbazar"
# press Enter for defaults → creates C:\Users\LENOVO\.ssh\id_ed25519(.pub)
Get-Content $env:USERPROFILE\.ssh\id_ed25519.pub
```

Copy the printed public key and paste it into **Manage SSH Keys** in Enhance.

### 3. Connect

```powershell
ssh <username>@<server-host> -p <port>
# e.g.  ssh a72afc3a@bom1.stableserver.net -p 22
```

The panel observed for this account uses host `e5539.bom1.stableserver.net`; always use the exact host/username/port shown in the SSH Access panel.

### 3b. Initialize Node on the server (one-time)

Enhance does **not** put Node on your SSH shell's PATH, and you **cannot** `apt install` it (locked website container — you'll see `Command unavailable in website container`). Node is installed per-website via **nvm**. Initialize it once:

```bash
/usr/bin/install_nvm_and_node.sh
source ~/.bashrc     # or log out and SSH back in
node -v              # should now print a version
```

If `node -v` still fails: `export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"; node -v`.
To match the app runtime: `nvm install 24 && nvm alias default 24`.

> Non-interactive SSH (`ssh host 'command'`) does **not** source `~/.bashrc`, so if you ever run `node`/`npm` remotely you must load nvm first (`. "$HOME/.nvm/nvm.sh"`). The deploy scripts build locally and only restart (kill) the process over SSH, so they don't need nvm remotely — but Enhance still needs Node initialized to *run* the app.

### 4. Fallback if there is no SSH option

Some shared Enhance tiers gate shell access. In that case:

- Use Enhance's browser **Terminal** if the panel offers one, **or**
- Build via **WSL/Docker locally** and upload the prebuilt app — see [Alternative: build in a Linux container locally](#alternative-build-in-a-linux-container-locally).

---

## Fastest path: per-environment scripts

**Run from WSL/Linux** (not Windows, not Git Bash) so the build produces Linux-native binaries. Each script builds the standalone **locally**, then rsyncs the finished build to its server and restarts — **it never builds on the server** (the shared container caps process count and fails mid-build with `spawn ... EAGAIN` during "Collecting page data").

```bash
./scripts/deploy-bdbazar.sh                # production
./scripts/deploy-staging.sh               # staging (same server, different dir)

./scripts/deploy-bdbazar.sh --skip-build   # reuse ./deploy, just upload + restart
./scripts/deploy-bdbazar.sh --no-restart   # upload but don't restart
```

### Structure (one self-contained script per environment)

Each `scripts/deploy-<env>.sh` is standalone (no shared file). Add a new environment by copying one and changing the config block at the top:

```bash
TARGET="staging"          # also selects local build-env .env.<target> if present
HOST="bdbazar"            # ssh config alias (same server as prod here)
DIR="nextapp/staging"     # app dir relative to remote home (Enhance workdir)
```

Each `HOST` is an **SSH config alias**, so set one up in `~/.ssh/config` (key auth → no password prompt):

```
Host bdbazar
    HostName 69.57.172.119
    User bdbazaro1
    Port 22
    IdentityFile ~/.ssh/bd_bazar_ed25519
    IdentitiesOnly yes
```

> **Staging on the same server:** it uses the same `HOST` alias but a different `DIR` (`nextapp/staging`). Create a separate Enhance Node app (usually on a staging subdomain) whose **Working directory** matches that `DIR` and give it its own port.

### Environment variables — server-owned

- **Runtime vars** (`API_BASE_URL`, `API_BASE_URL_V1`, secrets): live in **`.env.production` on each server** and are read at runtime. The script **never uploads or deletes** that file — you manage it manually per server. Create it once at `~/<dir>/.env.production` (e.g. `~/nextapp/app/.env.production`).
- **Build-time vars** (`NEXT_PUBLIC_*`, e.g. `NEXT_PUBLIC_SITE_URL`): **baked into the JS at build time** — cannot be changed on the server. If they differ per target, keep a local git-ignored **`.env.<target>`** (e.g. `.env.bdbazar`); the script uses it for that target's build. If they're the same everywhere, a single local `.env.production` is enough for building.

What the script does: picks the build-env (`.env.<target>` if present, else `.env.production`), moves `.env.local` aside so it can't override it, `npm install` + `npm run build`, assembles `./deploy` (standalone + static + public, **no** env files), rsyncs to the server with `--delete` but **excluding** `.env.production`, then restarts the app.

### First run per server (one-time)

1. Create `~/<dir>/.env.production` on the server with that server's runtime vars.
2. Configure the Enhance Node app — **Advanced → Node.js → Deploy app**:
   - Startup command: **`node server.js`**
   - Working directory: **`nextapp/app`** — ⚠️ **relative to the website home** (`/var/www/<website-id>/`). The panel rejects a leading slash. Do **not** enter the full `/var/www/<id>/nextapp/app` — that doubles the path → app starts in a nonexistent dir → 500.
   - Port `3000`, Path blank, Mode Automatic → Deploy.

Every deploy after that is just `./scripts/deploy-<env>.sh`.

The manual steps below explain the same flow, for troubleshooting.

---

## Primary path (manual): build in WSL, upload standalone

The shared container **cannot build reliably** (`npm run build` dies with `spawn … EAGAIN` — a process/resource cap). Build on your WSL machine instead; it's Linux, so the binaries match the server.

### Step 1 — Get the code onto the server

Pick one:

- **git (preferred):**
  ```bash
  cd /var/www/<website-id>/nextapp
  git clone <your-repo-url> app
  cd app
  git checkout <your-branch>
  ```
- **or upload the repo** via File Manager / SFTP into `.../nextapp/app` (exclude `node_modules`, `.next`, and `deploy/` — you'll build these on the server).

> Ensure `.env.production` is present in the repo root on the server (it's git-ignored, so `git clone` won't bring it — upload it separately or create it there).

### Step 2 — Install and build on the server

```bash
cd /var/www/<website-id>/nextapp/app
npm install --legacy-peer-deps
npm run build
```

- Uses the server's Node (24.x here) → correct Linux SWC binaries.
- ⚠️ `NEXT_PUBLIC_*` values are baked in **at this build**. `.env.production` must be correct before running `npm run build`.
- If `npm run build` gets **killed (OOM)** on this shared plan, use the [local Linux build](#alternative-build-in-a-linux-container-locally) path instead.

### Step 3 — Fill in the "Deploy app" form

Enhance → **Advanced → Node.js → Deploy app** (or edit the existing app):

| Field | Value | Notes |
|-------|-------|-------|
| Start mode | **Automatic** | Auto-starts, restarts on exit. |
| Node version | **24.x (stable)** | Must match the version you built with in Step 2. |
| **Startup command** | `npm start` | Runs `next start`; needs the full `node_modules` + `.next` from Step 2 (both present in the repo now). |
| **Working directory** | `/var/www/<website-id>/nextapp/app` | The repo root where you ran the build. |
| Proxy enabled | **On** | Forwards the primary domain to the app. |
| **Path** | *blank* (= `/`) | Proxies the entire website. See WordPress warning. |
| **Port** | `3000` | Matches the app's default listen port. |

Click **Deploy** (or Save + Restart).

> **Why `npm start` here, not `node server.js`:** building on the server leaves the full repo + `node_modules` in place, so `next start` works directly and you skip the standalone-assembly step. (The standalone `node server.js` path is only needed when uploading a prebuilt app — see the alternative below.)

### Step 4 — Environment variables

The form has **no** env-var fields, and it doesn't need any:

- **`API_BASE_URL` / `API_BASE_URL_V1`** — Next.js loads `.env.production` from the working directory at runtime. Keep that file correct in the repo root.
- **`PORT` / `HOSTNAME`** — the server defaults to port `3000` on `0.0.0.0`, which is what the proxy expects. Leave unset.
- **`NEXT_PUBLIC_SITE_URL`** — baked in at build time (Step 2); not read at runtime.

---

## Step 5 — Verify

Open `https://bdbazaronline.com`.

| Symptom | Cause / fix |
|---------|-------------|
| Page loads correctly | ✅ Done. |
| 500 / 502, log shows "Starting app…" then nothing | App crashes on start. **SSH in and run it by hand to see the error** (below). Most common: Windows-built binaries — rebuild on the server. |
| `Failed to load SWC binary` / `@next/swc-win32…` / `Cannot find module '@next/swc-linux-x64-gnu'` | Uploaded a Windows/foreign-platform build. Rebuild on the server (Steps 1–2). |
| CSS/images broken | `.next` or `public` incomplete — for the standalone path, recheck asset copy. For `npm start`, ensure `npm run build` completed. |
| `next: not found` | Startup command is `npm start` but `node_modules` wasn't installed. Run `npm install --legacy-peer-deps`. |
| Backend calls fail | `.env.production` missing or wrong values in the working directory. |

### Get the real crash message

The Enhance launcher log only shows its own preamble ("Stdout and stderr will be appended…"). To see the **app's** error, SSH in and run it directly:

```bash
cd /var/www/<website-id>/nextapp/app
npm start          # or: node server.js  (standalone path)
```

Whatever it prints is the actual failure. A healthy start shows `▲ Next.js 15.5.7 … Ready in …ms`.

---

## Alternative: build in a Linux container locally

Use this if `npm run build` OOMs on the shared server. Build a **Linux** standalone on your machine (matching the server), then upload only the output — no server build needed.

Your repo already has a `Dockerfile` (standalone). From WSL or Docker Desktop:

```bash
# in the repo, on Linux (WSL) or via Docker
npm install --legacy-peer-deps
npm run build     # produces Linux-native .next/standalone
```

Then assemble the deploy folder (standalone doesn't copy static/public):

```bash
rm -rf deploy
cp -r .next/standalone deploy
cp -r .next/static deploy/.next/static
cp -r public deploy/public
```

Resulting `deploy/`:

```
deploy/
├── server.js            # entry point — listens on PORT(3000) / HOSTNAME(0.0.0.0)
├── package.json
├── node_modules/        # Linux-native, pruned
├── .env.production      # copied in automatically by the build
├── .next/
│   └── static/          # added manually
└── public/              # added manually
```

Zip `deploy/`, upload/extract to `.../nextapp/deploy`, then in the Deploy form:

| Field | Value |
|-------|-------|
| Startup command | `node server.js` |
| Working directory | `/var/www/<website-id>/nextapp/deploy` |
| Port | `3000` |
| Path | blank (`/`) |

> ⚠️ Do **not** build this on Windows — the bundled `node_modules` would carry Windows binaries and crash on the Linux server. WSL/Docker only.

---

## Redeploys

- **Server build:** `git pull` (or re-upload) → `npm install --legacy-peer-deps` (if deps changed) → `npm run build` → **Restart** the app in Enhance.
- **Standalone upload:** rebuild on Linux, re-upload `deploy/`, **Restart**.
- `NEXT_PUBLIC_*` or `.env.production` value changes require a fresh **build**, not just a restart (they're baked in at build time).

---

## Notes

- **Node version parity:** build with the same major version the Enhance app runs (24.x here). Mismatches can cause native-module errors.
- **Multi-domain:** Enhance proxies only the **primary** domain. Add extra domains as aliases and redirect via `.htaccess`.
- **No test suite:** run `npm run type-check` and `npm run lint` before deploying — there is no test runner in this repo.
- **Server-rendered data:** categories are cached 1h via `unstable_cache`; server actions call the backend on each request. Cold starts after idle-restart may be slow.
- **Disk:** ~14 GB plan. A full server build (`node_modules` + `.next`) uses more than a pruned standalone upload, but is the reliable path here.

---

## Sources

- [Node.js — Enhance Documentation](https://enhance.com/docs/website-management/nodejs)
- [NodeJS Support — Enhance Community](https://community.enhance.com/d/129-nodejs-support-released)
- [Next.js standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)
