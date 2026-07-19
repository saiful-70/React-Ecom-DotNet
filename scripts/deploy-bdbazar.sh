#!/bin/bash
# Deploy — bdbazaronline.com
#
# Builds the Linux standalone LOCALLY (in WSL), rsyncs ./deploy-bdbazar to the
# server, and restarts. Never builds on the server (its container caps process
# count and fails with "spawn ... EAGAIN"). The local .env.bdbazar is the single
# source of truth: used for the build (NEXT_PUBLIC_* baked in) AND uploaded to
# the server as .env.production (runtime vars). Other local .env* never upload.
#
# Each target uses its OWN build folder (deploy-<target>) so targets can never
# cross-contaminate env or compiled code, even with --skip-build.
#
# Usage (from WSL): ./scripts/deploy-bdbazar.sh [--skip-build] [--no-restart]
set -euo pipefail

# ── config ──────────────────────────────────────────────────────────────────
TARGET="bdbazar"
HOST="bdbazar"        # ~/.ssh/config alias (key auth, no password)
DIR="nextapp/app"     # Enhance working directory (relative to website home)
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
ssh "$HOST" DIR="$DIR" RESTART="$RESTART" 'bash -s' <<'EOF'
set -euo pipefail
rm -rf "$DIR.old"
[ -d "$DIR" ] && mv "$DIR" "$DIR.old"
mv "$DIR.new" "$DIR"

if [ "$RESTART" = "1" ]; then
  # One Node app per Enhance website container — kill every node the user owns
  # so Automatic mode respawns it fresh with cwd = the new $DIR.
  PIDS="$(pgrep -u "$(id -u)" -x node 2>/dev/null || true)"
  if [ -n "$PIDS" ]; then
    kill $PIDS 2>/dev/null || true
    echo "♻️  restarted (killed node: $(echo $PIDS | tr '\n' ' '))"
  else
    echo "ℹ️  no running Node app found. First deploy? In Enhance → Advanced → Node.js set:"
    echo "      Startup command  : node server.js"
    echo "      Working directory: $DIR"
    echo "      Port 3000, Path blank, Mode Automatic → Deploy."
  fi
fi
rm -rf "$DIR.old"
EOF

echo "✅ $TARGET deployed."
