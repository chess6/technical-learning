#!/usr/bin/env bash
# One-time (or occasional) environment setup.
set -euo pipefail
# shellcheck source=scripts/_common.sh
source "$(cd "$(dirname "$0")" && pwd)/scripts/_common.sh"

need_node
log "Installing npm dependencies"
npm install

# Always install Chromium into the user cache (not Cursor sandbox path).
unset PLAYWRIGHT_BROWSERS_PATH || true
log "Installing Playwright Chromium"
npx playwright install chromium

ok "Setup complete"
printf '\nNext:\n  ./start.sh     # dev server at %s\n  ./check.sh     # lint + typecheck + unit tests\n  ./test.sh e2e  # browser tests\n\n' "$URL"
