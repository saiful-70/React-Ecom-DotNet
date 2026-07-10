#!/bin/bash
# Deploy — STAGING (same server as production, different app directory)
#
# Builds the Linux standalone LOCALLY (in WSL), rsyncs ./deploy to the server,
# and restarts. Never builds on the server. Never uploads/deletes .env.production
# — the server owns its runtime env; NEXT_PUBLIC_* are baked in from the local
# build (uses local .env.staging if present, else .env.production).
#
# Usage (from WSL): ./scripts/deploy-staging.sh [--skip-build] [--no-restart]
set -euo pipefail

# ── config ──────────────────────────────────────────────────────────────────
TARGET="staging"
HOST="bdbazar"            # same server / same ssh alias as production
DIR="nextapp/staging"     # different working directory (set the Enhance staging
                          # Node app's working dir to match this)
# ────────────────────────────────────────────────────────────────────────────

SKIP_BUILD=0; RESTART=1
for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD=1 ;;
    --no-restart) RESTART=0 ;;
    *) echo "❌ unknown option: $arg" >&2; exit 1 ;;
  esac
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

# ── preflight ───────────────────────────────────────────────────────────────
case "$(uname -s)" in Linux) ;; *)
  echo "❌ Run from WSL/Linux so the build produces Linux-native binaries." >&2
  exit 1 ;;
esac
command -v node >/dev/null 2>&1 || { echo "❌ node not found in this WSL shell." >&2; exit 1; }

# ── local build ─────────────────────────────────────────────────────────────
if [ "$SKIP_BUILD" = 0 ]; then
  # Build-time env: per-target override (.env.<target>) if present, else .env.production.
  BUILD_ENV=".env.production"
  [ -f ".env.$TARGET" ] && BUILD_ENV=".env.$TARGET"
  [ -f "$BUILD_ENV" ] || { echo "❌ $BUILD_ENV needed locally for the build (NEXT_PUBLIC_* are baked in)." >&2; exit 1; }
  echo "== build ($TARGET)  node $(node -v)  build-env $BUILD_ENV"

  STAGED=0; LOCAL_MOVED=0
  if [ "$BUILD_ENV" != ".env.production" ]; then
    [ -f .env.production ] && mv .env.production .env.production.deploybak
    cp "$BUILD_ENV" .env.production
    STAGED=1
  fi
  if [ -f .env.local ]; then mv .env.local .env.local.deploybak; LOCAL_MOVED=1; fi

  cleanup() {
    [ "$LOCAL_MOVED" = 1 ] && mv -f .env.local.deploybak .env.local 2>/dev/null || true
    if [ "$STAGED" = 1 ]; then
      rm -f .env.production
      [ -f .env.production.deploybak ] && mv -f .env.production.deploybak .env.production 2>/dev/null || true
    fi
  }
  trap cleanup EXIT

  echo "📦 npm install (legacy peer deps)…"
  npm install --legacy-peer-deps
  echo "🏗️  next build (standalone)…"
  npm run build

  cleanup; trap - EXIT

  echo "== assemble ./deploy"
  rm -rf deploy
  cp -r .next/standalone deploy
  mkdir -p deploy/.next
  cp -r .next/static deploy/.next/static
  [ -d public ] && cp -r public deploy/public
  rm -f deploy/.env.production deploy/.env.local deploy/.env.*   # never ship env files
fi

[ -f deploy/server.js ] || { echo "❌ deploy/server.js missing — run without --skip-build first." >&2; exit 1; }

# ── upload (deploy files only; server keeps its own .env.production) ─────────
echo "== rsync ./deploy -> $HOST:$DIR"
ssh "$HOST" "mkdir -p '$DIR'"
rsync -az --delete \
  --exclude '.env.production' \
  --exclude '.env.local' \
  --exclude '.env.*' \
  --exclude 'npm-debug.log*' \
  deploy/ "$HOST:$DIR/"

# ── restart on the server ───────────────────────────────────────────────────
if [ "$RESTART" = 1 ]; then
  echo "== restart on $HOST ($DIR)"
  ssh "$HOST" DIR="$DIR" 'bash -s' <<'EOF'
set -euo pipefail
APP_DIR="$HOME/$DIR"
if [ ! -f "$APP_DIR/.env.production" ]; then
  echo "⚠️  $APP_DIR/.env.production not found on the server."
  echo "    Create it once with this server's runtime vars (API_BASE_URL, etc.)."
fi
# Enhance runs the app in Automatic mode (respawns on exit). Kill the running
# process whose cwd is this app dir so it restarts with the fresh build.
APP_PID=""
for pid in $(pgrep -u "$(id -u)" node 2>/dev/null || true); do
  if [ "$(readlink -f "/proc/$pid/cwd" 2>/dev/null)" = "$APP_DIR" ]; then APP_PID="$pid"; break; fi
done
if [ -n "$APP_PID" ]; then
  echo "♻️  restarting app (pid $APP_PID)…"
  kill "$APP_PID"
  echo "✅ restarted — Automatic mode will bring it back with the new build."
else
  echo "ℹ️  app not running yet. In Enhance → Advanced → Node.js set:"
  echo "      Startup command  : node server.js"
  echo "      Working directory: $DIR"
  echo "      Port <staging port>, Path blank, Mode Automatic → Deploy."
fi
EOF
fi

echo "✅ $TARGET deployed."
