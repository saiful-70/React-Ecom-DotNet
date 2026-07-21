#!/bin/bash
# Deploy — STAGING (showcase server)
#
# Builds the Linux standalone LOCALLY (in WSL), rsyncs ./deploy-staging to the
# server, and restarts. Never builds on the server. The local .env.staging is the
# single source of truth: used for the build (NEXT_PUBLIC_* baked in) AND uploaded
# to the server as .env.production (runtime vars). Other local .env* never upload.
#
# Each target uses its OWN build folder (deploy-<target>) so targets can never
# cross-contaminate env or compiled code, even with --skip-build.
#
# Usage (from WSL): ./scripts/deploy-staging.sh [--skip-build] [--no-restart]
set -euo pipefail

# ── config ──────────────────────────────────────────────────────────────────
TARGET="staging"
HOST="showcase"           # ~/.ssh/config alias for the staging/showcase server
DIR="nextapp/staging"     # Enhance working directory (relative to website home)
APP_PORT="3000"           # port the Enhance Node app listens on (matches the panel)
# ────────────────────────────────────────────────────────────────────────────

DEPLOY_DIR="deploy-$TARGET"   # local build output for this target
BUILD_ENV=".env.$TARGET"      # local env (build-time + uploaded as .env.production)

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
[ -f "$BUILD_ENV" ] || { echo "❌ $BUILD_ENV not found — create it locally with this target's env." >&2; exit 1; }

# ── local build ─────────────────────────────────────────────────────────────
if [ "$SKIP_BUILD" = 0 ]; then
  echo "== build ($TARGET)  node $(node -v)  env $BUILD_ENV"

  # Next reads .env.production at build time (NODE_ENV=production); stage our
  # target env as .env.production for the build, and keep .env.local from
  # overriding it. Both are restored afterwards.
  STAGED=0; LOCAL_MOVED=0
  [ -f .env.production ] && mv .env.production .env.production.deploybak
  cp "$BUILD_ENV" .env.production
  STAGED=1
  if [ -f .env.local ]; then mv .env.local .env.local.deploybak; LOCAL_MOVED=1; fi

  # Remove any stale build artifact before building — a leftover build folder has
  # .ts files Next would type-check (tsconfig also excludes it).
  rm -rf "$DEPLOY_DIR"

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

  echo "== assemble ./$DEPLOY_DIR"
  rm -rf "$DEPLOY_DIR"
  cp -r .next/standalone "$DEPLOY_DIR"
  mkdir -p "$DEPLOY_DIR/.next"
  cp -r .next/static "$DEPLOY_DIR/.next/static"
  [ -d public ] && cp -r public "$DEPLOY_DIR/public"
fi

[ -f "$DEPLOY_DIR/server.js" ] || { echo "❌ $DEPLOY_DIR/server.js missing — run without --skip-build first." >&2; exit 1; }

# Always (re)write this target's env into the build folder before upload, so a
# reused folder (--skip-build) can never carry another target's env.
rm -f "$DEPLOY_DIR"/.env.*
cp "$BUILD_ENV" "$DEPLOY_DIR/.env.production"

# ── upload: clean atomic swap so NO stale files (e.g. old chunks) remain ─────
# Upload into <dir>.new, then swap it into place with one mv, then drop the old
# dir. Guarantees the live dir contains exactly this build — nothing stale.
echo "== upload ./$DEPLOY_DIR -> $HOST:$DIR (clean swap)"
ssh "$HOST" "rm -rf '$DIR.new' && mkdir -p '$DIR.new'"
rsync -az --exclude 'npm-debug.log*' "$DEPLOY_DIR/" "$HOST:$DIR.new/"

echo "== swap in new build & restart on $HOST"
ssh "$HOST" DIR="$DIR" RESTART="$RESTART" APP_PORT="$APP_PORT" 'bash -s' <<'EOF'
set -euo pipefail
rm -rf "$DIR.old"
[ -d "$DIR" ] && mv "$DIR" "$DIR.old"
mv "$DIR.new" "$DIR"

if [ "$RESTART" = "1" ]; then
  # The Enhance Node app must be set to Start mode = MANUAL. This script owns the
  # process — Automatic mode does not reliably respawn on kill on this platform,
  # and if left Automatic it would fight this script for the port.
  export NVM_DIR="$HOME/.nvm"; [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
  pkill -9 -u "$(id -u)" -x node 2>/dev/null || true
  sleep 1
  cd "$HOME/$DIR"
  # start detached so it survives this SSH session; logs to app.log
  PORT="$APP_PORT" HOSTNAME=0.0.0.0 setsid nohup node server.js > "$HOME/$DIR/app.log" 2>&1 < /dev/null &
  echo "started node server.js (Manual mode); waiting for :$APP_PORT…"
  up=0
  for _ in $(seq 1 30); do
    sleep 1
    if curl -sf -o /dev/null "http://127.0.0.1:$APP_PORT/"; then up=1; break; fi
  done
  if [ "$up" = 1 ]; then
    echo "✅ up on :$APP_PORT with the new build."
  else
    echo "⚠️  not up after 30s — last log lines:"
    tail -n 20 "$HOME/$DIR/app.log" 2>/dev/null || true
  fi
fi
rm -rf "$DIR.old"
EOF

echo "✅ $TARGET deployed."
