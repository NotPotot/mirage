#!/usr/bin/env bash
set -euo pipefail

# ---------------------------------------------------------
# install-shield.sh -- One-command setup for mirage-shield
# Auto-detects framework (Next.js, Express, React),
# installs mirage-shield, and generates config files.
#
# Usage:
#   bash scripts/install-shield.sh           # interactive
#   bash scripts/install-shield.sh --yes     # non-interactive
#   bash scripts/install-shield.sh /path/to/project
# ---------------------------------------------------------

RED='\033[0;31m'; GREEN='\033[0;32m'; CYAN='\033[0;36m'
YELLOW='\033[1;33m'; BOLD='\033[1m'; DIM='\033[2m'; RESET='\033[0m'

log()  { echo -e "  $1"; }
step() { echo -e "\n${GREEN}[$1]${RESET} ${BOLD}$2${RESET}"; }
done_msg()  { log "${GREEN}[OK]${RESET} $1"; }
warn() { log "${YELLOW}[!]${RESET} $1"; }
fail() { echo -e "\n${RED}[X] $1${RESET}"; exit 1; }

# --- Parse args ---

YES=false
TARGET_DIR="${1:-$(pwd)}"
[ "$TARGET_DIR" = "--yes" ] && YES=true && TARGET_DIR="$(pwd)"
[ "${2:-}" = "--yes" ] && YES=true

echo -e "
${BOLD}+================================================+${RESET}
${BOLD}|${RESET}  ${CYAN}${BOLD}mirage-shield${RESET} -- Install & Configure   ${BOLD}|${RESET}
${BOLD}+================================================+${RESET}
"

# --- Validate ---

PKG_PATH="$TARGET_DIR/package.json"
[ ! -f "$PKG_PATH" ] && fail "No package.json found at $TARGET_DIR"

detect_framework() {
  local deps
  deps=$(cat "$PKG_PATH" | grep -oP '"(next|express|hono|react)"' | sort -u)
  echo "$deps" | grep -q '"next"'    && echo "next" && return
  echo "$deps" | grep -q '"express"' && echo "express" && return
  echo "$deps" | grep -q '"hono"'    && echo "hono" && return
  echo "$deps" | grep -q '"react"'   && echo "react" && return
  echo "none"
}

FRAMEWORK=$(detect_framework)
[ "$FRAMEWORK" = "none" ] && fail "No supported framework detected (Next.js, Express, Hono, or React)."

PROJECT_NAME=$(grep -oP '"name"\s*:\s*"\K[^"]+' "$PKG_PATH" || echo "unnamed")
log "${DIM}Project: $PROJECT_NAME${RESET}"
log "${DIM}Framework: $FRAMEWORK${RESET}"
log "${DIM}Target: $TARGET_DIR${RESET}"

if [ "$YES" = false ]; then
  echo -en "\n  ${BOLD}Proceed with setup? [Y/n]:${RESET} "
  read -r response
  [ "$response" != "" ] && [ "$response" != "y" ] && [ "$response" != "Y" ] && { echo -e "\n  ${YELLOW}Setup cancelled.${RESET}"; exit 0; }
fi

# --- Step 1: Install ---

step 1 'Installing mirage-shield...'

if grep -q '"mirage-shield"' "$PKG_PATH"; then
  done_msg 'Already installed'
else
  log "${DIM}$ npm install mirage-shield --save${RESET}"
  (cd "$TARGET_DIR" && npm install mirage-shield --save --legacy-peer-deps 2>/dev/null) && done_msg 'Installed' || warn 'Auto-install failed. Run: npm install mirage-shield'
fi

# --- Step 2-4: Generate files ---

if [ "$FRAMEWORK" = "next" ]; then
  # -- middleware.ts --
  step 2 'Creating middleware.ts...'
  SRC_DIR=""
  [ -d "$TARGET_DIR/src" ] && SRC_DIR="src/"
  MP="$TARGET_DIR/$SRC_DIR/middleware.ts"

  if [ -f "$MP" ]; then
    warn 'middleware.ts already exists -- skipping'
  else
    cat > "$MP" << 'EOF'
import { createMirageMiddleware } from 'mirage-shield/nextjs'

export const middleware = createMirageMiddleware({
  onDetection: 'block',
  blockPage: '/blocked',
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$).*)'],
}
EOF
    done_msg "Created ${SRC_DIR}middleware.ts"
  fi

  # -- /blocked page --
  step 3 'Creating /blocked page...'
  APP_DIR=""
  [ -d "$TARGET_DIR/src/app" ] && APP_DIR="$TARGET_DIR/src/app"
  [ -z "$APP_DIR" ] && [ -d "$TARGET_DIR/app" ] && APP_DIR="$TARGET_DIR/app"

  if [ -z "$APP_DIR" ]; then
    warn 'No app/ directory found -- skipping blocked page'
  else
    BPD="$APP_DIR/blocked/page.tsx"
    if [ -f "$BPD" ]; then
      warn '/blocked page already exists -- skipping'
    else
      mkdir -p "$(dirname "$BPD")"
      cat > "$BPD" << 'PAGEEOF'
export default function BlockedPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui' }}>
      <div style={{ textAlign: 'center', maxWidth: 420, padding: 24 }}>
        <div style={{ fontSize: 28, marginBottom: 16, fontWeight: 700, letterSpacing: 2 }}>[ BLOCKED ]</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Access Blocked</h1>
        <p style={{ color: '#666', lineHeight: 1.6 }}>
          Mirage has detected automated or suspicious activity from your
          session. This request has been blocked to protect sensitive data.
        </p>
      </div>
    </div>
  )
}
PAGEEOF
      done_msg 'Created app/blocked/page.tsx'
    fi
  fi

  # -- Events API --
  step 4 'Creating security events API...'
  if [ -n "$APP_DIR" ]; then
    EVP="$APP_DIR/api/mirage/events/route.ts"
    if [ -f "$EVP" ]; then
      warn 'Events API already exists -- skipping'
    else
      mkdir -p "$(dirname "$EVP")"
      cat > "$EVP" << 'EVTEOF'
import { NextResponse } from 'next/server'
import { addEvent, getEvents, getEventsSince, getStats } from 'mirage-shield'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const since = url.searchParams.get('since')
  if (since) return NextResponse.json({ events: getEventsSince(parseInt(since, 10)), stats: getStats() })
  return NextResponse.json({ events: getEvents(200), stats: getStats() })
}

export async function POST(request: Request) {
  try {
    const event = await request.json()
    addEvent(event)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
EVTEOF
      done_msg 'Created api/mirage/events/route.ts'
    fi
  fi
fi

# --- Finish ---

echo -e "
${BOLD}${GREEN}================================================${RESET}
${BOLD}${GREEN}  Mirage Shield is installed and active!         ${RESET}
${BOLD}${GREEN}================================================${RESET}
${DIM}Run your dev server and bots will be blocked automatically.${RESET}
"
