#!/usr/bin/env bash
# Run tests.
#   ./test.sh           unit tests (Vitest)
#   ./test.sh e2e       Playwright browser tests
#   ./test.sh all       unit + e2e
#   ./test.sh e2e -- path/to.spec.ts   # forward args to Playwright
set -euo pipefail
# shellcheck source=scripts/_common.sh
source "$(cd "$(dirname "$0")" && pwd)/scripts/_common.sh"

ensure_deps

mode="${1:-unit}"
if [[ $# -gt 0 ]]; then shift; fi

run_unit() {
  log "Unit tests (Vitest)"
  npm run test
}

run_e2e() {
  # Prefer the real user browser cache (avoids Cursor sandbox path mismatches).
  unset PLAYWRIGHT_BROWSERS_PATH || true
  if [[ ! -d "${HOME}/.cache/ms-playwright" ]]; then
    warn "Playwright browsers may be missing — run ./setup.sh"
  fi
  if [[ $# -gt 0 ]]; then
    log "E2E tests (Playwright) — $*"
  else
    log "E2E tests (Playwright)"
  fi
  npm run test:e2e -- "$@"
}

case "$mode" in
  unit|test)
    run_unit
    ;;
  e2e|browser)
    run_e2e "$@"
    ;;
  all)
    run_unit
    run_e2e "$@"
    ;;
  -h|--help|help)
    cat <<'EOF'
Usage: ./test.sh [unit|e2e|all] [playwright args...]

  unit   Vitest only (default)
  e2e    Playwright only (pass extra args after)
  all    unit then e2e

Examples:
  ./test.sh
  ./test.sh e2e
  ./test.sh e2e e2e/lesson-transformations.spec.ts
  ./test.sh all
EOF
    ;;
  *)
    die "Unknown mode: $mode (try: unit | e2e | all)"
    ;;
esac

ok "Tests finished"
